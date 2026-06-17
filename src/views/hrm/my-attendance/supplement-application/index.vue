<!-- 补卡申请页，负责创建、保存和提交员工补签卡单。 -->
<script setup>
import dayjs from "dayjs";
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import Layout from "@/layouts/main";
import {
  querySupplementRequestSelfInit,
  saveSupplementRequestSelf,
} from "@/api/attendance";
import {
  buildSupplementSavePayload,
  createEmptySupplementItem,
  normalizeSupplementItem,
} from "@/views/hrm/my-attendance/utils/supplementDetail";

const route = useRoute();
const router = useRouter();

const employeeInfo = reactive({
  name: "",
  code: "",
  position: "",
  organization: "",
});

const supplementReasonOptions = ref([]);
const canApply = ref(true);
const disabledReason = ref("");
const saving = ref(false);
const editingSupplementRequestId = ref(null);

const defaultAttendanceTime = new Date(2000, 0, 1, 9, 0, 0);

const form = reactive({
  items: [createEmptySupplementItem()],
});

const resolvePresetAttendanceDateTime = () => {
  const sourceType = String(route.query.sourceType || "").trim();
  const sourceDateTime = String(route.query.sourceDateTime || "").trim();
  if (!sourceDateTime) {
    return "";
  }

  const parsed = dayjs(sourceDateTime);
  if (sourceType === "calendar") {
    if (!parsed.isValid()) {
      return "";
    }
    return `${parsed.format("YYYY-MM-DD")} ${dayjs(defaultAttendanceTime).format("HH:mm")}`;
  }

  if (sourceType === "punch-record") {
    if (!parsed.isValid()) {
      return sourceDateTime;
    }
    const hasExplicitTime = /(\d{1,2}:\d{2})(:\d{2})?/.test(sourceDateTime);
    if (hasExplicitTime) {
      return parsed.format("YYYY-MM-DD HH:mm");
    }
    return `${parsed.format("YYYY-MM-DD")} ${dayjs(defaultAttendanceTime).format("HH:mm")}`;
  }

  return "";
};

const fetchSupplementApplicationInit = async () => {
  try {
    const res = await querySupplementRequestSelfInit({}, { isLoading: true });
    const data = res?.data || {};
    const employee = data?.employee || {};

    employeeInfo.name = employee.talentName || "";
    employeeInfo.code = employee.talentCode || "";
    employeeInfo.organization = employee.deptName || "";
    employeeInfo.position = employee.positionName || "";

    canApply.value = data.canApply !== false;
    disabledReason.value = data.disabledReason || "";
    supplementReasonOptions.value = Array.isArray(data.supplementReasons)
      ? data.supplementReasons
      : [];

    const defaultDetail = data.defaultDetail || {};
    const presetAttendanceDateTime = resolvePresetAttendanceDateTime();
    form.items = [
      normalizeSupplementItem(
        presetAttendanceDateTime
          ? {
              attendanceDateTime: presetAttendanceDateTime,
              remark: "",
            }
          : {
              attendanceDateTime: defaultDetail.attendanceDateTime || "",
              remark: defaultDetail.remark || "",
            },
      ),
    ];
  } catch (error) {
    ElMessage.warning("补签初始化数据获取失败");
  }
};

onMounted(() => {
  fetchSupplementApplicationInit();
});

const validateForm = () => {
  if (!canApply.value) {
    ElMessage.warning(disabledReason.value || "当前不可申请补签");
    return false;
  }
  const item = form.items[0];
  if (!item?.attendanceTime) {
    ElMessage.warning("请选择考勤时间");
    return false;
  }
  if (!item?.reasonCode) {
    ElMessage.warning("请选择补签原因");
    return false;
  }
  return true;
};

const submitSupplementRequest = async (actionType) => {
  const item = form.items[0];
  const payload = buildSupplementSavePayload(item, {
    supplementRequestId: editingSupplementRequestId.value || undefined,
    talentCode: employeeInfo.code || undefined,
    actionType,
  });
  const res = await saveSupplementRequestSelf(payload, { isLoading: true });
  return res?.data || {};
};

