# Competitor Drilldown Intelligence Workbench Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the competitive intelligence UI into a competitor-list-driven drilldown workbench with scoped targets, first collection baselines, reports, and task runs.

**Architecture:** Keep `/intelligence` as the route for this iteration, but reshape the page as a split-view: competitor list plus selected competitor detail. Add optional backend query parameters for competitor-scoped reports and tasks, then make frontend state derive from `selectedCompetitorId` instead of global tabs.

**Tech Stack:** Vue 3 `<script setup>`, TypeScript, Element Plus, RuoYi request helpers, Spring Boot controller/service in `nova-backend`, Java records for DTOs.

## Global Constraints

- OpenSpec change: `competitor-drilldown-intelligence-workbench`.
- Design doc: `docs/superpowers/specs/2026-07-07-competitor-drilldown-intelligence-workbench-design.md`.
- Base ref before implementation: `eaea117bce4fe7dbccb33fcc71ff2962dbc7f65e`.
- Keep `/intelligence` as the only required route in this iteration.
- Do not introduce mock fallback data in the real page.
- Failed validation pages MUST NOT become active monitor targets.
- Use user-facing copy: `待确认监控页`, `待加入监控页`, `已监控目标`, `首次基线`.
- Preserve global report access only as secondary `全部情报`; do not keep a global task tab as a primary UI.
- Backend report/task `competitorId` query parameters must be optional and preserve current global behavior when omitted.

---

## File Structure

- Modify `src/api/intelligence/index.ts`: add optional `competitorId` parameters to `listInboxReports` and `listTaskRuns`.
- Modify `src/pages/intelligence/index.vue`: replace global tabs-first UI with competitor list + selected competitor detail, using scoped state and copy.
- Modify `/Users/kongdecheng/workspace/nova/nova-backend/nova-modules/nova-intelligence/src/main/java/org/ruoyi/intelligence/controller/IntelligenceController.java`: accept optional `competitorId` on report/task list endpoints.
- Modify `/Users/kongdecheng/workspace/nova/nova-backend/nova-modules/nova-intelligence/src/main/java/org/ruoyi/intelligence/service/IntelligenceService.java`: implement `listInbox(Long competitorId)` and `listTasks(Long competitorId)`.
- Update `openspec/changes/competitor-drilldown-intelligence-workbench/tasks.md`: check each completed task after validation.

---

### Task 1: Add Competitor-Scoped Report And Task APIs

**Files:**
- Modify: `src/api/intelligence/index.ts`
- Modify: `/Users/kongdecheng/workspace/nova/nova-backend/nova-modules/nova-intelligence/src/main/java/org/ruoyi/intelligence/controller/IntelligenceController.java`
- Modify: `/Users/kongdecheng/workspace/nova/nova-backend/nova-modules/nova-intelligence/src/main/java/org/ruoyi/intelligence/service/IntelligenceService.java`
- Modify: `openspec/changes/competitor-drilldown-intelligence-workbench/tasks.md`

**Interfaces:**
- Consumes: existing `ReportSummaryVo`, `TaskRunVo`, `MonitorTargetVo`.
- Produces:
  - `listInboxReports(competitorId?: number): Promise<ReportSummaryVo[]>`
  - `listTaskRuns(competitorId?: number): Promise<TaskRunVo[]>`
  - `IntelligenceService.listInbox(Long competitorId)`
  - `IntelligenceService.listTasks(Long competitorId)`

- [ ] **Step 1: Update frontend API signatures**

Change `src/api/intelligence/index.ts`:

```ts
export function listInboxReports(competitorId?: number) {
  return unwrap<ReportSummaryVo[]>(get<ReportSummaryVo[]>('/intelligence/reports/inbox', competitorId ? { competitorId } : undefined).json());
}

export function listTaskRuns(competitorId?: number) {
  return unwrap<TaskRunVo[]>(get<TaskRunVo[]>('/intelligence/tasks', competitorId ? { competitorId } : undefined).json());
}
```

