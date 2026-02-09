<script>
import { required, email, helpers } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";

import { updateUserPassWordByUsername } from "@/api/systemList";

/**
 * Recoverpwd-2 component
 */
export default {
  setup() {
    return { v$: useVuelidate() };
  },
  data() {
    return {
      email: this.$route.query.userName,
      submitted: false,
      messageInfo: "",
      carouselHeight: "100vh",
    };
  },
  methods: {
    tryToReset() {
      this.submitted = true;
      this.v$.$touch();
      if (this.v$.$invalid) {
        return;
      } else {
        updateUserPassWordByUsername({ userName: this.email })
          .then((res) => {
            if (res.success) {
              this.messageInfo = res.message;
            }
          })
          .catch((error) => {
            console.log(error);
          });
      }
    },
    handleResize() {
      this.carouselHeight = window.innerWidth < 1200 ? "40vh" : "100vh";
    },
  },
  validations: {
    email: {
      required: helpers.withMessage("邮箱是必填项", required),
      email: helpers.withMessage("请输入有效的邮箱", email),
    },
  },
  mounted() {
    // 初始化时设置高度
    this.handleResize();
    // 监听窗口大小变化
    window.addEventListener("resize", this.handleResize);
  },
  beforeUnmount() {
    // 移除监听器
    window.removeEventListener("resize", this.handleResize);
  },
};
</script>

<template>
  <div>
    <b-container
      fluid
      class="p-0"
    >
      <div class="row g-0">
        <div class="col-xl-9">
          <el-carousel
            :height="carouselHeight"
            trigger="click"
            :interval="5000"
            class="custom-carousel"
          >
            <el-carousel-item>
              <img
                src="@/assets/images/cover2.jpg"
                alt=""
                style="height: 100%; width: 100%"
              />
            </el-carousel-item>
            <el-carousel-item>
              <img
                src="@/assets/images/cover1.jpg"
                alt=""
                style="height: 100%; width: 100%"
              />
            </el-carousel-item>
          </el-carousel>
        </div>
        <!-- end col -->

        <div class="col-xl-3">
          <div class="auth-full-page-content p-md-5 p-4">
            <div class="w-100">
              <div class="d-flex flex-column h-100">
                <div class="mb-4 mb-md-5">
                  <img
                      src="@/assets/images/login/logo.png"
                      alt=""
                      style="width: 170px;"
                    />
                </div>
                <div class="my-auto">
                  <div>
                    <h5 class="text-primary">重置密码</h5>
                    <p class="text-muted">重置IPSERVICE的登录密码</p>
                  </div>

                  <div class="mt-4">
                    <div
                      class="alert alert-success text-center mb-4"
                      role="alert"
                      v-if="messageInfo"
                    >
                      {{ messageInfo }}
                    </div>
                    <form @submit.prevent="tryToReset">
                      <div class="mb-3">
                        <label for="useremail">邮箱</label>
                        <input
                          type="email"
                          v-model="email"
                          class="form-control"
                          id="useremail"
                          placeholder="请输入邮箱"
                          :class="{
                            'is-invalid': submitted && v$.email.$error,
                          }"
                        />
                        <div
                          v-for="(item, index) in v$.email.$errors"
                          :key="index"
                          class="invalid-feedback"
                        >
                          <span v-if="item.$message">{{ item.$message }}</span>
                        </div>
                      </div>

                      <div class="row mb-0">
                        <div class="col-12 text-end">
                          <button
                            class="btn btn-primary w-md waves-effect waves-light"
                            type="submit"
                          >
                            重置
                          </button>
                        </div>
                      </div>
                    </form>
                    <div class="mt-5 text-center">
                      <p>
                        <router-link
                          to="/login"
                          class="fw-medium text-primary"
                        >
                          在此登录</router-link
                        >
                      </p>
                    </div>
                  </div>
                </div>

                <div class="mt-4 mt-md-5 text-center">
                  <p class="mb-0">
                    ©
                    {{ new Date().getFullYear() }} IPSERVICE
                    <i class="mdi mdi-heart text-danger"></i> 曜斗科技服务支持
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- end col -->
      </div>
      <!-- end row -->
    </b-container>
    <!-- end container-fluid -->
  </div>
</template>

<style lang="scss" scoped>
.custom-carousel{
  :deep(.is-active){
    background-color: initial;
  }
}
</style>
