import type {
  CaptureAdapter,
  CompanyProfileVo,
  CompetitorRequest,
  CompetitorVo,
  FeedbackValue,
  MonitorTargetRequest,
  MonitorTargetScheduleRequest,
  MonitorTargetVo,
  ReportDetailVo,
  ReportSummaryVo,
  TaskCompareVo,
  TaskRunVo,
} from './types';
import { del, get, post, put } from '@/utils/request';

interface ApiEnvelope<T> {
  code?: number;
  msg?: string;
  data?: T;
  rows?: T;
}

async function unwrap<T>(request: Promise<T | ApiEnvelope<T>>): Promise<T> {
  const response = await request;
  if (response && typeof response === 'object') {
    const envelope = response as ApiEnvelope<T>;
    if (typeof envelope.code === 'number' && envelope.code !== 200) {
      throw new Error(envelope.msg || '请求失败');
    }
    if ('data' in envelope)
      return envelope.data as T;
    if ('rows' in envelope)
      return envelope.rows as T;
  }
  return response as T;
}

export function getCompanyProfile() {
  return unwrap<CompanyProfileVo>(get<CompanyProfileVo>('/intelligence/company-profile').json());
}

export function updateCompanyProfile(data: CompanyProfileVo) {
  return unwrap<CompanyProfileVo>(put<CompanyProfileVo>('/intelligence/company-profile', data).json());
}

export function listCompetitors() {
  return unwrap<CompetitorVo[]>(get<CompetitorVo[]>('/intelligence/competitors').json());
}

export function createCompetitor(data: CompetitorRequest) {
  return unwrap<CompetitorVo>(post<CompetitorVo>('/intelligence/competitors', data).json());
}

export function deleteCompetitor(id: number) {
  return unwrap<void>(del<void>(`/intelligence/competitors/${id}`).json());
}

export function listMonitorTargets(competitorId?: number) {
  return unwrap<MonitorTargetVo[]>(get<MonitorTargetVo[]>('/intelligence/targets', competitorId != null ? { competitorId } : undefined).json());
}

export function recommendMonitorTargets(data: { competitorId: number; homepage: string }) {
  return unwrap<MonitorTargetVo[]>(post<MonitorTargetVo[]>('/intelligence/targets/recommend', data).json());
}

export function createMonitorTarget(data: MonitorTargetRequest) {
  return unwrap<MonitorTargetVo>(post<MonitorTargetVo>('/intelligence/targets', data).json());
}

export function deleteMonitorTarget(id: number) {
  return unwrap<void>(del<void>(`/intelligence/targets/${id}`).json());
}

export function updateMonitorTargetSchedule(id: number, data: MonitorTargetScheduleRequest) {
  return unwrap<MonitorTargetVo>(put<MonitorTargetVo>(`/intelligence/targets/${id}/schedule`, data).json());
}

export function triggerTargetCollect(id: number, triggerSource?: 'manual' | 'competitor_manual', adapter?: CaptureAdapter) {
  const params = new URLSearchParams();
  if (triggerSource)
    params.set('triggerSource', triggerSource);
  if (adapter)
    params.set('adapter', adapter);
  const query = params.toString() ? `?${params.toString()}` : '';
  return unwrap<TaskRunVo>(post<TaskRunVo>(`/intelligence/targets/${id}/collect${query}`).json());
}

export function listInboxReports(competitorId?: number) {
  return unwrap<ReportSummaryVo[]>(get<ReportSummaryVo[]>('/intelligence/reports/inbox', competitorId != null ? { competitorId } : undefined).json());
}

export function getReportDetail(id: number) {
  return unwrap<ReportDetailVo>(get<ReportDetailVo>(`/intelligence/reports/${id}`).json());
}

export function markReportRead(id: number) {
  return unwrap<ReportDetailVo>(post<ReportDetailVo>(`/intelligence/reports/${id}/read`).json());
}

export function submitReportFeedback(id: number, value: FeedbackValue) {
  return unwrap<ReportDetailVo>(post<ReportDetailVo>(`/intelligence/reports/${id}/feedback`, { value }).json());
}

export function writeReportToKnowledge(id: number) {
  return unwrap<ReportDetailVo>(post<ReportDetailVo>(`/intelligence/reports/${id}/knowledge`).json());
}

export function listTaskRuns(competitorId?: number) {
  return unwrap<TaskRunVo[]>(get<TaskRunVo[]>('/intelligence/tasks', competitorId != null ? { competitorId } : undefined).json());
}

export function getTaskCompare(id: number) {
  return unwrap<TaskCompareVo>(get<TaskCompareVo>(`/intelligence/tasks/${id}/compare`).json());
}
