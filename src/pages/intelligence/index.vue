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
  Close,
  Collection,
  Delete,
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
  deleteCompetitor,
  deleteMonitorTarget,
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
const discoveryLoading = ref(false);
const startMonitoringLoading = ref(false);
const deletingCompetitorId = ref<number>();
const deletingTargetId = ref<number>();
const taskLoading = ref(false);
const collectingCompetitorIds = ref<number[]>([]);
const pageError = ref('');
const activeView = ref<'reports' | 'entities' | 'tasks'>('entities');
const competitors = ref<CompetitorVo[]>([]);
const targets = ref<MonitorTargetVo[]>([]);
const reports = ref<ReportSummaryVo[]>([]);
const tasks = ref<TaskRunVo[]>([]);
const selectedReport = ref<ReportDetailVo | null>(null);
type DraftSource = 'homepage_link' | 'feed_hint' | 'rule_fallback' | 'manual';
type ValidationStatus = 'pending' | 'success' | 'failed';
type CollectionStatus = 'idle' | 'saving' | 'collecting' | 'baseline' | 'failed';
type DraftTarget = MonitorTargetVo & {
  selected: boolean;
  source: DraftSource;
  validationStatus: ValidationStatus;
  validationMessage: string;
  collectStatus: CollectionStatus;
  collectMessage?: string;
};

const drafts = ref<DraftTarget[]>([]);
const startupRuns = ref<Array<{
  target: MonitorTargetVo;
  status: 'waiting' | 'collecting' | 'baseline' | 'failed';
  message: string;
}>>([]);
const reportKeyword = ref('');
const reportPriority = ref<ReportSummaryVo['priority'] | 'all'>('all');
const taskCompetitorFilter = ref<number | 'all'>('all');
const competitorDialogVisible = ref(false);
const competitorDetailDrawerVisible = ref(false);
const competitorDetailLoading = ref(false);
const detailCompetitor = ref<CompetitorVo | null>(null);
const detailTargets = ref<MonitorTargetVo[]>([]);
const detailReports = ref<ReportSummaryVo[]>([]);
const detailTasks = ref<TaskRunVo[]>([]);
let detailLoadSeq = 0;

const competitorForm = reactive({
  name: '',
  homepage: '',
  positioning: '',
});

const hasReports = computed(() => reports.value.length > 0);
const unreadCount = computed(() => reports.value.filter(item => !item.read).length);
const activeTargetCount = computed(() => targets.value.filter(item => item.status === 'active').length);
const highImpactCount = computed(() => reports.value.filter(item => ['high', 'urgent'].includes(item.priority)).length);
const selectedReportId = computed(() => selectedReport.value?.id);
const latestTask = computed(() => tasks.value[0]);
const latestTaskTarget = computed(() => targets.value.find(item => item.id === latestTask.value?.targetId));
const selectedTaskCompetitorId = computed(() => taskCompetitorFilter.value === 'all' ? undefined : taskCompetitorFilter.value);
const detailHasBaseline = computed(() => detailTasks.value.some(task => task.status === 'success' && task.message.includes('基线')));
const detailLatestTask = computed(() => detailTasks.value[0]);
const detailDrafts = computed(() => detailCompetitor.value ? drafts.value.filter(draft => belongsToCompetitor(draft, detailCompetitor.value?.id)) : []);
const detailStartupRuns = computed(() => detailCompetitor.value ? startupRuns.value.filter(run => belongsToCompetitor(run.target, detailCompetitor.value?.id)) : []);
const detailUnreadCount = computed(() => detailReports.value.filter(report => !report.read).length);
const detailSelectedDraftCount = computed(() => detailDrafts.value.filter(draft => draft.selected).length);
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
  useful: '有帮助',
  not_useful: '不相关',
  false_positive: '这是误报',
  handled: '已处理',
};

const knowledgeStatusLabels: Record<ReportDetailVo['knowledgeWritebackStatus'], string> = {
  none: '未写入',
  written: '已写入',
  failed: '写入失败',
};

function openCompetitorDialog() {
  competitorDialogVisible.value = true;
}

function resetCompetitorForm() {
  Object.assign(competitorForm, { name: '', homepage: '', positioning: '' });
}