- [ ] **Step 2: Update backend controller**

Change `IntelligenceController`:

```java
@GetMapping("/reports/inbox")
public R<List<ReportSummaryVo>> listInboxReports(@RequestParam(required = false) Long competitorId) {
    return R.ok(intelligenceService.listInbox(competitorId));
}

@GetMapping("/tasks")
public R<List<TaskRunVo>> listTaskRuns(@RequestParam(required = false) Long competitorId) {
    return R.ok(intelligenceService.listTasks(competitorId));
}
```

- [ ] **Step 3: Update backend service filtering**

Change `IntelligenceService`:

```java
public List<ReportSummaryVo> listInbox(Long competitorId) {
    return reports.values().stream()
        .filter(report -> competitorId == null || Objects.equals(report.competitorId(), competitorId))
        .map(this::toSummary)
        .sorted(Comparator.comparing(ReportSummaryVo::createdAt).reversed())
        .toList();
}

public List<TaskRunVo> listTasks(Long competitorId) {
    return tasks.values().stream()
        .filter(task -> {
            if (competitorId == null) {
                return true;
            }
            MonitorTargetVo target = targets.get(task.targetId());
            return target != null && Objects.equals(target.competitorId(), competitorId);
        })
        .sorted(Comparator.comparing(TaskRunVo::startedAt).reversed())
        .toList();
}
```

Also change `analyze` to call `listInbox(null).stream().limit(5).toList()`.

- [ ] **Step 4: Run focused verification**

Run:

```bash
cd /Users/kongdecheng/workspace/nova/nova-web
pnpm build
```

Expected: frontend build passes or fails only on pre-existing unrelated issues that must be recorded before continuing.

- [ ] **Step 5: Mark OpenSpec tasks and commit**

Check off:

```text
3.2 Scope task run lists to the selected competitor by target relation or backend query parameter.
3.3 Add minimal report/task `competitorId` query support only if frontend scoping is unreliable.
```

Commit frontend and backend changes separately if they are separate git repositories:

```bash
cd /Users/kongdecheng/workspace/nova/nova-web
git add src/api/intelligence/index.ts openspec/changes/competitor-drilldown-intelligence-workbench/tasks.md
git commit -m "feat: scope intelligence api reads by competitor"

cd /Users/kongdecheng/workspace/nova/nova-backend
git add nova-modules/nova-intelligence/src/main/java/org/ruoyi/intelligence/controller/IntelligenceController.java nova-modules/nova-intelligence/src/main/java/org/ruoyi/intelligence/service/IntelligenceService.java
git commit -m "feat: filter intelligence reports and tasks by competitor"
```

### Task 2: Reshape Frontend State Around Selected Competitor

**Files:**
- Modify: `src/pages/intelligence/index.vue`
- Modify: `openspec/changes/competitor-drilldown-intelligence-workbench/tasks.md`

**Interfaces:**
- Consumes:
  - `listCompetitors()`
  - `listMonitorTargets(competitorId?: number)`
  - `listInboxReports(competitorId?: number)`
  - `listTaskRuns(competitorId?: number)`
- Produces:
  - explicit `selectedCompetitorId`
  - `selectedCompetitor`
  - `selectedTargets`
  - `selectedReports`
  - `selectedTasks`
  - competitor-keyed `draftsByCompetitor` and `startupRunsByCompetitor`

- [ ] **Step 1: Replace implicit first-competitor selection**

In `src/pages/intelligence/index.vue`, replace:

```ts
const selectedCompetitorId = computed(() => competitors.value[0]?.id);
```

with:

```ts
const selectedCompetitorId = ref<number>();
const selectedCompetitor = computed(() => competitors.value.find(item => item.id === selectedCompetitorId.value));
```

- [ ] **Step 2: Add selected competitor helper**

Add:

```ts
function selectCompetitor(id?: number) {
  selectedCompetitorId.value = id;
  if (!selectedReport.value || selectedReport.value.competitorId !== id) {
    selectedReport.value = null;
  }
}
```

