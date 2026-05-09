<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import Layout from "@/layouts/main";
import GridView from "@/components/common/grid-table/index.vue";
import TopListTool from "@/components/common/top-list-tool/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import { saveTableConfig } from "@/utils";

const route = useRoute();
const store = useStore();

const bussId = 458;
const gridName = "scheduleListGrid";

const columnList = ref([]);
const setColumn = (list) => {
  columnList.value = Array.isArray(list) ? list : [];
};

const activeClass = ref([]);
const rowHeight = ref(40);
const isFull = ref(false);
const boxRef = ref(null);
const diminput = ref("");
const formInline = ref({});
const gridOptions = {
  rowMultiSelectWithClick: true,
};

const showRuleDialog = ref(false);
const employeeTableRef = ref(null);
const selectedEmployees = ref([]);
const ruleForm = ref({
  attendanceSystem: "默认考勤制度",
  attendanceGroup: "",
  organization: "曜斗科技",
  employeeName: "",
  ruleId: "",
  startDate: "2026-05-08",
  endDate: "2026-06-08",
  holidayHandling: "顺延",
});

const ruleOptions = [
  { label: "001 标准轮班规则", value: "rule-001" },
  { label: "002 早班轮班规则", value: "rule-002" },
  { label: "003 晚班轮班规则", value: "rule-003" },
  { label: "004 哺乳假轮班规则-9点半", value: "rule-004" },
];
const employeeSource = ref([
  {
    id: 1,
    employeeCode: "10072",
    employeeName: "陈红",
    attendanceOrganization: "万慧达_曜斗科技",
    positionName: "技术工程师",
  },
  {
    id: 2,
    employeeCode: "10596",
    employeeName: "马超",
    attendanceOrganization: "万慧达_曜斗科技",
    positionName: "组长",
  },
  {
    id: 3,
    employeeCode: "10598",
    employeeName: "张黎维",
    attendanceOrganization: "万慧达_曜斗科技",
    positionName: "技术工程师",
  },
  {
    id: 4,
    employeeCode: "10604",
    employeeName: "刘旭",
    attendanceOrganization: "万慧达_曜斗科技",
    positionName: "技术工程师",
  },
  {
    id: 5,
    employeeCode: "10632",
    employeeName: "李明",
    attendanceOrganization: "万慧达_曜斗科技",
    positionName: "合伙人",
  },
  {
    id: 6,
    employeeCode: "10633",
    employeeName: "杨光",
    attendanceOrganization: "万慧达_曜斗科技",
    positionName: "组长",
  },
  {
    id: 7,
    employeeCode: "10873",
    employeeName: "张道森",
    attendanceOrganization: "万慧达_曜斗科技",
    positionName: "Java后端开发工程师",
  },
  {
    id: 8,
    employeeCode: "10984",
    employeeName: "王斌斌",
    attendanceOrganization: "万慧达_曜斗科技",
    positionName: "前端开发工程师",
  },
  {
    id: 9,
    employeeCode: "11002",
    employeeName: "马林飞",
    attendanceOrganization: "万慧达_曜斗科技",
    positionName: "Java后端开发工程师",
  },
  {
    id: 10,
    employeeCode: "11049",
    employeeName: "侯强",
    attendanceOrganization: "万慧达_曜斗科技",
    positionName: "PHP开发工程师",
  },
]);

const scheduleList = ref([
  {
    id: 1,
    employeeCode: "10633",
    employeeName: "杨光",
    attendanceOrganization: "行政管理部",
    attendanceDate: "2026-05-08",
    dateType: "工作日",
    shiftName: "标准班",
    workStartTime: "09:00",
    workEndTime: "18:00",
    attendanceNo: "KQ10633",
    attendanceSystem: "默认考勤制度",
    cardRule: "正常打卡",
  },
  {
    id: 2,
    employeeCode: "10634",
    employeeName: "张敏",
    attendanceOrganization: "产品研发部",
    attendanceDate: "2026-05-08",
    dateType: "工作日",
    shiftName: "弹性班",
    workStartTime: "09:30",
    workEndTime: "18:30",
    attendanceNo: "KQ10634",
    attendanceSystem: "默认考勤制度",
    cardRule: "正常打卡",
  },
  {
    id: 3,
    employeeCode: "10635",
    employeeName: "李磊",
    attendanceOrganization: "华东运营中心",
    attendanceDate: "2026-05-08",
    dateType: "工作日",
    shiftName: "轮班",
    workStartTime: "08:30",
    workEndTime: "17:30",
    attendanceNo: "KQ10635",
    attendanceSystem: "默认考勤制度",
    cardRule: "正常打卡",
  },
]);

