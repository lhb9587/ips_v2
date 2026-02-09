<script>
import { queryReleaseList } from "@/api/releases";
import { queryReleaseById } from "@/api/releases";
import VueEasyLightbox from "vue-easy-lightbox";
import ReleasesInfo from "@/views/releaseslist/components/releases-info.vue";

export default {
  components: { ReleasesInfo, VueEasyLightbox },
  props: {
    showSidebar: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  data() {
    return {
      show: false,
      dataList: [],
      total: 0,
      infoModalState: false,
      releaseInfo: {},
      laoding: false,
      busy: false,
      pageNo: 1,
      visible: false,
      imgs: [],
      index: 0,
      searchInput: undefined
    };
  },
  methods: {
    fuzzySearch(){
      this.pageNo = 1
      this.fetchDataList()
    },
    handleHide() {
      this.visible = false;
    },
    showImage(url) {
      this.imgs = [`/ipdoc${url}`];
      this.visible = true;
    },
    handleHidden() {
      this.$emit("update:showSidebar", false);
    },
    fetchDataList() {
      this.laoding = true;
      queryReleaseList(
        { pageNo: this.pageNo, pageSize: 10, displayStatus: 1,keyword:this.searchInput },
        { isLoading: false }
      ).then((res) => {
        if (res.success) {
          this.laoding = false;
          this.dataList = res.data || [];
          this.total = res.total || 0;
        }
      });
    },
    loadMoreData() {
      if (this.busy) {
        return;
      }
      this.busy = true;
      this.laoding = true;
      this.pageNo++;
      const params = {
        pageNo: this.pageNo,
        pageSize: 10,
        displayStatus: 1,
        keyword:this.searchInput
      };
      queryReleaseList(params, { isLoading: false }).then((res) => {
        if (res.success) {
          this.dataList = this.dataList.concat(res.data) || [];
          this.laoding = false;
          if (this.dataList.length == res.total) {
            this.busy = true;
          } else {
            this.busy = false;
          }
        }
      });
    },
    viewMore(id) {
      queryReleaseById({ releaseId: id }).then((res) => {
        if (res.success) {
          this.releaseInfo = res.data || {};
          this.infoModalState = true;
        }
      });
    },
    hiddenInfoModal() {
      this.infoModalState = false;
    },
  },
  created() {
    this.show = this.showSidebar;
    this.fetchDataList();
  },
};
</script>
<template>
  <el-drawer
    v-model="show"
    @close="handleHidden"
    title="发布列表"
    direction="rtl"
    size="360px"
    class="release-drawer"
  >
    <el-input
      v-model="searchInput"
      placeholder="搜索..."
      clearable
      @keyup.enter="fuzzySearch"
      class="top-search"
      style="margin-bottom: 20px;"
    >
      <template #prepend>
        <el-button @click="fuzzySearch">
          <i class="bx bx-search-alt"></i>
        </el-button>
      </template>
    </el-input>
    <div
      v-loading="laoding"
      class="release-drawer-content"
      v-infinite-scroll="loadMoreData"
      infinite-scroll-disabled="busy"
      infinite-scroll-distance="2"
      :infinite-scroll-immediate="false"
      v-if="dataList.length"
    >
      <div
        v-for="item in dataList"
        :key="item.releaseId"
        style="font-size: 14px"
      >
        <div style="font-size: 18px; height: 27px">
          <el-tooltip
            :content="item.title"
            placement="top"
          >
            <div class="re-title">
              <span v-if="item.version"> v{{ item.version }}: </span>
              {{ item.title }}
            </div></el-tooltip
          >
        </div>
        <div style="color: #aaa; margin-bottom: 18px">
          {{ item.releaseDate }}
        </div>
        <div
          v-if="item.coverImagePath"
          style="margin-bottom: 20px"
        >
          <img
            :src="`/ipdoc${item.coverImagePath}`"
            style="width: 320px; height: 160px; cursor: zoom-in"
            @click="showImage(item.coverImagePath)"
          />
        </div>
        <div v-if="item.summary">
          <div style="margin-bottom: 8px; font-size: 14px">主要更新内容：</div>
          <div>
            <ol>
              <li
                v-for="(content, index) in item.summary.split('\n')"
                :key="index"
              >
                {{ content }}
              </li>
            </ol>
          </div>
        </div>
        <div
          style="margin-top: 12px"
          v-if="item.content"
        >
          <div
            class="clickable"
            style="display: flex; align-items: center"
            @click="viewMore(item.releaseId)"
          >
            <span>查看更多</span><i class="bx bx-right-arrow-alt"></i>
          </div>
        </div>
        <hr style="margin: 25px 0; border-bottom: 1px solid #eee" />
      </div>
    </div>
    <el-empty description="暂无数据" v-if="!dataList.length"/>
  </el-drawer>
  <b-modal
    v-model="infoModalState"
    @hidden="hiddenInfoModal"
    centered
    hide-footer
    size="lg"
    hide-backdrop
    :lazy="true"
    style="z-index: 3000"
    body-class="view-form"
    ><ReleasesInfo :releaseInfo="releaseInfo"
  /></b-modal>
  <VueEasyLightbox
    :visible="visible"
    :imgs="imgs"
    :index="index"
    @hide="handleHide"
  ></VueEasyLightbox>
</template>
<style>
.release-drawer .el-drawer__header {
  margin-bottom: 0;
  border-bottom: 1px solid #eee;
  height: 48px;
  padding: 0 20px;
  color: #495057;
}
.re-title {
  max-width: 300px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  display: inline-block;
}
.release-drawer-content {
  height: calc(100vh - 48px);
}
.view-form {
  padding: 0 !important;
}
</style>
