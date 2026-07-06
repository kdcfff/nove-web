import type {
  CompanyProfileVo,
  CompetitorRequest,
  CompetitorVo,
  FeedbackValue,
  MonitorTargetRequest,
  MonitorTargetVo,
  ReportDetailVo,
  ReportSummaryVo,
  TaskRunVo,
} from './types';
import { get, post, put } from '@/utils/request';

interface ApiEnvelope<T> {
  data?: T;
  rows?: T;
}

async function unwrap<T>(request: Promise<T | ApiEnvelope<T>>): Promise<T> {
  const response = await request;
  if (response && typeof response === 'object') {
    const envelope = response as ApiEnvelope<T>;
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

export function listMonitorTargets(competitorId?: number) {
  return unwrap<MonitorTargetVo[]>(get<MonitorTargetVo[]>('/intelligence/targets', competitorId ? { competitorId } : undefined).json());
}

export function recommendMonitorTargets(data: { competitorId: number; homepage: string }) {
  return unwrap<MonitorTargetVo[]>(post<MonitorTargetVo[]>('/intelligence/targets/recommend', data).json());
}

export function createMonitorTarget(data: MonitorTargetRequest) {
  return unwrap<MonitorTargetVo>(post<MonitorTargetVo>('/intelligence/targets', data).json());
}

export function triggerTargetCollect(id: number) {
  return unwrap<TaskRunVo>(post<TaskRunVo>(`/intelligence/targets/${id}/collect`).json());
}

export function listInboxReports() {
  return unwrap<ReportSummaryVo[]>(get<ReportSummaryVo[]>('/intelligence/reports/inbox').json());
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

export function listTaskRuns() {
  return unwrap<TaskRunVo[]>(get<TaskRunVo[]>('/intelligence/tasks').json());
}
