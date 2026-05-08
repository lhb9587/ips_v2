<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { ElMessage, ElMessageBox } from "element-plus";
import Layout from "@/layouts/main";
import GridView from "@/components/common/grid-table/index.vue";
import TopListTool from "@/components/common/top-list-tool/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import DragSidebar from "@/components/common/sidebar-drag/index.vue";
import AttendanceProfileDetailSidebar from "@/views/hrm/attendance-profile/detail-sidebar.vue";
import { saveTableConfig } from "@/utils";

const route = useRoute();
const store = useStore();

const gridName = "attendanceProfileGrid";
const defaultHolidaySystem = "默认假期制度";
const defaultAttendanceSystem = "默认考勤制度";
const organizationOptions = [
  {
    organizationCode: "ORG001",
    organizationName: "万慧达",
    organizationFullName: "万慧达知识产权代理有限公司",
  },
  {
    organizationCode: "ORG002",
    organizationName: "人力资源部",
    organizationFullName: "万慧达知识产权代理有限公司/人力资源部",
  },
  {
    organizationCode: "ORG003",
    organizationName: "产品研发部",
    organizationFullName: "万慧达知识产权代理有限公司/产品研发部",
  },
];

const employeeOptions = [
  {
    employeeCode: "10633",
    employeeName: "杨光",
    organizationCode: "ORG001",
    organizationName: "万慧达",
    positionName: "组长",
    employmentStatus: "在职",
    groupEntryDate: "2022-03-15",
    attendanceNo: "KQ10633",
  },
  {
    employeeCode: "10634",
    employeeName: "张敏",
    organizationCode: "ORG002",
    organizationName: "人力资源部",
    positionName: "招聘主管",
    employmentStatus: "在职",
    groupEntryDate: "2021-08-09",
    attendanceNo: "KQ10634",
  },
  {
    employeeCode: "10635",
    employeeName: "李倩",
    organizationCode: "ORG002",
    organizationName: "人力资源部",
    positionName: "HRBP",
    employmentStatus: "在职",
    groupEntryDate: "2020-11-20",
    attendanceNo: "KQ10635",
  },
  {
    employeeCode: "10636",
    employeeName: "王浩",
    organizationCode: "ORG003",
    organizationName: "产品研发部",
    positionName: "前端工程师",
    employmentStatus: "在职",
    groupEntryDate: "2023-02-06",
    attendanceNo: "KQ10636",
  },
  {
    employeeCode: "10637",
    employeeName: "赵雪",
    organizationCode: "ORG001",
    organizationName: "万慧达",
    positionName: "会计",
    employmentStatus: "在职",
    groupEntryDate: "2019-06-10",
    attendanceNo: "KQ10637",
  },
  {
    employeeCode: "10638",
    employeeName: "陈博",
    organizationCode: "ORG001",
    organizationName: "万慧达",
    positionName: "法务专员",
    employmentStatus: "试用期",
    groupEntryDate: "2024-09-02",
    attendanceNo: "KQ10638",
  },
  {
    employeeCode: "10639",
    employeeName: "周颖",
    organizationCode: "ORG003",
    organizationName: "产品研发部",
    positionName: "测试工程师",
    employmentStatus: "在职",
    groupEntryDate: "2022-12-01",
    attendanceNo: "KQ10639",
  },
  {
    employeeCode: "10640",
    employeeName: "孙洋",
    organizationCode: "ORG001",
    organizationName: "万慧达",
    positionName: "客户经理",
    employmentStatus: "在职",
    groupEntryDate: "2021-04-18",
    attendanceNo: "KQ10640",
  },
];

