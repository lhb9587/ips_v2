<!-- 假期额度生成弹窗，负责收集员工、假期类型与基准日期并提交生成参数。 -->
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
  leaveTypeOptions: {
    type: Array,
    default: () => [],
  },
  organizationOptions: {
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
  leaveTypeCodes: [],
  periodStartDate: "",
  overwriteMode: "SKIP_EXISTING",
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

const mapCandidate = (item) => ({
  employeeCode: item.talentCode || item.employeeCode || "",
  employeeName: item.talentName || item.employeeName || "",
  attendancePosition: item.posName || item.positionName || item.posId || "",
  attendanceOrganization: item.deptName || item.organizationName || "",
  empStatus: item.empStatus || "",
});

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

const closeDialog = () => {
  dialogVisible.value = false;
};

const fetchCandidateList = () => {
  candidateLoading.value = true;
  queryAttendanceGroupMemberCandidatePage(
    {
      deptCodes: candidateQuery.deptCodes.length
        ? candidateQuery.deptCodes
        : undefined,
      talentCode: candidateQuery.talentCode || undefined,
      talentName: candidateQuery.talentName || undefined,
      pageNo: candidateQuery.pageNo,
      pageSize: candidateQuery.pageSize,
      hasAttendanceArchive: true,
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
  const employeeMap = new Map(
    formData.employees.map((item) => [item.employeeCode, item]),
  );
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

const handleConfirm = () => {
  if (formData.employees.length === 0) {
    ElMessage.warning("请选择员工");
    return;
  }
  if (!formData.periodStartDate) {
    ElMessage.warning("请选择基准日期");
    return;
  }
  if (formData.leaveTypeCodes.length === 0) {
    ElMessage.warning("请选择假期类型");
    return;
  }
  emit("confirm", {
    periodStartDate: formData.periodStartDate,
    overwriteMode: formData.overwriteMode,
    talentCodes: formData.employees.map((item) => item.employeeCode),
    leaveTypeCodes: [...formData.leaveTypeCodes],
  });
};
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="生成额度"
    width="960px"
    destroy-on-close
    append-to-body
  >
    <div class="generate-quota">
      <div class="generate-quota__grid">
        <div class="form-row">
          <div class="form-label">员工</div>
          <div class="form-content">
            <el-input
              :model-value="employeeNames"
              placeholder="请选择员工"
              readonly
              style="width: 100%"
              @click="openEmployeeDialog"
            >
              <template #suffix>
                <i
                  v-if="formData.employees.length"
                  class="mdi mdi-close-circle employee-clear"
                  @click.stop="clearEmployees"
                ></i>
                <i
                  v-else
                  class="mdi mdi-menu employee-picker"
                ></i>
              </template>
            </el-input>
          </div>
        </div>

        <div class="form-row">
          <div class="form-label">基准日期</div>
          <div class="form-content">
            <el-date-picker
              v-model="formData.periodStartDate"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              placeholder="请选择基准日期"
              style="width: 100%"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-label">假期类型</div>
          <div class="form-content">
            <el-select
              v-model="formData.leaveTypeCodes"
              multiple
              collapse-tags
              collapse-tags-tooltip
              clearable
              placeholder="请选择假期类型"
              style="width: 100%"
            >
              <el-option
                v-for="item in leaveTypeOptions"
                :key="item.leaveTypeCode"
                :label="item.leaveTypeName"
                :value="item.leaveTypeCode"
              />
            </el-select>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="generate-quota__footer">
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
        <el-input
          v-model="candidateQuery.talentCode"
          class="candidate-toolbar__field"
          placeholder="请输入员工编码"
          clearable
          @keyup.enter="handleCandidateSearch"
        />
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
  </el-dialog>
</template>

<style scoped lang="scss">
.generate-quota {
  padding: 4px 8px 0;
}

.generate-quota__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 64px;
  row-gap: 18px;
}

.form-row {
  display: flex;
  align-items: center;
  min-width: 0;
}

.form-label {
  flex: 0 0 150px;
  color: #606266;
  line-height: 32px;
  text-align: right;
  padding-right: 18px;
}

.form-content {
  flex: 1;
  min-width: 0;
  max-width: 100%;
}

.employee-clear,
.employee-picker {
  color: #909399;
}

.employee-clear {
  cursor: pointer;
}

.employee-clear:hover {
  color: #409eff;
}

.generate-quota__footer {
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

@media (max-width: 900px) {
  .generate-quota__grid {
    grid-template-columns: 1fr;
    row-gap: 14px;
  }

  .form-label {
    flex-basis: 132px;
  }

  .candidate-toolbar {
    flex-direction: column;
  }

  .candidate-toolbar__field,
  .candidate-toolbar__dept {
    width: 100%;
  }
}
</style>
