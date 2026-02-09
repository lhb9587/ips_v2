<script>
  export default {
    name: 'default'
  }
</script>
<script setup>
import { ref, computed, watch, onMounted, onUnmounted, reactive, nextTick } from "vue";
import Layout from "@/layouts/main";
import CPNS from "@/views/dashboards/constantMap.js";
import { ElMessageBox, ElMessage } from "element-plus";
import {
  queryWorkbenchModule,
  queryWorkbenchConfig,
  saveWorkbenchConfig,
} from "@/api/dashboard";
import ConfigContainer from "@/components/common/charts/config-container";
import AnchorList from "@/components/common/anchor-list";
import { useStore } from "vuex";
const store = useStore();
// import { seniorLayouts } from "@/views/dashboards/seniorDefaultData.js";
// import { commonLayouts } from "@/views/dashboards/defaultLayoutData.js";

const originalResizeObserver = window.ResizeObserver;

const createCustomResizeObserver = () => {
  const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        fn(...args);
      }, delay);
    };
  };

  window.ResizeObserver = class ResizeObserver extends originalResizeObserver {
    constructor(callback) {
      callback = debounce(callback, 100);
      super(callback);
    }
  };
};
const breakpoint = ref("lg");
const gridLayoutRef = ref(null);
const responsiveLayouts = reactive({});
const defaultLayout = ref([]);
const layoutType = computed(() => store.state.layout.layoutType);
const hasCpnItemMFunc = (name) => {
  if (responsiveLayouts[breakpoint.value]) {
    const hasCpn = responsiveLayouts[breakpoint.value]?.findIndex(
      (item) => item.name === name
    );
    return hasCpn !== -1;
  }
};
const isOperate = ref(false);
const layoutConfig = () => {
  isOperate.value = !isOperate.value;
};
const handleDel = (name) => {
  ElMessageBox.confirm("确认要删除该部件吗", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    for (const key in responsiveLayouts) {
      responsiveLayouts[key] = responsiveLayouts[key].filter(
        (item) => item.name !== name
      );
    }
  });
};

const showAddCpnModal = ref(false);
const hiddenAddCpnModal = () => {
  showAddCpnModal.value = false;
};
const layoutUpdatedEvent = (layout) => {
  // 获取初始布局
  const defaultLayoutArr = defaultLayout.value[breakpoint.value] || [];

  // 按 groupName 分类
  const groupMap = {};
  layout.forEach(item => {
    if (!groupMap[item.groupName]) groupMap[item.groupName] = [];
    groupMap[item.groupName].push(item);
  });

  let changed = false;

  Object.keys(groupMap).forEach(groupName => {
    // 找到标题组件
    const titleItem = groupMap[groupName].find(i => i.name === groupName + "标题");
    if (!titleItem) return;

    // 找到初始标题组件
    const defaultTitleItem = defaultLayoutArr.find(i => i.name === groupName + "标题");
    if (!defaultTitleItem) return;

    // 处理同组的其他组件
    groupMap[groupName].forEach(item => {
      if (item.name === groupName + "标题") return;
      // 如果y小于标题y，说明越界
      if (item.y < titleItem.y) {
        // 找到初始位置
        const defaultItem = defaultLayoutArr.find(i => i.name === item.name);
        if (defaultItem) {
          // 恢复相对位置
          item.y = titleItem.y + (defaultItem.y - defaultTitleItem.y);
          changed = true;
        }
      }
    });
  });

  if (changed) {
    // 更新响应式数据
    // responsiveLayouts[breakpoint.value] = JSON.parse(JSON.stringify(layout));
    nextTick(() => {
      gridLayoutRef.value && gridLayoutRef.value.resizeEvent && gridLayoutRef.value.resizeEvent();
    });
  }
};
const breakpointChangedEvent = (newBreakpoint) => {
  breakpoint.value =
    newBreakpoint == "lg" || newBreakpoint == "md" ? "lg" : "sm";
};

const handleAddCpn = () => {
  showAddCpnModal.value = true;
};

const groupList = ref([]);

