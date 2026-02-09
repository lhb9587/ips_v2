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
          title: "外语种类",
          value: "language",
        },
        {
          title: "考试种类和等级/成绩",
          value: "languageDegree",
        },
        { title: "获取时间", value: "acquireDate" },
        {
          title: "工作语言",
          value: "workingLanguage",
        },
      ],
      maxHeight: document.documentElement.clientHeight - 168,
    };
  },
  computed: {
    tableData() {
      return this.detailInfo.languages || [];
    },
  },
};
</script>
<template>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-2">外语水平</h4>

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
