<!-- 假期额度维护子页面，展示额度日志信息分页列表。 -->
<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import dayjs from "dayjs";
import Layout from "@/layouts/main";
import GridView from "@/components/common/grid-table/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import { queryLeaveQuotaLedgerPage } from "@/api/attendance";

const route = useRoute();
const router = useRouter();
const store = useStore();

const gridName = "leaveQuotaLedgerGrid";
const TEXT_BACK = "返回";
const TEXT_SEARCH_PLACEHOLDER = "请输入员工姓名";
const LEDGER_COLUMN_LABELS = {
  sid: "序号",
  quotaAccountId: "额度ID",
  leaveTypeName: "假期类型",
  bizNo: "单据编码",
  talentName: "姓名",
  changeFieldName: "修改字段名",
  fieldOldValue: "字段旧值",
  fieldNewValue: "字段新值",
  beforeRemainQuota: "剩余额度旧值",
  afterRemainQuota: "剩余额度新值",
  operateByName: "操作人",
  operateTime: "操作时间",
  description: "描述",
};
const DEFAULT_COLUMNS = [
  { title: LEDGER_COLUMN_LABELS.sid, value: "sid", width: 70, minWidth: 70, maxWidth: 90 },
  { title: LEDGER_COLUMN_LABELS.quotaAccountId, value: "quotaAccountId", minWidth: 120 },
  { title: LEDGER_COLUMN_LABELS.leaveTypeName, value: "leaveTypeName", minWidth: 120 },
  { title: LEDGER_COLUMN_LABELS.bizNo, value: "bizNo", minWidth: 180 },
  { title: LEDGER_COLUMN_LABELS.talentName, value: "talentName", minWidth: 120 },
  { title: LEDGER_COLUMN_LABELS.changeFieldName, value: "changeFieldName", minWidth: 140 },
  { title: LEDGER_COLUMN_LABELS.fieldOldValue, value: "fieldOldValue", minWidth: 120 },
  { title: LEDGER_COLUMN_LABELS.fieldNewValue, value: "fieldNewValue", minWidth: 120 },
  { title: LEDGER_COLUMN_LABELS.beforeRemainQuota, value: "beforeRemainQuota", minWidth: 140 },
  { title: LEDGER_COLUMN_LABELS.afterRemainQuota, value: "afterRemainQuota", minWidth: 140 },
  { title: LEDGER_COLUMN_LABELS.operateByName, value: "operateByName", minWidth: 120 },
  { title: LEDGER_COLUMN_LABELS.operateTime, value: "operateTime", minWidth: 180 },
  { title: LEDGER_COLUMN_LABELS.description, value: "description", minWidth: 220 },
];

const gridHeight = ref(0);
const columnList = ref([...DEFAULT_COLUMNS]);
const rowHeight = ref(40);
const diminput = ref("");
const loading = ref(false);
const ledgerList = ref([]);
const total = ref(0);

const calculateGridHeight = () => {
  const windowHeight = document.documentElement.clientHeight;
  if (store.state.layout.embedMode) {
    return windowHeight - 135;
  }
  const layout = store.state.layout.layoutType;
  if (layout === "vertical") {
    return windowHeight - 235;
  }
  return windowHeight - 290;
};

gridHeight.value = calculateGridHeight();

watch(
  () => [store.state.layout.layoutType, store.state.layout.embedMode],
  () => {
    gridHeight.value = calculateGridHeight();
  },
);

const fetchLocalPageSize = () => {
  const pageSizeData = JSON.parse(localStorage.getItem("pageSize")) || [];
  const savedData = pageSizeData.find((item) => item.name === route.name);
  const pageSize = savedData ? savedData.pageSize : 50;
  return pageSize;
};

const listQuery = ref({
  pageNo: 1,
  pageSize: fetchLocalPageSize(),
});
const pageSizesList = ref([10, 20, 50, 100]);

const formatDisplayValue = (value) => {
  return value || value === 0 ? value : "-";
};

