<script setup>
import { computed, defineEmits, defineProps, nextTick, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import Pagination from "@/components/common/pagination/index.vue";
import {
  queryAttendanceGroupDetail,
  queryAttendanceGroupMemberCandidatePage,
} from "@/api/attendance";

const props = defineProps({
  detailInfo: {
    type: Object,
    default: () => ({}),
  },
  mode: {
    type: String,
    default: "view",
  },
  organizationOptions: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["close", "save", "delete", "member-page-change"]);

const isEditing = ref(false);
const formData = ref({});
const organizationDialogVisible = ref(false);
const employeeDialogVisible = ref(false);
const selectedEmployees = ref([]);
const memberLoading = ref(false);
const candidateLoading = ref(false);
const candidateList = ref([]);
const candidateTotal = ref(0);
const candidateTableRef = ref(null);
const memberPagination = ref({
  pageNo: 1,
  pageSize: 20,
});
const candidateQuery = ref({
  talentCode: "",
  talentName: "",
  deptCodes: [],
  pageNo: 1,
  pageSize: 10,
});

const buildMemberRecord = (item = {}) => ({
  employeeCode: item.employeeCode || item.talentCode || "",
  employeeName: item.employeeName || item.talentName || "",
  attendancePosition: item.attendancePosition || item.posName || "",
  attendanceOrganization: item.attendanceOrganization || item.deptName || "",
});

const syncFormData = (detailInfo) => {
  formData.value = {
    id: detailInfo.id,
    code: detailInfo.code || "",
    name: detailInfo.name || "",
    organizationCode: detailInfo.organizationCode || "",
    organizationName: detailInfo.organizationName || "",
    remark: detailInfo.remark || "",
    members: Array.isArray(detailInfo.members)
      ? detailInfo.members.map((item) => buildMemberRecord(item))
      : [],
    allMembers: Array.isArray(detailInfo.allMembers)
      ? detailInfo.allMembers.map((item) => buildMemberRecord(item))
      : Array.isArray(detailInfo.members)
        ? detailInfo.members.map((item) => buildMemberRecord(item))
        : [],
    memberTotal: Number(detailInfo.memberTotal) || 0,
    referenced: Boolean(detailInfo.referenced),
  };
  memberPagination.value = {
    pageNo: Number(detailInfo.memberPageNo) || 1,
    pageSize: Number(detailInfo.memberPageSize) || 20,
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
  props.mode === "create" ? "创建考勤组" : "考勤组详情",
);

const allowBaseInfoEdit = computed(() => props.mode === "create");
const memberTotal = computed(() =>
  isEditing.value
    ? (formData.value.allMembers || []).length
    : Number(formData.value.memberTotal) || 0,
);
const displayedMembers = computed(() => {
  if (!isEditing.value) {
    return formData.value.members || [];
  }

  const allMembers = formData.value.allMembers || [];
  const pageNo = Number(memberPagination.value.pageNo) || 1;
  const pageSize = Number(memberPagination.value.pageSize) || 20;
  const startIndex = (pageNo - 1) * pageSize;
  return allMembers.slice(startIndex, startIndex + pageSize);
});

const selectableEmployees = computed(() => {
  const existingCodes = new Set(
    (formData.value.allMembers || formData.value.members || []).map(
      (item) => item.employeeCode,
    ),
  );

  return candidateList.value.map((item) => ({
    ...item,
    selectionDisabled: existingCodes.has(item.employeeCode),
  }));
});

const mapDepartmentOptions = (list = []) =>
  list.map((item) => ({
    value: item.organizationCode || item.deptCode || item.deptId || item.value,
    label: item.organizationName || item.deptName || item.label,
    children: Array.isArray(item.children) ? mapDepartmentOptions(item.children) : [],
  }));

const departmentCascaderOptions = computed(() =>
  mapDepartmentOptions(props.organizationOptions || []),
);

const closeSidebar = () => {
  isEditing.value = false;
  emit("close");
};

const loadAllMembersForEdit = async () => {
  if (!formData.value.id) {
    return;
  }

  const pageSize = 200;
  let pageNo = 1;
  let total = 0;
  const allMembers = [];

  memberLoading.value = true;
  try {
    do {
      const res = await queryAttendanceGroupDetail(
        {
          groupId: formData.value.id,
          pageNo,
          pageSize,
        },
        {
          isLoading: false,
        },
      );
      const memberData = res?.data?.members || {};
      const records = Array.isArray(memberData.records) ? memberData.records : [];
      allMembers.push(...records.map((item) => buildMemberRecord(item)));
      total = Number(memberData.total) || allMembers.length;
      pageNo += 1;
    } while (allMembers.length < total);

    formData.value.allMembers = allMembers;
    formData.value.memberTotal = total;
  } finally {
    memberLoading.value = false;
  }
};

const startEdit = async () => {
  syncFormData(props.detailInfo || {});
  if (props.mode !== "create") {
    await loadAllMembersForEdit();
  }
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

const chooseOrganization = (row) => {
  formData.value.organizationCode = row.organizationCode;
  formData.value.organizationName = row.organizationName;
  organizationDialogVisible.value = false;
};

const handleEmployeeSelection = (rows) => {
  selectedEmployees.value = rows;
};

const clearCandidateSelection = () => {
  selectedEmployees.value = [];
  nextTick(() => {
    candidateTableRef.value?.clearSelection?.();
  });
};

const openEmployeeDialog = () => {
  if (!isEditing.value) {
    return;
  }
  clearCandidateSelection();
  candidateQuery.value = {
    talentCode: "",
    talentName: "",
    deptCodes: [],
    pageNo: 1,
    pageSize: 10,
  };
  employeeDialogVisible.value = true;
  fetchCandidateList();
};

const addSelectedEmployees = () => {
  if (selectedEmployees.value.length === 0) {
    return ElMessage.warning("请先选择需要加入考勤组的员工");
  }

  formData.value.allMembers = [
    ...(formData.value.allMembers || []),
    ...selectedEmployees.value.map((item) => ({ ...item })),
  ];
  formData.value.memberTotal = formData.value.allMembers.length;
  memberPagination.value.pageNo = Math.max(
    1,
    Math.ceil(formData.value.allMembers.length / memberPagination.value.pageSize),
  );
  employeeDialogVisible.value = false;
  selectedEmployees.value = [];
};

const removeMember = (row) => {
  formData.value.allMembers = (formData.value.allMembers || []).filter(
    (item) => item.employeeCode !== row.employeeCode,
  );
  formData.value.members = (formData.value.members || []).filter(
    (item) => item.employeeCode !== row.employeeCode,
  );
  formData.value.memberTotal = formData.value.allMembers.length;
  const maxPage = Math.max(
    1,
    Math.ceil(formData.value.allMembers.length / memberPagination.value.pageSize),
  );
  if (memberPagination.value.pageNo > maxPage) {
    memberPagination.value.pageNo = maxPage;
  }
};

const fetchCandidateList = () => {
  if (!formData.value.id) {
    candidateList.value = [];
    candidateTotal.value = 0;
    return;
  }
  candidateLoading.value = true;
  queryAttendanceGroupMemberCandidatePage(
    {
      groupId: formData.value.id,
      deptCodes: candidateQuery.value.deptCodes.length
        ? candidateQuery.value.deptCodes
        : undefined,
      talentCode: candidateQuery.value.talentCode || undefined,
      talentName: candidateQuery.value.talentName || undefined,
      pageNo: candidateQuery.value.pageNo,
      pageSize: candidateQuery.value.pageSize,
    },
    {
      isLoading: false,
    },
  )
    .then((res) => {
      const records = Array.isArray(res?.data)
        ? res.data
        : res?.data?.records || [];
      candidateList.value = records.map((item) => ({
        employeeCode: item.talentCode || "",
        employeeName: item.talentName || "",
        attendancePosition: item.posName || "",
        attendanceOrganization: item.deptName || "",
        empStatus: item.empStatus || "",
        alreadyInGroup: Boolean(item.alreadyInGroup),
      }));
      candidateTotal.value =
        Number(res?.total) ||
        Number(res?.data?.total) ||
        0;
      if (Number(res?.currPage)) {
        candidateQuery.value.pageNo = Number(res.currPage);
      }
      clearCandidateSelection();
    })
    .finally(() => {
      candidateLoading.value = false;
    });
};

const handleCandidateSearch = () => {
  candidateQuery.value.pageNo = 1;
  fetchCandidateList();
};

const handleCandidateDeptChange = (value) => {
  candidateQuery.value.deptCodes = Array.isArray(value) ? value : [];
  candidateQuery.value.pageNo = 1;
  fetchCandidateList();
};

const handleCandidatePagination = () => {
  fetchCandidateList();
};

const candidateRowSelectable = (row) => !row.selectionDisabled;
const handleMemberPagination = () => {
  if (isEditing.value) {
    return;
  }
  emit("member-page-change", {
    groupId: formData.value.id,
    pageNo: memberPagination.value.pageNo,
    pageSize: memberPagination.value.pageSize,
  });
};

const validateForm = () => {
  if (props.mode === "create" && !formData.value.code.trim()) {
    ElMessage.warning("请填写考勤组编码");
    return false;
  }
  if (props.mode === "create" && !formData.value.name.trim()) {
    ElMessage.warning("请填写考勤组名称");
    return false;
  }
  if (props.mode === "create" && !formData.value.organizationCode) {
    ElMessage.warning("请选择所属组织");
    return false;
  }
  if (props.mode !== "create" && !formData.value.id) {
    ElMessage.warning("请至少选择一名考勤组成员");
    return false;
  }
  return true;
};

const saveEdit = () => {
  if (!validateForm()) {
    return;
  }

  emit("save", {
    ...props.detailInfo,
    ...formData.value,
    code: formData.value.code.trim(),
    name: formData.value.name.trim(),
    remark: formData.value.remark.trim(),
    members: [...(formData.value.allMembers || formData.value.members || [])],
  });
  isEditing.value = false;
};

const deleteRecord = () => {
  emit("delete", props.detailInfo);
};
</script>

<template>
  <div class="attendance-group-detail">
    <div class="attendance-group-detail__header">
      <div class="attendance-group-detail__title">{{ titleText }}</div>
      <div class="attendance-group-detail__actions">
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
            class="attendance-group-detail__close mdi mdi-window-close"
            @click="closeSidebar"
          ></div>
        </el-tooltip>
      </div>
    </div>

    <div class="attendance-group-detail__content">
      <section class="detail-section">
        <div class="detail-section__title">基本信息</div>
        <div class="detail-section__rows">
          <div class="detail-row">
            <div class="detail-item">
              <div class="detail-item__label">编码</div>
              <div
                v-if="isEditing && allowBaseInfoEdit"
                class="detail-item__editor"
              >
                <el-input
                  v-model="formData.code"
                  placeholder="请输入编码"
                  clearable
                />
              </div>
              <div
                v-else
                class="detail-item__value"
              >
                {{ formData.code || "-" }}
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-item__label">名称</div>
              <div
                v-if="isEditing && allowBaseInfoEdit"
                class="detail-item__editor"
              >
                <el-input
                  v-model="formData.name"
                  placeholder="请输入名称"
                  clearable
                />
              </div>
              <div
                v-else
                class="detail-item__value"
              >
                {{ formData.name || "-" }}
              </div>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-item">
              <div class="detail-item__label">组织</div>
              <div class="detail-item__value">
                {{ formData.organizationName || "-" }}
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-item__label">备注</div>
              <div
                v-if="isEditing && allowBaseInfoEdit"
                class="detail-item__editor"
              >
                <el-input
                  v-model="formData.remark"
                  placeholder="请输入备注"
                  clearable
                />
              </div>
              <div
                v-else
                class="detail-item__value"
              >
                {{ formData.remark || "-" }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        v-if="props.mode !== 'create'"
        class="detail-section detail-section--members"
      >
        <div class="detail-section__toolbar">
          <div class="detail-section__title">成员列表</div>
          <div class="member-tools">
            <el-button
              v-if="isEditing"
              type="primary"
              plain
              @click="openEmployeeDialog"
            >
              选择员工
            </el-button>
          </div>
        </div>

        <el-table
          :data="displayedMembers"
          border
          height="100%"
          empty-text="暂无成员"
        >
          <el-table-column
            prop="employeeCode"
            label="员工编码"
            min-width="80"
          />
          <el-table-column
            prop="employeeName"
            label="姓名"
            min-width="80"
          />
          <el-table-column
            prop="attendancePosition"
            label="考勤职位"
            min-width="100"
          />
          <el-table-column
            prop="attendanceOrganization"
            label="考勤组织"
            min-width="150"
          />
          <el-table-column
            v-if="isEditing"
            label="操作"
            fixed="right"
            width="90"
          >
            <template #default="{ row }">
              <el-button
                type="danger"
                link
                @click="removeMember(row)"
              >
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="member-pagination">
          <Pagination
            :total="memberTotal"
            v-model:page="memberPagination.pageNo"
            v-model:limit="memberPagination.pageSize"
            :pageSizes="[10, 20, 50, 100]"
            :storage="false"
            @pagination="handleMemberPagination"
          />
        </div>
      </section>
    </div>

    <el-dialog
      v-model="organizationDialogVisible"
      title="组织"
      width="720px"
      append-to-body
    >
      <el-table
        :data="organizationOptions"
        border
        height="360"
        highlight-current-row
        @row-dblclick="chooseOrganization"
      >
        <el-table-column
          type="index"
          label="序号"
          width="70"
        />
        <el-table-column
          prop="organizationCode"
          label="组织编码"
          min-width="120"
        />
        <el-table-column
          prop="organizationName"
          label="组织名称"
          min-width="160"
        />
        <el-table-column
          prop="organizationFullName"
          label="组织长名称"
          min-width="260"
        />
        <el-table-column
          label="操作"
          width="90"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              @click="chooseOrganization(row)"
            >
              选择
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

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
        </el-input>
        <el-cascader
          v-model="candidateQuery.deptCodes"
          popper-class="candidate-toolbar__dept"
          :options="departmentCascaderOptions"
          :props="{ multiple: true, emitPath: false }"
          collapse-tags
          collapse-tags-tooltip
          clearable
          filterable
          :show-all-levels="false"
          placeholder="请选择部门"
          @change="handleCandidateDeptChange"
          class="candidate-toolbar__deptinput"
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
        :data="selectableEmployees"
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
          label="状态"
          min-width="120"
        >
          <template #default="{ row }">
            <span :class="['candidate-status', { 'candidate-status--disabled': row.selectionDisabled }]">
              {{ row.selectionDisabled ? "已在当前成员中" : "可添加" }}
            </span>
          </template>
        </el-table-column>
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
          @click="addSelectedEmployees"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss">
.candidate-toolbar__deptinput{
  width: 250px;
}
.candidate-toolbar__deptinput .el-tag {
  max-width: 160px;
}
.candidate-toolbar__deptinput .el-cascader__search-input {
  min-width: 40px;
}

.candidate-toolbar__deptinput .el-cascader__tags {
  flex-wrap: nowrap;
}

.candidate-toolbar__dept .el-checkbox{
  margin-bottom: 0 !important;
}
</style>
<style scoped lang="scss">
.attendance-group-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: #fff;
}

.attendance-group-detail__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px 14px;
  border-bottom: 1px solid #e9edf5;
}

.attendance-group-detail__title {
  position: relative;
  padding-bottom: 10px;
  color: #1f2d49;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
}

.attendance-group-detail__title::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 68px;
  height: 3px;
  border-radius: 999px;
  background: #4f80c2;
}

.attendance-group-detail__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.attendance-group-detail__close {
  color: #7d8aa5;
  font-size: 22px;
  cursor: pointer;
}

.attendance-group-detail__content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 24px;
  padding: 24px 40px 40px;
  min-height: 0;
}

.detail-section {
  display: grid;
  gap: 16px;
}

.detail-section--members {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 360px;
}

.detail-section__title {
  color: #1f2d49;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
}

.detail-section__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
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

.member-tools {
  display: flex;
  align-items: center;
  gap: 10px;
}

:deep(.detail-section--members .el-table) {
  flex: 1;
  min-height: 360px;
}

:deep(.detail-section--members .el-table__inner-wrapper) {
  height: 100%;
}

.candidate-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.candidate-toolbar__field {
  width: 220px;
}

.candidate-pagination {
  margin-top: 16px;
}

.candidate-status {
  color: #2d8a55;
}

.candidate-status--disabled {
  color: #9099ab;
}

:deep(.detail-item__editor .el-input__wrapper) {
  width: 100%;
}

@media (max-width: 960px) {
  .attendance-group-detail__content {
    padding: 20px 24px 32px;
  }

  .detail-row {
    grid-template-columns: 1fr;
    row-gap: 14px;
  }

  .detail-section__toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .member-tools {
    width: 100%;
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
