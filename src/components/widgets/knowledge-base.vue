<script>
import { SimpleBar } from "simplebar-vue3";
import { required, helpers } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import { salesAnalyticsDonutChart, ChatData } from "./data";

export default {
  components: {
    SimpleBar
  },
  data() {
    return {
      salesAnalyticsDonutChart: salesAnalyticsDonutChart,
      ChatData: ChatData,
      submitted: false,
      chat: {
        message: "",
      },
    }
  },
  setup() {
    return { v$: useVuelidate() };
  },
  validations: {
    chat: {
      message: {
        required: helpers.withMessage("Message is required", required),
      },
    },
  },
  methods: {
    /**
     * Char form Submit
     */
    // eslint-disable-next-line no-unused-vars
    formSubmit(e) {
      this.submitted = true;

      // stop here if form is invalid
      this.v$.$touch();

      if (this.v$.$invalid) {
        return;
      } else {
        const id = this.ChatData.length;
        const message = this.chat.message;
        const currentDate = new Date();
        this.ChatData.push({
          id: id + 1,
          align: "right",
          name: "Henry Wells",
          message,
          time: currentDate.getHours() + ":" + currentDate.getMinutes(),
        });
        this.handleScroll();
      }
      this.submitted = false;
      this.chat = {};
    },
    handleScroll() {
      if (this.$refs.current.$el) {
        // setTimeout(() => {
          // this.$refs.current.SimpleBar.value.getScrollElement().scrollTop =
          //   this.$refs.current.SimpleBar.value.getScrollElement().scrollHeight + 1500;
        // }, 500);
      }
    },
  },
  mounted() {
    var container2 = document.querySelector(
      "#containerElement .simplebar-content-wrapper"
    );
    container2.scrollTo({ top: 500, behavior: "smooth" });
  },
};
</script>

<template>
  <div class="card">
    <div class="card-body border-bottom" style="padding-bottom: 5px;">
      <div class="row">
        <div class="col-md-4 col-9">
          <h4 class="card-title">AI知识库</h4>
          <!-- <h4 class="font-size-15 mb-1">AI知识库</h4> -->
        </div>
        <div class="col-md-8 col-3" style="margin-top: -10px;">
          <ul class="list-inline user-chat-nav text-end mb-sm-n5">
            <li class="list-inline-item d-none d-sm-inline-block">
              <b-dropdown
                right
                menu-class="dropdown-menu-end py-0 dropdown-menu-md"
                variant="white"
                toggle-class="p-0 nav-btn"
              >
                <template v-slot:button-content>
                  <i class="bx bx-search-alt-2"></i>
                </template>
                <form class="p-3">
                  <div class="form-group m-0">
                    <div class="input-group">
                      <input
                        type="text"
                        class="form-control"
                        placeholder="Search ..."
                        aria-label="Recipient's username"
                      />
                      <div class="input-group-append">
                        <button class="btn btn-primary" type="submit">
                          <i class="mdi mdi-magnify"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </b-dropdown>
            </li>
            <li class="list-inline-item d-none d-sm-inline-block">
              <b-dropdown
                toggle-class="nav-btn"
                menu-class="dropdown-menu-end"
                right
                variant="white"
              >
                <template v-slot:button-content>
                  <i class="bx bx-cog"></i>
                </template>
                <b-dropdown-item>清空聊天内容</b-dropdown-item>
                <b-dropdown-item>内容语音播放</b-dropdown-item>
              </b-dropdown>
            </li>

            <li class="list-inline-item">
              <b-dropdown
                toggle-class="nav-btn"
                menu-class="dropdown-menu-end"
                right
                variant="white"
              >
                <template v-slot:button-content>
                  <i class="bx bx-dots-horizontal-rounded"></i>
                </template>
                <b-dropdown-item>IPRDaily</b-dropdown-item>
                <b-dropdown-item>ali邮箱</b-dropdown-item>
                <b-dropdown-item>中华商标杂志</b-dropdown-item>
              </b-dropdown>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="card-body pb-0" style="padding-top: 15px;">
      <div>
        <div class="chat-conversation">
          <ul class="list-unstyled">
            <SimpleBar
              style="max-height: 260px"
              ref="current"
              id="containerElement"
            >
              <li>
                <div class="chat-day-title">
                  <span class="title">今日</span>
                </div>
              </li>
              <li
                v-for="data of ChatData"
                :key="data.id"
                :class="{ right: `${data.align}` === 'right' }"
              >
                <div class="conversation-list">
                  <div class="dropdown">
                    <button class="btn dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                      <i class="bx bx-dots-vertical-rounded"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton">
                      <b-dropdown-item>复制</b-dropdown-item>
                      <b-dropdown-item>删除</b-dropdown-item>
                      <b-dropdown-item>重新生成</b-dropdown-item>
                    </ul>
                  </div>


                  <div class="ctext-wrap">
                    <!-- <div class="conversation-name">{{ data.name }}</div> -->
                    <p class="mb-sm-0" v-html="data.message"></p>
                    <p v-if="data.time" class="chat-time mb-0">
                      <i class="bx bx-time-five align-middle me-1"></i>
                      {{ data.time }}
                    </p>
                  </div>
                </div>
              </li>
            </SimpleBar>
          </ul>
        </div>
      </div>
    </div>
    <div class="p-3 chat-input-section">
      <form @submit.prevent="formSubmit" class="row">
        <div class="col">
          <div class="position-relative">
            <input
              type="text"
              v-model="chat.message"
              class="form-control chat-input"
              placeholder="请输入问题"
              :class="{
                'is-invalid': submitted && v$.chat.message.$error,
              }"
            />
            <div
            v-if="submitted && v$.chat.message.$error"
            class="invalid-feedback"
          >
            <span v-if="v$.chat.message.required.$message">{{
              v$.chat.message.required.$message
            }}</span>
          </div>
            <div class="chat-input-links">
              <ul class="list-inline mb-0">
                <li class="list-inline-item">
                  <a
                    href="javascript: void(0);"
                    placement="top"
                    v-b-tooltip.hover
                    title="Images"
                  >
                    <i class="mdi mdi-file-image-outline"></i>
                  </a>
                </li>
                <li class="list-inline-item">
                  <a
                    href="javascript: void(0);"
                    placement="top"
                    v-b-tooltip.hover
                    title="Add Files"
                  >
                    <i class="mdi mdi-file-document-outline"></i>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="col-auto">
          <button type="submit" class="btn btn-primary chat-send w-md">
            <span class="d-none d-sm-inline-block me-2">发送</span>
            <i class="mdi mdi-send"></i>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>

</style>