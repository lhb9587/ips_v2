<template>
  <div class="pp-panel">
    <div class="pp-hero">
      <div class="pp-hero-left">
        <div class="pp-hero-profile">
          <!-- 预加载图片，加载成功后再显示 -->
          <img
            v-if="performance.user.avatar && !avatarLoaded"
            :src="getAvatarUrl(performance.user.avatar)"
            :alt="performance.user.name"
            style="display: none;"
            @load="handleAvatarLoad"
            @error="handleAvatarError"
          />
          <!-- 图片加载成功后才显示头像 -->
          <div 
            v-if="performance.user.avatar && avatarLoaded" 
            class="pp-hero-avatar large"
          >
            <img
              :src="getAvatarUrl(performance.user.avatar)"
              :alt="performance.user.name"
            />
          </div>
          <div class="pp-hero-info">
            <div class="pp-hero-name">
              <div class="pp-hero-name-text">
                <span class="pp-hero-name-value">{{ performance.user.name }}</span>
                <span class="pp-hero-title-role">{{ performance.user.position }}</span>
              </div>
            </div>
            <div class="pp-hero-meta">
              <div class="pp-hero-meta-item">
                <span class="pp-hero-meta-label">地区</span>
                <span class="pp-hero-meta-value">{{ performance.user.region }}</span>
              </div>
              <div class="pp-hero-meta-item">
                <span class="pp-hero-meta-label">部门</span>
                <span class="pp-hero-meta-value">{{ performance.user.field }}</span>
              </div>
              <div class="pp-hero-meta-item">
                <span class="pp-hero-meta-label">组别</span>
                <span class="pp-hero-meta-value">{{ performance.user.group }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="pp-hero-metrics">
        <template v-for="metric in summaryCards" :key="metric.key">
          <div
            v-if="metric.key === 'judgments' && hasExportReportPermission"
            class="pp-hero-metric pp-hero-metric-report"
          >
            <div class="pp-hero-metric-value-row">
              <button
                type="button"
                class="pp-report-button"
                :disabled="exportingReport"
                @click.stop="exportPerformanceReport"
              >
                <i class="bx bx-download" aria-hidden="true"></i>
                {{ exportingReport ? "生成中..." : "导出报告" }}
              </button>
            </div>
          </div>
          <div
            class="pp-hero-metric"
            :class="[
              `pp-hero-metric-${metric.key}`,
              { 'pp-hero-metric-compact': ['customers', 'cases', 'appearances', 'judgments'].includes(metric.key) },
              { 'pp-hero-metric-total': metric.key === 'judgments' }
            ]"
          >
            <div class="pp-hero-metric-label">{{ metric.label }}</div>
            <div class="pp-hero-metric-value-row">
              <div class="pp-hero-metric-value">{{ formatMetricValue(metric) }}</div>
              <div
                v-if="metric.key === 'judgments' && hasScorePermission"
                class="pp-score-actions"
              >
                <button
                  type="button"
                  class="pp-score-action"
                  @click="openPerformanceScoreDialog"
                >
                  {{ performanceScoreValue === null ? '打分' : '修改' }}
                </button>
              </div>
              <div
                v-if="metric.key !== 'judgments'"
                class="pp-hero-metric-delta"
                :class="{ up: metric.delta >= 0, down: metric.delta < 0 }"
              >
                <span>{{ formatDelta(metric.delta, metric.key) }}</span>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <div class="pp-modules-grid">
      <div
        v-for="module in computedModules"
        :key="module.title"
        class="pp-module-card"
        :class="{
          wide: module.wide,
          publicity: module.type === 'publicity',
          attendance: module.type === 'attendance',
          'participant': module.title === '客户参与人',
          'undertake': module.type === 'undertake',
          'developer': module.title === '客户开发人',
        }"
      >
        <div v-if="module.type !== 'attendance'" class="pp-module-title">
          <span
            v-if="getModuleColor(module.title)"
            class="pp-module-title-indicator"
            :style="{ backgroundColor: getModuleColor(module.title) }"
          ></span>
          {{ module.title }}
        </div>
        <div v-if="isModuleEmpty(module)" class="pp-module-empty-card">
          <img src="/v2/img/nocharts.7e8b2a6a.svg" style="width: 100%; height: 130px;" alt="暂无数据" />
        </div>
        <div v-else-if="module.type === 'revenue-overview'" class="pp-revenue-overview">
          <div v-if="!module.items || module.items.length === 0" class="pp-module-empty-block">
            暂无数据
          </div>
          <div
            v-else
            v-for="item in module.items"
            :key="item.label"
            class="pp-revenue-card"
          >
            <div class="pp-revenue-label">{{ item.label }}</div>
            <div class="pp-revenue-value">{{ formatRevenueValue(item.value) }}</div>
          </div>
        </div>
        <div v-else-if="module.chartItems" class="pp-module-chart">
          <div
            v-for="item in module.chartItems"
            :key="item.label"
            class="pp-module-bar"
          >
            <div class="pp-module-bar-head">
              <span class="pp-module-bar-label">{{ item.label }}</span>
              <span class="pp-module-bar-value">{{ item.value }}</span>
            </div>
            <div class="pp-module-bar-track">
              <div
                class="pp-module-bar-fill"
                :style="{ width: `${item.percent}%` }"
              ></div>
            </div>
          </div>
        </div>
        <div v-else-if="module.type === 'coordinator'" class="pp-coordinator">
          <div class="pp-coordinator-row">
            <span class="pp-module-label">协调客户账单额</span>
            <template v-if="hasCoordinatorBillingAmount(module.billingAmount)">
              <el-popover
                placement="bottom"
                :width="300"
                trigger="click"
                :enterable="true"
                :persistent="true"
                :popper-options="{ strategy: 'fixed' }"
                popper-class="pp-client-popover-wrapper"
                @after-enter="loadCoordinatorFieldClients({ reset: false })"
              >
                <template #reference>
                  <span class="pp-coordinator-billing">
                    <span class="pp-billing-count">{{ formatBillingAmount(module.billingAmount) }}</span>
                    <!-- <span class="pp-billing-amount">({{ module.billingAmount }})</span> -->
                  </span>
                </template>
                <div class="pp-client-popover pp-client-popover--coordinator-field" @click.stop @mousedown.stop>
                  <div class="pp-client-popover-header">
                    <div class="pp-client-popover-search" @click.stop @mousedown.stop>
                      <el-input
                        v-model="coordinatorFieldSearchText"
                        placeholder="搜索客户名称"
                        size="small"
                        clearable
                        @click.stop
                        @mousedown.stop
                        @input="handleCoordinatorFieldSearchInput"
                      >
                        <template #prefix>
                          <el-icon><Search /></el-icon>
                        </template>
                      </el-input>
                    </div>
                    <div class="pp-client-popover-header-row">
                      <span class="pp-client-popover-header-item">客户名称</span>
                      <span class="pp-client-popover-header-item">账单额</span>
                    </div>
                  </div>
                  <div
                    class="pp-client-popover-body"
                    style="max-height: 300px; overflow-y: auto;"
                    @scroll="handleCoordinatorFieldScroll"
                  >
                    <div
                      v-for="client in filteredCoordinatorFieldClients"
                      :key="client.name"
                      class="pp-client-popover-row"
                    >
                      <span class="pp-client-popover-cell name">
                        <span class="pp-client-name-text">{{ client.custName || client.name }}</span>
                        <el-icon 
                          class="pp-client-popover-view-icon"
                          @click.stop="viewClientDetail('coordinator-field', client)"
                        >
                          <View />
                        </el-icon>
                      </span>
                      <span class="pp-client-popover-cell amount">{{ formatClientAmount(client.amount) || '¥0.00' }}</span>
                    </div>
                    <div v-if="filteredCoordinatorFieldClients.length === 0" class="pp-client-popover-empty">
                      暂无数据
                    </div>
                  </div>
                </div>
              </el-popover>
            </template>
            <span v-else class="pp-coordinator-billing is-disabled">
              <span class="pp-billing-count is-disabled">¥0.00</span>
            </span>
          </div>
          <div class="pp-coordinator-row">
            <span class="pp-module-label">回款情况</span>
            <span class="pp-coordinator-value">{{ module.collectionRate }}</span>
          </div>
          <div class="pp-coordinator-grid">
            <el-popover
              placement="bottom"
              :width="600"
              trigger="click"
              :enterable="true"
              :persistent="true"
              :hide-after="200"
              :show-after="100"
              :popper-options="{ strategy: 'fixed', modifiers: [{ name: 'offset', options: { offset: [0, 8] } }] }"
              popper-class="pp-coordinator-performance-popover pp-coordinator-performance-popover-up"
              @after-enter="handleCoordinatorPopoverEnter(module, 'up')"
              @after-leave="handleCoordinatorPopoverLeave('up')"
            >
              <template #reference>
                <div class="pp-coordinator-cell pp-coordinator-cell--hoverable">
                  <div class="pp-coordinator-cell-label">年业绩上涨</div>
                  <div class="pp-coordinator-cell-value positive">
                    {{ coordinatorUpClientsCount > 0 ? `${coordinatorUpClientsCount}个客户` : '--' }}
                  </div>
                </div>
              </template>
              <div class="pp-coordinator-performance-content" @click.stop @mousedown.stop>
                <div class="pp-coordinator-performance-header">
                  <span class="pp-coordinator-performance-title">年业绩上涨客户</span>
                </div>
                <div class="pp-coordinator-search" @click.stop @mousedown.stop>
                  <el-input
                    v-model="coordinatorUpSearchText"
                    placeholder="搜索客户名称"
                    size="small"
                    clearable
                    @click.stop
                    @mousedown.stop
                  >
                    <template #prefix>
                      <el-icon><Search /></el-icon>
                    </template>
                  </el-input>
                </div>
                <div class="pp-coordinator-client-header">
                  <span class="pp-coordinator-client-header-item">客户名称</span>
                  <span class="pp-coordinator-client-header-item">账单额</span>
                  <span class="pp-coordinator-client-header-item">上涨百分比</span>
                </div>
                <div
                  class="pp-coordinator-client-list"
                  style="max-height: 300px; overflow-y: auto;"
                >
                  <div
                    v-for="client in filteredCoordinatorUpClients"
                    :key="client.custId || client.name"
                    class="pp-coordinator-client-item"
                    :class="{ active: selectedCoordinatorUpClientId === (client.custId || client.name) }"
                    @click="selectCoordinatorClient('up', client)"
                  >
                    <span class="pp-coordinator-client-name">
                      {{ client.name }}
                      <el-icon 
                        class="pp-coordinator-client-view-icon"
                        @click.stop="viewClientDetail('up', client)"
                      >
                        <View />
                      </el-icon>
                    </span>
                    <span class="pp-coordinator-client-amount">{{ formatClientAmount(client.amount) || '--' }}</span>
                    <span class="pp-coordinator-client-change up">{{ client.changePercent }}</span>
                  </div>
                  <div v-if="filteredCoordinatorUpClients.length === 0" class="pp-coordinator-empty">
                    暂无数据
                  </div>
                </div>
                <div v-if="coordinatorUpPopoverReady" class="pp-coordinator-chart-container">
                  <div ref="coordinatorUpChartRef" class="pp-coordinator-chart-body" data-chart-type="coordinator-up"></div>
                  <div v-if="!selectedCoordinatorUpClientId" class="pp-coordinator-chart-placeholder">
                    请选择客户查看趋势
                  </div>
                </div>
              </div>
            </el-popover>
            <el-popover
              placement="bottom"
              :width="600"
              trigger="click"
              :enterable="true"
              :persistent="true"
              :hide-after="200"
              :show-after="100"
              :popper-options="{ strategy: 'fixed', modifiers: [{ name: 'offset', options: { offset: [0, 8] } }] }"
              popper-class="pp-coordinator-performance-popover pp-coordinator-performance-popover-down"
              @after-enter="handleCoordinatorPopoverEnter(module, 'down')"
              @after-leave="handleCoordinatorPopoverLeave('down')"
            >
              <template #reference>
                <div class="pp-coordinator-cell pp-coordinator-cell--hoverable">
                  <div class="pp-coordinator-cell-label">年业绩下降</div>
                  <div class="pp-coordinator-cell-value negative">
                    {{ coordinatorDownClientsCount > 0 ? `${coordinatorDownClientsCount}个客户` : '--' }}
                  </div>
                </div>
              </template>
              <div class="pp-coordinator-performance-content" @click.stop @mousedown.stop>
                <div class="pp-coordinator-performance-header">
                  <span class="pp-coordinator-performance-title">年业绩下降客户</span>
                </div>
                <div class="pp-coordinator-search" @click.stop @mousedown.stop>
                  <el-input
                    v-model="coordinatorDownSearchText"
                    placeholder="搜索客户名称"
                    size="small"
                    clearable
                    @click.stop
                    @mousedown.stop
                  >
                    <template #prefix>
                      <el-icon><Search /></el-icon>
                    </template>
                  </el-input>
                </div>
                <div class="pp-coordinator-client-header">
                  <span class="pp-coordinator-client-header-item">客户名称</span>
                  <span class="pp-coordinator-client-header-item">账单额</span>
                  <span class="pp-coordinator-client-header-item">下降百分比</span>
                </div>
                <div
                  class="pp-coordinator-client-list"
                  style="max-height: 300px; overflow-y: auto;"
                >
                  <div
                    v-for="client in filteredCoordinatorDownClients"
                    :key="client.custId || client.name"
                    class="pp-coordinator-client-item"
                    :class="{ active: selectedCoordinatorDownClientId === (client.custId || client.name) }"
                    @click="selectCoordinatorClient('down', client)"
                  >
                    <span class="pp-coordinator-client-name">
                      {{ client.name }}
                      <el-icon 
                        class="pp-coordinator-client-view-icon"
                        @click.stop="viewClientDetail('down', client)"
                      >
                        <View />
                      </el-icon>
                    </span>
                    <span class="pp-coordinator-client-amount">{{ formatClientAmount(client.amount) || '--' }}</span>
                    <span class="pp-coordinator-client-change down">{{ client.changePercent }}</span>
                  </div>
                  <div v-if="filteredCoordinatorDownClients.length === 0" class="pp-coordinator-empty">
                    暂无数据
                  </div>
                </div>
                <div v-if="coordinatorDownPopoverReady" class="pp-coordinator-chart-container">
                  <div ref="coordinatorDownChartRef" class="pp-coordinator-chart-body" data-chart-type="coordinator-down"></div>
                  <div v-if="!selectedCoordinatorDownClientId" class="pp-coordinator-chart-placeholder">
                    请选择客户查看趋势
                  </div>
                </div>
              </div>
            </el-popover>
          </div>
        </div>
        <div v-else-if="module.type === 'customer-owner'" class="pp-owner">
          <div class="pp-owner-summary">
            <template v-for="item in module.summary" :key="item.label">
              <el-popover
                v-if="shouldShowOwnerClientPopover(item)"
                placement="bottom"
                :width="450"
                trigger="click"
                :enterable="true"
                :persistent="true"
                :popper-options="{ strategy: 'fixed' }"
                popper-class="pp-client-popover-wrapper"
                @after-enter="() => loadOwnerClientList({ reset: ownerClientState.list.length === 0 })"
              >
                <template #reference>
                  <div
                    class="pp-owner-summary-item pp-owner-summary-item--hoverable"
                    :class="{
                      highlight: item.highlight,
                      up: item.up,
                      down: item.down,
                    }"
                  >
                    <div class="pp-owner-summary-label">{{ item.label }}</div>
                    <div class="pp-owner-summary-value">
                      <span class="pp-client-summary">{{ item.value }}</span>
                    </div>
                  </div>
                </template>
                <div class="pp-client-popover pp-client-popover--owner" @click.stop @mousedown.stop>
                  <div class="pp-client-popover-header">
                    <div class="pp-client-popover-search" @click.stop @mousedown.stop>
                      <el-input
                        v-model="clientSearchTexts.owner"
                        placeholder="搜索客户名称"
                        size="small"
                        clearable
                        @click.stop
                        @mousedown.stop
                        @input="handleOwnerClientSearchInput"
                      >
                        <template #prefix>
                          <el-icon><Search /></el-icon>
                        </template>
                      </el-input>
                    </div>
                    <div class="pp-client-popover-header-row">
                      <span class="pp-client-popover-header-item">客户名称</span>
                      <span class="pp-client-popover-header-item">账单额</span>
                      <span class="pp-client-popover-header-item">案量</span>
                      <span class="pp-client-popover-header-item">回款率</span>
                    </div>
                  </div>
                  <div
                    class="pp-client-popover-body"
                    style="max-height: 300px; overflow-y: auto;"
                    @scroll="handleOwnerClientScroll"
                  >
                    <div
                      v-for="client in getFilteredClients(ownerClientState.list, 'owner')"
                      :key="`${client.custId || client.name}`"
                      class="pp-client-popover-row"
                    >
                      <span class="pp-client-popover-cell name">
                        <span class="pp-client-name-text">{{ client.custName || client.name }}</span>
                        <el-icon 
                          class="pp-client-popover-view-icon"
                          @click.stop="viewClientDetail('owner', client)"
                        >
                          <View />
                        </el-icon>
                      </span>
                      <span class="pp-client-popover-cell amount">{{ formatClientAmount(client.amount) || '¥0.00' }}</span>
                      <span class="pp-client-popover-cell cases">{{ client.caseCount || 0 }}件</span>
                      <span class="pp-client-popover-cell rate">{{ client.repaymentRate || '--' }}</span>
                    </div>
                    <div v-if="getFilteredClients(ownerClientState.list, 'owner').length === 0 && !ownerClientState.loading" class="pp-client-popover-empty">
                      暂无数据
                    </div>
                  </div>
                </div>
              </el-popover>
              <el-popover
                v-else-if="item.up || item.down"
                placement="bottom"
                :width="600"
                trigger="click"
                :enterable="true"
                :persistent="true"
                :hide-after="200"
                :show-after="100"
                :popper-options="{ strategy: 'fixed', modifiers: [{ name: 'offset', options: { offset: [0, 8] } }] }"
                popper-class="pp-coordinator-performance-popover"
                @after-enter="handleOwnerPopoverEnter(module, item.up ? 'up' : 'down')"
                @after-leave="handleOwnerPopoverLeave(item.up ? 'up' : 'down')"
              >
                <template #reference>
                  <div
                    class="pp-owner-summary-item pp-owner-summary-item--hoverable"
                    :class="{
                      highlight: item.highlight,
                      up: item.up,
                      down: item.down,
                    }"
                  >
                    <div class="pp-owner-summary-label">{{ item.label }}</div>
                    <div class="pp-owner-summary-value">
                      <span>{{ item.up ? `${ownerUpClientsCount}个客户` : `${ownerDownClientsCount}个客户` }}</span>
                    </div>
                  </div>
                </template>
                <div class="pp-coordinator-performance-content" @click.stop @mousedown.stop>
                  <div class="pp-coordinator-performance-header">
                    <span class="pp-coordinator-performance-title">{{ item.up ? '年业绩上涨客户' : '年业绩下降客户' }}</span>
                  </div>
                  <div class="pp-coordinator-search" @click.stop @mousedown.stop>
                    <el-input
                      v-if="item.up"
                      v-model="ownerUpSearchText"
                      placeholder="搜索客户名称"
                      size="small"
                      clearable
                      @click.stop
                      @mousedown.stop
                    >
                      <template #prefix>
                        <el-icon><Search /></el-icon>
                      </template>
                    </el-input>
                    <el-input
                      v-else
                      v-model="ownerDownSearchText"
                      placeholder="搜索客户名称"
                      size="small"
                      clearable
                      @click.stop
                      @mousedown.stop
                    >
                      <template #prefix>
                        <el-icon><Search /></el-icon>
                      </template>
                    </el-input>
                  </div>
                  <div class="pp-coordinator-client-header">
                    <span class="pp-coordinator-client-header-item">客户名称</span>
                    <span class="pp-coordinator-client-header-item">账单额</span>
                    <span class="pp-coordinator-client-header-item">{{ item.up ? '上涨百分比' : '下降百分比' }}</span>
                  </div>
                  <div class="pp-coordinator-client-list" style="max-height: 300px; overflow-y: auto;">
                    <div
                    v-for="client in item.up ? filteredOwnerUpClients : filteredOwnerDownClients"
                    :key="client.custId || client.name"
                    class="pp-coordinator-client-item"
                    :class="{ active: item.up ? (selectedOwnerUpClientId === (client.custId || client.name)) : (selectedOwnerDownClientId === (client.custId || client.name)) }"
                    @click="selectOwnerClient(item.up ? 'up' : 'down', client)"
                  >
                      <span class="pp-coordinator-client-name">
                        {{ client.name }}
                        <el-icon 
                          class="pp-coordinator-client-view-icon"
                          @click.stop="viewClientDetail(item.up ? 'owner-up' : 'owner-down', client)"
                        >
                          <View />
                        </el-icon>
                      </span>
                      <span class="pp-coordinator-client-amount">{{ formatClientAmount(client.amount) || '--' }}</span>
                      <span class="pp-coordinator-client-change" :class="item.up ? 'up' : 'down'">{{ client.changePercent }}</span>
                    </div>
                    <div v-if="(item.up ? filteredOwnerUpClients : filteredOwnerDownClients).length === 0" class="pp-coordinator-empty">
                      暂无数据
                    </div>
                  </div>
                  <div v-if="item.up ? ownerUpPopoverReady : ownerDownPopoverReady" class="pp-coordinator-chart-container">
                    <div 
                      :ref="item.up ? ownerChartRefUp : ownerChartRefDown" 
                      class="pp-coordinator-chart-body"
                      :data-chart-type="`owner-${item.up ? 'up' : 'down'}`"
                    ></div>
                    <div
                      v-if="item.up ? !selectedOwnerUpClientId : !selectedOwnerDownClientId"
                      class="pp-coordinator-chart-placeholder"
                    >
                      请选择客户查看趋势
                    </div>
                  </div>
                </div>
              </el-popover>
              <div
                v-else
                class="pp-owner-summary-item"
                :class="{
                  highlight: item.highlight,
                  up: item.up,
                  down: item.down,
                }"
              >
                <div class="pp-owner-summary-label">{{ item.label }}</div>
                <div class="pp-owner-summary-value">
                  <span>{{ item.value }}</span>
                </div>
              </div>
            </template>
          </div>
          <div class="pp-owner-charts" v-if="module.charts">
            <DonutChart
              title="前十客户账单额占比"
              :data="module.charts.topCustomers"
              :hover-detail-fetcher="fetchOwnerTopCustomerLevel2"
            />
            <FieldPieChart
              :case-fields="module.charts.caseFields"
              :business-fields="module.charts.businessFields"
              :hover-detail-fetcher="fetchOwnerFieldLevel2"
            />
          </div>
          <div class="pp-owner-costs">
            <div
              v-for="item in module.costs"
              :key="item.label"
              class="pp-owner-cost-item"
              :class="{ strong: item.strong }"
            >
              <template v-if="item.label === '客户联络'">
                <el-popover
                  placement="bottom"
                  :width="520"
                  trigger="click"
                  :enterable="true"
                  :persistent="true"
                  :popper-options="{ strategy: 'fixed' }"
                  popper-class="pp-client-popover-wrapper"
                  @after-enter="() => loadOwnerCustContactList({ reset: ownerCustContactState.list.length === 0 })"
                >
                  <template #reference>
                    <div class="pp-owner-cost-item pp-owner-cost-item--hoverable">
                      <span>{{ item.label }}</span>
                      <span class="pp-owner-cost-separator">：</span>
                      <span class="pp-owner-cost-value pp-owner-cost-value--blue">{{ item.value }}</span>
                    </div>
                  </template>
                  <div class="pp-client-popover pp-client-popover--owner-contact" @click.stop @mousedown.stop>
                    <div class="pp-client-popover-header">
                      <div class="pp-client-popover-header-row">
                        <span class="pp-client-popover-header-item">工时内容</span>
                        <span class="pp-client-popover-header-item">核定工时</span>
                      </div>
                    </div>
                    <div
                      class="pp-client-popover-body"
                      style="max-height: 300px; overflow-y: auto;"
                      @scroll="handleOwnerCustContactScroll"
                    >
                      <div
                        v-for="row in ownerCustContactState.list"
                        :key="row.hoursId"
                        class="pp-client-popover-row"
                      >
                        <span class="pp-client-popover-cell name">
                          <el-tooltip
                            :content="row.workContent"
                            placement="top"
                            :show-after="200"
                          >
                            <span class="pp-contact-content-text">{{ row.shortContent }}</span>
                          </el-tooltip>
                          <el-icon
                            class="pp-client-popover-view-icon"
                            @click.stop="openWorkhourView(row.hoursId)"
                          >
                            <View />
                          </el-icon>
                        </span>
                        <span class="pp-client-popover-cell amount">{{ row.approvedTime || '--' }}</span>
                      </div>
                      <div v-if="ownerCustContactState.list.length === 0 && !ownerCustContactState.loading" class="pp-client-popover-empty">
                        暂无数据
                      </div>
                    </div>
                  </div>
                </el-popover>
              </template>
              <template v-else>
                <span>{{ item.label }}</span>
                <span class="pp-owner-cost-separator">：</span>
                <span class="pp-owner-cost-value">{{ item.value }}</span>
              </template>
            </div>
          </div>
        </div>
        <div v-else-if="module.type === 'customer-group'" class="pp-group">
          <div class="pp-group-overview">
            <template v-for="item in module.overview" :key="item.label">
              <el-popover
                v-if="shouldShowGroupClientPopover(item)"
                placement="bottom"
                :width="450"
                trigger="click"
                :enterable="true"
                :persistent="true"
                :popper-options="{ strategy: 'fixed' }"
                popper-class="pp-client-popover-wrapper"
                @after-enter="() => loadGroupClientList(item)"
              >
                <template #reference>
                  <div class="pp-group-metric pp-group-metric--hoverable">
                    <div class="pp-group-label">{{ item.label }}</div>
                    <div class="pp-group-value" :class="{ highlight: item.customers }">
                      <span>{{ item.value }}</span>
                      <span v-if="item.customers" class="pp-group-customer-popover">
                        <span class="pp-group-popover-title">客户列表</span>
                        <span
                          v-for="customer in item.customers"
                          :key="customer"
                          class="pp-group-popover-item"
                        >
                          {{ customer }}
                        </span>
                      </span>
                    </div>
                  </div>
                </template>
                <div class="pp-client-popover pp-client-popover--group" @click.stop @mousedown.stop>
                  <div class="pp-client-popover-header pp-client-popover-header--group">
                    <div class="pp-client-popover-search" @click.stop @mousedown.stop>
                      <el-input
                        v-model="clientSearchTexts[`group-${item.label}`]"
                        placeholder="搜索客户名称"
                        size="small"
                        clearable
                        @click.stop
                        @mousedown.stop
                        @input="handleGroupClientSearchInput(item)"
                      >
                        <template #prefix>
                          <el-icon><Search /></el-icon>
                        </template>
                      </el-input>
                    </div>
                    <div class="pp-client-popover-header-row">
                      <span class="pp-client-popover-header-item">客户名称</span>
                      <span class="pp-client-popover-header-item">账单额</span>
                      <span class="pp-client-popover-header-item">案量</span>
                      <span class="pp-client-popover-header-item">回款率</span>
                    </div>
                  </div>
                  <div
                    class="pp-client-popover-body"
                    style="max-height: 300px; overflow-y: auto;"
                    @scroll="handleGroupClientScroll(item, $event)"
                  >
                    <div
                      v-for="client in getFilteredClients(getGroupState(item).list, `group-${item.label}`)"
                      :key="`${item.label}-${client.custId || client.name}`"
                      class="pp-client-popover-row"
                    >
                      <span class="pp-client-popover-cell name">
                        <span class="pp-client-name-text">{{ client.custName || client.name }}</span>
                        <el-icon 
                          class="pp-client-popover-view-icon"
                          @click.stop="viewClientDetail('group', client)"
                        >
                          <View />
                        </el-icon>
                      </span>
                      <span class="pp-client-popover-cell amount">{{ formatClientAmount(client.amount) || '¥0.00' }}</span>
                      <span class="pp-client-popover-cell cases">{{ client.caseCount || 0 }}件</span>
                      <span class="pp-client-popover-cell rate">{{ formatPercent(client.repaymentRate || client.percentage) || '--' }}</span>
                    </div>
                    <div v-if="getFilteredClients(getGroupState(item).list, `group-${item.label}`).length === 0 && !getGroupState(item).loading" class="pp-client-popover-empty">
                      暂无数据
                    </div>
                  </div>
                </div>
              </el-popover>
              <div v-else class="pp-group-metric">
                <div class="pp-group-label">{{ item.label }}</div>
                <div class="pp-group-value" :class="{ highlight: item.customers }">
                  <span>{{ item.value }}</span>
                  <span v-if="item.customers" class="pp-group-customer-popover">
                    <span class="pp-group-popover-title">客户列表</span>
                    <span
                      v-for="customer in item.customers"
                      :key="customer"
                      class="pp-group-popover-item"
                    >
                      {{ customer }}
                    </span>
                  </span>
                </div>
              </div>
            </template>
          </div>
          <div class="pp-group-allocation">
            <div class="pp-group-allocation-item">
              <span class="pp-group-label">分配前账单额</span>
              <span class="pp-group-value">{{ module.allocation.before }}</span>
            </div>
            <div class="pp-group-allocation-arrow">→</div>
            <div class="pp-group-allocation-item strong">
              <span class="pp-group-label">分配后账单额</span>
              <span class="pp-group-value">{{ module.allocation.after }}</span>
            </div>
          </div>
          <div class="pp-group-chart">
            <DonutChart
              title="客户组前十客户账单占比"
              :data="module.chart"
              :hover-detail-fetcher="fetchGroupTopCustomerLevel2"
            />
          </div>
        </div>
        <div v-else-if="module.type === 'undertake'" class="pp-undertake">
          <div class="pp-undertake-grid">
            <el-popover
              v-if="module.overview && module.overview.length > 0"
              placement="bottom"
              :width="400"
              trigger="click"
              :enterable="true"
              :persistent="true"
              :popper-options="{ strategy: 'fixed' }"
              popper-class="pp-client-popover-wrapper"
              @after-enter="() => loadUndertakeClientList({ reset: false })"
            >
              <template #reference>
                <div class="pp-undertake-col pp-undertake-col--hoverable">
                  <!-- <div class="pp-section-head">承办规模概览</div> -->
                  <div class="pp-undertake-list">
                    <div
                      v-for="item in module.overview"
                      :key="item.label"
                      class="pp-undertake-row"
                    >
                      <span class="pp-group-label">{{ item.label }}</span>
                      <span
                        class="pp-group-value"
                        :class="{ highlight: item.customers }"
                      >
                        <span>{{ item.value }}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </template>
              <div class="pp-client-popover pp-client-popover--undertake" @click.stop @mousedown.stop>
                <div class="pp-client-popover-header pp-client-popover-header--undertake">
                  <div class="pp-client-popover-search" @click.stop @mousedown.stop>
                    <el-input
                      v-model="clientSearchTexts['undertake']"
                      placeholder="搜索客户名称"
                      size="small"
                      clearable
                      @click.stop
                      @mousedown.stop
                      @input="handleUndertakeClientSearchInput"
                    >
                      <template #prefix>
                        <el-icon><Search /></el-icon>
                      </template>
                    </el-input>
                  </div>
                  <div class="pp-client-popover-header-row">
                    <span class="pp-client-popover-header-item">客户名称</span>
                    <span class="pp-client-popover-header-item">账单额</span>
                    <span class="pp-client-popover-header-item">案量</span>
                  </div>
                </div>
                <div
                  class="pp-client-popover-body"
                  style="max-height: 300px; overflow-y: auto;"
                  @scroll="handleUndertakeClientScroll"
                >
                  <div
                    v-for="client in getFilteredClients(undertakeClientState.list, 'undertake')"
                    :key="client.custId || client.name"
                    class="pp-client-popover-row pp-client-popover-row--undertake"
                  >
                    <span class="pp-client-popover-cell name">
                      <span class="pp-client-name-text">{{ client.custName || client.name }}</span>
                      <el-icon 
                        class="pp-client-popover-view-icon"
                        @click.stop="viewClientDetail('undertake', client)"
                      >
                        <View />
                      </el-icon>
                    </span>
                    <span class="pp-client-popover-cell amount">{{ formatClientAmount(client.amount) || '¥0.00' }}</span>
                    <span class="pp-client-popover-cell cases">{{ client.caseCount || 0 }}件</span>
                  </div>
                  <div v-if="getFilteredClients(undertakeClientState.list, 'undertake').length === 0 && !undertakeClientState.loading" class="pp-client-popover-empty">
                    暂无数据
                  </div>
                </div>
              </div>
            </el-popover>
            <div v-else class="pp-undertake-col pp-undertake-col--hoverable">
              <!-- <div class="pp-section-head">承办规模概览</div> -->
              <div class="pp-undertake-list">
                <div
                  v-for="item in module.overview"
                  :key="item.label"
                  class="pp-undertake-row"
                >
                  <span class="pp-group-label">{{ item.label }}</span>
                  <span
                    class="pp-group-value"
                    :class="{ highlight: item.customers }"
                  >
                    <span>{{ item.value }}</span>
                  </span>
                </div>
              </div>
            </div>
            <div class="pp-undertake-col">
              <!-- <div class="pp-section-head">工作投入与成本</div> -->
              <div class="pp-undertake-list">
                <div class="pp-undertake-row">
                  <span class="pp-group-label">承办组工时</span>
                  <span class="pp-undertake-value">{{ (module.workload && module.workload.hours) || '0' }}</span>
                </div>
                <div class="pp-undertake-row">
                  <span class="pp-group-label">案内费用</span>
                  <!-- <span>{{ (module.costs && module.costs[0]?.value) || '¥0.00' }}</span> -->
                  <span>待处理</span>
                </div>
                <div class="pp-undertake-row">
                  <span class="pp-group-label">人力成本</span>
                  <!-- <span>{{ (module.costs && module.costs[1]?.value) || '待处理' }}</span> -->
                  <span>待处理</span>
                </div>
                <!-- <div class="pp-undertake-row">
                  <span class="pp-group-label">总成本</span>
                  <span>待处理</span>
                </div> -->
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="module.type === 'attendance'" class="pp-attendance">
          <div class="pp-module-title">个人考勤</div>
          <div class="pp-attendance-grid">
            <div class="pp-attendance-row">
              <div
                v-for="item in module.metrics.slice(0, 2)"
                :key="item.label"
                class="pp-attendance-item"
              >
                <div class="pp-attendance-label">{{ item.label }}</div>
                <div class="pp-attendance-value">{{ item.value }}</div>
              </div>
            </div>
            <div class="pp-attendance-row">
              <div
                v-for="item in module.metrics.slice(2, 4)"
                :key="item.label"
                class="pp-attendance-item"
              >
                <div class="pp-attendance-label">{{ item.label }}</div>
                <div class="pp-attendance-value">{{ item.value }}</div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="pp-module-list">
          <div v-if="!module.items || module.items.length === 0" class="pp-module-empty-block">
            暂无数据
          </div>
          <div
            v-else
            v-for="item in module.items"
            :key="item.label"
            class="pp-module-item"
          >
            <span class="pp-module-label">{{ item.label }}</span>
            <span v-if="item.customers && item.label !== '现有客户跨领域开发' && item.value !== '无'" class="pp-module-value client-value">
              <el-popover
                placement="bottom"
                :width="380"
                trigger="click"
                :enterable="true"
                :persistent="true"
                :popper-options="{ strategy: 'fixed' }"
                popper-class="pp-client-popover-wrapper"
                @after-enter="() => loadParticipantCustomers(item)"
              >
                <template #reference>
                  <span class="pp-client-wrap">
                    <span class="pp-client-summary">{{ item.value }}</span>
                  </span>
                </template>
                <div class="pp-client-popover pp-client-popover--participant" @click.stop @mousedown.stop>
                  <div class="pp-client-popover-header">
                    <div class="pp-client-popover-search" @click.stop @mousedown.stop>
                      <el-input
                        v-model="clientSearchTexts[`participant-customer-${item.label}`]"
                        placeholder="搜索客户名称"
                        size="small"
                        clearable
                        @click.stop
                        @mousedown.stop
                        @input="handleParticipantCustomerSearchInput(item)"
                      >
                        <template #prefix>
                          <el-icon><Search /></el-icon>
                        </template>
                      </el-input>
                    </div>
                    <div class="pp-client-popover-header-row">
                      <span class="pp-client-popover-header-item">客户名称</span>
                    </div>
                  </div>
                  <div
                    class="pp-client-popover-body"
                    style="max-height: 300px; overflow-y: auto;"
                    @scroll="handleParticipantCustomerScroll(item, $event)"
                  >
                    <div
                      v-for="customer in getFilteredCustomers(getParticipantState(item).list, `participant-customer-${item.label}`)"
                      :key="`${item.label}-${customer.custId || customer.custName}`"
                      class="pp-client-popover-row"
                    >
                      <span class="pp-client-popover-cell name">
                        {{ customer.custName || customer.name }}
                        <el-icon 
                          class="pp-client-popover-view-icon"
                          @click.stop="viewClientDetail('participant', customer)"
                        >
                          <View />
                        </el-icon>
                      </span>
                    </div>
                    <div v-if="getFilteredCustomers(getParticipantState(item).list, `participant-customer-${item.label}`).length === 0 && !getParticipantState(item).loading" class="pp-client-popover-empty">
                      暂无数据
                    </div>
                  </div>
                </div>
              </el-popover>
            </span>
            <span v-else-if="item.customers && item.label !== '现有客户跨领域开发' && item.value === '无'" class="pp-module-value">
              {{ item.value }}
            </span>
            <span
              v-else-if="item.topClients !== undefined || (module.title === '客户开发人')"
              class="pp-module-value client-value"
            >
              <!-- 如果数据为0且没有客户列表，显示"无" -->
              <span v-if="(!item.count || item.count === 0) && (!item.topClients || (Array.isArray(item.topClients) && item.topClients.length === 0)) && (!item.totalAmount || item.totalAmount === 0)" class="pp-module-empty">
                无
              </span>
              <!-- 如果有客户列表，显示客户列表 -->
              <template v-else-if="shouldShowDeveloperPopover(item)">
                <el-popover
                  placement="bottom"
                  :width="450"
                  trigger="click"
                  :enterable="true"
                  :persistent="true"
                  :popper-options="{ strategy: 'fixed' }"
                  popper-class="pp-client-popover-wrapper"
                  @after-enter="handleDeveloperPopoverOpen(item)"
                >
                  <template #reference>
                    <span class="pp-client-wrap pp-client-wrap--developer">
                      <span class="pp-client-count pp-client-count--blue">{{ item.count }}家</span>
                      <span v-if="item.totalAmount && item.totalAmount > 0" class="pp-client-total pp-client-total--blue">
                        {{ formatRevenueValue(item.totalAmount) }}
                      </span>
                      <span v-else-if="getTotalAmount(getDeveloperClients(item))" class="pp-client-total pp-client-total--blue">
                        {{ getTotalAmount(getDeveloperClients(item)) }}
                      </span>
                    </span>
                  </template>
                  <div class="pp-client-popover pp-client-popover--developer" @click.stop @mousedown.stop>
                    <!-- <span class="pp-client-popover-title">客户列表</span> -->
                    <div class="pp-client-popover-header">
                      <div class="pp-client-popover-search" @click.stop @mousedown.stop>
                        <el-input
                          v-model="clientSearchTexts[`developer-${item.label}`]"
                          placeholder="搜索客户名称"
                          size="small"
                          clearable
                          @click.stop
                          @mousedown.stop
                          @input="handleDeveloperSearchInput(item)"
                        >
                          <template #prefix>
                            <el-icon><Search /></el-icon>
                          </template>
                        </el-input>
                      </div>
                      <div class="pp-client-popover-header-row">
                        <span class="pp-client-popover-header-item">客户名称</span>
                        <span class="pp-client-popover-header-item">账单额</span>
                        <span v-if="!isDeveloperExistingCrossDomain(item)" class="pp-client-popover-header-item">案量</span>
                      </div>
                    </div>
                    <div
                      class="pp-client-popover-body"
                      style="max-height: 300px; overflow-y: auto;"
                      @scroll="handleDeveloperScroll(item, $event)"
                    >
                      <div
                        v-for="client in getDeveloperList(item)"
                        :key="`${item.label}-${client.custId || client.name}`"
                        class="pp-client-popover-row"
                      >
                        <span class="pp-client-popover-cell name">
                          <span class="pp-client-name-text">{{ client.custName || client.name }}</span>
                          <el-icon 
                            class="pp-client-popover-view-icon"
                            @click.stop="viewClientDetail('developer', client)"
                          >
                            <View />
                          </el-icon>
                        </span>
                        <span class="pp-client-popover-cell amount">{{ formatClientAmount(client.amount) || '--' }}</span>
                        <span v-if="!isDeveloperExistingCrossDomain(item)" class="pp-client-popover-cell cases">{{ client.caseCount || 0 }}件</span>
                      </div>
                      <div v-if="getDeveloperList(item).length === 0 && !getDeveloperState(item).loading" class="pp-client-popover-empty">
                        暂无数据
                      </div>
                    </div>
                  </div>
                </el-popover>
              </template>
              <!-- 如果没有客户列表但有 count 或 totalAmount，显示这些数据 -->
              <template v-else-if="(item.count && item.count > 0) || (item.totalAmount && item.totalAmount > 0)">
                <span v-if="item.count && item.count > 0" class="pp-client-count pp-client-count--blue">{{ item.count }}家</span>
                <span v-if="item.totalAmount && item.totalAmount > 0" class="pp-client-total pp-client-total--blue">
                  {{ formatRevenueValue(item.totalAmount) }}
                </span>
              </template>
            </span>
            <span
              v-else-if="item.activities && item.value !== '无'"
              class="pp-module-value client-value"
            >
              <el-popover
                placement="bottom"
                :width="560"
                trigger="click"
                :enterable="true"
                :persistent="true"
                :popper-options="{ strategy: 'fixed' }"
                popper-class="pp-client-popover-wrapper"
                @after-enter="() => loadParticipantActivities(item)"
              >
                <template #reference>
                  <span class="pp-client-wrap">
                    <span class="pp-client-summary">{{ item.value }}</span>
                  </span>
                </template>
                <div class="pp-client-popover pp-client-popover--activity" @click.stop @mousedown.stop>
                  <div class="pp-client-popover-header pp-client-popover-header--activity">
                    <div class="pp-client-popover-search" @click.stop @mousedown.stop>
                      <el-input
                        v-model="clientSearchTexts[`participant-activity-${item.label}`]"
                        placeholder="搜索活动名称或客户名称"
                        size="small"
                        clearable
                        @click.stop
                        @mousedown.stop
                        @input="handleParticipantActivitySearchInput(item)"
                      >
                        <template #prefix>
                          <el-icon><Search /></el-icon>
                        </template>
                      </el-input>
                    </div>
                    <div class="pp-client-popover-header-row">
                      <span class="pp-client-popover-header-item">客户名称</span>
                      <span class="pp-client-popover-header-item">活动时间</span>
                      <span class="pp-client-popover-header-item">活动名称</span>
                    </div>
                  </div>
                  <div
                    class="pp-client-popover-body--activity"
                    style="max-height: 300px; overflow-y: auto;"
                    @scroll="handleParticipantActivityScroll(item, $event)"
                  >
                    <div
                      v-for="activity in getFilteredActivities(getParticipantActivityState(item).list, `participant-activity-${item.label}`)"
                      :key="`${item.label}-${activity.activeName || activity.name}-${activity.activeDay || activity.time}`"
                      class="pp-client-popover-row pp-client-popover-row--activity"
                    >
                      <span class="pp-client-popover-cell customer">
                        <span class="pp-client-name-text">{{ activity.custName || activity.customer }}</span>
                        <el-icon 
                          class="pp-client-popover-view-icon"
                          @click.stop="viewClientDetail('participant', activity)"
                        >
                          <View />
                        </el-icon>
                      </span>
                      <span class="pp-client-popover-cell time">{{ activity.activeDay || activity.time }}</span>
                      <span class="pp-client-popover-cell name">
                        <span class="pp-client-name-text">{{ activity.activeName || activity.name }}</span>
                      </span>
                    </div>
                    <div v-if="getFilteredActivities(getParticipantActivityState(item).list, `participant-activity-${item.label}`).length === 0 && !getParticipantActivityState(item).loading" class="pp-client-popover-empty">
                      暂无数据
                    </div>
                  </div>
                </div>
              </el-popover>
            </span>
            <span
              v-else-if="item.activities && item.value === '无'"
              class="pp-module-value"
            >
              {{ item.value }}
            </span>
            <span
              v-else-if="item.personnelList && item.value !== '无'"
              class="pp-module-value client-value"
            >
              <el-popover
                placement="bottom"
                :width="400"
                trigger="click"
                :enterable="true"
                :persistent="true"
                :popper-options="{ strategy: 'fixed' }"
                popper-class="pp-client-popover-wrapper"
                @after-enter="() => loadParticipantPersonnel(item)"
              >
                <template #reference>
                  <span class="pp-client-wrap">
                    <span class="pp-client-summary">{{ item.value }}</span>
                  </span>
                </template>
                <div class="pp-client-popover pp-client-popover--personnel" @click.stop @mousedown.stop>
                  <div class="pp-client-popover-header pp-client-popover-header--personnel">
                    <div class="pp-client-popover-search" @click.stop @mousedown.stop>
                      <el-input
                        v-model="clientSearchTexts[`participant-personnel-${item.label}`]"
                        placeholder="搜索客户名称"
                        size="small"
                        clearable
                        @click.stop
                        @mousedown.stop
                        @input="handleParticipantPersonnelSearchInput(item)"
                      >
                        <template #prefix>
                          <el-icon><Search /></el-icon>
                        </template>
                      </el-input>
                    </div>
                    <div class="pp-client-popover-header-row">
                      <span class="pp-client-popover-header-item">客户名称</span>
                      <span class="pp-client-popover-header-item">人员名称</span>
                    </div>
                  </div>
                  <div
                    class="pp-client-popover-body"
                    style="max-height: 300px; overflow-y: auto;"
                    @scroll="handleParticipantPersonnelScroll(item, $event)"
                  >
                    <div
                      v-for="personnel in getFilteredPersonnelList(getParticipantPersonnelState(item).list, `participant-personnel-${item.label}`)"
                      :key="`${item.label}-${personnel.custId || personnel.custName}`"
                      class="pp-client-popover-row pp-client-popover-row--personnel"
                    >
                      <span class="pp-client-popover-cell name">
                        <span class="pp-client-name-text">{{ personnel.custName || personnel.name }}</span>
                        <el-icon 
                          class="pp-client-popover-view-icon"
                          @click.stop="viewClientDetail('participant-personnel', personnel)"
                        >
                          <View />
                        </el-icon>
                      </span>
                      <span class="pp-client-popover-cell personnel">{{ personnel.custPerson || personnel.personnel }}</span>
                    </div>
                    <div v-if="getFilteredPersonnelList(getParticipantPersonnelState(item).list, `participant-personnel-${item.label}`).length === 0 && !getParticipantPersonnelState(item).loading" class="pp-client-popover-empty">
                      暂无数据
                    </div>
                  </div>
                </div>
              </el-popover>
            </span>
            <span
              v-else-if="item.personnelList && item.value === '无'"
              class="pp-module-value"
            >
              {{ item.value }}
            </span>
            <span
              v-else-if="item.detailList"
              class="pp-module-value client-value"
            >
              <el-popover
                placement="bottom"
                :width="getPublicityPopoverWidth(item.label)"
                trigger="click"
                :enterable="true"
                :persistent="true"
                :popper-options="{ strategy: 'fixed' }"
                popper-class="pp-client-popover-wrapper"
              >
                <template #reference>
                  <span class="pp-client-wrap">
                    <span class="pp-client-summary">{{ item.value }}</span>
                  </span>
                </template>
                <div class="pp-client-popover pp-client-popover--publicity" @click.stop @mousedown.stop>
                  <div class="pp-client-popover-search" style="padding: 8px;" @click.stop @mousedown.stop>
                    <el-input
                      v-model="clientSearchTexts[`publicity-${item.label}`]"
                      placeholder="搜索客户名称或活动名称"
                      size="small"
                      clearable
                      @click.stop
                      @mousedown.stop
                    >
                      <template #prefix>
                        <el-icon><Search /></el-icon>
                      </template>
                    </el-input>
                  </div>
                  <div :class="getPublicityHeaderClass(item.label)">
                    <span
                      v-for="(header, idx) in getPublicityHeaders(item.label)"
                      :key="idx"
                      class="pp-client-popover-header-item"
                    >
                      {{ header }}
                    </span>
                  </div>
                  <div style="max-height: 300px; overflow-y: auto;">
                    <div
                      v-for="(detail, idx) in getFilteredPublicityDetails(item.detailList, `publicity-${item.label}`)"
                      :key="`${item.label}-${idx}`"
                      :class="getPublicityRowClass(item.label)"
                    >
                      <span
                        v-for="(field, fieldIdx) in getPublicityFields(item.label, detail)"
                        :key="fieldIdx"
                        :class="getPublicityCellClass(item.label, fieldIdx)"
                      >
                        {{ field }}
                      </span>
                    </div>
                    <div v-if="getFilteredPublicityDetails(item.detailList, `publicity-${item.label}`).length === 0" class="pp-client-popover-empty">
                      暂无数据
                    </div>
                  </div>
                </div>
              </el-popover>
            </span>
            <span
              v-else
              class="pp-module-value"
              :class="{
                strong: item.strong,
                highlight: item.highlight,
                badge: item.badge,
              }"
            >
              {{ item.value }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="pp-score-strip">
      <div class="pp-score-header">
        <div>
          <div class="pp-score-title">
            <span class="pp-score-title-indicator"></span>
            硬性指标绩效分数
          </div>
          <!-- <div class="pp-score-note">等待具给出具体计算规则</div> -->
        </div>
      </div>
      <div class="pp-score-list">
        <div
          v-for="item in scoreBreakdown"
          :key="item.label"
          class="pp-score-pill"
          :style="{ '--score-color': item.color }"
        >
          <span
            class="pp-score-pill-indicator"
            :style="{ backgroundColor: item.color }"
          ></span>
          <span class="pp-score-pill-label">{{ item.label }}</span>
          <span class="pp-score-pill-value">{{ formatScore(item.score) }}分</span>
        </div>
        <div class="pp-score-pill total">
          <span class="pp-score-pill-label">硬性指标总分</span>
          <span class="pp-score-pill-value">{{ formatScore(scoreTotal) }}分</span>
        </div>
      </div>
    </div>

    <div class="pp-soft">
      <div class="pp-soft-header">
        <div>
          <div class="pp-soft-title">软性指标</div>
          <div class="pp-soft-subtitle">
            初始数据来源于系统提取，可点击右上角“补充说明”进行补充。
          </div>
        </div>
        <div class="pp-soft-actions">
          <el-tooltip
            v-if="onToggleEdit && !hasEditPermission && !editable"
            content="已过有效期"
            placement="top"
          >
            <button
              type="button"
              class="pp-soft-action"
              :class="{ 'pp-soft-action-disabled': !hasEditPermission && !editable }"
              :disabled="!hasEditPermission && !editable"
              @click="onToggleEdit"
            >
              {{ editable ? "关闭补充说明" : "补充说明" }}
            </button>
          </el-tooltip>
          <button
            v-else-if="onToggleEdit"
            type="button"
            class="pp-soft-action"
            :class="{ 'pp-soft-action-disabled': !hasEditPermission && !editable }"
            :disabled="!hasEditPermission && !editable"
            @click="onToggleEdit"
          >
            {{ editable ? "关闭补充说明" : "补充说明" }}
          </button>
        </div>
      </div>

      <div class="pp-soft-grid">
        <div
          v-for="(group, groupIndex) in localSoftMetrics.filter(g => g.key !== 'summary')"
          :key="group.key"
          class="pp-soft-card"
        >
          <div class="pp-soft-card-head">
            <div class="pp-soft-card-title">
              <span>{{ group.title }}</span>
              <el-tooltip
                v-if="group.description"
                :content="group.description"
                placement="top"
                :popper-options="{ modifiers: [{ name: 'offset', options: { offset: [0, 8] } }] }"
              >
                <span class="pp-soft-info" tabindex="0">
                  i
                </span>
              </el-tooltip>
            </div>
            <div class="pp-soft-card-actions">
              <button
                v-if="editable"
                type="button"
                class="pp-soft-add"
                @click="openAddDialog(groupIndex)"
              >
                添加
              </button>
              <template v-else-if="hasTypeFilter(group.key)">
                <span class="pp-soft-count">{{ getRecordCount(group) }}条</span>
                <div
                  class="pp-soft-filter"
                  @click.stop="toggleTypeFilter(group.key)"
                >
                  <i class="bx bx-filter" aria-hidden="true"></i>
                  类型筛选
                  <div
                    v-if="openTypeFilterKey === group.key"
                    class="pp-soft-filter-panel"
                    @click.stop
                  >
                    <label
                      class="pp-soft-filter-item pp-soft-filter-all"
                    >
                      <input
                        type="checkbox"
                        :checked="isAllTypesSelected(group.key)"
                        @change="toggleAllTypes(group.key)"
                      />
                      <span>全选</span>
                    </label>
                    <label
                      v-for="option in getAvailableTypes(group)"
                      :key="option"
                      class="pp-soft-filter-item"
                    >
                      <input
                        type="checkbox"
                        :checked="isTypeChecked(group.key, option)"
                        @change="toggleTypeOption(group.key, option)"
                      />
                      <span>{{ option }}</span>
                    </label>
                  </div>
                </div>
              </template>
            </div>
          </div>
          <div class="pp-soft-records">
            <div v-if="!getFilteredRecords(group).length" class="pp-soft-empty">
              <span>暂无数据</span>
            </div>
            <div
              v-else
              v-for="(record, recordIndex) in getFilteredRecords(group)"
              :key="`${group.key}-${recordIndex}`"
              class="pp-soft-record"
            >
              <el-popover
                placement="top"
                :width="300"
                trigger="hover"
                :popper-options="{ strategy: 'fixed' }"
                popper-class="pp-soft-record-popover-wrapper"
              >
                <template #reference>
                  <span class="pp-soft-record-text">
                    <span
                      v-if="getRecordTag(record, group.key, recordIndex)"
                      class="pp-soft-record-tag"
                      :class="getRecordTagClass(record, group.key, recordIndex)"
                    >
                      {{ getRecordTag(record, group.key, recordIndex) }}
                    </span>
                    <span class="pp-soft-record-content">{{ getRecordText(record, group.key) }}</span>
                  </span>
                </template>
                <div class="pp-soft-record-popover">
                  <div class="pp-soft-record-popover-content">
                    <span
                      v-if="getRecordTag(record, group.key, recordIndex)"
                      class="pp-soft-record-tag"
                      :class="getRecordTagClass(record, group.key, recordIndex)"
                    >
                      {{ getRecordTag(record, group.key, recordIndex) }}
                    </span>
                    <span>{{ getRecordText(record, group.key) }}</span>
                  </div>
                </div>
              </el-popover>
              <div
                v-if="editable && canEditRecord(group, recordIndex)"
                class="pp-soft-record-actions"
              >
                <button
                  type="button"
                  class="pp-soft-edit"
                  @click="openEditDialog(groupIndex, recordIndex)"
                >
                  编辑
                </button>
                <button
                  type="button"
                  class="pp-soft-remove"
                  @click="removeRecord(groupIndex, recordIndex)"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <el-dialog
        v-model="softDialogOpen"
        :title="softDialogTitle"
        width="420px"
        class="pp-soft-dialog"
      >
        <div class="pp-soft-dialog-body">
          <div v-if="softDialogTypeOptions.length" class="pp-soft-dialog-field">
            <label class="pp-soft-dialog-label">类型</label>
            <CustomSelect
              v-model="softDialogType"
              :options="softDialogTypeOptions"
              placeholder="请选择类型"
            />
          </div>
          <div class="pp-soft-dialog-field">
            <label class="pp-soft-dialog-label">时间</label>
            <el-date-picker
              v-model="softDialogDate"
              type="date"
              placeholder="请选择时间"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </div>
          <div class="pp-soft-dialog-field">
            <label class="pp-soft-dialog-label">内容</label>
            <textarea
              v-model="softDialogText"
              class="pp-soft-input"
              rows="3"
              placeholder="请输入内容"
            ></textarea>
          </div>
        </div>
        <template #footer>
          <el-button @click="softDialogOpen = false">取消</el-button>
          <el-button type="primary" @click="confirmSoftDialog">确定</el-button>
        </template>
      </el-dialog>
      <el-dialog
        v-model="summaryDialogOpen"
        title="个人总结"
        width="680px"
        class="pp-soft-dialog pp-summary-dialog"
      >
        <div class="pp-summary-paper">
          <div class="pp-summary-content">
            <div class="pp-summary-section">
              <div class="pp-summary-section-label">一、新年目标计划及所需支持</div>
              <textarea
                v-model="summaryDialogFields.plan"
                class="pp-summary-textarea"
                placeholder="请在此填写新年目标计划及所需支持..."
              ></textarea>
            </div>
            <div class="pp-summary-section">
              <div class="pp-summary-section-label">二、对公司及部门的想法和建议</div>
              <textarea
                v-model="summaryDialogFields.suggestion"
                class="pp-summary-textarea"
                placeholder="请在此填写对公司及部门的想法和建议..."
              ></textarea>
            </div>
            <div class="pp-summary-section">
              <div class="pp-summary-section-label">三、其他</div>
              <textarea
                v-model="summaryDialogFields.other"
                class="pp-summary-textarea"
                placeholder="请在此填写其他内容..."
              ></textarea>
            </div>
          </div>
        </div>
        <template #footer>
          <el-button @click="summaryDialogOpen = false">取消</el-button>
          <el-button type="primary" @click="confirmSummaryDialog">确定</el-button>
        </template>
      </el-dialog>

    </div>
    </div>

    <div class="pp-score-strip soft">
      <div class="pp-score-header">
        <div>
          <div class="pp-score-title pp-score-title--no-indicator">软性指标绩效分数</div>
          <!-- <div class="pp-score-note">人工评分</div> -->
        </div>
        <div class="pp-score-actions" v-if="hasScorePermission">
          <button
            v-if="!softScoreEditing"
            type="button"
            class="pp-score-action ghost"
            @click="openScoreRecords"
          >
            打分记录
          </button>
          <button
            v-if="!softScoreEditing"
            type="button"
            class="pp-score-action"
            @click="openSoftScoreInline"
          >
            打分
          </button>
          <template v-else>
            <button
              type="button"
              class="pp-score-action ghost"
              @click="cancelSoftScoreInline"
            >
              取消
            </button>
            <button
              type="button"
              class="pp-score-action primary"
              @click="confirmSoftScoreInline"
            >
              保存
            </button>
          </template>
        </div>
      </div>
      <div class="pp-score-list">
        <div
          v-for="item in softScoreBreakdown"
          :key="item.label"
          class="pp-score-pill pp-score-pill--soft"
          :style="{ '--score-color': item.color }"
        >
          <span class="pp-score-pill-label">{{ item.label }}</span>
          <span v-if="!softScoreEditing" class="pp-score-pill-value">
            {{ formatScore(item.score) }}分
          </span>
          <input
            v-else
            v-model.number="item.score"
            type="number"
            min="0"
            step="0.1"
            class="pp-score-inline-input"
            @blur="normalizeSoftScore(item)"
          />
        </div>
        <div class="pp-score-pill total soft">
          <span class="pp-score-pill-label">软性指标总分</span>
          <span class="pp-score-pill-value">{{ formatScore(softScoreTotal) }}分</span>
        </div>
      </div>
    </div>

    <!-- 个人总结 -->
    <!-- <div class="pp-summary-section">
      <div class="pp-summary-section-head">
        <div class="pp-summary-section-title">个人总结</div>
      </div>
      <div class="pp-summary-section-content">
        <div
          v-for="field in summaryFields"
          :key="field.key"
          class="pp-summary-section-item"
        >
          <div class="pp-summary-section-label">{{ field.label }}</div>
          <div class="pp-summary-section-value">
            {{ getSummaryValueFromMetrics(field.key) || "暂无" }}
          </div>
        </div>
      </div>
      <button
        v-if="hasEditPermission || editable"
        type="button"
        class="pp-summary-section-mask"
        @click="openSummaryDialogFromSection"
      >
        <i class="bx bx-pencil" aria-hidden="true"></i>
      </button>
    </div> -->

    <div class="pp-summary-pdf">
      <div class="pp-summary-pdf-head">
        <div class="pp-summary-pdf-title">
          个人年度总结补充
          <span v-if="summaryPdfFileName" class="pp-summary-pdf-subtitle">{{ summaryPdfFileName }}</span>
        </div>
        <div class="pp-summary-pdf-actions">
          <button
            v-if="canEditSummary"
            type="button"
            class="pp-summary-pdf-action primary"
            @click="handleSummaryEdit"
          >
            在线填写
          </button>
          <button type="button" class="pp-summary-pdf-action" @click="refreshSummaryPdf">刷新</button>
          <button
            v-if="summaryPdfUrl"
            type="button"
            class="pp-summary-pdf-action"
            @click="openSummaryPdfInNewTab"
          >
            新窗口打开
          </button>
        </div>
      </div>
      <div class="pp-summary-pdf-body">
        <div v-if="summaryPdfLoading" class="pp-summary-pdf-placeholder">
          正在加载报告...
        </div>
        <div v-else-if="summaryPdfError" class="pp-summary-pdf-placeholder">
          {{ summaryPdfError }}
        </div>
        <div v-else-if="summaryPdfUrl" class="pp-summary-pdf-frame">
          <iframe :src="summaryPdfUrlWithTimestamp" title="个人年度总结补充预览"></iframe>
        </div>
        <div v-else class="pp-summary-pdf-placeholder">
          暂无报告
        </div>
      </div>
    </div>

    <!-- 客户详情侧边栏 -->
    <CustomerSidebar
      v-if="showCustomerSidebar"
      :custId="currentCustomerId"
      :showSidebar="showCustomerSidebar"
      @update:showSidebar="handleCustomerSidebarUpdate"
    />

    <WorkhourViewModal
      v-model="workhourViewOpen"
      :hours-id="activeWorkhourId"
    />

    <el-dialog
      v-model="performanceScoreDialogOpen"
      title="绩效分打分"
      width="420px"
      :close-on-click-modal="false"
    >
      <div class="pp-performance-score-dialog">
        <div class="pp-performance-score-field">
          <span class="pp-performance-score-label">绩效分</span>
          <el-input
            v-model.number="performanceScoreInput"
            type="number"
            placeholder="请输入绩效分"
          />
        </div>
        <div class="pp-performance-score-tip">保留一位小数</div>
      </div>
      <template #footer>
        <el-button @click="performanceScoreDialogOpen = false">取消</el-button>
        <el-button type="primary" @click="savePerformanceScore">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="scoreRecordsOpen"
      title="打分记录"
      width="720px"
      class="pp-performance-records-dialog"
    >
      <div class="pp-performance-records">
        <div v-if="scoreRecordsLoading" class="pp-performance-records-loading">
          加载中...
        </div>
        <div v-else-if="scoreRecords.length === 0" class="pp-performance-records-empty">
          暂无记录
        </div>
        <div v-else class="pp-performance-records-list">
          <div v-for="record in scoreRecords" :key="record.id" class="pp-performance-record">
            <div class="pp-performance-record-line">
              <span class="pp-performance-record-title">{{ record.attributeName || "绩效分" }}</span>
              <span class="pp-performance-record-chip old">原值：{{ formatRecordValue(record.oldValue) }}</span>
              <span class="pp-performance-record-arrow">→</span>
              <span class="pp-performance-record-chip new">新值：{{ formatRecordValue(record.newValue) }}</span>
              <span class="pp-performance-record-user">{{ record.modifierUserName || "--" }}</span>
              <span class="pp-performance-record-date">{{ record.modifierDate || "--" }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

</template>

<script setup>
/* global defineProps */
import { computed, onBeforeUnmount, onMounted, ref, watch, nextTick } from "vue";
import { useStore } from "vuex";
import DonutChart from "@/views/performance-assessment/components/DonutChart.vue";
import FieldPieChart from "@/views/performance-assessment/components/FieldPieChart.vue";
import CustomSelect from "@/views/performance-assessment/components/CustomSelect.vue";
import * as echarts from "echarts";
import html2canvas from "html2canvas";
import { getPopoverDetail, getHardMetrics, addSoftMetricRecords, updateSoftMetricRecords, deleteSoftMetricRecords, addSummary, upSummary, addSoftmetrics, upSoftmetrics, querySoftmetrics, getPerformanceRecords } from "@/api/performanceAssessmentApi";
import { queryMaterialByUserIdAndYear } from "@/api/material";
import { viewPdf } from "@/utils";
import { getProgID, doEditInOffice } from "@/utils/editInOffice";
import { Search, View } from "@element-plus/icons-vue";
import { ElMessage } from 'element-plus';
import CustomerSidebar from "@/components/sidebar/customer-sidebar";
import WorkhourViewModal from "@/components/common/workhour-view-modal.vue";
// 测试模式：暂时注释，统一使用 custId=2
// import { queryCustomerNameId } from "@/api/customerList";

const store = useStore();

const props = defineProps({
  performance: {
    type: Object,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  editable: {
    type: Boolean,
    default: false,
  },
  onToggleEdit: {
    type: Function,
    default: null,
  },
  hasEditPermission: {
    type: Boolean,
    default: true,
  },
  summaryEditPermission: {
    type: Boolean,
    default: false,
  },
  hasScorePermission: {
    type: Boolean,
    default: false, 
  },
});

const summaryCards = computed(() => {
  const cards = props.performance?.hardMetrics?.summaryCards || [];
  if (cards.some(card => card && card.key === "judgments")) {
    return cards;
  }
  const totalScore = typeof props.performance?.hardMetrics?.scoreTotal === "number"
    ? props.performance.hardMetrics.scoreTotal
    : 0;
  return [
    ...cards,
    { key: "judgments", label: "绩效分", value: totalScore, delta: 0 },
  ];
});

// 检查导出报告权限（权限ID: 534）
const hasExportReportPermission = computed(() => {
  const permissions = store.state.user.permissions || [];
  return permissions.includes(534);
});

const localSoftMetrics = ref([]);
const originalSoftCounts = ref([]);
const softDialogOpen = ref(false);
const softDialogMode = ref("add");
const softDialogGroupKey = ref("");
const softDialogText = ref("");
const softDialogType = ref("");
const softDialogDate = ref("");
const softDialogRecordIndex = ref(-1);
const softDialogEditGroupIndex = ref(-1);

const summaryDialogOpen = ref(false);
const summaryDialogGroupIndex = ref(-1);
const summaryDialogFields = ref({
  plan: "",
  suggestion: "",
  other: "",
});

const summaryPdfLoading = ref(false);
const summaryPdfUrl = ref("");
const summaryPdfError = ref("");
const summaryPdfTimestamp = ref(Date.now());
const summaryPdfFileName = ref("");
const summaryDocAddress = ref("");

const softScoreEditing = ref(false);
const softScoreBackup = ref([]);
const softScoreLocal = ref([]);
const softScoreId = ref(null); // 存储打分记录的 id，用于判断是新增还是更新
const performanceScoreValue = ref(null);
const performanceScoreDialogOpen = ref(false);
const performanceScoreInput = ref(null);
const exportingReport = ref(false);
const scoreRecordsOpen = ref(false);
const scoreRecordsLoading = ref(false);
const scoreRecords = ref([]);

const openTypeFilterKey = ref("");
const softTypeFilters = ref({});

// 各领域占比客户列表数据
const coordinatorFieldClients = ref([]);
const coordinatorFieldSearchText = ref("");
const coordinatorFieldPageNo = ref(1);
const coordinatorFieldPageSize = 20;
const coordinatorFieldLoading = ref(false);
const coordinatorFieldFinished = ref(false);
const filteredCoordinatorFieldClients = computed(() => {
  if (!coordinatorFieldSearchText.value) {
    return coordinatorFieldClients.value;
  }
  const searchText = coordinatorFieldSearchText.value.toLowerCase();
  return coordinatorFieldClients.value.filter(client => 
    client.name && client.name.toLowerCase().includes(searchText)
  );
});

// 协调人业绩上涨/下降客户数据
const coordinatorUpClients = ref([]);
const coordinatorDownClients = ref([]);
// 获取 coordinator 模块
const coordinatorModule = computed(() => {
  if (!props.performance?.hardMetrics?.modules) return null;
  return props.performance.hardMetrics.modules.find(m => m && m.type === 'coordinator');
});
// 优先使用接口返回的 increased/decreased 字段，如果没有则使用客户列表长度
const coordinatorUpClientsCount = computed(() => {
  if (coordinatorModule.value && coordinatorModule.value.increased !== undefined && coordinatorModule.value.increased !== null) {
    return coordinatorModule.value.increased;
  }
  return coordinatorUpClients.value.length;
});
const coordinatorDownClientsCount = computed(() => {
  if (coordinatorModule.value && coordinatorModule.value.decreased !== undefined && coordinatorModule.value.decreased !== null) {
    return coordinatorModule.value.decreased;
  }
  return coordinatorDownClients.value.length;
});
const selectedCoordinatorUpClient = ref("");
const selectedCoordinatorDownClient = ref("");
const selectedCoordinatorUpClientId = ref(null);
const selectedCoordinatorDownClientId = ref(null);
const coordinatorUpYearRange = ref("3");
const coordinatorDownYearRange = ref("3");
const coordinatorUpChartRef = ref(null);
const coordinatorDownChartRef = ref(null);
const coordinatorUpChart = ref(null);
const coordinatorDownChart = ref(null);
const coordinatorUpPopoverReady = ref(false);
const coordinatorDownPopoverReady = ref(false);
let coordinatorUpChartTimer = null;
let coordinatorDownChartTimer = null;
const coordinatorUpChartReady = ref(false);
const coordinatorDownChartReady = ref(false);
const coordinatorUpPendingOption = ref(null);
const coordinatorDownPendingOption = ref(null);
let coordinatorUpResizeObserver = null;
let coordinatorDownResizeObserver = null;
const currentCoordinatorModule = ref(null);
const coordinatorUpListFetched = ref(false);
const coordinatorDownListFetched = ref(false);
const coordinatorPageSize = 1000;
const coordinatorUpPageNo = ref(1);
const coordinatorDownPageNo = ref(1);
const coordinatorUpPaging = ref(false);
const coordinatorDownPaging = ref(false);
const coordinatorUpFinished = ref(false);
const coordinatorDownFinished = ref(false);

const ownerClientState = ref({
  list: [],
  pageNo: 1,
  pageSize: 10,
  loading: false,
  finished: false,
});
const ownerCustContactState = ref({
  list: [],
  pageNo: 1,
  pageSize: 10,
  loading: false,
  finished: false,
});
const groupPopoverStates = ref({});
const groupPageSize = 10;

const getGroupStateKey = (item) => `group-${item?.label || item?.key || "default"}`;
const getGroupState = (item) => {
  const key = getGroupStateKey(item);
  if (!groupPopoverStates.value[key]) {
    groupPopoverStates.value[key] = {
      list: [],
      pageNo: 1,
      pageSize: groupPageSize,
      loading: false,
      finished: false,
    };
  }
  return groupPopoverStates.value[key];
};

const undertakeClientState = ref({
  list: [],
  pageNo: 1,
  pageSize: 10,
  loading: false,
  finished: false,
});

const participantStates = ref({});
const participantPersonnelStates = ref({});
const participantPageSize = 10;
const getParticipantStateKey = (item) => `participant-${item?.label || item?.key || "default"}`;
const getParticipantPersonnelStateKey = (item) => `participant-personnel-${item?.label || item?.key || "default"}`;
const getParticipantState = (item) => {
  const key = getParticipantStateKey(item);
  if (!participantStates.value[key]) {
    participantStates.value[key] = {
      list: [],
      pageNo: 1,
      pageSize: participantPageSize,
      loading: false,
      finished: false,
    };
  }
  return participantStates.value[key];
};

const getParticipantPersonnelState = (item) => {
  const key = getParticipantPersonnelStateKey(item);
  if (!participantPersonnelStates.value[key]) {
    participantPersonnelStates.value[key] = {
      list: [],
      pageNo: 1,
      pageSize: participantPageSize,
      loading: false,
      finished: false,
    };
  }
  return participantPersonnelStates.value[key];
};

const participantActivityStates = ref({});
const participantActivityPageSize = 10;
const getParticipantActivityStateKey = (item) => `participant-activity-${item?.label || item?.key || "default"}`;
const getParticipantActivityState = (item) => {
  const key = getParticipantActivityStateKey(item);
  if (!participantActivityStates.value[key]) {
    participantActivityStates.value[key] = {
      list: [],
      pageNo: 1,
      pageSize: participantActivityPageSize,
      loading: false,
      finished: false,
    };
  }
  return participantActivityStates.value[key];
};
const workhourViewOpen = ref(false);
const activeWorkhourId = ref(null);

// 搜索文本
const coordinatorUpSearchText = ref("");
const coordinatorDownSearchText = ref("");

// 过滤后的客户列表
const filteredCoordinatorUpClients = computed(() => {
  if (!coordinatorUpSearchText.value) {
    return coordinatorUpClients.value;
  }
  const searchText = coordinatorUpSearchText.value.toLowerCase();
  return coordinatorUpClients.value.filter(client => 
    client.name && client.name.toLowerCase().includes(searchText)
  );
});

const filteredCoordinatorDownClients = computed(() => {
  if (!coordinatorDownSearchText.value) {
    return coordinatorDownClients.value;
  }
  const searchText = coordinatorDownSearchText.value.toLowerCase();
  return coordinatorDownClients.value.filter(client => 
    client.name && client.name.toLowerCase().includes(searchText)
  );
});

// 不自动渲染图表，等待手动点击客户

// 客户负责人的业绩上涨/下降客户数据
const ownerUpClients = ref([]);
const ownerDownClients = ref([]);
const ownerUpPopoverReady = ref(false);
const ownerDownPopoverReady = ref(false);
// 获取 customer-owner 模块
const ownerModule = computed(() => {
  if (!props.performance?.hardMetrics?.modules) return null;
  const module = props.performance.hardMetrics.modules.find(m => m && m.type === 'customer-owner');
  // 如果 modules 中没有，尝试从 customerOwnerModule 中获取
  return module || customerOwnerModule.value;
});
// 优先使用接口返回的 increased/decreased 字段，如果没有则使用客户列表长度
const ownerUpClientsCount = computed(() => {
  if (ownerModule.value && ownerModule.value.increased !== undefined && ownerModule.value.increased !== null) {
    return ownerModule.value.increased;
  }
  return ownerUpClients.value.length;
});
const ownerDownClientsCount = computed(() => {
  if (ownerModule.value && ownerModule.value.decreased !== undefined && ownerModule.value.decreased !== null) {
    return ownerModule.value.decreased;
  }
  return ownerDownClients.value.length;
});
const selectedOwnerUpClient = ref("");
const selectedOwnerDownClient = ref("");
const selectedOwnerUpClientId = ref(null);
const selectedOwnerDownClientId = ref(null);
const currentOwnerModule = ref(null);
// 单独存储 customer-owner 模块数据（如果不在 hardMetrics.modules 中）
const customerOwnerModule = ref(null);
// 单独存储 customer-group 模块数据（如果不在 hardMetrics.modules 中）
const customerGroupModule = ref(null);
// 单独存储 undertake 模块数据（如果不在 hardMetrics.modules 中）
const undertakeModule = ref(null);
// 单独存储 participant 模块数据（如果不在 hardMetrics.modules 中）
const participantModule = ref(null);
// 单独存储 attendance 模块数据（如果不在 hardMetrics.modules 中）
const attendanceModule = ref(null);

// 搜索文本
const ownerUpSearchText = ref("");
const ownerDownSearchText = ref("");

// 过滤后的客户列表
const filteredOwnerUpClients = computed(() => {
  if (!ownerUpSearchText.value) {
    return ownerUpClients.value;
  }
  const searchText = ownerUpSearchText.value.toLowerCase();
  return ownerUpClients.value.filter(client => 
    client.name && client.name.toLowerCase().includes(searchText)
  );
});

const filteredOwnerDownClients = computed(() => {
  if (!ownerDownSearchText.value) {
    return ownerDownClients.value;
  }
  const searchText = ownerDownSearchText.value.toLowerCase();
  return ownerDownClients.value.filter(client => 
    client.name && client.name.toLowerCase().includes(searchText)
  );
});

// 客户详情侧边栏
const showCustomerSidebar = ref(false);
const currentCustomerId = ref(null);

// 处理客户侧边栏更新
const handleCustomerSidebarUpdate = (value) => {
  showCustomerSidebar.value = value;
};

// 查看客户详情
const viewClientDetail = async (type, client) => {
  if (!client) {
    console.warn('客户信息不完整，无法查看详情');
    return;
  }

  // 优先使用 client.custId，如果存在则直接使用
  if (client.custId !== undefined && client.custId !== null) {
    currentCustomerId.value = client.custId;
    showCustomerSidebar.value = true;
    return;
  }

  const clientName = client.custName || client.name || client.customer || '';
  if (!clientName) {
    console.warn('客户信息不完整，无法查看详情');
    return;
  }
  
  // 如果没有 custId，则根据客户名称查询客户ID
  // 测试模式：统一使用 custId=2（仅在没有 custId 时使用）
  // 正式环境代码（已注释，测试完成后可启用）
  // try {
  //   const res = await queryCustomerNameId({
  //     pageNo: 1,
  //     pageSize: 1,
  //     isCustomer: 1,
  //     keyword: client.name
  //   });
  //   
  //   if (res && res.data && res.data.length > 0) {
  //     const customer = res.data[0];
  //     currentCustomerId.value = customer.custId;
  //     showCustomerSidebar.value = true;
  //   } else {
  //     console.warn(`未找到客户：${client.name}`);
  //     // 可以显示一个提示消息
  //   }
  // } catch (error) {
  //   console.error('查询客户ID失败:', error);
  // }
  
  // 临时测试：如果没有 custId，使用固定值
  currentCustomerId.value = 2;
  showCustomerSidebar.value = true;
};

// 加载协调客户账单额列表
const loadCoordinatorFieldClients = async ({ reset = false, allowPaging = false } = {}) => {
  if (!reset && !allowPaging && coordinatorFieldClients.value.length > 0) return;
  if (reset) {
    coordinatorFieldClients.value = [];
    coordinatorFieldPageNo.value = 1;
    coordinatorFieldFinished.value = false;
  }
  if (coordinatorFieldLoading.value || coordinatorFieldFinished.value) return;
  coordinatorFieldLoading.value = true;
  
  try {
    const userId = props.performance?.user?.userId || props.performance?.user?.id;
    const keyword = coordinatorFieldSearchText.value.trim();
    const res = await getPopoverDetail({
      userId,
      year: props.year,
      detailType: 'coordinator-client-list',
      keyword: keyword || undefined,
      pageNo: coordinatorFieldPageNo.value,
      pageSize: coordinatorFieldPageSize,
    });
    
    if (res.success === true && res.data) {
      const rows = Array.isArray(res.data)
        ? res.data
        : (res.data.rows || []);
      const mapped = rows.map(row => ({
        name: row.name || row.customerName || '',
        custName: row.custName,
        amount: row.billSum || row.amount || '',
        custId: row.custId
      }));
      coordinatorFieldClients.value = coordinatorFieldClients.value.concat(mapped);
      
      if (rows.length < coordinatorFieldPageSize) {
        coordinatorFieldFinished.value = true;
      } else {
        coordinatorFieldPageNo.value += 1;
      }
    }
  } catch (error) {
    console.error('加载协调客户账单额列表失败:', error);
  } finally {
    coordinatorFieldLoading.value = false;
  }
};

const handleCoordinatorFieldSearchInput = () => {
  loadCoordinatorFieldClients({ reset: true });
};

const handleCoordinatorFieldScroll = (event) => {
  const target = event?.target;
  if (!target) return;
  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 20) {
    loadCoordinatorFieldClients({ allowPaging: true });
  }
};

// 加载协调人业绩上涨/下降客户数据（完整数据，包括变化比例）
const loadCoordinatorPerformanceData = async (module, type) => {
  currentCoordinatorModule.value = module;

  if (type === 'up' || type === 'down') {
    const fetchedRef = type === 'up' ? coordinatorUpListFetched : coordinatorDownListFetched;
    if (!fetchedRef.value) {
      try {
        if (type === 'up') {
          coordinatorUpClients.value = [];
          coordinatorUpPageNo.value = 1;
          coordinatorUpFinished.value = false;
        } else {
          coordinatorDownClients.value = [];
          coordinatorDownPageNo.value = 1;
          coordinatorDownFinished.value = false;
        }
        await loadCoordinatorClientPage(type);
        fetchedRef.value = true;
      } catch (error) {
        const label = type === 'up' ? '上涨' : '下降';
        console.error(`加载协调人业绩${label}客户列表失败:`, error);
      }
    }
  }
  
  // 首次进入不自动选中、不自动渲染图表
};

const handleCoordinatorPopoverEnter = async (module, type) => {
  if (type === 'up') {
    coordinatorUpPopoverReady.value = true;
    selectedCoordinatorUpClientId.value = null;
    selectedCoordinatorUpClient.value = "";
    coordinatorUpChartReady.value = false;
    coordinatorUpPendingOption.value = null;
    setupCoordinatorChartObserver("up");
  } else {
    coordinatorDownPopoverReady.value = true;
    selectedCoordinatorDownClientId.value = null;
    selectedCoordinatorDownClient.value = "";
    coordinatorDownChartReady.value = false;
    coordinatorDownPendingOption.value = null;
    setupCoordinatorChartObserver("down");
  }
  await loadCoordinatorPerformanceData(module, type);
};

const handleCoordinatorPopoverLeave = (type) => {
  if (type === 'up') {
    coordinatorUpPopoverReady.value = false;
    coordinatorUpChartReady.value = false;
    coordinatorUpPendingOption.value = null;
    if (coordinatorUpResizeObserver) {
      coordinatorUpResizeObserver.disconnect();
      coordinatorUpResizeObserver = null;
    }
    if (coordinatorUpChart.value) {
      coordinatorUpChart.value.dispose();
      coordinatorUpChart.value = null;
    }
  } else {
    coordinatorDownPopoverReady.value = false;
    coordinatorDownChartReady.value = false;
    coordinatorDownPendingOption.value = null;
    if (coordinatorDownResizeObserver) {
      coordinatorDownResizeObserver.disconnect();
      coordinatorDownResizeObserver = null;
    }
    if (coordinatorDownChart.value) {
      coordinatorDownChart.value.dispose();
      coordinatorDownChart.value = null;
    }
  }
};

const handleOwnerPopoverEnter = async (module, type) => {
  if (type === "up") {
    ownerUpPopoverReady.value = true;
    selectedOwnerUpClientId.value = null;
    selectedOwnerUpClient.value = "";
  } else {
    ownerDownPopoverReady.value = true;
    selectedOwnerDownClientId.value = null;
    selectedOwnerDownClient.value = "";
  }
  await loadOwnerPerformanceData(module, type);
};

const handleOwnerPopoverLeave = (type) => {
  if (type === "up") {
    ownerUpPopoverReady.value = false;
    selectedOwnerUpClientId.value = null;
    selectedOwnerUpClient.value = "";
  } else {
    ownerDownPopoverReady.value = false;
    selectedOwnerDownClientId.value = null;
    selectedOwnerDownClient.value = "";
  }
};

const scheduleCoordinatorChartRender = (type, delay = 120) => {
  const timerRef = type === "up" ? "coordinatorUpChartTimer" : "coordinatorDownChartTimer";
  if (timerRef === "coordinatorUpChartTimer") {
    if (coordinatorUpChartTimer) clearTimeout(coordinatorUpChartTimer);
    coordinatorUpChartTimer = setTimeout(() => {
      nextTick(() => initCoordinatorPerformanceChart("up"));
    }, delay);
  } else {
    if (coordinatorDownChartTimer) clearTimeout(coordinatorDownChartTimer);
    coordinatorDownChartTimer = setTimeout(() => {
      nextTick(() => initCoordinatorPerformanceChart("down"));
    }, delay);
  }
};

const getCoordinatorChartElement = (type) => {
  const chartRef = type === 'up' ? coordinatorUpChartRef : coordinatorDownChartRef;
  let element = chartRef.value;
  if (element && typeof element === 'object' && !(element instanceof HTMLElement)) {
    element = element.$el ?? element.el ?? element.element ?? element;
  }
  if (!element || !(element instanceof HTMLElement)) {
    const popoverClass = type === 'up' 
      ? '.pp-coordinator-performance-popover-up' 
      : '.pp-coordinator-performance-popover-down';
    const popover = document.querySelector(popoverClass);
    if (popover) {
      const chartType = type === 'up' ? 'coordinator-up' : 'coordinator-down';
      element = popover.querySelector(`.pp-coordinator-chart-body[data-chart-type="${chartType}"]`);
    }
  }
  return element instanceof HTMLElement ? element : null;
};

const setupCoordinatorChartObserver = (type) => {
  if (typeof ResizeObserver === "undefined") return;
  const readyRef = type === 'up' ? coordinatorUpChartReady : coordinatorDownChartReady;
  const observerRef = type === 'up' ? coordinatorUpResizeObserver : coordinatorDownResizeObserver;
  if (observerRef) return;
  const element = getCoordinatorChartElement(type);
  if (!element) return;
  const observer = new ResizeObserver((entries) => {
    const entry = entries && entries.length > 0 ? entries[0] : null;
    const rect = entry ? entry.contentRect : null;
    if (!rect || rect.width < 10 || rect.height < 10) return;
    const instance = echarts.getInstanceByDom(element) || echarts.init(element);
    if (type === 'up') {
      coordinatorUpChart.value = instance;
    } else {
      coordinatorDownChart.value = instance;
    }
    readyRef.value = true;
    observer.disconnect();
    if (type === 'up') {
      coordinatorUpResizeObserver = null;
      if (coordinatorUpPendingOption.value) {
        instance.setOption(coordinatorUpPendingOption.value, { notMerge: true, lazyUpdate: true });
        coordinatorUpPendingOption.value = null;
      }
    } else {
      coordinatorDownResizeObserver = null;
      if (coordinatorDownPendingOption.value) {
        instance.setOption(coordinatorDownPendingOption.value, { notMerge: true, lazyUpdate: true });
        coordinatorDownPendingOption.value = null;
      }
    }
  });
  observer.observe(element);
  if (type === 'up') {
    coordinatorUpResizeObserver = observer;
  } else {
    coordinatorDownResizeObserver = observer;
  }
};

// 加载客户负责人的业绩数据
const normalizeOwnerListItem = (row, type) => {
  const name = row.name || row.custName || row.customerName || "";
  const amount = row.billSum || row.billSUm || row.amount || "";
  let changePercent = row.changePercent || row.percentage || row.percent || row.rate || "";
  let years = [];
  let data = [];
  if (Array.isArray(row.qxlist)) {
    years = row.qxlist.map(item => item.year);
    data = row.qxlist.map(item => item.billSum ?? item.billSUm ?? 0);
  }
  if (!changePercent && Array.isArray(row.data) && row.data.length >= 2) {
    const recentTwoYears = row.data.slice(-2);
    const lastYear = recentTwoYears[0];
    const currentYear = recentTwoYears[1];
    if (lastYear !== 0) {
      const change = ((currentYear - lastYear) / lastYear) * 100;
      changePercent = type === "up" ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
    }
  }
  return {
    ...row,
    name,
    custName: row.custName || row.name || "",
    custId: row.custId,
    amount,
    changePercent: changePercent || "--",
    years,
    data,
  };
};

const loadOwnerPerformanceData = async (module, type = 'up') => {
  currentOwnerModule.value = module;
  if (type === "up") {
    ownerUpClients.value = [];
    selectedOwnerUpClientId.value = null;
    selectedOwnerUpClient.value = "";
  } else {
    ownerDownClients.value = [];
    selectedOwnerDownClientId.value = null;
    selectedOwnerDownClient.value = "";
  }

  try {
    const detailType = type === 'up' ? 'owner-client-list-ss' : 'owner-client-list-xj';
    const userId = props.performance?.user?.userId || props.performance?.user?.id;
    const res = await getPopoverDetail({
      userId,
      year: props.year,
      detailType
    });
    if (res?.success === true && res.data) {
      const rows = Array.isArray(res.data)
        ? res.data
        : (res.data.rows || []);
      const mapped = rows.map((row) => normalizeOwnerListItem(row, type));
      if (type === "up") {
        ownerUpClients.value = mapped;
      } else {
        ownerDownClients.value = mapped;
      }
    }
  } catch (error) {
    console.error(`加载客户负责人业绩${type === 'up' ? '上涨' : '下降'}数据失败:`, error);
  }
};

// 选择客户负责人客户
const selectOwnerClient = (type, client) => {
  if (type === 'up') {
    selectedOwnerUpClientId.value = client.custId ?? client.name;
    selectedOwnerUpClient.value = client.name;
  } else {
    selectedOwnerDownClientId.value = client.custId ?? client.name;
    selectedOwnerDownClient.value = client.name;
  }
  nextTick(() => {
    setTimeout(() => {
      initOwnerPerformanceChart(currentOwnerModule.value, type);
    }, 200);
  });
};

// 选择客户
const selectCoordinatorClient = (type, client) => {
  if (type === 'up') {
    selectedCoordinatorUpClientId.value = client.custId ?? client.name;
    selectedCoordinatorUpClient.value = client.name;
    // 等待DOM更新后再初始化图表
    scheduleCoordinatorChartRender("up", 120);
  } else {
    selectedCoordinatorDownClientId.value = client.custId ?? client.name;
    selectedCoordinatorDownClient.value = client.name;
    // 等待DOM更新后再初始化图表
    scheduleCoordinatorChartRender("down", 120);
  }
};

// 初始化协调人业绩图表
const initCoordinatorPerformanceChart = (type) => {
  const clients = type === 'up' ? coordinatorUpClients : coordinatorDownClients;
  const selectedClient = type === 'up' ? selectedCoordinatorUpClient : selectedCoordinatorDownClient;
  const selectedClientId = type === 'up' ? selectedCoordinatorUpClientId : selectedCoordinatorDownClientId;
  const yearRange = type === 'up' ? coordinatorUpYearRange : coordinatorDownYearRange;
  const readyRef = type === 'up' ? coordinatorUpPopoverReady : coordinatorDownPopoverReady;
  const chartReadyRef = type === 'up' ? coordinatorUpChartReady : coordinatorDownChartReady;

  if (!readyRef.value) return;
  const client = selectedClient.value
    ? (clients.value.find(c => (c.custId ?? c.name) === selectedClientId.value) ||
      clients.value.find(c => c.name === selectedClient.value))
    : null;

  const element = getCoordinatorChartElement(type);
  if (!element || !(element instanceof HTMLElement)) return;
  if (!document.body.contains(element)) return;
  const rect = element.getBoundingClientRect();
  if (rect.width < 10 || rect.height < 10) return;

  if (!client || !client.data) return;

  const yearCount = parseInt(yearRange.value, 10);
  const years = Array.isArray(client.years) ? client.years : [];
  const data = Array.isArray(client.data) ? client.data : [];
  const recentYears = years.slice(-yearCount);
  const recentData = data.slice(-yearCount).map((value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  });
  const validLength = Math.min(recentYears.length, recentData.length);
  const normalizedYears = validLength > 0 ? recentYears.slice(-validLength) : [];
  const normalizedData = validLength > 0 ? recentData.slice(-validLength) : [];
  if (normalizedYears.length === 0 || normalizedData.length === 0) return;

  const option = {
    animation: false,
    tooltip: {
      trigger: "axis",
      formatter: (params) => {
        const param = params && params.length > 0 ? params[0] : null;
        if (!param) return "";
        return `${param.name}<br/>${param.seriesName}: ¥${param.value.toLocaleString()}`;
      },
    },
    grid: {
      left: "70px",
      right: "20px",
      top: "20px",
      bottom: "30px",
    },
    xAxis: {
      type: "category",
      data: normalizedYears,
      boundaryGap: false,
      axisLine: {
        onZero: false,
        lineStyle: { color: "#e1e7f2" },
      },
      axisLabel: {
        color: "#7c8ba1",
        fontSize: 11,
      },
    },
    yAxis: {
      type: "value",
      scale: true,
      axisLine: { show: false, onZero: false },
      axisTick: { show: false },
      axisLabel: {
        color: "#7c8ba1",
        fontSize: 11,
        formatter: (value) => {
          if (value >= 10000) {
            return `¥${(value / 10000).toFixed(1)}万`;
          }
          return `¥${value}`;
        },
      },
      splitLine: {
        lineStyle: { color: "#f0f3f9", type: "dashed" },
      },
    },
    series: [
      {
        name: client.name,
        type: "line",
        data: normalizedData,
        smooth: true,
        animation: false,
        label: {
          show: true,
          position: "top",
          color: "#54657e",
          fontSize: 11,
          formatter: ({ value }) => `¥${Number(value || 0).toLocaleString()}`,
        },
        tooltip: {
          show: true,
          trigger: "item",
          formatter: ({ name, value }) => `${name}<br/>${client.name}: ¥${Number(value || 0).toLocaleString()}`,
        },
        lineStyle: {
          color: type === 'up' ? "#ff4757" : "#2fbf71",
          width: 2,
        },
        itemStyle: {
          color: type === 'up' ? "#ff4757" : "#2fbf71",
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: type === 'up' ? "rgba(255, 71, 87, 0.2)" : "rgba(47, 191, 113, 0.2)",
              },
              {
                offset: 1,
                color: type === 'up' ? "rgba(255, 71, 87, 0)" : "rgba(47, 191, 113, 0)",
              },
            ],
          },
        },
      },
    ],
  };

  const pendingRef = type === 'up' ? coordinatorUpPendingOption : coordinatorDownPendingOption;
  if (!chartReadyRef.value) {
    pendingRef.value = option;
    setupCoordinatorChartObserver(type);
    return;
  }
  const instance = type === 'up' ? coordinatorUpChart.value : coordinatorDownChart.value;
  if (!instance || (instance.isDisposed && instance.isDisposed())) return;
  try {
    instance.setOption(option, { notMerge: true, lazyUpdate: true });
  } catch (error) {
    console.warn("协调人业绩图表渲染异常:", error);
  }
};

