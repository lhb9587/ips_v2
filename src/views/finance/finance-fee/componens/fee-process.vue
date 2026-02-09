<template>
  <div class="card" style="margin-bottom: 0;">
    <div class="card-body">
      <h4 class="card-title mb-4">任务流程</h4>
      <ul class="verti-timeline list-unstyled">
        <li
          v-for="(evolve, index) of progressData"
          :key="index"
          class="event-list active"
        >
          <div class="event-timeline-dot">
            <i
              class="bx font-size-18 bx-right-arrow-circle bxs-right-arrow-circle"
              :class="{'bx-fade-right': evolve.status=='待完成'}"
            ></i>
          </div>
          <div class="d-flex">
            <div class="me-3">
              <h5 class="font-size-14">
                {{ evolve.progressName }}
              </h5>
            </div>
          </div>
          <p
            style="
              margin: 5px 0;
              color: #909399;
              line-height: 1;
              font-size: 12px;
            "
          >
            <span class="taskRecord_span">{{ evolve.createTime }}</span>
            <span class="taskRecord_span">{{ evolve.tasker }}</span>
            <span class="taskRecord_span">{{ evolve.status }}</span>
          </p>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    progressData: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {};
  },
  methods: {},
};
</script>
<style scoped lang="scss">
.taskRecord_span {
  margin-right: 16px;
}
</style>
