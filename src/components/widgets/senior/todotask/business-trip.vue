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
          <span>出差待办</span>
          <el-popover
            placement="bottom-start"
            title="出差待办"
            :width="350"
            trigger="hover"
            :content="cardDesc"
            ref="descPopoverRef"
          >
            <template #reference>
              <i
                v-show="cardDesc && mouseInner"
                class="bx bx-help-circle"
                style="font-size: 16px; cursor: pointer; margin-left: 4px"
              ></i>
            </template>
          </el-popover>
        </h4>
      </span>
      <el-divider style="margin: 15px 0" />
      <div
        :style="{ height: contentHeight + 'px', overflow: 'auto' }"
        v-infinite-scroll="loadMore"
        :infinite-scroll-disabled="busy"
        :infinite-scroll-distance="2"
        :infinite-scroll-immediate="false"
        v-if="dataList.length > 0"
      >
        <div
          v-for="(task, index) in dataList"
          :key="index"
          class="card task-box"
          style="margin-bottom: 10px; cursor: pointer"
          @click="handleClick(task)"
        >
          <div class="card-body task-content">
            <!-- <div>
              <h5 class="font-size-15">
                <a
                  href="javascript: void(0);"
                  class="text-dark"
                >
                  <span v-if="task.tripType == 2164">{{ task.tripReason }}</span
                  ><span v-if="task.tripType == 2162"
                    >{{ task.tripTypeStr }} -{{ task.meetingName }}</span
                  ><span v-if="task.tripType == 2163"
                    >{{ task.tripTypeStr }} -{{ task.custIdStr }}</span
                  ></a
                >
              </h5>
            </div> -->
            <div
              style="margin-bottom: 8px; width: 100%"
              class="text-ellipsis text-dark font-size-15"
            >
              <span v-if="task.tripType == 2164">{{ task.tripReason }}</span
              ><span v-if="task.tripType == 2162"
                >{{ task.tripTypeStr }} -{{ task.meetingName }}</span
              ><span v-if="task.tripType == 2163"
                >{{ task.tripTypeStr }} -{{ task.custIdStr }}</span
              >
            </div>
            <div class="float-end ml-2">
              <div class="text-end">
                <div
                  class="font-size-14"
                  style="font-weight: 400; line-height: 32px"
                >
                  {{ task.tripDays }}天
                </div>
              </div>
            </div>
            <!-- {{ dayjs(task.createDate).format("YYYY-MM-DD") }} -->
            <div class="d-flex">
              <div
                class="align-self-center me-1"
                v-if="
                  task.userIcon && !avatarLoadErrorList.includes(task.userIcon)
                "
              >
                <img
                  :src="`/ipdoc${task.userIcon}`"
                  class="rounded-circle avatar-xs"
                  @error="handleAvatarError(task.userIcon)"
                />
              </div>
              <div
                class="avatar-xs align-self-center me-1"
                v-else
              >
                <span
                  class="avatar-title rounded-circle bg-soft bg-primary text-primary"
                  >{{ task.userIdStr?.charAt(0) }}</span
                >
              </div>
              <div style="display: flex; align-items: center">
                {{ task.userIdStr }}
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
  <el-drawer
    v-model="drawerStatus"
    :modal="false"
    size="50%"
    append-to-body
    title="出差申请"
  >
    <template #header>
      <div
        style="
          display: flex;
          align-items: center;
        "
      >
        <span
          v-if="appData.btId"
          style="font-size: 16px"
          >出差申请
          <span v-if="appData.wfStatus">
            <el-tag
              type="primary"
              v-if="appData.wfStatus == '待提交'"
              >{{ appData.wfStatus }}</el-tag
            >
            <el-tag
              type="warning"
              v-if="appData.wfStatus == '待审核'"
              >{{ appData.wfStatus }}</el-tag
            >
            <el-tag
              type="danger"
              v-if="appData.wfStatus == '审核退回'"
              >{{ appData.wfStatus }}</el-tag
            >
            <el-tag
              type="success"
              v-if="appData.wfStatus == '已完成'"
              >{{ appData.wfStatus }}</el-tag
            >
          </span>
        </span>
      </div>
    </template>
    <ViewDetail :appData="appData" />
    <template
      #footer
      v-if="auditable"
    >
      <div class="d-flex gap-2 justify-content-end">
        <el-button
          type="info"
          :loading="rejectLoading"
          @click="auditHandle(0)"
          plain
          >退回</el-button
        >
        <el-button
          type="primary"
          :loading="passLoading"
          @click="auditHandle(1)"
          >通过</el-button
        >
      </div>
    </template>
  </el-drawer>

  <el-dialog
    v-model="auditDialogVisible"
    :title="currentAuditType === 1 ? '审核通过' : '审核退回'"
    width="500px"
    :close-on-click-modal="false"
    append-to-body
  >
    <el-form label-width="80px">
      <el-form-item label="审核意见">
        <el-input
          v-model="auditComment"
          type="textarea"
          :rows="4"
          placeholder="请输入审核意见（非必填）"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="submitAudit"
          :loading="currentAuditType === 1 ? passLoading : rejectLoading"
        >
          提交
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
// import { upcomingTasks, progressTasks, completedTasks, billTasks } from "./data-kanaban";
import { queryTodoTask, auditBusinessTrip } from "@/api/businessTrip";
import dayjs from "dayjs";
import LoadingOverlay from "@/components/common/loading";
import ViewDetail from "@/views/hrm/businesstrip-management/viewDetail.vue";

