<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { ElMessage, ElMessageBox } from "element-plus";
import Layout from "@/layouts/main";
import GridView from "@/components/common/grid-table/index.vue";
import TopListTool from "@/components/common/top-list-tool/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import DragSidebar from "@/components/common/sidebar-drag/index.vue";
import { saveTableConfig } from "@/utils";

const route = useRoute();
const router = useRouter();
const store = useStore();

const storageKey = "mySupplementCardRecords";
const gridName = "mySupplementCardListGrid";
const supplementTypes = ["上班补签", "下班补签", "外出补签", "其他补签"];
const supplementReasons = [
  "忘记打卡",
  "外出公干",
  "参加公司团建",
  "体育活动",
];

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
const detailDrawerVisible = ref(false);
const currentDetail = ref(null);
const isDrawerEditingItems = ref(false);
const drawerItemEditList = ref([]);
let rowClickTimer = null;

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

const closeDetailSidebar = () => {
  detailDrawerVisible.value = false;
  currentDetail.value = null;
  isDrawerEditingItems.value = false;
  drawerItemEditList.value = [];
};

const handleRowClick = (params) => {
  if (!params?.data) {
    return;
  }
  if (rowClickTimer) {
    clearTimeout(rowClickTimer);
  }
  rowClickTimer = setTimeout(() => {
    currentDetail.value = params.data;
    isDrawerEditingItems.value = false;
    drawerItemEditList.value = [];
    detailDrawerVisible.value = true;
    rowClickTimer = null;
  }, 220);
};

