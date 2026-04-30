<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { ElMessage, ElMessageBox } from "element-plus";
import Layout from "@/layouts/main";
import GridView from "@/components/common/grid-table/index.vue";
import TopListTool from "@/components/common/top-list-tool/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import { saveTableConfig } from "@/utils";

const route = useRoute();
const router = useRouter();
const store = useStore();

const storageKey = "mySupplementCardRecords";
const gridName = "mySupplementCardListGrid";

const columnOptions = [
  { title: "序号", value: "sid" },
  { title: "单据编号", value: "billNo" },
  { title: "姓名", value: "applicant" },
  { title: "员工编码", value: "employeeCode" },
  { title: "申请日期", value: "applyDate" },
  { title: "考勤日期", value: "attendanceDate" },
  { title: "补签类型", value: "type" },
  { title: "补签时间点", value: "timePoint" },
  { title: "补签原因", value: "reason" },
  { title: "子项数", value: "itemCount" },
  { title: "单据状态", value: "status" },
  { title: "办理人", value: "approver" },
  { title: "备注", value: "remark" },
];

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

const persistRecords = () => {
  localStorage.setItem(storageKey, JSON.stringify(records.value));
};

const records = ref(readRecords());
const columnList = ref([...columnOptions]);
const activeClass = ref([]);
const rowHeight = ref(40);
const isFull = ref(false);
const boxRef = ref(null);
const gridRef = ref(null);
const diminput = ref("");

const gridOptions = {
  rowMultiSelectWithClick: true,
};
const pageSizesList = ref([10, 50, 200, 500, 1000, 5000, 10000]);

const setColumn = (list) => {
  if (!Array.isArray(list) || list.length === 0) {
    columnList.value = [...columnOptions];
    return;
  }
  const validColumns = list.filter((item) =>
    columnOptions.some((column) => column.value === item.value),
  );
  columnList.value = validColumns.length > 0 ? validColumns : [...columnOptions];
};

const fetchLocalPageSize = () => {
  const pageSizeData = JSON.parse(localStorage.getItem("pageSize")) || [];
  const savedData = pageSizeData.find((item) => item.name === route.name);
  return savedData ? savedData.pageSize : 50;
};

const listQuery = ref({
  pageNo: 1,
  pageSize: fetchLocalPageSize(),
});

const changeBorder = (newVal) => {
  if (newVal) {
    if (!activeClass.value.includes("Borderline")) {
      activeClass.value.push("Borderline");
    }
  } else {
    activeClass.value = activeClass.value.filter((item) => item !== "Borderline");
  }
  saveTableConfig("isBorderline", gridName, newVal);
};

const changeRowStyle = (newVal) => {
  if (newVal) {
    if (!activeClass.value.includes("zebra")) {
      activeClass.value.push("zebra");
    }
  } else {
    activeClass.value = activeClass.value.filter((item) => item !== "zebra");
  }
  saveTableConfig("iszebra", gridName, newVal);
};

const changeRowHeight = (height) => {
  rowHeight.value = height;
  saveTableConfig("rowHeight", gridName, height);
};

const calculateGridHeight = () => {
  const layout = store.state.layout.layoutType;
  const windowHeight = document.documentElement.clientHeight;
  if (layout === "vertical") {
    return windowHeight - 260;
  }
  return windowHeight - 306;
};

const gridHeight = ref(calculateGridHeight());

watch(
  () => store.state.layout.layoutType,
  () => {
    gridHeight.value = calculateGridHeight();
  },
);

const changeScreenSize = () => {
  const element = document.querySelector(".box");
  if (!document.fullscreenElement) {
    element.requestFullscreen().then(() => {
      setTimeout(() => {
        gridHeight.value = document.documentElement.clientHeight - 155;
      }, 100);
    });
  } else {
    document.exitFullscreen().then(() => {
      gridHeight.value = calculateGridHeight();
    });
  }
};

