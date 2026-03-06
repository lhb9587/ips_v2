<template>
  <Layout>
    <div class="performance-assessment-page">
      <!-- 无权限提示 -->
      <div v-if="tabs.length === 0" class="pa-no-permission">
        <el-empty description="您暂无权限访问绩效评估功能，请联系管理员">
          <template #image>
            <i class="bx bx-lock-alt" style="font-size: 80px; color: #c0c4cc;"></i>
          </template>
        </el-empty>
      </div>
      
      <template v-else>
        <nav class="pa-tabs">
          <div class="pa-tabs-left">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              type="button"
              class="pa-tab"
              :class="{ active: activeTab === tab.key }"
              @click="activeTab = tab.key"
            >
              {{ tab.label }}
            </button>
          </div>
          <div v-if="activeTab === 'partner'" class="pa-tabs-right">
            <div class="partner-table-search">
              <i class="bx bx-search" aria-hidden="true"></i>
              <input
                v-model="partnerSearchInput"
                class="partner-table-search-input"
                type="text"
                placeholder="搜索人员名称"
                @keydown.enter="applyPartnerSearch"
              />
              <button
                v-if="partnerSearchInput"
                type="button"
                class="partner-table-search-clear"
                @click="clearPartnerSearch"
                aria-label="Clear"
              >
                x
              </button>
            </div>
          </div>
        </nav>

      <section v-if="activeTab === 'personal'" class="pa-section">
        <div class="pa-toolbar">
          <div class="pa-year-switch">
            <button
              v-for="year in yearOptions"
              :key="year"
              type="button"
              class="pa-chip"
              :class="{ active: activeYear === year }"
              @click="activeYear = year"
            >
              {{ year }} 年
            </button>
          </div>
        </div>
        <div v-if="personalLoading" class="personal-loading">
          <div class="partner-drawer-loading-card">
            <div class="partner-drawer-loading-spinner"></div>
            <div class="partner-drawer-loading-title">正在加载个人绩效</div>
            <div class="partner-drawer-loading-subtitle">请稍候...</div>
          </div>
        </div>
        <PersonalPerformancePanel
          v-else-if="personalPerformance"
          :performance="personalPerformance"
          :year="activeYear"
          :editable="isEditingSoft"
          :has-edit-permission="canEditSoft"
          :summary-edit-permission="canEditSummary"
          :has-score-permission="canScore"
          :on-toggle-edit="showEditButton ? toggleEdit : null"
          :on-soft-metrics-change="refreshPersonalSoftMetricsByKey"
        />
      </section>

      <section v-if="activeTab === 'team'" class="pa-section">
        <div class="team-panel">
          <div class="team-filters">
            <div class="team-filter active">
              <span>年度</span>
              <CustomSelect
                v-model="teamFilters.year"
                :options="teamFiltersData?.years?.map((year) => `${year} 年`) || []"
              />
            </div>
            <div
              class="team-filter"
              :class="{ active: teamFilters.region !== '全部' }"
            >
              <span>地区</span>
              <CustomSelect
                v-model="teamFilters.region"
                :options="teamFiltersData?.regions || []"
                placeholder="全部"
              />
            </div>
            <div class="team-filter active">
              <span>部门</span>
              <CustomSelect
                v-model="teamFilters.department"
                :options="teamFiltersData?.departments || []"
              />
            </div>
            <div
              class="team-filter"
              :class="{ active: teamFilters.position !== '全部' }"
            >
              <span>职位</span>
              <CustomSelect
                v-model="teamFilters.position"
                :options="['全部', ...(teamFiltersData?.positions || [])]"
                placeholder="全部"
              />
            </div>
            <div
              class="team-filter"
              :class="{ active: teamFilters.field !== '全部' }"
            >
              <span>业务领域</span>
              <CustomSelect
                v-model="teamFilters.field"
                :options="['全部', ...(teamFiltersData?.fields || [])]"
                placeholder="全部"
              />
            </div>
          </div>
          <div class="team-grid">
            <div v-if="comparePeople.length === 0" class="team-empty">
              <el-empty description="暂无团队评估数据">
                <template #image>
                  <i class="bx bx-data" style="font-size: 80px; color: #c0c4cc;"></i>
                </template>
              </el-empty>
            </div>
            <div v-else class="team-compare">
              <div class="team-compare-head team-row">
                <div class="team-dim-col">
                  <div class="team-count">
                    共{{ comparePeople.length }}位成员
                  </div>
                </div>
                <div
                  class="team-people-cols"
                  :style="{ '--team-cols': Math.max(comparePeople.length, 1) }"
                >
                  <div
                    v-for="person in comparePeople"
                    :key="person.name"
                    class="team-person-card"
                  >
                    <div class="team-person-name">{{ person.name }}</div>
                    <div class="team-person-meta">
                      {{ person.department }} · {{ person.position }}
                    </div>
                    <div class="team-person-meta">
                      {{ person.region }} · {{ person.field }}
                    </div>
                    <div class="team-person-tags">
                      <button
                        type="button"
                        class="team-tag team-pin-btn"
                        :class="{ 'is-pinned': isPinned(person) }"
                        :aria-pressed="isPinned(person)"
                        @click="togglePin(person)"
                      >
                        {{ isPinned(person) ? '已钉住' : '钉住' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-for="group in teamCompareGroups"
                :key="group.title"
                class="team-group"
              >
                <div class="team-row team-group-row">
                  <div class="team-dim-col team-group-title">
                    {{ group.title }}
                  </div>
                  <div
                    class="team-people-cols"
                    :style="{ '--team-cols': Math.max(comparePeople.length, 1) }"
                  >
                    <div class="team-group-spacer"></div>
                  </div>
                </div>
                <div
                  v-for="item in group.items"
                  :key="item.label"
                  class="team-row"
                >
                  <div class="team-dim-col">{{ item.label }}</div>
                  <div
                    class="team-people-cols"
                    :style="{ '--team-cols': Math.max(comparePeople.length, 1) }"
                  >
                    <div
                      v-for="person in comparePeople"
                      :key="`${person.name}-${item.label}`"
                      class="team-cell"
                    >
                      {{ getTeamValue(person, group, item.key) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section v-if="activeTab === 'partner'" class="pa-section">
        <div class="pa-toolbar">
          <div class="pa-year-switch">
            <button
              v-for="year in yearOptions"
              :key="year"
              type="button"
              class="pa-chip"
              :class="{ active: partnerYear === year }"
              @click="setPartnerYear(year)"
            >
              {{ year }} 年
            </button>
          </div>
        </div>
        <div class="partner-overview" v-if="false">
          <div
            v-for="item in partnerOverviewData"
            :key="item.key"
            class="partner-overview-card"
            :class="`partner-overview-card--${item.key}`"
          >
            <div class="partner-overview-label">{{ item.label }}</div>
            <div class="partner-overview-row">
              <div class="partner-overview-value">{{ item.value }}</div>
              <div 
                class="partner-overview-note" 
                :class="`partner-overview-note--${item.key}`"
              >{{ item.note }}</div>
            </div>
          </div>
        </div>

        <div class="partner-scroll-wrap">
          <div class="partner-main">
            <div class="partner-cards-grid">
            <!-- 硬性指标雷达图 -->
            <div class="partner-radar-card">
              <div class="partner-radar-head">
                <div class="partner-radar-head-left">
                  <div class="partner-radar-title">硬性指标雷达图</div>
                  <div class="partner-radar-summary">{{ hardRadarSummary }}</div>
                </div>
                <div class="partner-radar-actions">
                  <button
                    type="button"
                    class="partner-filter-trigger"
                    @click="hardRadarFilterOpen = !hardRadarFilterOpen"
                  >
                    <svg class="partner-filter-icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M4 5h16M7 12h10M10 19h4"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                      />
                    </svg>
                  </button>
                </div>
                <div v-if="hardRadarFilterOpen" class="partner-filter-popover">
                  <div class="partner-filter">
                    <div class="partner-filter-label">部门筛选</div>
                    <select v-model="hardTempSelectedDepartment" class="partner-select">
                      <option v-if="radarDepartmentOptions.length === 0" value="" disabled>
                        加载中...
                      </option>
                      <option v-for="dept in radarDepartmentOptions" :key="dept" :value="dept">
                        {{ dept }}
                      </option>
                    </select>
                    <div class="partner-filter-row">
                      <div class="partner-filter-label">选择人员</div>
                      <label class="partner-filter-select-all">
                        <input
                          type="checkbox"
                          :disabled="hardTempPartnerOptions.length === 0"
                          :checked="isHardAllSelected"
                          @change="toggleHardSelectAll"
                        />
                        全选
                      </label>
                    </div>
                    <div class="partner-persons">
                      <button
                        v-for="partner in hardTempPartnerOptions"
                        :key="partner.userId"
                        type="button"
                        class="partner-person"
                        :class="{ active: hardTempSelectedPartners.includes(partner.userId) }"
                        @click="toggleHardTempPartner(partner.userId)"
                      >
                        {{ partner.fullname }}
                      </button>
                    </div>
                    <button
                      type="button"
                      class="partner-filter-confirm"
                      @click="applyHardRadarFilters"
                    >
                      确定
                    </button>
                  </div>
                </div>
              </div>
              <RadarChart
                v-if="hardRadarConfig.indicators.length > 0"
                :hideHeader="true"
                :indicators="hardRadarConfig.indicators"
                :series="hardFilteredRadarSeries"
              />
            </div>
            <!-- 软性指标雷达图 -->
            <div class="partner-radar-card">
              <div class="partner-radar-head">
                <div class="partner-radar-head-left">
                  <div class="partner-radar-title">软性指标雷达图</div>
                  <div class="partner-radar-summary">{{ softRadarSummary }}</div>
                </div>
                <div class="partner-radar-actions">
                  <button
                    type="button"
                    class="partner-filter-trigger"
                    @click="softRadarFilterOpen = !softRadarFilterOpen"
                  >
                    <svg class="partner-filter-icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M4 5h16M7 12h10M10 19h4"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                      />
                    </svg>
                  </button>
                </div>
                <div v-if="softRadarFilterOpen" class="partner-filter-popover">
                  <div class="partner-filter">
                    <div class="partner-filter-label">部门筛选</div>
                    <select v-model="softTempSelectedDepartment" class="partner-select">
                      <option v-if="radarDepartmentOptions.length === 0" value="" disabled>
                        加载中...
                      </option>
                      <option v-for="dept in radarDepartmentOptions" :key="dept" :value="dept">
                        {{ dept }}
                      </option>
                    </select>
                    <div class="partner-filter-row">
                      <div class="partner-filter-label">选择人员</div>
                      <label class="partner-filter-select-all">
                        <input
                          type="checkbox"
                          :disabled="softTempPartnerOptions.length === 0"
                          :checked="isSoftAllSelected"
                          @change="toggleSoftSelectAll"
                        />
                        全选
                      </label>
                    </div>
                    <div class="partner-persons">
                      <button
                        v-for="partner in softTempPartnerOptions"
                        :key="partner.userId"
                        type="button"
                        class="partner-person"
                        :class="{ active: softTempSelectedPartners.includes(partner.userId) }"
                        @click="toggleSoftTempPartner(partner.userId)"
                      >
                        {{ partner.fullname }}
                      </button>
                    </div>
                    <button
                      type="button"
                      class="partner-filter-confirm"
                      @click="applySoftRadarFilters"
                    >
                      确定
                    </button>
                  </div>
                </div>
              </div>
              <RadarChart
                v-if="softRadarConfig.indicators.length > 0"
                :hideHeader="true"
                :indicators="softRadarConfig.indicators"
                :series="softFilteredRadarSeries"
              />
            </div>
            <!-- 排行榜卡片 -->
            <div
              v-for="category in filteredRankingList"
              :key="category.category || category.key"
              class="ranking-card"
              :class="{ 'ranking-card-small': category.key === 'score' || category.key === 'duration' }"
            >
              <div class="ranking-card-title">
                <div class="ranking-card-title-left">
                  <span class="ranking-icon" :class="`ranking-icon-${category.category || category.key}`">
                    {{ category.icon }}
                  </span>
                  {{ category.title }}
                </div>
                <div
                  v-if="category.key === 'duration'"
                  class="ranking-card-actions"
                  @click.stop
                >
                  <button
                    type="button"
                    class="partner-filter-trigger"
                    @click="durationFilterOpen = !durationFilterOpen"
                  >
                    <svg class="partner-filter-icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M4 5h16M7 12h10M10 19h4"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                      />
                    </svg>
                  </button>
                  <div v-if="durationFilterOpen" class="partner-filter-popover">
                    <div class="partner-filter">
                      <div class="partner-filter-label">排序方式</div>
                      <div class="partner-persons">
                        <button
                          v-for="option in durationSortOptions"
                          :key="option.value"
                          type="button"
                          class="partner-person"
                          :class="{ active: durationRankingSort === option.value }"
                          @click="setDurationSort(option.value)"
                        >
                          {{ option.label }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  v-else-if="category.key === 'score'"
                  class="ranking-card-actions ranking-card-actions-placeholder"
                  aria-hidden="true"
                >
                  <span class="ranking-action-placeholder"></span>
                </div>
              </div>
              <div class="ranking-list-wrap">
                <ol class="ranking-list">
                <li
                  v-for="(item, index) in category.list"
                  :key="item.name"
                  class="ranking-item"
                >
                  <span class="ranking-index">{{ index + 1 }}</span>
                  <span class="ranking-name">{{ item.name }}</span>
                  <span class="ranking-value">
                    <template v-if="category.category === 'duration' || category.key === 'duration'">
                      <span v-if="item.avgDuration" class="ranking-avg-duration">
                        {{ item.avgDuration }}
                      </span>
                      <span class="ranking-total-duration">{{ item.value }}{{ durationRankingSort !== 'total' ? '天' : '' }}</span>
                    </template>
                    <span v-else>{{ category.unit }}{{ item.value }}</span>
                  </span>
                  <span class="ranking-bar">
                    <span
                      v-if="hasRankingBar(item)"
                      class="ranking-bar-fill"
                      :style="{ width: getRankingBarWidth(category, item) }"
                    ></span>
                  </span>
                </li>
                </ol>
              </div>
            </div>
          </div>
        </div>

          <div class="partner-table">
          <div class="partner-table-header">
            <div>
              <div class="partner-table-title">详细数据对比</div>
            </div>
            <!-- <div class="partner-table-role-switch">
              <button
                v-for="role in roleOptions"
                :key="role.key"
                type="button"
                class="partner-role-btn"
                :class="{ active: tableRole === role.key }"
                @click="tableRole = role.key"
              >
                {{ role.label }}
              </button>
            </div> -->
          </div>
          <div class="partner-table-grid" ref="partnerTableGridRef">
            <div class="partner-table-row partner-table-head">
              <div class="col-rank">
                排名
              </div>
              <div class="col-name sortable" @click="setSort('name')">
                合伙人
                <span class="sort-indicator" :class="getSortClass('name')"></span>
              </div>
              <div class="col-developer sortable" @click="setSort('developerbillAmount')">
                客户开发人
                <span class="sort-indicator" :class="getSortClass('developerbillAmount')"></span>
              </div>
              <div class="col-coordinator sortable" @click="setSort('coordinatorbillAmount')">
                客户协调人
                <span class="sort-indicator" :class="getSortClass('coordinatorbillAmount')"></span>
              </div>
              <div class="col-owner sortable" @click="setSort('ownerbillAmount')">
                客户负责人
                <span class="sort-indicator" :class="getSortClass('ownerbillAmount')"></span>
              </div>
              <div class="col-group sortable" @click="setSort('groupbillAmount')">
                客户组
                <span class="sort-indicator" :class="getSortClass('groupbillAmount')"></span>
              </div>
              <div class="col-undertaker sortable" @click="setSort('undertakerbillAmount')">
                承办组
                <span class="sort-indicator" :class="getSortClass('undertakerbillAmount')"></span>
              </div>
              <div class="col-activity sortable" @click="setSort('activityCount')">
                客户参与人
                <span class="sort-indicator" :class="getSortClass('activityCount')"></span>
              </div>
              
              <div class="col-praise sortable" @click="setSort('praise')">
                客户表扬/批评
                <span class="sort-indicator" :class="getSortClass('praise')"></span>
              </div>
              <div class="col-team sortable" @click="setSort('teamBuilding')">
                团队建设
                <span class="sort-indicator" :class="getSortClass('teamBuilding')"></span>
              </div>
              <div class="col-outreach sortable" @click="setSort('outreach')">
                对外联络
                <span class="sort-indicator" :class="getSortClass('outreach')"></span>
              </div>
              <div class="col-promotion sortable" @click="setSort('promotion')">
                对外宣传
                <span class="sort-indicator" :class="getSortClass('promotion')"></span>
              </div>
              <div class="col-company sortable" @click="setSort('companyManagement')">
                参与公司管理
                <span class="sort-indicator" :class="getSortClass('companyManagement')"></span>
              </div>
              <div class="col-department sortable" @click="setSort('departmentManagement')">
                参与部门管理
                <span class="sort-indicator" :class="getSortClass('departmentManagement')"></span>
              </div>
              <div class="col-score sortable" @click="setSort('score')">
                绩效分
                <span class="sort-indicator" :class="getSortClass('score')"></span>
              </div>
            </div>
            <div
              v-for="(row, index) in sortedPartnerRows"
              :key="row.name"
              class="partner-table-row"
              :class="{ 'partner-row-highlight': isPartnerMatch(row) }"
              :data-user-id="row.userId"
              @click="handleRowClick(row)"
            >
              <div class="col-rank">
                <span class="rank-badge" :class="`rank-${index + 1}`">
                  {{ index + 1 }}
                </span>
              </div>
              <div class="col-name">
                <!-- <div class="partner-avatar">
                  <img 
                    v-if="row.avatar && !avatarErrors[row.name]" 
                    :src="`/ipdoc/${row.avatar}`" 
                    :alt="row.name"
                    @error="() => handleAvatarError(row.name)"
                  />
                  <span>{{ getInitial(row.name) }}</span>
                </div> -->
                <div class="partner-name">{{ row.name }}</div>
              </div>
              <div class="col-developer revenue">{{ formatTableRevenue(row.developerbillAmount) }}</div>
              <div class="col-coordinator revenue">{{ formatTableRevenue(row.coordinatorbillAmount) }}</div>
              <div class="col-owner revenue">{{ formatTableRevenue(row.ownerbillAmount) }}</div>
              <div class="col-group revenue">{{ formatTableRevenue(row.groupbillAmount) }}</div>
              <div class="col-undertaker revenue">{{ formatTableRevenue(row.undertakerbillAmount) }}</div>
              <div class="col-activity">
                <span class="chip chip-blue">{{ row.activityCount || 0 }}次</span>
              </div>
              <div class="col-praise">
                <span class="chip chip-gray">{{ row.praise || 0 }}分</span>
              </div>
              <div class="col-team">
                <span class="chip chip-gray">{{ row.teamBuilding }}分</span>
              </div>
              <div class="col-outreach">
                <span class="chip chip-gray">{{ row.outreach }}分</span>
              </div>
              <div class="col-promotion">
                <span class="chip chip-gray">{{ row.promotion }}分</span>
              </div>
              <div class="col-company">
                <span class="chip chip-gray">{{ row.companyManagement }}分</span>
              </div>
              <div class="col-department">
                <span class="chip chip-gray">{{ row.departmentManagement }}分</span>
              </div>
              <div class="col-score">
                <span class="chip chip-score">{{ row.performanceScore }}分</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </section>

      <el-drawer v-model="drawerOpen" size="100%" direction="rtl" :show-close="false">
        <template #header>
          <div class="drawer-header">
            <button type="button" class="drawer-close-btn" aria-label="关闭" @click="drawerOpen = false">
              <svg class="drawer-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
              <span class="drawer-close-btn">关闭</span>
            </button>
            <div class="drawer-title">{{ activePartner.name }}绩效详情 · {{ activeYear }} 年</div>
          </div>
        </template>
        <div v-if="drawerLoading" class="partner-drawer-loading">
          <div class="partner-drawer-loading-card">
            <div class="partner-drawer-loading-spinner"></div>
            <div class="partner-drawer-loading-title">正在加载绩效详情</div>
            <div class="partner-drawer-loading-subtitle">请稍候...</div>
          </div>
        </div>
        <PersonalPerformancePanel
          v-else-if="activePartnerPerformance"
          :performance="activePartnerPerformance"
          :year="activeYear"
          :editable="false"
          :has-edit-permission="false"
          :summary-edit-permission="false"
          :has-score-permission="canScoreDrawer"
        />
      </el-drawer>
      </template>
    </div>
  </Layout>
</template>

<script setup>
import { computed, ref, watch, onMounted, nextTick } from "vue";
import { useStore } from "vuex";
import Layout from "@/layouts/main";
import PersonalPerformancePanel from "@/views/performance-assessment/components/PersonalPerformancePanel.vue";
import RadarChart from "@/views/performance-assessment/components/RadarChart.vue";
import CustomSelect from "@/views/performance-assessment/components/CustomSelect.vue";
// 导入 API 服务
import { ElMessage } from 'element-plus';
import {
  getYears,
  getPersonalInfo,
  getHardMetrics,
  querySoftMetricRecords,
  getSoftMetricEditPermission,
  // querySummary,
  getPartnerRadar,
  getPartnerRanking,
  getPartnerTable,
  getCommonFilters,
  getTeamData,
  getTeamCompareGroups,
  queryDepartment,
} from "@/api/performanceAssessmentApi";
import { querycustSelectClass } from "@/api/caseDetail";

const store = useStore();

// 根据权限过滤标签页
const tabs = computed(() => {
  const permissions = store.state.user.permissions || [];
  const allTabs = [
    { key: "partner", label: "合伙人分析", permission: 527 },
    { key: "team", label: "团队评估", permission: 528 },
    { key: "personal", label: "个人绩效", permission: 529 },
  ];
  
  return allTabs.filter(tab => permissions.includes(tab.permission));
});

// 响应式数据
const yearOptions = ref([]);
const activeTab = ref("partner");
const activeYear = ref(null);
const personalLoading = ref(false);
const isEditingSoft = ref(false);
const hasScorePermission = ref(false); // 打分权限状态，默认为false
const hasSoftEditPermission = ref(false); // 软性指标补充说明权限
const drawerScorePermission = ref(false);

const partnerSearchInput = ref("");
const partnerSearchTerm = ref("");
const partnerSearchMatchIndex = ref(0);
const partnerTableGridRef = ref(null);
const applyPartnerSearch = async () => {
  const nextTerm = partnerSearchInput.value.trim();
  if (nextTerm !== partnerSearchTerm.value) {
    partnerSearchMatchIndex.value = 0;
  }
  partnerSearchTerm.value = nextTerm;
  await nextTick();
  if (!partnerSearchTerm.value) return;
  const container = partnerTableGridRef.value;
  if (!container) return;
  const matches = Array.from(
    container.querySelectorAll(".partner-table-row.partner-row-highlight")
  );
  if (matches.length === 0) return;
  const index = partnerSearchMatchIndex.value % matches.length;
  const target = matches[index];
  if (target && typeof target.scrollIntoView === "function") {
    target.scrollIntoView({ block: "center", behavior: "smooth" });
  }
  partnerSearchMatchIndex.value = index + 1;
};

const scrollToCurrentSearchMatch = async () => {
  if (!partnerSearchTerm.value) return;
  await nextTick();
  const container = partnerTableGridRef.value;
  if (!container) return;
  const matches = Array.from(
    container.querySelectorAll(".partner-table-row.partner-row-highlight")
  );
  if (matches.length === 0) return;
  const index = partnerSearchMatchIndex.value % matches.length;
  const target = matches[index];
  if (target && typeof target.scrollIntoView === "function") {
    target.scrollIntoView({ block: "center", behavior: "smooth" });
  }
};
const clearPartnerSearch = () => {
  partnerSearchInput.value = "";
  partnerSearchTerm.value = "";
  partnerSearchMatchIndex.value = 0;
};
const isPartnerMatch = (row) => {
  if (!partnerSearchTerm.value) return false;
  const name = String(row?.name || "");
  return name.toLowerCase().includes(partnerSearchTerm.value.toLowerCase());
};
 // 弹框中查看他人绩效时的打分权限

const canScore = computed(() => {
  const permissions = store.state.user.permissions || [];
  const hasPermission532 = permissions.includes(532);
  return Boolean(hasPermission532 && hasScorePermission.value);
});

const canScoreDrawer = computed(() => {
  const permissions = store.state.user.permissions || [];
  const hasPermission532 = permissions.includes(532);
  return Boolean(hasPermission532 && drawerScorePermission.value);
});
// 监听权限变化，确保当前选中的 tab 在权限列表中
watch(tabs, (newTabs) => {
  if (newTabs.length > 0) {
    const hasCurrentTab = newTabs.some(tab => tab.key === activeTab.value);
    if (!hasCurrentTab) {
      // 如果当前 tab 不在权限列表中，切换到第一个有权限的 tab
      activeTab.value = newTabs[0].key;
    }
  } else {
    // 如果没有权限，重置 activeTab
    activeTab.value = "";
  }
}, { immediate: true });

// 个人绩效数据
const personalInfo = ref(null);
const hardMetrics = ref(null);
const softMetrics = ref(null);
const personalPerformance = computed(() => {
  if (!personalInfo.value || !hardMetrics.value) return null;
  const result = {
    user: personalInfo.value,
    highlight: hardMetrics.value.highlight,
    hardMetrics: {
      summaryCards: hardMetrics.value.summaryCards,
      scoreBreakdown: hardMetrics.value.scoreBreakdown,
      scoreTotal: hardMetrics.value.scoreTotal,
      modules: hardMetrics.value.modules,
    },
    softMetricsScore: softMetrics.value ? {
      breakdown: softMetrics.value.scoreBreakdown,
      total: softMetrics.value.total,
    } : null,
    softMetrics: softMetrics.value ? softMetrics.value.softMetrics : [],
    // 传递类型选项数据给组件
    typeOptionsByMetricKey: typeOptionsByMetricKey.value,
  };
  console.log('personalPerformance computed: softMetrics.value:', softMetrics.value);
  console.log('personalPerformance computed: result.softMetrics:', result.softMetrics);
  console.log('personalPerformance computed: result.softMetrics 长度:', result.softMetrics?.length);
  return result;
});

// 合伙人分析数据
const partnerOverviewData = ref([]);
const hardRadarData = ref(null);
const softRadarData = ref(null);
const rankingList = ref([]);
const partnerTableData = ref(null);
const tableRole = ref("developer"); // 必须在 loadPartnerData 之前定义
const partnerYear = ref(null); // 合伙人分析选中的年份
const partnerLoading = ref(false);
const partnerLoadedYear = ref(null);

// 硬性指标筛选状态
const hardRadarFilterOpen = ref(false);
const hardSelectedDepartment = ref("");
const hardSelectedPartners = ref([]);
const hardTempSelectedDepartment = ref("");
const hardTempSelectedPartners = ref([]);
const hardTempSelectionMode = ref("department");

// 软性指标筛选状态
const softRadarFilterOpen = ref(false);
const softSelectedDepartment = ref("");
const softSelectedPartners = ref([]);
const softTempSelectedDepartment = ref("");
const softTempSelectedPartners = ref([]);
const softTempSelectionMode = ref("department");

// 团队评估数据
const teamFiltersData = ref(null);
const teamRows = ref([]);
const teamCompareGroupsData = ref([]);
const teamFilters = ref({
  year: null,
  region: '全部',
  department: '全部',
  position: '全部',
  field: '全部',
}); // 必须在 loadTeamData 和 watch 之前定义

const pinnedUserIds = ref([]);
const pinnedPeopleMap = ref({});

// 加载数据的函数
const loadYears = async () => {
  try {
    const res = await getYears();
    if (res.success === true && res.data) {
      yearOptions.value = res.data;
      if (yearOptions.value.length > 0 && !activeYear.value) {
        activeYear.value = yearOptions.value[yearOptions.value.length - 1];
      }
      // 初始化合伙人分析年份：与 activeYear 保持一致
      if (!partnerYear.value && activeYear.value) {
        partnerYear.value = activeYear.value;
      }
    }
  } catch (error) {
    console.error('获取年份列表失败:', error);
  }
};

const setPartnerYear = (year) => {
  partnerYear.value = year;
  if (activeYear.value !== year) {
    activeYear.value = year;
  }
};

// 根据 title 匹配并设置对应的 type
const setModuleTypeByTitle = (module) => {
  if (!module || !module.title) return module;
  
  // 根据 title 设置对应的 type
  const titleTypeMap = {
    '账单金额': 'revenue-overview',
    '客户协调人': 'coordinator',
    '客户负责人': 'customer-owner',
    '客户组': 'customer-group',
    '承办组': 'undertake',
    '客户参与人': 'participant'
  };
  
  // 如果已经有 type，不覆盖；否则根据 title 设置
  if (!module.type && titleTypeMap[module.title]) {
    module.type = titleTypeMap[module.title];
  }
  
  return module;
};

// 适配 customer-owner 模块数据格式
const adaptCustomerOwnerData = (data) => {
  if (!data || typeof data !== 'object') {
    return {
      title: '客户负责人',
      type: 'customer-owner',
      summary: [],
      charts: {
        topCustomers: [],
        caseFields: [],
        businessFields: []
      },
      costs: []
    };
  }
  
  // 转换 top10 数据为 DonutChart 需要的格式（保持与之前数据结构一致）
  const topCustomers = (data.top10 || []).map(item => ({
    name: item.name || item.fullname || '--',
    value: item.allocationMoney || 0, // value 用于计算占比
    amount: typeof item.allocationMoney === 'number'
      ? `¥${item.allocationMoney.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `¥${item.allocationMoney || 0}`,
    custId: item.custId,
    bills: [] // 新接口没有账单明细
  }));
  
  // 转换案件领域占比 (ajlyzb) 为 FieldPieChart 需要的格式
  // FieldPieChart 需要 name 字段，而不是 label
  const caseFields = (data.ajlyzb || []).map(item => {
    const label = item.label || '';
    // 提取领域名称（去掉"业务领域"和"收入占比"等后缀）
    const name = label.replace(/业务领域|收入占比/g, '').trim() || label;
    return {
      name: name,
      value: typeof item.value === 'string' ? parseFloat(item.value) || 0 : (item.value || 0), // value 是金额，不是百分比
      color: getFieldColor(label),
      amount: '', // 新接口没有金额数据
      subFields: [], // 新接口没有子领域数据
      bills: [] // 新接口没有账单明细
    };
  });
  
  // 转换业务领域占比 (ywlyzb) 为 FieldPieChart 需要的格式
  const businessFields = (data.ywlyzb || []).map(item => {
    const label = item.label || '';
    // 提取领域名称（去掉"业务领域"和"收入占比"等后缀）
    const name = label.replace(/业务领域|收入占比/g, '').trim() || label;
    return {
      name: name,
      value: typeof item.value === 'string' ? parseFloat(item.value) || 0 : (item.value || 0), // value 是金额，不是百分比
      color: getFieldColor(label),
      amount: '', // 新接口没有金额数据
      subFields: [], // 新接口没有子领域数据
      bills: [] // 新接口没有账单明细
    };
  });
  
  // 构建 summary 数组（保持与之前数据结构一致）
  const summary = [];
  
  // 客户数
  if (data.fzrCustCount !== undefined && data.fzrCustCount !== null) {
    summary.push({
      label: '客户数',
      value: String(data.fzrCustCount),
      topClients: topCustomers.slice(0, 10).map(item => ({
        name: item.name,
        amount: typeof item.value === 'number' 
          ? `¥${item.value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : `¥${item.value}`,
        custId: item.custId,
        cases: 0, // 新接口没有案量数据
        rate: '--' // 新接口没有回款率数据
      }))
    });
  }
  
  // 账单额（highlight: true）
  if (data.fzrBill !== undefined && data.fzrBill !== null) {
    const billValue = typeof data.fzrBill === 'number' 
      ? `¥${data.fzrBill.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : data.fzrBill;
    summary.push({
      label: '账单额',
      value: billValue,
      highlight: true,
      topClients: topCustomers.slice(0, 10).map(item => ({
        name: item.name,
        amount: typeof item.value === 'number' 
          ? `¥${item.value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : `¥${item.value}`,
        custId: item.custId,
        cases: 0,
        rate: '--'
      }))
    });
  }
  
  // 案量
  if (data.fzrCaseCount !== undefined && data.fzrCaseCount !== null) {
    summary.push({
      label: '案量',
      value: `${data.fzrCaseCount}件`,
      topClients: topCustomers.slice(0, 10).map(item => ({
        name: item.name,
        amount: typeof item.value === 'number' 
          ? `¥${item.value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : `¥${item.value}`,
        custId: item.custId,
        cases: 0,
        rate: '--'
      }))
    });
  }
  
  // 回款率
  if (data.collectionRate !== undefined && data.collectionRate !== null) {
    summary.push({
      label: '回款率',
      value: data.collectionRate,
      topClients: topCustomers.slice(0, 10).map(item => ({
        name: item.name,
        amount: typeof item.value === 'number' 
          ? `¥${item.value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : `¥${item.value}`,
        custId: item.custId,
        cases: 0,
        rate: '--'
      }))
    });
  }
  
  // 年业绩上涨（保持原有格式，但新接口只有客户数，没有金额）
  if (data.increased !== undefined && data.increased !== null) {
    summary.push({
      label: '年业绩上涨',
      value: `${data.increased}个客户`, // 新接口只有客户数，没有金额
      up: true
    });
  }
  
  // 年业绩下降（保持原有格式，但新接口只有客户数，没有金额）
  if (data.decreased !== undefined && data.decreased !== null) {
    summary.push({
      label: '年业绩下降',
      value: `${data.decreased}个客户`, // 新接口只有客户数，没有金额
      down: true
    });
  }
  
  // 构建 costs 数组
  const costs = [];
  
  // 案内费用
  if (data.fzrCaseFee !== undefined && data.fzrCaseFee !== null) {
    const caseFeeValue = typeof data.fzrCaseFee === 'number'
      ? `¥${data.fzrCaseFee.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : data.fzrCaseFee;
    costs.push({
      label: '案内费用',
      value: caseFeeValue
    });
  }
  
  // 人力成本
  if (data.fzrrlcb !== undefined && data.fzrrlcb !== null) {
    // const laborCostValue = typeof data.fzrrlcb === 'number'
    //   ? `¥${data.fzrrlcb.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    //   : data.fzrrlcb;
    costs.push({
      label: '人力成本',
      value: '待处理'//laborCostValue
    });
  }
  
  // 客户联络
  if (data.fzrCustLL !== undefined && data.fzrCustLL !== null) {
    costs.push({
      label: '客户联络',
      value: typeof data.fzrCustLL === 'number' ? `${data.fzrCustLL}次` : data.fzrCustLL
    });
  }
  
  // 直接联系客户方人员
  if (data.fzrzjlxkhfry !== undefined && data.fzrzjlxkhfry !== null) {
    costs.push({
      label: '直接联系客户方人员',
      value: '待处理'//typeof data.fzrzjlxkhfry === 'number' ? `${data.fzrzjlxkhfry}人` : data.fzrzjlxkhfry
    });
  }
  
  return {
    title: '客户负责人',
    type: 'customer-owner',
    wide: true, // 保持与之前数据结构一致
    summary,
    charts: {
      topCustomers,
      caseFields,
      businessFields
    },
    costs,
    // 保留原始数据，用于后续可能需要的数据
    _rawData: data,
    // 保留 increased 和 decreased 字段，用于预加载
    increased: data.increased,
    decreased: data.decreased
  };
};

// 获取字段颜色（可以根据需要自定义）
const getFieldColor = (label) => {
  const colorMap = {
    '业务领域商标收入占比': '#2f6bff',
    '业务领域专利收入占比': '#34c38f',
    '业务领域商业秘密收入占比': '#f7b84b',
    '业务领域公司/合规及其他秘密收入占比': '#ff7a5c'
  };
  return colorMap[label] || '#8b9db8';
};

// 适配 customer-group 模块数据格式
const adaptCustomerGroupData = (data) => {
  if (!data || typeof data !== 'object') {
    return {
      title: '客户组',
      type: 'customer-group',
      overview: [],
      allocation: {
        before: '',
        after: ''
      },
      chart: []
    };
  }
  
  // 构建 overview 数组（保持与之前数据结构一致）
  const overview = [];
  
  // 构建统一的 clientList（top10 数据中没有 cases 和 rate，使用默认值）
  const clientList = (data.top10 || []).map(item => ({
    name: item.name || item.fullname || '--',
    cases: item.cases || 0, // 新接口没有案量数据，使用默认值 0
    amount: typeof item.allocationMoney === 'number'
      ? `¥${item.allocationMoney.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `¥${item.allocationMoney || 0}`,
    rate: item.rate || data.collectionRate || '--' // 如果没有单独的 rate，使用整体的 collectionRate
  }));
  
  // 客户数 - 使用 khzCustCount
  if (data.khzCustCount !== undefined && data.khzCustCount !== null) {
    overview.push({
      label: '客户数',
      value: String(data.khzCustCount),
      customers: clientList.slice(0, 3).map(item => item.name), // 前3个客户名称用于hover显示
      clientList: clientList
    });
  }
  
  // 案量 - 使用 khzCaseCount
  if (data.khzCaseCount !== undefined && data.khzCaseCount !== null) {
    overview.push({
      label: '案量',
      value: `${data.khzCaseCount}件`,
      clientList: clientList
    });
  }
  
  // 回款率（始终显示）
  overview.push({
    label: '回款率',
    value: data.collectionRate !== undefined && data.collectionRate !== null ? data.collectionRate : '--',
    clientList: clientList
  });
  
  // 分配前/后账单额 - 使用 khzCustBillFPQ (分配前) 和 khzCustBillFPH (分配后)
  const allocation = {
    before: data.khzCustBillFPQ !== undefined && data.khzCustBillFPQ !== null
      ? (typeof data.khzCustBillFPQ === 'number'
          ? `¥${data.khzCustBillFPQ.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : data.khzCustBillFPQ)
      : '',
    after: data.khzCustBillFPH !== undefined && data.khzCustBillFPH !== null
      ? (typeof data.khzCustBillFPH === 'number'
          ? `¥${data.khzCustBillFPH.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : data.khzCustBillFPH)
      : ''
  };
  
  // 转换图表数据
  const chart = (data.top10 || []).map(item => ({
    name: item.name || item.fullname || '--',
    value: item.allocationMoney || 0,
    amount: typeof item.allocationMoney === 'number'
      ? `¥${item.allocationMoney.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `¥${item.allocationMoney || 0}`,
    custId: item.custId
  }));
  
  return {
    title: '客户组',
    type: 'customer-group',
    overview,
    allocation,
    chart,
    _rawData: data
  };
};

// 适配 undertake 模块数据格式
const adaptUndertakeData = (data) => {
  if (!data || typeof data !== 'object') {
    return {
      title: '承办组',
      type: 'undertake',
      overview: []
    };
  }
  
  // 构建 overview 数组（保持与之前数据结构一致）
  const overview = [];
  
  // 客户数 - 使用 cbzCustCount
  if (data.cbzCustCount !== undefined && data.cbzCustCount !== null) {
    overview.push({
      label: '客户数',
      value: data.cbzCustCount > 0 ? String(data.cbzCustCount) : '无'
    });
  } else {
    overview.push({
      label: '客户数',
      value: '无'
    });
  }
  
  // 账单额 - 使用 cbzCustnbBill
  if (data.cbzCustnbBill !== undefined && data.cbzCustnbBill !== null && data.cbzCustnbBill > 0) {
    const billValue = typeof data.cbzCustnbBill === 'number'
      ? `¥${data.cbzCustnbBill.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : data.cbzCustnbBill;
    overview.push({
      label: '账单额',
      value: billValue
    });
  } else {
    overview.push({
      label: '账单额',
      value: '¥0.00'
    });
  }
  
  // 案量 - 使用 cbzCaseCount
  if (data.cbzCaseCount !== undefined && data.cbzCaseCount !== null) {
    overview.push({
      label: '案量',
      value: data.cbzCaseCount > 0 ? `${data.cbzCaseCount}件` : '无'
    });
  } else {
    overview.push({
      label: '案量',
      value: '无'
    });
  }
  
  return {
    title: '承办组',
    type: 'undertake',
    overview,
    workload: data.cbzgs ? { hours: data.cbzgs } : null, // 如果有工时数据，添加 workload 字段
    costs: [], // 新接口没有 costs 数据，使用空数组
    _rawData: data
  };
};

// 适配 participant 模块数据格式
const adaptParticipantData = (data) => {
  if (!data || typeof data !== 'object') {
    return {
      title: '客户参与人',
      type: 'participant',
      items: []
    };
  }
  
  // 构建 items 数组（保持与之前数据结构一致）
  const items = [];
  
  // 参与客户数量 - 使用 cyrCustCount
  if (data.cyrCustCount !== undefined && data.cyrCustCount !== null) {
    items.push({
      label: '参与客户数量',
      value: data.cyrCustCount > 0 ? `${data.cyrCustCount}家` : '无',
      customers: [] // 新接口没有客户列表数据
    });
  } else {
    items.push({
      label: '参与客户数量',
      value: '无',
      customers: []
    });
  }
  
  // 参与活动次数 - 使用 cyrhdCount
  if (data.cyrhdCount !== undefined && data.cyrhdCount !== null) {
    items.push({
      label: '参与活动次数',
      value: data.cyrhdCount > 0 ? `${data.cyrhdCount}次` : '无',
      activities: [] // 新接口没有活动列表数据
    });
  } else {
    items.push({
      label: '参与活动次数',
      value: '无',
      activities: []
    });
  }
  
  // 参与的客户方人员 - 使用 cyrkhfryCount
  if (data.cyrkhfryCount !== undefined && data.cyrkhfryCount !== null) {
    items.push({
      label: '参与的客户方人员',
      value: data.cyrkhfryCount > 0 ? `${data.cyrkhfryCount}人` : '无',
      personnelList: [] // 新接口没有人员列表数据
    });
  } else {
    items.push({
      label: '参与的客户方人员',
      value: '无',
      personnelList: []
    });
  }
  
  return {
    title: '客户参与人',
    type: 'participant',
    items,
    _rawData: data
  };
};

// 适配 scoreBreakdown 数据格式
const adaptScoreBreakdownData = (data) => {
  if (!data || typeof data !== 'object') {
    return [];
  }
  
  // 字段映射：接口字段 -> { label, score, color }
  const fieldMap = [
    { key: 'kfryfs', label: '客户开发人', color: '#2f6bff' },
    { key: 'xtrfs', label: '客户协调人', color: '#39b27f' },
    { key: 'fzrfs', label: '客户负责人', color: '#f7b84b' },
    { key: 'khzfs', label: '客户组', color: '#6c7cff' },
    { key: 'cbzfs', label: '承办组', color: '#ff7a5c' },
    { key: 'cyrfs', label: '客户参与人', color: '#8b9db8' },
  ];
  
  const scoreBreakdown = fieldMap.map(({ key, label, color }) => {
    const score = data[key];
    // 如果分数存在且不为 null/undefined，转换为数字，否则默认为 0
    const scoreValue = (score !== null && score !== undefined) ? (Number(score) || 0) : 0;
    return {
      label,
      score: scoreValue,
      color
    };
  });
    
  return scoreBreakdown;
};

const parseTimeParts = (value) => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') {
    const hours = Math.floor(value);
    return Number.isNaN(hours) ? null : { hours, minutes: 0 };
  }
  const raw = String(value).trim();
  if (!raw) return null;
  const parts = raw.split(':');
  const hours = Number.parseInt(parts[0], 10);
  const minutes = parts.length > 1 ? Number.parseInt(parts[1], 10) : 0;
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return { hours, minutes };
};

const formatAvgDuration = (value) => {
  const parts = parseTimeParts(value);
  if (!parts) return '--';
  const { hours, minutes } = parts;
  if (!minutes) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
};

const formatAttendanceDuration = (value) => {
  const parts = parseTimeParts(value);
  if (!parts) return '无';
  const { hours, minutes } = parts;
  if (hours === 0 && minutes === 0) return '无';
  if (!minutes) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
};

const toDurationMinutes = (value) => {
  const parts = parseTimeParts(value);
  if (!parts) return 0;
  return (parts.hours || 0) * 60 + (parts.minutes || 0);
};

const durationRankingSort = ref("avg");
const durationSortOptions = [
  { label: "按平均时长", value: "avg" },
  { label: "按天数", value: "days" },
  { label: "按时长", value: "total" },
];
const durationFilterOpen = ref(false);
const durationRankingRaw = ref([]);

const buildDurationRankingList = (data) => {
  const list = Array.isArray(data) ? [...data] : [];
  const sortKey = durationRankingSort.value;
  list.sort((a, b) => {
    if (sortKey === "days") {
      return (Number(b.attendanceDays) || 0) - (Number(a.attendanceDays) || 0);
    }
    if (sortKey === "total") {
      return toDurationMinutes(b.cumulativeLength) - toDurationMinutes(a.cumulativeLength);
    }
    return toDurationMinutes(b.averageLength) - toDurationMinutes(a.averageLength);
  });
  return list
    .filter(item => item.attendanceDays !== null && item.attendanceDays !== undefined)
            .map((item) => {
              const avgDuration = durationRankingSort.value === "total"
                ? ""
                : formatAvgDuration(item.averageLength);
              const totalDuration = formatAvgDuration(item.cumulativeLength);
              const attendanceDays = String(item.attendanceDays ?? 0);
              const displayValue = durationRankingSort.value === "total"
                ? totalDuration
                : attendanceDays;
              const barValue = durationRankingSort.value === "days"
                ? Number(item.attendanceDays) || 0
                : durationRankingSort.value === "total"
                  ? toDurationMinutes(item.cumulativeLength)
                  : toDurationMinutes(item.averageLength);
              return {
                name: item.userName || '--',
                value: displayValue,
                avgDuration,
                totalDuration,
                barValue
              };
            });
};

const getRankingBarWidth = (category, item) => {
  const list = Array.isArray(category?.list) ? category.list : [];
  let maxValue = 0;
  for (const row of list) {
    const v = Number(row?.barValue);
    if (!isNaN(v)) {
      maxValue = Math.max(maxValue, v);
    }
  }
  const currentValue = Number(item?.barValue);
  if (!maxValue || isNaN(currentValue) || currentValue <= 0) return '0%';
  const percent = (currentValue / maxValue) * 100;
  const clamped = Math.max(6, Math.min(100, percent));
  return `${clamped}%`;
};

const hasRankingBar = (item) => {
  const v = Number(item?.barValue);
  return !isNaN(v) && v > 0;
};

const updateDurationRankingList = () => {
  if (!Array.isArray(durationRankingRaw.value) || durationRankingRaw.value.length === 0) return;
  const list = buildDurationRankingList(durationRankingRaw.value);
  rankingList.value = rankingList.value.map((category) => {
    if (category.key === "duration") {
      return { ...category, list };
    }
    return category;
  });
};

const setDurationSort = (value) => {
  durationRankingSort.value = value;
  durationFilterOpen.value = false;
  updateDurationRankingList();
};

watch(durationRankingSort, () => {
  updateDurationRankingList();
});

// 适配 attendance 模块数据格式
const adaptAttendanceData = (data) => {
  if (!data || typeof data !== 'object') {
    return {
      title: '个人考勤',
      type: 'attendance',
      metrics: []
    };
  }
  
  // 构建 metrics 数组（保持与之前数据结构一致）
  const metrics = [];
  
  // 年度累计在岗时长 - 使用 ndzgsc
  if (data.ndzgsc !== undefined && data.ndzgsc !== null) {
    metrics.push({
      label: '年度累计在岗时长',
      value: formatAttendanceDuration(data.ndzgsc)
    });
  } else {
    metrics.push({
      label: '年度累计在岗时长',
      value: '无'
    });
  }
  
  // 年度平均在岗日时长 - 使用 rjzgsc
  if (data.rjzgsc !== undefined && data.rjzgsc !== null) {
    metrics.push({
      label: '年度平均在岗日时长',
      value: formatAttendanceDuration(data.rjzgsc)
    });
  } else {
    metrics.push({
      label: '年度平均在岗日时长',
      value: '无'
    });
  }
  
  // 休假天数 - 使用 xjts
  if (data.xjts !== undefined && data.xjts !== null) {
    const days = Number(data.xjts) || 0;
    metrics.push({
      label: '休假天数',
      value: days > 0 ? `${days}天` : '无'
    });
  } else {
    metrics.push({
      label: '休假天数',
      value: '无'
    });
  }
  
  // 出差天数 - 使用 ccts
  if (data.ccts !== undefined && data.ccts !== null) {
    const days = Number(data.ccts) || 0;
    metrics.push({
      label: '出差天数',
      value: days > 0 ? `${days}天` : '无'
    });
  } else {
    metrics.push({
      label: '出差天数',
      value: '无'
    });
  }
  
  return {
    title: '个人考勤',
    type: 'attendance',
    metrics,
    _rawData: data
  };
};

// 适配硬性指标数据格式
const adaptHardMetricsData = (data) => {
  // 如果已经是旧格式（包含 modules 字段），直接返回，保持向后兼容
  if (data && typeof data === 'object' && !Array.isArray(data) && 'modules' in data) {
    return data;
  }
  
  // 如果 data 是数组（新格式），需要转换为包含 modules 的对象格式
  if (Array.isArray(data)) {
    // 根据 title 匹配并转换每个模块
    const adaptedModules = data.map(module => {
      return setModuleTypeByTitle({ ...module });
    });
    
    return {
      modules: adaptedModules,
      // 为新格式提供默认值，避免组件报错
      summaryCards: [],
      scoreBreakdown: [],
      scoreTotal: 0,
      highlight: null
    };
  }
  
  // 如果 data 是单个对象，尝试包装
  if (data && typeof data === 'object') {
    const moduleData = setModuleTypeByTitle({ ...data });
    return {
      modules: [moduleData],
      // 保留其他字段
      ...data
    };
  }
  
  // 其他情况，返回空结构
  return {
    modules: [],
    summaryCards: [],
    scoreBreakdown: [],
    scoreTotal: 0,
    highlight: null
  };
};

// 软性指标类型映射：数字key -> 字符串key和标题
const SOFT_METRIC_KEY_MAP = {
  '1196': { key: 'praise', title: '客户表扬与批评', description: '客户正向反馈与改进记录。' },
  '1197': { key: 'team', title: '团队建设', description: '人才培养、协作机制、梯队建设。' },
  '1198': { key: 'outreach', title: '对外联络', description: '案件相关、业务拓展、资源对接。' },
  '1199': { key: 'publicity', title: '对外宣传', description: '参与讨论/发言、培训/演讲/主持、外部荣誉、外部任职、外部课题、对外发文。' },
  '1200': { key: 'company', title: '参与公司管理工作', description: '制度优化、业务协同、战略支持。' },
  '1201': { key: 'department', title: '参与部门管理工作', description: '部门运营、资源协同、绩效跟进。' },
};

// type 数字到中文的映射表（从接口获取）
const typeMappingMap = ref({});
// 每个指标类型对应的类型列表（从接口获取）
const typeOptionsByMetricKey = ref({});

// 加载 type 映射数据
const loadTypeMapping = async () => {
  try {
    const classIds = Object.keys(SOFT_METRIC_KEY_MAP).join(',');
    const res = await querycustSelectClass({ classId: classIds });
    if (res.success && res.data) {
      // 构建映射表：{ "2284": "表扬", "2285": "批评", ... }
      const mapping = {};
      // 构建每个指标类型对应的类型列表：{ "praise": ["表扬", "批评"], ... }
      const optionsByKey = {};
      
      Object.keys(res.data).forEach(classId => {
        const typeList = res.data[classId] || [];
        const metricInfo = SOFT_METRIC_KEY_MAP[classId];
        if (metricInfo) {
          // 为每个指标类型保存类型列表
          optionsByKey[metricInfo.key] = typeList.map(item => item.typeName).filter(Boolean);
        }
        typeList.forEach(item => {
          if (item.id && item.typeName) {
            mapping[String(item.id)] = item.typeName;
          }
        });
      });
      
      typeMappingMap.value = mapping;
      typeOptionsByMetricKey.value = optionsByKey;
      console.log('type 映射表加载成功:', mapping);
      console.log('指标类型选项加载成功:', optionsByKey);
    }
  } catch (error) {
    console.error('加载 type 映射失败:', error);
  }
};

// 根据 type 数字获取中文文本
const getTypeText = (typeNumber) => {
  // 如果是中文，直接返回
  if (typeof typeNumber === 'string' && !/^\d+$/.test(typeNumber)) {
    return typeNumber;
  }
  
  // 如果是数字字符串，从映射表中获取
  const typeStr = String(typeNumber);
  return typeMappingMap.value[typeStr] || typeStr;
};

// 适配软性指标数据格式
const adaptSoftMetricsData = async (year, userId) => {
  try {
    console.log('开始加载软性指标数据，年份:', year);
    
    // 如果 type 映射表为空，先加载映射表
    if (Object.keys(typeMappingMap.value).length === 0) {
      await loadTypeMapping();
    }
    
    // 并行获取所有指标类型的数据
    const metricKeys = Object.keys(SOFT_METRIC_KEY_MAP);
    console.log('指标类型keys:', metricKeys, '查看用户userId:', userId);
    
    const results = await Promise.all(
      metricKeys.map(async (key) => {
        const params = {
          year,
          key,
          pageNo: 1,
          pageSize: 1000 // 分页设置为1000条
        };
        // 如果有 userId，添加到参数中（查看他人绩效时需要）
        if (userId) {
          params.userId = userId;
        }
        console.log('请求软性指标数据，参数:', params);
        try {
          const res = await querySoftMetricRecords(params);
          console.log(`指标类型 ${key} 的请求结果:`, res);
          return res;
        } catch (err) {
          console.error(`加载指标类型 ${key} 的数据失败:`, err);
          return { success: false, data: [] };
        }
      })
    );
    
    console.log('软性指标数据请求结果:', results);

    // 构建软性指标数组
    const softMetrics = results.map((res, index) => {
      const metricKey = metricKeys[index];
      const metricInfo = SOFT_METRIC_KEY_MAP[metricKey];
      
      // 处理返回数据：可能是 { success: true, data: [...] } 格式，也可能是直接返回数组
      let recordsData = [];
      if (res && res.success === true && Array.isArray(res.data)) {
        recordsData = res.data;
      } else if (Array.isArray(res)) {
        recordsData = res;
      } else if (res && Array.isArray(res.data)) {
        recordsData = res.data;
      }
      
      console.log(`指标类型 ${metricKey} (${metricInfo.title}) 的数据记录数:`, recordsData.length);
      if (recordsData.length > 0) {
        console.log(`指标类型 ${metricKey} 的第一条记录:`, recordsData[0]);
      }
      
      const records = recordsData.map(record => {
        // 将 type 从数字转换为中文
        const typeText = getTypeText(record.type);
        const mappedRecord = {
          id: String(record.id || ''),
          type: typeText, // 转换为中文
          content: record.content || '',
          createTime: record.createDate || record.createTime || new Date().toISOString(),
          occurredDate: record.occurredDate || null,
          autoAdd: record.autoAdd !== undefined ? record.autoAdd : 1, // 保留 autoAdd 字段，默认为 1
          // 保留原始 type 数字，以便后续可能需要
          originalType: record.type
        };
        return mappedRecord;
      });

      const groupData = {
        key: metricInfo.key,
        title: metricInfo.title,
        description: metricInfo.description,
        records
      };
      
      console.log(`指标类型 ${metricKey} 构建的组数据:`, groupData);
      console.log(`指标类型 ${metricKey} 的 records 数量:`, groupData.records.length);
      
      return groupData;
    });

    // 加载个人总结数据
    let summaryGroup = {
      key: 'summary',
      title: '个人总结',
      description: '新年目标计划、对公司及部门的想法建议等。',
      records: []
    };
    
    // 注释：不再调用 querySummary 请求（个人总结改为在线编辑）
    // try {
    //   // 调用个人总结接口
    //   const summaryRes = await querySummary({ year, userId });
    //   console.log('个人总结接口返回:', summaryRes);
    //   
    //   if (summaryRes.success === true && summaryRes.data) {
    //     // 有数据，转换为 records 格式
    //     summaryGroup.records = [{
    //       id: String(summaryRes.data.id || ''),
    //       plan: summaryRes.data.plan || '',
    //       suggestion: summaryRes.data.suggestion || '',
    //       other: summaryRes.data.other || '',
    //       createTime: summaryRes.data.createTime || new Date().toISOString(),
    //       updateTime: summaryRes.data.updateTime || null
    //     }];
    //   } else {
    //     // 没有数据（data 为 null），records 为空数组
    //     summaryGroup.records = [];
    //   }
    // } catch (error) {
    //   console.error('加载个人总结数据失败:', error);
    //   // 出错时，records 为空数组
    //   summaryGroup.records = [];
    // }
    
    // 将个人总结添加到 softMetrics 数组
    softMetrics.push(summaryGroup);

    // 返回适配后的数据格式（保持与原有格式一致）
    return {
      scoreBreakdown: [],
      total: 0,
      softMetrics
    };
  } catch (error) {
    console.error('加载软性指标数据失败:', error);
    // 返回空数据，包含空的 summary 组
    const emptySoftMetrics = Object.values(SOFT_METRIC_KEY_MAP).map(info => ({
      key: info.key,
      title: info.title,
      description: info.description,
      records: []
    }));
    // 添加空的 summary 组
    emptySoftMetrics.push({
      key: 'summary',
      title: '个人总结',
      description: '新年目标计划、对公司及部门的想法建议等。',
      records: []
    });
    return {
      scoreBreakdown: [],
      total: 0,
      softMetrics: emptySoftMetrics
    };
  }
};

// 检查打分权限
const checkScorePermission = async (year) => {
  if (!year) {
    hasScorePermission.value = false;
    return;
  }
  
  try {
    // 使用 getSoftMetricEditPermission 接口，type: 2 表示打分权限
    const res = await getSoftMetricEditPermission({ year, type: 2 });
    console.log('检查打分权限接口返回:', res);
    // 根据接口返回的状态判断权限
    hasScorePermission.value = res.success === true;
  } catch (error) {
    console.error('检查打分权限失败:', error);
    hasScorePermission.value = false;
  }
};

const checkSoftEditPermission = async (year) => {
  if (!year) {
    hasSoftEditPermission.value = false;
    return;
  }
  
  try {
    const res = await getSoftMetricEditPermission({ year, type: 1 });
    hasSoftEditPermission.value = res.success === true;
  } catch (error) {
    console.error('检查软性指标编辑权限失败:', error);
    hasSoftEditPermission.value = false;
  }
};

const loadPersonalData = async () => {
  personalLoading.value = true;
  if (!activeYear.value) {
    console.log('loadPersonalData: activeYear.value 为空，跳过加载');
    personalLoading.value = false;
    return;
  }
  console.log('loadPersonalData: 开始加载个人数据，年份:', activeYear.value);
  try {
    // 并行加载个人数据
    const [infoRes, hardRes, ownerRes, groupRes, undertakeRes, participantRes, attendanceRes, scoreBreakdownRes] = await Promise.all([
      getPersonalInfo({ year: activeYear.value }),
      getHardMetrics({ year: activeYear.value }),
      getHardMetrics({ year: activeYear.value, type: 'customer-owner' }),
      getHardMetrics({ year: activeYear.value, type: 'customer-group' }),
      getHardMetrics({ year: activeYear.value, type: 'undertake' }),
      getHardMetrics({ year: activeYear.value, type: 'participants' }),
      getHardMetrics({ year: activeYear.value, type: 'attendance' }),
      getHardMetrics({ year: activeYear.value, type: 'scoreBreakdown' }),
    ]);
    
    if (infoRes.success === true && Array.isArray(infoRes.data) && infoRes.data.length > 0) {
      personalInfo.value = infoRes.data[0];
      // 检查打分权限
      await checkScorePermission(activeYear.value);
      await checkSoftEditPermission(activeYear.value);
    }
    
    // 适配硬性指标数据格式
    if (hardRes.success === true && hardRes.data) {
      hardMetrics.value = adaptHardMetricsData(hardRes.data);
      
      // 如果单独获取了 customer-owner 模块数据，将其添加到 modules 中
      if (ownerRes.success === true && ownerRes.data) {
        const ownerModule = adaptCustomerOwnerData(ownerRes.data);
        ownerModule.type = 'customer-owner';
        
        // 确保 hardMetrics.value.modules 存在
        if (!hardMetrics.value.modules) {
          hardMetrics.value.modules = [];
        }
        
        // 检查是否已存在 customer-owner 模块，如果存在则替换，否则添加
        const existingIndex = hardMetrics.value.modules.findIndex(m => m && m.type === 'customer-owner');
        if (existingIndex >= 0) {
          hardMetrics.value.modules[existingIndex] = ownerModule;
        } else {
          hardMetrics.value.modules.push(ownerModule);
        }
      }
      
      // 如果单独获取了 customer-group 模块数据，将其添加到 modules 中
      if (groupRes.success === true && groupRes.data) {
        const groupModule = adaptCustomerGroupData(groupRes.data);
        groupModule.type = 'customer-group';
        
        // 确保 hardMetrics.value.modules 存在
        if (!hardMetrics.value.modules) {
          hardMetrics.value.modules = [];
        }
        
        // 检查是否已存在 customer-group 模块，如果存在则替换，否则添加
        const existingIndex = hardMetrics.value.modules.findIndex(m => m && m.type === 'customer-group');
        if (existingIndex >= 0) {
          hardMetrics.value.modules[existingIndex] = groupModule;
        } else {
          hardMetrics.value.modules.push(groupModule);
        }
      }
      
      // 如果单独获取了 undertake 模块数据，将其添加到 modules 中
      if (undertakeRes.success === true && undertakeRes.data) {
        const undertakeModuleData = adaptUndertakeData(undertakeRes.data);
        undertakeModuleData.type = 'undertake';
        
        // 确保 hardMetrics.value.modules 存在
        if (!hardMetrics.value.modules) {
          hardMetrics.value.modules = [];
        }
        
        // 检查是否已存在 undertake 模块，如果存在则替换，否则添加
        const existingIndex = hardMetrics.value.modules.findIndex(m => m && m.type === 'undertake');
        if (existingIndex >= 0) {
          hardMetrics.value.modules[existingIndex] = undertakeModuleData;
        } else {
          hardMetrics.value.modules.push(undertakeModuleData);
        }
      }
      
      // 如果单独获取了 participants 模块数据，将其添加到 modules 中
      if (participantRes.success === true && participantRes.data) {
        const participantModuleData = adaptParticipantData(participantRes.data);
        participantModuleData.type = 'participant';
        
        // 确保 hardMetrics.value.modules 存在
        if (!hardMetrics.value.modules) {
          hardMetrics.value.modules = [];
        }
        
        // 检查是否已存在 participant 模块，如果存在则替换，否则添加
        const existingIndex = hardMetrics.value.modules.findIndex(m => m && m.type === 'participant');
        if (existingIndex >= 0) {
          hardMetrics.value.modules[existingIndex] = participantModuleData;
        } else {
          hardMetrics.value.modules.push(participantModuleData);
        }
      }
      
      // 如果单独获取了 attendance 模块数据，将其添加到 modules 中
      if (attendanceRes.success === true && attendanceRes.data) {
        const attendanceModuleData = adaptAttendanceData(attendanceRes.data);
        attendanceModuleData.type = 'attendance';
        
        // 确保 hardMetrics.value.modules 存在
        if (!hardMetrics.value.modules) {
          hardMetrics.value.modules = [];
        }
        
        // 检查是否已存在 attendance 模块，如果存在则替换，否则添加
        const existingIndex = hardMetrics.value.modules.findIndex(m => m && m.type === 'attendance');
        if (existingIndex >= 0) {
          hardMetrics.value.modules[existingIndex] = attendanceModuleData;
        } else {
          hardMetrics.value.modules.push(attendanceModuleData);
        }
      }
      
      // 如果单独获取了 scoreBreakdown 数据，更新硬性指标绩效分数
      if (scoreBreakdownRes.success === true && scoreBreakdownRes.data) {
        const scoreBreakdown = adaptScoreBreakdownData(scoreBreakdownRes.data);
        if (scoreBreakdown.length > 0) {
          hardMetrics.value.scoreBreakdown = scoreBreakdown;
          // 计算总分
          hardMetrics.value.scoreTotal = scoreBreakdown.reduce((sum, item) => sum + (item.score || 0), 0);
        }
      }

      // 如果 summaryCards 为空，补上绩效总分卡片
      if (!hardMetrics.value.summaryCards || hardMetrics.value.summaryCards.length === 0) {
        const totalScore = typeof hardMetrics.value.scoreTotal === 'number'
          ? hardMetrics.value.scoreTotal
          : (hardMetrics.value.scoreBreakdown || []).reduce((sum, item) => sum + (item.score || 0), 0);
        hardMetrics.value.summaryCards = [
          { key: 'judgments', label: '绩效分', value: totalScore, delta: 0 }
        ];
      }
    }
    
    // 异步加载软性指标数据（不阻塞主流程）
    console.log('loadPersonalData: 准备加载软性指标数据，年份:', activeYear.value);
    const userId = personalInfo.value?.userId;
    adaptSoftMetricsData(activeYear.value, userId).then(softMetricsData => {
      console.log('loadPersonalData: 软性指标数据加载成功:', softMetricsData);
      console.log('loadPersonalData: softMetrics 数组:', softMetricsData.softMetrics);
      console.log('loadPersonalData: softMetrics 数组长度:', softMetricsData.softMetrics?.length);
      if (softMetricsData.softMetrics && softMetricsData.softMetrics.length > 0) {
        console.log('loadPersonalData: 第一个指标数据:', softMetricsData.softMetrics[0]);
        console.log('loadPersonalData: 第一个指标的 records:', softMetricsData.softMetrics[0]?.records);
      }
      softMetrics.value = softMetricsData;
      // 确保数据格式正确
      console.log('loadPersonalData: 赋值后的 softMetrics.value:', softMetrics.value);
    }).catch(error => {
      console.error('loadPersonalData: 加载软性指标数据失败:', error);
      // 设置空数据，避免页面报错
      softMetrics.value = {
        scoreBreakdown: [],
        total: 0,
        softMetrics: Object.values(SOFT_METRIC_KEY_MAP).map(info => ({
          key: info.key,
          title: info.title,
          description: info.description,
          records: []
        }))
      };
    });
  } catch (error) {
    console.error('加载个人绩效数据失败:', error);
  } finally {
    personalLoading.value = false;
  }
};

/** 仅重新拉取指定类型的个人软性指标并更新该组（用于新增后拿到服务端真实 id） */
const refreshPersonalSoftMetricsByKey = async (groupKey) => {
  if (!groupKey || groupKey === 'summary') return;
  const metricKeys = Object.keys(SOFT_METRIC_KEY_MAP);
  const apiKey = metricKeys.find((k) => SOFT_METRIC_KEY_MAP[k].key === groupKey) || groupKey;
  const userId = personalInfo.value?.userId;
  try {
    if (Object.keys(typeMappingMap.value).length === 0) {
      await loadTypeMapping();
    }
    const params = { year: activeYear.value, key: apiKey, pageNo: 1, pageSize: 1000 };
    if (userId) params.userId = userId;
    const res = await querySoftMetricRecords(params);
    let recordsData = [];
    if (res && res.success === true && Array.isArray(res.data)) recordsData = res.data;
    else if (Array.isArray(res?.data)) recordsData = res.data;
    const records = recordsData.map((record) => {
      const typeText = getTypeText(record.type);
      return {
        id: String(record.id || ''),
        type: typeText,
        content: record.content || '',
        createTime: record.createDate || record.createTime || new Date().toISOString(),
        occurredDate: record.occurredDate || null,
        autoAdd: record.autoAdd !== undefined ? record.autoAdd : 1,
        originalType: record.type,
      };
    });
    const list = softMetrics.value?.softMetrics;
    if (Array.isArray(list)) {
      const idx = list.findIndex((g) => g && g.key === groupKey);
      if (idx >= 0) {
        const nextList = list.map((g, i) => (i === idx ? { ...g, records } : g));
        softMetrics.value = { ...softMetrics.value, softMetrics: nextList };
      }
    }
  } catch (error) {
    console.error('刷新软性指标数据失败:', error);
  }
};

// 单独加载硬性指标雷达图数据
const loadHardRadarData = async () => {
  try {
    if (!partnerYear.value) {
      partnerYear.value = activeYear.value ?? (yearOptions.value.length > 0 ? yearOptions.value[yearOptions.value.length - 1] : new Date().getFullYear());
    }
    const currentDeptName = hardSelectedDepartment.value || radarDepartmentOptions.value[0] || '';
    const currentDept = radarDepartmentData.value.find(item => item.deptName === currentDeptName);
    const deptId = currentDept?.deptId || '';
    
    const params = { 
      year: partnerYear.value, 
      IndicatorsType: 'hard',
      department: deptId,
      partnerIds: hardSelectedPartners.value.length > 0 ? hardSelectedPartners.value : []
    };
    
    const radarRes = await getPartnerRadar(params);
    if (radarRes.success === true && radarRes.data) {
      const normalized = normalizeRadarSeries(radarRes.data);
      hardRadarData.value = normalized;
      
      const returnedUserIds = (normalized.series || []).map(item => Number(item.userId));
      if (returnedUserIds.length > 0) {
        const currentSelectedIds = hardSelectedPartners.value.map(id => Number(id));
        const hasMatching = currentSelectedIds.some(id => returnedUserIds.includes(id));
        
        if (!hasMatching && currentSelectedIds.length > 0) {
          hardSelectedPartners.value = returnedUserIds;
          hardTempSelectedPartners.value = [...returnedUserIds];
        }
      }
    }
  } catch (error) {
    console.error('加载硬性指标雷达图数据失败:', error);
  }
};

// 单独加载软性指标雷达图数据
const loadSoftRadarData = async () => {
  try {
    if (!partnerYear.value) {
      partnerYear.value = activeYear.value ?? (yearOptions.value.length > 0 ? yearOptions.value[yearOptions.value.length - 1] : new Date().getFullYear());
    }
    const currentDeptName = softSelectedDepartment.value || radarDepartmentOptions.value[0] || '';
    const currentDept = radarDepartmentData.value.find(item => item.deptName === currentDeptName);
    const deptId = currentDept?.deptId || '';
    
    const params = { 
      year: partnerYear.value, 
      IndicatorsType: 'soft',
      department: deptId,
      partnerIds: softSelectedPartners.value.length > 0 ? softSelectedPartners.value : []
    };
    
    const radarRes = await getPartnerRadar(params);
    if (radarRes.success === true && radarRes.data) {
      const normalized = normalizeRadarSeries(radarRes.data);
      softRadarData.value = normalized;
      
      const returnedUserIds = (normalized.series || []).map(item => Number(item.userId));
      if (returnedUserIds.length > 0) {
        const currentSelectedIds = softSelectedPartners.value.map(id => Number(id));
        const hasMatching = currentSelectedIds.some(id => returnedUserIds.includes(id));
        
        if (!hasMatching && currentSelectedIds.length > 0) {
          softSelectedPartners.value = returnedUserIds;
          softTempSelectedPartners.value = [...returnedUserIds];
        }
      }
    }
  } catch (error) {
    console.error('加载软性指标雷达图数据失败:', error);
  }
};

const loadPartnerData = async (force = false) => {
  try {
    // 如果没有选中年份，使用默认年份
    if (!partnerYear.value) {
      partnerYear.value = activeYear.value ?? (yearOptions.value.length > 0 ? yearOptions.value[yearOptions.value.length - 1] : new Date().getFullYear());
    }

    if (!force) {
      if (partnerLoading.value) return;
      if (partnerLoadedYear.value === partnerYear.value) return;
    }
    partnerLoading.value = true;
    
    // /performance-assessment/partner/overview 已停用，保持占位不再请求
    partnerOverviewData.value = [];
    
    // 加载部门和人员数据（用于雷达图筛选）
    try {
      const deptRes = await queryDepartment({ year: partnerYear.value });
      console.log('queryDepartment 接口返回:', deptRes);
      
      if (deptRes.success === true) {
        // 处理返回数据结构：data 是数组
        let departments = [];
        if (Array.isArray(deptRes.data)) {
          departments = deptRes.data;
        } else if (deptRes.data?.departments) {
          departments = deptRes.data.departments;
        }
        
        if (departments.length > 0) {
          radarDepartmentData.value = departments;
          console.log('部门数据加载成功:', radarDepartmentData.value);
          
          // 如果尚未选择部门，设置默认选择第一个部门及其所有人员（硬性和软性指标）
          if (radarDepartmentData.value.length > 0) {
            const firstDept = radarDepartmentData.value[0];
            const partnerIds = firstDept.employees?.map(p => p.userId) || [];
            
            // 硬性指标默认值
            if (!hardSelectedDepartment.value) {
              hardSelectedDepartment.value = firstDept.deptName;
              hardTempSelectedDepartment.value = firstDept.deptName;
              hardSelectedPartners.value = partnerIds;
              hardTempSelectedPartners.value = [...partnerIds];
            }
            
            // 软性指标默认值
            if (!softSelectedDepartment.value) {
              softSelectedDepartment.value = firstDept.deptName;
              softTempSelectedDepartment.value = firstDept.deptName;
              softSelectedPartners.value = partnerIds;
              softTempSelectedPartners.value = [...partnerIds];
            }
            
            // 兼容旧代码
            if (!selectedDepartment.value) {
              selectedDepartment.value = firstDept.deptName;
            }
          }
        } else {
          console.warn('部门数据为空或格式不正确');
        }
      } else {
        console.warn('部门数据接口返回失败:', deptRes);
      }
    } catch (error) {
      console.error('加载部门数据失败:', error);
    }
    
    // 加载雷达图数据（硬性和软性指标分别加载）
    await Promise.all([loadHardRadarData(), loadSoftRadarData()]);
    
    // 加载排行数据（去掉 revenue，只加载 score 和 duration）
    const rankingTypes = [
      { key: 'score', apiType: 'score' },
      { key: 'duration', apiType: 'onDuty' }
    ];
    const rankingPromises = rankingTypes.map(({ key, apiType }) => {
      return getPartnerRanking({ 
        year: partnerYear.value, 
        type: apiType 
      }).catch(error => {
        // 单个接口失败不影响其他接口
        console.error(`获取${key}排行数据失败:`, error);
        return { success: false, data: null };
      });
    });
    const rankingResults = await Promise.all(rankingPromises);
    
    // 处理返回的数据
    rankingList.value = rankingResults.map((res, index) => {
      const type = rankingTypes[index]?.key;
      
      if (res.success === true && res.data) {
        let list = [];
        
        if (type === 'revenue') {
          // 客户经营情况（按客户负责人）：按 fzrBill 排序，取前10
          const data = Array.isArray(res.data) ? res.data : [];
          // 过滤掉 fzrBill 为 null 的数据，然后按 fzrBill 降序排序
          const sortedData = data
            .filter(item => item.fzrBill !== null && item.fzrBill !== undefined)
            .sort((a, b) => (b.fzrBill || 0) - (a.fzrBill || 0))
            .slice(0, 10);
          
          list = sortedData.map(item => {
            const amount = Number(item.fzrBill);
            let value = '';
            if (amount >= 100000000) {
              value = `${(amount / 100000000).toFixed(2)}亿`;
            } else if (amount >= 10000) {
              value = `${(amount / 10000).toFixed(2)}万`;
            } else {
              value = amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
            
            return {
              name: item.fullname || item.name || '--',
              customers: item.fzrCustCount || 0,
              value: value,
              userId: item.userId
            };
          });
        } else if (type === 'score') {
          // 绩效总分排行：数据已按 score 降序排列，取前10条
          const data = Array.isArray(res.data) ? res.data : [];
          // 过滤掉 score 为 null 或 undefined 的数据，然后取前10条
          const sortedData = data
            .filter(item => item.score !== null && item.score !== undefined);
          
          list = sortedData.map((item) => {
            // 格式化分数：如果是整数则显示整数，否则保留一位小数
            const score = Number(item.score);
            let value = '';
            if (isNaN(score)) {
              value = '--';
            } else if (score % 1 === 0) {
              // 整数
              value = String(score);
            } else {
              // 小数，保留一位小数
              value = score.toFixed(1);
            }
            
            return {
              name: item.fullname || item.name || '--',
              value: value,
              barValue: isNaN(score) ? 0 : score,
              userId: item.userId
            };
          });
        } else if (type === 'duration') {
          // 在岗时长排行：接口返回 averageLength / attendanceDays / userName
          const data = Array.isArray(res.data) ? res.data : [];
          durationRankingRaw.value = data;
          list = buildDurationRankingList(data);
        }
        
        // 返回格式化的排行数据
        const categoryConfig = {
          score: { key: 'score', icon: '★', title: '绩效分排行', unit: '' },
          duration: { key: 'duration', icon: '⏱️', title: '工作时长排行', unit: '' }
        };
        
        return {
          ...categoryConfig[type],
          list: list
        };
      } else {
        // 接口失败时返回空数据（duration 使用模拟数据，不会失败）
        const categoryConfig = {
          score: { key: 'score', icon: '★', title: '绩效分排行', unit: '' },
          duration: { key: 'duration', icon: '⏱️', title: '工作时长排行', unit: '' }
        };
        return {
          ...categoryConfig[type],
          list: []
        };
      }
    });
    
    // 加载表格数据
    await loadPartnerTableData(partnerYear.value);
    partnerLoadedYear.value = partnerYear.value;
  } catch (error) {
    console.error('加载合伙人分析数据失败:', error);
  } finally {
    partnerLoading.value = false;
  }
};

// 单独加载表格数据
const loadPartnerTableData = async (yearOverride = null) => {
  try {
    const tableYear = yearOverride ?? partnerYear.value ?? activeYear.value ?? (yearOptions.value.length > 0 ? yearOptions.value[0] : new Date().getFullYear());
    const tableRes = await getPartnerTable({ 
      year: tableYear, 
      role: tableRole.value 
    });
    if (tableRes.success === true) {
      partnerTableData.value = tableRes.data;
    }
  } catch (error) {
    console.error('加载表格数据失败:', error);
  }
};

const loadTeamData = async () => {
  if (!activeYear.value) return;
  try {
    // 加载筛选条件
    let filtersRes = null;
    try {
      filtersRes = await getCommonFilters({ year: activeYear.value });
    } catch (error) {
      console.error('获取公共筛选条件失败，使用本地默认数据:', error);
    }
    // 如果接口未返回筛选项，使用前端内置的临时数据（后续你可手动置空）
    const fallbackFilters = {
      years: [2023, 2024, 2025],
      regions: ['全部', '华东', '华南', '华北'],
      departments: ['全部', '专利事业部', '商标事业部', '法务事业部'],
      positions: ['全部', '合伙人', '资深顾问', '顾问'],
      fields: ['全部', '专利', '商标', '版权', '法务'],
    };
    // 团队评估临时人员数据（后续你可手动置空）
    const fallbackTeamRows = [
      {
        userId: 101,
        year: 2025,
        name: '张三',
        department: '专利事业部',
        position: '合伙人',
        region: '华东',
        field: '专利',

        billingAmountDeveloper: '¥1,200,000',
        billingAmountCoordinator: '¥860,000',
        billingAmountOwner: '¥2,450,000',
        billingAmountGroup: '¥3,200,000',
        billingAmountUndertake: '¥1,760,000',

        devSameFieldCustomers: 18,
        devSameFieldBillingAmount: '¥720,000',
        devCrossFieldCustomers: 6,
        devCrossFieldBillingAmount: '¥260,000',
        devExistingCustomerCrossField: 4,

        coordinationBillingAmount: '¥520,000',
        coordinationCollectionStatus: '良好',
        coordinationYearUp: '¥180,000',
        coordinationYearDown: '¥60,000',

        ownerCustomerCount: 26,
        ownerBillingAmount: '¥1,680,000',
        ownerCaseCount: 42,
        ownerCollectionRate: '92%',
        ownerYearUp: '¥320,000',
        ownerYearDown: '¥120,000',
        ownerCaseCost: '¥210,000',
        ownerLaborCost: '¥160,000',
        ownerClientContacts: 58,
        ownerDirectClientContacts: 21,

        groupCustomerCount: 48,
        groupCaseCount: 85,
        groupCollectionRate: '90%',
        groupBillingBefore: '¥2,800,000',
        groupBillingAfter: '¥3,150,000',

        undertakeCustomerCount: 30,
        undertakeBillingAmount: '¥1,220,000',
        undertakeCaseCount: 66,
        undertakeWorkHours: '1,120h',
        undertakeCaseCost: '¥180,000',
        undertakeLaborCost: '¥140,000',

        participantCustomerCount: 22,
        participantActivityCount: 12,
        participantClientPeopleCount: 36,

        attendanceTotalHours: '1,980h',
        attendanceAvgDailyHours: '7.5h',
        leaveDays: 8,
        businessTripDays: 12,

        hardScoreDeveloper: 88,
        hardScoreCoordinator: 84,
        hardScoreOwner: 90,
        hardScoreGroup: 86,
        hardScoreUndertake: 85,
        hardScoreParticipant: 82,

        softCountPraiseCriticism: 6,
        softCountTeamBuilding: 4,
        softCountExternalLiaison: 8,
        softCountExternalPromotion: 5,
        softCountCompanyManagement: 3,
        softCountDepartmentManagement: 2,

        softScorePraiseCriticism: 12,
        softScoreTeamBuilding: 10,
        softScoreExternalLiaison: 14,
        softScoreExternalPromotion: 9,
        softScoreCompanyManagement: 8,
        softScoreDepartmentManagement: 7,

        performanceScore: 90,
        annualSummaryView: '可查看',
      },
      {
        userId: 102,
        year: 2025,
        name: '李四',
        department: '商标事业部',
        position: '资深顾问',
        region: '华南',
        field: '商标',

        billingAmountDeveloper: '¥780,000',
        billingAmountCoordinator: '¥640,000',
        billingAmountOwner: '¥1,520,000',
        billingAmountGroup: '¥2,400,000',
        billingAmountUndertake: '¥1,050,000',

        devSameFieldCustomers: 12,
        devSameFieldBillingAmount: '¥420,000',
        devCrossFieldCustomers: 5,
        devCrossFieldBillingAmount: '¥190,000',
        devExistingCustomerCrossField: 3,

        coordinationBillingAmount: '¥410,000',
        coordinationCollectionStatus: '正常',
        coordinationYearUp: '¥120,000',
        coordinationYearDown: '¥40,000',

        ownerCustomerCount: 20,
        ownerBillingAmount: '¥1,120,000',
        ownerCaseCount: 35,
        ownerCollectionRate: '88%',
        ownerYearUp: '¥210,000',
        ownerYearDown: '¥80,000',
        ownerCaseCost: '¥160,000',
        ownerLaborCost: '¥120,000',
        ownerClientContacts: 46,
        ownerDirectClientContacts: 18,

        groupCustomerCount: 36,
        groupCaseCount: 70,
        groupCollectionRate: '87%',
        groupBillingBefore: '¥2,050,000',
        groupBillingAfter: '¥2,280,000',

        undertakeCustomerCount: 24,
        undertakeBillingAmount: '¥960,000',
        undertakeCaseCount: 52,
        undertakeWorkHours: '980h',
        undertakeCaseCost: '¥150,000',
        undertakeLaborCost: '¥110,000',

        participantCustomerCount: 17,
        participantActivityCount: 9,
        participantClientPeopleCount: 28,

        attendanceTotalHours: '1,860h',
        attendanceAvgDailyHours: '7.2h',
        leaveDays: 10,
        businessTripDays: 9,

        hardScoreDeveloper: 82,
        hardScoreCoordinator: 80,
        hardScoreOwner: 85,
        hardScoreGroup: 83,
        hardScoreUndertake: 81,
        hardScoreParticipant: 79,

        softCountPraiseCriticism: 4,
        softCountTeamBuilding: 3,
        softCountExternalLiaison: 6,
        softCountExternalPromotion: 4,
        softCountCompanyManagement: 2,
        softCountDepartmentManagement: 3,

        softScorePraiseCriticism: 10,
        softScoreTeamBuilding: 8,
        softScoreExternalLiaison: 11,
        softScoreExternalPromotion: 8,
        softScoreCompanyManagement: 7,
        softScoreDepartmentManagement: 9,

        performanceScore: 84,
        annualSummaryView: '可查看',
      },
      {
        userId: 103,
        year: 2025,
        name: '王五',
        department: '法务事业部',
        position: '顾问',
        region: '华北',
        field: '法务',

        billingAmountDeveloper: '¥520,000',
        billingAmountCoordinator: '¥410,000',
        billingAmountOwner: '¥980,000',
        billingAmountGroup: '¥1,650,000',
        billingAmountUndertake: '¥720,000',

        devSameFieldCustomers: 9,
        devSameFieldBillingAmount: '¥260,000',
        devCrossFieldCustomers: 3,
        devCrossFieldBillingAmount: '¥120,000',
        devExistingCustomerCrossField: 2,

        coordinationBillingAmount: '¥300,000',
        coordinationCollectionStatus: '一般',
        coordinationYearUp: '¥80,000',
        coordinationYearDown: '¥30,000',

        ownerCustomerCount: 14,
        ownerBillingAmount: '¥760,000',
        ownerCaseCount: 24,
        ownerCollectionRate: '85%',
        ownerYearUp: '¥150,000',
        ownerYearDown: '¥60,000',
        ownerCaseCost: '¥110,000',
        ownerLaborCost: '¥90,000',
        ownerClientContacts: 32,
        ownerDirectClientContacts: 12,

        groupCustomerCount: 28,
        groupCaseCount: 50,
        groupCollectionRate: '84%',
        groupBillingBefore: '¥1,420,000',
        groupBillingAfter: '¥1,560,000',

        undertakeCustomerCount: 18,
        undertakeBillingAmount: '¥640,000',
        undertakeCaseCount: 38,
        undertakeWorkHours: '760h',
        undertakeCaseCost: '¥120,000',
        undertakeLaborCost: '¥85,000',

        participantCustomerCount: 12,
        participantActivityCount: 6,
        participantClientPeopleCount: 20,

        attendanceTotalHours: '1,720h',
        attendanceAvgDailyHours: '6.9h',
        leaveDays: 12,
        businessTripDays: 7,

        hardScoreDeveloper: 76,
        hardScoreCoordinator: 74,
        hardScoreOwner: 79,
        hardScoreGroup: 77,
        hardScoreUndertake: 75,
        hardScoreParticipant: 72,

        softCountPraiseCriticism: 3,
        softCountTeamBuilding: 2,
        softCountExternalLiaison: 4,
        softCountExternalPromotion: 3,
        softCountCompanyManagement: 1,
        softCountDepartmentManagement: 2,

        softScorePraiseCriticism: 8,
        softScoreTeamBuilding: 7,
        softScoreExternalLiaison: 9,
        softScoreExternalPromotion: 7,
        softScoreCompanyManagement: 6,
        softScoreDepartmentManagement: 7,

        performanceScore: 78,
        annualSummaryView: '可查看',
      },
    ];
    if (filtersRes?.success === true && filtersRes.data && Object.keys(filtersRes.data || {}).length > 0) {
      teamFiltersData.value = filtersRes.data;
    } else {
      teamFiltersData.value = fallbackFilters;
    }

    if (teamFiltersData.value) {
      // 初始化筛选器
      if (!teamFilters.value.year) {
        teamFilters.value = {
          year: `${teamFiltersData.value.years[teamFiltersData.value.years.length - 1]} 年`,
          region: teamFiltersData.value.regions[0] || '全部',
          department: teamFiltersData.value.departments[0] || '全部',
          position: '全部',
          field: '全部',
        };
      }
    }

    // 从筛选条件中提取年份数字（如果 teamFilters.value.year 是字符串格式）
    let yearValue = activeYear.value;
    if (teamFilters.value.year && typeof teamFilters.value.year === 'string') {
      const yearMatch = teamFilters.value.year.match(/\d+/);
      if (yearMatch) {
        yearValue = parseInt(yearMatch[0], 10);
      }
    }

    // 加载团队数据
    let teamRes = null;
    try {
      teamRes = await getTeamData({
        year: yearValue,
        region: teamFilters.value.region === '全部' ? undefined : teamFilters.value.region,
        department: teamFilters.value.department === '全部' ? undefined : teamFilters.value.department,
        position: teamFilters.value.position === '全部' ? undefined : teamFilters.value.position,
        field: teamFilters.value.field === '全部' ? undefined : teamFilters.value.field,
        excludeUserIds: pinnedUserIds.value.length > 0 ? [...pinnedUserIds.value] : undefined,
        currentUserIds: (() => {
          const pinnedSet = new Set(pinnedUserIds.value.map((id) => String(id)));
          const ids = teamRows.value
            .filter((row) => !pinnedSet.has(String(row.userId)))
            .map((row) => row.userId);
          return ids.length > 0 ? ids : undefined;
        })(),
      });
    } catch (error) {
      console.error('团队评估数据请求失败，使用本地默认数据:', error);
    }
    console.log('团队评估数据请求参数:', {
      year: yearValue,
      region: teamFilters.value.region,
      department: teamFilters.value.department,
      position: teamFilters.value.position,
      field: teamFilters.value.field,
      excludeUserIds: pinnedUserIds.value,
      currentUserIds: teamRows.value
        .filter((row) => !new Set(pinnedUserIds.value.map((id) => String(id))).has(String(row.userId)))
        .map((row) => row.userId),
    });
    if (teamRes && teamRes.success === true) {
      const incomingRows = teamRes.data.rows || [];
      const removeUserIds = Array.isArray(teamRes.data.removeUserIds)
        ? teamRes.data.removeUserIds
        : [];
      const removeSet = new Set(removeUserIds.map((id) => String(id)));
      const pinnedSet = new Set(pinnedUserIds.value.map((id) => String(id)));

      // 先移除本地已有但不再符合筛选的人员（不移除钉住人员）
      if (removeSet.size > 0) {
        teamRows.value = teamRows.value.filter(
          (row) => !removeSet.has(String(row.userId)) || pinnedSet.has(String(row.userId))
        );
      }

      // 再追加后端返回的新增人员（避免重复）
      if (incomingRows.length > 0) {
        const existingIds = new Set(teamRows.value.map((row) => String(row.userId)));
        const toAdd = incomingRows.filter((row) => !existingIds.has(String(row.userId)));
        teamRows.value = [...teamRows.value, ...toAdd];
      }
    } else {
      // 接口失败时使用本地临时数据（按筛选条件过滤）
      const localFiltered = fallbackTeamRows.filter((row) => {
        if (yearValue && row.year && Number(row.year) !== Number(yearValue)) return false;
        if (teamFilters.value.region && teamFilters.value.region !== '全部' && row.region !== teamFilters.value.region) return false;
        if (teamFilters.value.department && teamFilters.value.department !== '全部' && row.department !== teamFilters.value.department) return false;
        if (teamFilters.value.position && teamFilters.value.position !== '全部' && row.position !== teamFilters.value.position) return false;
        if (teamFilters.value.field && teamFilters.value.field !== '全部' && row.field !== teamFilters.value.field) return false;
        return true;
      });
      teamRows.value = localFiltered;
      console.error('团队评估数据加载失败:', teamRes?.message || teamRes);
    }

    // 加载对比维度分组
    const groupsRes = await getTeamCompareGroups();
    if (groupsRes.success === true) {
      teamCompareGroupsData.value = groupsRes.data;
    }
  } catch (error) {
    console.error('加载团队评估数据失败:', error);
  }
};

const canEditSoft = computed(() => {
  const permissions = store.state.user.permissions || [];
  const hasPermission530 = permissions.includes(530);
  return Boolean(hasPermission530 && hasSoftEditPermission.value);
});

const canEditSummary = computed(() => {
  const permissions = store.state.user.permissions || [];
  const hasPermission531 = permissions.includes(531);
  const currentUserId = store.state.user.userId || store.getters?.userId;
  const viewUserId = personalInfo.value?.userId || personalInfo.value?.id;
  const sameUser = currentUserId && viewUserId && Number(currentUserId) === Number(viewUserId);
  return Boolean(hasPermission531 && hasSoftEditPermission.value && sameUser);
});

watch(activeYear, async (next) => {
  if (!next) return;
  if (partnerYear.value !== next) {
    partnerYear.value = next;
  }
  // 如果没有权限，不加载数据
  if (tabs.value.length === 0) return;
  
  // 如果权限检查失败，关闭编辑状态
  if (!canEditSoft.value) {
    isEditingSoft.value = false;
  }
  
  // 年份变化时重新加载数据 - 优先加载当前显示的标签页数据
  // 检查是否有个人绩效tab
  const hasPersonalTab = tabs.value.some(t => t.key === 'personal');
  
  if (activeTab.value === 'partner') {
    // 当前显示合伙人分析，先加载合伙人数据
    await loadPartnerData();
  } else if (activeTab.value === 'team') {
    // 当前显示团队分析，先加载团队数据
    await loadTeamData();
  } else if (activeTab.value === 'personal' && hasPersonalTab) {
    // 当前显示个人绩效，只有在有个人绩效tab时才加载
    await loadPersonalData();
  }
});

watch(partnerYear, (newYear) => {
  if (!newYear) return;
  if (activeYear.value !== newYear) {
    activeYear.value = newYear;
  }
});

watch(activeTab, async (tab) => {
  if (!activeYear.value) return;
  // 如果没有权限，不加载数据
  if (tabs.value.length === 0) return;
  
  // 检查是否有个人绩效tab
  const hasPersonalTab = tabs.value.some(t => t.key === 'personal');
  
  if (tab === 'personal') {
    // 只有在有个人绩效tab时才加载数据
    if (hasPersonalTab) {
      await loadPersonalData();
    }
  } else if (tab === 'partner') {
    // 初始化合伙人分析年份（如果还没有设置）
    if (!partnerYear.value && yearOptions.value.length > 0) {
      partnerYear.value = activeYear.value ?? yearOptions.value[yearOptions.value.length - 1];
    }
    await loadPartnerData();
  } else if (tab === 'team') {
    await loadTeamData();
  }
});

// 监听合伙人分析年份变化，重新加载数据
watch(partnerYear, async (newYear) => {
  if (!newYear) return;
  // 只有在合伙人分析tab激活时才重新加载
  if (activeTab.value === 'partner' && tabs.value.length > 0) {
    await loadPartnerData();
  }
});

// 已移除：硬性和软性指标现在是独立的卡片，不再需要切换

watch(tableRole, async () => {
  if (activeTab.value === 'partner' && tabs.value.length > 0) {
    // 切换角色时，只重新加载表格数据
    await loadPartnerTableData(partnerYear.value);
  }
});

watch(teamFilters, async (newFilters) => {
  if (activeTab.value === 'team' && activeYear.value && tabs.value.length > 0) {
    // 如果年份筛选条件变化，更新 activeYear
    if (newFilters.year && typeof newFilters.year === 'string') {
      const yearMatch = newFilters.year.match(/\d+/);
      if (yearMatch) {
        const yearNum = parseInt(yearMatch[0], 10);
        if (yearNum !== activeYear.value) {
          activeYear.value = yearNum;
          // activeYear 变化会触发 loadTeamData，这里不需要再次调用
          return;
        }
      }
    }
    await loadTeamData();
  }
}, { deep: true });

const showEditButton = computed(() => !!activeYear.value);

const defaultPartnerProfile = {
  name: "",
  title: "",
  department: "",
  region: "",
  group: "",
  fields: [],
  tags: [],
};

const activePartner = ref({ ...defaultPartnerProfile });
const drawerOpen = ref(false);
const drawerLoading = ref(false);

// 雷达图部门和人员数据（从 queryDepartment 接口获取）
const radarDepartmentData = ref([]);
// 示例数据结构: [{ department: '部门名称', partners: [{ userId: 'xxx', name: '人员名称' }] }]

const activePartnerPerformance = computed(() => {
  const perf = personalPerformance.value;
  if (!perf) return null;
  return {
    ...perf,
    user: {
      ...perf.user,
      name: activePartner.value.name,
      department: activePartner.value.department,
      region: activePartner.value.region,
      // 重要：覆盖 userId，确保查看他人绩效时使用正确的 userId
      userId: activePartner.value.userId,
    },
  };
});

const toggleEdit = async () => {
  // 如果当前是编辑状态，直接关闭编辑
  if (isEditingSoft.value) {
    isEditingSoft.value = false;
    return;
  }
  
  // 如果要打开编辑，先检查权限
  try {
    const res = await getSoftMetricEditPermission({ year: activeYear.value });
    if (res.success) {
      // 有权限，允许编辑
      isEditingSoft.value = true;
    } else {
      // 没有权限，显示提示信息
      ElMessage({
        message: res.message || '没有编辑权限',
        type: 'warning',
        duration: 3000,
      });
    }
  } catch (error) {
    console.error('检查编辑权限失败:', error);
    ElMessage({
      message: '检查编辑权限失败，请稍后重试',
      type: 'error',
      duration: 3000,
    });
  }
};

const teamCompareGroups = computed(() => {
  if (teamCompareGroupsData.value && teamCompareGroupsData.value.length > 0) {
    return teamCompareGroupsData.value;
  }
  // 如果 API 数据未加载，返回默认结构
  return [
    {
      title: "账单金额",
      items: [
        { label: "客户开发人", key: "billingAmountDeveloper" },
        { label: "客户协调人", key: "billingAmountCoordinator" },
        { label: "客户负责人", key: "billingAmountOwner" },
        { label: "客户组", key: "billingAmountGroup" },
        { label: "承办组", key: "billingAmountUndertake" },
      ],
    },
    {
      title: "客户开发人",
      items: [
        { label: "本领域开发客户", key: "devSameFieldCustomers" },
        { label: "本领域开发客户账单额", key: "devSameFieldBillingAmount" },
        { label: "跨领域开发", key: "devCrossFieldCustomers" },
        { label: "跨领域开发账单额", key: "devCrossFieldBillingAmount" },
        { label: "现有客户跨领域开发", key: "devExistingCustomerCrossField" },
      ],
    },
    {
      title: "客户协调人",
      items: [
        { label: "协调客户账单额", key: "coordinationBillingAmount" },
        { label: "回款情况", key: "coordinationCollectionStatus" },
        { label: "年业绩上涨", key: "coordinationYearUp" },
        { label: "年业绩下降", key: "coordinationYearDown" },
      ],
    },
    {
      title: "客户负责人",
      items: [
        { label: "客户数", key: "ownerCustomerCount" },
        { label: "账单额", key: "ownerBillingAmount" },
        { label: "案量", key: "ownerCaseCount" },
        { label: "回款率", key: "ownerCollectionRate" },
        { label: "年业绩上涨", key: "ownerYearUp" },
        { label: "年业绩下降", key: "ownerYearDown" },
        { label: "案内费用", key: "ownerCaseCost" },
        { label: "人力成本", key: "ownerLaborCost" },
        { label: "客户联络", key: "ownerClientContacts" },
        { label: "直接联系客户方人员", key: "ownerDirectClientContacts" },
      ],
    },
    {
      title: "客户组",
      items: [
        { label: "客户数", key: "groupCustomerCount" },
        { label: "案量", key: "groupCaseCount" },
        { label: "回款率", key: "groupCollectionRate" },
        { label: "分配前账单额", key: "groupBillingBefore" },
        { label: "分配后账单额", key: "groupBillingAfter" },
      ],
    },
    {
      title: "承办组",
      items: [
        { label: "客户数", key: "undertakeCustomerCount" },
        { label: "账单额", key: "undertakeBillingAmount" },
        { label: "案量", key: "undertakeCaseCount" },
        { label: "承办组工时", key: "undertakeWorkHours" },
        { label: "案内费用", key: "undertakeCaseCost" },
        { label: "人力成本", key: "undertakeLaborCost" },
      ],
    },
    {
      title: "客户参与人",
      items: [
        { label: "参与客户数量", key: "participantCustomerCount" },
        { label: "参与活动次数", key: "participantActivityCount" },
        { label: "参与的客户方人员", key: "participantClientPeopleCount" },
      ],
    },
    {
      title: "个人考勤",
      items: [
        { label: "年度累计在岗时长", key: "attendanceTotalHours" },
        { label: "年度平均在岗日时长", key: "attendanceAvgDailyHours" },
        { label: "休假天数", key: "leaveDays" },
        { label: "出差天数", key: "businessTripDays" },
      ],
    },
    {
      title: "硬性指标绩效分数",
      items: [
        { label: "客户开发人", key: "hardScoreDeveloper" },
        { label: "客户协调人", key: "hardScoreCoordinator" },
        { label: "客户负责人", key: "hardScoreOwner" },
        { label: "客户组", key: "hardScoreGroup" },
        { label: "承办组", key: "hardScoreUndertake" },
        { label: "客户参与人", key: "hardScoreParticipant" },
      ],
    },
    {
      title: "软性指标（条数）",
      items: [
        { label: "客户表扬与批评", key: "softCountPraiseCriticism" },
        { label: "团队建设", key: "softCountTeamBuilding" },
        { label: "对外联络", key: "softCountExternalLiaison" },
        { label: "对外宣传", key: "softCountExternalPromotion" },
        { label: "参与公司管理工作", key: "softCountCompanyManagement" },
        { label: "参与部门管理工作", key: "softCountDepartmentManagement" },
      ],
    },
    {
      title: "软性指标绩效分数",
      items: [
        { label: "客户表扬与批评", key: "softScorePraiseCriticism" },
        { label: "团队建设", key: "softScoreTeamBuilding" },
        { label: "对外联络", key: "softScoreExternalLiaison" },
        { label: "对外宣传", key: "softScoreExternalPromotion" },
        { label: "参与公司管理工作", key: "softScoreCompanyManagement" },
        { label: "参与部门管理工作", key: "softScoreDepartmentManagement" },
      ],
    },
    {
      title: "绩效分数",
      items: [
        { label: "绩效分数", key: "performanceScore" },
      ],
    },
    {
      title: "个人年度总结补充",
      items: [
        { label: "总结查看", key: "annualSummaryView" },
      ],
    },
  ];
});

const filteredTeamRows = computed(() => {
  // 数据已经在 API 层面过滤，直接返回
  return teamRows.value || [];
});

const pinnedPeople = computed(() => pinnedUserIds.value
  .map((id) => pinnedPeopleMap.value[id])
  .filter(Boolean));

const comparePeople = computed(() => {
  const pinned = pinnedPeople.value;
  const pinnedIdSet = new Set(pinned.map(person => String(person.userId)));
  const others = filteredTeamRows.value.filter(person => !pinnedIdSet.has(String(person.userId)));
  return [...pinned, ...others].slice(0, 10);
});

const isPinned = (person) => {
  if (!person || person.userId === undefined || person.userId === null) return false;
  return pinnedUserIds.value.includes(person.userId);
};

const togglePin = (person) => {
  if (!person || person.userId === undefined || person.userId === null) return;
  const id = person.userId;
  const exists = pinnedUserIds.value.includes(id);
  if (exists) {
    pinnedUserIds.value = pinnedUserIds.value.filter(item => item !== id);
    const nextMap = { ...pinnedPeopleMap.value };
    delete nextMap[id];
    pinnedPeopleMap.value = nextMap;
    return;
  }
  pinnedUserIds.value = [...pinnedUserIds.value, id];
  pinnedPeopleMap.value = { ...pinnedPeopleMap.value, [id]: person };
};

const getTeamValue = (person, group, itemKey) => {
  if (!person) return '--';
  return person[itemKey] ?? '--';
};

// 雷达图部门选项（从 radarDepartmentData 获取）
const radarDepartmentOptions = computed(() => {
  return radarDepartmentData.value.map(item => item.deptName);
});

const selectedDepartment = ref("");

// 当雷达图部门选项加载后，设置默认选中第一个部门（用于硬性和软性指标）
watch(
  radarDepartmentOptions,
  (options) => {
    if (options.length > 0) {
      // 硬性指标默认值
      if (!hardSelectedDepartment.value) {
        hardSelectedDepartment.value = options[0];
        hardTempSelectedDepartment.value = options[0];
        const employees = radarDepartmentData.value.find(item => item.deptName === options[0])?.employees || [];
        hardSelectedPartners.value = employees.map(p => p.userId);
        hardTempSelectedPartners.value = [...hardSelectedPartners.value];
      }
      // 软性指标默认值
      if (!softSelectedDepartment.value) {
        softSelectedDepartment.value = options[0];
        softTempSelectedDepartment.value = options[0];
        const employees = radarDepartmentData.value.find(item => item.deptName === options[0])?.employees || [];
        softSelectedPartners.value = employees.map(p => p.userId);
        softTempSelectedPartners.value = [...softSelectedPartners.value];
      }
      // 兼容旧代码
      if (!selectedDepartment.value) {
        selectedDepartment.value = options[0];
      }
    }
  },
  { immediate: true }
);

// 已移除：不再使用统一的 radarData，改为 hardRadarData 和 softRadarData
const normalizeRadarSeries = (data) => {
  if (!data) return { indicators: [], series: [] };
  const indicators = Array.isArray(data.indicators) ? data.indicators : [];
  const indicatorLength = indicators.length;
  const series = Array.isArray(data.series) ? data.series : [];
  const normalizedSeries = series.map((item) => {
    const rawValue = item?.value;
    let valueList = [];
    if (Array.isArray(rawValue)) {
      valueList = rawValue.map((val) => Number(val) || 0);
    } else if (rawValue !== undefined && rawValue !== null) {
      valueList = Array.from({ length: indicatorLength }, () => Number(rawValue) || 0);
    } else {
      valueList = Array.from({ length: indicatorLength }, () => 0);
    }
    if (indicatorLength > 0) {
      if (valueList.length < indicatorLength) {
        valueList = valueList.concat(Array.from({ length: indicatorLength - valueList.length }, () => 0));
      } else if (valueList.length > indicatorLength) {
        valueList = valueList.slice(0, indicatorLength);
      }
    }
    return {
      ...item,
      value: valueList,
    };
  });
  return {
    ...data,
    indicators,
    series: normalizedSeries,
  };
};

// 硬性指标雷达图配置
const hardRadarConfig = computed(() => {
  if (!hardRadarData.value) return { indicators: [], series: [] };
  return {
    indicators: hardRadarData.value.indicators || [],
    series: hardRadarData.value.series || [],
  };
});

// 软性指标雷达图配置
const softRadarConfig = computed(() => {
  if (!softRadarData.value) return { indicators: [], series: [] };
  return {
    indicators: softRadarData.value.indicators || [],
    series: softRadarData.value.series || [],
  };
});

// 硬性指标临时部门对应的人员选项（用于筛选弹窗）
const hardTempPartnerOptions = computed(() => {
  const currentDept = hardTempSelectedDepartment.value;
  const deptData = radarDepartmentData.value.find(item => item.deptName === currentDept);
  return deptData?.employees || [];
});

// 软性指标临时部门对应的人员选项（用于筛选弹窗）
const softTempPartnerOptions = computed(() => {
  const currentDept = softTempSelectedDepartment.value;
  const deptData = radarDepartmentData.value.find(item => item.deptName === currentDept);
  return deptData?.employees || [];
});

const isHardAllSelected = computed(() => {
  const ids = hardTempPartnerOptions.value.map(p => p.userId);
  if (ids.length === 0) return false;
  return ids.every(id => hardTempSelectedPartners.value.includes(id));
});

const isSoftAllSelected = computed(() => {
  const ids = softTempPartnerOptions.value.map(p => p.userId);
  if (ids.length === 0) return false;
  return ids.every(id => softTempSelectedPartners.value.includes(id));
});

const toggleHardSelectAll = () => {
  hardTempSelectionMode.value = "custom";
  const ids = hardTempPartnerOptions.value.map(p => p.userId);
  if (ids.length == 0) return;
  hardTempSelectedPartners.value = isHardAllSelected.value ? [] : [...ids];
};

const toggleSoftSelectAll = () => {
  softTempSelectionMode.value = "custom";
  const ids = softTempPartnerOptions.value.map(p => p.userId);
  if (ids.length == 0) return;
  softTempSelectedPartners.value = isSoftAllSelected.value ? [] : [...ids];
};

// 硬性指标筛选函数
const toggleHardTempPartner = (userId) => {
  hardTempSelectionMode.value = "custom";
  if (hardTempSelectedPartners.value.includes(userId)) {
    hardTempSelectedPartners.value = hardTempSelectedPartners.value.filter(
      (item) => item !== userId
    );
    return;
  }
  hardTempSelectedPartners.value = [...hardTempSelectedPartners.value, userId];
};

// 软性指标筛选函数
const toggleSoftTempPartner = (userId) => {
  softTempSelectionMode.value = "custom";
  if (softTempSelectedPartners.value.includes(userId)) {
    softTempSelectedPartners.value = softTempSelectedPartners.value.filter(
      (item) => item !== userId
    );
    return;
  }
  softTempSelectedPartners.value = [...softTempSelectedPartners.value, userId];
};

// 硬性指标筛选后的 series
const hardFilteredRadarSeries = computed(() => {
  const series = hardRadarConfig.value.series || [];
  if (series.length === 0) return [];
  
  if (hardSelectedPartners.value.length === 0) {
    return series;
  }
  
  const selectedIds = hardSelectedPartners.value.map(id => Number(id));
  return series.filter((item) => {
    const userId = Number(item.userId ?? item.id);
    return selectedIds.includes(userId);
  });
});

// 软性指标筛选后的 series
const softFilteredRadarSeries = computed(() => {
  const series = softRadarConfig.value.series || [];
  if (series.length === 0) return [];
  
  if (softSelectedPartners.value.length === 0) {
    return series;
  }
  
  const selectedIds = softSelectedPartners.value.map(id => Number(id));
  return series.filter((item) => {
    const userId = Number(item.userId ?? item.id);
    return selectedIds.includes(userId);
  });
});

// 硬性指标摘要
const hardRadarSummary = computed(() => {
  if (hardTempSelectionMode.value === "department") {
    const dept = hardSelectedDepartment.value || radarDepartmentOptions.value[0] || "";
    return `按${dept}部门人员`;
  }
  return "自定义人员";
});

// 软性指标摘要
const softRadarSummary = computed(() => {
  if (softTempSelectionMode.value === "department") {
    const dept = softSelectedDepartment.value || radarDepartmentOptions.value[0] || "";
    return `按${dept}部门人员`;
  }
  return "自定义人员";
});

// 应用硬性指标筛选
const applyHardRadarFilters = async () => {
  if (hardTempSelectionMode.value === "custom" && hardTempSelectedPartners.value.length === 0) {
    ElMessage.warning("请至少选择一名人员");
    return;
  }
  hardSelectedDepartment.value = hardTempSelectedDepartment.value;
  if (hardTempSelectionMode.value === "department") {
    const employees = radarDepartmentData.value.find(item => item.deptName === hardTempSelectedDepartment.value)?.employees || [];
    hardSelectedPartners.value = employees.map(p => p.userId);
  } else {
    hardSelectedPartners.value = [...hardTempSelectedPartners.value];
  }
  hardRadarFilterOpen.value = false;
  await loadHardRadarData();
};

// 应用软性指标筛选
const applySoftRadarFilters = async () => {
  if (softTempSelectionMode.value === "custom" && softTempSelectedPartners.value.length === 0) {
    ElMessage.warning("请至少选择一名人员");
    return;
  }
  softSelectedDepartment.value = softTempSelectedDepartment.value;
  if (softTempSelectionMode.value === "department") {
    const employees = radarDepartmentData.value.find(item => item.deptName === softTempSelectedDepartment.value)?.employees || [];
    softSelectedPartners.value = employees.map(p => p.userId);
  } else {
    softSelectedPartners.value = [...softTempSelectedPartners.value];
  }
  softRadarFilterOpen.value = false;
  await loadSoftRadarData();
};

const rankingCategoryConfig = {
  score: { key: 'score', icon: '★', title: '绩效分排行', unit: '' },
  duration: { key: 'duration', icon: '⏱️', title: '工作时长排行', unit: '' }
};

// 过滤掉客户经营情况排行榜，并保证默认卡片显示
const filteredRankingList = computed(() => {
  const base = rankingList.value.filter(category => category.key !== 'revenue');
  const presentKeys = new Set(base.map(item => item.key));
  return ['score', 'duration'].map((key) => {
    if (presentKeys.has(key)) {
      return base.find(item => item.key === key);
    }
    return {
      ...rankingCategoryConfig[key],
      list: []
    };
  });
});

// 硬性指标筛选弹窗打开时的处理
watch(hardRadarFilterOpen, async (open) => {
  if (!open) return;
  
  if (radarDepartmentData.value.length === 0) {
    try {
      if (!partnerYear.value) {
        partnerYear.value = activeYear.value ?? (yearOptions.value.length > 0 ? yearOptions.value[yearOptions.value.length - 1] : new Date().getFullYear());
      }
      const deptRes = await queryDepartment({ year: partnerYear.value });
      
      if (deptRes.success === true) {
        let departments = [];
        if (Array.isArray(deptRes.data)) {
          departments = deptRes.data;
        } else if (deptRes.data?.departments) {
          departments = deptRes.data.departments;
        }
        
        if (departments.length > 0) {
          radarDepartmentData.value = departments;
          
          if (!hardSelectedDepartment.value) {
            const firstDept = departments[0];
            hardSelectedDepartment.value = firstDept.deptName;
            hardTempSelectedDepartment.value = firstDept.deptName;
            const partnerIds = firstDept.employees?.map(p => p.userId) || [];
            hardSelectedPartners.value = partnerIds;
            hardTempSelectedPartners.value = [...partnerIds];
          }
        }
      }
    } catch (error) {
      console.error('打开硬性指标筛选弹窗时加载部门数据失败:', error);
    }
  }
  
  hardTempSelectedDepartment.value = hardSelectedDepartment.value;
  hardTempSelectedPartners.value = [...hardSelectedPartners.value];
});

// 软性指标筛选弹窗打开时的处理
watch(softRadarFilterOpen, async (open) => {
  if (!open) return;
  
  if (radarDepartmentData.value.length === 0) {
    try {
      if (!partnerYear.value) {
        partnerYear.value = activeYear.value ?? (yearOptions.value.length > 0 ? yearOptions.value[yearOptions.value.length - 1] : new Date().getFullYear());
      }
      const deptRes = await queryDepartment({ year: partnerYear.value });
      
      if (deptRes.success === true) {
        let departments = [];
        if (Array.isArray(deptRes.data)) {
          departments = deptRes.data;
        } else if (deptRes.data?.departments) {
          departments = deptRes.data.departments;
        }
        
        if (departments.length > 0) {
          radarDepartmentData.value = departments;
          
          if (!softSelectedDepartment.value) {
            const firstDept = departments[0];
            softSelectedDepartment.value = firstDept.deptName;
            softTempSelectedDepartment.value = firstDept.deptName;
            const partnerIds = firstDept.employees?.map(p => p.userId) || [];
            softSelectedPartners.value = partnerIds;
            softTempSelectedPartners.value = [...partnerIds];
          }
        }
      }
    } catch (error) {
      console.error('打开软性指标筛选弹窗时加载部门数据失败:', error);
    }
  }
  
  softTempSelectedDepartment.value = softSelectedDepartment.value;
  softTempSelectedPartners.value = [...softSelectedPartners.value];
});

// 硬性指标切换部门时，更新人员列表
watch(hardTempSelectedDepartment, (newDept) => {
  hardTempSelectionMode.value = "department";
  const employees = radarDepartmentData.value.find(item => item.deptName === newDept)?.employees || [];
  hardTempSelectedPartners.value = employees.map(p => p.userId);
});

// 软性指标切换部门时，更新人员列表
watch(softTempSelectedDepartment, (newDept) => {
  softTempSelectionMode.value = "department";
  const employees = radarDepartmentData.value.find(item => item.deptName === newDept)?.employees || [];
  softTempSelectedPartners.value = employees.map(p => p.userId);
});

// rankingList 已经在 loadPartnerData 中加载

// 格式化金额显示
const formatTableRevenue = (amount) => {
  if (amount === null || amount === undefined || amount === 0) {
    return '¥0.00';
  }
  const num = Number(amount);
  if (num >= 100000000) {
    return `¥${(num / 100000000).toFixed(2)}亿`;
  } else if (num >= 10000) {
    return `¥${(num / 10000).toFixed(2)}万`;
  } else {
    return `¥${num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
};


// 根据选择的角度获取表格数据
const currentPartnerRows = computed(() => {
  // 接口直接返回数组，不是 { rows: [...] } 格式
  const data = partnerTableData.value;
  if (!data) {
    return [];
  }
  // 兼容两种格式：直接数组或 { rows: [...] }
  const rows = Array.isArray(data) ? data : (data.rows || []);
  return rows.map((item, index) => ({
    rank: index + 1,
    ...item,
    performanceScore: item.performanceScore ?? item.score ?? null,
    // 格式化账单额显示
    revenue: formatTableRevenue(item.revenue),
    // 保留原始数值用于排序
    _rawRevenue: item.revenue || 0,
  }));
});

const sortKey = ref("developerbillAmount");
const sortOrder = ref("desc");

const setSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
    return;
  }
  sortKey.value = key;
  sortOrder.value = "desc";
};

const getSortClass = (key) => {
  if (sortKey.value !== key) return "sort-none";
  return sortOrder.value === "asc" ? "sort-asc" : "sort-desc";
};

const getSortValue = (row, key) => {
  // 对于金额字段，直接使用原始数值排序
  const amountFields = ['developerbillAmount', 'coordinatorbillAmount', 'ownerbillAmount', 'groupbillAmount', 'undertakerbillAmount'];
  if (amountFields.includes(key)) {
    return row[key] || 0;
  }
  if (key === 'score') {
    const scoreValue = row.performanceScore ?? row.score;
    return scoreValue === null || scoreValue === undefined ? 0 : Number(scoreValue);
  }
  const value = row[key];
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  const text = String(value);
  if (key === "name") return text;
  const num = Number.parseFloat(text.replace(/[^\d.]/g, ""));
  return Number.isNaN(num) ? text : num;
};

const sortedPartnerRows = computed(() => {
  const rows = [...currentPartnerRows.value];
  rows.sort((a, b) => {
    const av = getSortValue(a, sortKey.value);
    const bv = getSortValue(b, sortKey.value);
    if (typeof av === "string" || typeof bv === "string") {
      return sortOrder.value === "asc"
        ? String(av).localeCompare(String(bv), "zh")
        : String(bv).localeCompare(String(av), "zh");
    }
    return sortOrder.value === "asc" ? av - bv : bv - av;
  });
  return rows;
});

watch(sortedPartnerRows, async () => {
  await scrollToCurrentSearchMatch();
});



// 加载指定合伙人的完整个人绩效数据
const loadPartnerDetailData = async (userId) => {
  drawerLoading.value = true;
  if (!activeYear.value || !userId) {
    drawerLoading.value = false;
    return;
  }
  
  try {
    console.log('加载合伙人详情，userId:', userId, '年份:', activeYear.value);
    
    // 并行加载所有个人绩效数据，传递 userId 参数
    const [infoRes, hardRes, ownerRes, groupRes, undertakeRes, participantRes, attendanceRes, scoreBreakdownRes] = await Promise.all([
      getPersonalInfo({ year: activeYear.value, userId }),
      getHardMetrics({ year: activeYear.value, userId }),
      getHardMetrics({ year: activeYear.value, userId, type: 'customer-owner' }),
      getHardMetrics({ year: activeYear.value, userId, type: 'customer-group' }),
      getHardMetrics({ year: activeYear.value, userId, type: 'undertake' }),
      getHardMetrics({ year: activeYear.value, userId, type: 'participants' }),
      getHardMetrics({ year: activeYear.value, userId, type: 'attendance' }),
      getHardMetrics({ year: activeYear.value, userId, type: 'scoreBreakdown' }),
    ]);
    
    // 更新个人信息
    if (infoRes.success === true && Array.isArray(infoRes.data) && infoRes.data.length > 0) {
      personalInfo.value = infoRes.data[0];
      const info = infoRes.data[0];
      activePartner.value = {
        ...activePartner.value,
        name: info.name || activePartner.value.name,
        region: info.region || activePartner.value.region,
        department: info.department || activePartner.value.department,
        group: info.group || activePartner.value.group,
      };
    }
    
    // 适配硬性指标数据格式
    if (hardRes.success === true && hardRes.data) {
      hardMetrics.value = adaptHardMetricsData(hardRes.data);
      
      // 处理各个模块数据
      if (ownerRes.success === true && ownerRes.data) {
        const ownerModule = adaptCustomerOwnerData(ownerRes.data);
        ownerModule.type = 'customer-owner';
        if (!hardMetrics.value.modules) hardMetrics.value.modules = [];
        const existingIndex = hardMetrics.value.modules.findIndex(m => m && m.type === 'customer-owner');
        if (existingIndex >= 0) {
          hardMetrics.value.modules[existingIndex] = ownerModule;
        } else {
          hardMetrics.value.modules.push(ownerModule);
        }
      }
      
      if (groupRes.success === true && groupRes.data) {
        const groupModule = adaptCustomerGroupData(groupRes.data);
        groupModule.type = 'customer-group';
        if (!hardMetrics.value.modules) hardMetrics.value.modules = [];
        const existingIndex = hardMetrics.value.modules.findIndex(m => m && m.type === 'customer-group');
        if (existingIndex >= 0) {
          hardMetrics.value.modules[existingIndex] = groupModule;
        } else {
          hardMetrics.value.modules.push(groupModule);
        }
      }
      
      if (undertakeRes.success === true && undertakeRes.data) {
        const undertakeModuleData = adaptUndertakeData(undertakeRes.data);
        undertakeModuleData.type = 'undertake';
        if (!hardMetrics.value.modules) hardMetrics.value.modules = [];
        const existingIndex = hardMetrics.value.modules.findIndex(m => m && m.type === 'undertake');
        if (existingIndex >= 0) {
          hardMetrics.value.modules[existingIndex] = undertakeModuleData;
        } else {
          hardMetrics.value.modules.push(undertakeModuleData);
        }
      }
      
      if (participantRes.success === true && participantRes.data) {
        const participantModuleData = adaptParticipantData(participantRes.data);
        participantModuleData.type = 'participant';
        if (!hardMetrics.value.modules) hardMetrics.value.modules = [];
        const existingIndex = hardMetrics.value.modules.findIndex(m => m && m.type === 'participant');
        if (existingIndex >= 0) {
          hardMetrics.value.modules[existingIndex] = participantModuleData;
        } else {
          hardMetrics.value.modules.push(participantModuleData);
        }
      }
      
      if (attendanceRes.success === true && attendanceRes.data) {
        const attendanceModuleData = adaptAttendanceData(attendanceRes.data);
        attendanceModuleData.type = 'attendance';
        if (!hardMetrics.value.modules) hardMetrics.value.modules = [];
        const existingIndex = hardMetrics.value.modules.findIndex(m => m && m.type === 'attendance');
        if (existingIndex >= 0) {
          hardMetrics.value.modules[existingIndex] = attendanceModuleData;
        } else {
          hardMetrics.value.modules.push(attendanceModuleData);
        }
      }
      
      if (scoreBreakdownRes.success === true && scoreBreakdownRes.data) {
        const scoreBreakdown = adaptScoreBreakdownData(scoreBreakdownRes.data);
        if (scoreBreakdown.length > 0) {
          hardMetrics.value.scoreBreakdown = scoreBreakdown;
          hardMetrics.value.scoreTotal = scoreBreakdown.reduce((sum, item) => sum + (item.score || 0), 0);
        }
      }
    }
    
    // 异步加载软性指标数据
    adaptSoftMetricsData(activeYear.value, userId).then(softMetricsData => {
      softMetrics.value = softMetricsData;
    }).catch(error => {
      console.error('加载软性指标数据失败:', error);
      softMetrics.value = {
        scoreBreakdown: [],
        total: 0,
        softMetrics: Object.values(SOFT_METRIC_KEY_MAP).map(info => ({
          key: info.key,
          title: info.title,
          description: info.description,
          records: []
        }))
      };
    });
    
  } catch (error) {
    console.error('加载合伙人详情失败:', error);
  } finally {
    drawerLoading.value = false;
  }
};

const handleRowClick = async (row) => {
  if (!row) return;
  activePartner.value = {
    ...defaultPartnerProfile,
    name: row.name,
    userId: row.userId,
    region: row.region || "",
    department: row.department || "",
    group: row.group || "",
  };
  drawerOpen.value = true;
  drawerLoading.value = true;
  
  // 重置打分权限
  drawerScorePermission.value = false;
  
  // 检查当前登录用户的打分权限（type=2）
  try {
    const res = await getSoftMetricEditPermission({ year: activeYear.value, type: 2 });
    console.log('检查弹框打分权限接口返回:', res);
    drawerScorePermission.value = res.success === true;
  } catch (error) {
    console.error('检查弹框打分权限失败:', error);
    drawerScorePermission.value = false;
  }
  
  // 加载该合伙人的完整个人绩效数据
  await loadPartnerDetailData(row.userId);
  
  // 抽屉打开后，延迟触发图表 resize（等待动画完成）
  nextTick(() => {
    setTimeout(() => {
      // 触发 window resize 事件，让图表组件自动 resize
      window.dispatchEvent(new Event('resize'));
    }, 300);
  });
};

// 监听抽屉打开，触发图表 resize
watch(drawerOpen, (isOpen) => {
  if (isOpen) {
    // 抽屉打开后，延迟触发图表 resize（等待动画完成和 DOM 渲染）
    nextTick(() => {
      setTimeout(() => {
        // 触发 window resize 事件，让图表组件自动 resize
        window.dispatchEvent(new Event('resize'));
      }, 400);
    });
  }
});

// 组件挂载时加载初始数据
onMounted(async () => {
  // 如果没有权限，不加载数据
  if (tabs.value.length === 0) return;
  
  // 预加载 type 映射表
  await loadTypeMapping();
  
  // 加载年份列表，loadYears 中设置 activeYear 会触发 watch(activeYear) 自动加载数据和权限检查
  await loadYears();
  // 注意：不需要在这里手动调用 checkEditPermission 和 loadPersonalData，因为 watch(activeYear) 会自动处理
});
</script>

<style lang="scss">
@import "./styles.scss";
</style>
