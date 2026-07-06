<!-- 公共聊天输入框组件 -->
<script setup lang="ts">
import type { FilesCardProps } from 'vue-element-plus-x/types/FilesCard';
import { nextTick, ref, watch } from 'vue';
import { Sender } from 'vue-element-plus-x';
import { getKnowledgeList } from '@/api/chat';
import FilesSelect from '@/components/FilesSelect/index.vue';
import ModelSelect from '@/components/ModelSelect/index.vue';
import { useChatStore } from '@/stores/modules/chat';
import { useFilesStore } from '@/stores/modules/files';

type AgentToolMode = 'auto' | 'disabled' | 'selected' | 'direct';

interface AgentToolOption {
  name: string;
  label: string;
  description: string;
}

interface AgentToolModeOption {
  label: string;
  value: AgentToolMode;
  description: string;
}

const props = defineProps<{
  modelValue?: string;
  loading?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'submit': [content: string];
  'cancel': [];
}>();

const chatStore = useChatStore();
const filesStore = useFilesStore();

const senderValue = computed({
  get: () => props.modelValue || '',
  set: val => emit('update:modelValue', val),
});

const senderRef = ref<InstanceType<typeof Sender> | null>(null);

// 推理开关状态
const isReasoningEnabled = ref(false);

const agentToolMode = ref<AgentToolMode>('auto');
const selectedAgentTools = ref<string[]>([]);
const directTableName = ref('');
const directSql = ref('');
const toolPopoverRef = ref();

const agentToolOptions: AgentToolOption[] = [
  {
    name: 'query_all_tables',
    label: '查询所有表',
    description: '读取允许访问的数据库表清单',
  },
  {
    name: 'query_table_schema',
    label: '查询表结构',
    description: '读取指定表的建表结构',
  },
  {
    name: 'execute_readonly_sql',
    label: '只读 SQL',
    description: '执行 SELECT、SHOW、DESC、EXPLAIN 等只读语句',
  },
];

const agentToolModeOptions: AgentToolModeOption[] = [
  {
    label: '自动',
    value: 'auto',
    description: '模型按需要自动选择可用工具。',
  },
  {
    label: '禁用',
    value: 'disabled',
    description: '本轮只聊天，不开放工具。',
  },
  {
    label: '限定',
    value: 'selected',
    description: '模型仍会判断是否调用工具，但只能使用你勾选的范围。',
  },
  {
    label: '运行',
    value: 'direct',
    description: '不走模型决策，直接运行所选工具；输入框只作为备注。',
  },
];

function getToolModeOptionLabel(item: unknown) {
  if (typeof item === 'string') {
    return item;
  }
  return (item as Partial<AgentToolModeOption>).label || '';
}

function getToolModeOptionDescription(item: unknown) {
  if (typeof item === 'string') {
    return '';
  }
  return (item as Partial<AgentToolModeOption>).description || '';
}

const selectedAgentTool = computed({
  get: () => selectedAgentTools.value[0] || '',
  set: (value: string) => {
    selectedAgentTools.value = value ? [value] : [];
  },
});

const isToolRunMode = computed(() => agentToolMode.value === 'direct');

const selectedToolLabel = computed(() => {
  if (agentToolMode.value === 'auto') {
    return '工具自动';
  }
  if (agentToolMode.value === 'disabled') {
    return '工具禁用';
  }
  if (agentToolMode.value === 'direct') {
    const option = agentToolOptions.find(item => item.name === selectedAgentTool.value);
    return option ? `运行 ${option.label}` : '运行工具';
  }
  if (!selectedAgentTools.value.length) {
    return '限定工具';
  }
  return `限定 ${selectedAgentTools.value.length} 个`;
});

const senderPlaceholder = computed(() => {
  if (isToolRunMode.value) {
    return '可选：补充本次工具运行的备注';
  }
  return '请输入内容';
});

const directToolReady = computed(() => {
  if (!isToolRunMode.value) {
    return true;
  }
  if (!selectedAgentTool.value) {
    return false;
  }
  if (selectedAgentTool.value === 'query_table_schema') {
    return Boolean(directTableName.value.trim());
  }
  if (selectedAgentTool.value === 'execute_readonly_sql') {
    return Boolean(directSql.value.trim());
  }
  return true;
});

const submitButtonDisabled = computed(() => {
  if (agentToolMode.value === 'selected' && selectedAgentTools.value.length === 0) {
    return true;
  }
  return isToolRunMode.value && !directToolReady.value;
});

const directToolSubmitContent = computed(() => {
  const option = agentToolOptions.find(item => item.name === selectedAgentTool.value);
  return option ? `运行工具：${option.label}` : '运行工具';
});

