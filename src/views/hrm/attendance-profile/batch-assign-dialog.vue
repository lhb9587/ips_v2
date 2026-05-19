<!-- 考勤档案批量赋值弹窗，负责选择员工范围并提交默认班次与打卡考勤配置。 -->
<script setup>
import { computed, nextTick, reactive, ref, watch, defineProps, defineEmits} from "vue";
import { ElMessage } from "element-plus";
import Pagination from "@/components/common/pagination/index.vue";
import { queryAttendanceGroupMemberCandidatePage } from "@/api/attendance";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  organizationOptions: {
    type: Array,
    default: () => [],
  },
  shiftOptions: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue", "confirm"]);

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const createDefaultForm = () => ({
  employees: [],
  processMode: "correct",
  defaultShiftCode: "",
  defaultShiftName: "",
  isPunchAttendance: 1,
  effectiveDate: "",
});

const createDefaultCandidateQuery = () => ({
  talentCode: "",
  talentName: "",
  deptCodes: [],
  pageNo: 1,
  pageSize: 10,
});

const formData = reactive(createDefaultForm());
const employeeDialogVisible = ref(false);
const shiftDialogVisible = ref(false);
const candidateLoading = ref(false);
const candidateList = ref([]);
const candidateTotal = ref(0);
const candidateTableRef = ref(null);
const selectedCandidates = ref([]);
const candidateQuery = reactive(createDefaultCandidateQuery());

const mapDepartmentOptions = (list = []) =>
  list.map((item) => ({
    value: item.organizationCode || item.deptId,
    label: item.organizationName || item.deptName,
    children: Array.isArray(item.children) ? mapDepartmentOptions(item.children) : [],
  }));

const departmentCascaderOptions = computed(() =>
  mapDepartmentOptions(props.organizationOptions || []),
);

const employeeNames = computed(() =>
  formData.employees.map((item) => item.employeeName).join("，"),
);

const clearCandidateSelection = () => {
  selectedCandidates.value = [];
  nextTick(() => {
    candidateTableRef.value?.clearSelection?.();
  });
};

const resetCandidateQuery = () => {
  Object.assign(candidateQuery, createDefaultCandidateQuery());
};

const resetDialogState = () => {
  Object.assign(formData, createDefaultForm());
  employeeDialogVisible.value = false;
  shiftDialogVisible.value = false;
  candidateList.value = [];
  candidateTotal.value = 0;
  resetCandidateQuery();
  clearCandidateSelection();
};

watch(
  () => props.modelValue,
  (visible) => {
    if (!visible) {
      resetDialogState();
    }
  },
);

const mapCandidate = (item) => ({
  employeeCode: item.talentCode || item.employeeCode || "",
  employeeName: item.talentName || item.employeeName || "",
  attendancePosition: item.posName || item.positionName || item.posId || "",
  attendanceOrganization: item.deptName || item.organizationName || "",
  empStatus: item.empStatus || "",
});

const fetchCandidateList = () => {
  candidateLoading.value = true;
  queryAttendanceGroupMemberCandidatePage(
    {
      deptCodes: candidateQuery.deptCodes.length ? candidateQuery.deptCodes : undefined,
      talentCode: candidateQuery.talentCode || undefined,
      talentName: candidateQuery.talentName || undefined,
      pageNo: candidateQuery.pageNo,
      pageSize: candidateQuery.pageSize,
    },
    {
      isLoading: false,
    },
  )
    .then((res) => {
      const records = Array.isArray(res?.data) ? res.data : res?.data?.records || [];
      candidateList.value = records.map((item) => {
        const record = mapCandidate(item);
        return {
          ...record,
          selectionDisabled: formData.employees.some(
            (employee) => employee.employeeCode === record.employeeCode,
          ),
        };
      });
      candidateTotal.value = Number(res?.total) || Number(res?.data?.total) || 0;
      if (Number(res?.currPage)) {
        candidateQuery.pageNo = Number(res.currPage);
      }
      clearCandidateSelection();
    })
    .finally(() => {
      candidateLoading.value = false;
    });
};

