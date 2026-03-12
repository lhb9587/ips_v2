# caseDetail.vue 案件字段梳理

- 源文件: `src/views/workbench/case/components/ManualIdentification/caseDetail.vue`
- 生成时间: 2026-03-12
- 口径: 公共字段 = 显示条件不依赖 `caseDetailFoemData.caseType/caseTypeId/caseType_str`。

## 条件变量说明

- `supplementList = ['国际注册驳回复审', '注册驳回复审']`
- `tmlist = ['变名变址', '续展', '变更注册申请代理机构', '删减商品项目', '更正商标申请事项', '转让/移转']`
- `trademarkList = ['商标注册', '答复临时驳回/审查意见（境外）', '提供使用声明/证据（境外）', '签署代理合同协议', '商标监控总卷/协议', '咨询', '其他', '投标']`
- `caseType_str` 在 `init()` 中保存了原始案件类型字符串。

## 案件详情

### 公共字段（不依赖 caseType）

| 字段名称 | 数据字段 | 显示条件 | 源码行 |
|---|---|---|---|
| 案件名称: | caseName | caseDetailFoemData.usAgency | 19 |
| 案件文号: | agentNum | caseDetailFoemData.usAgency | 22 |
| 案件备注: | remarks | caseDetailFoemData.usAgency | 27 |
| 合作所评分: | score | caseDetailFoemData.usAgency && ['内-外', '外-外'].includes(caseDetailFoemData.appFromto) | 34 |
| 合作所评价: | evaluate | caseDetailFoemData.usAgency && ['内-外', '外-外'].includes(caseDetailFoemData.appFromto) | 41 |
| 申请方向 | appFromto | !caseDetailFoemData.usAgency | 104 |
| 所属项目 | project | !caseDetailFoemData.usAgency | 109 |
| 合同编号 | contractNumber | !caseDetailFoemData.usAgency | 112 |
| 案件文号 | agentNum | !caseDetailFoemData.usAgency | 117 |
| 机密案件 | ifSec | !caseDetailFoemData.usAgency | 120 |
| 申请方式 | submitType | !caseDetailFoemData.usAgency | 159 |
| 代理机构 | whdAgencyName | !caseDetailFoemData.usAgency | 162 |
| 他所代交 | otherAgency | !caseDetailFoemData.usAgency | 212 |
| 代交所名称 | otherAgency, replaceAgencyName | !caseDetailFoemData.usAgency && caseDetailFoemData.otherAgency==='1' | 216 |
| 案件备注: | remarks | !caseDetailFoemData.usAgency | 420 |
| 合作所评分: | score | !caseDetailFoemData.usAgency && ['内-外', '外-外'].includes(caseDetailFoemData.appFromto) | 427 |
| 合作所评价: | evaluate | !caseDetailFoemData.usAgency && ['内-外', '外-外'].includes(caseDetailFoemData.appFromto) | 434 |
| 案件等级 | caseLevelStr | !caseDetailFoemData.usAgency | 470 |

### 其他字段（依赖案件类型或类型派生条件）