After `loadWorkbench()` loads competitors, call:

```ts
if (!selectedCompetitorId.value || !competitorData.some(item => item.id === selectedCompetitorId.value)) {
  selectCompetitor(competitorData[0]?.id);
}
```

- [ ] **Step 3: Key drafts and startup runs by competitor**

Replace global arrays with maps:

```ts
const draftsByCompetitor = ref<Record<number, DraftTarget[]>>({});
const startupRunsByCompetitor = ref<Record<number, Array<{
  target: MonitorTargetVo;
  status: 'waiting' | 'collecting' | 'baseline' | 'failed';
  message: string;
}>>>({});

const selectedDrafts = computed(() => selectedCompetitorId.value ? draftsByCompetitor.value[selectedCompetitorId.value] || [] : []);
const selectedStartupRuns = computed(() => selectedCompetitorId.value ? startupRunsByCompetitor.value[selectedCompetitorId.value] || [] : []);
```

Update draft writes through helper functions:

```ts
function setSelectedDrafts(value: DraftTarget[]) {
  if (!selectedCompetitorId.value) {
    return;
  }
  draftsByCompetitor.value = {
    ...draftsByCompetitor.value,
    [selectedCompetitorId.value]: value,
  };
}

function setSelectedStartupRuns(value: Array<{ target: MonitorTargetVo; status: 'waiting' | 'collecting' | 'baseline' | 'failed'; message: string }>) {
  if (!selectedCompetitorId.value) {
    return;
  }
  startupRunsByCompetitor.value = {
    ...startupRunsByCompetitor.value,
    [selectedCompetitorId.value]: value,
  };
}
```

- [ ] **Step 4: Load detail data by selected competitor**

Create:

```ts
async function loadSelectedCompetitorDetail() {
  if (!selectedCompetitorId.value) {
    targets.value = [];
    reports.value = [];
    tasks.value = [];
    selectedReport.value = null;
    return;
  }
  const [targetData, reportData, taskData] = await Promise.all([
    listMonitorTargets(selectedCompetitorId.value),
    listInboxReports(selectedCompetitorId.value),
    listTaskRuns(selectedCompetitorId.value),
  ]);
  targets.value = targetData;
  reports.value = reportData;
  tasks.value = taskData;
  selectedReport.value = reportData[0] ? await getReportDetail(reportData[0].id) : null;
}
```

Call it after selecting a competitor and after create/delete/collect actions.

- [ ] **Step 5: Mark OpenSpec tasks and commit**

Check off:

```text
1.2 Add selected-competitor state and derive detail data from the selected competitor.
1.3 Ensure switching competitors clears or refreshes stale target, task, report, and draft state.
```

Commit:

```bash
git add src/pages/intelligence/index.vue openspec/changes/competitor-drilldown-intelligence-workbench/tasks.md
git commit -m "feat: scope intelligence state by competitor"
```

### Task 3: Build Competitor List And Detail Split-View

**Files:**
- Modify: `src/pages/intelligence/index.vue`
- Modify: `openspec/changes/competitor-drilldown-intelligence-workbench/tasks.md`

**Interfaces:**
- Consumes: state from Task 2.
- Produces: list-first UI, selected competitor detail, secondary `全部情报` entry.

- [ ] **Step 1: Replace primary tabs with split layout**

Replace the main `el-tabs` shell with:

