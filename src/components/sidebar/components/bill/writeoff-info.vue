<template>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-2">核销信息</h4>
      <div class="table-responsive">
        <el-table
          :data="props.writeOffList"
          :fit="true"
          :maxHeight="maxHeight"
          :show-overflow-tooltip="{
            effect: 'dark',
            popperClass: 'popper-item',
          }"
          ref="tableRef"
          :scrollbar-always-on="true"
        >
          <el-table-column
            :prop="col.value"
            :label="col.title"
            v-for="col of columns"
            :key="col.value"
            :width="col.width ? col.width : 'auto'"
          >
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, ref,onMounted} from "vue";
const props = defineProps({
  writeOffList: {
    type: Array,
    default: () => [],
  },
});
const tableRef = ref(null);
const columns = ref([
  { title: "支出类型", value: "payType" },
  {
    title: "费用种类",
    value: "feetStr",
  },
  {
    title: "描述",
    value: "description",
  },
  {
    title: "金额",
    value: "amountBill",
  },
  {
    title: "员工",
    value: "userName",
  },
  {
    title: "日期",
    value: "createDate",
    width: 120,
  },
  {
    title: "流程状态",
    value: "procedure",
  },
]);
const maxHeight = ref(document.documentElement.clientHeight - 204);
const handleScroll = ()=>{
  console.log('滚动了');
}
onMounted(() => {
  console.log(tableRef.value,'tableRef.value');
  if (tableRef.value instanceof Element) {
    console.log('sdfsd');
    tableRef.value.addEventListener("scroll", handleScroll);
  }
});
</script>

<style scoped lang="scss">
.infoTable {
  overflow: auto;
  height: 300px;
}
</style>
