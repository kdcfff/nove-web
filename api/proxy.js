import { Buffer } from 'node:buffer';
import { Readable } from 'node:stream';

const BACKEND_ORIGIN = 'http://101.37.32.56';
const CONNECT_TIMEOUT_MS = 4000;
const RETRY_DELAY_MS = 300;
const MAX_ATTEMPTS = 2;

const hopByHopHeaders = new Set([
  'connection',
  'content-length',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

const responseSkipHeaders = new Set([
  'connection',
  'content-encoding',
  'content-length',
  'keep-alive',
  'transfer-encoding',
]);

export const config = {
  maxDuration: 60,
};

function buildTargetUrl(req) {
  const requestUrl = new URL(req.url || '/', `https://${req.headers.host || 'localhost'}`);
  const rawPath = requestUrl.searchParams.get('path') || '';
  requestUrl.searchParams.delete('path');

  const cleanPath = rawPath.replace(/^\/+/, '');
  const targetUrl = new URL(cleanPath ? `/prod-api/${cleanPath}` : '/prod-api/', BACKEND_ORIGIN);
  requestUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });
  return targetUrl;
}

function buildForwardHeaders(req) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    const lowerKey = key.toLowerCase();
    if (hopByHopHeaders.has(lowerKey) || typeof value === 'undefined') {
      continue;
    }
    headers.set(key, Array.isArray(value) ? value.join(',') : value);
  }
  const authorization = headers.get('authorization')?.trim();
  if (authorization === 'Bearer undefined' || authorization === 'Bearer null' || authorization === 'Bearer') {
    headers.delete('authorization');
  }
  headers.set('x-forwarded-host', req.headers.host || '');
  headers.set('x-forwarded-proto', 'https');
  return headers;
}

async function readRequestBody(req) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return undefined;
  }
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function shouldRetry(response) {
  return response.status === 502 || response.status === 503 || response.status === 504;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithHeaderTimeout(url, init) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CONNECT_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response;
  }
  catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

function writeResponseHeaders(proxyResponse, res) {
  res.statusCode = proxyResponse.status;
  proxyResponse.headers.forEach((value, key) => {
    if (!responseSkipHeaders.has(key.toLowerCase())) {
      res.setHeader(key, value);
    }
  });
}

async function sendProxyResponse(proxyResponse, res) {
  writeResponseHeaders(proxyResponse, res);
  if (!proxyResponse.body) {
    res.end();
    return;
  }
  Readable.fromWeb(proxyResponse.body).pipe(res);
}

export default async function handler(req, res) {
  const targetUrl = buildTargetUrl(req);
  const headers = buildForwardHeaders(req);
  const body = await readRequestBody(req);
  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const proxyResponse = await fetchWithHeaderTimeout(targetUrl, {
        method: req.method,
        headers,
        body,
        redirect: 'manual',
      });

      if (attempt < MAX_ATTEMPTS && shouldRetry(proxyResponse)) {
        await proxyResponse.arrayBuffer().catch(() => {});
        await delay(RETRY_DELAY_MS);
        continue;
      }

      await sendProxyResponse(proxyResponse, res);
      return;
    }
    catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS) {
        await delay(RETRY_DELAY_MS);
        continue;
      }
    }
  }

  console.error('Nova API proxy failed', {
    target: targetUrl.toString(),
    message: lastError?.message,
  });
  res.statusCode = 502;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ code: 502, msg: 'Backend proxy connection failed' }));
}