| 字段名称 | 数据字段 | 显示条件 | 源码行 |
|---|---|---|---|
| 是否再许可 | relicensing | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='许可备案' | 126 |
| 许可原备案号 | relicensing, parentDocNumber | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='许可备案' && caseDetailFoemData.relicensing=='是' | 129 |
| 许可类型 | licenseType | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='许可备案' | 134 |
| 再许可授权书 | relicensing | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='许可备案' && caseDetailFoemData.relicensing=='是' | 139 |
| 许可使用合同生效日期 | permitEffectiveDate | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='许可备案' | 144 |
| 许可使用合同终止日期 | permitInvalidDate | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='许可备案' | 148 |
| 是否延期： | caseType, delay | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='国际注册驳回复审' | 165 |
| 是否填写变更后代理机构名称 | isPreChangeAgencyName | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='变更注册申请代理机构' | 175 |
| 变更后代理机构名称 | isPreChangeAgencyName, preChangeAgencyName | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='变更注册申请代理机构' && caseDetailFoemData.isPreChangeAgencyName==1 | 179 |
| 更正事项: | correction | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='更正商标申请事项' && caseDetailFoemData.submitType=='线下申请' | 191 |
| 更正前信息 | beforeChangeMessage | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='更正商标申请事项' | 198 |
| 更正后信息 | afterChangeMessage | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='更正商标申请事项' | 201 |
| 申请补正理由 | reason | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='出具商标注册证明' | 221 |
| 之后是否交补充材料 | supplement | !caseDetailFoemData.usAgency && supplementList.includes(caseDetailFoemData.caseType) | 226 |
| 是否分割: | isDivision | !caseDetailFoemData.usAgency && supplementList.includes(caseDetailFoemData.caseType) | 229 |
| 分割申请书: | - | !caseDetailFoemData.usAgency && supplementList.includes(caseDetailFoemData.caseType) | 234 |
| 阐述事实与理由: | applicationMarks | !caseDetailFoemData.usAgency && ['国际注册驳回复审','注册驳回复审'].includes(caseDetailFoemData.caseType) | 243 |
| 事实与理由: | - | !caseDetailFoemData.usAgency && ['国际注册驳回复审','注册驳回复审'].includes(caseDetailFoemData.caseType) | 248 |
| 证据目录: | - | !caseDetailFoemData.usAgency && ['国际注册驳回复审','注册驳回复审'].includes(caseDetailFoemData.caseType) | 255 |
| 证据内容: | - | !caseDetailFoemData.usAgency && ['国际注册驳回复审','注册驳回复审'].includes(caseDetailFoemData.caseType) | 262 |
| 送达证据: | - | !caseDetailFoemData.usAgency && ['国际注册驳回复审','注册驳回复审'].includes(caseDetailFoemData.caseType) | 269 |
| 评审网申国际商标需上传材料: | - | !caseDetailFoemData.usAgency && ['国际注册驳回复审','注册驳回复审'].includes(caseDetailFoemData.caseType) | 276 |
| 注销类型: | changeType | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='商标注销' | 285 |
| 变更证明文件类型: | isDlbz, appCertFileIsCn | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='商标注销' && caseDetailFoemData.isDlbz=='是' | 288 |
| 未交回原注册证原因: | reason | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='商标注销' | 293 |
| 申请人名义是否发生变更: | isDlbz | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='商标注销' | 296 |
| 变更证明文件（中文）： | appCertFileIsCn | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='商标注销' && caseDetailFoemData.appCertFileIsCn=='是' | 301 |
| 变更证明文件原件彩色扫描件： | appCertFileIsCn | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='商标注销' && caseDetailFoemData.appCertFileIsCn=='否' | 307 |
| 原申请日期: | reviewCaseAppDate | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='撤回商标评审' | 317 |
| 原申请编号: | parentAppNumber | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='撤回商标评审' | 320 |
| 申请补证理由: | reason | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='补发商标注册证'\|\|caseDetailFoemData.caseType==='补发商标变转续证明' | 325 |
| 证明类型: | reissueType | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='补发商标变转续证明' | 330 |
| 变更前注册人名义/地址: | transferorCnName | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='补发商标变转续证明' && caseDetailFoemData.reissueType=='变更证明' | 336 |
| 变更后注册人名义/地址: | transferorEnName | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='补发商标变转续证明' && caseDetailFoemData.reissueType=='变更证明' | 339 |
| 转让人名称: | transferorCnAdress | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='补发商标变转续证明' && caseDetailFoemData.reissueType=='转让证明' | 344 |
| 受让人名称: | transferorEnAdress | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='补发商标变转续证明' && caseDetailFoemData.reissueType=='转让证明' | 347 |
| 撤回理由: | withdraw | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='撤回商标申请' | 354 |
| 动态标签: caseType_str == '撤回撤销三年不使用注册商标'?'原撤销申请号:' : '原申请号:' | changeType, parentAppNumber | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='撤回商标申请' && caseType_str !== '撤回商标异议' && caseDetailFoemData.changeType !== '转让/移转商标' | 357 |
| 原转让申请号 | changeType, parentAppNumber | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='撤回商标申请' && caseType_str !== '撤回商标异议' && caseDetailFoemData.changeType === '转让/移转商标' | 360 |
| 撤回理由描述: | reason | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='撤回商标申请' | 365 |
| 原撤销申请日期: | parentAppDate | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='撤回商标申请' && caseType_str == '撤回撤销三年不使用注册商标' | 368 |
| 申请人名称是否已变更: | isDlbz | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='撤回商标申请' | 373 |
| 转让人中文名称 | caseType, changeType, transferorCnName | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='撤回商标申请' && caseDetailFoemData.caseType==='撤回商标申请' && caseDetailFoemData.changeType==='转让/移转商标' | 376 |
| 变更证明文件: | caseType, isDlbz | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='撤回商标申请' && caseDetailFoemData.caseType==='撤回商标申请'&&caseDetailFoemData.isDlbz=='是' | 380 |
| 请求驰名商标保护: | chiming | !caseDetailFoemData.usAgency && ['异议', '无效宣告申请', '不予注册复审'].includes(caseDetailFoemData.caseType) | 389 |
| 仅涉及绝对理由: | caseType, absoluteReason | !caseDetailFoemData.usAgency && ['异议', '无效宣告申请', '不予注册复审'].includes(caseDetailFoemData.caseType) && ['无效宣告申请'].includes(caseDetailFoemData.caseType) | 392 |
| 申请书标注: | caseType, applicationMarks | !caseDetailFoemData.usAgency && !['国际注册驳回复审','注册驳回复审'].includes(caseDetailFoemData.caseType) | 397 |
| 之后是否交补充材料: | supplement | !caseDetailFoemData.usAgency && ['异议', '异议答辩', '无效宣告申请', '无效宣告答辩', '国际注册驳回复审', '注册驳回复审', '不予注册复审', '撤销商标复审', '无效宣告复审', '撤销复审答辩', '撤三答辩（提供使用证明）', '撤销三年停止使用申请'].includes(caseDetailFoemData.caseType) | 402 |
| 使用声明/证据类型: | evidenceTypeStr | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '提供使用声明/证据（境外）' | 407 |
| 是否提交使用声明/证据: | ifEvidenceStr | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '提供使用声明/证据（境外）' | 410 |
| 使用声明/证据说明: | statementOfEvidence | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '提供使用声明/证据（境外）' | 415 |
| 撤销理由: | reason | !caseDetailFoemData.usAgency && ['撤销三年停止使用申请'].includes(caseDetailFoemData.caseType) | 441 |
| 理由: | - | !caseDetailFoemData.usAgency && ['撤销三年停止使用申请'].includes(caseDetailFoemData.caseType) | 446 |
| 证据材料: | - | !caseDetailFoemData.usAgency && ['撤销三年停止使用申请'].includes(caseDetailFoemData.caseType) | 451 |
| 材料目录/证据目录: | - | !caseDetailFoemData.usAgency && ['撤销三年停止使用申请'].includes(caseDetailFoemData.caseType) | 458 |
| 相关说明文件: | - | !caseDetailFoemData.usAgency && ['撤销三年停止使用申请'].includes(caseDetailFoemData.caseType) | 463 |
| 转让/移转 | caseType, transfer | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '转让/移转' | 473 |
| 法律条款: | lawList | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '无效宣告申请' | 479 |
| 事实理由: | - | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '无效宣告申请' | 484 |
| 证据目录: | - | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '无效宣告申请' | 489 |
| 证据内容: | - | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '无效宣告申请' | 496 |
| 有关说明文件: | - | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '无效宣告申请' | 501 |
| 同意通讯地址延及本案后续程序: | empowerAddrCase | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '无效宣告申请' | 508 |
| 正副本是否一致: | justNegativeAgre | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '无效宣告申请' | 509 |
| 涉密证据材料: | - | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '无效宣告申请' && !caseDetailFoemData.justNegativeAgre | 512 |

## 商标信息

### 公共字段（不依赖 caseType）

| 字段名称 | 数据字段 | 显示条件 | 源码行 |
|---|---|---|---|
| 商标名称 | tmName | !caseDetailFoemData.usAgency | 696 |
| 商标英文 | tmNameEn | !caseDetailFoemData.usAgency | 699 |
| 商标图样 | - | !caseDetailFoemData.usAgency | 704 |
| 商标国际分类: | goodClasses | !caseDetailFoemData.usAgency | 876 |
| 动态标签: caseDetailFoemData.caseType=='商标注销'?'注销商品服务项目\n(商品/服务项目)':'商品/服务项目' | caseType, isRevamp, appFromto, trademarkCaseCategoryModifyList, caseId, appId, goods | !caseDetailFoemData.usAgency | 885 |
| 商品查对文件: | goods, caseId | !caseDetailFoemData.usAgency && ['内-外', '外-外'].includes(caseDetailFoemData.appFromto) | 922 |
| 种类 | tmType | !caseDetailFoemData.usAgency | 935 |
| 集体/证明商标使用管理规则: | memberRule | !caseDetailFoemData.usAgency && caseDetailFoemData.tmType=='2'\|\|caseDetailFoemData.tmType=='3' | 946 |
| 集体/证明商标使用管理规则(附件): | - | !caseDetailFoemData.usAgency && caseDetailFoemData.tmType=='2'\|\|caseDetailFoemData.tmType=='3' | 949 |
| 集体成员名单: | memberNamelist | !caseDetailFoemData.usAgency && caseDetailFoemData.tmType=='2' | 955 |
| 集体成员名单(附件): | - | !caseDetailFoemData.usAgency && caseDetailFoemData.tmType=='2' | 958 |
| 申请人是否具备检测能力: | isAppWithDetectAbility | !caseDetailFoemData.usAgency && caseDetailFoemData.tmType=='3' | 964 |
| 申请人检测资质证书（附件）: | - | !caseDetailFoemData.usAgency && caseDetailFoemData.tmType=='3'&&caseDetailFoemData.isAppWithDetectAbility=='是' | 970 |
| 申请人专业检测设备清单: | - | !caseDetailFoemData.usAgency && caseDetailFoemData.tmType=='3'&&caseDetailFoemData.isAppWithDetectAbility=='是' | 974 |
| 申请人专业技术人员名单（附件）: | - | !caseDetailFoemData.usAgency && caseDetailFoemData.tmType=='3'&&caseDetailFoemData.isAppWithDetectAbility=='是' | 980 |
| 申请人技术人员证书: | - | !caseDetailFoemData.usAgency && caseDetailFoemData.tmType=='3'&&caseDetailFoemData.isAppWithDetectAbility=='是' | 984 |

### 其他字段（依赖案件类型或类型派生条件）