const filteredEmployeeList = computed(() => {
  return employeeSource.value.filter((item) => {
    const matchSystem =
      !ruleForm.value.attendanceSystem ||
      ruleForm.value.attendanceSystem === "默认考勤制度";
    const matchGroup =
      !ruleForm.value.attendanceGroup ||
      item.positionName.includes(ruleForm.value.attendanceGroup);
    const matchOrg =
      !ruleForm.value.organization ||
      item.attendanceOrganization.includes(ruleForm.value.organization);
    const matchName =
      !ruleForm.value.employeeName ||
      item.employeeName.includes(ruleForm.value.employeeName) ||
      item.employeeCode.includes(ruleForm.value.employeeName);
    return matchSystem && matchGroup && matchOrg && matchName;
  });
});

const filteredList = computed(() => {
  const keyword = diminput.value.trim().toLowerCase();
  if (!keyword) {
    return scheduleList.value;
  }
  return scheduleList.value.filter((item) =>
    [
      item.employeeCode,
      item.employeeName,
      item.attendanceOrganization,
      item.attendanceDate,
      item.dateType,
      item.shiftName,
      item.workStartTime,
      item.workEndTime,
      item.attendanceNo,
      item.attendanceSystem,
      item.cardRule,
    ].some((field) => String(field || "").toLowerCase().includes(keyword)),
  );
});

const total = computed(() => filteredList.value.length);

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
  return savedData ? savedData.pageSize : 10;
};

const listQuery = ref({
  pageNo: 1,
  pageSize: fetchLocalPageSize(),
});
const pageSizesList = ref([10, 50, 200, 500]);

const gridData = computed(() => {
  const start = (listQuery.value.pageNo - 1) * listQuery.value.pageSize;
  const end = start + listQuery.value.pageSize;
  return filteredList.value.slice(start, end).map((item, index) => ({
    ...item,
    sid: start + index,
  }));
});

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

const fuzzySearch = () => {
  listQuery.value.pageNo = 1;
  formInline.value = {};
};

const openRuleDialog = () => {
  ruleForm.value = {
    attendanceSystem: "默认考勤制度",
    attendanceGroup: "",
    organization: "曜斗科技",
    employeeName: "",
    ruleId: "",
    startDate: "2026-05-08",
    endDate: "2026-06-08",
    holidayHandling: "顺延",
  };
  selectedEmployees.value = [];
  showRuleDialog.value = true;
};

const handleEmployeeSelectionChange = (rows) => {
  selectedEmployees.value = rows;
};

const handleEmployeeFilter = async () => {
  await nextTick();
  selectedEmployees.value = [];
  employeeTableRef.value?.clearSelection?.();
};

const submitRuleDialog = () => {
  if (!selectedEmployees.value.length) {
    ElMessage.warning("请先选择人员");
    return;
  }
  if (!ruleForm.value.ruleId) {
    ElMessage.warning("请先指定轮班规则");
    return;
  }
  if (!ruleForm.value.startDate || !ruleForm.value.endDate) {
    ElMessage.warning("请先选择开始日期和结束日期");
    return;
  }
  showRuleDialog.value = false;
  ElMessage.success("轮班规则已应用");
};

const cellRenderer = (params) => {
  return `<span title="${params.value || params.value === 0 ? params.value : ""}">${
    params.value || params.value === 0 ? params.value : ""
  }</span>`;
};

const handlePagination = () => {};

