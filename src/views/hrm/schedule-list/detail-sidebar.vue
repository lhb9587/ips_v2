<script setup>
// 排班列表单日排班详情/编辑侧边栏。
import { computed, defineEmits, defineProps, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { queryAttendanceShiftDetail } from "@/api/attendance";

const props = defineProps({
  detailInfo: {
    type: Object,
    default: () => ({}),
  },
  loading: {
    type: Boolean,
    default: false,
  },
  shiftOptions: {
    type: Array,
    default: () => [],
  },
  shiftLoading: {
    type: Boolean,
    default: false,
  },
  submitLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "save", "edit"]);

const DATE_TYPE_OPTIONS = [
  { label: "工作日", value: "workday" },
  { label: "休息日", value: "restday" },
  { label: "法定节假日", value: "holiday" },
];

const isEditing = ref(false);
const shiftDetailLoading = ref(false);
const formData = ref({});

const buildSegmentRecord = (item = {}, index = 0) => ({
  segmentNo: item.segmentNo || index + 1,
  attendanceType: item.attendanceType || "",
  referenceDate: item.referenceDate || item.startReferenceDate || "current",
  workStartTime: item.workStartTime || "",
  startNeedPunch: item.startNeedPunch === false ? 0 : item.startNeedPunch === true ? 1 : Number(item.startNeedPunch ?? 1),
  startFloatMinutes: item.startFloatMinutes || 0,
  workEndTime: item.workEndTime || "",
  endNeedPunch: item.endNeedPunch === false ? 0 : item.endNeedPunch === true ? 1 : Number(item.endNeedPunch ?? 1),
  endFloatMinutes: item.endFloatMinutes || 0,
  restStartTime: item.restStartTime || "",
  restEndTime: item.restEndTime || "",
  restMinutes: item.restMinutes || 0,
});

const syncFormData = (detailInfo) => {
  formData.value = {
    scheduleDayId: detailInfo.scheduleDayId || "",
    talentCode: detailInfo.talentCode || "",
    talentName: detailInfo.talentName || "",
    attendanceOrgName: detailInfo.attendanceOrgName || "",
    scheduleDate: detailInfo.scheduleDate || "",
    dateType: detailInfo.dateTypeValue || detailInfo.dateType || "workday",
    dateTypeLabel: detailInfo.dateType || "",
    attendanceArchiveCode: detailInfo.attendanceArchiveCode || "",
    attendancePolicyCode: detailInfo.attendancePolicyCode || "",
    attendancePolicyName: detailInfo.attendancePolicyName || "",
    standardHours:
      detailInfo.standardHours || detailInfo.standardHours === 0 ? detailInfo.standardHours : "",
    shiftCode: detailInfo.shiftCode || "",
    shiftName: detailInfo.shiftName || "",
    canEdit: detailInfo.canEdit === true,
    segments: Array.isArray(detailInfo.segments)
      ? detailInfo.segments.map((item, index) => buildSegmentRecord(item, index))
      : [],
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

const canEdit = computed(() => formData.value.canEdit === true);
const displayDateType = computed(() => {
  if (isEditing.value) {
    return formData.value.dateType;
  }
  const current = DATE_TYPE_OPTIONS.find((item) => item.value === formData.value.dateType);
  return current?.label || formData.value.dateTypeLabel || formData.value.dateType || "-";
});

const shiftOptionMap = computed(() => {
  const map = new Map();
  (props.shiftOptions || []).forEach((item) => {
    map.set(item.value, item);
  });
  return map;
});

const formatValue = (value) => {
  if (value === 0) {
    return "0";
  }
  return value ? String(value) : "-";
};

const formatPunchValue = (value) => {
  if (value === 1 || value === true) {
    return "是";
  }
  if (value === 0 || value === false) {
    return "否";
  }
  return "-";
};

const closeSidebar = () => {
  emit("close");
};

const startEdit = () => {
  if (!canEdit.value) {
    return;
  }
  syncFormData(props.detailInfo || {});
  isEditing.value = true;
  emit("edit");
};

const cancelEdit = () => {
  syncFormData(props.detailInfo || {});
  isEditing.value = false;
};

const handleShiftChange = (value) => {
  const selected = shiftOptionMap.value.get(value);
  formData.value.shiftName = selected?.label || "";
  if (!value) {
    return;
  }
  shiftDetailLoading.value = true;
  queryAttendanceShiftDetail(
    {
      shiftCode: value,
    },
    {
      isLoading: false,
    },
  )
    .then((res) => {
      const detail = res?.data || {};
      formData.value.standardHours =
        detail.standardHours || detail.standardHours === 0 ? detail.standardHours : "";
      const detailSegments = Array.isArray(detail.segments) ? detail.segments : [];
      formData.value.segments = detailSegments.map((item, index) =>
        buildSegmentRecord(
          {
            segmentNo: item.segmentNo || index + 1,
            attendanceType: item.attendanceType || "",
            referenceDate: item.onDutyRefDate || "current",
            workStartTime: item.onDutyTime || "",
            startNeedPunch: item.onDutyNeedPunch,
            startFloatMinutes: item.onDutyFloatMinute || 0,
            workEndTime: item.offDutyTime || "",
            endNeedPunch: item.offDutyNeedPunch,
            endFloatMinutes: item.offDutyFloatMinute || 0,
            restStartTime: item.restStartTime || "",
            restEndTime: item.restEndTime || "",
            restMinutes: item.restMinutes || 0,
          },
          index,
        ),
      );
    })
    .finally(() => {
      shiftDetailLoading.value = false;
    });
};

const validateForm = () => {
  if (!formData.value.scheduleDayId) {
    ElMessage.warning("缺少日排班ID，无法保存");
    return false;
  }
  if (!formData.value.dateType) {
    ElMessage.warning("请选择日期类型");
    return false;
  }
  if (!formData.value.shiftCode) {
    ElMessage.warning("请选择班次名称");
    return false;
  }
  const invalidSegment = (formData.value.segments || []).find(
    (item) =>
      !item.workStartTime &&
      !item.workEndTime &&
      item.startNeedPunch !== 0 &&
      item.endNeedPunch !== 0,
  );
  if (invalidSegment) {
    ElMessage.warning("请完善班次信息");
    return false;
  }
  const emptyRequiredSegment = (formData.value.segments || []).find(
    (item) =>
      !item.workStartTime ||
      !item.workEndTime ||
      (item.startNeedPunch !== 0 && item.startNeedPunch !== 1) ||
      (item.endNeedPunch !== 0 && item.endNeedPunch !== 1),
  );
  if (emptyRequiredSegment) {
    ElMessage.warning("请完整填写上下班时间和是否打卡");
    return false;
  }
  return true;
};

const saveEdit = () => {
  if (!validateForm()) {
    return;
  }
  emit("save", {
    scheduleDayId: formData.value.scheduleDayId,
    dateType: formData.value.dateType,
    shiftCode: formData.value.shiftCode,
    segments: (formData.value.segments || []).map((item, index) => ({
      segmentNo: item.segmentNo || index + 1,
      attendanceType: item.attendanceType || undefined,
      startReferenceDate: item.referenceDate || undefined,
      workStartTime: item.workStartTime,
      startNeedPunch: Number(item.startNeedPunch),
      startFloatMinutes: item.startFloatMinutes || undefined,
      endReferenceDate: item.referenceDate || undefined,
      workEndTime: item.workEndTime,
      endNeedPunch: Number(item.endNeedPunch),
      endFloatMinutes: item.endFloatMinutes || undefined,
      restStartTime: item.restStartTime || undefined,
      restEndTime: item.restEndTime || undefined,
      restMinutes: item.restMinutes || undefined,
    })),
  });
};
</script>

<template>
  <div class="schedule-detail-sidebar">
    <div class="schedule-detail-sidebar__header">
      <div class="schedule-detail-sidebar__title">排班详情</div>
      <div class="schedule-detail-sidebar__actions">
        <template v-if="isEditing">
          <el-button
            plain
            @click="cancelEdit"
          >
            取消
          </el-button>
          <el-button
            type="primary"
            :loading="submitLoading"
            @click="saveEdit"
          >
            保存
          </el-button>
        </template>
        <template v-else>
          <el-button
            v-if="canEdit"
            type="primary"
            plain
            @click="startEdit"
          >
            编辑
          </el-button>
        </template>
        <el-tooltip
          content="关闭"
          placement="top"
          :teleported="false"
        >
          <div
            class="schedule-detail-sidebar__close mdi mdi-window-close"
            @click="closeSidebar"
          ></div>
        </el-tooltip>
      </div>
    </div>

    <div
      class="schedule-detail-sidebar__content"
      v-loading="loading"
    >
      <section class="detail-section">
        <div class="detail-section__title">基本信息</div>
        <div class="detail-grid">
          <div class="detail-item">
            <div class="detail-item__label">员工编码</div>
            <div class="detail-item__value">{{ formatValue(formData.talentCode) }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-item__label">员工姓名</div>
            <div class="detail-item__value">{{ formatValue(formData.talentName) }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-item__label">考勤组织</div>
            <div class="detail-item__value">{{ formatValue(formData.attendanceOrgName) }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-item__label">考勤日期</div>
            <div class="detail-item__value">{{ formatValue(formData.scheduleDate) }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-item__label">日期类型</div>
            <div
              v-if="isEditing"
              class="detail-item__editor"
            >
              <el-select
                v-model="formData.dateType"
                class="detail-item__input"
                placeholder="请选择日期类型"
              >
                <el-option
                  v-for="item in DATE_TYPE_OPTIONS"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>
            <div
              v-else
              class="detail-item__value"
            >
              {{ displayDateType }}
            </div>
          </div>
          <div class="detail-item">
            <div class="detail-item__label">考勤档案编号</div>
            <div class="detail-item__value">{{ formatValue(formData.attendanceArchiveCode) }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-item__label">班次名称</div>
            <div
              v-if="isEditing"
              class="detail-item__editor"
            >
              <el-select
                v-model="formData.shiftCode"
                class="detail-item__input"
                filterable
                :loading="shiftLoading || shiftDetailLoading"
                placeholder="请选择班次名称"
                @change="handleShiftChange"
              >
                <el-option
                  v-for="item in shiftOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>
            <div
              v-else
              class="detail-item__value"
            >
              {{ formatValue(formData.shiftName) }}
            </div>
          </div>
          <div class="detail-item">
            <div class="detail-item__label">考勤制度</div>
            <div class="detail-item__value">{{ formatValue(formData.attendancePolicyName) }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-item__label">标准工时</div>
            <div class="detail-item__value">{{ formatValue(formData.standardHours) }}</div>
          </div>
        </div>
      </section>

      <section class="detail-section">
        <div class="detail-section__title">班次信息</div>
        <div
          v-if="formData.segments?.length"
          class="segment-list"
        >
          <div
            v-for="item in formData.segments"
            :key="item.segmentNo || `${item.workStartTime}-${item.workEndTime}`"
            class="segment-card"
          >
            <div class="segment-card__grid">
              <div class="detail-item">
                <div class="detail-item__label">上班时间</div>
                <div
                  v-if="isEditing"
                  class="detail-item__editor"
                >
                  <el-time-picker
                    v-model="item.workStartTime"
                    class="detail-item__input"
                    value-format="HH:mm"
                    format="HH:mm"
                    placeholder="请选择上班时间"
                  />
                </div>
                <div
                  v-else
                  class="detail-item__value"
                >
                  {{ formatValue(item.workStartTime) }}
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-item__label">上班是否打卡</div>
                <div
                  v-if="isEditing"
                  class="detail-item__editor"
                >
                  <el-select
                    v-model="item.startNeedPunch"
                    class="detail-item__input"
                  >
                    <el-option
                      label="是"
                      :value="1"
                    />
                    <el-option
                      label="否"
                      :value="0"
                    />
                  </el-select>
                </div>
                <div
                  v-else
                  class="detail-item__value"
                >
                  {{ formatPunchValue(item.startNeedPunch) }}
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-item__label">下班时间</div>
                <div
                  v-if="isEditing"
                  class="detail-item__editor"
                >
                  <el-time-picker
                    v-model="item.workEndTime"
                    class="detail-item__input"
                    value-format="HH:mm"
                    format="HH:mm"
                    placeholder="请选择下班时间"
                  />
                </div>
                <div
                  v-else
                  class="detail-item__value"
                >
                  {{ formatValue(item.workEndTime) }}
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-item__label">下班是否打卡</div>
                <div
                  v-if="isEditing"
                  class="detail-item__editor"
                >
                  <el-select
                    v-model="item.endNeedPunch"
                    class="detail-item__input"
                  >
                    <el-option
                      label="是"
                      :value="1"
                    />
                    <el-option
                      label="否"
                      :value="0"
                    />
                  </el-select>
                </div>
                <div
                  v-else
                  class="detail-item__value"
                >
                  {{ formatPunchValue(item.endNeedPunch) }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          v-else
          class="detail-section__empty"
        >
          -
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.schedule-detail-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: #fff;
}

.schedule-detail-sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 24px 14px;
  border-bottom: 1px solid #e9edf5;
}

.schedule-detail-sidebar__title {
  position: relative;
  padding-bottom: 10px;
  color: #1f2d49;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
}

.schedule-detail-sidebar__title::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 68px;
  height: 3px;
  border-radius: 999px;
  background: #4f80c2;
}

.schedule-detail-sidebar__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.schedule-detail-sidebar__close {
  color: #7d8aa5;
  font-size: 22px;
  cursor: pointer;
}

.schedule-detail-sidebar__content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 24px;
  padding: 24px 32px 36px;
  overflow: auto;
}

.detail-section {
  display: grid;
  gap: 16px;
}

.detail-section__title {
  color: #1f2d49;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 40px;
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
  line-height: 1.7;
}

.detail-item__value,
.detail-item__editor {
  flex: 1;
  min-width: 0;
}

.detail-item__value {
  color: #1f2d49;
  font-size: 14px;
  line-height: 1.7;
  word-break: break-all;
}

.detail-item__input {
  width: 100%;
}

.segment-list {
  display: grid;
  gap: 14px;
}

.segment-card {
  padding: 16px 18px;
  border: 1px solid #e7edf5;
  border-radius: 10px;
  background: #fbfcfe;
}

.segment-card__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 32px;
}

.detail-section__empty {
  color: #8b96aa;
  font-size: 14px;
  line-height: 1.7;
}

@media (max-width: 960px) {
  .schedule-detail-sidebar__header,
  .schedule-detail-sidebar__actions {
    align-items: flex-start;
    flex-direction: column;
  }

  .schedule-detail-sidebar__content {
    padding: 20px 24px 28px;
  }

  .detail-grid,
  .segment-card__grid {
    grid-template-columns: 1fr;
  }
}
</style>
