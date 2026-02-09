<script>
import Layout from "@/layouts/main";
// import PageHeader from "@/components/page-header";

import RevenueFromBills from "@/components/widgets/revenueFromBills";
// import Emailsent from "@/components/widgets/emailsent";
// import Activity from "@/components/widgets/activity";
import Customer from "@/components/widgets/customer";
import TimeLimit from "@/components/widgets/timeLimit";
// import KnowledgeBase from "@/components/widgets/knowledge-base";
// import DomainBillChart from "@/components/widgets/domain-bill-chart";
// import StatisticsApplicationsChart from "@/components/widgets/statistics-applications-chart";
import Posts from "@/components/widgets/posts";
import Tasks from "@/components/widgets/tasks";
import Cases from "@/components/widgets/cases";
// import Dynamic from "@/components/widgets/dynamic";
import Employees from "@/components/widgets/employees";
import WorkTime from "@/components/widgets/work-time";
// import HealthLevel from "@/components/widgets/health-level";
import AgencyTask from "@/components/widgets/agency-task";
import Bill from "@/components/widgets/bill";
import Invoice from "@/components/widgets/invoice";
// import SellingProduct from "@/components/widgets/selling-product";
import CaseDeadline from '@/components/widgets/caseDeadline'
import PatentAnnuity from '@/components/widgets/patentAnnuity'
import ExpirationOfContract from '@/components/widgets/expirationOfContract'

/**
 * Dashboard Component
 */
export default {
  components: {
    Layout,
    CaseDeadline,
    PatentAnnuity,
    ExpirationOfContract,
    // PageHeader,
    RevenueFromBills,
    // Emailsent,
    // Activity,
    Customer,
    TimeLimit,
    // KnowledgeBase,
    // DomainBillChart,
    // StatisticsApplicationsChart,
    Posts,
    Tasks,
    Cases,
    // Dynamic,
    Employees,
    WorkTime,
    // HealthLevel,
    AgencyTask,
    Bill,
    Invoice
  },
};
</script>

<template>
  <Layout>
    <div class="row">
      <!-- end col -->
      <div class="col-xl-8">
        <div class="row">
          <di class="col-md-4">
            <CaseDeadline/>
          </di>
          <di class="col-md-4">
            <PatentAnnuity/>
          </di>
          <di class="col-md-4">
            <ExpirationOfContract/>
          </di>
        </div>

        <div class="row">
          <div class="col-xl-6">
            <!-- 计划日程 -->
            <Tasks />
          </div>
          <div class="col-xl-6">
            <!-- 案件 -->
            <Cases />
          </div>
        </div>
      </div>
      <div class="col-xl-4">
        <!-- 案件时限 -->
        <TimeLimit/>
      </div>
    </div>
    <!-- end row -->

    <div class="row">
      <div class="col-lg-12">
        <!-- 待办任务 -->
        <AgencyTask />
      </div>
      <!-- end col -->
    </div>

    <div class="row">
      <!-- 客户信息 -->
      <Customer/>
    </div>
    <!-- end row -->

    <div class="row">
      <div class="col-lg-6">
        <!-- 账单 -->
        <Bill />
      </div>
      <div class="col-lg-6">
        <!-- 发票 -->
        <Invoice />
      </div>
      <!-- end col -->
    </div>

    <div class="row">
      <!-- <div class="col-xl-4">
        我的日程
        <Activity :updating="fetchingStats" />
      </div> -->

      <!-- <div class="col-xl-4">
        动态信息
        <Dynamic></Dynamic>
      </div> -->
      <div class="col-xl-4">
        <!-- 推荐文章 -->
        <Posts />
      </div>
      <div class="col-xl-4">
        <Employees/>
      </div>
      <div class="col-xl-4">
            <RevenueFromBills />
          </div>
    </div>

    <!-- <div class="row">
      
      <div class="col-xl-8">
        AI知识库
        <KnowledgeBase></KnowledgeBase>
      </div>
    </div> -->

    <div class="row">
      <div class="col-xl-8">
        <!-- 案件统计
        <Emailsent :updating="fetchingStats" /> -->
        <div class="row">
          
          <!-- <div class="col-xl-6">
            <HealthLevel />
          </div> -->
        </div>
      </div>

      <!-- <div class="col-xl-4">
        领域账单收入占比
        <DomainBillChart />
      </div> -->
      <div class="col-xl-6">
        <WorkTime />
      </div>
      <!-- <div class="col-xl-6">
        <StatisticsApplicationsChart />
      </div> -->
    </div>
  </Layout>
</template>
