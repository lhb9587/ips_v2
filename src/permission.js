import router from './router'
// import { usePermissionStore } from '@/store/modules/permission'
import { getToken } from '@/utils/auth' // get token from cookie
import store from '@/state/store'
import { ElMessageBox,ElCheckbox } from "element-plus";
import { h } from 'vue'
import { menuItems } from '@/components/menu'

import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login','/forgot-password','/excel_preview'] // 设置白名单

//由于会出现动态路由，不能使用path，取路由的name作为白名单的key
const allowRouterList = ['personal-profile','contract-detail','project-detail','task-detail','subtask-detail','case-detail']
// 记录路由
// let hasRoles = true

const openUrl = (path) =>{
  let url = '';
  const hostname = window.location.hostname;
  const port = window.location.port || 8000;
  if (hostname === 'ips.wanhuida.cn') {
    url = `https://ips.wanhuida.cn/#${path}` // 正式
  } else if (hostname === 'localhost') {
    url = `http://localhost:9527/#${path}` // 开发
  } else if(port == 8000) {
    url = `http://${hostname}:8000/#${path}` // 测试
  } else {
    url = `http://${hostname}:${port}/v1/#${path}` // 外包测试
  }
  window.open(url);
}

//前置守卫
router.beforeEach((to, from, next) => {
  NProgress.start()
  const hasToken = getToken()

  // 优先判断白名单，白名单直接放行
  if (whiteList.indexOf(to.path) !== -1) {
    next()
    if (typeof to.meta.title === 'string') {
      document.title = to.meta.title || 'vue-admin-perfect'
    }
    NProgress.done()
    return
  }

  if (hasToken) {
    if (to.path.includes('workbench')) {
      NProgress.done()
      const noReminder = localStorage.getItem('noReminder');
      if (!noReminder || noReminder == 'false') {
        ElMessageBox.confirm(
          h('div', { class:'remainerd-dialog'}, [
            h('p', null, '该功能尚未在新版实现，将跳转到旧版页面，是否继续？'),
            h(ElCheckbox, {
              modelValue: noReminder,
              'onUpdate:modelValue': (value) => {
                localStorage.setItem('noReminder', value);
              },
            }, '不再提醒')
          ]),
          "提示",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        )
          .then(() => {
            openUrl(to.path);
          })
          .catch(() => {
            // 用户取消操作
          });
      } else {
        openUrl(to.path);
      }
    } else {
      // 使用 Promise 处理用户信息获取
      store.dispatch('user/getInfo')
        .then(() => {
          // 获取权限过滤后的菜单
          const permissions = store.state.user.permissions || []
          const menuList = filterMenusByPermissions(menuItems, permissions)
          // 检查当前路由是否在权限菜单中
          
          const isRouteValid = checkRouteInMenu(to.path, menuList)
          console.log(to.name,'to.name@@');
          
          if (!isRouteValid && !allowRouterList.includes(to.name)) {
            // 如果路由不在权限菜单中，跳转到第一个有效路由
            const firstValidRoute = findFirstValidRoute(menuList)
            if (firstValidRoute) {
              next(firstValidRoute)
              return
            }
          }
          
          // 设置页面标题
          if (typeof to.meta.title === 'string') {
            document.title = to.meta.title || 'vue-admin-perfect'
          }
          next()
        })
        .catch(error => {
          console.error('获取用户信息失败:', error)
          // next('/login')
        })
    }
  } else {
    next('/login')
  }
})

// 递归检查路由是否在菜单中
function checkRouteInMenu(path, menuList) {
  for (const menu of menuList) {
    if (menu.link === path) {
      return true
    }
    if (menu.subItems) {
      if (checkRouteInMenu(path, menu.subItems)) {
        return true
      }
    }
  }
  return false
}

// 查找第一个有效路由
function findFirstValidRoute(menuList) {
  for (const menu of menuList) {
    if (menu.link && !menu.link.includes('workbench')) {
      return menu.link
    }
    if (menu.subItems) {
      const subRoute = findFirstValidRoute(menu.subItems)
      if (subRoute) {
        return subRoute
      }
    }
  }
  return null
}

// 过滤菜单的函数
function filterMenusByPermissions(menus, idList) {  
  if (idList.length === 0) {
    return []
  }
  return menus.reduce((filteredMenus, menu) => {  
    if (!menu.permissions || menu.permissions.some(perm => idList?.includes(perm))) {  
      if (menu.subItems) {  
        menu.subItems = filterMenusByPermissions(menu.subItems, idList);  
        if (menu.subItems.length === 0) {  
          delete menu.subItems;
        }  
      }  
      filteredMenus.push(menu);  
    }  
    return filteredMenus;  
  }, []);  
}

// //后置守卫
router.afterEach(() => {
  NProgress.done()
})

router.onError(error => {
  if (error.message.includes("Failed to fetch dynamically imported module")) {
    window.location.reload();
  }
});