const openEmployeeDialog = () => {
  resetCandidateQuery();
  employeeDialogVisible.value = true;
  fetchCandidateList();
};

const handleEmployeeSelection = (rows) => {
  selectedCandidates.value = rows;
};

const handleCandidateSearch = () => {
  candidateQuery.pageNo = 1;
  fetchCandidateList();
};

const handleCandidateDeptChange = (value) => {
  candidateQuery.deptCodes = Array.isArray(value) ? value : [];
  candidateQuery.pageNo = 1;
  fetchCandidateList();
};

const handleCandidatePagination = () => {
  fetchCandidateList();
};

const candidateRowSelectable = (row) => !row.selectionDisabled;

const confirmEmployees = () => {
  if (selectedCandidates.value.length === 0) {
    ElMessage.warning("请先选择员工");
    return;
  }
  const employeeMap = new Map(formData.employees.map((item) => [item.employeeCode, item]));
  selectedCandidates.value.forEach((item) => {
    employeeMap.set(item.employeeCode, {
      employeeCode: item.employeeCode,
      employeeName: item.employeeName,
    });
  });
  formData.employees = [...employeeMap.values()];
  employeeDialogVisible.value = false;
  selectedCandidates.value = [];
};

const clearEmployees = () => {
  formData.employees = [];
};

const openShiftDialog = () => {
  shiftDialogVisible.value = true;
};

const chooseShift = (row) => {
  formData.defaultShiftCode = row.shiftCode || "";
  formData.defaultShiftName = row.shiftName || "";
  shiftDialogVisible.value = false;
};

const handleConfirm = () => {
  if (formData.employees.length === 0) {
    ElMessage.warning("请选择员工");
    return;
  }
  if (!formData.defaultShiftCode) {
    ElMessage.warning("请选择默认班次");
    return;
  }
  if (formData.processMode === "change" && !formData.effectiveDate) {
    ElMessage.warning("请选择生效日期");
    return;
  }

  emit("confirm", {
    processMode: formData.processMode,
    defaultShiftCode: formData.defaultShiftCode,
    isPunchAttendance: Number(formData.isPunchAttendance),
    effectiveDate: formData.processMode === "change" ? formData.effectiveDate : undefined,
    talentCodes: formData.employees.map((item) => item.employeeCode),
  });
};

