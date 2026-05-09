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
import {
  queryAttendanceGroupDetail,
  queryAttendanceGroupPage,
  saveAttendanceGroup,
} from "@/api/attendance";

const route = useRoute();
const store = useStore();

const bussId = 457;
const gridName = "attendanceGroupGrid";

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

const attendanceOrganizationOptions = computed(() =>
  (store.getters["attendanceScope/deptScopes"] || []).map((item) => ({
    organizationCode: item.deptId,
    organizationName: item.deptName,
    organizationFullName: item.deptName,
  })),
);

const columnList = ref([]);
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
const total = ref(0);
const gridData = ref([]);
const detailLoading = ref(false);
const gridOptions = {
  rowMultiSelectWithClick: true,
};

const buildMemberRecord = (item = {}) => ({
  employeeCode: item.employeeCode || item.talentCode || "",
  employeeName: item.employeeName || item.talentName || "",
  attendancePosition: item.attendancePosition || item.posName || "",
  attendanceOrganization: item.attendanceOrganization || item.deptName || "",
  transferTime: item.transferTime || item.transferOutTime || "",
  transferOrganization: item.transferOrganization || item.transferOutOrg || "",
});

const buildDetailRecord = (item = {}) => ({
  id: item.id || item.groupId || "",
  code: item.code || item.groupCode || "",
  name: item.name || item.groupName || "",
  organizationCode: item.organizationCode || item.orgCode || "",
  organizationName: item.organizationName || item.orgName || "",
  remark: item.remark || "",
  referenced: Boolean(item.referenced),
  members: Array.isArray(item.members)
    ? item.members.map((member) => buildMemberRecord(member))
    : [],
});

const setColumn = (list) => {
  columnList.value = Array.isArray(list) ? list : [];
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

const fetchAttendanceGroupList = () => {
  queryAttendanceGroupPage(
    {
      pageNo: listQuery.value.pageNo,
      pageSize: listQuery.value.pageSize,
      groupCode: diminput.value || undefined,
      groupName: diminput.value || undefined,
      ...formInline.value,
    },
    {
      isLoading: true,
    },
  ).then((res) => {
    const records = res?.data?.records || [];
    gridData.value = records.map((item, index) => ({
      ...item,
      id: item.groupId,
      code: item.groupCode,
      name: item.groupName,
      organizationCode: item.orgCode,
      organizationName: item.orgName,
      members: [],
      referenced: false,
      sid: (listQuery.value.pageNo - 1) * listQuery.value.pageSize + index,
    }));
    total.value = res?.data?.total || 0;
  });
};

const fuzzySearch = () => {
  listQuery.value.pageNo = 1;
  formInline.value = {};
  fetchAttendanceGroupList();
};

const cellRenderer = (params) => {
  return `<span title="${params.value || params.value === 0 ? params.value : ""}">${
    params.value || params.value === 0 ? params.value : ""
  }</span>`;
};

const buildNewGroup = () => {
  const defaultOrganization =
    attendanceOrganizationOptions.value.length === 1
      ? attendanceOrganizationOptions.value[0]
      : {};

  return {
    id: Date.now(),
    code: "",
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
  detailLoading.value = true;
  queryAttendanceGroupDetail(
    {
      groupId: params.data.id,
      pageNo: 1,
      pageSize: 200,
    },
    {
      isLoading: true,
    },
  )
    .then((res) => {
      const detailData = res?.data || {};
      selectedDetail.value = buildDetailRecord({
        ...params.data,
        ...detailData,
        members: detailData?.members?.records || [],
      });
      detailMode.value = "view";
      detailVisible.value = true;
    })
    .catch(() => {
      selectedDetail.value = {};
    })
    .finally(() => {
      detailLoading.value = false;
    });
};

const closeDetail = () => {
  detailVisible.value = false;
  selectedDetail.value = {};
};

const deleteGroups = (rows) => {
  const referencedRows = rows.filter((item) => item.referenced);
  if (referencedRows.length > 0) {
    ElMessage.warning("已被排班引用的考勤组不允许删除");
    return false;
  }

  const targetIds = new Set(rows.map((item) => item.id));
  gridData.value = gridData.value.filter((item) => !targetIds.has(item.id));
  if (gridData.value.length === 0 && listQuery.value.pageNo > 1) {
    listQuery.value.pageNo -= 1;
  }
  return true;
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
  const requestData = {
    groupId: payload.id || undefined,
    groupCode: payload.code,
    groupName: payload.name,
    orgCode: payload.organizationCode,
    remark: payload.remark || "",
    memberTalentCodes: Array.isArray(payload.members)
      ? payload.members.map((item) => item.employeeCode).filter(Boolean)
      : [],
  };

  saveAttendanceGroup(requestData, {
    isLoading: true,
  })
    .then((res) => {
      const result = res?.data || {};
      const nextId = result.groupId || payload.id;
      selectedDetail.value = buildDetailRecord({
        ...payload,
        id: nextId,
      });
      detailMode.value = "view";
      listQuery.value.pageNo = 1;
      ElMessage.success(result.message || (payload.id ? "考勤组已更新" : "考勤组已创建"));
      fetchAttendanceGroupList();
      if (nextId) {
        openGroupDetail({ data: { ...selectedDetail.value, id: nextId } });
      }
    })
    .catch(() => {
      selectedDetail.value = buildDetailRecord(payload);
    });
};

const handlePagination = () => {
  fetchAttendanceGroupList();
};

onMounted(() => {
  document.addEventListener("fullscreenchange", handleFullScreenChange);
  fetchAttendanceGroupList();
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
                </div>
              </span>
              <div class="d-flex gap-2">
                <TopListTool
                  :gridName="gridName"
                  :buss-id="bussId"
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
              :bussId="bussId"
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
        :organizationOptions="attendanceOrganizationOptions"
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