function normalizedId(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function sameId(left: unknown, right: unknown) {
  const leftId = normalizedId(left);
  const rightId = normalizedId(right);
  return leftId !== undefined && rightId !== undefined && leftId === rightId;
}

function belongsToCompetitor(item: { competitorId?: number }, competitorId?: number) {
  return sameId(item.competitorId, competitorId);
}

function activeTargetsForCompetitor(competitorId: number, source: MonitorTargetVo[] = targets.value) {
  return source.filter(target => target.id && target.status === 'active' && belongsToCompetitor(target, competitorId));
}

function isCollectingCompetitor(competitorId: number) {
  return collectingCompetitorIds.value.some(id => sameId(id, competitorId));
}

function setCollectingCompetitor(competitorId: number, collecting: boolean) {
  if (collecting) {
    if (!isCollectingCompetitor(competitorId))
      collectingCompetitorIds.value = [...collectingCompetitorIds.value, competitorId];
    return;
  }
  collectingCompetitorIds.value = collectingCompetitorIds.value.filter(id => !sameId(id, competitorId));
}

async function openCompetitorDetail(competitor: CompetitorVo) {
  detailCompetitor.value = competitor;
  detailTargets.value = [];
  detailReports.value = [];
  detailTasks.value = [];
  competitorDetailDrawerVisible.value = true;
  await loadCompetitorDetail();
}

async function loadCompetitorDetail() {
  if (!detailCompetitor.value)
    return;
  const competitorId = detailCompetitor.value.id;
  const requestSeq = ++detailLoadSeq;
  competitorDetailLoading.value = true;
  try {
    const [targetData, reportData, taskData] = await Promise.all([
      listMonitorTargets(competitorId),
      listInboxReports(competitorId),
      listTaskRuns(competitorId),
    ]);
    if (requestSeq !== detailLoadSeq || detailCompetitor.value?.id !== competitorId)
      return;

    const scopedTargets = targetData.filter(target => belongsToCompetitor(target, competitorId));
    const scopedTargetIds = new Set(scopedTargets.map(target => normalizedId(target.id)));
    detailTargets.value = scopedTargets;
    detailReports.value = reportData.filter(report => belongsToCompetitor(report, competitorId));
    detailTasks.value = taskData.filter(task => scopedTargetIds.has(normalizedId(task.targetId)));
  }
  catch (error) {
    if (requestSeq !== detailLoadSeq || detailCompetitor.value?.id !== competitorId)
      return;
    ElMessage.error(errorMessage(error, '竞品详情加载失败'));
    detailTargets.value = [];
    detailReports.value = [];
    detailTasks.value = [];
  }
  finally {
    if (requestSeq === detailLoadSeq && detailCompetitor.value?.id === competitorId)
      competitorDetailLoading.value = false;
  }
}

async function handleDetailRecommendTargets() {
  if (!detailCompetitor.value)
    return;
  discoveryLoading.value = true;
  try {
    const recommended = await recommendMonitorTargets({
      competitorId: detailCompetitor.value.id,
      homepage: detailCompetitor.value.homepage,
    });
    drafts.value = [
      ...drafts.value.filter(draft => !belongsToCompetitor(draft, detailCompetitor.value?.id)),
      ...recommended.map(toDraftTarget),
    ];
  }
  catch (error) {
    ElMessage.error(errorMessage(error, '监控目标发现失败'));
  }
  finally {
    discoveryLoading.value = false;
  }
}

async function handleDetailConfirmDrafts() {
  if (startMonitoringLoading.value)
    return;
  startMonitoringLoading.value = true;
  try {
    await handleConfirmDrafts(detailCompetitor.value?.id);
    await loadCompetitorDetail();
  }
  finally {
    startMonitoringLoading.value = false;
  }
}

async function handleDetailCollect(target: MonitorTargetVo) {
  if (detailCompetitor.value && !belongsToCompetitor(target, detailCompetitor.value.id)) {
    ElMessage.warning('该目标不属于当前竞品，已阻止操作');
    return;
  }
  await handleCollect(target);
  await loadCompetitorDetail();
}

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

function priorityType(priority: ReportSummaryVo['priority']) {
  return priorityMap[priority];
}

function priorityLabel(priority: ReportSummaryVo['priority']) {
  return priorityLabels[priority];
}

onMounted(() => {
  loadWorkbench();
});

async function loadWorkbench() {
  loading.value = true;
  pageError.value = '';
  try {
    const [competitorData, targetData, reportData, taskData] = await Promise.all([
      listCompetitors(),
      listMonitorTargets(),
      listInboxReports(),
      listTaskRuns(selectedTaskCompetitorId.value),
    ]);
    competitors.value = competitorData;
    targets.value = targetData;
    reports.value = reportData;
    tasks.value = taskData;
    if (reportData[0]) {
      await openReport(reportData[0]);
    }
    else {
      selectedReport.value = null;
    }
  }
  catch (error) {
    pageError.value = errorMessage(error, '工作台加载失败，请检查登录状态或后端服务');
    competitors.value = [];
    targets.value = [];
    reports.value = [];
    tasks.value = [];
    selectedReport.value = null;
  }
  finally {
    loading.value = false;
  }
}

async function loadTaskRuns() {
  taskLoading.value = true;
  try {
    tasks.value = await listTaskRuns(selectedTaskCompetitorId.value);
  }
  catch (error) {
    ElMessage.error(errorMessage(error, '任务记录加载失败'));
  }
  finally {
    taskLoading.value = false;
  }
}

async function handleTaskCompetitorChange() {
  await loadTaskRuns();
}

async function handleCreateCompetitor() {
  if (!competitorForm.name || !competitorForm.homepage) {
    ElMessage.warning('先填竞品名称和官网');
    return;
  }
  try {
    const created = await createCompetitor({ ...competitorForm });
    competitors.value.unshift(created);
    resetCompetitorForm();
    competitorDialogVisible.value = false;
    ElMessage.success('竞品已添加');
    activeView.value = 'entities';
    detailCompetitor.value = created;
    competitorDetailDrawerVisible.value = true;
    await loadCompetitorDetail();
    await handleDetailRecommendTargets();
  }
  catch (error) {
    ElMessage.error(errorMessage(error, '竞品保存失败'));
  }
}

async function handleConfirmDrafts(competitorId?: number) {
  const selectedDrafts = drafts.value.filter(item => item.selected && (competitorId === undefined || belongsToCompetitor(item, competitorId)));
  const saved: MonitorTargetVo[] = [];
  const processedDraftKeys = new Set<string>();
  let failedCount = 0;
  for (const draft of selectedDrafts) {
    try {
      draft.collectStatus = 'saving';
      const created = await createMonitorTarget({
        competitorId: draft.competitorId,
        type: draft.type,
        title: draft.title,
        url: draft.url,
      });
      if (!created?.id) {
        throw new Error('验活失败，后端未返回 active 目标');
      }
      saved.push(created);
      processedDraftKeys.add(draftKey(draft));
      draft.validationStatus = 'success';
      draft.validationMessage = '已验活并保存为 active 目标';
      draft.collectStatus = 'idle';
    }
    catch (error) {
      failedCount += 1;
      draft.selected = false;
      draft.validationStatus = 'failed';
      draft.validationMessage = errorMessage(error, '验活失败，未入库');
      draft.collectStatus = 'failed';
      processedDraftKeys.add(draftKey(draft));
    }
  }
  if (saved.length > 0) {
    targets.value.unshift(...saved);
  }
  drafts.value = drafts.value.filter(draft => !processedDraftKeys.has(draftKey(draft)));
  if (failedCount > 0) {
    ElMessage.warning(`已保存 ${saved.length} 个目标，${failedCount} 个目标验活失败，已从候选列表移除`);
    return saved;
  }
  ElMessage.success('监控目标已确认');
  return saved;
}

async function handleCollect(target: MonitorTargetVo) {
  if (!target.id)
    return;
  try {
    const task = await triggerTargetCollect(target.id);
    await loadTaskRuns();
    reports.value = await listInboxReports();
    if (reports.value[0]) {
      await openReport(reports.value[0]);
    }
    else {
      selectedReport.value = null;
      ElMessage.info(task.message || '采集完成，未发现字段级有效变化');
    }
  }
  catch (error) {
    ElMessage.error(errorMessage(error, '采集失败'));
  }
}

async function refreshAfterCollect(competitorId?: number) {
  const [competitorData, targetData, reportData] = await Promise.all([
    listCompetitors(),
    listMonitorTargets(),
    listInboxReports(),
  ]);
  competitors.value = competitorData;
  targets.value = targetData;
  reports.value = reportData;
  await loadTaskRuns();
  if (reportData[0]) {
    await openReport(reportData[0]);
  }
  else {
    selectedReport.value = null;
  }
  if (competitorDetailDrawerVisible.value && sameId(detailCompetitor.value?.id, competitorId)) {
    await loadCompetitorDetail();
  }
}

async function handleCollectCompetitorTargets(competitor: CompetitorVo) {
  if (isCollectingCompetitor(competitor.id))
    return;
  setCollectingCompetitor(competitor.id, true);
  let successCount = 0;
  let failedCount = 0;
  try {
    const latestTargets = await listMonitorTargets(competitor.id);
    const collectableTargets = activeTargetsForCompetitor(competitor.id, latestTargets);
    if (collectableTargets.length === 0) {
      ElMessage.warning('该竞品暂无已监控目标');
      return;
    }
    for (const target of collectableTargets) {
      if (!target.id)
        continue;
      try {
        await triggerTargetCollect(target.id);
        successCount += 1;
      }
      catch {
        failedCount += 1;
      }
    }
    await refreshAfterCollect(competitor.id);
    if (failedCount > 0) {
      ElMessage.warning(`「${competitor.name}」采集完成：成功 ${successCount} 个，失败 ${failedCount} 个`);
      return;
    }
    ElMessage.success(`「${competitor.name}」采集完成：成功 ${successCount} 个`);
  }
  catch (error) {
    ElMessage.error(errorMessage(error, '一键采集失败'));
  }
  finally {
    setCollectingCompetitor(competitor.id, false);
  }
}

async function handleDeleteCompetitor(competitor: CompetitorVo) {
  try {
    await ElMessageBox.confirm(
      `删除「${competitor.name}」会同时移除它的监控目标、任务记录和情报报告。`,
      '删除竞品？',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        confirmButtonClass: 'el-button--danger',
        type: 'warning',
      },
    );
  }
  catch {
    return;
  }
  deletingCompetitorId.value = competitor.id;
  try {
    await deleteCompetitor(competitor.id);
    if (sameId(taskCompetitorFilter.value, competitor.id)) {
      taskCompetitorFilter.value = 'all';
    }
    if (detailCompetitor.value?.id === competitor.id) {
      competitorDetailDrawerVisible.value = false;
      detailCompetitor.value = null;
      detailTargets.value = [];
      detailReports.value = [];
      detailTasks.value = [];
    }
    drafts.value = drafts.value.filter(draft => !belongsToCompetitor(draft, competitor.id));
    startupRuns.value = startupRuns.value.filter(run => !belongsToCompetitor(run.target, competitor.id));
    await loadWorkbench();
    ElMessage.success('竞品已删除');
  }
  catch (error) {
    ElMessage.error(errorMessage(error, '竞品删除失败'));
  }
  finally {
    deletingCompetitorId.value = undefined;
  }
}

