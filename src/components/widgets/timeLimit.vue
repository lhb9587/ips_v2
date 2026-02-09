<template>
  <div 
    class="card"
    @mouseenter="mouseInner = true"
    @mouseleave="handleMouseLeave"
  >
    <div class="card-body pb-2">
      <div class="mb-3 d-flex align-items-center gap-1">
        <h4 class="card-title mb-0">
          <span>案件时限</span>
          <el-popover
            placement="bottom-start"
            title="案件时限"
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
      <div class="calendar-header">
        <button
          class="arrow-btn"
          @click="changeMonth(-1)"
        >
          <i class="bx bx-chevron-left"></i>
        </button>
        <span class="current-month">{{ currentMonth }}</span>
        <button
          class="arrow-btn"
          @click="changeMonth(1)"
        >
          <i class="bx bx-chevron-right"></i>
        </button>
        <button
          class="today-btn"
          @click="goToMonth"
        >
          回到当月
        </button>
      </div>
      <div class="calendar-grid">
        <div
          v-for="day in ['日', '一', '二', '三', '四', '五', '六']"
          :key="day"
          class="calendar-day weekday"
        >
          {{ day }}
        </div>
        <div
          v-for="day in calendarDays"
          :key="day.date"
          class="calendar-day"
          :class="{
            'current-day': isSameDate(day.date, selectedData.abslimitDate),
            'different-month': !day.isCurrentMonth,
            selectable: day.isCurrentMonth,
          }"
          @click="selectDate(day)"
        >
          {{ day.dayOfMonth }}
        </div>
      </div>
    </div>
    <div
      class="card-body"
      :style="{ height: `${contentHeight}px` }"
      style="padding-top: 10px"
      v-loading="loading"
      element-loading-text="请等待"
    >
      <SimpleBar style="height: 100%">
        <ul class="deadline-list">
          <li
            v-for="deadline of limitList"
            :key="deadline.tltId"
            :class="{ 'deadline-item': true, 'is-selected': deadline.tltId === selectedData.tltId }"
            v-on:click="viewDetail(deadline)"
            style="cursor: pointer"
          >
            <div
              class="deadline-icon"
              :class="deadline.iconClass"
            ></div>
            <div class="deadline-content">
              <div class="deadline-range d-flex">
                <div
                  v-if="deadline.sendDate"
                  style="color: #556ee6; margin-right: 10px"
                >
                  {{ "[基准]" }}
                  <span style="color: #8f959e">{{ deadline.sendDate }}</span>
                </div>
                <div
                  v-if="deadline.abslimitDate"
                  style="color: #d9001b; margin-right: 10px"
                >
                  {{ "[绝限]" }}
                  <span style="color: #8f959e">{{
                    deadline.abslimitDate
                  }}</span>
                </div>
              </div>
              <div class="deadline-text d-flex">
                <a
                  href="javascript: void(0);"
                  class="text-dark"
                >
                  {{ deadline.typeName }}
                </a>
                <div class="deadline-company">{{ deadline.custName }}</div>
              </div>
            </div>
          </li>
        </ul>
        <el-empty
          :image-size="90"
          v-if="!limitList.length"
          description="暂无时限"
        />
      </SimpleBar>
    </div>
  </div>
  <b-modal
    v-model="showDetailModal"
    title="时限详情"
    centered
    hide-footer
    content-class="autoWidth-modal"
    style="z-index: 1041"
  >
    <LimitDetail :detail="detail" />
  </b-modal>
</template>

<script setup>
import { ref, computed, onMounted, defineProps, watch, nextTick } from "vue";
import { getTimelimitList, getTimelimitDetail } from "@/api/caseList";
import dayjs from "dayjs";
import { SimpleBar } from "simplebar-vue3";
import LimitDetail from "@/components/sidebar/components/limit/detail";

const currentDate = ref(new Date());
const selectedData = ref({});
const limitList = ref([]);
const showDetailModal = ref(false);
const detail = ref({});
const mouseInner = ref(false);
const descPopoverRef = ref(null);

const props = defineProps({
  containerHegiht: {
    type: Number,
  },
  cardDesc: {
    type: String,
    default: ""
  }
});

const contentHeight = computed(() => {
  return props.containerHegiht - 392;
});

const currentMonth = computed(() => {
  return currentDate.value.toLocaleString("zh-CN", {
    year: "numeric",
    month: "long",
  });
});
watch(
  () => currentMonth.value,
  () => {
    fetchLimitList(currentDate.value, "month");
  }
);

const viewDetail = (deadline) => {
  if (deadline.tltId == selectedData.value.tltId) {
    selectedData.value = {}
    fetchLimitList(currentDate.value, "month");
    return false
  }
  selectedData.value = deadline;
  getTimelimitDetail({ tltId: deadline.tltId}).then((res) => {
    detail.value = res.data;
  });
  showDetailModal.value = true;
};