```vue
<section class="drilldown-layout">
  <aside class="surface competitor-list-pane">
    <div class="pane-header">
      <div>
        <span class="eyebrow">Competitors</span>
        <h2>竞品列表</h2>
      </div>
      <el-button type="primary" :icon="Plus" @click="openCompetitorDialog">
        添加竞品
      </el-button>
    </div>

    <button
      v-for="competitor in competitors"
      :key="competitor.id"
      class="competitor-list-item"
      :class="{ 'is-active': selectedCompetitorId === competitor.id }"
      @click="selectCompetitor(competitor.id)"
    >
      <strong>{{ competitor.name }}</strong>
      <span>{{ competitor.positioning || competitor.homepage }}</span>
      <small>{{ competitor.targetCount }} 个目标 · {{ competitor.unreadReportCount }} 条未读</small>
    </button>
  </aside>

  <section class="competitor-detail-pane">
    <article v-if="selectedCompetitor" class="surface competitor-detail-header">
      <span class="eyebrow">Competitor Detail</span>
      <h2>{{ selectedCompetitor.name }}</h2>
      <p>{{ selectedCompetitor.positioning || '暂无定位备注' }}</p>
    </article>
    <el-empty v-else description="先添加一个竞品" />
  </section>
</section>
```

- [ ] **Step 2: Add detail empty state**

When no competitor is selected, show:

```vue
<el-empty description="先添加一个竞品">
  <el-button type="primary" :icon="Plus" @click="openCompetitorDialog">
    添加竞品
  </el-button>
</el-empty>
```

- [ ] **Step 3: Add competitor detail header**

Use `selectedCompetitor` and selected scoped counts:

```vue
<article v-if="selectedCompetitor" class="surface competitor-detail-header">
  <span class="eyebrow">Competitor Detail</span>
  <h2>{{ selectedCompetitor.name }}</h2>
  <el-link :href="selectedCompetitor.homepage" target="_blank" :icon="Link">
    {{ selectedCompetitor.homepage }}
  </el-link>
  <p>{{ selectedCompetitor.positioning }}</p>
  <el-button type="primary" :loading="discoveryLoading || startMonitoringLoading || actionLoading" @click="handleDetailPrimaryAction">
    {{ selectedOverviewState.primaryLabel }}
  </el-button>
</article>
```

- [ ] **Step 4: Keep secondary `全部情报`**

Add a small secondary button or drawer entry:

```vue
<el-button :icon="Collection" @click="allReportsVisible = true">
  全部情报
</el-button>
```

The all-reports list must show competitor names and call:

```ts
async function openGlobalReport(report: ReportSummaryVo) {
  selectCompetitor(report.competitorId);
  await loadSelectedCompetitorDetail();
  await openReport(report);
  allReportsVisible.value = false;
}
```

- [ ] **Step 5: Update responsive CSS**

Add stable split-view rules:

```scss
.drilldown-layout {
  display: grid;
  grid-template-columns: minmax(260px, 340px) minmax(0, 1fr);
  gap: 16px;
  min-height: 0;
}

.competitor-list-pane,
.competitor-detail-pane {
  min-width: 0;
}

@media (max-width: 960px) {
  .drilldown-layout {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 6: Mark OpenSpec tasks and commit**

Check off:

```text
1.1 Replace the global tabs-first default with a competitor-list-first workbench entry.
1.4 Keep global report/task access secondary and label it as cross-competitor.
2.1 Build the selected competitor detail layout with overview, targets, collection, reports, and tasks sections.
```

Commit:

```bash
git add src/pages/intelligence/index.vue openspec/changes/competitor-drilldown-intelligence-workbench/tasks.md
git commit -m "feat: add competitor drilldown layout"
```

### Task 4: Move Target Discovery And First Collection Into Detail

**Files:**
- Modify: `src/pages/intelligence/index.vue`
- Modify: `openspec/changes/competitor-drilldown-intelligence-workbench/tasks.md`

**Interfaces:**
- Consumes: selected competitor state from Task 2 and layout from Task 3.
- Produces: scoped `待确认监控页`, `已监控目标`, first-collection progress, baseline state.

- [ ] **Step 1: Update recommendation action to require selected competitor**

Change `handleRecommendTargets` to use selected competitor by default:

```ts
async function handleRecommendTargets(competitorArg?: CompetitorVo) {
  const competitor = competitorArg || selectedCompetitor.value;
  if (!competitor) {
    ElMessage.warning('先选择或添加一个竞品');
    return;
  }
  discoveryLoading.value = true;
  try {
    const recommended = await recommendMonitorTargets({
      competitorId: competitor.id,
      homepage: competitor.homepage,
    });
    selectCompetitor(competitor.id);
    setSelectedDrafts(recommended.map(toDraftTarget));
  }
  catch (error) {
    ElMessage.error(errorMessage(error, '监控页发现失败'));
  }
  finally {
    discoveryLoading.value = false;
  }
}
```

- [ ] **Step 2: Update create competitor flow**

After creating the competitor:

```ts
competitors.value.unshift(created);
selectCompetitor(created.id);
resetCompetitorForm();
competitorDialogVisible.value = false;
ElMessage.success('竞品已添加');
await handleRecommendTargets(created);
```

- [ ] **Step 3: Render `待确认监控页` section**

Use selected drafts only:

```vue
<section class="surface detail-section" v-if="selectedDrafts.length">
  <div class="section-header">
    <div>
      <span class="eyebrow">Pages To Confirm</span>
      <h3>待确认监控页</h3>
      <p>保存时会验活，通过后才会进入已监控目标。</p>
    </div>
    <el-button type="primary" :disabled="selectedDraftCount === 0" :loading="startMonitoringLoading" @click="handleStartMonitoring">
      开始监控
    </el-button>
  </div>