| 字段名称 | 数据字段 | 显示条件 | 源码行 |
|---|---|---|---|
| 国际注册号: | gjRegNumber | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='马德里商标转国内注册' | 635 |
| 国际注册日期: | gjRegDate | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='马德里商标转国内注册' | 642 |
| 后期指定日期: | hqzdDate | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='马德里商标转国内注册' | 647 |
| 国际注销登记日期: | interLogoutDate | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='马德里商标转国内注册' | 654 |
| 国际注销通知书: | - | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='马德里商标转国内注册' | 659 |
| 商标号 | regNumber | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType=='出具优先权证明文件' | 667 |
| 原注册申请日期 | parentAppDate | !caseDetailFoemData.usAgency && [ '撤销三年停止使用申请', '异议', '异议答辩', '撤三答辩（提供使用证明）', '无效宣告复审', '撤销商标复审', '不予注册复审', '无效宣告申请', '参加不予注册复审', '撤销复审答辩', '无效宣告答辩'].includes(caseDetailFoemData.caseType) | 683 |
| 动态标签: caseDetailFoemData.caseType==='注册驳回复审' ? '原申请号/国际注册号:' : '原商标申请号/国际注册号:' | caseType, regNumber | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='国际注册驳回复审'\|\|caseDetailFoemData.caseType==='注册驳回复审' | 688 |
| 原注册申请日期 | caseType, parentAppDate | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='国际注册驳回复审'\|\|caseDetailFoemData.caseType==='注册驳回复审' && caseDetailFoemData.caseType==='注册驳回复审' | 691 |
| 商标设计说明 | caseType, tmDesignDeclare | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType!='变名变址' | 707 |
| 引证商标名称 | quoteTm | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='撤销复审答辩'\|\|caseDetailFoemData.caseType === '异议答辩' \|\| caseDetailFoemData.caseType==='无效宣告申请' \|\| caseDetailFoemData.caseType==='无效宣告答辩' | 714 |
| 引证商标类别 | quoteTmClass | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='撤销复审答辩'\|\|caseDetailFoemData.caseType === '异议答辩' \|\| caseDetailFoemData.caseType==='无效宣告申请' \|\| caseDetailFoemData.caseType==='无效宣告答辩' | 717 |
| 引证商标注册号 | quoteRegNumber | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='撤销复审答辩'\|\|caseDetailFoemData.caseType === '异议答辩' \|\| caseDetailFoemData.caseType==='无效宣告申请' \|\| caseDetailFoemData.caseType==='无效宣告答辩' | 720 |
| 引证商标注册号 | caseType, quoteRegNumber | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='撤销复审答辩'\|\|caseDetailFoemData.caseType === '异议答辩' \|\| caseDetailFoemData.caseType==='无效宣告答辩'\|\|caseDetailFoemData.caseType==='国际注册驳回复审'\|\|caseDetailFoemData.caseType==='注册驳回复审'\|\|caseDetailFoemData.caseType==='不予注册复审'\|\|caseDetailFoemData.caseType==='无效宣告复审'\|\|caseDetailFoemData.caseType==='撤销商标复审'\|\|caseDetailFoemData.caseType==='撤三答辩（提供使用证明）'\|\|caseDetailFoemData.caseType==='参加不予注册复审' && caseDetailFoemData.caseType!='参加不予注册复审' && caseDetailFoemData.caseType!='撤三答辩（提供使用证明)'&&caseDetailFoemData.caseType!='注册驳回复审'&&caseDetailFoemData.caseType!='国际注册驳回复审' | 728 |
| 申请号 | caseType, appNumber | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='撤销复审答辩'\|\|caseDetailFoemData.caseType === '异议答辩' \|\| caseDetailFoemData.caseType==='无效宣告答辩'\|\|caseDetailFoemData.caseType==='国际注册驳回复审'\|\|caseDetailFoemData.caseType==='注册驳回复审'\|\|caseDetailFoemData.caseType==='不予注册复审'\|\|caseDetailFoemData.caseType==='无效宣告复审'\|\|caseDetailFoemData.caseType==='撤销商标复审'\|\|caseDetailFoemData.caseType==='撤三答辩（提供使用证明）'\|\|caseDetailFoemData.caseType==='参加不予注册复审' && caseDetailFoemData.caseType!='参加不予注册复审' && !['撤三答辩（提供使用证明)','注册驳回复审','不予注册复审','无效宣告复审','撤销商标复审','无效宣告答辩','国际注册驳回复审'].includes(caseDetailFoemData.caseType) | 732 |
| 官方发文编号 | tmOfficeNumber | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='撤销复审答辩'\|\|caseDetailFoemData.caseType === '异议答辩' \|\| caseDetailFoemData.caseType==='无效宣告答辩'\|\|caseDetailFoemData.caseType==='国际注册驳回复审'\|\|caseDetailFoemData.caseType==='注册驳回复审'\|\|caseDetailFoemData.caseType==='不予注册复审'\|\|caseDetailFoemData.caseType==='无效宣告复审'\|\|caseDetailFoemData.caseType==='撤销商标复审'\|\|caseDetailFoemData.caseType==='撤三答辩（提供使用证明）'\|\|caseDetailFoemData.caseType==='参加不予注册复审' | 738 |
| 官文时限基准日期 | docDate | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='撤销复审答辩'\|\|caseDetailFoemData.caseType === '异议答辩' \|\| caseDetailFoemData.caseType==='无效宣告答辩'\|\|caseDetailFoemData.caseType==='国际注册驳回复审'\|\|caseDetailFoemData.caseType==='注册驳回复审'\|\|caseDetailFoemData.caseType==='不予注册复审'\|\|caseDetailFoemData.caseType==='无效宣告复审'\|\|caseDetailFoemData.caseType==='撤销商标复审'\|\|caseDetailFoemData.caseType==='撤三答辩（提供使用证明）'\|\|caseDetailFoemData.caseType==='参加不予注册复审' | 741 |
| 递交日期 | submitDate | !caseDetailFoemData.usAgency && (['答复临时驳回/审查意见（境外）', '提供使用声明/证据（境外）','马德里商标转国内注册','出具商标注册证明','不予注册复审','商标注册','分割申请','异议','变名变址','转让/移转','续展','删减商品项目','变更注册申请代理机构','更正商标申请事项','注册驳回复审','国际注册驳回复审','无效宣告复审','撤销商标复审','异议答辩','撤三答辩(提供使用证明)','撤销通用名称答辩','参与不予注册复审','无效宣告答辩','撤销复审答辩','撤销三年停止使用申请','撤销成为通用名称注册商标','无效宣告申请','撤回商标评审','行政复议','许可备案','补发商标注册证','补发商标变转续证明','商标注销','撤回商标申请'].includes(caseDetailFoemData.caseType)) | 749 |
| 申请日期 | appDate | !caseDetailFoemData.usAgency && (['答复临时驳回/审查意见（境外）', '提供使用声明/证据（境外）','马德里商标转国内注册','出具商标注册证明','不予注册复审','商标注册','分割申请','异议','变名变址','转让/移转','续展','删减商品项目','变更注册申请代理机构','更正商标申请事项','注册驳回复审','国际注册驳回复审','无效宣告复审','撤销商标复审','异议答辩','撤三答辩(提供使用证明)','撤销通用名称答辩','参与不予注册复审','无效宣告答辩','撤销复审答辩','撤销三年停止使用申请','撤销成为通用名称注册商标','无效宣告申请','撤回商标评审','行政复议','许可备案','补发商标注册证','补发商标变转续证明','商标注销','撤回商标申请'].includes(caseDetailFoemData.caseType)) | 752 |
| 申请号 | appNumber | !caseDetailFoemData.usAgency && (['答复临时驳回/审查意见（境外）', '提供使用声明/证据（境外）','马德里商标转国内注册','出具商标注册证明','不予注册复审','商标注册','分割申请','异议','变名变址','转让/移转','续展','删减商品项目','变更注册申请代理机构','更正商标申请事项','注册驳回复审','国际注册驳回复审','无效宣告复审','撤销商标复审','异议答辩','撤三答辩(提供使用证明)','撤销通用名称答辩','参与不予注册复审','无效宣告答辩','撤销复审答辩','撤销三年停止使用申请','撤销成为通用名称注册商标','无效宣告申请','撤回商标评审','行政复议','许可备案','补发商标注册证','补发商标变转续证明','商标注销','撤回商标申请'].includes(caseDetailFoemData.caseType)) | 755 |
| 初审公告号: | approvalNo | !caseDetailFoemData.usAgency && (caseDetailFoemData.caseType ==='马德里商标转国内注册' \|\| caseDetailFoemData.caseType ==='异议' \|\| caseDetailFoemData.caseType === '异议答辩'\|\| caseDetailFoemData.caseType === '分割申请'\|\| caseDetailFoemData.caseType === '不予注册复审'\|\| trademarkList.includes(caseDetailFoemData.caseType)) | 762 |
| 初审公告日期: | approvalDate | !caseDetailFoemData.usAgency && (caseDetailFoemData.caseType ==='马德里商标转国内注册' \|\| caseDetailFoemData.caseType ==='异议' \|\| caseDetailFoemData.caseType === '异议答辩'\|\| caseDetailFoemData.caseType === '分割申请'\|\| caseDetailFoemData.caseType === '不予注册复审'\|\| trademarkList.includes(caseDetailFoemData.caseType)) | 765 |
| 初审公告期号: | approvalNumber | !caseDetailFoemData.usAgency && (caseDetailFoemData.caseType ==='马德里商标转国内注册' \|\| caseDetailFoemData.caseType ==='异议' \|\| caseDetailFoemData.caseType === '异议答辩'\|\| caseDetailFoemData.caseType === '分割申请'\|\| caseDetailFoemData.caseType === '不予注册复审'\|\| trademarkList.includes(caseDetailFoemData.caseType)) | 768 |
| 原案申请号: | parentAppNumber | !caseDetailFoemData.usAgency && (caseDetailFoemData.caseType ==='马德里商标转国内注册' \|\| caseDetailFoemData.caseType ==='异议' \|\| caseDetailFoemData.caseType === '异议答辩'\|\| caseDetailFoemData.caseType === '分割申请'\|\| caseDetailFoemData.caseType === '不予注册复审'\|\| trademarkList.includes(caseDetailFoemData.caseType)) && ['分割申请'].includes(caseDetailFoemData.caseType) | 773 |
| 原案官方发文编号: | parentDocNumber | !caseDetailFoemData.usAgency && (caseDetailFoemData.caseType ==='马德里商标转国内注册' \|\| caseDetailFoemData.caseType ==='异议' \|\| caseDetailFoemData.caseType === '异议答辩'\|\| caseDetailFoemData.caseType === '分割申请'\|\| caseDetailFoemData.caseType === '不予注册复审'\|\| trademarkList.includes(caseDetailFoemData.caseType)) && ['分割申请'].includes(caseDetailFoemData.caseType) | 776 |
| 原案官方收文日期: | docDate | !caseDetailFoemData.usAgency && (caseDetailFoemData.caseType ==='马德里商标转国内注册' \|\| caseDetailFoemData.caseType ==='异议' \|\| caseDetailFoemData.caseType === '异议答辩'\|\| caseDetailFoemData.caseType === '分割申请'\|\| caseDetailFoemData.caseType === '不予注册复审'\|\| trademarkList.includes(caseDetailFoemData.caseType)) && ['分割申请'].includes(caseDetailFoemData.caseType) | 779 |
| 不予的案件类型: | reissueType | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType=='行政复议' | 786 |
| 不予发文编号: | tmOfficeNumber | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType=='行政复议' | 793 |
| 官文时限基准日期: | docDate | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType=='行政复议' | 798 |
| 商标申请/注册号 | changeType, regNumber | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType!='出具优先权证明文件' && caseDetailFoemData.caseType=='撤回商标申请'\|\|caseDetailFoemData.caseType=='撤回商标评审' && caseDetailFoemData.changeType === '转让/移转商标' | 811 |
| 动态标签: ['撤销三年不使用注册商标', '转让/移转商标'].includes(caseDetailFoemData.changeType)?'商标号':'原商标号' | changeType, regNumber | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType!='出具优先权证明文件' && caseDetailFoemData.caseType=='撤回商标申请'\|\|caseDetailFoemData.caseType=='撤回商标评审' && !(caseDetailFoemData.changeType === '转让/移转商标') | 814 |
| 原商标使用许可备案号 | parentDocNumber | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType!='出具优先权证明文件' && caseDetailFoemData.caseType!=='异议'&&caseDetailFoemData.caseType !== '异议答辩'&&![62,48].includes(caseDetailFoemData.caseTypeId) && caseDetailFoemData.caseType === '许可备案提前终止' | 822 |
| 提前终止日期 | earlyStopDate | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType!='出具优先权证明文件' && caseDetailFoemData.caseType!=='异议'&&caseDetailFoemData.caseType !== '异议答辩'&&![62,48].includes(caseDetailFoemData.caseTypeId) && caseDetailFoemData.caseType === '许可备案提前终止' | 827 |
| 提前终止理由 | reason | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType!='出具优先权证明文件' && caseDetailFoemData.caseType!=='异议'&&caseDetailFoemData.caseType !== '异议答辩'&&![62,48].includes(caseDetailFoemData.caseTypeId) && caseDetailFoemData.caseType === '许可备案提前终止' | 834 |
| 注册日期 | caseType, regDate | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType!='出具优先权证明文件' && caseDetailFoemData.caseType!=='异议'&&caseDetailFoemData.caseType !== '异议答辩'&&![62,48].includes(caseDetailFoemData.caseTypeId) && !['不予注册复审','异议答辩','注册驳回复审','国际注册驳回复审','出具优先权证明文件','撤回商标申请','撤回商标评审'].includes(caseDetailFoemData.caseType) && caseDetailFoemData.caseType !== '参加不予注册复审' | 841 |
| 初审公告号 | caseType, approvalNo | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType!='出具优先权证明文件' && caseDetailFoemData.caseType!=='异议'&&caseDetailFoemData.caseType !== '异议答辩'&&![62,48].includes(caseDetailFoemData.caseTypeId) && !['不予注册复审','异议答辩','注册驳回复审','国际注册驳回复审','出具优先权证明文件','撤回商标申请','撤回商标评审'].includes(caseDetailFoemData.caseType) && caseDetailFoemData.caseType === '参加不予注册复审' | 845 |
| 注册号 | regNumber | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType!='出具优先权证明文件' && caseDetailFoemData.caseType!=='异议'&&caseDetailFoemData.caseType !== '异议答辩'&&![62,48].includes(caseDetailFoemData.caseTypeId) && !['不予注册复审','异议答辩','注册驳回复审','国际注册驳回复审','出具优先权证明文件','撤回商标申请','撤回商标评审'].includes(caseDetailFoemData.caseType) && !(caseDetailFoemData.caseType === '参加不予注册复审') | 849 |
| 有效期起始日 | validStartDate | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType!='出具优先权证明文件' && caseDetailFoemData.caseType!=='异议'&&caseDetailFoemData.caseType !== '异议答辩'&&![62,48].includes(caseDetailFoemData.caseTypeId) && !['参加不予注册复审','不予注册复审','商标注销','异议答辩','注册驳回复审','国际注册驳回复审','出具优先权证明文件','撤回商标申请','撤回商标评审'].includes(caseDetailFoemData.caseType) | 855 |
| 有效期截止日 | validEndDate | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType!='出具优先权证明文件' && caseDetailFoemData.caseType!=='异议'&&caseDetailFoemData.caseType !== '异议答辩'&&![62,48].includes(caseDetailFoemData.caseTypeId) && !['参加不予注册复审','不予注册复审','商标注销','异议答辩','注册驳回复审','国际注册驳回复审','出具优先权证明文件','撤回商标申请','撤回商标评审'].includes(caseDetailFoemData.caseType) | 858 |
| 申请日 | appDate | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType == '出具优先权证明文件' | 865 |
| 递交日 | submitDate | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType == '出具优先权证明文件' | 868 |
| 申请号 | appNumber | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType == '出具优先权证明文件' | 871 |
| 原代理组织: | caseType, respondentAgency | !caseDetailFoemData.usAgency && tmlist.includes(caseDetailFoemData.caseType) | 879 |
| 是否三维标志 | caseType, ifSolidTm | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType!=='变更注册申请代理机构' | 940 |
| 是否颜色组合 | colorSign | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType!=='变更注册申请代理机构' | 990 |
| 指定颜色 | assignColor | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType!=='变更注册申请代理机构' | 994 |
| 声音标志 | tmVoice | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType!=='变更注册申请代理机构' | 1000 |
| 声音文件: | tmVoice | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType!=='变更注册申请代理机构' && caseDetailFoemData.tmVoice=='1' | 1004 |
| 变更类型 | changeType | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='变名变址' | 1011 |
| 变更前名称（中文） | preChangeCnName | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='变名变址' | 1019 |
| 变更前名称（英文） | preChangeEnName | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='变名变址' | 1022 |
| 变更证明文件是否为中文（网申） | appCertFileIsCn | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='变名变址' && caseDetailFoemData.changeType !=='变更地址' | 1041 |
| 变更证明文件（英文） | appCertFileIsCn | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='变名变址' && caseDetailFoemData.changeType !=='变更地址' && caseDetailFoemData.appCertFileIsCn==='否' | 1046 |
| 变更证明文件（中文） | - | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='变名变址' && caseDetailFoemData.changeType !=='变更地址' | 1051 |
| 变更前共同申请人: | joinApps, caseType | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='变名变址' && caseDetailFoemData.joinApps | 1060 |
| 序号 | - | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='变名变址' && caseDetailFoemData.joinApps | 1063 |
| 类型 | caseType | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='变名变址' && caseDetailFoemData.joinApps && caseDetailFoemData.caseType === '转让/移转' | 1064 |
| 中文名称 | - | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='变名变址' && caseDetailFoemData.joinApps | 1069 |
| 英文名称 | - | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='变名变址' && caseDetailFoemData.joinApps | 1075 |
| 证件名称 | - | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='变名变址' && caseDetailFoemData.joinApps | 1081 |
| 证件号 | - | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='变名变址' && caseDetailFoemData.joinApps | 1087 |
| 证明文件 | - | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='变名变址' && caseDetailFoemData.joinApps | 1093 |

