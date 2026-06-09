<!-- 补签卡缺卡检查页：按组织、姓名、日期范围分页查询缺卡时间点。 -->
<script setup>
import dayjs from "dayjs";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import Layout from "@/layouts/main";
import GridView from "@/components/common/grid-table/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import { querySupplementMissingCheckPage } from "@/api/attendance";

const route = useRoute();
const router = useRouter();
const store = useStore();

const gridName = "supplementMissingCheckGrid";

const columnList = [
  { title: "序号", value: "sid", width: "auto" },
  { title: "员工编码", value: "talentCode", width: "auto" },
  { title: "姓名", value: "talentName", width: "auto" },
  { title: "考勤日期", value: "attendanceDate", width: "auto" },
  { title: "缺卡时间点", value: "missingDateTime", width: "auto" },
];

const deptCodes = ref([]);
const total = ref(0);
const gridData = ref([]);

const today = dayjs().format("YYYY-MM-DD");
const weekAgo = dayjs().subtract(7, "day").format("YYYY-MM-DD");
const formInline = ref({
  talentName: "",
  deptCode: "",
  startDate: weekAgo,
  endDate: today,
});

const listQuery = ref({
  pageNo: 1,
  pageSize: (() => {
    const pageSizeData = JSON.parse(localStorage.getItem("pageSize")) || [];
    const savedData = pageSizeData.find((item) => item.name === route.name);
    return savedData ? savedData.pageSize : 50;
  })(),
});
const pageSizesList = ref([10, 50, 200, 500, 1000, 5000, 10000]);

const attendanceOrganizationOptions = computed(() => {
  const scope = store.getters["attendanceScope/scope"] || {};
  if (Array.isArray(scope?.deptScopeTree) && scope.deptScopeTree.length > 0) {
    return scope.deptScopeTree;
  }
  return store.getters["attendanceScope/deptScopes"] || [];
});

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

const gridHeight = ref(calculateGridHeight());

watch(
  () => [store.state.layout.layoutType, store.state.layout.embedMode],
  () => {
    gridHeight.value = calculateGridHeight();
  },
);

const buildQueryParams = () => ({
  pageNo: listQuery.value.pageNo,
  pageSize: listQuery.value.pageSize,
  talentName: formInline.value.talentName?.trim() || undefined,
  deptCode: formInline.value.deptCode || undefined,
  startDate: formInline.value.startDate || undefined,
  endDate: formInline.value.endDate || undefined,
});

const normalizeRecord = (item = {}, index = 0) => {
  const missingDateTime =
    item.missingDateTime ||
    item.missingPunchTime ||
    item.missingTimePoint ||
    item.attendanceDateTime ||
    "";
  const attendanceDate =
    item.attendanceDate ||
    (missingDateTime && dayjs(missingDateTime).isValid()
      ? dayjs(missingDateTime).format("YYYY-MM-DD")
      : "");
  return {
    ...item,
    attendanceDate,
    missingDateTime,
    id:
      item.id ||
      `${item.talentCode || "talent"}-${attendanceDate}-${missingDateTime}-${index}`,
    sid: (listQuery.value.pageNo - 1) * listQuery.value.pageSize + index + 1,
  };
};

const fetchMissingCheckList = () => {
  querySupplementMissingCheckPage(buildQueryParams(), { isLoading: true })
    .then((res) => {
      const records = Array.isArray(res?.data) ? res.data : [];
      gridData.value = records.map((item, index) => normalizeRecord(item, index));
      total.value = Number(res?.total || 0);
      if (Number(res?.currPage)) {
        listQuery.value.pageNo = Number(res.currPage);
      }
    })
    .catch(() => {
      gridData.value = [];
      total.value = 0;
    });
};

const handleSearch = () => {
  listQuery.value.pageNo = 1;
  fetchMissingCheckList();
};

const handlePagination = () => {
  fetchMissingCheckList();
};

const handleDeptChange = (value) => {
  const nextCodes = Array.isArray(value) ? value : [];
  deptCodes.value = nextCodes;
  formInline.value.deptCode = nextCodes.length ? nextCodes[nextCodes.length - 1] : "";
};

const handleCancel = () => {
  router.push({ name: "supplement-management" });
};

const formatDateTimeCell = (value) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  const target = dayjs(value);
  return target.isValid() ? target.format("YYYY-MM-DD HH:mm:ss") : String(value);
};

const cellRenderer = (params) => {
  let displayValue = params.value || params.value === 0 ? params.value : "";
  if (params?.colDef?.field === "missingDateTime") {
    displayValue = formatDateTimeCell(params.value);
  }
  return `<span title="${displayValue}">${displayValue}</span>`;
};

const applyRouteQuery = () => {
  const query = route.query || {};
  if (query.talentName) {
    formInline.value.talentName = String(query.talentName);
  }
  if (query.deptCode) {
    formInline.value.deptCode = String(query.deptCode);
    deptCodes.value = [formInline.value.deptCode];
  }
  if (query.startDate) {
    formInline.value.startDate = String(query.startDate);
  }
  if (query.endDate) {
    formInline.value.endDate = String(query.endDate);
  }
};

onMounted(() => {
  applyRouteQuery();
  fetchMissingCheckList();
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
            <div
              class="d-flex supplement-missing-check__toolbar"
              style="gap: 10px"
            >
              <el-input
                v-model="formInline.talentName"
                class="top-search"
                style="width: 200px"
                placeholder="姓名"
                clearable
                @keyup.enter="handleSearch"
              />
              <el-cascader
                v-model="deptCodes"
                class="supplement-missing-check__cascader"
                :options="attendanceOrganizationOptions"
                :props="{
                  checkStrictly: true,
                  emitPath: true,
                  value: 'deptCode',
                  label: 'deptName',
                }"
                clearable
                filterable
                collapse-tags
                collapse-tags-tooltip
                placeholder="组织"
                @change="handleDeptChange"
              />
              <el-date-picker
                v-model="formInline.startDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="开始日期"
                class="supplement-missing-check__date"
              />
              <el-date-picker
                v-model="formInline.endDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="结束日期"
                class="supplement-missing-check__date"
              />
              <el-button
                type="primary"
                @click="handleSearch"
              >
                查询
              </el-button>
              <el-button @click="handleCancel">返回</el-button>
            </div>
          </div>
          <div style="padding: 0 10px">
            <GridView
              ref="gridRef"
              :gridName="gridName"
              :height="gridHeight"
              :columnDefs="columnList"
              :grid-data="gridData"
              :cellRenderer="cellRenderer"
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

.supplement-missing-check__toolbar {
  flex-wrap: wrap;
}

.supplement-missing-check__cascader {
  width: 220px;
}

.supplement-missing-check__date {
  width: 160px;
}
</style>
