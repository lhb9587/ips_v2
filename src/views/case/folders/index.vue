<template>
  <Layout>
    <div
      class="config-top"
      v-if="showType === 'folder'"
    >
      <div class="config-breadcrumb">
        <div
          class="config-breadcrumb-item"
          @click="handleGoHome"
        >
          <i
            class="bx bx-home-alt"
            style="font-size: 18px"
          ></i>
        </div>
        <div
          class="config-breadcrumb-item"
          @click="handleGoBackOne"
          v-if="breadcrumbList.length > 1"
        >
          <i
            class="bx bx-left-arrow-alt"
            style="font-size: 18px"
          ></i>
        </div>
        <el-breadcrumb
          :separator-icon="ArrowRight"
          class="breadcrumb-custom"
        >
          <el-breadcrumb-item
            v-for="(item, index) in breadcrumbList"
            :key="`${item.value}-${index}`"
            :class="{
              'breadcrumb-clickable': index !== breadcrumbList.length - 1,
            }"
            @click="handleBreadcrumbClick(item, index)"
            >{{ item.label }}</el-breadcrumb-item
          >
        </el-breadcrumb>
      </div>
      <div class="config-right">
        <Tabs
          :tabList="showFirstTypeTabsList"
          :activeTab="activeTab"
          @change="switchTab"
          theme="dark"
          v-if="breadcrumbList.length === 1"
        />
        <Tabs
          :tabList="caseBelongTabsList"
          :activeTab="casebelongValue"
          @change="changeCasebelongValue"
          theme="dark"
          v-if="breadcrumbList.length !== 4 && !isSmallScreen"
        />
        <Tabs
          :tabList="caseDomainTabsList"
          :activeTab="caseDomainValue"
          @change="changeCaseDoaminValue"
          theme="dark"
          v-if="breadcrumbList.length === 1 && !isSmallScreen"
        />
        <Tabs
          :tabList="caseStatusTabsList"
          :activeTab="caseStatus"
          @change="changeCaseStatusValue"
          theme="dark"
          v-if="breadcrumbList.length !== 4 && !isSmallScreen"
        />

        <!-- 小屏幕下的更多筛选按钮 -->
        <el-popover
          placement="bottom"
          :width="280"
          trigger="click"
          v-if="isSmallScreen"
        >
          <template #reference>
            <div class="more-filters-btn">
              <i class="bx bx-filter-alt"></i>
              <span>更多筛选</span>
            </div>
          </template>

          <div class="more-filters-content">
            <div
              class="filter-section"
              v-if="breadcrumbList.length !== 4"
            >
              <div class="filter-title">案件所属</div>
              <div class="filter-options">
                <div
                  v-for="item in caseBelongTabsList"
                  :key="item.value"
                  class="filter-option"
                  :class="{ active: casebelongValue === item.value }"
                  @click="changeCasebelongValue(item.value)"
                >
                  <i
                    :class="item.icon"
                    v-if="item.icon"
                  ></i>
                  <span>{{ item.label }}</span>
                </div>
              </div>
            </div>

            <div
              class="filter-section"
              v-if="breadcrumbList.length === 1"
            >
              <div class="filter-title">案件领域</div>
              <div class="filter-options">
                <div
                  v-for="item in caseDomainTabsList"
                  :key="item.value"
                  class="filter-option"
                  :class="{ active: caseDomainValue === item.value }"
                  @click="changeCaseDoaminValue(item.value)"
                >
                  <span>{{ item.label }}</span>
                </div>
              </div>
            </div>

            <div
              class="filter-section"
              v-if="breadcrumbList.length !== 4"
            >
              <div class="filter-title">案件状态</div>
              <div class="filter-options">
                <div
                  v-for="item in caseStatusTabsList"
                  :key="item.value"
                  class="filter-option"
                  :class="{ active: caseStatus === item.value }"
                  @click="changeCaseStatusValue(item.value)"
                >
                  <span>{{ item.label }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-popover>
        <div
          class="text-search"
          v-if="currentLevel !== 'caseList'"
        >
          <div
            v-if="showTopSearch"
            class="text-search-input"
          >
            <el-input
              v-model="inputValue"
              style="width: 260px"
              placeholder="搜索..."
              @keyup.enter="fuzzySearch"
              class="top-search"
              ref="textSearchRef"
            >
              <template #prepend>
                <el-button @click="fuzzySearch">
                  <i class="bx bx-search-alt"></i>
                </el-button>
              </template>
            </el-input>
            <div
              class="close-input"
              @click="closeInput"
            >
              <i
                class="mdi mdi-close"
                style="font-size: 18px"
              ></i>
            </div>
          </div>
          <div
            v-else
            class="search-icon"
            @click="showInput"
          >
            <i
              class="bx bx-search-alt"
              style="font-size: 18px"
            ></i>
          </div>
        </div>
        <div
          class="file-total"
          v-if="folderList?.length && currentLevel !== 'caseList'"
        >
          {{ totalText }}
        </div>
      </div>
    </div>
    <div
      class="list-content"
      v-if="showType === 'folder' && currentLevel !== 'caseList'"
      v-infinite-scroll="loadMore"
      :infinite-scroll-disabled="currentBusy || !currentHasMore"
      :infinite-scroll-distance="2"
      :infinite-scroll-immediate="false"
    >
      <div
        class="folder-list"
        v-if="folderList?.length"
      >
        <FolderItem
          v-for="item in folderList"
          :key="item.id"
          :icon="folderItemInfo.icon"
          :icon-color="folderItemInfo.iconColor"
          :title="item.title"
          :subtitle="folderItemInfo.subtitle"
          :categoryLabel="folderItemInfo.categoryLabel"
          :custGradeStr="item.custGradeStr"
          :userIcon="item.userIcon"
          :description="item.description"
          :case-count="item.caseCount"
          case-count-icon="bx bx-file"
          :category-count="item.categoryCount"
          category-icon="bx bx-folder"
          :selected="item.id === selectedId"
          @select="selectedId = item.id"
          @dblclick="(payload) => handleEnterFolder(item, payload)"
        />
      </div>
      <div
        class="empty-data"
        v-if="!folderList?.length && !currentBusy"
      >
        <div class="empty-box">
          <div
            class="bx bx-folder"
            style="font-size: 64px; color: #62748e"
          ></div>
          <div
            style="
              margin-top: 12px;
              font-size: 18px;
              color: #62748e;
              font-weight: bold;
            "
          >
            暂无数据
          </div>
          <div style="margin-top: 12px; font-size: 14px; color: #62748e">
            请检查数据源或联系管理员
          </div>
        </div>
      </div>
      <!-- <div
        class="more-customer"
        v-if="
          activeTab === 'customer' &&
          currentLevel === 'customer' &&
          casebelongValue !== 1
        "
      >
        <el-button
          v-if="custFanwei === 1"
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
          >显示我的客户</el-button
        >
      </div> -->
    </div>
    <div
      v-if="showType === 'list'"
      class="table-list"
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
    <div v-if="currentLevel === 'caseList'">
      <AllCasesList />
    </div>
  </Layout>
</template>
<script>
export default {
  name: "case-folders",
};
</script>
<script setup>
import Layout from "@/layouts/main";
import FolderItem from "@/components/case/folder-item/index.vue";
import { ref, nextTick, computed, watch, onUnmounted } from "vue";
import { ArrowRight } from "@element-plus/icons-vue";
import { statisticCase } from "@/api/caseList";
import Tabs from "@/components/common/tabs";
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

//显示类型
const showType = computed(() => {
  return store.state.layout.caseShowType;
});
const showTopSearch = ref(false);
const windowWidth = ref(window.innerWidth);
const isSmallScreen = computed(
  () => breadcrumbList.value?.length === 1 && windowWidth.value < 1800,
);

watch(showType, (newVal) => {
  selectedId.value = null;
  if (newVal === "folder") {
    caseDomainValue.value = 0;
    initBreadcrumb();
  } else {
    caseDomain.value = 0;
  }
});

//菜单面包屑
const activeTab = ref("domain");
const inputValue = ref("");
const custFanwei = ref(1);

const defaultBreadcrumbByTab = {
  domain: { label: "领域", value: "domain" },
  customer: { label: "客户", value: "customer" },
};
const caseDomainValue = ref(0); //文件夹案件领域
const caseDomain = computed({
  get() {
    return store.state.case.caseDomain;
  },
  set(value) {
    store.commit("case/CHANGE_CASEDOMAIN", value);
  },
});
const casebelongValue = computed({
  get() {
    return store.state.case.caseBelongTo;
  },
  set(value) {
    store.commit("case/CHANGE_CASEBELONGTO", value);
  },
});
const breadcrumbList = ref([]);
const currentLevel = ref(defaultBreadcrumbByTab.domain.value); //当前所处级别 领域、类型、客户、案件列表
const currentLevelValue = ref(defaultBreadcrumbByTab.domain.value);
const levelOptions = computed(() => {
  return activeTab.value === "domain"
    ? {
        domain: "casetype",
        casetype: "customer",
        customer: "caseList",
      }
    : {
        customer: "domain",
        domain: "casetype",
        casetype: "caseList",
      };
});
const caseStatus = computed({
  get() {
    return store.state.case.caseStatus;
  },
  set(value) {
    store.commit("case/CHANGE_CASESTATUS", value);
  },
});

const folderList = ref([]);
const folderItemInfo = computed(() => {
  const map = {
    domain: {
      icon: "bx bx-buildings",
      iconColor: "#2d5cf2",
      subtitle: "领域",
      categoryLabel: "案件类型",
    },
    casetype: {
      icon: "bx bx-folder",
      iconColor: "#1abc9c",
      subtitle: "分类",
      categoryLabel: "客户数量",
    },
    customer: {
      icon: "bx bx-buildings",
      iconColor: "#155dfc",
      subtitle: "客户",
      categoryLabel: "领域类型",
    },
    caseList: {
      icon: "bx bx-file",
      iconColor: "#f39c12",
      subtitle: "案件",
    },
  };
  return map[currentLevelValue.value] || map.domain;
});
const totalText = computed(() => {
  return folderList.value?.length
    ? `${folderList.value.length}个${folderItemInfo.value.subtitle}`
    : "";
});
const buildStatisticParams = () => {
  // 根据 activeTab 与 currentLevel 组合映射到六类统计
  // activeTab = 'domain' : domain -> casetype -> customer
  // activeTab = 'customer' : customer -> domain -> casetype
  if (activeTab.value === "domain") {
    if (currentLevel.value === "domain") {
      // 1 统计各领域案件数量
      return {
        statisticId: 1,
        parentTypeId: caseDomainValue.value || undefined,
      };
    }
    if (currentLevel.value === "casetype") {
      // 2 统计某个领域下各类型的案件数量，示例 parentTypeId=3(商标)
      return {
        statisticId: 2,
        parentTypeId: breadcrumbList.value[breadcrumbList.value.length - 1].id,
      };
    }
    if (currentLevel.value === "customer") {
      // 3 统计某个案件类型下各客户的案件数量，示例 caseTypeId=185(商标注册)
      return {
        statisticId: 3,
        parentTypeId: breadcrumbList.value[breadcrumbList.value.length - 2].id,
        caseTypeId: breadcrumbList.value[breadcrumbList.value.length - 1].id,
      };
    }
  } else if (activeTab.value === "customer") {
    if (currentLevel.value === "customer") {
      // 4 统计各个客户的案件数量
      return {
        statisticId: 4,
        parentTypeId: caseDomainValue.value || undefined,
        custFanwei: casebelongValue.value === 1 ? 1 : undefined,
      };
    }
    if (currentLevel.value === "domain") {
      // 5 统计某客户的各领域案件数量，示例 custId=303704(抖音)
      return {
        statisticId: 5,
        custId: breadcrumbList.value[breadcrumbList.value.length - 1].id,
        parentTypeId: caseDomainValue.value || undefined,
      };
    }
    if (currentLevel.value === "casetype") {
      // 6 统计某客户的某领域下的各类型案件数量，示例 custId=303704, parentTypeId=3, pageSize=10
      return {
        statisticId: 6,
        custId: breadcrumbList.value[breadcrumbList.value.length - 2].id,
        parentTypeId: breadcrumbList.value[breadcrumbList.value.length - 1].id,
      };
    }
  }
  // 默认回退
  return { statisticId: 1 };
};
const currentBusy = ref(false);
const currentHasMore = ref(true);
const loadMore = () => {
  if (currentBusy.value || !currentHasMore.value) return;
  currentBusy.value = true;
  fetchFolderList(true).finally(() => {
    currentBusy.value = false;
  });
};
const fetchFolderList = async (isLoadMore = false) => {
  const params = buildStatisticParams();
  const res = await statisticCase({
    ...params,
    pageNo: isLoadMore ? Math.ceil(folderList.value.length / 50) + 1 : 1,
    pageSize: 50,
    caseStatusId: caseStatus.value || undefined,
    caseOfMine: casebelongValue.value === 1 ? 1 : undefined,
    teamCase: casebelongValue.value === 2 ? 1 : undefined,
    searchKey: inputValue.value || undefined,
  });

  const list = res.data || [];
  if (isLoadMore) {
    folderList.value = [
      ...folderList.value,
      ...list.map((item) => ({
        id: item.id,
        title: item.name,
        caseCount: item.value ?? 0,
        categoryCount: item.subCount ?? 0,
        description: item.desp,
        custGradeStr: item.custGradeStr,
        userIcon: item.userIcon,
      })),
    ];
  } else {
    folderList.value = list.map((item) => ({
      id: item.id,
      title: item.name,
      caseCount: item.value ?? 0,
      categoryCount: item.subCount ?? 0,
      description: item.desp,
      custGradeStr: item.custGradeStr,
      userIcon: item.userIcon,
    }));
  }
  currentHasMore.value = list.length === 50;
  currentLevelValue.value = currentLevel.value;
};

const initBreadcrumb = () => {
  const base =
    defaultBreadcrumbByTab[activeTab.value] || defaultBreadcrumbByTab.domain;
  breadcrumbList.value = [{ ...base }];
  if (currentLevel.value === base.value) {
    fetchFolderList();
  } else {
    currentLevel.value = base.value;
  }
};

watch(
  () => activeTab.value,
  () => {
    initBreadcrumb();
  },
  { immediate: true },
);

watch(
  () => currentLevel.value,
  (newValue) => {
    inputValue.value = null;
    showTopSearch.value = false;
    if (newValue !== "caseList") {
      fetchFolderList();
    }
  },
  { immediate: true },
);

//案件领域
const showFirstTypeTabsList = [
  {
    label: "领域",
    value: "domain",
    icon: "bx bx-buildings",
  },
  {
    label: "客户",
    value: "customer",
    icon: "icon iconfont icon-users",
  },
];

const switchTab = (tab) => {
  if (activeTab.value === tab) {
    return;
  }
  activeTab.value = tab;
};

//案件领域
const caseDomainTabsList = [
  {
    label: "商标",
    value: 3,
  },
  {
    label: "专利",
    value: 4,
  },
  {
    label: "诉讼",
    value: 2,
  },
  {
    label: "保护",
    value: 1,
  },
  {
    label: "域名",
    value: 75,
  },
  {
    label: "著作权",
    value: 76,
  },
  {
    label: "非诉",
    value: 86,
  },
  {
    label: "全部",
    value: 0,
  },
];
const changeCaseDoaminValue = (value) => {
  caseDomainValue.value = value;
  if (showType.value === "folder") {
    fetchFolderList();
  }
};

//案件所属
const caseBelongTabsList = [
  {
    label: "我的案件",
    value: 1,
    icon: "bx bx-user",
  },
  {
    label: "团队案件",
    value: 2,
    icon: "icon iconfont icon-users",
  },
  {
    label: "所有案件",
    value: 3,
    icon: "bx bx-folder-open",
  },
];
const changeCasebelongValue = (value) => {
  casebelongValue.value = value;
  if (showType.value === "folder") {
    fetchFolderList();
  }
};

//案件状态
const caseStatusTabsList = [
  {
    label: "进行中",
    value: 1,
  },
  {
    label: "所有状态",
    value: 0,
  },
];
const changeCaseStatusValue = (value) => {
  caseStatus.value = value;
  fetchFolderList();
};

const textSearchRef = ref();
const closeInput = () => {
  showTopSearch.value = false;
  inputValue.value = "";
  fetchFolderList();
};
const showInput = () => {
  showTopSearch.value = true;
  nextTick(() => {
    textSearchRef?.value?.focus();
  });
};
const fuzzySearch = () => {
  custFanwei.value = 0;
  fetchFolderList();
};
const selectedId = ref();
const handleGoBackOne = () => {
  if (breadcrumbList.value.length <= 1) return;
  // 回退一步：去掉最后一个，并回到新的最后一个 level
  breadcrumbList.value = breadcrumbList.value.slice(0, -1);
  const last = breadcrumbList.value[breadcrumbList.value.length - 1];
  if (last) {
    currentLevel.value = last.value;
  }
};

const handleGoHome = () => {
  if (breadcrumbList.value.length <= 1) return;
  // 只保留第一个面包屑
  breadcrumbList.value = breadcrumbList.value.slice(0, 1);
  const first = breadcrumbList.value[0];
  if (first) {
    currentLevel.value = first.value;
  }
};
const handleEnterFolder = (item, payload) => {
  const nextLevel = levelOptions.value[currentLevel.value];
  if (!nextLevel) {
    return;
  }
  if (currentLevel.value === "domain") {
    caseDomain.value = item.id;
  }
  const label = item?.title || payload?.title;
  if (label) {
    breadcrumbList.value.push({
      label,
      value: nextLevel,
      id: item.id,
    });
  }
  if (nextLevel === "caseList") {
    store.commit("case/CHANGE_BREADCRUMB", breadcrumbList.value);
  }
  currentLevel.value = nextLevel;
};

const handleBreadcrumbClick = (item, index) => {
  if (index === breadcrumbList.value.length - 1) {
    return;
  }
  breadcrumbList.value = breadcrumbList.value.slice(0, index + 1);
  if (currentLevel.value === item.value) {
    return;
  }
  currentLevel.value = item.value;
};

// 监听窗口大小变化
const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

// 添加窗口大小变化监听
window.addEventListener("resize", handleResize);

onUnmounted(() => {
  store.commit("case/CHANGE_CASEDOMAIN", 0);
  store.commit("case/CHANGE_CASEBELONGTO", 1);
  store.commit("case/CHANGE_CASESTATUS", 0);
  store.commit("case/CHANGE_BREADCRUMB", []);
  // 移除事件监听
  window.removeEventListener("resize", handleResize);
});
</script>

<style lang="scss" scoped>
.list-content {
  border: 1px solid #e3e8f0;
  padding: 16px;
  height: calc(100vh - 150px);
  border-top: none;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  overflow-y: auto;
  .folder-list {
    gap: 16px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(162px, 1fr));
    width: 100%;
  }
}
.more-customer {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 30px;
  margin-bottom: 120px;
}
.config-top {
  padding: 8px 16px;
  border: 1px solid #e3e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  height: 50px;
  .config-breadcrumb {
    display: flex;
    gap: 6px;
    justify-content: space-between;
    align-items: center;
    .breadcrumb-custom {
      :deep(.el-breadcrumb__inner) {
        height: 24px;
        display: flex;
        align-items: center;
        white-space: nowrap;
      }
      :deep(.breadcrumb-clickable .el-breadcrumb__inner) {
        cursor: pointer;
        color: #62748e;
        border-radius: 4px;
        padding: 2px 6px;
        transition: background-color 0.2s ease;
        &:hover {
          color: #030a24;
          background-color: #e4e7ed;
        }
      }
    }
    .config-breadcrumb-item {
      width: 28px;
      height: 28px;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      &:hover {
        background-color: #e4e7ed;
      }
    }
  }
}
.config-right {
  display: flex;
  align-items: center;
  gap: 8px;
  .more-filters-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    border-radius: 4px;
    background: #f0f2f5;
    color: #62748e;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;

    i {
      font-size: 16px;
    }

    &:hover {
      background: #e4e7ed;
      color: #2d5cf2;
    }
  }
}

