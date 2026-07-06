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

const competitorForm = reactive({
  name: '',
  homepage: '',
  positioning: '',
});

const selectedCompetitorId = computed(() => competitors.value[0]?.id);
const hasReports = computed(() => reports.value.length > 0);
const unreadCount = computed(() => reports.value.filter(item => !item.read).length);

type TagType = 'primary' | 'success' | 'warning' | 'info' | 'danger';

const priorityMap: Record<ReportSummaryVo['priority'], TagType> = {
  low: 'info',
  medium: 'warning',
  high: 'danger',
  urgent: 'danger',
};

const feedbackLabels: Record<FeedbackValue, string> = {
  useful: '有用',
  not_useful: '没用',
  false_positive: '误报',
  handled: '已处理',
};

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
    <header class="intelligence-header">
      <div>
        <h1>竞品情报</h1>
        <p>Inbox-first workbench for competitor changes, evidence, and actions.</p>
      </div>
      <div class="header-actions">
        <el-tag v-if="usingMock" type="warning" effect="plain">
          Mock fallback
        </el-tag>
        <el-tag type="info" effect="plain">
          {{ unreadCount }} 未读
        </el-tag>
        <el-button type="primary" @click="loadWorkbench">
          <el-icon><Refresh /></el-icon>
        </el-button>
      </div>
    </header>

    <el-segmented
      v-model="activeView" :options="[
        { label: 'Inbox', value: 'inbox' },
        { label: 'Competitors', value: 'competitors' },
        { label: 'Targets', value: 'targets' },
      ]"
    />

    <section v-if="activeView === 'inbox'" class="workbench-grid">
      <div class="inbox-list">
        <div v-if="!hasReports" class="empty-state">
          <el-empty description="还没有情报报告">
            <el-button type="primary" @click="activeView = 'competitors'">
              添加竞品
            </el-button>
          </el-empty>
        </div>

        <button
          v-for="report in reports"
          :key="report.id"
          class="report-row"
          :class="{ 'report-row-unread': !report.read }"
          @click="openReport(report)"
        >
          <span class="row-main">
            <strong>{{ report.competitorName }}</strong>
            <span>{{ report.changeSummary }}</span>
          </span>
          <span class="row-meta">
            <el-tag :type="priorityMap[report.priority]" effect="light">{{ report.priority }}</el-tag>
            <span>{{ Math.round(report.confidence * 100) }}%</span>
            <span>{{ report.evidenceCount }} evidence</span>
          </span>
        </button>
      </div>

      <article v-if="selectedReport" class="report-detail">
        <div class="detail-title">
          <div>
            <h2>{{ selectedReport.changeSummary }}</h2>
            <p>{{ selectedReport.competitorName }} · {{ selectedReport.targetType }}</p>
          </div>
          <el-tag :type="priorityMap[selectedReport.priority]">
            {{ selectedReport.priority }}
          </el-tag>
        </div>

        <section>
          <h3>Evidence</h3>
          <div v-for="item in selectedReport.evidence" :key="item.field" class="evidence-block">
            <div class="evidence-field">
              {{ item.field }}
            </div>
            <div class="diff-grid">
              <div><span>Old</span><p>{{ item.oldValue }}</p></div>
              <div><span>New</span><p>{{ item.newValue }}</p></div>
            </div>
            <p>{{ item.snippet }}</p>
          </div>
        </section>

        <section>
          <h3>Analysis</h3>
          <p>{{ selectedReport.strategicIntent }}</p>
          <p>{{ selectedReport.businessImpact }}</p>
          <ul>
            <li v-for="action in selectedReport.recommendedActions" :key="action">
              {{ action }}
            </li>
          </ul>
          <p class="reason">
            {{ selectedReport.reason }}
          </p>
        </section>

        <footer class="detail-actions">
          <el-button-group>
            <el-button v-for="(label, value) in feedbackLabels" :key="value" @click="handleFeedback(value)">
              {{ label }}
            </el-button>
          </el-button-group>
          <el-button type="primary" plain @click="handleKnowledgeWriteback">
            写入知识库
          </el-button>
        </footer>
      </article>
    </section>

    <section v-if="activeView === 'competitors'" class="management-grid">
      <form class="control-panel" @submit.prevent="handleCreateCompetitor">
        <h2>添加竞品</h2>
        <el-input v-model="competitorForm.name" placeholder="竞品名称" />
        <el-input v-model="competitorForm.homepage" placeholder="https://example.com" />
        <el-input v-model="competitorForm.positioning" placeholder="定位/备注" />
        <el-button type="primary" native-type="submit">
          保存竞品
        </el-button>
      </form>

      <div class="list-panel">
        <div v-for="competitor in competitors" :key="competitor.id" class="competitor-row">
          <div>
            <strong>{{ competitor.name }}</strong>
            <p>{{ competitor.homepage }}</p>
          </div>
          <div class="row-meta">
            <span>{{ competitor.targetCount }} targets</span>
            <span>{{ competitor.unreadReportCount }} unread</span>
          </div>
        </div>
      </div>
    </section>

    <section v-if="activeView === 'targets'" class="management-grid">
      <div class="control-panel">
        <h2>监控目标</h2>
        <el-button type="primary" @click="handleRecommendTargets">
          从官网生成目标草稿
        </el-button>
        <el-button :disabled="drafts.length === 0" @click="handleConfirmDrafts">
          确认草稿
        </el-button>
        <div v-for="draft in drafts" :key="draft.type" class="draft-row">
          <el-tag effect="plain">
            {{ draft.type }}
          </el-tag>
          <el-input v-model="draft.url" />
        </div>
      </div>

      <div class="list-panel">
        <div v-for="target in targets" :key="target.id || target.url" class="target-row">
          <div>
            <strong>{{ target.title }}</strong>
            <p>{{ target.url }}</p>
          </div>
          <div class="row-meta">
            <el-tag effect="plain">
              {{ target.type }}
            </el-tag>
            <el-button size="small" @click="handleCollect(target)">
              采集
            </el-button>
          </div>
        </div>
      </div>

      <div class="list-panel">
        <div v-for="task in tasks" :key="task.id" class="task-row">
          <strong>{{ task.targetTitle }}</strong>
          <span>{{ task.status }} · {{ task.adapter }}</span>
          <p>{{ task.message }}</p>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped lang="scss">
