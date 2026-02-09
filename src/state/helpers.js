import { mapState, mapGetters, mapActions } from 'vuex'

export const authComputed = {
  ...mapState('auth', {
    currentUser: (state) => state.currentUser,
  }),
  ...mapGetters('auth', ['loggedIn']),
}

export const layoutComputed = {
  ...mapState('layout', {
    layoutType: (state) => state.layoutType,
    leftSidebarType: (state) => state.leftSidebarType,
    layoutWidth: (state) => state.layoutWidth,
    topbar: (state) => state.topbar,
    loader: (state) => state.loader,
    leftSidebarCondensed: (state) => state.leftSidebarCondensed,
    menuBarCollapseMode: (state) => state.menuBarCollapseMode,
    caseShowType: (state) => state.caseShowType,
    projectShowType: (state) => state.projectShowType,
    custShowType: (state) => state.custShowType,
    mytaskShowType: (state) => state.mytaskShowType,
  })
}
export const workbenchComputed = {
  ...mapState('workbench', {
    toExamineValue: (state) => state.toExamineValue,
    statusValue: (state) => state.statusValue,
    isShowMatter: (state) => state.isShowMatter,
    hasFinanceAuditOnTop: (state) => state.hasFinanceAuditOnTop,
    hasAdjustStatusOnTop: (state) => state.hasAdjustStatusOnTop,
  })
}
export const userComputed = {
  ...mapState('user', {
    userId: (state) => state.userId,
    permissions: (state) => state.permissions,
    permissionFlag: (state) => state.permissionFlag,
    roles: (state) => state.roles,
    name: (state) => state.name,
    avatar: (state) => state.avatar,
    corporationName: (state) => state.corporationName,
    domainList: (state) => state.domainList,
    hostName: (state) => state.hostName,
    userList: (state) => state.userList,
  })
}
export const caseComputed = {
  ...mapState('case', {
    caseDomain: (state) => state.caseDomain,
    caseStatus: (state) => state.caseStatus,
    caseBelongTo: (state) => state.caseBelongTo,
    breadcrumbList: (state) => state.breadcrumbList,
  })
}

export const authMethods = mapActions('auth', ['logIn', 'logOut', 'register', 'resetPassword'])

export const layoutMethods = mapActions('layout', ['changeLayoutType', 'changeLayoutWidth', 'changeLeftSidebarType', 'changeTopbar', 'changeLoaderValue'])

export const authFackMethods = mapActions('authfack', ['login', 'registeruser', 'logout'])

export const notificationMethods = mapActions('notification', ['success', 'error', 'clear'])

export const userMethods = mapActions('user', ['login', 'layout', 'resetToken', 'getInfo'])

export const todoComputed = {
  ...mapState('todo', {
    todos: (state) => state.todos
  })
}
export const todoMethods = mapActions('todo', ['fetchTodos'])