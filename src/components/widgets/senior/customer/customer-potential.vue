<script>
import ConfigContainer from "@/components/common/charts/config-container";
import { getChartData } from "@/api/dashboard";

export default {
  name: "customerPotential",
  components: { ConfigContainer },
  props: {
    cardDesc: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      isEnlarge: false,
      cardData: {},
      mouseInner: false,
    };
  },
  methods: {
    enlarge() {
      this.isEnlarge = true;
    },
    close() {
      this.isEnlarge = false;
    },
    fetchData() {
      const params = {
        isSeniorPanel: 1,
        panelId: 4049,
      };
      getChartData(params).then((res) => {
        this.cardData = res.data?.chartDatas || {};
      });
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
      }else{
        this.mouseInner = false;
      }
    },
  },
  mounted() {
    this.fetchData();
  },
};
</script>
<template>
  <div
    class="card h-100 mb-0"
    style="cursor: pointer"
    @click="enlarge"
    @mouseenter="mouseInner = true"
    @mouseleave="handleMouseLeave"
  >
    <div class="card-body d-flex justify-content-between align-items-center">
      <div>
        <div>
          <div class="stat-title mb-3">
            <span>潜在客户</span>
            <el-popover
              placement="bottom-start"
              title="潜在客户"
              :width="350"
              trigger="hover"
              :content="cardDesc"
              ref="descPopoverRef"
            >
              <template #reference>
                <i v-show="cardDesc&&mouseInner" class="bx bx-help-circle" style="font-size: 16px;cursor: pointer;"></i>
              </template>
            </el-popover>
          </div>
          <div class="total mb-3">{{ cardData.number1 || 0 }}</div>
        </div>
        <div>
          <span
            class="text-muted"
            style="white-space: nowrap"
            >本年合作状态"潜在"客户</span
          >
        </div>
      </div>
      <div style="position: fixed; right: 0">
        <img
          src="@/assets/images/dashboards/customer-potential.png"
          style="width: 140px"
        />
      </div>
    </div>
  </div>
  <ConfigContainer
    v-if="isEnlarge"
    :defaultPanelId="4065"
    :v-model:isEnlarge="isEnlarge"
    :close="close"
    :onlyShowModal="true"
    chartTitle="合作状态“潜在”客户的信息"
    groupName="客户管理"
  />
</template>
<style scoped lang="scss">
.stat-title {
  font-weight: bold;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.total {
  font-weight: bold;
  font-size: 16px;
  color: #000000;
}
.number {
  color: #f46a6a;
}
</style>