## 客户信息

### 公共字段（不依赖 caseType）

| 字段名称 | 数据字段 | 显示条件 | 源码行 |
|---|---|---|---|
| 客户名称 | custName | caseDetailFoemData.usAgency | 53 |
| 客户文号 | custRefno | caseDetailFoemData.usAgency | 59 |
| 客户联系人 | custContactName | caseDetailFoemData.usAgency | 64 |
| 信函地址 | letterAddrName | caseDetailFoemData.usAgency | 67 |
| 账单联系人 | billCustContactName | caseDetailFoemData.usAgency | 72 |
| 账单地址 | billAddrName | caseDetailFoemData.usAgency | 75 |
| 抄送人 | trademarkCaseCustContacts | caseDetailFoemData.usAgency | 80 |
| 折扣率 | discount | caseDetailFoemData.usAgency | 83 |
| 客户名称 | custName | !caseDetailFoemData.usAgency | 1111 |
| 客户文号 | custRefno | !caseDetailFoemData.usAgency | 1117 |
| 客户联系人 | custContactName | !caseDetailFoemData.usAgency | 1122 |
| 信函地址 | letterAddrName | !caseDetailFoemData.usAgency | 1125 |
| 账单联系人 | billCustContactName | !caseDetailFoemData.usAgency | 1130 |
| 账单地址 | billAddrName | !caseDetailFoemData.usAgency | 1133 |
| 抄送人 | trademarkCaseCustContacts | !caseDetailFoemData.usAgency | 1138 |
| 折扣率 | discount | !caseDetailFoemData.usAgency | 1141 |

