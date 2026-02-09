<template>
    <div class="card">
      <div class="card-body">
        <h4 class="card-title mb-2">工作经历</h4>
        <ul class="verti-timeline list-unstyled mt-4">
          <li
            v-for="(item, index) of workExperiences"
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
                  {{ item.department }} - {{ item.position }}
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
              <span class="taskRecord_span">{{ item.workCompany }}</span>
              <span class="taskRecord_span" v-if="item.startDate && item.endDate">{{
                `(${item.startDate}-${item.endDate})`
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
      workExperiences() {
        return this.detailInfo.workExperiences || [];
      },
    },
  };
  </script>
  <style scoped lang="scss">
  .taskRecord_span {
    margin-right: 16px;
  }
  </style>
  