.intelligence-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: 100%;
  padding: 24px;
  color: #17201c;
  background: #f6f8f7;
}

.intelligence-header,
.detail-title,
.detail-actions,
.row-meta {
  display: flex;
  align-items: center;
}

.intelligence-header {
  justify-content: space-between;
  h1 {
    margin: 0;
    font-size: 24px;
  }
  p {
    margin: 6px 0 0;
    color: #66736d;
  }
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.workbench-grid,
.management-grid {
  display: grid;
  grid-template-columns: minmax(320px, 0.95fr) minmax(420px, 1.4fr);
  gap: 16px;
  min-height: 0;
}

.management-grid {
  grid-template-columns: minmax(280px, 360px) 1fr 1fr;
}

.inbox-list,
.report-detail,
.control-panel,
.list-panel {
  padding: 16px;
  background: #ffffff;
  border: 1px solid #e3e8e5;
  border-radius: 8px;
}

.inbox-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.report-row {
  display: flex;
  gap: 14px;
  justify-content: space-between;
  width: 100%;
  padding: 14px;
  text-align: left;
  cursor: pointer;
  background: #f9fbfa;
  border: 1px solid transparent;
  border-radius: 8px;
  .row-main {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
}

.report-row-unread {
  border-color: #7eb7a4;
}

.row-meta {
  gap: 8px;
  color: #66736d;
  white-space: nowrap;
}

.report-detail {
  display: flex;
  flex-direction: column;
  gap: 18px;
  h2,
  h3 {
    margin: 0;
  }
}

.detail-title {
  justify-content: space-between;
  p {
    margin: 6px 0 0;
    color: #66736d;
  }
}

.evidence-block {
  padding: 12px;
  background: #f7faf8;
  border-radius: 8px;
}

.evidence-field {
  margin-bottom: 8px;
  font-weight: 700;
}

.diff-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  span {
    font-size: 12px;
    color: #66736d;
  }
  p {
    margin: 4px 0 0;
  }
}

.reason {
  color: #66736d;
}

.detail-actions {
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #edf0ee;
}

.control-panel,
.list-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.competitor-row,
.target-row,
.task-row,
.draft-row {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #f9fbfa;
  border-radius: 8px;
  p {
    margin: 4px 0 0;
    color: #66736d;
  }
}

.draft-row {
  align-items: stretch;
}

@media (max-width: 980px) {
  .workbench-grid,
  .management-grid {
    grid-template-columns: 1fr;
  }

  .intelligence-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }
}
</style>
