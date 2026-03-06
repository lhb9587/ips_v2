<template>
  <Layout>
    <div
      class="d-flex gap-3 schedule-container"
      ref="scheduleContainer"
    >
      <div
        class="card mb-0"
        v-show="!isSmallScreen"
      >
        <div class="card-body">
          <div
            style="width: 320px"
            class="left-date-select"
          >
            <el-date-picker-panel
              v-model="dateValue"
              style="border-radius: 10px"
              @panel-change="handlePanelChange"
              :disabled-date="disabledDate"
              :cell-class-name="customCellClass"
              class="customer-pick-panel"
            >
              <template #prev-year> </template>
              <template #next-year></template
            ></el-date-picker-panel>
            <div class="select-content">
              <!-- Outlook 日历 Section -->
              <div class="section-wrapper">
                <div class="section-header">
                  <span class="bx bx-calendar-check title-icon"></span>
                  <span class="section-title">Outlook 日历</span>
                </div>
                <div class="section-items">
                  <div
                    class="item-row"
                    v-for="item in outlookCalendars"
                    :key="item.id"
                  >
                    <el-checkbox
                      v-model="item.checked"
                      @change="handleCheckboxChange('outlook', item)"
                    >
                      {{ item.label }}
                    </el-checkbox>
                    <span class="item-count">{{ item.count }}</span>
                  </div>
                </div>
                <div
                  v-if="!outlookCalendars.length"
                  style="color: #606266; margin-left: 20px"
                >
                  暂无日程
                </div>
              </div>

              <el-divider />

              <!-- 我的任务 Section -->
              <div class="section-wrapper">
                <div class="section-header">
                  <el-icon class="title-icon"><DocumentChecked /></el-icon>
                  <span class="section-title">我的任务</span>
                  <span class="sort-text">按开始日期</span>
                </div>
                <div class="section-items">
                  <div
                    class="item-row"
                    v-for="item in myTasks"
                    :key="item.id"
                  >
                    <el-checkbox
                      v-model="item.checked"
                      @change="handleCheckboxChange('tasks', item)"
                    >
                      {{ item.label }}
                    </el-checkbox>
                    <span class="item-count">{{ item.count }}</span>
                  </div>
                </div>
              </div>

              <el-divider />

              <!-- 项目事项 Section -->
              <div class="section-wrapper">
                <div class="section-header">
                  <el-icon class="title-icon"><Document /></el-icon>
                  <span class="section-title">项目事项</span>
                  <el-select
                    v-model="projectSortBy"
                    size="small"
                    class="sort-select"
                    @change="handleProjectSortBy"
                  >
                    <el-option
                      label="按开始日期"
                      value="startDate"
                    />
                    <el-option
                      label="按结束日期"
                      value="endDate"
                    />
                  </el-select>
                </div>
                <div class="section-items">
                  <div
                    class="item-row"
                    v-for="item in projectItems"
                    :key="item.id"
                  >
                    <el-checkbox
                      v-model="item.checked"
                      @change="handleCheckboxChange('projects', item)"
                    >
                      {{ item.label }}
                    </el-checkbox>
                    <span class="item-count">{{ item.count }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex-grow-1">
        <div class="card mb-0">
          <div class="card-body">
            <div class="app-calendar">
              <FullCalendar
                ref="fullCalendar"
                :options="calendarOptions"
                class="custom-calendar"
              ></FullCalendar>
            </div>
          </div>
        </div>
      </div>
    </div>
    <b-modal
      v-model="taskDetailVisible"
      @hidden="taskDetailVisible = false"
      :no-close-on-backdrop="true"
      centered
      hide-footer
      size="md"
      :lazy="true"
      body-class="modal-form"
    >
      <template #header>
        <div class="d-flex w-100 task-modal-header">
          <div class="mb-2 d-flex align-items-center header-project w-100">
            <div class="d-flex align-items-center gap-1">
              <div class="project-badge">
                <i class="bx bx-folder-open font-size-16"></i>
              </div>
              <span class="project-name">{{ taskDetail.projectName }}</span>
            </div>
            <div
              class="mdi mdi-close close-icon font-size-20"
              @click="taskDetailVisible = false"
            ></div>
          </div>
          <div class="task-name mb-2">{{ taskDetail.name }}</div>
          <div class="d-flex gap-2">
            <el-tag
              :type="priorityType"
              class="priority-tag"
              effect="dark"
              >{{ priorityListMap[taskDetail.priority] }}</el-tag
            >
            <div class="event-tag">事项</div>
            <div class="event-tag">{{ statusListMap[taskDetail.status] }}</div>
          </div>
        </div>
      </template>
      <div class="task-detail">
        <div class="info-item">
          <div class="left">
            <span class="icon bx bx-calendar-alt"></span>
            <span class="label">开始日期</span>
          </div>
          <div class="value">{{ taskDetail.startDate }}</div>
        </div>
        <div class="info-item">
          <div class="left">
            <span class="icon bx bx-time-five"></span>
            <span class="label">截止日期</span>
          </div>
          <div class="value">{{ taskDetail.dueDate }}</div>
        </div>
        <div class="info-item">
          <div class="left">
            <span class="icon bx bx-user"></span>
            <span class="label">负责人</span>
          </div>
          <div class="value">{{ taskDetail.ownerName }}</div>
        </div>
        <div class="info-item">
          <div class="left">
            <span class="icon bx bx-purchase-tag-alt"></span>
            <span class="label">项目</span>
          </div>
          <div class="value">{{ taskDetail.projectName }}</div>
        </div>
        <div class="info-item">
          <div class="left">
            <span class="icon bx bx-purchase-tag-alt"></span>
            <span class="label">事项ID</span>
          </div>
          <div class="value">
            {{ taskDetail.taskCode || taskDetail.subtaskCode }}
          </div>
        </div>
        <div class="info-item-member">
          <div class="left">
            <span class="icon iconfont icon-users"></span>
            <span class="label">参与人员</span>
          </div>
          <div class="member-list">
            <div
              class="member-item"
              v-for="member in taskDetail.memberList || []"
              :key="member.userId"
            >
              <span class="event-tag">{{ member.userName }}</span>
            </div>
          </div>
        </div>
        <div class="info-item-member">
          <div class="left">
            <span class="icon bx bx-purchase-tag-alt"></span>
            <span class="label">标签</span>
          </div>
          <div class="member-list">
            <div
              class="member-item"
              v-for="tag in taskDetail.tagList || []"
              :key="tag.ttaId"
            >
              <span class="event-tag">{{ tag.tagName }}</span>
            </div>
          </div>
        </div>
        <el-divider />
        <div class="info-item-member">
          <div class="left">
            <span class="label">描述</span>
          </div>
          <div
            v-html="taskDetail.description"
            style="max-height: 200px; overflow-y: auto"
          ></div>
        </div>
      </div>
      <div class="w-100 modal-footer">
        <div class="text-end">
          <el-button @click="taskDetailVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="viewDetails"
            >查看完整详情</el-button
          >
        </div>
      </div>
    </b-modal>
    <b-modal
      v-model="createCalendarVisible"
      @hidden="createCalendarVisible = false"
      :no-close-on-backdrop="true"
      centered
      hide-footer
      size="md"
      :no-close-on-esc="true"
      :lazy="true"
      body-class="modal-form"
    >
      <template #header>
        <div class="calendar-header w-100">
          <div class="d-flex align-items-center gap-2">
            <div class="calendar-icon">
              <i class="bx bx-calendar-check font-size-24"></i>
            </div>
            <div class="calendar-title">
              <div class="name">创建Outlook日程</div>
              <div class="desc">为我的日历创建日程会议</div>
            </div>
          </div>
          <div
            class="close-icon"
            @click="closeCalendarModal"
          >
            <i class="mdi mdi-close close-icon font-size-20"></i>
          </div>
        </div>
      </template>
      <el-form
        :model="calendarForm"
        :rules="calendarRules"
        ref="calendarFormRef"
        class="calendarForm"
      >
        <el-form-item
          label="标题"
          prop="name"
        >
          <el-input
            v-model="calendarForm.name"
            placeholder="请输入会议标题"
          />
        </el-form-item>
        <el-form-item
          label="开始时间"
          prop="startDate"
        >
          <el-date-picker
            v-model="calendarForm.startDate"
            type="datetime"
            placeholder="请选择开始时间"
            style="width: 100%"
            format="YYYY-MM-DD HH:mm"
            date-format="YYYY-MM-DD"
            time-format="HH:mm"
        /></el-form-item>
        <el-form-item
          label="结束时间"
          prop="endDate"
        >
          <el-date-picker
            v-model="calendarForm.endDate"
            style="width: 100%"
            type="datetime"
            format="YYYY-MM-DD HH:mm"
            date-format="YYYY-MM-DD"
            time-format="HH:mm"
            placeholder="请选择结束时间"
        /></el-form-item>
        <el-form-item
          label="时区"
          prop="shiqu"
        >
          <el-select
            v-model="calendarForm.shiqu"
            placeholder="请选择时区"
            filterable
            clearable
            class="flex-grow-1"
          >
            <el-option
              v-for="item in []"
              :label="item.label"
              :value="item.value"
              :key="item.value"
            /> </el-select
        ></el-form-item>
        <el-form-item
          label="位置"
          prop="address"
        >
          <el-input
            v-model="calendarForm.address"
            placeholder="请输入会议地点或在线会议链接"
          />
        </el-form-item>
        <el-form-item
          label="与会者"
          prop="yuhuizhe"
        >
          <el-select
            v-model="calendarForm.yuhuizhe"
            multiple
            placeholder="输入邮箱地址或姓名搜索"
          >
            <el-option
              v-for="item in []"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="会议详情"
          prop="description"
        >
          <el-input
            v-model="calendarForm.description"
            type="textarea"
            placeholder="添加议程备注或其他详细信息"
            :autosize="{ minRows: 2, maxRows: 4 }"
          ></el-input>
        </el-form-item>
      </el-form>
      <div class="w-100 modal-footer">
        <div class="text-end">
          <el-button @click="closeCalendarModal">取消</el-button>
          <el-button
            type="primary"
            @click="createCalendar"
            >创建日程</el-button
          >
        </div>
      </div>
    </b-modal>
    <b-modal
      v-model="outlookDetailVisible"
      @hidden="outlookDetailVisible = false"
      :no-close-on-backdrop="true"
      centered
      hide-footer
      size="md"
      :no-close-on-esc="true"
      :lazy="true"
      body-class="modal-form"
    >
      <template #header>
        <div class="calendar-detail-header w-100">
          <div class="d-flex w-100 justify-content-between">
            <div class="detail-left">
              <div class="calendar-icon">
                <i class="bx bx-calendar-check font-size-16"></i>
              </div>
              <div class="calendar-name">OUTLOOK日程</div>
            </div>
            <div class="detail-right">
              <div
                class="mdi mdi-close close-icon font-size-20"
                @click="outlookDetailVisible = false"
              ></div>
            </div>
          </div>
          <div class="calendar-title">{{ selectedInfo.subject }}</div>
        </div>
      </template>
      <div class="meeting-info">
        <div class="meeting-info-item">
          <div class="meeting-info-left">
            <span class="meeting-info-icon bx bx-calendar-alt"></span>
            <span class="meeting-info-label">开始时间</span>
          </div>
          <div class="meeting-info-value">
            {{
              dayjs
                .utc(selectedInfo.startTime)
                .local()
                .format("YYYY-MM-DD HH:mm")
            }}
          </div>
        </div>
        <div class="meeting-info-item">
          <div class="meeting-info-left">
            <span class="meeting-info-icon bx bx-time-five"></span>
            <span class="meeting-info-label">结束时间</span>
          </div>
          <div class="meeting-info-value">
            {{
              dayjs.utc(selectedInfo.endTime).local().format("YYYY-MM-DD HH:mm")
            }}
          </div>
        </div>
        <!-- <div class="meeting-info-item">
          <div class="meeting-info-left">
            <span class="meeting-info-icon bx bx-globe"></span>
            <span class="meeting-info-label">时区</span>
          </div>
          <div class="meeting-info-value">2025-12-12</div>
        </div> -->
        <div class="meeting-info-item">
          <div class="meeting-info-left">
            <span class="meeting-info-icon bx bx-user"></span>
            <span class="meeting-info-label">组织者</span>
          </div>
          <div class="meeting-info-value">
            {{ selectedInfo.organizerEmail }}
          </div>
        </div>
        <div class="meeting-info-item">
          <div class="meeting-info-left">
            <span class="meeting-info-icon mdi mdi-map-marker-outline"></span>
            <span class="meeting-info-label">位置</span>
          </div>
          <div class="meeting-info-value">{{ selectedInfo.location }}</div>
        </div>
        <div class="meeting-info-item-wrap">
          <div class="meeting-info-left">
            <span class="meeting-info-icon icon iconfont icon-users"></span>
            <span class="meeting-info-label">与会者</span>
          </div>
          <div class="metting-attendees-tags">
            <div
              class="metting-attendees-tag"
              v-for="item in attendeesList"
              :key="item.email"
            >
              <div class="metting-attendees-name">{{ item.name }}</div>
            </div>
          </div>
        </div>
        <div class="meeting-info-item-wrap">
          <div class="meeting-info-left">
            <span class="meeting-info-label">会议详情</span>
          </div>
          <div class="meeting-info-description">
            {{ selectedInfo.bodyPreview }}
          </div>
        </div>
      </div>
    </b-modal>
    <DragSidebar
      :noCloseOnEsc="false"
      v-if="taskDetailModelValue"
      sidebarName="task-sidebar"
      v-model="taskDetailModelValue"
      @close="closeTaskDetailModal"
      ><TaskDetail
        :taskId="selectedInfo.objId"
        @close="closeTaskDetailModal"
        :taskType="selectedInfo.objType"
      />
    </DragSidebar>
    <el-drawer
      v-model="sidebarDrawerVisible"
      direction="ltr"
      size="360px"
      :with-header="false"
      custom-class="sidebar-drawer"
    >
      <div class="left-date-select">
        <el-date-picker-panel
          v-model="dateValue"
          style="border-radius: 10px"
          @panel-change="handlePanelChange"
          :disabled-date="disabledDate"
          :cell-class-name="customCellClass"
          class="customer-pick-panel"
        >
          <template #prev-year> </template>
          <template #next-year></template
        ></el-date-picker-panel>
        <div class="select-content">
          <!-- Outlook 日历 Section -->
          <div class="section-wrapper">
            <div class="section-header">
              <span class="bx bx-calendar-check title-icon"></span>
              <span class="section-title">Outlook 日历</span>
            </div>
            <div class="section-items">
              <div
                class="item-row"
                v-for="item in outlookCalendars"
                :key="item.id"
              >
                <el-checkbox
                  v-model="item.checked"
                  @change="handleCheckboxChange('outlook', item)"
                >
                  {{ item.label }}
                </el-checkbox>
                <span class="item-count">{{ item.count }}</span>
              </div>
            </div>
            <div
              v-if="!outlookCalendars.length"
              style="color: #606266; margin-left: 20px"
            >
              暂无日程
            </div>
          </div>

          <el-divider />

          <!-- 我的任务 Section -->
          <div class="section-wrapper">
            <div class="section-header">
              <el-icon class="title-icon"><DocumentChecked /></el-icon>
              <span class="section-title">我的任务</span>
              <span class="sort-text">按开始日期</span>
            </div>
            <div class="section-items">
              <div
                class="item-row"
                v-for="item in myTasks"
                :key="item.id"
              >
                <el-checkbox
                  v-model="item.checked"
                  @change="handleCheckboxChange('tasks', item)"
                >
                  {{ item.label }}
                </el-checkbox>
                <span class="item-count">{{ item.count }}</span>
              </div>
            </div>
          </div>

          <el-divider />

          <!-- 项目事项 Section -->
          <div class="section-wrapper">
            <div class="section-header">
              <el-icon class="title-icon"><Document /></el-icon>
              <span class="section-title">项目事项</span>
              <el-select
                v-model="projectSortBy"
                size="small"
                class="sort-select"
                @change="handleProjectSortBy"
              >
                <el-option
                  label="按开始日期"
                  value="startDate"
                />
                <el-option
                  label="按结束日期"
                  value="endDate"
                />
              </el-select>
            </div>
            <div class="section-items">
              <div
                class="item-row"
                v-for="item in projectItems"
                :key="item.id"
              >
                <el-checkbox
                  v-model="item.checked"
                  @change="handleCheckboxChange('projects', item)"
                >
                  {{ item.label }}
                </el-checkbox>
                <span class="item-count">{{ item.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </Layout>
</template>

<script setup>
import { ref, onMounted, watch, computed, onUnmounted, nextTick } from "vue";
import Layout from "@/layouts/main.vue";
import { DocumentChecked, Document } from "@element-plus/icons-vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import multiMonthPlugin from "@fullcalendar/multimonth";
import interactionPlugin from "@fullcalendar/interaction";
import bootstrapPlugin from "@fullcalendar/bootstrap";
import listPlugin from "@fullcalendar/list";
import DragSidebar from "@/components/common/sidebar-drag/index.vue";
import TaskDetail from "@/views/project/components/task/task-detail.vue";
import {
  queryProjectList,
  queryTodoTaskByPrjId,
  queryMyTasksAsOwner,
  queryTaskDetail,
  querySubtaskDetail,
} from "@/api/project";
// import { queryCalendars, queryCalendarEvents } from "@/api/schedule";
import { queryCalendarEvents } from "@/api/schedule";
import { statusListMap, priorityListMap } from "../project/dataMap";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const dateValue = ref(new Date());

// 监听 dateValue 的变化，更新 FullCalendar 的高亮显示
watch(dateValue, () => {
  if (fullCalendar.value) {
    const calendarApi = fullCalendar.value.getApi();
    // 强制重新渲染日历以更新高亮样式
    calendarApi.render();
  }
});

const scheduleContainer = ref(null);
const isSmallScreen = ref(false);
let resizeObserver = null;
const updateSize = () => {
  if (fullCalendar.value) {
    fullCalendar.value.getApi().updateSize();
  }
};

const getEventCountForDate = (date) => {
  const dateStr = dayjs(date).format("YYYY-MM-DD");
  const count = eventSources.value.filter((event) => {
    return dayjs(event.start).format("YYYY-MM-DD") === dateStr;
  }).length;

  return count;
};

watch(isSmallScreen, (val) => {
  nextTick(() => {
    updateSize();
    const calendarApi = fullCalendar.value.getApi();
    if (val) {
      calendarApi.setOption("headerToolbar", {
        right: "",
        center: "title",
        left: "more dayGridMonth,dayGridWeek,listDay,listMonth today prev,next",
      });
    } else {
      calendarApi.setOption("headerToolbar", {
        right: "",
        center: "title",
        left: "dayGridMonth,dayGridWeek,listDay,listMonth today prev,next",
      });
    }
  });
});

// 初始化 ResizeObserver
const initResizeObserver = () => {
  if (scheduleContainer.value && !resizeObserver) {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === scheduleContainer.value) {
          isSmallScreen.value = entry.contentRect.width < 1000;
        }
      }
      // 当容器尺寸变化时，调用 updateSize 方法
      if (typeof updateSize === "function") {
        updateSize();
      }
    });

    // 开始观察容器
    resizeObserver.observe(scheduleContainer.value);
  }
};

