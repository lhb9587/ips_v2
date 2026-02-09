<template>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-2">境外账单信息</h4>
      <div class="table-responsive">
        <table
          class="table table-nowrap mb-0"
          style="width: 100%"
        >
          <tbody>
            <tr>
              <th style="width: 10%">境外账单电子版 :</th>
              <td style="width: 40%" class="nocopy">
                <a
                  v-for="item in materialList.filter(
                    (i) => i.materialTypeId === 359
                  )"
                  style="color: #409eff"
                  target="_blank"
                  :href="`/ipdoc${item.address}`"
                  :key="item.address"
                  >{{ item.materialName }}</a
                >
              </td>
              <th style="width: 10%">境外代理所 :</th>
              <td style="width: 40%">{{ billInfo.agencyCustName }}</td>
            </tr>
            <tr>
              <th>境外账单日 :</th>
              <td>{{ billInfo.abroadBillDate }}</td>
              <th>境外账单号 :</th>
              <td>{{ billInfo.abroadBillNo }}</td>
            </tr>
            <tr>
              <th>境外账单费用概要 :</th>
              <td>{{ billInfo.abroadContent }}</td>
              <th>境外账单币种 :</th>
              <td>
                {{
                  transformation(
                    queryCurrencyList,
                    billInfo.abroadCurId,
                    "curId",
                    "curName"
                  )
                }}
              </td>
            </tr>
            <tr>
              <th>境外账单汇率 :</th>
              <td>{{ billInfo.abroadExchangeRate }}</td>
              <th>境外代理费（折扣后） :</th>
              <td>{{formatAmount( billInfo.abroadServiceFee )}}</td>
            </tr>
            <tr>
              <th>境外官费 :</th>
              <td>{{ formatAmount(billInfo.abroadOfficialFee) }}</td>
              <th>境外杂费 :</th>
              <td>{{ formatAmount(billInfo.abroadOtherFee) }}</td>
            </tr>
            <tr>
              <th>境外账单总金额 :</th>
              <td>{{ formatAmount(billInfo.abroadBillSum) }}</td>
              <th>境外事务所案件联系人 :</th>
              <td>{{ formatAmount(billInfo.agencyCustContact) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { transformation, formatAmount } from "@/utils";
import {queryCurrencyUrl} from "@/api/customerList";
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
  },
  created() {
    this.queryCurrency();
    this.$addCopy()
  },
  beforeUnmount(){
    this.$destroyCopy()
  }
};
</script>

<style></style>
