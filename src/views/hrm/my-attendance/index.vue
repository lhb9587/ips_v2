<script setup>
import { useRouter } from "vue-router";
import Layout from "@/layouts/main";

const router = useRouter();

const profileItems = [
  { label: "手机", value: "17554194174" },
  { label: "办公电话", value: "--" },
  { label: "邮箱", value: "--" },
];

const quickEntries = [
  { label: "我的个人档案", icon: "bx bx-user" },
  {
    label: "我要请假",
    icon: "bx bx-file",
    routeName: "my-leave-application",
  },
  { label: "我要加班", icon: "bx bx-briefcase-alt-2" },
  { label: "我要出差", icon: "bx bx-briefcase" },
  {
    label: "我要补卡",
    icon: "bx bx-id-card",
    routeName: "my-supplement-application",
  },
  { label: "我的工资条", icon: "bx bx-receipt" },
];

const careerItems = [
  { label: "当前职等", value: "--", tone: "blue" },
  { label: "当前职位", value: "Java后端开发工程师", tone: "sky" },
  { label: "合同类型", value: "劳动合同", tone: "pink" },
];

const salaryChanges = [
  { label: "累计住房公积金", value: "↑ 100%" },
  { label: "累计基本减除费用", value: "↑ 100%" },
  { label: "累计已预扣预缴", value: "↑ 100%" },
];

const handleQuickEntry = (item) => {
  if (item.routeName) {
    router.push({ name: item.routeName });
  }
};
</script>