export default {
  components: { LoadingOverlay, ViewDetail },
  props: {
    containerHegiht: {
      type: Number,
    },
    cardDesc: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      dataList: [],
      busy: false,
      total: 0,
      pageNo: 1,
      loading: false,
      drawerStatus: false,
      appData: {},
      avatarLoadErrorList: [],
      mouseInner: false,
      passLoading: false,
      rejectLoading: false,
      auditDialogVisible: false,
      currentAuditType: null,
      auditComment: '',
    };
  },
  methods: {
    dayjs,
    handleMouseLeave(event) {
      if (event.relatedTarget && event.relatedTarget.classList) {
        const contentClass = [
          "el-popover--plain",
          "el-popover",
          "is-light",
          "el-popper",
          "el-popper__arrow",
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
    handleAvatarError(userIcon) {
      this.avatarLoadErrorList = [...this.avatarLoadErrorList, userIcon];
    },
    handleClick(task) {
      this.appData = task;
      this.drawerStatus = true;
    },
    auditHandle(type) {
      this.currentAuditType = type;
      this.auditComment = '';
      this.auditDialogVisible = true;
    },
    submitAudit() {
      if (this.currentAuditType) {
        this.passLoading = true;
      }else{
        this.rejectLoading = true;
      }
      const params = {
        btId: this.appData.btId,
        result: this.currentAuditType,
        taskId: this.appData.taskId,
        auditComment: this.auditComment
      };
      auditBusinessTrip(params).then((res) => {
        this.passLoading = false
        this.rejectLoading = false
        if (res.success) {
          this.$message.success("操作成功");
          this.drawerStatus = false;
          this.fetchData();
          this.auditDialogVisible = false;
          this.auditComment = '';
        }
      });
    },
    loadMore() {
      this.loading = true;
      this.busy = true;
      this.pageNo++;
      const params = {
        pageNo: this.pageNo,
        pageSize: 10,
      };
      queryTodoTask(params).then((res) => {
        this.dataList = this.dataList.concat(res.data) || [];
        this.loading = false;
        if (this.dataList.length == res.total) {
          this.busy = true;
        } else {
          this.busy = false;
        }
      });
    },
    fetchData() {
      this.loading = true;
      const params = {
        pageSize: 10,
        pageNo: 1,
      };
      queryTodoTask(params).then((res) => {
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
  },
  computed: {
    auditable() {
      return this.appData.btId && this.appData.wfStatus == "待审核";
    },
    contentHeight() {
      return this.containerHegiht - 86;
    },
  },
  created() {
    this.fetchData();
  },
};
</script>

<style scoped lang="scss">
.todo-header {
  display: flex;
  align-items: center;
}
</style>
