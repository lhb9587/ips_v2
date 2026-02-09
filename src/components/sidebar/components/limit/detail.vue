<template>
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
            案件文号 :
          </th>
          <td style="width: 35%" class="clickable" v-if="!noCliclDetail"><span v-on:click="toggleCaseSidebar">{{ detail.agentNum }}</span></td>
          <td style="width: 35%" v-else>{{ detail.agentNum }}</td>
          <th
            scope="row"
            style="width: 15%"
          >
            客户 :
          </th>
          <td style="width: 35%" class="clickable" v-if="!noCliclDetail"><span v-on:click="toggleCustSidebar">{{ detail.custName }}</span></td>
          <td style="width: 35%" v-else>{{ detail.custName }}</td>
        </tr>
        <tr>
          <th scope="row">时限种类 :</th>
          <td>{{ detail.kindStr }}</td>
          <th scope="row">时限类型 :</th>
          <td>{{ detail.typeName }}</td>
        </tr>
        <tr>
          <th scope="row">计算基准日期 :</th>
          <td>{{ detail.sendDateStart }}</td>
          <th scope="row">绝限日期 :</th>
          <td>{{ detail.abslimitDate }}</td>
        </tr>
        <tr>
          <th scope="row">内部期限 :</th>
          <td>{{ detail.abslimitInternalDate }}</td>
          <th scope="row">时限工作组 :</th>
          <td>{{ detail.timeWorks }}</td>
        </tr>
        <tr v-if="detail.writeoffState > 0">
          <th scope="row">时限状态 :</th>
          <td>{{ detail.writeoffState > 0 ? "已核销" : "未核销" }}</td>
          <th scope="row">处理方式 :</th>
          <td>{{ detail.operation }}</td>
        </tr>
        <tr v-if="detail.writeoffState > 0">
          <th scope="row">核销人 :</th>
          <td>{{ detail.writeoffUserName }}</td>
          <th scope="row">核销日期 :</th>
          <td>{{ detail.writeoffDate }}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <CaseSidebar
    v-if="isCaseDetail"
    :showSidebar="isCaseDetail"
    @update:showSidebar="caseSidebarUpdate"
    :caseId="detail.caseId"
    :taskType="detail.taskType"
  />
  <CustomerSidebar
    :custId="detail.custId"
    v-if="isCustDetail"
    :showSidebar="isCustDetail"
    @update:showSidebar="custSidebarUpdate"
  />
</template>

<script>
import CaseSidebar from "@/components/sidebar/case-sidebar";
import CustomerSidebar from "@/components/sidebar/customer-sidebar";

export default {
  props: {
    detail: {
      type: Object,
      required: () => {},
    },
    noCliclDetail:{
      type:Boolean,
      default:false
    },
  },
  data() {
    return {
      isCaseDetail: false,
      isCustDetail: false,
    };
  },
  methods: {
    toggleCaseSidebar() {
      this.isCaseDetail = true;
    },
    caseSidebarUpdate(value) {
      this.isCaseDetail = value;
    },
    toggleCustSidebar() {
      this.isCustDetail = true;
    },
    custSidebarUpdate(value) {
      this.isCustDetail = value;
    },
  },
  components: {
    CustomerSidebar,
    CaseSidebar,
  },
};
</script>

<style scoped lang="scss">
</style>
