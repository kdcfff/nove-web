<script setup lang="ts">
import type {
  CompetitorVo,
  FeedbackValue,
  MonitorTargetVo,
  ReportDetailVo,
  ReportSummaryVo,
  TaskRunVo,
} from '@/api/intelligence/types';
import {
  Aim,
  Collection,
  DocumentChecked,
  Link,
  Plus,
  Refresh,
  Search,
  TrendCharts,
  WarningFilled,
} from '@element-plus/icons-vue';
import {
  createCompetitor,
  createMonitorTarget,
  getReportDetail,
  listCompetitors,
  listInboxReports,
  listMonitorTargets,
  listTaskRuns,
  markReportRead,
  recommendMonitorTargets,
  submitReportFeedback,
  triggerTargetCollect,
  writeReportToKnowledge,
} from '@/api/intelligence';

const loading = ref(false);
const usingMock = ref(false);
const activeView = ref<'inbox' | 'competitors' | 'targets'>('inbox');
const competitors = ref<CompetitorVo[]>([]);
const targets = ref<MonitorTargetVo[]>([]);
const reports = ref<ReportSummaryVo[]>([]);
const tasks = ref<TaskRunVo[]>([]);
const selectedReport = ref<ReportDetailVo | null>(null);
const drafts = ref<MonitorTargetVo[]>([]);
const reportKeyword = ref('');
const reportPriority = ref<ReportSummaryVo['priority'] | 'all'>('all');

const competitorForm = reactive({
  name: '',
  homepage: '',
  positioning: '',
});

const selectedCompetitorId = computed(() => competitors.value[0]?.id);
const hasReports = computed(() => reports.value.length > 0);
const unreadCount = computed(() => reports.value.filter(item => !item.read).length);
const activeTargetCount = computed(() => targets.value.filter(item => item.status === 'active').length);
const highImpactCount = computed(() => reports.value.filter(item => ['high', 'urgent'].includes(item.priority)).length);
const selectedReportId = computed(() => selectedReport.value?.id);
const filteredReports = computed(() => reports.value.filter((report) => {
  const keyword = reportKeyword.value.trim().toLowerCase();
  const matchesKeyword = !keyword
    || report.competitorName.toLowerCase().includes(keyword)
    || report.changeSummary.toLowerCase().includes(keyword)
    || report.recommendedActionSummary.toLowerCase().includes(keyword);
  const matchesPriority = reportPriority.value === 'all' || report.priority === reportPriority.value;
  return matchesKeyword && matchesPriority;
}));
const statCards = computed(() => [
  { label: '未读情报', value: unreadCount.value, icon: WarningFilled, tone: 'danger' },
  { label: '高影响', value: highImpactCount.value, icon: TrendCharts, tone: 'warning' },
  { label: '竞品', value: competitors.value.length, icon: Collection, tone: 'primary' },
  { label: '活跃目标', value: activeTargetCount.value, icon: Aim, tone: 'success' },
]);

type TagType = 'primary' | 'success' | 'warning' | 'info' | 'danger';

const priorityMap: Record<ReportSummaryVo['priority'], TagType> = {
  low: 'info',
  medium: 'warning',
  high: 'danger',
  urgent: 'danger',
};

const priorityLabels: Record<ReportSummaryVo['priority'], string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急',
};

const targetTypeLabels: Record<MonitorTargetVo['type'], string> = {
  official_site: '官网',
  pricing: '定价',
  docs: '文档',
  blog: '博客',
  changelog: '更新日志',
  rss: 'RSS',
};

const taskStatusLabels: Record<TaskRunVo['status'], string> = {
  queued: '排队',
  running: '运行中',
  success: '成功',
  failed: '失败',
};

const taskStatusTypes: Record<TaskRunVo['status'], TagType> = {
  queued: 'info',
  running: 'warning',
  success: 'success',
  failed: 'danger',
};

const feedbackLabels: Record<FeedbackValue, string> = {
  useful: '有用',
  not_useful: '没用',
  false_positive: '误报',
  handled: '已处理',
};

