<template>
  <div class="card">
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
              v-model="searchKeyword"
              style="width: 200px"
              placeholder="搜索..."
              clearable
              @keyup.enter="fetchProjectList"
              class="top-search"
            >
              <template #prepend>
                <el-button @click="fetchProjectList">
                  <i class="bx bx-search-alt"></i>
                </el-button>
              </template>
            </el-input>
            <!-- <el-tooltip
              placement="top"
              content="高级筛选"
            >
              <div
                @click.stop.prevent="OpenFilters"
                class="searchIcon"
                :class="{ emptyFilter: isEmptyQuery }"
              >
                <i class="bx bx-filter-alt"></i>
              </div>
            </el-tooltip> -->
          </div>
        </span>
        <div class="flex-shrink-0">
          <div class="d-flex">
            <el-button
              type="primary"
              @click="handleCreatePrj"
              >新建项目</el-button
            >
          </div>
        </div>
      </div>
    </div>
    <div style="padding: 0 10px 10px">
      <el-table
        :data="projectList"
        row-key="id"
        lazy
        :load="load"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :default-expand-all="false"
        :show-overflow-tooltip="true"
        :height="tableHeight"
      >
        <el-table-column
          prop="name"
          label="名称"
          min-width="250"
          sortable
          :filters="nameFilters"
          :filter-method="filterName"
        >
          <template #default="scope">
            <div
              style="
                display: inline-flex;
                align-items: center;
                gap: 4px;
                cursor: pointer;
              "
              @click="viewDetail(scope.row)"
            >
              <span
                class="bx bx-folder-open"
                style="color: #e17100; font-size: 16px"
                v-if="scope.row.level === 1"
              ></span
              ><span
                class="mdi mdi-file-tree"
                style="color: #155dfc; font-size: 16px"
                v-if="scope.row.level === 2"
              ></span
              ><span
                class="bx bx-file"
                style="color: #6a7282; font-size: 16px"
                v-if="scope.row.level === 3"
              ></span
              ><span>{{ scope.row.name }}</span>
            </div>
          </template></el-table-column
        >
        <el-table-column
          prop="type"
          label="类型"
          width="80"
          sortable
        >
          <template #default="scope">
            <span>{{ levelMap[scope.row.level] }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="custName"
          label="关联客户"
          width="250"
          sortable
          :filters="custNameFilters"
          :filter-method="filterCustName"
        >
          <template #default="scope">
            <span
              class="clickable"
              @click="previewCust(scope.row.custId)"
              >{{ scope.row.custName }}</span
            >
          </template>
        </el-table-column>
        <el-table-column
          prop="ownerName"
          label="负责人"
          width="120"
          sortable
          :filters="ownerFilters"
          :filter-method="filterOwner"
        ></el-table-column>
        <el-table-column
          prop="members"
          label="参与人"
          width="180"
          :filters="memberFilters"
          :filter-method="filterMembers"
        >
        </el-table-column>
        <el-table-column
          prop="creatorName"
          label="创建人"
          width="120"
          sortable
          :filters="creatorNameFilters"
          :filter-method="filterCreatorName"
        ></el-table-column>

        <el-table-column
          prop="status"
          label="状态"
          width="100"
          sortable
          :filters="statusFilters"
          :filter-method="filterStatus"
        >
          <template #default="scope">
            <el-tag
              :type="getStatusType(scope.row.status)"
              effect="dark"
            >
              {{ statusListMap[scope.row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="priority"
          label="优先级"
          width="160"
          sortable
          :filters="priorityFilters"
          :filter-method="filterPriority"
        >
          <template #default="scope">
            <el-tag
              :type="getPriorityType(scope.row.priority)"
              effect="dark"
            >
              {{ priorityListMap[scope.row.priority] }}
            </el-tag>
          </template></el-table-column
        >
        <el-table-column
          prop="startDate"
          label="开始日期"
          width="160"
          :sortable="true"
          :sort-method="sortDueDate"
          :filters="startDateFilters"
          :filter-method="filterStartDate"
        ></el-table-column>
        <el-table-column
          prop="dueDate"
          label="截止日期"
          width="160"
          :sortable="true"
          :sort-method="sortDueDate"
          :filters="dueDateFilters"
          :filter-method="filterDueDate"
        >
          <template #default="scope">
            <span
              :class="{
                'text-danger': isOverdue(scope.row.dueDate, scope.row.status),
              }"
            >
              {{ scope.row.dueDate }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div
      class="card-body border-bottom"
      v-if="total > 0"
      style="padding-top: 10px"
    >
      <Pagination
        :total="total"
        v-model:page="listQuery.pageNo"
        v-model:limit="listQuery.pageSize"
        @pagination="fetchProjectList"
        :pageSizes="pageSizesList"
      ></Pagination>
    </div>
    <CreateProject
      v-model:visible="showCreateProjectModal"
      @success="fetchProjectList"
    />
    <DragSidebar
      :noCloseOnEsc="false"
      v-if="isShowPrjDetail"
      sidebarName="project-sidebar"
      v-model="isShowPrjDetail"
      @close="handlePrjSidebarUpdate"
    >
      <ProjectDetail
        @close="handlePrjSidebarUpdate"
        :project-id="objId"
    /></DragSidebar>
    <DragSidebar
      :noCloseOnEsc="false"
      v-if="taskDetailModelValue"
      sidebarName="task-sidebar"
      v-model="taskDetailModelValue"
      @close="closeTaskDetailModal"
      ><TaskDetail
        :taskId="objId"
        @close="closeTaskDetailModal"
        :taskType="taskType"
      />
    </DragSidebar>
    <CustomerSidebar
      :custId="custId"
      v-if="isCustDetail"
      :showSidebar="isCustDetail"
      @update:showSidebar="custSidebarUpdate"
    />
    <el-dialog
      v-model="filterVisible"
      :width="900"
      draggable
      title="筛选"
      :destroy-on-close="false"
      :close-on-click-modal="false"
      ><el-form
        label-width="150px"
        label-position="top"
        size="default"
        @keyup.enter="handleSearch(0)"
        style="
          margin-top: 10px;
          display: grid;
          justify-content: center;
          gap: 20px;
          grid-template-columns: repeat(auto-fill, 400px);
        "
      >
        <el-form-item
          label="编号："
          class="project-filter-item"
        >
          <el-input
            type="text"
            clearable
            v-model="queryModuleData.projectCode"
            placeholder="请输入项目编号"
          />
        </el-form-item>
        <el-form-item
          label="项目名称："
          class="project-filter-item"
        >
          <el-input
            type="text"
            clearable
            v-model="queryModuleData.projectName"
            placeholder="请输入项目名称"
          />
        </el-form-item>
        <el-form-item
          label="状态："
          class="project-filter-item"
        >
          <el-input
            type="text"
            clearable
            v-model="queryModuleData.statuss"
            placeholder="请输入项目状态"
          /> </el-form-item></el-form
    ></el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps, watch, computed } from "vue";
import {
  queryProjectListUrl,
  queryTaskListUrl,
  querySubtaskListUrl,
} from "@/api/project";
import { statusListMap, priorityListMap } from "../../dataMap";
import Pagination from "@/components/common/pagination/index.vue";
import CreateProject from "../create-project-modal/index.vue";
// import ProjectSidebar from "../project-detail/project-sidebar.vue";
import ProjectDetail from "../project-detail/project-detail.vue";
import DragSidebar from "@/components/common/sidebar-drag/index.vue";
import TaskDetail from "../task/task-detail.vue";
import { useStore } from "vuex";
const store = useStore();
const props = defineProps({
  defaultFilter: {
    type: Object,
    default: () => ({}),
  },
});
const searchKeyword = ref(null);
const total = ref(0);
const listQuery = ref({
  pageNo: 1,
  pageSize: 50,
});

const levelMap = {
  1: "项目",
  2: "事项",
  3: "子事项",
};

const calculateTableHeight = () => {
  const layout = store.state.layout.layoutType;
  const windowHeight = document.documentElement.clientHeight;
  if (layout === "vertical") {
    return windowHeight - 235;
  } else {
    return windowHeight - 290;
  }
};
const pageSizesList = ref([10, 50, 200, 500, 1000]);
const projectList = ref([]);
const showCreateProjectModal = ref(false);
const objId = ref(null);
const taskType = ref(null);
const isShowPrjDetail = ref(false);
const custId = ref();
const isCustDetail = ref(false);
const filterVisible = ref(false);
const queryModuleData = ref({});
const tableHeight = ref(calculateTableHeight());

// const OpenFilters = () => {
//   filterVisible.value = true;
// };

// 创建一个 computed 属性来监听布局变化
const layoutType = computed(() => store.state.layout.layoutType);
watch(layoutType, () => {
  tableHeight.value = calculateTableHeight();
});

const custSidebarUpdate = (value) => {
  isCustDetail.value = value;
};
const taskDetailModelValue = ref(false);
const closeTaskDetailModal = () => {
  taskDetailModelValue.value = false;
  fetchProjectList();
};

const handlePrjSidebarUpdate = () => {
  isShowPrjDetail.value = false;
  fetchProjectList();
};
const handleCreatePrj = () => {
  showCreateProjectModal.value = true;
};
const viewDetail = (values) => {
  console.log(values, "values@@");
  if (values.level === 1) {
    objId.value = values.id;
    isShowPrjDetail.value = true;
  } else {
    if (values.level === 2) {
      const id = values.id.replace(/task/g, "");
      objId.value = id;
    } else {
      const id = values.id.replace(/subtaskId/g, "");
      objId.value = id;
    }
    taskType.value = values.level === 2 ? 1 : 3;
    taskDetailModelValue.value = true;
  }
};
const previewCust = (id) => {
  custId.value = id;
  isCustDetail.value = true;
};

// 获取项目列表
const fetchProjectList = async () => {
  const params = {
    ...listQuery.value,
    searchKeyword: searchKeyword.value,
    ...props.defaultFilter,
  };
  const response = await queryProjectListUrl(params);
  if (response.data && response.success) {
    projectList.value = response.data.map((item) => ({
      ...item,
      hasChildren: item.childCount > 0,
      id: item.prjId,
      level: 1, // 标识为第一级
    }));
    total.value = response.total || 0;

    // 更新筛选器数据
    updateFilters();
  }
};

// 懒加载数据
const load = async (row, treeNode, resolve) => {
  console.log(row, "row");

  // 根据层级判断调用哪个接口
  if (row.level === 1) {
    // 获取任务列表
    try {
      const response = await queryTaskListUrl({ projectId: row.id });
      if (response.data && response.success) {
        const taskList = response.data.map((item) => ({
          ...item,
          hasChildren: item.childCount > 0,
          id: "task" + item.taskId,
          level: 2, // 标识为第二级
        }));
        resolve(taskList);
      } else {
        resolve([]);
      }
    } catch (error) {
      console.error("获取任务列表失败:", error);
      resolve([]);
    }
  } else if (row.level === 2) {
    // 获取子任务列表
    try {
      const id = row.id.replace(/task/g, "");
      const response = await querySubtaskListUrl({ taskId: id });
      if (response.data && response.success) {
        const subtaskList = response.data.map((item) => ({
          ...item,
          id: "subtaskId" + item.subtaskId,
          level: 3, // 标识为第三级
        }));
        resolve(subtaskList);
      } else {
        resolve([]);
      }
    } catch (error) {
      console.error("获取子任务列表失败:", error);
      resolve([]);
    }
  } else {
    resolve([]);
  }
};

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    0: "info",
    1: "primary",
    2: "primary",
    3: "success",
    4: "warning",
    5: "danger",
  };
  return statusMap[status] || "info";
};

const getPriorityType = (priority) => {
  const priorityMap = {
    0: "info",
    1: "success",
    2: "danger",
    3: "danger",
  };
  return priorityMap[priority] || "info";
};

// 筛选数据
const nameFilters = ref([]);
const ownerFilters = ref([]);
const custNameFilters = ref([]);
const creatorNameFilters = ref([]);
const startDateFilters = ref([]);
const memberFilters = ref([]);
const statusFilters = ref([
  { text: "待开始", value: 0 },
  { text: "进行中", value: 1 },
  { text: "测试中", value: 2 },
  { text: "已完成", value: 3 },
  { text: "已暂停", value: 4 },
  { text: "已取消", value: 5 },
]);
const priorityFilters = ref([
  { text: "低", value: 0 },
  { text: "中", value: 1 },
  { text: "高", value: 2 },
  { text: "紧急", value: 3 },
]);
const dueDateFilters = ref([]);

// 筛选方法
const filterName = (value, row) => {
  return row.name.includes(value);
};

const filterOwner = (value, row) => {
  return row.ownerName === value;
};

const filterCustName = (value, row) => {
  return row.custName === value;
};

const filterCreatorName = (value, row) => {
  return row.creatorName === value;
};

const filterMembers = (value, row) => {
  if (!row.members) return false;
  // 将参与人字符串按分号分隔成数组
  const membersArray = row.members.split(";").map(m => m.trim());
  // 检查筛选值是否在参与人数组中
  return membersArray.includes(value);
};

const filterStartDate = (value, row) => {
  if (!row.startDate) return false;
  return row.startDate.includes(value);
};

const filterStatus = (value, row) => {
  return row.status === value;
};

const filterPriority = (value, row) => {
  return row.priority === value;
};

const filterDueDate = (value, row) => {
  if (!row.dueDate) return false;
  return row.dueDate.includes(value);
};

const sortDueDate = (a, b) => {
  // 处理空值情况，将空值排在最后
  if (!a.dueDate && !b.dueDate) return 0;
  if (!a.dueDate) return 1;
  if (!b.dueDate) return -1;

  // 将日期字符串转换为日期对象进行比较
  const dateA = new Date(a.dueDate);
  const dateB = new Date(b.dueDate);

  return dateA - dateB;
};

// 判断日期是否超过当日
const isOverdue = (date, status) => {
  if (!date) return false;
  if ([2, 3, 4].includes(status)) return false; // 已完成的项目不判断是否过期
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 设置为当天开始时间
  const dueDate = new Date(date);
  return dueDate < today;
};

// 更新筛选数据
const updateFilters = () => {
  // 从项目列表中提取唯一的名称和负责人
  const names = [...new Set(projectList.value.map((item) => item.name))];
  const owners = [
    ...new Set(projectList.value.map((item) => item.ownerName).filter(Boolean)),
  ];
  const custNames = [
    ...new Set(projectList.value.map((item) => item.custName).filter(Boolean)),
  ];
  const creatorNames = [
    ...new Set(
      projectList.value.map((item) => item.creatorName).filter(Boolean)
    ),
  ];
  // 获取所有参与人，处理多个参与人用分号分隔的情况
  const allMembers = [];
  projectList.value.forEach(item => {
    if (item.members) {
      const membersArray = item.members.split(";").map(m => m.trim()).filter(Boolean);
      allMembers.push(...membersArray);
    }
  });
  const uniqueMembers = [...new Set(allMembers)];
  const startDates = [
    ...new Set(projectList.value.map((item) => item.startDate).filter(Boolean)),
  ];
  const dueDates = [
    ...new Set(projectList.value.map((item) => item.dueDate).filter(Boolean)),
  ];

  nameFilters.value = names.map((name) => ({ text: name, value: name }));
  ownerFilters.value = owners.map((owner) => ({ text: owner, value: owner }));
  custNameFilters.value = custNames.map((name) => ({
    text: name,
    value: name,
  }));
  creatorNameFilters.value = creatorNames.map((name) => ({
    text: name,
    value: name,
  }));
  memberFilters.value = uniqueMembers.map((member) => ({
    text: member,
    value: member,
  }));
  startDateFilters.value = startDates.map((date) => ({
    text: date,
    value: date,
  }));
  dueDateFilters.value = dueDates.map((date) => ({ text: date, value: date }));
};
watch(
  () => props.defaultFilter,
  () => {
    fetchProjectList();
  },
  { immediate: true, deep: true }
);

// 组件挂载时获取数据
onMounted(() => {
  fetchProjectList();
});
</script>

<style lang="scss" scoped>
.searchIcon {
  height: 32px;
  width: 34px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background-color: #556ee6;
  cursor: pointer;
}
.searchIcon:hover {
  background-color: #556ee6;
}
.project-filter-item {
  margin-bottom: 0;
}
</style>
