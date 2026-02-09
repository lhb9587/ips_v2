<template>
  <div v-if="type === 'navtop'">
    <el-popover
      placement="bottom"
      :width="300"
      trigger="click"
    >
      <template #reference>
        <div
          style="display: flex; align-items: center; gap: 6px; cursor: pointer"
        >
          <i
            class="mdi mdi-timer-outline"
            style="font-size: 22px"
          ></i>
          <div style="font-size: 16px; font-weight: 500">
            {{ str }}
          </div>
        </div>
      </template>
      <div>
        <div
          @click="editWorkTime"
          :title="workTypeName || agentNum"
          style="margin-bottom: 10px;"
        >
          <span style="font-size: 16px;cursor: pointer;">{{ workTypeName || agentNum }}</span>
        </div>
        <div style="gap: 10px;display: flex;">
          <b-button variant="outline-info" style="padding: 2px 6px 0;width: 220px;">
            <i class="bx bx-pause" style="font-size: 28px;"></i>
          </b-button>
          <b-button variant="outline-secondary" style="padding:6px 12px">
            <i class="mdi mdi-solid"></i>
          </b-button>
        </div>
      </div>
    </el-popover>
  </div>
  <div
    class="work-btn"
    v-else
  >
    <div style="gap: 10px; display: flex; align-items: center">
      <img
        class="clock fix-btn"
        src="@/assets/images/timing/time.png"
        alt=""
      />
      <div style="display: inline-block; color: #52a0f5">
        {{ str }}
      </div>
      <img
        v-if="!status"
        class="fix-btn"
        src="@/assets/images/timing/start.png"
        @click="startTaskHours(1)"
        style="cursor: pointer"
      />
      <img
        v-else
        src="@/assets/images/timing/play.png"
        style="cursor: pointer"
        @click="pauseTaskHours"
      />
      <img
        class="fix-btn stop"
        src="@/assets/images/timing/stop.png"
        style="cursor: pointer"
        @click="stopTime"
      />
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      workTypeName: "",
      agentNum: "",
      str: "00:00:00",
      status: "",
      type: "navtop",
    };
  },
};
</script>
<style scoped lang="scss">
.fix-btn {
  width: 20px;
}
.work-btn {
  z-index: 99999;
}

.start-btn,
.long-stop-btn {
  img {
    height: 20px;
    margin-left: 3%;
    transform: translateX(-50%);
    margin-top: 15%;
  }

  .clock {
    display: inline-block;
    height: 20px;
    margin-left: 15%;
  }
}

.start-btn,
.stop-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  /*background-color: #fff;*/
}
.work-hour-title {
  font-size: 14px;
  cursor: pointer;
  position: absolute;
  left: 20px;
  max-width: 150px;
  overflow: hidden;
  display: inline-block;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-break: break-all;
  color: #52a0f5;
}
</style>
