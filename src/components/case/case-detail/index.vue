<script>
import Layout from "@/layouts/main";
import caseDetailCommon from "@/mixins/caseDetailCommon";
import CaseDetailHeader from "@/components/case/case-detail/CaseDetailHeader.vue";
import CaseDetailBody from "@/components/case/case-detail/CaseDetailBody.vue";

export default {
  mixins: [caseDetailCommon],
  components: {
    Layout,
    CaseDetailHeader,
    CaseDetailBody,
  },
  computed: {
    caseId() {
      return Number(this.$route?.params?.caseId);
    },
    taskType() {
      return Number(this.$route?.query?.taskType);
    },
  },
  methods: {
    backtoList() {
      // this.$router.push({ name: "case-folders" });
      this.$router.back();
    },
  },
};
</script>
<template>
  <Layout>
    <div>
      <div class="case-detail-header">
        <CaseDetailHeader
          :caseInfo="caseInfo"
          :subscribeStatus="subscribeStatus"
          @subscribe="handleSubscribe"
        >
          <template #title-prefix>
            <button type="button" class="detail-close-btn" aria-label="关闭" @click="backtoList">
              <svg class="detail-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
              <span class="detail-close-text">关闭</span>
            </button>
          </template>
        </CaseDetailHeader>
      </div>
      <CaseDetailBody
        :taskType="taskType"
        :componentName="componentName"
        :isExpanded="isExpanded"
        :abroadBillList="abroadBillList"
        :feeList="feeList"
        :caseInfo="caseInfo"
        :imageLoadError="imageLoadError"
        :custGrpImgError="custGrpImgError"
        :cbGrpImgError="cbGrpImgError"
        :lcGrpImgError="lcGrpImgError"
        rootClass="row h-100 case-detail-content"
        colClass="col-12 h-100 p-0"
        @set-component="checkComponent"
        @toggle-expanded="handleExpanded"
        @image-error="handleImageError"
        @cust-grp-img-error="handleCustGrpImgError"
        @cb-grp-img-error="handleCbGrpImgError"
        @lc-grp-img-error="handleLcGrpImgError"
      />
    </div>
  </Layout>
</template>

<style scoped>
.drag-handle {
  position: absolute;
  left: 0;
  top: 0;
  width: 10px;
  height: 100%;
  cursor: col-resize;
  background: transparent;
  z-index: 10;
}

.drag-handle:hover {
  background-color: rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s;
}

.drag-handle:active {
  background-color: rgba(0, 0, 0, 0.2);
}

.case-detail-header {
  background-color: #fff;
  padding: 8px 16px;
  position: relative;
}
.case-detail-content {
  padding: 16px;
}
.case-detail-back {
  font-size: 18px;
  cursor: pointer;
  margin-right: 8px;
}
.detail-close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 32px;
  padding: 0 8px 0 8px;
  color: var(--pa-text, #1d2a3a);
  background: var(--pa-page-bg, #f3f6fb);
  border: 1px solid var(--pa-border, #e1e7f2);
  border-radius: 8px;
  cursor: pointer;
  transition: color 0.2s, background 0.2s, border-color 0.2s, transform 0.15s;
  flex-shrink: 0;
  font-size: 14px;
}
.detail-close-btn:hover {
  color: var(--pa-text, #1d2a3a);
  background: #e8ecf4;
  border-color: #d0d8e8;
  transform: scale(1.02);
}
.detail-close-btn:active {
  transform: scale(0.98);
}
.detail-close-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
.detail-close-text {
  font-weight: 500;
  letter-spacing: 0.02em;
}
</style>