const toolArgs = computed(() => {
  if (agentToolMode.value !== 'direct') {
    return undefined;
  }
  if (selectedAgentTool.value === 'query_table_schema') {
    return { tableName: directTableName.value.trim() };
  }
  if (selectedAgentTool.value === 'execute_readonly_sql') {
    return { sql: directSql.value.trim() };
  }
  return {};
});

watch(agentToolMode, (mode) => {
  if (mode !== 'auto') {
    isReasoningEnabled.value = true;
  }
  if (mode === 'auto' || mode === 'disabled') {
    selectedAgentTools.value = [];
  }
  if (mode === 'direct' && selectedAgentTools.value.length > 1) {
    selectedAgentTools.value = [selectedAgentTools.value[0]];
  }
  if (mode === 'direct' && !selectedAgentTool.value) {
    selectedAgentTool.value = agentToolOptions[0].name;
  }
});

// 知识库列表配置
const knowledgeList = ref<any[]>([]);

// 知识库弹窗状态
const knowledgePopoverRef = ref();
const selectedKnowledgeId = ref<string>('');
const selectedKnowledgeName = ref<string>('知识库');

// 加载知识库列表
async function loadKnowledgeList() {
  try {
    const response = await getKnowledgeList();
    if (response?.rows && Array.isArray(response.rows)) {
      knowledgeList.value = response.rows.map((item: any) => ({
        id: item.id,
        name: item.name,
        icon: 'Document',
      }));
    }
  }
  catch (error) {
    console.error('Failed to load knowledge list:', error);
  }
}

// 插入知识库标签
function insertKnowledgeTag(knowledgeId: string) {
  const knowledge = knowledgeList.value.find(k => k.id === knowledgeId);
  if (knowledge) {
    selectedKnowledgeId.value = knowledgeId;
    selectedKnowledgeName.value = knowledge.name;
    chatStore.setKnowledgeId(knowledgeId);
    // 关闭弹窗
    knowledgePopoverRef.value?.hide();
  }
}

// 清除知识库选择
function clearKnowledgeSelection() {
  selectedKnowledgeId.value = '';
  selectedKnowledgeName.value = '知识库';
  chatStore.setKnowledgeId('');
}

function handleSubmit() {
  if (agentToolMode.value === 'selected' && selectedAgentTools.value.length === 0) {
    ElMessage.warning('请至少选择一个可用工具');
    return;
  }
  if (isToolRunMode.value && !directToolReady.value) {
    ElMessage.warning('请先选择工具并填写必填参数');
    return;
  }
  const content = isToolRunMode.value && !senderValue.value.trim()
    ? directToolSubmitContent.value
    : senderValue.value;
  emit('submit', content);
}

function handleCancel() {
  emit('cancel');
}

function handleDeleteCard(_item: FilesCardProps, index: number) {
  filesStore.deleteFileByIndex(index);
}

// 暴露方法供父组件调用
function openHeader() {
  nextTick(() => {
    senderRef.value?.openHeader();
  });
}

function closeHeader() {
  nextTick(() => {
    senderRef.value?.closeHeader();
  });
}

watch(
  () => filesStore.filesList.length,
  (val) => {
    if (val > 0) {
      openHeader();
    }
    else {
      closeHeader();
    }
  },
);

// 从 store 中同步知识库选择状态
watch(
  () => chatStore.knowledgeId,
  (id) => {
    if (id) {
      const knowledge = knowledgeList.value.find(k => k.id === id);
      if (knowledge) {
        selectedKnowledgeId.value = id;
        selectedKnowledgeName.value = knowledge.name;
      }
    }
    else {
      selectedKnowledgeId.value = '';
      selectedKnowledgeName.value = '知识库';
    }
  },
);

// 组件挂载时加载知识库列表
onMounted(() => {
  loadKnowledgeList();
  // 从 store 中同步知识库选择状态
  if (chatStore.knowledgeId) {
    const knowledge = knowledgeList.value.find(k => k.id === chatStore.knowledgeId);
    if (knowledge) {
      selectedKnowledgeId.value = chatStore.knowledgeId;
      selectedKnowledgeName.value = knowledge.name;
    }
  }
});

defineExpose({
  openHeader,
  closeHeader,
  isReasoningEnabled,
  agentToolMode,
  selectedAgentTools,
  directTableName,
  directSql,
  toolArgs,
});
</script>