</section>
```

- [ ] **Step 4: Render `已监控目标` section**

Use selected targets:

```vue
<section class="surface detail-section">
  <div class="section-header">
    <h3>已监控目标</h3>
    <el-button :icon="Aim" @click="handleRecommendTargets">
      发现监控页
    </el-button>
  </div>
  <el-table :data="targets" empty-text="还没有已监控目标">
    <!-- keep type, URL, last collected, collect, delete columns -->
  </el-table>
</section>
```

- [ ] **Step 5: Scope save and collection to selected competitor**

In `handleConfirmDrafts`, replace reads/writes of `drafts.value` with `selectedDrafts.value` and `setSelectedDrafts(...)`. In `handleStartMonitoring`, write startup progress with `setSelectedStartupRuns(...)`, then refresh selected detail data with `await loadSelectedCompetitorDetail()`.

- [ ] **Step 6: Mark OpenSpec tasks and commit**

Check off:

```text
2.2 Move target recommendation into the selected competitor detail.
2.3 Rename candidate target UI copy to `待确认监控页` or `待加入监控页`.
2.4 Keep failed validation pages out of active targets and make removal, edit, or retry visible.
2.5 Run first monitoring from competitor detail by saving selected validated pages and collecting all saved active targets.
2.6 Show per-target first collection progress and `首次基线` status under the selected competitor.
```

Commit:

```bash
git add src/pages/intelligence/index.vue openspec/changes/competitor-drilldown-intelligence-workbench/tasks.md
git commit -m "feat: scope monitoring start to competitor detail"
```

### Task 5: Scope Reports, Evidence Detail, And Tasks To Competitor Detail

**Files:**
- Modify: `src/pages/intelligence/index.vue`
- Modify: `openspec/changes/competitor-drilldown-intelligence-workbench/tasks.md`

**Interfaces:**
- Consumes: scoped APIs from Task 1 and selected state from Task 2.
- Produces: competitor-scoped reports/tasks sections and evidence-first detail.

- [ ] **Step 1: Replace report tab with detail section**

Inside `CompetitorDetailPane`, add:

```vue
<section class="surface detail-section">
  <div class="section-header">
    <h3>情报报告</h3>
    <span>{{ reports.length }} 条</span>
  </div>
  <el-empty v-if="!reports.length" description="还没有该竞品的情报报告">
    <template #description>
      <span>首次采集会建立结构化快照基线；后续字段级变化才会进入情报报告。</span>
    </template>
  </el-empty>
  <button v-for="report in filteredReports" :key="report.id" class="report-row" @click="openReport(report)">
    <!-- keep priority, evidence count, confidence, created time -->
  </button>
