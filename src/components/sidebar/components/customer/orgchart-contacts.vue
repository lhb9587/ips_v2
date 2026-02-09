<template>
  <div
    style="position: relative; width: 100%"
    class="orgchart-contacts"
  >
    <el-tooltip
      content="全屏"
      placement="top"
      v-if="treeData.length"
    >
      <div
        @click="toggleFullScreen"
        style="
          position: absolute;
          right: 10px;
          top: 10px;
          z-index: 10;
          cursor: pointer;
          font-size: 20px;
        "
      >
        <span class="bx bx-fullscreen"></span>
      </div>
    </el-tooltip>
    <div
      v-if="treeData.length > 0"
      id="chart-container"
      ref="chartContainer"
      style="width: 100%; height: 100%; background-color: #f6f6f6"
    ></div>
    <el-empty
      v-else
      description="暂无数据"
    />
    <el-dialog
      v-model="showOurContactsModal"
      title="我方联系人-查看"
      width="800px"
      align-center
      :show-close="true"
      :footer="null"
      :append-to-body="false"
      :modal-append-to-body="false"
    >
      <div class="table-responsive">
        <table
          class="table table-td-nowrap mb-0"
          style="width: 100%"
        >
          <tbody>
            <tr>
              <th
                scope="row"
                style="width: 15%"
              >
                姓名 :
              </th>
              <td style="width: 35%">
                {{ selectedPerson.fullname }}
              </td>
              <th
                scope="row"
                style="width: 15%"
              >
                业务领域 :
              </th>
              <td style="width: 35%">{{ selectedPerson.business }}</td>
            </tr>
            <tr>
              <th scope="row">案件类型 :</th>
              <td>
                {{ selectedPerson.caseTypeStr }}
              </td>
              <th scope="row">职位 :</th>
              <td>{{ selectedPerson.position }}</td>
            </tr>
            <tr>
              <th scope="row">开始日期 :</th>
              <td>
                {{ selectedPerson.startdate }}
              </td>
              <th scope="row">截至日期 :</th>
              <td>{{ selectedPerson.enddate }}</td>
            </tr>
            <tr>
              <th scope="row">角色描述 :</th>
              <td>
                {{ selectedPerson.userrole }}
              </td>
              <th scope="row">能否查看全部案件 :</th>
              <td>{{ selectedPerson.ischeck ? "是" : "否" }}</td>
            </tr>
            <tr>
              <th scope="row">能否查看全部时限 :</th>
              <td>
                {{ selectedPerson.isAllTlt ? "是" : "否" }}
              </td>
              <th scope="row">是否处理全部报告 :</th>
              <td>{{ selectedPerson.mailtodoStr }}</td>
            </tr>
            <tr>
              <th scope="row">备注 :</th>
              <td
                colspan="3"
                style="white-space: normal"
              >
                {{ selectedPerson.memo }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </el-dialog>
  </div>

  <!-- 详细信息弹框 -->
  <ContactsInfoModal
    v-if="showDetailModal"
    :showDetailModal="showDetailModal"
    :detailInfos="contactInfo"
    :orgName="customerInfo.fullname"
    @close="showDetailModal = false"
  />
</template>

<script setup>
import {
  onMounted,
  onUnmounted,
  nextTick,
  ref,
  computed,
  defineProps,
  watch,
} from "vue";
import TreeSpider from "treespider";
import "treespider/dist/css/treeSpider.css";
import ContactsInfoModal from "./contacts-info-modal.vue";
import defaultAvatar from "@/assets/images/users/defaultavatar.png";
import { queryCustomerContactUrl } from "@/api/customerList";

// 定义props
const props = defineProps({
  custId: {
    type: Number,
  },
  contactstype: {
    type: String,
    default: "customer",
  },
  customerInfo: {
    type: Object,
    default: () => ({}),
  },
  dataList: {
    type: Array,
    default: () => [],
  },
});

const customerInfo = computed(() => props.customerInfo);
const treeData = computed(() => props.dataList);
const DEFAULT_IMG = defaultAvatar;
const contactInfo = ref({});

function fallbackSvgImages(defaultImg) {
  const container = document.getElementById("chart-container");
  if (!container) return;
  const svgImgs = container.querySelectorAll("image");
  svgImgs.forEach((img) => {
    const href = img.getAttribute("href") || img.getAttribute("xlink:href");
    if (!href) return;
    const testImg = new window.Image();
    testImg.onload = function () {
      // 加载成功，无需处理
    };
    testImg.onerror = function () {
      img.setAttribute("href", defaultImg);
      img.setAttribute("xlink:href", defaultImg);
    };
    testImg.src = href;
  });
}

watch(treeData, async () => {
  if (treeSpiderInstance) {
    treeSpiderInstance?.destroy?.();
    treeSpiderInstance = null;
  }
  if (treeData.value.length > 0) {
    await nextTick();
    treeSpiderInstance = new TreeSpider({
      targetContainer: "#chart-container",
      color_range: ["#52a0f5", "#52a0f5"],
      tree_data: treeData.value,
      tree_type: "hSpider",
      chart_head_type: "landscape",
      height: chartContainer.value?.offsetHeight + "px",
    });
    // 渲染后再处理头像兜底
    setTimeout(async () => {
      fallbackSvgImages(DEFAULT_IMG);
    }, 200);
  }
});

// 弹框状态
const showDetailModal = ref(false);
const showOurContactsModal = ref(false);

// 选中的人员信息
const selectedPerson = ref({});


function handleDocumentClick(event) {
  // 全屏时，不进行点击事件处理
  if (document.fullscreenElement) {
    return;
  }
  const target = event.target;
  const svgCard = target.closest("svg.main-svg-el");
  if (!svgCard) return;
  if (target.closest(".ts-linker")) return;

  // 获取节点名称
  const textElement = svgCard.querySelector("text");
  if (!textElement) return;
  const name = textElement.textContent || "";

  // 1. 精确匹配
  let person = treeData.value.find((p) => p.name === name);

  // 2. 若无精确匹配，按首尾单词匹配
  if (!person) {
    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length >= 2) {
      const first = nameParts[0];
      const last = nameParts[nameParts.length - 1];
      person = treeData.value.find((p) => {
        const pParts = (p.name || "").trim().split(/\s+/);
        return (
          pParts.length >= 2 &&
          pParts[0] === first &&
          pParts[pParts.length - 1] === last
        );
      });
    }
  }

  if (person) {
    selectedPerson.value = { ...person };
    if (props.contactstype == "customer") {
      showDetailModal.value = true;
      queryCustomerContactUrl({
        custContactId: person.custContactId,
      }).then((res) => {
        contactInfo.value = res.data;
      });
    } else {
      if (!selectedPerson.value.noDetail) {
        showOurContactsModal.value = true;
      }
    }
  }
}

