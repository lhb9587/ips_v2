<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import Layout from "@/layouts/main";

const router = useRouter();
const store = useStore();

const hero = {
  title: "假勤管理",
  description:
    "作为人力资源菜单下的统一导航页，集中展示假期、考勤和排班相关入口，帮助业务人员快速进入对应模块。",
};

const entryButtonText = "进入功能";
const moduleGroups = [
  {
    key: "leave",
    title: "假期管理",
    icon: "bx bx-briefcase-alt",
    description: "覆盖额度维护、请假申请与审批相关入口。",
    entries: [
      {
        title: "假期额度维护",
        description: "员工假期额度计算和日常维护，如：编辑实际额度、延期日期等",
        route: "/hrm/leave-quota-management",
      },
      {
        title: "请假单",
        description: "对员工病假、事假、年假等假期数据记录与监控",
        route: "/hrm/leave-management",
      },
    ],
  },
  {
    key: "daily",
    title: "日常考勤",
    icon: "bx bx-calendar-check",
    description: "覆盖档案、单据、记录与考勤计算入口。",
    entries: [
      {
        title: "考勤档案",
        description: "员工考勤档案维护，维护员工对应的考勤编号",
        route: "/hrm/attendance-profile",
      },
      {
        title: "出差单",
        description: "员工出差单的维护",
        route: "/businesstrip-management",
      },
      {
        title: "加班单",
        description: "员工加班的维护",
        route: "/hrm/overtime-management",
      },
      {
        title: "补签卡",
        description:
          "对由于忘记刷卡或外出公干等原因造成的未刷卡进行补卡，审核通过后会自动在员工打卡数据中增加记录",
        route: "/hrm/supplement-management",
      },
      {
        title: "出勤记录",
        description: "员工考勤综合查询，打卡、请假和出差等",
        route: "/workbench/hrm/attendance_record",
      },
      {
        title: "考勤计算",
        description: "专员考勤看板，可以查看考勤明细以及汇总",
        route: "/workbench/hrm/attendance_calculation",
      },
    ],
  },
  {
    key: "schedule",
    title: "排班管理",
    icon: "bx bx-grid-alt",
    description: "覆盖排班列表、向导配置与考勤组入口。",
    entries: [
      {
        title: "排班列表",
        description: "员工排班列表查询，支持自定义排班",
        route: "/hrm/schedule-list",
      },
      {
        title: "考勤组",
        description:
          "按照相同班次、相同考勤制度、管理范围等维度将员工进行分类，便于排班、快捷过滤等操作",
        route: "/hrm/attendance-group",
      },
    ],
  },
];

const goToEntry = (route) => {
  router.push(route);
};

onMounted(() => {
  store.dispatch("attendanceScope/getScope").catch(() => {});
});
</script>

<template>
  <Layout>
    <div class="attendance-management-page">
      <section class="attendance-hero">
        <div class="attendance-hero__content">
          <h1 class="attendance-hero__title">{{ hero.title }}</h1>
          <p class="attendance-hero__desc">{{ hero.description }}</p>
        </div>
      </section>

      <section
        v-for="group in moduleGroups"
        :key="group.key"
        class="attendance-section"
      >
        <header class="attendance-section__header">
          <div class="attendance-section__title-wrap">
            <span class="attendance-section__icon">
              <i :class="group.icon"></i>
            </span>
            <div>
              <h2 class="attendance-section__title">{{ group.title }}</h2>
              <p class="attendance-section__desc">{{ group.description }}</p>
            </div>
          </div>
        </header>

        <div class="attendance-card-grid">
          <article
            v-for="entry in group.entries"
            :key="entry.title"
            class="attendance-entry-card"
            role="button"
            tabindex="0"
            @click="goToEntry(entry.route)"
            @keydown.enter.prevent="goToEntry(entry.route)"
            @keydown.space.prevent="goToEntry(entry.route)"
          >
            <div class="attendance-entry-card__head">
              <h3 class="attendance-entry-card__title">{{ entry.title }}</h3>
            </div>
            <p class="attendance-entry-card__desc">{{ entry.description }}</p>
            <button
              type="button"
              class="attendance-entry-card__action"
              @click.stop="goToEntry(entry.route)"
            >
              {{ entryButtonText }}
              <i class="bx bx-chevron-right"></i>
            </button>
          </article>
        </div>
      </section>
    </div>
  </Layout>
