<script>
import { queryWarningList } from "@/api/customerList";
import LoadingOverlay from "@/components/common/loading";
import { getChartData } from "@/api/dashboard";

export default {
  name: "customerAlert",
  components: {
    LoadingOverlay,
  },
  props: {
    cardDesc: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      alertVisible: false,
      selectedTab: 1,
      tabList: [
        { value: 1, label: "账单预警" },
        { value: 2, label: "案件预警" },
      ],
      startMonth: "1",
      endMonth: new Date().getMonth() ? new Date().getMonth() + "" : 1 + "",
      billAmount: 10,
      caseCount: 10,
      rangeList: [10, 30, 50, 100, 500],
      caseNumList: [10, 50, 100, 500, 1000],
      monthList: [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
      ],
      billWarningList: [],
      caseWarningList: [],
      loading: false,
      cardData: {},
      mouseInner: false,
    };
  },
  watch: {
    alertVisible: {
      handler(newValue) {
        if (newValue) {
          const pageContent = document.querySelector(".page-content");
          pageContent.style.overflow = "hidden";
          // 获取滚动条的位置
          const scrollTopPosition = pageContent.scrollTop;
          setTimeout(() => {
            const enlargeDialogModal = document.querySelector(
              ".enlarge-dialog-modal"
            );
            // 设置元素的 inset 属性
            enlargeDialogModal?.style?.setProperty(
              "inset",
              `${scrollTopPosition}px 0 0 0 `
            );
          }, 100);
        } else {
          const pageContent = document.querySelector(".page-content");
          pageContent.style.overflow = "auto";
        }
      },
    },
  },
  methods: {
    fetchEndDate() {
      const date = new Date().getMonth() ? new Date().getMonth() : 1;
      console.log(date, "date");
      return date + "";
    },
    fetchData() {
      const params = {
        isSeniorPanel: 1,
        panelId: 4050,
      };
      getChartData(params).then((res) => {
        this.cardData = res.data?.chartDatas || {};
      });
    },
    handleClick() {
      this.alertVisible = true;
      this.fetchWarningList(1);
      this.fetchWarningList(2);
    },
    handleMonthChange() {
      this.fetchWarningList(1);
      this.fetchWarningList(2);
    },
    changeTab(value) {
      setTimeout(() => {
        this.selectedTab = value;
      }, 200);
    },
    fetchWarningList(tab) {
      this.loading = true;
      const param = {
        startMonth: this.startMonth,
        endMonth: this.endMonth,
        alarmType: tab,
        billAmount: this.billAmount * 10000,
        caseCount: this.caseCount + 0,
      };
      queryWarningList(param).then((res) => {
        if (tab == 1) {
          this.billWarningList = res.data || [];
          this.tabList[0].count = res.data.length;
        } else {
          this.caseWarningList = res.data || [];
          this.tabList[1].count = res.data.length;
        }
        this.loading = false;
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
    @click="handleClick"
    @mouseenter="mouseInner = true"
    @mouseleave="handleMouseLeave"
  >
    <div class="card-body d-flex justify-content-between align-items-center">
      <div style="z-index:2">
        <div>
          <div class="stat-title mb-3">
            <span>客户预警</span>
            <el-popover
              placement="bottom-start"
              title="客户预警"
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
          <div class="total mb-3">{{ cardData.number1 || 0 }}个</div>
        </div>
        <div>
          <span class="text-muted" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap">账单额>10w,案量>10</span>
        </div>
      </div>
      <div style="position: fixed; right: 20px">
        <img
          src="@/assets/images/dashboards/alert.png"
          style="width: 100px"
        />
      </div>
    </div>
  </div>
  <el-dialog
    v-if="alertVisible"
    v-model="alertVisible"
    width="100%"
    :modal="false"
    append-to=".page-content"
    custom-class="enlarge-dialog"
    modal-class="enlarge-dialog-modal"
    :lock-scroll="true"
    :close-on-press-escape="false"
  >
    <div class="d-flex align-center h-100">
      <div class="cpn-title">客户管理</div>
      <div class="d-flex cpn-filter">
        <div class="cpn-filter-item">
          <span class="cpn-filter-label">监测月份：</span>
          <el-select
            style="width: 80px; margin-right: 6px"
            size="small"
            v-model="startMonth"
            @change="handleMonthChange"
          >
            <el-option
              :disabled="+itm > +endMonth && !!endMonth"
              v-for="itm in monthList"
              :key="itm"
              :label="itm + '月'"
              :value="itm"
            >
            </el-option>
          </el-select>
          <span class="cpn-filter-label">至</span>
          <el-select
            style="width: 80px; margin: 0 6px"
            size="small"
            v-model="endMonth"
            @change="handleMonthChange"
          >
            <el-option
              :disabled="+startMonth > +itm"
              v-for="itm in monthList"
              :key="itm"
              :label="itm + '月'"
              :value="itm"
            >
            </el-option>
          </el-select>
        </div>
        <div
          class="cpn-filter-item"
          v-if="selectedTab === 1"
        >
          <span class="cpn-filter-label">监测范围：</span>
          <el-select
            style="width: 80px; margin: 0 5px"
            size="small"
            v-model="billAmount"
            @change="fetchWarningList(1)"
          >
            <el-option
              v-for="itm in rangeList"
              :key="itm"
              :label="itm"
              :value="itm"
            >
            </el-option>
          </el-select>
          <span class="cpn-filter-label">万+</span>
        </div>
        <div
          class="cpn-filter-item"
          v-else
        >
          <span class="cpn-filter-label">监测案量：</span>
          <el-select
            style="width: 80px; margin: 0 5px"
            size="small"
            v-model="caseCount"
            @change="fetchWarningList(2)"
          >
            <el-option
              v-for="itm in caseNumList"
              :key="itm"
              :label="itm"
              :value="itm"
            >
            </el-option>
          </el-select>
        </div>
      </div>
    </div>
    <div
      class="card mb-0 mt-4 w-100 h-100"
      style="border-top: 2px solid #5a6dde"
    >
      <LoadingOverlay :loading="loading" />
      <div class="alert-container w-100 card-body">
        <div class="d-flex align-items-center">
          <div class="alert-title mb-2">预警信息</div>
        </div>
        <b-tabs
          pills
          nav-class="bg-light rounded"
          content-class="mt-3"
        >
          <b-tab
            :title="`${item.label}${item.count ? `(${item.count})` : ''}`"
            v-model="selectedTab"
            v-for="item of tabList"
            :key="item.value"
            @click="changeTab(item.value)"
          >
          </b-tab>
        </b-tabs>
        <div class="alert-content w-100">
          <div
            p-3
            v-if="selectedTab == 1"
          >
            <el-empty
              v-if="!billWarningList.length"
              description="暂无数据"
            ></el-empty>
            <div
              v-for="(item, index) of billWarningList"
              :key="index"
              class="alert-item-box"
            >
              <div
                class="alert-item"
                :style="{
                  'border-left': `5px solid ${
                    item.warnLevel == 1 ? '#D9001B' : '#F59A23'
                  }`,
                }"
              >
                <div>{{ item.fullname }}</div>
                <div class="d-flex gap-4">
                  <div
                    :style="{
                      color: `${item.warnLevel === 1 ? '#D9001B' : '#F59A23'}`,
                    }"
                  >
                    {{ item.warnLevel === 1 ? "严重" : "轻度" }}
                  </div>
                  <div>
                    案量同比减少<span
                      :style="{
                        color: item.warnLevel === 1 ? '#D9001B' : '#F59A23',
                      }"
                    >
                      {{ item.jianshao }}%</span
                    >
                  </div>
                  <div>去年 {{ item.lastCount }}</div>
                  <div>本年 {{ item.currentCount }}</div>
                </div>
              </div>
            </div>
          </div>
          <div
            p-3
            v-else
          >
            <el-empty
              v-if="!caseWarningList.length"
              description="暂无数据"
            ></el-empty>
            <div
              v-for="(item, index) of caseWarningList"
              :key="index"
              class="alert-item-box"
            >
              <div
                class="alert-item"
                :style="{
                  'border-left': `5px solid ${
                    item.warnLevel == 1 ? '#D9001B' : '#F59A23'
                  }`,
                }"
              >
                <div>{{ item.fullname }}</div>
                <div class="d-flex gap-4">
                  <div
                    :style="{
                      color: `${item.warnLevel === 1 ? '#D9001B' : '#F59A23'}`,
                    }"
                  >
                    {{ item.warnLevel === 1 ? "严重" : "轻度" }}
                  </div>
                  <div>
                    案量同比减少<span
                      :style="{
                        color: item.warnLevel === 1 ? '#D9001B' : '#F59A23',
                      }"
                    >
                      {{ item.jianshao }}%</span
                    >
                  </div>
                  <div>去年 {{ item.lastCount }}</div>
                  <div>本年 {{ item.currentCount }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
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
.alert-title {
  font-size: 15px;
  font-weight: bold;
}
.cpn-title {
  font-size: 16px;
  font-weight: bold;
  line-height: 30px;
}
.cpn-filter {
  margin-left: 40px;
  gap: 20px;
  align-items: center;
  .cpn-filter-item {
    gap: 8px;
    .cpn-filter-label {
      font-size: 12px;
      color: #7f7f7f;
    }
  }
}
.alert-item-box {
  display: flex;
  align-items: center;
  height: 75px;
  border-bottom: 1px solid #d7d7d7;
  .alert-item {
    margin-top: 15px;
    height: 50px;
    padding: 5px 10px;
  }
}

.alert-container {
  height: calc(100vh - 140px);
  overflow-y: auto;
  padding-bottom: 20px;
}
.alert-content {
  overflow-y: auto;
  height: calc(100vh - 270px);
}
</style>
<style lang="scss">
.enlarge-dialog-modal {
  position: absolute !important;
  width: 100%;
  height: 100vh;
  .el-overlay-dialog {
    position: absolute !important;
    height: 100vh;
    .el-dialog {
      height: calc(100vh - 50px);
      margin-top: 50px;
      margin-bottom: 0;
      background-color: #f8f8fb;
      padding: 0 24px 24px;
    }
  }
}
</style>
