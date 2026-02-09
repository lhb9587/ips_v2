<template>
  <div class="card">
    <div class="card-body">
      <div class="d-flex">
        <div class="flex-shrink-0 me-4">
          <div class="avatar-md">
            <span
              class="avatar-title rounded-circle bg-light text-danger font-size-16"
            >
              <img
                v-if="handlerInfo.wkgIcon && !wkgIconError"
                :src="`/ipdoc${handlerInfo.wkgIcon}`"
                alt=""
                class="rounded-circle avatar-md"
                @error="handleWkgIconError"
              />
              <img
                v-else
                src="@/assets/images/users/defaultavatar.png"
                alt=""
                class="rounded-circle avatar-md"
              />
            </span>
          </div>
        </div>

        <div class="flex-grow-1 overflow-hidden">
          <h5 class="text-truncate font-size-15">
            <a
              href="javascript: void(0);"
              class="text-dark"
              >{{ handlerInfo.groupName }}</a
            >
          </h5>
          <p class="text-muted mb-4">{{ handleType }}</p>
          <div class="d-flex">
            <div class="avatar-group">
              <div
                class="avatar-group-item"
                v-for="user in userAvatarList.slice(0, 6)"
                :key="user.userId"
              >
                <a
                  href="javascript: void(0);"
                  class="d-inline-block"
                >
                  <img
                    v-if="
                      user.userIcon &&
                      !avatarLoadErrorList.includes(user.userIcon)
                    "
                    :src="`/ipdoc${user.userIcon}`"
                    alt=""
                    class="rounded-circle avatar-xs"
                    @error="handleAvatarError(user.userIcon)"
                  />
                  <img
                    v-else
                    src="@/assets/images/users/defaultavatar.png"
                    alt=""
                    class="rounded-circle avatar-xs"
                  />
                </a>
              </div>
              <!-- <div class="avatar-group-item">
              <a
                href="javascript: void(0);"
                class="d-inline-block"
              >
                <div class="avatar-xs">
                  <span
                    class="avatar-title rounded-circle bg-success text-white font-size-16"
                  >
                    A
                  </span>
                </div>
              </a>
            </div> -->
              <span
                v-if="userAvatarList.length > 6"
                style="display: flex; align-items: flex-end"
                >......</span
              >
            </div>
            <button
              type="button"
              v-if="expented"
              class="ms-4 btn btn-soft-primary btn-hover btn-sm btn-rounded"
              @click="expented = !expented"
            >
              <i class="mdi mdi-arrow-up-drop-circle-outline"></i> 收起
            </button>
            <button
              v-else
              type="button"
              class="ms-4 btn btn-soft-primary btn-hover btn-sm btn-rounded"
              @click="expented = !expented"
            >
              <i class="mdi mdi-eye"></i> 查看
            </button>
          </div>

          <div
            class="table-responsive"
            v-if="expented"
          >
            <el-table
              :data="handlerInfo.trademarkCaseWorkgroupMembers"
              :max-height="300"
            >
              <el-table-column
                :prop="col.value"
                :label="col.title"
                v-for="col of columns"
                :key="col.value"
              >
                <template
                  v-if="col.value == 'userIcon'"
                  #default="scope"
                >
                  <img
                    v-if="
                      scope.row.userIcon &&
                      !avatarLoadErrorList.includes(scope.row.userIcon)
                    "
                    :src="`/ipdoc${scope.row.userIcon}`"
                    alt=""
                    class="rounded-circle avatar-xs"
                    @error="handleAvatarError(scope.row.userIcon)"
                  />
                  <img
                    v-else
                    src="@/assets/images/users/defaultavatar.png"
                    alt=""
                    class="rounded-circle avatar-xs"
                  />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { unique } from "@/utils";
export default {
  data() {
    return {
      expented: false,
      columns: [
        { title: "成员", value: "userIcon" },
        { title: "", value: "fullname" },
        { title: "成员角色", value: "roleName" },
        { title: "核定工时", value: "recordTime" },
        { title: "案件角色", value: "caseRoleName" },
      ],
      avatarLoadErrorList: [],
      wkgIconError: false,
    };
  },
  props: {
    handlerInfo: {
      type: Object,
      required: true,
    },
    handleType: {
      type: String,
    },
  },
  computed: {
    userAvatarList() {
      const list = this.unique(
        this.handlerInfo.trademarkCaseWorkgroupMembers,
        "userId"
      );
      return list;
    },
  },
  methods: {
    unique,
    handleAvatarError(userIcon) {
      this.avatarLoadErrorList = [...this.avatarLoadErrorList, userIcon];
    },
    handleWkgIconError() {
      this.wkgIconError = true;
    },
  },
};
</script>

<style></style>
