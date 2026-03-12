<script>
import { setSidebarWidth, getSidebarWidth } from "@/utils/user";
import caseDetailCommon from "@/mixins/caseDetailCommon";
import CaseDetailHeader from "@/components/case/case-detail/CaseDetailHeader.vue";
import CaseDetailBody from "@/components/case/case-detail/CaseDetailBody.vue";
// const firstNameMap = {
//   1: "Info",
//   2: "LgBaseInfo",
//   3: "ProtectionBaseInfo",
//   4: "PatentBaseInfo",
//   5: "DomainBaseInfo",
//   6: "CopyrightBaseInfo",
//   7: "NonlitigationBaseInfo",
// };
export default {
  mixins: [caseDetailCommon],
  props: {
    showSidebar: {
      type: Boolean,
      required: true,
    },
    // caseInfo: {
    //   type: Object,
    //   required: true,
    // },
    caseId: {
      type: Number,
      required: true,
    },
    taskType: {
      type: Number,
      required: true,
    },
  },
  components: {
    CaseDetailHeader,
    CaseDetailBody,
  },
  data() {
    return {
      show: false,
      dragging: false,
      startX: 0,
      currentWidth: 0,
      initialWidth: 0,
      isFullWidth: false,
    };
  },
  computed: {
    isnotPc() {
      return "ontouchstart" in window || navigator.maxTouchPoints > 0;
    },
  },
  watch: {
    showSidebar: {
      immediate: true,
      handler(val) {
        this.show = val;
      },
    },
  },
  mounted() {
    this.$nextTick(() => {
      const offcanvas = document.querySelector(".offcanvas-end");
      if (!offcanvas) return;
      const obj = getSidebarWidth() || {};
      if (obj["case-sidebar"]) {
        const width = obj["case-sidebar"];
        const maxWidth = window.innerWidth - 70;
        if (String(width).includes("%")) {
          offcanvas.style.width = width;
          this.initialWidth = width;
          this.currentWidth = width;
        } else {
          const fromatWidth = width > maxWidth ? maxWidth : width;
          offcanvas.style.width = `${fromatWidth}px`;
          this.initialWidth = `${fromatWidth}px`;
          this.currentWidth = `${fromatWidth}px`;
        }
        this.isFullWidth = width == maxWidth;
      } else {
        this.initialWidth = offcanvas.offsetWidth;
        this.currentWidth = this.initialWidth;
      }
    });
  },
  // watch: {
  //   caseId: {
  //     handler(newVal) {
  //       if (newVal) {
  //         this.fetchCaseAbroadBillInfo();
  //       }
  //     },
  //     immediate: true,
  //   },
  // },
  methods: {
    toggleFullWidth() {
      this.isFullWidth = !this.isFullWidth;
      const offcanvas = document.querySelector(".offcanvas-end");
      if (offcanvas) {
        const maxWidth = window.innerWidth - 70;
        offcanvas.style.width = this.isFullWidth ? maxWidth + "px" : "80%";
        const obj = getSidebarWidth() || {};
        obj["case-sidebar"] = this.isFullWidth ? maxWidth : "80%";
        setSidebarWidth(JSON.stringify(obj));
      }
    },
    handleHidden() {
      this.$emit("update:showSidebar", false);
    },
    handleDragStart(e) {
      this.dragging = true;
      this.startX = e.clientX;
      const offcanvas = document.querySelector(".offcanvas-end");
      this.currentWidth = offcanvas ? offcanvas.offsetWidth : 0;
      document.addEventListener("mousemove", this.handleDrag);
      document.addEventListener("mouseup", this.handleDragEnd);
      document.body.style.userSelect = "none";
    },
    handleDrag(e) {
      if (!this.dragging) return;
      const dx = this.startX - e.clientX;
      const minWidth = Math.max(window.innerWidth * 0.7, 400);
      const maxWidth = window.innerWidth - 70;
      const newWidth = Math.min(Math.max(this.currentWidth + dx, minWidth), maxWidth);
      const offcanvas = document.querySelector(".offcanvas-end");
      if (offcanvas) {
        offcanvas.style.width = `${newWidth}px`;
        const obj = getSidebarWidth() || {};
        obj["case-sidebar"] = newWidth;
        setSidebarWidth(JSON.stringify(obj));
      }
    },
    handleDragEnd() {
      this.dragging = false;
      document.removeEventListener("mousemove", this.handleDrag);
      document.removeEventListener("mouseup", this.handleDragEnd);
      document.body.style.userSelect = "";
      const offcanvas = document.querySelector(".offcanvas-end");
      if (offcanvas) {
        this.currentWidth = offcanvas.offsetWidth;
      }
    },
  },
};
</script>
<template>
  <div>
    <BOffcanvas
      v-model="show"
      @hidden="handleHidden"
      :placement="'end'"
      :backdrop="false"
      responsive="md"
      :no-close-on-esc="true"
    >
      <div
        class="drag-handle"
        @mousedown="handleDragStart"
        v-if="!isnotPc"
      ></div>
      <template #header>
        <div class="custom-offcanvas-header">
          <b-button
            variant="close"
            class="close-btn-custom"
            @click="handleHidden"
          ></b-button>
          <CaseDetailHeader
            :caseInfo="caseInfo"
            :subscribeStatus="subscribeStatus"
            @subscribe="handleSubscribe"
          />
        </div>
      </template>
      <!-- 闁稿繈鍔岄惈鍡涘礆閸ャ劌搴婇柟绋款樀閹?-->
      <div
        v-if="show && isnotPc"
        class="full-width-toggle"
        @click="toggleFullWidth"
      >
        <i
          class="bx"
          :class="isFullWidth ? 'bx-chevron-right' : 'bx-chevron-left'"
          style="font-size: 20px"
        ></i>
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
        rootClass="row h-100"
        colClass="col-12 h-100"
        @set-component="checkComponent"
        @toggle-expanded="handleExpanded"
        @image-error="handleImageError"
        @cust-grp-img-error="handleCustGrpImgError"
        @cb-grp-img-error="handleCbGrpImgError"
        @lc-grp-img-error="handleLcGrpImgError"
      />
    </BOffcanvas>
  </div>
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
</style>