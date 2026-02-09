<script>
import TalentSidebar from "@/views/hrm/staff-management/detail-sidebar";
import businessTripDetail from "@/views/hrm/businesstrip-management/viewDetail";
import { getBtById } from "@/api/businessTrip";
export default {
  components: {
    TalentSidebar,
    businessTripDetail,
  },
  props: {
    tableCol: {
      type: Array,
      default: () => [],
    },
    chartData: {
      type: Array,
      default: () => [],
    },
    panelId: {
      type: Number,
    },
  },
  data() {
    return {
      isShowDetail: false,
      talentCode: undefined,
      btDrawerStatus: false,
      btAppData: {},
    };
  },
  computed: {
    dataList() {
      return this.chartData;
    },
  },
  methods: {
    handleRowClick(params) {
      if ([4043, 4047, 4055, 4060, 4058, 4048, 4061].includes(this.panelId)) {
        this.toggleSidebar(params);
      } else if (this.panelId === 4089) {
        this.fetchEventDetail(params);
        this.btDrawerStatus = true;
      } else {
        this.$emit("drillHandle", params);
      }
    },
    handleSidebarUpdate(value) {
      this.isShowDetail = value;
    },
    toggleSidebar(params) {
      const id = params.talentCode;
      if (id) {
        this.talentCode = id;
        this.isShowDetail = true;
      }
    },
    fetchEventDetail(info) {
      getBtById({ btId: info.btId }).then((res) => {
        this.btAppData = res.data;
      });
    },
  },
};
</script>
<template>
  <el-table
    :data="dataList"
    :fit="true"
    :scrollbar-always-on="true"
    @row-click="handleRowClick"
    :show-overflow-tooltip="true"
    style="height: 100%; padding-top: 40px"
    :row-style="{ cursor: 'pointer' }"
    header-row-class-name="table-header-custom"
  >
    <el-table-column
      :prop="col.field"
      :label="col.name"
      v-for="col of tableCol"
      :key="col.field"
      :width="col.width ? col.width : 'auto'"
      :min-width="col.minWidth ? col.minWidth : ''"
      sortable
    >
    </el-table-column>
  </el-table>
  <TalentSidebar
    v-if="isShowDetail"
    :showSidebar="isShowDetail"
    @update:showSidebar="handleSidebarUpdate"
    :talentCode="talentCode"
  />
  <el-drawer
    v-model="btDrawerStatus"
    :modal="false"
    size="50%"
    @close="btDrawerStatus = false"
    append-to-body
  >
    <template #header>
      <div style="display: flex; align-items: center">
        <span
          v-if="btAppData.btId"
          style="font-size: 16px"
          >出差申请
          <span v-if="btAppData.wfStatus">
            <el-tag
              type="primary"
              v-if="btAppData.wfStatus == '待提交'"
              >{{ btAppData.wfStatus }}</el-tag
            >
            <el-tag
              type="warning"
              v-if="btAppData.wfStatus == '待审核'"
              >{{ btAppData.wfStatus }}</el-tag
            >
            <el-tag
              type="danger"
              v-if="btAppData.wfStatus == '审核退回'"
              >{{ btAppData.wfStatus }}</el-tag
            >
            <el-tag
              type="success"
              v-if="btAppData.wfStatus == '已完成'"
              >{{ btAppData.wfStatus }}</el-tag
            >
          </span>
        </span>
      </div>
    </template>
    <businessTripDetail :appData="btAppData" />
  </el-drawer>
</template>
<style scoped lang="scss">
:deep(.table-header-custom th .cell) {
  display: flex;
  align-items: center;
}
</style>
