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
import AttendanceGroupDetailSidebar from "@/views/hrm/attendance-group/detail-sidebar.vue";
import { saveTableConfig } from "@/utils";

const route = useRoute();
const store = useStore();

const gridName = "attendanceGroupGrid";
const columnOptions = [
  { title: "编码", value: "code" },
  { title: "名称", value: "name" },
  { title: "组织", value: "organizationName" },
  { title: "备注", value: "remark" },
  { title: "成员数", value: "memberCount" },
];

const organizationOptions = [
  {
    organizationCode: "ORG001",
    organizationName: "曜斗科技",
    organizationFullName: "曜斗科技有限公司",
  },
  {
    organizationCode: "ORG002",
    organizationName: "产品研发部",
    organizationFullName: "曜斗科技有限公司/产品研发部",
  },
  {
    organizationCode: "ORG003",
    organizationName: "人力资源部",
    organizationFullName: "曜斗科技有限公司/人力资源部",
  },
  {
    organizationCode: "ORG004",
    organizationName: "华东运营中心",
    organizationFullName: "曜斗科技有限公司/华东运营中心",
  },
];

const employeeOptions = [
  {
    employeeCode: "10633",
    employeeName: "杨光",
    attendancePosition: "组长",
    attendanceOrganization: "曜斗科技",
    transferTime: "",
    transferOrganization: "",
  },
  {
    employeeCode: "10634",
    employeeName: "张敏",
    attendancePosition: "招商主管",
    attendanceOrganization: "华东运营中心",
    transferTime: "",
    transferOrganization: "",
  },
  {
    employeeCode: "10635",
    employeeName: "李倩",
    attendancePosition: "HRBP",
    attendanceOrganization: "人力资源部",
    transferTime: "",
    transferOrganization: "",
  },
  {
    employeeCode: "10636",
    employeeName: "王浩",
    attendancePosition: "前端工程师",
    attendanceOrganization: "产品研发部",
    transferTime: "",
    transferOrganization: "",
  },
  {
    employeeCode: "10637",
    employeeName: "赵雪",
    attendancePosition: "会计",
    attendanceOrganization: "财务管理部",
    transferTime: "2026-03-01",
    transferOrganization: "财务共享中心",
  },
  {
    employeeCode: "10638",
    employeeName: "陈博",
    attendancePosition: "法务专员",
    attendanceOrganization: "法务中心",
    transferTime: "",
    transferOrganization: "",
  },
  {
    employeeCode: "10639",
    employeeName: "周岚",
    attendancePosition: "市场经理",
    attendanceOrganization: "市场发展部",
    transferTime: "",
    transferOrganization: "",
  },
  {
    employeeCode: "10640",
    employeeName: "孙洋",
    attendancePosition: "客户经理",
    attendanceOrganization: "客户成功部",
    transferTime: "",
    transferOrganization: "",
  },
];

const columnList = ref([...columnOptions]);
const activeClass = ref([]);
const rowHeight = ref(40);
const isFull = ref(false);
const boxRef = ref(null);
const gridRef = ref(null);
const diminput = ref("");
const detailVisible = ref(false);
const detailMode = ref("view");
const selectedDetail = ref({});
const formInline = ref({});
const gridOptions = {
  rowMultiSelectWithClick: true,
};

const attendanceGroupList = ref([
  {
    id: 1,
    code: "KQG001",
    name: "行政标准考勤组",
    organizationCode: "ORG001",
    organizationName: "曜斗科技",
    remark: "适用于行政班员工",
    referenced: true,
    members: [employeeOptions[0], employeeOptions[2], employeeOptions[3]],
  },
  {
    id: 2,
    code: "KQG002",
    name: "华东运营考勤组",
    organizationCode: "ORG004",
    organizationName: "华东运营中心",
    remark: "跨组织统一排班",
    referenced: false,
    members: [employeeOptions[1], employeeOptions[6], employeeOptions[7]],
  },
  {
    id: 3,
    code: "KQG003",
    name: "弹性班考勤组",
    organizationCode: "ORG002",
    organizationName: "产品研发部",
    remark: "研发与支持岗位弹性班",
    referenced: false,
    members: [employeeOptions[3], employeeOptions[5]],
  },
]);

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