const formatOperateTime = (value) => {
  if (!value) {
    return "-";
  }
  const dateValue = dayjs(value);
  if (!dateValue.isValid()) {
    return formatDisplayValue(value);
  }
  return dateValue.format("YYYY-MM-DD hh:mm:ss");
};

const cellRenderer = (params) => {
  const value = params.value || params.value === 0 ? params.value : "";
  return `<span title="${value}">${value}</span>`;
};

const mapLedgerRecord = (item, index) => {
  return {
    ...item,
    sid: (listQuery.value.pageNo - 1) * listQuery.value.pageSize + index,
    quotaAccountId: formatDisplayValue(item.quotaAccountId),
    leaveTypeName: formatDisplayValue(item.leaveTypeName),
    bizNo: formatDisplayValue(item.bizNo),
    talentName: formatDisplayValue(item.talentName),
    changeFieldName: formatDisplayValue(item.changeSubType || item.changeType),
    fieldOldValue: formatDisplayValue(item.beforeActualQuota),
    fieldNewValue: formatDisplayValue(item.afterActualQuota),
    beforeRemainQuota: formatDisplayValue(item.beforeRemainQuota),
    afterRemainQuota: formatDisplayValue(item.afterRemainQuota),
    operateByName: formatDisplayValue(item.operateByName),
    operateTime: formatOperateTime(item.operateTime),
    description: formatDisplayValue(item.changeReason),
  };
};

const fetchLedgerList = () => {
  loading.value = true;
  queryLeaveQuotaLedgerPage(
    {
      pageNo: listQuery.value.pageNo,
      pageSize: listQuery.value.pageSize,
      talentName: diminput.value || undefined,
    },
    {
      isLoading: false,
    },
  )
    .then((res) => {
      const records = Array.isArray(res?.data) ? res.data : res?.data?.records || [];
      ledgerList.value = records.map((item, index) => mapLedgerRecord(item, index));
      total.value = Number(res?.total || 0);
    })
    .catch(() => {
      ledgerList.value = [];
      total.value = 0;
    })
    .finally(() => {
      loading.value = false;
    });
};

const handlePagination = () => {
  fetchLedgerList();
};

const fuzzySearch = () => {
  listQuery.value.pageNo = 1;
  fetchLedgerList();
};

const goBack = () => {
  router.push({
    name: "leave-quota-management",
  });
};

onMounted(() => {
  fetchLedgerList();
});
</script>

<template>
  <Layout>
    <div class="row">
      <div class="col-lg-12">
        <div class="card box" style="margin-bottom: 0;">
          <div
            class="card-body"
            style="padding-bottom: 10px"
          >
            <div class="d-flex align-items-center justify-content-between">
              <div class="d-flex gap-2">
                <el-input
                  v-model="diminput"
                  style="width: 200px"
                  :placeholder="TEXT_SEARCH_PLACEHOLDER"
                  clearable
                  class="top-search"
                  @clear="fuzzySearch"
                  @keyup.enter="fuzzySearch"
                >
                  <template #prepend>
                    <el-button @click="fuzzySearch">
                      <i class="bx bx-search-alt"></i>
                    </el-button>
                  </template>
                </el-input>
              </div>
              <el-button
                plain
                @click="goBack"
              >
                {{ TEXT_BACK }}
              </el-button>
            </div>
          </div>

          <div style="padding: 0 10px">
            <GridView
              :gridName="gridName"
              :height="gridHeight"
              :rowHeight="rowHeight"
              :columnDefs="columnList"
              :grid-data="ledgerList"
              :cellRenderer="cellRenderer"
              :isLoading="loading"
            />
          </div>

          <div
            v-if="total > 0"
            class="card-body border-bottom ledger-page__pagination"
          >
            <Pagination
              :total="total"
              v-model:page="listQuery.pageNo"
              v-model:limit="listQuery.pageSize"
              :pageSizes="pageSizesList"
              :storage="false"
              storageName="leaveQuotaLedgerPage"
              @pagination="handlePagination"
            />
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
.ledger-page__pagination {
  padding-top: 10px;
}
</style>
