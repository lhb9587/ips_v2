<script>
import { salesAnalyticsDonutChart, ChatData } from "./data";
export default {
  data() {
    return {
      salesAnalyticsDonutChart: salesAnalyticsDonutChart,
      ChatData: ChatData,
    }
  }

};
</script>
<template>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-4">领域账单收入占比</h4>

      <div>
        <apexchart
          class="apex-charts"
          dir="ltr"
          height="240"
          :series="salesAnalyticsDonutChart.series"
          :options="salesAnalyticsDonutChart.chartOptions"
        ></apexchart>
      </div>

      <div class="text-center text-muted">
        <div class="row">
          <div class="col-2">
            <div class="mt-4">
              <p class="mb-2 text-truncate">
                <i class="mdi mdi-circle text-primary me-1"></i>
                商标
              </p>
              <h6>8017万+</h6>
            </div>
          </div>
          <div class="col-2">
            <div class="mt-4">
              <p class="mb-2 text-truncate">
                <i class="mdi mdi-circle text-success me-1"></i>
                诉讼
              </p>
              <h6>4112万+</h6>
            </div>
          </div>
          <div class="col-2">
            <div class="mt-4">
              <p class="mb-2 text-truncate">
                <i class="mdi mdi-circle text-danger me-1"></i>
                专利
              </p>
              <h6>2684万+</h6>
            </div>
          </div>
          <div class="col-2">
            <div class="mt-4">
              <p class="mb-2 text-truncate">
                <i class="mdi mdi-circle me-1" style="color: #f1c40f;"></i>
                保护
              </p>
              <h6>2668万+</h6>
            </div>
          </div>
          <div class="col-4">
            <div class="mt-4">
              <p class="mb-2 text-truncate">
                <i class="mdi mdi-circle me-1" style="color: #e67e22;"></i>
                非诉、著作权、域名
              </p>
              <h6>399万+</h6>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>