const filteredList = computed(() => {
  const keyword = diminput.value.trim().toLowerCase();
  const source = attendanceGroupList.value.map((item) => ({
    ...item,
    memberCount: item.members?.length || 0,
  }));
  if (!keyword) {
    return source;
  }

  return source.filter((item) =>
    [item.code, item.name, item.organizationName, item.remark].some((field) =>
      String(field || "").toLowerCase().includes(keyword),
    ),
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

const buildNewGroup = () => {
  const nextNumber =
    Math.max(
      ...attendanceGroupList.value.map((item) =>
        Number(String(item.code).replace(/\D/g, "")) || 0,
      ),
      0,
    ) + 1;
  const defaultOrganization =
    organizationOptions.length === 1 ? organizationOptions[0] : {};

  return {
    id: Date.now(),
    code: `KQG${String(nextNumber).padStart(3, "0")}`,
    name: "",
    organizationCode: defaultOrganization.organizationCode || "",
    organizationName: defaultOrganization.organizationName || "",
    remark: "",
    referenced: false,
    members: [],
  };
};

const openCreateDetail = () => {
  selectedDetail.value = buildNewGroup();
  detailMode.value = "create";
  detailVisible.value = true;
};

const openGroupDetail = (params) => {
  if (!params?.data) {
    return;
  }
  selectedDetail.value = {
    ...params.data,
    members: [...(params.data.members || [])],
  };
  detailMode.value = "view";
  detailVisible.value = true;
};

const closeDetail = () => {
  detailVisible.value = false;
  selectedDetail.value = {};
};

const getSelectedRows = () => {
  return gridRef.value?.getRowList?.() || [];
};

const deleteGroups = (rows) => {
  const referencedRows = rows.filter((item) => item.referenced);
  if (referencedRows.length > 0) {
    ElMessage.warning("已被排班引用的考勤组不允许删除");
    return false;
  }

  const targetIds = new Set(rows.map((item) => item.id));
  attendanceGroupList.value = attendanceGroupList.value.filter(
    (item) => !targetIds.has(item.id),
  );
  if (gridData.value.length === 0 && listQuery.value.pageNo > 1) {
    listQuery.value.pageNo -= 1;
  }
  return true;
};

const handleDeleteSelected = () => {
  const selectedRows = getSelectedRows();
  if (selectedRows.length === 0) {
    return ElMessage.warning("请先选择需要删除的考勤组");
  }

  ElMessageBox.confirm(
    `确认删除选中的 ${selectedRows.length} 个考勤组吗？`,
    "删除确认",
    {
      type: "warning",
      confirmButtonText: "删除",
      cancelButtonText: "取消",
    },
  ).then(() => {
    if (deleteGroups(selectedRows)) {
      ElMessage.success("考勤组已删除");
    }
  });
};

const handleDeleteDetail = (record) => {
  if (!record?.id) {
    closeDetail();
    return;
  }

  ElMessageBox.confirm(`确认删除 ${record.name} 吗？`, "删除确认", {
    type: "warning",
    confirmButtonText: "删除",
    cancelButtonText: "取消",
  }).then(() => {
    if (deleteGroups([record])) {
      closeDetail();
      ElMessage.success("考勤组已删除");
    }
  });
};

const handleSaveGroup = (payload) => {
  const targetIndex = attendanceGroupList.value.findIndex(
    (item) => item.id === payload.id,
  );
  const nextRecord = {
    ...payload,
    members: [...(payload.members || [])],
  };

  if (targetIndex > -1) {
    attendanceGroupList.value.splice(targetIndex, 1, {
      ...attendanceGroupList.value[targetIndex],
      ...nextRecord,
    });
    selectedDetail.value = {
      ...attendanceGroupList.value[targetIndex],
      members: [...(attendanceGroupList.value[targetIndex].members || [])],
    };
    ElMessage.success("考勤组已更新");
    return;
  }

  attendanceGroupList.value.unshift(nextRecord);
  selectedDetail.value = { ...nextRecord, members: [...nextRecord.members] };
  detailMode.value = "view";
  listQuery.value.pageNo = 1;
  ElMessage.success("考勤组已创建");
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
                    创建
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
              :rowDoubleClicked="openGroupDetail"
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
      sidebarName="attendance-group-detail-sidebar"
      :minWidth="860"
      :width="1080"
      :noCloseOnEsc="true"
      :backdrop="false"
      @close="closeDetail"
    >
      <AttendanceGroupDetailSidebar
        :detailInfo="selectedDetail"
        :mode="detailMode"
        :organizationOptions="organizationOptions"
        :employeeOptions="employeeOptions"
        @save="handleSaveGroup"
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
