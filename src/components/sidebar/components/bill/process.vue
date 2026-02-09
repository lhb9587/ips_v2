<template>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-2">账单流程</h4>
      <div class="table-responsive">
        <el-table
          :data="progressData"
          :fit="true"
          :max-height="maxHeight"
          :scrollbar-always-on="true"
          :show-overflow-tooltip="true"
        >
          <el-table-column
            :prop="col.value"
            :label="col.title"
            v-for="col of columns"
            :key="col.value"
            :width="col.width ? col.width : 'auto'"
          >
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    progressData: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      columns: [
        { title: "任务名称", value: "progressName" },
        {
          title: "任务状态",
          value: "status",
        },
        {
          title: "任务人",
          value: "tasker",
        },
        {
          title: "创建时间",
          value: "createTime",
          width: 180,
        },
        {
          title: "任务执行结果",
          value: "result",
          width: 130
        },
        {
          title: "退回原因",
          value: "returnReason",
        },
      ],
      tableData: [],
      maxHeight: document.documentElement.clientHeight - 204,
    };
  },
  created() {
  },
};
</script>

<style></style>