const eventSources = ref([]);
const projectSortBy = ref("startDate");
const fullCalendar = ref();
const startDate = ref(dayjs().startOf("month").format("YYYY-MM-DD"));
const endDate = ref(dayjs().endOf("month").format("YYYY-MM-DD"));
const taskDetailVisible = ref(false);
const sidebarDrawerVisible = ref(false);
const taskDetail = ref({});
const selectedInfo = ref({});
const taskDetailModelValue = ref(false);
const currentView = ref("dayGridMonth");

const createCalendarVisible = ref(false);
const calendarForm = ref({});
const calendarFormRef = ref(null);

const outlookDetailVisible = ref(false);
const calendarRules = {
  name: [{ required: true, message: "请输入会议标题" }],
  startDate: [{ required: true, message: "请选择开始时间" }],
  endDate: [{ required: true, message: "请选择结束时间" }],
  shiqu: [{ required: true, message: "请选择时区" }],
};

const closeTaskDetailModal = () => {
  taskDetailModelValue.value = false;
};

//不符合面板单月的日期禁用
const disabledDate = (date) => {
  return dayjs(date).month() !== dayjs(dateValue.value).month();
};
const eventClick = (info) => {
  console.log(info, "info");

  const detail = info.event.extendedProps;
  selectedInfo.value = detail;
  if (detail.type === "task") {
    taskDetailVisible.value = true;
    fetchTakskDetail(detail.objId, detail.objType);
  } else {
    outlookDetailVisible.value = true;
  }
};

