<template>
  <el-dialog 
    v-model="dialogVisible"
    title="案件选择"
    width="60%"
    style="margin-top: 5vh;"
    :before-close="handleClose"
    destroy-on-close
  >
    <div class="case-select-dialog">
      <!-- 搜索输入框 -->
      <div class="search-section">
        <div class="input-wrapper">
          <el-input
            v-model="searchKeyword"
            type="textarea"
            placeholder="请输入案件文号（每行一个案件号，按Enter键换行）"
            :autosize="{ minRows: 3, maxRows: 8 }"
            clearable
            @keyup.ctrl.enter="handleSearch"
          />
          <div class="search-button">
            <el-button @click="handleSearch" :loading="searching" type="primary">
              <i class="bx bx-search"></i> 搜索
            </el-button>
          </div>
        </div>
        <div class="input-tip">
          <i class="bx bx-info-circle"></i>
          <span>每行输入一个案件文号，按 Ctrl+Enter 或点击搜索按钮进行查询</span>
        </div>
      </div>

      <!-- 搜索结果 -->
      <div class="search-results" v-if="caseList.length > 0">
        <div class="results-header">
          <div class="header-left">
            <el-checkbox
              v-model="selectAll"
              @change="handleSelectAll"
              :indeterminate="isIndeterminate"
            >
              全选
            </el-checkbox>
            <span class="results-count">搜索结果 ({{ caseList.length }})</span>
          </div>
        </div>
        
        <div class="case-list">
          <div 
            v-for="item in caseList" 
            :key="item.caseId"
            class="case-item"
            :class="{ 'selected': selectedCases.includes(item.caseId) }"
          >
            <div class="case-checkbox">
              <el-checkbox
                :model-value="selectedCases.includes(item.caseId)"
                @change="(val) => handleSelectCase(val, item)"
              />
            </div>
            <div class="case-info">
              <div class="case-header">
                <span class="case-number">{{ item.agentNum }}</span>
                <span class="case-status status-default">
                  {{ item.status }}
                </span>
              </div>
              <div class="case-name">
                {{ item.caseName || '未设置' }}
              </div>
              <div class="case-details">
                <div class="detail-row">
                  <div class="detail-item half-left">
                    <div class="sub-item">
                      <label>案件类型：</label>
                      <span>{{ item.caseTypeStr || '未设置' }}</span>
                    </div>
                    <div class="sub-item">
                      <label>申请方向：</label>
                      <span>{{ item.appFromto || '未设置' }}</span>
                    </div>
                  </div>
                  <div class="detail-item half-right">
                    <label>客户名称：</label>
                    <span>{{ item.custName || '未设置' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 暂无数据 -->
      <div v-else-if="!searching && searchPerformed" class="empty-state">
        <el-empty description="暂无符合条件的案件数据">
          <template #image>
            <i class="bx bx-file" style="font-size: 60px; color: #c0c4cc;"></i>
          </template>
        </el-empty>
      </div>

      <!-- 初始状态 -->
      <div v-else-if="!searching" class="initial-state">
        <el-empty description="请输入案件文号进行搜索">
          <template #image>
            <i class="bx bx-search" style="font-size: 60px; color: #c0c4cc;"></i>
          </template>
        </el-empty>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleConfirm"
          :loading="confirming"
        >
          {{ selectedCases.length > 0 ? `确定 (${selectedCases.length})` : '确定（0）' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits } from 'vue'
import { ElMessage } from 'element-plus'
import { getCase, disposeAgentNum } from '@/api/contract'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  initialAgentNums: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const searchKeyword = ref('')
const caseList = ref([])
const selectedCases = ref([])
const selectedCaseDetails = ref([])
const searching = ref(false)
const confirming = ref(false)
const searchPerformed = ref(false)

// 全选相关
const selectAll = ref(false)
const isIndeterminate = computed(() => {
  const checkedCount = selectedCases.value.length
  return checkedCount > 0 && checkedCount < caseList.value.length
})

// 监听弹框打开，自动加载初始案件文号
watch(dialogVisible, (newVal) => {
  if (newVal && props.initialAgentNums) {
    // 弹框打开时，如果有初始案件文号，自动填入并搜索
    // 将逗号分割的案件文号转换为换行分割
    const agentNums = props.initialAgentNums
      .split(',')
      .map(num => num.trim())
      .filter(num => num && num.length > 0)
      .join('\n')
    
    searchKeyword.value = agentNums
    // 延迟执行搜索，确保DOM已更新
    setTimeout(() => {
      handleSearch()
    }, 100)
  }
})

// 监听选中案件变化，更新全选状态
watch(selectedCases, (newVal) => {
  if (newVal.length === 0) {
    selectAll.value = false
  } else if (newVal.length === caseList.value.length) {
    selectAll.value = true
  }
}, { deep: true })

// 搜索案件
const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入案件文号')
    return
  }

  searching.value = true
  searchPerformed.value = true
  
  try {
    // 将输入的文号按换行符分割并去除空格和空行
    const agentNums = searchKeyword.value
      .split('\n')
      .map(num => num.trim())
      .filter(num => num && num.length > 0)
    
    if (agentNums.length === 0) {
      ElMessage.warning('请输入有效的案件文号')
      searching.value = false
      return
    }
    
    // 调用接口获取案件信息
    const promises = agentNums.map(agentNum => 
      getCase({ agentNums: agentNum })
    )
    
    const responses = await Promise.all(promises)
    
    // 清空selectedCases
    selectedCases.value = []
    selectedCaseDetails.value = []

    // 合并所有结果
    const allCases = []
    responses.forEach(response => {
      if (response.success && response.data) {
        // 如果返回的是数组，则展开；如果是单个对象，则包装成数组
        const cases = Array.isArray(response.data) ? response.data : [response.data]
        allCases.push(...cases)
      }
    })
    
    // 去重（基于caseId）
    const uniqueCases = allCases.filter((case1, index, self) => 
      index === self.findIndex(case2 => case2.caseId === case1.caseId)
    )
    
    caseList.value = uniqueCases
    
    // 如果是从初始案件文号搜索的，自动全选所有结果
    if (props.initialAgentNums) {
      // 将初始案件文号转换为换行格式进行比较
      const initialFormatted = props.initialAgentNums
        .split(',')
        .map(num => num.trim())
        .filter(num => num && num.length > 0)
        .join('\n')
      
      if (searchKeyword.value === initialFormatted) {
        selectedCases.value = uniqueCases.map(item => item.caseId)
        selectedCaseDetails.value = [...uniqueCases]
        selectAll.value = true
      }
    }
    
    if (uniqueCases.length === 0) {
      ElMessage.info('未找到符合条件的案件')
    } else {
      ElMessage.success(`找到 ${uniqueCases.length} 个案件`)
    }
    
  } catch (error) {
    console.error('搜索案件失败:', error)
    ElMessage.error('搜索失败，请稍后再试')
    caseList.value = []
  } finally {
    searching.value = false
  }
}

// 选择案件
const handleSelectCase = (checked, caseItem) => {
  if (checked) {
    if (!selectedCases.value.includes(caseItem.caseId)) {
      selectedCases.value.push(caseItem.caseId)
      selectedCaseDetails.value.push(caseItem)
    }
  } else {
    const index = selectedCases.value.indexOf(caseItem.caseId)
    if (index > -1) {
      selectedCases.value.splice(index, 1)
      const detailIndex = selectedCaseDetails.value.findIndex(item => item.caseId === caseItem.caseId)
      if (detailIndex > -1) {
        selectedCaseDetails.value.splice(detailIndex, 1)
      }
    }
  }
}

// 全选/取消全选
const handleSelectAll = (checked) => {
  if (checked) {
    selectedCases.value = caseList.value.map(item => item.caseId)
    selectedCaseDetails.value = [...caseList.value]
  } else {
    selectedCases.value = []
    selectedCaseDetails.value = []
  }
}

// 确认选择
const handleConfirm = async () => {
  confirming.value = true
  
  try {
    // 如果没有选择任何案件，直接返回空结果
    if (selectedCases.value.length === 0) {
      ElMessage.success('未选择案件')
      // 传递空的案件信息
      emit('confirm', {
        selectedCases: [],
        showRefno: ''
      })
      handleClose()
      return
    }

    // 获取选中案件的案件文号
    const agentNumberArray = selectedCaseDetails.value.map(item => item.agentNum)
    
    // 调用disposeAgentNum接口
    const response = await disposeAgentNum({ agentNumberArray })
    
    if (response.success) {
      ElMessage.success('案件选择成功')
      // 传递选中的案件信息和处理后的案件文号
      emit('confirm', {
        selectedCases: selectedCaseDetails.value,
        showRefno: response.data
      })
      handleClose()
    } else {
      ElMessage.error(response.message || '处理失败')
    }
  } catch (error) {
    console.error('确认选择失败:', error)
    ElMessage.error('操作失败，请稍后再试')
  } finally {
    confirming.value = false
  }
}

// 关闭弹框
const handleClose = () => {
  // 重置状态
  searchKeyword.value = ''
  caseList.value = []
  selectedCases.value = []
  selectedCaseDetails.value = []
  searchPerformed.value = false
  selectAll.value = false
  
  dialogVisible.value = false
}
</script>

<style scoped lang="scss">
label{
  margin-bottom: 0;
}
.case-select-dialog {
  .search-section {
    margin-bottom: 20px;
    
    .input-wrapper {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      
      .el-textarea {
        flex: 1;
      }
      
      .search-button {
        flex-shrink: 0;
      }
    }
    
    .input-tip {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 8px;
      font-size: 12px;
      color: #909399;
      
      i {
        font-size: 14px;
        color: #409eff;
      }
    }
  }

  .search-results {
    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #f5f7fa;
      border-radius: 4px;
      margin-bottom: 16px;
      
      .header-left {
        display: flex;
        align-items: center;
      }
      
      .results-count {
        font-weight: 500;
        color: #303133;
        margin-left: 12px;
      }
    }

    .case-list {
      max-height: 500px;
      overflow-y: auto;
      
      .case-item {
        display: flex;
        align-items: flex-start;
        padding: 12px;
        border: 1px solid #ebeef5;
        border-radius: 6px;
        margin-bottom: 8px;
        transition: all 0.2s;
        cursor: pointer;
        
        &:hover {
          border-color: #c6e2ff;
          background-color: #f0f9ff;
        }
        
        &.selected {
          border-color: #409eff;
          background-color: #ecf5ff;
        }
        
        .case-checkbox {
          margin-right: 12px;
          margin-top: 2px;
        }
        
        .case-info {
          flex: 1;
          
          .case-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
            
            .case-number {
              font-weight: 600;
              color: #409eff;
              font-size: 14px;
            }
            
            .case-status {
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 500;

              &.status-default {
                background: #f0f2f5;
                color: #606266;
              }
            }
          }
          
          .case-name {
            margin-bottom: 6px;
            font-size: 13px;
            color: #303133;
            font-weight: 500;
            line-height: 1.3;
          }
          
          .case-details {
            .detail-row {
              display: flex;
              margin-bottom: 4px;
              
              &:last-child {
                margin-bottom: 0;
              }
              
              .detail-item {
                flex: 1;
                display: flex;
                align-items: center;
                font-size: 12px;
                min-width: 0;
                
                &.half-left {
                  flex: 0 0 50%;
                  flex-direction: row;
                  align-items: center;
                  gap: 8px;
                  
                  .sub-item {
                    display: flex;
                    align-items: center;
                    flex: 1;
                    min-width: 0;
                    
                    label {
                      color: #909399;
                      margin-right: 4px;
                      font-weight: 500;
                      flex-shrink: 0;
                      min-width: 50px;
                      font-size: 12px;
                    }
                    
                    span {
                      color: #606266;
                      line-height: 1.3;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                      font-size: 12px;
                    }
                  }
                }
                
                &.half-right {
                  flex: 0 0 50%;
                  justify-content: flex-start;
                }
                
                label {
                  color: #909399;
                  margin-right: 4px;
                  font-weight: 500;
                  flex-shrink: 0;
                  min-width: 60px;
                }
                
                span {
                  color: #606266;
                  line-height: 1.3;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                }
              }
            }
          }
        }
      }
    }
  }

  .empty-state,
  .initial-state {
    padding: 60px 20px;
    text-align: center;
    
    :deep(.el-empty__description) {
      color: #909399;
      font-size: 14px;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 自定义滚动条 */
.case-list::-webkit-scrollbar {
  width: 6px;
}

.case-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.case-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.case-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style> 