</template>

<style scoped lang="scss">
:deep(.page-content) {
  padding-top: calc(50px + 24px) !important;
  padding-right: 16px !important;
  padding-bottom: 20px !important;
  padding-left: 16px !important;
  background: #f5f7fb;
}

.attendance-management-page {
  display: grid;
  gap: 16px;
}

.attendance-hero {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding: 28px 28px 24px;
  border-radius: 20px;
  background: linear-gradient(135deg, #243e69 0%, #4f7fc1 100%);
  color: #fff;
  box-shadow: 0 18px 36px rgba(48, 77, 122, 0.16);
}

.attendance-hero__content {
  max-width: 760px;
}

.attendance-hero__title {
  margin: 0 0 12px;
  font-size: 26px;
  line-height: 1.2;
  font-weight: 700;
  color: #fff;
}

.attendance-hero__desc {
  margin: 0;
  max-width: 720px;
  font-size: 15px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.92);
}

.attendance-section {
  border: 1px solid #dce6f2;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(72, 101, 146, 0.08);
}

.attendance-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  border-bottom: 1px solid #e5edf7;
}

.attendance-section__title-wrap {
  display: flex;
  align-items: center;
  gap: 14px;
}

.attendance-section__icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #e8f0ff;
  color: #4c78f0;
  font-size: 22px;
}

.attendance-section__title {
  margin: 0;
  color: #1e2a44;
  font-size: 20px;
  line-height: 1.3;
  font-weight: 700;
}

.attendance-section__desc {
  margin: 6px 0 0;
  color: #6d7b92;
  font-size: 14px;
  line-height: 1.6;
}

.attendance-card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  padding: 20px;
}

.attendance-entry-card {
  display: flex;
  flex-direction: column;
  min-height: 144px;
  padding: 18px 18px 16px;
  border: 1px solid #d8e4f3;
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  cursor: pointer;
}

.attendance-entry-card:hover {
  transform: translateY(-2px);
  border-color: #c5d7f0;
  box-shadow: 0 14px 24px rgba(73, 104, 150, 0.08);
}

.attendance-entry-card:focus-visible {
  outline: 2px solid #3d6fe8;
  outline-offset: 2px;
}

.attendance-entry-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.attendance-entry-card__title {
  margin: 0;
  color: #1f2d49;
  font-size: 18px;
  line-height: 1.4;
  font-weight: 700;
}

.attendance-entry-card__desc {
  margin: 10px 0 0;
  color: #687792;
  font-size: 14px;
  line-height: 1.65;
}

.attendance-entry-card__action {
  margin-top: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #3d6fe8;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.attendance-entry-card__action i {
  font-size: 18px;
}

@media (max-width: 1440px) {
  .attendance-card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 992px) {
  .attendance-hero {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  :deep(.page-content) {
    padding-top: calc(50px + 24px) !important;
    padding-right: 12px !important;
    padding-bottom: 16px !important;
    padding-left: 12px !important;
  }

  .attendance-hero {
    padding: 22px 18px 18px;
    border-radius: 16px;
  }

  .attendance-hero__title {
    font-size: 22px;
  }

  .attendance-hero__desc {
    font-size: 14px;
  }

  .attendance-section__header,
  .attendance-card-grid {
    padding: 16px;
  }

  .attendance-section__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .attendance-card-grid {
    grid-template-columns: 1fr;
  }

  .attendance-entry-card {
    min-height: 0;
  }
}
</style>