const shiftOptions = [
  {
    shiftCode: "001",
    shiftName: "九点班次",
    overtimePayType: "调休",
    applicableFrequency: "一段",
    cardRule: "默认取卡规则",
    standardWorkHours: 7.75,
    organizationCode: "ORG001",
    organizationName: "万慧达",
    isDefault: true,
  },
  {
    shiftCode: "002",
    shiftName: "九点半班次",
    overtimePayType: "调休",
    applicableFrequency: "一段",
    cardRule: "默认取卡规则",
    standardWorkHours: 7.25,
    organizationCode: "ORG001",
    organizationName: "万慧达",
    isDefault: false,
  },
  {
    shiftCode: "003",
    shiftName: "十点班次",
    overtimePayType: "调休",
    applicableFrequency: "一段",
    cardRule: "默认取卡规则",
    standardWorkHours: 6.75,
    organizationCode: "ORG001",
    organizationName: "万慧达",
    isDefault: false,
  },
  {
    shiftCode: "004",
    shiftName: "九点班次-十二点下班",
    overtimePayType: "调休",
    applicableFrequency: "一段",
    cardRule: "默认取卡规则",
    standardWorkHours: 2.75,
    organizationCode: "ORG001",
    organizationName: "万慧达",
    isDefault: false,
  },
  {
    shiftCode: "005",
    shiftName: "九点半班次-十二点下班",
    overtimePayType: "调休",
    applicableFrequency: "一段",
    cardRule: "默认取卡规则",
    standardWorkHours: 2.25,
    organizationCode: "ORG001",
    organizationName: "万慧达",
    isDefault: false,
  },
  {
    shiftCode: "006",
    shiftName: "十点班次-十二点下班",
    overtimePayType: "调休",
    applicableFrequency: "一段",
    cardRule: "默认取卡规则",
    standardWorkHours: 1.75,
    organizationCode: "ORG001",
    organizationName: "万慧达",
    isDefault: false,
  },
  {
    shiftCode: "007",
    shiftName: "哺乳假-9点",
    overtimePayType: "调休",
    applicableFrequency: "一段",
    cardRule: "默认取卡规则",
    standardWorkHours: 6.75,
    organizationCode: "ORG001",
    organizationName: "万慧达",
    isDefault: false,
  },
  {
    shiftCode: "008",
    shiftName: "哺乳假-10点",
    overtimePayType: "调休",
    applicableFrequency: "一段",
    cardRule: "默认取卡规则",
    standardWorkHours: 6.75,
    organizationCode: "ORG001",
    organizationName: "万慧达",
    isDefault: false,
  },
  {
    shiftCode: "009",
    shiftName: "哺乳假-9点半",
    overtimePayType: "调休",
    applicableFrequency: "一段",
    cardRule: "默认取卡规则",
    standardWorkHours: 6.25,
    organizationCode: "ORG001",
    organizationName: "万慧达",
    isDefault: false,
  },
  {
    shiftCode: "010",
    shiftName: "哺乳假-18点",
    overtimePayType: "调休",
    applicableFrequency: "一段",
    cardRule: "默认取卡规则",
    standardWorkHours: 6.75,
    organizationCode: "ORG001",
    organizationName: "万慧达",
    isDefault: false,
  },
];

const columnOptions = [
  { title: "员工编码", value: "employeeCode" },
  { title: "姓名", value: "employeeName" },
  { title: "考勤编号", value: "attendanceNo" },
  { title: "假期制度", value: "holidaySystem" },
  { title: "考勤制度", value: "attendanceSystem" },
  { title: "默认班次", value: "defaultShift" },
];

const columnList = ref([...columnOptions]);
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

const activeClass = ref([]);
const rowHeight = ref(40);
const isFull = ref(false);
const boxRef = ref(null);
const gridRef = ref(null);
const diminput = ref("");
const detailVisible = ref(false);
const detailMode = ref("view");
const selectedDetail = ref({});
const gridOptions = {
  rowMultiSelectWithClick: true,
};

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
    return windowHeight - 244;
  }
  return windowHeight - 290;
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

const fetchLocalPageSize = () => {
  const pageSizeData = JSON.parse(localStorage.getItem("pageSize")) || [];
  const savedData = pageSizeData.find((item) => item.name === route.name);
  return savedData ? savedData.pageSize : 50;
};