const cpnList = ref([]);
const defaultCpnList = ref([]);
const allCpnList = ref([]);
const groupName = ref("全部");
const keyword = ref(undefined);
const anchorPoints = ref([]);
const fetchAllWorkbenchModule = () => {
  queryWorkbenchModule().then((res) => {
    if (res.data && Object.keys(res.data).length !== 0) {
      allCpnList.value = res.data;
      cpnList.value = res.data[breakpoint.value];
      defaultCpnList.value = res.data[breakpoint.value];
      const list = [
        ...new Set(res.data[breakpoint.value]?.map((item) => item.groupName)),
      ].map((i) => ({
        label: i,
        // options: res.data
        //   .filter((j) => j.groupName === i)
        //   .map((k) => ({ name: k.name, id: k.wbmId })),
        total:
          res.data[breakpoint.value].filter((j) => j.groupName === i).length ||
          0,
      }));
      const allCpn = {
        label: "全部",
        // options: res.data.map((item) => ({ name: item.name, id: item.wbmId })),
        total: res.data[breakpoint.value]?.length || 0,
      };
      list.unshift(allCpn);
      groupName.value = "全部";
      // const list = [...new Set(res.data.map((item) => item.groupName))]
      groupList.value = list;
    }
  });
};
const formatGroupList = (arr1, arr2) => {
  arr1.forEach((item1) => {
    const matchingItem = arr2.find((item2) => item2.label === item1.label);
    if (matchingItem) {
      item1.total = matchingItem.total;
    } else {
      item1.total = 0;
    }
  });
  return arr1;
};
const fetchCpnList = () => {
  const params = {
    keyword: keyword.value,
  };
  queryWorkbenchModule(params).then((res) => {
    if (res.data && Object.keys(res.data).length == 0) {
      allCpnList.value = {};
      cpnList.value = [];
      defaultCpnList.value = [];
      groupList.value.forEach((i) => {
        i.total = 0;
      });
      return false;
    }
    allCpnList.value = res.data;
    cpnList.value = res.data[breakpoint.value];
    defaultCpnList.value = res.data[breakpoint.value];
    const allCpn = {
      label: "全部",
      total: res.data[breakpoint.value]?.length || 0,
    };
    const list = [
      ...new Set(res.data[breakpoint.value].map((item) => item.groupName)),
    ].map((i) => ({
      label: i,
      total:
        res.data[breakpoint.value].filter((j) => j.groupName === i).length || 0,
    }));
    list.unshift(allCpn);
    const filterList = formatGroupList(groupList.value, list);
    groupList.value = filterList;
  });
};
const handleMenuClick = (label) => {
  groupName.value = label;
  if (label === "全部") {
    cpnList.value = defaultCpnList.value;
  } else {
    const filterList = defaultCpnList.value.filter(
      (item) => item.groupName === label
    );
    cpnList.value = filterList;
  }
};
const handleSearch = (val) => {
  keyword.value = val.target.value;
  groupName.value = "全部";
  fetchCpnList();
};

const cpnInfoSelected = ref({});
const hangleCpnClick = (values) => {
  cpnInfoSelected.value = values;
};
watch(cpnList, (newVal) => {
  if (newVal?.length) {
    const ishas = hasCpnItemMFunc(newVal[0].name)
    if (ishas) {
      cpnInfoSelected.value = {}
    }else{
      cpnInfoSelected.value = newVal[0] || {};
    }
  }else{
    cpnInfoSelected.value = {}
  }
});
//获取初始布局
const fetchWorkbenchConfig = () => {
  queryWorkbenchConfig().then((res) => {
    //高级工作台判断待办事项是否显示
    if(permissions.value.includes(496)){
      const index = res.data['lg']?.findIndex(item => item.name === '待办任务卡片')
      store.commit("workbench/UPDATE_SHOW_MATTER", index !== -1);
    }
    const data = JSON.parse(JSON.stringify(res.data));
    if (!res.data || Object.keys(res.data).length === 0) {
      return ElMessage.error("暂无工作台组件");
    }
    for (const key in res.data) {
      res.data[key].forEach((item) => {
        item.x = Number(item.x);
        item.y = Number(item.y);
        item.w = Number(item.w);
        item.h = Number(item.h);
        item.minH = Number(item.minH);
        item.minW = Number(item.minW);
      });
    }
    Object.assign(responsiveLayouts, res.data);
    defaultLayout.value = data;
    
    // // 确保在配置加载后应用正确的布局
    nextTick(() => {
      initBreakpoint();
    });
  });
};

