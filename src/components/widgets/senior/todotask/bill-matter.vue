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
          <span>账单待办</span>
          <el-popover
            placement="bottom-start"
            title="账单待办"
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
          style="margin-bottom: 10px; cursor: pointer;"
          @click="handleClick(task)"
        >
          <div class="card-body task-content">
            <div
              style="margin-bottom: 8px; width: 100%"
              class="text-ellipsis text-dark font-size-15"
              :title="task.tmName"
            >
              {{ task.tmName }}
            </div>
            <div class="float-end ml-2">
              <div class="text-end">
                <div
                  class="font-size-14"
                  style="font-weight: 400;line-height:32px"
                >
                  {{ task.billSum }}
                </div>
              </div>
            </div>
            <!-- <div class="text-muted">
              {{ task.custShortNameString }}
            </div> -->

            <div class="d-flex">
              <div
                class="align-self-center me-1"
                v-if="
                  task.billUserIcon && !avatarLoadErrorList.includes(task.billUserIcon)
                "
              >
                <img
                  :src="`/ipdoc${task.billUserIcon}`"
                  class="rounded-circle avatar-xs"
                  @error="handleAvatarError(task.billUserIcon)"
                />
              </div>
              <div
                class="avatar-xs align-self-center me-1"
                v-else
              >
                <span
                  class="avatar-title rounded-circle bg-soft bg-primary text-primary"
                  >{{ task.userNameString?.charAt(0) }}</span
                >
              </div>
              <div style="display: flex; align-items: center">
                {{ task.userNameString }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无数据" :image-size="90"/>
    </div>
    <b-modal
      title="审核"
      v-model="showApproval"
      hide-footer
      centered
      size="lg"
      @close="closeApprovalModal"
    >
      <div class="table-responsive">
        <table
          class="table table-td-nowrap mb-0"
          style="width: 100%"
        >
          <tbody>
            <tr>
              <th
                scope="row"
                style="width: 15%"
              >
                账单号 :
              </th>
              <td style="width: 35%">{{ approvalInfo.billNo }}</td>
              <th
                scope="row"
                style="width: 15%"
              >
                所属工作组 :
              </th>
              <td style="width: 35%">{{ approvalInfo.wkgIdString }}</td>
            </tr>
            <tr>
              <th scope="row">客户名称 :</th>
              <td colspan="3">{{ approvalInfo.custFullNameString }}</td>
            </tr>
            <tr>
              <th scope="row">案件描述 :</th>
              <td
                colspan="3"
                style="white-space: normal"
              >
                {{ approvalInfo.caseDesc }}
              </td>
            </tr>
            <tr>
              <th scope="row">开单人 :</th>
              <td colspan="3">{{ approvalInfo.billUserIdString }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        class="d-flex"
        style="display: flex; justify-content: space-between"
      >
        <h4 class="card-title mb-4">账单分配</h4>
        <div class="mb-4">
          <b-button
            variant="primary"
            class="ms-1"
            @click="addItem()"
            size="sm"
            >添加</b-button
          >
        </div>
      </div>
      <el-table
        size="small"
        :data="approvalInfo.billAllocations"
        fit
        empty-text="暂无数据"
        current-row-key
        style="width: 100%"
      >
        <el-table-column
          label="工作组类型"
          width="120px"
        >
          <template #default="scope">
            <el-select
              v-model="scope.row.groupType"
              no-match-text="暂无数据"
              filterable
            >
              <el-option
                v-for="(item, key) in ['客户组', '承办组']"
                :key="key"
                :label="item"
                :value="item"
              ></el-option>
            </el-select>
            <!-- <span v-else>{{ scope.row.groupType }}</span> -->
          </template>
        </el-table-column>

        <el-table-column label="工作组">
          <template #default="scope">
            <el-select
              v-model="scope.row.wkgid"
              no-match-text="暂无数据"
              filterable
            >
              <el-option
                v-for="(item, key) in workGroups"
                :key="key"
                :label="item.groupName"
                :value="item.wkgId"
              ></el-option>
            </el-select>

            <!-- <span v-else>{{ scope.row.groupName }}</span> -->
          </template>
        </el-table-column>

        <el-table-column
          label="分配比例"
          width="100px"
        >
          <template #default="scope">
            <div>
              <el-input
                style="width: 65px"
                v-model="scope.row.alloratio"
                :value="floatFomat(scope.row.alloratio)"
                @change="
                  (val) => {
                    blchangeinput(val, scope.row, scope.$index);
                  }
                "
              ></el-input
              >%
            </div>
            <!-- <span v-else>{{ scope.row.alloratio }}</span> -->
          </template>
        </el-table-column>
        <el-table-column
          label="分配金额"
          width
        >
          <template #default="scope">
            <el-input
              v-model="scope.row.allomoney"
              :value="floatFomat(scope.row.allomoney)"
              @change="
                (val) => {
                  jechangeinput(val, scope.row, scope.$index);
                }
              "
            ></el-input>
          </template>
        </el-table-column>

        <el-table-column
          label="审批人"
          width
        >
          <template #default="scope">
            <span>{{ scope.row.approvaluseridString }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="备注"
          width
        >
          <template #default="scope">
            <el-input
              v-model="scope.row.memo"
              placeholder="请输入"
            ></el-input>
            <!-- <span v-else>{{ scope.row.memo }}</span> -->
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width
        >
          <template #default="scope">
            <el-button
              type="text"
              @click="approvalInfo.billAllocations.splice(scope.$index, 1)"
              size="mini"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <table
        class="table table-nowrap mb-0"
        style="width: 100%"
      >
        <tbody>
          <tr>
            <th
              scope="row"
              style="width: 15%"
            >
              实际成本（费用+内帐） :
            </th>
            <td
              colspan="3"
              style="width: 85%"
            >
              {{ approvalInfo.actualCost }}
            </td>
          </tr>
          <tr>
            <th
              scope="row"
              style="width: 15%"
            >
              可分配（总金额-成本） :
            </th>
            <td
              colspan="3"
              style="width: 85%"
            >
              {{ approvalInfo.allocationMoney }}
            </td>
          </tr>
        </tbody>
      </table>
      <div class="text-end mt-3">
        <b-button
          variant="light"
          @click="closeApprovalModal"
          >取消</b-button
        >
        <el-popover
          placement="top"
          ref="returnPopover"
          width="250"
          title="退回原因"
          trigger="click"
          v-if="
            rowInfo.taskNo != '1' && rowInfo.taskNo != '6' && rowInfo.taskNo
          "
        >
          <div style="text-align: right">
            <el-input
              type="textarea"
              :rows="2"
              placeholder="请输入内容"
              v-model="failReasion"
            >
            </el-input>
            <b-button
              variant="danger"
              style="margin-top: 6px"
              @click="passOrReturn('0')"
              class="ms-1"
              size="sm"
              >确认退回</b-button
            >
          </div>
          <template #reference>
            <b-button
              variant="danger"
              class="ms-1"
              >退回</b-button
            >
          </template>
        </el-popover>
        <b-button
          variant="success"
          class="ms-1"
          @click="passOrReturn('1')"
          >通过</b-button
        >
      </div>
    </b-modal>
  </div>
</template>

<script>
import { queryBillTask } from "@/api/caseList";
import {
  queryBillUrl,
  updateBillUrl,
  batchdoBillTaskUrl,
  queryZZWorkGroupUrl,
} from "@/api/billApi";
import LoadingOverlay from "@/components/common/loading";
import { formatAmount, fomatFloat } from "@/utils";

export default {
  components: { LoadingOverlay },
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
      dataList: [],
      busy: false,
      total: 0,
      pageNo: 1,
      loading: false,
      showApproval: false,
      approvalInfo: {},
      rowInfo: {},
      failReasion: undefined,
      avatarLoadErrorList: [],
      mouseInner: false,
    };
  },
  watch: {
    showApproval: {
      handler(val) {
        if (!val) {
          if (this.$refs.returnPopover) {
            this.$refs.returnPopover.hide(); // 调用 Element UI 的方法关闭 Popover
          }
        }
      },
    },
  },
  methods: {
    handleAvatarError(billUserIcon) {
      this.avatarLoadErrorList = [...this.avatarLoadErrorList, billUserIcon];
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
    floatFomat(num) {
      return formatAmount(num);
    },
    fomatFloat(number) {
      return fomatFloat(number, 2);
    },
    loadMore() {
      this.loading = true;
      this.busy = true;
      this.pageNo++;
      const params = {
        pageNo: this.pageNo,
        pageSize: 10,
      };
      queryBillTask(params).then((res) => {
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
      queryBillTask(params).then((res) => {
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
    handleClick(task) {
      this.showApproval = true;
      this.rowInfo = task;
      this.fetchBillDetail(task.billId);
    },
    fetchBillDetail(billId) {
      queryBillUrl({ billId }).then((res) => {
        this.approvalInfo = res.data;
      });
    },
    addItem() {
      this.approvalInfo.billAllocations.push({ wkgid: "", groupType: "" });
    },
    blchangeinput(val, row, index) {
      this.approvalInfo.billAllocations[index].allomoney = this.fomatFloat(
        this.approvalInfo.allocationMoney * val * 0.01
      );
      this.fpChangyz();
    },
    jechangeinput(val, row, index) {
      this.approvalInfo.billAllocations[index].alloratio = this.fomatFloat(
        (val / this.approvalInfo.allocationMoney) * 100
      );
      if (this.approvalInfo.allocationMoney == 0) {
        this.approvalInfo.billAllocations[index].alloratio = 0;
      }
      this.fpChangyz();
    },
    fpChangyz() {
      if (this.approvalInfo.billAllocations) {
        let number_f = 0;
        this.approvalInfo.billAllocations.forEach((item) => {
          number_f += Number(this.fomatFloat(item.allomoney));
        });
        if (this.fomatFloat(Number(this.approvalInfo.allocationMoney)) >= 0) {
          if (
            Number(this.fomatFloat(number_f)) >
            Number(this.fomatFloat(this.approvalInfo.allocationMoney))
          ) {
            this.$message.error(
              "您选择的比例金额已经超出可分配金额上限，请确认！"
            );
            return false;
          }
        } else {
          if (number_f >= 0) {
            return;
          } else {
            if (
              Number(this.fomatFloat(number_f)) <
              Number(this.fomatFloat(this.approvalInfo.allocationMoney))
            ) {
              this.$message.error(
                "您选择的比例金额已经超出可分配金额上限，请确认！"
              );
              return false;
            }
          }
        }
      }
    },
    fetchWorkGroups() {
      queryZZWorkGroupUrl().then((res) => {
        this.workGroups = res.data;
      });
    },
    passOrReturn(type) {
      if (this.approvalInfo.billAllocations) {
        let number_f = 0;
        this.approvalInfo.billAllocations.forEach((item) => {
          number_f += Number(this.fomatFloat(item.allomoney));
        });
        if (this.fomatFloat(Number(this.approvalInfo.allocationMoney)) >= 0) {
          if (
            Number(this.fomatFloat(number_f)) >
            Number(this.fomatFloat(this.approvalInfo.allocationMoney))
          ) {
            this.$message.error(
              "您选择的比例金额已经超出可分配金额上限，请确认！"
            );
            return false;
          }
        } else {
          if (number_f >= 0) {
            return;
          } else {
            if (
              Number(this.fomatFloat(number_f)) <
              Number(this.fomatFloat(this.approvalInfo.allocationMoney))
            ) {
              this.$message.error(
                "您选择的比例金额已经超出可分配金额上限，请确认！"
              );
              return false;
            }
          }
        }
      }
      let reqData = JSON.parse(JSON.stringify(this.approvalInfo));
      delete reqData.billCost;
      delete reqData.billRecords;
      delete reqData.wfStatus;
      delete reqData.billNo;
      updateBillUrl(reqData)
        .then(() => {
          batchdoBillTaskUrl({
            taskIdList: this.rowInfo.taskId,
            result: type,
            agree: type,
            failReasion: this.failReasion,
          })
            .then((response) => {
              response.message && this.$message.success(response.message);
              this.fetchData();
              this.closeApprovalModal();
            })
            .catch((e) => {
              console.log(e);
            });
        })
        .catch((error) => {
          console.log(error);
        });
    },
    closeApprovalModal() {
      this.showApproval = false;
      this.approvalInfo = {};
      this.failReasion = undefined;
    },
  },
  computed: {
    contentHeight() {
      return this.containerHegiht - 86;
    },
  },
  created() {
    this.fetchData();
    this.fetchWorkGroups();
  },
};
</script>

<style scoped lang="scss">
.todo-header {
  display: flex;
  align-items: center;
}
</style>
