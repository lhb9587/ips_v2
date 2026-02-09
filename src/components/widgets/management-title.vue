<script>
import { workbenchComputed } from "@/state/helpers";
import { downLoad } from "@/utils";
import { deriveSYTable,deriveDJDTable } from "@/api/dashboard";
export default {
  name: "managementTitle",
  computed: {
    ...workbenchComputed,
  },
  props: {
    groupName: {
      type: String,
      default: "经营状况",
    },
  },
  data() {
    return {
      options: [
        {
          label: "财务审核前",
          value: 0,
        },
        {
          label: "财务审核后",
          value: 1,
        },
      ],
      statusOptions: [
        {
          label: "调整前",
          value: 0,
        },
        {
          label: "调整后",
          value: 1,
        },
      ],
      excelLoading:false
    };
  },
  methods: {
    changeToExamineValue(value) {
      this.$store.commit("workbench/CHANGE_TOEXAMINE", value);
    },
    changeStatusValue(value) {
      this.$store.commit("workbench/CHANGE_STATUS", value);
    },
    handleDownload() {
      deriveSYTable().then((res) => {
        console.log(res.data);
        if (res.data) {
          const name = res.data?.split("/")[res.data?.split("/").length - 1];
          console.log(name, "name");
          downLoad(`/${res.data}`, name);
        }
      });
    },
    handleExcel(){
      this.excelLoading = true;
      const params  = {
        belongToDate:['2025-03-01','2025-03-31']
      }
      deriveDJDTable(params).then((res)=>{
        if (res.data) {
          // 打开新窗口
          window.open(
            `/v2/excel_preview?url=ipdoc/${res.data}`,
            "_blank"
          );
        }
        this.excelLoading = false;
      })
    }
  },
};
</script>
<template>
  <div class="d-flex align-center h-100">
    <div class="cpn-title">{{ groupName }}</div>
    <div
      class="d-flex cpn-filter"
      v-if="groupName !== '人力资源'"
    >
      <div class="cpn-filter-item" v-if="hasFinanceAuditOnTop">
        <span class="cpn-filter-label">财务审核：</span>
        <el-select
          v-model="toExamineValue"
          size="small"
          style="width: 100px"
          @change="changeToExamineValue"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <div class="cpn-filter-item" v-if="hasAdjustStatusOnTop">
        <span class="cpn-filter-label">调整状态：</span>
        <el-select
          v-model="statusValue"
          size="small"
          style="width: 100px"
          @change="changeStatusValue"
        >
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <div class="cpn-down-item" v-if="groupName == '经营状况'">
        <el-button
          type="primary"
          size="small"
          @click="handleDownload"
          >下载损益表</el-button
        >
        <!-- <el-button
          type="primary"
          size="small"
          @click="handleExcel"
          :loading="excelLoading"
          >Excel预览</el-button
        > -->
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.cpn-title {
  font-size: 16px;
  font-weight: bold;
  white-space: nowrap;
}
.cpn-filter {
  margin-left: 10px;
  gap: 20px;
  .cpn-filter-item {
    gap: 8px;
    .cpn-filter-label {
      font-size: 12px;
      color: #7f7f7f;
    }
  }
}
@media (max-width: 400px) {
  .cpn-down-item {
    display: none;
  }
}
</style>
