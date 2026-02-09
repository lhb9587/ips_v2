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
                {{ caseInfo.caseType }}
              </td>
              <th
                scope="row"
                style="width: 10%"
              >
                申请方向 :
              </th>
              <td style="width: 40%">
                {{ caseInfo.appFromto }}
              </td>
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
              <td style="white-space: normal">{{ caseInfo.caseEnName }}</td>
            </tr>
            <tr>
              <th scope="row">域名类型 :</th>
              <td>
                {{
                  transformation(
                    selectData["1030"],
                    caseInfo.rightType,
                    "id",
                    "typeName"
                  )
                }}
              </td>
              <th scope="row">域名名称 :</th>
              <td>{{ caseInfo.rightName }}</td>
            </tr>
            <tr>
              <th scope="row">申请人 :</th>
              <td colspan="3">
                {{
                  transformation(
                    appList,
                    caseInfo.appId,
                    "appId",
                    "applicantName"
                  )
                }}
              </td>
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
import { queryApplicantByIdList } from "@/api/caseList";

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
      appList: [],
    };
  },
  methods: {
    transformation,
    fetchCustSelectClass() {
      querycustSelectClass({
        classId: "1030",
      }).then((response) => {
        if (response.success) {
          this.selectData = response.data || {};
        } else {
          this.$message.error(response.message);
        }
      });
    },
    fetAppList() {
      queryApplicantByIdList({ appIdArray: this.caseInfo.appId }).then(
        (res) => {
          this.appList = res.data;
        }
      );
    },
  },
  watch: {
    caseInfo: {
      handler(newVal) {
        if (newVal.appId) {
          this.fetAppList();
        }
      },
      deep: true,
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
