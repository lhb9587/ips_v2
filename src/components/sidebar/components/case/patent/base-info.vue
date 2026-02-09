<template>
  <div
    v-if="
      caseInfo.caseTypeId == 63 ||
      caseInfo.caseTypeId == 64 ||
      caseInfo.caseTypeId == 123
    "
  >
    <SpecialBaseInfo :caseInfo="caseInfo" />
  </div>
  <div v-else>
    <CommonBaseInfo :caseInfo="caseInfo" />
  </div>
  <div class="card" v-if="caseInfo.appFromto == '内-外' || caseInfo.appFromto == '外-外'">
    <div class="card-body">
      <h4 class="card-title mb-2">外代所</h4>
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
                进入国家 :
              </th>
              <td style="width: 40%">
                {{ caseInfo.toCountry }}
              </td>
              <th
                scope="row"
                style="width: 10%"
              >
                外方案号 :
              </th>
              <td style="width: 40%">
                {{ caseInfo.agencyCustRefno }}
              </td>
            </tr>
            <tr>
              <th scope="row">外方代理所 :</th>
              <td>{{ caseInfo.agencyCustName }}</td>
              <th scope="row">外方联系人 :</th>
              <td>{{ caseInfo.agencyCustContactName }}</td>
            </tr>
            <tr>
              <th scope="row">外方文件邮址 :</th>
              <td colspan="3">{{ caseInfo.agencyCustFileAddrCn }}</td>
            </tr>
            <tr>
              <th scope="row">外方要求 :</th>
              <td colspan="3">{{ caseInfo.agencyCustReq }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { transformation } from "@/utils";
import { querycustSelectClass } from "@/api/caseDetail";
import CommonBaseInfo from "./common-base-info.vue";
import SpecialBaseInfo from "./special-base-info.vue";
export default {
  components: {
    SpecialBaseInfo,
    CommonBaseInfo,
  },
  props: {
    caseInfo: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      selectData: {},
    };
  },
  methods: {
    transformation,
    fetchCustSelectClass() {
      querycustSelectClass({
        classId: "1042,1134,1135,1027,1029,1136,1031,1020",
      }).then((response) => {
        if (response.success) {
          this.selectData = response.data || {};
        } else {
          this.$message.error(response.message);
        }
      });
    },
  },
  created() {
    this.fetchCustSelectClass();
    this.$addCopy()
  },
  beforeUnmount(){
    this.$destroyCopy()
  }
};
</script>

<style></style>
