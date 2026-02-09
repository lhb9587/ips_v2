<script>
export default {
  data() {
    return {
      postData: [
        {
          image: require("@/assets/images/small/img-2.jpg"),
          title: "对商标使用证据的审查要求趋严",
          date: "2024-07-12",
        },
        {
          image: require("@/assets/images/small/img-6.jpg"),
          title: "万慧达知识产权深度参加“2024 AIPPI 中国青年知识产权研讨会",
          date: "2024-07-11",
        },
        {
          image: require("@/assets/images/small/img-2.jpg"),
          title: "恶意抢注商标的反不正当竞争规制及破解路径",
          date: "2024-06-12",
        },
        {
          image: require("@/assets/images/small/img-1.jpg"),
          title: "最高法院认定“这！就是街舞”商标不缺乏显著性",
          date: "2024-06-08",
        },
      ],
    };
  },
};
</script>

<template>
  <div
    class="card"
    style="height: 412px"
  >
    <div class="card-body">
      <span class="card-title mt-4">推荐文章</span>
      <b-tabs
        nav-class="nav-tabs-custom card-header-tabs ms-auto"
        nav-wrapper-class="nav-item"
        align="right"
      >
        <b-tab
          title="最近的"
          active
        >
          <div style="padding-top: 20px">
            <div
              data-simplebar
              style="max-height: 305px"
            >
              <ul class="list-group list-group-flush">
                <li
                  class="list-group-item"
                  v-for="data of postData"
                  :key="data.title"
                >
                  <div class="d-flex">
                    <div class="me-3">
                      <img
                        :src="data.image"
                        alt=""
                        class="avatar-md h-auto d-block rounded"
                      />
                    </div>

                    <div class="align-self-center overflow-hidden me-auto">
                      <div>
                        <h5 class="font-size-14 text-truncate">
                          <a
                            href="#"
                            class="text-dark"
                            >{{ data.title }}</a
                          >
                        </h5>
                        <p class="text-muted mb-0">{{ data.date }}</p>
                      </div>
                    </div>

                    <b-dropdown
                      class="ms-2"
                      toggle-class="text-muted font-size-16 p-0"
                      toggle-tag="a"
                      variant="white"
                      menu-class="dropdown-menu-end"
                      right
                    >
                      <template #button-content>
                        <i class="mdi mdi-dots-horizontal"></i>
                      </template>
                      <b-dropdown-item>推荐</b-dropdown-item>
                      <b-dropdown-item>收藏</b-dropdown-item>
                    </b-dropdown>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </b-tab>
        <b-tab title="受欢迎的">
          <div style="padding-top: 20px">
            <div
              data-simplebar
              style="max-height: 305px"
            >
              <ul class="list-group list-group-flush">
                <li
                  class="list-group-item"
                  v-for="data of postData"
                  :key="data.title"
                >
                  <div class="d-flex">
                    <div class="me-3">
                      <img
                        :src="data.image"
                        alt=""
                        class="avatar-md h-auto d-block rounded"
                      />
                    </div>

                    <div class="align-self-center overflow-hidden me-auto">
                      <div>
                        <h5 class="font-size-14 text-truncate">
                          <a
                            href="#"
                            class="text-dark"
                            >{{ data.title }}</a
                          >
                        </h5>
                        <p class="text-muted mb-0">{{ data.date }}</p>
                      </div>
                    </div>

                    <b-dropdown
                      class="ms-2"
                      toggle-class="text-muted font-size-14 p-0"
                      variant="white"
                      menu-class="dropdown-menu-end"
                      right
                    >
                      <template #button-content>
                        <i class="mdi mdi-dots-horizontal"></i>
                      </template>
                      <b-dropdown-item>推荐</b-dropdown-item>
                      <b-dropdown-item>收藏</b-dropdown-item>
                    </b-dropdown>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </b-tab>
        <b-tab title="我的收藏">
          <div style="padding-top: 20px">
            <div
              data-simplebar
              style="max-height: 305px"
            >
              <ul class="list-group list-group-flush">
                <li
                  class="list-group-item"
                  v-for="data of postData"
                  :key="data.title"
                >
                  <div class="d-flex">
                    <div class="me-3">
                      <img
                        :src="data.image"
                        alt=""
                        class="avatar-md h-auto d-block rounded"
                      />
                    </div>

                    <div class="align-self-center overflow-hidden me-auto">
                      <div>
                        <h5 class="font-size-14 text-truncate">
                          <a
                            href="#"
                            class="text-dark"
                            >{{ data.title }}</a
                          >
                        </h5>
                        <p class="text-muted mb-0">{{ data.date }}</p>
                      </div>
                    </div>

                    <b-dropdown
                      class="ms-2"
                      toggle-class="text-muted font-size-14 p-0"
                      variant="white"
                      menu-class="dropdown-menu-end"
                      right
                    >
                      <template #button-content>
                        <i class="mdi mdi-dots-horizontal"></i>
                      </template>
                      <b-dropdown-item>推荐</b-dropdown-item>
                      <b-dropdown-item>取消</b-dropdown-item>
                    </b-dropdown>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </b-tab>
      </b-tabs>
    </div>
  </div>
</template>