async function handleDeleteTarget(target: MonitorTargetVo) {
  if (!target.id)
    return;
  if (detailCompetitor.value && !belongsToCompetitor(target, detailCompetitor.value.id)) {
    ElMessage.warning('该目标不属于当前竞品，已阻止删除');
    return;
  }
  try {
    await ElMessageBox.confirm(
      `删除「${target.title}」会移除该目标的快照、任务记录和关联报告。`,
      '删除监控目标？',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        confirmButtonClass: 'el-button--danger',
        type: 'warning',
      },
    );
  }
  catch {
    return;
  }
  deletingTargetId.value = target.id;
  try {
    await deleteMonitorTarget(target.id);
    startupRuns.value = startupRuns.value.filter(run => run.target.id !== target.id);
    await loadWorkbench();
    if (competitorDetailDrawerVisible.value)
      await loadCompetitorDetail();
    ElMessage.success('监控目标已删除');
  }
  catch (error) {
    ElMessage.error(errorMessage(error, '监控目标删除失败'));
  }
  finally {
    deletingTargetId.value = undefined;
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
  catch (error) {
    ElMessage.error(errorMessage(error, '报告详情加载失败'));
  }
}

async function handleFeedback(value: FeedbackValue) {
  if (!selectedReport.value)
    return;
  try {
    selectedReport.value = await submitReportFeedback(selectedReport.value.id, value);
  }
  catch (error) {
    ElMessage.error(errorMessage(error, '反馈提交失败'));
  }
}