const saveConfig = () => {
  const lgLayout = responsiveLayouts["lg"] || [];
  const smLayout = responsiveLayouts["sm"] || [];
  const params = {
    configList: [...lgLayout, ...smLayout],
  };
  ElMessageBox.confirm("确认要保存吗", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    saveWorkbenchConfig(params).then((res) => {
      if (res.success) {
        ElMessage.success("保存成功");
        isOperate.value = false;
      }
    });
  });
};

// const arraysAreEqual = () => {
//   return JSON.stringify(layout.value) === JSON.stringify(defaultLayout.value);
// };
const cancelSetLayout = () => {
  // if (arraysAreEqual()) {
  //   isOperate.value = false;
  // } else {
  ElMessageBox.confirm("是否要保存变动的内容", "提示", {
    confirmButtonText: "保存",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      const lgLayout = responsiveLayouts["lg"] || [];
      const smLayout = responsiveLayouts["sm"] || [];
      const params = {
        configList: [...lgLayout, ...smLayout],
      };
      saveWorkbenchConfig(params).then((res) => {
        if (res.success) {
          ElMessage.success("保存成功");
          isOperate.value = false;
        }
      });
    })
    .catch(() => {
      fetchWorkbenchConfig();
      isOperate.value = false;
    });
  // }
};

const addCpn = () => {
  if (!cpnInfoSelected.value.wbmId) {
    return ElMessage.error("请选择组件");
  }
  for (const key in responsiveLayouts) {
    const hasCpn = responsiveLayouts[key]?.findIndex(
      (item) => item.wbmId === cpnInfoSelected.value.wbmId
    );
    if (hasCpn !== -1) {
      return ElMessage.error("该组件已存在,请勿重复添加");
    }
    const layoutData = JSON.parse(JSON.stringify(responsiveLayouts[key]));
    const lastItem =
      layoutData.length > 0
        ? layoutData.reduce((prev, current) => {
            const prevY = parseInt(prev.y, 10);
            const prevX = parseInt(prev.x, 10);
            const currentY = parseInt(current.y, 10);
            const currentX = parseInt(current.x, 10);
            if (currentY > prevY) {
              return current;
            } else if (currentY === prevY && currentX > prevX) {
              return current;
            }
            return prev;
          })
        : null;
    let newX = 0;
    let newY = 0;
    if (lastItem) {
      const maxLength = key == "lg" ? 12 : 6;
      if (
        lastItem.x + lastItem.w + Number(cpnInfoSelected.value.w) >
        maxLength
      ) {
        newX = 0;
        newY = lastItem.y + lastItem.h;
      } else {
        newX = lastItem.x + lastItem.w;
        newY = lastItem.y;
      }
    }
    const newCpn = {
      ...cpnInfoSelected.value,
      x: newX,
      y: newY,
      w: Number(cpnInfoSelected.value.w),
      h: Number(cpnInfoSelected.value.h),
      minH: Number(cpnInfoSelected.value.minH),
      minW: Number(cpnInfoSelected.value.minW),
      i: cpnInfoSelected.value.wbmId,
      moduleType: key,
    };
    responsiveLayouts[key].push(newCpn);
  }
  showAddCpnModal.value = false;
  // 滚动到页面底部
  setTimeout(() => {
    const pageContent = document.querySelector(".page-content");
    if (pageContent) {
      pageContent.scrollTo({
        top: pageContent.scrollHeight,
        behavior: "smooth",
      });
    }
  }, 500);
};

// 从 Vuex 获取 layouts
const isShowMatter = computed(() => store.state.workbench.isShowMatter);
const permissions = computed(() => store.state.user.permissions);

