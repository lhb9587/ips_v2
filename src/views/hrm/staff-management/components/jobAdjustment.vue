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
          title: "调整类型",
          value: "adjustStatus",
          width: 100
        },
        {
          title: "部门",
          value: "deptName",
        },
        { title: "大组", value: "superGroup" },
        {
          title: "工作组",
          value: "groupName",
        },
        {
          title: "调整前岗位",
          value: "oldPosName",
        },
        {
          title: "调整后岗位",
          value: "posName",
        },
        {
          title: "任职类型",
          value: "mainOfficial",
          width: 100
        },
        {
          title: "生效日期",
          value: "adjustDate",
          width: 120
        },
      ],
      maxHeight: document.documentElement.clientHeight - 168,
    };
  },
  computed: {
    tableData() {
      return this.detailInfo.positionAdjusts || [];
    },
  },
};
</script>
<template>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-2">岗位调整</h4>

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
        >
          <template #default="scope">
            <span v-if="col.value == 'mainOfficial'">{{
              scope.row[col.value] == 1?'主要任职':'次要任职'
            }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