const closeDialog = () => {
  dialogVisible.value = false;
};
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="批量赋值"
    width="700px"
    destroy-on-close
    append-to-body
    class="attendance-profile-batch-assign-dialog"
  >
    <div class="batch-assign">
      <div class="batch-assign__tips">
        温馨提示：纠正档案信息：对不准确的档案信息进行纠正，即修改最新的档案信息，不产生新的档案历史记录；<br/>
        变更档案信息：档案信息从“生效日期”时间点发生变更，变更将会产生新的档案历史记录。
      </div>
      <div class="batch-assign__panel">
        <div class="batch-assign__section">
          <div class="batch-assign__section-title">人员范围</div>
          <div class="batch-assign__content">
            <div class="batch-assign__inline-field">
              <div class="batch-assign__inline-label">人员</div>
              <el-input
                :model-value="employeeNames"
                placeholder="请选择员工"
                readonly
                @click="openEmployeeDialog"
              >
                <template #suffix>
                  <i
                    v-if="formData.employees.length"
                    class="mdi mdi-close-circle batch-assign__icon"
                    @click.stop="clearEmployees"
                  ></i>
                  <i
                    v-else
                    class="mdi mdi-menu batch-assign__icon"
                  ></i>
                </template>
              </el-input>
            </div>
          </div>
        </div>

        <div class="batch-assign__section">
          <div class="batch-assign__section-title">赋值字段</div>
          <div class="batch-assign__content batch-assign__content--stack">
            <div class="batch-assign__inline-field">
              <div class="batch-assign__inline-label">档案信息处理</div>
              <el-radio-group v-model="formData.processMode">
                <el-radio value="correct">纠正档案信息</el-radio>
                <el-radio value="change">变更档案信息</el-radio>
              </el-radio-group>
            </div>

            <div
              v-if="formData.processMode === 'change'"
              class="batch-assign__inline-field"
            >
              <div class="batch-assign__inline-label">生效日期</div>
              <el-date-picker
                v-model="formData.effectiveDate"
                type="date"
                value-format="YYYY-MM-DD"
                format="YYYY-MM-DD"
                placeholder="请选择生效日期"
                style="width: 240px"
              />
            </div>

            <div class="batch-assign__inline-field">
              <div class="batch-assign__inline-label">默认班次</div>
              <el-input
                :model-value="formData.defaultShiftName"
                placeholder="请选择默认班次"
                readonly
                style="max-width: 360px"
                @click="openShiftDialog"
              >
                <template #append>
                  <el-button @click="openShiftDialog">选择</el-button>
                </template>
              </el-input>
            </div>

            <div class="batch-assign__inline-field">
              <div class="batch-assign__inline-label">打卡考勤</div>
              <el-radio-group v-model="formData.isPunchAttendance">
                <el-radio :value="1">是</el-radio>
                <el-radio :value="0">否</el-radio>
              </el-radio-group>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="batch-assign__footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button
          type="primary"
          @click="handleConfirm"
        >
          确定
        </el-button>
      </div>
    </template>

    <el-dialog
      v-model="employeeDialogVisible"
      title="选择员工"
      width="860px"
      append-to-body
    >
      <div class="candidate-toolbar">
        <el-input
          v-model="candidateQuery.talentCode"
          class="candidate-toolbar__field"
          placeholder="请输入员工编码"
          clearable
          @keyup.enter="handleCandidateSearch"
        />
        <el-input
          v-model="candidateQuery.talentName"
          class="candidate-toolbar__field"
          placeholder="请输入员工姓名"
          clearable
          @keyup.enter="handleCandidateSearch"
        >
          <template #prepend>
            <el-button @click="handleCandidateSearch">
              <i class="bx bx-search-alt"></i>
            </el-button>
          </template>
        </el-input>
        <el-cascader
          v-model="candidateQuery.deptCodes"
          class="candidate-toolbar__dept"
          :options="departmentCascaderOptions"
          :props="{ multiple: true, emitPath: false }"
          collapse-tags
          collapse-tags-tooltip
          clearable
          filterable
          :show-all-levels="false"
          placeholder="请选择部门"
          @change="handleCandidateDeptChange"
        />
        <el-button
          type="primary"
          @click="handleCandidateSearch"
        >
          搜索
        </el-button>
      </div>
      <el-table
        ref="candidateTableRef"
        :data="candidateList"
        border
        height="420"
        v-loading="candidateLoading"
        row-key="employeeCode"
        @selection-change="handleEmployeeSelection"
      >
        <el-table-column
          type="selection"
          width="50"
          :selectable="candidateRowSelectable"
        />
        <el-table-column
          prop="employeeCode"
          label="员工编码"
          min-width="110"
        />
        <el-table-column
          prop="employeeName"
          label="姓名"
          min-width="100"
        />
        <el-table-column
          prop="attendancePosition"
          label="考勤职位"
          min-width="130"
        />
        <el-table-column
          prop="attendanceOrganization"
          label="考勤组织"
          min-width="160"
        />
        <el-table-column
          prop="empStatus"
          label="状态"
          min-width="100"
        />
      </el-table>
      <div class="candidate-pagination">
        <Pagination
          :total="candidateTotal"
          v-model:page="candidateQuery.pageNo"
          v-model:limit="candidateQuery.pageSize"
          :pageSizes="[10, 20, 50, 100]"
          :storage="false"
          @pagination="handleCandidatePagination"
        />
      </div>
      <template #footer>
        <el-button @click="employeeDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="confirmEmployees"
        >
          确定
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="shiftDialogVisible"
      title="选择班次"
      width="1100px"
      append-to-body
      destroy-on-close
      class="attendance-profile-shift-dialog"
    >
      <div class="attendance-profile-dialog__body">
        <div class="attendance-profile-dialog__table-wrap">
          <el-table
            :data="shiftOptions"
            border
            height="420"
            highlight-current-row
            @row-dblclick="chooseShift"
          >
            <el-table-column
              type="index"
              label="序号"
              width="60"
            />
            <el-table-column
              prop="shiftCode"
              label="班次编码"
              min-width="120"
            />
            <el-table-column
              prop="shiftName"
              label="班次名称"
              min-width="180"
            />
            <el-table-column
              prop="overtimePayType"
              label="加班补偿方式"
              min-width="140"
            />
            <el-table-column
              prop="applicableFrequency"
              label="适用段次"
              min-width="120"
            />
            <el-table-column
              prop="cardRule"
              label="取卡规则"
              min-width="160"
            />
            <el-table-column
              prop="standardWorkHours"
              label="标准工时"
              min-width="120"
            />
            <el-table-column
              prop="organizationName"
              label="组织"
              min-width="140"
            />
            <el-table-column
              label="操作"
              fixed="right"
              width="90"
            >
              <template #default="{ row }">
                <el-button
                  type="primary"
                  link
                  @click="chooseShift(row)"
                >
                  选择
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<style scoped lang="scss">
.batch-assign {
  padding: 4px 8px 0;
}

