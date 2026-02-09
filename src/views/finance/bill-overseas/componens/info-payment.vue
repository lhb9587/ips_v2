<template>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-2">支付信息</h4>
      <div class="table-responsive">
        <table
          class="table table-nowrap mb-0"
          style="width: 100%"
        >
          <tbody>
            <tr>
              <th style="width: 10%">支付凭证电子版 :</th>
              <td colspan="3">
                <a
                  v-for="item in materialList.filter(
                    (i) => i.materialTypeId === 301560
                  )"
                  style="color: #409eff"
                  target="_blank"
                  :href="`/ipdoc${item.address}`"
                  :key="item.address"
                  >{{ item.materialName }}</a
                >
              </td>
            </tr>
            <tr>
              <th style="width: 10%">购付汇 :</th>
              <td style="width: 40%">{{ billInfo.purchaseOrPayExcRate }}</td>
              <th style="width: 10%">支付日期 :</th>
              <td style="width: 40%">{{ billInfo.payDate }}</td>
            </tr>
            <tr>
              <th>支付币种 :</th>
              <td>
                {{
                  transformation(
                    queryCurrencyList,
                    billInfo.payCurId,
                    "curId",
                    "curName"
                  )
                }}
              </td>
              <th>支付金额（本币） :</th>
              <td>
                {{ formatAmount(billInfo.payMoney) }}
              </td>
            </tr>
            <tr>
              <th>外汇牌价 :</th>
              <td>{{ billInfo.foreignExchangeRate }}</td>
              <th>手续费 :</th>
              <td>{{ formatAmount(billInfo.handleFee) }}</td>
            </tr>
            <tr>
              <th>手续费支付方式 :</th>
              <td>{{ formatAmount(billInfo.handleFeePayType) }}</td>
              <th>支付方式 :</th>
              <td>{{ formatAmount(billInfo.payType) }}</td>
            </tr>
            <tr>
              <th>报销人 :</th>
              <td>{{ formatAmount(billInfo.reimburseUserIdStr) }}</td>
              <th>支付公司 :</th>
              <td>
                {{
                  transformation(
                    companyList,
                    billInfo.payDeptId,
                    "deptId",
                    "companyShortName"
                  )
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { transformation, formatAmount } from "@/utils";
import { queryCompany } from "@/api/feeList";
import { queryCurrencyUrl } from "@/api/customerList";
export default {
  props: {
    billInfo: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      queryCurrencyList: [],
      companyList: [],
    };
  },
  computed: {
    billData() {
      return this.billInfo.bill || {};
    },
    materialList() {
      return this.billInfo.materialList || [];
    },
  },
  methods: {
    transformation,
    formatAmount,
    queryCurrency() {
      queryCurrencyUrl().then((res) => {
        this.queryCurrencyList = res.data;
      });
    },
    fetchCompanyList() {
      queryCompany().then((res) => {
        this.companyList = res.data || [];
      });
    },
  },
  created() {
    this.queryCurrency();
    this.fetchCompanyList();
    this.$addCopy()
  },
  beforeUnmount(){
    this.$destroyCopy()
  }
};
</script>

<style></style>
