<!-- 排班列表纵向显示页，按员工维度展示日期范围内每日排班动态列。 -->
<script setup>
import dayjs from "dayjs";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import Layout from "@/layouts/main";
import GridView from "@/components/common/grid-table/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import { queryScheduleVerticalPage } from "@/api/attendance";

const route = useRoute();
const store = useStore();

const gridName = "scheduleVerticalListGrid";
const WEEK_TEXT = ["日", "一", "二", "三", "四", "五", "六"];

const rowHeight = ref(40);
const diminput = ref("");
const total = ref(0);
const gridData = ref([]);

const formInline = ref({
  startDate: dayjs().subtract(7, "day").format("YYYY-MM-DD"),
  endDate: dayjs().format("YYYY-MM-DD"),
});
const dateRange = ref([formInline.value.startDate, formInline.value.endDate]);

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

const dynamicDateList = computed(() => {
  const start = dayjs(formInline.value.startDate);
  const end = dayjs(formInline.value.endDate);
  if (!start.isValid() || !end.isValid() || end.isBefore(start, "day")) {
    return [];
  }

  const result = [];
  let cursor = start;
  while (cursor.isBefore(end, "day") || cursor.isSame(end, "day")) {
    const dateKey = cursor.format("YYYY-MM-DD");
    result.push({
      key: dateKey,
      title: `${dateKey}(${WEEK_TEXT[cursor.day()]})`,
    });
    cursor = cursor.add(1, "day");
  }
  return result;
});

const columnList = computed(() => {
  const fixedColumns = [
    { title: "序号", value: "sid", width: 70, minWidth: 70, maxWidth: 90 },
    { title: "员工编码", value: "employeeCode", minWidth: 120 },
    { title: "姓名", value: "employeeName", minWidth: 120 },
    { title: "考勤组织", value: "attendanceOrganization", minWidth: 220 },
  ];
  const dateColumns = dynamicDateList.value.map((item) => ({
    title: item.title,
    value: `day_${item.key}`,
    minWidth: 160,
  }));
  return [...fixedColumns, ...dateColumns];
});

const mapDayText = (dayItem = {}) => {
  if (!dayItem.scheduled) {
    return "未排班";
  }
  if (dayItem.shiftName) {
    return dayItem.shiftName;
  }
  if (dayItem.shiftCode) {
    return dayItem.shiftCode;
  }
  return "已排班";
};

const DATE_KEY_PATTERN = /^(\d{4}-\d{2}-\d{2})(?:[(（].*[)）])?$/;

const normalizeDateKey = (rawKey = "") => {
  const key = String(rawKey || "").trim();
  const match = key.match(DATE_KEY_PATTERN);
  return match ? match[1] : "";
};

const collectFlatDateMap = (record = {}) => {
  const result = {};
  const mergeFromObject = (obj = {}) => {
    Object.keys(obj).forEach((key) => {
      const dateKey = normalizeDateKey(key);
      if (dateKey) {
        result[dateKey] = obj[key];
      }
    });
  };

  mergeFromObject(record);
  Object.keys(record).forEach((key) => {
    const value = record[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      mergeFromObject(value);
    }
  });

  return result;
};

const isEmptyValue = (value) => value === undefined || value === null || value === "";

const fetchVerticalList = () => {
  queryScheduleVerticalPage(
    {
      pageNo: listQuery.value.pageNo,
      pageSize: Math.min(listQuery.value.pageSize, 100),
      startDate: formInline.value.startDate,
      endDate: formInline.value.endDate,
      talentName: diminput.value || undefined,
    },
    {
      isLoading: true,
    },
  )
    .then((res) => {
      const records = Array.isArray(res?.data) ? res.data : res?.data?.records || [];
      gridData.value = records.map((item, index) => {
        const flatDateMap = collectFlatDateMap(item);
        const row = {
          ...item,
          id: item.talentCode || `${item.attendanceOrgCode || ""}_${index}`,
          employeeCode: item.talentCode || "",
          employeeName: item.talentName || "",
          attendanceOrganization: item.attendanceOrgName || "",
          sid: (listQuery.value.pageNo - 1) * listQuery.value.pageSize + index + 1,
        };

        const dayMap = {};
        (item.days || []).forEach((dayItem) => {
          if (dayItem?.scheduleDate) {
            dayMap[dayItem.scheduleDate] = mapDayText(dayItem);
          }
        });

        dynamicDateList.value.forEach((dateItem) => {
          const dayValueByFlatKey = flatDateMap[dateItem.key];
          const dayValueByDays = dayMap[dateItem.key];
          const finalValue = !isEmptyValue(dayValueByFlatKey)
            ? dayValueByFlatKey
            : !isEmptyValue(dayValueByDays)
              ? dayValueByDays
              : undefined;
          row[`day_${dateItem.key}`] = isEmptyValue(finalValue) ? "未排班" : finalValue;
        });

        return row;
      });
      total.value = Number(res?.total) || Number(res?.data?.total) || 0;
    })
    .catch(() => {
      gridData.value = [];
      total.value = 0;
    });
};

const fuzzySearch = () => {
  listQuery.value.pageNo = 1;
  fetchVerticalList();
};

const handleDateRangeChange = (value) => {
  const range = Array.isArray(value) ? value : [];
  if (!range[0] || !range[1]) {
    dateRange.value = [formInline.value.startDate, formInline.value.endDate];
    return;
  }
  formInline.value.startDate = range[0] || "";
  formInline.value.endDate = range[1] || "";
  fuzzySearch();
};

const handlePagination = () => {
  fetchVerticalList();
};

const cellRenderer = (params) => {
  const value = params.value || params.value === 0 ? params.value : "";
  return `<span title="${value}">${value}</span>`;
};

onMounted(() => {
  fetchVerticalList();
});
</script>

<template>
  <Layout>
    <div class="row">
      <div class="col-lg-12">
        <div
          class="card box"
        >
          <div
            class="card-body"
            style="padding-bottom: 10px"
          >
            <div class="d-flex align-items-center">
              <span class="mb-0 flex-grow-1">
                <div
                  class="d-flex"
                  style="gap: 10px"
                >
                  <el-input
                    v-model="diminput"
                    style="width: 200px"
                    placeholder="搜索..."
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
                  <el-date-picker
                    v-model="dateRange"
                    type="daterange"
                    value-format="YYYY-MM-DD"
                    range-separator="-"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    class="schedule-vertical-list__date-range"
                    style="width: 260px; min-width: 260px; max-width: 260px; flex: 0 0 260px"
                    :clearable="false"
                    @change="handleDateRangeChange"
                  />
                </div>
              </span>
            </div>
          </div>
          <div style="padding: 0 10px">
            <GridView
              :gridName="gridName"
              :height="gridHeight"
              :rowHeight="rowHeight"
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

:deep(.schedule-vertical-list__date-range.el-date-editor--daterange),
.schedule-vertical-list__date-range {
  width: 260px !important;
  min-width: 260px !important;
  max-width: 260px !important;
  flex: 0 0 260px !important;
}

</style>
