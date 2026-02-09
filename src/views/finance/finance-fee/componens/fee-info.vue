<template>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-2">费用基础信息</h4>
      <div class="table-responsive">
        <table
          class="table table-nowrap mb-0"
          style="width: 100%"
        >
          <tbody style="width: 100%;">
            <tr>
              <th style="width: 10%">案件文号 :</th>
              <td style="width: 40%;word-break: break-all; overflow-wrap: break-word;">{{ feeInfo.showRefno }}</td>
              <th style="width: 10%">案由描述 :</th>
              <td style="width: 40%">{{ feeInfo.caseName }}</td>
            </tr>
            <tr>
              <th>项目名称 :</th>
              <td>{{ feeInfo.prjName }}</td>
              <th>合同号/名称 :</th>
              <td>
                {{ feeInfo.contractNo || '-' }} / {{ feeInfo.contractName || '-' }}
                <el-button
                  v-if="feeInfo.contractId"
                  size="small"
                  type="text"
                  style="margin: 0; padding: 5px 0"
                  @click="viewContractFile"
                >
                  <i
                    class="bx bx-link-alt"
                    style="font-size: 14px"
                  ></i>
                </el-button>
              </td>
            </tr>
            <tr>
              <th>客户 :</th>
              <td>{{ feeInfo.custIdStr }}</td>
              <th>费用状态 :</th>
              <td>{{ feeInfo.wfStatus }}</td>
            </tr>
            <tr>
              <th>发生日期 :</th>
              <td>{{ feeInfo.beginDate }}</td>
              <th>结束日期 :</th>
              <td>{{ feeInfo.endDate }}</td>
            </tr>
            <tr>
              <th>报销人 :</th>
              <td>{{ feeInfo.reimburseUserIdStr }}</td>
              <th>费用承担工作组 :</th>
              <td>{{ feeInfo.costWkgIdStr }}</td>
            </tr>
            <tr>
              <th>报销人所属工作组 :</th>
              <td>{{ feeInfo.reimburseWkgIdStr }}</td>
              <th>所属部门 :</th>
              <td>{{ feeInfo.deptIdStr }}</td>
            </tr>
            <tr>
              <th>支付公司 :</th>
              <td>{{ feeInfo.paymentDeptIdStr }}</td>
              <th>账单杂费 :</th>
              <td>{{ feeInfo.payType }}</td>
            </tr>
            <tr v-if="feeInfo.payType">
              <th>具体付款方式 :</th>
              <td>{{ feeInfo.specificPayType }}</td>
              <th>后期提供发票 :</th>
              <td>
                <span v-if="feeInfo.invoiceLater == 0">否</span>
                <span v-if="feeInfo.invoiceLater == 1">是</span>
              </td>
            </tr>
            <tr v-if="feeInfo.payType">
              <th>苏总审批 :</th>
              <td>
                <span v-if="feeInfo.suAudit == 0">否</span>
                <span v-if="feeInfo.suAudit == 1">是</span>
              </td>
              <th>是否为差旅费 :</th>
              <td>
                <span v-if="feeInfo.travelExpenses == 0">否</span>
                <span v-if="feeInfo.travelExpenses == 1">是</span>
              </td>
            </tr>
            <tr>
              <th>单据号 :</th>
              <td>{{ feeInfo.feeNo }}</td>
              <th>所属月 :</th>
              <td>{{ feeInfo.belongtoDate }}</td>
            </tr>
            <tr>
              <th>上传文件 :</th>
              <td :colspan="!(['律所现金', '万慧达现金'].includes(feeInfo.payType))? 3:1">
                <p v-for="(item,index) in materialArray" :key="index">
                  <span
                    class="itemTitle_style"
                    @click="preView(`${item.address}`)"
                    >{{ item.name }}</span
                  >
                </p>
              </td>
              <template
                v-if="
                  ['律所现金', '万慧达现金'].includes(feeInfo.payType) &&
                  feeInfo.feeDetails.find(
                    (item) =>
                      item.feetId == 190 &&
                      (!item.invIds || (item.invIds && !item.invIds.length))
                  )
                "
              >
                <th>诉讼费收据号 :</th>
                <td>{{ feeInfo.lawsuitReceiptNo }}</td></template
              >
            </tr>
            <tr>
              <th>填报人 :</th>
              <td>{{ feeInfo.fillinUserIdStr }}</td>
              <th>填报日期 :</th>
              <td>{{ feeInfo.fillinDate }}</td>
            </tr>
            <tr>
              <th>备注 :</th>
              <td colspan="3">{{ feeInfo.remarks }}</td>
            </tr>
            <tr>
              <th>核销状态 :</th>
              <td>{{ feeInfo.tobillStatusStr }}</td>
              <th>核销日期 :</th>
              <td>{{ feeInfo.tobillDate }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { queryZZWorkGroupUrl } from "@/api/billApi";
import { getContractDetail } from "@/api/contract";
import { downLoadAll, viewFile } from "@/utils";
export default {
  props: {
    feeInfo: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      workgroupNamesList: [],
    };
  },
  computed: {
    materialArray() {
      return this.feeInfo.materialArray || [];
    },
  },
  methods: {
    viewContractFile() {
      getContractDetail({
        contractId: this.feeInfo.contractId
      }).then(res => {
          if (res.data && res.data[0] && res.data[0].attachmentCon) {
            viewFile(res.data[0].attachmentCon.filePath, '')
          }
      })
    },
    downLoadAll,
    queryWorkgroupNames() {
      queryZZWorkGroupUrl().then((res) => {
        this.workgroupNamesList = res.data;
      });
    },
    preView(url) {
      if (
        ["pdf", "jpg", "png"].some(
          (item) => url.replace(/.+\./, "").toLocaleLowerCase() == item
        )
      ) {
        window.open(`/ipdoc${url}`.replace(/[+]/g, "%2B"));
      } else {
        this.downLoadAll({ url: `/ipdoc${url}` });
      }
    },
  },
  created() {
    this.queryWorkgroupNames();
    this.$addCopy()
  },
  beforeUnmount(){
    this.$destroyCopy()
  }
};
</script>

<style></style>
