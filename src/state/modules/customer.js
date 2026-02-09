export const state = {
  selectedCustInfo: {},
  statusValue: 1, // 1: 关注客户, 0: 全部客户
};
export const mutations = {
  CHANGE_SELECTED_CUSTINFO(state, selectedCustInfo) {
    state.selectedCustInfo = selectedCustInfo;
  },
  CHANGE_STATUS_VALUE(state, statusValue) {
    state.statusValue = statusValue;
  }
};
