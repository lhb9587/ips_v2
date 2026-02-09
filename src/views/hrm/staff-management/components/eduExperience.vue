<template>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-2">教育经历</h4>
      <ul class="verti-timeline list-unstyled mt-4">
        <li
          v-for="(edu, index) of eduExperiences"
          :key="index"
          class="event-list"
        >
          <div class="event-timeline-dot">
            <i
              class="bx font-size-18 bx-right-arrow-circle"
            ></i>
          </div>
          <div class="d-flex">
            <div class="me-3">
              <h5 class="font-size-14">
                {{ edu.major }} - {{ edu.eduExperience }}
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
            <span class="taskRecord_span">{{ edu.collegeName }}</span>
            <span class="taskRecord_span">{{
              `(${edu.entryDate}-${edu.graduateDate})`
            }}</span>
          </p>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    detailInfo: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    eduExperiences() {
      return this.detailInfo.eduExperiences || [];
    },
  },
};
</script>
<style scoped lang="scss">
.taskRecord_span {
  margin-right: 16px;
}
</style>
