<template>
  <div
    v-if="showBaseRegisterInfo"
    class="card mb-0 mt-2"
  >
    <div class="card-body">
      <h4 class="card-title mb-2">基础注册信息</h4>

      <div class="table-responsive">
        <table
          class="table table-nowrap mb-0"
          style="width: 100%"
        >
          <tbody>
            <tr>
              <td
                colspan="4"
                class="nocopy"
              >
                <el-table
                  :data="baseRegisterTableData"
                  :max-height="280"
                  :show-overflow-tooltip="true"
                >
                  <el-table-column
                    type="index"
                    label="序号"
                    width="60"
                  />
                  <el-table-column
                    v-for="col of baseRegisterColumns"
                    :key="col.value"
                    :prop="col.value"
                    :label="col.title"
                  />
                </el-table>
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
  data() {
    return {
      baseRegisterColumns: [
        {
          title: "基础注册/申请号",
          value: "regNumber",
        },
        {
          title: "基础注册/申请日",
          value: "regDate",
        },
      ],
    };
  },
  computed: {
    isForeignDirection() {
      return ["内-外", "外-外"].includes(this.caseInfo.appFromto);
    },
    isMadridRegister() {
      return this.caseInfo.madrid === true || this.caseInfo.madrid === 1 || this.caseInfo.madrid === "1";
    },
    showBaseRegisterInfo() {
      return (
        !this.caseInfo.usAgency &&
        this.isForeignDirection &&
        this.isMadridRegister &&
        this.caseInfo.caseType !== "出具优先权证明文件"
      );
    },
    baseRegisterTableData() {
      return Array.isArray(this.caseInfo.trademarkCaseBasicinfos)
        ? this.caseInfo.trademarkCaseBasicinfos
        : [];
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
