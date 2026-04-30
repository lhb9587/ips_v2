<script setup>
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import Layout from "@/layouts/main";

const router = useRouter();

const storageKey = "mySupplementCardRecords";

const fallbackRecords = [
  {
    billNo: "BQ202604025347",
    applicant: "张员工",
    employeeCode: "EMP2026136",
    position: "Java后端开发工程师",
    organization: "产品研发中心",
    applyDate: "2026-04-02",
    status: "审批中",
    approver: "李经理",
    approvalComment: "部门负责人审批中",
    items: [
      {
        attendanceDate: "2026-04-02",
        timePoint: "09:00",
        type: "上班补签",
        reason: "忘记打卡",
        remark: "早会开始前到岗，忘记刷卡。",
      },
    ],
  },
  {
    billNo: "BQ202603181126",
    applicant: "张员工",
    employeeCode: "EMP2026136",
    position: "Java后端开发工程师",
    organization: "产品研发中心",
    applyDate: "2026-03-18",
    status: "已通过",
    approver: "王主管",
    approvalComment: "审批通过",
    items: [
      {
        attendanceDate: "2026-03-18",
        timePoint: "18:00",
        type: "下班补签",
        reason: "外出公干",
        remark: "客户现场沟通后直接下班。",
      },
    ],
  },
];

const readRecords = () => {
  const storedRecords = localStorage.getItem(storageKey);
  if (!storedRecords) {
    return [...fallbackRecords];
  }
  try {
    const records = JSON.parse(storedRecords);
    return Array.isArray(records) && records.length ? records : [...fallbackRecords];
  } catch (error) {
    return [...fallbackRecords];
  }
};

const records = ref(readRecords());
const selectedRows = ref([]);

const searchForm = reactive({
  keyword: "",
  status: "",
  dateRange: [],
});

const statusOptions = ["未提交", "审批中", "已通过", "已废弃"];

const persistRecords = () => {
  localStorage.setItem(storageKey, JSON.stringify(records.value));
};

const filteredRecords = computed(() => {
  return records.value.filter((record) => {
    const firstItem = record.items?.[0] || {};
    const keywordMatched =
      !searchForm.keyword ||
      [record.billNo, record.applicant, record.employeeCode, firstItem.reason]
        .filter(Boolean)
        .some((value) => value.includes(searchForm.keyword));
    const statusMatched = !searchForm.status || record.status === searchForm.status;
    const dateMatched =
      !searchForm.dateRange?.length ||
      (record.applyDate >= searchForm.dateRange[0] &&
        record.applyDate <= searchForm.dateRange[1]);

    return keywordMatched && statusMatched && dateMatched;
  });
});

const tableRows = computed(() =>
  filteredRecords.value.map((record) => {
    const firstItem = record.items?.[0] || {};
    return {
      ...record,
      attendanceDate: firstItem.attendanceDate || "--",
      type: firstItem.type || "--",
      timePoint: firstItem.timePoint || "--",
      reason: firstItem.reason || "--",
      itemCount: record.items?.length || 0,
    };
  }),
);

const statusTagType = (status) => {
  const map = {
    未提交: "info",
    审批中: "warning",
    已通过: "success",
    已废弃: "danger",
  };
  return map[status] || "info";
};

const handleSelectionChange = (rows) => {
  selectedRows.value = rows;
};

const goCreate = () => {
  router.push({ name: "my-supplement-application" });
};

const openDetail = (record) => {
  sessionStorage.setItem("mySupplementCurrentDetail", JSON.stringify(record));
  router.push({ name: "my-supplement-detail", params: { billNo: record.billNo } });
};

const handleSubmitSelected = () => {
  if (!selectedRows.value.length) {
    ElMessage.warning("请先选择需要提交的补签单");
    return;
  }

  let changedCount = 0;
  selectedRows.value.forEach((row) => {
    const record = records.value.find((item) => item.billNo === row.billNo);
    if (record && record.status === "未提交") {
      record.status = "审批中";
      record.approver = "李经理";
      record.approvalComment = "已提交，等待部门负责人审批";
      changedCount += 1;
    }
  });

  if (!changedCount) {
    ElMessage.warning("当前选择的补签单无需提交");
    return;
  }

  persistRecords();
  ElMessage.success(`已提交 ${changedCount} 条补签单`);
};

