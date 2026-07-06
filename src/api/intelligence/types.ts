export interface CompanyProfileVo {
  productName: string;
  homepage: string;
  targetCustomers: string;
  coreCapabilities: string;
  positioning: string;
}

export interface CompetitorVo {
  id: number;
  name: string;
  homepage: string;
  positioning: string;
  targetCount: number;
  unreadReportCount: number;
  updatedAt: string;
}

export interface CompetitorRequest {
  name: string;
  homepage: string;
  positioning: string;
}

export interface MonitorTargetVo {
  id?: number;
  competitorId: number;
  competitorName: string;
  type: MonitorTargetType;
  title: string;
  url: string;
  status: 'active' | 'draft' | 'paused';
  confidence: number;
  lastCollectedAt?: string;
}

export type MonitorTargetType = 'official_site' | 'pricing' | 'docs' | 'blog' | 'changelog' | 'rss';

export interface MonitorTargetRequest {
  competitorId: number;
  type: MonitorTargetType;
  title: string;
  url: string;
}

export interface ReportSummaryVo {
  id: number;
  competitorId: number;
  competitorName: string;
  targetId: number;
  targetType: MonitorTargetType;
  changeSummary: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  confidence: number;
  evidenceCount: number;
  read: boolean;
  feedback?: FeedbackValue;
  recommendedActionSummary: string;
  createdAt: string;
}

export type FeedbackValue = 'useful' | 'not_useful' | 'false_positive' | 'handled';

export interface EvidenceVo {
  field: string;
  oldValue: string;
  newValue: string;
  snippet: string;
  sourceUrl: string;
}

export interface ReportDetailVo extends ReportSummaryVo {
  sourceUrl: string;
  strategicIntent: string;
  businessImpact: string;
  recommendedActions: string[];
  evidence: EvidenceVo[];
  reason: string;
  knowledgeWritebackStatus: 'none' | 'written' | 'failed';
}

export interface TaskRunVo {
  id: number;
  targetId: number;
  targetTitle: string;
  status: 'queued' | 'running' | 'success' | 'failed';
  adapter: string;
  message: string;
  startedAt: string;
  finishedAt?: string;
}