### 其他字段（依赖案件类型或类型派生条件）

_无_

## 申请人信息

- 分区标题按 `caseType` 动态变化：
- `caseType !== '转让/移转' && caseType != '许可备案'` 时显示 `申请人信息`。
- `caseType === '转让/移转'` 时显示 `申请人(受让人)信息`。
- `caseType === '许可备案'` 时显示 `申请人(许可人)信息`。

### 公共字段（不依赖 caseType）

| 字段名称 | 数据字段 | 显示条件 | 源码行 |
|---|---|---|---|
| 申请人中文名称 | appCnName | !caseDetailFoemData.usAgency | 1164 |
| 主体法律性质 | legalNature | !caseDetailFoemData.usAgency | 1175 |
| 申请人英文名称 | appEnName | !caseDetailFoemData.usAgency | 1194 |
| 国籍 | appGJdq | !caseDetailFoemData.usAgency | 1197 |
| 身份证明文件名称 | appCertificate | !caseDetailFoemData.usAgency | 1207 |
| 统一社会信用代码 | appGJdq, legalNature, certCode | !caseDetailFoemData.usAgency && caseDetailFoemData.appGJdq == '中国'&&caseDetailFoemData.legalNature!='自然人' | 1210 |
| 身份证明文件号码 | appCertificateNum | !caseDetailFoemData.usAgency && !(caseDetailFoemData.appGJdq == '中国'&&caseDetailFoemData.legalNature!='自然人') | 1213 |
| 申请人地址 | appRegionalism | !caseDetailFoemData.usAgency | 1218 |
| 申请人详细地址 | appCnAddr | !caseDetailFoemData.usAgency | 1223 |
| 国家或地区： | appGJdq, appCountryOrRegion | !caseDetailFoemData.usAgency && v-show(caseDetailFoemData.appGJdq!="中国") | 1226 |
| 申请人英文地址 | appEnAddr | !caseDetailFoemData.usAgency | 1231 |
| 委托书 | - | !caseDetailFoemData.usAgency | 1261 |
| 主体资格证明文件类型: | subjectCertType | !caseDetailFoemData.usAgency && caseDetailFoemData.appGJdq == '中国'&&caseDetailFoemData.legalNature == '自然人' | 1292 |
| 统一社会信用代码: | certCode | !caseDetailFoemData.usAgency && caseDetailFoemData.appGJdq == '中国'&&caseDetailFoemData.legalNature == '自然人' | 1295 |
| 邮箱 | appContactEmail | !caseDetailFoemData.usAgency | 1350 |
| 邮政编码 | appContactZip | !caseDetailFoemData.usAgency | 1353 |
| 联系人 | appContactPerson | !caseDetailFoemData.usAgency | 1358 |
| 电话 | appContactTel | !caseDetailFoemData.usAgency | 1361 |
| 共同申请 | ifShareTm | !caseDetailFoemData.usAgency | 1384 |
| 动态标签: caseDetailFoemData.caseType=='变名变址'?'变更后共同申请人':'共同申请人' | caseType, joinApps | !caseDetailFoemData.usAgency && caseDetailFoemData.joinApps | 1390 |
| 序号 | - | !caseDetailFoemData.usAgency && caseDetailFoemData.joinApps | 1393 |
| 中文名称 | - | !caseDetailFoemData.usAgency && caseDetailFoemData.joinApps | 1399 |
| 英文名称 | - | !caseDetailFoemData.usAgency && caseDetailFoemData.joinApps | 1405 |
| 证件名称 | - | !caseDetailFoemData.usAgency && caseDetailFoemData.joinApps | 1411 |
| 证件号 | - | !caseDetailFoemData.usAgency && caseDetailFoemData.joinApps | 1417 |
| 证明文件 | - | !caseDetailFoemData.usAgency && caseDetailFoemData.joinApps | 1423 |