const openDetail = (params) => {
  const record = params?.data || params;
  if (!record?.billNo) {
    return;
  }
  if (rowClickTimer) {
    clearTimeout(rowClickTimer);
    rowClickTimer = null;
  }
  detailDrawerVisible.value = false;
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

const createEmptyItem = () => ({
  attendanceDate: "",
  timePoint: "",
  type: "",
  reason: "",
  remark: "",
});

const cloneItems = (items) => {
  const list = Array.isArray(items) ? items : [];
  return list.map((item) => ({
    attendanceDate: item.attendanceDate || "",
    timePoint: item.timePoint || "",
    type: item.type || "",
    reason: item.reason || "",
    remark: item.remark || "",
  }));
};

const handleDrawerEditItems = () => {
  const currentItems = cloneItems(currentDetail.value?.items);
  drawerItemEditList.value = currentItems.length ? currentItems : [createEmptyItem()];
  isDrawerEditingItems.value = true;
};

const handleDrawerCancelEditItems = () => {
  drawerItemEditList.value = [];
  isDrawerEditingItems.value = false;
};

const handleDrawerAddEditItem = () => {
  drawerItemEditList.value.push(createEmptyItem());
};

const handleDrawerRemoveEditItem = (index) => {
  if (drawerItemEditList.value.length === 1) {
    ElMessage.warning("至少保留一条补签卡信息");
    return;
  }
  drawerItemEditList.value.splice(index, 1);
};

const validateDrawerEditItems = () => {
  const invalidIndex = drawerItemEditList.value.findIndex(
    (item) => !item.attendanceDate || !item.timePoint || !item.type || !item.reason,
  );
  if (invalidIndex > -1) {
    ElMessage.warning(`请完善第 ${invalidIndex + 1} 条补签卡信息`);
    return false;
  }
  return true;
};

const handleDrawerSaveItems = () => {
  if (!currentDetail.value?.billNo || !validateDrawerEditItems()) {
    return;
  }
  const sourceRecord =
    records.value.find((record) => record.billNo === currentDetail.value.billNo) ||
    currentDetail.value;
  const updatedRecord = {
    ...sourceRecord,
    items: cloneItems(drawerItemEditList.value),
  };
  const recordIndex = records.value.findIndex(
    (record) => record.billNo === updatedRecord.billNo,
  );
  if (recordIndex > -1) {
    records.value.splice(recordIndex, 1, updatedRecord);
  } else {
    records.value.unshift(updatedRecord);
  }
  currentDetail.value = { ...updatedRecord };
  persistRecords();
  sessionStorage.setItem("mySupplementCurrentDetail", JSON.stringify(updatedRecord));
  handleDrawerCancelEditItems();
  ElMessage.success("补签卡信息已保存");
};

const getSupplementStatusClass = (status) => {
  const classMap = {
    未提交: "supplement-status--info",
    审批中: "supplement-status--warning",
    已通过: "supplement-status--success",
    已废弃: "supplement-status--danger",
  };
  return classMap[status] || "supplement-status--info";
};

const approvalFlow = computed(() => {
  if (!currentDetail.value?.billNo) {
    return [];
  }

  const detail = currentDetail.value;

  if (detail.status === "未提交") {
    return [
      {
        time: `${detail.applyDate} 10:18`,
        title: "保存草稿",
        actor: detail.applicant,
        description: "补签卡单暂未提交审批。",
        active: true,
      },
    ];
  }

  if (detail.status === "已废弃") {
    return [
      {
        time: `${detail.applyDate} 10:18`,
        title: "废弃申请",
        actor: detail.applicant,
        description: detail.approvalComment || "申请人已废弃该补签卡单",
        active: true,
      },
    ];
  }

  return [
    {
      time: `${detail.applyDate} 10:18`,
      title: "发起申请 · 提交申请",
      actor: detail.applicant,
      description: "提交补签卡申请，等待直属上级审批。",
      active: true,
    },
    {
      time: `${detail.applyDate} 10:19`,
      title:
        detail.status === "已通过"
          ? "直属上级审批 · 审批通过"
          : "直属上级审批 · 审批中",
      actor: detail.approver,
      description: detail.approvalComment || "审批流程处理中",
      active: detail.status === "审批中",
    },
  ];
});

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
  if (rowClickTimer) {
    clearTimeout(rowClickTimer);
    rowClickTimer = null;
  }
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
              :rowClick="handleRowClick"
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

    <DragSidebar
      v-if="detailDrawerVisible"
      v-model="detailDrawerVisible"
      sidebarName="my-supplement-detail-sidebar"
      :minWidth="820"
      :width="1080"
      :noCloseOnEsc="true"
      :backdrop="false"
      @close="closeDetailSidebar"
    >
      <div
        v-if="currentDetail"
        class="supplement-detail-sidebar"
      >
        <div class="supplement-detail-sidebar__header">
          <div>
            <div class="supplement-detail-sidebar__title-line">
              <h2>补签卡详情</h2>
              <span :class="['supplement-status', getSupplementStatusClass(currentDetail.status)]">
                {{ currentDetail.status }}
              </span>
            </div>
            <p>{{ currentDetail.billNo }}</p>
          </div>
          <div class="supplement-detail-sidebar__actions">
            <template v-if="isDrawerEditingItems">
              <el-button
                type="primary"
                @click="handleDrawerSaveItems"
              >
                保存
              </el-button>
              <el-button @click="handleDrawerCancelEditItems">取消</el-button>
            </template>
            <el-button
              v-else
              type="primary"
              plain
              @click="handleDrawerEditItems"
            >
              编辑
            </el-button>
            <el-button @click="closeDetailSidebar">关闭</el-button>
          </div>
        </div>

        <div class="supplement-detail-layout">
          <main class="supplement-detail-main">
            <section class="supplement-detail-card">
              <div class="supplement-detail-card__title">补签卡单信息</div>
              <div class="supplement-detail-grid">
                <div>单据编号</div>
                <div>{{ currentDetail.billNo }}</div>
                <div>申请日期</div>
                <div>{{ currentDetail.applyDate }}</div>
                <div>姓名</div>
                <div>{{ currentDetail.applicant }}</div>
                <div>员工编码</div>
                <div>{{ currentDetail.employeeCode }}</div>
                <div>职位</div>
                <div>{{ currentDetail.position }}</div>
                <div>所属组织</div>
                <div>{{ currentDetail.organization }}</div>
                <div>办理人</div>
                <div>{{ currentDetail.approver }}</div>
                <div>审批意见</div>
                <div>{{ currentDetail.approvalComment || "--" }}</div>
              </div>
            </section>

            <section class="supplement-detail-card">
              <div class="supplement-detail-card__title supplement-detail-card__title--with-action">
                <span>补签卡信息</span>
                <div
                  v-if="isDrawerEditingItems"
                  class="supplement-detail-card__actions"
                >
                  <el-button
                    type="primary"
                    plain
                    @click="handleDrawerAddEditItem"
                  >
                    新增补签卡
                  </el-button>
                </div>
              </div>
              <el-table
                v-if="!isDrawerEditingItems"
                :data="currentDetail.items || []"
                border
              >
                <el-table-column
                  type="index"
                  label="#"
                  width="54"
                />
                <el-table-column
                  prop="attendanceDate"
                  label="考勤日期"
                  width="130"
                />
                <el-table-column
                  prop="timePoint"
                  label="补签时间点"
                  width="130"
                />
                <el-table-column
                  prop="type"
                  label="补签卡类型"
                  width="140"
                />
                <el-table-column
                  prop="reason"
                  label="补签卡原因"
                  width="150"
                />
                <el-table-column
                  prop="remark"
                  label="备注"
                  min-width="220"
                />
              </el-table>
              <el-form
                v-else
                class="supplement-items-form"
                label-width="108px"
                label-position="left"
              >
                <div
                  v-for="(item, index) in drawerItemEditList"
                  :key="index"
                  class="supplement-item-editor"
                >
                  <div class="supplement-item-editor__header">
                    <strong>补签卡 {{ index + 1 }}</strong>
                    <el-button
                      link
                      type="danger"
                      @click="handleDrawerRemoveEditItem(index)"
                    >
                      删除
                    </el-button>
                  </div>
                  <div class="supplement-item-editor__grid">
                    <el-form-item label="考勤日期" required>
                      <el-date-picker
                        v-model="item.attendanceDate"
                        type="date"
                        value-format="YYYY-MM-DD"
                        placeholder="请选择考勤日期"
                      />
                    </el-form-item>
                    <el-form-item label="补签时间点" required>
                      <el-time-select
                        v-model="item.timePoint"
                        start="00:00"
                        step="00:15"
                        end="23:45"
                        placeholder="请选择时间点"
                      />
                    </el-form-item>
                    <el-form-item label="补签卡类型" required>
                      <el-select
                        v-model="item.type"
                        placeholder="请选择补签卡类型"
                      >
                        <el-option
                          v-for="type in supplementTypes"
                          :key="type"
                          :label="type"
                          :value="type"
                        />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="补签卡原因" required>
                      <el-select
                        v-model="item.reason"
                        placeholder="请选择补签卡原因"
                      >
                        <el-option
                          v-for="reason in supplementReasons"
                          :key="reason"
                          :label="reason"
                          :value="reason"
                        />
                      </el-select>
                    </el-form-item>
                  </div>
                  <el-form-item label="备注">
                    <el-input
                      v-model="item.remark"
                      type="textarea"
                      :rows="3"
                      resize="none"
                      placeholder="请填写异常说明、补充依据或其他需要说明的信息"
                    />
                  </el-form-item>
                </div>
              </el-form>
            </section>
          </main>

          <aside class="supplement-detail-side">
            <section class="supplement-detail-card supplement-approval-card">
              <div class="supplement-detail-card__title">审批流程</div>
              <div class="supplement-approval-timeline">
                <div
                  v-for="(item, index) in approvalFlow"
                  :key="`${item.title}-${index}`"
                  class="supplement-approval-step"
                  :class="{ 'supplement-approval-step--active': item.active }"
                >
                  <div class="supplement-approval-step__line"></div>
                  <div class="supplement-approval-step__dot"></div>
                  <div class="supplement-approval-step__body">
                    <div class="supplement-approval-step__time">{{ item.time }}</div>
                    <div class="supplement-approval-step__title">{{ item.title }}</div>
                    <div class="supplement-approval-step__actor">{{ item.actor }}</div>
                    <p>{{ item.description }}</p>
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </DragSidebar>
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

.supplement-detail-sidebar {
  min-height: 100vh;
  padding: 16px;
  background: #fff;
  color: #122448;
}

.supplement-detail-sidebar__header,
.supplement-detail-card {
  border: 1px solid #dce5f1;
  border-radius: 4px;
  background: #fff;
}

.supplement-detail-sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  padding: 16px 18px;
}

