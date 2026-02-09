<template>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-2">要求优先权</h4>
      <el-table
        :data="priorityClaimList"
        :max-height="300"
        :show-overflow-tooltip="true"
        :scrollbar-always-on="true"
      >
        <el-table-column
          :prop="col.value"
          :label="col.title"
          v-for="col of priorityClaimColumns"
          :key="col.value"
          :type="col.type ? col.type : 'text'"
          :width="col.width ? col.width : 'auto'"
        >
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    priorityClaimList: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      priorityClaimColumns: [
        {
          title: "序号",
          type: "index",
          width: "60",
        },
        {
          title: "在先申请国",
          value: "priorityBaseCrty",
        },
        {
          title: "在先申请号",
          value: "priorityAppNum",
        },
        {
          title: "在先申请日",
          value: "priorityAppDate",
        },
        {
          title: "DAS接入号",
          value: "dasNo",
        },
        {
          title: "出证日",
          value: "makeDate",
        },
      ],
    };
  },
};
</script>

<style></style>
