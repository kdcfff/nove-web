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

export function getCompanyProfile() {
  return get<CompanyProfileVo>('/intelligence/company-profile').json();
}

export function updateCompanyProfile(data: CompanyProfileVo) {
  return put<CompanyProfileVo>('/intelligence/company-profile', data).json();
}

export function listCompetitors() {
  return get<CompetitorVo[]>('/intelligence/competitors').json();
}

export function createCompetitor(data: CompetitorRequest) {
  return post<CompetitorVo>('/intelligence/competitors', data).json();
}

export function listMonitorTargets(competitorId?: number) {
  return get<MonitorTargetVo[]>('/intelligence/targets', competitorId ? { competitorId } : undefined).json();
}

export function recommendMonitorTargets(data: { competitorId: number; homepage: string }) {
  return post<MonitorTargetVo[]>('/intelligence/targets/recommend', data).json();
}

export function createMonitorTarget(data: MonitorTargetRequest) {
  return post<MonitorTargetVo>('/intelligence/targets', data).json();
}

export function triggerTargetCollect(id: number) {
  return post<TaskRunVo>(`/intelligence/targets/${id}/collect`).json();
}

export function listInboxReports() {
  return get<ReportSummaryVo[]>('/intelligence/reports/inbox').json();
}

export function getReportDetail(id: number) {
  return get<ReportDetailVo>(`/intelligence/reports/${id}`).json();
}

export function markReportRead(id: number) {
  return post<ReportDetailVo>(`/intelligence/reports/${id}/read`).json();
}

export function submitReportFeedback(id: number, value: FeedbackValue) {
  return post<ReportDetailVo>(`/intelligence/reports/${id}/feedback`, { value }).json();
}

export function writeReportToKnowledge(id: number) {
  return post<ReportDetailVo>(`/intelligence/reports/${id}/knowledge`).json();
}

export function listTaskRuns() {
  return get<TaskRunVo[]>('/intelligence/tasks').json();
}
