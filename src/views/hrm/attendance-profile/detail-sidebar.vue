<script setup>
import { computed, defineEmits, defineProps, ref, watch } from "vue";
import { ElMessage } from "element-plus";

const props = defineProps({
  detailInfo: {
    type: Object,
    default: () => ({}),
  },
  mode: {
    type: String,
    default: "view",
  },
  shiftOptions: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["close", "save", "delete"]);

const isEditing = ref(false);
const formData = ref({});

const defaultPolicy = {
  holidaySystem: "默认假期制度",
  attendanceSystem: "默认考勤制度",
};

const syncFormData = (detailInfo) => {
  formData.value = {
    ...detailInfo,
    holidaySystem: defaultPolicy.holidaySystem,
    attendanceSystem: defaultPolicy.attendanceSystem,
  };
};

watch(
  () => [props.detailInfo, props.mode],
  ([detailInfo, mode]) => {
    syncFormData(detailInfo || {});
    isEditing.value = mode === "create";
  },
  { immediate: true, deep: true },
);

const titleText = computed(() =>
  props.mode === "create" ? "新增考勤档案" : "考勤档案详情",
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
  if (props.mode === "create") {
    closeSidebar();
    return;
  }
  syncFormData(props.detailInfo || {});
  isEditing.value = false;
};

const saveEdit = () => {
  if (!formData.value.employeeName) {
    return ElMessage.warning("请填写员工姓名");
  }
  if (!formData.value.defaultShift) {
    return ElMessage.warning("请选择默认班次");
  }

  emit("save", {
    ...props.detailInfo,
    employeeName: formData.value.employeeName,
    defaultShift: formData.value.defaultShift,
    holidaySystem: defaultPolicy.holidaySystem,
    attendanceSystem: defaultPolicy.attendanceSystem,
  });
  isEditing.value = false;
};

const deleteRecord = () => {
  emit("delete", props.detailInfo);
};

const detailRows = [
  [
    { label: "员工编码", key: "employeeCode" },
    { label: "姓名", key: "employeeName", editable: true, type: "input" },
  ],
  [
    { label: "考勤编号", key: "attendanceNo" },
    { label: "默认班次", key: "defaultShift", editable: true, type: "select" },
  ],
  [
    { label: "假期制度", key: "holidaySystem" },
    { label: "考勤制度", key: "attendanceSystem" },
  ],
];

const formatValue = (field) => {
  const value = props.detailInfo[field.key] || formData.value[field.key];
  return value || "-";
};
</script>

<template>
  <div class="attendance-profile-detail">
    <div class="attendance-profile-detail__header">
      <div class="attendance-profile-detail__title">{{ titleText }}</div>
      <div class="attendance-profile-detail__actions">
        <template v-if="isEditing">
          <el-button
            plain
            @click="cancelEdit"
          >
            取消
          </el-button>
          <el-button
            type="primary"
            @click="saveEdit"
          >
            保存
          </el-button>
        </template>
        <template v-else>
          <el-button
            type="primary"
            plain
            @click="startEdit"
          >
            编辑
          </el-button>
          <el-button
            type="danger"
            plain
            @click="deleteRecord"
          >
            删除
          </el-button>
        </template>
        <el-tooltip
          content="关闭"
          placement="top"
          :teleported="false"
        >
          <div
            class="attendance-profile-detail__close mdi mdi-window-close"
            @click="closeSidebar"
          ></div>
        </el-tooltip>
      </div>
    </div>

    <div class="attendance-profile-detail__content">
      <section class="detail-section">
        <div class="detail-section__rows">
          <div
            v-for="(row, rowIndex) in detailRows"
            :key="rowIndex"
            class="detail-row"
          >
            <div
              v-for="field in row"
              :key="field.key"
              class="detail-item"
            >
              <div class="detail-item__label">{{ field.label }}</div>
              <div
                v-if="isEditing && field.editable && field.type === 'input'"
                class="detail-item__editor"
              >
                <el-input
                  v-model="formData[field.key]"
                  placeholder="请输入姓名"
                  clearable
                />
              </div>
              <div
                v-else-if="isEditing && field.editable && field.type === 'select'"
                class="detail-item__editor"
              >
                <el-select
                  v-model="formData[field.key]"
                  placeholder="请选择默认班次"
                  filterable
                  clearable
                >
                  <el-option
                    v-for="item in shiftOptions"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
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
.attendance-profile-detail {
  height: 100%;
  background: #fff;
}

.attendance-profile-detail__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px 14px;
  border-bottom: 1px solid #e9edf5;
}

.attendance-profile-detail__title {
  position: relative;
  padding-bottom: 10px;
  color: #1f2d49;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
}

.attendance-profile-detail__title::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 68px;
  height: 3px;
  border-radius: 999px;
  background: #4f80c2;
}

.attendance-profile-detail__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.attendance-profile-detail__close {
  color: #7d8aa5;
  font-size: 22px;
  cursor: pointer;
}

.attendance-profile-detail__content {
  padding: 24px 40px 40px;
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
:deep(.detail-item__editor .el-select) {
  width: 100%;
}

@media (max-width: 960px) {
  .attendance-profile-detail__content {
    padding: 20px 24px 32px;
  }

  .detail-row {
    grid-template-columns: 1fr;
    row-gap: 14px;
  }

  .attendance-profile-detail__actions {
    gap: 8px;
  }
}
</style>
