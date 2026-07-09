export interface CompanyProfileVo {
  productName: string;
  homepage: string;
  targetCustomers: string;
  coreCapabilities: string;
  positioning: string;
}

export interface UserProfileVersionVo {
  id: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfileRequest {
  profileName: string;
  targetUsers: string;
  scenario: string;
  painPoints: string;
  motivations: string;
  decisionFactors: string;
  objections: string;
  positioning: string;
  keyMetrics: string;
  markdownNotes: string;
}

export interface UserProfileVo extends UserProfileRequest {
  id: number;
  version: UserProfileVersionVo;
  updatedAt?: string;
}

export interface UserProfileReportRequest {
  competitorId: number;
  triggerSource?: 'manual' | string;
}

export interface UserProfileReportSummaryVo {
  id: number;
  competitorId: number;
  competitorName: string;
  profileVersion: UserProfileVersionVo;
  triggerSource: string;
  status: 'success' | 'failed' | 'running' | string;
  summary?: string;
  evidenceCount: number;
  createdAt?: string;
  failureReason?: string;
}

export interface UserProfileReportDetailVo extends UserProfileReportSummaryVo {
  keyInsights: string[];
  profileImpacts: string[];
  evidence: EvidenceVo[];
  recommendedActions: string[];
  markdownContent?: string;
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
  source?: MonitorTargetSource;
  analysisNotes?: string;
  captureAdapter?: CaptureAdapter;
  scheduleEnabled?: boolean;
  scheduleMode?: ScheduleMode;
  scheduleTime?: string;
  scheduleWeekday?: number;
  scheduleCron?: string;
  nextCollectAt?: string;
  lastScheduledAt?: string;
  lastScheduledStatus?: string;
  lastScheduledMessage?: string;
}

export type MonitorTargetType = 'official_site' | 'pricing' | 'docs' | 'blog' | 'changelog' | 'rss';
export type MonitorTargetSource = 'homepage_link' | 'html_link' | 'feed_hint' | 'rule_fallback' | 'manual';
export type ScheduleMode = 'off' | 'daily' | 'weekly' | 'cron';
export type CaptureAdapter = 'auto' | 'nova_rendered' | 'firecrawl';
export type TaskTriggerSource = 'manual' | 'competitor_manual' | 'scheduled';

export interface MonitorTargetRequest {
  competitorId: number;
  type: MonitorTargetType;
  title: string;
  url: string;
  source?: MonitorTargetSource;
  analysisNotes?: string;
}

export interface MonitorTargetScheduleRequest {
  scheduleEnabled: boolean;
  scheduleMode: ScheduleMode;
  scheduleTime?: string;
  scheduleWeekday?: number;
  scheduleCron?: string;
  captureAdapter?: CaptureAdapter;
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
  triggerSource?: TaskTriggerSource;
  reportId?: number;
  startedAt: string;
  finishedAt?: string;
}

export interface TaskCompareVo {
  taskId: number;
  targetId: number;
  targetTitle: string;
  url: string;
  adapter: string;
  status: 'success' | 'partial' | 'failed' | string;
  statusCode?: number;
  lineCount?: number;
  contentHash?: string;
  oldSnapshotId?: number;
  newSnapshotId?: number;
  changeCount: number;
  reportIds: number[];
  message: string;
  compareSummary: string;
  capture?: CaptureInspectVo;
  oldSnapshot?: SnapshotInspectVo;
  newSnapshot?: SnapshotInspectVo;
  changes: ChangeInspectVo[];
}

export interface CaptureInspectVo {
  id: number;
  requestedUrl: string;
  finalUrl: string;
  adapter: string;
  status: string;
  statusCode?: number;
  title?: string;
  markdownLineCount?: number;
  markdownCharCount?: number;
  mainTextCharCount?: number;
  durationMs?: number;
  qualityScore?: number;
  fallbackUsed?: boolean;
  fallbackReason?: string;
  contentHash?: string;
  errorMessage?: string;
  markdown?: string;
}

export interface SnapshotInspectVo {
  id: number;
  rawCaptureId: number;
  title?: string;
  description?: string;
  canonicalUrl?: string;
  hashes: Record<string, string>;
  priceLikeText: string[];
  featureLikeText: string[];
  campaignLikeText: string[];
  customerLikeText: string[];
  contentBlocks: ContentBlockInspectVo[];
}

export interface ContentBlockInspectVo {
  blockId: string;
  kind: string;
  text: string;
  hash: string;
}

export interface ChangeInspectVo {
  id?: number;
  source: 'persisted' | 'computed' | string;
  changeKind: string;
  fieldPath: string;
  oldValue: string;
  newValue: string;
  oldSnippet: string;
  newSnippet: string;
  sourceBlockId: string;
  evidenceStrength: number;
  noiseRisk: number;
  reasonCodes: string[];
  promotionStatus: string;
}
