<template>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-2">基本信息</h4>
      <div class="table-responsive">
        <table
          class="table table-nowrap mb-0"
          style="width: 100%"
        >
          <tbody>
            <tr>
              <th style="width: 10%">案件文号 :</th>
              <td style="width: 40%">{{ billInfo.showRefno }}</td>
              <th style="width: 10%">案由描述 :</th>
              <td style="width: 40%">{{ billInfo.caseDesc }}</td>
            </tr>
            <tr>
              <th>账单号 :</th>
              <td colspan="3">{{ billInfo.billNo }}</td>
            </tr>
            <tr>
              <th>结余状态 :</th>
              <td>{{ billInfo.balanceStr }}</td>
              <th>注册国家 :</th>
              <td>{{ billInfo.regCountry }}</td>
            </tr>
            <tr>
              <th>客户 :</th>
              <td>{{ billInfo.custName }}</td>
              <th>客户信用等级 :</th>
              <td>{{ billInfo.custLevel }}</td>
            </tr>
            <tr>
              <th>商标案件承办组 :</th>
              <td>
                {{
                  transformation(
                    workgroupNamesList,
                    billInfo.tmCaseCbWkgId,
                    "wkgId",
                    "groupName"
                  )
                }}
              </td>
              <th>费用承担工作组 :</th>
              <td>
                {{
                  transformation(
                    workgroupNamesList,
                    billInfo.feeCostWkgId,
                    "wkgId",
                    "groupName"
                  )
                }}
              </td>
            </tr>
            <tr>
              <th>我方账单收款情况 :</th>
              <td>{{ billData.paymentStatusStr }}</td>
              <th>账单服务费 :</th>
              <td>{{ formatAmount(billData.serviceCost) }}</td>
            </tr>
            <tr>
              <th>账单官费 :</th>
              <td>{{ formatAmount(billData.officialCost) }}</td>
              <th>账单杂费 :</th>
              <td>{{ formatAmount(billData.otherCost) }}</td>
            </tr>
            <tr>
              <th>账单总金额 :</th>
              <td>{{ formatAmount(billData.billSum) }}</td>
              <th>外币总金额 :</th>
              <td>{{ formatAmount(billData.foreignSum) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { queryZZWorkGroupUrl } from "@/api/billApi";
import { transformation, formatAmount } from "@/utils";
export default {
  props: {
    billInfo: {
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
    billData() {
      return this.billInfo.bill || {};
    }
  },
  methods: {
    transformation,
    formatAmount,
    queryWorkgroupNames() {
      queryZZWorkGroupUrl().then((res) => {
        this.workgroupNamesList = res.data;
      });
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