### 其他字段（依赖案件类型或类型派生条件）

| 字段名称 | 数据字段 | 显示条件 | 源码行 |
|---|---|---|---|
| 是否变更名义 | isChangeName | !caseDetailFoemData.usAgency && ['国际注册驳回复审','注册驳回复审'].includes(caseDetailFoemData.caseType) | 1169 |
| 动态标签: preChangeAppCnNameMap[caseDetailFoemData.isChangeName] | isChangeName, preChangeAppCnName | !caseDetailFoemData.usAgency && ['国际注册驳回复审','注册驳回复审'].includes(caseDetailFoemData.caseType) && caseDetailFoemData.isChangeName && caseDetailFoemData.submitType==='网上申请' && [1,2,3].includes(caseDetailFoemData.isChangeName) | 1182 |
| 动态标签: caseDetailFoemData.isChangeName == 1 ? '名义变更证明:' : caseDetailFoemData.isChangeName == 2 ? '变更代表人申请:' : '相关材料:' | isChangeName | !caseDetailFoemData.usAgency && ['国际注册驳回复审','注册驳回复审'].includes(caseDetailFoemData.caseType) && caseDetailFoemData.isChangeName && caseDetailFoemData.submitType==='网上申请' | 1185 |
| 国内申请人联系地址: | appContactAddr | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='变名变址' | 1237 |
| 国内申请人联系邮编: | appContactPostCode | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='变名变址' | 1242 |
| 经营范围是否包括知识产权代理 | isIpAgent | !caseDetailFoemData.usAgency && (caseDetailFoemData.caseType === '答复临时驳回/审查意见（境外）' \|\| caseDetailFoemData.caseType === '商标注册' \|\| caseDetailFoemData.caseType === '提供使用声明/证据（境外）') && caseDetailFoemData.appFromto == '内-内' | 1249 |
| 代理人姓名 | agentPerson | !caseDetailFoemData.usAgency && (['答复临时驳回/审查意见（境外）', '提供使用声明/证据（境外）','不予注册复审','商标注册','分割申请','异议','变名变址','转让/移转','续展','删减商品项目','变更注册申请代理机构','更正商标申请事项','注册驳回复审','国际注册驳回复审','无效宣告复审','撤销商标复审','异议答辩','撤三答辩(提供使用证明)','撤销通用名称答辩','参与不予注册复审','无效宣告答辩','撤销复审答辩','撤销三年停止使用申请','撤销成为通用名称注册商标','无效宣告申请','撤回商标评审','行政复议','许可备案','补发商标注册证','补发商标变转续证明','出具优先权证明文件','出具商标注册证明','商标注销','撤回商标申请'].includes(caseDetailFoemData.caseType)) | 1255 |
| 主体/身份证明文件是否为中文 | caseType, appCertFileIsCn | !caseDetailFoemData.usAgency && trademarkList.includes(caseDetailFoemData.caseType) | 1268 |
| 申请人上传文件的语言类型: | caseType, uploadFileLanguage | !caseDetailFoemData.usAgency && !trademarkList.includes(caseDetailFoemData.caseType)&&(caseDetailFoemData.caseType==='无效宣告申请' \|\| caseDetailFoemData.caseType!=='无效宣告申请') | 1271 |
| 身份证明文件(中文): | legalNature | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType !== '许可备案' && caseDetailFoemData.legalNature == '自然人' | 1276 |
| 身份证明原文件(外文): | appCertFileIsCn, uploadFileLanguage, legalNature | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType !== '许可备案' && (caseDetailFoemData.appCertFileIsCn=='否'\|\|caseDetailFoemData.uploadFileLanguage==='外文')&&caseDetailFoemData.legalNature == '自然人' | 1281 |
| 申请人（许可人）主体资格证明（中文） | - | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='许可备案' && isShowSubjectFile | 1301 |
| 申请人（许可人）主体资格证明（英文） | - | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='许可备案' && isShowForeignFileUpload && isShowSubjectFile | 1308 |
| 申请人（许可人）身份证明文件(中文) | - | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='许可备案' | 1317 |
| 申请人（许可人）身份证明原文件(外文) | - | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='许可备案' && caseDetailFoemData.uploadFileLanguage=='外文' | 1324 |
| 主体资格证明文件（中文） | - | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType!=='许可备案' && isShowSubjectFile | 1335 |
| 主体资格证明文件（英文） | - | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType!=='许可备案' && isShowForeignFileUpload && isShowSubjectFile | 1341 |
| 自然人死亡/企业或其他组织注销证明 | - | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '转让/移转' | 1367 |
| 同意转让声明或商标转移证明 | - | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '转让/移转' | 1372 |
| 有关说明文件 | caseType | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType !== '异议' | 1380 |
| 类型 | caseType | !caseDetailFoemData.usAgency && caseDetailFoemData.joinApps && caseDetailFoemData.caseType === '转让/移转' | 1394 |
| 要求优先权: | priorityType | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '答复临时驳回/审查意见（境外）' \|\| caseDetailFoemData.caseType=='商标注册'\|\|caseDetailFoemData.caseType=='分割申请' \|\| caseDetailFoemData.caseType=='提供使用声明/证据（境外）' | 1440 |
| 要求优先权声明: | priorityType | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '答复临时驳回/审查意见（境外）' \|\| caseDetailFoemData.caseType=='商标注册'\|\|caseDetailFoemData.caseType=='分割申请' \|\| caseDetailFoemData.caseType=='提供使用声明/证据（境外）' && caseDetailFoemData.priorityType=='1' | 1444 |
| 优先权国家: | priorityBaseCrty | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '答复临时驳回/审查意见（境外）' \|\| caseDetailFoemData.caseType=='商标注册'\|\|caseDetailFoemData.caseType=='分割申请' \|\| caseDetailFoemData.caseType=='提供使用声明/证据（境外）' && caseDetailFoemData.priorityType=='1' | 1450 |
| 优先权日期: | priorityAppDate | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '答复临时驳回/审查意见（境外）' \|\| caseDetailFoemData.caseType=='商标注册'\|\|caseDetailFoemData.caseType=='分割申请' \|\| caseDetailFoemData.caseType=='提供使用声明/证据（境外）' && caseDetailFoemData.priorityType=='1' | 1453 |
| 优先权文件后补: | isLoadPriorityFile | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '答复临时驳回/审查意见（境外）' \|\| caseDetailFoemData.caseType=='商标注册'\|\|caseDetailFoemData.caseType=='分割申请' \|\| caseDetailFoemData.caseType=='提供使用声明/证据（境外）' && caseDetailFoemData.priorityType=='1' | 1458 |
| 优先权证明文件: | - | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '答复临时驳回/审查意见（境外）' \|\| caseDetailFoemData.caseType=='商标注册'\|\|caseDetailFoemData.caseType=='分割申请' \|\| caseDetailFoemData.caseType=='提供使用声明/证据（境外）' && caseDetailFoemData.priorityType=='1' | 1462 |
| 优先权申请号: | priorityAppNum | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '答复临时驳回/审查意见（境外）' \|\| caseDetailFoemData.caseType=='商标注册'\|\|caseDetailFoemData.caseType=='分割申请' \|\| caseDetailFoemData.caseType=='提供使用声明/证据（境外）' && caseDetailFoemData.priorityType=='1' | 1468 |
| 更正事项: | correction | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='更正商标申请事项' && caseDetailFoemData.submitType=='线下申请' | 1494 |
| 延迟续展 | delayRenewal | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType==='续展' | 1588 |

