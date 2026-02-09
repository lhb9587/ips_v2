<template>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-2">发明人信息</h4>
      <el-table
        :data="inventorList"
        :max-height="300"
        :show-overflow-tooltip="true"
        :scrollbar-always-on="true"
      >
        <el-table-column
          :prop="col.value"
          :label="col.title"
          v-for="col of InventorColumns"
          :key="col.value"
          :type="col.type ? col.type : 'text'"
          :width="col.width ? col.width : 'auto'"
        >
          <template #default="scope">
            <span v-if="col.value == 'notOpenSign'">
              {{ scope.row.notOpenSign ? "是" : "否" }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>

export default {
  props: {
    inventorList: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      InventorColumns: [
        {
          title: "序号",
          type: "index",
          width: "60",
        },
        {
          title: "中文名称",
          value: "inventorCtitle",
        },
        {
          title: "英文名称",
          value: "inventorEtitle",
        },
        {
          title: "日文名称",
          value: "inventorJtitle",
        },
        {
          title: "证件号",
          value: "inventorIdno",
        },
        {
          title: "不公开标志",
          value: "notOpenSign",
        },
        {
          title: "国籍",
          value: "inventorCountryStr",
        },
      ],
    };
  },
};
</script>

<style></style>
