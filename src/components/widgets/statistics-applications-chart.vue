<script>
/**
 * Statistics Applications Chart
 */
export default {
  components: {
  },
  data() {
    return {
      isActive: "year",
      series: [{
        name: '收入',
        type: 'column',
        data: [30, 48, 28, 74, 39, 87, 54, 36, 50, 87, 84, 53]
      }, {
        name: '花费',
        type: 'column',
        data: [20, 50, 42, 10, 24, 28, 60, 35, 47, 64, 78, 42]
      }, {
        name: '净利润（亏损）',
        type: 'area',
        data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43, 38]
      }, {
        name: '净利润率',
        type: 'line',
        data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39, 33]
      }],
      chartOptions: {
        chart: {
          height: 350,
          type: 'line',
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
          curve: 'smooth'
        },
        plotOptions: {
          bar: {
            columnWidth: '30%'
          }
        },
        fill: {
          opacity: [1, 1, 0.1, 1],
          gradient: {
            inverseColors: false,
            shade: 'light',
            type: "vertical",
            opacityFrom: 0.85,
            opacityTo: 0.55,
            stops: [0, 100, 100, 100]
          }
        },
        labels: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
        colors: ["#34c38f", "#556ee6", "#f46a6a", "#50a5f1"],
        markers: {
          size: 0
        },
        xaxis: {
          type: 'category'
        },
        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: function (y) {
              if (typeof y !== "undefined") {
                return y.toFixed(0) + " points";
              }
              return y;

            }
          }
        }
      },
      chartOptionsMonth: {
        chart: {
          height: 350,
          type: 'line',
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
          curve: 'smooth'
        },
        plotOptions: {
          bar: {
            columnWidth: '30%'
          }
        },
        fill: {
          opacity: [1, 1, 0.1, 1],
          gradient: {
            inverseColors: false,
            shade: 'light',
            type: "vertical",
            opacityFrom: 0.85,
            opacityTo: 0.55,
            stops: [0, 100, 100, 100]
          }
        },
        labels: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
        colors: ["#34c38f", "#556ee6", "#f46a6a", "#50a5f1"],
        markers: {
          size: 0
        },
        xaxis: {
          type: 'category'
        },
        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: function (y) {
              if (typeof y !== "undefined") {
                return y.toFixed(0) + " points";
              }
              return y;

            }
          }
        }
      },
    };
  },
  methods: {
    changeVal(value) {
      switch (value) {
        case "month":
          this.isActive = "month";
          this.series = [{
            name: '收入',
            type: 'column',
            data: [25, 45, 21, 61, 41, 75, 75, 21, 75, 14, 42, 34]
          }, {
            name: '花费',
            type: 'column',
            data: [20, 50, 42, 10, 24, 28, 60, 35, 47, 64, 78, 44]
          }, {
            name: '净利润（亏损）',
            type: 'area',
            data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43, 33]
          }, {
            name: '净利润率',
            type: 'line',
            data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39, 30]
          }];
          break;
        case "year":
          this.isActive = "year";
          this.series = [{
            name: '收入',
            type: 'column',
            data: [30, 48, 28, 74, 39, 87, 54, 36, 50, 87, 84, 53]
          }, {
            name: '花费',
            type: 'column',
            data: [20, 50, 42, 10, 24, 28, 60, 35, 47, 64, 78, 42]
          }, {
            name: '净利润（亏损）',
            type: 'area',
            data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43, 38]
          }, {
            name: '净利润率',
            type: 'line',
            data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39, 33]
          }];
          break;
        default:
          break;
      }
    },
  },
};
</script>
<template>
    <div class="card">
      <div class="card-body">
        <div class="d-sm-flex flex-wrap">
          <h4 class="card-title mb-4">公司损益</h4>
          <div class="ms-auto">
            <ul class="nav nav-pills">
              <li class="nav-item">
                <a class="nav-link" href="javascript:void(0);" @click="changeVal('month')"
                  :class="{ 'active': isActive == 'month' }">月份</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="javascript:void(0);" @click="changeVal('year')"
                  :class="{ 'active': isActive == 'year' }">年份</a>
              </li>
            </ul>
          </div>
        </div>
        <apexchart v-if="isActive == 'year'" class="apex-charts" type="line" dir="ltr" height="350" :series="series" :options="chartOptions">
        </apexchart>
        <apexchart v-else class="apex-charts" type="line" dir="ltr" height="350" :series="series" :options="chartOptionsMonth">
        </apexchart>
      </div>
    </div>
</template>
