const APP_USERINFO = "USER_INFO";
const APP_USERNAME = "USER_NAME";
const APP_USERPSWD = "USER_PSWD";
const APP_CASETYPE_LIST = "CASETYPE_LIST";
const APP_LAYOUT = "LAYOUT";
const APP_TABLE_CONFIG = "TABLE_CONFIG";
const APP_MENU_STATUS = "MENU_STATUS";
const APP_LEFT_SIDEBAR_CONDENSED = "LEFT_SIDEBAR_CONDENSED";
const APP_SIDEBAR_WIDTH = "SIDEBAR_WIDTH";
const APP_MENUBAR_COLLAPSE_MODE = "MENUBAR_COLLAPSE_MODE ";

export function setUserInfo(val) {
  window.localStorage.setItem(APP_USERINFO,val);
}
export function getUserInfo() {
  return JSON.parse(window.localStorage.getItem(APP_USERINFO));
}
export function removeUserInfo() {
  window.localStorage.removeItem(APP_USERINFO);
}

export function setUserName(val) {
  window.localStorage.setItem(APP_USERNAME,val);
}
export function getUserName() {
  return window.localStorage.getItem(APP_USERNAME);
}
export function removeUserName() {
  window.localStorage.removeItem(APP_USERNAME);
}

export function setUserPswd(val) {
  window.localStorage.setItem(APP_USERPSWD,val);
}
export function getUserPswd() {
  return window.localStorage.getItem(APP_USERPSWD);
}
export function removeUserPswd() {
  window.localStorage.removeItem(APP_USERPSWD);
}

//案件类型列表
export function setCaseTypeList(val) {
  window.localStorage.setItem(APP_CASETYPE_LIST,val);
}
export function getCaseTypeList() {
  return JSON.parse(window.localStorage.getItem(APP_CASETYPE_LIST));
}
export function removeCaseTypeList() {
  window.localStorage.removeItem(APP_CASETYPE_LIST);
}

//布局
export function setLayout(val) {
  window.localStorage.setItem(APP_LAYOUT,val);
}
export function getLayout() {
  return window.localStorage.getItem(APP_LAYOUT)
}
export function removeLayout() {
  window.localStorage.removeItem(APP_LAYOUT);
}

//菜单栏开关
export function setMenuStatus(val) {
  window.localStorage.setItem(APP_MENU_STATUS,val);
}
export function getMenuStatus() {
  return window.localStorage.getItem(APP_MENU_STATUS)
}
export function removeMenuStatus() {
  window.localStorage.removeItem(APP_MENU_STATUS);
}

//表格配置
export function setTableConfig(val) {
  window.localStorage.setItem(APP_TABLE_CONFIG,val)
}
export function getTableConfig() {
  return JSON.parse(window.localStorage.getItem(APP_TABLE_CONFIG));
}
export function removeTableConfig() {
  window.localStorage.removeItem(APP_TABLE_CONFIG);
}
//左侧菜单栏状态
export function setLeftSidebarCondensed(val) {
  window.localStorage.setItem(APP_LEFT_SIDEBAR_CONDENSED,val)
}
export function getLeftSidebarCondensed() {
  return window.localStorage.getItem(APP_LEFT_SIDEBAR_CONDENSED);
}
export function removeLeftSidebarCondensed() {
  window.localStorage.removeItem(APP_LEFT_SIDEBAR_CONDENSED);
}
//抽屉详情宽度
export function setSidebarWidth(val) {
  window.localStorage.setItem(APP_SIDEBAR_WIDTH,val)
}
export function getSidebarWidth() {
  return JSON.parse(window.localStorage.getItem(APP_SIDEBAR_WIDTH));
}
export function removeSidebarWidth() {
  window.localStorage.removeItem(APP_SIDEBAR_WIDTH);
}
//菜单栏收起模式
export function setMenuBarCollapseMode(val) {
  window.localStorage.setItem(APP_MENUBAR_COLLAPSE_MODE,val)
}
export function getMenuBarCollapseMode() {
  return window.localStorage.getItem(APP_MENUBAR_COLLAPSE_MODE);
}
export function removeMenuBarCollapseMode() {
  window.localStorage.removeItem(APP_MENUBAR_COLLAPSE_MODE);
}