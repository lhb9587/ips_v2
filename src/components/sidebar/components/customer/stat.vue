<script>
/**
 * Stat component -- specify the widget icon, title and value.
 */

export default {
  props: {
    title: {
      type: String,
      default: "",
    },
    value: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
    // 新增帮助提示属性
    helpText: {
      type: String,
      default: ""
    }
  },
  data() {
    return {};
  },
  computed: {},
  components: {},
  methods: {},
};
</script>

<template>
  <div class="card mini-stats-wid">
    <div class="card-body" style="padding-left: 15px;">
      <div class="d-flex">
        <div class="flex-grow-1" style="z-index: 2;">
          <p class="text-muted fw-medium mb-2">
            {{ title }}
            <el-tooltip 
              v-if="helpText"
              effect="dark" 
              :content="helpText" 
              placement="top"
            >
              <i 
                class="bx bx-help-circle ms-1 font-size-13" 
                style="cursor: help;"
              ></i>
            </el-tooltip>
          </p>
          <h4 class="mb-0">{{ value }}</h4>
        </div>

        <div
          class="avatar-sm align-self-center mini-stat-icon rounded-circle bg-primary"
          style="position: absolute; right: 10px"
        >
          <span class="avatar-title">
            <i :class="`${icon} font-size-24`"></i>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
// 添加提示样式
.bx-help-circle {
  color: #6c757d;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.8;
  }
}
</style>