const handleSave = async () => {
  if (!validateForm() || saving.value) {
    return;
  }
  saving.value = true;
  try {
    await submitSupplementRequest("save");
    ElMessage.success("补签草稿已保存");
    goSupplementList();
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
  ElMessageBox.confirm("确认提交当前补签申请并进入审批流程？", "提交确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      saving.value = true;
      try {
        await submitSupplementRequest("submit");
        ElMessage.success("补签申请已提交审批");
        goSupplementList();
      } catch (error) {
        console.log(error);
      } finally {
        saving.value = false;
      }
    })
    .catch(() => {});
};

const goSupplementList = () => {
  router.push({ name: "my-supplement-list" });
};
</script>

<template>
  <Layout>
    <div class="supplement-application-page">
      <div class="page-toolbar">
        <div>
          <h2>我要补卡</h2>
          <p
            v-if="!canApply && disabledReason"
            class="page-toolbar__warning"
          >
            {{ disabledReason }}
          </p>
        </div>
        <div class="page-toolbar__actions">
          <el-button
            type="primary"
            :loading="saving"
            :disabled="!canApply"
            @click="handleSave"
          >
            保存
          </el-button>
          <el-button
            type="primary"
            :loading="saving"
            :disabled="!canApply"
            @click="handleSubmit"
          >
            提交
          </el-button>
          <el-button
            type="primary"
            plain
            @click="goSupplementList"
          >
            补签卡列表
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
              <div class="readonly-cell readonly-cell--wrap">
                {{ employeeInfo.position }}
              </div>
            </div>
          </section>

          <section class="info-section supplement-form-section">
            <div class="section-heading">补签信息</div>
            <el-form label-width="108px" label-position="left">
              <div class="supplement-item">
                <div class="form-grid">
                  <el-form-item label="考勤时间" required>
                    <el-date-picker
                      v-model="form.items[0].attendanceTime"
                      type="datetime"
                      value-format="YYYY-MM-DD HH:mm"
                      format="YYYY-MM-DD HH:mm"
                      placeholder="请选择考勤时间"
                      :default-time="defaultAttendanceTime"
                      :disabled="!canApply"
                    />
                  </el-form-item>
                  <el-form-item label="补签原因" required>
                    <el-select
                      v-model="form.items[0].reasonCode"
                      placeholder="请选择补签原因"
                      :disabled="!canApply"
                    >
                      <el-option
                        v-for="reason in supplementReasonOptions"
                        :key="reason.reasonCode"
                        :label="reason.reasonName"
                        :value="reason.reasonCode"
                      />
                    </el-select>
                  </el-form-item>
                </div>

                <el-form-item label="备注">
                  <el-input
                    v-model="form.items[0].remark"
                    type="textarea"
                    :rows="3"
                    placeholder="请填写异常说明、补充依据或其他需要说明的信息"
                    :disabled="!canApply"
                  />
                </el-form-item>
              </div>
            </el-form>
          </section>
        </main>
      </div>
    </div>
  </Layout>
</template>

<style lang="scss" scoped>
:deep(.page-content) {
  padding-top: calc(50px + 16px) !important;
  padding-right: 16px !important;
  padding-bottom: 16px !important;
  padding-left: 16px !important;
  background: #f4f6fb;
}

.supplement-application-page {
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

.page-toolbar p {
  margin: 6px 0 0;
  color: #63718a;
  font-size: 12px;
}

.page-toolbar__warning {
  color: #c45656;
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

.readonly-cell--wrap {
  min-height: 34px;
  line-height: 1.6;
  white-space: nowrap;
  word-break: keep-all;
  overflow-wrap: normal;
}

.supplement-form-section :deep(.el-form) {
  padding: 18px;
}

.supplement-item {
  padding: 16px;
  border: 1px solid #e2e8f2;
  border-radius: 4px;
  background: #fbfcff;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 24px;
}

.form-grid :deep(.el-date-editor.el-input),
.form-grid :deep(.el-select) {
  width: 100%;
}

@media (max-width: 1200px) {
  .readonly-grid {
    grid-template-columns: 120px minmax(0, 1fr);
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

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
