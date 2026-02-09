<template>
  <div class="case-container">
    <div class="title-box">
      <div class="content-title">
        关联案件 ({{ relatedCases?.length || 0 }})
      </div>
      <div
        class="d-flex gap-2"
        v-if="editPermissionLevel"
      >
        <div
          style="
            display: flex;
            gap: 4px;
            align-items: center;
            cursor: pointer;
            color: red;
          "
          @click="clearAllCases"
          v-if="relatedCases.length"
        >
          <i
            class="mdi mdi-delete-outline"
            style="font-size: 14px"
          ></i>
          <span style="white-space: nowrap">全部清除</span>
        </div>
        <div
          class="clickable"
          style="display: flex; gap: 4px; align-items: center"
          v-show="!isExtendAddCases"
          @click="isExtendAddCases = true"
        >
          <i
            class="bx bx-plus"
            style="font-size: 14px"
          ></i>
          <span style="white-space: nowrap">添加案件</span>
        </div>
        <div
          class="clickable"
          style="display: flex; gap: 4px; align-items: center"
          v-show="isExtendAddCases"
          @click="isExtendAddCases = false"
        >
          <i
            class="bx bx-plus"
            style="font-size: 14px"
          ></i>
          <span style="white-space: nowrap">收起</span>
        </div>
      </div>
    </div>

    <!-- 已选案件显示区域 -->
    <div
      class="selected-cases-section"
      v-if="relatedCases.length"
    >
      <div class="selected-cases-list">
        <div
          v-for="item in relatedCases"
          :key="item.caseId"
          class="selected-case-item"
        >
          <div class="case-info">
            <div class="case-info-main">
              <span class="case-agent">{{
                item.agentNum || "未设置文号"
              }}</span>
            </div>
            <div class="case-info-extra">
              <span class="case-name">{{ item.appName }}</span>
            </div>
          </div>
          <div class="case-actions">
            <i
              class="mdi mdi-eye case-view-icon"
              @click="handlePreviewCase(item)"
            ></i>
            <i
              class="mdi mdi-close-circle remove-case-icon"
              @click="removeCases(item.caseId)"
              v-if="editPermissionLevel"
            ></i>
          </div>
        </div>
      </div>
    </div>

    <div
      class="related-case-section"
      v-if="isExtendAddCases"
    >
      <div class="related-case-search">
        <el-input
          v-model="caseSearchKeyword"
          placeholder="搜索案件编号、申请人、客户名称..."
          clearable
          @keyup.enter="handleCaseSearch"
        >
          <template #prefix>
            <i class="bx bx-search related-case-search-icon"></i>
          </template>
          <template #append>
            <el-button
              type="primary"
              :loading="caseListLoading"
              @click="handleCaseSearch"
            >
              搜索
            </el-button>
          </template>
        </el-input>
      </div>
      <div class="related-case-header">
        <el-checkbox
          v-model="selectAllCases"
          :indeterminate="isIndeterminate"
          @change="handleSelectAllCases"
          style="margin-bottom: 0"
        >
          全选<span v-if="selectedCaseIds?.length"
            >（已选{{ selectedCaseIds?.length }}个）</span
          >
        </el-checkbox>
        <el-button
          type="primary"
          v-if="selectedCaseIds?.length"
          @click="handleBatchAdd"
        >
          添加（{{ selectedCaseIds?.length }}）
        </el-button>
      </div>
      <div class="related-case-body">
        <el-skeleton
          :rows="3"
          animated
          v-if="caseListLoading"
        />
        <el-empty
          v-else-if="!caseList.length"
          description="暂无符合条件的案件"
        />
        <div
          v-else
          class="related-case-list"
          v-infinite-scroll="loadMoreCases"
          :infinite-scroll-disabled="
            loadingMore || caseListLoading || !hasMoreCases
          "
          :infinite-scroll-distance="20"
        >
          <div
            v-for="item in caseList"
            :key="item.caseId"
            class="related-case-item"
            :class="{
              selected: selectedCaseIds.includes(item.caseId),
              disabled: isCaseAdded(item.caseId),
            }"
          >
            <div class="case-item-left">
              <el-checkbox
                v-if="!isCaseAdded(item.caseId)"
                :model-value="selectedCaseIds.includes(item.caseId)"
                :disabled="isCaseAdded(item.caseId)"
                style="margin-bottom: 0"
                @update:model-value="(val) => toggleCaseSelection(val, item)"
              />
              <div class="case-info">
                <div class="case-info-main">
                  <span class="case-agent">{{
                    item.agentNum || "未设置文号"
                  }}</span>
                </div>
                <div class="case-info-extra">
                  <span class="case-name">{{
                    item.appName || ""
                  }}</span>
                </div>
              </div>
            </div>
            <div class="case-item-right">
              <el-tooltip
                content="查看案件"
                placement="top"
              >
                <i
                  class="mdi mdi-eye-outline case-view-icon"
                  @click="handlePreviewCase(item)"
                ></i>
              </el-tooltip>
              <span
                v-if="isCaseAdded(item.caseId)"
                class="added-tag"
                >已添加</span
              >
            </div>
          </div>
          <div class="list-status">
            <div
              v-if="loadingMore"
              class="loading-inline"
            >
              <span class="spinner"></span>
              <span class="status-text">加载中...</span>
            </div>
            <div
              v-else-if="!hasMoreCases"
              class="status-text"
            >
              没有更多案件了
            </div>
          </div>
        </div>
      </div>
    </div>
    <CaseSidebar
      v-if="isCaseDetail"
      :showSidebar="isCaseDetail"
      @update:showSidebar="handleSidebarUpdate"
      :caseId="caseInfo.caseId"
      :taskType="caseInfo.taskType"
    />
  </div>