const viewDetails = () => {
  taskDetailModelValue.value = true;
  taskDetailVisible.value = false;
};
const closeCalendarModal = () => {
  createCalendarVisible.value = false;
  calendarFormRef.value.resetFields();
};
const createCalendar = () => {
  calendarFormRef.value.validate((valid) => {
    if (valid) {
      createCalendarVisible.value = false;
    }
  });
};

const fetchTakskDetail = async (taskId, taskType) => {
  let res;
  if (taskType === 1) {
    const params = {
      taskId: taskId,
    };
    res = await queryTaskDetail(params);
  } else {
    const params = {
      subtaskId: taskId,
    };
    res = await querySubtaskDetail(params);
  }
  taskDetail.value = res.data || {};
};

const priorityType = computed(() => {
  switch (taskDetail.value.priority) {
    case "2":
      return "danger";
    case "1":
      return "warning";
    case "0":
      return "success";
    case "3":
      return "danger";
    default:
      return "success";
  }
});
const attendeesList = computed(() => {
  return Object.entries(selectedInfo.value.attendeesMap).map(
    ([email, name]) => ({
      email,
      name,
    }),
  );
});
const updateListHeader = (viewEl, isListMonth) => {
  // 1. First, search and remove ANY existing headers in the calendar to prevent persistence
  const calendarEl = document.querySelector(".app-calendar");
  if (calendarEl) {
    const existingHeaders = calendarEl.querySelectorAll(".list-view-title-bar");
    existingHeaders.forEach((h) => h.remove());
  }

  // 2. Only if it's explicitly the 'listMonth' view, add it
  if (isListMonth && viewEl) {
    const count = (eventSources.value && eventSources.value.length) || 0;
    const header = document.createElement("div");
    header.className = "list-view-title-bar";
    viewEl.prepend(header);
    header.innerHTML = `
      <div class="title-left">所有事项</div>
      <div class="title-right">
        <span class="count-badge">共 ${count} 个事项</span>
      </div>
    `;
  }
};