.supplement-detail-sidebar__header h2 {
  margin: 0;
  color: #122448;
  font-size: 18px;
  font-weight: 600;
}

.supplement-detail-sidebar__header p {
  margin: 6px 0 0;
  color: #63718a;
  font-size: 12px;
}

.supplement-detail-sidebar__title-line,
.supplement-detail-sidebar__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.supplement-detail-sidebar__actions {
  flex-shrink: 0;
}

.supplement-status {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 8px;
  border-radius: 4px;
  border: 1px solid #d3d4d6;
  background: #f4f4f5;
  color: #73767a;
  font-size: 12px;
  line-height: 22px;
}

.supplement-status--warning {
  border-color: #f3d19e;
  background: #fdf6ec;
  color: #b88230;
}

.supplement-status--success {
  border-color: #b3e19d;
  background: #f0f9eb;
  color: #529b2e;
}

.supplement-status--danger {
  border-color: #fab6b6;
  background: #fef0f0;
  color: #c45656;
}

.supplement-detail-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 16px;
  align-items: start;
}

.supplement-detail-main {
  display: grid;
  gap: 14px;
}

.supplement-detail-card {
  overflow: hidden;
}

.supplement-detail-card__title {
  padding: 16px 18px;
  border-bottom: 1px solid #dce5f1;
  color: #122448;
  font-size: 15px;
  font-weight: 600;
}