.batch-assign__tips {
  margin-bottom: 16px;
  color: #d03050;
  font-size: 13px;
  line-height: 1.7;
}

.batch-assign__panel {
  display: grid;
  gap: 20px;
}

.batch-assign__section {
  display: grid;
  gap: 14px;
}

.batch-assign__section-title {
  position: relative;
  padding-left: 12px;
  color: #243449;
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
}

.batch-assign__section-title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 4px;
  width: 4px;
  height: 14px;
  border-radius: 999px;
  background: #4f80c2;
}

.batch-assign__content {
  min-width: 0;
  padding: 16px;
  border: 1px solid #e7edf5;
  border-radius: 8px;
  background: #fbfcfe;
}

.batch-assign__content--stack {
  display: grid;
  gap: 16px;
}

.batch-assign__inline-field {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.batch-assign__inline-label {
  flex: 0 0 108px;
  color: #606266;
  line-height: 32px;
}

.batch-assign__icon {
  color: #909399;
}

.batch-assign__footer {
  display: flex;
  justify-content: flex-end;
}

.candidate-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.candidate-toolbar__field {
  width: 220px;
}

.candidate-toolbar__dept {
  width: 260px;
}

.candidate-pagination {
  margin-top: 16px;
}

.attendance-profile-dialog__body,
.attendance-profile-dialog__table-wrap {
  width: 100%;
}

.attendance-profile-dialog__table-wrap {
  border: 1px solid #e7edf5;
  border-radius: 4px;
  overflow: hidden;
}

:deep(.attendance-profile-batch-assign-dialog .el-input-group__append),
:deep(.attendance-profile-shift-dialog .el-input-group__append) {
  padding: 0;
  background: #f6f9fc;
}

:deep(.attendance-profile-shift-dialog .el-dialog__body) {
  padding-top: 14px;
}

:deep(.attendance-profile-shift-dialog .el-table th.el-table__cell) {
  background: #f6f8fb;
  color: #243449;
}

@media (max-width: 900px) {
  .batch-assign__inline-field,
  .candidate-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .batch-assign__inline-label {
    flex-basis: auto;
  }

  .candidate-toolbar__field {
    width: 100%;
  }

  .candidate-toolbar__dept {
    width: 100%;
  }
}
</style>
