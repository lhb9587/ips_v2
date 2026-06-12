<!-- 打卡记录列表页，负责按组织、姓名、日期范围及高级筛选分页查询员工打卡记录。 -->
<script setup>
import dayjs from "dayjs";
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import Layout from "@/layouts/main";
import GridView from "@/components/common/grid-table/index.vue";
import TopListTool from "@/components/common/top-list-tool/index.vue";
import ListSearch from "@/components/common/list-search/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import { downLoad, saveTableConfig } from "@/utils";
import { getToken } from "@/utils/auth";
import {
  downloadAttendancePunchRecordImportTemplate,
  importAttendancePunchRecord,
  queryAttendancePunchRecordPage,
} from "@/api/attendance";

const route = useRoute();
const store = useStore();

const bussId = 462;
const gridName = "attendanceRecordGrid";
const columnList = ref([]);
const setColumn = (list) => {
  columnList.value = Array.isArray(list) ? list : [];
};

const activeClass = ref([]);
const rowHeight = ref(40);
const isFull = ref(false);
const boxRef = ref(null);
const diminput = ref("");
const total = ref(0);
const gridData = ref([]);
const importUploading = ref(false);
const templateDownloading = ref(false);

const getDefaultDateRange = () => {
  const now = dayjs();
  return {
    startDate: now.subtract(1, "month").date(21).format("YYYY-MM-DD"),
    endDate: now.date(20).format("YYYY-MM-DD"),
  };
};

const defaultDateRange = getDefaultDateRange();
const formInline = ref({
  startDate: defaultDateRange.startDate,
  endDate: defaultDateRange.endDate,
});
const advancedFilter = ref({});
const dateRange = ref([defaultDateRange.startDate, defaultDateRange.endDate]);

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
const pageSizesList = ref([10, 50, 200, 500, 1000, 5000, 10000]);

const changeBorder = (newVal) => {
  if (newVal) {
    if (!activeClass.value.includes("Borderline")) {
      activeClass.value.push("Borderline");
    }
  } else {
    activeClass.value = activeClass.value.filter((item) => item !== "Borderline");
  }
  saveTableConfig("isBorderline", gridName, newVal);
};

const changeRowStyle = (newVal) => {
  if (newVal) {
    if (!activeClass.value.includes("zebra")) {
      activeClass.value.push("zebra");
    }
  } else {
    activeClass.value = activeClass.value.filter((item) => item !== "zebra");
  }
  saveTableConfig("iszebra", gridName, newVal);
};

const changeRowHeight = (height) => {
  rowHeight.value = height;
  saveTableConfig("rowHeight", gridName, height);
};

const changeScreenSize = () => {
  const element = document.querySelector(".box");
  if (!element) {
    return;
  }
  if (!document.fullscreenElement) {
    element.requestFullscreen().then(() => {
      setTimeout(() => {
        gridHeight.value = document.documentElement.clientHeight - 155;
      }, 100);
    });
  } else {
    document.exitFullscreen().then(() => {
      gridHeight.value = calculateGridHeight();
    });
  }
};

const handleFullScreenChange = () => {
  isFull.value = !isFull.value;
  if (document.fullscreenElement !== boxRef.value) {
    gridHeight.value = calculateGridHeight();
  }
};

const fetchAttendanceRecordList = () => {
  queryAttendancePunchRecordPage(
    {
      pageNo: listQuery.value.pageNo,
      pageSize: listQuery.value.pageSize,
      talentName: diminput.value || undefined,
      startDate: formInline.value.startDate || undefined,
      endDate: formInline.value.endDate || undefined,
      ...advancedFilter.value,
    },
    {
      isLoading: true,
    },
  )
    .then((res) => {
      const records = Array.isArray(res?.data) ? res.data : [];
      gridData.value = records.map((item, index) => ({
        ...item,
        id: item.recordId,
        sid: (listQuery.value.pageNo - 1) * listQuery.value.pageSize + index + 1,
      }));
      total.value = Number(res?.total || 0);
    })
    .catch(() => {
      gridData.value = [];
      total.value = 0;
    });
};

const fuzzySearch = () => {
  listQuery.value.pageNo = 1;
  advancedFilter.value = {};
  fetchAttendanceRecordList();
};

const handleAdvancedSearch = (typeStr) => {
  diminput.value = "";
  listQuery.value.pageNo = 1;
  advancedFilter.value = { ...typeStr.data };
  fetchAttendanceRecordList();
};

const handlePagination = () => {
  fetchAttendanceRecordList();
};

const handleDateRangeChange = (value) => {
  const range = Array.isArray(value) ? value : [];
  formInline.value.startDate = range[0] || "";
  formInline.value.endDate = range[1] || "";
  fuzzySearch();
};

const beforeImportUpload = (rawFile) => {
  const isXlsx =
    rawFile?.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    /\.xlsx$/i.test(rawFile?.name || "");
  if (!isXlsx) {
    ElMessage.warning("仅支持上传 .xlsx 格式文件");
    return false;
  }
  return true;
};

