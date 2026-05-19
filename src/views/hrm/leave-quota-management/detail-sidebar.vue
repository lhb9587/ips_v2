<script setup>
import { computed, defineEmits, defineProps, reactive, ref, watch } from "vue";
import dayjs from "dayjs";
import { ElMessage } from "element-plus";
import { updateLeaveQuotaAccount } from "@/api/attendance";

const props = defineProps({
  detailInfo: {
    type: Object,
    default: () => ({}),
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "saved"]);

const STATUS_UNAUDITED = "未审核";
const editableKeys = ["effectDate", "extendedDate", "adjustmentQuota"];
const editForm = reactive({
  effectDate: "",
  extendedDate: "",
  adjustmentQuota: "",
});
const isEditing = ref(false);
const saveLoading = ref(false);

const employeeFields = [
  [
    { label: "员工编码", key: "employeeCode" },
    { label: "姓名", key: "employeeName" },
  ],
  [
    { label: "行政组织", key: "organizationName" },
    { label: "职位", key: "positionName" },
  ],
  [
    { label: "入职日期", key: "hireDate" },
    { label: "转正日期", key: "regularDate" },
  ],
  [
    { label: "加入公司日期", key: "companyJoinDate" },
    { label: "参加工作日期", key: "firstWorkDate" }
  ],
];

const leaveFields = [
  [
    { label: "假期类型", key: "leaveType" },
    { label: "假期单位", key: "leaveUnit" },
  ],
  [
    { label: "周期开始日期", key: "periodStartDate" },
    { label: "周期结束日期", key: "periodEndDate" },
  ],
  [
    { label: "生效日期", key: "effectDate", editable: true, type: "date" },
    { label: "延期日期", key: "extendedDate", editable: true, type: "date" },
  ],
];

const quotaFields = [
  [
    { label: "实际额度", key: "actualQuota" },
    { label: "剩余额度", key: "remainingQuota" },
  ],
  [
    { label: "已用额度", key: "usedQuota" },
    { label: "在途额度", key: "pendingQuota" },
  ],
  [
    { label: "标准额度", key: "standardQuota" },
    { label: "增减额度", key: "adjustmentQuota", editable: true, type: "number" },
  ],
  [{ label: "上期结转额度", key: "carriedForwardQuota" }],
];

const canEdit = computed(() => props.detailInfo?.auditStatus === STATUS_UNAUDITED);

const closeSidebar = () => {
  emit("close");
};

const normalizeDate = (value) => {
  if (!value) {
    return "";
  }
  if (dayjs(value).isValid()) {
    return dayjs(value).format("YYYY-MM-DD");
  }
  const matched = String(value).match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (!matched) {
    return String(value);
  }
  const [, year, month, day] = matched;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

const resetEditForm = () => {
  editForm.effectDate = normalizeDate(
    props.detailInfo?.effectDate || props.detailInfo?.periodStartDate,
  );
  editForm.extendedDate = normalizeDate(
    props.detailInfo?.extendedDate || props.detailInfo?.periodEndDate,
  );
  editForm.adjustmentQuota = props.detailInfo?.adjustmentQuota ?? "";
};

watch(
  () => props.detailInfo,
  () => {
    isEditing.value = false;
    resetEditForm();
  },
  {
    deep: true,
    immediate: true,
  },
);

const startEdit = () => {
  if (!canEdit.value) {
    ElMessage.warning("只有未审核的假期额度支持编辑");
    return;
  }
  resetEditForm();
  isEditing.value = true;
};

const cancelEdit = () => {
  resetEditForm();
  isEditing.value = false;
};

const formatValue = (field) => {
  const value = props.detailInfo?.[field.key];
  if (value || value === 0) {
    return value;
  }
  return "-";
};

const getFieldValue = (field) => {
  if (isEditing.value && field.editable) {
    return editForm[field.key];
  }
  return formatValue(field);
};

const isChanged = () => {
  return editableKeys.some((key) => {
    const currentValue =
      key === "adjustmentQuota"
        ? props.detailInfo?.[key]
        : normalizeDate(props.detailInfo?.[key]);
    const formValue = key === "adjustmentQuota" ? editForm[key] : normalizeDate(editForm[key]);
    return String(currentValue ?? "") !== String(formValue ?? "");
  });
};

const validateEditForm = () => {
  if (!editForm.effectDate) {
    ElMessage.warning("请选择生效日期");
    return false;
  }
  if (!editForm.extendedDate) {
    ElMessage.warning("请选择延期日期");
    return false;
  }
  if (dayjs(editForm.extendedDate).isBefore(dayjs(editForm.effectDate))) {
    ElMessage.warning("延期日期不能早于生效日期");
    return false;
  }
  if (editForm.adjustmentQuota === "" || editForm.adjustmentQuota === null) {
    ElMessage.warning("请输入增减额度");
    return false;
  }
  if (!isChanged()) {
    ElMessage.warning("请先修改需要保存的内容");
    return false;
  }
  return true;
};

const saveEdit = () => {
  if (!validateEditForm()) {
    return;
  }
  const quotaAccountId = props.detailInfo?.id || props.detailInfo?.quotaAccountId;
  if (!quotaAccountId) {
    ElMessage.warning("缺少额度账户ID，无法保存");
    return;
  }
  saveLoading.value = true;
  updateLeaveQuotaAccount(
    {
      quotaAccountId,
      periodStartDate: editForm.effectDate,
      periodEndDate: editForm.extendedDate,
      adjustQuota: editForm.adjustmentQuota,
      versionNo: props.detailInfo?.versionNo,
    },
    {
      isLoading: true,
    },
  )
    .then((res) => {
      const responseData = res?.data || {};
      const updatedDetail = {
        ...props.detailInfo,
        effectDate: editForm.effectDate,
        periodStartDate: editForm.effectDate,
        extendedDate: editForm.extendedDate,
        periodEndDate: editForm.extendedDate,
        adjustmentQuota: editForm.adjustmentQuota,
        adjustQuota: editForm.adjustmentQuota,
        actualQuota: responseData.afterActualQuota ?? props.detailInfo?.actualQuota,
        remainingQuota: responseData.afterRemainQuota ?? props.detailInfo?.remainingQuota,
        remainQuota: responseData.afterRemainQuota ?? props.detailInfo?.remainQuota,
        versionNo: responseData.versionNo ?? props.detailInfo?.versionNo,
      };
      emit("saved", updatedDetail);
      isEditing.value = false;
      ElMessage.success(responseData.message || "保存成功");
    })
    .finally(() => {
      saveLoading.value = false;
    });
};
</script>

<template>
  <div
    class="leave-quota-detail"
    v-loading="loading"
  >
    <div class="leave-quota-detail__header">
      <div class="leave-quota-detail__title">假期额度详情</div>
      <div class="leave-quota-detail__actions">
        <template v-if="isEditing">
          <el-button
            size="small"
            @click="cancelEdit"
          >
            取消
          </el-button>
          <el-button
            type="primary"
            size="small"
            :loading="saveLoading"
            @click="saveEdit"
          >
            保存
          </el-button>
        </template>
        <el-button
          v-else-if="canEdit"
          type="primary"
          size="small"
          plain
          @click="startEdit"
        >
          编辑
        </el-button>
        <el-tooltip
          content="关闭"
          placement="top"
          :teleported="false"
        >
          <div
            class="leave-quota-detail__close mdi mdi-window-close"
            @click="closeSidebar"
          ></div>
        </el-tooltip>
      </div>
    </div>

    <div class="leave-quota-detail__content">
      <section class="detail-section">
        <div class="detail-section__rows">
          <div
            v-for="(row, rowIndex) in employeeFields"
            :key="`employee-${rowIndex}`"
            class="detail-row"
            :class="{ 'detail-row--single': row.length === 1 }"
          >
            <div
              v-for="field in row"
              :key="field.key"
              class="detail-item"
            >
              <div class="detail-item__label">{{ field.label }}</div>
              <div class="detail-item__value">{{ formatValue(field) }}</div>
            </div>
          </div>
        </div>
      </section>

      <section class="detail-section">
        <div class="detail-section__title">假期信息</div>
        <div class="detail-section__rows">
          <div
            v-for="(row, rowIndex) in leaveFields"
            :key="`leave-${rowIndex}`"
            class="detail-row"
            :class="{ 'detail-row--single': row.length === 1 }"
          >
            <div
              v-for="field in row"
              :key="field.key"
              class="detail-item"
            >
              <div class="detail-item__label">{{ field.label }}</div>
              <div class="detail-item__value">
                <el-date-picker
                  v-if="isEditing && field.type === 'date'"
                  v-model="editForm[field.key]"
                  type="date"
                  value-format="YYYY-MM-DD"
                  placeholder="请选择日期"
                  style="width: 100%"
                />
                <span v-else>{{ getFieldValue(field) }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="detail-section">
        <div class="detail-section__title">额度信息</div>
        <div class="detail-section__rows">
          <div
            v-for="(row, rowIndex) in quotaFields"
            :key="`quota-${rowIndex}`"
            class="detail-row"
            :class="{ 'detail-row--single': row.length === 1 }"
          >
            <div
              v-for="field in row"
              :key="field.key"
              class="detail-item"
            >
              <div class="detail-item__label">{{ field.label }}</div>
              <div class="detail-item__value">
                <el-input-number
                  v-if="isEditing && field.type === 'number'"
                  v-model="editForm[field.key]"
                  :precision="2"
                  :step="0.5"
                  controls-position="right"
                  style="width: 100%"
                />
                <span v-else>{{ getFieldValue(field) }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.leave-quota-detail {
  height: 100%;
  background: #fff;
}

.leave-quota-detail__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px 14px;
  border-bottom: 1px solid #e9edf5;
}

.leave-quota-detail__title {
  position: relative;
  padding-bottom: 10px;
  color: #1f2d49;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
}

.leave-quota-detail__title::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 68px;
  height: 3px;
  border-radius: 999px;
  background: #4f80c2;
}

.leave-quota-detail__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.leave-quota-detail__close {
  color: #7d8aa5;
  font-size: 22px;
  cursor: pointer;
}

.leave-quota-detail__content {
  padding: 26px 34px 40px;
}

.detail-section + .detail-section {
  margin-top: 28px;
}

.detail-section__title {
  margin-bottom: 18px;
  color: #1f2d49;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
}

.detail-section__rows {
  display: grid;
  gap: 18px;
}

.detail-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 60px;
  row-gap: 20px;
}

.detail-row--single {
  grid-template-columns: minmax(0, 1fr);
}

.detail-item {
  display: flex;
  align-items: baseline;
  min-width: 0;
}

.detail-item__label {
  flex: 0 0 92px;
  color: #4c5d78;
  font-size: 14px;
  line-height: 1.7;
}

.detail-item__value {
  flex: 1;
  min-width: 0;
  color: #1f2d49;
  font-size: 14px;
  line-height: 1.7;
  word-break: break-all;
}

@media (max-width: 960px) {
  .leave-quota-detail__content {
    padding: 20px 24px 32px;
  }

  .detail-row {
    grid-template-columns: 1fr;
    row-gap: 14px;
  }
}
</style>
