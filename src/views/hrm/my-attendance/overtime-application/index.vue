<!-- 加班申请页，负责创建、保存和提交员工加班单。 -->
<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import dayjs from "dayjs";
import { throttle } from "lodash";
import Layout from "@/layouts/main";
import {
  queryOvertimeRequestSelfCalcDuration,
  queryOvertimeRequestSelfInit,
  saveOvertimeRequestSelf,
} from "@/api/attendance";
import {
  formatOvertimeDateTimeValue,
  resolveOvertimeDateFromDateTime,
} from "@/views/hrm/my-attendance/utils/overtimeDetail";
import { getUserInfo } from "@/utils/user";

const router = useRouter();

const employeeInfo = reactive({
  name: "",
  code: "",
  organization: "",
  position: "",
});

const saving = ref(false);

const form = reactive({
  startTime: "",
  endTime: "",
  breakMinutes: 0,
  overtimeTypeCode: "",
  overtimeTypeName: "",
  compensationType: "",
  overtimeReason: "",
  remark: "",
});

const editingOvertimeRequestId = ref(null);
const applyOvertimeHours = ref(0);
const durationMessage = ref("");

const buildOvertimeStartTime = () => formatOvertimeDateTimeValue(form.startTime);

const buildOvertimeEndTime = () => formatOvertimeDateTimeValue(form.endTime);

const isInvalidOvertimeRange = () => {
  const start = dayjs(buildOvertimeStartTime());
  const end = dayjs(buildOvertimeEndTime());
  if (!start.isValid() || !end.isValid()) {
    return true;
  }
  return !end.isAfter(start);
};

const isSameStartEndTime = () =>
  !!(form.startTime && form.endTime && buildOvertimeStartTime() === buildOvertimeEndTime());

const computedOvertimeHours = computed(() => applyOvertimeHours.value);

const durationHint = computed(() => {
  if (durationMessage.value) {
    return durationMessage.value;
  }
  if (!form.startTime || !form.endTime) {
    return "请选择加班开始和结束时间，系统将自动计算申请加班小时数。";
  }
  if (isSameStartEndTime()) {
    return "开始时间与结束时间不能相同，请调整后再提交。";
  }
  if (isInvalidOvertimeRange()) {
    return "结束时间需晚于开始时间，请调整后再提交。";
  }
  if (computedOvertimeHours.value <= 0) {
    return "休息时长不能大于等于加班时段总时长，请调整后再提交。";
  }
  return "审批通过后按 1:1 生成调休假，未使用额度 3 个月后失效。";
});

const fetchOvertimeApplicationInit = async () => {
  try {
    const userInfo = getUserInfo?.() || {};
    employeeInfo.name = userInfo?.userName || userInfo?.name || employeeInfo.name;
    employeeInfo.code =
      userInfo?.talentCode || userInfo?.empCode || userInfo?.code || employeeInfo.code;
    employeeInfo.organization =
      userInfo?.deptName ||
      userInfo?.organizationName ||
      userInfo?.organization ||
      employeeInfo.organization;
    employeeInfo.position = userInfo?.positionName || userInfo?.position || employeeInfo.position;

    const res = await queryOvertimeRequestSelfInit({}, { isLoading: false });
    const data = res?.data || {};
    const employee = data?.employee || {};

    employeeInfo.name = employee?.talentName || employeeInfo.name;
    employeeInfo.code = employee?.talentCode || employeeInfo.code;
    employeeInfo.organization = employee?.deptName || employeeInfo.organization;
    employeeInfo.position = employee?.positionName || employeeInfo.position;

    form.breakMinutes = Number(data?.defaultRestMinutes ?? form.breakMinutes ?? 0);
    form.compensationType = data?.defaultCompensationType || form.compensationType;

    const defaultOvertimeType = (data?.overtimeTypes || [])[0];
    if (defaultOvertimeType) {
      form.overtimeTypeCode = defaultOvertimeType.optionCode || "";
      form.overtimeTypeName = defaultOvertimeType.optionName || "";
    }
  } catch (error) {
    ElMessage.warning("初始化数据获取失败");
  }
};

const calcOvertimeDuration = async () => {
  const overtimeStartTime = buildOvertimeStartTime();
  const overtimeEndTime = buildOvertimeEndTime();
  if (
    !overtimeStartTime ||
    !overtimeEndTime ||
    isSameStartEndTime() ||
    isInvalidOvertimeRange()
  ) {
    applyOvertimeHours.value = 0;
    durationMessage.value = "";
    return;
  }

  try {
    const res = await queryOvertimeRequestSelfCalcDuration(
      {
        overtimeStartTime,
        overtimeEndTime,
        restMinutes: Number(form.breakMinutes || 0),
        overtimeTypeCode: form.overtimeTypeCode || undefined,
        compensationType: form.compensationType || undefined,
      },
      { isLoading: false },
    );
    applyOvertimeHours.value = Number(res?.data?.applyOvertimeHours || 0);
    durationMessage.value = res?.data?.message || "";
  } catch (error) {
    applyOvertimeHours.value = 0;
    durationMessage.value = "";
  }
};