// 更新协调人业绩图表（保留用于可能的后续需求）
// eslint-disable-next-line no-unused-vars
const updateCoordinatorPerformanceChart = (type) => {
  // 延迟一下确保DOM已更新
  nextTick(() => {
    setTimeout(() => {
      initCoordinatorPerformanceChart(type);
    }, 150);
  });
};

// 所有客户列表的搜索文本（使用 key 区分不同的列表）
const clientSearchTexts = ref({});

const developerPopoverStates = ref({});
const developerSearchTimers = ref({});
const developerPageSize = 10;

const getDeveloperStateKey = (item) => `developer-${item?.label || item?.key || "default"}`;
const isDeveloperCrossDomain = (item) => item?.label === "跨领域开发";
const isDeveloperExistingCrossDomain = (item) => item?.label === "现有客户跨领域开发";
const getDeveloperDetailType = (item) => {
  if (isDeveloperCrossDomain(item)) return "developer-client-list-kly";
  if (isDeveloperExistingCrossDomain(item)) return "developer-client-list-xykh";
  return "developer-client-list";
};
const shouldShowDeveloperPopover = () => true;

const shouldShowOwnerClientPopover = (item) => {
  const labels = ["客户数", "账单额", "案量", "回款率"];
  return labels.includes(item?.label);
};

