<template>
  <div
    v-if="showOpponentInfo"
    class="card mb-0 mt-2"
  >
    <div class="card-body">
      <h4 class="card-title mb-2">异议人信息</h4>

      <div class="table-responsive">
        <table
          class="table table-nowrap mb-0"
          style="width: 100%"
        >
          <tbody>
            <tr>
              <td
                colspan="3"
                class="nocopy"
              >
                <el-table
                  :data="opponentTableData"
                  :max-height="280"
                  :show-overflow-tooltip="true"
                >
                  <el-table-column
                    type="index"
                    label="序号"
                    width="60"
                  />
                  <el-table-column
                    :prop="col.value"
                    :label="col.title"
                    v-for="col of opponentColumns"
                    :key="col.value"
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
      opponentColumns: [
        {
          title: "中文名称",
          value: "nameCn",
        },
        {
          title: "英文名称",
          value: "nameEn",
        },
      ],
    };
  },
  computed: {
    showOpponentInfo() {
      return !this.caseInfo.usAgency && this.caseInfo.caseType === "异议答辩";
    },
    opponentTableData() {
      return Array.isArray(this.caseInfo.opponents) ? this.caseInfo.opponents : [];
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

