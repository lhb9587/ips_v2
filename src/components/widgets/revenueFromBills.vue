<script>
import {
  queryIncomeByYearAndMonth,
  queryIncomeByYear,
  queryIncomeByMonth,
  queryExpectIncomeByMonth,
} from "@/api/customerList";
import { formatAmount } from "@/utils";
/**
 * Monthly-Earning component
 */
export default {
  props: {
    containerHegiht: {
      type: Number,
    },
    cardDesc: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      chartOptions: {
        chart: {
          height: 200,
          type: "radialBar",
          offsetY: -10,
        },
        plotOptions: {
          radialBar: {
            startAngle: -135,
            endAngle: 135,
            dataLabels: {
              name: {
                fontSize: "13px",
                color: undefined,
                offsetY: 60,
              },
              value: {
                offsetY: 22,
                fontSize: "16px",
                color: undefined,
                formatter: function (val) {
                  return val + "%";
                },
              },
            },
          },
        },
        colors: ["#556ee6"],
        fill: {
          type: "gradient",
          gradient: {
            shade: "dark",
            shadeIntensity: 0.15,
            inverseColors: false,
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 50, 65, 91],
          },
        },
        stroke: {
          dashArray: 4,
        },
        labels: ["本年目标"],
      },
      series: [67],
      incomeLastMonth: 0,
      incomeLastMonthLastYear: 0,
      expectIncome: 0,
      income: 0,
      lastIncome: 0,
      showBillDetail: false,
      loading: false,
      chartOptionsMonth: {
        chart: {
          height: 350,
          type: "line",
          stacked: false,
          toolbar: {
            show: false,
          },
        },
        legend: {
          show: true,
          offsetY: 10,
        },
        stroke: {
          width: [0, 0, 2, 2],
          curve: "smooth",
        },
        plotOptions: {
          bar: {
            columnWidth: "30%",
          },
        },
        fill: {
          opacity: [1, 1, 0.1, 1],
          gradient: {
            inverseColors: false,
            shade: "light",
            type: "vertical",
            opacityFrom: 0.85,
            opacityTo: 0.55,
            stops: [0, 100, 100, 100],
          },
        },
        labels: [
          "1月",
          "2月",
          "3月",
          "4月",
          "5月",
          "6月",
          "7月",
          "8月",
          "9月",
          "10月",
          "11月",
          "12月",
        ],
        colors: ["#34c38f", "#556ee6"],
        markers: {
          size: 0,
        },
        xaxis: {
          type: "category",
        },
        yaxis: {
          labels: {
            formatter: function (value) {
              return Math.round(value);
            }
          }
        },
        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: function (value) {
              return `￥${Math.round(value)}`;
            }
          }
        }
      },
      incomeSeries: [
        {
          name: "预测收入",
          type: "column",
          data: [],
        },
        {
          name: "实际收入",
          type: "column",
          data: [],
        },
      ],
      mouseInner: false,
    };
  },
  computed: {
    incomeProgress() {
      if (this.income === 0 || this.expectIncome === 0) {
        return 0
      }
      return ((this.income / this.expectIncome) * 100).toFixed(0);
    },
    isRise() {
      return this.incomeLastMonthLastYear < this.incomeLastMonth;
    },
    yearOnYearChange() {
      if (this.incomeLastMonthLastYear === 0) {
        return 0;
      }
      return (
        ((this.incomeLastMonth - this.incomeLastMonthLastYear) /
          this.incomeLastMonthLastYear) *
        100
      ).toFixed(2);
    },
    contentHeight(){
      return this.containerHegiht - 150
    }
  },
  methods: {
    formatAmount,
    init() {
      this.loading = true;
      Promise.all([
        queryExpectIncomeByMonth({ year: new Date().getFullYear() }),
        queryIncomeByMonth({ year: new Date().getFullYear() }),
      ]).then((res) => {
        if (res[0].success && res[1].success) {
          let filledArray = Array(12).fill(0);
          let expectLineData = Object.values(res[0].data);
          const realityLineData = Object.values(res[1].data);
          for (let i = 0; i < realityLineData.length; i++) {
            filledArray[i] = realityLineData[i];
          }
          this.incomeSeries[0].data = expectLineData;
          this.incomeSeries[1].data = filledArray;
          this.loading = false;
        }
      });
    },
    fetchIncomeByYearAndMonth() {
      queryIncomeByYearAndMonth().then((res) => {
        this.incomeLastMonth = res.data.currYear || 0;
        this.incomeLastMonthLastYear = res.data.lastYear || 0;
      });
    },
    viewMore() {
      this.init();
      this.showBillDetail = true;
    },
    fetchIncomeByYear() {
      queryIncomeByYear().then((res) => {
        this.expectIncome = res.data.expectIncome || 0;
        this.income = res.data.income || 0;
        this.lastIncome = res.data.lastIncome || 0;
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
      } else {
        this.mouseInner = false;
      }
    },
  },
  created() {
    this.fetchIncomeByYearAndMonth();
    this.fetchIncomeByYear();
  },
};
</script>

