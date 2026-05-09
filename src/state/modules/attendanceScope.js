// attendance scope state shared by attendance pages.
import { getAttendanceScope } from "@/api/attendance";

export const state = {
  scope: null,
  loaded: false,
  roleType: "",
};

export const getters = {
  scope: (state) => state.scope,
  loaded: (state) => state.loaded,
  roleType: (state) => state.roleType,
  deptScopes: (state) => state.scope?.deptScopes || [],
};

const resolveRoleType = (data = {}) => {
  if (data.systemAdmin) return "systemAdmin";
  if (data.hr) return "hr";
  if (data.attendanceClerk) return "attendanceClerk";
  if (data.departmentLeader) return "departmentLeader";
  if (data.groupLeader) return "groupLeader";
  if (data.employee) return "employee";
  return "";
};

export const actions = {
  getScope({ commit, state }, { force = false } = {}) {
    if (!force && state.loaded && state.scope) {
      return Promise.resolve(state.scope);
    }
    return new Promise((resolve, reject) => {
      getAttendanceScope()
        .then((response) => {
          const scope = response?.data || {};
          commit("SET_SCOPE", scope);
          commit("SET_LOADED", true);
          commit("SET_ROLE_TYPE", resolveRoleType(scope));
          resolve(scope);
        })
        .catch((error) => {
          commit("SET_SCOPE", null);
          commit("SET_LOADED", false);
          commit("SET_ROLE_TYPE", "");
          reject(error);
        });
    });
  },
  clearScope({ commit }) {
    commit("SET_SCOPE", null);
    commit("SET_LOADED", false);
    commit("SET_ROLE_TYPE", "");
  },
};

export const mutations = {
  SET_SCOPE(state, scope) {
    state.scope = scope;
  },
  SET_LOADED(state, loaded) {
    state.loaded = loaded;
  },
  SET_ROLE_TYPE(state, roleType) {
    state.roleType = roleType;
  },
};