const handleDiscardSelected = () => {
  if (!selectedRows.value.length) {
    ElMessage.warning("请先选择需要废弃的补签单");
    return;
  }

  ElMessageBox.confirm("确定要废弃选中的补签单吗？", "废弃确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    selectedRows.value.forEach((row) => {
      const record = records.value.find((item) => item.billNo === row.billNo);
      if (record && record.status !== "已通过") {
        record.status = "已废弃";
        record.approvalComment = "申请人已废弃该补签单";
      }
    });
    persistRecords();
    ElMessage.success("补签单已废弃");
  });
};

const handleDeleteSelected = () => {
  if (!selectedRows.value.length) {
    ElMessage.warning("请先选择需要删除的补签单");
    return;
  }

  ElMessageBox.confirm("确定要删除选中的补签单吗？删除后不可恢复。", "删除确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    const billNos = selectedRows.value.map((item) => item.billNo);
    records.value = records.value.filter((item) => !billNos.includes(item.billNo));
    persistRecords();
    selectedRows.value = [];
    ElMessage.success("补签单已删除");
  });
};
</script>

<template>
  <Layout>
    <div class="supplement-list-page">
      <div class="page-toolbar">
        <div>
          <h2>补签卡列表</h2>
          <p>展示本人保存的草稿和已提交补签单据，双击记录可查看详情。</p>
        </div>
        <div class="page-toolbar__actions">
          <el-button type="primary" @click="goCreate">新建补签申请</el-button>
          <el-button @click="handleSubmitSelected">提交</el-button>
          <el-button @click="handleDiscardSelected">废弃</el-button>
          <el-button type="danger" plain @click="handleDeleteSelected">
            删除
          </el-button>
        </div>
      </div>

      <section class="search-panel">
        <el-form :model="searchForm" label-width="78px" label-position="left">
          <el-row :gutter="16">
            <el-col :xl="8" :lg="8" :md="12" :sm="24">
              <el-form-item label="关键字">
                <el-input
                  v-model="searchForm.keyword"
                  clearable
                  placeholder="单据编号、姓名、员工编码、补签原因"
                />
              </el-form-item>
            </el-col>
            <el-col :xl="6" :lg="6" :md="12" :sm="24">
              <el-form-item label="单据状态">
                <el-select
                  v-model="searchForm.status"
                  clearable
                  placeholder="请选择状态"
                >
                  <el-option
                    v-for="status in statusOptions"
                    :key="status"
                    :label="status"
                    :value="status"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xl="10" :lg="10" :md="24" :sm="24">
              <el-form-item label="申请日期">
                <el-date-picker
                  v-model="searchForm.dateRange"
                  type="daterange"
                  value-format="YYYY-MM-DD"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </section>

      <section class="table-panel">
        <el-table
          :data="tableRows"
          border
          height="560"
          @selection-change="handleSelectionChange"
          @row-dblclick="openDetail"
        >
          <el-table-column type="selection" width="48" />
          <el-table-column prop="billNo" label="单据编号" min-width="170" />
          <el-table-column prop="applicant" label="姓名" width="110" />
          <el-table-column prop="employeeCode" label="员工编码" width="130" />
          <el-table-column prop="applyDate" label="申请日期" width="120" />
          <el-table-column prop="attendanceDate" label="考勤日期" width="120" />
          <el-table-column prop="type" label="补签类型" width="120" />
          <el-table-column prop="timePoint" label="补签时间点" width="120" />
          <el-table-column prop="reason" label="补签原因" min-width="140" />
          <el-table-column prop="itemCount" label="子项数" width="90" />
          <el-table-column label="单据状态" width="110">
            <template #default="{ row }">
              <el-tag :type="statusTagType(row.status)">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="approver" label="办理人" width="110" />
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="openDetail(row)">
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </section>
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

.supplement-list-page {
  min-height: calc(100vh - 120px);
  color: #122448;
}

.page-toolbar,
.search-panel,
.table-panel {
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

.page-toolbar__actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.search-panel {
  margin-top: 14px;
  padding: 16px 18px 0;
}

.search-panel :deep(.el-select),
.search-panel :deep(.el-date-editor) {
  width: 100%;
}

.table-panel {
  margin-top: 14px;
  padding: 16px;
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
