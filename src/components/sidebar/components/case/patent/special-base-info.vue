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
              <th style="width: 10%">案件类型 :</th>
              <td style="width: 40%">
                {{ caseInfo.caseType }}
              </td>
              <th style="width: 10%">代理机构 :</th>
              <td style="width: 40%">
                {{ caseInfo.whdAgencyName }}
              </td>
            </tr>
            <tr>
              <th>申请方向 :</th>
              <td>{{ caseInfo.appFromto }}</td>
              <th>主体法律性质 :</th>
              <td>{{ caseInfo.legalNature == 0 ? "自然人" : "法人" }}</td>
            </tr>
            <tr>
              <th>技术领域 :</th>
              <td colspan="3">{{ caseInfo.techFieStr }}</td>
            </tr>
            <tr>
              <th>专利类型 :</th>
              <td :colspan="caseTypeId == 63 ? 1 : 3">
                {{ caseInfo.typeNameStr }}
              </td>
              <template v-if="caseTypeId == 63">
                <th>是否为分案 :</th>
                <td>{{ caseInfo.isDivcase ? "是" : "否" }}</td>
              </template>
            </tr>
            <tr>
              <th>是否代交 :</th>
              <td>{{ caseInfo.daijiao == "Y" ? "是" : "否" }}</td>
              <th>本案为中间转案 :</th>
              <td>{{ caseInfo.istrans ? "是" : "否" }}</td>
            </tr>
            <tr>
              <th>案件文号 :</th>
              <td>{{ caseInfo.agentNum }}</td>
              <template
                v-if="
                  (caseTypeId == '63' && patentType != 1298) ||
                  caseTypeId == '123'
                "
              >
                <th>一带二申请 :</th>
                <td>{{ caseInfo.twoapp ? "是" : "否" }}</td>
              </template>
            </tr>
            <tr
              v-if="
                caseInfo.twoapp == 1 &&
                ((caseTypeId == '63' && patentType != 1298) ||
                  caseTypeId == '123')
              "
            >
              <th>另一件案号 :</th>
              <td colspan="3">{{ caseInfo.anotherApp }}</td>
            </tr>
            <tr>
              <th>技术交底名称 :</th>
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
              <td>{{ caseInfo.caseEnName }}</td>
              <th>案件日文名称 :</th>
              <td>{{ caseInfo.caseJpName }}</td>
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
      imageUrl: "",
    };
  },
  computed: {
    patentType() {
      return this.caseInfo.patentType || 1296;
    },
    caseTypeId() {
      return this.caseInfo.caseTypeId || 63;
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
