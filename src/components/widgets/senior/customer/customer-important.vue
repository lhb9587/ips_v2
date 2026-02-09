<script>
import ConfigContainer from "@/components/common/charts/config-container";
import { getChartData } from "@/api/dashboard";

export default {
  name: "CustomerImportant",
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
      mouseInner: false
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
        panelId: 9,
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
    class="card h-100"
    style="cursor: pointer"
    @click="enlarge"
    @mouseenter="mouseInner = true"
    @mouseleave="handleMouseLeave"
  >
    <div class="card-body">
      <div style="color: #fff">
        <div class="stat-title mb-2">
          <span>重要客户</span>
          <el-popover
            placement="bottom-start"
            title="重要客户"
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
        <div class="d-flex justify-content-between">
          <div class="d-flex align-items-center gap-2">
            <span class="total">{{ cardData.number }}</span>
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
        <div>
          <div class="process-text mb-1 d-flex justify-content-end gap-2">
            <span>收入占比</span>
            <span>65%</span>
          </div>
          <div>
            <el-progress
              :stroke-width="8"
              :percentage="65"
              color="#fff"
              stroke-linecap="square"
              :show-text="false"
              class="cust-progreess"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  <ConfigContainer
    v-if="isEnlarge"
    :defaultPanelId="304"
    :v-model:isEnlarge="isEnlarge"
    :close="close"
    :onlyShowModal="true"
    chartTitle="Top30客户账单"
    groupName="客户管理"
  />
</template>
<style scoped lang="scss">
.card {
  background-image: url("../../../../assets/images/dashboards/cust-back.svg");
  background-repeat: no-repeat;
  background-size: cover;
}
.stat-title {
  font-weight: bold;
  font-size: 15px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 4px;
}
.total {
  font-weight: bold;
  font-size: 24px;
  color: #fff;
}
.process-text {
  color: #fff;
}
.cust-progreess {
  :deep(.el-progress-bar__outer) {
    border-radius: 2px;
    background-color: rgba(242, 242, 242, 0.5);
  }
  :deep(.el-progress-bar__inner) {
    border-radius: 2px;
  }
}
.number {
  color: #f46a6a;
}
</style>
