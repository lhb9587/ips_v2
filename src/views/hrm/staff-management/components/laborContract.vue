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
          title: "劳动合同主体",
          value: "contractOwner",
          minWidth: 130,
        },
        {
          title: "合同编码",
          value: "serialNumber",
        },
        { title: "合同期限类型", value: "contractType", width: 150 },
        {
          title: "合同期限（年）",
          value: "contractLimit",
          width: 130,
        },
        {
          title: "生效日期",
          value: "takeEffectDate",
          width: 120,
        },
        {
          title: "终止日期",
          value: "terminalDate",
          width: 120,
        },
        {
          title: "解除日期",
          value: "relieveDate",
          width: 120,
        },
      ],
      maxHeight: document.documentElement.clientHeight - 168,
    };
  },
  computed: {
    tableData() {
      return this.detailInfo.laborContracts || [];
    },
  },
};
</script>
<template>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-2">劳动合同</h4>

      <el-table
        :data="tableData"
        :max-height="maxHeight"
        :fit="true"
        :show-overflow-tooltip="true"
        :scrollbar-always-on="true"
      >
        <el-table-column
          :prop="col.value"
          :label="col.title"
          v-for="col of columns"
          :key="col.value"
          :type="col.type || 'text'"
          :width="col.width || 'auto'"
          :min-width="col.minWidth || ''"
        />
      </el-table>
    </div>
  </div>
</template>