const throttledCalcOvertimeDuration = throttle(calcOvertimeDuration, 1000);

const resetOvertimeDuration = () => {
  throttledCalcOvertimeDuration.cancel();
  applyOvertimeHours.value = 0;
  durationMessage.value = "";
};

watch(
  () => [
    form.startTime,
    form.endTime,
    form.breakMinutes,
    form.overtimeTypeCode,
    form.compensationType,
  ],
  () => {
    if (
      !buildOvertimeStartTime() ||
      !buildOvertimeEndTime() ||
      isSameStartEndTime() ||
      isInvalidOvertimeRange()
    ) {
      resetOvertimeDuration();
      return;
    }
    throttledCalcOvertimeDuration();
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  throttledCalcOvertimeDuration.cancel();
});

onMounted(() => {
  fetchOvertimeApplicationInit();
});

const resetForm = () => {
  editingOvertimeRequestId.value = null;
  form.startTime = "";
  form.endTime = "";
  form.breakMinutes = 0;
  form.overtimeReason = "";
  form.remark = "";
  applyOvertimeHours.value = 0;
  durationMessage.value = "";
};

const validateForm = () => {
  if (!form.startTime || !form.endTime) {
    ElMessage.warning("请填写加班开始和结束时间");
    return false;
  }
  if (isInvalidOvertimeRange()) {
    ElMessage.warning("结束时间需晚于开始时间");
    return false;
  }
  if (computedOvertimeHours.value <= 0) {
    ElMessage.warning("申请加班小时数需大于 0");
    return false;
  }
  return true;
};

const buildSavePayload = (submitFlag) => ({
  overtimeRequestId: editingOvertimeRequestId.value || undefined,
  overtimeDate: resolveOvertimeDateFromDateTime(form.startTime),
  overtimeStartTime: buildOvertimeStartTime(),
  overtimeEndTime: buildOvertimeEndTime(),
  restMinutes: Number(form.breakMinutes || 0),
  overtimeTypeCode: form.overtimeTypeCode || undefined,
  overtimeTypeName: form.overtimeTypeName || undefined,
  compensationType: form.compensationType || undefined,
  reason: form.overtimeReason?.trim() || undefined,
  remark: form.remark?.trim() || undefined,
  submitFlag,
});

const submitOvertimeRequest = async (submitFlag) => {
  const res = await saveOvertimeRequestSelf(buildSavePayload(submitFlag), {
    isLoading: true,
  });
  return res?.data || {};
};

const handleSave = async () => {
  if (!validateForm() || saving.value) {
    return;
  }
  saving.value = true;
  try {
    await submitOvertimeRequest("0");
    ElMessage.success("加班草稿已保存");
    resetForm();
    handleOpenList();
  } catch (error) {
    console.log(error);
  } finally {
    saving.value = false;
  }
};

const handleSubmit = () => {
  if (!validateForm() || saving.value) {
    return;
  }
  ElMessageBox.confirm("确认提交当前加班申请并进入审批流程？", "提交确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      saving.value = true;
      try {
        await submitOvertimeRequest("1");
        ElMessage.success("加班申请已提交审批");
        resetForm();
        handleOpenList();
      } catch (error) {
        console.log(error);
      } finally {
        saving.value = false;
      }
    })
    .catch(() => {});
};

const handleOpenList = () => {
  router.push({ name: "my-overtime-list" });
};

</script>