const isSameDate = (date1, date2) => {
  if(!date1 || !date2) return false;
  // return (
  //   date1.getFullYear() === date2.getFullYear() &&
  //   date1.getMonth() === date2.getMonth() &&
  //   date1.getDate() === date2.getDate()
  // );
  return dayjs(date1).isSame(date2, 'day');
};

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];

  // 添加上个月的日期
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDay - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthDays - i);
    days.push({
      id: `prev-${i}`,
      date: date,
      dayOfMonth: prevMonthDays - i,
      isCurrentMonth: false,
      isSelectable: false,
      // isToday: isSameDate(date, new Date()),
    });
  }

  // 添加当前月的日期
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    days.push({
      id: `current-${i}`,
      date: date,
      dayOfMonth: i,
      isCurrentMonth: true,
      isSelectable: true,
      // isToday: isSameDate(date, new Date()),
    });
  }

  // 添加下个月的日期，确保总共有 6 行（42天）
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i);
    days.push({
      id: `next-${i}`,
      date: date,
      dayOfMonth: i,
      isCurrentMonth: false,
      isSelectable: false,
      // isToday: isSameDate(date, new Date()),
    });
  }
  return days;
});

// const deadlines = ref([
//   { reference: '[基准]', absolutely: '[绝限]', title: '莱雅公司', baseDate: '2023-05-15', beadline: '2023-05-15', text: '新案递交截止', iconClass: 'bx bx-file' },
//   { reference: '[基准]', absolutely: '[绝限]',title: '穆汉·巴干沃达斯·莫加尼', baseDate: '2023-05-15', beadline: '2023-05-15', text: '行政复议时限', iconClass: 'bx bx-time-five' },
//   { reference: '', absolutely: '', title: '伊夫兰洛德酒水公司', baseDate: '', beadline: '', text: '补充材料时限', iconClass: 'bx bx-folder-open' },
//   { reference: '', absolutely: '', title: '伊夫兰洛德酒水公司', baseDate: '', beadline: '', text: '补充材料时限', iconClass: 'bx bx-folder-open' },
// ]);

const goToMonth = () => {
  currentDate.value = new Date();
  fetchLimitList(currentDate.value,'month')
  selectedData.value = {};
};

const changeMonth = (delta) => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + delta,
    1
  );
  selectedData.value = {};
};

const selectDate = (day) => {
  selectedData.value = {};
  if (day.isSelectable) {
    currentDate.value = day.date;
    // 这里可以添加选择日期后的逻辑，比如更新案件时限列表
    fetchLimitList(day.date,'date');
  }
};
const loading = ref(false);
const fetchLimitList = (date, type) => {
  loading.value = true;
  const data = {
    tltTypeIdList: [
      19, 24, 26, 31, 49, 53, 57, 85, 99, 133, 135, 300001, 300118, 300225,
    ],
    pageNo: 1,
    pageSize: 99999,
  };
  if (type == "date") {
    data.abslimitDateList = [
      dayjs(date).format("YYYY-MM-DD"),
      dayjs(date).format("YYYY-MM-DD"),
    ];
    selectedData.value.abslimitDate = dayjs(date).format("YYYY-MM-DD");
  } else if (type == "month") {
    data.abslimitDateList = [
      dayjs(date).startOf("month").format("YYYY-MM-DD"),
      dayjs(date).endOf("month").format("YYYY-MM-DD"),
    ];
  }
  getTimelimitList(data).then((res) => {
    limitList.value = res.data;
    loading.value = false;
  });
};
onMounted(() => {
  fetchLimitList(currentDate.value, "month");
});
// watch(
//   () => currentDate.value,
//   (newDate, oldDate) => {
//     if (
//       dayjs(newDate).format("HH-MM-DD") != dayjs(oldDate).format("HH-MM-DD")
//     ) {
//       fetchLimitList(newDate);
//     }
//   }
// );

const handleMouseLeave = (event) => {
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
      nextTick(() => {
        if (descPopoverRef.value) {
          descPopoverRef.value.hide();
        }
        setTimeout(() => {
          mouseInner.value = false;
        }, 100);
      });
    }
  }else{
    mouseInner.value = false;
  }
};
</script>

<style scoped>
.title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* margin-bottom: 15px; */
}

.arrow-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #556ee6;
  cursor: pointer;
}

.current-month {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.today-btn {
  background: none;
  border: none;
  color: #556ee6;
  cursor: pointer;
  font-size: 14px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
}

.calendar-day {
  width: 30px;
  height: 30px;
  margin: 5px 0px;
  padding: 5px;
  text-align: center;
  /* padding: 10px 5px; */
  font-size: 14px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.weekday {
  font-weight: bold;
  color: #666;
}

.current-day {
  width: 30px;
  height: 30px;
  margin: 5px 0px;
  padding: 5px;
  background-color: #556ee6;
  color: white;
}

.different-month {
  color: #ccc;
}

.selectable {
  cursor: pointer;
}

.selectable:hover {
  background-color: #e7f8ff;
}

.deadline-section {
  padding: 10px 20px;
}

.deadline-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}
.is-selected{
  background-color: #F0F0F0;
  border-radius: 4px;
}

.deadline-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.deadline-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #e9f3fb;
  color: #556ee6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 15px;
  margin-right: 15px;
  font-size: 16px;
}

.deadline-content {
  flex-grow: 1;
}

.deadline-range {
  font-size: 14px;
  color: #8f959e;
  margin-bottom: 5px;
}

.deadline-text {
  font-size: 14px;
  color: #333;
}

.deadline-company {
  margin-left: 10px;
  color: #8f959e;
  font-size: 12px;
  align-content: center;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
