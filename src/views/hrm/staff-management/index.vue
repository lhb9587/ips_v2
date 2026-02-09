<script setup>
import Layout from "@/layouts/main";
import GridView from "@/components/common/grid-table/index.vue";
import { ref, onUnmounted, onMounted, computed,watch } from "vue";
import TopListTool from "@/components/common/top-list-tool/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import ListSearch from "@/components/common/list-search/index.vue";
import {
  queryTalentPersonList,
  queryPersonAll,
  queryPositions,
  queryOrganizations,
} from "@/api/hrmList";
import TalentSidebar from "@/views/hrm/staff-management/detail-sidebar";
import { useStore } from 'vuex';
import { saveTableConfig } from "@/utils"
import { useRoute } from 'vue-router'
const route = useRoute();
const store = useStore();

const bussId = 72;
const gridName = "staffListGrid"
const columnList = ref([]);
const setColumn = (list) => {
  columnList.value = list;
};

//斑马线
const activeClass = ref([]);
const changeBorder = (newVal) => {
  newVal
    ? activeClass.value.push("Borderline")
    : activeClass.value.splice(
        activeClass.value.findIndex((i) => i === "Borderline"),
        1
      );
      saveTableConfig("isBorderline",gridName,newVal)
};
const changeRowStyle = (newVal) => {
  newVal
    ? activeClass.value.push("zebra")
    : activeClass.value.splice(
        activeClass.value.findIndex((i) => i === "zebra"),
        1
      );
      saveTableConfig("iszebra",gridName,newVal)
};
//密度
const rowHeight = ref(40);
const changeRowHeight = (height) => {
  rowHeight.value = height;
  saveTableConfig("rowHeight",gridName,height)
};
const isFull = ref(false);
const calculateGridHeight = () => {
  const layout = store.state.layout.layoutType;
  const windowHeight = document.documentElement.clientHeight;
  if (layout === 'vertical') {
    return windowHeight - 235;
  } else {
    return windowHeight - 290;
  }
};
const gridHeight = ref(calculateGridHeight())