const handleFullScreenChange = () => {
  isFull.value = !isFull.value;
  if (document.fullscreenElement !== boxRef.value) {
    gridHeight.value = calculateGridHeight();
  }
};

const listRows = computed(() =>
  records.value.map((record) => {
    const firstItem = record.items?.[0] || {};
    return {
      ...record,
      attendanceDate: firstItem.attendanceDate || "--",
      type: firstItem.type || "--",
      timePoint: firstItem.timePoint || "--",
      reason: firstItem.reason || "--",
      remark: firstItem.remark || "--",
      itemCount: record.items?.length || 0,
    };
  }),
);

const filteredRows = computed(() => {
  const keyword = diminput.value.trim().toLowerCase();
  return listRows.value.filter((record) => {
    const keywordMatched =
      !keyword ||
      [
        record.billNo,
        record.applicant,
        record.employeeCode,
        record.applyDate,
        record.attendanceDate,
        record.type,
        record.timePoint,
        record.reason,
        record.status,
        record.approver,
        record.remark,
      ].some((field) => String(field || "").toLowerCase().includes(keyword));
    return keywordMatched;
  });
});

const total = computed(() => filteredRows.value.length);

const gridData = computed(() => {
  const start = (listQuery.value.pageNo - 1) * listQuery.value.pageSize;
  const end = start + listQuery.value.pageSize;
  return filteredRows.value.slice(start, end).map((item, index) => ({
    ...item,
    sid: start + index,
  }));
});

watch(total, (value) => {
  const maxPage = Math.max(Math.ceil(value / listQuery.value.pageSize), 1);
  if (listQuery.value.pageNo > maxPage) {
    listQuery.value.pageNo = maxPage;
  }
});

const fuzzySearch = () => {
  listQuery.value.pageNo = 1;
};

const resetSearch = () => {
  diminput.value = "";
  fuzzySearch();
};

const getSelectedRows = () => gridRef.value?.getRowList?.() || [];

const goCreate = () => {
  router.push({ name: "my-supplement-application" });
};

const openDetail = (params) => {
  const record = params?.data || params;
  if (!record?.billNo) {
    return;
  }
  sessionStorage.setItem("mySupplementCurrentDetail", JSON.stringify(record));
  router.push({ name: "my-supplement-detail", params: { billNo: record.billNo } });
};

const handleSubmitSelected = () => {
  const selectedRows = getSelectedRows();
  if (!selectedRows.length) {
    return ElMessage.warning("请先选择需要提交的补签单");
  }

  let changedCount = 0;
  selectedRows.forEach((row) => {
    const record = records.value.find((item) => item.billNo === row.billNo);
    if (record && record.status === "未提交") {
      record.status = "审批中";
      record.approver = "李经理";
      record.approvalComment = "已提交，等待部门负责人审批";
      changedCount += 1;
    }
  });

  if (!changedCount) {
    return ElMessage.warning("当前选择的补签单无需提交");
  }

  persistRecords();
  ElMessage.success(`已提交 ${changedCount} 条补签单`);
};

const handleDiscardSelected = () => {
  const selectedRows = getSelectedRows();
  if (!selectedRows.length) {
    return ElMessage.warning("请先选择需要废弃的补签单");
  }

  ElMessageBox.confirm("确定要废弃选中的补签单吗？", "废弃确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    selectedRows.forEach((row) => {
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
  const selectedRows = getSelectedRows();
  if (!selectedRows.length) {
    return ElMessage.warning("请先选择需要删除的补签单");
  }

  ElMessageBox.confirm("确定要删除选中的补签单吗？删除后不可恢复。", "删除确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    const billNos = selectedRows.map((item) => item.billNo);
    records.value = records.value.filter((item) => !billNos.includes(item.billNo));
    persistRecords();
    ElMessage.success("补签单已删除");
  });
};

const handlePagination = () => {};