async function handleKnowledgeWriteback() {
  if (!selectedReport.value)
    return;
  try {
    selectedReport.value = await writeReportToKnowledge(selectedReport.value.id);
    ElMessage.success('已记录知识库写回状态');
  }
  catch (error) {
    ElMessage.error(errorMessage(error, '知识库写入失败'));
  }
}

function draftKey(draft: MonitorTargetVo) {
  return `${draft.competitorId}:${draft.type}:${draft.url}`;
}

function toDraftTarget(target: MonitorTargetVo): DraftTarget {
  return {
    ...target,
    selected: true,
    source: 'rule_fallback',
    validationStatus: 'pending',
    validationMessage: '保存时验活；通过后才会进入 active 监控',
    collectStatus: 'idle',
  };
}

function sourceLabel(source: DraftSource) {
  return {
    homepage_link: '官网发现',
    feed_hint: 'Feed 发现',
    rule_fallback: '规则补全',
    manual: '手动添加',
  }[source];
}

function validationType(status: ValidationStatus): TagType {
  return status === 'success' ? 'success' : status === 'failed' ? 'danger' : 'warning';
}

function validationLabel(status: ValidationStatus) {
  return status === 'success' ? '已验证' : status === 'failed' ? '验活失败' : '待验活';
}

function startupRunType(status: 'waiting' | 'collecting' | 'baseline' | 'failed'): TagType {
  return status === 'baseline' ? 'success' : status === 'failed' ? 'danger' : status === 'collecting' ? 'warning' : 'info';
}

