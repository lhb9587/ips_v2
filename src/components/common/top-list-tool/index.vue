<template>
  <div class="tool">
    <div style="margin-left: 10px; display: flex; gap: 10px">
      <el-dropdown
        ref="dropdown1"
        trigger="click"
        :hide-on-click="false"
        @visible-change="fn"
        :teleported="false"
        placement="bottom"
      >
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              style="color: #333;gap: 6px"
              @click="toggleFullScreen"
            >
              <i class="mdi mdi-arrow-expand-all"></i>{{
                isFullScreen
                  ? $trans("common.exitFullScreen")
                  : $trans("common.fullScreen")
              }}
            </el-dropdown-item>
            <el-dropdown-item
              divided
              style="color: #333;gap: 6px"
              @click="showsDialog('col')"
            >
              <i class="mdi mdi-cog"></i>{{
                $trans("common.columnSetting")
              }}
            </el-dropdown-item>
            <el-dropdown-item divided>
              {{ $trans("common.border") }}&nbsp;
              <el-switch
                v-model="borderChecked"
                @change="toggleBorder"
                style="height: 22px"
              ></el-switch>
            </el-dropdown-item>
            <el-dropdown-item divided>
              {{ $trans("common.zebraCrossing") }}&nbsp;<el-switch
                v-model="rowChecked"
                @change="changeRowStyle"
                style="height: 22px"
              ></el-switch>
            </el-dropdown-item>
            <el-dropdown-item
              divided
              style="color: #333;gap: 6px"
              @click="increaseRowHeight"
            >
              <i class="mdi mdi-arrow-expand-vertical"></i>{{
                $trans("common.density")
              }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
        <div class="right-config">
          <el-tooltip content="设置" placement="top" >
            <div class="mdi mdi-tune-variant right-config-icon" style="font-size: 18px;cursor: pointer;" @click="showClick"></div>
          </el-tooltip>
        </div>
      </el-dropdown>
      <div
        @click="showsDialog('download')"
        v-if="$props.showExport"
        style="
          display: flex;
          align-items: center;
          color: #4a8ddc;
          cursor: pointer;
        "
      >
        <!-- <img src="@/icons/svg/download.svg" style="width:18px;"> -->
        &nbsp;
        {{ $trans("common.dataExport") }}
      </div>
    </div>
    <el-dialog
      v-model="columnSettingsVisible"
      :title="
        isdownload ? $trans('common.exportField') : $trans('common.tableHeader')
      "
      :width="800"
      :height="520"
    >
      <!-- 弹出框内容 -->
      <div style="display: flex; justify-content: space-between">
        <div class="dialog-left">
          <div>
            {{ $trans("common.optionalField")
            }}<span style="color: #c6c8ca; font-size: 12px"
              >({{ $trans("common.total") }}{{ checkboxOptions.length
              }}{{ $trans("common.number") }})</span
            >
          </div>
          <div class="container">
            <!-- 搜索框 -->
            <el-input
              v-model="diminputleft"
              style="width: 100%"
              :placeholder="$trans('common.defaultPlaceholder')"
              :prefix-icon="Search"
            />
            <!-- 全选框 -->
            <div class="checkbox-container">
              <el-checkbox
                v-model="allCheckedLeft"
                @change="handleAllCheckedChangeLeft"
                >{{ $trans("common.allSelected") }}
              </el-checkbox>
              <el-checkbox-group
                style="width: 100%; overflow: auto; height: 320px"
                v-model="checkedItemsLeft"
              >
                <template
                  v-for="(item, index) in checkboxOptions"
                  :key="index"
                >
                  <el-checkbox
                    v-if="isLeftShow(item.COLUMN_NAME)"
                    :value="item.COLUMN_NAME"
                    size="large"
                    >{{ item.COLUMN_COMMENT }}
                  </el-checkbox>
                </template>
              </el-checkbox-group>
            </div>
          </div>
        </div>
        <div class="dialog-right">
          <div>
            {{ $trans("common.selectedFields")
            }}<span style="color: #c6c8ca; font-size: 12px"
              >({{ $trans("common.total") }}{{ checkedItemsLeft.length
              }}{{ $trans("common.number") }})</span
            >
          </div>
          <div class="containerright">
            <!-- 搜索框 -->
            <el-input
              v-model="diminputright"
              style="width: 100%"
              :placeholder="$trans('common.defaultPlaceholder')"
              :prefix-icon="Search"
            />
            <div
              style="
                overflow: auto;
                height: 340px;
                margin-top: 10px;
                padding-right: 10px;
                user-select: none; /* 防止拖拽时选中文字 */
              "
            >
              <draggable
                v-model="checkedItemsLeft"
                animation="300"
                chosenClass="chosenClass"
                @change="onMoveCallback"
                forceFallback="true"
                handle=".move"
                item-key="COLUMN_COMMENT"
              >
                <template #item="{ element }">
                  <div
                    v-if="isRightShow(element)"
                    class="selected-item move"
                    style="
                      height: 28px;
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      cursor: move;
                    "
                  >
                    <div
                      style="
                        display: flex;
                        align-items: center;
                        padding-right: 6px;
                      "
                    >
                      <!-- <img
                          src="@/assets/image/home/drag.png"
                          style="height: 17px; width: 25px"
                          alt="拖拽"
                        /> -->
                        <i class="mdi mdi-drag" style="font-size: 24px;"></i>
                      <span>{{
                        checkboxOptions.find((c) => c.COLUMN_NAME == element)
                          ?.COLUMN_COMMENT
                      }}</span>
                    </div>
                    <div style="display: flex; align-items: center">
                      <img
                        v-if="getIndex(element) !== 0"
                        src="@/assets/images/home/toTop.png"
                        style="height: 17px; width: 26px; cursor: pointer"
                        @click="clickToTop(element)"
                        alt="置顶"
                      />
                      <img
                        src="@/assets/images/home/close.png"
                        alt="关闭"
                        style="height: 15px; width: 15px; cursor: pointer"
                        @click="removeItem(element)"
                      />
                    </div>
                  </div>
                </template>
              </draggable>
            </div>
          </div>
        </div>
      </div>

      <!-- 弹出框底部按钮 -->
      <template #footer>
        <div
          class="dialog-footer"
          style="display: flex; justify-content: space-between"
        >
          <div>
            <el-button @click="resetToDefault">{{
              $trans("common.restoreDefault")
            }}</el-button>
          </div>
          <div>
            <el-button @click="cancelColumnSettings">{{
              $trans("common.cancel")
            }}</el-button>
            <el-button
              type="primary"
              @click="downloadExcel"
              v-if="isdownload"
              >{{ $trans("common.export") }}</el-button
            >
            <el-button
              type="primary"
              @click="saveColumnSettings"
              v-else
              >{{ $trans("common.save") }}</el-button
            >
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {  onBeforeMount,onMounted,onUnmounted, ref,computed, watch,defineProps,defineEmits } from 'vue'
import { Search } from '@element-plus/icons-vue'
import draggable from 'vuedraggable'
// import { ElMessage } from "element-plus";
import { getUserInfo } from '@/utils/user'
import {
  delPreference,
  queryPreference,
  savePreference,
  selectColumn,
} from '@/api/caseList'
import { getTableConfig } from '@/utils/user'
// import { exportList } from '@/api/caseList'
// import { useUserStore } from '@/store/modules/user'
// import { useSettingStore } from '@/store/modules/setting'
// import { downLoadAll,cleanNullAttr } from '@/utils'

const props = defineProps({
  bussId: {
    type: Number,
  },
  queryList:{
    type: Object,
    default: () => {},
  },
  showExport:{
    type: Boolean,
    default: false
  },
  isFull:{
    type: Boolean,
    default: false
  },
  gridName:{
    type: String,
    default: ''
  }
})
const userId = getUserInfo()?.userId
const emits = defineEmits([
  'changeRowHeight',
  'changeBorder',
  'changeRowStyle',
  'changeScreenSize',
  'setColumn',
  'changeisFull'
])

const iszebra = () => {
  const config = getTableConfig() || []
  let zebra
  if (config.length > 0) {
    const index = config.findIndex(item=>item.name == props.gridName)
    if (index > -1) {
      zebra =  config[index].iszebra
    }else{
      zebra =  false
    }
  }
  return zebra
}
const isheightlarge = () => {
  const config = getTableConfig() || []
  let islarge = true
  if (config.length > 0) {
    const index = config.findIndex(item=>item.name == props.gridName)
    if (index > -1) {
      islarge =  config[index].rowHeight == 40
    }else{
      islarge =  true
    }
  }
  return islarge
}
const isBorderline = () => {
  const config = getTableConfig() || []
  let borderline
  if (config.length > 0) {
    const index = config.findIndex(item=>item.name == props.gridName)
    if (index > -1) {
      borderline =  config[index].isBorderline
    }else{
      borderline =  false
    }
  }
  return borderline
}
const borderChecked = ref(isBorderline()) // 边框
const rowChecked = ref(iszebra()) // 斑马线
// const isFullScreen = ref(false) // 是否全屏
const columnSettingsVisible = ref(false) // 动态表头设置
const checkboxOptions = ref([]) // 全部表头
const checkboxOptionsBack = ref([]) // 全部表头备份数据
const checkedItemsLeft = ref([]) // 左侧选中的包头
const diminputleft = ref('') // 弹窗左侧过滤值
const allCheckedLeft = ref(false) // 弹窗左侧是否全选
const diminputright = ref('') // 弹窗右侧过滤值
const show = ref(false)
const iscellHeightLarge = ref(isheightlarge()) // 是否大行高
const dropdown1 = ref()
const isdownload = ref(false)
onBeforeMount(() => {
  queryAllCheckBoxs()
  queryPartCheckBoxs()
})
// 弹窗右侧搜索过滤事件
// const handleSearchRight = () => {
//
// }
const isFullScreen = computed(() => props.isFull)
watch(
  () => props.bussId,
  () => {
    queryAllCheckBoxs()
    queryPartCheckBoxs()
})
const showClick = () => {
  show.value = !show.value
  if (!dropdown1.value) return
  if (show.value) {
    dropdown1.value.handleOpen()
  } else {
    dropdown1.value.handleClose()
  }
}
const fn = (val) => {
  show.value = val
}
const isLeftShow = (value) => {
  return (
    checkboxOptionsBack.value.find((c) => c.COLUMN_NAME == value) &&
    checkboxOptionsBack.value
      .find((c) => c.COLUMN_NAME == value)
      .COLUMN_COMMENT.toLowerCase()
      .includes(diminputleft.value.toLowerCase())
  )
}
const isRightShow = (value) => {
  return (
    checkboxOptionsBack.value.find((c) => c.COLUMN_NAME == value) &&
    checkboxOptionsBack.value
      .find((c) => c.COLUMN_NAME == value)
      .COLUMN_COMMENT.toLowerCase()
      .includes(diminputright.value.toLowerCase())
  )
}
// 全选/取消全选事件
const handleAllCheckedChangeLeft = (checked) => {
  if (checked) {
    checkedItemsLeft.value = checkboxOptions.value.map((item) => item.COLUMN_NAME)
  } else {
    checkedItemsLeft.value = []
  }
}

// 保存表头配置
const saveColumnSettings = () => {
  // 保存设置操作
  savePreference({
    userId:userId,
    bussId: props.bussId,
    list2: checkedItemsLeft.value
      .map((item) => ({
        value: checkboxOptions.value.find((j) => j.COLUMN_NAME === item)?.COLUMN_NAME,
        title: checkboxOptions.value.find((j) => j.COLUMN_NAME === item)?.COLUMN_COMMENT,
        id: checkboxOptions.value.find((j) => j.COLUMN_NAME === item)?.COLUMN_ID,
      }))
      .filter((o) => o.value),
  }).then(() => {
    queryAllCheckBoxs()
    queryPartCheckBoxs()
  })
  columnSettingsVisible.value = false
}

//导出数据
const downloadExcel = () => {
  console.log('wewe');
  // const data = {
  //   ...props.queryList,
  //   bussId: props.bussId,
  //   propertyArray: checkedItemsLeft.value.filter(item=>item)
  // }
  // exportList(cleanNullAttr(data)).then(res=>{
  //   if(res.success){
  //     downLoadAll({url:`ipcdoc${res.data}`})
  //     columnSettingsVisible.value = false
  //     ElMessage({
  //       message:res.message,
  //       type: 'success',
  //     })
  //   }
  // })
}
// 取消表头配置弹窗
const cancelColumnSettings = () => {
  columnSettingsVisible.value = false
}
//恢复默认列
const resetToDefault = async () => {
  delPreference({
    bussId: props.bussId,
    userId:userId,
  }).then(() => {
    queryAllCheckBoxs()
    queryPartCheckBoxs()
  })
  // //console.log('res恢复默认', res1)
  // res1.data = checkboxOptions.value
}
//查询已配置表头
const queryPartCheckBoxs = () => {
  queryPreference({ bussId: props.bussId, userId:userId }).then((res) => {
    checkedItemsLeft.value = res.data.map((item) => item.value)
    emits('setColumn', res.data)
  })
}
// 查询所有表头
const queryAllCheckBoxs = () => {
  selectColumn({
    userId:userId,
    bussId: props.bussId,
  }).then((res) => {
    checkboxOptions.value = res.data
    checkboxOptionsBack.value = JSON.parse(JSON.stringify(res.data))
  })
}
// 拖动回调函数
const onMoveCallback = () => {}
// 右侧拖拽项移除
const removeItem = (item) => {
  const index = checkedItemsLeft.value.findIndex((i) => i === item)

  if (index > -1) {
    checkedItemsLeft.value.splice(index, 1)
  }
}
//置顶
const clickToTop = (item) => {
  const index = checkedItemsLeft.value.findIndex((el) => el === item) // 获取被点击行的索引
  ////console.log("置顶index",index)

  if (index !== -1) {
    checkedItemsLeft.value.splice(index, 1) // 从原位置删除
    checkedItemsLeft.value.unshift(item) // 添加到表格数据的最顶部
  }
}
const getIndex = (item) => {
  ////console.log('getIndex',item)
  return checkedItemsLeft.value.findIndex((el) => el === item)
}
// 弹窗左侧过滤事件
// const handleSearchLeft = (value) => {
//   // 处理左侧搜索逻辑
//   checkboxOptions.value = checkboxOptionsBack.value.filter((item) =>
//     item.COLUMN_COMMENT.includes(value),
//   )
// }
// 设置表格边框
const toggleBorder = () => {
  emits('changeBorder', borderChecked.value)
}
// 设置行样式
const changeRowStyle = () => {
  emits('changeRowStyle', rowChecked.value)
}
// 设置行高
const increaseRowHeight = () => {
  iscellHeightLarge.value = !iscellHeightLarge.value
  emits('changeRowHeight', iscellHeightLarge.value?40:28)
}

const readyRowHeight = () => {
  emits('changeRowHeight', iscellHeightLarge.value?40:28)
}

// 设置表头
const showsDialog = (type) => {
  if(type==='download'){
    isdownload.value = true
  }else {
    queryAllCheckBoxs()
    queryPartCheckBoxs()
    isdownload.value = false
  }
  columnSettingsVisible.value = true
}

// // 切换全屏、
// const SettingStore = useSettingStore()
// // 配置全局组件大小
// const globalComSize = computed(() => SettingStore.isfalg)

// const a = ref(false)
const ab = ref(false)
const toggleFullScreen = () => {
  ab.value = !ab.value
  emits('changeScreenSize')
}
const keyDown = (event) => {
  if (event.keyCode === 122) {
    event.returnValue = false // 禁用F11
  }
}
onMounted(() => {
  window.addEventListener('keydown', keyDown)
  changeRowStyle()
  toggleBorder()
  readyRowHeight()
})
onUnmounted(() => {
  window.removeEventListener('keydown', keyDown)
})
</script>

<style scoped lang="scss">
.tool {
  display: flex;
  align-items: center;
}
.container {
  width: 450px;
  height: 410px;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 5px;
  margin-top: 10px;
}

.containerright {
  height: 410px;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 5px;
  margin-top: 10px;
}
.selected-item:hover {
  background-color: #f7f9fc;
}

.search-input {
  width: 100%;
  height: 30px;
  margin-bottom: 10px;
}

.checkbox-container {
  display: inline-block;
  border-radius: 10px;
}

.checkbox {
  display: none;
}

.checkmark {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 1px solid #ccc;
  background-color: #fff;
  vertical-align: middle;
  margin-right: 5px;
}

.checkbox:checked + .checkmark {
  background-color: #ccc;
}
.right-config{
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid #c0c4cc;
  &:hover{
    background-color: #f2f5f9;
    color: #556EE6;
    border-color: #c6e2ff;
  }
}
</style>
