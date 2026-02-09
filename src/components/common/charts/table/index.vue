<script>
export default {
  props: {
    tableCol: {
      type: Array,
      default: () => [],
    },
    chartData: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {};
  },
  computed: {
    contentHeight() {
      return 300;
    },
    dataList() {
      if (this.tableCol.length > 0 && this.tableCol[0].value === "legend") {
        const list = [];
        this.chartData.forEach((yearData) => {
          yearData.datas.forEach((data) => {
            list.push({
              name: data.name,
              value: data.value,
              legend: yearData.legend,
            });
          });
        });
        return list
      } else {
        return this.chartData.length > 0 ? this.chartData[0].datas : [];
      }
    },
  },
  methods: {
    handleRowClick(params) {
      this.$emit("drillHandle", params);
    },
  },
};
</script>
<template>
  <el-table
    :data="dataList"
    :fit="true"
    :show-overflow-tooltip="true"
    :scrollbar-always-on="true"
    @row-click="handleRowClick"
    style="height: 100%; padding-top: 40px"
    :row-style="{ cursor: 'pointer' }"
  >
    <el-table-column
      :prop="col.value"
      :label="col.title"
      v-for="col of tableCol"
      :key="col.value"
      :width="col.width ? col.width : 'auto'"
      :min-width="col.minWidth ? col.minWidth : ''"
      sortable
    >
    </el-table-column>
  </el-table>
</template>
<style scoped></style>
