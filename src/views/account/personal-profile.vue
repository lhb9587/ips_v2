<script>
import Layout from "../../layouts/main";
import { queryUserById } from "@/api/systemList";
import { ElMessage } from "element-plus";
import { upPassword, getQrCodeImage } from "@/api/user";
// import { CirclePlus } from "@element-plus/icons-vue";
import { getToken } from "@/utils/auth";
import { mapState } from "vuex";
const tokenId = getToken();
import { addUserIcon } from "@/api/serviceApi.config.js";
/**
 * Contacts-Profile component
 */
export default {
  // components: { Layout, CirclePlus },
  components: { Layout },
  data() {
    const validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入密码"));
      } else {
        if (this.pwdInfo.newPasswordAffirm !== "") {
          this.$refs.pwsFormRef.validateField("newPasswordAffirm");
        }
        callback();
      }
    };
    const validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value !== this.pwdInfo.newPassword) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    return {
      title: "Profile",
      statData: [
        {
          icon: "bx bx-check-circle",
          title: "Completed Projects",
          value: "125",
        },
        {
          icon: "bx bx-hourglass",
          title: "Pending Projects",
          value: "12",
        },
        {
          icon: "bx bx-package",
          title: "Total Revenue",
          value: "$36,524",
        },
      ],
      userInfo: {},
      pwdInfo: {
        oldPassword: "",
        newPassword: "",
        newPasswordAffirm: "",
      },
      rules: {
        oldPassword: [{ validator: validatePass, trigger: "blur" }],
        newPassword: [{ validator: validatePass, trigger: "blur" }],
        newPasswordAffirm: [{ validator: validatePass2, trigger: "blur" }],
      },
      selectedName: "info",
      qrCodeUrl: "",
      imageLoadError: false,
      isWeiXinRelation: false,
      tokenId,
      addUserIconUrl: addUserIcon,
      fileList: [],
      imageUrl: "",
    };
  },
  methods: {
    handleImageError() {
      this.imageLoadError = true;
      console.log('图片获取其失败！！');
    },
    beforeAvatarUpload(file) {
      const isJPGOrisPNG =
        file.type === "image/jpeg" || file.type === "image/png";
      const isLt200K = file.size / 1024 / 1024 / 1024 < 200;
      if (!isJPGOrisPNG) {
        this.$message.error("上传头像图片只能是 JPG 格式或者PNG");
      }
      if (!isLt200K) {
        this.$message.error("上传头像图片大小不能超过 200K!");
      }
      return isJPGOrisPNG && isLt200K;
    },
    fileChange(file) {
      this.imageLoadError = false
      this.imageUrl = URL.createObjectURL(file.raw);
    },
    handleAvatarSuccess(res){
      if(res.success){
        ElMessage.success('头像上传成功')
      }
    },
    getQrImage() {
      getQrCodeImage().then((res) => {
        this.qrCodeUrl = res.data;
      });
    },
    changeName(name) {
      this.selectedName = name;
    },
    fetchPersonalInfo() {
      queryUserById(this.userId).then((res) => {
        this.userInfo = res.data.user || {};
        this.imageUrl = '/ipdoc/' + res.data.user.userIcon;
        this.isWeiXinRelation =
          res.data?.userWeixinRelation?.isWeiXinRelation || false;
      });
    },
    saveChangePwd() {
      this.$refs.pwsFormRef.validate((valid) => {
        if (valid) {
          const data = {
            userId: this.userId,
            ...this.pwdInfo,
          };
          upPassword(data).then((res) => {
            if (res.success) {
              this.$store.dispatch("user/logout");
              ElMessage({
                message: "密码修改成功，请重新登录！",
                type: "success",
                duration: 3 * 1000,
              });
            } else {
              res.message &&
                ElMessage({
                  message: res.message,
                  type: "error",
                  duration: 3 * 1000,
                });
            }
          });
        }
      });
    },
  },
  watch:{
    userId: {
      handler: function () {
        this.fetchPersonalInfo();
      },
    },
  },
  computed: {
    ...mapState({
      userId: (state) => state.user.userId,
    }),
  },
  created() {
    if (this.userId) {
      this.fetchPersonalInfo();
    }
    this.getQrImage();
  },
};
</script>

