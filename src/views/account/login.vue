<script>
import {
  authMethods,
  authFackMethods,
  notificationMethods,
} from "@/state/helpers";
import { mapState } from "vuex";

import { required, helpers } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";

import {
  removeUserPswd,
  getUserName,
  setUserName,
  getUserPswd,
  setUserPswd,
} from "@/utils/user";

/**
 * Login-2 component
 */
export default {
  setup() {
    return { v$: useVuelidate() };
  },
  data() {
    return {
      email: getUserName(),
      password: getUserPswd(),
      submitted: false,
      authError: null,
      tryingToLogIn: false,
      isAuthError: false,
      isRememberPswd: getUserPswd() ? true : false,
      isShowPswd: false,
      carouselHeight: '100vh'
    };
  },
  validations: {
    email: {
      required: helpers.withMessage("请输入用户名", required),
    },
    password: {
      required: helpers.withMessage("请输入密码", required),
    },
  },
  computed: {
    ...mapState("authfack", ["status"]),
  },
  methods: {
    ...authMethods,
    ...authFackMethods,
    ...notificationMethods,
    // Try to log the user in with the username
    // and password they provided.
    tryToLogIn() {
      this.submitted = true;
      // stop here if form is invalid
      this.v$.$touch();

      if (this.v$.$invalid) {
        return;
      } else {
        const { email, password } = this;
        console.log(email, password);
        setUserName(email);
        console.log(this.isRememberPswd, "sdfsdf");
        this.isRememberPswd ? setUserPswd(password) : removeUserPswd();
        this.$store
          .dispatch("user/login", { username: email, password })
          .then(async () => {
            if (email && password) {
              // this.login({
              //   email,
              //   password,
              // });
              this.$router.push({
                path: "/",
              });
              this.$message.success("登录成功");
            }
            // this.$store.dispatch('user/getInfo').then(async res=>{
            //   const { permissions,domainList } = this.$store.getters
            //   // generate accessible routes map based on roles
            //   const accessRoutes =  await this.$store.dispatch('permission/generateRoutes',{ permissions,domainList})

            //   // // dynamically add accessible routes
            //   this.$router.addRoutes(accessRoutes)
            //   this.$store.dispatch('user/getTodoTaskNotice');
            //   if(localStorage.getItem('historyPath')){
            //     this.$router.replace({ path: localStorage.getItem('historyPath') });
            //   }else{
            //     this.$router.replace({ path: this.redirect || "/" });
            //   }
            // }).catch(res=>{
            //   this.$message.error(res)
            // })
          })
          .catch(() => {});
      }
    },
    forgotPassword() {
      this.$router.push({
        path: "/forgot-password",
        query: { userName: this.email },
      });
    },
    handleResize() {
      this.carouselHeight = window.innerWidth < 1200 ? '40vh' : '100vh'
    }
  },
  mounted() {
    // 初始化时设置高度
    this.handleResize()
    
    // 监听窗口大小变化
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    // 移除监听器
    window.removeEventListener('resize', this.handleResize)
  }
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
                style="height: 100%;width: 100%"
              />
            </el-carousel-item>
            <el-carousel-item>
              <img
                src="@/assets/images/cover1.jpg"
                alt=""
                style="height: 100%;width: 100%"
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
                    <h5 class="text-primary">欢迎回来！</h5>
                    <p class="text-muted">登录以继续前往IPSERVICE。</p>
                  </div>
                  <div class="mt-4">
                    <el-form @submit.prevent="tryToLogIn">
                      <b-form-group
                        class="mb-3"
                        id="input-group-1"
                        label="用户名"
                        label-for="input-1"
                      >
                        <b-form-input
                          id="input-1"
                          v-model="email"
                          type="text"
                          placeholder="请输入用户名"
                          :class="{
                            'is-invalid': submitted && v$.email.$error,
                          }"
                        ></b-form-input>
                        <!-- <div
                          v-if="submitted && v$.email.$error"
                          class="invalid-feedback"
                        >
                          <span v-if="v$.email.required.$message">{{
                            v$.email.required.$message
                          }}</span>
                        </div> -->
                      </b-form-group>
                      <div class="float-end">
                        <span
                          class="text-muted"
                          style="cursor: pointer"
                          v-on:click="forgotPassword"
                          >忘记密码？</span
                        >
                      </div>
                      <b-form-group
                        class="mb-3"
                        id="input-group-2"
                        label="密码"
                        label-for="input-2"
                      > 
                        <template style="display: flex">
                          <b-form-input
                            id="input-2"
                            v-model="password"
                            :type="isShowPswd ? 'text' : 'password'"
                            placeholder="请输入密码"
                            :class="{
                              'is-invalid': submitted && v$.password.$error,
                              password: true,
                            }"
                          ></b-form-input>
                          <b-button
                            variant="light"
                            class="password-addon"
                            @click="isShowPswd = !isShowPswd"
                            ><i class="mdi mdi-eye-outline"> </i
                          ></b-button>
                        </template>
                        <!-- <div
                          v-if="submitted && v$.password.$error"
                          class="invalid-feedback"
                        >
                          <span v-if="v$.password.required.$message">{{
                            v$.password.required.$message
                          }}</span>
                        </div> -->
                      </b-form-group>

                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="remember-check"
                          v-model="isRememberPswd"
                        />
                        <label
                          class="form-check-label"
                          for="remember-check"
                        >
                          记住密码
                        </label>
                      </div>

                      <div class="mt-3 d-grid">
                        <b-button
                          type="submit"
                          variant="primary"
                          >登录</b-button
                        >
                      </div>
                    </el-form>
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
.carousel-caption {
  position: relative !important;
  right: 0;
  bottom: 1.25rem;
  left: 0;
  padding-top: 1.25rem;
  padding-bottom: 1.25rem;
  color: #495057;
  text-align: center;
}

.carousel-indicators li {
  background-color: rgba(85, 110, 230, 0.25);
}
.password-addon {
  border-bottom-left-radius: 0;
  border-top-left-radius: 0;
  margin-left: -1px;
}
.password {
  border-bottom-right-radius: 0;
  border-top-right-radius: 0;
}

.el-carousel {
  transition: height 0.3s ease;
}
.custom-carousel{
  :deep(.is-active){
    background-color: initial;
  }
}
</style>
