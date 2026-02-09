<script>
import Info from "@/views/hrm/staff-management/components/info";
import SocialRelations from "@/views/hrm/staff-management/components/socialRelations";
import EduExperience from "@/views/hrm/staff-management/components/eduExperience";
import ForeignLanguage from "@/views/hrm/staff-management/components/foreignLanguage";
import EmploymentInfo from "@/views/hrm/staff-management/components/employmentInfo";
import JobAdjustment from "@/views/hrm/staff-management/components/jobAdjustment";
import LaborContract from "@/views/hrm/staff-management/components/laborContract";
import Qualifications from "@/views/hrm/staff-management/components/qualifications";
import WorkExperience from "@/views/hrm/staff-management/components/workExperience";

import { queryTalentPersonInfo } from "@/api/hrmList";
import { setSidebarWidth,getSidebarWidth } from "@/utils/user";

export default {
  props: {
    showSidebar: {
      type: Boolean,
      required: true,
    },
    talentCode: {
      type: Number,
      required: true,
    },
  },
  components: {
    Info,
    SocialRelations,
    EduExperience,
    ForeignLanguage,
    EmploymentInfo,
    JobAdjustment,
    LaborContract,
    Qualifications,
    WorkExperience,
  },
  data() {
    return {
      show: false,
      isExpanded: true,
      componentName: "Info",
      detailInfo: {},
      imageLoadError: false,
      dragging: false,
      startX: 0,
      currentWidth: 0,
      initialWidth: 0,
      isFullWidth: false,
    };
  },
  created() {
    this.show = this.showSidebar;
    this.fetchInfo();
  },
  computed:{
    isnotPc(){
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
  },
  mounted() {
    // 获取初始宽度
    this.$nextTick(() => {
      const offcanvas = document.querySelector('.offcanvas-end');
      if (offcanvas) {
        const obj = getSidebarWidth() || {}
        if (obj['staff-sidebar']) {
          const width = obj['staff-sidebar'];
          const maxWidth = window.innerWidth - 70;
          if(String(width).includes('%')){
            offcanvas.style.width = width;
            this.initialWidth = width;
            this.currentWidth = width;
          }else{
            const fromatWidth = width > maxWidth ? maxWidth : width
            offcanvas.style.width = `${fromatWidth}px`;
            this.initialWidth = `${fromatWidth}px`;
            this.currentWidth = `${fromatWidth}px`;
          }
          this.isFullWidth = width == maxWidth;
        }else{
          this.initialWidth = offcanvas.offsetWidth;
          this.currentWidth = this.initialWidth;
        }
      }
    });
  },
  watch: {
    talentCode: {
      handler() {
        this.fetchInfo();
      },
    },
  },
  methods: {
    toggleFullWidth() {
      this.isFullWidth = !this.isFullWidth;
      const offcanvas = document.querySelector('.offcanvas-end');
      if (offcanvas) {
        const maxWidth = window.innerWidth - 70;
        offcanvas.style.width = this.isFullWidth? maxWidth + 'px' : '70%';
        const obj = getSidebarWidth() || {}
        obj['staff-sidebar'] = this.isFullWidth? maxWidth : '70%'
        setSidebarWidth(JSON.stringify(obj))
      }
    },
    handleDragStart(e) {
      this.dragging = true;
      this.startX = e.clientX;
      const offcanvas = document.querySelector('.offcanvas-end');
      this.currentWidth = offcanvas.offsetWidth;
      document.addEventListener('mousemove', this.handleDrag);
      document.addEventListener('mouseup', this.handleDragEnd);
      // 防止文本选中
      document.body.style.userSelect = 'none';
    },
    handleDrag(e) {
      if (!this.dragging) return;
      const dx = this.startX - e.clientX;
      const minWidth = Math.max(window.innerWidth * 0.4, 400);
      const maxWidth = window.innerWidth - 70;
      const newWidth = Math.min(Math.max(this.currentWidth + dx, minWidth), maxWidth);
      const offcanvas = document.querySelector('.offcanvas-end');
      if (offcanvas) {
        offcanvas.style.width = `${newWidth}px`;
        const obj = getSidebarWidth() || {}
        obj['staff-sidebar'] = newWidth
        setSidebarWidth(JSON.stringify(obj))
      }
    },
    handleDragEnd() {
      this.dragging = false;
      document.removeEventListener('mousemove', this.handleDrag);
      document.removeEventListener('mouseup', this.handleDragEnd);
      document.body.style.userSelect = '';
      // 保存最终宽度
      const offcanvas = document.querySelector('.offcanvas-end');
      if (offcanvas) {
        this.currentWidth = offcanvas.offsetWidth;
      }
    },
    handleImageError() {
      this.imageLoadError = true;
    },
    handleHidden() {
      this.$emit("update:showSidebar", false);
    },
    checkComponent(name) {
      this.componentName = name;
    },
    handleExpanded() {
      this.isExpanded = !this.isExpanded;
    },
    fetchInfo() {
      queryTalentPersonInfo(this.talentCode, { isLoading: true }).then(
        (res) => {
          this.detailInfo = res.data || {};
        }
      );
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
      backdrop="false"
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
          <h5
            class="offcanvas-title"
            id="offcanvasRightLabel"
          >
            个人信息 - {{ detailInfo.talentName }}
          </h5>
        </div>
      </template>
      <!-- 全屏切换按钮 -->
      <div 
        v-if="show&&isnotPc"
        class="full-width-toggle"
        @click="toggleFullWidth"
      >
        <i 
          class="bx"
          :class="isFullWidth ? 'bx-chevron-right' : 'bx-chevron-left'"
          style="font-size: 20px"
        ></i>
      </div>
      <div class="row">
        <!-- Right Sidebar -->
        <div class="col-12">
          <div
            v-show="isExpanded"
            class="email-leftbar card"
          >
            <div class="text-center">
              <img
                v-if="detailInfo.userIcon && !imageLoadError"
                :src="`/ipdoc${detailInfo.userIcon}`"
                alt=""
                height="50"
                style="max-width: 200px"
                class="mx-auto d-block rounded-circle avatar-md"
                @error="handleImageError"
              />
              <h5 class="mt-3 mb-3">{{ detailInfo.talentName }}</h5>
            </div>
            <h6>
              <span
                class="mdi mdi-arrow-right-drop-circle text-info float-end cursor-pointer"
              ></span
              >个人信息
            </h6>
            <div class="mail-list mt-1">
              <a
                :class="componentName == 'Info' ? 'active' : ''"
                @click="checkComponent('Info')"
                class="leftbar-item"
              >
                <i class="mdi mdi-account-box-outline me-2"></i>基本信息
              </a>
              <a
                :class="componentName == 'SocialRelations' ? 'active' : ''"
                @click="checkComponent('SocialRelations')"
                class="leftbar-item"
              >
                <i class="mdi mdi-account-group-outline me-2"></i>社会关系
              </a>
              <a
                :class="componentName == 'EduExperience' ? 'active' : ''"
                @click="checkComponent('EduExperience')"
                class="leftbar-item"
              >
                <i class="mdi mdi-book-education-outline me-2"></i>教育经历
              </a>
              <a
                :class="componentName == 'ForeignLanguage' ? 'active' : ''"
                @click="checkComponent('ForeignLanguage')"
                class="leftbar-item"
              >
                <i class="mdi mdi-format-textbox me-2"></i>外语水平
              </a>
            </div>
            <h6 class="mt-4">
              <span
                class="mdi mdi-arrow-right-drop-circle text-info float-end cursor-pointer"
              ></span
              >岗位信息
            </h6>
            <div class="mail-list mt-1">
              <a
                :class="componentName == 'EmploymentInfo' ? 'active' : ''"
                @click="checkComponent('EmploymentInfo')"
                class="leftbar-item"
              >
                <i class="mdi mdi-card-account-details-outline me-2"></i
                >在职信息
              </a>
              <a
                :class="componentName == 'JobAdjustment' ? 'active' : ''"
                @click="checkComponent('JobAdjustment')"
                class="leftbar-item"
              >
                <i class="mdi mdi-account-convert-outline me-2"></i>岗位调整
              </a>
              <a
                :class="componentName == 'LaborContract' ? 'active' : ''"
                @click="checkComponent('LaborContract')"
                class="leftbar-item"
              >
                <i class="mdi mdi-clipboard-text-multiple-outline me-2"></i
                >劳动合同
              </a>
              <a
                :class="componentName == 'Qualifications' ? 'active' : ''"
                @click="checkComponent('Qualifications')"
                class="leftbar-item"
              >
                <i class="mdi mdi-tag-text-outline me-2"></i>职业资质
              </a>
              <a
                :class="componentName == 'WorkExperience' ? 'active' : ''"
                @click="checkComponent('WorkExperience')"
                class="leftbar-item"
              >
                <i class="mdi mdi-briefcase-outline me-2"></i>工作经历
              </a>
            </div>
          </div>

          <!-- 展开功能 -->
          <span
            class="detial-expanded"
            @click="handleExpanded()"
          >
            <div class="expanded-div">
              <i
                :class="
                  isExpanded ? 'bx bx-chevron-left' : 'bx bx-chevron-right'
                "
              ></i>
            </div>
          </span>

          <div :class="isExpanded ? 'email-rightbar mb-3' : 'mx-4'">
            <!-- 动态组件调用 -->
            <component
              :detailInfo="detailInfo"
              :is="componentName"
            ></component>
          </div>
        </div>
      </div>
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
