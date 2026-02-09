<template>
  <b-modal
    title="审核"
    v-model="showModal"
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
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width
      >
        <!-- <template #default="scope">
          <el-button
            type="text"
            @click="approvalInfo.billAllocations.splice(scope.$index, 1)"
            size="mini"
            >删除</el-button
          >
        </template> -->
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
          approvalInfo.taskNo != '1' &&
          approvalInfo.taskNo != '6' &&
          approvalInfo.taskNo
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
</template>
<script>
import { updateBillUrl, batchdoBillTaskUrl } from "@/api/billApi";
import { formatAmount, fomatFloat } from "@/utils";

export default {
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    approvalInfo: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      failReasion: undefined,
    };
  },
  computed: {
    showModal() {
      return this.modelValue;
    },
  },
  watch: {
    showModal: {
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
    floatFomat(num) {
      return formatAmount(num);
    },
    fomatFloat(number) {
      return fomatFloat(number, 2);
    },
    closeApprovalModal() {
      this.$emit("update:modelValue", false);
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
            taskIdList: this.approvalInfo.taskId,
            result: type,
            agree: type,
            failReasion: this.failReasion,
          })
            .then((response) => {
              this.showApproval = false;
              response.message && this.$message.success(response.message);
              this.fetchTaskData();
              this.failReasion = "";
            })
            .catch((e) => {
              console.log(e);
            });
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>