// 当 store 中的 layouts 变化时，更新本地的 responsiveLayouts
watch(
  isShowMatter,
  (newVal) => {
    if (!permissions.value.includes(496)) {
      return false
    }
    if (!newVal) {
      const newLayoutData = JSON.parse(JSON.stringify(responsiveLayouts));
      // 从所有布局中移除 matter 组件
      for (const breakpoint in newLayoutData) {
        newLayoutData[breakpoint] = newLayoutData[breakpoint].filter(
          (item) => item.name !== "待办任务卡片"
        );
      }
      Object.assign(responsiveLayouts, newLayoutData);
      if (!isOperate.value) {
        const lgLayout = newLayoutData["lg"] || [];
        const smLayout = newLayoutData["sm"] || [];
        const params = {
          configList: [...lgLayout, ...smLayout],
        };
        saveWorkbenchConfig(params);
      }
    }else{
      const newLayoutData = JSON.parse(JSON.stringify(responsiveLayouts));
      const index = newLayoutData['lg']?.findIndex(item => item.name === '待办任务卡片')
      if(index !== -1){
        return false
      }
      // 从所有布局中添加 matter 组件
      for (const breakpoint in newLayoutData) {
        if(breakpoint=="lg"){
          newLayoutData[breakpoint].forEach(item => {
            item.y += 6
          })
          newLayoutData[breakpoint].unshift({
            x: 0,
            y: 0,
            w: 12,
            h: 6,
            minH: 6,
            minW: 12,
            wbmId: 97,
            i: 97,
            cpn: "MatterContainer",
            moduleType: "lg",
            name: "待办任务卡片"
          })
        }else{
          newLayoutData[breakpoint].forEach(item => {
            item.y += 6
          })
          newLayoutData[breakpoint].unshift({
            x: 0,
            y: 0,
            w: 6,
            h: 12,
            minH: 12,
            minW: 6,
            wbmId: 98,
            i: 98,
            cpn: "MatterContainer",
            moduleType: "sm",
            name: "待办任务卡片"
          })
        }
      }
      Object.assign(responsiveLayouts, newLayoutData);
      if (!isOperate.value) {
        const lgLayout = newLayoutData["lg"] || [];
        const smLayout = newLayoutData["sm"] || [];
        const params = {
          configList: [...lgLayout, ...smLayout],
        };
        saveWorkbenchConfig(params);
      }
      setTimeout(() => {
        const pageContent = document.querySelector(".page-content");
        if (pageContent) {
          pageContent.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  },
  { deep: true }
);
const fetchAnchorPointList = () => {
  // 从页面中获取所有 .cpn-title 元素的文字，按照页面顺序排序
  const titleElements = document.querySelectorAll('.cpn-title')
  console.log(titleElements,'titleElements ');
  
  
  // 创建一个包含元素和其位置的数组
  const elementsWithPosition = Array.from(titleElements).map(element => {
    const rect = element.getBoundingClientRect()
    const name = element.textContent?.trim() || element.innerText?.trim() || ''
    return {
      element,
      name,
      top: rect.top,
    }
  }).filter(item => item.name) // 过滤掉空名称
  console.log(elementsWithPosition,'elementsWithPosition');
  
  
  // 按照页面位置排序：按top（垂直位置）
  elementsWithPosition.sort((a, b) => {
    // 否则按垂直位置排序
    return a.top - b.top
  })
  
  const result = elementsWithPosition.map(item => ({
    name: item.name,
    icon: getAnchorIcon(item.name)
  }))
  
  anchorPoints.value = result
  console.log(result,'筛选结果@@');
}

// 根据名称获取对应的图标
const getAnchorIcon = (name) => {
  const iconMap = {
    '经营状况': 'mdi mdi-trending-up',
    '绩效管理': 'mdi mdi-chart-bar',
    '客户管理': 'mdi mdi-account-group',
    '产品管理': 'mdi mdi-cart',
    '人力资源': 'mdi mdi-account',
    '业务数据': 'mdi mdi-database'
  }
  return iconMap[name] || 'mdi mdi-circle'
}
// 初始化 breakpoint 的函数
const initBreakpoint = () => {
  // 获取 grid-layout 容器的宽度
  const gridContainer = document.querySelector('.pageHome');
  const containerWidth = gridContainer.clientWidth;
  // 根据宽度设置初始 breakpoint
  breakpoint.value = containerWidth > 996 ? 'lg' : 'sm';
  //等布局全部渲染后再获取锚点
  setTimeout(() => {
    fetchAnchorPointList()
  }, 500);
};



// 修改 onMounted 钩子
onMounted(() => {
  createCustomResizeObserver();
  fetchWorkbenchConfig();
  fetchAllWorkbenchModule();
});

onUnmounted(() => {
  // 恢复原始的 ResizeObserver
  window.ResizeObserver = originalResizeObserver;
});
</script>


<template>
  <Layout>
    <div
      class="custom-layout-icon"
      :style="{ top: layoutType === 'vertical' ? '110px' : '168px' }"
      v-if="
        store.state.user.permissions.includes(497) ||
        store.state.user.permissions.includes(496)
      "
    >
      <el-tooltip
        v-if="!isOperate"
        effect="dark"
        content="工作台配置"
        placement="left-start"
      >
        <span
          @click="layoutConfig"
          class="bx bx-layout"
          style="color: #556ee6; font-size: 25px; cursor: pointer"
        ></span>
      </el-tooltip>
      <el-tooltip
        v-if="isOperate"
        effect="dark"
        content="取消"
        placement="left-start"
      >
        <span
          @click="cancelSetLayout"
          class="bx bx-window-close"
          style="color: #556ee6; font-size: 25px; cursor: pointer"
        ></span>
      </el-tooltip>
      <el-tooltip
        v-if="isOperate"
        effect="dark"
        content="添加部件"
        placement="left-start"
      >
        <span
          class="bx bx-add-to-queue"
          @click="handleAddCpn"
          style="color: #556ee6; font-size: 25px; cursor: pointer"
        ></span>
      </el-tooltip>
      <el-tooltip
        v-if="isOperate"
        effect="dark"
        content="保存"
        placement="left-start"
      >
        <span
          class="bx bx-save"
          @click="saveConfig"
          style="color: #556ee6; font-size: 25px; cursor: pointer"
        ></span>
      </el-tooltip>
    </div>
    <div
      class="pageHome"
      :style="{ 'user-select': isOperate ? 'none' : 'auto' }"
    >
      <div
        class="layout"
        v-if="responsiveLayouts[breakpoint]?.length > 0"
      >
        <grid-layout
          :layout="responsiveLayouts[breakpoint]"
          :row-height="30"
          :is-draggable="isOperate"
          :is-resizable="isOperate"
          :responsiveLayouts="responsiveLayouts"
          :is-mirrored="false"
          :vertical-compact="true"
          :margin="[20, 20]"
          :use-css-transforms="true"
          @breakpoint-changed="breakpointChangedEvent"
          :breakpoints="{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }"
          :cols="{ lg: 12, md: 12, sm: 6, xs: 6, xxs: 6 }"
          :responsive="true"
          ref="gridLayoutRef"
          @layout-updated="layoutUpdatedEvent"
        >
          <grid-item
            v-for="item in responsiveLayouts[breakpoint]"
            :x="Number(item.x)"
            :y="Number(item.y)"
            :w="Number(item.w)"
            :h="Number(item.h)"
            :i="item.wbmId"
            :key="item.name"
            :minH="Number(item.minH)"
            :minW="Number(item.minW)"
            :is-resizable="isOperate && item.delable != 0"
            :is-draggable="isOperate && item.delable != 0"
          >
            <div
              class="overlay"
              v-if="isOperate"
            ></div>
            <div
              class="h-100 w-100"
              v-if="item.isChart == 1"
            >
              <ConfigContainer
                :defaultPanelId="item.panelId"
                :chartTitle="item.name"
                :chartDesc="item.panelDesc"
                :groupName="item.groupName"
              />
            </div>
            <component
              :containerHegiht="
                item.h == 1 ? 30 : item.h * 30 + (item.h - 1) * 20
              "
              :cardDesc="item.panelDesc"
              v-else
              :is="CPNS[item.cpn]"
            ></component>
            <div
              class="del-icon"
              v-if="isOperate && item.delable != 0"
              @click="handleDel(item.name)"
            >
              <span class="mdi mdi-close-circle"></span>
            </div>
          </grid-item>
        </grid-layout>
      </div>
    </div>
    
    <!-- 锚点列表组件 -->
    <AnchorList :anchorPoints="anchorPoints" />
  </Layout>
  <b-modal
    v-model="showAddCpnModal"
    @hidden="hiddenAddCpnModal"
    centered
    hide-footer
    hide-header
    size="lg"
    :lazy="true"
    style="padding: 0"
    dialog-class="add-cpn-modal"
  >
    <div class="add-container">
      <div class="left">
        <div class="title">添加组件</div>
        <div class="left-content">
          <div class="search">
            <el-input
              v-model="keyword"
              placeholder="搜索"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <span class="bx bx-search"></span>
              </template>
            </el-input>
          </div>
          <div class="navigation-menu">
            <div
              class="menu-item"
              v-for="(item, index) in groupList"
              :key="index"
              :class="{ 'menu-item-selected': groupName === item.label }"
            >
              <div
                class="item-content"
                @click="handleMenuClick(item.label)"
              >
                <div
                  class="mdi mdi-view-grid-outline"
                  style="font-size: 18px; color: #556ee6"
                ></div>
                <div>{{ item.label }} ·</div>
                <div>{{ item.total }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="header">
          <div>{{ groupName }}</div>
          <span
            class="mdi mdi-close"
            @click="hiddenAddCpnModal"
            style="font-size: 18px; cursor: pointer"
          ></span>
        </div>
        <div class="right-content">
          <div v-if="cpnList?.length">
            <el-card
              shadow="never"
              class="right-card"
              v-for="item in cpnList"
              :key="item.wbmId"
              @click="hangleCpnClick(item)"
              :style="{'pointer-events':hasCpnItemMFunc(item.name)?'none':'auto'}"
              :class="{
                'right-card-selected': cpnInfoSelected.wbmId === item.wbmId||hasCpnItemMFunc(item.name),
              }"
            >
              <div>
                <div class="card-content">
                  <div class="card-title">{{ item.name }}</div>
                  <div class="card-desc">{{ item.panelDesc }}</div>
                </div>
              </div>
              <div
                class="check-icon"
                v-if="cpnInfoSelected.wbmId === item.wbmId"
              >
                <span class="bx bxs-check-circle"></span>
              </div>
            </el-card>
          </div>
          <div
            v-else
            class="d-flex justify-content-center align-items-center h-100"
          >
            <el-empty />
          </div>
        </div>
        <div class="right-footer text-end">
          <b-button
            variant="light"
            @click="hiddenAddCpnModal"
            >取消</b-button
          >
          <a
            class="btn btn-primary ms-1"
            @click="addCpn"
          >
            确定
          </a>
        </div>
      </div>
    </div>
  </b-modal>
</template>
<style scoped>
:deep(.page-content) {
  padding: 50px 0 0 !important;
  position: relative;
}
</style>
<style lang="scss">
.add-cpn-modal {
  max-width: 980px;
  width: 980px;
  .modal-body {
    padding: 0;
  }
}
.add-container {
  display: flex;
  .left {
    width: 25%;
    height: 100%;
    background: #fbfbfb;
    border-right: 1px solid #e4e7ed;
    .title {
      font-size: 16px;
      padding: 0 28px;
      height: 56px;
      display: flex;
      align-items: center;
    }
    .left-content {
      height: 600px;
      .search {
        margin: 4px 32px;
      }
      .navigation-menu {
        font-size: 14px;
        padding: 4px 12px;
        max-height: calc(100% - 54px);
        overflow-y: auto;
        .menu-item-selected {
          background-color: #6698ff1a;
        }
        .menu-item {
          cursor: pointer;
          margin-top: 4px;
          margin-bottom: 8px;
          &:hover {
            background-color: #6698ff1a;
          }
          .item-content {
            height: 36px;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 0 12px 0 20px;
          }
        }
      }
    }
  }
  .right {
    font-size: 14px;
    width: 75%;
    height: 660px;
    background: #fff;
    .header {
      height: 56px;
      padding: 0 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .right-content {
      height: calc(100% - 124px);
      overflow-y: auto;
      padding: 10px 32px;
      .right-card-selected {
        background-color: #6698ff1a;
        border: 1px solid #556ee6;
      }
      .right-card {
        cursor: pointer;
        position: relative;
        &:hover {
          border: 1px solid #556ee6;
        }
        margin-bottom: 8px;
        .check-icon {
          position: absolute;
          color: #556ee6;
          right: 10px;
          top: 10px;
          font-size: 16px;
        }
      }
      .card-content {
        height: 60px;
        .card-title {
          margin-bottom: 8px;
        }
        .card-desc {
          color: #999999;
        }
      }
    }
    .right-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      height: 68px;
      margin: 0 32px;
      gap: 8px;
    }
  }
}
.custom-layout-icon {
  z-index: 9;
  position: fixed;
  right: 9px;
  top: 110px;
  background-color: #fff;
  border: 1px solid #e5e6e7;
  width: 40px;
  box-sizing: border-box;
  padding: 3px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  flex-direction: column;
  gap: 12px;
}
.overlay {
  margin: 20px 0 20px;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: calc(100% - 40px);
  background-color: transparent;
  -webkit-user-drag: none;
  z-index: 2; /* 确保遮罩层在内部元素之上 */
}
.del-icon {
  cursor: pointer;
  position: absolute;
  right: -9px;
  top: -12px;
  font-size: 20px;
  color: #f56c6c;
}
.vue-grid-item.vue-grid-placeholder {
  background: #556ee6 !important;
}
</style>
