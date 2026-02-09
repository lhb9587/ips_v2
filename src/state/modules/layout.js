import { setLayout,getLayout,getLeftSidebarCondensed,setLeftSidebarCondensed,getMenuBarCollapseMode,setMenuBarCollapseMode } from '@/utils/user'

const layout = getLayout() || 'vertical';
export const state = {
  layoutType: layout,
  layoutWidth: 'fluid',
  leftSidebarType: 'dark',
  topbar: 'dark',
  loader: false,
  leftSidebarCondensed: getLeftSidebarCondensed() == 1,
  menuBarCollapseMode: getMenuBarCollapseMode() || 'icon',
  caseShowType:'folder',
  projectShowType:'folder',
  custShowType:'folder',
  mytaskShowType:'folder',
}

export const mutations = {
  CHANGE_LAYOUT(state, layoutType) {
    state.layoutType = layoutType;
  },
  CHANGE_LAYOUT_WIDTH(state, layoutWidth) {
    state.layoutWidth = layoutWidth;
  },
  CHANGE_LEFT_SIDEBAR_TYPE(state, leftSidebarType) {
    state.leftSidebarType = leftSidebarType;
  },
  CHANGE_TOPBAR(state, topbar) {
    state.topbar = topbar;
  },
  LOADER(state, loader) {
    state.loader = loader
  },
  CHANGE_LEFT_SIDEBAR(state, leftSidebarCondensed) {
    state.leftSidebarCondensed = leftSidebarCondensed
  },
  CHANGE_MENUBAR_COLLAPSE_MODE(state, menuBarCollapseMode) {
    state.menuBarCollapseMode = menuBarCollapseMode
  },
  CHANGE_CASE_SHOWTYPE(state, caseShowType) {
    state.caseShowType = caseShowType
  },
  CHANGE_PROJECT_SHOWTYPE(state, projectShowType) {
    state.projectShowType = projectShowType
  },
  CHANGE_CUST_SHOWTYPE(state, custShowType) {
    state.custShowType = custShowType
  },
  CHANGE_MYTASK_SHOWTYPE(state, mytaskShowType) {
    state.mytaskShowType = mytaskShowType
  }
}

export const actions = {
  changeLayoutType({ commit }, { layoutType }) {
    commit('CHANGE_LAYOUT', layoutType);
    if(layoutType !== 'no'){
      setLayout(layoutType)
    }
  },

  changeLayoutWidth({ commit }, { layoutWidth }) {
    commit('CHANGE_LAYOUT_WIDTH', layoutWidth)
  },

  changeLeftSidebarType({ commit }, { leftSidebarType }) {
    commit('CHANGE_LEFT_SIDEBAR_TYPE', leftSidebarType)
  },

  changeTopbar({ commit }, { topbar }) {
    commit('CHANGE_TOPBAR', topbar)
  },

  changeLoaderValue({ commit }, { loader }) {
    commit('LOADER', loader)
  },

  changeLeftSidebar({ commit }, { leftSidebarCondensed }) {
    commit('CHANGE_LEFT_SIDEBAR', leftSidebarCondensed)
    setLeftSidebarCondensed(leftSidebarCondensed?1:0)
  },

  changeMenuBarCollapseMode({ commit }, { menuBarCollapseMode }) {
    commit('CHANGE_MENUBAR_COLLAPSE_MODE', menuBarCollapseMode)
    setMenuBarCollapseMode(menuBarCollapseMode)
  },

  changeCaseShowType({ commit }, { caseShowType }) {
    commit('CHANGE_CASE_SHOWTYPE', caseShowType)
  },
  
  changeProjectShowType({ commit }, { projectShowType }) {
    commit('CHANGE_PROJECT_SHOWTYPE', projectShowType)
  },

  changeCustShowType({ commit }, { custShowType }) {
    commit('CHANGE_CUST_SHOWTYPE', custShowType)
  },
  
  changeMytaskShowType({ commit }, { mytaskShowType }) {
    commit('CHANGE_MYTASK_SHOWTYPE', mytaskShowType)
  }
}