const knowledgeStatusLabels: Record<ReportDetailVo['knowledgeWritebackStatus'], string> = {
  none: '未写入',
  written: '已写入',
  failed: '写入失败',
};

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatTime(value?: string) {
  if (!value)
    return '-';
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function targetTypeLabel(type: MonitorTargetVo['type']) {
  return targetTypeLabels[type];
}

function taskStatusLabel(status: TaskRunVo['status']) {
  return taskStatusLabels[status];
}

function taskStatusType(status: TaskRunVo['status']) {
  return taskStatusTypes[status];
}

onMounted(() => {
  loadWorkbench();
});

async function loadWorkbench() {
  loading.value = true;
  try {
    const [competitorData, targetData, reportData, taskData] = await Promise.all([
      listCompetitors(),
      listMonitorTargets(),
      listInboxReports(),
      listTaskRuns(),
    ]);
    competitors.value = competitorData;
    targets.value = targetData;
    reports.value = reportData;
    tasks.value = taskData;
    usingMock.value = false;
    if (reportData[0]) {
      await openReport(reportData[0]);
    }
  }
  catch {
    applyMockData();
  }
  finally {
    loading.value = false;
  }
}

async function handleCreateCompetitor() {
  if (!competitorForm.name || !competitorForm.homepage) {
    ElMessage.warning('先填竞品名称和官网');
    return;
  }
  try {
    const created = await createCompetitor({ ...competitorForm });
    competitors.value.unshift(created);
    Object.assign(competitorForm, { name: '', homepage: '', positioning: '' });
    ElMessage.success('竞品已添加');
  }
  catch {
    const created = mockCompetitor(competitorForm.name, competitorForm.homepage, competitorForm.positioning);
    competitors.value.unshift(created);
    Object.assign(competitorForm, { name: '', homepage: '', positioning: '' });
    usingMock.value = true;
  }
}

async function handleRecommendTargets() {
  const competitor = competitors.value.find(item => item.id === selectedCompetitorId.value);
  if (!competitor) {
    ElMessage.warning('先添加一个竞品');
    return;
  }
  try {
    drafts.value = await recommendMonitorTargets({
      competitorId: competitor.id,
      homepage: competitor.homepage,
    });
  }
  catch {
    drafts.value = mockDraftTargets(competitor);
    usingMock.value = true;
  }
}

async function handleConfirmDrafts() {
  const selectedDrafts = drafts.value.filter(item => item.status === 'draft');
  const saved: MonitorTargetVo[] = [];
  for (const draft of selectedDrafts) {
    try {
      saved.push(await createMonitorTarget({
        competitorId: draft.competitorId,
        type: draft.type,
        title: draft.title,
        url: draft.url,
      }));
    }
    catch {
      saved.push({ ...draft, id: Date.now() + saved.length, status: 'active' });
      usingMock.value = true;
    }
  }
  targets.value.unshift(...saved);
  drafts.value = [];
  ElMessage.success('监控目标已确认');
}

async function handleCollect(target: MonitorTargetVo) {
  if (!target.id)
    return;
  try {
    const task = await triggerTargetCollect(target.id);
    tasks.value.unshift(task);
    reports.value = await listInboxReports();
    if (reports.value[0]) {
      await openReport(reports.value[0]);
    }
  }
  catch {
    const task = mockTask(target);
    tasks.value.unshift(task);
    reports.value.unshift(mockReport(target));
    usingMock.value = true;
  }
}

async function openReport(report: ReportSummaryVo) {
  try {
    selectedReport.value = await getReportDetail(report.id);
    if (!report.read) {
      await markReportRead(report.id);
      report.read = true;
    }
  }
  catch {
    selectedReport.value = mockReportDetail(report);
    usingMock.value = true;
  }
}

async function handleFeedback(value: FeedbackValue) {
  if (!selectedReport.value)
    return;
  try {
    selectedReport.value = await submitReportFeedback(selectedReport.value.id, value);
  }
  catch {
    const current = selectedReport.value;
    if (!current)
      return;
    selectedReport.value = { ...current, feedback: value };
    usingMock.value = true;
  }
}

async function handleKnowledgeWriteback() {
  if (!selectedReport.value)
    return;
  try {
    selectedReport.value = await writeReportToKnowledge(selectedReport.value.id);
  }
  catch {
    const current = selectedReport.value;
    if (!current)
      return;
    selectedReport.value = { ...current, knowledgeWritebackStatus: 'written' };
    usingMock.value = true;
  }
  ElMessage.success('已记录知识库写回状态');
}

function applyMockData() {
  const competitor = mockCompetitor('Comet', 'https://comet.example.com', 'Agentic coding workflow');
  const target = mockTarget(competitor);
  const report = mockReport(target);
  competitors.value = [competitor];
  targets.value = [target];
  reports.value = [report];
  tasks.value = [mockTask(target)];
  selectedReport.value = mockReportDetail(report);
  usingMock.value = true;
}

function mockCompetitor(name: string, homepage: string, positioning: string): CompetitorVo {
  return {
    id: Date.now(),
    name,
    homepage,
    positioning,
    targetCount: 1,
    unreadReportCount: 1,
    updatedAt: new Date().toISOString(),
  };
}

function mockTarget(competitor: CompetitorVo): MonitorTargetVo {
  return {
    id: Date.now() + 1,
    competitorId: competitor.id,
    competitorName: competitor.name,
    type: 'pricing',
    title: `${competitor.name} Pricing`,
    url: `${competitor.homepage}/pricing`,
    status: 'active',
    confidence: 0.86,
  };
}

function mockDraftTargets(competitor: CompetitorVo): MonitorTargetVo[] {
  return ['official_site', 'pricing', 'docs', 'blog', 'changelog', 'rss'].map((type, index) => ({
    competitorId: competitor.id,
    competitorName: competitor.name,
    type: type as MonitorTargetVo['type'],
    title: `${competitor.name} ${type}`,
    url: `${competitor.homepage}/${type === 'official_site' ? '' : type}`,
    status: 'draft',
    confidence: 0.8 - index * 0.03,
  }));
}

function mockTask(target: MonitorTargetVo): TaskRunVo {
  return {
    id: Date.now() + 2,
    targetId: target.id || 0,
    targetTitle: target.title,
    status: 'success',
    adapter: 'mock-firecrawl',
    message: '已完成一次模拟采集',
    startedAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
  };
}

function mockReport(target: MonitorTargetVo): ReportSummaryVo {
  return {
    id: Date.now() + 3,
    competitorId: target.competitorId,
    competitorName: target.competitorName,
    targetId: target.id || 0,
    targetType: target.type,
    changeSummary: `${target.title} 出现关键字段更新`,
    priority: 'high',
    confidence: 0.82,
    evidenceCount: 1,
    read: false,
    recommendedActionSummary: '检查自家对应页面',
    createdAt: new Date().toISOString(),
  };
}

function mockReportDetail(report: ReportSummaryVo): ReportDetailVo {
  return {
    ...report,
    sourceUrl: 'https://comet.example.com/pricing',
    strategicIntent: '可能在强化商业化转化路径，并测试新的套餐表达。',
    businessImpact: '需要评估 Nova 当前定价页、文档入口和销售话术是否需要同步调整。',
    recommendedActions: ['检查自家对应页面', '补一条竞品对比证据', '决定是否写入知识库'],
    evidence: [{
      field: 'priceLikeText',
      oldValue: 'Pro plan starts at $19',
      newValue: 'Pro plan starts at $29 with annual discount',
      snippet: 'pricing 字段出现金额与年付折扣变化',
      sourceUrl: 'https://comet.example.com/pricing',
    }],
    reason: '规则评分命中 pricing 字段变化，AI mock 分析认为其商业影响较高。',
    knowledgeWritebackStatus: 'none',
  };
}
</script>

<template>
  <main v-loading="loading" class="intelligence-page">
    <section class="surface hero-surface">
      <header class="intelligence-header">
        <div class="title-block">
          <span class="eyebrow">Competitive Intelligence</span>
          <h1>竞品情报工作台</h1>
          <p>按证据审阅页面变化、RSS 更新、字段级 diff 和建议动作。</p>
        </div>
        <div class="header-actions">
          <el-tag v-if="usingMock" type="warning" effect="plain">
            Mock fallback
          </el-tag>
          <el-button :icon="Refresh" @click="loadWorkbench">
            刷新
          </el-button>
          <el-button type="primary" :icon="Plus" @click="activeView = 'competitors'">
            添加竞品
          </el-button>
        </div>
      </header>

      <div class="metric-grid">
        <div v-for="card in statCards" :key="card.label" class="metric-item" :class="`metric-${card.tone}`">
          <el-icon>
            <component :is="card.icon" />
          </el-icon>
          <div class="metric-copy">
            <span class="metric-label">{{ card.label }}</span>
            <strong class="metric-value">{{ card.value }}</strong>
          </div>
        </div>
      </div>
    </section>

    <el-tabs v-model="activeView" class="workbench-tabs">
      <el-tab-pane label="情报收件箱" name="inbox">
        <section class="workbench-grid">
          <aside class="surface inbox-panel">
            <div class="panel-toolbar">
              <el-input
                v-model="reportKeyword"
                :prefix-icon="Search"
                clearable
                placeholder="搜索竞品、变化、动作"
              />
              <el-select v-model="reportPriority" class="priority-select">
                <el-option label="全部优先级" value="all" />
                <el-option label="紧急" value="urgent" />
                <el-option label="高" value="high" />
                <el-option label="中" value="medium" />
                <el-option label="低" value="low" />
              </el-select>
            </div>

            <el-empty v-if="!hasReports" description="还没有情报报告">
              <el-button type="primary" @click="activeView = 'competitors'">
                添加竞品
              </el-button>
            </el-empty>

            <el-scrollbar v-else class="report-scroll">
              <button
                v-for="report in filteredReports"
                :key="report.id"
                class="report-row"
                :class="{ 'is-active': selectedReportId === report.id, 'is-unread': !report.read }"
                @click="openReport(report)"
              >
                <span class="report-head">
                  <strong>{{ report.competitorName }}</strong>
                  <el-tag :type="priorityMap[report.priority]" effect="light" round>
                    {{ priorityLabels[report.priority] }}
                  </el-tag>
                </span>
                <span class="report-title">{{ report.changeSummary }}</span>
                <span class="report-footer">
                  <span>{{ targetTypeLabels[report.targetType] }}</span>
                  <span>{{ formatPercent(report.confidence) }}</span>
                  <span>{{ report.evidenceCount }} 条证据</span>
                  <span>{{ formatTime(report.createdAt) }}</span>
                </span>
              </button>
            </el-scrollbar>
          </aside>

          <article class="surface report-detail">
            <template v-if="selectedReport">
              <div class="detail-title">
                <div>
                  <span class="eyebrow">{{ selectedReport.competitorName }} / {{ targetTypeLabels[selectedReport.targetType] }}</span>
                  <h2>{{ selectedReport.changeSummary }}</h2>
                </div>
                <el-tag :type="priorityMap[selectedReport.priority]" size="large">
                  {{ priorityLabels[selectedReport.priority] }}
                </el-tag>
              </div>

              <el-descriptions :column="4" border class="report-descriptions">
                <el-descriptions-item label="置信度">
                  {{ formatPercent(selectedReport.confidence) }}
                </el-descriptions-item>
                <el-descriptions-item label="证据">
                  {{ selectedReport.evidenceCount }} 条
                </el-descriptions-item>
                <el-descriptions-item label="知识库">
                  {{ knowledgeStatusLabels[selectedReport.knowledgeWritebackStatus] }}
                </el-descriptions-item>
                <el-descriptions-item label="来源">
                  <el-link :href="selectedReport.sourceUrl" target="_blank" :icon="Link">
                    打开
                  </el-link>
                </el-descriptions-item>
              </el-descriptions>

              <el-tabs class="detail-tabs">
                <el-tab-pane label="证据 Diff">
                  <div class="evidence-stack">
                    <section v-for="item in selectedReport.evidence" :key="item.field" class="evidence-block">
                      <header>
                        <el-tag effect="plain">
                          {{ item.field }}
                        </el-tag>
                        <el-link :href="item.sourceUrl" target="_blank" :icon="Link">
                          来源
                        </el-link>
                      </header>
                      <div class="diff-grid">
                        <div class="diff-cell old">
                          <span>旧值</span>
                          <p>{{ item.oldValue }}</p>
                        </div>
                        <div class="diff-cell fresh">
                          <span>新值</span>
                          <p>{{ item.newValue }}</p>
                        </div>
                      </div>
                      <p class="snippet">
                        {{ item.snippet }}
                      </p>
                    </section>
                  </div>
                </el-tab-pane>

                <el-tab-pane label="分析与动作">
                  <div class="analysis-grid">
                    <section>
                      <h3>战略意图</h3>
                      <p>{{ selectedReport.strategicIntent }}</p>
                    </section>
                    <section>
                      <h3>业务影响</h3>
                      <p>{{ selectedReport.businessImpact }}</p>
                    </section>
                    <section class="action-list">
                      <h3>建议动作</h3>
                      <el-timeline>
                        <el-timeline-item v-for="action in selectedReport.recommendedActions" :key="action">
                          {{ action }}
                        </el-timeline-item>
                      </el-timeline>
                    </section>
                    <section>
                      <h3>判定依据</h3>
                      <p class="reason">
                        {{ selectedReport.reason }}
                      </p>
                    </section>
                  </div>
                </el-tab-pane>
              </el-tabs>

              <footer class="detail-actions">
                <el-button-group>
                  <el-button v-for="(label, value) in feedbackLabels" :key="value" @click="handleFeedback(value)">
                    {{ label }}
                  </el-button>
                </el-button-group>
                <el-button type="primary" :icon="DocumentChecked" @click="handleKnowledgeWriteback">
                  写入知识库
                </el-button>
              </footer>
            </template>
            <el-empty v-else description="选择一条情报查看详情" />
          </article>
        </section>
      </el-tab-pane>

      <el-tab-pane label="竞品管理" name="competitors">
        <section class="management-layout">
          <el-card shadow="never" class="form-card">
            <template #header>
              <div class="card-header">
                <span>添加竞品</span>
                <el-tag type="info" effect="plain">
                  URL + RSS
                </el-tag>
              </div>
            </template>
            <el-form label-position="top" @submit.prevent="handleCreateCompetitor">
              <el-form-item label="竞品名称">
                <el-input v-model="competitorForm.name" placeholder="例如 Comet" />
              </el-form-item>
              <el-form-item label="官网 URL">
                <el-input v-model="competitorForm.homepage" placeholder="https://example.com" />
              </el-form-item>
              <el-form-item label="定位备注">
                <el-input v-model="competitorForm.positioning" placeholder="产品定位、目标客群或你关注它的原因" />
              </el-form-item>
              <el-button type="primary" native-type="submit" :icon="Plus">
                保存竞品
              </el-button>
            </el-form>
          </el-card>

          <el-card shadow="never" class="table-card">
            <template #header>
              <div class="card-header">
                <span>竞品列表</span>
                <span>{{ competitors.length }} 个</span>
              </div>
            </template>
            <el-table :data="competitors" height="420" empty-text="还没有竞品">
              <el-table-column prop="name" label="竞品" min-width="150" />
              <el-table-column label="官网" min-width="240">
                <template #default="{ row }">
                  <el-link :href="row.homepage" target="_blank" :icon="Link">
                    {{ row.homepage }}
                  </el-link>
                </template>
              </el-table-column>
              <el-table-column prop="positioning" label="定位" min-width="220" show-overflow-tooltip />
              <el-table-column label="目标" width="90">
                <template #default="{ row }">
                  {{ row.targetCount }}
                </template>
              </el-table-column>
              <el-table-column label="未读" width="90">
                <template #default="{ row }">
                  <el-badge :value="row.unreadReportCount" :hidden="row.unreadReportCount === 0" />
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </section>
      </el-tab-pane>

      <el-tab-pane label="监控目标" name="targets">
        <section class="targets-layout">
          <el-card shadow="never" class="draft-card">
            <template #header>
              <div class="card-header">
                <span>目标草稿</span>
                <el-button size="small" type="primary" :icon="Aim" @click="handleRecommendTargets">
                  从官网生成
                </el-button>
              </div>
            </template>
            <el-empty v-if="drafts.length === 0" description="暂无草稿" />
            <div v-else class="draft-list">
              <div v-for="draft in drafts" :key="draft.type" class="draft-row">
                <el-tag effect="plain">
                  {{ targetTypeLabels[draft.type] }}
                </el-tag>
                <el-input v-model="draft.url" />
                <el-progress :percentage="Math.round(draft.confidence * 100)" :stroke-width="8" />
              </div>
              <el-button type="primary" @click="handleConfirmDrafts">
                确认草稿
              </el-button>
            </div>
          </el-card>

          <el-card shadow="never" class="table-card">
            <template #header>
              <div class="card-header">
                <span>活跃监控</span>
                <span>{{ targets.length }} 个目标</span>
              </div>
            </template>
            <el-table :data="targets" height="360" empty-text="还没有监控目标">
              <el-table-column prop="title" label="目标" min-width="180" />
              <el-table-column label="类型" width="100">
                <template #default="{ row }">
                  <el-tag effect="plain">
                    {{ targetTypeLabel(row.type) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="URL" min-width="260">
                <template #default="{ row }">
                  <el-link :href="row.url" target="_blank" :icon="Link">
                    {{ row.url }}
                  </el-link>
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'active' ? 'success' : 'info'" effect="light">
                    {{ row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" fixed="right">
                <template #default="{ row }">
                  <el-button size="small" @click="handleCollect(row)">
                    采集
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>

          <el-card shadow="never" class="table-card">
            <template #header>
              <div class="card-header">
                <span>任务运行</span>
                <span>{{ tasks.length }} 条</span>
              </div>
            </template>
            <el-table :data="tasks" height="260" empty-text="暂无采集任务">
              <el-table-column prop="targetTitle" label="目标" min-width="180" />
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="taskStatusType(row.status)" effect="light">
                    {{ taskStatusLabel(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="adapter" label="采集器" width="140" />
              <el-table-column prop="message" label="结果" min-width="220" show-overflow-tooltip />
              <el-table-column label="开始时间" width="130">
                <template #default="{ row }">
                  {{ formatTime(row.startedAt) }}
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </section>
      </el-tab-pane>
    </el-tabs>
  </main>
</template>

<style scoped lang="scss">
.intelligence-page {
  --ci-canvas: #f6f7f9;
  --ci-surface: #ffffff;
  --ci-surface-muted: #f3f4f6;
  --ci-surface-raised: #fbfcfe;
  --ci-border: #dcdfe6;
  --ci-border-soft: #e8edf3;
  --ci-text: #1f2329;
  --ci-text-secondary: #606266;
  --ci-text-muted: #909399;
  --ci-primary: #2563eb;
  --ci-success: #059669;
  --ci-warning: #d97706;
  --ci-danger: #dc2626;

  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;
  padding: 20px;
  color: var(--ci-text);
  background: var(--ci-canvas);
}
.surface {
  background: var(--ci-surface);
  border: 1px solid var(--ci-border);
  border-radius: 8px;
  box-shadow: 0 1px 2px rgb(31 35 41 / 4%), 0 10px 24px rgb(31 35 41 / 5%);
}
.hero-surface {
  padding: 18px;
}
.intelligence-header,
.detail-title,
.detail-actions,
.card-header {
  display: flex;
  align-items: center;
}
.intelligence-header {
  gap: 18px;
  align-items: flex-start;
  justify-content: space-between;
}
.title-block {
  h1 {
    margin: 0;
    font-size: 26px;
    line-height: 1.25;
    letter-spacing: 0;
  }
  p {
    margin: 6px 0 0;
    color: var(--ci-text-secondary);
  }
}
.eyebrow {
  display: inline-flex;
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--ci-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0;
}
.header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
}
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(140px, 1fr));
  gap: 10px;
  margin-top: 16px;
}
.metric-item {
  --metric-color: var(--ci-primary);
  --metric-soft: #eff6ff;

  position: relative;
  display: flex;
  gap: 12px;
  align-items: center;
  min-height: 72px;
  padding: 13px 14px 13px 16px;
  overflow: hidden;
  background: var(--ci-surface-raised);
  border: 1px solid var(--ci-border-soft);
  border-radius: 8px;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 80%);
  &::before {
    position: absolute;
    top: 12px;
    bottom: 12px;
    left: 0;
    width: 3px;
    content: '';
    background: var(--metric-color);
    border-radius: 0 999px 999px 0;
  }
  .el-icon {
    width: 36px;
    height: 36px;
    color: var(--metric-color);
    background: var(--metric-soft);
    border-radius: 8px;
  }
}
.metric-copy {
  min-width: 0;
}
.metric-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  line-height: 18px;
  color: var(--ci-text-secondary);
}
.metric-value {
  display: block;
  margin-top: 3px;
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  color: var(--ci-text);
}
.metric-danger {
  --metric-color: var(--ci-danger);
  --metric-soft: #fef2f2;
}
.metric-warning {
  --metric-color: var(--ci-warning);
  --metric-soft: #fffbeb;
}
.metric-success {
  --metric-color: var(--ci-success);
  --metric-soft: #ecfdf5;
}
.workbench-tabs {
  :deep(.el-tabs__header) {
    padding: 0 6px;
    margin: 0 0 12px;
  }
}
.workbench-grid {
  display: grid;
  grid-template-columns: minmax(320px, 420px) minmax(0, 1fr);
  gap: 14px;
  align-items: start;
}
.inbox-panel,
.report-detail {
  min-height: 620px;
  padding: 14px;
}
.panel-toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 132px;
  gap: 8px;
  margin-bottom: 12px;
}
.report-scroll {
  height: 560px;
}
.report-row {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  padding: 13px 14px 13px 16px;
  margin-bottom: 8px;
  overflow: hidden;
  color: inherit;
  text-align: left;
  cursor: pointer;
  background: var(--ci-surface);
  border: 1px solid var(--ci-border-soft);
  border-radius: 8px;
  transition: border-color 180ms ease, background-color 180ms ease, box-shadow 180ms ease;
  &::before {
    position: absolute;
    top: 10px;
    bottom: 10px;
    left: 0;
    width: 3px;
    content: '';
    background: transparent;
    border-radius: 0 999px 999px 0;
    transition: background-color 180ms ease;
  }
}
.report-row:hover,
.report-row.is-active {
  background: #f8fbff;
  border-color: #9bb9ff;
  box-shadow: 0 8px 18px rgb(37 99 235 / 8%);
}
.report-row:focus-visible {
  outline: 2px solid rgb(37 99 235 / 38%);
  outline-offset: 2px;
}
.report-row.is-active::before {
  background: var(--ci-primary);
}
.report-row.is-unread {
  background: #fcfdff;
}
.report-row.is-unread::before {
  background: var(--ci-primary);
}
.report-head,
.report-footer {
  display: flex;
  align-items: center;
}
.report-head {
  gap: 8px;
  justify-content: space-between;
}
.report-title {
  font-weight: 600;
  line-height: 1.45;
  color: var(--ci-text);
}
.report-footer {
  flex-wrap: wrap;
  gap: 10px;
  font-size: 12px;
  color: var(--ci-text-muted);
  span {
    display: inline-flex;
    align-items: center;
  }
  span + span::before {
    width: 3px;
    height: 3px;
    margin-right: 10px;
    content: '';
    background: #c4ccd6;
    border-radius: 999px;
  }
}
.detail-title {
  gap: 12px;
  justify-content: space-between;
  h2 {
    margin: 0;
    font-size: 22px;
    line-height: 1.35;
    letter-spacing: 0;
  }
}
.report-descriptions {
  margin-top: 16px;
}
.detail-tabs {
  margin-top: 14px;
}
.evidence-stack {
  display: grid;
  gap: 12px;
}
.evidence-block {
  padding: 14px;
  background: var(--ci-surface);
  border: 1px solid var(--ci-border-soft);
  border-radius: 8px;
  box-shadow: 0 1px 2px rgb(31 35 41 / 3%);
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
}
.diff-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.diff-cell {
  min-height: 92px;
  padding: 12px 12px 12px 14px;
  border-left: 3px solid transparent;
  border-radius: 8px;
  span {
    font-size: 13px;
    font-weight: 700;
    color: var(--ci-text-secondary);
  }
  p {
    margin: 8px 0 0;
    line-height: 1.55;
    color: var(--ci-text);
  }
}
.diff-cell.old {
  background: #fff8f1;
  border: 1px solid #fed7aa;
  border-left-color: var(--ci-warning);
}
.diff-cell.fresh {
  background: #f0fdf7;
  border: 1px solid #bbf7d0;
  border-left-color: var(--ci-success);
}
.snippet,
.reason {
  line-height: 1.65;
  color: var(--ci-text-secondary);
}
.analysis-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  section {
    min-height: 132px;
    padding: 14px;
    background: var(--ci-surface);
    border: 1px solid var(--ci-border-soft);
    border-radius: 8px;
    box-shadow: 0 1px 2px rgb(31 35 41 / 3%);
  }
  h3 {
    margin: 0 0 8px;
    font-size: 15px;
    color: var(--ci-text);
  }
  p {
    margin: 0;
    line-height: 1.65;
  }
}
.action-list {
  :deep(.el-timeline) {
    padding-left: 0;
  }
}
.detail-actions {
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;
  padding-top: 14px;
  margin-top: 16px;
  border-top: 1px solid var(--ci-border-soft);
}
.management-layout,
.targets-layout {
  display: grid;
  grid-template-columns: minmax(300px, 380px) minmax(0, 1fr);
  gap: 14px;
  align-items: start;
}
.table-card:last-child {
  grid-column: 1 / -1;
}
.card-header {
  gap: 12px;
  justify-content: space-between;
  font-weight: 700;
}
.form-card,
.table-card,
.draft-card {
  border: 1px solid var(--ci-border);
  border-radius: 8px;
  :deep(.el-card__header) {
    padding: 13px 14px;
    background: #fbfcfe;
    border-bottom: 1px solid var(--ci-border-soft);
  }
  :deep(.el-card__body) {
    padding: 14px;
  }
}
.draft-list {
  display: grid;
  gap: 12px;
}
.draft-row {
  display: grid;
  grid-template-columns: 78px minmax(0, 1fr);
  gap: 8px;
  align-items: center;
  padding: 12px;
  background: var(--ci-surface);
  border: 1px solid var(--ci-border-soft);
  border-radius: 8px;
  .el-progress {
    grid-column: 1 / -1;
  }
}

@media (width <= 980px) {
  .workbench-grid,
  .management-layout,
  .targets-layout,
  .analysis-grid {
    grid-template-columns: 1fr;
  }
  .intelligence-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .inbox-panel,
  .report-detail {
    min-height: auto;
  }
  .report-scroll {
    height: 420px;
  }
}

@media (width <= 640px) {
  .intelligence-page {
    padding: 12px;
  }
  .metric-grid,
  .panel-toolbar,
  .diff-grid {
    grid-template-columns: 1fr;
  }
  .header-actions,
  .detail-actions {
    justify-content: flex-start;
  }
}
</style>
