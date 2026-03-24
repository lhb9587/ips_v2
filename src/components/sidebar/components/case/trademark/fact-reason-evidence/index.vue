<template>
  <div
    v-if="showFactReasonEvidence"
    class="card mb-0 mt-2"
  >
    <div class="card-body">
      <h4 class="card-title mb-2">事实理由和证据</h4>

      <div class="table-responsive">
        <table
          class="table table-nowrap mb-0 fact-reason-evidence-table"
          style="width: 100%"
        >
          <tbody>
            <tr v-if="showIntlRejectReview">
              <th scope="row">阐述事实与理由 :</th>
              <td colspan="3">{{ caseInfo.applicationMarks }}</td>
            </tr>
            <tr v-if="showIntlDelay">
              <th scope="row" style="width: 10%">是否延期 :</th>
              <td style="width: 30%;">{{ caseInfo.delay ? "是" : "否" }}</td>
              <th scope="row" style="width: 10%">之后是否交补充材料 :</th>
              <td style="width: 30%;">{{ caseInfo.supplement ? "是" : "否" }}</td>
            </tr>
            <tr v-else-if="showIntlRejectReview">
              <th scope="row">之后是否交补充材料 :</th>
              <td colspan="3">{{ caseInfo.supplement ? "是" : "否" }}</td>
            </tr>
            <tr v-if="showIntlRejectReview">
              <th scope="row">是否分割 :</th>
              <td>{{ caseInfo.isDivision == 1 ? "是" : "否" }}</td>
              <th scope="row">分割申请书 :</th>
              <td
                class="nocopy"
              >
                <p
                  v-for="item in getAddressAndName('301535')"
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
            <tr v-if="showIntlRejectReview">
              <th scope="row">事实与理由 :</th>
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
            <tr v-if="showIntlRejectReview">
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
            <tr v-if="showIntlRejectReview">
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
            <tr v-if="showIntlRejectReview">
              <th scope="row">送达证据 :</th>
              <td
                colspan="3"
                class="nocopy"
              >
                <p
                  v-for="item in getAddressAndName('300013')"
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
            <tr v-if="showIntlRejectReview">
              <th scope="row">评审网申国际商标需上传材料 :</th>
              <td
                colspan="3"
                class="nocopy"
              >
                <p
                  v-for="item in getAddressAndName('301600')"
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
    showIntlRejectReview() {
      return (
        !this.caseInfo.usAgency &&
        ["国际注册驳回复审", "注册驳回复审"].includes(this.caseInfo.caseType)
      );
    },
    showIntlDelay() {
      return (
        !this.caseInfo.usAgency && this.caseInfo.caseType === "国际注册驳回复审"
      );
    },
    showFactReasonEvidence() {
      return this.showIntlRejectReview;
    },
  },
  methods: {
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

<style scoped>
.fact-reason-evidence-table th {
  width: 10%;
}

.fact-reason-evidence-table td {
  width: 30%;
}
</style>
