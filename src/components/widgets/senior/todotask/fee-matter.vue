<template>
  <div
    class="card h-100 w-100"
    @mouseenter="mouseInner = true"
    @mouseleave="handleMouseLeave"
  >
    <LoadingOverlay :loading="loading" />
    <div class="card-body h-100 w-100">
      <div class="float-end ml-2">
        <span class="badge rounded-pill font-size-12 badge-soft-primary">{{
          total
        }}</span>
      </div>
      <span class="drag-column-header">
        <h4 class="card-title todo-header">
          <span>费用待办</span>
          <el-popover
            placement="bottom-start"
            :title="chartTitle"
            :width="350"
            trigger="hover"
            :content="cardDesc"
            ref="descPopoverRef"
          >
            <template #reference>
              <i
                v-show="cardDesc && mouseInner"
                class="bx bx-help-circle"
                style="font-size: 16px; cursor: pointer"
              ></i>
            </template>
          </el-popover>
        </h4>
      </span>
      <el-divider style="margin: 15px 0" />
      <div
        v-if="dataList.length > 0"
        :style="{ height: contentHeight + 'px', overflow: 'auto' }"
        v-infinite-scroll="loadMore"
        :infinite-scroll-disabled="busy"
        :infinite-scroll-distance="2"
        :infinite-scroll-immediate="false"
      >
        <div
          v-for="(task, index) in dataList"
          :key="index"
          class="card task-box"
          style="margin-bottom: 10px; cursor: pointer"
          @click="handleClick(task)"
        >
          <div class="card-body task-content">
            <div
              style="margin-bottom: 8px; width: 100%"
              class="text-ellipsis text-dark font-size-15"
              :title="uniqueFeeNames(task.feeName)"
            >
              {{ uniqueFeeNames(task.feeName) }}
            </div>
            <div class="float-end ml-2">
              <div class="text-end">
                <div
                  class="font-size-14"
                  style="font-weight: 400; line-height: 32px"
                >
                  ￥{{ task.total }}
                </div>
              </div>
            </div>
            <!-- <div class="text-muted">
              {{ dayjs(task.belongtoDate).format("YYYY-MM-DD") }}
            </div> -->
            <div class="d-flex">
              <div
                class="align-self-center me-1"
                v-if="
                  task.reimburseUserIcon &&
                  !avatarLoadErrorList.includes(task.reimburseUserIcon)
                "
              >
                <img
                  :src="`/ipdoc${task.reimburseUserIcon}`"
                  class="rounded-circle avatar-xs"
                  @error="handleAvatarError(task.reimburseUserIcon)"
                />
              </div>
              <div
                class="avatar-xs align-self-center me-1"
                v-else
              >
                <span
                  class="avatar-title rounded-circle bg-soft bg-primary text-primary"
                  >{{ task.reimburseUserIdStr?.charAt(0) }}</span
                >
              </div>
              <div style="display: flex; align-items: center">
                {{ task.reimburseUserIdStr }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <el-empty
        v-else
        description="暂无数据"
        :image-size="90"
      />
    </div>
  </div>
  <feeHandleModal
    v-model="showModal"
    :dataDetail="dataDetail"
    @refresh="fetchData"
  />
</template>

<script>
// import { upcomingTasks, progressTasks, completedTasks, billTasks } from "./data-kanaban";
import { queryFeeTask,queryFeeInfo } from "@/api/feeList";
import dayjs from "dayjs";
import LoadingOverlay from "@/components/common/loading";
import feeHandleModal from "./components/fee-handle-modal.vue";

export default {
  components: { LoadingOverlay, feeHandleModal },
  props: {
    containerHegiht: {
      type: Number,
    },
    cardDesc: {
      type: String,
    },
  },
  data() {
    return {
      dataList: [],
      busy: false,
      total: 0,
      pageNo: 1,
      loading: false,
      showModal: false,
      dataDetail: {},
      avatarLoadErrorList: [],
      mouseInner: false,
    };
  },
  methods: {
    dayjs,
    handleAvatarError(reimburseUserIcon) {
      this.avatarLoadErrorList = [
        ...this.avatarLoadErrorList,
        reimburseUserIcon,
      ];
    },
    uniqueFeeNames(string) {
      if (!string) {
        return "";
      }
      const feeNames = string.split(";"); // 分割字符串
      const uniqueNames = [...new Set(feeNames)]; // 使用 Set 去重
      return uniqueNames.join("; "); // 重新拼接为字符串
    },
    loadMore() {
      this.loading = true;
      this.busy = true;
      this.pageNo++;
      const params = {
        pageNo: this.pageNo,
        pageSize: 10,
      };
      queryFeeTask(params).then((res) => {
        this.dataList = this.dataList.concat(res.data) || [];
        this.loading = false;
        if (this.dataList.length == res.total) {
          this.busy = true;
        } else {
          this.busy = false;
        }
      });
    },
    handleClick(task) {
      const { feeId } = task;
      this.showModal = true;
      queryFeeInfo({ feeId }).then((res) => {
        this.dataDetail = res.data;
      });
    },
    fetchData() {
      this.loading = true;
      const params = {
        pageSize: 10,
        pageNo: 1,
      };
      queryFeeTask(params).then((res) => {
        this.dataList = res.data || [];
        this.total = res.total;
        this.loading = false;
        if (this.dataList.length == res.total) {
          this.busy = true;
        } else {
          this.busy = false;
        }
      });
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
      }else{
        this.mouseInner = false;
      }
    },
  },
  computed: {
    contentHeight() {
      return this.containerHegiht - 86;
    },
  },
  created() {
    this.fetchData();
  },
};
</script>
<style scoped>
.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.todo-header {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