const listQuery = ref({
  pageNo: 1,
  pageSize: fetchLocalPageSize(),
});
const pageSizesList = ref([10, 50, 200, 500, 1000, 5000, 10000]);
const formInline = ref({});

const profileList = ref([
  {
    id: 1,
    employeeCode: "10633",
    employeeName: "杨光",
    attendanceNo: "KQ10633",
    holidaySystem: defaultHolidaySystem,
    attendanceSystem: defaultAttendanceSystem,
    defaultShift: "标准班次",
  },
  {
    id: 2,
    employeeCode: "10634",
    employeeName: "张敏",
    attendanceNo: "KQ10634",
    holidaySystem: defaultHolidaySystem,
    attendanceSystem: defaultAttendanceSystem,
    defaultShift: "早班",
  },
  {
    id: 3,
    employeeCode: "10635",
    employeeName: "李倩",
    attendanceNo: "KQ10635",
    holidaySystem: defaultHolidaySystem,
    attendanceSystem: defaultAttendanceSystem,
    defaultShift: "行政班",
  },
  {
    id: 4,
    employeeCode: "10636",
    employeeName: "王浩",
    attendanceNo: "KQ10636",
    holidaySystem: defaultHolidaySystem,
    attendanceSystem: defaultAttendanceSystem,
    defaultShift: "弹性班次",
  },
  {
    id: 5,
    employeeCode: "10637",
    employeeName: "赵雪",
    attendanceNo: "KQ10637",
    holidaySystem: defaultHolidaySystem,
    attendanceSystem: defaultAttendanceSystem,
    defaultShift: "标准班次",
  },
  {
    id: 6,
    employeeCode: "10638",
    employeeName: "陈博",
    attendanceNo: "KQ10638",
    holidaySystem: defaultHolidaySystem,
    attendanceSystem: defaultAttendanceSystem,
    defaultShift: "晚班",
  },
  {
    id: 7,
    employeeCode: "10639",
    employeeName: "周岚",
    attendanceNo: "KQ10639",
    holidaySystem: defaultHolidaySystem,
    attendanceSystem: defaultAttendanceSystem,
    defaultShift: "行政班",
  },
  {
    id: 8,
    employeeCode: "10640",
    employeeName: "孙洋",
    attendanceNo: "KQ10640",
    holidaySystem: defaultHolidaySystem,
    attendanceSystem: defaultAttendanceSystem,
    defaultShift: "标准班次",
  },
]);

const filteredList = computed(() => {
  const keyword = diminput.value.trim().toLowerCase();
  if (!keyword) {
    return profileList.value;
  }
  return profileList.value.filter((item) =>
    [
      item.employeeCode,
      item.employeeName,
      item.attendanceNo,
      item.holidaySystem,
      item.attendanceSystem,
      item.defaultShift,
    ].some((field) => String(field || "").toLowerCase().includes(keyword)),
  );
});

const total = computed(() => filteredList.value.length);

const gridData = computed(() => {
  const start = (listQuery.value.pageNo - 1) * listQuery.value.pageSize;
  const end = start + listQuery.value.pageSize;
  return filteredList.value.slice(start, end).map((item, index) => ({
    ...item,
    sid: start + index,
  }));
});

const fuzzySearch = () => {
  listQuery.value.pageNo = 1;
  formInline.value = {};
};

const cellRenderer = (params) => {
  return `<span title="${params.value || params.value === 0 ? params.value : ""}">${
    params.value || params.value === 0 ? params.value : ""
  }</span>`;
};

const buildNewProfile = () => {
  return {
    id: Date.now(),
    employeeCode: "",
    employeeName: "",
    attendanceNo: "",
    holidaySystem: defaultHolidaySystem,
    attendanceSystem: defaultAttendanceSystem,
    defaultShift: "标准班次",
  };
};

