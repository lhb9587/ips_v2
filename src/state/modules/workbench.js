export const state = {
  toExamineValue: 0,
  statusValue: 0,
  isShowMatter:true,
  hasFinanceAuditOnTop:true, // 财务审核是否在顶部
  hasAdjustStatusOnTop:true, // 调整状态是否在顶部
};

export const mutations = {
  CHANGE_TOEXAMINE(state, toExamineValue) {
    state.toExamineValue = toExamineValue;
  },
  CHANGE_STATUS(state, statusValue) {
    state.statusValue = statusValue;
  },
  UPDATE_SHOW_MATTER(state, isShowMatter) {
    state.isShowMatter = isShowMatter;
  },
  UPDATE_HAS_ADJUST_STATUS_ON_TOP(state, hasAdjustStatusOnTop) {
    state.hasAdjustStatusOnTop = hasAdjustStatusOnTop;
  },
  UPDATE_HAS_FINANCE_AUDIT_ON_TOP(state, hasFinanceAuditOnTop) {
    state.hasFinanceAuditOnTop = hasFinanceAuditOnTop;
  },
};

export const actions = {
  changeToExamineValue({ commit }, toExamineValue) {
    commit("CHANGE_TOEXAMINE", toExamineValue);
  },
  changeStatusValue({ commit }, toExamineValue) {
    commit("CHANGE_STATUS", toExamineValue);
  },
  updateHasFinanceAuditOnTop({ commit }, hasFinanceAuditOnTop) {
    commit("UPDATE_HAS_FINANCE_AUDIT_ON_TOP", hasFinanceAuditOnTop);
  },
  updateHasAdjustStatusOnTop({ commit }, hasAdjustStatusOnTop) {
    commit("UPDATE_HAS_ADJUST_STATUS_ON_TOP", hasAdjustStatusOnTop);
  },
};
