<!-- 补签卡详情内容组件，用于展示和处理补签卡单详情信息。 -->
<script setup>
/* global defineProps, defineEmits */
import { computed, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

const props = defineProps({
  detailInfo: {
    type: Object,
    required: true,
  },
  showClose: {
    type: Boolean,
    default: true,
  },
  showBack: {
    type: Boolean,
    default: false,
  },
  backText: {
    type: String,
    default: "返回补签卡列表",
  },
});

const emit = defineEmits(["close", "back", "update-detail"]);

const supplementTypes = ["上班补签", "下班补签", "外出补签", "其他补签"];
const supplementReasons = [
  "忘记打卡",
  "外出公干",
  "参加公司团建",
  "体育活动",
];

const cloneDetail = (detail) => ({
  ...(detail || {}),
  items: Array.isArray(detail?.items)
    ? detail.items.map((item) => ({ ...item }))
    : [],
});

const detailInfo = ref(cloneDetail(props.detailInfo));
const isEditingItems = ref(false);
const itemEditList = ref([]);

watch(
  () => props.detailInfo,
  (value) => {
    detailInfo.value = cloneDetail(value);
    isEditingItems.value = false;
    itemEditList.value = [];
  },
  { deep: true },
);

const approvalFlow = computed(() => {
  if (!detailInfo.value?.billNo) {
    return [];
  }

  const detail = detailInfo.value;

  if (detail.status === "未提交") {
    return [
      {
        time: `${detail.applyDate} 10:18`,
        title: "保存草稿",
        actor: detail.applicant,
        description: "补签单暂未提交审批。",
        active: true,
      },
    ];
  }

  if (detail.status === "已废弃") {
    return [
      {
        time: `${detail.applyDate} 10:18`,
        title: "废弃申请",
        actor: detail.applicant,
        description: detail.approvalComment || "申请人已废弃该补签单",
        active: true,
      },
    ];
  }

  return [
    {
      time: `${detail.applyDate} 10:18`,
      title: "发起申请 · 提交申请",
      actor: detail.applicant,
      description: "提交补签申请，等待直属上级审批。",
      active: true,
    },
    {
      time: `${detail.applyDate} 10:19`,
      title:
        detail.status === "已通过"
          ? "直属上级审批 · 审批通过"
          : "直属上级审批 · 提交申请",
      actor: detail.approver,
      description: detail.approvalComment || "审批流程处理中",
      active: detail.status === "审批中",
    },
  ];
});

const persistDetail = (record) => {
  detailInfo.value = cloneDetail(record);
  emit("update-detail", cloneDetail(record));
};

const createEmptyItem = () => ({
  attendanceDate: "",
  timePoint: "",
  type: "",
  reason: "",
  remark: "",
});

const cloneItems = (items) => {
  const list = Array.isArray(items) ? items : [];
  return list.map((item) => ({
    attendanceDate: item.attendanceDate || "",
    timePoint: item.timePoint || "",
    type: item.type || "",
    reason: item.reason || "",
    remark: item.remark || "",
  }));
};

const handleEditItems = () => {
  const currentItems = cloneItems(detailInfo.value.items);
  itemEditList.value = currentItems.length ? currentItems : [createEmptyItem()];
  isEditingItems.value = true;
};

const handleCancelEditItems = () => {
  itemEditList.value = [];
  isEditingItems.value = false;
};

const handleAddEditItem = () => {
  itemEditList.value.push(createEmptyItem());
};

const handleRemoveEditItem = (index) => {
  if (itemEditList.value.length === 1) {
    ElMessage.warning("至少保留一条补签卡信息");
    return;
  }
  itemEditList.value.splice(index, 1);
};

const validateEditItems = () => {
  const invalidIndex = itemEditList.value.findIndex(
    (item) => !item.attendanceDate || !item.timePoint || !item.type || !item.reason,
  );
  if (invalidIndex > -1) {
    ElMessage.warning(`请完善第 ${invalidIndex + 1} 条补签卡信息`);
    return false;
  }
  return true;
};

const handleSaveItems = () => {
  if (!validateEditItems()) {
    return;
  }
  const updatedRecord = {
    ...detailInfo.value,
    items: cloneItems(itemEditList.value),
  };
  persistDetail(updatedRecord);
  handleCancelEditItems();
  ElMessage.success("补签卡信息已保存");
};

const handleSubmit = () => {
  if (isEditingItems.value) {
    ElMessage.warning("请先保存或取消补签卡信息编辑");
    return;
  }
  if (detailInfo.value.status !== "未提交") {
    ElMessage.warning("当前补签单无需提交");
    return;
  }
  const updatedRecord = {
    ...detailInfo.value,
    status: "审批中",
    approver: "李经理",
    approvalComment: "已提交，等待部门负责人审批",
  };
  persistDetail(updatedRecord);
  ElMessage.success("补签单已提交");
};

const handleDiscard = () => {
  if (isEditingItems.value) {
    ElMessage.warning("请先保存或取消补签卡信息编辑");
    return;
  }
  if (detailInfo.value.status === "已通过") {
    ElMessage.warning("已通过的补签单不可废弃");
    return;
  }
  ElMessageBox.confirm("确定要废弃当前补签单吗？", "废弃确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    const updatedRecord = {
      ...detailInfo.value,
      status: "已废弃",
      approvalComment: "申请人已废弃该补签单",
    };
    persistDetail(updatedRecord);
    ElMessage.success("补签单已废弃");
  }).catch(() => {});
};
</script>

