<template>
  <b-modal
    v-model="detailModalStatus"
    :no-close-on-backdrop="true"
    centered
    size="lg"
    :no-fade="true"
    :no-close-on-esc="true"
    body-class="meinfo-modal"
    hide-footer
  >
    <template #header>
      <div
        class="my-header"
        style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        "
      >
        <div class="d-flex align-items-center">
          <span style="font-size: 16px">{{
            eventDetail.custName || "客户事件详情"
          }}</span>
          <el-popover
            placement="bottom-start"
            title="事件类型描述"
            :width="500"
            trigger="hover"
            ref="descPopoverRef"
            popper-style="{'width':'auto'}"
          >
            <template #reference>
              <i
                class="bx bx-help-circle"
                style="font-size: 16px; cursor: pointer; margin-left: 4px"
              ></i>
            </template>
            <div>
              <div class="d-flex">
                <div class="tip-title">关联公司变更：</div>
                <div>客户发生控股、被控股、并购、股东变更等情况；</div>
              </div>
              <div class="d-flex">
                <div class="tip-title">对手公司动态：</div>
                <div>关注的竞争对手发生了重要行为，如诉讼、战略变动；</div>
              </div>
              <div class="d-flex">
                <div class="tip-title">内部结构调整：</div>
                <div>客户出现重大高管更替、组织架构调整；</div>
              </div>
              <div class="d-flex">
                <div class="tip-title">法律诉讼：</div>
                <div>涉及客户或对手方的重大案件、判决</div>
              </div>
              <div class="d-flex">
                <div class="tip-title">商业合作：</div>
                <div>客户与第三方达成战略合作、合资等；</div>
              </div>
              <div class="d-flex">
                <div class="tip-title">风险信息：</div>
                <div>涉及客户的不良舆论、处罚、媒体曝光等；</div>
              </div>
              <div class="d-flex">
                <div class="tip-title">行业政策影响：</div>
                <div>新政/监管规则对客户经营有重大影响（如平台监管加强）。</div>
              </div>
            </div>
          </el-popover>
        </div>
        <div
          style="width: 16px; cursor: pointer"
          @click="closeDetailModal"
        >
          <span class="btn-close"></span>
        </div>
      </div>
    </template>
    <div class="meinfo-detail-table">
      <el-row gutter="24">
        <el-col :span="12">
          <div class="meinfo-label">事件标题</div>
          <div class="meinfo-value">{{ eventDetail.title }}</div>
        </el-col>
        <el-col :span="12">
          <div class="meinfo-label">事件类型</div>
          <div class="meinfo-value">
            <el-tag
              type="warning"
              effect="light"
              round
              >{{ eventDetail.eventTypeStr }}</el-tag
            >
          </div>
        </el-col>
      </el-row>
      <el-row gutter="24">
        <el-col :span="12">
          <div class="meinfo-label">涉及公司</div>
          <div class="meinfo-value">
            <template v-if="eventDetail.involvedCompanies">
              <div
                v-for="(item, idx) in eventDetail.involvedCompanies.split(
                  /;|；/
                )"
                :key="idx"
              >
                {{ item }}
              </div>
            </template>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="meinfo-label">时间</div>
          <div class="meinfo-value">{{ eventDetail.eventDate }}</div>
        </el-col>
      </el-row>
      <div class="meinfo-label">事件描述</div>
      <div class="meinfo-desc-block">
        <div class="meinfo-desc">
          {{ eventDetail.description }}
        </div>
      </div>
      <el-row
        gutter="24"
        class="meinfo-bottom-row"
      >
        <el-col :span="12">
          <div class="meinfo-label">来源</div>
          <div class="meinfo-value">
            <span class="clickable" @click="openUrl(eventDetail.eventSource)" v-if="isValidUrl(eventDetail.eventSource)">{{ eventDetail.eventSource }}</span>
            <span v-else>{{ eventDetail.eventSource }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="meinfo-label">添加人</div>
          <div class="meinfo-value">{{ eventDetail.createUserIdStr }}</div>
        </el-col>
      </el-row>
    </div>
    <div
      class="text-end modal-footer modal-footer-more"
      v-if="showFooter"
    >
      <div
        style="
          display: flex;
          align-items: center;
          cursor: pointer;
          color: #556ee6;
        "
        @click="showCustDetail"
      >
        <span>查看该客户更多重大事件</span>
        <span
          class="bx bx-right-arrow-alt"
          style="font-size: 16px; margin-left: 4px"
        ></span>
      </div>
    </div>
  </b-modal>
  <CustomerSidebar
    :custId="eventDetail.custId"
    v-if="isShowDetail"
    :showSidebar="isShowDetail"
    @update:showSidebar="handleSidebarUpdate"
    defaultComponent="MajorEvents"
  />
</template>

<script setup>
import { defineEmits, defineProps, computed, ref } from "vue";
import CustomerSidebar from "@/components/sidebar/customer-sidebar";

const props = defineProps({
  eventDetail: {
    type: Object,
    default: () => {},
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
  showFooter: {
    type: Boolean,
    default: true,
  },
});
const isShowDetail = ref(false);
const handleSidebarUpdate = (value) => {
  isShowDetail.value = value;
};
const showCustDetail = () => {
  isShowDetail.value = true;
  emit("update:modelValue", false);
};
const emit = defineEmits(["update:modelValue", "closeModal"]);
const detailModalStatus = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit("update:modelValue", val);
  },
});
const closeDetailModal = () => {
  emit("update:modelValue", false);
  setTimeout(() => {
    emit("closeModal");
  }, 200);
};
const openUrl = (url) => {
  window.open(url, '_blank');
}
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (e) {
    return false;
  }
}
</script>

<style lang="scss" scoped>
.meinfo-detail-table {
  padding: 8px 0 0 0;
}
.meinfo-detail-table .el-row {
  margin-bottom: 16px;
}
.meinfo-label {
  color: #888;
  font-size: 14px;
  margin-bottom: 6px;
  line-height: 1.2;
}
.meinfo-value {
  margin-bottom: 8px;
  line-height: 1.5;
  word-break: break-all;
  font-size: 14px;
}
.meinfo-desc-block {
  background: #f7f8fa;
  border-radius: 6px;
  padding: 12px 16px;
  margin: 16px 0 12px 0;
  min-height: 75px;
}
.meinfo-desc-block .meinfo-label {
  margin-bottom: 4px;
}
.meinfo-desc-block .meinfo-desc {
  color: #555;
  font-size: 14px;
  line-height: 1.7;
}
.meinfo-bottom-row {
  margin-top: 8px;
}
.meinfo-bottom-row .meinfo-value {
  margin-bottom: 0;
}
.tip-title {
  width: 100px;
  text-align: right;
}
.modal-footer-more {
  padding-bottom: 0;
}
</style>