const handleDatesSet = (info) => {
  const calendarApi = fullCalendar.value.getApi();
  const viewEl = calendarApi.el.querySelector(".fc-view");

  currentView.value = info.view.type;
  nextTick(() => updateListHeader(viewEl, info.view.type === "listMonth"));

  const currentDate = fullCalendar.value?.getApi()?.getDate();
  if (info.view.type === "dayGridWeek") {
    startDate.value = dayjs(info.startStr).format("YYYY-MM-DD");
    endDate.value = dayjs(info.endStr).format("YYYY-MM-DD");
  } else {
    startDate.value = dayjs(currentDate).startOf("month").format("YYYY-MM-DD");
    endDate.value = dayjs(currentDate).endOf("month").format("YYYY-MM-DD");
  }
  // 同步日期选择器显示
  dateValue.value = currentDate;
};
const handlePanelChange = (date, mode) => {
  startDate.value = dayjs(date).startOf("month").format("YYYY-MM-DD");
  endDate.value = dayjs(date).endOf("month").format("YYYY-MM-DD");
  const calendarApi = fullCalendar.value.getApi();

  //判断是执行上个月还是下个月
  const currentDate = calendarApi.getDate();
  if (dayjs(date).isAfter(dayjs(currentDate))) {
    if (mode === "month") {
      calendarApi.next();
    } else {
      calendarApi.nextYear();
    }
  } else {
    if (mode === "month") {
      calendarApi.prev();
    } else {
      calendarApi.prevYear();
    }
  }
};
const calendarOptions = ref({
  firstDay: 1,
  headerToolbar: {
    right: "",
    center: "title",
    left: "dayGridMonth,dayGridWeek,listDay,listMonth today prev,next",
  },
  customButtons: {
    more: {
      text: "· · ·",
      click: () => {
        sidebarDrawerVisible.value = true;
      },
    },
  },
  dayCellContent: function (arg) {
    const isMonth = arg.view.type === "dayGridMonth";
    const isWeek = arg.view.type.includes("Week");

    if (!isMonth && !isWeek) return arg.dayNumberText;

    // 获取当前日期的事项数量
    const eventCount = getEventCountForDate(arg.date);
    const dayText = isMonth
      ? arg.dayNumberText.replace("日", "")
      : dayjs(arg.date).format("D");

    // 返回自定义的HTML内容
    return {
      html: `<div class="custom-day-cell">
              <span class="date-left ${
                arg.isToday ? "is-today" : ""
              }">${dayText}</span>
              ${
                eventCount > 0
                  ? `<span class="event-count-right">${eventCount}</span>`
                  : ""
              }
             </div>`,
    };
  },
  buttonText: {
    today: "今天",
    dayGridWeek: "周",
    month: "月",
    listDay: "日",
    listMonth: "列表",
  },
  buttonHints: {
    prev: "上个月",
    next: "下个月",
    today: "今天",
    month: "月",
    year: "年",
    week: "周",
    day: "日",
    list: "列表",
  },
  allDayText: "全天",
  plugins: [
    dayGridPlugin,
    timeGridPlugin,
    multiMonthPlugin,
    interactionPlugin,
    bootstrapPlugin,
    listPlugin,
  ],
  locale: "zh-cn",
  initialView: "dayGridMonth",
  themeSystem: "bootstrap",
  initialEvents: [],
  editable: false,
  eventStartEditable: false,
  eventDurationEditable: false,
  droppable: false,
  eventResizableFromStart: false,
  eventClick: eventClick,
  weekends: true,
  selectable: false,
  selectMirror: false,
  dayMaxEvents: true,
  views: {
    multiMonthYear: {
      type: "multiMonth",
      multiMonthMaxColumns: 2,
      duration: { years: 1 },
      buttonText: "年",
    },
    listMonth: {
      titleFormat: { year: "numeric", month: "long" },
      eventContent: (arg) => {
        const event = arg.event;
        const props = event.extendedProps;

        // 格式化日期显示
        const formatDate = (dateStr) => {
          const date = dayjs(dateStr);
          const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
          return `${date.format("M月D日")}周${weekdays[date.day()]}`;
        };

        // 格式化时间范围
        const formatTimeRange = () => {
          if (props.startTime && props.endTime) {
            const start = dayjs(props.startTime);
            const end = dayjs(props.endTime);
            return `${start.format("HH:mm")} - ${end.format("HH:mm")}`;
          }
          return "";
        };

        const tagList = props.tagList || [];

        // 构建标签HTML
        const tagsHtml = tagList
          .map((tag) => `<span class="event-tag">${tag.tagName}</span>`)
          .join("");

        return {
          html: `
            <div class="custom-list-event">
              <div class="event-header">
                <div class="event-main-info">
                    <div class="event-title">
                        <div  class="d-flex gap-2">
                          <div class="event-title-text">${
                            event.title || ""
                          }</div>
                          <div class="event-tag">${
                            props.objType === 1 ? "事项" : "子事项"
                          }</div>
                        </div>
                        <div class="event-title-attendees">
                            ${
                              priorityListMap[props.priority]
                                ? `<div class="event-tag">${
                                    priorityListMap[props.priority] || ""
                                  }</div>`
                                : ``
                            }
                            ${
                              statusListMap[props.status]
                                ? `<div class="event-tag">${
                                    statusListMap[props.status] || ""
                                  }</div>`
                                : ``
                            }
                            <div class="event-owner">${
                              props.ownerName || ""
                            }</div>    
                        </div>
                    </div>
                  <div class="event-description">${
                    props.description || props.bodyPreview || ""
                  }</div>
                </div>
              </div>
              <div class="event-meta">
                <div class="event-date-time">
                  <span class="event-date">
                    <i class="bx bx-calendar"></i> ${formatDate(event.start)}
                  </span>
                  <span class="event-time">${formatTimeRange()}</span>
                </div>
                <div class="event-project">${props.projectName || ""}</div>
              </div>
              <div class="event-tags">
                ${tagsHtml}
              </div>
            </div>
          `,
        };
      },
    },
    listDay: {
      titleFormat: { year: "numeric", month: "long" },
      eventContent: (arg) => {
        const event = arg.event;
        const props = event.extendedProps;

        // 格式化日期显示
        const formatDate = (dateStr) => {
          const date = dayjs(dateStr);
          const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
          return `${date.format("M月D日")}周${weekdays[date.day()]}`;
        };

        // 格式化时间范围
        const formatTimeRange = () => {
          if (props.startTime && props.endTime) {
            const start = dayjs(props.startTime);
            const end = dayjs(props.endTime);
            return `${start.format("HH:mm")} - ${end.format("HH:mm")}`;
          }
          return "";
        };

        const tagList = props.tagList || [];
        // 构建标签HTML
        const tagsHtml = tagList
          .map((tag) => `<span class="event-tag">${tag.tagName}</span>`)
          .join("");

        return {
          html: `
            <div class="custom-list-event">
              <div class="event-header">
                <div class="event-main-info">
                    <div class="event-title">
                        <div  class="d-flex gap-2">
                          <div class="event-title-text">${
                            event.title || ""
                          }</div>
                          <div class="event-tag">${
                            props.objType === 1 ? "事项" : "子事项"
                          }</div>
                        </div>
                        <div class="event-title-attendees">
                            <div class="event-tag">${
                              priorityListMap[props.priority] || ""
                            }</div>    
                            <div class="event-tag">${
                              statusListMap[props.status] || ""
                            }</div>    
                            <div class="event-owner">${
                              props.ownerName || ""
                            }</div>    
                        </div>
                    </div>
                  <div class="event-description">${
                    props.description || props.bodyPreview || ""
                  }</div>
                </div>
              </div>
              <div class="event-meta">
                <div class="event-date-time">
                  <span class="event-date">
                    <i class="bx bx-calendar"></i> ${formatDate(event.start)}
                  </span>
                  <span class="event-time">${formatTimeRange()}</span>
                </div>
                <div class="event-project">${props.projectName || ""}</div>
              </div>
              <div class="event-tags">
                ${tagsHtml}
              </div>
            </div>
          `,
        };
      },
    },
  },
  height: document.documentElement.clientHeight - 136,
  datesSet: handleDatesSet,
  noEventsText: "暂无数据",
  moreLinkText: "更多",
  dayCellClassNames: (arg) => {
    // 判断是否是当前选中的日期
    if (dayjs(arg.date).isSame(dateValue.value, "day")) {
      return "fc-day-highlight";
    }
    return "";
  },
});

