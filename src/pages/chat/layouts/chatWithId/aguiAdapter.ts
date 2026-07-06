export type AguiToolStatus = 'pending' | 'success' | 'error';

export interface AguiToolUpdate {
  toolCallId?: string;
  name: string;
  status: AguiToolStatus;
  result: string | null;
}

export interface AguiAdapterResult {
  handled: boolean;
  done?: boolean;
  text?: string;
  reasoning?: string;
  tool?: AguiToolUpdate;
  error?: string;
}

type AguiEvent = Record<string, unknown>;

const TEXT_EVENTS = new Set([
  'TEXT_MESSAGE_CONTENT',
  'TEXT_MESSAGE_CHUNK',
]);

const REASONING_EVENTS = new Set([
  'REASONING_CONTENT',
  'REASONING_MESSAGE_CONTENT',
]);

const TOOL_PENDING_EVENTS = new Set([
  'TOOL_CALL_START',
  'TOOL_CALL_ARGS',
  'TOOL_CALL_CHUNK',
]);

const TOOL_SUCCESS_EVENTS = new Set([
  'TOOL_CALL_END',
  'TOOL_CALL_RESULT',
  'TOOL_RESULT',
]);

const DONE_EVENTS = new Set([
  'RUN_FINISHED',
]);

const ERROR_EVENTS = new Set([
  'RUN_ERROR',
  'ERROR',
]);

const IGNORED_EVENTS = new Set([
  'RUN_STARTED',
  'TEXT_MESSAGE_START',
  'TEXT_MESSAGE_END',
  'REASONING_START',
  'REASONING_END',
  'REASONING_MESSAGE_START',
  'REASONING_MESSAGE_END',
  'STATE_SNAPSHOT',
  'STATE_DELTA',
  'MESSAGES_SNAPSHOT',
  'ACTIVITY_SNAPSHOT',
  'ACTIVITY_DELTA',
  'STEP_STARTED',
  'STEP_FINISHED',
  'RAW',
  'CUSTOM',
]);

export function adaptAguiEvent(payload: unknown): AguiAdapterResult {
  if (!isObject(payload) || typeof payload.type !== 'string') {
    return { handled: false };
  }

  const type = payload.type;

  if (TEXT_EVENTS.has(type)) {
    return {
      handled: true,
      text: stringField(payload, ['delta', 'content', 'text']),
    };
  }

  if (REASONING_EVENTS.has(type)) {
    return {
      handled: true,
      reasoning: stringField(payload, ['delta', 'content', 'text']),
    };
  }

  if (TOOL_PENDING_EVENTS.has(type)) {
    return {
      handled: true,
      tool: toToolUpdate(payload, 'pending'),
    };
  }

  if (TOOL_SUCCESS_EVENTS.has(type)) {
    return {
      handled: true,
      tool: toToolUpdate(payload, 'success'),
    };
  }

  if (DONE_EVENTS.has(type)) {
    return {
      handled: true,
      done: true,
    };
  }

  if (ERROR_EVENTS.has(type)) {
    return {
      handled: true,
      done: true,
      error: stringField(payload, ['message', 'error', 'code']) || 'AG-UI run failed',
    };
  }

  if (IGNORED_EVENTS.has(type)) {
    return { handled: true };
  }

  return { handled: false };
}

function toToolUpdate(payload: AguiEvent, status: AguiToolStatus): AguiToolUpdate {
  return {
    toolCallId: stringField(payload, ['toolCallId', 'id']),
    name: stringField(payload, ['toolCallName', 'toolName', 'name']) || 'Unknown Tool',
    status,
    result: valueField(payload, ['result', 'content', 'args', 'delta', 'arguments']),
  };
}

function stringField(payload: AguiEvent, keys: string[]): string {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === 'string') {
      return value;
    }
  }

  return '';
}

function valueField(payload: AguiEvent, keys: string[]): string | null {
  for (const key of keys) {
    const value = payload[key];
    if (value === undefined || value === null) {
      continue;
    }
    if (typeof value === 'string') {
      return value;
    }
    return JSON.stringify(value);
  }

  return null;
}

function isObject(value: unknown): value is AguiEvent {
  return typeof value === 'object' && value !== null;
}