## 转让人信息

### 公共字段（不依赖 caseType）

_无_

### 其他字段（依赖案件类型或类型派生条件）

| 字段名称 | 数据字段 | 显示条件 | 源码行 |
|---|---|---|---|
| 转让人中文名称 | transferorCnName | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '转让/移转' | 1744 |
| 转让人英文名称 | transferorEnName | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '转让/移转' | 1747 |
| 转让人主体法律性质（类型） | transferorType | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '转让/移转' | 1752 |
| 转让人国籍 | transferorNationality | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '转让/移转' | 1755 |
| 转让人身份证明文件名称: | transferorCertificateName | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '转让/移转' | 1760 |
| 转让人统一社会信用代码: | transferorNationality, transferorType, zrCertCode | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '转让/移转' && caseDetailFoemData.transferorNationality == '中国'&&caseDetailFoemData.transferorType!='自然人' | 1763 |
| 转让人身份证明文件号码: | transferorCertificateNumber | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '转让/移转' && !(caseDetailFoemData.transferorNationality == '中国'&&caseDetailFoemData.transferorType!='自然人') | 1766 |
| 转让人国家或地区: | transferorCountryAndregion | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '转让/移转' | 1771 |
| 转让人中文地址: | transferorCnAdress | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '转让/移转' | 1776 |
| 转让人英文地址: | transferorEnAdress | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '转让/移转' | 1779 |
| 转让人地址省市区: | provinceOrCity | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '转让/移转' && caseDetailFoemData.transferorNationality=='中国' | 1784 |
| 主体资格证明文件类型: | transferorSubjectCertType | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '转让/移转' && caseDetailFoemData.transferorNationality == '中国'&&caseDetailFoemData.transferorType == '自然人' | 1789 |
| 统一社会信用代码: | zrCertCode | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '转让/移转' && caseDetailFoemData.transferorNationality == '中国'&&caseDetailFoemData.transferorType == '自然人' | 1792 |
| 转让人邮政编码: | licenseePostCode | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '转让/移转' | 1797 |
| 转让人上传文件的语言类型 | transferorUploadFileLanguage | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '转让/移转' | 1802 |
| 转让人委托书 | - | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '转让/移转' | 1807 |
| 转/受让人同意撤回的声明文件 | - | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '转让/移转' && caseDetailFoemData.changeType==='转让' | 1814 |
| 转让人主体资格证明（中文） | - | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '转让/移转' && transferorSubjectFile | 1821 |
| 转让人主体资格证明文件（英文） | - | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '转让/移转' && caseDetailFoemData.transferorUploadFileLanguage=='外文'&&transferorSubjectFile | 1829 |
| 转让人身份证明文件(中文) | - | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '转让/移转' | 1839 |
| 转让人身份证明原文件(外文) | - | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '转让/移转' && caseDetailFoemData.transferorUploadFileLanguage=='外文' | 1845 |

## 被申请人信息

- 该分区实际标题与字段标签由 `getCaseType()` 改写的 `yyTextShowxk` 决定，随 `caseType` 变化。
- `异议答辩`：标题/标签切换到 `异议人信息`。
- `撤三答辩（提供使用证明）`、`撤销通用名称答辩`：切换到 `被申请人(撤销人)信息`。
- `撤销三年停止使用申请`：切换到 `被申请人(注册人)信息`。
- `参加不予注册复审`：切换到 `被申请人(不予注册复审申请人)信息`。
- `无效宣告申请`、`无效宣告答辩`、`不予注册复审`、`撤销商标复审`、`无效宣告复审`、`撤销复审答辩`：切换到 `被申请人信息`。

### 公共字段（不依赖 caseType）

_无_

### 其他字段（依赖案件类型或类型派生条件）

| 字段名称 | 数据字段 | 显示条件 | 源码行 |
|---|---|---|---|
| 异议人列表 | opponents, tmCaseId | !caseDetailFoemData.usAgency && showType\|\|[ '不予注册复审', '无效宣告复审','撤销商标复审','撤销复审答辩', '撤三答辩（提供使用证明）', '撤销通用名称答辩', '撤销三年停止使用申请','参加不予注册复审'].includes(caseDetailFoemData.caseType) && caseDetailFoemData.caseType==='异议答辩' | 2001 |
| 动态标签: yyTextShowxk.cnname | respondentNameCn | !caseDetailFoemData.usAgency && showType\|\|[ '不予注册复审', '无效宣告复审','撤销商标复审','撤销复审答辩', '撤三答辩（提供使用证明）', '撤销通用名称答辩', '撤销三年停止使用申请','参加不予注册复审'].includes(caseDetailFoemData.caseType) && !(caseDetailFoemData.caseType==='异议答辩') | 2006 |
| 动态标签: yyTextShowxk.enname | respondentNameEn | !caseDetailFoemData.usAgency && showType\|\|[ '不予注册复审', '无效宣告复审','撤销商标复审','撤销复审答辩', '撤三答辩（提供使用证明）', '撤销通用名称答辩', '撤销三年停止使用申请','参加不予注册复审'].includes(caseDetailFoemData.caseType) && !(caseDetailFoemData.caseType==='异议答辩') | 2009 |
| 动态标签: yyTextShowxk.cnaddr | respondentAddrCn | !caseDetailFoemData.usAgency && showType\|\|[ '不予注册复审', '无效宣告复审','撤销商标复审','撤销复审答辩', '撤三答辩（提供使用证明）', '撤销通用名称答辩', '撤销三年停止使用申请','参加不予注册复审'].includes(caseDetailFoemData.caseType) && yyTextShowxk.cnaddr | 2014 |
| 动态标签: yyTextShowxk.enaddr | respondentAddrEn | !caseDetailFoemData.usAgency && showType\|\|[ '不予注册复审', '无效宣告复审','撤销商标复审','撤销复审答辩', '撤三答辩（提供使用证明）', '撤销通用名称答辩', '撤销三年停止使用申请','参加不予注册复审'].includes(caseDetailFoemData.caseType) && yyTextShowxk.cnaddr | 2017 |
| 动态标签: yyTextShowxk.dlzz | respondentAgency | !caseDetailFoemData.usAgency && showType\|\|[ '不予注册复审', '无效宣告复审','撤销商标复审','撤销复审答辩', '撤三答辩（提供使用证明）', '撤销通用名称答辩', '撤销三年停止使用申请','参加不予注册复审'].includes(caseDetailFoemData.caseType) && yyTextShowxk.dlzz | 2022 |

