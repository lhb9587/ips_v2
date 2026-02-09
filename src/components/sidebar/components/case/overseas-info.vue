<template>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-2">境外信息</h4>

      <div class="table-responsive">
        <table
          class="table table-nowrap mb-0"
          style="width: 100%"
        >
          <tbody>
            <tr>
              <th
                scope="row"
                style="width: 10%"
              >
                注册方式 :
              </th>
              <td style="width: 40%">
                {{ caseInfo.madrid ? "马德里注册" : "逐一注册" }}
              </td>
              <th
                scope="row"
                style="width: 10%"
              >
                注册国家 :
              </th>
              <td style="width: 40%">{{ caseInfo.appState }}</td>
            </tr>
            <tr>
              <th scope="row">外方代理所 :</th>
              <td>{{ caseInfo.agencyCustName }}</td>
              <th scope="row">外方代理所联系人 :</th>
              <td>{{ caseInfo.agencyCustContactName }}</td>
            </tr>
            <tr>
              <th scope="row">外方代理所文号 :</th>
              <td>{{ caseInfo.agencyCustRefno }}</td>
              <th scope="row">外方代理所地址 :</th>
              <td>{{ caseInfo.agencyCustAddrName }}</td>
            </tr>
            <tr
              v-if="
                ['内-外', '外-外'].includes(caseInfo.appFromto) &&
                caseInfo.appState == '美国'
              "
            >
              <th scope="row">第一次使用日期 :</th>
              <td>{{ caseInfo.firstUseDate }}</td>
              <th scope="row">商业使用日期 :</th>
              <td>{{ caseInfo.businessUseDate }}</td>
            </tr>
            <tr
              v-if="
                ['内-外', '外-外'].includes(caseInfo.appFromto) &&
                caseInfo.madrid
              "
            >
              <th scope="row">指定国注册号 :</th>
              <td>{{ caseInfo.zdRegNumber }}</td>
              <th scope="row">指定国注册日 :</th>
              <td>{{ caseInfo.zdRegDate }}</td>
            </tr>
            <tr>
              <th scope="row">指定国申请号 :</th>
              <td>{{ caseInfo.zdAppNumber }}</td>
              <th scope="row">指定国申请日 :</th>
              <td>{{ caseInfo.zdAppDate }}</td>
            </tr>
            <tr>
              <th scope="row">外方代理所要求 :</th>
              <td>{{ caseInfo.agencyCustReq }}</td>
              <th scope="row">时限内容 :</th>
              <td>{{ caseInfo.timeLimitContent }}</td>
            </tr>
            <tr>
              <th scope="row">时限日期 :</th>
              <td colspan="3">{{ caseInfo.limitDate }}</td>
            </tr>
            <tr>
              <th scope="row">外代所报价 :</th>
              <td colspan="3" class="nocopy"> 
                <el-table
                  :data="caseInfo.agencyOffers"
                  :max-height="280"
                  :show-overflow-tooltip='true'
                >
                  <el-table-column
                    :prop="col.value"
                    :label="col.title"
                    v-for="col of agencyOffersColumns"
                    :key="col.value"
                  />
                </el-table>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    caseInfo: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      agencyOffersColumns: [
        { title: "报价币种", value: "abroadCurId" },
        { title: "折扣", value: "discount" },
        { title: "服务费（折扣后）", value: "serviceCost"},
        { title: "官费", value: "officialCost" },
        { title: "杂费", value: "otherCost" },
        { title: "总金额", value: "sumCost" },
        { title: "说明", value: "description" },
        { title: "报价文档", value: "materialArray" },
      ],
    };
  },
  created() {
    this.$addCopy()
  },
  beforeUnmount(){
    this.$destroyCopy()
  }
};
</script>

<style></style>
