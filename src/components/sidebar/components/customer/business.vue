<script>
export default {
  props: {
    businessList: {
      type: Array,
      default: () => [],
    },
  },
  components: {},
  data() {
    return {
      columns: [
        { title: "商机来源", value: "laiyuan" },
        {
          title: "商机日期",
          value: "sjDate",
        },
        {
          title: "领域",
          value: "domain",
        },
        {
          title: "联系人",
          value: "lxren",
        },
        {
          title: "创建日期",
          value: "createDate",
        },
        {
          title: "联系方式",
          value: "lxfs",
        },
        {
          title: "商机描述",
          value: "sjdesc",
        },
      ],
      maxHeight: document.documentElement.clientHeight - 204,
    };
  },

};
</script>
<template>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-4">关联商机</h4>
      <div class="table-responsive">
        <el-table
          :data="businessList"
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
