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
        { title: "公司名称", value: "custAssName" },
        {
          title: "与关联公司关系",
          value: "relationship",
        },
      ],
    };
  },
  computed: {
    tableData() {
      return this.customerInfo.customerAssociates;
    },
  },
  methods: {},
  created() {},
  watch: {},
};
</script>
<template>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-4">关联公司</h4>
      <div class="table-responsive">
        <el-table
          :data="tableData"
          :fit="true"
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