</template>
<script setup>
import {
  ref,
  computed,
  watch,
  onMounted,
  defineExpose,
  defineProps,
} from "vue";
import { ElInfiniteScroll } from "element-plus";
import { getAllCaseInfo } from "@/api/caseList";
import { addRelatedCase, removeRelatedCase } from "@/api/project";
import CaseSidebar from "@/components/sidebar/case-sidebar";
import { ElMessageBox } from "element-plus";

const props = defineProps({
  defaultRelatedCases: {
    type: Array,
    default: () => [],
  },
  objId: {
    type: Number,
    required: true,
  },
  objType: {
    type: Number,
    required: true,
  },
  editPermissionLevel: {
    type: Number,
    default: 1,
  },
});
const vInfiniteScroll = ElInfiniteScroll;

// 存储已选中的案件
const relatedCases = ref([]);
const isExtendAddCases = ref(false);
const caseSearchKeyword = ref("");
const caseList = ref([]);
const caseListLoading = ref(false);
const loadingMore = ref(false);
const hasMoreCases = ref(true);
const selectedCaseIds = ref([]);
const selectedCaseDetails = ref([]);
const selectAllCases = ref(false);
const isCaseDetail = ref(false);
const caseInfo = ref({});
const pagination = ref({
  pageNo: 1,
  pageSize: 20,
});
const handleSidebarUpdate = (value) => {
  isCaseDetail.value = value;
};
const selectedCountInCurrentList = computed(
  () =>
    caseList.value.filter((item) => selectedCaseIds.value.includes(item.caseId))
      .length
);
const isIndeterminate = computed(() => {
  const selectedCount = selectedCountInCurrentList.value;
  return selectedCount > 0 && selectedCount < caseList.value.length;
});

// 检查案件是否已添加到relatedCases
const isCaseAdded = (caseId) => {
  return relatedCases.value.some((item) => item.caseId === caseId);
};

// 监听 props.defaultRelatedCases 的变化，当接口返回数据时同步更新
watch(
  () => props.defaultRelatedCases,
  (newValue) => {
    if (newValue && newValue.length > 0) {
      console.log(newValue, "newValue");

      relatedCases.value = [...newValue];
    }
  },
  { deep: true, immediate: true }
);

watch(
  () => caseList.value,
  () => {
    if (!caseList.value.length) {
      selectAllCases.value = false;
      return;
    }
    const selectedCount = selectedCountInCurrentList.value;
    selectAllCases.value =
      selectedCount > 0 && selectedCount === caseList.value.length;
  },
  { deep: true }
);
const toggleCaseSelection = (checked, caseItem) => {
  if (checked) {
    if (!selectedCaseIds.value.includes(caseItem.caseId)) {
      selectedCaseIds.value.push(caseItem.caseId);
      selectedCaseDetails.value.push(caseItem);
    }
  } else {
    const idIndex = selectedCaseIds.value.indexOf(caseItem.caseId);
    if (idIndex > -1) {
      selectedCaseIds.value.splice(idIndex, 1);
    }
    const detailIndex = selectedCaseDetails.value.findIndex(
      (item) => item.caseId === caseItem.caseId
    );
    if (detailIndex > -1) {
      selectedCaseDetails.value.splice(detailIndex, 1);
    }
  }
};