const handleProjectSortBy = () => {
  fetchProjectList();
  //   projectItems.value.forEach((item) => (item.checked = false));
  fetchTodoTaskByPrjId();
};

const customCellClass = (arg) => {
  //判断是否有事件
  let hasEvent;
  if (!eventSources.value?.length) {
    return "custom-cell";
  }
  let eventType = eventSources.value[0].extendedProps.type;
  eventSources.value.forEach((event) => {
    const cellDate = dayjs(arg).format("YYYY-MM-DD");
    const dateStr = dayjs(event.start || event.startTime).format("YYYY-MM-DD");
    if (dateStr == cellDate) {
      hasEvent = true;
    }
  });

  return hasEvent
    ? `${
        eventType === "task" ? "hasevent-date" : "hasoutlook-date"
      } custom-cell`
    : "custom-cell";
};

// Outlook 日历数据
const outlookCalendars = ref([]);

// 我的任务数据
const myTasks = ref([{ id: 1, label: "我的任务", count: 0, checked: false }]);

// 项目事项数据
const projectItems = ref();

// 处理复选框变化 - 实现互斥逻辑
const handleCheckboxChange = (section, changedItem) => {
  if (section === "projects") {
    // 如果是项目事项部分，获取对应事项列表
    fetchTodoTaskByPrjId();
  } else if (section === "tasks") {
    // 如果是我的任务部分，获取对应事项列表
    if (changedItem.checked) {
      fetchMyTasksAsOwner();
    } else {
      eventSources.value = [];
      const calendarApi = fullCalendar.value.getApi();
      calendarApi.setOption("events", []);
    }
  } else if (section === "outlook") {
    // outlook为单选
    if (changedItem.checked) {
      outlookCalendars.value.forEach((item) => {
        if (item.id !== changedItem.id) {
          item.checked = false;
        }
      });
    }
    // 如果是Outlook日历部分，获取对应日历事件
    fetchCalendarEvents();
  }
  if (changedItem.checked) {
    // 取消其他两个部分的所有选中
    if (section !== "outlook") {
      outlookCalendars.value.forEach((item) => (item.checked = false));
    }
    if (section !== "tasks") {
      myTasks.value.forEach((item) => (item.checked = false));
    }
    if (section !== "projects") {
      projectItems.value.forEach((item) => (item.checked = false));
    }
  }
};

