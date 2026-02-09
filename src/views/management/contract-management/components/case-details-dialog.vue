<template>
  <el-dialog 
    v-model="dialogVisible"
    title="案件详情"
    width="60%"
    :before-close="handleClose"
    destroy-on-close
  >
    <div class="case-details-dialog">
      <div v-if="caseDetails.length > 0" class="case-list">
        <div 
          v-for="caseDetail in caseDetails" 
          :key="caseDetail.caseId"
          class="case-detail-card"
        >
          <div class="case-content">
            <div class="case-header">
              <span class="case-number">{{ caseDetail.agentNum }}</span>
            </div>
            <div class="case-name">
              {{ caseDetail.caseName || '未设置' }}
            </div>
            <div class="case-details">
              <div class="detail-row">
                <div class="detail-item half-left">
                  <div class="sub-item">
                    <label>案件类型：</label>
                    <span>{{ getCaseTypeName(caseDetail.caseTypeId) || caseDetail.caseTypeStr || caseDetail.caseType || '未设置' }}</span>
                  </div>
                  <div class="sub-item">
                    <label>申请方向：</label>
                    <span>{{ caseDetail.appFromto || '未设置' }}</span>
                  </div>
                </div>
                <div class="detail-item half-right">
                  <label>客户名称：</label>
                  <span>{{ caseDetail.custName || '未设置' }}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <el-empty description="暂无案件详情">
          <template #image>
            <i class="bx bx-file" style="font-size: 60px; color: #c0c4cc;"></i>
          </template>
        </el-empty>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, defineProps, defineEmits } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  caseDetails: {
    type: Array,
    default: () => []
  },
  caseTypeList: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 获取案件类型名称
const getCaseTypeName = (caseTypeId) => {
  if (!caseTypeId || !props.caseTypeList) return ''
  
  const findCaseType = (types, id) => {
    for (const type of types) {
      if (type.caseTypeId === id) {
        return type.caseType
      }
      if (type.childrens && type.childrens.length > 0) {
        const found = findCaseType(type.childrens, id)
        if (found) return found
      }
    }
    return null
  }
  
  return findCaseType(props.caseTypeList, caseTypeId) || ''
}

// 关闭弹框
const handleClose = () => {
  dialogVisible.value = false
}
</script>

<style scoped lang="scss">
label{
  margin-bottom: 0;
}
.case-details-dialog {
  .case-list {
    max-height: 600px;
    overflow-y: auto;
    
    .case-detail-card {
      border: 1px solid #ebeef5;
      border-radius: 6px;
      margin-bottom: 12px;
      background: #fff;
      transition: all 0.2s;
      
      &:hover {
        border-color: #c6e2ff;
        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
      }
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .case-content {
        padding: 12px;
        
        .case-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
          
          .case-number {
            font-size: 14px;
            font-weight: 600;
            color: #409eff;
          }
          
          .case-status {
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 500;
            
            &.status-active {
              background: #e1f3d8;
              color: #67c23a;
            }
            
            &.status-completed {
              background: #e4e7ed;
              color: #909399;
            }
            
            &.status-paused {
              background: #fdf6ec;
              color: #e6a23c;
            }
            
            &.status-default {
              background: #f0f2f5;
              color: #606266;
            }
          }
        }
        
        .case-name {
          margin-bottom: 6px;
          font-size: 13px;
          font-weight: 500;
          color: #303133;
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
              align-items: flex-start;
              margin-bottom: 4px;
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
              
              &.full-width {
                flex-direction: column;
                align-items: flex-start;
                
                label {
                  margin-bottom: 4px;
                }
                
                span {
                  word-break: break-all;
                  white-space: normal;
                }
              }
              
              label {
                color: #909399;
                font-weight: 500;
                margin-right: 4px;
                flex-shrink: 0;
                font-size: 12px;
                min-width: 60px;
              }
              
              span {
                color: #606266;
                font-size: 12px;
                line-height: 1.3;
              }
            }
          }
        }
      }
    }
  }

  .empty-state {
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

@media (max-width: 768px) {
  .case-details-dialog {
    .case-list {
      .case-detail-card {
        .case-content {
          .case-details {
            .detail-row {
              flex-direction: column;
              
              .detail-item {
                flex-direction: column;
                
                label {
                  margin-bottom: 4px;
                  margin-right: 0;
                  min-width: auto;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style> 