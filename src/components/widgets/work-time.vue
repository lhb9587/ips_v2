<script>
import { queryWorkHours } from "@/api/caseList";
import dayjs from "dayjs";
export default {
  props: {
    containerHegiht:{
      type: Number,
    },
    cardDesc: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      isActive: "record",
      dataList: [],
      columns: [
        {
          title: "员工",
          value: "whUserName",
          width: 120,
        },
        {
          title: "记录工时",
          value: "jiluSum",
          width: 80,
        },
        {
          title: "核定工时",
          value: "hedingSum",
          width: 80,
        },
        {
          title: "账单工时",
          value: "zhangdanSum",
          width: 80,
        },
        {
          title: "核定/记录比",
          value: "hedingjilu",
          minWidth: 140,
        },
        {
          title: "账单/核定比",
          value: "zhangdanheding",
          minWidth: 140,
        },
      ],
      selectDate: "thisMonth",
      filterOptions: [
        {
          value: "thisMonth",
          label: "本月",
        },
        {
          value: "lastMonth",
          label: "上月",
        },
        {
          value: "thisQuarter",
          label: "本季度",
        },
      ],
      avatarLoadErrorList: [],
      loading: false,
      mouseInner: false,
    };
  },
  computed: {
    workHourDateArray() {
      let date;
      switch (this.selectDate) {
        case "thisMonth":
          date = [
            dayjs().startOf("month").format("YYYY-MM-DD"),
            dayjs().endOf("month").format("YYYY-MM-DD"),
          ];
          break;
        case "lastMonth":
          date = [
            dayjs().subtract(1, "month").startOf("month").format("YYYY-MM-DD"),
            dayjs().subtract(1, "month").endOf("month").format("YYYY-MM-DD"),
          ];
          break;
        case "thisQuarter":
          date = this.getCurrentQuarterDates();
          break;
      }
      return date;
    },
    contentHeight(){
      return this.containerHegiht - 100
    }
  },
  methods: {
    formatNumber(numStr) {
      // 将字符串转换为浮点数
      const num = parseFloat(numStr);

      // 检查小数点后两位是否都是0
      if (numStr.match(/\.00$/)) {
        // 如果是，则转换为整数
        return num.toFixed(0);
      } else {
        // 如果不是，则保持原样
        return numStr;
      }
    },
    handleAvatarError(userId) {
      this.avatarLoadErrorList = [...this.avatarLoadErrorList, userId];
    },
    getCurrentQuarterDates() {
      const currentDate = dayjs();
      const currentMonth = currentDate.month();
      let startMonth, endMonth;

      if (currentMonth < 3) {
        startMonth = 0;
        endMonth = 2;
      } else if (currentMonth < 6) {
        startMonth = 3;
        endMonth = 5;
      } else if (currentMonth < 9) {
        startMonth = 6;
        endMonth = 8;
      } else {
        startMonth = 9;
        endMonth = 11;
      }

      const startDate = dayjs()
        .month(startMonth)
        .startOf("month")
        .format("YYYY-MM-DD");
      const endDate = dayjs()
        .month(endMonth)
        .endOf("month")
        .format("YYYY-MM-DD");

      return [startDate, endDate];
    },
    formatPercent(value) {
      if (!value || value == "0.00%") {
        return 0;
      } else {
        const result = value.replace("%", "");
        return Number(Number(result).toFixed(0));
      }
    },
    timeToMinutes(timeStr) {
      if (!timeStr) {
        return 0;
      }
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    },
    fetchData() {
      this.loading = true;
      const params = {
        whStatus: 4,
        workHourDateArray: this.workHourDateArray,
        isStatistics: 1,
      };
      queryWorkHours(params, { isLoading: false }).then((res) => {
        this.dataList = res.data.workhoursList;
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
      } else {
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
    class="card"
    @mouseenter="mouseInner = true"
    @mouseleave="handleMouseLeave"
  >
    <div class="card-body">
      <div class="d-flex flex-wrap">
        <div class="mb-4 d-flex align-items-center gap-1">
          <h4 class="card-title mb-0">
            <span>工时</span>
            <el-popover
              placement="bottom-start"
              title="工时"
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
        <div>
          <el-select
            v-model="selectDate"
            style="width: 120px; margin-top: -6px; margin-left: 8px"
            @change="fetchData"
          >
            <el-option
              v-for="item in filterOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          /></el-select>
        </div>
      </div>
      <div
        class="table-responsive"
        :style="{ height:`${contentHeight}px`}"
      >
        <el-table
          :data="dataList"
          v-loading="loading"
          element-loading-text="请等待"
          :fit="true"
          :height="contentHeight"
          :scrollbar-always-on="true"
        >
          <el-table-column
            :prop="col.value"
            :label="col.title"
            v-for="col of columns"
            :key="col.value"
            :width="col.width ? col.width : 'auto'"
            :min-width="col.minWidth ? col.minWidth : ''"
          >
            <template #default="scope">
              <span v-if="col.value === 'whUserName'">
                <div
                  class="d-flex"
                  style="gap: 18px"
                >
                  <img
                    :src="`/ipdoc${scope.row['userIcon']}`"
                    v-if="scope.row['userId']&&!avatarLoadErrorList.includes(scope.row['userId'])"
                    class="avatar-xs rounded-circle"
                    @error="handleAvatarError(scope.row['userId'])"
                  />
                  <img
                    v-else
                    src="@/assets/images/users/defaultavatar.png"
                    class="avatar-xs rounded-circle"
                  />
                  <p class="mb-0 pt-lg-2">{{ scope.row["userName"] }}</p>
                </div></span
              >
              <span v-if="col.value === 'jiluSum'">
                {{ formatNumber(scope.row["jiluSum"]) }}</span
              >
              <span v-if="col.value === 'hedingSum'">
                {{ formatNumber(scope.row["hedingSum"]) }}</span
              >
              <span v-if="col.value === 'zhangdanSum'">
                {{ formatNumber(scope.row["zhangdanSum"]) }}</span
              >
              <span v-if="col.value === 'hedingjilu'">
                <span
                  v-if="
                    scope.row['hedingSum'] && scope.row['hedingSum'] !== '0.00'
                  "
                >
                  <h5 class="font-size-14">
                    {{ formatNumber(scope.row["hedingSum"]) }}
                    <span style="float: right">{{
                      scope.row["hedingjilu"]
                    }}</span>
                  </h5>
                  <b-progress
                    :value="formatPercent(scope.row['hedingjilu'])"
                    variant="primary"
                    height="5px"
                  ></b-progress>
                </span>
                <span v-else></span>
              </span>
              <span v-if="col.value === 'zhangdanheding'">
                <span
                  v-if="
                    scope.row['zhangdanSum'] &&
                    scope.row['zhangdanSum'] !== '0.00'
                  "
                >
                  <h5 class="font-size-14">
                    {{ formatNumber(scope.row["zhangdanSum"]) }}
                    <span style="float: right">{{
                      scope.row["zhangdanheding"]
                    }}</span>
                  </h5>
                  <b-progress
                    :value="formatPercent(scope.row['zhangdanheding'])"
                    variant="success"
                    height="5px"
                  ></b-progress>
                </span>
                <span v-else></span>
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>
<style scoped>
.event-list {
  padding: 0px 0px 38px 30px;
}
.card-title {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
