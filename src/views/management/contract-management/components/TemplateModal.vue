<template>
  <div class="add-container">
    <div class="left">
      <div class="title">合同模板</div>
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
            :class="{ 'menu-item-selected': templateTypeName === item.label }"
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
        <div>{{ templateTypeName }}</div>
        <span
          class="mdi mdi-close"
          @click="closeModal"
          style="font-size: 18px; cursor: pointer"
        ></span>
      </div>
      <div class="right-content">
        <div v-if="templateList.length">
          <div class="template-list">
            <div
              class="template-item"
              v-for="item in templateList"
              :key="item.id"
              @click="handleClick(item)"
              :class="{
                'template-item-selected': templateSelected.id === item.id,
              }"
            >
              <div
                class="template-image"
                :style="{ backgroundImage: `url(/ipdoc${item.templateCover})` }"
              >
                <div class="template-title">{{ item.templateName }}</div>
                <!-- 使用 title 字段 -->
              </div>
              <div
                class="check-icon"
                v-if="templateSelected.id === item.id"
              >
                <span class="bx bxs-check-circle"></span>
              </div>
            </div>
          </div>
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
          @click="closeModal"
          >取消</b-button
        >
        <a
          class="btn btn-primary ms-1"
          @click="submitTemplate"
        >
          下载
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits, onMounted } from "vue";
import { queryContractTemplates } from "@/api/contract";
import { ElMessage } from "element-plus";
import { downLoad } from "@/utils";

const emits = defineEmits(["hiddenTemplateModal"]);

// const showModal = ref(true)
const keyword = ref("");
const templateTypeName = ref("全部");
const templateList = ref([]);
const templateSelected = ref({});
const defaultTemplateList = ref([]);
const groupList = ref([]);

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

const handleSearch = (value) => {
  console.log("value:", value);
  queryContractTemplates({ templateName: value.target.value }).then((res) => {
    templateList.value = res.data || [];
    defaultTemplateList.value = res.data || [];
    const list = [
      ...new Set(res.data?.map((item) => item.templateTypeName)),
    ].map((i) => ({
      label: i,
      total: res.data.filter((j) => j.templateTypeName === i).length || 0,
    }));
    const allCpn = {
      label: "全部",
      total: res.data?.length || 0,
    };
    list.unshift(allCpn);
    templateTypeName.value = "全部";
    const filterList = formatGroupList(groupList.value, list);
    groupList.value = filterList;
  });
};

const fetchTemplateList = () => {
  queryContractTemplates().then((res) => {
    templateList.value = res.data || [];
    defaultTemplateList.value = res.data || [];
    const list = [
      ...new Set(res.data?.map((item) => item.templateTypeName)),
    ].map((i) => ({
      label: i,
      total: res.data.filter((j) => j.templateTypeName === i).length || 0,
    }));
    const allCpn = {
      label: "全部",
      total: res.data?.length || 0,
    };
    list.unshift(allCpn);
    templateTypeName.value = "全部";
    groupList.value = list;
  });
};

// 合同类型点击
const handleMenuClick = (label) => {
  templateTypeName.value = label;
  if (label === "全部") {
    templateList.value = defaultTemplateList.value;
  } else {
    const filterList = defaultTemplateList.value.filter(
      (item) => item.templateTypeName === label
    );
    templateList.value = filterList;
  }
};

const handleClick = (values) => {
  templateSelected.value = values;
};

const submitTemplate = () => {
  if (!templateSelected.value.id) {
    ElMessage.error("请选择合同模板");
    return false;
  } else {
    downLoad(
      templateSelected.value.templateAddress,
      templateSelected.value.templateName
    );
  }
};

const closeModal = () => {
  emits("hiddenTemplateModal");
};

onMounted(() => {
  fetchTemplateList();
});
</script>
<style lang="scss" scoped>
.add-container {
  display: flex;
  padding: 0;
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
    .template-list {
      display: flex;
      flex-wrap: wrap; /* 允许换行 */
      gap: 32px;
    }

    .template-item {
      width: 30%; /* 每个合同项占据30%宽度，三条一行 */
      margin-bottom: 20px; /* 每个项之间的间距 */
      position: relative; /* 使绝对定位的子元素相对于此元素定位 */
      cursor: pointer;
    }
    .template-item-selected {
      border: 1px solid #556ee6;
    }

    .template-image {
      width: 100%; /* 设置宽度为100% */
      height: 280px; /* 设置高度为420px，接近A4纸的比例 */
      background-color: #f0f0f0; /* 默认背景色 */
      background-size: cover; /* 背景图覆盖 */
      background-position: center; /* 背景图居中 */
      display: flex;
      align-items: flex-end; /* 使标题在底部 */
      padding: 10px; /* 内边距 */
    }
    .template-title {
      background-color: rgba(0, 0, 0, 0.5); /* 半透明背景 */
      padding: 5px; /* 内边距 */
      border-radius: 4px; /* 圆角 */
      color: white; /* 确保文本颜色为白色 */
      font-weight: bold; /* 标题加粗 */
      z-index: 1; /* 确保标题在其他元素之上 */
    }

    .check-icon {
      position: absolute;
      color: #556ee6;
      right: 10px;
      top: 10px;
      font-size: 16px;
    }
  }
}
</style>
