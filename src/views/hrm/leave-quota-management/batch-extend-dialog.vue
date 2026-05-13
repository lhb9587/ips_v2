<!-- 假期额度批量延期弹窗，负责收集延期范围、周期条件、员工范围与延期方式。 -->
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
  targetType: "condition",
  leaveTypeCode: "",
  periodMode: "exact",
  periodStartDate: "",
  periodEndDate: "",
  employeeScope: "allWithinRange",
  employees: [],
  extensionType: "fixedDate",
  fixedDate: "",
  monthCount: 1,
  reason: "",
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

const targetOptions = [
  {
    value: "all",
    title: "对列表中所有记录进行延期",
    description: "复用当前列表查询范围，统一延期。",
  },
  {
    value: "selected",
    title: "对列表中选中的记录延期",
    description: "仅处理列表里手动勾选的记录。",
  },
  {
    value: "condition",
    title: "按条件筛选记录延期",
    description: "按假期类型、周期和员工范围筛选后延期。",
  },
];

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

const showConditionFields = computed(() => formData.targetType === "condition");

const resetForm = () => {
  Object.assign(formData, createDefaultForm());
};

const resetCandidateQuery = () => {
  Object.assign(candidateQuery, createDefaultCandidateQuery());
};

const clearCandidateSelection = () => {
  selectedCandidates.value = [];
  nextTick(() => {
    candidateTableRef.value?.clearSelection?.();
  });
};

watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      resetForm();
      resetCandidateQuery();
      candidateList.value = [];
      candidateTotal.value = 0;
      clearCandidateSelection();
    }
  },
);

