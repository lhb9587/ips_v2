<script>
import ConfigContainer from "@/components/common/charts/config-container";
import { getChartData } from "@/api/dashboard";

export default {
  name: "customerNew",
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
        panelId: 7,
      };
      getChartData(params).then((res) => {
        this.cardData = res.data?.chartDatas || {};
        console.log(this.cardData,'cardData');
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
        const el = this.$refs.customerNewRef;
        if (el && el.offsetWidth < 80) {
          this.isTooNarrow = true;
        } else {
          this.isTooNarrow = false;
        }
      });
    },
  },
  components: {
    ConfigContainer,
  },
  mounted() {
    this.fetchData();
    this.checkWidth();
    this.resizeObserver = new ResizeObserver(() => {
      this.checkWidth();
    });
    this.resizeObserver.observe(this.$refs.customerNewRef);
  },
  beforeUnmount() {
    if (this.resizeObserver && this.$refs.customerNewRef) {
      this.resizeObserver.unobserve(this.$refs.customerNewRef);
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
    ref="customerNewRef"
  >
    <div
      class="card-body"
      style="padding-right: 0"
    >
      <div>
        <div class="stat-title mb-3">
          <span>本年新客户</span>
          <el-popover
            placement="bottom-start"
            title="本年新客户"
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
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <div>
              <div class="total mb-3">{{ cardData.number }}</div>
            </div>
            <div class="d-flex align-items-center gap-1" v-if="!isTooNarrow">
              <template v-if="cardData.percent >= 0">
                <span class="number">{{ cardData.percent }}%</span>
                <i class="icon iconfont icon-shangzhang number"></i>
              </template>
              <template v-if="cardData.percent < 0">
                <span style="color: #34c38f">{{ cardData.percent }}%</span>
                <i
                  class="icon iconfont icon-xiadie"
                  style="color: #34c38f"
                ></i>
              </template>
            </div>
          </div>
          <div style="position: fixed; right: 20px" v-if="!isTooNarrow">
            <img src="@/assets/images/dashboards/customer.svg" />
          </div>
        </div>
      </div>
    </div>
  </div>
  <ConfigContainer
    v-if="isEnlarge"
    :defaultPanelId="4062"
    :v-model:isEnlarge="isEnlarge"
    :close="close"
    :onlyShowModal="true"
    chartTitle="每月新增客户的数量变化"
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
