<template>
  <div
    v-if="showInvalidationApply"
    class="card mb-0 mt-2"
  >
    <div class="card-body">
      <h4 class="card-title mb-2">法律条款和事实理由</h4>

      <div class="table-responsive">
        <table
          class="table table-nowrap mb-0"
          style="width: 100%"
        >
          <tbody>
            <tr>
              <th scope="row" style="width: 10%;">请求驰名商标保护 :</th>
              <td style="width: 30%;">{{ yesNoDisplay(caseInfo.chiming) }}</td>
              <th scope="row" style="width: 10%;">之后是否交补充材料 :</th>
              <td style="width: 30%;">{{ yesNoDisplay(caseInfo.supplement) }}</td>
            </tr>
            <tr>
              <th scope="row">申请书标注 :</th>
              <td colspan="3">{{ caseInfo.applicationMarks }}</td>
            </tr>
            <tr>
              <th scope="row">仅涉及绝对理由 :</th>
              <td>{{ yesNoDisplay(caseInfo.absoluteReason) }}</td>
              <th scope="row">同意通讯地址延及本案后续程序 :</th>
              <td>{{ yesNoDisplay(caseInfo.empowerAddrCase) }}</td>
            </tr>
            <tr>
              <th scope="row">法律条款 :</th>
              <td colspan="3">{{ caseInfo.lawList }}</td>
            </tr>
            <tr>
              <th scope="row">事实理由 :</th>
              <td
                colspan="3"
                class="nocopy"
              >
                <p
                  v-for="item in getAddressAndName('327')"
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
              <th scope="row">证据目录 :</th>
              <td
                colspan="3"
                class="nocopy"
              >
                <p
                  v-for="item in getAddressAndName('326')"
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
              <th scope="row">证据内容 :</th>
              <td
                colspan="3"
                class="nocopy"
              >
                <p
                  v-for="item in getAddressAndName('300012')"
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
              <th scope="row">有关说明文件 :</th>
              <td
                colspan="3"
                class="nocopy"
              >
                <p
                  v-for="item in getAddressAndName('1020')"
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
              <th scope="row">正副本是否一致 :</th>
              <td colspan="3">{{ yesNoDisplay(caseInfo.justNegativeAgre) }}</td>
            </tr>
            <tr v-if="!caseInfo.justNegativeAgre">
              <th scope="row">涉密证据材料 :</th>
              <td
                colspan="3"
                class="nocopy"
              >
                <p
                  v-for="item in getAddressAndName('301677')"
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
    showInvalidationApply() {
      return !this.caseInfo.usAgency && this.caseInfo.caseType === "无效宣告申请";
    },
  },
  methods: {
    yesNoDisplay(value) {
      if (value === true || value === 1 || value === "1" || value === "是")
        return "是";
      if (value === false || value === 0 || value === "0" || value === "否")
        return "否";
      return value || "-";
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
