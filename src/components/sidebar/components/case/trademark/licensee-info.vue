<template>
  <div
    v-if="showLicenseeInfo"
    class="card mb-0 mt-2"
  >
    <div
      class="card-body"
      style="overflow-y: auto"
    >
      <h4 class="card-title mb-2">被许可人信息</h4>

      <div class="table-responsive">
        <table class="table table-nowrap mb-0">
          <tbody>
            <tr>
              <th
                scope="row"
                style="width: 10%"
              >
                被许可人名称（中文）:
              </th>
              <td style="width: 40%">{{ normalizeText(caseInfo.transferorCnName) }}</td>
              <th
                scope="row"
                style="width: 10%"
              >
                被许可人统一社会信用代码:
              </th>
              <td style="width: 40%">{{ caseInfo.zrCertCode }}</td>
            </tr>
            <tr>
              <th scope="row">被许可人名称（英文）:</th>
              <td>{{ caseInfo.transferorEnName }}</td>
              <th
                v-if="showLicenseePostCode"
                scope="row"
              >
                被许可人邮政编码:
              </th>
              <td v-if="showLicenseePostCode">{{ caseInfo.licenseePostCode }}</td>
            </tr>
            <tr>
              <th scope="row">被许可人中文地址:</th>
              <td>{{ caseInfo.transferorCnAdress }}</td>
              <th
                v-if="showLicenseeNationality"
                scope="row"
              >
                被许可人国籍:
              </th>
              <td v-if="showLicenseeNationality">{{ caseInfo.transferorNationality }}</td>
            </tr>
            <tr>
              <th
                v-if="showLicenseeProvinceOrCity"
                scope="row"
              >
                被许可人地址省市区:
              </th>
              <td v-if="showLicenseeProvinceOrCity">{{ caseInfo.provinceOrCity }}</td>
              <th scope="row">被许可人英文地址:</th>
              <td>{{ caseInfo.transferorEnAdress }}</td>
            </tr>
            <tr>
              <th
                v-if="showLicenseeCountryOrRegion"
                scope="row"
              >
                被许可人国家或地区:
              </th>
              <td v-if="showLicenseeCountryOrRegion">{{ caseInfo.transferorCountryAndregion }}</td>
              <th
                v-if="showLicenseeType"
                scope="row"
              >
                被许可人类型:
              </th>
              <td v-if="showLicenseeType">{{ caseInfo.transferorType }}</td>
            </tr>
            <tr v-if="showLicenseeType">
              <th scope="row">被许可人上传文件的语言类型:</th>
              <td>{{ caseInfo.transferorUploadFileLanguage }}</td>
              <th scope="row">被许可人身份证明文件名称:</th>
              <td>{{ caseInfo.transferorCertificateName }}</td>
            </tr>
            <tr v-if="showLicenseeType">
              <th scope="row">被许可人身份证明文件号码:</th>
              <td>{{ caseInfo.transferorCertificateNumber }}</td>
              <th
                v-if="showLicenseeSubjectCertType"
                scope="row"
              >
                主体资格证明文件类型:
              </th>
              <td v-if="showLicenseeSubjectCertType">{{ caseInfo.transferorSubjectCertType }}</td>
            </tr>
            <tr v-if="showLicenseeSubjectFileCn">
              <th scope="row">被许可人主体资格证明（中文）:</th>
              <td
                colspan="3"
                class="nocopy"
              >
                <p
                  v-for="item in getAddressAndName('301562')"
                  :key="item.address"
                  style="margin-bottom: 0"
                >
                  <a
                    style="color: #409eff"
                    target="_blank"
                    :href="`/ipdoc${item.address}`"
                  >
                    {{ item.name }}
                  </a>
                </p>
              </td>
            </tr>
            <tr v-if="showLicenseeSubjectFileEn">
              <th scope="row">被许可人主体资格证明（英文）:</th>
              <td
                colspan="3"
                class="nocopy"
              >
                <p
                  v-for="item in getAddressAndName('301563')"
                  :key="item.address"
                  style="margin-bottom: 0"
                >
                  <a
                    style="color: #409eff"
                    target="_blank"
                    :href="`/ipdoc${item.address}`"
                  >
                    {{ item.name }}
                  </a>
                </p>
              </td>
            </tr>
            <tr v-if="showLicenseeIdFileCn">
              <th scope="row">被许可人身份证明文件(中文):</th>
              <td
                colspan="3"
                class="nocopy"
              >
                <p
                  v-for="item in getAddressAndName('301564')"
                  :key="item.address"
                  style="margin-bottom: 0"
                >
                  <a
                    style="color: #409eff"
                    target="_blank"
                    :href="`/ipdoc${item.address}`"
                  >
                    {{ item.name }}
                  </a>
                </p>
              </td>
            </tr>
            <tr v-if="showLicenseeIdFileEn">
              <th scope="row">被许可人身份证明原文件(外文):</th>
              <td
                colspan="3"
                class="nocopy"
              >
                <p
                  v-for="item in getAddressAndName('301565')"
                  :key="item.address"
                  style="margin-bottom: 0"
                >
                  <a
                    style="color: #409eff"
                    target="_blank"
                    :href="`/ipdoc${item.address}`"
                  >
                    {{ item.name }}
                  </a>
                </p>
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
  computed: {
    showLicenseeInfo() {
      return !this.caseInfo.usAgency && ["许可备案", "许可备案提前终止"].includes(this.caseInfo.caseType);
    },
    showLicenseeNotEarlyStop() {
      return this.showLicenseeInfo && this.caseInfo.caseType !== "许可备案提前终止";
    },
    showLicenseePostCode() {
      return this.showLicenseeNotEarlyStop;
    },
    showLicenseeNationality() {
      return this.showLicenseeNotEarlyStop;
    },
    showLicenseeCountryOrRegion() {
      return this.showLicenseeNotEarlyStop;
    },
    showLicenseeType() {
      return this.showLicenseeNotEarlyStop;
    },
    showLicenseeProvinceOrCity() {
      return this.showLicenseeInfo && this.caseInfo.transferorNationality === "中国";
    },
    showLicenseeSubjectCertType() {
      return (
        this.showLicenseeInfo &&
        this.caseInfo.transferorNationality === "中国" &&
        this.caseInfo.transferorType === "自然人"
      );
    },
    showLicenseeSubjectFileCn() {
      return (
        this.showLicenseeNotEarlyStop &&
        (this.caseInfo.transferorType !== "自然人" ||
          (this.caseInfo.transferorType === "自然人" &&
            this.caseInfo.transferorUploadFileLanguage === "中文"))
      );
    },
    showLicenseeSubjectFileEn() {
      return (
        this.showLicenseeNotEarlyStop &&
        this.caseInfo.transferorUploadFileLanguage === "外文" &&
        this.caseInfo.transferorType !== "自然人"
      );
    },
    showLicenseeIdFileCn() {
      return this.showLicenseeNotEarlyStop;
    },
    showLicenseeIdFileEn() {
      return this.showLicenseeNotEarlyStop && this.caseInfo.transferorUploadFileLanguage === "外文";
    },
  },
  methods: {
    normalizeText(value) {
      return value ? String(value).replace(/\s+/g, "") : "";
    },
    getAddressAndName(materialTypeId) {
      if (this.caseInfo.materials) {
        return this.caseInfo.materials.filter((item) => item.materialTypeId == materialTypeId);
      }
      return [];
    },
  },
  created() {
    this.$addCopy();
  },
  beforeUnmount() {
    this.$destroyCopy();
  },
};
</script>

<style></style>
