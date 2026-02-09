<template>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-2">案件详情</h4>
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
                案件类型 :
              </th>
              <td style="width: 40%">
                <span
                  v-for="(item, index) in caseInfo.lawsuitCasetypeNameArray"
                  :key="index"
                  >{{ item }}</span
                >
              </td>
              <th
                scope="row"
                style="width: 10%"
              >
                案件性质 :
              </th>
              <td style="width: 40%">
                <span
                  :key="index"
                  v-for="(itm, index) in caseInfo?.lawsuitWorkArray?.map(
                    (item) =>
                      transformation(selectData['1136'], item, 'id', 'typeName')
                  )"
                >
                  {{ itm }}
                </span>
              </td>
            </tr>
            <tr>
              <th scope="row">申请方向 :</th>
              <td colspan="3">{{ caseInfo.appFromto }}</td>
            </tr>
            <tr>
              <th scope="row">案件文号 :</th>
              <td>{{ caseInfo.agentNum }}</td>
              <th scope="row">案件等级 :</th>
              <td>{{ caseInfo.caseLevelStr }}</td>
            </tr>
            <tr>
              <th scope="row">案件名称 :</th>
              <td style="white-space: normal">{{ caseInfo.caseName }}</td>
              <th scope="row">案件名称（英文） :</th>
              <td style="white-space: normal">{{ caseInfo.caseNameEn }}</td>
            </tr>
            <tr>
              <th scope="row">基本案情介绍 :</th>
              <td colspan="3">{{ caseInfo.caseIntroduce }}</td>
            </tr>
            <tr>
              <th scope="row">报价 :</th>
              <td colspan="3">{{ caseInfo.caseOffer || "0" }}</td>
            </tr>
            <tr>
              <th scope="row">备注 :</th>
              <td colspan="3">{{ caseInfo.memo }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-2">外方代理所信息</h4>
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
                外方代理所 :
              </th>
              <td style="width: 40%">
                {{ caseInfo.agencyCustName }}
              </td>
              <th
                scope="row"
                style="width: 10%"
              >
                涉及国家 :
              </th>
              <td style="width: 40%">
                {{ caseInfo.appState }}
              </td>
            </tr>
            <tr>
              <th scope="row">外方代理所联系人 :</th>
              <td>{{ caseInfo.agencyCustContactName }}</td>
              <th scope="row">外方代理所文号 :</th>
              <td>{{ caseInfo.foreignAgentNum }}</td>
            </tr>
            <tr>
              <th scope="row">外方代理所地址 :</th>
              <td colspan="3">{{ caseInfo.agencyCustAddrName }}</td>
            </tr>
            <tr>
              <th scope="row">外方代理所要求 :</th>
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
export default {
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