// 创建一个 computed 属性来监听布局变化
const layoutType = computed(() => store.state.layout.layoutType);
watch(layoutType, () => {
  gridHeight.value = calculateGridHeight();
});

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
const total = ref(0);
const fetchLocalPageSize = () => {
  const pageSizeData = JSON.parse(localStorage.getItem('pageSize')) || [];
  const routeName = route.name;
  const savedData = pageSizeData.find(item => item.name === routeName);
  if (savedData) {
    return savedData.pageSize
  }else {
    return 50
  }
}
const listQuery = ref({
  pageNo: 1,
  pageSize: fetchLocalPageSize(),
});
const pageSizesList = ref([10, 50, 200, 500, 1000, 5000, 10000]);
const formInline = ref({});
// 模糊搜索
const diminput = ref("");
const gridData = ref([]);
const fetchDataFunc = () => {
  const posId = positionsList.value.find(
    (item) => item.posName == positionName.value
  )?.id;
  const codes =
    deptCodes.value?.length > 0
      ? deptCodes.value[deptCodes.value.length - 1]
      : "";
  //卡片和表格的数据
  queryTalentPersonList({
    searchWord: diminput.value,
    talentCode: filterTalentCode.value,
    empStatus: empStatus.value,
    deptCode: codes,
    posId: posId,
    ...listQuery.value,
    ...formInline.value,
  },{
    isLoading: true
  }).then((res) => {
    gridData.value = res.data || [];
    gridData.value.forEach((item, index) => {
      item.sid = index;
    });
    total.value = res.total || 0;
  });
};
const tagList = ref([]);
const requestData = ref(undefined);
const handleSearch = (typeStr) => {
  diminput.value = "";
  formInline.value = { ...typeStr.data };
  tagList.value = typeStr.tagList || [];
  fetchDataFunc();
  requestData.value = {
    ...typeStr.data,
  };
};
const talentCode = ref("");
const filterTalentCode = ref("");
const positionName = ref("");
const isShowDetail = ref(false);
const toggleSidebar = (params) => {
  const id = params.data.talentCode;
  talentCode.value = id;
  isShowDetail.value = true;
};
const handleSidebarUpdate = (value) => {
  isShowDetail.value = value;
};
const boxRef = ref(null);
const handleFullScreenChange = () => {
  isFull.value = !isFull.value;
  if (document.fullscreenElement !== boxRef.value) {
    gridHeight.value = calculateGridHeight();
  }
};
const userList = ref([]);
const empStatus = ref("在职");
const statusList = ref(["在职", "离职"]);
const fetchPersonAll = () => {
  queryPersonAll({ empStatus: empStatus.value }).then((res) => {
    if (res.success) {
      userList.value = res.data;
    }
  });
};
const positionsList = ref([]);
const fetchPositions = () => {
  queryPositions().then((res) => {
    if (res.success) {
      positionsList.value = res.data;
    }
  });
};
const positionNameWidth = computed(() => {
  if (!positionName.value) {
    return "110px";
  } else {
    // 有内容，字符串长度*字体大小
    return String(positionName.value).length * 13 + 60 + "px";
  }
});
const defaultParams = {
  value: "deptCode",
  label: "kingDeeGroupName",
  checkStrictly: true,
  children: "children",
};
const deptCodes = ref([]);
// const cascaderLable = ref('');
const groupList = ref([]);
const groupCascader = ref("");
const handleCascaderSearch = () => {
  fetchDataFunc();
  // nextTick(() => {
  //   cascaderLable.value = groupCascader.value.innerText;
  // });
};
const fetchOrganizations = () => {
  queryOrganizations({ status: empStatus.value == "在职" ? 1 : 0 }).then(
    (res) => {
      if (res.success) {
        groupList.value = res.data;
      }
    }
  );
};
onMounted(() => {
  fetchDataFunc();
  fetchPersonAll();
  fetchPositions();
  fetchOrganizations();
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
          <div class="card-body" style="padding-bottom: 10px;">
            <div class="d-flex align-items-center">
              <div
                class="mb-0 d-flex flex-grow-1"
                style="gap: 10px"
              >
                <div class="hrm-search">
                  <el-select
                    v-model="filterTalentCode"
                    @change="fetchDataFunc"
                    style="width: 90px"
                    filterable
                    clearable
                    placeholder="姓名"
                  >
                    <el-option
                      v-for="item in userList"
                      :key="item.talentCode"
                      :label="item.talentName"
                      :value="item.talentCode"
                    >
                    </el-option>
                  </el-select>
                  <el-select
                    v-model="positionName"
                    @change="fetchDataFunc"
                    :style="{ width: positionNameWidth }"
                    filterable
                    clearable
                    placeholder="岗位名称"
                  >
                    <el-option
                      v-for="item in positionsList"
                      :key="item.id"
                      :label="item.posName"
                      :value="item.posName"
                    >
                    </el-option>
                  </el-select>
                  <el-select
                    v-model="empStatus"
                    @change="fetchDataFunc"
                    style="width: 100px"
                    filterable
                    clearable
                    placeholder="在职状态"
                  >
                    <el-option
                      v-for="item in statusList"
                      :key="item"
                      :label="item"
                      :value="item"
                    >
                    </el-option>
                  </el-select>
                  <el-cascader
                    ref="groupCascader"
                    placeholder="部门工作组"
                    :options="groupList"
                    :props="defaultParams"
                    :show-all-levels="false"
                    clearable
                    filterable
                    v-model="deptCodes"
                    :style="{
                      width: '200px',
                    }"
                    popper-class="group-cascader"
                    @change="handleCascaderSearch()"
                  ></el-cascader>
                </div>
                <ListSearch
                  name="gailanlist"
                  :buss-id="bussId"
                  :is-show="true"
                  @search="handleSearch"
                  ref="searchRef"
                >
                </ListSearch>
              </div>
              <div class="flex-shrink-0">
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
              :gridName="gridName"
              :bussId="bussId"
              :height="gridHeight"
              :rowHeight="rowHeight"
              :activeClass="activeClass"
              :columnDefs="columnList"
              :grid-data="gridData"
              :rowClick="toggleSidebar"
            />
          </div>
          <div
            class="card-body border-bottom"
            v-if="total > 0"
            style="padding-top: 10px;"
          >
            <Pagination
              :total="total"
              v-model:page="listQuery.pageNo"
              v-model:limit="listQuery.pageSize"
              @pagination="fetchDataFunc"
              :pageSizes="pageSizesList"
            ></Pagination>
          </div>
        </div>
      </div>
    </div>
  </Layout>
  <TalentSidebar
    v-if="isShowDetail"
    :showSidebar="isShowDetail"
    @update:showSidebar="handleSidebarUpdate"
    :talentCode="talentCode"
  />
</template>
<style lang="scss" scoped>
.card-body {
  flex: none;
}
.hrm-search {
  :deep(.el-select__wrapper) {
    box-shadow: none;
  }
  :deep(.el-input__wrapper) {
    box-shadow: none;
    font-weight: 700;
  }
  :deep(.el-cascader:not(.is-disabled):hover .el-input__wrapper){
    box-shadow: none;
  }
  :deep(.el-cascader .el-input.is-focus .el-input__wrapper){
    box-shadow: none;
  }
}
</style>

<style lang="scss">
.group-cascader{
  label{
    margin-bottom: 0 !important;
  }
}
</style>
