<template>
  <div :class="wrapperClass" style="width: 100%;">
    <slot name="leading" />
    <div
      class="offcanvas-title"
      id="offcanvasRightLabel"
      style="
        width: 100%;
        height: auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
      "
    >
      <h5 style="margin-bottom: 0;display: flex;align-items: center;gap: 6px;">
        <slot name="title-prefix" />
        <span v-if="caseInfo.tmName"> {{ caseInfo.tmName }}； </span>
        <span v-if="caseInfo.agentNum"> {{ caseInfo.agentNum }}； </span>
        <span v-if="caseInfo.caseType"> {{ caseInfo.caseType }}； </span>
        <span v-if="caseInfo.appFromto"> {{ caseInfo.appFromto }}； </span>
        <span v-if="caseInfo.appCnName"> {{ caseInfo.appCnName }}； </span>
      </h5>
      <div class="right-action">
        <el-tooltip
          v-if="!subscribeStatus"
          placement="bottom-start"
          content="点击关注此案件将出现在「我的关注」中；符合条件的案件变动将显示在「重要案件」中。"
          trigger="hover"
          effect="light"
        >
          <el-button
            type="primary"
            @click="$emit('subscribe', 1)"
          >
            关注
          </el-button>
        </el-tooltip>
        <el-tooltip
          v-else
          placement="bottom-start"
          content="取消关注后，该案件将从「我的关注」中移除，且不再接收重要信息提醒。"
          trigger="hover"
          effect="light"
        >
          <el-button
            type="danger"
            @click="$emit('subscribe', 0)"
          >
            取消关注
          </el-button>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    caseInfo: {
      type: Object,
      required: true,
    },
    subscribeStatus: {
      type: Boolean,
      required: true,
    },
    wrapperClass: {
      type: String,
      default: "",
    },
  },
  emits: ["subscribe"],
};
</script>

<style scoped></style>