## 境外信息

### 公共字段（不依赖 caseType）

| 字段名称 | 数据字段 | 显示条件 | 源码行 |
|---|---|---|---|
| 注册方式 | madrid | ['内-外','外-外'].includes(caseDetailFoemData.appFromto) | 2088 |
| 注册国家 | appState | ['内-外','外-外'].includes(caseDetailFoemData.appFromto) | 2091 |
| 外方代理所 | agencyCustName | ['内-外','外-外'].includes(caseDetailFoemData.appFromto) | 2096 |
| 外方代理所联系人 | agencyCustContactName | ['内-外','外-外'].includes(caseDetailFoemData.appFromto) | 2099 |
| 外方代理所文号 | agencyCustRefno | ['内-外','外-外'].includes(caseDetailFoemData.appFromto) | 2104 |
| 外方代理所地址 | agencyCustAddrName | ['内-外','外-外'].includes(caseDetailFoemData.appFromto) | 2107 |
| 第一次使用日期: | firstUseDate | ['内-外','外-外'].includes(caseDetailFoemData.appFromto) && v-show(['内-外', '外-外'].includes(caseDetailFoemData.appFromto) && caseDetailFoemData.appState == '美国') | 2113 |
| 商业使用日期: | businessUseDate | ['内-外','外-外'].includes(caseDetailFoemData.appFromto) && v-show(['内-外', '外-外'].includes(caseDetailFoemData.appFromto) && caseDetailFoemData.appState == '美国') | 2118 |
| 指定国注册号: | zdRegNumber | ['内-外','外-外'].includes(caseDetailFoemData.appFromto) && v-show(['内-外', '外-外'].includes(caseDetailFoemData.appFromto) && caseDetailFoemData.madrid) | 2126 |
| 指定国注册日: | zdRegDate | ['内-外','外-外'].includes(caseDetailFoemData.appFromto) && v-show(['内-外', '外-外'].includes(caseDetailFoemData.appFromto) && caseDetailFoemData.madrid) | 2131 |
| 指定国申请号: | zdAppNumber | ['内-外','外-外'].includes(caseDetailFoemData.appFromto) && v-show(['内-外', '外-外'].includes(caseDetailFoemData.appFromto) && caseDetailFoemData.madrid) | 2138 |
| 指定国申请日: | zdAppDate | ['内-外','外-外'].includes(caseDetailFoemData.appFromto) && v-show(['内-外', '外-外'].includes(caseDetailFoemData.appFromto) && caseDetailFoemData.madrid) | 2143 |
| 外方代理所要求 | agencyCustReq | ['内-外','外-外'].includes(caseDetailFoemData.appFromto) | 2150 |
| 时限内容 | timeLimitContent | ['内-外','外-外'].includes(caseDetailFoemData.appFromto) | 2153 |
| 时限日期 | limitDate | ['内-外','外-外'].includes(caseDetailFoemData.appFromto) | 2158 |
| 外代所报价: | agencyOffers | ['内-外','外-外'].includes(caseDetailFoemData.appFromto) | 2164 |

### 其他字段（依赖案件类型或类型派生条件）

_无_

## 基础注册信息

### 公共字段（不依赖 caseType）

_无_

### 其他字段（依赖案件类型或类型派生条件）

| 字段名称 | 数据字段 | 显示条件 | 源码行 |
|---|---|---|---|
| 序号 | - | (caseDetailFoemData.appFromto=='内-外'\|\|caseDetailFoemData.appFromto=='外-外')&&caseDetailFoemData.madrid==true&&caseDetailFoemData.caseType !== '出具优先权证明文件' | 2185 |
| 基础注册/申请号 | regNumber | (caseDetailFoemData.appFromto=='内-外'\|\|caseDetailFoemData.appFromto=='外-外')&&caseDetailFoemData.madrid==true&&caseDetailFoemData.caseType !== '出具优先权证明文件' | 2186 |
| 基础注册/申请日 | regDate | (caseDetailFoemData.appFromto=='内-外'\|\|caseDetailFoemData.appFromto=='外-外')&&caseDetailFoemData.madrid==true&&caseDetailFoemData.caseType !== '出具优先权证明文件' | 2187 |

## ?????

### ???????? caseType?

_?_

### ???????????????????

| ???? | ???? | ???? | ??? |
|---|---|---|---|
| ??????? | transferorCnName | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '??/??' | 1744 |
| ??????? | transferorEnName | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '??/??' | 1747 |
| ????????????? | transferorType | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '??/??' | 1752 |
| ????? | transferorNationality | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '??/??' | 1755 |
| ???????????: | transferorCertificateName | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '??/??' | 1760 |
| ???????????: | transferorNationality, transferorType, zrCertCode | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '??/??' && caseDetailFoemData.transferorNationality == '??'&&caseDetailFoemData.transferorType!='???' | 1763 |
| ???????????: | transferorCertificateNumber | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '??/??' && !(caseDetailFoemData.transferorNationality == '??'&&caseDetailFoemData.transferorType!='???') | 1766 |
| ????????: | transferorCountryAndregion | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '??/??' | 1771 |
| ???????: | transferorCnAdress | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '??/??' | 1776 |
| ???????: | transferorEnAdress | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '??/??' | 1779 |
| ????????: | provinceOrCity | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '??/??' && caseDetailFoemData.transferorNationality=='??' | 1784 |
| ??????????: | transferorSubjectCertType | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '??/??' && caseDetailFoemData.transferorNationality == '??'&&caseDetailFoemData.transferorType == '???' | 1789 |
| ????????: | zrCertCode | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '??/??' && caseDetailFoemData.transferorNationality == '??'&&caseDetailFoemData.transferorType == '???' | 1792 |
| ???????: | licenseePostCode | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '??/??' | 1797 |
| ???????????? | transferorUploadFileLanguage | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '??/??' | 1802 |
| ?????? | - | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '??/??' | 1807 |
| ?/???????????? | - | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '??/??' && caseDetailFoemData.changeType==='??' | 1814 |
| ????????????? | - | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '??/??' && transferorSubjectFile | 1821 |
| ??????????????? | - | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '??/??' && caseDetailFoemData.transferorUploadFileLanguage=='??'&&transferorSubjectFile | 1829 |
| ?????????(??) | - | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '??/??' | 1839 |
| ??????????(??) | - | !caseDetailFoemData.usAgency && caseDetailFoemData.caseType === '??/??' && caseDetailFoemData.transferorUploadFileLanguage=='??' | 1845 |

