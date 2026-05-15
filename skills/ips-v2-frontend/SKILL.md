---
name: ips-v2-frontend
description: 用于 ip_service_v2 或 ips_v2 项目的 Vue3 前端开发、页面改造、路由接入、菜单权限、接口封装、状态管理和样式对齐。当用户要求在该项目中新增或修改 views、components、router/modules、api、state、permission、menu 等内容，并且需要保持既有代码格式、目录结构、公共组件、权限接入和页面风格一致时使用。
metadata:
  short-description: IPS V2 前端开发规范
---

# IPS V2 Frontend

## Quick Start

在 `ip_service_v2` / `ips_v2` 项目中做前端开发时，先沿用现有实现，再做最小必要改动。
1. 先读 [references/architecture.md](references/architecture.md) 和 [references/delivery-checklist.md](references/delivery-checklist.md)。
2. 按任务类型补读：
   - 页面、路由、菜单、权限：读 [references/routes-and-permissions.md](references/routes-and-permissions.md)
   - API、请求、上传下载、取消请求：读 [references/api-and-request.md](references/api-and-request.md)
   - 公共组件、列表、详情、样式复用：读 [references/shared-components.md](references/shared-components.md)
3. 在项目里先找同业务、同类型的已有页面作为模板，再开始改。
4. 涉及考勤或 HRM 页面时，优先确认 `deptScopes`、`groupScopes`、`selfOnly`、`roleType`、`attendanceScope` 等权限范围，不要把人员业务列表直接当成全量组织节点使用。

## Workflow

### 1. 建立任务上下文
- 确认业务域：`case`、`finance`、`hrm`、`customer`、`releaseslist`、`management`、`performance-assessment` 或 `dashboards/account`。
- 找到最近的已有页面、组件、API 文件和路由模块，优先沿用其目录、命名、布局结构和交互写法。
- 先界定改动范围，只改当前需求相关文件，不顺手重构无关模块。

### 2. 规划落点
- 页面放到 `src/views/<业务模块>/...`。
- 页面内容较多时，把详情块、表单块、筛选块、表格块拆到同目录或相邻 `components` 中。
- 路由放到 `src/router/modules/<业务模块>.js`，并由 `src/router/routes.js` 聚合。
- 接口放到 `src/api/<业务模块>.js`，URL 常量放到对应 `*.config.js`。
- 菜单与权限联动时，同步检查 `src/components/menu.js`、`src/permission.js`、`allowRouterList`。
- 只有确有跨页面共享状态时才新增 `src/state/modules/*.js`。

### 3. 按既有模式实现
- 表格页优先参考 `src/views/case/trademark/index.vue` 这类骨架，复用 `grid-table`、顶部搜索区、右侧 `TopListTool` 和分页。
- 列表页优先复用 `top-list-tool`、`list-search`、`grid-table`、`pagination`。
- 详情页、复杂表单、长 tab 页面主动拆组件，避免单个 `.vue` 文件过大。
- 新增功能页面、组件或业务文件时，在文件顶部补一条简短备注，说明核心职责。
- 时间展示、解析和格式转换优先用 `dayjs`。
- 案件、客户、账单详情优先复用对应 `sidebar` 体系，不另造一套详情面板。
- 工作台类页面优先复用 `components/widgets/*` 的卡片结构、统计方式和 loading 方式。
- 仅使用项目已有的 Element Plus、全局样式和公共组件，不引入新 UI 库或主题体系。
- 请求统一走 `@/utils/request`，不要在页面或组件里直接写 `axios`、`fetch` 或裸 URL。
- 保持 `/v2` 路由 base、权限过滤链路和菜单 permissions 约定一致。
- 中文文案、表头、枚举展示名、注释等需要直接保留中文源码，如 `"序号"`、`"额度ID"`，不要生成 `"\u5e8f\u53f7"` 这类 Unicode 转义；读写文件或脚本处理时显式使用 UTF-8，避免因终端编码或序列化工具把中文转义。

## Hard Rules

1. 不造后端字段、错误码、权限码、菜单结构或业务枚举。
2. 不在页面或组件中直写请求实例、裸 URL、散落的 loading 或错误处理。
3. 不引入与现有体系冲突的新 UI 库、新全局主题或全新页面骨架。
4. 无设计稿时，以同类型已有页面为视觉和交互参考。
5. 修改 `sidebar`、`widgets`、`caseList`、`performance-assessment` 相关内容前，先读对应引用资料并确认耦合范围。
6. 新增表格页时，除非需求明确排除，否则优先采用 `grid-table`，并补齐顶部搜索区和右侧 `TopListTool`。
7. 详情内容较多或页面逻辑明显分区时，必须主动拆分组件。
8. 处理时间格式时优先使用 `dayjs`，不要先写零散手工拼接或重复格式化逻辑。
9. 新增功能页面、组件或业务文件时，文件顶部必须补充简短备注，明确核心职责或主要内容。
10. 生成或修改源码时必须保留中文可读字面量，不要把中文字符串、注释、表头配置写成 `\uXXXX` 转义形式；如需使用脚本批量处理，确保输出编码为 UTF-8 且关闭中文转义。
11. 新增表格页面并使用 `Pagination` 组件时，若需求未明确指定分页参数，`pageSizesList` 默认使用 `[10, 50, 200, 500, 1000, 5000, 10000]`，`pageSize` 默认使用 `50`。

## Output Contract

每次完成任务时至少交付：

1. 变更摘要：改了什么、影响哪些页面或模块。
2. 文件清单：关键文件路径与职责。
3. 接口说明：新增或调整了哪些 API 调用。
4. 测试结果：已覆盖场景和未覆盖项。
5. 风险提醒：强耦合点、联调依赖、后续待确认项。
