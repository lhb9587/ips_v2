<!-- 调班单列表页，展示排班调班历史记录并支持按条件分页查询。 -->
<script setup>
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import Layout from "@/layouts/main";
import GridView from "@/components/common/grid-table/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import { queryScheduleSwapPage } from "@/api/attendance";

const route = useRoute();
const store = useStore();

const gridName = "scheduleSwapListGrid";
const DATE_TYPE_MAP = {
  workday: "工作日",
  restday: "休息日",
  holiday: "节假日",
};
const DEFAULT_COLUMNS = [
  { title: "序号", value: "sid", width: 70, minWidth: 70, maxWidth: 90 },
  { title: "员工编码", value: "sourceTalentCode", minWidth: 110 },
  { title: "姓名", value: "sourceTalentName", minWidth: 100 },
  { title: "考勤日期", value: "sourceScheduleDate", minWidth: 120 },
  { title: "日期类型", value: "sourceDateTypeLabel", minWidth: 110 },
  { title: "是否在考勤日期生成休息日排班", value: "sourceGenerateRestScheduleLabel", minWidth: 220 },
  { title: "员工编码", value: "targetTalentCode", minWidth: 110 },
  { title: "姓名", value: "targetTalentName", minWidth: 100 },
  { title: "考勤日期", value: "targetScheduleDate", minWidth: 120 },
  { title: "日期类型", value: "targetDateTypeLabel", minWidth: 110 },
  { title: "是否在考勤日期生成休息日排班", value: "targetGenerateRestScheduleLabel", minWidth: 220 },
  { title: "备注", value: "reason", minWidth: 200 },
  { title: "操作人", value: "operatorName", minWidth: 100 },
  { title: "操作时间", value: "operateTime", minWidth: 170 },
];

const columnList = ref([...DEFAULT_COLUMNS]);
const rowHeight = ref(40);
const diminput = ref("");
const total = ref(0);
const gridData = ref([]);

const calculateGridHeight = () => {
  const layout = store.state.layout.layoutType;
  const windowHeight = document.documentElement.clientHeight;
  if (layout === "vertical") {
    return windowHeight - 244;
  }
  return windowHeight - 290;
};

const gridHeight = ref(calculateGridHeight());

watch(
  () => store.state.layout.layoutType,
  () => {
    gridHeight.value = calculateGridHeight();
  },
);

const fetchLocalPageSize = () => {
  const pageSizeData = JSON.parse(localStorage.getItem("pageSize")) || [];
  const savedData = pageSizeData.find((item) => item.name === route.name);
  const pageSize = savedData ? savedData.pageSize : 10;
  return Math.min(pageSize, 100);
};

const listQuery = ref({
  pageNo: 1,
  pageSize: fetchLocalPageSize(),
});
const pageSizesList = ref([10, 20, 50, 100]);

const normalizeDateType = (value) => DATE_TYPE_MAP[value] || value || "-";

const normalizeRestScheduleLabel = (item = {}) => {
  if (typeof item.generateRestSchedule === "boolean") {
    return item.generateRestSchedule ? "是" : "否";
  }
  if (typeof item.isGenerateRestSchedule === "boolean") {
    return item.isGenerateRestSchedule ? "是" : "否";
  }
  if (typeof item.generatedRestSchedule === "boolean") {
    return item.generatedRestSchedule ? "是" : "否";
  }
  return "-";
};

const mapSwapRecord = (item = {}, index = 0) => ({
  ...item,
  id:
    item.swapHistoryId ||
    `${item.sourceScheduleDayId || ""}_${item.targetScheduleDayId || ""}_${index}`,
  sourceTalentCode: item.sourceTalentCode || "-",
  sourceTalentName: item.sourceTalentName || "-",
  sourceScheduleDate: item.sourceScheduleDate || "-",
  sourceDateTypeLabel: normalizeDateType(
    item.sourceDateType || item.sourceScheduleDateType || item.sourceDateTypeName,
  ),
  targetTalentCode: item.targetTalentCode || "-",
  targetTalentName: item.targetTalentName || "-",
  targetScheduleDate: item.targetScheduleDate || "-",
  targetDateTypeLabel: normalizeDateType(
    item.targetDateType || item.targetScheduleDateType || item.targetDateTypeName,
  ),
  sourceGenerateRestScheduleLabel: normalizeRestScheduleLabel(item),
  targetGenerateRestScheduleLabel: normalizeRestScheduleLabel(item),
  reason: item.reason || "-",
  operatorName: item.operatorName || "-",
  operateTime: item.operateTime || "-",
});

const fetchScheduleSwapList = () => {
  queryScheduleSwapPage(
    {
      pageNo: listQuery.value.pageNo,
      pageSize: Math.min(listQuery.value.pageSize, 100),
      talentCode: diminput.value || undefined,
      talentName: undefined,
    },
    {
      isLoading: true,
    },
  )
    .then((res) => {
      const records = Array.isArray(res?.data) ? res.data : res?.data?.records || [];
      gridData.value = records.map((item, index) => ({
        ...mapSwapRecord(item, index),
        sid: (listQuery.value.pageNo - 1) * listQuery.value.pageSize + index,
      }));
      total.value = Number(res?.total) || Number(res?.data?.total) || 0;
    })
    .catch(() => {
      gridData.value = [];
      total.value = 0;
    });
};

const fuzzySearch = () => {
  listQuery.value.pageNo = 1;
  fetchScheduleSwapList();
};

const handlePagination = () => {
  fetchScheduleSwapList();
};

onMounted(() => {
  fetchScheduleSwapList();
});

onUnmounted(() => {
});
</script>

<template>
  <Layout>
    <div class="row">
      <div class="col-lg-12">
        <div class="card box">
          <div
            class="card-body"
            style="padding-bottom: 10px"
          >
            <div class="d-flex align-items-center">
              <div class="d-flex gap-2">
                <el-input
                  v-model="diminput"
                  style="width: 200px"
                  placeholder="搜索员工编码..."
                  clearable
                  class="top-search"
                  @keyup.enter="fuzzySearch"
                >
                  <template #prepend>
                    <el-button @click="fuzzySearch">
                      <i class="bx bx-search-alt"></i>
                    </el-button>
                  </template>
                </el-input>
              </div>
            </div>
          </div>
          <div style="padding: 0 10px">
            <GridView
              :gridName="gridName"
              :height="gridHeight"
              :rowHeight="rowHeight"
              :columnDefs="columnList"
              :grid-data="gridData"
            />
          </div>
          <div
            v-if="total > 0"
            class="card-body border-bottom"
            style="padding-top: 10px"
          >
            <Pagination
              :total="total"
              v-model:page="listQuery.pageNo"
              v-model:limit="listQuery.pageSize"
              :pageSizes="pageSizesList"
              @pagination="handlePagination"
            ></Pagination>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<style scoped lang="scss">
.card-body {
  flex: none;
}

</style>
