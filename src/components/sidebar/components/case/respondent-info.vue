<template>
  <div
    v-if="showRespondentInfo"
    class="card mb-0 mt-2"
  >
    <div
      class="card-body"
      style="overflow-y: auto"
    >
      <h4 class="card-title mb-2">{{ respondentTitle }}</h4>

      <div class="table-responsive">
        <table class="table table-nowrap mb-0">
          <tbody>
            <tr v-if="showOpponentList">
              <th
                scope="row"
                style="width: 10%"
              >
                异议人列表 :
              </th>
              <td
                colspan="3"
                class="nocopy"
              >
                <span v-if="opponentsDisplay">{{ opponentsDisplay }}</span>
                <span v-else>-</span>
              </td>
            </tr>
            <template v-else>
              <tr>
                <th
                  scope="row"
                  style="width: 10%"
                >
                  {{ labelMap.cnname }} :
                </th>
                <td style="width: 40%">{{ normalizeText(caseInfo.respondentNameCn) }}</td>
                <th
                  scope="row"
                  style="width: 10%"
                >
                  {{ labelMap.enname }} :
                </th>
                <td style="width: 40%">{{ caseInfo.respondentNameEn }}</td>
              </tr>
              <tr v-if="showAddressRow">
                <th scope="row">{{ labelMap.cnaddr }} :</th>
                <td>{{ caseInfo.respondentAddrCn }}</td>
                <th scope="row">{{ labelMap.enaddr }} :</th>
                <td>{{ caseInfo.respondentAddrEn }}</td>
              </tr>
              <tr v-if="showAgencyRow">
                <th scope="row">{{ labelMap.dlzz }} :</th>
                <td colspan="3">{{ caseInfo.respondentAgency }}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
const SHOW_TYPE_CASES = ["异议答辩", "无效宣告申请", "无效宣告答辩"];
const EXTRA_CASES = [
  "不予注册复审",
  "无效宣告复审",
  "撤销商标复审",
  "撤销复审答辩",
  "撤三答辩（提供使用证明）",
  "撤销通用名称答辩",
  "撤销三年停止使用申请",
  "参加不予注册复审",
];

export default {
  props: {
    caseInfo: {
      type: Object,
      required: true,
    },
  },
  computed: {
    caseType() {
      return this.caseInfo.caseType || "";
    },
    showType() {
      return SHOW_TYPE_CASES.includes(this.caseType);
    },
    showRespondentInfo() {
      return !this.caseInfo.usAgency && (this.showType || EXTRA_CASES.includes(this.caseType));
    },
    showOpponentList() {
      return this.showRespondentInfo && this.caseType === "异议答辩";
    },
    respondentTitle() {
      if (this.caseType === "异议答辩") return "异议人信息";
      if (["撤三答辩（提供使用证明）", "撤销通用名称答辩"].includes(this.caseType)) {
        return "被申请人(撤销人)信息";
      }
      if (this.caseType === "撤销三年停止使用申请") return "被申请人(注册人)信息";
      if (this.caseType === "参加不予注册复审") return "被申请人(不予注册复审申请人)信息";
      return "被申请人信息";
    },
    labelMap() {
      if (this.caseType === "异议答辩") {
        return {
          cnname: "异议人中文名称",
          enname: "异议人英文名称",
          cnaddr: "异议人中文地址",
          enaddr: "异议人英文地址",
          dlzz: "异议人代理组织",
        };
      }
      if (["撤三答辩（提供使用证明）", "撤销通用名称答辩"].includes(this.caseType)) {
        return {
          cnname: "被申请人(撤销人)中文名称",
          enname: "被申请人(撤销人)英文名称",
          cnaddr: "被申请人(撤销人)中文地址",
          enaddr: "被申请人(撤销人)英文地址",
          dlzz: "被申请人(撤销人)代理组织",
        };
      }
      if (this.caseType === "撤销三年停止使用申请") {
        return {
          cnname: "被申请人(注册人)中文名称",
          enname: "被申请人(注册人)英文名称",
          cnaddr: "被申请人(注册人)中文地址",
          enaddr: "被申请人(注册人)英文地址",
          dlzz: "被申请人(注册人)代理组织",
        };
      }
      if (this.caseType === "参加不予注册复审") {
        return {
          cnname: "被申请人(不予注册复审申请人)中文名称",
          enname: "被申请人(不予注册复审申请人)英文名称",
          cnaddr: "被申请人(不予注册复审申请人)中文地址",
          enaddr: "被申请人(不予注册复审申请人)英文地址",
          dlzz: "被申请人(不予注册复审申请人)代理组织",
        };
      }
      return {
        cnname: "被申请人中文名称",
        enname: "被申请人英文名称",
        cnaddr: "被申请人中文地址",
        enaddr: "被申请人英文地址",
        dlzz: "被申请人代理组织",
      };
    },
    showAddressRow() {
      return !this.showOpponentList && !!this.labelMap.cnaddr;
    },
    showAgencyRow() {
      return !this.showOpponentList && !!this.labelMap.dlzz;
    },
    opponentsDisplay() {
      const opponents = this.caseInfo.opponents;
      if (!opponents) return "";
      if (Array.isArray(opponents)) {
        return opponents
          .map((item) => {
            if (typeof item === "string") return item;
            if (!item || typeof item !== "object") return "";
            return (
              item.name ||
              item.opponentName ||
              item.respondentNameCn ||
              item.cnName ||
              item.enName ||
              ""
            );
          })
          .filter(Boolean)
          .join("，");
      }
      if (typeof opponents === "string") return opponents;
      return "";
    },
  },
  methods: {
    normalizeText(value) {
      return value ? String(value).replace(/\s+/g, "") : "";
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

