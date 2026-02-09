<script>
import ConfigContainer from "@/components/common/charts/config-container";
import { getChartData } from "@/api/dashboard";
export default {
  name: "TurnoverEmployees",
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
      isTooNarrow: false,
      resizeObserver: null,
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
        panelId: 4020,
      };
      getChartData(params).then((res) => {
        this.cardData = res.data.chartDatas || {};
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
    checkWidth() {
      this.$nextTick(() => {
        const el = this.$refs.employeesTurnoverRef;
        if (el && el.offsetWidth < 250) {
          this.isTooNarrow = true;
        } else {
          this.isTooNarrow = false;
        }
      });
    },
  },
  mounted() {
    this.fetchData();
    this.checkWidth();
    this.resizeObserver = new ResizeObserver(() => {
      this.checkWidth();
    });
    this.resizeObserver.observe(this.$refs.employeesTurnoverRef);
  },
  beforeUnmount() {
    if (this.resizeObserver && this.$refs.employeesTurnoverRef) {
      this.resizeObserver.unobserve(this.$refs.employeesTurnoverRef);
      this.resizeObserver.disconnect();
    }
  },
};
</script>
<template>
  <div
    class="card h-100"
    style="cursor: pointer"
    @click="enlarge"
    @mouseenter="mouseInner = true"
    @mouseleave="handleMouseLeave"
    ref="employeesTurnoverRef"
  >
    <div class="card-body">
      <div>
        <div class="stat-title mb-2">
          <span>本年新入职/离职员工人数</span>
          <el-popover
            placement="bottom-start"
            title="本年新入职/离职员工人数"
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
        <div class="d-flex w-100">
          <div class="w-50">
            <div class="mb-2 d-flex align-items-center gap-2">
              <img
                src="@/assets/images/dashboards/induction.png"
                style="width: 30px"
              />
              <span class="total">{{ cardData.activeNumber }}</span>
            </div>
            <div class="gap-1 d-flex align-items-center" v-if="!isTooNarrow">
              <span class="text-muted">同比</span>
              <span
                :style="{
                  color: cardData.activePercent  > 0
                    ? '#f46a6a'
                    : '#34c38f',
                }"
                >{{ cardData.activePercent }} %</span
              >
              <i
                class="icon iconfont icon-shangzhang"
                style="color: #f46a6a"
                v-if="cardData.activePercent  > 0"
              ></i>
              <i
                class="icon iconfont icon-xiadie"
                style="color: #34c38f"
                v-if="cardData.activePercent < 0"
              ></i>
            </div>
          </div>
          <div class="w-50">
            <div class="mb-2 d-flex align-items-center gap-2">
              <img
                src="@/assets/images/dashboards/quit.png"
                style="width: 30px"
              />
              <span class="total">{{ cardData.inActiveNumber }}</span>
            </div>
            <div class="gap-1 d-flex align-items-center" v-if="!isTooNarrow">
              <span class="text-muted">同比</span>
              <span
                :style="{
                  color: cardData.inActivePercent > 0
                    ? '#f46a6a'
                    : '#34c38f',
                }"
                >{{ cardData.inActivePercent }} %</span
              >
              <i
                class="icon iconfont icon-shangzhang"
                style="color: #f46a6a"
                v-if="cardData.inActivePercent > 0"
              ></i>
              <i
                class="icon iconfont icon-xiadie"
                style="color: #34c38f"
                v-if="cardData.inActivePercent < 0"
              ></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <ConfigContainer
    v-if="isEnlarge"
    :defaultPanelId="4053"
    :v-model:isEnlarge="isEnlarge"
    :close="close"
    :onlyShowModal="true"
    chartTitle="各月份入离职情况"
    groupName="人力资源"
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
  font-size: 18px;
  color: #000000;
}
.text-muted {
  white-space: nowrap;
}
</style>