onMounted(() => {
  document.addEventListener("fullscreenchange", handleFullScreenChange);
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
          class="card box"
          ref="boxRef"
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
                  <el-button
                    type="primary"
                    plain
                    @click="openRuleDialog"
                  >
                    轮班规则
                  </el-button>
                </div>
              </span>
              <div class="d-flex gap-2">
                <TopListTool
                  :gridName="gridName"
                  :buss-id="bussId"
                  @changeBorder="changeBorder"
                  @changeRowStyle="changeRowStyle"
                  @changeRowHeight="changeRowHeight"
                  @changeScreenSize="changeScreenSize"
                  @setColumn="setColumn"
                  :queryList="{
                    ...listQuery,
                    ...formInline,
                    searchWord: diminput,
                  }"
                  :isFull="isFull"
                >
                </TopListTool>
              </div>
            </div>
          </div>
          <div style="padding: 0 10px">
            <GridView
              ref="gridRef"
              :gridName="gridName"
              :bussId="bussId"
              :height="gridHeight"
              :rowHeight="rowHeight"
              :columnDefs="columnList"
              :grid-data="gridData"
              :activeClass="activeClass"
              :cellRenderer="cellRenderer"
              :gridOptions="gridOptions"
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

    <el-dialog
      v-model="showRuleDialog"
      title="轮班规则"
      width="980px"
      destroy-on-close
      class="schedule-rule-dialog"
    >
      <div class="schedule-rule-dialog__body">
        <div class="schedule-rule-dialog__filter">
          <div class="schedule-rule-dialog__filter-row">
            <div class="schedule-rule-dialog__field">
              <div class="schedule-rule-dialog__label">考勤制度</div>
              <el-input
                v-model="ruleForm.attendanceSystem"
                readonly
                class="schedule-rule-dialog__input"
              >
                <template #append>
                  <i class="bx bx-list-ul"></i>
                </template>
              </el-input>
            </div>
            <div class="schedule-rule-dialog__field">
              <div class="schedule-rule-dialog__label">组织</div>
              <el-input
                v-model="ruleForm.organization"
                class="schedule-rule-dialog__input"
              >
                <template #append>
                  <i class="bx bx-list-ul"></i>
                </template>
              </el-input>
            </div>
          </div>
          <div class="schedule-rule-dialog__filter-row">
            <div class="schedule-rule-dialog__field">
              <div class="schedule-rule-dialog__label">考勤组</div>
              <el-input
                v-model="ruleForm.attendanceGroup"
                class="schedule-rule-dialog__input"
              >
                <template #append>
                  <i class="bx bx-list-ul"></i>
                </template>
              </el-input>
            </div>
            <div class="schedule-rule-dialog__field">
              <div class="schedule-rule-dialog__label">姓名</div>
              <div class="schedule-rule-dialog__search">
                <el-input
                  v-model="ruleForm.employeeName"
                  class="schedule-rule-dialog__input"
                  @keyup.enter="handleEmployeeFilter"
                />
                <el-button
                  type="primary"
                  @click="handleEmployeeFilter"
                >
                  查询
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <div class="schedule-rule-dialog__table-wrap">
          <el-table
            ref="employeeTableRef"
            :data="filteredEmployeeList"
            border
            height="360"
            @selection-change="handleEmployeeSelectionChange"
          >
            <el-table-column
              type="selection"
              width="48"
            />
            <el-table-column
              prop="employeeCode"
              label="员工编码"
              min-width="120"
            />
            <el-table-column
              prop="employeeName"
              label="姓名"
              min-width="100"
            />
            <el-table-column
              prop="attendanceOrganization"
              label="组织"
              min-width="320"
            />
            <el-table-column
              prop="positionName"
              label="职位"
              min-width="180"
            />
          </el-table>
        </div>

        <div class="schedule-rule-dialog__footer-form">
          <div class="schedule-rule-dialog__rule-grid">
            <div class="schedule-rule-dialog__field">
              <div class="schedule-rule-dialog__label">轮班规则</div>
              <el-select
                v-model="ruleForm.ruleId"
                filterable
                placeholder="请选择轮班规则"
                class="schedule-rule-dialog__rule-select"
              >
                <el-option
                  v-for="item in ruleOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>
            <div class="schedule-rule-dialog__field">
              <div class="schedule-rule-dialog__label">开始日期</div>
              <el-date-picker
                v-model="ruleForm.startDate"
                type="date"
                value-format="YYYY-MM-DD"
                class="schedule-rule-dialog__input"
              />
            </div>
            <div class="schedule-rule-dialog__field">
              <div class="schedule-rule-dialog__label">结束日期</div>
              <el-date-picker
                v-model="ruleForm.endDate"
                type="date"
                value-format="YYYY-MM-DD"
                class="schedule-rule-dialog__input"
              />
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="showRuleDialog = false">取消</el-button>
        <el-button
          type="primary"
          @click="submitRuleDialog"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </Layout>
</template>

<style scoped lang="scss">
.card-body {
  flex: none;
}

.schedule-rule-dialog__body {
  display: grid;
  gap: 16px;
}

.schedule-rule-dialog__filter {
  padding: 8px 12px 2px;
  border: 1px solid #e7edf5;
  border-radius: 8px;
  background: #fafcff;
}

.schedule-rule-dialog__filter-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px 28px;
  margin-bottom: 14px;
}

.schedule-rule-dialog__field {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
}

.schedule-rule-dialog__label {
  color: #4c5d78;
  font-size: 14px;
  text-align: right;
}

.schedule-rule-dialog__input {
  width: 100%;
}

.schedule-rule-dialog__search {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 88px;
  gap: 10px;
}

.schedule-rule-dialog__table-wrap {
  border: 1px solid #e7edf5;
  border-radius: 8px;
  overflow: hidden;
}

.schedule-rule-dialog__footer-form {
  display: grid;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid #e7edf5;
  border-radius: 8px;
  background: #fbfcfe;
}

.schedule-rule-dialog__rule-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 28px;
}

.schedule-rule-dialog__rule-select {
  width: 100%;
}

:deep(.schedule-rule-dialog .el-dialog__body) {
  padding-top: 14px;
}

:deep(.schedule-rule-dialog .el-input-group__append) {
  padding: 0 10px;
  color: #5f6f89;
  background: #f6f9fc;
}

:deep(.schedule-rule-dialog .el-table th.el-table__cell) {
  background: #f6f8fb;
  color: #243449;
}

@media (max-width: 960px) {
  .schedule-rule-dialog__filter-row {
    grid-template-columns: 1fr;
  }

  .schedule-rule-dialog__field {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .schedule-rule-dialog__rule-grid {
    grid-template-columns: 1fr;
  }

  .schedule-rule-dialog__label {
    text-align: left;
  }
}
</style>