const cellRenderer = (params) => {
  const value = params.value || params.value === 0 ? params.value : "";
  if (params.colDef.field === "sid") {
    return params.value || params.value === 0 ? Number(params.value) + 1 : "";
  }
  if (params.colDef.field === "status") {
    const classMap = {
      未提交: "status-tag status-tag--info",
      审批中: "status-tag status-tag--warning",
      已通过: "status-tag status-tag--success",
      已废弃: "status-tag status-tag--danger",
    };
    return `<span class="${classMap[value] || "status-tag"}" title="${value}">${value}</span>`;
  }
  return `<span title="${value}">${value}</span>`;
};

onMounted(() => {
  document.addEventListener("fullscreenchange", handleFullScreenChange);
});

onUnmounted(() => {
  document.removeEventListener("fullscreenchange", handleFullScreenChange);
});
</script>

<template>
  <Layout>
    <div class="row">
      <div class="col-lg-12">
        <div
          class="card box"
          ref="boxRef"
        >
          <div
            class="card-body"
            style="padding-bottom: 10px"
          >
            <div class="d-flex align-items-center">
              <span class="mb-0 flex-grow-1">
                <div class="d-flex supplement-toolbar">
                  <el-input
                    v-model="diminput"
                    style="width: 220px"
                    placeholder="搜索..."
                    clearable
                    class="top-search"
                    @keyup.enter="fuzzySearch"
                  >
                    <template #prepend>
                      <el-button @click="fuzzySearch">
                        <i class="bx bx-search-alt"></i>
                      </el-button>
                    </template>
                  </el-input>
                  <el-button @click="resetSearch">重置</el-button>
                  <el-button type="primary" @click="goCreate">
                    新建补签申请
                  </el-button>
                  <el-button @click="handleSubmitSelected">提交</el-button>
                  <el-dropdown>
                    <el-button>
                      更多
                      <i class="mdi mdi-chevron-down ms-1"></i>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item @click="handleDiscardSelected">
                          废弃
                        </el-dropdown-item>
                        <el-dropdown-item @click="handleDeleteSelected">
                          删除
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </span>
              <div class="d-flex gap-2">
                <TopListTool
                  :gridName="gridName"
                  @changeBorder="changeBorder"
                  @changeRowStyle="changeRowStyle"
                  @changeRowHeight="changeRowHeight"
                  @changeScreenSize="changeScreenSize"
                  @setColumn="setColumn"
                  :queryList="{
                    ...listQuery,
                    searchWord: diminput,
                  }"
                  :isFull="isFull"
                >
                </TopListTool>
              </div>
            </div>
          </div>
          <div style="padding: 0 10px">
            <GridView
              ref="gridRef"
              :gridName="gridName"
              :height="gridHeight"
              :rowHeight="rowHeight"
              :columnDefs="columnList"
              :grid-data="gridData"
              :activeClass="activeClass"
              :cellRenderer="cellRenderer"
              :gridOptions="gridOptions"
              :rowDoubleClicked="openDetail"
            />
          </div>
          <div
            v-if="total > 0"
            class="card-body border-bottom"
            style="padding-top: 10px"
          >
            <Pagination
              :total="total"
              v-model:page="listQuery.pageNo"
              v-model:limit="listQuery.pageSize"
              :pageSizes="pageSizesList"
              @pagination="handlePagination"
            ></Pagination>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<style scoped lang="scss">
.card-body {
  flex: none;
}

.supplement-toolbar {
  gap: 10px;
  flex-wrap: wrap;
}

:deep(.status-tag) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  height: 24px;
  padding: 0 8px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  background: #f4f4f5;
  color: #606266;
  font-size: 12px;
  line-height: 22px;
}

:deep(.status-tag--warning) {
  border-color: #f3d19e;
  background: #fdf6ec;
  color: #b88230;
}

:deep(.status-tag--success) {
  border-color: #b3e19d;
  background: #f0f9eb;
  color: #529b2e;
}

:deep(.status-tag--danger) {
  border-color: #fab6b6;
  background: #fef0f0;
  color: #c45656;
}

:deep(.status-tag--info) {
  border-color: #d3d4d6;
  background: #f4f4f5;
  color: #73767a;
}
</style>