<template>
  <Layout>
    <div class="attendance-page">
      <div class="attendance-shell">
        <aside class="attendance-sidebar">
          <section class="attendance-card profile-card">
            <div class="profile-card__top">
              <div class="profile-avatar">
                <svg viewBox="0 0 96 96" aria-hidden="true">
                  <circle cx="48" cy="48" r="40" fill="#5d86f6" />
                  <circle cx="48" cy="38" r="15" fill="#f7c89b" />
                  <path
                    d="M32 81c3-16 12-24 16-24s13 8 16 24"
                    fill="#32405e"
                  />
                  <path
                    d="M35 30c2-12 10-18 13-18 8 0 16 6 17 18-8 4-22 4-30 0Z"
                    fill="#36405a"
                  />
                  <path d="M43 60l5 8 5-8 6 21H37l6-21Z" fill="#fff" />
                  <path d="M48 68l3 13h-6l3-13Z" fill="#f06767" />
                </svg>
              </div>
              <h2 class="profile-name">张员工</h2>
              <p class="profile-role">曜斗科技 | Java后端开发工程师</p>
            </div>

            <div class="profile-info">
              <div
                v-for="item in profileItems"
                :key="item.label"
                class="profile-info__item"
              >
                <span class="profile-info__label">{{ item.label }}:</span>
                <span class="profile-info__value">{{ item.value }}</span>
              </div>
            </div>

            <div class="profile-completeness">
              <div class="profile-completeness__header">
                <span>信息完整度</span>
                <span>80%</span>
              </div>
              <div class="profile-completeness__bar">
                <span></span>
              </div>
            </div>

            <div class="profile-reporting">
              <div class="section-title">汇报关系</div>
              <div class="reporting-card">
                <div class="reporting-card__label">直接上级</div>
                <div class="reporting-person">
                  <span class="reporting-person__avatar">李</span>
                  <div>
                    <div class="reporting-person__name">李明</div>
                    <div class="reporting-person__role">合伙人</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="attendance-card shortcut-card">
            <div class="section-title">常用入口</div>
            <div class="shortcut-grid">
              <button
                v-for="item in quickEntries"
                :key="item.label"
                type="button"
                class="shortcut-item"
                :class="{ 'shortcut-item--active': item.routeName }"
                @click="handleQuickEntry(item)"
              >
                <span class="shortcut-item__icon">
                  <i :class="item.icon"></i>
                </span>
                <span class="shortcut-item__text">{{ item.label }}</span>
              </button>
            </div>
          </section>
        </aside>

        <section class="attendance-main">
          <div class="attendance-grid">
            <article class="attendance-card main-card pending-card">
              <div class="section-title">我的在办</div>
              <div class="pending-card__body">
                <div class="pending-card__count">
                  <span class="pending-card__number">7</span>
                  <span class="pending-card__trend">↑</span>
                </div>
                <button type="button" class="ghost-button">查看</button>
              </div>
            </article>

            <article class="attendance-card main-card yesterday-card">
              <div class="section-title">昨日出勤</div>
              <div class="yesterday-card__body">
                <div class="attendance-gauge">
                  <svg viewBox="0 0 240 140" aria-hidden="true">
                    <path
                      d="M40 118a80 80 0 0 1 160 0"
                      fill="none"
                      stroke="#edf1f7"
                      stroke-linecap="round"
                      stroke-width="12"
                    />
                    <path
                      d="M40 118a80 80 0 0 1 126-64"
                      fill="none"
                      stroke="#dd6178"
                      stroke-linecap="round"
                      stroke-width="12"
                    />
                  </svg>
                  <div class="attendance-gauge__text">
                    <span>旷工</span>
                    <strong>7.75</strong>
                    <span>小时</span>
                  </div>
                </div>
                <div class="attendance-date-card">
                  <div class="attendance-date-card__row">
                    <span>2026-03-31</span>
                    <button type="button" class="text-link-button">详情</button>
                  </div>
                  <div class="attendance-date-card__time">
                    <span>09:00</span>
                    <span>18:00</span>
                  </div>
                </div>
              </div>
            </article>

            <article class="attendance-card main-card status-card">
              <div class="section-title">当月出勤</div>
              <div class="status-card__body">
                <div class="status-item">
                  <span class="status-item__icon status-item__icon--blue">
                    <i class="bx bx-briefcase-alt-2"></i>
                  </span>
                  <div class="status-item__value">
                    <span>加班</span>
                    <strong>0</strong>
                    <span>小时</span>
                  </div>
                </div>
                <div class="status-item">
                  <span class="status-item__icon status-item__icon--red">
                    <i class="bx bx-error-circle"></i>
                  </span>
                  <div class="status-item__value">
                    <span>异常</span>
                    <strong>0</strong>
                    <span>次</span>
                  </div>
                </div>
              </div>
              <div class="card-link-row">
                <button type="button" class="text-link-button">详情</button>
              </div>
            </article>

            <article class="attendance-card main-card leave-card">
              <div class="section-title">我的年假</div>
              <div class="leave-card__body">
                <div class="leave-illustration">
                  <svg viewBox="0 0 220 140" aria-hidden="true">
                    <path
                      d="M36 112a74 74 0 0 1 148 0"
                      fill="#eef4ff"
                    />
                    <circle cx="78" cy="44" r="14" fill="#f9d8df" />
                    <circle cx="80" cy="44" r="6" fill="#d9687b" />
                    <rect
                      x="84"
                      y="52"
                      width="64"
                      height="12"
                      rx="6"
                      fill="#d8e6ff"
                    />
                    <path
                      d="M84 112V72c0-18 14-32 32-32s32 14 32 32v40"
                      fill="#7ea5ff"
                    />
                    <path
                      d="M120 88l16 12h-16V88Z"
                      fill="#5472e4"
                    />
                    <rect
                      x="142"
                      y="48"
                      width="22"
                      height="54"
                      rx="11"
                      fill="#8bd0b0"
                    />
                    <rect
                      x="148"
                      y="48"
                      width="12"
                      height="54"
                      rx="6"
                      fill="#5ab789"
                    />
                    <rect
                      x="160"
                      y="66"
                      width="4"
                      height="50"
                      rx="2"
                      fill="#d1a26e"
                    />
                  </svg>
                </div>
                <div class="leave-card__text">无剩余年假</div>
              </div>
            </article>

            <article class="attendance-card main-card career-card">
              <div class="section-title">我的历程</div>
              <div class="career-card__body">
                <div class="career-summary">
                  <span class="career-summary__label">已入职:</span>
                  <div class="career-badge-list">
                    <div class="career-badge">
                      <strong>2</strong>
                      <span>年</span>
                    </div>
                    <div class="career-badge">
                      <strong>8</strong>
                      <span>月</span>
                    </div>
                    <div class="career-badge career-badge--tail">
                      <strong>6</strong>
                      <span>天</span>
                    </div>
                  </div>
                </div>

                <div class="career-detail-list">
                  <div
                    v-for="item in careerItems"
                    :key="item.label"
                    class="career-detail-item"
                  >
                    <span
                      class="career-detail-item__dot"
                      :class="`career-detail-item__dot--${item.tone}`"
                    ></span>
                    <span class="career-detail-item__label">{{ item.label }}:</span>
                    <span class="career-detail-item__value">{{ item.value }}</span>
                  </div>
                </div>
              </div>
            </article>

            <article class="attendance-card main-card salary-card">
              <div class="section-title">薪资变化</div>
              <div class="salary-card__body">
                <div class="salary-card__meta">最近薪资发放月:</div>
                <div class="salary-card__month">2026年2月</div>
                <div class="salary-card__meta">对比上月薪资变化前三项:</div>
                <div class="salary-card__compare">
                  <div
                    v-for="item in salaryChanges"
                    :key="item.label"
                    class="salary-card__compare-item"
                  >
                    <div class="salary-card__compare-label">{{ item.label }}</div>
                    <div class="salary-card__compare-value">{{ item.value }}</div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  </Layout>
