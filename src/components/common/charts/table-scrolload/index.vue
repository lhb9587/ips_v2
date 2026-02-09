<script>
export default {
  emits: ["drillHandle", "loadMoreData"],
  props: {
    tableCol: {
      type: Array,
      default: () => [],
    },
    chartData: {
      type: Array,
      default: () => [],
    },
    panelId: {
      type: Number,
    },
    pageSize: {
      type: Number,
      default: 50,
    },
  },
  data() {
    return {
      busy: false,
    };
  },
  computed: {
    dataList() {
      return this.chartData;
    },
  },
  watch: {
    chartData: {
      handler(newVal, oldValue) {
        const oldlength = oldValue?.length || 0;
        const newlength = newVal?.length || 0;
        if (newlength - oldlength < this.pageSize) {
          this.busy = true;
        }
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    handleRowClick(params) {
      this.$emit("drillHandle", params);
    },
    loadMoreData() {
      this.$emit("loadMoreData");
    },
  },
};
</script>
<template>
  <el-table
    :data="dataList"
    :fit="true"
    :scrollbar-always-on="true"
    @row-click="handleRowClick"
    :show-overflow-tooltip="true"
    style="height: 100%; padding-top: 40px"
    :row-style="{ cursor: 'pointer' }"
    v-el-table-infinite-scroll="loadMoreData"
    :infinite-scroll-disabled="busy"
    infinite-scroll-distance="2"
    :infinite-scroll-immediate="false"
    header-row-class-name="table-header-custom"
  >
    <el-table-column
      :prop="col.field"
      :label="col.name"
      v-for="col of tableCol"
      :key="col.field"
      :width="col.width ? col.width : 'auto'"
      :min-width="col.minWidth ? col.minWidth : ''"
      sortable
    >
    </el-table-column>
  </el-table>
</template>
<style scoped lang="scss">
:deep(.table-header-custom th .cell) {
  display: flex;
  align-items: center;
}
</style>