const shouldShowGroupClientPopover = (item) => {
  const labels = ["客户数", "案量", "回款率"];
  return labels.includes(item?.label);
};

const resetDeveloperPopoverStates = () => {
  Object.values(developerSearchTimers.value).forEach((timer) => {
    if (timer) clearTimeout(timer);
  });
  developerSearchTimers.value = {};
  developerPopoverStates.value = {};
};

const getDeveloperState = (item) => {
  const key = getDeveloperStateKey(item);
  if (!developerPopoverStates.value[key]) {
    developerPopoverStates.value[key] = {
      list: [],
      pageNo: 1,
      pageSize: developerPageSize,
      loading: false,
      finished: false,
      cache: {},
    };
  }
  return developerPopoverStates.value[key];
};

const getDeveloperCacheKey = (keyword) => (keyword ? keyword : "__all__");

const restoreDeveloperCache = (state, keyword) => {
  const cacheKey = getDeveloperCacheKey(keyword);
  const cached = state.cache[cacheKey];
  if (!cached) return false;
  state.list = cached.list.slice();
  state.pageNo = cached.pageNo;
  state.finished = cached.finished;
  return true;
};

const loadDeveloperClients = async (item, { reset = false } = {}) => {
  const state = getDeveloperState(item);
  const searchKey = getDeveloperStateKey(item);
  const keyword = (clientSearchTexts.value[searchKey] || "").trim();

  if (reset) {
    state.list = [];
    state.pageNo = 1;
    state.finished = false;
  }

  if (!reset && state.loading) return;
  if (!reset && state.finished) return;

  if (reset || state.list.length === 0) {
    if (restoreDeveloperCache(state, keyword)) return;
  }

  const userId = props.performance?.user?.userId || props.performance?.user?.id;
  if (!userId || !props.year) return;

  state.loading = true;
  try {
    const res = await getPopoverDetail({
      userId,
      year: props.year,
      detailType: getDeveloperDetailType(item),
      keyword: keyword || undefined,
      pageNo: state.pageNo,
      pageSize: state.pageSize,
    });

    const rows = Array.isArray(res?.data) ? res.data : [];
    const normalized = rows.map((row) => ({
      custId: row.custId,
      name: row.name || row.custName || "--",
      custName: row.custName || row.name || "--",
      amount: row.billSum,
      caseCount: row.caseCount,
    }));

    state.list = reset ? normalized : state.list.concat(normalized);

    if (rows.length < state.pageSize) {
      state.finished = true;
    } else {
      state.pageNo += 1;
    }

    const cacheKey = getDeveloperCacheKey(keyword);
    state.cache[cacheKey] = {
      list: state.list.slice(),
      pageNo: state.pageNo,
      finished: state.finished,
    };
  } catch (error) {
    console.error("加载开发人员客户列表失败:", error);
  } finally {
    state.loading = false;
  }
};

