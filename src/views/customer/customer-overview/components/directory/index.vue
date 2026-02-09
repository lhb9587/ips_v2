<template>
  <div class="cust-directory-container">
    <div class="sidebar-tree-container">
      <!-- 1. 搜索框 -->
      <div class="search-box">
        <el-input
          v-model="filterText"
          placeholder="搜索客户或项目..."
          :prefix-icon="Search"
          clearable
          style="flex: 1"
        />
        <template v-if="myFollow === 1">
          <el-dropdown
            placement="bottom-end"
            trigger="click"
            v-if="!isEditing"
          >
            <div class="more-action">
              <div style="width: 16px"><MoreFilled /></div>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleAddFollowOpen"
                  ><div class="action-menu-item">
                    <div class="menu-icon"><Plus /></div>
                    <span>添加关注客户</span>
                  </div></el-dropdown-item
                >
                <el-dropdown-item @click="handleEditing">
                  <div class="action-menu-item">
                    <div class="menu-icon"><Edit /></div>
                    <span>编辑模式</span>
                  </div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <div
            class="more-action"
            v-else
            @click="handleQuitEditing"
          >
            <div style="width: 16px"><Close /></div>
          </div>
        </template>
      </div>

      <!-- 2. 树形控件容器 -->
      <div
        class="tree-wrapper"
        v-infinite-scroll="loadMoreData"
        :infinite-scroll-disabled="loading || !hasMore"
        :infinite-scroll-distance="80"
        :infinite-scroll-immediate="false"
        v-loading="firstLoading"
        element-loading-text="加载中..."
        v-if="!isEditing"
      >
        <el-tree
          v-if="treeVisible"
          ref="treeRef"
          class="custom-tree"
          :props="defaultProps"
          :filter-node-method="filterNode"
          node-key="id"
          :expand-on-click-node="false"
          highlight-current
          :lazy="true"
          :load="loadNode"
          @node-click="handleNodeClick"
        >
          <!-- 自定义节点内容插槽 -->
          <template #default="{ node, data }">
            <div class="custom-tree-node">
              <!-- 左侧：图标 + 文本 -->
              <div class="node-content">
                <el-icon class="node-icon">
                  <!-- 根据数据类型动态显示图标 -->
                  <component :is="getIcon(data)" />
                </el-icon>
                <span class="node-label">{{ node.label }}</span>
              </div>

              <!-- 右侧：数量徽标 (如果有 count 且不为 0) -->
              <div
                v-if="data.count !== undefined"
                class="node-count"
              >
                {{ data.count }}
              </div>
            </div>
          </template>
        </el-tree>
        <!-- 加载更多提示 -->
        <div
          v-if="loading"
          class="load-more"
        >
          <div class="loading-text"><span class="spinner"></span>加载中...</div>
        </div>
        <div
          v-else-if="!hasMore && total > 0"
          class="load-more"
        >
          <div class="no-more-text">没有更多数据了</div>
        </div>
      </div>
      <div
        class="more-customer"
        v-if="!isEditing"
      >
        <el-button
          v-if="myFollow === 1"
          :icon="ArrowDownBold"
          type="info"
          plain
          @click="changeCustFanwei(0)"
          >查看更多客户</el-button
        >
        <el-button
          v-else
          :icon="ArrowUpBold"
          type="info"
          plain
          @click="changeCustFanwei(1)"
          >显示关注客户</el-button
        >
      </div>
      <CustDrag
        ref="dragCopRef"
        v-if="isEditing"
        :list="treeData"
        @handleClick="handleNodeClick"
      />
    </div>
    <div class="content-container">
      <cust-detail
        :cust-id="selectedNodeInfo.id"
        v-if="selectedNodeInfo.type === 'company'"
      />
      <project-table
        v-else-if="
          selectedNodeInfo.type === 'project' ||
          selectedNodeInfo.type === 'folder'
        "
        :defaultFilter="defaultFilter"
      />
      <div
        v-else-if="
          selectedNodeInfo.type === 'case' ||
          selectedNodeInfo.type === 'team_case'
        "
      >
        <TrademarkList v-if="caseDomain === 3" />
        <PatentList v-if="caseDomain === 4" />
        <LitigationList v-if="caseDomain === 2" />
        <ProtectionList v-if="caseDomain === 1" />
        <DomainList v-if="caseDomain === 75" />
        <CopyrightList v-if="caseDomain === 76" />
        <NonlitigationList v-if="caseDomain === 86" />
        <AllCasesList v-if="caseDomain === 0" />
      </div>
      <div
        class="empty"
        v-else
      >
        <div class="empty-text">请从左侧选择一个客户或项目</div>
        <div class="enpty-desc">点击左侧列表中的项目来查看详细信息</div>
      </div>
    </div>
    <el-dialog
      v-model="addFollowCustVisible"
      width="500"
      align-center
      @close="handleCloseAddFollow"
    >
      <template #title>
        <h3>关注客户</h3>
        <div style="color: #62748e">
          默认列出可见客户，支持搜索筛选，请从可见库中选择（不支持自由输入）。
        </div>
      </template>
      <el-input
        v-model="custNameText"
        placeholder="搜索客户名称"
        :prefix-icon="Search"
        clearable
        @keyup.enter="handleSearchCust"
      />
      <div
        class="customer-list"
        v-loading="custSearchLoading"
        element-loading-text="加载中..."
        v-infinite-scroll="loadMoreCustomers"
        :infinite-scroll-disabled="custSearchLoading || !hasMoreCustomers"
        :infinite-scroll-distance="80"
        :infinite-scroll-immediate="false"
      >
        <!-- 暂无数据提示 -->
        <div
          v-if="!custSearchLoading && custAllList.length === 0"
          class="empty-customers"
        >
          <div class="empty-icon">
            <i class="bx bx-search"></i>
          </div>
          <div class="empty-text">暂无客户数据</div>
        </div>

        <div
          class="customer-item"
          v-for="item in custAllList"
          :key="item.custId"
        >
          <div class="left">
            <span class="icon bx bx-buildings"></span>
            <div class="info">
              <div class="name">{{ item.fullname }}</div>
              <div class="sub">客户库</div>
            </div>
          </div>

          <button
            class="add-btn"
            @click="handleAddFollowItem(item)"
          >
            添加
          </button>
        </div>
        <!-- 加载更多提示 -->
        <div
          v-if="custSearchLoading"
          class="load-more-customers"
        >
          <div class="loading-text"><span class="spinner"></span>加载中...</div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseAddFollow">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, computed, onBeforeUnmount, nextTick } from "vue";