</template>

<style lang="scss" scoped>
:deep(.page-content) {
  padding-top: calc(50px + 24px) !important;
  padding-right: 16px !important;
  padding-bottom: 16px !important;
  padding-left: 16px !important;
  background: #f5f7fb;
}

.attendance-page {
  min-height: calc(100vh - 120px);
}

.attendance-shell {
  display: grid;
  grid-template-columns: 270px minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.attendance-sidebar,
.attendance-main {
  min-width: 0;
}

.attendance-sidebar {
  display: grid;
  gap: 16px;
}

.attendance-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  grid-auto-rows: minmax(192px, auto);
}

.attendance-card {
  background: #fff;
  border: 1px solid #dce6f2;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(72, 101, 146, 0.08);
}

.main-card {
  display: flex;
  flex-direction: column;
  padding: 14px 18px 16px;
  min-height: 192px;
  height: 100%;
}

.profile-card,
.shortcut-card {
  padding: 18px 24px 20px;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10px;
  margin-bottom: 12px;
  border-bottom: 1px solid #dfe8f3;
  color: #22304f;
  font-size: 18px;
  font-weight: 500;
}

.profile-card__top {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 18px;
  border-bottom: 1px solid #dfe8f3;
}

.profile-avatar {
  width: 92px;
  height: 92px;
  margin-bottom: 12px;
}

.profile-avatar svg {
  width: 100%;
  height: 100%;
  display: block;
}

.profile-name {
  margin: 0;
  color: #1d2a44;
  font-size: 24px;
  font-weight: 600;
}

.profile-role {
  margin: 8px 0 0;
  color: #60708f;
  font-size: 14px;
  text-align: center;
  line-height: 1.6;
}

.profile-info {
  padding: 18px 0 8px;
}

.profile-info__item {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-bottom: 10px;
  color: #3d4d6d;
  font-size: 14px;
}

.profile-info__label {
  font-weight: 600;
}

.profile-completeness {
  padding-bottom: 18px;
}

.profile-completeness__header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  color: #3d4d6d;
  font-size: 14px;
}

.profile-completeness__bar {
  height: 10px;
  background: #ecf1f8;
  border-radius: 999px;
  overflow: hidden;
}

