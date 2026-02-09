import RevenueFromBills from "@/components/widgets/revenueFromBills";
import Customer from "@/components/widgets/customer";
import TimeLimit from "@/components/widgets/timeLimit";
import Posts from "@/components/widgets/posts";
import Tasks from "@/components/widgets/tasks";
import Cases from "@/components/widgets/cases";
import Employees from "@/components/widgets/employees";
import WorkTime from "@/components/widgets/work-time";
import AgencyTask from "@/components/widgets/agency-task";
import Bill from "@/components/widgets/bill";
import Invoice from "@/components/widgets/invoice";
import CaseDeadline from "@/components/widgets/caseDeadline";
import PatentAnnuity from "@/components/widgets/patentAnnuity";
import ExpirationOfContract from "@/components/widgets/expirationOfContract";

//高级合伙人组件
import ManagementTitle from "@/components/widgets/management-title";
import TotalRevenue from "@/components/widgets/total-revenue"; //总收入
import TotalFee from "@/components/widgets/total-fee"; //总费用
import TotalProfit from "@/components/widgets/total-profit"; //净利润
import TotalGrossProfit from "@/components/widgets/total-grossProfit"; //毛利润
import EmployeesTotal from "@/components/widgets/senior/employees-total"; //员工总数
import EmployeesTurnover from "@/components/widgets/senior/employees-turnover"; //入职离职人数
import EmployeesAverageyear from "@/components/widgets/senior/employees-averageyear"; //平均工作年限
import EmployeesAveragewages from "@/components/widgets/senior/employees-averagewages"; //平均工资成本
//客户管理
import CustomerTitle from "@/components/widgets/senior/customer/customer-title";
import CustomerImportant from "@/components/widgets/senior/customer/customer-important"; //重要客户
import CustomerNew from "@/components/widgets/senior/customer/customer-new"; //本年新客户
import CustomerCase from "@/components/widgets/senior/customer/customer-case"; //本年活跃客户
import CustomerPotential from "@/components/widgets/senior/customer/customer-potential"; //潜在客户
import CustomerAlert from "@/components/widgets/senior/customer/customer-alert.vue"; //客户预警
import CustomerList from "@/components/widgets/senior/customer/customer-list.vue"; //客户列表
import CustomerWorldMap from "@/components/widgets/senior/customer/customer-worldmap.vue"; //全球销售地图
//业务数据
import BusinessDataTitle from "@/components/widgets/senior/business-data"; //业务数据标题
//绩效
import PerformanceTitle from "@/components/widgets/senior/performance/performance-title";

//人力资源
import HrmTitle from "@/components/widgets/senior/hrm/hrm-title";

//高级人员待办事项
import MatterTitle from "@/components/widgets/senior/todotask/matter-title";
import MatterContainer from "@/components/widgets/senior/todotask/matter-container";
import BusinessTripMatter from "@/components/widgets/senior/todotask/business-trip.vue";
import FeeMatter from "@/components/widgets/senior/todotask/fee-matter.vue";
import BillMatter from "@/components/widgets/senior/todotask/bill-matter.vue";
import CaseMatter from "@/components/widgets/senior/todotask/case-matter.vue";

//重要事项
import MattersImportant from "@/components/widgets/senior/matters-important.vue"
// import CasesImportant from "@/components/widgets/senior/cases-important.vue"
import CasesImportant from "@/components/widgets/senior/notification/concerns.vue"
export default {
  RevenueFromBills: RevenueFromBills,
  Customer: Customer,
  TimeLimit: TimeLimit,
  Posts: Posts,
  Tasks: Tasks,
  Cases: Cases,
  Employees: Employees,
  WorkTime: WorkTime,
  AgencyTask: AgencyTask,
  Bill: Bill,
  Invoice: Invoice,
  CaseDeadline: CaseDeadline,
  PatentAnnuity: PatentAnnuity,
  ExpirationOfContract: ExpirationOfContract,
  ManagementTitle: ManagementTitle,
  TotalRevenue: TotalRevenue,
  TotalFee: TotalFee,
  TotalProfit: TotalProfit,
  TotalGrossProfit: TotalGrossProfit,
  EmployeesTotal: EmployeesTotal,
  EmployeesTurnover: EmployeesTurnover,
  EmployeesAverageyear: EmployeesAverageyear,
  EmployeesAveragewages: EmployeesAveragewages,
  CustomerTitle: CustomerTitle,
  CustomerImportant: CustomerImportant,
  CustomerNew: CustomerNew,
  CustomerCase: CustomerCase,
  CustomerPotential: CustomerPotential,
  CustomerAlert: CustomerAlert,
  CustomerList: CustomerList,
  CustomerWorldMap: CustomerWorldMap,
  BusinessDataTitle: BusinessDataTitle,
  HrmTitle: HrmTitle,
  MatterTitle: MatterTitle,
  BusinessTripMatter: BusinessTripMatter,
  FeeMatter: FeeMatter,
  BillMatter: BillMatter,
  CaseMatter: CaseMatter,
  MatterContainer: MatterContainer,
  PerformanceTitle: PerformanceTitle,
  MattersImportant: MattersImportant,
  CasesImportant: CasesImportant,
};
