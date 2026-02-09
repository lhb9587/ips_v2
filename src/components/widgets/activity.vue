<script>
import Loader from "./loader";
import { SimpleBar } from "simplebar-vue3";

export default {
  components: {
    Loader,
    SimpleBar,
  },
  data() {
    return {
      tabList: [
        { value: "todo", label: "进行中" },
        { value: "finish", label: "已结束" },
      ],
      selectedTab: "todo",
    };
  },
  props: {
    updating: {
      type: Boolean,
    },
  },
};
</script>
<template>
  <Loader :loading="updating">
    <div class="card">
      <div class="card-body">
        <h4 class="card-title mb-4">我的日程</h4>
        <b-tabs
          pills
          nav-class="bg-light rounded"
          content-class="mt-3"
        >
          <b-tab
            :title="item.label"
            v-model="selectedTab"
            v-for="item of tabList"
            :key="item.value"
          >
            <b-card-text>
              <SimpleBar
                data-simplebar
                style="max-height: 300px"
              >
                <ul class="verti-timeline list-unstyled">
                  <li class="event-list">
                    <div class="event-timeline-dot">
                      <i class="bx bx-right-arrow-circle font-size-18"></i>
                    </div>
                    <div class="d-flex">
                      <div class="me-3">
                        <h5 class="font-size-14">
                          07月26日
                          <i
                            class="bx bx-right-arrow-alt font-size-16 text-primary align-middle ms-2"
                          ></i>
                        </h5>
                      </div>
                      <div class="flex-grow-1">
                        <div>律所改革专题会议</div>
                      </div>
                    </div>
                  </li>
                  <li class="event-list">
                    <div class="event-timeline-dot">
                      <i class="bx bx-right-arrow-circle font-size-18"></i>
                    </div>
                    <div class="d-flex">
                      <div class="me-3">
                        <h5 class="font-size-14">
                          07月27日
                          <i
                            class="bx bx-right-arrow-alt font-size-16 text-primary align-middle ms-2"
                          ></i>
                        </h5>
                      </div>
                      <div class="flex-grow-1">
                        <div>
                          业务部门汇报 - 国内专利、国际专利、日本部、
                          调查保护部...
                          <a href="javascript: void(0);">阅读全部</a>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li class="event-list active">
                    <div class="event-timeline-dot">
                      <i
                        class="bx bxs-right-arrow-circle font-size-18 bx-fade-right"
                      ></i>
                    </div>
                    <div class="d-flex">
                      <div class="me-3">
                        <h5 class="font-size-14">
                          07月17日
                          <i
                            class="bx bx-right-arrow-alt font-size-16 text-primary align-middle ms-2"
                          ></i>
                        </h5>
                      </div>
                      <div class="flex-grow-1">
                        <div>技术融合专题会议</div>
                      </div>
                    </div>
                  </li>
                  <li class="event-list">
                    <div class="event-timeline-dot">
                      <i class="bx bx-right-arrow-circle font-size-18"></i>
                    </div>
                    <div class="d-flex">
                      <div class="me-3">
                        <h5 class="font-size-14">
                          07月27日
                          <i
                            class="bx bx-right-arrow-alt font-size-16 text-primary align-middle ms-2"
                          ></i>
                        </h5>
                      </div>
                      <div class="flex-grow-1">
                        <div>
                          业务部门汇报 - 国内专利、国际专利、日本部、
                          调查保护部...
                          <a href="javascript: void(0);">阅读全部</a>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li class="event-list">
                    <div class="event-timeline-dot">
                      <i class="bx bx-right-arrow-circle font-size-18"></i>
                    </div>
                    <div class="d-flex">
                      <div class="me-3">
                        <h5 class="font-size-14">
                          07月27日
                          <i
                            class="bx bx-right-arrow-alt font-size-16 text-primary align-middle ms-2"
                          ></i>
                        </h5>
                      </div>
                      <div class="flex-grow-1">
                        <div>
                          业务部门汇报 - 国内专利、国际专利、日本部、
                          调查保护部...
                          <a href="javascript: void(0);">阅读全部</a>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li class="event-list">
                    <div class="event-timeline-dot">
                      <i class="bx bx-right-arrow-circle font-size-18"></i>
                    </div>
                    <div class="d-flex">
                      <div class="me-3">
                        <h5 class="font-size-14">
                          07月27日
                          <i
                            class="bx bx-right-arrow-alt font-size-16 text-primary align-middle ms-2"
                          ></i>
                        </h5>
                      </div>
                      <div class="flex-grow-1">
                        <div>
                          业务部门汇报 - 国内专利、国际专利、日本部、
                          调查保护部...
                          <a href="javascript: void(0);">阅读全部</a>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </SimpleBar>
            </b-card-text>
          </b-tab>
        </b-tabs>
        <div class="card-footer bg-transparent border-top">
          <div class="text-center">
            <a
              href="javascript: void(0);"
              class="btn btn-primary"
            >
              添加新任务
            </a>
          </div>
        </div>
      </div>
    </div>
  </Loader>
</template>
<style scoped>
.event-list {
  padding: 0px 0px 38px 30px;
}
</style>
