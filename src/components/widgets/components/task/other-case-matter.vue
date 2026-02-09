<script>
import { queryAlltask } from "@/api/caseList";
import GridView from "@/components/common/grid-table/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import { mapState } from "vuex";
export default {
  props: {
    tableHeight:{
      type: Number,
    }
  },
  components: {
    GridView,
    Pagination
  },
  data() {
    return {
      columnList: [
        { title: "案件文号", value: "agentNum" },
        {
          title: "案件类型",
          value: "caseType",
        },
        {
          title: "案件名称",
          value: "caseName",
        },
        {
          title: "客户",
          value: "custName",
        },
        {
          title: "申请人",
          value: "appCnName",
        },
        {
          title: "案件阶段",
          value: "caseEvolve",
        },
      ],
      gridData: [],
      total: 0,
      listQuery: {
        pageNo: 1,
        pageSize: 10,
      },
      pageSizesList: [10, 50, 100, 500],
    };
  },
  computed: {
    ...mapState({
      userId: (state) => state.user.userId,
    }),
  },
  watch: {},
  methods: {
    fetchTaskData() {
      const data = {
        ...this.listQuery,
        userId: this.userId,
        taskType: 3,
      };
      queryAlltask(data).then((res) => {
        this.gridData = res.data || [];
        this.total = res.total || 0;
      });
    },
    cellRenderer(params) {
      //   if (params.colDef.field == "operate") {
      //     const clikView = (data) => {
      //       console.log(data, "data");
      //     };
      //     window.clikView = clikView;
      //     return `<button class="btn btn-soft-primary btn-sm btn-rounded" onclick="clikView(${params.data})">处理</button>`;
      //   }
      return `<span title="${params.value}">${
        params.value || params.value === 0 ? params.value : ""
      }</span>`;
    },
  },
  created() {
    this.fetchTaskData();
  },
};
</script>
<template>
  <GridView
    gridName="otherCaseMatter"
    :height="tableHeight"
    :rowHeight="40"
    :columnDefs="columnList"
    :gridData="gridData"
    :cellRenderer="cellRenderer"
    rowSelection="singleRow"
  />
  <div
    class="mt-3"
    v-if="total"
  >
    <Pagination
      :total="total"
      v-model:page="listQuery.pageNo"
      v-model:limit="listQuery.pageSize"
      @pagination="fetchTaskData"
      :pageSizes="pageSizesList"
    ></Pagination>
  </div>
</template>