import {
  Search,
  OfficeBuilding,
  Suitcase,
  User,
  Folder,
  Document,
  MoreFilled,
  Plus,
  Edit,
  ArrowDownBold,
  ArrowUpBold,
  Close,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import {
  queryCustomerListNew,
  addUserFollowCust,
  fetchList,
  addUserCustSort,
} from "@/api/customerList";
import { queryProjectListUrl } from "@/api/project";
import CustDetail from "./cust-detail.vue";
import ProjectTable from "@/views/project/components/table/index.vue";
import CustDrag from "./cust-drag.vue";

//导入所有案件列表
import TrademarkList from "@/views/case/trademark";
import PatentList from "@/views/case/patent";
import LitigationList from "@/views/case/litigation";
import ProtectionList from "@/views/case/protection";
import DomainList from "@/views/case/domain";
import CopyrightList from "@/views/case/copyright";
import NonlitigationList from "@/views/case/nonlitigation";
import AllCasesList from "@/views/case/allcases";

import { useStore } from "vuex";
const store = useStore();

// --- 1. 数据定义 (模拟图片中的数据) ---
// 初始树形数据为空，将通过懒加载加载
const myFollow = ref(1);
const currentPage = ref(1);
const pageSize = ref(30); // 每页加载的数量
const hasMore = ref(true); // 是否还有更多数据
const loading = ref(false); // 是否正在加载
const firstLoading = ref(false); // 是否初次加载
const selectedNodeInfo = ref({}); // 当前选中的节点
const defaultFilter = ref({});
const total = ref(0); // 总数据量
const addFollowCustVisible = ref(false);
const custNameText = ref();
const custAllList = ref([]);
const custSearchLoading = ref(false);
const custCurrentPage = ref(1);
const hasMoreCustomers = ref(true);
const custPageSize = ref(20);
const treeVisible = ref(true);
const isEditing = ref(false);
const treeData = ref([]);
const dragCopRef = ref(null);

const caseDomain = computed({
  get() {
    return store.state.case.caseDomain;
  },
  set(value) {
    store.commit("case/CHANGE_CASEDOMAIN", value);
  },
});

// const closeAddFollowCustModal = () => {
//   addFollowCustVisible.value = false;
// };
const changeCustFanwei = (value) => {
  myFollow.value = value;
  currentPage.value = 1;
  hasMore.value = true;
  treeVisible.value = false;
  nextTick(() => {
    treeVisible.value = true;
  });
};

const handleEditing = () => {
  isEditing.value = true;
  console.log(treeRef.value, "treeRef.value");
  console.log(treeRef.value.getNode(), "treeRef.value.getNodes");
};

const handleSearchCust = () => {
  custCurrentPage.value = 1;
  fetchCustAllList();
};
const handleQuitEditing = () => {
  isEditing.value = false;
  //获取drag中导出的数据
  const data = dragCopRef.value.exportData();
  const ids = data.map((item) => item.id);
  addUserCustSort({ custIdList: ids });
};
const handleNodeClick = (values) => {
  console.log(values, "values@@");

  selectedNodeInfo.value = values;
  if (values.type === "folder") {
    defaultFilter.value = {
      custId: values.custId,
    };
  } else if (values.type === "project") {
    defaultFilter.value = {
      projectCode: values.projectCode,
      custId: values.custId,
    };
  } else if (values.type === "case" || values.type === "team_case") {
    store.commit("case/CHANGE_CASEBELONGTO", values.type === "case" ? 1 : 2);
    //在面包屑里面添加默认的筛选条件
    const defaultFilters = [
      {
        value: "classified",
        id: values.custId,
      },
    ];
    store.commit("case/CHANGE_BREADCRUMB", defaultFilters);
    store.commit("case/CHANGE_CASEDOMAIN", 0);
    store.commit("layout/CHANGE_CASE_SHOWTYPE", "folder");
  }
};

// --- 2. 搜索逻辑 ---
const filterText = ref("");
const treeRef = ref(null);

// 模拟异步获取子节点数据的函数
const getChildrenData = async (node, resolve) => {
  console.log(node, "node@@");

  if (node.level === 1) {
    // 加载二级节点
    const companyId = node.data.id;
    let children = [
      {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        custId: companyId,
        label: "我的案件",
        type: "case",
        count: node.data.myCaseCount || 0,
        leaf: true,
      },
      {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        custId: companyId,
        label: "团队案件",
        type: "team_case",
        count: node.data.teamCount || 0,
        leaf: true,
      },
      {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        custId: companyId,
        label: "项目",
        type: "folder",
        count: node.data.projectSumCount || 0,
      },
    ];
    resolve(children);
  } else if (node.level === 2 && node.data.type === "folder") {
    // 加载三级节点（项目列表）
    const custId = node.data.custId;
    const res = await fetchProjectList(custId);
    let projects = res.map((item) => {
      return {
        id: item.prjId,
        projectCode: item.projectCode,
        custId: custId,
        label: item.name,
        type: "project",
        leaf: true,
      };
    });

    resolve(projects);
  }
};

// 懒加载处理函数
const loadNode = async (node, resolve) => {
  if (!node?.level) {
    // 重置分页状态
    currentPage.value = 1;
    hasMore.value = true;
    // 设置初次加载状态为true
    firstLoading.value = true;

    const res = await fetchCustomerList();
    const companies = res.data.map((item) => {
      return {
        id: item.custId,
        label: item.fullname,
        type: "company",
        myCaseCount: item.customerDto?.myCaseCount || 0,
        teamCount: item.customerDto?.teamCount || 0,
        projectSumCount: item.customerDto?.projectSumCount || 0,
      };
    });

    nextTick(() => {
      treeRef.value.setCurrentKey(companies[0].id);
      handleNodeClick(companies[0]);
    })
    // 检查是否还有更多数据
    hasMore.value = res.data.length >= pageSize.value;
    // 数据加载完成后，设置初次加载状态为false
    firstLoading.value = false;
    treeData.value = companies;
    resolve(companies);
  } else {
    // 加载子节点
    getChildrenData(node, resolve);
  }
};

// 加载更多数据
const loadMoreData = async () => {
  if (loading.value || !hasMore.value) return;

  loading.value = true;
  currentPage.value += 1;

  try {
    const res = await fetchCustomerList();
    const newCompanies = res.data.map((item) => {
      return {
        id: item.custId,
        label: item.fullname,
        type: "company",
        myCaseCount: item.customerDto?.myCaseCount || 0,
        teamCount: item.customerDto?.teamCount || 0,
        projectSumCount: item.customerDto?.projectSumCount || 0,
      };
    });

    // 使用el-tree的append方法添加新节点
    if (treeRef.value) {
      newCompanies.forEach((company) => {
        treeRef.value.append(company, null);
      });
    }
    treeData.value = [...treeData.value, ...newCompanies];

    // 检查是否还有更多数据
    hasMore.value = res.data.length >= pageSize.value;
  } catch (error) {
    console.error("加载更多数据失败:", error);
  } finally {
    loading.value = false;
  }
};

const fetchCustomerList = async () => {
  const params = {
    myFollow: myFollow.value,
    carryCard: 1,
    pageSize: pageSize.value,
    pageNo: currentPage.value,
    keywords: filterText.value,
  };
  const res = await queryCustomerListNew(params);
  return res;
};

const handleAddFollowOpen = () => {
  addFollowCustVisible.value = true;
  fetchCustAllList();
};

const handleAddFollowItem = (values) => {
  console.log(values, "values");
  addUserFollowCust({ custId: values.custId }).then((res) => {
    if (res.success) {
      ElMessage.success("添加关注成功");
      handleCloseAddFollow();
      treeVisible.value = false;
      nextTick(() => {
        treeVisible.value = true;
      });
    }
  });
};

const handleCloseAddFollow = () => {
  addFollowCustVisible.value = false;
  custNameText.value = "";
  custAllList.value = [];
  custCurrentPage.value = 1;
  hasMoreCustomers.value = true;
};
const fetchCustAllList = async (isLoadMore = false) => {
  console.log(isLoadMore, "isLoadMore");
  custSearchLoading.value = true;

  if (!isLoadMore) {
    custCurrentPage.value = 1;
    custAllList.value = [];
  }

  const params = {
    pageSize: custPageSize.value,
    pageNo: custCurrentPage.value,
    keywords: custNameText.value,
    follow:0
  };

  try {
    const res = await fetchList(params);
    if (isLoadMore) {
      custAllList.value = [...custAllList.value, ...(res.data || [])];
    } else {
      custAllList.value = res.data || [];
    }

    // 判断是否还有更多数据
    hasMoreCustomers.value = (res.data || []).length >= custPageSize.value;
  } finally {
    custSearchLoading.value = false;
  }
};

const loadMoreCustomers = () => {
  if (custSearchLoading.value || !hasMoreCustomers.value) return;

  custCurrentPage.value += 1;
  fetchCustAllList(true);
};

const fetchProjectList = async (custId) => {
  const params = {
    pageNo: 1,
    pageSize: 10000,
    custId,
  };
  const response = await queryProjectListUrl(params);
  return response.data;
};

const defaultProps = {
  children: "children",
  label: "label",
  isLeaf: (data) => {
    // 如果是项目类型且count为0，则为叶子节点
    if (data.type === "folder" && data.count === 0) {
      return true;
    }
    // 其他情况根据leaf属性判断
    return data.leaf;
  },
};

watch(filterText, (val) => {
  treeRef.value?.filter(val);
});

const filterNode = (value, data) => {
  if (!value) return true;
  return data.label.includes(value);
};

// --- 3. 图标映射逻辑 ---
const getIcon = (data) => {
  switch (data.type) {
    case "company":
      return OfficeBuilding; // 公司图标
    case "case":
      return Suitcase; // 案件图标
    case "team_case":
      return User; // 团队图标
    case "folder":
      return Folder; // 文件夹图标
    case "project":
      return Document; // 具体项目图标
    default:
      return Document;
  }
};
onBeforeUnmount(() => {
  store.commit("case/CHANGE_CASEBELONGTO", 1);
  store.commit("case/CHANGE_BREADCRUMB", []);
});
</script>

<style lang="scss" scoped>
.cust-directory-container {
  display: flex;
  gap: 24px;
  .sidebar-tree-container {
    width: 350px; /* 根据实际需求调整宽度 */
    height: 100%;
    background-color: #fff;
    border-right: 1px solid #e4e7ed;
    display: flex;
    flex-direction: column;

    .tree-wrapper {
      overflow-y: auto;
      padding: 0 8px;
      height: calc(100vh - 210px);

      .load-more {
        padding: 10px 0;
        text-align: center;
        color: #909399;
        font-size: 14px;

        .loading-text {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
      }
    }

    .search-box {
      padding: 12px;
      display: flex;
      gap: 12px;
    }

    // 深度选择器修改 el-tree 内部样式
    :deep(.el-tree) {
      // 节点行高和内边距
      .el-tree-node__content {
        height: 40px;
        padding: 0 10px; // 给右侧数字留点呼吸空间
        border-radius: 4px;
        margin: 0 8px;

        &:hover {
          background-color: #f5f7fa;
        }
      }

      // 选中状态的高亮颜色 (类似图片中的淡蓝色背景)
      .el-tree-node.is-current > .el-tree-node__content {
        background-color: #ecf5ff;
        color: #409eff;
        font-weight: 500;

        .node-count {
          color: #409eff;
          background-color: #d9ecff;
        }
      }
    }

    .custom-tree-node {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 10px;
      font-size: 14px;
      overflow: hidden; // 防止文字过长溢出

      .node-content {
        display: flex;
        align-items: center;
        overflow: hidden;

        .node-icon {
          margin-right: 8px;
          font-size: 16px;
          color: #606266;
        }

        .node-label {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      .node-count {
        font-size: 12px;
        color: #909399;
        background-color: #f4f4f5;
        padding: 2px 8px;
        border-radius: 10px;
        margin-left: 8px;
      }
    }
  }
  .content-container {
    flex: 1;
  }
}
.empty {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 24px;
  color: #62748e;
  padding: 24px;
  .empty-text {
    font-size: 18px;
  }
  .empty-desc {
    font-size: 14px;
  }
}
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #d0d7ff;
  border-top-color: #556ee6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.more-action {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  width: 32px;
  box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color))
    inset;
  cursor: pointer;
  &:hover {
    background-color: #f5f7fa;
  }
}
.action-menu-item {
  display: flex;
  gap: 12px;
  align-items: center;
  .menu-icon {
    width: 16px;
    display: flex;
    align-items: center;
  }
}
.customer-list {
  background: #fff;
  border: 1px solid #e5e6eb;
  overflow: auto;
  height: 350px;
  margin-top: 16px;

  .empty-customers {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
    color: #909399;

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
      color: #c0c4cc;
    }

    .empty-text {
      font-size: 14px;
    }
  }

  .load-more-customers {
    padding: 10px 0;
    text-align: center;
    color: #909399;
    font-size: 14px;

    .loading-text {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
  }
}

.customer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background: #f8f9fb;
  }

  .left {
    display: flex;
    align-items: center;

    .icon {
      font-size: 18px;
      margin-right: 10px;
    }

    .info {
      .name {
        font-size: 15px;
        font-weight: 600;
        color: #333;
        margin-bottom: 2px;
      }
      .sub {
        font-size: 13px;
        color: #999;
      }
    }
  }

  .add-btn {
    padding: 4px 14px;
    border: none;
    background: #f7f8fa;
    color: #333;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    white-space: nowrap;
  }
}
.more-customer {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  margin-top: 10px;
}
</style>