const handleSelectAllCases = (checked) => {
  if (checked) {
    caseList.value.forEach((item) => toggleCaseSelection(true, item));
  } else {
    caseList.value.forEach((item) => toggleCaseSelection(false, item));
  }
};

const fetchCaseList = async (isLoadMore = false) => {
  if (isLoadMore) {
    loadingMore.value = true;
  } else {
    caseListLoading.value = true;
    hasMoreCases.value = true;
    if (pagination.value.pageNo === 1) {
      caseList.value = [];
    }
  }
  try {
    const params = {
      pageNo: pagination.value.pageNo,
      pageSize: pagination.value.pageSize,
    };
    if (caseSearchKeyword.value.trim()) {
      params.keyWord = caseSearchKeyword.value.trim();
    }
    const res = await getAllCaseInfo(params);
    const list = res.data || [];
    if (isLoadMore) {
      caseList.value = [...caseList.value, ...list];
    } else {
      caseList.value = list;
    }
    if (list.length < pagination.value.pageSize) {
      hasMoreCases.value = false;
    }
  } finally {
    if (isLoadMore) {
      loadingMore.value = false;
    } else {
      caseListLoading.value = false;
    }
  }
};

const handleCaseSearch = (value) => {
  if (value === caseSearchKeyword.value) return;
  pagination.value.pageNo = 1;
  hasMoreCases.value = true;
  fetchCaseList();
};

const handlePreviewCase = (caseItem) => {
  // if (!caseItem.caseId) return;
  // const targetUrl = `/#/case/case-folders?caseId=${caseItem.caseId}`;
  // window.open(targetUrl, "_blank");
  caseInfo.value = caseItem;
  isCaseDetail.value = true;
};

const loadMoreCases = () => {
  if (loadingMore.value || caseListLoading.value || !hasMoreCases.value) return;
  pagination.value.pageNo += 1;
  fetchCaseList(true);
};

// 批量添加案件到已选列表
const handleBatchAdd = () => {
  // 获取所有选中的案件详情
  const newCases = selectedCaseDetails.value.filter(
    (item) =>
      !relatedCases.value.some((existing) => existing.caseId === item.caseId)
  );

  // 将新选中的案件添加到relatedCases
  relatedCases.value = [...relatedCases.value, ...newCases];

  // 清空选中状态
  selectedCaseIds.value = [];
  selectedCaseDetails.value = [];
  selectAllCases.value = false;
  console.log(newCases, "newCases");
  if (!props.objId) return;
  const params = {
    objId: props.objId,
    objType: props.objType,
    caseList: newCases.map((item) => ({
      caseId: item.caseId,
      appName: item.appName,
      agentNum: item.agentNum,
      taskType: item.taskType,
    })),
  };
  addRelatedCase(params).then((res) => {
    console.log(res, "res");
  });
};

// 从已选列表中移除案件
const removeCases = async (caseId) => {
  const params = {
    objId: props.objId,
    objType: props.objType,
    caseIdList: caseId,
  };
  const res = await removeRelatedCase(params);
  if (res.success) {
    relatedCases.value = relatedCases.value.filter(
      (item) => item.caseId !== caseId
    );
  }
};

// 清除所有已选案件
const clearAllCases = async () => {
  ElMessageBox.confirm("确定全部清除吗？", "提示", {
    type: "warning",
    confirmButtonText: "删除",
    cancelButtonText: "取消",
  }).then(async () => {
    const params = {
      objId: props.objId,
      objType: props.objType,
      caseIdList: relatedCases.value.map((item) => item.caseId),
    };
    const res = await removeRelatedCase(params);
    if (res.success) {
      relatedCases.value = [];
    }
  });
};
const getRelatedCases = () => {
  console.log(relatedCases.value, "relatedCases.value");
  return relatedCases.value || [];
};
// const fetchRelatedCases = async () => {
//   const params = {
//     taskId: props.objId,
//     objType: props.objType,
//   };
//   const res = await queryRelatedCases(params);
//   relatedCases.value = res.data || [];
// }
defineExpose({
  getRelatedCases,
});