const openCreateDetail = () => {
  selectedDetail.value = buildNewProfile();
  detailMode.value = "create";
  detailVisible.value = true;
};

const openProfileDetail = (params) => {
  if (!params?.data) {
    return;
  }
  selectedDetail.value = { ...params.data };
  detailMode.value = "view";
  detailVisible.value = true;
};

const getSelectedRows = () => {
  return gridRef.value?.getRowList?.() || [];
};

const closeDetail = () => {
  detailVisible.value = false;
  selectedDetail.value = {};
};

const handleSaveProfile = (payload) => {
  const normalizedPayload = {
    ...payload,
    holidaySystem: defaultHolidaySystem,
    attendanceSystem: defaultAttendanceSystem,
  };
  const targetIndex = profileList.value.findIndex((item) => item.id === payload.id);
  if (targetIndex > -1) {
    profileList.value.splice(targetIndex, 1, {
      ...profileList.value[targetIndex],
      ...normalizedPayload,
    });
    selectedDetail.value = { ...profileList.value[targetIndex] };
    ElMessage.success("考勤档案已更新");
    return;
  }

  profileList.value.unshift(normalizedPayload);
  selectedDetail.value = { ...normalizedPayload };
  detailMode.value = "view";
  listQuery.value.pageNo = 1;
  ElMessage.success("考勤档案已新增");
};

const deleteProfiles = (rows) => {
  const targetIds = new Set(rows.map((item) => item.id));
  profileList.value = profileList.value.filter((item) => !targetIds.has(item.id));
  if (gridData.value.length === 0 && listQuery.value.pageNo > 1) {
    listQuery.value.pageNo -= 1;
  }
};

const handleDeleteSelected = () => {
  const selectedRows = getSelectedRows();
  if (selectedRows.length === 0) {
    return ElMessage.warning("请先选择需要删除的考勤档案");
  }

  ElMessageBox.confirm(
    `确认删除选中的 ${selectedRows.length} 条考勤档案吗？`,
    "删除确认",
    {
      type: "warning",
      confirmButtonText: "删除",
      cancelButtonText: "取消",
    },
  ).then(() => {
    deleteProfiles(selectedRows);
    ElMessage.success("考勤档案已删除");
  });
};

const handleDeleteDetail = (record) => {
  if (!record?.id) {
    closeDetail();
    return;
  }

  ElMessageBox.confirm(`确认删除 ${record.employeeName} 的考勤档案吗？`, "删除确认", {
    type: "warning",
    confirmButtonText: "删除",
    cancelButtonText: "取消",
  }).then(() => {
    deleteProfiles([record]);
    closeDetail();
    ElMessage.success("考勤档案已删除");
  });
};

const handlePagination = () => {};

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
                <div
                  class="d-flex"
                  style="gap: 10px"
                >
                  <el-input
                    v-model="diminput"
                    style="width: 200px"
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
                  <el-button
                    type="primary"
                    @click="openCreateDetail"
                  >
                    新增
                  </el-button>
                  <el-button
                    type="danger"
                    plain
                    @click="handleDeleteSelected"
                  >
                    删除
                  </el-button>
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
                    ...formInline,
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
              :rowDoubleClicked="openProfileDetail"
              :gridOptions="gridOptions"
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
      v-if="detailVisible"
      v-model="detailVisible"
      sidebarName="attendance-profile-detail-sidebar"
      :minWidth="760"
      :width="900"
      :noCloseOnEsc="true"
      :backdrop="false"
      @close="closeDetail"
    >
      <AttendanceProfileDetailSidebar
        :detailInfo="selectedDetail"
        :mode="detailMode"
        :organizationOptions="organizationOptions"
        :employeeOptions="employeeOptions"
        :shiftOptions="shiftOptions"
        @save="handleSaveProfile"
        @delete="handleDeleteDetail"
        @close="closeDetail"
      />
    </DragSidebar>
  </Layout>
</template>

<style scoped lang="scss">
.card-body {
  flex: none;
}
</style>