<template>
  <div class="supplement-detail-page">
    <div class="page-toolbar">
      <div>
        <h2>补签详情</h2>
        <p>查看补签单据、补签卡明细、审批状态与审批意见。</p>
      </div>
      <div class="page-toolbar__actions">
        <template v-if="isEditingItems">
          <el-button
            type="primary"
            @click="handleSaveItems"
          >
            保存
          </el-button>
          <el-button @click="handleCancelEditItems">取消</el-button>
        </template>
        <el-button
          v-else
          type="primary"
          plain
          @click="handleEditItems"
        >
          编辑
        </el-button>
        <el-button
          type="primary"
          @click="handleSubmit"
        >
          提交
        </el-button>
        <el-button
          type="danger"
          plain
          @click="handleDiscard"
        >
          废弃
        </el-button>
        <el-button
          v-if="showBack"
          @click="emit('back')"
        >
          {{ backText }}
        </el-button>
        <el-button
          v-if="showClose"
          @click="emit('close')"
        >
          关闭
        </el-button>
      </div>
    </div>

    <div class="detail-layout">
      <main class="detail-main">
        <section class="detail-card">
          <div class="detail-card__title">补签单信息</div>
          <div class="detail-grid">
            <div>单据编号</div>
            <div>{{ detailInfo.billNo }}</div>
            <div>申请日期</div>
            <div>{{ detailInfo.applyDate }}</div>
            <div>姓名</div>
            <div>{{ detailInfo.applicant }}</div>
            <div>员工编码</div>
            <div>{{ detailInfo.employeeCode }}</div>
            <div>职位</div>
            <div>{{ detailInfo.position }}</div>
            <div>所属组织</div>
            <div>{{ detailInfo.organization }}</div>
          </div>
        </section>

        <section class="detail-card">
          <div class="detail-card__title detail-card__title--with-action">
            <span>补签卡信息</span>
            <div
              v-if="isEditingItems"
              class="detail-card__actions"
            >
              <el-button
                type="primary"
                plain
                @click="handleAddEditItem"
              >
                新增补签卡
              </el-button>
            </div>
          </div>
          <el-table
            v-if="!isEditingItems"
            :data="detailInfo.items"
            border
          >
            <el-table-column type="index" label="#" width="54" />
            <el-table-column prop="attendanceDate" label="考勤日期" width="130" />
            <el-table-column prop="timePoint" label="补签时间点" width="130" />
            <el-table-column prop="type" label="补签卡类型" width="140" />
            <el-table-column prop="reason" label="补签卡原因" width="150" />
            <el-table-column prop="remark" label="备注" min-width="220" />
          </el-table>
          <el-form
            v-else
            class="supplement-items-form"
            label-width="108px"
            label-position="left"
          >
            <div
              v-for="(item, index) in itemEditList"
              :key="index"
              class="supplement-item-editor"
            >
              <div class="supplement-item-editor__header">
                <strong>补签卡 {{ index + 1 }}</strong>
                <el-button
                  link
                  type="danger"
                  @click="handleRemoveEditItem(index)"
                >
                  删除
                </el-button>
              </div>
              <div class="supplement-item-editor__grid">
                <el-form-item label="考勤日期" required>
                  <el-date-picker
                    v-model="item.attendanceDate"
                    type="date"
                    value-format="YYYY-MM-DD"
                    placeholder="请选择考勤日期"
                  />
                </el-form-item>
                <el-form-item label="补签时间点" required>
                  <el-time-select
                    v-model="item.timePoint"
                    start="00:00"
                    step="00:15"
                    end="23:45"
                    placeholder="请选择时间点"
                  />
                </el-form-item>
                <el-form-item label="补签卡类型" required>
                  <el-select
                    v-model="item.type"
                    placeholder="请选择补签卡类型"
                  >
                    <el-option
                      v-for="type in supplementTypes"
                      :key="type"
                      :label="type"
                      :value="type"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="补签卡原因" required>
                  <el-select
                    v-model="item.reason"
                    placeholder="请选择补签卡原因"
                  >
                    <el-option
                      v-for="reason in supplementReasons"
                      :key="reason"
                      :label="reason"
                      :value="reason"
                    />
                  </el-select>
                </el-form-item>
              </div>
              <el-form-item label="备注">
                <el-input
                  v-model="item.remark"
                  type="textarea"
                  :rows="3"
                  resize="none"
                  placeholder="请填写异常说明、补充依据或其他需要说明的信息"
                />
              </el-form-item>
            </div>
          </el-form>
        </section>
      </main>

      <aside class="detail-side">
        <section class="detail-card approval-card">
          <div class="detail-card__title">审批流程</div>
          <div class="approval-timeline">
            <div
              v-for="(item, index) in approvalFlow"
              :key="`${item.title}-${index}`"
              class="approval-step"
              :class="{ 'approval-step--active': item.active }"
            >
              <div class="approval-step__line"></div>
              <div class="approval-step__dot"></div>
              <div class="approval-step__body">
                <div class="approval-step__time">{{ item.time }}</div>
                <div class="approval-step__title">{{ item.title }}</div>
                <div class="approval-step__actor">{{ item.actor }}</div>
                <p>{{ item.description }}</p>
              </div>
            </div>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.supplement-detail-page {
  min-height: calc(100vh - 120px);
  color: #122448;
}