.profile-completeness__bar span {
  display: block;
  width: 80%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #6fa4ff 0%, #4f7bf2 100%);
}

.section-title + .reporting-card,
.shortcut-grid {
  margin-top: -2px;
}

.reporting-card__label {
  margin-bottom: 12px;
  color: #3d4d6d;
  font-size: 14px;
  font-weight: 600;
}

.reporting-card {
  padding-top: 4px;
}

.reporting-person {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #dfe8f3;
  background: #fbfcfe;
}

.reporting-person__avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #5d86f6 0%, #7b9eff 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
}

.reporting-person__name {
  color: #22304f;
  font-size: 14px;
  font-weight: 600;
}

.reporting-person__role {
  color: #60708f;
  font-size: 13px;
}

.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px 12px;
}

.shortcut-item {
  border: 0;
  background: transparent;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: #314363;
  cursor: default;
}

.shortcut-item--active {
  cursor: pointer;
}

.shortcut-item--active:hover .shortcut-item__icon {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(71, 108, 214, 0.16);
}

.shortcut-item__icon {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.shortcut-item:nth-child(6n + 1) .shortcut-item__icon {
  background: #e2f7f9;
  color: #57a7bf;
}

.shortcut-item:nth-child(6n + 2) .shortcut-item__icon {
  background: #fde8f0;
  color: #df718e;
}

.shortcut-item:nth-child(6n + 3) .shortcut-item__icon {
  background: #e6ecff;
  color: #6b86f3;
}

.shortcut-item:nth-child(6n + 4) .shortcut-item__icon {
  background: #e8ecff;
  color: #7e95ff;
}

.shortcut-item:nth-child(6n + 5) .shortcut-item__icon {
  background: #e3f1ff;
  color: #5d93e8;
}

.shortcut-item:nth-child(6n + 6) .shortcut-item__icon {
  background: #fff1d5;
  color: #d79a2c;
}

.shortcut-item__text {
  font-size: 13px;
  line-height: 1.5;
  text-align: center;
}

.pending-card__body,
.leave-card__body,
.yesterday-card__body,
.career-card__body,
.salary-card__body {
  flex: 1;
  min-height: 0;
}

.pending-card__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.pending-card__count {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.pending-card__number {
  color: #495675;
  font-size: 64px;
  line-height: 1;
  font-weight: 300;
}

.pending-card__trend {
  color: #3c67e1;
  font-size: 22px;
  line-height: 1.2;
}

.ghost-button {
  min-width: 76px;
  height: 30px;
  border: 1px solid #7090f3;
  border-radius: 4px;
  background: #fff;
  color: #4a71ea;
  font-size: 14px;
}

.yesterday-card__body {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.attendance-gauge {
  position: relative;
  max-width: 220px;
  margin: 0 auto;
}

.attendance-gauge svg {
  width: 100%;
  display: block;
}

.attendance-gauge__text {
  position: absolute;
  inset: 30px 0 auto;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  color: #22304f;
  font-size: 14px;
}

.attendance-gauge__text strong {
  color: #1f3160;
  font-size: 22px;
  font-weight: 600;
}

.attendance-date-card {
  background: #f5f8fd;
  border-radius: 2px;
  overflow: hidden;
}

.attendance-date-card__row,
.attendance-date-card__time {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  color: #30415e;
  font-size: 14px;
}

.attendance-date-card__row {
  border-bottom: 1px solid #dde7f2;
}

.text-link-button {
  padding: 0;
  border: 0;
  background: transparent;
  color: #4d75ef;
  font-size: 14px;
  text-decoration: none;
  cursor: default;
}

.attendance-date-card__time {
  color: #70819f;
  font-size: 13px;
}

.status-card__body {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  min-height: 96px;
  align-items: center;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.status-item__icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.status-item__icon--blue {
  background: #e6ecff;
  color: #5d7ef1;
}

.status-item__icon--red {
  background: #fde7e5;
  color: #e17c72;
}

.status-item__value {
  display: flex;
  align-items: baseline;
  gap: 4px;
  color: #334364;
  font-size: 14px;
}

.status-item__value strong {
  color: #4b73ee;
  font-size: 30px;
  line-height: 1;
  font-weight: 400;
}

.card-link-row {
  display: flex;
  justify-content: flex-end;
  padding-top: 4px;
}

.leave-card__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.leave-illustration {
  width: min(190px, 100%);
}

.leave-illustration svg {
  width: 100%;
  display: block;
}

.leave-card__text {
  color: #22304f;
  font-size: 15px;
}

.career-card__body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.career-summary {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
}

.career-summary__label {
  color: #334364;
  font-size: 16px;
}

.career-badge-list {
  display: flex;
  gap: 10px;
}

.career-badge {
  position: relative;
  width: 48px;
  height: 58px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #7da1ff 0%, #5b7eed 100%);
  color: #fff;
  box-shadow: 0 12px 24px rgba(87, 118, 219, 0.16);
}

.career-badge strong {
  font-size: 22px;
  line-height: 1;
  font-weight: 500;
}

.career-badge span {
  margin-top: 6px;
  font-size: 13px;
}

.career-badge--tail::after {
  content: "";
  position: absolute;
  right: 6px;
  bottom: -7px;
  border-width: 7px 0 0 7px;
  border-style: solid;
  border-color: #7da1ff transparent transparent;
}

.career-detail-list {
  padding: 12px 14px;
  background: #f5f8fd;
  display: grid;
  gap: 12px;
}

.career-detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #314363;
  font-size: 14px;
}

.career-detail-item__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.career-detail-item__dot--blue {
  background: #5a7bed;
}

.career-detail-item__dot--sky {
  background: #80b7ff;
}

.career-detail-item__dot--pink {
  background: #f194a0;
}

.career-detail-item__label {
  color: #42506e;
}

.career-detail-item__value {
  color: #22304f;
}

.salary-card__body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.salary-card__meta {
  color: #334364;
  font-size: 14px;
}

.salary-card__month {
  margin-top: 2px;
  text-align: center;
  color: #22304f;
  font-size: 34px;
  font-weight: 400;
}

.salary-card__compare {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  padding: 12px 10px;
  background: #f5f8fd;
}

.salary-card__compare-item {
  text-align: center;
}

.salary-card__compare-label {
  color: #54637f;
  font-size: 13px;
  line-height: 1.6;
}

.salary-card__compare-value {
  margin-top: 6px;
  color: #53a86c;
  font-size: 20px;
  line-height: 1;
}

@media (max-width: 1400px) {
  .attendance-shell {
    grid-template-columns: 250px minmax(0, 1fr);
  }

  .main-card {
    padding: 14px 16px;
    min-height: 184px;
  }

  .salary-card__month {
    font-size: 30px;
  }
}

@media (max-width: 1200px) {
  .attendance-shell {
    grid-template-columns: 1fr;
  }

  .attendance-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  :deep(.page-content) {
    padding-top: calc(50px + 24px) !important;
    padding-right: 12px !important;
    padding-bottom: 12px !important;
    padding-left: 12px !important;
  }

  .profile-card,
  .shortcut-card,
  .main-card {
    padding: 16px;
  }

  .section-title {
    font-size: 16px;
  }

  .shortcut-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .status-card__body,
  .salary-card__compare {
    grid-template-columns: 1fr;
  }

  .career-summary {
    align-items: flex-start;
    flex-direction: column;
  }

  .career-badge-list {
    width: 100%;
    justify-content: space-between;
  }

  .career-badge {
    flex: 1;
    max-width: 78px;
  }

  .salary-card__month {
    font-size: 32px;
  }

  .pending-card__number {
    font-size: 60px;
  }
}
</style>
