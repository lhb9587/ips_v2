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
        { title: "行业", value: "fname" },
        {
          title: "细分行业",
          value: "info",
        },
        {
          title: "行业标签",
          value: "customerTags",
        },
      ],
      maxHeight: document.documentElement.clientHeight - 204,
    };
  },
  computed: {
    tableData() {
      return this.customerInfo.customerIndustrys;
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
      <h4 class="card-title mb-4">行业</h4>
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
            <template
              #default="scope"
              v-if="col.value == 'customerTags'"
            >
              <span>{{ scope.row?.customerTags?.map(item => item.tagName).join('；') }}</span>
            </template>
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
