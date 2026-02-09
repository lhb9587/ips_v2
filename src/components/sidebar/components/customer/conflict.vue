<script>
export default {
  props: {
    customerInfo: {
      type: Object,
      default: () => {},
    },
  },
  components: {},
  data() {
    return {
      columns: [
        { title: "利益冲突者名称", value: "fullname" },
        {
          title: "英文名称",
          value: "fullnameEn",
        },
        {
          title: "备注",
          value: "memo",
        },
      ],
      maxHeight: document.documentElement.clientHeight - 204,
    };
  },
  computed: {
    tableData() {
      return this.customerInfo.conflicters;
    },
  },
};
</script>
<template>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-4">利益冲突</h4>
      <div class="table-responsive">
        <el-table
          :data="tableData"
          :fit="true"
          :max-height="maxHeight"
        >
          <el-table-column
            :prop="col.value"
            :label="col.title"
            v-for="col of columns"
            :key="col.value"
          >
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.modal-dialog {
  max-width: 600px !important;
}
</style>
