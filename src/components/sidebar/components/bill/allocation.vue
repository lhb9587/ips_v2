<template>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-2">账单分配</h4>
      <div class="table-responsive">
        <el-table
          :data="billAllocations"
          :fit="true"
          :max-height="maxHeight"
          :show-overflow-tooltip="true"
        >
          <el-table-column
            :prop="col.value"
            :label="col.title"
            v-for="col of columns"
            :key="col.value"
            :width="col.width ? col.width : 'auto'"
          >
            <template #default="scope">
              <span v-if="col.value == 'allomoney'">{{
                formatAmount(scope.row[col.value])
              }}</span>
              <span v-else>{{ scope.row[col.value] }}</span>
            </template>
          </el-table-column>
        </el-table>
        <table
          class="table table-nowrap mb-0"
          style="width: 100%"
        >
          <tbody>
            <tr>
              <th
                scope="row"
                style="width: 15%"
              >
                实际成本（费用+内帐） :
              </th>
              <td
                colspan="3"
                style="width: 85%"
              >
                {{ formatAmount(billInfo.actualCost) }}
              </td>
            </tr>
            <tr>
              <th
                scope="row"
                style="width: 15%"
              >
                可分配（总金额-成本） :
              </th>
              <td
                colspan="3"
                style="width: 85%"
              >
                {{ formatAmount(billInfo.allocationMoney) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { formatAmount } from "@/utils";
export default {
  props: {
    billInfo: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      columns: [
        { title: "工作组类型", value: "groupType" },
        {
          title: "工作组",
          value: "groupName",
        },
        {
          title: "分配比例",
          value: "alloratio",
        },
        {
          title: "分配金额",
          value: "allomoney",
        },
        {
          title: "审批人",
          value: "approvaluseridString",
        },
        {
          title: "备注",
          value: "memo",
        },
      ],
      tableData: [],
      maxHeight: document.documentElement.clientHeight - 204,
    };
  },
  computed: {
    billAllocations() {
      return this.billInfo.billAllocations || [];
    },
  },
  methods: {
    formatAmount,
  },
  created() {
  },
};
</script>

<style></style>