.supplement-detail-card__title--with-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.supplement-detail-card__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.supplement-detail-grid {
  display: grid;
  grid-template-columns: 130px minmax(0, 1fr) 130px minmax(0, 1fr);
  padding: 18px;
}

.supplement-detail-grid div {
  min-height: 38px;
  display: flex;
  align-items: center;
  min-width: 0;
  padding: 0 12px;
  border: 1px solid #e2e8f2;
  border-top: 0;
  border-left: 0;
  color: #122448;
  font-size: 13px;
}

.supplement-detail-grid div:nth-child(-n + 4) {
  border-top: 1px solid #e2e8f2;
}

.supplement-detail-grid div:nth-child(4n + 1) {
  border-left: 1px solid #e2e8f2;
}

.supplement-detail-grid div:nth-child(odd) {
  background: #f2f5fa;
  font-weight: 600;
}

.supplement-detail-card :deep(.el-table) {
  margin: 18px;
  width: calc(100% - 36px);
}

.supplement-items-form {
  padding: 18px;
}

.supplement-item-editor {
  padding: 16px;
  border: 1px solid #e2e8f2;
  border-radius: 4px;
  background: #fbfcff;
}

.supplement-item-editor + .supplement-item-editor {
  margin-top: 14px;
}

.supplement-item-editor__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  color: #122448;
}

.supplement-item-editor__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 24px;
}

.supplement-item-editor__grid :deep(.el-date-editor.el-input),
.supplement-item-editor__grid :deep(.el-select) {
  width: 100%;
}

.supplement-items-form :deep(.el-textarea) {
  width: 100%;
}

.supplement-approval-card {
  min-height: 360px;
}

.supplement-approval-timeline {
  padding: 22px 24px 26px;
}

.supplement-approval-step {
  position: relative;
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr);
  column-gap: 12px;
  min-height: 114px;
}

.supplement-approval-step:last-child {
  min-height: 0;
}

.supplement-approval-step__line {
  position: absolute;
  top: 12px;
  bottom: -12px;
  left: 6px;
  width: 1px;
  background: #d9e4f4;
}

.supplement-approval-step:last-child .supplement-approval-step__line {
  display: none;
}

.supplement-approval-step__dot {
  position: relative;
  z-index: 1;
  width: 12px;
  height: 12px;
  margin-top: 3px;
  border-radius: 50%;
  background: #6aa1f8;
}

.supplement-approval-step--active .supplement-approval-step__dot {
  background: #4f8df7;
}

.supplement-approval-step__body {
  min-width: 0;
  padding-bottom: 22px;
}

.supplement-approval-step__time {
  color: #6c7b92;
  font-size: 13px;
}

.supplement-approval-step__title {
  margin-top: 8px;
  color: #122448;
  font-size: 14px;
  font-weight: 600;
}

.supplement-approval-step__actor {
  margin-top: 6px;
  color: #466083;
  font-size: 13px;
}

.supplement-approval-step p {
  margin: 8px 0 0;
  color: #4f5f77;
  font-size: 13px;
  line-height: 1.7;
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

@media (max-width: 1200px) {
  .supplement-detail-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .supplement-detail-sidebar__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .supplement-detail-sidebar__actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .supplement-detail-card__title--with-action {
    align-items: flex-start;
    flex-direction: column;
  }

  .supplement-detail-card__actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .supplement-item-editor__grid {
    grid-template-columns: 1fr;
  }

  .supplement-detail-grid {
    grid-template-columns: 110px minmax(0, 1fr);
  }

  .supplement-detail-grid div:nth-child(-n + 4) {
    border-top: 0;
  }

  .supplement-detail-grid div:nth-child(-n + 2) {
    border-top: 1px solid #e2e8f2;
  }

  .supplement-detail-grid div:nth-child(4n + 1) {
    border-left: 0;
  }

  .supplement-detail-grid div:nth-child(odd) {
    border-left: 1px solid #e2e8f2;
  }
}
</style>
