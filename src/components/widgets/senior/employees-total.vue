<script>
import ConfigContainer from "@/components/common/charts/config-container";
import { getChartData } from "@/api/dashboard";

export default {
  name: "totalEmployees",
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
        panelId: 4019,
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
  computed: {
    trendStatus() {
      let status = "";
      if (this.cardData.number2?.includes("+")) {
        status = "up";
      } else if (this.cardData.number2?.includes("-")) {
        status = "down";
      }
      return status;
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
            <span>正式岗位员工总人数</span>
            <el-popover
              placement="bottom-start"
              title="正式岗位员工总人数"
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
          <div class="total mb-2">{{ cardData.number1 }}</div>
        </div>
        <div class="gap-2 d-flex align-items-center">
          <i
            class="icon iconfont icon-shangzhang"
            style="color: #f46a6a"
            v-if="trendStatus === 'up'"
          ></i>
          <i
            class="icon iconfont icon-xiadie"
            style="color: #34c38f"
            v-if="trendStatus === 'down'"
          ></i>
          <span :style="{ color: trendStatus === 'up' ? '#f46a6a' : '#34c38f' }"
            >{{ cardData.number2 }} ({{ cardData.number3 }})</span
          >
          <span class="text-muted" v-if="showImage">对比上个季度</span>
        </div>
      </div>
      <div style="position: fixed; right: 20px" v-if="showImage">
        <img
          src="@/assets/images/dashboards/employees.png"
          style="width: 72px"
        />
      </div>
    </div>
  </div>
  <ConfigContainer
    v-if="isEnlarge"
    :defaultPanelId="4033"
    :v-model:isEnlarge="isEnlarge"
    :close="close"
    :onlyShowModal="true"
    chartTitle="各部门人数情况"
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
</style>
