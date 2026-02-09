<script>
import CaseSidebar from "../sidebar/case-sidebar";
import LoadingOverlay from "../loading-overlay.vue";
import { getAllCaseInfo } from "@/api/caseList.js";

export default {
  components: {
    CaseSidebar,
    LoadingOverlay,
  },
  props: {
    containerHegiht: {
      type: Number,
    },
    cardDesc: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      isCaseDetail: false,
      tabList: [
        { value: 100, label: "最近访问" },
        { value: 102, label: "进行中" },
        { value: 101, label: "即将开始" },
        { value: 103, label: "最近结案" },
      ],
      selectedTab: 100,
      caseDataList: [],
      busy: false, // 控制加载状态，防止重复触发
      pageNo: 1,
      searchText: "",
      caseId: "",
      taskType: "",
      loading: false,
      scrollTop: 0,
      tabsHeight: 36,
      mouseInner: false,
    };
  },
  computed: {
    contentHeight() {
      return this.containerHegiht - this.tabsHeight - 114;
    },
  },
  methods: {
    changeTab(value) {
      this.searchText = "";
      this.pageNo = 1;
      this.selectedTab = value;
      (this.busy = false), (this.caseDataList = []);
      this.fetchCaseList();
      // 将表格容器滚动条置顶
      if (this.$refs.tableContainer) {
        this.$refs.tableContainer.scrollTop = 0;
      }
    },
    loadMoreData() {
      if (this.busy || this.loading) return;
      this.loading = true;
      this.busy = true;
      this.pageNo++;
      const data = {
        pageNo: this.pageNo,
        pageSize: 10,
        keyWord: this.searchText,
        caseStatusId: this.selectedTab,
      };
      getAllCaseInfo(data, { isLoading: false })
        .then((res) => {
          this.caseDataList = this.caseDataList.concat(res.data);
          this.loading = false;
          console.log(this.caseDataList.length, "this.caseDataList.length");
          console.log(res.total, "res.total");
          console.log(this.caseDataList.length >= res.total);
          this.busy =
            this.caseDataList.length >= res.total || res.data.length === 0;
        })
        .catch(() => {
          this.loading = false;
          this.busy = false;
        });
    },
    searchCase() {
      console.log(this.searchText, "searchText");
    },
    toggleSidebar(caseId, taskType) {
      this.caseId = caseId;
      this.taskType = taskType;
      this.isCaseDetail = true;
    },
    handleSidebarUpdate(value) {
      this.isCaseDetail = value;
    },
    fetchCaseList() {
      const data = {
        pageNo: 1,
        pageSize: 10,
        keyWord: this.searchText,
        caseStatusId: this.selectedTab,
      };
      this.loading = true;
      // 获取案件列表
      getAllCaseInfo(data, { isLoading: false })
        .then((res) => {
          this.caseDataList = res.data;
          this.loading = false;
        })
        .catch((err) => {
          console.log(err, "err");
        });
    },
    handleScroll() {
      this.scrollTop = this.$refs.tableContainer.scrollTop;
    },
    updateTableHeight() {
      // 获取tabs实际高度并设置CSS变量
      setTimeout(() => {
        const tabsElement = document.querySelector(".tabs-wrapper");
        if (tabsElement) {
          const tabsHeight = tabsElement.offsetHeight;
          this.tabsHeight = tabsHeight;
        }
      }, 0);
    },
    handleMouseLeave(event) {
      if (event.relatedTarget && event.relatedTarget.classList) {
        const contentClass = [
          "el-popover--plain",
          "el-popover",
          "is-light",
          "el-popper",
          "el-popper__arrow"
        ];
        let isLeave = true;
        contentClass.forEach((item) => {
          if (event.relatedTarget.classList.contains(item)) {
            return (isLeave = false);
          }
        });
        if (event.relatedTarget.classList.length == 0) {
          isLeave = false;
        }
        if (isLeave) {
          this.$nextTick(() => {
            if (this.$refs.descPopoverRef) {
              this.$refs.descPopoverRef.hide();
            }
            setTimeout(() => {
              this.mouseInner = false;
            }, 100);
          });
        }
      } else {
        this.mouseInner = false;
      }
    },
  },
  mounted() {
    this.fetchCaseList();
    this.$refs.tableContainer.addEventListener("scroll", this.handleScroll);
    this.updateTableHeight();
    window.addEventListener("resize", this.updateTableHeight);
  },
  beforeUnmount() {
    this.$refs.tableContainer.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("resize", this.updateTableHeight);
  },
};
</script>
<template>
  <CaseSidebar
    v-if="isCaseDetail"
    :showSidebar="isCaseDetail"
    @update:showSidebar="handleSidebarUpdate"
    :caseId="caseId"
    :taskType="taskType"
  />
  <div 
    class="card"
    @mouseenter="mouseInner = true"
    @mouseleave="handleMouseLeave"
  >
    <div
      class="card-body"
      style="width: 100%"
    >
      <div
        class="d-sm-flex"
        style="display: flex; justify-content: space-between"
      >
        <div class="mb-4 d-flex align-items-center gap-1">
          <h4 class="card-title mb-0">
            <span>案件</span>
            <el-popover
              placement="bottom-start"
              title="案件"
              :width="350"
              trigger="hover"
              :content="cardDesc"
              ref="descPopoverRef"
            >
              <template #reference>
                <i v-show="cardDesc&&mouseInner" class="bx bx-help-circle" style="font-size: 16px;cursor: pointer;margin-left: 4px;"></i>
              </template>
            </el-popover>
          </h4>
        </div>
        <li class="list-inline-item d-none d-sm-inline-block">
          <b-dropdown
            right
            menu-class="dropdown-menu-lg dropdown-menu-end py-0"
            variant="white"
            toggle-class="p-0 nav-btn"
          >
            <template v-slot:button-content>
              <i class="bx bx-search-alt-2"></i>
            </template>
            <div class="p-3">
              <div class="form-group m-0">
                <div class="input-group">
                  <input
                    type="text"
                    class="form-control"
                    placeholder="支持按案件类型、客户、负责人等筛选"
                    v-model="searchText"
                  />
                  <div class="input-group-append">
                    <button
                      class="btn btn-primary"
                      @click="fetchCaseList"
                    >
                      <i class="mdi mdi-magnify"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </b-dropdown>
        </li>
      </div>
      <div class="tabs-wrapper">
        <b-tabs
          pills
          nav-class="bg-light rounded"
          content-class="mt-3"
        >
          <b-tab
            :title="item.label"
            v-model="selectedTab"
            v-for="item of tabList"
            :key="item.value"
            @click.stop="changeTab(item.value)"
            title-link-class="small-tabItem"
          >
          </b-tab>
        </b-tabs>
      </div>
      <div
        class="table-responsive"
        style="overflow-y: auto; overflow-x: hidden; position: relative"
        :style="{ height: `${contentHeight}px` }"
        ref="tableContainer"
      >
        <LoadingOverlay
          :loading="loading"
          :scrollTop="scrollTop"
        />
        <table
          class="table table-nowrap align-mid table-hover mb-0"
          v-infinite-scroll="loadMoreData"
          infinite-scroll-disabled="busy"
          infinite-scroll-distance="2"
          :infinite-scroll-immediate="false"
          style="width: 100%; table-layout: fixed"
        >
          <colgroup>
            <col style="width: 80%" />
            <col style="width: 25%" />
          </colgroup>
          <tbody>
            <tr
              v-for="caseItem of caseDataList"
              :key="caseItem.caseId"
              v-on:click="toggleSidebar(caseItem.caseId, caseItem.taskType)"
              style="cursor: pointer"
            >
              <td style="overflow: hidden; text-overflow: ellipsis">
                <div
                  style="
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                  "
                  :title="`${
                    caseItem.caseName ? caseItem.caseName + ' -' : ''
                  } ${caseItem.agentNum}`"
                >
                  {{ caseItem.caseName ? caseItem.caseName + " -" : "" }}
                  {{ caseItem.agentNum }}
                </div>
                <p
                  class="text-muted mb-0"
                  style="
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                  "
                >
                  {{
                    [
                      caseItem.caseTypeStr,
                      caseItem.appFromto,
                      caseItem.custName,
                    ]
                      .filter((item) => item)
                      .join("，")
                  }}
                </p>
              </td>
              <td>
                <div>
                  <ul class="list-inline mb-0 font-size-16">
                    <li class="list-inline-item">
                      <span
                        class="badge"
                        style="background-color: #556ee6"
                        >{{ caseItem.stageName }}</span
                      >
                    </li>
                  </ul>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div
          v-if="!caseDataList.length"
          class="d-flex justify-content-center align-items-center h-100 w-100"
          style="color: #909399"
        >
          暂无数据
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.event-list {
  padding: 0px 0px 38px 30px;
}

.table-responsive {
  overflow-x: hidden;
  position: relative; // 确保 LoadingOverlay 能够正确定位
}

.card {
  position: relative;
}
.card-title {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
<style>
.small-tabItem {
  padding: 8px !important;
}
</style>