const handleDeveloperPopoverOpen = (item) => {
  const state = getDeveloperState(item);
  if (state.list.length > 0) return;
  loadDeveloperClients(item, { reset: false });
};

const handleDeveloperSearchInput = (item) => {
  const key = getDeveloperStateKey(item);
  if (developerSearchTimers.value[key]) {
    clearTimeout(developerSearchTimers.value[key]);
  }
  developerSearchTimers.value[key] = setTimeout(() => {
    loadDeveloperClients(item, { reset: true });
  }, 300);
};

const loadOwnerClientList = async ({ reset = false, allowPaging = false } = {}) => {
  if (!reset && !allowPaging && ownerClientState.value.list.length > 0) return;
  if (reset) {
    ownerClientState.value.list = [];
    ownerClientState.value.pageNo = 1;
    ownerClientState.value.finished = false;
  }
  if (ownerClientState.value.loading || ownerClientState.value.finished) return;
  ownerClientState.value.loading = true;
  try {
    const userId = props.performance?.user?.userId || props.performance?.user?.id;
    const keyword = (clientSearchTexts.value.owner || "").trim();
    const res = await getPopoverDetail({
      userId,
      year: props.year,
      detailType: "owner-client-list",
      keyword: keyword || undefined,
      pageNo: ownerClientState.value.pageNo,
      pageSize: ownerClientState.value.pageSize,
    });

    if (res?.success === true && res.data) {
      const rows = Array.isArray(res.data)
        ? res.data
        : (res.data.rows || []);
      const mapped = rows.map(row => ({
        custId: row.custId,
        name: row.name || row.customerName || "",
        custName: row.custName,
        amount: row.billSum || row.amount || "",
        caseCount: row.caseCount || 0,
        repaymentRate: row.repaymentRate || "--",
      }));
      ownerClientState.value.list = ownerClientState.value.list.concat(mapped);

      if (rows.length < ownerClientState.value.pageSize) {
        ownerClientState.value.finished = true;
      } else {
        ownerClientState.value.pageNo += 1;
      }
    }
  } catch (error) {
    console.error("加载客户负责人客户列表失败:", error);
  } finally {
    ownerClientState.value.loading = false;
  }
};

const handleOwnerClientSearchInput = () => {
  loadOwnerClientList({ reset: true });
};

const handleOwnerClientScroll = (event) => {
  const target = event?.target;
  if (!target) return;
  if (ownerClientState.value.loading || ownerClientState.value.finished) return;
  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 20) {
    loadOwnerClientList({ allowPaging: true });
  }
};

const normalizeWorkContent = (text) => {
  if (!text) return "";
  return String(text).replace(/\s+/g, " ").trim();
};