//获取日历列表及数量
// const fetchCalendarList = (type) => {
//   //将startDate和endDate转换为UTC时间
//   const params = {
//     startTime: dayjs(startDate.value).utc().format(),
//     endTime: dayjs(endDate.value).utc().format(),
//   };
//   queryCalendars(params).then((response) => {
//     const calendars = response.data || [];
//     if (!response.data.length) {
//       return (outlookCalendars.value = []);
//     }
//     if (type === "init" && calendars.length > 0) {
//       outlookCalendars.value = calendars.map((calendar, index) => ({
//         id: calendar.calendarId,
//         label: calendar.displayName,
//         count: calendar.eventCount || 0,
//         checked: index === 0,
//       }));
//     } else {
//       // 保留之前的选中状态，变更数量
//       outlookCalendars.value = calendars.map((calendar) => {
//         const existing = outlookCalendars.value.find(
//           (item) => item.id === calendar.calendarId,
//         );
//         return {
//           id: calendar.calendarId,
//           label: calendar.displayName,
//           count: calendar.eventCount || 0,
//           checked: existing ? existing.checked : false,
//         };
//       });
//     }
//     fetchCalendarEvents();
//   });
// };

const fetchCalendarEvents = () => {
  if (
    !outlookCalendars.value.length ||
    !outlookCalendars.value.some((item) => item.checked)
  ) {
    return;
  }
  const params = {
    startTime: dayjs(startDate.value).utc().format(),
    endTime: dayjs(endDate.value).utc().format(),
    calendarId: outlookCalendars.value
      .filter((item) => item.checked)
      .map((item) => item.id)[0],
  };
  queryCalendarEvents(params).then((response) => {
    const events = response.data || [];
    eventSources.value = events.map((item) => {
      return {
        id: item.id,
        title: item.subject,
        className: "bg-outlook text-outlook",
        start: dayjs.utc(item.startTime).local().format("YYYY-MM-DD HH:mm"),
        end: dayjs.utc(item.endTime).local().format("YYYY-MM-DD HH:mm"),
        extendedProps: {
          ...item,
          type: "outlook",
        },
      };
    });
    const calendarApi = fullCalendar.value.getApi();
    calendarApi.setOption("events", eventSources.value);
  });
};

//获取项目列表及数量
const fetchProjectList = (type) => {
  const params = {
    startDateStart: startDate.value,
    startDateEnd: endDate.value,
    dateFlag: projectSortBy.value === "startDate" ? 1 : 2,
  };

  queryProjectList(params).then((response) => {
    const projects = response.data || [];
    if (type === "init" && projects.length > 0) {
      projectItems.value = projects.map((project) => ({
        id: project.objId,
        label: project.name,
        count: project.childCount || 0,
        checked: false,
      }));
      return;
    } else {
      projectItems.value = projects.map((project) => {
        const existing = projectItems.value.find(
          (item) => item.id === project.objId,
        );
        return {
          id: project.objId,
          label: project.name,
          count: project.childCount || 0,
          checked: existing ? existing.checked : false,
        };
      });
    }
  });
};

//获取事项列表
const fetchTodoTaskByPrjId = () => {
  const params = {
    startDateStart: startDate.value,
    startDateEnd: endDate.value,
    projectIdList: projectItems.value
      .filter((item) => item.checked)
      .map((item) => item.id),
  };
  queryTodoTaskByPrjId(params).then((response) => {
    let tasks = response.data || [];
    if (projectSortBy.value === "endDate") {
      //过滤掉没有截止日期的事项
      tasks = tasks.filter((item) => item.dueDate);
    }
    const events = tasks.map((item) => {
      return {
        id: item.objId,
        title: item.name,
        className: "bg-task text-task",
        start: dayjs(
          projectSortBy.value === "startDate" ? item.startDate : item.dueDate,
        ).format("YYYY-MM-DD"),
        extendedProps: {
          ...item,
          type: "task",
        },
      };
    });
    eventSources.value = events;
    const calendarApi = fullCalendar.value.getApi();
    calendarApi.setOption("events", events);
  });
};
const fetchMyTasksAsOwner = () => {
  const params = {
    startDateStart: startDate.value,
    startDateEnd: endDate.value,
  };
  queryMyTasksAsOwner(params).then((response) => {
    const tasks = response.data || [];
    myTasks.value[0].count = tasks.length || 0;
    const events = tasks.map((item) => {
      return {
        id: item.objId,
        title: item.name,
        className: "bg-task text-task",
        start: dayjs(item.startDate).format("YYYY-MM-DD"),
        extendedProps: {
          ...item,
          type: "task",
        },
      };
    });
    eventSources.value = events;
    const calendarApi = fullCalendar.value.getApi();
    calendarApi.setOption("events", events);
  });
};

