export const state = {
  caseBelongTo: 1,
  caseDomain:0,
  caseStatus:0,
  breadcrumbList: [],
};
export const mutations = {
  CHANGE_CASEBELONGTO(state, caseBelongTo) {
    state.caseBelongTo = caseBelongTo;
  },
  CHANGE_CASEDOMAIN(state, caseDomain) {
    state.caseDomain = caseDomain;
  },
  CHANGE_CASESTATUS(state, caseStatus) {
    state.caseStatus = caseStatus;
  },
  CHANGE_BREADCRUMB(state, breadcrumbList) {
    state.breadcrumbList = breadcrumbList;
  }
}