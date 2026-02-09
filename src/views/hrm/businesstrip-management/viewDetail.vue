<script>
import dayjs from "dayjs";
export default {
  props: {
    appData: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
    };
  },
  methods: {
    dayjs,
  },
};
</script>
<template>
  <div>
    <el-form
      label-width="80px"
      style="position: relative"
    >
      <!-- <div class="result-box" v-if="appData.wfStatus == '已完成'">
        <i
          class="icon iconfont icon-tongguo"
          style="font-size: 70px;color: #5bc16d;"
        ></i>
      </div>
      <div class="result-box" v-if="appData.wfStatus == '审核退回'">
        <i
          class="icon iconfont icon-butongguo"
          style="font-size: 70px;color: #e25d57;"
        ></i>
      </div> -->
      <div class="row">
        <div class="col-md-6">
          <el-form-item label="申请人:">
            <div class="item-content">
              {{ appData.userIdStr }}
            </div>
          </el-form-item>
        </div>
        <div class="col-md-6">
          <el-form-item label="申请时间:">
            <div class="item-content">
              {{ dayjs(appData.createDate).format("YYYY-MM-DD HH:mm:ss") }}
            </div>
          </el-form-item>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6">
          <el-form-item
            label="出差类型:"
            prop="tripType"
          >
            <div class="item-content">
              {{ appData.tripTypeStr }}
            </div>
          </el-form-item>
        </div>
        <div
          class="col-md-6"
          v-if="appData.tripType == 2162"
        >
          <el-form-item
            label="会议名称:"
            prop="meetingName"
          >
            <div class="item-content">
              {{ appData.meetingName }}
            </div>
          </el-form-item>
        </div>
        <div
          class="col-md-6"
          v-if="appData.tripType == 2163"
        >
          <el-form-item
            label="客户名称:"
            prop="custId"
          >
            <div class="item-content">
              {{ appData.custIdStr }}
            </div>
          </el-form-item>
        </div>
      </div>
      <el-form-item
        label="出差事由:"
        prop="tripReason"
        v-if="appData.tripType == 2164"
      >
        <div class="item-content">
          {{ appData.tripReason }}
        </div>
      </el-form-item>
      <el-form-item label="交通工具:">
        <div class="item-content">
          {{ appData.transport }}
        </div>
      </el-form-item>
      <div class="row">
        <div class="col-md-6">
          <el-form-item label="单程往返:">
            <div class="item-content">
              {{ appData.tripWay }}
            </div>
          </el-form-item>
        </div>
        <div class="col-md-6">
          <el-form-item label="同行人:">
            <div class="item-content">
              {{ appData.companionsStr }}
            </div>
          </el-form-item>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6">
          <el-form-item label="出发城市:">
            <div class="item-content">
              {{ appData.departureCity }}
            </div>
          </el-form-item>
        </div>
        <div class="col-md-6">
          <el-form-item label="到达城市:">
            <div class="item-content">
              {{ appData.destinationCity }}
            </div>
          </el-form-item>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6">
          <el-form-item label="开始时间:">
            <div class="item-content">
              {{ dayjs(appData.startDate).format("YYYY-MM-DD HH:mm") }}
            </div>
          </el-form-item>
        </div>
        <div class="col-md-6">
          <el-form-item label="结束时间:">
            <div class="item-content">
              {{ dayjs(appData.endDate).format("YYYY-MM-DD HH:mm") }}
            </div>
          </el-form-item>
        </div>
      </div>
      <el-form-item label="出差天数:">
        <div class="item-content">
          {{ appData.tripDays }}
        </div>
      </el-form-item>
      <el-form-item label="出差备注:">
        <div class="item-content">
          {{ appData.remarks }}
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.item-content {
  background-color: #f0f2f5;
  border-radius: 4px;
  padding: 0 10px;
  width: 100%;
  min-height: 32px;
}
.result-box {
  position: absolute;
  top: 0;
  right: 10px;
  z-index: 10;
}
</style>