.page-toolbar,
.detail-card {
  border: 1px solid #dce5f1;
  border-radius: 4px;
  background: #fff;
}

.page-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
}

.page-toolbar h2 {
  margin: 0;
  color: #122448;
  font-size: 18px;
  font-weight: 600;
}

.page-toolbar p {
  margin: 6px 0 0;
  color: #63718a;
  font-size: 12px;
}

.page-toolbar__actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.detail-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 16px;
  margin-top: 14px;
  align-items: start;
}

.detail-main {
  display: grid;
  gap: 14px;
}

.detail-card {
  overflow: hidden;
}

.detail-card__title {
  padding: 16px 18px;
  border-bottom: 1px solid #dce5f1;
  color: #122448;
  font-size: 15px;
  font-weight: 600;
}

.detail-card__title--with-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.detail-card__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.detail-grid {
  display: grid;
  grid-template-columns: 130px minmax(0, 1fr) 130px minmax(0, 1fr);
  padding: 18px;
}

.detail-grid div {
  min-height: 38px;
  display: flex;
  align-items: center;
  min-width: 0;
  padding: 0 12px;
  border: 1px solid #e2e8f2;
  border-top: 0;
  border-left: 0;
  color: #122448;
  font-size: 13px;
}

.detail-grid div:nth-child(-n + 4) {
  border-top: 1px solid #e2e8f2;
}

.detail-grid div:nth-child(4n + 1) {
  border-left: 1px solid #e2e8f2;
}

.detail-grid div:nth-child(odd) {
  background: #f2f5fa;
  font-weight: 600;
}

.detail-card :deep(.el-table) {
  margin: 18px;
  width: calc(100% - 36px);
}

.supplement-items-form {
  padding: 18px;
}

.supplement-item-editor {
  padding: 16px;
  border: 1px solid #e2e8f2;
  border-radius: 4px;
  background: #fbfcff;
}

.supplement-item-editor + .supplement-item-editor {
  margin-top: 14px;
}

.supplement-item-editor__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  color: #122448;
}

.supplement-item-editor__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 24px;
}

.supplement-item-editor__grid :deep(.el-date-editor.el-input),
.supplement-item-editor__grid :deep(.el-select) {
  width: 100%;
}

.supplement-items-form :deep(.el-textarea) {
  width: 100%;
}

.approval-card {
  min-height: 360px;
}

.approval-timeline {
  padding: 22px 24px 26px;
}

.approval-step {
  position: relative;
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr);
  column-gap: 12px;
  min-height: 114px;
}

.approval-step:last-child {
  min-height: 0;
}

.approval-step__line {
  position: absolute;
  top: 12px;
  bottom: -12px;
  left: 6px;
  width: 1px;
  background: #d9e4f4;
}

.approval-step:last-child .approval-step__line {
  display: none;
}

.approval-step__dot {
  position: relative;
  z-index: 1;
  width: 12px;
  height: 12px;
  margin-top: 3px;
  border-radius: 50%;
  background: #6aa1f8;
}

.approval-step--active .approval-step__dot {
  background: #4f8df7;
}

.approval-step__body {
  min-width: 0;
  padding-bottom: 22px;
}

.approval-step__time {
  color: #6c7b92;
  font-size: 13px;
}

.approval-step__title {
  margin-top: 8px;
  color: #122448;
  font-size: 14px;
  font-weight: 600;
}

.approval-step__actor {
  margin-top: 6px;
  color: #466083;
  font-size: 13px;
}

.approval-step p {
  margin: 8px 0 0;
  color: #4f5f77;
  font-size: 13px;
  line-height: 1.7;
}

@media (max-width: 1200px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .page-toolbar__actions {
    width: 100%;
    justify-content: flex-start;
  }

  .detail-card__title--with-action {
    align-items: flex-start;
    flex-direction: column;
  }

  .detail-card__actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .detail-grid {
    grid-template-columns: 110px minmax(0, 1fr);
  }

  .supplement-item-editor__grid {
    grid-template-columns: 1fr;
  }

  .detail-grid div:nth-child(-n + 4) {
    border-top: 0;
  }

  .detail-grid div:nth-child(-n + 2) {
    border-top: 1px solid #e2e8f2;
  }

  .detail-grid div:nth-child(4n + 1) {
    border-left: 0;
  }

  .detail-grid div:nth-child(odd) {
    border-left: 1px solid #e2e8f2;
  }
}
</style>
