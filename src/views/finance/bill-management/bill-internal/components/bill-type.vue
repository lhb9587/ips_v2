<script>
export default {
  props: {
    billInfo: {
      type: Object,
      required: () => {},
    },
  },
  components: {},
  data() {
    return {
      columns: [
        { title: "序号", type: "index", width: 60 },
        {
          title: "内部账单种类",
          value: "interKindString",
        },
        {
          title: "内部账单描述",
          value: "intername",
        },
        { title: "数量", value: "number" },
        {
          title: "单价",
          value: "unitprice",
        },
        {
          title: "金额",
          value: "amount",
        },
      ],
      maxHeight: document.documentElement.clientHeight - 168,
    };
  },
  computed: {
    tableData() {
      return this.billInfo.billInternalDetailsList || [];
    },
  },
  created() {
    console.log(this.billInfo, "billInfo!!");
  },
};
</script>
<template>
  <div class="card">
    <div class="card-body">
    <h4 class="card-title mb-2">账单种类</h4>

      <el-table
        :data="tableData"
        :max-height="maxHeight"
        :fit="true"
        :show-overflow-tooltip="true"
      >
        <el-table-column
          :prop="col.value"
          :label="col.title"
          v-for="col of columns"
          :key="col.value"
          :type="col.type ? col.type : 'text'"
          :width="col.width ? col.width : 'auto'"
        />
      </el-table>
    </div>
  </div>
</template>
