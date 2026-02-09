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
                代理机构 :
              </th>
              <td style="width: 40%">
                {{ caseInfo.whdAgencyName }}
              </td>
            </tr>
            <tr>
              <th scope="row">申请方向 :</th>
              <td>{{ caseInfo.appFromto }}</td>
              <th scope="row">专利类型 :</th>
              <td>{{ caseInfo.typeNameStr }}</td>
            </tr>
            <tr v-if="caseTypeId != 106">
              <th scope="row">主体法律性质 :</th>
              <td>{{ caseInfo.legalNature ? "法人" : "自然人" }}</td>
              <th scope="row">技术领域 :</th>
              <td>{{ caseInfo.techFieStr }}</td>
            </tr>
            <tr>
              <th scope="row">本案为中间转案 :</th>
              <td :colspan="caseTypeId == 69 ? 1 : 3">
                {{ caseInfo.istrans ? "是" : "否" }}
              </td>
              <template v-if="caseTypeId == 69">
                <th scope="row">是否代交 :</th>
                <td>{{ caseInfo.daijiao == "Y" ? "是" : "否" }}</td>
              </template>
            </tr>
            <tr>
              <th scope="row">案件文号 :</th>
              <td colspan="3">{{ caseInfo.agentNum }}</td>
            </tr>
            <tr v-if="caseTypeId == 68">
              <th scope="row">一带二申请 :</th>
              <td :colspan="caseInfo.twoapp ? 1 : 3">
                {{ caseInfo.twoapp ? "是" : "否" }}
              </td>
              <template v-if="caseInfo.twoapp == 1">
                <th scope="row">另一件案号 :</th>
                <td>{{ caseInfo.anotherApp }}</td>
              </template>
            </tr>
            <tr>
              <th scope="row">技术交底名称 :</th>
              <td colspan="3">{{ caseInfo.technicalDisclosure }}</td>
            </tr>
            <tr>
              <th>案件中文名称 :</th>
              <td :colspan="patentType == 1298 ? 1 : 3">
                {{ caseInfo.caseCnName }}
              </td>
              <template v-if="patentType == 1298">
                <th>图片 :</th>
                <td>
                  <div
                    style="width: 145px; height: 145px; padding: 10px"
                    class="avatar-uploader fl-ac-jc"
                  >
                    <img
                      v-if="imageUrl"
                      :src="`/ipdoc/${imageUrl}`"
                      class="avatar"
                      style="
                        max-width: 100%;
                        max-height: 100%;
                        object-fit: contain;
                      "
                    />
                  </div>
                </td>
              </template>
            </tr>
            <tr>
              <th>案件英文名称 :</th>
              <td colspan="3">{{ caseInfo.caseEnName }}</td>
            </tr>
            <tr>
              <th>案件日文名称 :</th>
              <td colspan="3">{{ caseInfo.caseJpName }}</td>
            </tr>
            <template v-if="caseTypeId == 66">
              <tr>
                <th>专利号 :</th>
                <td>
                  <span
                    v-if="
                      caseInfo.appFromto == '外-内' ||
                      caseInfo.appFromto == '内-内' ||
                      caseInfo.appFromto == '台-内'
                    "
                    >{{ caseInfo.appNumberStr }}</span
                  >
                  <span v-else>{{ caseInfo.appNumber }}</span>
                </td>
                <th>申请日 :</th>
                <td>{{ caseInfo.appDate }}</td>
              </tr>
              <tr>
                <th>授权日 :</th>
                <td>{{ caseInfo.certificateDate }}</td>
                <th>官方案件编号 :</th>
                <td>{{ caseInfo.patentNumber }}</td>
              </tr>
              <tr>
                <th scope="row">费减比例 :</th>
                <td colspan="3">{{ caseInfo.feeReduce }}</td>
              </tr>
            </template>
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
      imageUrl: "",
    };
  },
  computed: {
    caseTypeId() {
      return this.caseInfo.caseTypeId;
    },
    patentType() {
      return this.caseInfo.patentType;
    },
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
        if (newVal.materials?.length) {
          this.imageUrl =
            newVal.materials.find((i) => i.materialTypeId == 301510) &&
            newVal.materials.find((i) => i.materialTypeId == 301510).address;
        }
        if (newVal.appId) {
          this.fetAppList();
        }
      },
      deep: true,
    },
  },
  created() {
    this.fetchCustSelectClass();
  },
};
</script>

<style></style>