const handleImportUpload = async (options) => {
  const file = options?.file;
  if (!file) {
    return;
  }
  const formData = new FormData();
  formData.append("tokenID", getToken() || "");
  formData.append("file", file);
  importUploading.value = true;
  try {
    const res = await importAttendancePunchRecord(formData, {
      isLoading: false,
      showErrorMessage: true,
    });
    const result = res?.data || {};
    const totalCount = Number(result.totalCount || 0);
    const successCount = Number(result.successCount || 0);
    const failCount = Number(result.failCount || 0);
    ElMessage.success(
      `导入完成：共 ${totalCount} 条，成功 ${successCount} 条，失败 ${failCount} 条`,
    );
    listQuery.value.pageNo = 1;
    fetchAttendanceRecordList();
    options?.onSuccess?.(res);
  } catch (error) {
    options?.onError?.(error);
  } finally {
    importUploading.value = false;
  }
};

const handleDownloadTemplate = async () => {
  templateDownloading.value = true;
  try {
    const res = await downloadAttendancePunchRecordImportTemplate(
      {},
      {
        isLoading: true,
      },
    );
    const filePath = res?.data?.filePath;
    const fileName = res?.data?.fileName || "打卡记录导入.xlsx";
    if (filePath) {
      downLoad(filePath, fileName);
      return;
    }
    ElMessage.warning("未获取到模板下载地址");
  } finally {
    templateDownloading.value = false;
  }
};

const cellRenderer = (params) => {
  const value = params.value || params.value === 0 ? params.value : "";
  return `<span title="${value}">${value}</span>`;
};

onMounted(() => {
  document.addEventListener("fullscreenchange", handleFullScreenChange);
  fetchAttendanceRecordList();
});

onUnmounted(() => {
  document.removeEventListener("fullscreenchange", handleFullScreenChange);
});
</script>

<template>
  <Layout>
    <div class="row">
      <div class="col-lg-12">
        <div
          ref="boxRef"
          class="card box"
          style="margin-bottom: 0;"
        >
          <div
            class="card-body"
            style="padding-bottom: 10px"
          >
            <div class="d-flex align-items-center">
              <span class="mb-0 flex-grow-1">
                <div
                  class="d-flex attendance-record__toolbar"
                  style="gap: 10px"
                >
                  <el-input
                    v-model="diminput"
                    class="top-search"
                    style="width: 200px"
                    placeholder="请输入员工姓名"
                    clearable
                    @keyup.enter="fuzzySearch"
                    @clear="fuzzySearch"
                  >
                    <template #prepend>
                      <el-button @click="fuzzySearch">
                        <i class="bx bx-search-alt"></i>
                      </el-button>
                    </template>
                  </el-input>
                  <ListSearch
                    name="attendanceRecordList"
                    :buss-id="bussId"
                    :is-show="true"
                    @search="handleAdvancedSearch"
                  />
                  <el-date-picker
                    v-model="dateRange"
                    type="daterange"
                    value-format="YYYY-MM-DD"
                    range-separator="-"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    class="attendance-record__date-range"
                    style="width: 260px; min-width: 260px; max-width: 260px; flex: 0 0 260px"
                    :clearable="false"
                    @change="handleDateRangeChange"
                  />
                  <el-upload
                    :show-file-list="false"
                    :auto-upload="true"
                    accept=".xlsx"
                    :before-upload="beforeImportUpload"
                    :http-request="handleImportUpload"
                    :disabled="importUploading"
                  >
                    <el-button
                      type="primary"
                      :loading="importUploading"
                    >
                      导入
                    </el-button>
                  </el-upload>
                  <el-button
                    type="primary"
                    plain
                    :loading="templateDownloading"
                    @click="handleDownloadTemplate"
                  >
                    导入模板下载
                  </el-button>
                </div>
              </span>
              <div class="d-flex gap-2">
                <TopListTool
                  :gridName="gridName"
                  :buss-id="bussId"
                  :queryList="{
                    ...listQuery,
                    ...formInline,
                    ...advancedFilter,
                    searchWord: diminput,
                  }"
                  :isFull="isFull"
                  @changeBorder="changeBorder"
                  @changeRowStyle="changeRowStyle"
                  @changeRowHeight="changeRowHeight"
                  @changeScreenSize="changeScreenSize"
                  @setColumn="setColumn"
                />
              </div>
            </div>
          </div>
          <div style="padding: 0 10px">
            <GridView
              :gridName="gridName"
              :bussId="bussId"
              :height="gridHeight"
              :rowHeight="rowHeight"
              :columnDefs="columnList"
              :grid-data="gridData"
              :activeClass="activeClass"
              :cellRenderer="cellRenderer"
            />
          </div>
          <div
            v-if="total > 0"
            class="card-body border-bottom"
            style="padding-top: 10px"
          >
            <Pagination
              v-model:page="listQuery.pageNo"
              v-model:limit="listQuery.pageSize"
              :total="total"
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

.attendance-record__toolbar {
  flex-wrap: wrap;
}

:deep(.attendance-record__date-range.el-date-editor--daterange) {
  width: 260px !important;
  min-width: 260px !important;
  max-width: 260px !important;
  flex: 0 0 260px !important;
}
</style>
