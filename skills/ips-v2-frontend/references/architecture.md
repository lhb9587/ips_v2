# IPS V2 项目架构

## 目录骨架

- `src/views/`：按业务模块放页面，常见模块有 `case`、`finance`、`hrm`、`customer`、`management`、`performance-assessment`。
- `src/router/modules/`：按业务模块拆路由，由 `src/router/routes.js` 聚合。
- `src/api/`：按业务拆 API 文件，URL 常量集中在 `serviceApi.config.js`、`ipServiceApi.config.js`、`performanceAssessment.config.js` 等文件。
- `src/components/`：公共组件入口，重点目录包括 `common`、`sidebar`、`case`、`widgets`、`top-nav`。
- `src/state/modules/`：Vuex 模块，使用 `require.context` 动态加载，默认 `namespaced: true`。
- `src/utils/request.js`：统一请求封装。
- `src/permission.js`：菜单权限过滤和路由校验。
- `src/design/`、`src/layouts/`：全局样式与布局体系。

## 技术栈

- Vue `3.2.x`
- Vue Router `4.x`
- Vuex `4.x`
- Element Plus `2.9.x`
- Axios `0.27.x`
- Vue CLI `5.x`
- ECharts、AG Grid Vue3、FullCalendar、WangEditor 或 CKEditor、vuedraggable

## 新增功能目录原则

1. 先放进已有业务模块，不随意新增一级目录。
2. 页面、路由、API 的模块名保持一致，方便检索和维护。
3. 公共能力先看 `components/common` 是否已有，再决定是否新增公共组件。
4. 只有出现跨页面共享状态时才新增 Vuex 模块；局部状态优先放页面内部。
5. 页面内容较多时，优先在页面目录下拆分子组件或局部模块。

## 布局与风格

1. 保持中后台页面的既有布局节奏，不重做页面骨架。
2. 延续已有间距、标题区、搜索区、表格区、分页区的组织方式。
3. 无设计稿时，直接参考同业务模块内的同类型已有页面。
4. 不引入新的 UI 库、全局样式范式或与现有主题冲突的视觉写法。

## 构建与环境

- 路由基座：`createWebHistory('/v2')`
- 构建基座：`publicPath: '/v2/'`
- 开发端口：`9528`
- 常用脚本：`npm run serve`、`npm run build`、`npm run lint`
- 联调依赖 `vue.config.js` 中的 proxy，接口异常时先排查 proxy、base 路径和环境变量。
