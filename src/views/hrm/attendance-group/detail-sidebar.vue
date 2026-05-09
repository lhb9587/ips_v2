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
  organizationOptions: {
    type: Array,
    default: () => [],
  },
  employeeOptions: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["close", "save", "delete"]);

const isEditing = ref(false);
const formData = ref({});
const memberKeyword = ref("");
const organizationDialogVisible = ref(false);
const employeeDialogVisible = ref(false);
const selectedEmployees = ref([]);

const syncFormData = (detailInfo) => {
  formData.value = {
    id: detailInfo.id,
    code: detailInfo.code || "",
    name: detailInfo.name || "",
    organizationCode: detailInfo.organizationCode || "",
    organizationName: detailInfo.organizationName || "",
    remark: detailInfo.remark || "",
    members: Array.isArray(detailInfo.members) ? [...detailInfo.members] : [],
    referenced: Boolean(detailInfo.referenced),
  };
};

watch(
  () => [props.detailInfo, props.mode],
  ([detailInfo, mode]) => {
    syncFormData(detailInfo || {});
    memberKeyword.value = "";
    isEditing.value = mode === "create";
  },
  { immediate: true, deep: true },
);

const titleText = computed(() =>
  props.mode === "create" ? "创建考勤组" : "考勤组详情",
);

const allowBaseInfoEdit = computed(() => props.mode === "create");

const filteredMembers = computed(() => {
  const keyword = memberKeyword.value.trim().toLowerCase();
  const members = formData.value.members || [];
  if (!keyword) {
    return members;
  }

  return members.filter((item) =>
    [
      item.employeeCode,
      item.employeeName,
      item.attendancePosition,
      item.attendanceOrganization,
      item.transferTime,
      item.transferOrganization,
    ].some((field) => String(field || "").toLowerCase().includes(keyword)),
  );
});

const selectableEmployees = computed(() => {
  const existingCodes = new Set(
    (formData.value.members || []).map((item) => item.employeeCode),
  );
  return props.employeeOptions.filter(
    (item) => !existingCodes.has(item.employeeCode),
  );
});

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

const openOrganizationDialog = () => {
  if (!isEditing.value) {
    return;
  }
  organizationDialogVisible.value = true;
};

const chooseOrganization = (row) => {
  formData.value.organizationCode = row.organizationCode;
  formData.value.organizationName = row.organizationName;
  organizationDialogVisible.value = false;
};

const handleEmployeeSelection = (rows) => {
  selectedEmployees.value = rows;
};

const openEmployeeDialog = () => {
  if (!isEditing.value) {
    return;
  }
  selectedEmployees.value = [];
  employeeDialogVisible.value = true;
};

const addSelectedEmployees = () => {
  if (selectedEmployees.value.length === 0) {
    return ElMessage.warning("请先选择需要加入考勤组的员工");
  }

  formData.value.members = [
    ...(formData.value.members || []),
    ...selectedEmployees.value.map((item) => ({ ...item })),
  ];
  employeeDialogVisible.value = false;
  selectedEmployees.value = [];
};

const removeMember = (row) => {
  formData.value.members = (formData.value.members || []).filter(
    (item) => item.employeeCode !== row.employeeCode,
  );
};

const validateForm = () => {
  if (!formData.value.code.trim()) {
    ElMessage.warning("请填写考勤组编码");
    return false;
  }
  if (!formData.value.name.trim()) {
    ElMessage.warning("请填写考勤组名称");
    return false;
  }
  if (!formData.value.organizationCode) {
    ElMessage.warning("请选择所属组织");
    return false;
  }
  if (props.mode !== "create" && (formData.value.members || []).length === 0) {
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
    members: [...(formData.value.members || [])],
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
              <div
                v-if="isEditing && allowBaseInfoEdit"
                class="detail-item__editor"
              >
                <el-input
                  v-model="formData.organizationName"
                  placeholder="请选择组织"
                  readonly
                  @click="openOrganizationDialog"
                >
                  <template #append>
                    <el-button @click="openOrganizationDialog">
                      选择
                    </el-button>
                  </template>
                </el-input>
              </div>
              <div
                v-else
                class="detail-item__value"
              >
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
        class="detail-section"
      >
        <div class="detail-section__toolbar">
          <div class="detail-section__title">成员列表</div>
          <div class="member-tools">
            <el-input
              v-model="memberKeyword"
              class="member-tools__search"
              placeholder="搜索成员..."
              clearable
            >
              <template #prepend>
                <i class="bx bx-search-alt"></i>
              </template>
            </el-input>
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
          :data="filteredMembers"
          border
          height="360"
          empty-text="暂无成员"
        >
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
            min-width="150"
          />
          <el-table-column
            prop="transferTime"
            label="调出时间"
            min-width="120"
          />
          <el-table-column
            prop="transferOrganization"
            label="调出组织"
            min-width="140"
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
      <el-table
        :data="selectableEmployees"
        border
        height="420"
        @selection-change="handleEmployeeSelection"
      >
        <el-table-column
          type="selection"
          width="50"
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
      </el-table>
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

<style scoped lang="scss">
.attendance-group-detail {
  height: 100%;
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
  display: grid;
  gap: 24px;
  padding: 24px 40px 40px;
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

.member-tools__search {
  width: 220px;
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

  .member-tools__search {
    flex: 1;
    width: auto;
  }
}
</style>
