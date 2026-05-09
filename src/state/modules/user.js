import { getToken, setToken, removeToken } from "@/utils/auth";
import { login, checkUserPassWord, getInfo,logout,getUser } from "@/api/user";
import { queryUsers} from '@/api/systemList'
import router from '@/router'
import { setUserInfo,removeUserInfo } from "@/utils/user";
// import {ElMessageBox} from "element-plus";
import { queryCaseType } from "@/api/caseList";
import { setCaseTypeList } from "@/utils/user";
export const state = {
  token: getToken(),
  userId: "",
  permissions: [],
  permissionFlag: true,
  roles: [],
  name: "",
  avatar: "",
  corporationName: "",
  domainList: [],
  hostName: "",
};
export const getters = {
  userId: (state) => state.userId,
  permissions: (state) => state.permissions,
};
export const actions = {
  login({ commit }, userInfo) {
    const { username, password } = userInfo;
    return new Promise((resolve, reject) => {
      login({
        username: username.trim(),
        password: password,
        mobile: 0,
      })
        .then((response) => {
          setToken(response.tokenID);
          commit("SET_TOKEN", response.tokenID);
          checkUserPassWord({
            password,
          })
            .then((res) => {
              // if (res.messageType == -1) {
              //   const confirmText = res.message.split("\n");
              //   const newDatas = [];
              //   const h = Vue.$createElement;
              //   for (const i in confirmText) {
              //     newDatas.push(h("p", null, confirmText[i]));
              //   }
              //   ElMessageBox.confirm(h("div", null, newDatas), "提示", {
              //     confirmButtonText: "已知晓",
              //     showCancelButton: false,
              //     cancelButtonText: "取消",
              //     type: "warning",
              //   })
              //     .then((res) => {
              //       resolve(res);
              //       // store.dispatch('user/resetToken').then(() => {
              //       //   location.reload()
              //       // })
              //     })
              //     .catch((err) => {
              //       resolve(err);
              //     });
              //   return;
              // }
              // if (res.messageType == -2) {
              //   const confirmText = res.message.split("\n");
              //   const newDatas = [];
              //   const h = Vue.$createElement;
              //   for (const i in confirmText) {
              //     newDatas.push(h("p", null, confirmText[i]));
              //   }
              //   ElMessageBox.confirm(h("div", null, newDatas), "提示", {
              //     confirmButtonText: "确定",
              //     showCancelButton: false,
              //     cancelButtonText: "取消",
              //     type: "warning",
              //   })
              //     .then(() => {
              //       commit("SET_TOKEN", "");
              //       removeToken();
              //       // resetRouter();
              //       reject();
              //     })
              //     .catch(() => {
              //       commit("SET_TOKEN", "");
              //       removeToken();
              //       // resetRouter();
              //       reject();
              //     });
              //   return;
              // }
              // dispatch('getInfo')
              resolve(res);
            })
            .catch((err) => {
              reject(err);
            });
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token)
        .then(() => {
          commit("SET_TOKEN", "");
          commit("SET_ROLES", []);
          commit("SET_PERMISSIONFLAG", true);
          commit("SET_PERMISSIONS", []);
          commit("attendanceScope/SET_SCOPE", null, { root: true });
          commit("attendanceScope/SET_LOADED", false, { root: true });
          commit("attendanceScope/SET_ROLE_TYPE", "", { root: true });
          removeToken();
          removeUserInfo()
          // resetRouter();
          router.push("/login");
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  // remove token
  resetToken({ commit }) {
    return new Promise((resolve) => {
      commit("SET_TOKEN", "");
      commit("SET_ROLES", []);
      commit("attendanceScope/SET_SCOPE", null, { root: true });
      commit("attendanceScope/SET_LOADED", false, { root: true });
      commit("attendanceScope/SET_ROLE_TYPE", "", { root: true });
      removeToken();
      resolve();
    });
  },
  // get user info
  getInfo({ commit, state,dispatch }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token)
        .then(async (response) => {
          resolve(response)
          const { data } = response;
          if (!data) {
            reject("Verification failed, please Login again.");
          }
          const {
            roles,
            name,
            avatar,
            userId,
            permissions,
            corporationName,
            domainList,
          } = data;
          // roles must be a non-empty array
          if (permissions.filter((item) => item.id !== 0).length <= 0) {
            commit("SET_PERMISSIONS", [...permissions.map((item) => item.id)]);
            commit("SET_TOKEN", "");
            removeToken();
            reject("您没有角色和权限 请联系管理员");
            return;
          }
          commit("SET_PERMISSIONS", [...permissions.map((item) => item.id)]);
          commit("SET_ROLES", roles);
          commit("SET_NAME", name);
          commit("SET_CORPORATIONNAME", corporationName);
          commit("SET_AVATAR", avatar);
          commit("SET_USERID", userId);
          commit("SET_DOMAINLIST", domainList);
          commit("SET_HOSTNAME", window.location.hostname);
          const userInfo = {
            userId,
            name,
            roles,
            permissions,
            corporationName,
            domainList,
            avatar
          };
          setUserInfo(JSON.stringify(userInfo))
          await dispatch('user/getUser', '', { root: true })
          queryCaseType().then(res=>{
            setCaseTypeList(JSON.stringify(res.data))
          })
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  getUser({commit}){
    return new Promise((resolve, reject) => {
      Promise.all([getUser(),queryUsers()]).then(res=>{
        commit('SET_USERLIST', res[0].data)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },
};
export const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token;
  },
  SET_NAME: (state, name) => {
    state.name = name;
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar;
  },
  SET_CORPORATIONNAME(state, corporationName) {
    state.corporationName = corporationName;
  },
  SET_DOMAINLIST: (state, domainList) => {
    state.domainList = domainList;
  },
  SET_USERID: (state, userId) => {
    state.userId = userId;
  },
  SET_PERMISSIONFLAG: (state, flag) => {
    state.permissionFlag = flag;
  },
  SET_PERMISSIONS: (state, permissions) => {
    state.permissions = permissions;
    // if (state.permissionFlag) {
    //   state.permissions = permissions;
    // } else {
    //   state.permissions = Array.from(new Array(400).keys()).slice(0);
    // }
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles;
  },
  SET_HOSTNAME(state, hostName) {
    state.hostName = hostName;
  },
  SET_USERLIST:(state, userList)=>{
    userList.forEach(item=>{
      item.label=item.fullname
      item.id=item.userId
      item.name=item.fullname
      item.value=item.userId
    })
    state.userList = userList
  },
};
