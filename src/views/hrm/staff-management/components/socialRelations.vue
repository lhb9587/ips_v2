<script>
export default {
  props: {
    detailInfo: {
      type: Object,
      required: () => {},
    },
  },
  components: {},
  data() {
    return {
      columns: [
        {
          title: "关系类型",
          value: "relationType",
        },
        {
          title: "姓名",
          value: "relationName",
        },
        { title: "工作/学习单位", value: "relationOccupation" },
        {
          title: "职务/身份",
          value: "relationJob",
        },
        {
          title: "联系电话",
          value: "relationPhone",
        },
      ],
      maxHeight: document.documentElement.clientHeight - 168,
    };
  },
  computed: {
    tableData() {
      return this.detailInfo.socialRelations || [];
    },
  },
};
</script>
<template>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-2">社会关系</h4>

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
