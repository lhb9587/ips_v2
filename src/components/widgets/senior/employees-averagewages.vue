<script>
import ConfigContainer from "@/components/common/charts/config-container";
import { getChartData } from "@/api/dashboard";

export default {
  name: "AveragewagesEmployees",
  components: {
    ConfigContainer,
  },
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
      showImage: true,
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
        panelId: 4052,
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
  },
  mounted() {
    this.fetchData();
    this.$nextTick(() => {
      if (this.$refs.cardRef && window.ResizeObserver) {
        this.cardResizeObserver = new ResizeObserver(() => {
          this.showImage = this.$refs.cardRef.offsetWidth >= 260;
        });
        this.cardResizeObserver.observe(this.$refs.cardRef);
        this.showImage = this.$refs.cardRef.offsetWidth >= 260;
      }
    });
  },
  beforeUnmount() {
    if (this.cardResizeObserver && this.$refs.cardRef) {
      this.cardResizeObserver.disconnect();
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
    ref="cardRef"
  >
    <div class="card-body d-flex justify-content-between align-items-center">
      <div>
        <div>
          <div class="stat-title mb-2">
            <span>员工地域分布</span>
            <el-popover
              placement="bottom-start"
              title="员工地域分布"
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
          <div class="total mb-2">{{ cardData.number1 || 0 }}个</div>
        </div>
        <div class="d-flex align-items-center">
          <span class="text-muted">覆盖地域</span>
        </div>
      </div>
      <div v-if="showImage">
        <i
          class="icon iconfont icon-fengongsi d-flex align-items-center"
          style="color: #5094f3; font-size: 60px"
        ></i>
      </div>
    </div>
  </div>
  <ConfigContainer
    v-if="isEnlarge"
    :defaultPanelId="4056"
    :v-model:isEnlarge="isEnlarge"
    :close="close"
    :onlyShowModal="true"
    chartTitle="员工地域分布"
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
  font-size: 16px;
  color: #000000;
}
.number {
  color: #f46a6a;
}
</style>