onMounted(() => {
  fetchCaseList();
});
</script>
<style lang="scss" scoped>
.case-container {
  margin-bottom: 16px;
  .title-box {
    display: flex;
    justify-content: space-between;
    .content-title {
      font-weight: bold;
      font-size: 14px;
    }
  }
}
.related-case-section {
  margin-top: 12px;
  border: 1px solid #e0e6f5;
  border-radius: 8px;
  padding: 16px;
  background: #f9fbff;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.related-case-search {
  width: 100%;
}
.related-case-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  font-size: 14px;
  color: #2d2f33;
}
.related-case-header .header-title {
  font-size: 16px;
}
.related-case-body {
  min-height: 160px;
  border: 1px dashed #d3daf0;
  border-radius: 8px;
  padding: 12px;
  background: #fff;
}
.related-case-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 240px;
  overflow-y: auto;
}
.related-case-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border: 1px solid transparent;
  border-radius: 8px;
  transition: all 0.2s;
}
.relatedsed-case-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border: 1px solid transparent;
  border-radius: 8px;
  transition: all 0.2s;
  border-color: #d9e4ff;
  background: #f5f8ff;
}
.related-case-item:hover {
  border-color: #d9e4ff;
  background: #f5f8ff;
}
.related-case-item.selected {
  border-color: #556ee6;
  background: #eef2ff;
}
.list-status {
  text-align: center;
  padding: 8px 0 0;
}
.loading-inline {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
}
.status-text {
  font-size: 12px;
  color: #8c8c8c;
}
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #d0d7ff;
  border-top-color: #556ee6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.case-item-left {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  flex: 1;
}
.case-info {
  display: flex;
  flex-direction: column;
  font-size: 12px;
}
.case-info-main {
  display: flex;
  gap: 8px;
  font-weight: 600;
  color: #2d2f33;
}
// .case-agent {
//   color: #556ee6;
// }
.case-info-extra {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #848b9c;
}
.case-item-right {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #848b9c;
}
.case-view-icon {
  font-size: 18px;
  cursor: pointer;
  color: #909399;
  opacity: 0;
  transition: opacity 0.2s;
}
.related-case-item:hover .case-view-icon {
  opacity: 1;
}
.case-view-icon:hover {
  color: #556ee6;
}
.related-case-search-icon {
  color: #c0c4cc;
}
.selected-cases-section {
  margin-top: 12px;
  // border: 1px solid #e0e6f5;
  // border-radius: 8px;
  // padding: 16px;
  // background: #f9fbff;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.section-title {
  font-weight: bold;
  font-size: 14px;
}
.clear-all-btn {
  color: #f56c6c;
  padding: 0;
}
.clear-all-btn:hover {
  color: #f78989;
}
.selected-cases-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.selected-case-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border: 1px solid #e0e6f5;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
}
.case-actions {
  display: flex;
  gap: 8px;
}
.case-view-icon {
  font-size: 18px;
  cursor: pointer;
  color: #909399;
  opacity: 0;
  transition: opacity 0.2s;
}
.selected-case-item:hover .case-view-icon {
  opacity: 1;
}
.case-view-icon:hover {
  color: #556ee6;
}
.remove-case-icon {
  font-size: 18px;
  cursor: pointer;
  color: #909399;
  opacity: 0;
  transition: opacity 0.2s;
}
.selected-case-item:hover .remove-case-icon {
  opacity: 1;
}
.remove-case-icon:hover {
  color: #f56c6c;
}
.related-case-item.disabled {
  opacity: 0.7;
  background-color: #f5f7fa;
}
.related-case-item.disabled:hover {
  border-color: transparent;
  background-color: #f5f7fa;
}
.added-tag {
  display: inline-block;
  padding: 2px 6px;
  font-size: 12px;
  color: #848b9c;
  background-color: #ecf5ff;
  border-radius: 4px;
}
.case-view-icon.disabled {
  color: #c0c4cc !important;
  cursor: not-allowed;
}
</style>
