<template>
  <div class="card">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="card-title mb-0">关联费用</h4>
        <div>
          <b-button
              v-if="isAddView"
              size="sm"
              variant="info"
              class="contract-action-btn"
              @click="goFee"
          >
            <i class="bx bx-plus me-1"></i>添加
          </b-button>
          <b-button
              size="sm"
              variant="info"
              class="contract-action-btn"
              @click="queryList"
              title="刷新"
          >
            <el-icon class="me-1"><Refresh /></el-icon>刷新
          </b-button>
        </div>
      </div>

      <!-- 表格形式展示任务流程 -->
      <div class="table-responsive">
        <table class="table process-table">
          <thead>
          <tr>
            <th class="col-type">科目</th>
            <th class="col-handler">总金额</th>
            <th class="col-remark">费用承担组</th>
            <th class="col-status">报销人所属组</th>
            <th class="col-date">报销人</th>
            <th class="col-abroad">是否境外账单</th>
            <th class="col-contract">核销状态</th>
            <th class="col-contract">费用状态</th>
            <th class="col-contract">操作</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(fee, index) of contractFeeList" :key="index" class="process-row">
            <td>
              <div class="task-type">
                <span>{{ fee.feeName }}</span>
              </div>
            </td>
            <td>{{ fee.total || '-' }}</td>
            <td class="remark-cell">
              <div class="remark-content">{{ fee.costWkgIdStr || '-' }}</div>
            </td>
            <td>
              {{ fee.reimburseWkgIdStr || '-' }}
            </td>
            <td class="col-date">{{ fee.reimburseUserIdStr || '-' }}</td>
            <td class="col-abroad">{{ fee.isAbroadBill || '-' }}</td>
            <td class="col-contract">
              {{ fee.tobillStatusStr || '-' }}
            </td>
            <td class="col-attachment">
              {{ fee.wfStatus || '-' }}
            </td>
            <td class="col-operation">
              <span class="view-detail-btn" @click="toggleSidebar(fee)">查看详情</span>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
    <FeeDialog
      :showSidebar="isShowDetail"
      @update:showSidebar="handleSidebarUpdate"
      :feeId="feeId"
    />
  </div>
</template>

<script setup>
import {defineProps, onBeforeMount, onBeforeUnmount, ref,computed} from "vue";
import FeeDialog from "@/views/management/contract-management/components/fee-dialog";
import {queryContractFeeInfo} from '@/api/contract'
import {Refresh} from "@element-plus/icons-vue";
import { getUserInfo } from "@/utils/user";

const props = defineProps({
  contractId: {
    type: [Number, String],
    required: true,
  },
  contractDetial: {
    type: Object,
    required: true,
  }
});
const isAddView = computed(() => { // 当前用户为呈批人且当前合同号存在，且审批状态不等于‘已注销’
  return props.contractDetial.approvalStatus !== '已注销' && props.contractDetial.contractNo && getUserInfo().userId === props?.contractDetial?.projectInfo?.undertaker
})
const contractFeeList = ref([])
const feeId = ref(0)
const isShowDetail = ref(false)
let pollingTimer = null

const openUrl = (path) =>{
  let url = '';
  const hostname = window.location.hostname;
  const port = window.location.port || 8000;
  if (hostname === 'ips.wanhuida.cn') {
    url = `https://ips.wanhuida.cn/#${path}` // 正式
  } else if (hostname === 'localhost') {
    url = `http://localhost:9527/#${path}` // 开发
  } else if(port == 8000) {
    url = `http://${hostname}:${port}/#${path}` // 测试
  } else {
    url = `http://${hostname}:${port}/v1/#${path}` // 外包测试
  }
  window.open(url);
}
const goFee = () => {
  openUrl('workbench/finance_fee?contractId=' + props.contractId);
}

// 打开费用详情弹框
const toggleSidebar = (fee) => {
  const id = fee.feeId;
  if (id) {
    feeId.value = id;
    isShowDetail.value = true;
  }
};

// 关闭费用详情弹框
const handleSidebarUpdate = (value) => {
  isShowDetail.value = value;
};

const queryList = () => {
  queryContractFeeInfo({
    contractId: props.contractId,
  }).then(res => {
    contractFeeList.value = res.data
  })
};

// 启动轮询
const startPolling = () => {
  queryList()
  pollingTimer = setInterval(() => {
    queryList()
  }, 60000) // 1分钟轮询
}

// 停止轮询
const stopPolling = () => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
}

onBeforeMount(() => {
  startPolling()
})

onBeforeUnmount(() => {
  stopPolling()
})
</script>

<style scoped lang="scss">
.contract-action-btn {
  margin-left: 15px;
}
.card {
  margin-bottom: 16px;
}
.process-table {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 0;
  table-layout: fixed;

  th {
    background-color: #f8f9fa;
    font-weight: 500;
    padding: 10px 8px;
    border-bottom: 1px solid #e9ecef;
    color: #495057;
    font-size: 14px;
    white-space: nowrap;
  }

  td {
    padding: 12px 8px;
    border-top: none;
    border-bottom: 1px solid #e9ecef;
    vertical-align: middle;
    font-size: 13px;
    word-wrap: break-word;
  }

  // 设置各列宽度
  .col-type {
    width: 10%;
  }

  .col-handler {
    width: 8%;
  }

  .col-remark {
    width: 16%;
  }

  .col-status {
    width: 15%;
  }

  .col-date {
    width: 11%;
  }

  .col-abroad {
    width: 8%;
  }

  .col-contract {
    width: 11%;
  }

  .col-attachment {
    width: 11%;
  }

  .col-operation {
    width: 10%;
  }
}

.view-detail-btn {
  color: #556ee6;
  cursor: pointer;
  font-size: 13px;

  &:hover {
    text-decoration: underline;
  }
}
</style>
