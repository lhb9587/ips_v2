<template>
  <div
    class="carousel-wrap"
    @click="handleClick"
    v-if="custNoticeList.length > 0"
  >
    <div class="carousel-alert">
      <div class="carousel-content">
        <i class="mdi mdi-bell-ring-outline carousel-icon"></i>
        <span class="carousel-customer">{{ currentMessage.custName }}：</span>
        <span class="carousel-text">{{ currentMessage.mainText }}</span>
      </div>
      <el-button
        class="carousel-count"
        size="small"
        round
        plain
        type="warning"
      >
        {{ noticeTotal }}条消息
      </el-button>
    </div>
  </div>
  <el-dialog
    v-model="dialogVisible"
    title="客户重大事件"
    width="800px"
    :close-on-click-modal="false"
    append-to-body
  >
    <el-table
      :data="allCustNoticeList"
      v-loading="loading"
      element-loading-text="请等待"
      style="width: 100%; margin-bottom: 16px"
      :row-class-name="tableRowClassName"
      max-height="400"
      :show-overflow-tooltip="true"
      @row-click="handleRowClick"
      :row-style="{ cursor: 'pointer' }"
      :scrollbar-always-on="true"
      v-el-table-infinite-scroll="loadMoreData"
      :infinite-scroll-disabled="busy"
      infinite-scroll-distance="2"
      :infinite-scroll-immediate="false"
      ref="custEventTable"
    >
      <el-table-column
        prop="custName"
        label="客户"
        min-width="150"
      />
      <el-table-column
        prop="mainText"
        label="事件标题"
        min-width="150"
      />
      <el-table-column
        prop="createTime"
        label="时间"
        min-width="100"
      />
      <el-table-column
        label="状态"
        min-width="80"
      >
        <template #default="scope">
          <el-tag
            v-if="!scope.row.read"
            round
            type="warning"
            effect="plain"
            >未读</el-tag
          >
          <el-tag
            v-else
            type="info"
            effect="plain"
            round
            >已读</el-tag
          >
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <div style="display: flex; justify-content: flex-end; gap: 12px">
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button
          type="primary"
          @click="markAllRead"
          >全部标记为已读</el-button
        >
      </div>
    </template>
  </el-dialog>
  <MajorEventInfo
    v-model="detailModalStatus"
    :eventDetail="eventDetail"
    @closeModal="closeModal"
  />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { queryCustNotice, settingsNoticeRead } from "@/api/dashboard";
import MajorEventInfo from "@/components/sidebar/components/customer/majorEvent-info/index.vue";
import { queryCustEventDetail } from "@/api/customerList";

const currentIndex = ref(0);
const currentMessage = computed(() => custNoticeList.value[currentIndex.value]);
let timer = null;
const custNoticeList = ref([]);
const noticeTotal = ref(0);
const dialogVisible = ref(false);
const allCustNoticeList = ref([]);
const loading = ref(false);
const detailModalStatus = ref(false);
const eventDetail = ref({});
const custEventTable = ref();

const getCustEventDetail = (item) => {
  queryCustEventDetail({
    eventId: item.eventId,
  }).then((res) => {
    eventDetail.value = res.data || {};
    dialogVisible.value = false;
    detailModalStatus.value = true;
  });
};

const startCarousel = () => {
  timer = setInterval(() => {
    if (custNoticeList.value.length > 0) {
      currentIndex.value =
        (currentIndex.value + 1) % custNoticeList.value.length;
    }
  }, 3000);
};

const closeModal = () => {
  //重新打开列表弹窗
  dialogVisible.value = true
}

const handleRowClick = (row) => {
  getCustEventDetail(row);
  if (!row.read) {
    settingsNoticeRead({ noticeIdList: [row.noticeId] }).then((res) => {
      if (res.success) {
        //找到当前item，并设置read为1
        const index = allCustNoticeList.value.findIndex(
          (i) => i.noticeId === row.noticeId
        );
        if (index !== -1) {
          allCustNoticeList.value[index].read = 1;
        }
      }
    });
  }
};

const handleClick = () => {
  dialogVisible.value = true;
  fetchAllCustNoticeList();
};

//查询未读滚动内容客户重大事件
const fetchCustNoticeList = () => {
  queryCustNotice().then((res) => {
    custNoticeList.value = res.data || [];
    noticeTotal.value = res.total;
  });
};

//查询客户所有重大事件
const fetchAllCustNoticeList = () => {
  busy.value = false;
  pageNo.value = 1
  loading.value = true;
  const params = {
    pageNo:pageNo.value,
    pageSize:10,
    belongToTab: "全部",
  }
  queryCustNotice(params).then((res) => {
    allCustNoticeList.value = res.data || [];
    loading.value = false;
    if (custEventTable.value) {
      const tableBodyWrapper = custEventTable.value.$el.querySelector('.el-scrollbar__wrap') ||
        custEventTable.value.$el.querySelector('.el-table__body-wrapper');
      if (tableBodyWrapper) {
        tableBodyWrapper.scrollTop = 0;
      }
    }
  });
};

function tableRowClassName({ row }) {
  return !row.read ? "" : "unread-row";
}

function markAllRead() {
  const unreadIds = allCustNoticeList.value
    .filter((i) => !i.read)
    .map((i) => i.noticeId);
  if (unreadIds.length === 0) return;
  settingsNoticeRead({ noticeIdList: unreadIds }).then((res) => {
    if (res.success) {
      fetchCustNoticeList();
      fetchAllCustNoticeList();
    }
  });
}
const busy = ref(false);
const pageNo = ref(1);
const loadMoreData = () => {
  if (busy.value) return;
  busy.value = true;
  pageNo.value++;
  const params = {
    belongToTab: "全部",
    pageNo: pageNo.value,
    pageSize: 10,
  };
  loading.value = true;
  queryCustNotice(params).then((res) => {
    allCustNoticeList.value = allCustNoticeList.value.concat(res.data || []);
    loading.value = false;
    if (res.total == allCustNoticeList.value.length) {
      busy.value = true;
    } else {
      busy.value = false;
    }
  });
};

onMounted(() => {
  startCarousel();
  fetchCustNoticeList();
});
onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});
</script>

<style scoped>
.carousel-wrap {
  width: 100%;
}
.carousel-alert {
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 8px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  min-height: 36px;
  width: 550px;
  height: 36px;
  box-sizing: border-box;
  justify-content: space-between;
  cursor: pointer;
}
.carousel-content {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #222;
  font-weight: 400;
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.carousel-icon {
  color: #e6a23c;
  font-size: 18px;
  margin-right: 6px;
  flex-shrink: 0;
}
.carousel-customer {
  font-weight: 700;
  color: #222;
  margin-right: 2px;
}
.carousel-text {
  color: #222;
  flex-shrink: 0;
}
.carousel-count {
  background: #fffbe6;
  border: 1px solid #ffe58f;
  color: #ad6800;
  font-weight: 600;
  font-size: 12px;
  min-width: 80px;
  margin-left: 16px;
  box-shadow: none;
}
.unread-row {
  background: #fffdf6 !important;
}
</style>
