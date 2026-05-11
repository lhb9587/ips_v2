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
  deleteAttendanceGroup,
  queryAttendanceGroupDeleteCheck,
  queryAttendanceGroupDetail,
  queryAttendanceGroupPage,
  saveAttendanceGroup,
  saveAttendanceGroupMembers,
} from "@/api/attendance";

const route = useRoute();
const store = useStore();

const bussId = 457;
const gridName = "attendanceGroupGrid";

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
const detailMemberQuery = ref({
  pageNo: 1,
  pageSize: 20,
});
const formInline = ref({});
const total = ref(0);
const gridData = ref([]);
const detailLoading = ref(false);
const gridOptions = {
  rowMultiSelectWithClick: true,
};

const currentOperator = computed(() => ({
  operatorId: store.state.user.userId || undefined,
  operatorName: store.state.user.name || undefined,
}));

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
  memberPageNo: Number(item.memberPageNo) || 1,
  memberPageSize: Number(item.memberPageSize) || 20,
  memberTotal: Number(item.memberTotal) || 0,
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
    const records = Array.isArray(res?.data)
      ? res.data
      : res?.data?.records || [];
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
    total.value =
      Number(res?.total) ||
      Number(res?.data?.total) ||
      0;
    if (Number(res?.currPage)) {
      listQuery.value.pageNo = Number(res.currPage);
    }
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
    attendanceOrganizationOptions.value.find(
      (item) => String(item.organizationCode) === "102",
    ) ||
    (attendanceOrganizationOptions.value.length === 1
      ? attendanceOrganizationOptions.value[0]
      : {});

  return {
    id: Date.now(),
    code: "",
    name: "",
    organizationCode: defaultOrganization.organizationCode || "102",
    organizationName: defaultOrganization.organizationName || "万慧达",
    remark: "",
    referenced: false,
    members: [],
  };
};

const openCreateDetail = () => {
  detailMemberQuery.value = {
    pageNo: 1,
    pageSize: 20,
  };
  selectedDetail.value = buildNewGroup();
  detailMode.value = "create";
  detailVisible.value = true;
};

const openGroupDetail = (params, pagination = {}) => {
  const rowData = params?.data || params;
  if (!rowData) {
    return;
  }
  const nextPageNo = Number(pagination.pageNo) || detailMemberQuery.value.pageNo || 1;
  const nextPageSize =
    Number(pagination.pageSize) || detailMemberQuery.value.pageSize || 20;
  detailMemberQuery.value = {
    pageNo: nextPageNo,
    pageSize: nextPageSize,
  };
  detailLoading.value = true;
  queryAttendanceGroupDetail(
    {
      groupId: rowData.id,
      pageNo: nextPageNo,
      pageSize: nextPageSize,
    },
    {
      isLoading: true,
    },
  )
    .then((res) => {
      const detailData = res?.data || {};
      const memberRecords = Array.isArray(detailData?.members?.records)
        ? detailData.members.records
        : [];
      selectedDetail.value = buildDetailRecord({
        ...rowData,
        ...detailData,
        members: memberRecords,
        memberPageNo: detailData?.members?.pageNo || nextPageNo,
        memberPageSize: detailData?.members?.pageSize || nextPageSize,
        memberTotal: detailData?.members?.total || 0,
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
  detailMemberQuery.value = {
    pageNo: 1,
    pageSize: 20,
  };
};

const removeGroupFromGrid = (groupId) => {
  gridData.value = gridData.value.filter((item) => item.id !== groupId);
  if (gridData.value.length === 0 && listQuery.value.pageNo > 1) {
    listQuery.value.pageNo -= 1;
  }
};

const refreshAttendanceGroupListAfterDelete = (groupId) => {
  removeGroupFromGrid(groupId);
  if (total.value > 0) {
    total.value = Math.max(total.value - 1, 0);
  }
  fetchAttendanceGroupList();
};

const handleDeleteDetail = async (record) => {
  if (!record?.id) {
    closeDetail();
    return;
  }

  try {
    const checkRes = await queryAttendanceGroupDeleteCheck(
      {
        groupId: record.id,
      },
      {
        isLoading: true,
      },
    );
    const checkData = checkRes?.data || {};

    if (checkData.canDelete === false) {
      ElMessage.warning(
        checkData.reason ||
          `当前考勤组存在 ${checkData.referenceCount || 0} 条引用记录，暂不允许删除`,
      );
      return;
    }

    await ElMessageBox.confirm(`确认删除 ${record.name} 吗？`, "删除确认", {
      type: "warning",
      confirmButtonText: "删除",
      cancelButtonText: "取消",
    });

    await deleteAttendanceGroup(
      {
        groupId: record.id,
        ...currentOperator.value,
      },
      {
        isLoading: true,
      },
    );

    refreshAttendanceGroupListAfterDelete(record.id);
    if (selectedDetail.value?.id === record.id) {
      closeDetail();
    }
    ElMessage.success("考勤组已删除");
  } catch (error) {
    if (error === "cancel" || error === "close" || error?.message === "cancel") {
      return;
    }
  }
};

const handleSaveGroup = (payload) => {
  const isCreateMode = detailMode.value === "create";
  const memberTalentCodes = Array.isArray(payload.members)
    ? payload.members.map((item) => item.employeeCode).filter(Boolean)
    : [];
  const request = isCreateMode
    ? saveAttendanceGroup(
        {
          groupId: undefined,
          groupCode: payload.code,
          groupName: payload.name,
          orgCode: payload.organizationCode,
          remark: payload.remark || "",
          memberTalentCodes,
          ...currentOperator.value,
        },
        {
          isLoading: true,
        },
      )
    : saveAttendanceGroupMembers(
        {
          groupId: payload.id || undefined,
          memberTalentCodes,
          ...currentOperator.value,
        },
        {
          isLoading: true,
        },
      );

  request
    .then((res) => {
      const result = res?.data || {};
      const nextId = result.groupId || payload.id;
      const successMessage =
        result.message || (isCreateMode ? "考勤组已创建" : "成员已保存");
      listQuery.value.pageNo = 1;
      fetchAttendanceGroupList();
      if (isCreateMode) {
        closeDetail();
        ElMessage.success(successMessage);
        return;
      }
      selectedDetail.value = buildDetailRecord({
        ...payload,
        id: nextId,
      });
      detailMode.value = "view";
      ElMessage.success(successMessage);
      if (nextId) {
        openGroupDetail(
          { data: { ...selectedDetail.value, id: nextId } },
          detailMemberQuery.value,
        );
      }
    })
    .catch(() => {
      selectedDetail.value = buildDetailRecord(payload);
    });
};

const handleMemberPageChange = (pagination) => {
  if (!selectedDetail.value?.id) {
    return;
  }
  openGroupDetail(
    { data: { ...selectedDetail.value, id: selectedDetail.value.id } },
    pagination,
  );
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
        @save="handleSaveGroup"
        @member-page-change="handleMemberPageChange"
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