</section>
```

- [ ] **Step 2: Keep evidence-first detail in the selected context**

Move the existing report detail article below or beside the selected report list. Keep:

```vue
<span class="eyebrow">{{ selectedReport.competitorName }} / {{ targetTypeLabels[selectedReport.targetType] }}</span>
```

Keep evidence Diff before analysis/actions.

- [ ] **Step 3: Replace global task tab with detail section**

Add:

```vue
<section class="surface detail-section">
  <div class="section-header">
    <h3>采集任务</h3>
    <span>{{ tasks.length }} 条</span>
  </div>
  <el-table :data="tasks" empty-text="暂无该竞品采集任务">
    <!-- keep target, status, adapter, message, started time columns -->
  </el-table>
</section>
```

- [ ] **Step 4: Remove primary global task tab**

Delete the `el-tab-pane label="任务记录"` primary tab from the main workbench UI. Do not remove task table behavior; it now lives under selected competitor detail.

- [ ] **Step 5: Mark OpenSpec tasks and commit**

Check off:

```text
3.1 Scope report lists and report detail entry to the selected competitor.
3.4 Preserve evidence-first report detail, feedback, and knowledge writeback actions in the competitor context.
```

Commit:

```bash
git add src/pages/intelligence/index.vue openspec/changes/competitor-drilldown-intelligence-workbench/tasks.md
git commit -m "feat: show reports and tasks in competitor detail"
```

### Task 6: Verify Build And Browser Flow

**Files:**
- Modify: `openspec/changes/competitor-drilldown-intelligence-workbench/tasks.md`

**Interfaces:**
- Consumes: completed implementation from Tasks 1-5.
- Produces: verified build and browser smoke notes in task completion commits.

- [ ] **Step 1: Run frontend build**

Run:

```bash
cd /Users/kongdecheng/workspace/nova/nova-web
pnpm build
```

Expected: command exits 0.

- [ ] **Step 2: Start or reuse local dev servers**

If no servers are running, start the backend and frontend according to existing project practice. For frontend:

```bash
cd /Users/kongdecheng/workspace/nova/nova-web
pnpm dev --host 127.0.0.1
```

Expected: Vite prints a local URL.

- [ ] **Step 3: Browser verify first-use drilldown**

Use a documented sample site such as `piccopilot.com` from `/Users/kongdecheng/workspace/nova/doc/competitive-intelligence-target-sites.yaml`.

Browser flow:

```text
Open /intelligence
Click 添加竞品
Name: Pic Copilot
Homepage: https://piccopilot.com
Save
Confirm new competitor is selected
Confirm 待确认监控页 appears
Click 开始监控
Confirm per-target progress appears
Confirm 首次基线 or report state appears inside that competitor detail
```

- [ ] **Step 4: Browser verify competitor switch isolation**

Browser flow:

```text
Add or select a second competitor
Trigger target discovery
Switch back to the first competitor
Confirm second competitor drafts are not visible
Confirm targets/tasks/reports are scoped to selected competitor
```

- [ ] **Step 5: Browser verify secondary all-reports path**

Browser flow:

```text
Open 全部情报
Confirm rows show competitor names
Open a report row
Confirm related competitor becomes selected
Confirm report detail opens in that competitor context
```

- [ ] **Step 6: Mark verification tasks and commit**

Check off:

```text
4.1 Run frontend type/build verification.
4.2 Browser verify add competitor -> select competitor detail -> discover pages -> start monitoring -> baseline state.
4.3 Browser verify switching competitors does not leak targets, tasks, or reports from the previous competitor.
4.4 Browser verify a documented sample site from `/Users/kongdecheng/workspace/nova/doc/competitive-intelligence-target-sites.yaml` still reaches the first-collection path.
```

Commit:

```bash
git add openspec/changes/competitor-drilldown-intelligence-workbench/tasks.md
git commit -m "test: verify competitor drilldown intelligence flow"
```