<template>
  <Layout>
    <div class="overtime-application-page">
      <div class="page-toolbar">
        <div>
          <h2>我要加班</h2>
          <div class="page-toolbar__tips">
            <div>1. 审批通过后按加班时长与调休时长 1:1 生成调休假。</div>
            <div>2. 未使用的调休假自生成之日起 3 个月后失效。</div>
          </div>
        </div>
        <div class="page-toolbar__actions">
          <el-button
            type="primary"
            :loading="saving"
            @click="handleSave"
          >
            保存
          </el-button>
          <el-button
            type="primary"
            :loading="saving"
            @click="handleSubmit"
          >
            提交
          </el-button>
          <el-button
            type="primary"
            plain
            @click="handleOpenList"
          >
            加班列表
          </el-button>
        </div>
      </div>

      <div class="application-layout">
        <main class="application-main">
          <section class="info-section">
            <div class="section-heading">基础信息</div>
            <div class="readonly-grid">
              <div class="readonly-cell readonly-cell--label">姓名</div>
              <div class="readonly-cell">{{ employeeInfo.name }}</div>
              <div class="readonly-cell readonly-cell--label">员工编码</div>
              <div class="readonly-cell">{{ employeeInfo.code }}</div>
              <div class="readonly-cell readonly-cell--label">所属组织</div>
              <div class="readonly-cell">{{ employeeInfo.organization }}</div>
              <div class="readonly-cell readonly-cell--label">职位</div>
              <div class="readonly-cell  readonly-cell--wrap">
                {{ employeeInfo.position }}
              </div>
            </div>
          </section>

          <section class="info-section">
            <div class="section-heading">加班信息</div>
            <el-form
              label-width="110px"
              label-position="left"
              class="overtime-form"
            >
              <div class="time-row">
                <el-form-item
                  label="开始时间"
                  required
                >
                  <el-date-picker
                    v-model="form.startTime"
                    type="datetime"
                    value-format="YYYY-MM-DD HH:mm"
                    format="YYYY-MM-DD HH:mm"
                    placeholder="请选择开始时间"
                  />
                </el-form-item>
                <el-form-item
                  label="结束时间"
                  required
                >
                  <el-date-picker
                    v-model="form.endTime"
                    type="datetime"
                    value-format="YYYY-MM-DD HH:mm"
                    format="YYYY-MM-DD HH:mm"
                    placeholder="请选择结束时间"
                  />
                </el-form-item>
              </div>

              <div class="time-row time-row--single">
                <el-form-item label="休息时长（分）">
                  <el-input-number
                    v-model="form.breakMinutes"
                    :min="0"
                    :step="30"
                    controls-position="right"
                  />
                </el-form-item>
              </div>

              <el-form-item label="申请加班小时数">
                <div class="duration-box">
                  <strong>{{ computedOvertimeHours.toFixed(1) }} 小时</strong>
                  <span>{{ durationHint }}</span>
                </div>
              </el-form-item>

              <el-form-item label="加班原因">
                <el-input
                  v-model="form.overtimeReason"
                  type="textarea"
                  :rows="4"
                  placeholder="请填写加班原因，例如项目上线、紧急交付、客户支持等"
                />
              </el-form-item>

              <el-form-item label="备注">
                <el-input
                  v-model="form.remark"
                  type="textarea"
                  :rows="4"
                  placeholder="请填写加班事项说明、工作内容或交接安排"
                />
              </el-form-item>
            </el-form>
          </section>
        </main>
      </div>
    </div>
  </Layout>
</template>

<style scoped lang="scss">
:deep(.page-content) {
  padding-top: calc(50px + 16px) !important;
  padding-right: 16px !important;
  padding-bottom: 16px !important;
  padding-left: 16px !important;
  background: #f4f6fb;
}

.overtime-application-page {
  min-height: calc(100vh - 120px);
  color: #122448;
}

.page-toolbar,
.info-section {
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

.page-toolbar p,
.page-toolbar__tips {
  margin: 6px 0 0;
  color: #63718a;
  font-size: 12px;
}

.page-toolbar__tips {
  display: grid;
  gap: 4px;
  line-height: 1.7;
}

.page-toolbar__actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.application-layout {
  margin-top: 14px;
}

.application-main {
  display: grid;
  gap: 14px;
}

.section-heading {
  padding: 16px 18px;
  border-bottom: 1px solid #dce5f1;
  color: #122448;
  font-size: 15px;
  font-weight: 600;
}

.readonly-grid {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr) 160px minmax(0, 1fr);
  padding: 18px;
}

.readonly-cell {
  min-height: 34px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  border: 1px solid #e2e8f2;
  border-left: 0;
  color: #122448;
  font-size: 13px;
}

.readonly-cell:nth-child(4n + 1) {
  border-left: 1px solid #e2e8f2;
}

.readonly-cell--label {
  background: #f2f5fa;
  font-weight: 600;
}

.readonly-cell--span {
  grid-column: span 3;
}

.readonly-cell--wrap {
  min-height: 34px;
  line-height: 1.6;
  white-space: nowrap;
  word-break: keep-all;
  overflow-wrap: normal;
}

.overtime-form {
  padding: 18px;
}

.overtime-form :deep(.el-input),
.overtime-form :deep(.el-select),
.overtime-form :deep(.el-date-editor.el-input),
.overtime-form :deep(.el-time-editor.el-input),
.overtime-form :deep(.el-input-number),
.overtime-form :deep(.el-textarea) {
  width: 100%;
}

.time-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.time-row--single {
  grid-template-columns: minmax(0, 1fr);
  max-width: calc(50% - 12px);
}

.duration-box {
  width: 100%;
  min-height: 80px;
  padding: 14px 16px;
  border: 1px solid #f3c574;
  border-radius: 8px;
  background: #fff7e9;
}

.duration-box strong {
  display: block;
  color: #bf5b0c;
  font-size: 22px;
  line-height: 1.2;
}

.duration-box span {
  display: block;
  margin-top: 10px;
  color: #9b5e1e;
  font-size: 12px;
  line-height: 1.7;
}

@media (max-width: 1200px) {
  .time-row {
    grid-template-columns: 1fr;
  }

  .time-row--single {
    max-width: none;
  }

  .readonly-grid {
    grid-template-columns: 120px minmax(0, 1fr);
  }

  .readonly-cell--span {
    grid-column: span 1;
  }
}

@media (max-width: 768px) {
  :deep(.page-content) {
    padding-right: 12px !important;
    padding-left: 12px !important;
  }

  .page-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .page-toolbar__actions {
    width: 100%;
    flex-wrap: wrap;
  }
}
</style>