const buildShortContent = (text, maxLength = 36) => {
  const normalized = normalizeWorkContent(text);
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength)}...`;
};

const loadOwnerCustContactList = async ({ reset = false, allowPaging = false } = {}) => {
  if (!reset && !allowPaging && ownerCustContactState.value.list.length > 0) return;
  if (reset) {
    ownerCustContactState.value.list = [];
    ownerCustContactState.value.pageNo = 1;
    ownerCustContactState.value.finished = false;
  }
  if (ownerCustContactState.value.loading || ownerCustContactState.value.finished) return;
  ownerCustContactState.value.loading = true;
  try {
    const userId = props.performance?.user?.userId || props.performance?.user?.id;
    const res = await getPopoverDetail({
      userId,
      year: props.year,
      detailType: "owner-cust-contact",
      pageNo: ownerCustContactState.value.pageNo,
      pageSize: ownerCustContactState.value.pageSize,
    });

    if (res?.success === true && res.data) {
      const rows = Array.isArray(res.data)
        ? res.data
        : (res.data.rows || []);
      const mapped = rows.map(row => ({
        hoursId: row.hoursId,
        workContent: normalizeWorkContent(row.workContent || ""),
        shortContent: buildShortContent(row.workContent || ""),
        approvedTime: row.approvedTime || "",
      }));
      ownerCustContactState.value.list = ownerCustContactState.value.list.concat(mapped);

      if (rows.length < ownerCustContactState.value.pageSize) {
        ownerCustContactState.value.finished = true;
      } else {
        ownerCustContactState.value.pageNo += 1;
      }
    }
  } catch (error) {
    console.error("加载客户联络列表失败:", error);
  } finally {
    ownerCustContactState.value.loading = false;
  }
};

const handleOwnerCustContactScroll = (event) => {
  const target = event?.target;
  if (!target) return;
  if (ownerCustContactState.value.loading || ownerCustContactState.value.finished) return;
  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 20) {
    loadOwnerCustContactList({ allowPaging: true });
  }
};

const openWorkhourView = (hoursId) => {
  if (!hoursId) return;
  activeWorkhourId.value = hoursId;
  workhourViewOpen.value = true;
};

const openPerformanceScoreDialog = async () => {
  // 确保先获取已有打分记录，避免重复创建
  if (!softScoreId.value && props.performance?.user && props.year) {
    await loadSoftScoreData();
  }
  performanceScoreInput.value = performanceScoreValue.value;
  performanceScoreDialogOpen.value = true;
};

const openScoreRecords = async () => {
  const userId = props.performance?.user?.userId || props.performance?.user?.id;
  if (!userId || !props.year) return;
  scoreRecordsOpen.value = true;
  scoreRecordsLoading.value = true;
  try {
    const res = await getPerformanceRecords({ userId, year: props.year });
    if (res?.success === true && res.data) {
      const list = Array.isArray(res.data) ? res.data : (res.data.rows || []);
      scoreRecords.value = list.sort((a, b) => parseRecordDate(b?.modifierDate) - parseRecordDate(a?.modifierDate));
    } else {
      scoreRecords.value = [];
    }
  } catch (error) {
    console.error("获取打分记录失败:", error);
    scoreRecords.value = [];
  } finally {
    scoreRecordsLoading.value = false;
  }
};

const savePerformanceScore = async () => {
  const userId = props.performance?.user?.userId || props.performance?.user?.id;
  if (!userId || !props.year) return;
  const scoreLabelToField = {
    '客户表扬与批评': 'praise',
    '团队建设': 'team',
    '对外联络': 'outreach',
    '对外宣传': 'publicity',
    '参与公司管理工作': 'company',
    '参与部门管理工作': 'department',
  };
  const requestData = {
    userId,
    year: props.year,
    performanceScore: roundScore(performanceScoreInput.value),
  };
  softScoreBreakdown.value.forEach((item) => {
    const fieldName = scoreLabelToField[item.label];
    if (fieldName) {
      requestData[fieldName] = roundScore(item.score);
    }
  });

  try {
    // 保存前再次确认是否已有记录
    if (!softScoreId.value) {
      const existing = await querySoftmetrics({ userId, year: props.year });
      if (existing?.success === true && existing.data?.id !== undefined && existing.data?.id !== null) {
        softScoreId.value = existing.data.id;
      }
    }
    let res;
    if (softScoreId.value) {
      requestData.id = softScoreId.value;
      res = await upSoftmetrics(requestData);
    } else {
      res = await addSoftmetrics(requestData);
    }
    if (res.success) {
      performanceScoreValue.value = requestData.performanceScore;
      if (res.data?.id !== undefined && res.data?.id !== null) {
        softScoreId.value = res.data.id;
      } else if (!softScoreId.value && res.data) {
        softScoreId.value = res.data.id || null;
      }
      performanceScoreDialogOpen.value = false;
      ElMessage({
        message: softScoreId.value ? '打分更新成功' : '打分保存成功',
        type: 'success',
        duration: 3000,
      });
    } else {
      ElMessage({
        message: res.message || '保存打分失败',
        type: 'error',
        duration: 3000,
      });
    }
  } catch (error) {
    ElMessage({
      message: '保存打分异常，请稍后重试',
      type: 'error',
      duration: 3000,
    });
    console.error('保存打分异常:', error);
  }
};

const normalizeCoordinatorListItem = (row, type) => {
  const name = row.name || row.custName || row.customerName || "";
  const amount = row.billSum || row.billSUm || row.amount || "";
  let changePercent = row.changePercent || row.percentage || row.percent || row.rate || "";
  let years = [];
  let data = [];
  if (Array.isArray(row.qxlist)) {
    years = row.qxlist.map(item => item.year);
    data = row.qxlist.map(item => item.billSum ?? item.billSUm ?? 0);
  }
  if (!changePercent && Array.isArray(row.data) && row.data.length >= 2) {
    const recentTwoYears = row.data.slice(-2);
    const lastYear = recentTwoYears[0];
    const currentYear = recentTwoYears[1];
    if (lastYear !== 0) {
      const change = ((currentYear - lastYear) / lastYear) * 100;
      changePercent = type === "up" ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
    }
  }
  return {
    ...row,
    name,
    custName: row.custName || row.name || "",
    custId: row.custId,
    amount,
    changePercent: changePercent || "--",
    years,
    data,
  };
};

const loadCoordinatorClientPage = async (type) => {
  const pagingRef = type === "up" ? coordinatorUpPaging : coordinatorDownPaging;
  const finishedRef = type === "up" ? coordinatorUpFinished : coordinatorDownFinished;
  const pageNoRef = type === "up" ? coordinatorUpPageNo : coordinatorDownPageNo;
  if (pagingRef.value || finishedRef.value) return;
  pagingRef.value = true;
  try {
    const userId = props.performance?.user?.userId || props.performance?.user?.id;
    const detailType = type === "up" ? "coordinator-client-list-ss" : "coordinator-client-list-xj";
    const res = await getPopoverDetail({
      userId,
      year: props.year,
      detailType,
      pageNo: pageNoRef.value,
      pageSize: coordinatorPageSize,
    });
    if (res?.success === true && res.data) {
      const rows = Array.isArray(res.data)
        ? res.data
        : (res.data.rows || []);
      const mapped = rows.map((row) => normalizeCoordinatorListItem(row, type));
      if (type === "up") {
        coordinatorUpClients.value = coordinatorUpClients.value.concat(mapped);
      } else {
        coordinatorDownClients.value = coordinatorDownClients.value.concat(mapped);
      }
      finishedRef.value = true;
    }
  } catch (error) {
    console.error("加载协调人客户列表分页失败:", error);
  } finally {
    pagingRef.value = false;
  }
};

const loadGroupClientList = async (item, { reset = false, allowPaging = false } = {}) => {
  const state = getGroupState(item);
  if (!reset && !allowPaging && state.list.length > 0) return;
  if (reset) {
    state.list = [];
    state.pageNo = 1;
    state.finished = false;
  }
  if (state.loading || state.finished) return;
  state.loading = true;
  try {
    const userId = props.performance?.user?.userId || props.performance?.user?.id;
    const keyword = (clientSearchTexts.value[getGroupStateKey(item)] || "").trim();
    const res = await getPopoverDetail({
      userId,
      year: props.year,
      detailType: "bossuser-custGroup",
      keyword: keyword || undefined,
      pageNo: state.pageNo,
      pageSize: state.pageSize,
    });

    if (res?.success === true && res.data) {
      const rows = Array.isArray(res.data)
        ? res.data
        : (res.data.rows || []);
      const mapped = rows.map(row => ({
        custId: row.custId,
        custName: row.custName || row.name || "",
        name: row.name || row.custName || "",
        amount: row.billSum || row.amount || "",
        caseCount: row.caseCount || 0,
        repaymentRate: row.repaymentRate || row.percentage || "",
        percentage: row.percentage,
      }));
      state.list = state.list.concat(mapped);

      if (rows.length < state.pageSize) {
        state.finished = true;
      } else {
        state.pageNo += 1;
      }
    }
  } catch (error) {
    console.error("加载客户组客户列表失败:", error);
  } finally {
    state.loading = false;
  }
};

const handleGroupClientSearchInput = (item) => {
  loadGroupClientList(item, { reset: true });
};

const handleGroupClientScroll = (item, event) => {
  const target = event?.target;
  if (!target) return;
  const state = getGroupState(item);
  if (state.loading || state.finished) return;
  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 20) {
    loadGroupClientList(item, { allowPaging: true });
  }
};

const loadUndertakeClientList = async ({ reset = false, allowPaging = false } = {}) => {
  if (!reset && !allowPaging && undertakeClientState.value.list.length > 0) return;
  if (reset) {
    undertakeClientState.value.list = [];
    undertakeClientState.value.pageNo = 1;
    undertakeClientState.value.finished = false;
  }
  if (undertakeClientState.value.loading || undertakeClientState.value.finished) return;
  undertakeClientState.value.loading = true;
  try {
    const userId = props.performance?.user?.userId || props.performance?.user?.id;
    const keyword = (clientSearchTexts.value.undertake || "").trim();
    const res = await getPopoverDetail({
      userId,
      year: props.year,
      detailType: "bossuser-cbGroupBill",
      keyword: keyword || undefined,
      pageNo: undertakeClientState.value.pageNo,
      pageSize: undertakeClientState.value.pageSize,
    });

    if (res?.success === true && res.data) {
      const rows = Array.isArray(res.data)
        ? res.data
        : (res.data.rows || []);
      const mapped = rows.map(row => ({
        custId: row.custId,
        custName: row.custName || row.name || "",
        name: row.name || row.custName || "",
        amount: row.billSum || row.amount || "",
        caseCount: row.caseCount || 0,
      }));
      undertakeClientState.value.list = undertakeClientState.value.list.concat(mapped);

      if (rows.length < undertakeClientState.value.pageSize) {
        undertakeClientState.value.finished = true;
      } else {
        undertakeClientState.value.pageNo += 1;
      }
    }
  } catch (error) {
    console.error("加载承办组客户列表失败:", error);
  } finally {
    undertakeClientState.value.loading = false;
  }
};

const handleUndertakeClientSearchInput = () => {
  loadUndertakeClientList({ reset: true });
};

const handleUndertakeClientScroll = (event) => {
  const target = event?.target;
  if (!target) return;
  if (undertakeClientState.value.loading || undertakeClientState.value.finished) return;
  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 20) {
    loadUndertakeClientList({ allowPaging: true });
  }
};

const loadParticipantCustomers = async (item, { reset = false, allowPaging = false } = {}) => {
  const state = getParticipantState(item);
  if (!reset && !allowPaging && state.list.length > 0) return;
  if (reset) {
    state.list = [];
    state.pageNo = 1;
    state.finished = false;
  }
  if (state.loading || state.finished) return;
  state.loading = true;
  try {
    const userId = props.performance?.user?.userId || props.performance?.user?.id;
    const keyword = (clientSearchTexts.value[`participant-customer-${item.label}`] || "").trim();
    const res = await getPopoverDetail({
      userId,
      year: props.year,
      detailType: "cry-custName",
      keyword: keyword || undefined,
      pageNo: state.pageNo,
      pageSize: state.pageSize,
    });

    if (res?.success === true && res.data) {
      const rows = Array.isArray(res.data)
        ? res.data
        : (res.data.rows || []);
      const mapped = rows.map(row => ({
        custId: row.custId,
        custName: row.custName || row.name || "",
        name: row.name || row.custName || "",
      }));
      state.list = state.list.concat(mapped);

      if (rows.length < state.pageSize) {
        state.finished = true;
      } else {
        state.pageNo += 1;
      }
    }
  } catch (error) {
    console.error("加载参与客户数量列表失败:", error);
  } finally {
    state.loading = false;
  }
};

const handleParticipantCustomerSearchInput = (item) => {
  loadParticipantCustomers(item, { reset: true });
};

const handleParticipantCustomerScroll = (item, event) => {
  const target = event?.target;
  if (!target) return;
  const state = getParticipantState(item);
  if (state.loading || state.finished) return;
  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 20) {
    loadParticipantCustomers(item, { allowPaging: true });
  }
};

const loadParticipantActivities = async (item, { reset = false, allowPaging = false } = {}) => {
  const state = getParticipantActivityState(item);
  if (!reset && !allowPaging && state.list.length > 0) return;
  if (reset) {
    state.list = [];
    state.pageNo = 1;
    state.finished = false;
  }
  if (state.loading || state.finished) return;
  state.loading = true;
  try {
    const userId = props.performance?.user?.userId || props.performance?.user?.id;
    const keyword = (clientSearchTexts.value[`participant-activity-${item.label}`] || "").trim();
    const res = await getPopoverDetail({
      userId,
      year: props.year,
      detailType: "cry-activityContent",
      keyword: keyword || undefined,
      pageNo: state.pageNo,
      pageSize: state.pageSize,
    });

    if (res?.success === true && res.data) {
      const rows = Array.isArray(res.data)
        ? res.data
        : (res.data.rows || []);
      const mapped = rows.map(row => ({
        custId: row.custId,
        custName: row.custName || row.name || "",
        activeName: row.activeName || row.name || "",
        activeDay: row.activeDay || row.time || "",
      }));
      state.list = state.list.concat(mapped);

      if (rows.length < state.pageSize) {
        state.finished = true;
      } else {
        state.pageNo += 1;
      }
    }
  } catch (error) {
    console.error("加载参与活动次数列表失败:", error);
  } finally {
    state.loading = false;
  }
};

const handleParticipantActivitySearchInput = (item) => {
  loadParticipantActivities(item, { reset: true });
};

const handleParticipantActivityScroll = (item, event) => {
  const target = event?.target;
  if (!target) return;
  const state = getParticipantActivityState(item);
  if (state.loading || state.finished) return;
  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 20) {
    loadParticipantActivities(item, { allowPaging: true });
  }
};

const loadParticipantPersonnel = async (item, { reset = false, allowPaging = false } = {}) => {
  const state = getParticipantPersonnelState(item);
  if (!reset && !allowPaging && state.list.length > 0) return;
  if (reset) {
    state.list = [];
    state.pageNo = 1;
    state.finished = false;
  }
  if (state.loading || state.finished) return;
  state.loading = true;
  try {
    const userId = props.performance?.user?.userId || props.performance?.user?.id;
    const keyword = (clientSearchTexts.value[`participant-personnel-${item.label}`] || "").trim();
    const res = await getPopoverDetail({
      userId,
      year: props.year,
      detailType: "cry-customerPerson",
      keyword: keyword || undefined,
      pageNo: state.pageNo,
      pageSize: state.pageSize,
    });

    if (res?.success === true && res.data) {
      const rows = Array.isArray(res.data)
        ? res.data
        : (res.data.rows || []);
      const mapped = rows.map(row => ({
        custId: row.custId,
        custName: row.custName || row.name || "",
        name: row.name || row.custName || "",
        custPerson: row.custPerson || "",
      }));
      state.list = state.list.concat(mapped);

      if (rows.length < state.pageSize) {
        state.finished = true;
      } else {
        state.pageNo += 1;
      }
    }
  } catch (error) {
    console.error("加载参与客户方人员列表失败:", error);
  } finally {
    state.loading = false;
  }
};

const handleParticipantPersonnelSearchInput = (item) => {
  loadParticipantPersonnel(item, { reset: true });
};

const handleParticipantPersonnelScroll = (item, event) => {
  const target = event?.target;
  if (!target) return;
  const state = getParticipantPersonnelState(item);
  if (state.loading || state.finished) return;
  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 20) {
    loadParticipantPersonnel(item, { allowPaging: true });
  }
};


// eslint-disable-next-line no-unused-vars
const fetchOwnerTopCustomerLevel2 = async (custId, _data) => {
  try {
    const userId = props.performance?.user?.userId || props.performance?.user?.id;
    const params = {
      userId,
      year: props.year,
      detailType: "owner-client-list-level2",
      pageNo: 1,
      pageSize: 50,
    };
    
    // 如果 custId 为空，说明点击的是"其他"，需要传递 notCustIds
    if (!custId) {
      // 从 computedModules 中找到 customer-owner 模块，获取前十客户的 custId 列表
      const ownerModule = computedModules.value.find(m => m && m.type === "customer-owner");
      if (ownerModule && ownerModule.charts && ownerModule.charts.topCustomers) {
        const topCustomerIds = ownerModule.charts.topCustomers
          .map(item => item.custId)
          .filter(id => id !== null && id !== undefined && id !== "");
        
        if (topCustomerIds.length > 0) {
          params.notCustIds = topCustomerIds.join(",");
        }
      }
      
      // 如果没有找到前十客户数据，返回空数组
      if (!params.notCustIds) {
        return [];
      }
    } else {
      params.custId = custId;
    }
    
    const res = await getPopoverDetail(params);

    if (res?.success === true && res.data) {
      const rows = Array.isArray(res.data)
        ? res.data
        : (res.data.rows || []);
      return rows.map(row => ({
        domain: row.domain || row.caseDomain,
        amount: row.billSum || row.amount || "",
        percentage: row.percentage || row.percent || row.rate || row.ratio || row.proportion || "",
      }));
    }
  } catch (error) {
    console.error("加载前十客户账单占比明细失败:", error);
  }
  return [];
};

const fetchGroupTopCustomerLevel2 = async (custId) => {
  try {
    const userId = props.performance?.user?.userId || props.performance?.user?.id;
    const params = {
      userId,
      year: props.year,
      detailType: "bossuser-custDomainBill",
      pageNo: 1,
      pageSize: 50,
    };
    if (custId) {
      params.custId = custId;
    } else {
      params.otherCustFlag = 1;
    }
    const res = await getPopoverDetail(params);

    if (res?.success === true && res.data) {
      const rows = Array.isArray(res.data)
        ? res.data
        : (res.data.rows || []);
      return rows.map(row => ({
        domain: row.domain || row.caseDomain,
        amount: row.billSum || row.amount || "",
        percentage: row.percentage || row.percent || row.rate || row.ratio || row.proportion || "",
      }));
    }
  } catch (error) {
    console.error("加载客户组前十客户账单占比明细失败:", error);
  }
  return [];
};

const fetchOwnerFieldLevel2 = async ({ fieldType, name }) => {
  if (!name) return [];
  try {
    const userId = props.performance?.user?.userId || props.performance?.user?.id;
    const isCase = fieldType === "case";
    const res = await getPopoverDetail({
      userId,
      year: props.year,
      detailType: isCase ? "owner-caseDomain-client-list-level2" : "owner-domain-client-list-level2",
      ...(isCase ? { caseType: name } : { domain: name }),
      pageNo: 1,
      pageSize: 50,
    });

    if (res?.success === true && res.data) {
      const rows = Array.isArray(res.data)
        ? res.data
        : (res.data.rows || []);
      return rows.map(row => ({
        name: row.caseType || row.domain || row.name || row.label || "",
        amount: row.billSum || row.amount || "",
        percentage: row.percentage || row.percent || row.rate || row.ratio || row.proportion || "",
      }));
    }
  } catch (error) {
    console.error("加载领域账单占比明细失败:", error);
  }
  return [];
};

watch(
  () => props.year,
  () => {
    resetDeveloperPopoverStates();
    coordinatorFieldClients.value = [];
    coordinatorFieldSearchText.value = "";
    coordinatorFieldPageNo.value = 1;
    coordinatorFieldFinished.value = false;
    coordinatorUpListFetched.value = false;
    coordinatorDownListFetched.value = false;
    coordinatorUpPageNo.value = 1;
    coordinatorDownPageNo.value = 1;
    coordinatorUpFinished.value = false;
    coordinatorDownFinished.value = false;
    ownerClientState.value = { list: [], pageNo: 1, pageSize: 10, loading: false, finished: false };
    ownerCustContactState.value = { list: [], pageNo: 1, pageSize: 10, loading: false, finished: false };
    groupPopoverStates.value = {};
    undertakeClientState.value = { list: [], pageNo: 1, pageSize: 10, loading: false, finished: false };
    participantStates.value = {};
    participantActivityStates.value = {};
  }
);

watch(
  () => props.performance?.user?.userId || props.performance?.user?.id,
  () => {
    resetDeveloperPopoverStates();
    coordinatorFieldClients.value = [];
    coordinatorFieldSearchText.value = "";
    coordinatorFieldPageNo.value = 1;
    coordinatorFieldFinished.value = false;
    coordinatorUpListFetched.value = false;
    coordinatorDownListFetched.value = false;
    coordinatorUpPageNo.value = 1;
    coordinatorDownPageNo.value = 1;
    coordinatorUpFinished.value = false;
    coordinatorDownFinished.value = false;
    ownerClientState.value = { list: [], pageNo: 1, pageSize: 10, loading: false, finished: false };
    ownerCustContactState.value = { list: [], pageNo: 1, pageSize: 10, loading: false, finished: false };
    groupPopoverStates.value = {};
    undertakeClientState.value = { list: [], pageNo: 1, pageSize: 10, loading: false, finished: false };
    participantStates.value = {};
    participantActivityStates.value = {};
  }
);

const handleDeveloperScroll = (item, event) => {
  const target = event?.target;
  if (!target) return;
  const state = getDeveloperState(item);
  if (state.loading || state.finished) return;
  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 20) {
    loadDeveloperClients(item, { reset: false });
  }
};

const getDeveloperList = (item) => getDeveloperState(item).list;

// 通用的客户列表过滤函数
const getFilteredClients = (clients, searchKey) => {
  if (!Array.isArray(clients)) return [];
  const searchText = clientSearchTexts.value[searchKey] || '';
  if (!searchText) return clients;
  const lowerSearchText = searchText.toLowerCase();
  return clients.filter(client => {
    const name = client.custName || client.name || client.customerName || '';
    return name.toLowerCase().includes(lowerSearchText);
  });
};

// 人员列表过滤函数
const getFilteredPersonnelList = (personnelList, searchKey) => {
  if (!Array.isArray(personnelList)) return [];
  const searchText = clientSearchTexts.value[searchKey] || '';
  if (!searchText) return personnelList;
  const lowerSearchText = searchText.toLowerCase();
  return personnelList.filter(personnel => {
    const customer = (personnel.custName || personnel.customer || '').toLowerCase();
    const person = (personnel.custPerson || '').toLowerCase();
    return customer.includes(lowerSearchText) || person.includes(lowerSearchText);
  });
};

// 客户列表过滤函数（用于参与客户数量）
const getFilteredCustomers = (customers, searchKey) => {
  if (!Array.isArray(customers)) return [];
  const searchText = clientSearchTexts.value[searchKey] || '';
  if (!searchText) return customers;
  const lowerSearchText = searchText.toLowerCase();
  return customers.filter(customer => {
    const customerName = typeof customer === 'string' ? customer : (customer.name || '');
    return customerName.toLowerCase().includes(lowerSearchText);
  });
};

// 活动列表过滤函数
const getFilteredActivities = (activities, searchKey) => {
  if (!Array.isArray(activities)) return [];
  const searchText = clientSearchTexts.value[searchKey] || '';
  if (!searchText) return activities;
  const lowerSearchText = searchText.toLowerCase();
  return activities.filter(activity => {
    const customer = activity.custName || activity.customer || '';
    const name = activity.activeName || activity.name || '';
    const day = activity.activeDay || activity.time || '';
    return customer.toLowerCase().includes(lowerSearchText) ||
           name.toLowerCase().includes(lowerSearchText) ||
           day.toLowerCase().includes(lowerSearchText);
  });
};

// 对外宣传详情列表过滤函数
const getFilteredPublicityDetails = (detailList, searchKey) => {
  if (!Array.isArray(detailList)) return [];
  const searchText = clientSearchTexts.value[searchKey] || '';
  if (!searchText) return detailList;
  const lowerSearchText = searchText.toLowerCase();
  return detailList.filter(detail => {
    // 根据不同的详情类型，搜索不同的字段
    const searchableText = [
      detail.name || '',
      detail.title || '',
      detail.customerName || '',
      detail.customer || '',
      detail.organization || '',
      detail.platform || '',
    ].join(' ').toLowerCase();
    return searchableText.includes(lowerSearchText);
  });
};

const softDialogTypeMap = {
  praise: ["表扬", "批评"],
  team: ["人员培养"],
  outreach: ["案件相关"],
  publicity: [
    "参与讨论/发言",
    "培训/演讲/主持",
    "外部荣誉",
    "外部任职",
    "外部课题",
    "对外发文",
  ],
  company: [
    "市场活动",
    "客户管理",
    "供应商资源管理",
    "合规管理",
    "投标管理",
    "采购管理",
    "对外宣传",
    "人事管理",
    "培训管理",
    "质量管理",
    "行政事务",
    "办公自动化",
    "其他公司事务管理",
  ],
  department: [
    "人事管理",
    "培训管理",
    "质量管理",
    "行政事务",
    "办公自动化",
    "其他部门事务管理",
  ],
};

const softDialogTypeOptions = computed(() => {
  return softDialogTypeMap[softDialogGroupKey.value] || [];
});

const allSoftTypeTags = computed(() =>
  Array.from(new Set(Object.values(softDialogTypeMap).flat()))
);

const softDialogTitle = computed(() => {
  const group = localSoftMetrics.value.find(
    (item) => item.key === softDialogGroupKey.value
  );
  return group?.title || "补充说明";
});

const softGroupOptions = computed(() =>
  localSoftMetrics.value.map((group) => ({
    key: group.key,
    title: group.title,
  }))
);

// eslint-disable-next-line no-unused-vars
const summaryFields = [
  { key: "plan", label: "新年目标计划及所需支持" },
  { key: "suggestion", label: "对公司及部门的想法和建议" },
  { key: "other", label: "其他" },
];

// 计算合并后的 modules 列表（包含单独获取的 customer-owner 和 customer-group 模块）
const isModuleEmpty = (module) => {
  if (!module) return false;
  if (module._empty === true) return true;
  const title = module.title;
  if (module.type === "revenue-overview" || title === "账单金额") {
    return !module.items || module.items.length === 0;
  }
  if (title === "客户开发人" || title === "客户参与人") {
    return !module.items || module.items.length === 0;
  }
  if (module.type === "coordinator") {
    return (!module.summary || module.summary.length === 0) && (!module.items || module.items.length === 0) && !module.billingAmount;
  }
  if (module.type === "customer-owner") {
    const hasSummary = Array.isArray(module.summary) && module.summary.length > 0;
    const hasCharts = module.charts && (module.charts.topCustomers?.length || module.charts.caseFields?.length || module.charts.businessFields?.length);
    return !hasSummary && !hasCharts;
  }
  if (module.type === "customer-group") {
    if (module._empty === true) return true;
    const raw = module._rawData;
    if (!raw || Array.isArray(raw) || Object.keys(raw).length === 0) return true;
    const hasOverview = Array.isArray(module.overview) && module.overview.length > 0;
    const hasChart = Array.isArray(module.chart) && module.chart.length > 0;
    return !hasOverview && !hasChart;
  }
  if (module.type === "undertake") {
    return !module.overview || module.overview.length === 0;
  }
  return false;
};

const computedModules = computed(() => {
  const modules = props.performance?.hardMetrics?.modules || [];
  const filteredModules = modules.filter((m) => m && m.type !== "publicity");

  let result = [...filteredModules];

  // 如果 customerOwnerModule 存在且不在 modules 中，添加到列表
  if (customerOwnerModule.value) {
    const existsOwner = result.some((m) => m && m.type === "customer-owner");
    if (!existsOwner) {
      result.push(customerOwnerModule.value);
    }
  }

  // 如果 customerGroupModule 存在且不在 modules 中，添加到列表
  if (customerGroupModule.value) {
    const existsGroup = result.some((m) => m && m.type === "customer-group");
    if (!existsGroup) {
      result.push(customerGroupModule.value);
    }
  }
  
  // 如果 undertakeModule 存在且不在 modules 中，添加到列表
  if (undertakeModule.value) {
    const existsUndertake = result.some((m) => m && m.type === "undertake");
    if (!existsUndertake) {
      result.push(undertakeModule.value);
    }
  }
  
  // 如果 participantModule 存在且不在 modules 中，添加到列表
  if (participantModule.value) {
    const existsParticipant = result.some((m) => m && m.type === "participant");
    if (!existsParticipant) {
      result.push(participantModule.value);
    }
  }
  
  // 如果 attendanceModule 存在且不在 modules 中，添加到列表
  if (attendanceModule.value) {
    const existsAttendance = result.some((m) => m && m.type === "attendance");
    if (!existsAttendance) {
      result.push(attendanceModule.value);
    }
  }

  const fallbackModules = [
    { key: "revenue-overview", check: (m) => m.type === "revenue-overview" || m.title === "账单金额", module: { title: "账单金额", type: "revenue-overview", items: [], _empty: true } },
    { key: "developer", check: (m) => m.title === "客户开发人", module: { title: "客户开发人", items: [], _empty: true } },
    { key: "coordinator", check: (m) => m.type === "coordinator" || m.title === "客户协调人", module: { title: "客户协调人", type: "coordinator", billingAmount: null, collectionRate: "--", summary: [], items: [], _empty: true } },
    { key: "customer-owner", check: (m) => m.type === "customer-owner" || m.title === "客户负责人", module: { title: "客户负责人", type: "customer-owner", summary: [], charts: { topCustomers: [], caseFields: [], businessFields: [] }, costs: [], _empty: true } },
    { key: "customer-group", check: (m) => m.type === "customer-group" || m.title === "客户组", module: { title: "客户组", type: "customer-group", overview: [], allocation: { before: "", after: "" }, chart: [], _empty: true } },
    { key: "undertake", check: (m) => m.type === "undertake" || m.title === "承办组", module: { title: "承办组", type: "undertake", overview: [], _empty: true } },
    { key: "participant", check: (m) => m.type === "participant" || m.title === "客户参与人", module: { title: "客户参与人", type: "participant", items: [], _empty: true } },
  ];

  fallbackModules.forEach((entry) => {
    const exists = result.some((m) => m && entry.check(m));
    if (!exists) {
      result.push(entry.module);
    }
  });

  const moduleOrder = [
    "revenue-overview",
    "developer",
    "coordinator",
    "customer-owner",
    "customer-group",
    "undertake",
    "participant",
    "attendance",
  ];
  const getModuleKey = (module) => {
    if (!module) return "";
    if (module.type === "revenue-overview" || module.title === "账单金额") return "revenue-overview";
    if (module.title === "客户开发人") return "developer";
    if (module.type === "coordinator" || module.title === "客户协调人") return "coordinator";
    if (module.type === "customer-owner" || module.title === "客户负责人") return "customer-owner";
    if (module.type === "customer-group" || module.title === "客户组") return "customer-group";
    if (module.type === "undertake" || module.title === "承办组") return "undertake";
    if (module.type === "participant" || module.title === "客户参与人") return "participant";
    if (module.type === "attendance" || module.title === "个人考勤") return "attendance";
    return module.type || module.title || "";
  };

  return result.slice().sort((a, b) => {
    const aKey = getModuleKey(a);
    const bKey = getModuleKey(b);
    const aIndex = moduleOrder.indexOf(aKey);
    const bIndex = moduleOrder.indexOf(bKey);
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
});

const scoreBreakdown = computed(() => {
  const data = props.performance?.hardMetrics?.scoreBreakdown;
  return Array.isArray(data) && data.length
    ? data
    : [
        { label: "客户开发人", score: 18, color: "#2f6bff" },
        { label: "客户协调人", score: 16, color: "#39b27f" },
        { label: "客户负责人", score: 20, color: "#f7b84b" },
        { label: "客户组", score: 12, color: "#6c7cff" },
        { label: "承办组", score: 15, color: "#ff7a5c" },
        { label: "客户参与人", score: 9, color: "#8b9db8" },
      ];
});

const scoreTotal = computed(() => {
  const total = props.performance?.hardMetrics?.scoreTotal;
  if (typeof total === "number") return total;
  return scoreBreakdown.value.reduce((sum, item) => sum + (item.score || 0), 0);
});

const roundScore = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return Math.round(num * 10) / 10;
};

const formatScore = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return "--";
  return num.toFixed(1);
};

const formatRecordValue = (value) => {
  if (value === null || value === undefined || value === "") return "--";
  const num = Number(value);
  if (!Number.isNaN(num)) {
    return `${formatScore(num)}分`;
  }
  return String(value);
};

const parseRecordDate = (value) => {
  if (!value) return 0;
  const raw = String(value).trim();
  if (!raw) return 0;
  const normalized = raw.replace(" ", "T");
  const timestamp = Date.parse(normalized);
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const formatMetricValue = (metric) => {
  if (!metric) return "--";
  if (metric.key === "judgments") {
    if (performanceScoreValue.value === null || performanceScoreValue.value === undefined) {
      return "未打分";
    }
    return formatScore(performanceScoreValue.value);
  }
  return metric.value;
};

const normalizeSoftScore = (item) => {
  if (!item) return;
  item.score = roundScore(item.score);
};

// 获取模块标题对应的颜色
const getModuleColor = (title) => {
  const item = scoreBreakdown.value.find((item) => item.label === title);
  return item?.color || null;
};

// 软性指标分数默认结构
const defaultSoftScoreStructure = [
  { label: "客户表扬与批评", score: 0, color: "#6c7cff" },
  { label: "团队建设", score: 0, color: "#2f6bff" },
  { label: "对外联络", score: 0, color: "#39b27f" },
  { label: "对外宣传", score: 0, color: "#8b5cf6" },
  { label: "参与公司管理工作", score: 0, color: "#f7b84b" },
  { label: "参与部门管理工作", score: 0, color: "#ff7a5c" },
];

// 字段名到 label 的映射
const fieldToLabel = {
  'praise': '客户表扬与批评',
  'team': '团队建设',
  'outreach': '对外联络',
  'publicity': '对外宣传',
  'company': '参与公司管理工作',
  'department': '参与部门管理工作',
};

const softScoreBreakdown = computed(() => {
  if (softScoreLocal.value.length) return softScoreLocal.value;
  const data = props.performance?.softMetricsScore?.breakdown;
  return Array.isArray(data) && data.length
    ? data
    : defaultSoftScoreStructure;
});

const softScoreTotal = computed(() => {
  const total = props.performance?.softMetricsScore?.total;
  if (typeof total === "number" && !softScoreLocal.value.length) return total;
  return softScoreBreakdown.value.reduce(
    (sum, item) => sum + (Number(item.score) || 0),
    0
  );
});

const cloneMetrics = (metrics) =>
  metrics ? JSON.parse(JSON.stringify(metrics)) : [];

watch(
  () => props.performance,
  (next) => {
    console.log('PersonalPerformancePanel: props.performance 变化:', next);
    console.log('PersonalPerformancePanel: next?.softMetrics:', next?.softMetrics);
    console.log('PersonalPerformancePanel: next?.softMetrics 长度:', next?.softMetrics?.length);
    if (next?.softMetrics && next.softMetrics.length > 0) {
      console.log('PersonalPerformancePanel: 第一个指标:', next.softMetrics[0]);
      console.log('PersonalPerformancePanel: 第一个指标的 records:', next.softMetrics[0]?.records);
    }
    localSoftMetrics.value = cloneMetrics(next?.softMetrics || []);
    console.log('PersonalPerformancePanel: localSoftMetrics.value:', localSoftMetrics.value);
    originalSoftCounts.value = (next?.softMetrics || []).map(
      (group) => group.records?.length || 0
    );
    softScoreLocal.value = (next?.softMetricsScore?.breakdown || []).map((item) => ({
      ...item,
    }));
  },
  { immediate: true, deep: true }
);

watch(
  () => localSoftMetrics.value,
  (metrics) => {
    const next = {};
    (metrics || []).forEach((group) => {
      // 使用从接口获取的类型选项
      const options = getTypeOptions(group.key);
      if (options.length) {
        // 默认选中所有类型选项
        next[group.key] = [...options];
      }
    });
    softTypeFilters.value = next;
  },
  { immediate: true, deep: true }
);

// 监听 typeOptionsByMetricKey 变化，更新筛选选项
watch(
  () => props.performance?.typeOptionsByMetricKey,
  (newOptions) => {
    if (newOptions) {
      const next = {};
      (localSoftMetrics.value || []).forEach((group) => {
        const options = getTypeOptions(group.key);
        if (options.length) {
          // 如果已有选中项，保留；否则默认选中所有
          const currentSelected = softTypeFilters.value[group.key] || [];
          // 如果当前选中项为空或者是旧数据，则使用新的选项列表
          if (currentSelected.length === 0 || !options.some(opt => currentSelected.includes(opt))) {
            next[group.key] = [...options];
          } else {
            // 保留当前选中项，但确保只包含有效的选项
            next[group.key] = currentSelected.filter(opt => options.includes(opt));
            // 如果过滤后为空，则使用所有选项
            if (next[group.key].length === 0) {
              next[group.key] = [...options];
            }
          }
        }
      });
      softTypeFilters.value = next;
    }
  },
  { immediate: true, deep: true }
);

const openAddDialog = (groupIndex) => {
  softDialogMode.value = "add";
  softDialogText.value = "";
  softDialogDate.value = "";
  softDialogRecordIndex.value = -1;
  softDialogGroupKey.value =
    localSoftMetrics.value[groupIndex]?.key || softGroupOptions.value[0]?.key || "";
  softDialogType.value = softDialogTypeOptions.value[0] || "";
  softDialogOpen.value = true;
};

const openEditDialog = (groupIndex, recordIndex) => {
  const group = localSoftMetrics.value[groupIndex];
  if (!group) return;
  softDialogMode.value = "edit";
  softDialogGroupKey.value = group.key;
  const recordValue = group.records[recordIndex] || "";
  
  // 处理对象格式的记录
  let recordTag = "";
  let recordText = "";
  let recordDate = "";
  if (recordValue && typeof recordValue === 'object' && recordValue !== null) {
    // 从对象的 type 字段获取标签
    if (recordValue.type === 'praise') {
      recordTag = '表扬';
    } else if (recordValue.type === 'criticism') {
      recordTag = '批评';
    } else {
      recordTag = recordValue.type || "";
    }
    recordText = recordValue.content || "";
    recordDate = recordValue.occurredDate || "";
  } else {
    recordTag = getRecordTag(recordValue, group.key, recordIndex);
    recordText = getRecordText(recordValue, group.key);
    // 从文本中提取日期（如果有）
    const dateMatch = recordText.match(/^(\d{4}-\d{2}-\d{2})\s/);
    if (dateMatch) {
      recordDate = dateMatch[1];
      recordText = recordText.replace(/^\d{4}-\d{2}-\d{2}\s/, '');
    }
  }
  
  softDialogText.value = recordText;
  softDialogDate.value = recordDate;
  softDialogRecordIndex.value = recordIndex;
  softDialogEditGroupIndex.value = groupIndex;
  softDialogType.value = softDialogTypeOptions.value.includes(recordTag)
    ? recordTag
    : softDialogTypeOptions.value[0] || "";
  softDialogOpen.value = true;
};

const confirmSoftDialog = async () => {
  console.log('confirmSoftDialog 被调用');
  console.log('softDialogMode:', softDialogMode.value);
  console.log('softDialogGroupKey:', softDialogGroupKey.value);
  console.log('softDialogType:', softDialogType.value);
  console.log('softDialogText:', softDialogText.value);
  console.log('softDialogDate:', softDialogDate.value);
  
  const textValue = softDialogText.value.trim();
  if (!textValue) {
    console.log('内容为空，返回');
    return;
  }
  
  const groupIndex = localSoftMetrics.value.findIndex(
    (group) => group.key === softDialogGroupKey.value
  );
  if (groupIndex < 0) {
    console.log('找不到对应的指标组，返回');
    return;
  }
  
  const group = localSoftMetrics.value[groupIndex];
  if (!group) {
    console.log('指标组为空，返回');
    return;
  }
  
  // 获取指标类型对应的数字 key
  const SOFT_METRIC_KEY_TO_NUMBER = {
    'praise': '1196',
    'team': '1197',
    'outreach': '1198',
    'publicity': '1199',
    'company': '1200',
    'department': '1201',
  };
  
  const metricKeyNumber = SOFT_METRIC_KEY_TO_NUMBER[softDialogGroupKey.value] || '';
  console.log('metricKeyNumber:', metricKeyNumber);
  
  if (softDialogMode.value === "add") {
    console.log('进入添加模式');
    // 调用新增接口
    console.log('准备添加软性指标记录，参数:', {
      year: props.year,
      key: metricKeyNumber,
      type: softDialogType.value,
      content: textValue,
      occurredDate: softDialogDate.value
    });
    
    try {
      const requestData = {
        year: props.year,
        key: metricKeyNumber,
        type: softDialogType.value || '',
        content: textValue,
      };
      
      // 如果有选择日期，添加到请求中
      if (softDialogDate.value) {
        requestData.occurredDate = softDialogDate.value;
      }
      
      console.log('调用 addSoftMetricRecords 接口，请求数据:', requestData);
      const res = await addSoftMetricRecords(requestData);
      console.log('addSoftMetricRecords 接口返回:', res);
      
      if (res.success) {
        // 添加成功后，构建记录对象并添加到列表中
        const newRecord = {
          id: String(res.data?.id || Date.now()),
          type: softDialogType.value || '',
          content: textValue,
          occurredDate: softDialogDate.value || null,
          createTime: new Date().toISOString(),
          autoAdd: 0, // 手动添加的记录，autoAdd 为 0，可以编辑删除
        };
        console.log('添加新记录到列表:', newRecord);
        localSoftMetrics.value[groupIndex].records.push(newRecord);
      } else {
        console.error('添加软性指标记录失败:', res.message || res);
      }
    } catch (error) {
      console.error('添加软性指标记录异常:', error);
    }
  } else if (softDialogMode.value === "edit" && softDialogRecordIndex.value > -1) {
    // 编辑模式：调用更新接口
    const editGroup = localSoftMetrics.value[softDialogEditGroupIndex.value];
    if (!editGroup) return;
    
    const record = editGroup.records[softDialogRecordIndex.value];
    if (!record) return;
    
    // 获取记录的 id
    let recordId = '';
    if (record && typeof record === 'object' && record !== null) {
      recordId = record.id;
    }
    
    if (!recordId) {
      console.error('编辑记录失败：找不到记录 ID');
      return;
    }
    
    try {
      const requestData = {
        id: recordId,
        year: props.year,
        key: metricKeyNumber,
        type: softDialogType.value || '',
        content: textValue,
      };
      
      // 如果有选择日期，添加到请求中
      if (softDialogDate.value) {
        requestData.occurredDate = softDialogDate.value;
      }
      
      console.log('调用 updateSoftMetricRecords 接口，请求数据:', requestData);
      const res = await updateSoftMetricRecords(requestData);
      console.log('updateSoftMetricRecords 接口返回:', res);
      
      if (res.success) {
        // 更新成功后，更新本地记录
        const updatedRecord = {
          ...record,
          type: softDialogType.value || '',
          content: textValue,
          occurredDate: softDialogDate.value || null,
        };
        localSoftMetrics.value[softDialogEditGroupIndex.value].records.splice(
          softDialogRecordIndex.value,
          1,
          updatedRecord
        );
      } else {
        console.error('更新软性指标记录失败:', res.message || res);
      }
    } catch (error) {
      console.error('更新软性指标记录异常:', error);
    }
  }
  
  softDialogOpen.value = false;
};

const getRecordTag = (record, groupKey = "", recordIndex = -1) => {
  // 如果是对象格式（API 返回的数据）
  if (record && typeof record === 'object' && record !== null) {
    // 从 type 字段获取标签（type 字段直接存储中文类型标签）
    if (record.type) {
      return record.type;
    }
    return "";
  }
  
  // 如果是字符串格式（旧格式或编辑时的格式）
  const text = String(record || "");
  const parts = text.split("：");
  if (parts.length > 1 && allSoftTypeTags.value.includes(parts[0])) {
    return parts[0];
  }
  const options = softDialogTypeMap[groupKey] || [];
  if (options.length === 1) {
    return options[0];
  }
  if (recordIndex >= 0 && recordIndex < options.length) {
    return options[recordIndex];
  }
  return "";
};

// 格式化日期显示
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  // 如果是 YYYY-MM-DD 格式，转换为 YYYY年MM月DD日
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-');
    return `${year}-${month}-${day}`;
  }
  // 其他格式直接返回
  return dateStr;
};

const getRecordText = (record, groupKey = "") => {
  // 如果是对象格式（API 返回的数据）
  if (record && typeof record === 'object' && record !== null) {
    const content = record.content || '';
    // 如果有 occurredDate，拼接到内容前面
    if (record.occurredDate) {
      const formattedDate = formatDate(record.occurredDate);
      return formattedDate ? `${formattedDate} ${content}` : content;
    }
    return content;
  }
  
  // 如果是字符串格式（旧格式或编辑时的格式）
  const tag = getRecordTag(record, groupKey);
  const text = String(record || "");
  if (!tag || !text.startsWith(`${tag}：`)) return record;
  return text.slice(tag.length + 1).trim();
};

const getRecordTagClass = (record, groupKey = "", recordIndex = -1) => {
  const tag = getRecordTag(record, groupKey, recordIndex);
  if (tag === "表扬") return "is-praise";
  if (tag === "批评") return "is-critic";
  return "is-type";
};

// 从接口获取的类型选项（优先使用）
const getTypeOptionsFromApi = (groupKey) => {
  const apiOptions = props.performance?.typeOptionsByMetricKey?.[groupKey];
  if (apiOptions && apiOptions.length > 0) {
    return apiOptions;
  }
  // 如果没有接口数据，使用默认的映射表
  return softDialogTypeMap[groupKey] || [];
};

const getTypeOptions = (groupKey) => getTypeOptionsFromApi(groupKey);

const hasTypeFilter = (groupKey) => getTypeOptions(groupKey).length > 0;

const isTypeChecked = (groupKey, option) => {
  const selected = softTypeFilters.value[groupKey] || [];
  return selected.includes(option);
};

const toggleTypeFilter = (groupKey) => {
  openTypeFilterKey.value = openTypeFilterKey.value === groupKey ? "" : groupKey;
};

const toggleTypeOption = (groupKey, option) => {
  const selected = softTypeFilters.value[groupKey] || [];
  if (selected.includes(option)) {
    softTypeFilters.value[groupKey] = selected.filter((item) => item !== option);
  } else {
    softTypeFilters.value[groupKey] = [...selected, option];
  }
};

// 判断是否全选
const isAllTypesSelected = (groupKey) => {
  const options = getTypeOptions(groupKey);
  if (!options.length) return false;
  const selected = softTypeFilters.value[groupKey] || [];
  return selected.length === options.length && options.every(opt => selected.includes(opt));
};

// 切换全选/取消全选
const toggleAllTypes = (groupKey) => {
  if (isAllTypesSelected(groupKey)) {
    // 当前是全选状态，取消全选
    softTypeFilters.value[groupKey] = [];
  } else {
    // 当前不是全选状态，全选
    const options = getTypeOptions(groupKey);
    softTypeFilters.value[groupKey] = [...options];
  }
};

const getFilteredRecords = (group) => {
  const records = Array.isArray(group.records) ? group.records : [];
  const options = getTypeOptions(group.key);
  if (!options.length) return records;
  const selected = softTypeFilters.value[group.key] || options;
  if (!selected.length) return [];
  return records.filter((record, index) => {
    const tag = getRecordTag(record, group.key, index);
    // 如果没有标签，显示该记录（适用于没有类型分类的记录）
    if (!tag) return true;
    
    // 处理对象格式：type 字段可能是中文类型标签，也可能是数字字符串
    if (record && typeof record === 'object' && record !== null && record.type) {
      const recordType = record.type;
      // 如果 type 是数字字符串（如 "2284"），且无法匹配到中文，则显示该记录
      // 这样可以避免因为 type 映射不完整而导致数据不显示
      if (/^\d+$/.test(String(recordType))) {
        // type 是数字，如果无法匹配到中文，默认显示
        // 这里可以根据实际需求调整逻辑
        return true;
      }
      // type 字段是中文类型标签，直接匹配
      return selected.includes(recordType);
    }
    
    // 字符串格式：检查是否匹配选中的类型
    return selected.includes(tag);
  });
};

const getRecordCount = (group) => getFilteredRecords(group).length;

const openSoftScoreInline = async () => {
  // 打开打分编辑时，先查询是否已有打分记录，获取 id
  if (!softScoreId.value && props.performance?.user && props.year) {
    const userId = props.performance.user.userId || props.performance.user.id;
    if (userId) {
      try {
        console.log('打开打分编辑，查询已有打分记录');
        const res = await querySoftmetrics({ userId, year: props.year });
        console.log('querySoftmetrics 查询结果:', res);
        
        if (res.success === true && res.data !== null && res.data.id !== undefined && res.data.id !== null) {
          softScoreId.value = res.data.id;
          console.log('获取到打分记录 id:', softScoreId.value);
        }
      } catch (error) {
        console.error('查询打分记录失败:', error);
        // 查询失败不影响打开编辑，继续执行
      }
    }
  }
  
  softScoreEditing.value = true;
  softScoreBackup.value = softScoreBreakdown.value.map((item) => ({ ...item }));
};

const confirmSoftScoreInline = async () => {
  // 构建分数映射：label -> 字段名
  const scoreLabelToField = {
    '客户表扬与批评': 'praise',
    '团队建设': 'team',
    '对外联络': 'outreach',
    '对外宣传': 'publicity',
    '参与公司管理工作': 'company',
    '参与部门管理工作': 'department',
  };
  
  // 构建请求数据
  const requestData = {
    userId: props.performance?.user?.userId || props.performance?.user?.id,
    year: props.year,
  };
  
  // 将分数映射到对应的字段
  softScoreBreakdown.value.forEach((item) => {
    const fieldName = scoreLabelToField[item.label];
    if (fieldName) {
      requestData[fieldName] = roundScore(item.score);
    }
  });
  
  try {
    let res;
    // 如果有 id，调用更新接口；否则调用新增接口
    if (softScoreId.value) {
      requestData.id = softScoreId.value;
      console.log('调用 upSoftmetrics 接口更新打分，参数:', requestData);
      res = await upSoftmetrics(requestData);
      console.log('upSoftmetrics 接口返回:', res);
    } else {
      console.log('调用 addSoftmetrics 接口保存打分，参数:', requestData);
      res = await addSoftmetrics(requestData);
      console.log('addSoftmetrics 接口返回:', res);
    }
    
    if (res.success) {
      // 保存成功后，更新本地数据
      softScoreLocal.value = softScoreBreakdown.value.map((item) => ({
        ...item,
        score: roundScore(item.score),
      }));
      
      // 记录返回的 id（新增时返回 id，更新时使用已有的 id）
      if (res.data?.id !== undefined && res.data?.id !== null) {
        softScoreId.value = res.data.id;
      } else if (!softScoreId.value && res.data) {
        // 如果接口返回的数据中有 id，也记录下来
        softScoreId.value = res.data.id || null;
      }
      
      // 如果是新增且没有获取到 id，再次查询获取 id
      if (!softScoreId.value && !requestData.id) {
        try {
          const userId = props.performance?.user?.userId || props.performance?.user?.id;
          if (userId) {
            console.log('新增成功但未返回 id，重新查询获取 id');
            const queryRes = await querySoftmetrics({ userId, year: props.year });
            if (queryRes.success === true && queryRes.data !== null && queryRes.data.id !== undefined && queryRes.data.id !== null) {
              softScoreId.value = queryRes.data.id;
              console.log('重新查询获取到 id:', softScoreId.value);
            }
          }
        } catch (error) {
          console.error('重新查询 id 失败:', error);
          // 查询失败不影响保存成功，继续执行
        }
      }
      
      softScoreEditing.value = false;
      
      // 显示成功提示
      ElMessage({
        message: softScoreId.value ? '打分更新成功' : '打分保存成功',
        type: 'success',
        duration: 3000,
      });
    } else {
      // 显示错误提示
      ElMessage({
        message: res.message || '保存打分失败',
        type: 'error',
        duration: 3000,
      });
      console.error('保存打分失败:', res.message || res);
    }
  } catch (error) {
    // 显示错误提示
    ElMessage({
      message: '保存打分异常，请稍后重试',
      type: 'error',
      duration: 3000,
    });
    console.error('保存打分异常:', error);
  }
};

const cancelSoftScoreInline = () => {
  softScoreLocal.value = softScoreBackup.value.map((item) => ({ ...item }));
  softScoreEditing.value = false;
};

const getAvailableTypes = (group) => {
  // 直接返回从接口获取的类型选项，不再从当前数据中提取
  // 因为数据有分页，当前显示的数据可能不包含所有类型
  const options = getTypeOptions(group.key);
  return options;
};

const handleClickOutside = (event) => {
  const target = event.target;
  if (target?.closest?.(".pp-soft-filter")) return;
  openTypeFilterKey.value = "";
};

// 适配 customer-owner 模块数据格式（与 index.vue 中的适配函数保持一致）
const adaptCustomerOwnerDataInComponent = (data) => {
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
      costs: [],
      _empty: true
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
      color: getFieldColorInComponent(label),
      amount: '',
      subFields: [],
      bills: []
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
      color: getFieldColorInComponent(label),
      amount: '',
      subFields: [],
      bills: []
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
        cases: 0,
        rate: '--'
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
  
  // 年业绩上涨
  if (data.increased !== undefined && data.increased !== null) {
    summary.push({
      label: '年业绩上涨',
      value: `${data.increased}个客户`,
      up: true
    });
  }
  
  // 年业绩下降
  if (data.decreased !== undefined && data.decreased !== null) {
    summary.push({
      label: '年业绩下降',
      value: `${data.decreased}个客户`,
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
    const laborCostValue = typeof data.fzrrlcb === 'number'
      ? `¥${data.fzrrlcb.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : data.fzrrlcb;
    costs.push({
      label: '人力成本',
      value: laborCostValue
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
      value: typeof data.fzrzjlxkhfry === 'number' ? `${data.fzrzjlxkhfry}人` : data.fzrzjlxkhfry
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
    _rawData: data,
    increased: data.increased,
    decreased: data.decreased
  };
};

// 获取字段颜色
const getFieldColorInComponent = (label) => {
  const colorMap = {
    '业务领域商标收入占比': '#2f6bff',
    '业务领域专利收入占比': '#34c38f',
    '业务领域商业秘密收入占比': '#f7b84b',
    '业务领域公司/合规及其他秘密收入占比': '#ff7a5c'
  };
  return colorMap[label] || '#8b9db8';
};

// 适配 customer-group 模块数据格式（与 index.vue 中的适配函数保持一致）
const adaptCustomerGroupDataInComponent = (data) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {
      title: '客户组',
      type: 'customer-group',
      overview: [],
      allocation: {
        before: '',
        after: ''
      },
      chart: [],
      _empty: true
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
    rate: item.rate || data.collectionRate || '--', // 如果没有单独的 rate，使用整体的 collectionRate
    custId: item.custId
  }));
  
  // 客户数 - 使用 khzCustCount
  if (data.khzCustCount !== undefined && data.khzCustCount !== null) {
    overview.push({
      label: '客户数',
      value: String(data.khzCustCount),
      customers: clientList.slice(0, 3).map(item => item.name),
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

// 加载 customer-owner 模块数据（如果不在 hardMetrics.modules 中）
const loadCustomerOwnerModule = async () => {
  if (!props.year) return;
  
  try {
    const res = await getHardMetrics({ year: props.year, type: 'customer-owner' });
    if (res.success === true && res.data) {
      const ownerModule = adaptCustomerOwnerDataInComponent(res.data);
      customerOwnerModule.value = ownerModule;
      
    }
  } catch (error) {
    console.error('加载 customer-owner 模块数据失败:', error);
  }
};

// 加载 customer-group 模块数据（如果不在 hardMetrics.modules 中）
const loadCustomerGroupModule = async () => {
  if (!props.year) return;
  
  try {
    const res = await getHardMetrics({ year: props.year, type: 'customer-group' });
    if (res.success === true && res.data) {
      const groupModule = adaptCustomerGroupDataInComponent(res.data);
      customerGroupModule.value = groupModule;
    }
  } catch (error) {
    console.error('加载 customer-group 模块数据失败:', error);
  }
};

// 适配 undertake 模块数据格式（与 index.vue 中的适配函数保持一致）
const adaptUndertakeDataInComponent = (data) => {
  if (!data || typeof data !== 'object') {
    return {
      title: '承办组',
      type: 'undertake',
      overview: [],
      _empty: true
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

// 加载 undertake 模块数据（如果不在 hardMetrics.modules 中）
const loadUndertakeModule = async () => {
  if (!props.year) return;
  
  try {
    const res = await getHardMetrics({ year: props.year, type: 'undertake' });
    if (res.success === true && res.data) {
      const undertakeModuleData = adaptUndertakeDataInComponent(res.data);
      undertakeModule.value = undertakeModuleData;
    }
  } catch (error) {
    console.error('加载 undertake 模块数据失败:', error);
  }
};

// 适配 participant 模块数据格式（与 index.vue 中的适配函数保持一致）
const adaptParticipantDataInComponent = (data) => {
  if (!data || typeof data !== 'object') {
    return {
      title: '客户参与人',
      type: 'participant',
      items: [],
      _empty: true
    };
  }
  
  // 构建 items 数组（保持与之前数据结构一致）
  const items = [];
  
  // 参与客户数量 - 使用 cyrCustCount
  if (data.cyrCustCount !== undefined && data.cyrCustCount !== null) {
    items.push({
      label: '参与客户数量',
      value: data.cyrCustCount > 0 ? `${data.cyrCustCount}家` : '无',
      customers: []
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
      activities: []
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
      personnelList: []
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

// 加载 participant 模块数据（如果不在 hardMetrics.modules 中）
const loadParticipantModule = async () => {
  if (!props.year) return;
  
  try {
    const res = await getHardMetrics({ year: props.year, type: 'participants' });
    if (res.success === true && res.data) {
      const participantModuleData = adaptParticipantDataInComponent(res.data);
      participantModule.value = participantModuleData;
    }
  } catch (error) {
    console.error('加载 participant 模块数据失败:', error);
  }
};

// 适配 attendance 模块数据格式（与 index.vue 中的适配函数保持一致）
const adaptAttendanceDataInComponent = (data) => {
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
      value: data.ndzgsc > 0 ? `${data.ndzgsc}h` : '无'
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
      value: data.rjzgsc > 0 ? `${data.rjzgsc}h` : '无'
    });
  } else {
    metrics.push({
      label: '年度平均在岗日时长',
      value: '无'
    });
  }
  
  // 休假天数 - 使用 xjts
  if (data.xjts !== undefined && data.xjts !== null) {
    metrics.push({
      label: '休假天数',
      value: data.xjts > 0 ? `${data.xjts}天` : '无'
    });
  } else {
    metrics.push({
      label: '休假天数',
      value: '无'
    });
  }
  
  // 出差天数 - 使用 ccts
  if (data.ccts !== undefined && data.ccts !== null) {
    metrics.push({
      label: '出差天数',
      value: data.ccts > 0 ? `${data.ccts}天` : '无'
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

// 加载 attendance 模块数据（如果不在 hardMetrics.modules 中）
const loadAttendanceModule = async () => {
  if (!props.year) return;
  
  try {
    const res = await getHardMetrics({ year: props.year, type: 'attendance' });
    if (res.success === true && res.data) {
      const attendanceModuleData = adaptAttendanceDataInComponent(res.data);
      attendanceModule.value = attendanceModuleData;
    }
  } catch (error) {
    console.error('加载 attendance 模块数据失败:', error);
  }
};

// 监听performance数据变化，预加载协调人客户数量
watch(() => props.performance, (newPerformance) => {
  // 当 performance 变化时，重新加载打分数据
  if (newPerformance?.user && props.year) {
    loadSoftScoreData();
  }
  
  if (!newPerformance || !newPerformance.hardMetrics || !Array.isArray(newPerformance.hardMetrics.modules)) {
    return;
  }
  
  const coordinatorModule = newPerformance.hardMetrics.modules.find(m => m && m.type === 'coordinator');
  if (coordinatorModule) {
    // 点击后再请求 popover/detail，避免初始化时预加载
  }
  
  // 检查 customer-owner 模块是否存在，如果不存在则单独获取
  const ownerModule = newPerformance.hardMetrics.modules.find(m => m && m.type === 'customer-owner');
  if (ownerModule) {
    // 点击后再请求 popover/detail，避免初始化时预加载
  } else {
    // 如果模块不存在，单独调用接口获取
    loadCustomerOwnerModule();
  }
  
  // 检查 customer-group 模块是否存在，如果不存在则单独获取
  const groupModule = newPerformance.hardMetrics.modules.find(m => m && m.type === 'customer-group');
  if (!groupModule) {
    loadCustomerGroupModule();
  }
  
  // 检查 undertake 模块是否存在，如果不存在则单独获取
  const undertakeModuleInProps = newPerformance.hardMetrics.modules.find(m => m && m.type === 'undertake');
  if (!undertakeModuleInProps) {
    loadUndertakeModule();
  }
  
  // 检查 participant 模块是否存在，如果不存在则单独获取
  const participantModuleInProps = newPerformance.hardMetrics.modules.find(m => m && m.type === 'participant');
  if (!participantModuleInProps) {
    loadParticipantModule();
  }
  
  // 检查 attendance 模块是否存在，如果不存在则单独获取
  const attendanceModuleInProps = newPerformance.hardMetrics.modules.find(m => m && m.type === 'attendance');
  if (!attendanceModuleInProps) {
    loadAttendanceModule();
  }
}, { immediate: false, deep: true });

// 监听 year 变化，重新加载打分数据
watch(() => props.year, () => {
  // 切换年份时重置 id
  softScoreId.value = null;
  if (props.performance?.user) {
    loadSoftScoreData();
  }
  summaryPdfUrl.value = "";
  summaryPdfError.value = "";
  summaryPdfTimestamp.value = Date.now();
  if (props.year) {
    loadSummaryPdf({ force: true });
  }
});

watch(
  () => props.performance?.user?.userId || props.performance?.user?.id,
  () => {
    summaryPdfUrl.value = "";
    summaryPdfError.value = "";
    summaryPdfTimestamp.value = Date.now();
    if (props.year) {
      loadSummaryPdf({ force: true });
    }
  }
);

// 加载软性指标打分数据
const loadSoftScoreData = async () => {
  if (!props.performance?.user || !props.year) {
    return;
  }
  
  const userId = props.performance.user.userId || props.performance.user.id;
  if (!userId) {
    return;
  }
  
  try {
    console.log('调用 querySoftmetrics 接口获取打分数据');
    const res = await querySoftmetrics({ userId, year: props.year });
    console.log('querySoftmetrics 接口返回:', res);
    
    if (res.success === true) {
      if (res.data === null) {
        // 没有数据，所有分数设置为 0，清空 id
        console.log('没有打分数据，所有分数设置为 0');
        softScoreLocal.value = defaultSoftScoreStructure.map(item => ({ ...item }));
        softScoreId.value = null;
        performanceScoreValue.value = null;
      } else {
        // 有数据，根据返回的数据更新分数
        console.log('有打分数据，更新分数:', res.data);
        const scoreData = res.data;
        softScoreLocal.value = defaultSoftScoreStructure.map(item => {
          // 根据 label 找到对应的字段名
          const fieldName = Object.keys(fieldToLabel).find(key => fieldToLabel[key] === item.label);
          if (fieldName && scoreData[fieldName] !== undefined) {
            return {
              ...item,
              score: Number(scoreData[fieldName]) || 0
            };
          }
          return { ...item };
        });
        // 记录 id，用于后续更新
        if (scoreData.id !== undefined && scoreData.id !== null) {
          softScoreId.value = scoreData.id;
          console.log('记录打分数据 id:', softScoreId.value);
        } else {
          softScoreId.value = null;
        }
        performanceScoreValue.value = scoreData.performanceScore ?? null;
      }
    }
  } catch (error) {
    console.error('加载软性指标打分数据失败:', error);
    // 出错时，使用默认值（全为 0），清空 id
    softScoreLocal.value = defaultSoftScoreStructure.map(item => ({ ...item }));
    softScoreId.value = null;
    performanceScoreValue.value = null;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  // 加载软性指标打分数据
  loadSoftScoreData();
  if (props.year) {
    loadSummaryPdf({ force: true });
  }
  
  // 组件挂载时也预加载一次
  if (props.performance && props.performance.hardMetrics && Array.isArray(props.performance.hardMetrics.modules)) {
    const coordinatorModule = props.performance.hardMetrics.modules.find(m => m && m.type === 'coordinator');
    if (coordinatorModule) {
      // 点击后再请求 popover/detail，避免初始化时预加载
    }
    
    const ownerModule = props.performance.hardMetrics.modules.find(m => m && m.type === 'customer-owner');
    if (ownerModule) {
      // 点击后再请求 popover/detail，避免初始化时预加载
    } else {
      // 如果模块不存在，单独调用接口获取
      setTimeout(() => {
        loadCustomerOwnerModule();
      }, 100);
    }
    
    const groupModule = props.performance.hardMetrics.modules.find(m => m && m.type === 'customer-group');
    if (!groupModule) {
      // 如果模块不存在，单独调用接口获取
      setTimeout(() => {
        loadCustomerGroupModule();
      }, 100);
    }
    
    const undertakeModuleInProps = props.performance.hardMetrics.modules.find(m => m && m.type === 'undertake');
    if (!undertakeModuleInProps) {
      // 如果模块不存在，单独调用接口获取
      setTimeout(() => {
        loadUndertakeModule();
      }, 100);
    }
    
    const participantModuleInProps = props.performance.hardMetrics.modules.find(m => m && m.type === 'participant');
    if (!participantModuleInProps) {
      // 如果模块不存在，单独调用接口获取
      setTimeout(() => {
        loadParticipantModule();
      }, 100);
    }
    
    const attendanceModuleInProps = props.performance.hardMetrics.modules.find(m => m && m.type === 'attendance');
    if (!attendanceModuleInProps) {
      // 如果模块不存在，单独调用接口获取
      setTimeout(() => {
        loadAttendanceModule();
      }, 100);
    }
  } else {
    // 如果 hardMetrics 不存在，也尝试加载所有模块
    setTimeout(() => {
      loadCustomerOwnerModule();
      loadCustomerGroupModule();
      loadUndertakeModule();
      loadParticipantModule();
      loadAttendanceModule();
    }, 100);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});

const getSummaryValue = (group, key) => {
  if (!group) return "";
  const records = Array.isArray(group.records) ? group.records : [];
  if (records.length && typeof records[0] === "object" && records[0] !== null) {
    return records[0][key] || "";
  }
  const indexMap = { plan: 0, suggestion: 1, other: 2 };
  const index = indexMap[key];
  return records[index] || "";
};

// eslint-disable-next-line no-unused-vars
const getSummaryValueFromMetrics = (key) => {
  const summaryGroup = localSoftMetrics.value.find(g => g.key === 'summary');
  if (!summaryGroup) return "";
  return getSummaryValue(summaryGroup, key);
};

// eslint-disable-next-line no-unused-vars
const openSummaryDialogFromSection = () => {
  const summaryGroupIndex = localSoftMetrics.value.findIndex(g => g.key === 'summary');
  if (summaryGroupIndex === -1) return;
  openSummaryDialog(summaryGroupIndex);
};

const escapeHtml = (value) => {
  const text = String(value ?? "");
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

// 构建专业表格HTML
const buildTableHtml = (headers, rows, options = {}) => {
  const { compact = false, highlight = false, colWidths = [] } = options;
  const colGroup = colWidths.length
    ? `<colgroup>${colWidths.map(w => `<col style="width:${w}">`).join("")}</colgroup>`
    : "";
  const headHtml = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("");
  const bodyHtml = rows.map((row, rowIdx) => {
    const cells = row.map((cell, cellIdx) => {
      const isAmount = headers[cellIdx] && (headers[cellIdx].includes("账单") || headers[cellIdx].includes("金额"));
      const cellClass = isAmount ? ' class="amount"' : '';
      return `<td${cellClass}>${escapeHtml(cell)}</td>`;
    }).join("");
    const rowClass = highlight && rowIdx === 0 ? ' class="highlight"' : '';
    return `<tr${rowClass}>${cells}</tr>`;
  }).join("");
  const tableClass = compact ? "report-table compact" : "report-table";
  return `
    <table class="${tableClass}">
      ${colGroup}
      <thead><tr>${headHtml}</tr></thead>
      <tbody>${bodyHtml || `<tr><td colspan="${headers.length}" class="empty">暂无数据</td></tr>`}</tbody>
    </table>
  `;
};

// 获取二级详细数据的辅助函数
const fetchDetailData = async (detailType, limit = 10) => {
  const userId = props.performance?.user?.userId || props.performance?.user?.id;
  if (!userId || !props.year) return [];
  try {
    const res = await getPopoverDetail({
      userId,
      year: props.year,
      detailType,
      pageNo: 1,
      pageSize: limit,
    });
    if (res?.success === true && res.data) {
      return Array.isArray(res.data) ? res.data : (res.data.rows || []);
    }
  } catch (error) {
    console.warn(`获取${detailType}数据失败:`, error);
  }
  return [];
};


// 生成报告HTML - 专业美观的样式
const buildReportHtml = (reportData) => {
  const { user, year, businessSections, softMetricSections, summarySections, hardScore, softScore, summaryPdfLink, images } = reportData;
  
  // 基础信息卡片HTML（不使用表格）
  const baseInfoHtml = `
    <div class="info-card">
      <div class="info-row">
        <div class="info-item"><span class="info-label">姓名</span><span class="info-value">${escapeHtml(user.name || "--")}</span></div>
        <div class="info-item"><span class="info-label">岗位</span><span class="info-value">${escapeHtml(user.position || "--")}</span></div>
        <div class="info-item"><span class="info-label">部门</span><span class="info-value">${escapeHtml(user.field || "--")}</span></div>
      </div>
      <div class="info-row">
        <div class="info-item"><span class="info-label">地区</span><span class="info-value">${escapeHtml(user.region || "--")}</span></div>
        <div class="info-item"><span class="info-label">组别</span><span class="info-value">${escapeHtml(user.group || "--")}</span></div>
        <div class="info-item"><span class="info-label">年份</span><span class="info-value">${escapeHtml(year || "--")}</span></div>
      </div>
    </div>
  `;

  // 硬性指标得分
  const hardScoreRows = hardScore.breakdown.map((item) => [
    item.label,
    `${formatScore(item.score)}分`
  ]);
  hardScoreRows.push(["硬性指标总分", `${formatScore(hardScore.total)}分`]);

  // 软性指标得分
  const softScoreRows = softScore.breakdown.map((item) => [
    item.label,
    `${formatScore(item.score)}分`
  ]);
  softScoreRows.push(["软性指标总分", `${formatScore(softScore.total)}分`]);

  // 业绩部分HTML
  const businessHtml = businessSections.map((section, idx) => {
    const sectionNum = `（${["一", "二", "三", "四", "五", "六", "七"][idx] || idx + 1}）`;
    let contentHtml = "";
    
    // 如果有截图，显示截图
    if (section.imageKey && images[section.imageKey]) {
      contentHtml += `<div class="report-image"><img src="${images[section.imageKey]}" alt="${escapeHtml(section.title)}" /></div>`;
    }
    
    // 概览表格
    if (section.overview && section.overview.length) {
      contentHtml += `<div class="report-detail-title">📊 概览数据</div>`;
      contentHtml += buildTableHtml(["项目", "数值"], section.overview, { compact: true });
    }
    
    // 明细表格（带类型标注）
    if (section.details && section.details.length) {
      const detailTitle = section.detailTitle || "客户明细";
      contentHtml += `<div class="report-detail-title">📋 ${escapeHtml(detailTitle)}</div>`;
      contentHtml += buildTableHtml(section.detailHeaders || ["客户", "账单额"], section.details, { compact: true });
    }
    
    return `
      <div class="report-subsection">
        <h4>${sectionNum} ${escapeHtml(section.title)}</h4>
        ${contentHtml || '<div class="report-empty">暂无数据</div>'}
      </div>
    `;
  }).join("");

  // 软性指标部分HTML
  const softMetricHtml = softMetricSections.map((section, idx) => {
    const sectionNum = `（${["一", "二", "三", "四", "五", "六"][idx] || idx + 1}）`;
    let contentHtml = "";
    
    if (section.records && section.records.length) {
      contentHtml = buildTableHtml(["类型", "内容"], section.records, { compact: true });
    }
    
    return `
      <div class="report-subsection">
        <h4>${sectionNum} ${escapeHtml(section.title)}</h4>
        ${contentHtml || '<div class="report-empty">暂无数据</div>'}
      </div>
    `;
  }).join("");

  // 总结补充部分HTML
  const summaryHtml = summarySections.map((section, idx) => {
    const sectionNum = `（${["一", "二", "三"][idx] || idx + 1}）`;
    return `
      <div class="report-subsection">
        <h4>${sectionNum} ${escapeHtml(section.title)}</h4>
        <div class="report-text-block">${escapeHtml(section.content || "暂无")}</div>
      </div>
    `;
  }).join("");

  // 总结文档链接
  const summaryDocHtml = summaryPdfLink
    ? `<div class="report-attachment">
        <span class="attachment-label">📎 个人总结报告附件：</span>
        <a href="${escapeHtml(summaryPdfLink)}" target="_blank">点击查看/下载</a>
      </div>`
    : "";

  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8" />
        <title>${escapeHtml(year)}年个人绩效报告 - ${escapeHtml(user.name || "")}</title>
        <style>
          @page { margin: 2cm; }
          body { 
            font-family: "Microsoft YaHei", "PingFang SC", "Helvetica Neue", sans-serif; 
            color: #1a1a2e; 
            margin: 0; 
            padding: 24px 40px;
            font-size: 13px;
            line-height: 1.6;
            background: #fff;
            max-width: 900px;
            margin: 0 auto;
          }
          
          /* 标题居中 */
          h1 { 
            font-size: 26px; 
            margin: 0; 
            color: #1e3a5f; 
            font-weight: 700; 
            text-align: center;
            letter-spacing: 2px;
          }
          h2 { 
            font-size: 16px; 
            margin: 28px 0 14px; 
            color: #1e3a5f; 
            font-weight: 600; 
            border-left: 4px solid #2563eb;
            padding-left: 12px;
            background: linear-gradient(90deg, #eff6ff 0%, transparent 100%);
            padding: 8px 12px;
          }
          h3 { font-size: 15px; margin: 20px 0 10px; color: #334155; font-weight: 600; }
          h4 { font-size: 14px; margin: 16px 0 10px; color: #374151; font-weight: 600; }
          
          /* 报告头部 */
          .report-header { 
            text-align: center;
            padding: 24px 20px;
            margin-bottom: 24px;
            border-bottom: 2px solid #e2e8f0;
          }
          .report-meta { 
            color: #64748b; 
            font-size: 14px; 
            margin-top: 8px;
          }
          
          /* 基础信息卡片样式 */
          .info-card {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px 24px;
            margin: 12px 0;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 16px;
          }
          .info-row:last-child { margin-bottom: 0; }
          .info-item {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .info-label {
            color: #64748b;
            font-size: 13px;
            min-width: 48px;
          }
          .info-value {
            color: #1e293b;
            font-size: 14px;
            font-weight: 500;
          }
          
          .report-section { margin-top: 24px; page-break-inside: avoid; }
          .report-subsection { 
            margin: 16px 0 20px 0; 
            padding: 12px 16px;
            background: #fafbfc;
            border-radius: 6px;
            border: 1px solid #e8ecf0;
          }
          .report-detail-title { 
            font-weight: 600; 
            font-size: 13px; 
            color: #475569; 
            margin: 14px 0 8px;
            padding: 4px 0;
          }
          .report-empty { color: #94a3b8; font-size: 12px; font-style: italic; padding: 12px; text-align: center; }
          .report-text-block { 
            background: #fff; 
            padding: 14px 18px; 
            border-radius: 6px; 
            border-left: 4px solid #3b82f6;
            color: #334155;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          }
          
          .report-image { margin: 14px 0; text-align: center; }
          .report-image img { 
            max-width: 100%; 
            border: 1px solid #e2e8f0; 
            border-radius: 8px; 
            box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          }
          
          .report-attachment {
            margin: 20px 0;
            padding: 14px 18px;
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 8px;
          }
          .report-attachment a { color: #2563eb; text-decoration: none; font-weight: 500; }
          .report-attachment a:hover { text-decoration: underline; }
          .attachment-label { color: #1e40af; font-weight: 500; }
          
          /* 优化表格样式 */
          table.report-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 10px 0 14px; 
            font-size: 12px;
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          }
          table.report-table th { 
            background: #475569;
            color: #fff; 
            font-weight: 500;
            padding: 10px 14px;
            text-align: left;
            font-size: 12px;
            border: none;
          }
          table.report-table td { 
            border-bottom: 1px solid #e5e7eb;
            padding: 10px 14px; 
            text-align: left;
            color: #374151;
            background: #fff;
          }
          table.report-table tr:nth-child(even) td { background: #f9fafb; }
          table.report-table tr:last-child td { border-bottom: none; }
          table.report-table tr.highlight td { background: #fef3c7; }
          table.report-table td.amount { 
            text-align: right; 
            font-family: "Consolas", "Monaco", monospace; 
            color: #0369a1; 
            font-weight: 500;
          }
          table.report-table td.empty { text-align: center; color: #94a3b8; font-style: italic; }
          table.report-table.compact { font-size: 11px; }
          table.report-table.compact th { padding: 8px 12px; }
          table.report-table.compact td { padding: 8px 12px; }
          
          .score-section { display: flex; gap: 24px; flex-wrap: wrap; }
          .score-card { 
            flex: 1; 
            min-width: 280px;
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px;
          }
          .score-card h4 { margin-top: 0; }
        </style>
      </head>
      <body>
        <div class="report-header">
          <h1>个人总结</h1>
          <div class="report-meta">${escapeHtml(user.name || "")} · ${escapeHtml(user.position || "")} · ${escapeHtml(year)}年度</div>
        </div>
        
        <section class="report-section">
          <h2>基础信息</h2>
          ${baseInfoHtml}
        </section>
        
        <section class="report-section">
          <h2>一、业绩部分</h2>
          ${businessHtml}
        </section>
        
        <section class="report-section">
          <h2>绩效得分</h2>
          <div class="score-section">
            <div class="score-card">
              <h4>硬性指标绩效分数</h4>
              ${buildTableHtml(["指标", "得分"], hardScoreRows, { compact: true })}
            </div>
            <div class="score-card">
              <h4>软性指标绩效分数</h4>
              ${buildTableHtml(["指标", "得分"], softScoreRows, { compact: true })}
            </div>
          </div>
        </section>
        
        <section class="report-section">
          <h2>二、软性指标</h2>
          ${softMetricHtml}
        </section>
        
        <section class="report-section">
          <h2>三、总结补充</h2>
          ${summaryHtml}
          ${summaryDocHtml}
        </section>
      </body>
    </html>
  `;
};

// 构建报告数据 - 按新结构组织
const buildReportData = async () => {
  const user = props.performance?.user || {};
  const hardScore = {
    breakdown: scoreBreakdown.value || [],
    total: scoreTotal.value || 0,
  };
  const softScore = {
    breakdown: softScoreBreakdown.value || [],
    total: softScoreTotal.value || 0,
  };

  // ========== 一、业绩部分（7项）==========
  const businessSections = [];

  // (一) 个人总体业绩情况（账单金额）
  const revenueModule = computedModules.value.find(m => m.type === "revenue-overview");
  if (revenueModule) {
    const overview = (revenueModule.items || []).map(item => [item.label || "", formatRevenueValue(item.value)]);
    businessSections.push({
      title: "个人总体业绩情况",
      imageKey: "revenue",
      overview,
    });
  }

  // (二) 客户开发人 - 前三客户名称及账单量
  const developerModule = computedModules.value.find(m => m.title === "客户开发人");
  if (developerModule) {
    const overview = (developerModule.items || []).map(item => [item.label || "", item.value ?? "--"]);
    // 获取前三客户明细
    const developerClients = await fetchDetailData("developer-client-list", 3);
    const details = developerClients.map(row => [
      row.custName || row.name || "--",
      formatRevenueValue(row.billSum),
      `${row.caseCount || 0}件`,
    ]);
    businessSections.push({
      title: "客户开发人",
      imageKey: "developer",
      overview,
      detailTitle: "前三客户明细（减案内费用）",
      detailHeaders: ["客户", "账单额", "案量"],
      details,
    });
  }

  // (三) 客户协调人 - 前五客户名称及账单量 + 年度业绩增减比
  const coordinatorModule = computedModules.value.find(m => m.type === "coordinator");
  if (coordinatorModule) {
    const overview = [
      ["协调客户账单额", formatRevenueValue(coordinatorModule.billingAmount)],
      ["回款情况", coordinatorModule.collectionRate || "--"],
      ["年业绩上涨", `${coordinatorUpClientsCount.value || 0}个客户`],
      ["年业绩下降", `${coordinatorDownClientsCount.value || 0}个客户`],
    ];
    // 获取前五客户明细
    const coordClients = await fetchDetailData("coordinator-client-list", 5);
    const details = coordClients.map(row => [
      row.custName || row.name || "--",
      formatRevenueValue(row.billSum || row.amount),
    ]);
    businessSections.push({
      title: "客户协调人",
      imageKey: "coordinator",
      overview,
      detailTitle: "前五客户名称及账单量",
      detailHeaders: ["客户", "账单额"],
      details,
    });
  }

  // (四) 客户负责人 - 前十客户账单量 + 年度业绩增减比
  const ownerModule = computedModules.value.find(m => m.type === "customer-owner");
  if (ownerModule) {
    const overview = (ownerModule.summary || []).map(item => [item.label || "", item.value ?? "--"]);
    // 添加业绩增减
    overview.push(["年业绩上涨", `${ownerUpClientsCount.value || 0}个客户`]);
    overview.push(["年业绩下降", `${ownerDownClientsCount.value || 0}个客户`]);
    // 前十客户
    const topCustomers = ownerModule.charts?.topCustomers || [];
    const details = topCustomers.slice(0, 10).map(item => [
      item.custName || item.name || "--",
      formatRevenueValue(item.billSum || item.amount),
      item.percentage || "--",
    ]);
    businessSections.push({
      title: "客户负责人",
      imageKey: "owner",
      overview,
      detailTitle: "前十客户账单额与占比",
      detailHeaders: ["客户", "账单额", "占比"],
      details,
    });
  }

  // (五) 客户组
  const groupModule = computedModules.value.find(m => m.type === "customer-group");
  if (groupModule) {
    const overview = (groupModule.overview || []).map(item => [item.label || "", item.value ?? "--"]);
    const chartData = groupModule.chart || [];
    const details = chartData.slice(0, 10).map(item => [
      item.caseDomain || item.domain || "--",
      formatRevenueValue(item.billSum || item.amount),
      item.percentage ?? "--",
    ]);
    businessSections.push({
      title: "客户组",
      imageKey: "group",
      overview,
      detailTitle: "前十客户账单占比",
      detailHeaders: ["领域", "账单额", "占比"],
      details,
    });
  }

  // (六) 承办组
  const undertakeModule = computedModules.value.find(m => m.type === "undertake");
  if (undertakeModule) {
    const overview = (undertakeModule.overview || []).map(item => [item.label || "", item.value ?? "--"]);
    // 获取前十客户明细
    const undertakeClients = await fetchDetailData("bossuser-cbGroupBill", 10);
    const details = undertakeClients.map(row => [
      row.custName || row.name || "--",
      formatRevenueValue(row.billSum || row.amount),
      `${row.caseCount || 0}件`,
    ]);
    businessSections.push({
      title: "承办组",
      imageKey: "undertake",
      overview,
      detailTitle: "前十客户明细",
      detailHeaders: ["客户", "账单额", "案量"],
      details,
    });
  }

  // (七) 客户参与人 - 前十客户名称
  const participantModule = computedModules.value.find(m => m.type === "participant");
  if (participantModule) {
    const overview = (participantModule.items || []).map(item => [item.label || "", item.value ?? "--"]);
    // 获取前十客户名称
    const participantClients = await fetchDetailData("cry-custName", 10);
    const details = participantClients.map(row => [
      row.custName || row.name || "--",
    ]);
    businessSections.push({
      title: "客户参与人",
      imageKey: "participant",
      overview,
      detailTitle: "前十客户名称",
      detailHeaders: ["客户名称"],
      details,
    });
  }

  // ========== 二、软性指标（6项）==========
  const softMetricKeyMap = {
    praise: "客户表扬与批评",
    team: "团队建设",
    company: "公司管理",
    department: "部门管理",
    publicity: "对外宣传",
    outreach: "对外联络",
  };
  const softMetricOrder = ["praise", "team", "company", "department", "publicity", "outreach"];
  
  const softMetricSections = softMetricOrder.map(key => {
    const group = localSoftMetrics.value.find(g => g.key === key);
    const title = softMetricKeyMap[key] || key;
    const records = group ? getFilteredRecords(group).map((record, index) => [
      getRecordTag(record, key, index) || "--",
      getRecordText(record, key) || "--",
    ]) : [];
    return { title, records };
  });

  // ========== 三、总结补充（3项）==========
  const summaryGroup = localSoftMetrics.value.find((g) => g.key === "summary");
  const summarySections = [
    { title: "个人新年度工作想法或计划、及希望从公司获得的支持", content: getSummaryValue(summaryGroup, "plan") },
    { title: "有关公司/部门任何方面的想法或建议", content: getSummaryValue(summaryGroup, "suggestion") },
    { title: "其他", content: getSummaryValue(summaryGroup, "other") },
  ];

  // 总结文档链接
  const summaryPdfLink = summaryPdfUrl.value ? summaryPdfUrlWithTimestamp.value : "";

  return {
    user,
    year: props.year,
    businessSections,
    softMetricSections,
    summarySections,
    hardScore,
    softScore,
    summaryPdfLink,
    images: {},
  };
};

const exportPerformanceReport = async () => {
  if (exportingReport.value) return;
  exportingReport.value = true;
  
  try {
    ElMessage.info("正在生成报告，请稍候...");
    
    // 1. 先获取数据（包含API调用）
    const reportData = await buildReportData();
    
    // 2. 尝试截取关键卡片图片（使用PC宽度）
    const images = {};
    const cardSelectors = {
      revenue: ".pp-module-card:has(.pp-revenue-overview)",
      coordinator: ".pp-module-card:has(.pp-coordinator-summary)",
      owner: ".pp-module-card:has(.pp-owner-summary)",
      group: ".pp-module-card:has(.pp-group-overview)",
    };
    
    // 并行截取多个卡片，使用PC宽度
    const capturePromises = Object.entries(cardSelectors).map(async ([key, selector]) => {
      try {
        const element = document.querySelector(selector);
        if (element) {
          // 获取元素实际宽度，确保使用PC宽度（至少800px）
          const actualWidth = Math.max(element.offsetWidth, 800);
          const canvas = await html2canvas(element, {
            scale: 2, // 提高清晰度
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            logging: false,
            width: actualWidth,
            windowWidth: 1440, // PC屏幕宽度
            windowHeight: 900,
            scrollX: 0,
            scrollY: 0,
          });
          images[key] = canvas.toDataURL("image/png");
        }
      } catch (e) {
        console.warn(`截图${key}失败:`, e);
      }
    });
    
    await Promise.allSettled(capturePromises);
    reportData.images = images;
    
    // 3. 生成HTML报告
    const html = buildReportHtml(reportData);
    
    // 4. 导出为Word文档
    const blob = new Blob([`\ufeff${html}`], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const fileName = `${props.year || ""}年-${reportData.user?.name || "个人"}-绩效报告.doc`;
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    ElMessage.success("报告已生成并开始下载");
  } catch (error) {
    console.error("导出绩效报告失败:", error);
    ElMessage.error("导出失败，请稍后重试");
  } finally {
    exportingReport.value = false;
  }
};

const openSummaryDialog = async (groupIndex) => {
  const group = localSoftMetrics.value[groupIndex];
  summaryDialogGroupIndex.value = groupIndex;
  
  // 先尝试从本地数据获取
  let plan = getSummaryValue(group, "plan");
  let suggestion = getSummaryValue(group, "suggestion");
  let other = getSummaryValue(group, "other");
  
  // 注释：不再调用 querySummary 请求（个人总结改为在线编辑）
  // try {
  //   console.log('打开个人总结弹框，调用 querySummary 获取最新数据');
  //   // 获取 userId，优先从 performance.user.userId 获取，如果没有则从 performance.user.id 获取
  //   const userId = props.performance?.user?.userId || props.performance?.user?.id;
  //   const summaryRes = await querySummary({ 
  //     year: props.year, 
  //     userId: userId 
  //   });
  //   console.log('querySummary 返回:', summaryRes);
  //   
  //   if (summaryRes.success === true && summaryRes.data) {
  //     // 有数据，更新本地数据和弹框字段
  //     const summaryData = summaryRes.data;
  //     plan = summaryData.plan || '';
  //     suggestion = summaryData.suggestion || '';
  //     other = summaryData.other || '';
  //     
  //     // 更新本地记录，确保包含 id
  //     const updatedRecord = {
  //       id: String(summaryData.id || ''),
  //       plan: plan,
  //       suggestion: suggestion,
  //       other: other,
  //       createTime: summaryData.createTime || new Date().toISOString(),
  //       updateTime: summaryData.updateTime || null,
  //     };
  //     
  //     group.records = [updatedRecord];
  //     console.log('更新后的 group.records:', group.records);
  //   } else {
  //     // 没有数据（data 为 null），保持空值
  //     console.log('querySummary 返回 data 为 null，使用空值');
  //     group.records = [];
  //   }
  // } catch (error) {
  //   console.error('获取个人总结数据失败:', error);
  //   // 出错时使用本地数据
  // }
  
  // 设置弹框字段
  summaryDialogFields.value = {
    plan: plan,
    suggestion: suggestion,
    other: other,
  };
  
  summaryDialogOpen.value = true;
};

const confirmSummaryDialog = async () => {
  const group = localSoftMetrics.value[summaryDialogGroupIndex.value];
  if (!group) return;
  
  // 获取当前记录（如果有）- 每次都重新获取，确保获取最新数据
  const currentRecord = group.records && group.records.length > 0 ? group.records[0] : null;
  // 判断是否有有效的 id（id 存在且不为空字符串）
  // 注意：id 可能是数字或字符串，都需要检查
  const recordId = currentRecord?.id;
  const hasId = recordId !== undefined && 
                recordId !== null && 
                recordId !== '' && 
                String(recordId).trim() !== '';
  
  console.log('=== 保存个人总结 ===');
  console.log('当前记录:', currentRecord);
  console.log('recordId:', recordId);
  console.log('recordId 类型:', typeof recordId);
  console.log('是否有 id:', hasId);
  console.log('group.records:', group.records);
  
  // 准备请求数据
  const requestData = {
    year: props.year,
    plan: summaryDialogFields.value.plan.trim() || '',
    suggestion: summaryDialogFields.value.suggestion.trim() || '',
    other: summaryDialogFields.value.other.trim() || '',
  };
  
  try {
    let res;
    if (hasId) {
      // 有 id，调用更新接口
      // 确保 id 是数字类型（接口可能需要数字类型）
      requestData.id = typeof recordId === 'number' ? recordId : Number(recordId);
      console.log('调用 upSummary 接口，更新个人总结，参数:', requestData);
      res = await upSummary(requestData);
    } else {
      // 没有 id，调用添加接口
      console.log('调用 addSummary 接口，新增个人总结，参数:', requestData);
      res = await addSummary(requestData);
    }
    
    console.log('个人总结保存接口返回:', res);
    console.log('返回的 data:', res.data);
    console.log('返回的 data.id:', res.data?.id);
    
    if (res.success) {
      // 保存成功后，更新本地数据
      // 优先使用接口返回的 id（可能是数字），如果没有则使用当前记录的 id
      const savedId = res.data?.id !== undefined ? res.data.id : (currentRecord?.id !== undefined ? currentRecord.id : null);
      
      console.log('保存后的 id:', savedId);
      console.log('保存后的 id 类型:', typeof savedId);
      
      const updatedRecord = {
        id: savedId !== null && savedId !== undefined ? String(savedId) : '',
        plan: requestData.plan,
        suggestion: requestData.suggestion,
        other: requestData.other,
        createTime: res.data?.createTime || currentRecord?.createTime || new Date().toISOString(),
        updateTime: res.data?.updateTime || new Date().toISOString(),
      };
      
      console.log('更新后的记录:', updatedRecord);
      
      // 使用 Vue 3 的响应式更新方式，确保数据更新
      group.records = [updatedRecord];
      
      console.log('更新后的 group.records:', group.records);
      console.log('更新后的 group:', group);
      
      summaryDialogOpen.value = false;
      
      // 显示成功提示
      ElMessage({
        message: hasId ? '个人总结更新成功' : '个人总结添加成功',
        type: 'success',
        duration: 3000,
      });
    } else {
      // 显示错误提示
      ElMessage({
        message: res.message || '保存个人总结失败',
        type: 'error',
        duration: 3000,
      });
      console.error('保存个人总结失败:', res.message || res);
    }
  } catch (error) {
    // 显示错误提示
    ElMessage({
      message: '保存个人总结异常，请稍后重试',
      type: 'error',
      duration: 3000,
    });
    console.error('保存个人总结异常:', error);
  }
};

const summaryPdfUrlWithTimestamp = computed(() => {
  if (!summaryPdfUrl.value) return "";
  const separator = summaryPdfUrl.value.includes("?") ? "&" : "?";
  return `${summaryPdfUrl.value}${separator}t=${summaryPdfTimestamp.value}`;
});

const getMaterialFilePath = (item) => {
  if (!item) return "";
  return item.address || item.filePath || item.fileUrl || item.url || item.path || item.materialPath || item.fileAddress || "";
};

const resolveSummaryMaterial = (data) => {
  if (!data) return null;
  if (data.address) return data;
  if (Array.isArray(data)) {
    return data.find(item => getMaterialFilePath(item)) || null;
  }
  if (Array.isArray(data.rows)) {
    return data.rows.find(item => getMaterialFilePath(item)) || null;
  }
  if (Array.isArray(data.list)) {
    return data.list.find(item => getMaterialFilePath(item)) || null;
  }
  if (Array.isArray(data.materialArray)) {
    return data.materialArray.find(item => getMaterialFilePath(item)) || null;
  }
  return null;
};

async function buildSummaryPdfUrl(filePath) {
  if (!filePath) {
    summaryPdfUrl.value = "";
    return;
  }
  const extension = filePath.split(".").pop()?.toLowerCase();
  if (["doc", "docx"].includes(extension)) {
    const pdfAddress = await viewPdf(filePath, true);
    summaryPdfUrl.value = pdfAddress ? `/ipdoc${pdfAddress}`.replace(/[+]/g, "%2B") : "";
  } else if (["pdf", "jpg", "png"].includes(extension)) {
    summaryPdfUrl.value = `/ipdoc${filePath}`.replace(/[+]/g, "%2B");
  } else {
    summaryPdfUrl.value = "";
  }
  summaryPdfTimestamp.value = Date.now();
}

async function loadSummaryPdf({ force = false } = {}) {
  if (summaryPdfLoading.value) return;
  if (!force && summaryPdfUrl.value) return;
  summaryPdfLoading.value = true;
  summaryPdfError.value = "";
  summaryPdfFileName.value = "";
  summaryDocAddress.value = "";
  try {
    const userId = props.performance?.user?.userId || props.performance?.user?.id;
    const params = { year: props.year };
    if (userId) params.userId = userId;
    const res = await queryMaterialByUserIdAndYear(params);
    if (res?.success === true) {
      const target = resolveSummaryMaterial(res.data);
      if (!target) {
        summaryPdfUrl.value = "";
        summaryPdfError.value = "暂无报告";
        return;
      }
      summaryPdfFileName.value = target.fileName || target.name || target.materialName || target.title || target.docName || "";
      const filePath = getMaterialFilePath(target);
      summaryDocAddress.value = filePath;
      if (!filePath) {
        summaryPdfUrl.value = "";
        summaryPdfError.value = "报告文件地址缺失";
        return;
      }
      await buildSummaryPdfUrl(filePath);
      if (!summaryPdfUrl.value) {
        summaryPdfError.value = "报告暂不支持预览";
      }
    } else {
      summaryPdfUrl.value = "";
      summaryPdfError.value = res?.message || "获取报告失败";
    }
  } catch (error) {
    summaryPdfUrl.value = "";
    summaryPdfError.value = "获取报告异常";
    console.error("加载个人总结报告失败:", error);
  } finally {
    summaryPdfLoading.value = false;
  }
}

function refreshSummaryPdf() {
  summaryPdfUrl.value = "";
  summaryPdfError.value = "";
  summaryPdfTimestamp.value = Date.now();
  loadSummaryPdf({ force: true });
}

function openSummaryPdfInNewTab() {
  if (!summaryPdfUrl.value) return;
  window.open(summaryPdfUrlWithTimestamp.value, "_blank");
}

const canEditSummary = computed(() => props.summaryEditPermission);

const handleSummaryEdit = () => {
  if (!summaryDocAddress.value) {
    summaryPdfError.value = "报告文件地址缺失";
    return;
  }
  const progID = getProgID(summaryDocAddress.value);
  doEditInOffice(summaryDocAddress.value, progID);
};

const removeRecord = async (groupIndex, recordIndex) => {
  const group = localSoftMetrics.value[groupIndex];
  if (!group || !Array.isArray(group.records)) return;
  
  const record = group.records[recordIndex];
  if (!record) return;
  
  // 获取记录的 id
  let recordId = '';
  if (record && typeof record === 'object' && record !== null) {
    recordId = record.id;
  }
  
  if (!recordId) {
    console.error('删除记录失败：找不到记录 ID');
    return;
  }
  
  try {
    console.log('调用 deleteSoftMetricRecords 接口，记录 ID:', recordId);
    const res = await deleteSoftMetricRecords({ id: recordId });
    console.log('deleteSoftMetricRecords 接口返回:', res);
    
    if (res.success) {
      // 删除成功后，从列表中移除
      localSoftMetrics.value[groupIndex].records.splice(recordIndex, 1);
    } else {
      console.error('删除软性指标记录失败:', res.message || res);
    }
  } catch (error) {
    console.error('删除软性指标记录异常:', error);
  }
};

// 头像加载状态：只有成功加载后才显示
const avatarLoaded = ref(false);

// 处理头像路径
const getAvatarUrl = (avatar) => {
  if (!avatar) return '';
  // 如果是完整URL（http/https开头），直接返回
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }
  // 如果路径以 / 开头，添加 /ipdoc 前缀
  if (avatar.startsWith('/')) {
    return `/ipdoc${avatar}`;
  }
  // 其他情况直接添加 /ipdoc/ 前缀
  return `/ipdoc/${avatar}`;
};

// 处理头像加载成功
const handleAvatarLoad = () => {
  avatarLoaded.value = true;
};

// 处理头像加载错误
const handleAvatarError = () => {
  avatarLoaded.value = false;
};

// 监听 performance 变化，重置头像加载状态
watch(() => props.performance?.user?.avatar, () => {
  // 重置加载状态
  avatarLoaded.value = false;
  // 如果有新头像，等待图片加载成功后再显示
}, { immediate: true });

const formatDelta = (value, key) => {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "number") {
    // 客户数、案件数、出庭数显示具体数量变化，总创收额显示百分比
    if (['customers', 'cases', 'appearances'].includes(key)) {
      return `${value >= 0 ? "+" : ""}${value}`;
    }
    return `${value >= 0 ? "+" : ""}${value}%`;
  }
  return value;
};

const getPublicityPopoverWidth = (label) => {
  const widthMap = {
    "参与讨论/发言": 720,
    "培训/演讲/主持": 720,
    "外部荣誉": 640,
    "外部任职": 680,
    "外部课题": 700,
    "对外发文": 720,
  };
  return widthMap[label] || 600;
};

const getPublicityHeaders = (label) => {
  const headerMap = {
    "参与讨论/发言": ["活动名称", "时间", "地点", "主题", "角色"],
    "培训/演讲/主持": ["活动名称", "时间", "地点", "主题", "角色"],
    "外部荣誉": ["荣誉名称", "获得时间", "颁发机构", "荣誉级别"],
    "外部任职": ["机构名称", "职务", "任职时间", "职责描述"],
    "外部课题": ["课题名称", "时间", "机构", "课题类型", "角色"],
    "对外发文": ["文章标题", "发表时间", "发表平台", "文章类型", "作者角色"],
  };
  return headerMap[label] || [];
};

const getPublicityHeaderClass = (label) => {
  const classMap = {
    "参与讨论/发言": "pp-client-popover-header pp-client-popover-header--discussion",
    "培训/演讲/主持": "pp-client-popover-header pp-client-popover-header--training",
    "外部荣誉": "pp-client-popover-header pp-client-popover-header--honor",
    "外部任职": "pp-client-popover-header pp-client-popover-header--position",
    "外部课题": "pp-client-popover-header pp-client-popover-header--topic",
    "对外发文": "pp-client-popover-header pp-client-popover-header--article",
  };
  return classMap[label] || "pp-client-popover-header";
};

const getPublicityRowClass = (label) => {
  const classMap = {
    "参与讨论/发言": "pp-client-popover-row pp-client-popover-row--discussion",
    "培训/演讲/主持": "pp-client-popover-row pp-client-popover-row--training",
    "外部荣誉": "pp-client-popover-row pp-client-popover-row--honor",
    "外部任职": "pp-client-popover-row pp-client-popover-row--position",
    "外部课题": "pp-client-popover-row pp-client-popover-row--topic",
    "对外发文": "pp-client-popover-row pp-client-popover-row--article",
  };
  return classMap[label] || "pp-client-popover-row";
};

const getPublicityFields = (label, detail) => {
  const fieldMap = {
    "参与讨论/发言": [detail.name, detail.time, detail.location, detail.topic, detail.role],
    "培训/演讲/主持": [detail.name, detail.time, detail.location, detail.topic, detail.role],
    "外部荣誉": [detail.name, detail.time, detail.organization, detail.level],
    "外部任职": [detail.organization, detail.position, detail.time, detail.description],
    "外部课题": [detail.name, detail.time, detail.organization, detail.type, detail.role],
    "对外发文": [detail.title, detail.time, detail.platform, detail.type, detail.role],
  };
  return fieldMap[label] || [];
};

const getPublicityCellClass = (label, fieldIdx) => {
  const baseClass = "pp-client-popover-cell";
  if (fieldIdx === 0) return `${baseClass} name`;
  if (label === "参与讨论/发言" || label === "培训/演讲/主持") {
    if (fieldIdx === 1 || fieldIdx === 2) return `${baseClass} time`;
    if (fieldIdx === 4) return `${baseClass} role`;
  }
  if (label === "外部荣誉") {
    if (fieldIdx === 1) return `${baseClass} time`;
  }
  if (label === "外部任职") {
    if (fieldIdx === 2) return `${baseClass} time`;
  }
  if (label === "外部课题" || label === "对外发文") {
    if (fieldIdx === 1) return `${baseClass} time`;
  }
  return baseClass;
};

// 获取开发人员模块的客户列表（直接返回topClients，和其他项一样）
const getDeveloperClients = (item) => {
  if (item.topClients && Array.isArray(item.topClients) && item.topClients.length > 0) {
    return item.topClients;
  }
  return [];
};

// 格式化金额显示（支持数字和字符串格式）
const formatClientAmount = (amount) => {
  if (amount === null || amount === undefined) return '';
  // 如果是数字，格式化为字符串
  if (typeof amount === 'number') {
    return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  // 如果是字符串，直接返回
  if (typeof amount === 'string') {
    return amount;
  }
  return '';
};

const formatPercent = (value) => {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'number') {
    return `${(value * 100).toFixed(0)}%`;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return '';
    if (/%$/.test(trimmed)) return trimmed;
    const num = Number.parseFloat(trimmed);
    if (Number.isFinite(num)) {
      return `${(num * 100).toFixed(0)}%`;
    }
    return trimmed;
  }
  return '';
};

// 账单金额卡片：兼容后端返回的数字/数字字符串/已带币种字符串，统一格式化展示
// 格式化协调领域账单额
const formatBillingAmount = (value) => {
  if (value === null || value === undefined || value === '') return '¥0.00'
  // 数字直接格式化
  if (typeof value === 'number') {
    return `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  // 字符串：如果已包含币种符号，尽量原样；否则按数字解析并格式化
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return '¥0.00'
    // 已经是类似 "¥1,050 万" / "￥123" 这种，直接返回（把￥统一成¥）
    if (/[¥￥]/.test(trimmed)) {
      return trimmed.replace('￥', '¥')
    }
    // 纯数字字符串：解析后格式化
    const num = Number.parseFloat(trimmed)
    if (Number.isFinite(num)) {
      return `¥${num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    return trimmed
  }
  return String(value)
}

const hasCoordinatorBillingAmount = (value) => {
  if (value === null || value === undefined || value === '') return false;
  const numeric = Number(String(value).replace(/[^\d.-]/g, ""));
  if (Number.isFinite(numeric)) return numeric !== 0;
  return true;
};

const formatRevenueValue = (value) => {
  if (value === null || value === undefined || value === '') return '--'
  // 数字直接格式化
  if (typeof value === 'number') {
    return `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  // 字符串：如果已包含币种符号，尽量原样；否则按数字解析并格式化
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return '--'
    // 已经是类似 "¥1,050 万" / "￥123" 这种，直接返回（把￥统一成¥）
    if (/[¥￥]/.test(trimmed)) {
      return trimmed.replace('￥', '¥')
    }
    // 纯数字字符串：解析后格式化
    const num = Number.parseFloat(trimmed)
    if (Number.isFinite(num)) {
      return `¥${num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    return trimmed
  }
  return String(value)
}


const getTotalAmount = (topClients) => {
  if (!topClients || !Array.isArray(topClients) || topClients.length === 0) {
    return "";
  }
  // 从topClients中提取金额并累加
  const total = topClients.reduce((sum, client) => {
    if (client.amount !== null && client.amount !== undefined) {
      // 如果 amount 是数字，直接使用
      if (typeof client.amount === 'number') {
        return sum + client.amount;
      }
      // 如果 amount 是字符串，提取数字部分，去掉¥和逗号
      if (typeof client.amount === 'string') {
        const amountStr = client.amount.replace(/[¥,]/g, "");
        const amount = parseFloat(amountStr) || 0;
        return sum + amount;
      }
    }
    return sum;
  }, 0);
  
  if (total === 0) return "";
  
  // 格式化金额
  if (total >= 10000) {
    return `¥${(total / 10000).toFixed(1)}万`;
  }
  return `¥${total.toLocaleString()}`;
};


// 检查记录是否可以编辑（autoAdd === 0 时可以编辑）
const canEditRecord = (group, recordIndex) => {
  if (!group || !Array.isArray(group.records)) return false;
  const record = group.records[recordIndex];
  if (!record) return false;
  
  // 如果是对象格式，检查 autoAdd 字段
  if (record && typeof record === 'object' && record !== null) {
    return record.autoAdd === 0;
  }
  
  // 如果是字符串格式（旧数据），默认可以编辑
  return true;
};

// eslint-disable-next-line no-unused-vars
const getPieStyle = (segments = []) => {
  const total = segments.reduce((sum, item) => sum + (item.value || 0), 0) || 1;
  let current = 0;
  const stops = segments
    .map((item) => {
      const value = item.value || 0;
      const start = current;
      current += (value / total) * 100;
      return `${item.color} ${start}% ${current}%`;
    })
    .join(", ");
  return {
    background: `conic-gradient(${stops})`,
  };
};

// 业绩曲线图表相关
const performanceChartRefUp = ref(null);
const performanceChartRefDown = ref(null);
const performanceChartUp = ref(null);
const performanceChartDown = ref(null);
const currentModule = ref(null);
const currentChartType = ref('up'); // 当前图表类型：'up' 或 'down'

// 客户负责人的图表相关
const ownerChartRefUp = ref(null);
const ownerChartRefDown = ref(null);
const ownerChartUp = ref(null);
const ownerChartDown = ref(null);
// const currentOwnerChartType = ref('up'); // 当前图表类型：'up' 或 'down'

// 初始化图表（保留用于其他模块）
// eslint-disable-next-line no-unused-vars
const initPerformanceChart = (module, type = 'up') => {
  // 根据类型选择数据源：up 使用 performanceData，down 使用 performanceDataDown
  const dataSource = type === 'down' ? module?.performanceDataDown : module?.performanceData;
  if (!dataSource) {
    console.warn(`Module performanceData${type === 'down' ? 'Down' : ''} not found:`, module);
    return;
  }
  
  currentModule.value = module;
  currentChartType.value = type; // 保存当前图表类型
  
  const chartRef = type === 'up' ? performanceChartRefUp : performanceChartRefDown;
  const chartInstance = type === 'up' ? performanceChartUp : performanceChartDown;
  
  // 获取实际的 DOM 元素
  const getElement = () => {
    // 先尝试使用 ref
    let element = chartRef.value;
    
    // 如果 ref 是对象，尝试多种方式获取 DOM 元素
    if (element && typeof element === 'object') {
      // 尝试获取 $el 属性（Vue 组件实例）
      if (element.$el) {
        element = element.$el;
      }
      // 尝试获取 el 属性
      else if (element.el) {
        element = element.el;
      }
      // 尝试获取 element 属性
      else if (element.element) {
        element = element.element;
      }
      // 如果还是对象，尝试通过类名和 data 属性查找（popover 内部）
      else if (!(element instanceof HTMLElement)) {
        // 根据 type 查找对应的 popover
        const popoverClass = type === 'up' ? '.pp-performance-chart-popover-up' : '.pp-performance-chart-popover-down';
        const popover = document.querySelector(popoverClass);
        if (popover) {
          element = popover.querySelector(`.pp-performance-chart-body[data-chart-type="${type}"]`);
        }
        // 如果还是找不到，尝试查找所有 popover 中最近显示的
        if (!element) {
          const popovers = document.querySelectorAll('.pp-performance-chart-popover');
          if (popovers.length > 0) {
            const lastPopover = popovers[popovers.length - 1];
            element = lastPopover.querySelector(`.pp-performance-chart-body[data-chart-type="${type}"]`);
          }
        }
      }
    }
    
    return element;
  };
  
  // 使用 requestAnimationFrame 和多次检查确保 DOM 完全渲染
  const checkAndInit = (attempts = 0) => {
    requestAnimationFrame(() => {
      const element = getElement();
      
      if (!element) {
        if (attempts < 15) {
          setTimeout(() => checkAndInit(attempts + 1), 30);
          return;
        }
        console.error(`performanceChartRef${type} not available after multiple attempts`);
        return;
      }
      
      // 检查是否是有效的 DOM 元素
      if (!(element instanceof HTMLElement)) {
        if (attempts < 15) {
          setTimeout(() => checkAndInit(attempts + 1), 30);
          return;
        }
        console.error(`performanceChartRef${type} is not a valid DOM element, type:`, typeof element, element);
        return;
      }
      
      // 确保元素已经挂载到 DOM
      if (!element.parentElement) {
        if (attempts < 15) {
          setTimeout(() => checkAndInit(attempts + 1), 30);
          return;
        }
        console.error(`performanceChartRef${type} element is not mounted to DOM`);
        return;
      }
      
      // 确保元素有尺寸
      if (element.offsetWidth === 0 && element.offsetHeight === 0) {
        if (attempts < 15) {
          setTimeout(() => checkAndInit(attempts + 1), 30);
          return;
        }
      }
      
      initChart(element, chartInstance);
    });
  };
  
  // 先等待 nextTick，然后开始检查
  nextTick(() => {
    checkAndInit();
  });
};

const initChart = (element, chartInstance) => {
  // 根据类型选择数据源
  const dataSource = currentChartType.value === 'down' 
    ? currentModule.value?.performanceDataDown 
    : currentModule.value?.performanceData;
  if (!element || !dataSource) {
    return;
  }
  
  if (chartInstance.value) {
    chartInstance.value.dispose();
    chartInstance.value = null;
  }
  
  try {
    chartInstance.value = echarts.init(element);
    if (!chartInstance.value) {
      console.error('Failed to initialize echarts');
      return;
    }
    // 传递 chartInstance 和 type，确保使用正确的图表实例
    updateChart(chartInstance, currentChartType.value);
    
    // 确保图表大小正确
    setTimeout(() => {
      if (chartInstance.value) {
        chartInstance.value.resize();
      }
    }, 100);
  } catch (error) {
    console.error('Error initializing chart:', error);
  }
};

const updateChart = (chartInstance = null, type = null) => {
  // 使用传入的 chartInstance，如果没有则根据 type 选择正确的图表实例
  let chart = null;
  if (chartInstance && chartInstance.value) {
    chart = chartInstance.value;
  } else if (type === 'down' && performanceChartDown.value) {
    // 如果是下降类型，优先使用下降图表实例
    chart = performanceChartDown.value;
  } else if (type === 'up' && performanceChartUp.value) {
    // 如果是上升类型，使用上升图表实例
    chart = performanceChartUp.value;
  } else if (performanceChartUp.value) {
    chart = performanceChartUp.value;
  } else if (performanceChartDown.value) {
    chart = performanceChartDown.value;
  }
  
  // 根据类型选择数据源
  const dataSource = type === 'down' 
    ? currentModule.value?.performanceDataDown 
    : currentModule.value?.performanceData;
  if (!chart || !dataSource) return;
  
  const data = dataSource;
  if (!data || !data.clients || data.clients.length === 0) return;
  
  // 默认显示"所有客户"或"所有下降客户"的数据
  const defaultClientName = type === 'down' ? '所有下降客户' : '所有客户';
  const client = data.clients.find(c => c.name === defaultClientName) || data.clients[0];
  if (!client || !client.data) return;
  
  const option = {
    tooltip: {
      trigger: "axis",
      formatter: (params) => {
        if (!params || !Array.isArray(params) || params.length === 0) return '';
        const param = params[0];
        if (!param) return '';
        const value = param.value || 0;
        const year = param.axisValue || '';
        return `${year}年<br/>${client?.name || '未知'}: ¥${(value / 10000).toFixed(1)}万`;
      },
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#e1e7f2",
      borderWidth: 1,
      textStyle: {
        color: "#1f2a44",
        fontSize: 12,
      },
    },
    grid: {
      left: "10%",
      right: "10%",
      top: "15%",
      bottom: "15%",
    },
    xAxis: {
      type: "category",
      data: data.years,
      axisLine: {
        onZero: false,
        lineStyle: {
          color: "#e1e7f2",
        },
      },
      axisLabel: {
        color: "#5f6f86",
        fontSize: 11,
      },
    },
    yAxis: {
      type: "value",
      axisLine: {
        show: false,
        onZero: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: "#5f6f86",
        fontSize: 11,
        formatter: (value) => {
          return `¥${(value / 10000).toFixed(0)}万`;
        },
      },
      splitLine: {
        lineStyle: {
          color: "#f0f3f9",
          type: "dashed",
        },
      },
    },
    series: [
      {
        name: client?.name || "未知",
        type: "line",
        data: client?.data || [],
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: {
          color: "#2f6bff",
          width: 2,
        },
        itemStyle: {
          color: "#2f6bff",
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: "rgba(47, 107, 255, 0.2)",
              },
              {
                offset: 1,
                color: "rgba(47, 107, 255, 0.05)",
              },
            ],
          },
        },
      },
    ],
  };
  
  // 延迟 setOption，避免 ECharts 内部 getAxesOnZeroOf 未就绪报错
  const doSetOption = () => {
    if (!chart || (chart.isDisposed && chart.isDisposed())) return;
    try {
      chart.resize();
      chart.setOption(option);
    } catch (e) {
      if (e && String(e.message || '').includes('getAxesOnZeroOf')) {
        setTimeout(doSetOption, 100);
      } else {
        console.warn('业绩图表 setOption 异常:', e);
      }
    }
  };
  setTimeout(doSetOption, 80);
};

// 初始化客户负责人模块的图表
const initOwnerPerformanceChart = (module, type = 'up') => {
  const clients = type === 'up' ? ownerUpClients : ownerDownClients;
  const selectedClient = type === 'up' ? selectedOwnerUpClient : selectedOwnerDownClient;
  const selectedClientId = type === 'up' ? selectedOwnerUpClientId : selectedOwnerDownClientId;

  if (clients.value.length === 0 || !selectedClient.value) return;
  const client = clients.value.find(c => (c.custId ?? c.name) === selectedClientId.value) ||
    clients.value.find(c => c.name === selectedClient.value);
  if (!client || !client.data) return;

  let element = document.querySelector(`.pp-coordinator-chart-body[data-chart-type="owner-${type}"]`);
  if (!element) {
    const popover = document.querySelector('.pp-coordinator-performance-popover');
    if (popover) {
      element = popover.querySelector(`.pp-coordinator-chart-body[data-chart-type="owner-${type}"]`);
    }
  }
  if (!element || !(element instanceof HTMLElement)) return;
  if (!document.body.contains(element)) return;
  const rect = element.getBoundingClientRect();
  if (rect.width < 10 || rect.height < 10) return;

  const yearCount = 3;
  const years = Array.isArray(client.years) ? client.years : [];
  const data = Array.isArray(client.data) ? client.data : [];
  const recentYears = years.slice(-yearCount);
  const recentData = data.slice(-yearCount).map((value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  });
  const validLength = Math.min(recentYears.length, recentData.length);
  const normalizedYears = validLength > 0 ? recentYears.slice(-validLength) : [];
  const normalizedData = validLength > 0 ? recentData.slice(-validLength) : [];
  if (normalizedYears.length === 0 || normalizedData.length === 0) return;

  const option = {
    animation: false,
    tooltip: {
      trigger: "axis",
      formatter: (params) => {
        const param = params && params.length > 0 ? params[0] : null;
        if (!param) return "";
        return `${param.name}<br/>${param.seriesName}: ¥${Number(param.value || 0).toLocaleString()}`;
      },
    },
    grid: {
      left: "70px",
      right: "20px",
      top: "20px",
      bottom: "30px",
    },
    xAxis: {
      type: "category",
      data: normalizedYears,
      boundaryGap: false,
      axisLine: {
        onZero: false,
        lineStyle: { color: "#e1e7f2" },
      },
      axisLabel: {
        color: "#7c8ba1",
        fontSize: 11,
      },
    },
    yAxis: {
      type: "value",
      scale: true,
      axisLine: { show: false, onZero: false },
      axisTick: { show: false },
      axisLabel: {
        color: "#7c8ba1",
        fontSize: 11,
        formatter: (value) => {
          if (value >= 10000) {
            return `¥${(value / 10000).toFixed(1)}万`;
          }
          return `¥${value}`;
        },
      },
      splitLine: {
        lineStyle: { color: "#f0f3f9", type: "dashed" },
      },
    },
    series: [
      {
        name: client.name,
        type: "line",
        data: normalizedData,
        smooth: true,
        animation: false,
        label: {
          show: true,
          position: "top",
          color: "#54657e",
          fontSize: 11,
          formatter: ({ value }) => `¥${Number(value || 0).toLocaleString()}`,
        },
        tooltip: {
          show: true,
          trigger: "item",
          formatter: ({ name, value }) => `${name}<br/>${client.name}: ¥${Number(value || 0).toLocaleString()}`,
        },
        lineStyle: {
          color: type === 'up' ? "#ff4757" : "#2fbf71",
          width: 2,
        },
        itemStyle: {
          color: type === 'up' ? "#ff4757" : "#2fbf71",
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: type === 'up' ? "rgba(255, 71, 87, 0.2)" : "rgba(47, 191, 113, 0.2)",
              },
              {
                offset: 1,
                color: type === 'up' ? "rgba(255, 71, 87, 0)" : "rgba(47, 191, 113, 0)",
              },
            ],
          },
        },
      },
    ],
  };

  const instance = echarts.getInstanceByDom(element) || echarts.init(element);
  if (type === 'up') {
    ownerChartUp.value = instance;
  } else {
    ownerChartDown.value = instance;
  }
  if (instance && instance.isDisposed && instance.isDisposed()) return;
  try {
    instance.setOption(option, { notMerge: true, lazyUpdate: true });
  } catch (error) {
    console.warn("客户负责人业绩图表渲染异常:", error);
  }
};


// 移除 selectedClient 的 watch，因为已经去掉了客户筛选下拉列表

onBeforeUnmount(() => {
  if (performanceChartUp.value) {
    performanceChartUp.value.dispose();
  }
  if (performanceChartDown.value) {
    performanceChartDown.value.dispose();
  }
  if (ownerChartUp.value) {
    ownerChartUp.value.dispose();
  }
  if (ownerChartDown.value) {
    ownerChartDown.value.dispose();
  }
  if (coordinatorUpChart.value) {
    coordinatorUpChart.value.dispose();
  }
  if (coordinatorDownChart.value) {
    coordinatorDownChart.value.dispose();
  }
});




</script>