function startupRunLabel(status: 'waiting' | 'collecting' | 'baseline' | 'failed') {
  return {
    waiting: '等待中',
    collecting: '采集中',
    baseline: '基线已建立',
    failed: '失败',
  }[status];
}

function errorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object') {
    const maybeResponse = error as { result?: { msg?: string }; message?: string };
    return maybeResponse.result?.msg || maybeResponse.message || fallback;
  }
  return fallback;
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
          <el-button :icon="Refresh" @click="loadWorkbench">
            刷新
          </el-button>
          <el-button type="primary" :icon="Plus" @click="openCompetitorDialog">
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
      <el-tab-pane label="情报报告" name="reports">
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
              <template #description>
                <span>首次采集会建立结构化快照基线；后续字段级变化才会进入情报箱。</span>
              </template>
              <div v-if="latestTask" class="baseline-summary">
                <el-tag :type="taskStatusType(latestTask.status)" effect="light">
                  {{ taskStatusLabel(latestTask.status) }}
                </el-tag>
                <span>{{ latestTask.targetTitle }}</span>
                <span>{{ latestTask.adapter }}</span>
              </div>
              <el-button type="primary" @click="activeView = 'entities'">
                去竞品与目标
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
            <template v-else-if="latestTask">
              <div class="detail-title">
                <div>
                  <span class="eyebrow">Baseline Snapshot</span>
                  <h2>已完成首次监控基线</h2>
                </div>
                <el-tag :type="taskStatusType(latestTask.status)" size="large">
                  {{ taskStatusLabel(latestTask.status) }}
                </el-tag>
              </div>

              <el-descriptions :column="2" border class="report-descriptions baseline-descriptions">
                <el-descriptions-item label="监控目标">
                  {{ latestTask.targetTitle }}
                </el-descriptions-item>
                <el-descriptions-item label="采集器">
                  {{ latestTask.adapter }}
                </el-descriptions-item>
                <el-descriptions-item label="完成时间">
                  {{ formatTime(latestTask.finishedAt || latestTask.startedAt) }}
                </el-descriptions-item>
                <el-descriptions-item label="目标 URL">
                  <el-link v-if="latestTaskTarget?.url" :href="latestTaskTarget.url" target="_blank" :icon="Link">
                    {{ latestTaskTarget.url }}
                  </el-link>
                  <span v-else>-</span>
                </el-descriptions-item>
              </el-descriptions>

              <section class="baseline-result">
                <h3>本次产出</h3>
                <p>{{ latestTask.message }}</p>
                <el-alert
                  show-icon
                  type="info"
                  :closable="false"
                  title="基线不是情报报告"
                  description="第一次监控会保存页面结构化快照；当后续采集检测到定价、功能、活动或定位字段变化时，才会生成情报报告并进入收件箱。"
                />
              </section>
            </template>
            <el-empty v-else description="选择一条情报查看详情" />
          </article>
        </section>
      </el-tab-pane>

      <el-tab-pane label="竞品与目标" name="entities">
        <section class="entities-layout">
          <el-card shadow="never" class="table-card competitor-card">
            <template #header>
              <div class="card-header">
                <span>竞品列表</span>
                <div class="card-actions">
                  <span>{{ competitors.length }} 个</span>
                  <el-button size="small" type="primary" :icon="Plus" @click="openCompetitorDialog">
                    添加竞品
                  </el-button>
                </div>
              </div>
            </template>
            <el-table class="competitor-table" :data="competitors" height="520" empty-text="还没有竞品">
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
              <el-table-column label="操作" width="280" fixed="right">
                <template #default="{ row }">
                  <div class="row-actions">
                    <el-button size="small" type="primary" plain :icon="Search" @click="openCompetitorDetail(row)">
                      查看详情
                    </el-button>
                    <el-tooltip
                      content="暂无已监控目标"
                      :disabled="activeTargetsForCompetitor(row.id).length > 0"
                      placement="top"
                    >
                      <span class="tooltip-button-wrap">
                        <el-button
                          size="small"
                          :icon="Refresh"
                          :disabled="activeTargetsForCompetitor(row.id).length === 0"
                          :loading="isCollectingCompetitor(row.id)"
                          @click="handleCollectCompetitorTargets(row)"
                        >
                          一键采集
                        </el-button>
                      </span>
                    </el-tooltip>
                    <el-button
                      size="small"
                      text
                      type="danger"
                      :icon="Delete"
                      :loading="deletingCompetitorId === row.id"
                      @click="handleDeleteCompetitor(row)"
                    >
                      删除
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </section>
      </el-tab-pane>

      <el-tab-pane label="任务记录" name="tasks">
        <section class="tasks-layout">
          <el-card shadow="never" class="table-card">
            <template #header>
              <div class="card-header">
                <span>采集任务</span>
                <div class="card-actions">
                  <el-select
                    v-model="taskCompetitorFilter"
                    class="task-filter-select"
                    size="small"
                    @change="handleTaskCompetitorChange"
                  >
                    <el-option label="全部竞品" value="all" />
                    <el-option
                      v-for="competitor in competitors"
                      :key="competitor.id"
                      :label="competitor.name"
                      :value="competitor.id"
                    />
                  </el-select>
                  <span>{{ tasks.length }} 条</span>
                </div>
              </div>
            </template>
            <el-table v-loading="taskLoading" :data="tasks" height="260" empty-text="暂无采集任务">
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

    <el-drawer
      v-model="competitorDetailDrawerVisible"
      class="competitor-detail-drawer"
      direction="rtl"
      size="720px"
      :with-header="false"
    >
      <section v-loading="competitorDetailLoading" class="drawer-workspace">
        <template v-if="detailCompetitor">
          <header class="drawer-header">
            <div>
              <span class="eyebrow">Competitor Detail</span>
              <h2>{{ detailCompetitor.name }}</h2>
              <el-link :href="detailCompetitor.homepage" target="_blank" :icon="Link">
                {{ detailCompetitor.homepage }}
              </el-link>
            </div>
            <div class="drawer-actions">
              <el-button :icon="Refresh" @click="loadCompetitorDetail">
                刷新
              </el-button>
              <el-button :icon="Close" aria-label="关闭详情" @click="competitorDetailDrawerVisible = false" />
            </div>
          </header>

          <section class="drawer-section">
            <div class="section-title-row">
              <h3>基本信息</h3>
            </div>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="定位">
                {{ detailCompetitor.positioning || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="更新时间">
                {{ formatTime(detailCompetitor.updatedAt) }}
              </el-descriptions-item>
              <el-descriptions-item label="目标数">
                {{ detailTargets.length }}
              </el-descriptions-item>
              <el-descriptions-item label="未读情报">
                {{ detailUnreadCount }}
              </el-descriptions-item>
            </el-descriptions>
          </section>

          <section class="drawer-section">
            <div class="section-title-row">
              <div>
                <h3>首次基线状态</h3>
                <p>第一次采集只建立快照基线；后续字段级变化才进入情报报告。</p>
              </div>
              <el-tag :type="detailHasBaseline ? 'success' : 'warning'" effect="light">
                {{ detailHasBaseline ? '已建立' : '未建立' }}
              </el-tag>
            </div>
            <div v-if="detailLatestTask" class="baseline-summary drawer-baseline-summary">
              <el-tag :type="taskStatusType(detailLatestTask.status)" effect="light">
                {{ taskStatusLabel(detailLatestTask.status) }}
              </el-tag>
              <span>{{ detailLatestTask.targetTitle }}</span>
              <span>{{ detailLatestTask.message }}</span>
            </div>
          </section>

          <section class="drawer-section">
            <div class="section-title-row">
              <div>
                <h3>待确认监控页</h3>
                <p>候选页保存时会验活，失败不会进入已监控目标。</p>
              </div>
              <div class="row-actions">
                <el-button size="small" :icon="Aim" :loading="discoveryLoading" @click="handleDetailRecommendTargets">
                  发现监控页
                </el-button>
                <el-button
                  v-if="detailDrafts.length"
                  size="small"
                  type="primary"
                  :disabled="detailSelectedDraftCount === 0"
                  :loading="startMonitoringLoading"
                  @click="handleDetailConfirmDrafts"
                >
                  保存已选
                </el-button>
              </div>
            </div>
            <el-empty v-if="detailDrafts.length === 0" description="暂无待确认监控页" />
            <div v-else class="drawer-candidate-list">
              <div v-for="draft in detailDrafts" :key="draftKey(draft)" class="drawer-candidate-row">
                <el-checkbox v-model="draft.selected" />
                <el-tag effect="plain">
                  {{ targetTypeLabels[draft.type] }}
                </el-tag>
                <div class="candidate-main">
                  <div class="candidate-meta">
                    <strong>{{ draft.title }}</strong>
                    <el-tag size="small" type="info" effect="plain">
                      {{ sourceLabel(draft.source) }}
                    </el-tag>
                    <el-tag size="small" :type="validationType(draft.validationStatus)" effect="light">
                      {{ validationLabel(draft.validationStatus) }}
                    </el-tag>
                  </div>
                  <el-input v-model="draft.url" />
                  <p>{{ draft.validationMessage }}</p>
                </div>
              </div>
            </div>
          </section>

          <section class="drawer-section">
            <div class="section-title-row">
              <h3>已监控目标</h3>
            </div>
            <el-table :data="detailTargets" height="220" empty-text="还没有已监控目标">
              <el-table-column label="目标" min-width="150" show-overflow-tooltip>
                <template #default="{ row }">
                  <el-link :href="row.url" target="_blank" :icon="Link" type="primary">
                    {{ row.title }}
                  </el-link>
                </template>
              </el-table-column>
              <el-table-column label="类型" width="86">
                <template #default="{ row }">
                  <el-tag effect="plain">
                    {{ targetTypeLabel(row.type) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="状态" width="86">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'active' ? 'success' : 'info'" effect="light">
                    {{ row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="{ row }">
                  <div class="row-actions">
                    <el-button size="small" @click="handleDetailCollect(row)">
                      采集
                    </el-button>
                    <el-button
                      size="small"
                      text
                      type="danger"
                      :icon="Delete"
                      :loading="deletingTargetId === row.id"
                      @click="handleDeleteTarget(row)"
                    >
                      删除
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </section>

          <section v-if="detailStartupRuns.length" class="drawer-section">
            <div class="section-title-row">
              <h3>首次采集进度</h3>
            </div>
            <div class="run-list">
              <div v-for="run in detailStartupRuns" :key="run.target.id" class="run-row">
                <el-tag :type="startupRunType(run.status)" effect="light">
                  {{ startupRunLabel(run.status) }}
                </el-tag>
                <strong>{{ run.target.title }}</strong>
                <span>{{ targetTypeLabels[run.target.type] }}</span>
                <el-link :href="run.target.url" target="_blank" :icon="Link">
                  {{ run.target.url }}
                </el-link>
                <p>{{ run.message }}</p>
              </div>
            </div>
          </section>

          <section class="drawer-section">
            <div class="section-title-row">
              <h3>该竞品情报报告</h3>
            </div>
            <el-table :data="detailReports" height="220" empty-text="还没有该竞品情报">
              <el-table-column prop="changeSummary" label="变化" min-width="220" show-overflow-tooltip />
              <el-table-column label="优先级" width="86">
                <template #default="{ row }">
                  <el-tag :type="priorityType(row.priority)" effect="light">
                    {{ priorityLabel(row.priority) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="证据" width="72">
                <template #default="{ row }">
                  {{ row.evidenceCount }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="90">
                <template #default="{ row }">
                  <el-button size="small" @click="openReport(row)">
                    打开
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </section>

          <section class="drawer-section">
            <div class="section-title-row">
              <h3>该竞品采集任务</h3>
            </div>
            <el-table :data="detailTasks" height="220" empty-text="暂无该竞品采集任务">
              <el-table-column prop="targetTitle" label="目标" min-width="160" show-overflow-tooltip />
              <el-table-column label="状态" width="86">
                <template #default="{ row }">
                  <el-tag :type="taskStatusType(row.status)" effect="light">
                    {{ taskStatusLabel(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="adapter" label="采集器" width="120" />
              <el-table-column prop="message" label="结果" min-width="180" show-overflow-tooltip />
            </el-table>
          </section>
        </template>
      </section>
    </el-drawer>

    <el-dialog
      v-model="competitorDialogVisible"
      align-center
      class="competitor-dialog"
      width="520px"
      title="添加竞品"
      @closed="resetCompetitorForm"
    >
      <el-form label-position="top" @submit.prevent="handleCreateCompetitor">
        <el-form-item label="竞品名称" required>
          <el-input v-model="competitorForm.name" placeholder="例如 Comet" />
        </el-form-item>
        <el-form-item label="官网 URL" required>
          <el-input v-model="competitorForm.homepage" placeholder="https://example.com" />
        </el-form-item>
        <el-form-item label="定位备注">
          <el-input
            v-model="competitorForm.positioning"
            :rows="3"
            type="textarea"
            placeholder="产品定位、目标客群或你关注它的原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="competitorDialogVisible = false">
            取消
          </el-button>
          <el-button type="primary" :icon="Plus" @click="handleCreateCompetitor">
            保存竞品
          </el-button>
        </div>
      </template>
    </el-dialog>
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

  display: block;
  min-height: 100%;
  padding: 20px;
  color: var(--ci-text);
  background: var(--ci-canvas);
  > * + * {
    margin-top: 16px;
  }
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
  flex-shrink: 0;
  :deep(.el-tabs__header) {
    padding: 0 6px;
    margin: 0 0 12px;
  }
  :deep(.el-tabs__content) {
    overflow: visible;
  }
}
.run-list {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}
.candidate-main {
  display: grid;
  gap: 8px;
  min-width: 0;
  p {
    margin: 0;
    font-size: 12px;
    color: var(--ci-text-muted);
  }
}
.candidate-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.run-row {
  display: grid;
  grid-template-columns: 96px 140px 76px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  padding: 12px;
  background: var(--ci-surface);
  border: 1px solid var(--ci-border-soft);
  border-radius: 8px;
  p {
    grid-column: 2 / -1;
    margin: 0;
    color: var(--ci-text-secondary);
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
.baseline-summary {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 8px 10px;
  align-items: center;
  width: 100%;
  max-width: 320px;
  padding: 10px 12px;
  margin: 12px auto;
  color: var(--ci-text-secondary);
  text-align: left;
  background: #f8fbff;
  border: 1px solid var(--ci-border-soft);
  border-radius: 8px;
  span:last-child {
    grid-column: 2;
    overflow: hidden;
    font-size: 12px;
    color: var(--ci-text-muted);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
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
.baseline-descriptions {
  :deep(.el-descriptions__content) {
    word-break: break-word;
  }
}
.baseline-result {
  padding: 14px;
  margin-top: 14px;
  background: var(--ci-surface);
  border: 1px solid var(--ci-border-soft);
  border-radius: 8px;
  h3 {
    margin: 0 0 8px;
    font-size: 15px;
    color: var(--ci-text);
  }
  p {
    margin: 0 0 12px;
    line-height: 1.65;
    color: var(--ci-text-secondary);
  }
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
.targets-layout,
.entities-layout {
  display: grid;
  grid-template-columns: minmax(300px, 380px) minmax(0, 1fr);
  gap: 14px;
  align-items: start;
}
.management-layout {
  grid-template-columns: minmax(0, 1fr);
}
.entities-layout {
  grid-template-columns: minmax(0, 1fr);
}
.tasks-layout {
  display: grid;
  gap: 14px;
}
.competitor-card {
  min-width: 0;
}
.task-filter-select {
  width: 180px;
}
.table-card:last-child {
  grid-column: 1 / -1;
}
.card-header {
  gap: 12px;
  justify-content: space-between;
  font-weight: 700;
}
.card-actions,
.dialog-footer {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
}
.card-actions {
  color: var(--ci-text-secondary);
  font-size: 13px;
  font-weight: 500;
}
.row-actions {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  white-space: nowrap;
}
.tooltip-button-wrap {
  display: inline-flex;
}
.form-card,
.table-card {
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
.drawer-workspace {
  display: grid;
  gap: 14px;
  min-height: 100%;
  color: var(--ci-text);
}
.drawer-header,
.section-title-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
}
.drawer-header {
  padding-bottom: 14px;
  border-bottom: 1px solid var(--ci-border-soft);
  h2 {
    margin: 0;
    font-size: 22px;
    line-height: 30px;
    letter-spacing: 0;
  }
}
.drawer-section {
  padding: 14px;
  background: var(--ci-surface);
  border: 1px solid var(--ci-border-soft);
  border-radius: 8px;
}
.section-title-row {
  margin-bottom: 12px;
  h3 {
    margin: 0;
    font-size: 16px;
    line-height: 24px;
    letter-spacing: 0;
  }
  p {
    margin: 4px 0 0;
    line-height: 20px;
    color: var(--ci-text-secondary);
  }
}
.drawer-baseline-summary {
  max-width: none;
  margin: 0;
}
.drawer-candidate-list {
  display: grid;
  gap: 10px;
}
.drawer-candidate-row {
  display: grid;
  grid-template-columns: 28px 78px minmax(0, 1fr);
  gap: 10px;
  align-items: flex-start;
  padding: 12px;
  background: var(--ci-surface-raised);
  border: 1px solid var(--ci-border-soft);
  border-radius: 8px;
}
:deep(.competitor-dialog) {
  .el-dialog__header {
    padding-bottom: 12px;
    margin-right: 0;
    border-bottom: 1px solid var(--ci-border-soft);
  }
  .el-dialog__body {
    padding: 18px 20px 4px;
  }
  .el-dialog__footer {
    padding: 14px 20px 18px;
  }
}

@media (width <= 980px) {
  .workbench-grid,
  .management-layout,
  .targets-layout,
  .entities-layout,
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
  .run-row {
    grid-template-columns: 1fr;
  }
  .run-row p {
    grid-column: auto;
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
  .detail-actions,
  .drawer-header,
  .section-title-row {
    flex-direction: column;
    justify-content: flex-start;
  }
  .drawer-candidate-row {
    grid-template-columns: 1fr;
  }
}
</style>