<template>
  <Sender
    ref="senderRef"
    v-model="senderValue"
    class="chat-sender"
    :auto-size="{
      maxRows: 6,
      minRows: 3,
    }"
    variant="updown"
    clearable
    allow-speech
    :placeholder="senderPlaceholder"
    :loading="loading"
    :submit-btn-disabled="submitButtonDisabled"
    @submit="handleSubmit"
    @cancel="handleCancel"
  >
    <template #header>
      <div class="sender-header p-12px pt-6px pb-0px">
        <Attachments
          :items="filesStore.filesList"
          :hide-upload="true"
          @delete-card="handleDeleteCard"
        >
          <template #prev-button="{ show, onScrollLeft }">
            <div
              v-if="show"
              class="prev-next-btn left-8px flex-center w-22px h-22px rounded-8px border-1px border-solid border-[rgba(0,0,0,0.08)] c-[rgba(0,0,0,.4)] hover:bg-#f3f4f6 bg-#fff font-size-10px"
              @click="onScrollLeft"
            >
              <el-icon>
                <ArrowLeftBold />
              </el-icon>
            </div>
          </template>

          <template #next-button="{ show, onScrollRight }">
            <div
              v-if="show"
              class="prev-next-btn right-8px flex-center w-22px h-22px rounded-8px border-1px border-solid border-[rgba(0,0,0,0.08)] c-[rgba(0,0,0,.4)] hover:bg-#f3f4f6 bg-#fff font-size-10px"
              @click="onScrollRight"
            >
              <el-icon>
                <ArrowRightBold />
              </el-icon>
            </div>
          </template>
        </Attachments>
      </div>
    </template>
    <template #prefix>
      <div class="sender-prefix-container">
        <!-- 左侧按钮组 -->
        <div class="left-buttons">
          <ModelSelect />

          <!-- 知识库选择下拉菜单 -->
          <el-popover
            ref="knowledgePopoverRef"
            placement="top-start"
            :width="280"
            trigger="click"
            popper-class="knowledge-popover"
          >
            <template #default>
              <div class="knowledge-list-container">
                <div class="knowledge-list-header">
                  <span>选择知识库</span>
                  <button class="clear-btn" @click="clearKnowledgeSelection">
                    取消选择
                  </button>
                </div>
                <div class="knowledge-list">
                  <div
                    v-for="item in knowledgeList"
                    :key="item.id"
                    class="knowledge-item"
                    :class="{ 'is-selected': selectedKnowledgeId === item.id }"
                    @click="insertKnowledgeTag(item.id)"
                  >
                    <div class="item-name">
                      <el-icon>
                        <component :is="item.icon" />
                      </el-icon>
                      {{ item.name }}
                      <el-icon v-if="selectedKnowledgeId === item.id" class="item-check">
                        <Check />
                      </el-icon>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <template #reference>
              <div class="action-btn knowledge-btn" :class="{ active: selectedKnowledgeId }">
                <el-icon class="action-icon">
                  <DocumentCopy />
                </el-icon>
                <span class="action-text">{{ selectedKnowledgeName }}</span>
              </div>
            </template>
          </el-popover>

          <!-- 智能推理按钮 -->
          <div
            class="action-btn"
            :class="{ active: isReasoningEnabled }"
            @click="isReasoningEnabled = !isReasoningEnabled"
          >
            <el-icon class="action-icon">
              <Operation />
            </el-icon>
            <span class="action-text">智能推理</span>
          </div>

          <el-popover
            ref="toolPopoverRef"
            placement="top-start"
            :width="340"
            trigger="click"
            popper-class="agent-tool-popover"
          >
            <template #default>
              <div class="agent-tool-panel">
                <el-segmented
                  v-model="agentToolMode"
                  class="tool-mode-segmented"
                  :options="agentToolModeOptions"
                >
                  <template #default="{ item }">
                    <el-tooltip
                      :content="getToolModeOptionDescription(item)"
                      placement="top"
                      :show-after="250"
                    >
                      <span class="tool-mode-option-label">{{ getToolModeOptionLabel(item) }}</span>
                    </el-tooltip>
                  </template>
                </el-segmented>

                <el-checkbox-group
                  v-if="agentToolMode === 'selected'"
                  v-model="selectedAgentTools"
                  class="tool-list"
                >
                  <el-checkbox
                    v-for="tool in agentToolOptions"
                    :key="tool.name"
                    :value="tool.name"
                    class="tool-option"
                  >
                    <span class="tool-option-label">{{ tool.label }}</span>
                    <span class="tool-option-desc">{{ tool.description }}</span>
                  </el-checkbox>
                </el-checkbox-group>
                <div
                  v-if="agentToolMode === 'selected' && selectedAgentTools.length === 0"
                  class="tool-required-tip"
                >
                  限定模式需要至少勾选一个工具。
                </div>

                <div v-if="agentToolMode === 'direct'" class="direct-tool-form">
                  <div class="direct-tool-title">
                    选择要运行的工具
                  </div>
                  <el-radio-group v-model="selectedAgentTool" class="tool-list">
                    <el-radio
                      v-for="tool in agentToolOptions"
                      :key="tool.name"
                      :value="tool.name"
                      class="tool-option"
                    >
                      <span class="tool-option-label">{{ tool.label }}</span>
                      <span class="tool-option-desc">{{ tool.description }}</span>
                    </el-radio>
                  </el-radio-group>

                  <el-input
                    v-if="selectedAgentTool === 'query_table_schema'"
                    v-model="directTableName"
                    placeholder="表名"
                    clearable
                  />
                  <el-input
                    v-if="selectedAgentTool === 'execute_readonly_sql'"
                    v-model="directSql"
                    type="textarea"
                    :rows="3"
                    placeholder="SELECT * FROM chat_message LIMIT 5"
                  />
                  <div v-if="!directToolReady" class="tool-required-tip">
                    运行工具前需要补齐工具参数。
                  </div>
                </div>
              </div>
            </template>
            <template #reference>
              <div class="action-btn tool-select-btn" :class="{ active: agentToolMode !== 'auto' }">
                <el-icon class="action-icon">
                  <Tools />
                </el-icon>
                <span class="action-text">{{ selectedToolLabel }}</span>
              </div>
            </template>
          </el-popover>
        </div>

        <!-- 右侧上传按钮 -->
        <FilesSelect class="ml-auto" />
      </div>
    </template>
  </Sender>