watch(
  () => formData.extensionType,
  (type) => {
    if (type === "fixedDate") {
      formData.monthCount = 1;
      return;
    }
    formData.fixedDate = "";
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
      deptCodes: candidateQuery.deptCodes.length
        ? candidateQuery.deptCodes
        : undefined,
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

const selectTargetType = (value) => {
  formData.targetType = value;
};

const closeDialog = () => {
  dialogVisible.value = false;
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
  emit("confirm", { ...formData });
};
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="批量延期"
    width="860px"
    destroy-on-close
    append-to-body
  >
    <div class="batch-extend">
      <div
        class="batch-extend__target-group"
        role="radiogroup"
        aria-label="延期范围"
      >
        <button
          v-for="item in targetOptions"
          :key="item.value"
          type="button"
          class="target-option"
          :class="{ 'target-option--active': formData.targetType === item.value }"
          role="radio"
          :aria-checked="formData.targetType === item.value"
          @click="selectTargetType(item.value)"
        >
          <span class="target-option__marker"></span>
          <span class="target-option__content">
            <span class="target-option__title">{{ item.title }}</span>
            <span class="target-option__desc">{{ item.description }}</span>
          </span>
        </button>
      </div>

      <div
        v-if="showConditionFields"
        class="batch-extend__condition"
      >
        <div class="form-row">
          <div class="form-label">假期类型</div>
          <div class="form-content">
            <el-select
              v-model="formData.leaveTypeCode"
              placeholder="请选择假期类型"
              clearable
              style="width: 280px"
            >
              <el-option
                v-for="item in leaveTypeOptions"
                :key="item.leaveTypeCode || item"
                :label="item.leaveTypeName || item"
                :value="item.leaveTypeCode || item"
              />
            </el-select>
          </div>
        </div>

        <div class="form-row form-row--top">
          <div class="form-label">周期选择</div>
          <div class="form-content form-content--column">
            <el-radio-group v-model="formData.periodMode">
              <el-radio label="exact">精确匹配周期</el-radio>
              <el-radio label="latest">最新有效周期</el-radio>
            </el-radio-group>

            <div
              v-if="formData.periodMode === 'exact'"
              class="period-range"
            >
              <div class="period-range__item">
                <span class="period-range__label">开始日期</span>
                <el-date-picker
                  v-model="formData.periodStartDate"
                  type="date"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  placeholder="请选择日期"
                  style="width: 220px"
                />
              </div>
              <div class="period-range__item">
                <span class="period-range__label">结束日期</span>
                <el-date-picker
                  v-model="formData.periodEndDate"
                  type="date"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  placeholder="请选择日期"
                  style="width: 220px"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="form-row form-row--top">
          <div class="form-label">员工范围</div>
          <div class="form-content form-content--column">
            <el-radio-group v-model="formData.employeeScope">
              <el-radio label="allWithinRange">权限范围内所有员工</el-radio>
              <el-radio label="specifiedEmployees">更新指定人延期日期</el-radio>
            </el-radio-group>

            <div
              v-if="formData.employeeScope === 'specifiedEmployees'"
              class="specified-employees"
            >
              <el-input
                :model-value="employeeNames"
                placeholder="请选择员工"
                readonly
                style="width: 280px"
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
        </div>
      </div>

      <div class="batch-extend__method">
        <el-radio-group
          v-model="formData.extensionType"
          class="batch-extend__method-group"
        >
          <div class="method-row">
            <el-radio label="fixedDate">延期到日期</el-radio>
            <el-date-picker
              v-model="formData.fixedDate"
              :disabled="formData.extensionType !== 'fixedDate'"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              placeholder="请选择日期"
              style="width: 280px"
            />
          </div>
          <div class="method-row">
            <el-radio label="byMonths">按月延期</el-radio>
            <el-input-number
              v-model="formData.monthCount"
              :disabled="formData.extensionType !== 'byMonths'"
              :min="1"
              :step="1"
              :precision="0"
              controls-position="right"
              style="width: 280px"
            />
          </div>
        </el-radio-group>
      </div>

      <div class="batch-extend__condition">
        <div class="form-row form-row--top">
          <div class="form-label">延期原因</div>
          <div class="form-content">
            <el-input
              v-model="formData.reason"
              type="textarea"
              :rows="3"
              maxlength="200"
              show-word-limit
              placeholder="请输入延期原因"
            />
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="batch-extend__footer">
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
  </el-dialog>
</template>

<style scoped lang="scss">
.batch-extend {
  padding: 4px 8px 0;
}

.batch-extend__target-group {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.target-option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #dce3f0;
  border-radius: 8px;
  background: #fff;
  text-align: left;
  transition: all 0.2s ease;
}

.target-option:hover {
  border-color: #8aa4d6;
  background: #f8fbff;
}

.target-option--active {
  border-color: #4f80c2;
  background: #eef5ff;
  box-shadow: 0 0 0 1px rgba(79, 128, 194, 0.12);
}

.target-option__marker {
  position: relative;
  flex: 0 0 18px;
  width: 18px;
  height: 18px;
  margin-top: 2px;
  border: 1px solid #b7c3d7;
  border-radius: 50%;
  background: #fff;
}

.target-option--active .target-option__marker {
  border-color: #4f80c2;
}

.target-option--active .target-option__marker::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4f80c2;
  transform: translate(-50%, -50%);
}

.target-option__content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.target-option__title {
  color: #1f2d49;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
}

.target-option__desc {
  color: #7b879c;
  font-size: 12px;
  line-height: 1.5;
}

.batch-extend__condition,
.batch-extend__method {
  margin-top: 20px;
  padding-left: 28px;
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
}

.form-row--top {
  align-items: flex-start;
}

.form-label {
  width: 96px;
  flex: 0 0 96px;
  color: #606266;
  line-height: 32px;
}

.form-content {
  flex: 1;
  min-width: 0;
}

.form-content--column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
}

.period-range {
  display: flex;
  align-items: center;
  gap: 48px;
  flex-wrap: wrap;
}

.period-range__item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.period-range__label {
  color: #606266;
}

.specified-employees {
  width: 280px;
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

.batch-extend__method-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
}

.method-row {
  display: flex;
  align-items: center;
  gap: 18px;
}

.batch-extend__footer {
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
  .batch-extend__target-group {
    grid-template-columns: 1fr;
  }

  .batch-extend__condition,
  .batch-extend__method {
    padding-left: 0;
  }

  .candidate-toolbar {
    flex-direction: column;
  }

  .candidate-toolbar__field,
  .candidate-toolbar__dept,
  .specified-employees {
    width: 100%;
  }
}
</style>
