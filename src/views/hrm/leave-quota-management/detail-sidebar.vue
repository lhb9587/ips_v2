<script setup>
import { computed, defineEmits, defineProps, ref, watch } from "vue";

const props = defineProps({
  detailInfo: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["close", "save"]);

const isEditing = ref(false);
const formData = ref({});

const syncFormData = (detailInfo) => {
  const adjustmentQuota = Number(detailInfo?.adjustmentQuota || 0);
  formData.value = {
    ...detailInfo,
    extendedDate: detailInfo?.extendedDate || "",
    adjustmentQuota: Math.max(adjustmentQuota, 0),
  };
};

watch(
  () => props.detailInfo,
  (detailInfo) => {
    syncFormData(detailInfo || {});
    isEditing.value = false;
  },
  { immediate: true, deep: true },
);

const closeSidebar = () => {
  isEditing.value = false;
  emit("close");
};

const startEdit = () => {
  syncFormData(props.detailInfo || {});
  isEditing.value = true;
};

const cancelEdit = () => {
  syncFormData(props.detailInfo || {});
  isEditing.value = false;
};

const saveEdit = () => {
  const adjustmentQuota = Math.max(Number(formData.value.adjustmentQuota || 0), 0);
  emit("save", {
    ...props.detailInfo,
    extendedDate: formData.value.extendedDate || "",
    adjustmentQuota,
  });
  isEditing.value = false;
};

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
    { label: "加入集团日期", key: "groupJoinDate" },
    { label: "加入公司日期", key: "companyJoinDate" },
  ],
  [{ label: "参加工作日期", key: "firstWorkDate" }],
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
    { label: "生效日期", key: "effectDate" },
    { label: "延期假期", key: "extendedDate", editable: true, type: "date" },
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

const formatValue = (field) => {
  const value = props.detailInfo[field.key];
  if (value || value === 0) {
    return value;
  }
  return field.type === "number" ? 0 : "-";
};

const canSave = computed(() => formData.value.extendedDate);
</script>

<template>
  <div class="leave-quota-detail">
    <div class="leave-quota-detail__header">
      <div class="leave-quota-detail__title">假期额度详情</div>
      <div class="leave-quota-detail__actions">
        <template v-if="isEditing">
          <el-button
            plain
            @click="cancelEdit"
          >
            取消
          </el-button>
          <el-button
            type="primary"
            :disabled="!canSave"
            @click="saveEdit"
          >
            保存
          </el-button>
        </template>
        <el-button
          v-else
          type="primary"
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
              <div class="detail-item__value">
                {{ formatValue(field) }}
              </div>
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
              <div
                v-if="isEditing && field.editable && field.type === 'date'"
                class="detail-item__editor"
              >
                <el-date-picker
                  v-model="formData[field.key]"
                  type="date"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  placeholder="请选择日期"
                  style="width: 220px"
                />
              </div>
              <div
                v-else
                class="detail-item__value"
              >
                {{ formatValue(field) }}
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
              <div
                v-if="isEditing && field.editable && field.type === 'number'"
                class="detail-item__editor"
              >
                <el-input-number
                  v-model="formData[field.key]"
                  :min="0"
                  :step="1"
                  :precision="0"
                  controls-position="right"
                  style="width: 160px"
                />
              </div>
              <div
                v-else
                class="detail-item__value"
              >
                {{ formatValue(field) }}
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
  gap: 12px;
}

.leave-quota-detail__close {
  color: #7d8aa5;
  font-size: 22px;
  cursor: pointer;
}

.leave-quota-detail__content {
  padding: 24px 40px 40px;
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
  column-gap: 72px;
  row-gap: 16px;
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
  flex: 0 0 96px;
  color: #6d7b92;
  font-size: 14px;
  line-height: 1.6;
}

.detail-item__value,
.detail-item__editor {
  flex: 1;
  min-width: 0;
}

.detail-item__value {
  color: #1f2d49;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-all;
}

:deep(.detail-item__editor .el-input__wrapper),
:deep(.detail-item__editor .el-input-number),
:deep(.detail-item__editor .el-date-editor.el-input) {
  width: 100%;
}

@media (max-width: 960px) {
  .leave-quota-detail__content {
    padding: 20px 24px 32px;
  }

  .detail-row {
    grid-template-columns: 1fr;
    row-gap: 14px;
  }

  .leave-quota-detail__actions {
    gap: 8px;
  }
}
</style>