//获取任务数量
const fetchMyTasksCount = () => {
  const params = {
    startDateStart: startDate.value,
    startDateEnd: endDate.value,
  };
  queryMyTasksAsOwner(params).then((response) => {
    const tasks = response.data || [];
    myTasks.value[0].count = tasks.length || 0;
  });
};
watch([startDate, endDate], () => {
  if (projectItems.value.some((item) => item.checked)) {
    fetchTodoTaskByPrjId();
  } else if (myTasks.value.some((item) => item.checked)) {
    fetchMyTasksAsOwner();
  }
  fetchProjectList();
  fetchMyTasksCount();
  // fetchCalendarList();
});

watch(
  eventSources,
  () => {
    if (currentView.value === "listMonth" && fullCalendar.value) {
      const calendarApi = fullCalendar.value.getApi();
      const viewEl = calendarApi.el.querySelector(".fc-view");
      if (viewEl) updateListHeader(viewEl, true);
    }
  },
  { deep: true },
);

watch(dateValue, (newValue, oldValue) => {
  if (newValue?.getTime() === oldValue?.getTime()) return;
  const calendarApi = fullCalendar.value.getApi();
  if (calendarApi.currentData.currentViewType === "listDay") {
    calendarApi.gotoDate(newValue);
  }
});
onMounted(() => {
  fetchProjectList("init");
  fetchMyTasksCount();
  // fetchCalendarList("init");
  if (fullCalendar.value) {
    fullCalendar.value.getApi().updateSize();
    if (isSmallScreen.value) {
      fullCalendar.value.getApi().setOption("headerToolbar", {
        right: "",
        center: "title",
        left: "more dayGridMonth,dayGridWeek,listDay,listMonth today prev,next",
      });
    }
  }
  initResizeObserver();
});
// 在 onUnmounted 钩子中清理观察器
onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
});
</script>

<style scoped lang="scss">
.select-content {
  margin-top: 16px;
  padding: 0 12px;
}

:deep(.list-view-title-bar) {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  padding: 12px 16px !important;
  background: #f8faff !important;
  border: 1px solid #edf2f7 !important;
  border-bottom: none !important;

  .title-left {
    font-size: 16px !important;
    font-weight: 700 !important;
    color: #1a202c !important;
  }

  .count-badge {
    background-color: #ebf4ff !important;
    color: #3182ce !important;
    padding: 4px 12px !important;
    border-radius: 6px !important;
    font-size: 12px !important;
    font-weight: 500 !important;
  }
}

:deep(.fc-listMonth-view .fc-scroller.fc-scroller-liquid) {
  max-height: calc(100% - 50px) !important;
}

// .section-wrapper {
//   margin-bottom: 8px;
// }

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 14px;
  color: #303133;

  .title-icon {
    margin-right: 6px;
    font-size: 16px;
  }

  .section-title {
    flex: 1;
  }

  .sort-text {
    font-size: 12px;
    color: #909399;
    font-weight: normal;
    display: flex;
    align-items: center;
    cursor: pointer;

    .sort-icon {
      margin-left: 2px;
      font-size: 12px;
    }
  }

  .sort-select {
    width: 110px;

    :deep(.el-input__wrapper) {
      font-size: 12px;
      box-shadow: none;
      border: none;
    }

    :deep(.el-input__inner) {
      color: #909399;
      font-size: 12px;
    }
  }
}

.section-items {
  padding: 0 8px 0 4px;
  max-height: 200px;
  overflow-y: scroll;
}

.item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;

  :deep(.el-checkbox) {
    flex: 1;
    height: auto;

    .el-checkbox__label {
      font-size: 14px;
      color: #606266;
    }
  }

  .item-count {
    font-size: 14px;
    font-weight: 500;
    min-width: 26px;
    text-align: center;
    padding: 2px 8px;
    background-color: #f2f5f9;
    border-radius: 4px;
  }
}

.el-divider {
  margin: 8px 0;
}

// Custom List Event Styles
:deep(.custom-list-event) {
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  .event-header {
    margin-bottom: 12px;
  }

  .event-main-info {
    .event-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .event-title-text {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 6px;
      line-height: 1.5;
    }
    .event-title-attendees {
      display: flex;
      color: #909399;
      gap: 6px;
      align-items: center;
    }

    .event-description {
      font-size: 14px;
      color: #606266;
      line-height: 1.6;
      margin-bottom: 8px;
      display: flex;
      max-height: 150px;
      overflow-y: hidden;
      p {
        margin-bottom: 0 !important;
      }
    }
  }

  .event-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .event-date-time {
      display: flex;
      align-items: center;
      gap: 12px;

      .event-date {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 14px;
        color: #606266;

        i {
          font-size: 16px;
        }
      }

      .event-time {
        font-size: 14px;
        color: #909399;
      }
    }

    .event-project {
      font-size: 14px;
      color: #409eff;
      font-weight: 500;
    }
  }

  .event-tags {
    display: flex;
    gap: 8px;
  }
}
.event-tag {
  display: inline-block;
  padding: 2px 12px;
  background-color: #f5f7fa;
  color: #606266;
  font-size: 12px;
  border-radius: 6px;
  //   line-height: 16px;
  border: 1px solid #e2e8f0;
}
.custom-calendar {
  :deep(.fc-list-event-time) {
    display: none !important;
  }
  :deep(.fc-list-event-title) {
    border: none;
    padding: 8px 14px !important;
  }
  :deep(.fc-list-event) {
    background-color: #fff !important;
  }
  :deep(.fc-list-day) {
    margin-bottom: 16px;
  }
}
.task-modal-header {
  display: flex;
  flex-direction: column;
  .header-project {
    justify-content: space-between;
    .project-badge {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #009966;
      i {
        color: #fff;
      }
    }
    .project-name {
      color: #009966;
      font-weight: 600;
    }
  }
  .task-name {
    font-size: 20px;
    font-weight: bold;
  }
}
.close-icon {
  cursor: pointer;
}
.task-detail {
  font-family: "PingFang SC", sans-serif;
  background: #fff;
  padding: 16px 16px 8px 16px;
  /* 单行信息 */
  .info-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    margin-bottom: 10px;
    border: 1px solid #e5e8f0;
    border-radius: 10px;
    background-color: #f1f5f94d;
  }
  .info-item-member {
    padding: 12px 16px;
    margin-bottom: 10px;
    border: 1px solid #e5e8f0;
    border-radius: 10px;
    background-color: #f1f5f94d;
  }
  .member-list {
    display: flex;
    gap: 10px;
  }

  .info-item.align-top {
    align-items: flex-start;
  }

  .left {
    display: flex;
    align-items: center;
    min-width: 120px;
  }

  .icon {
    font-size: 16px;
    margin-right: 8px;
  }

  .label {
    font-size: 14px;
    font-weight: 600;
    color: #333;
  }

  .value {
    font-size: 14px;
    color: #5a6b8c;
  }

  /* 参与人员 */
  .tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .tag {
    padding: 4px 10px;
    background: #f5f7fb;
    border-radius: 6px;
    font-size: 13px;
    color: #333;
  }

  /* 描述 */
  .desc {
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid #eef0f5;
  }

  .desc-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 6px;
  }

  .desc-content {
    font-size: 14px;
    color: #5a6b8c;
    line-height: 1.6;
  }
}
:deep(.custom-cell) {
  .el-date-table-cell__text {
    width: 28px !important;
    height: 28px !important;
    border-radius: 4px !important;
  }
}

