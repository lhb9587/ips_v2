<template>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-4">详情进展</h4>

      <ul class="verti-timeline list-unstyled">
        <li
          v-for="(evolve,index) of caseEvolve"
          :key="evolve.id"
          class="event-list"
          :class="{
            active: evolve.isCurrent == 1,
          }"
        >
          <div class="event-timeline-dot">
            <i
              class="bx font-size-18"
              :class="{
                'bx-fade-right': (evolve.isCurrent == 1 && index == currentIndex ) ,
                'bx-right-arrow-circle': evolve.isCurrent !== 1,
                'bxs-right-arrow-circle': evolve.isCurrent == 1,
              }"
            ></i>
          </div>
          <div class="d-flex">
            <div class="me-3">
              <h5 class="font-size-14">
                {{ evolve.stageName }}
                <!-- <i
                  class="bx bx-right-arrow-alt font-size-16 text-primary align-middle ms-2"
                ></i> -->
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
            v-for="taskRecord in evolve.taskRecordArray"
            :key="taskRecord.caseStageId"
          >
            <span class="taskRecord_span">{{ taskRecord.createTime }}</span>
            <span class="taskRecord_span">{{ taskRecord.opertorName }}</span>
            <span class="taskRecord_span">{{ taskRecord.proceeName }}</span>
            <span class="taskRecord_span">{{ taskRecord.memo }}</span>
            <span class="taskRecord_span">{{ taskRecord.ukeyName }}</span>
          </p>
        </li>
      </ul>
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
  },
  data() {
    return {
      currentIndex: -1,
    };
  },
  computed: {
    caseEvolve() {
      const list =
        this.caseInfo.caseEvolve?.filter((item) => typeof item === "object") ||
        [];
      list.reverse();
      return list;
    },
  },
  methods: {
    getCurrentIndex() {
      const currentIndex = this.caseEvolve.findIndex((item) => {
        return item.isCurrent == 1 && this.caseInfo.status !== '结案';
      });
      this.currentIndex = currentIndex;
    },
  },
  created() {
    this.getCurrentIndex();
  },
};
</script>

<style scoped lang="scss">
.taskRecord_span {
  margin-right: 16px;
}
</style>
