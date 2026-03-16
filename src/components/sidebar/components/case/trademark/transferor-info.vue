<template>
  <div
    v-if="showTransferorInfo"
    class="card mb-0 mt-2"
  >
    <div
      class="card-body"
      :style="{ maxHeight: `${appMaxHeight}px`, overflowY: 'auto' }"
    >
      <h4 class="card-title mb-2">转让人信息</h4>

      <div class="table-responsive">
        <table class="table table-nowrap mb-0">
          <tbody>
            <tr>
              <th
                scope="row"
                style="width: 10%"
              >
                转让人中文名称 :
              </th>
              <td style="width: 40%">
                {{ normalizeText(caseInfo.transferorCnName) }}
              </td>
              <th
                scope="row"
                style="width: 10%"
              >
                转让人英文名称 :
              </th>
              <td style="width: 40%">{{ caseInfo.transferorEnName }}</td>
            </tr>
            <tr>
              <th scope="row">转让人主体法律性质（类型） :</th>
              <td>{{ caseInfo.transferorType }}</td>
              <th scope="row">转让人国籍 :</th>
              <td>{{ caseInfo.transferorNationality }}</td>
            </tr>
            <tr>
              <th scope="row">转让人身份证明文件名称 :</th>
              <td>{{ caseInfo.transferorCertificateName }}</td>
              <template v-if="showTransferorCertCode">
                <th scope="row">转让人统一社会信用代码 :</th>
                <td>{{ caseInfo.zrCertCode }}</td>
              </template>
              <template v-else>
                <th scope="row">转让人身份证明文件号码 :</th>
                <td>{{ caseInfo.transferorCertificateNumber }}</td>
              </template>
            </tr>
            <tr>
              <th scope="row">转让人国家或地区 :</th>
              <td>{{ caseInfo.transferorCountryAndregion }}</td>
              <th
                scope="row"
                v-if="showTransferorProvinceOrCity"
              >
                转让人地址省市区 :
              </th>
              <td>
                {{ caseInfo.provinceOrCity }}
              </td>
            </tr>
            <tr>
              <th scope="row">转让人中文地址 :</th>
              <td>{{ caseInfo.transferorCnAdress }}</td>
              <th scope="row">转让人英文地址 :</th>
              <td>{{ caseInfo.transferorEnAdress }}</td>
            </tr>
            <tr v-if="showTransferorSubjectCertType">
              <th scope="row">主体资格证明文件类型 :</th>
              <td>{{ caseInfo.transferorSubjectCertType }}</td>
              <th scope="row">统一社会信用代码 :</th>
              <td>{{ caseInfo.zrCertCode }}</td>
            </tr>
            <tr>
              <th scope="row">转让人邮政编码 :</th>
              <td>{{ caseInfo.licenseePostCode }}</td>
              <th scope="row">转让人上传文件的语言类型 :</th>
              <td>{{ caseInfo.transferorUploadFileLanguage }}</td>
            </tr>
            <tr>
              <th scope="row">转让人委托书 :</th>
              <td
                colspan="3"
                class="nocopy"
              >
                <p
                  v-for="item in getAddressAndName('1022')"
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
            <tr v-if="caseInfo.changeType === '商标转让'">
              <th scope="row">转/受让人同意撤回的声明文件 :</th>
              <td
                colspan="3"
                class="nocopy"
              >
                <p
                  v-for="item in getAddressAndName('1071')"
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
            <tr v-if="transferorSubjectFile">
              <th scope="row">转让人主体资格证明（中文） :</th>
              <td
                colspan="3"
                class="nocopy"
              >
                <p
                  v-for="item in getAddressAndName(
                    caseInfo.caseType === '许可备案' ? '301562' : '1026',
                  )"
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
            <tr
              v-if="
                transferorSubjectFile &&
                caseInfo.transferorUploadFileLanguage == '外文'
              "
            >
              <th scope="row">转让人主体资格证明文件（英文） :</th>
              <td
                colspan="3"
                class="nocopy"
              >
                <p
                  v-for="item in getAddressAndName(
                    caseInfo.caseType === '许可备案' ? '301563' : '1027',
                  )"
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
            <tr>
              <th scope="row">转让人身份证明文件(中文) :</th>
              <td
                colspan="3"
                class="nocopy"
              >
                <p
                  v-for="item in getAddressAndName(
                    caseInfo.caseType === '许可备案' ? '301564' : '1024',
                  )"
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
            <tr v-if="caseInfo.transferorUploadFileLanguage == '外文'">
              <th scope="row">转让人身份证明原文件(外文) :</th>
              <td
                colspan="3"
                class="nocopy"
              >
                <p
                  v-for="item in getAddressAndName(
                    caseInfo.caseType === '许可备案' ? '301565' : '1025',
                  )"
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
    showTransferorInfo() {
      return !this.caseInfo.usAgency && this.caseInfo.caseType === "\u8f6c\u8ba9/\u79fb\u8f6c";
    },
    showTransferorCertCode() {
      return (
        this.showTransferorInfo &&
        this.caseInfo.transferorNationality === "\u4e2d\u56fd" &&
        this.caseInfo.transferorType !== "\u81ea\u7136\u4eba"
      );
    },
    showTransferorProvinceOrCity() {
      return (
        this.showTransferorInfo &&
        this.caseInfo.transferorNationality === "\u4e2d\u56fd"
      );
    },
    showTransferorSubjectCertType() {
      return (
        this.showTransferorInfo &&
        this.caseInfo.transferorNationality === "\u4e2d\u56fd" &&
        this.caseInfo.transferorType === "\u81ea\u7136\u4eba"
      );
    },
    transferorSubjectFile() {
      return (
        this.showTransferorInfo && this.caseInfo.transferorType !== "\u81ea\u7136\u4eba"
      );
    },
  },
  methods: {
    normalizeText(value) {
      return value ? String(value).replace(/\s+/g, "") : "";
    },
    getAddressAndName(materialTypeId) {
      if (this.caseInfo.materials) {
        return this.caseInfo.materials.filter(
          (item) => item.materialTypeId == materialTypeId,
        );
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