</template>

<style scoped lang="scss">
.chat-sender {
  width: 100%;
}

// 关键：让 prefix 区域扩展占满整行
:deep(.el-sender-prefix) {
  flex: 1;
  width: 100%;
}

// prefix 容器
.sender-prefix-container {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 8px;
}

// 左侧按钮组
.left-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

// 统一按钮样式
.action-btn {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  user-select: none;
  background-color: #fff;
  border: 1px solid rgb(0 0 0 / 10%);
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  color: rgb(0 0 0 / 85%);
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background-color: rgb(0 0 0 / 4%);
    border-color: rgb(0 0 0 / 15%);
  }

  // 选中状态
  &.active {
    background: var(--el-color-primary-light-9, rgb(235.9 245.3 255));
    border-color: var(--el-color-primary, #409eff);
    color: var(--el-color-primary, #409eff);
    font-weight: 600;
  }

  .action-icon {
    width: 12px;
    height: 12px;
    font-size: 12px;
    flex-shrink: 0;
  }

  .action-text {
    font-size: 12px;
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

// 知识库列表容器
.knowledge-list-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

// 知识库列表标题
.knowledge-list-header {
  padding: 12px 16px 8px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  justify-content: space-between;

  span {
    flex: 1;
  }
}

// 知识库列表
.knowledge-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  max-height: 300px;
  overflow-y: auto;

  .knowledge-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    cursor: pointer;
    user-select: none;
    background-color: transparent;
    border-radius: 4px;
    transition: all 0.2s ease;
    position: relative;

    &:hover {
      background-color: #f5f7fa;

      .item-name {
        color: #409eff;

        :deep(.el-icon) {
          color: #409eff;
        }
      }
    }

    &.is-selected {
      background-color: #f0f9ff;
      border-left: 3px solid;
      padding-left: 9px;

      .item-name {
        color: #0057ff;
        font-weight: 500;

        :deep(.el-icon) {
          color: #0057ff;
        }

        .item-check {
          color: #0057ff;
          font-size: 16px;
        }
      }
    }

    .item-name {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      font-size: 13px;
      color: #606266;
      transition: all 0.2s ease;
      width: 100%;

      :deep(.el-icon) {
        width: 16px;
        height: 16px;
        font-size: 16px;
        color: #909399;
        flex-shrink: 0;
        transition: color 0.2s ease;
      }

      .item-check {
        margin-left: auto;
        flex-shrink: 0;
      }
    }
  }
}

// 清除按钮
.clear-btn {
  padding: 4px 12px;
  height: auto;
  background-color: transparent;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  color: #909399;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    color: #f56c6c;
    background-color: #fef0f0;
  }

  &:active {
    color: #c81d1d;
    background-color: #fde2e2;
  }
}

.agent-tool-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .tool-mode-segmented {
    width: 100%;
  }

  .tool-mode-option-label {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 42px;
    height: 100%;
  }

  .tool-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  .tool-option {
    align-items: flex-start;
    width: 100%;
    height: auto;
    margin-right: 0;
    white-space: normal;

    :deep(.el-checkbox__label),
    :deep(.el-radio__label) {
      display: flex;
      flex-direction: column;
      gap: 2px;
      line-height: 1.35;
      white-space: normal;
    }
  }

  .tool-option-label {
    font-size: 13px;
    font-weight: 600;
    color: rgb(0 0 0 / 85%);
  }

  .tool-option-desc {
    font-size: 12px;
    color: rgb(0 0 0 / 48%);
  }

  .direct-tool-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .direct-tool-title {
    font-size: 12px;
    font-weight: 600;
    color: rgb(0 0 0 / 72%);
  }

  .tool-required-tip {
    color: var(--el-color-warning, #e6a23c);
    font-size: 12px;
    line-height: 1.35;
  }
}
</style>