function handleMouseEnter(event) {
  const path = event.composedPath();
  const svgCard = path.find(
    (el) => el instanceof Element && el.matches && el.matches("svg.main-svg-el")
  );
  if (!svgCard) return;

  const isOnLinker = path.some(
    (el) => el instanceof Element && el.matches && el.matches(".ts-linker")
  );
  if (isOnLinker) return;

  // const name = svgCard.querySelector("text")?.textContent;
}

const chartContainer = ref(null);
let treeSpiderInstance = null;

function toggleFullScreen() {
  const el =
    chartContainer.value || document.getElementById("orgchart-contacts");
  if (!document.fullscreenElement) {
    el.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

function handleFullscreenChange() {
  nextTick(() => {
    if (treeSpiderInstance && typeof treeSpiderInstance.resize === "function") {
      treeSpiderInstance.resize();
    } else if (treeSpiderInstance) {
      setTimeout(() => {
        treeSpiderInstance?.destroy?.();
        treeSpiderInstance = new TreeSpider({
          targetContainer: "#chart-container",
          color_range: ["#52a0f5", "#52a0f5"],
          tree_data: treeData.value,
          tree_type: "hSpider",
          chart_head_type: "landscape",
          height: chartContainer.value?.offsetHeight + "px",
          width: chartContainer.value?.offsetWidth + "px",
        });
        setTimeout(() => fallbackSvgImages(DEFAULT_IMG), 200); // 全屏切换后检测头像
      }, 100);
    }
  });
}

onMounted(async () => {
  await nextTick();
  setTimeout(() => {
    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("mouseenter", handleMouseEnter, true);
  }, 500);
  document.addEventListener("fullscreenchange", handleFullscreenChange);
  if (treeData.value.length > 0) {
    treeSpiderInstance = new TreeSpider({
      targetContainer: "#chart-container",
      color_range: ["#52a0f5", "#52a0f5"],
      tree_data: treeData.value,
      tree_type: "hSpider",
      chart_head_type: "landscape",
      height: chartContainer.value?.offsetHeight + "px",
    });
    setTimeout(async () => {
      fallbackSvgImages(DEFAULT_IMG);
    }, 200);
  }
});

onUnmounted(() => {
  document.removeEventListener("click", handleDocumentClick);
  document.removeEventListener("mouseenter", handleMouseEnter, true);
  document.removeEventListener("fullscreenchange", handleFullscreenChange);
});
</script>

<style lang="scss" scoped>
@keyframes slideUp {
  from {
    transform: translate(-50%, 20px);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.orgchart-contacts {
  height: calc(100vh - 240px);
}
</style>