<template>
  <Layout>
    <div class="row">
      <div class="col-xl-3">
        <div class="card overflow-hidden">
          <div class="bg-soft bg-primary">
            <div class="row">
              <div class="col-5">
                <div class="text-primary p-3">
                  <p>个人中心</p>
                </div>
              </div>
              <div class="col-7 align-self-end">
                <img
                  src="@/assets/images/profile-img.png"
                  alt
                  class="img-fluid"
                />
              </div>
            </div>
          </div>
          <div class="card-body pt-0">
            <div class="row">
              <div
                class="col-sm-12"
                style="display: flex"
              >
                <!-- <div class="avatar-md profile-user-wid"> -->
                <!-- <img
                    v-if="imageUrl && !imageLoadError"
                    :src="`/ipdoc${imageUrl}`"
                    class="img-thumbnail rounded-circle"
                    @error="handleImageError"
                  /> -->
                <!-- </div> -->
                <div class="avatar-md profile-user-wid">
                  <el-upload
                    ref="upload"
                    :action="addUserIconUrl"
                    :show-file-list="false"
                    :before-upload="beforeAvatarUpload"
                    :auto-upload="true"
                    :on-change="fileChange"
                    :data="{ userId: this.userId, tokenID: tokenId }"
                    :on-success="handleAvatarSuccess"
                  >
                    <img
                      v-if="imageUrl&&!imageLoadError"
                      :src="imageUrl"
                      class="img-thumbnail rounded-circle"
                      @error="handleImageError"
                    />
                    <img
                      v-else
                      class="img-thumbnail rounded-circle"
                      src="@/assets/images/users/defaultavatar.png"
                    />
                  </el-upload>
                </div>
                <div
                  class="mt-2"
                  style="margin-left: 10px"
                >
                  <h5 class="font-size-16 text-truncate">
                    {{ userInfo.fullname }}
                  </h5>
                  <p class="text-muted mb-0 text-truncate">
                    {{ userInfo.positionStr }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- end card -->

        <div class="card">
          <button
            class="btn"
            :class="{
              'btn-primary': selectedName == 'info',
              'btn-outline-primary': selectedName != 'info',
            }"
            type="submit"
            @click="changeName('info')"
          >
            <i class="bx bxs-truck d-block check-nav-icon mt-2 mb-2"
              ><span class="fw-bold ms-2">个人信息</span></i
            >
          </button>
        </div>
        <div class="card">
          <button
            class="btn"
            :class="{
              'btn-primary': selectedName == 'weixin',
              'btn-outline-primary': selectedName != 'weixin',
            }"
            type="submit"
            @click="changeName('weixin')"
          >
            <i class="bx bxs-truck d-block check-nav-icon mt-2 mb-2"
              ><span class="fw-bold ms-2">微信公众号绑定</span></i
            >
          </button>
        </div>
        <div class="card">
          <button
            class="btn"
            :class="{
              'btn-primary': selectedName == 'pwd',
              'btn-outline-primary': selectedName != 'pwd',
            }"
            type="submit"
            @click="changeName('pwd')"
          >
            <i class="bx bxs-truck d-block check-nav-icon mt-2 mb-2"
              ><span class="fw-bold ms-2">修改密码</span></i
            >
          </button>
        </div>
      </div>

      <div class="col-xl-9">
        <div class="card">
          <div
            class="card-body"
            v-show="selectedName == 'info'"
          >
            <h4 class="card-title mb-4">个人信息</h4>
            <div class="table-responsive">
              <table class="table table-nowrap mb-0">
                <tbody>
                  <tr>
                    <th scope="row">账户名 :</th>
                    <td>{{ userInfo.fullname }}</td>
                  </tr>
                  <tr>
                    <th scope="row">职务 :</th>
                    <td>{{ userInfo.duty }}</td>
                  </tr>
                  <tr>
                    <th scope="row">性别 :</th>
                    <td>{{ userInfo.sex == 2 ? "女" : "男" }}</td>
                  </tr>
                  <tr>
                    <th scope="row">邮箱 :</th>
                    <td>{{ userInfo.email }}</td>
                  </tr>
                  <tr>
                    <th scope="row">员工号 :</th>
                    <td>{{ userInfo.wechat }}</td>
                  </tr>
                  <tr>
                    <th scope="row">电话 :</th>
                    <td>{{ userInfo.phone }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div
            class="card-body"
            v-show="selectedName == 'weixin'"
          >
            <h4 class="card-title mb-4">微信公众号绑定</h4>
            <div>
              <img
                :src="qrCodeUrl"
                width="200"
                height="200"
                alt=""
              />
            </div>
            <div
              class="card-title"
              :style="{fontSize:'20px',color:isWeiXinRelation?'#1db349':'#dc3545',marginLeft:'18px'}"
            >
              绑定状态：{{ isWeiXinRelation ? "已绑定" : "未绑定" }}
            </div>
          </div>
          <div
            class="card-body"
            v-show="selectedName == 'pwd'"
          >
            <h4 class="card-title mb-4">修改密码</h4>
            <div style="display: flex; justify-content: center">
              <el-form
                :model="pwdInfo"
                :rules="rules"
                ref="pwsFormRef"
                label-width="100"
                style="width: 400px"
              >
                <el-form-item
                  label="原密码"
                  prop="oldPassword"
                >
                  <el-input
                    v-model="pwdInfo.oldPassword"
                    placeholder="请输入原密码"
                    type="password"
                    show-password
                    style="width: 240px"
                  />
                </el-form-item>
                <el-form-item
                  label="新密码"
                  prop="newPassword"
                >
                  <el-input
                    v-model="pwdInfo.newPassword"
                    placeholder="请输入新密码"
                    type="password"
                    show-password
                    style="width: 240px"
                  />
                </el-form-item>
                <el-form-item
                  label="确认密码"
                  prop="newPasswordAffirm"
                >
                  <el-input
                    v-model="pwdInfo.newPasswordAffirm"
                    placeholder="请重复输入新密码"
                    type="password"
                    show-password
                    style="width: 240px"
                  />
                </el-form-item>
                <div
                  class="alert alert-warning text-center"
                  role="alert"
                >
                  <span
                    >密码必须由12~30位大写字母+小写字母+数字+特殊字符4种组成（缺一不可）特殊符合包括!@#$%^&*_</span
                  >
                </div>
                <div class="text-center mt-3">
                  <b-button
                    variant="success"
                    class="ms-1"
                    @click="saveChangePwd()"
                    >确认修改</b-button
                  >
                </div>
              </el-form>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- end row -->
  </Layout>
</template>
<style scoped lang="scss">
.avatar-uploader {
  :deep() {
    border: 1px dashed #d9d9d9;
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    margin: 24px 20px;
  }
}
</style>