// FullCalendar 选中日期的浅蓝色高亮样式
:deep(.fc-day-highlight) {
  background-color: rgba(64, 158, 255, 0.15) !important;

  &:hover {
    background-color: rgba(64, 158, 255, 0.25) !important;
  }
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  .calendar-icon {
    background-color: #2b7fff;
    border-radius: 4px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }
  .calendar-title {
    .name {
      color: #1c398e;
      font-size: 20px;
      font-weight: bold;
    }
    .desc {
      color: #62748e;
      font-size: 12px;
    }
  }
}
.calendarForm {
  max-height: calc(80vh - 88px);
  overflow-y: auto;
  padding: 16px 16px 0 16px;
  .el-form-item {
    display: block;
    :deep(.el-form-item__label) {
      margin-bottom: 0 !important;
    }
  }
}
.calendar-detail-header {
  flex-direction: column;
  display: flex;
  .detail-left {
    display: flex;
    gap: 10px;
    justify-content: space-between;
    .calendar-icon {
      background-color: #2b7fff;
      border-radius: 4px;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }
    .calendar-name {
      font-size: 14px;
      color: #155dfc;
      font-weight: 600;
    }
  }
  .detail-right {
    display: flex;
  }
  .calendar-title {
    color: #1c398e;
    font-size: 20px;
    font-weight: bold;
  }
}
.meeting-info {
  padding: 16px 16px 8px 16px;
  .meeting-info-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    margin-bottom: 10px;
    border-radius: 10px;
    background: #f5f9ff;
    border: 1px solid #bcd4ff;
  }
  .meeting-info-item-wrap {
    padding: 12px 16px;
    margin-bottom: 10px;
    border-radius: 10px;
    background: #f5f9ff;
    border: 1px solid #bcd4ff;
  }

  .meeting-info-description {
    font-size: 14px;
    color: #62748e;
    line-height: 1.6;
    min-height: 30px;
    overflow-x: hidden;
  }

  .meeting-info-item.align-top {
    align-items: flex-start;
  }

  /* 左侧 */
  .meeting-info-left {
    display: flex;
    align-items: center;
    min-width: 100px;
  }

  .meeting-info-icon {
    font-size: 16px;
    margin-right: 8px;
    color: #1447e6;
  }

  .meeting-info-label {
    font-size: 12px;
    font-weight: 600;
    color: #1c398e;
  }

  .meeting-info-value {
    font-size: 14px;
    color: #1447e6;
    text-align: left;
  }
}
.metting-attendees-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  .metting-attendees-tag {
    padding: 2px 8px;
    background: #e6f4ff;
    border-radius: 6px;
    font-size: 12px;
    color: #1447e6;
    border: 1px solid #bedbff;
  }
}
:deep(.customer-pick-panel) {
  .el-date-picker__header-label {
    //取消点击事件
    pointer-events: none;
  }
}

:deep(.sidebar-drawer) {
  .el-drawer__body {
    padding: 16px;
    .left-date-select {
      width: 100% !important;
    }
  }
}
</style>

<style>
.bg-task {
  background-color: #ecfdf5;
  border: 1px solid #a4f4cf !important;
  border-radius: 8px !important;
  &:hover {
    background-color: #d0fae5 !important;
  }
}
.text-task {
  color: #007a55 !important;
}
.bg-outlook {
  background-color: #f0f5ff;
  border: 1px solid #adc8ff !important;
  border-radius: 8px !important;
  &:hover {
    background-color: #dbeafe !important;
  }
}

.text-outlook {
  color: #1752ff !important;
}
.hasevent-date::after {
  content: "";
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  background-color: #00bc7d;
  border-radius: 50%;
}
.hasoutlook-date::after {
  content: "";
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  background-color: #1752ff;
  border-radius: 50%;
}
.modal-form {
  padding: 0;
}
.event-tag {
  display: inline-block;
  padding: 2px 12px;
  background-color: #f5f7fa;
  color: #606266;
  font-size: 12px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  height: 24px;
}
.fc .fc-daygrid-day-number {
  width: 100% !important;
}
.custom-day-cell {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 6px 0 6px;
  width: 100%;
}

.date-left {
  font-weight: normal;
  white-space: nowrap;
  color: #303133;
  display: flex;
  align-items: center;
  justify-content: center;
}

.date-left.is-today {
  background-color: #000;
  color: #fff !important;
  border-radius: 50%;
  width: 18px;
  height: 18px;
}

.event-count-right {
  margin-left: auto;
  font-size: 11px;
  color: #475569;
  background-color: #f1f5f9;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  padding: 0 4px;
  transform: translateY(-2px);
}
</style>