<template>
    <div 
      class="card"
      style="height: 100%;"
      @mouseenter="mouseInner = true"
      @mouseleave="handleMouseLeave"
    >
      <div class="card-body">
        <div class="mb-4 d-flex align-items-center gap-1">
          <h4 class="card-title mb-0">
            <span>账单收入</span>
            <el-popover
              placement="bottom-start"
              title="账单收入"
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
        <div class="row">
          <div class="col-6">
            <p class="text-muted">上个月</p>
            <h3 style="white-space: nowrap">
              ￥{{ formatAmount(incomeLastMonth) }}
            </h3>
            <p class="text-muted" >
              <span
                class="text-success me-2"
                :class="{ 'text-success': !isRise, 'text-danger': isRise }"
              >
                {{ Math.abs(yearOnYearChange) }}%
                <i
                  v-if="!isRise"
                  class="mdi mdi-arrow-down"
                ></i>
                <i
                  v-else
                  class="mdi mdi-arrow-up"
                ></i>
              </span>
              对比去年同期
            </p>

            <div class="mt-4">
              <a
                @click="viewMore"
                class="btn btn-primary btn-sm"
              >
                目标概述
                <i class="mdi mdi-arrow-right ms-1"></i>
              </a>
            </div>
          </div>
          <div class="col-6">
            <!-- Chart -->
            <el-popover
              trigger="hover"
              effect="dark"
              placement="right"
              :width="200"
              :popper-style="{ 'margin-left': '-40px' }"
            >
              <template #reference>
                <apexchart
                  class="apex-charts"
                  type="radialBar"
                  height="200"
                  dir="ltr"
                  :series="[incomeProgress]"
                  :options="chartOptions"
                ></apexchart>
              </template>
              <div>
                <div>本年累计：{{ formatAmount(income) }}</div>
                <div>本年目标：{{ formatAmount(expectIncome) }}</div>
              </div>
            </el-popover>
          </div>
        </div>
      </div>
    </div>
    <b-modal
      v-model="showBillDetail"
      title="目标概述"
      centered
      hide-footer
      size="lg"
    >
      <div>
        <div style="display: flex; justify-content: space-between">
          <div>
            <div style="gap: 24px">
              <span>去年收入：</span>
              <span class="fw-bold">￥{{ formatAmount(lastIncome) }}</span>
            </div>
          </div>
          <div>
            <div style="gap: 24px">
              <span>本年目标：</span>
              <span class="fw-bold">￥{{ formatAmount(expectIncome) }}</span>
            </div>
          </div>
          <div>
            <div style="gap: 24px">
              <span>本年累计：</span>
              <span class="fw-bold">￥{{ formatAmount(income) }}</span>
            </div>
          </div>
        </div>
        <div
          v-loading="loading"
          element-loading-text="请等待"
        >
          <apexchart
            class="apex-charts"
            type="line"
            dir="ltr"
            height="350"
            :series="incomeSeries"
            :options="chartOptionsMonth"
          >
          </apexchart>
        </div>
      </div>
    </b-modal>
</template>

<style scoped lang="scss">
.fw-bold {
  font-weight: bold;
}
.card-title {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
