<script>
import MiniArea from "@/components/common/charts/mini-area";
// import MiniArea from "@/components/common/charts/area/index.vue";
import ConfigContainer from "@/components/common/charts/config-container";
import { formatAmount } from "@/utils";

export default {
  name: "SeniorStat",
  components: {
    MiniArea,
    ConfigContainer,
  },
  data() {
    return {
      isEnlarge: false,
      mouseInner: false,
      showMiniArea: true,
    };
  },
  props: {
    title: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "icon iconfont icon-shouruguanli",
    },
    iconColor: {
      type: String,
      default: "#254037",
    },
    defaultPanelId: {
      type: Number,
    },
    cardData: {
      type: Object,
      default: () => {},
    },
    cardDesc: {
      type: String,
      default: "",
    },
  },
  methods: {
    formatAmount,
    enlarge() {
      if (this.defaultPanelId) {
        this.isEnlarge = true;
      }
    },
    close() {
      this.isEnlarge = false;
    },
    handleMouseLeave(event) {
      if (event.relatedTarget && event.relatedTarget.classList) {
        const contentClass = [
          "el-popover--plain",
          "el-popover",
          "is-light",
          "el-popper",
          "el-popper__arrow",
        ];
        let isLeave = true;
        contentClass.forEach((item) => {
          if (event.relatedTarget.classList.contains(item)) {
            return (isLeave = false);
          }
        });
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
    observeContainerWidth() {
      const el = this.$el;
      if (window.ResizeObserver) {
        this.resizeObserver = new ResizeObserver((entries) => {
          for (let entry of entries) {
            const width = entry.contentRect.width;
            this.showMiniArea = width >= 350;
          }
        });
        this.resizeObserver.observe(el);
      } else {
        // 兼容性兜底
        this.showMiniArea = el.offsetWidth >= 350;
        window.addEventListener("resize", this.checkWidth);
      }
    },
    checkWidth() {
      this.showMiniArea = this.$el.offsetWidth >= 350;
    },
  },
  computed: {
    chartData() {
      return this.cardData.trendData || [];
    },
    trendStatus() {
      let status = "";
      if (this.cardData.onYearValue?.includes("+")) {
        status = "up";
      } else if (this.cardData.onYearValue?.includes("-")) {
        status = "down";
      }
      return status;
    },
    chartTitle() {
      return this.title.replace("本年总", "往年");
    },
  },
  mounted() {
    this.observeContainerWidth();
  },
  beforeUnmount() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  },
};
</script>
<template>
  <div
    class="card h-100 mb-0 stat-container"
    :style="{ cursor: defaultPanelId ? 'pointer' : 'default' }"
    @click="enlarge"
    @mouseenter="mouseInner = true"
    @mouseleave="handleMouseLeave"
  >
    <div class="card-body h-100">
      <div>
        <div class="d-flex align-items-center gap-2">
          <i
            :class="icon"
            :style="{ color: iconColor }"
            style="font-size: 28px"
          ></i>
          <span class="stat-title">{{ title }}</span>
          <el-popover
            placement="bottom-start"
            :title="chartTitle"
            :width="350"
            trigger="hover"
            :content="cardDesc"
            ref="descPopoverRef"
          >
            <template #reference>
              <i
                v-show="cardDesc && mouseInner"
                class="bx bx-help-circle"
                style="font-size: 16px; cursor: pointer"
              ></i>
            </template>
          </el-popover>
        </div>
      </div>
      <div class="d-flex gap-1">
        <div style="width: fit-content">
          <div class="total mb-2">
            ￥{{
              cardData?.currentValue ? formatAmount(cardData.currentValue) : 0
            }}
          </div>
          <div class="compare d-flex gap-1 align-items-center">
            <span
              class="text-muted"
              >同比</span
            >
            <span
              class="yearvalue"
              :style="{ color: trendStatus === 'up' ? '#f46a6a' : '#34c38f' }"
            >
              <span v-if="cardData.onYearValue"
                ><span>
                  {{ trendStatus === "up" ? "+" : "" }}
                </span>
                <span>
                  {{ formatAmount(cardData.onYearValue) }}
                </span></span
              >
              <span>({{ cardData.onYearRate }})</span></span
            >
            <i
              v-if="trendStatus === 'up'"
              class="icon iconfont icon-shangzhang trend-icon"
              style="color: #f46a6a"
            ></i>
            <i
              v-if="trendStatus === 'down'"
              class="icon iconfont icon-xiadie trend-icon"
              style="color: #34c38f"
            ></i>
          </div>
        </div>
        <MiniArea
          v-if="showMiniArea"
          :color="iconColor"
          :chartData="chartData"
        />
      </div>
    </div>
    <ConfigContainer
      v-if="isEnlarge"
      :defaultPanelId="defaultPanelId"
      :v-model:isEnlarge="isEnlarge"
      :close="close"
      :onlyShowModal="true"
      :chartTitle="chartTitle"
    />
  </div>
</template>
<style scoped lang="scss">
.stat-title {
  font-weight: bold;
  font-size: 15px;
}
.total {
  font-weight: bold;
  font-size: 16px;
  color: #000000;
}
.text-muted {
  white-space: nowrap;
}
@media (max-width: 400px) {
  .text-muted{
    display: none;
  }
  .yearvalue {
    font-size: 11px;
  }
  .trend-icon{
    display: none;
  }
}
</style>