.more-filters-content {
  .filter-section {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }

    .filter-title {
      font-weight: 500;
      margin-bottom: 8px;
      color: #2c3e50;
      font-size: 14px;
    }

    .filter-options {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .filter-option {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        background: #f0f2f5;
        color: #62748e;
        transition: all 0.2s ease;

        i {
          font-size: 14px;
        }

        &:hover {
          background: #e4e7ed;
        }

        &.active {
          background: #2d5cf2;
          color: #fff;
        }
      }
    }
  }
}
.tabs-container {
  background: #f0f2f5;
  border-radius: 8px;
  padding: 4px;
  display: flex;
  position: relative;

  .tab-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
    color: #2c3e50;
    position: relative;
    z-index: 1;

    i {
      margin-right: 6px;
      font-size: 14px;
    }

    &.active {
      background: white;
      color: #2c3e50;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);
    }

    &:hover:not(.active) {
      background: rgba(255, 255, 255, 0.5);
      color: #495057;
    }
  }
}
.file-total {
  color: #62748e;
  white-space: nowrap;
}
.text-search {
  .search-icon {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    &:hover {
      background-color: #e4e7ed;
    }
  }
  .text-search-input {
    position: relative;
    .close-input {
      position: absolute;
      top: 3px;
      right: 4px;
      cursor: pointer;
      width: 24px;
      height: 24px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      &:hover {
        background-color: #e4e7ed;
      }
    }
  }
}
.top-search {
  :deep(.el-input__inner) {
    margin-right: 20px;
  }
}
.empty-data {
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 48px 0 24px 0;
  .empty-box {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}
</style>
