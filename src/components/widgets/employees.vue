<script>
import { queryTalentPersonList } from "@/api/hrmList";
import { SimpleBar } from "simplebar-vue3";
import TalentSidebar from "@/views/hrm/staff-management/detail-sidebar";

export default {
  props: {
    containerHegiht:{
      type: Number,
    },
    cardDesc: {
      type: String,
      default: ""
    }
  },
  components: {
    SimpleBar,
    TalentSidebar,
  },
  data() {
    return {
      employees: [],
      isShowDetail: false,
      talentCode: "",
      mouseInner: false,
    };
  },
  computed: {
    contentHeight(){
      return this.containerHegiht - 83
    }
  },
  methods: {
    getEmployees() {
      const params = {
        pageNo: 1,
        pageSize: 15,
        empStatus: "在职",
      };
      queryTalentPersonList(params,{isLoading:false}).then((res) => {
        this.employees = res.data || [];
      });
    },
    toggleSidebar(params) {
      const id = params.talentCode;
      this.talentCode = id;
      this.isShowDetail = !this.isShowDetail;
    },
    handleSidebarUpdate(value) {
      this.isShowDetail = value;
    },
    handleMouseLeave(event) {
      if (event.relatedTarget && event.relatedTarget.classList) {
        const contentClass = [
          "el-popover--plain",
          "el-popover",
          "is-light",
          "el-popper",
          "el-popper__arrow"
        ];
        let isLeave = true;
        contentClass.forEach((item) => {
          if (event.relatedTarget.classList.contains(item)) {
            return (isLeave = false);
          }
        });
        if (event.relatedTarget.classList.length == 0) {
          isLeave = false;
        }
        if (isLeave) {
          this.$nextTick(() => {
            if (this.$refs.descPopoverRef) {
              this.$refs.descPopoverRef.hide();
            }
            setTimeout(() => {
              this.mouseInner = false;
            }, 100);
          });
        }
      } else {
        this.mouseInner = false;
      }
    },
  },
  created() {
    this.getEmployees();
  },
};
</script>

<template>
  <div 
    class="card"
    @mouseenter="mouseInner = true"
    @mouseleave="handleMouseLeave"
  >
    <div class="card-body">
      <div class="mb-4 d-flex align-items-center gap-1">
        <h4 class="card-title mb-0">
          <span>最近入职的人员</span>
          <el-popover
            placement="bottom-start"
            title="最近入职的人员"
            :width="350"
            trigger="hover"
            :content="cardDesc"
            ref="descPopoverRef"
          >
            <template #reference>
              <i v-show="cardDesc&&mouseInner" class="bx bx-help-circle" style="font-size: 16px;cursor: pointer;margin-left: 4px;"></i>
            </template>
          </el-popover>
        </h4>
      </div>
      <SimpleBar
        data-simplebar
        :style="{ height: `${contentHeight}px` }"
      >
        <div class="vstack gap-4">
          <div
            class="d-flex"
            v-for="employee in employees"
            :key="employee.userId"
          >
            <img
              v-if="employee.userIcon"
              :src="`/ipdoc${employee.userIcon}`"
              alt=""
              height="40"
              class="rounded"
            />
            <div class="ms-2 flex-grow-1">
              <h6 class="mb-1 font-size-15">
                <span class="text-body"
                  ><b>{{ employee.talentName }}</b> -
                  {{ employee.groupName }}</span
                >
              </h6>
              <p class="text-muted mb-0">
                <span v-if="employee.mainCollegeNameName"
                  >{{ employee.mainCollegeNameName }} -</span
                >
                <span v-if="employee.mainMajor">
                  {{ employee.mainMajor }} -
                </span>
                <span v-if="employee.age"> {{ employee.age }}岁</span>
              </p>
            </div>
            <div class="dropdown">
              <button
                class="btn btn-light"
                type="button"
                aria-expanded="false"
                @click="toggleSidebar(employee)"
              >
                <i class="bx bx-show"></i>
              </button>
            </div>
          </div>
        </div>
      </SimpleBar>
    </div>
  </div>
  <TalentSidebar
    v-if="isShowDetail"
    :showSidebar="isShowDetail"
    @update:showSidebar="handleSidebarUpdate"
    :talentCode="talentCode"
  />
</template>

<style scoped>
.event-list {
  padding: 0px 0px 38px 30px;
}
.card-title {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
