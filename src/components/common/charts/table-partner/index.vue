<template>
  <el-table
    ref="tableRef"
    :data="dataList"
    :fit="true"
    :scrollbar-always-on="true"
    :show-overflow-tooltip="true"
    style="height: 100%; padding-top: 40px"
    :row-style="getRowStyle"
    row-key="userId"
    header-row-class-name="table-header-custom"
  >
    <el-table-column
      :prop="col.field"
      :label="col.name"
      v-for="col of tableCol"
      :key="col.field"
      :width="col.width ? col.width : 'auto'"
      :min-width="col.minWidth ? col.minWidth : 100"
      sortable
    >
    </el-table-column>
  </el-table>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, nextTick, watch } from 'vue';
import Sortable from 'sortablejs';

// 定义props
const props = defineProps({
  tableCol: {
    type: Array,
    default: () => [],
  },
  chartData: {
    type: Array,
    default: () => [],
  },
});

// 定义emit
const emit = defineEmits(['update:showSidebar', 'update:chartData']);

// 响应式数据
const tableRef = ref(null);
const localData = ref([...props.chartData].sort((a, b) => a.deptId - b.deptId)); // 创建本地数据副本并按deptId排序

// 部门颜色映射
const deptColors = {
  '145': 'rgba(217, 234, 247, 0.3)',  // 浅蓝色
  '141': 'rgba(216, 240, 210, 0.3)',  // 浅绿色
  '300006': 'rgba(249, 218, 218, 0.3)', // 浅红色
  '191': 'rgba(230, 216, 240, 0.3)',  // 浅紫色
  '182': 'rgba(253, 233, 212, 0.3)',  // 浅橙色
  '238': 'rgba(226, 226, 226, 0.3)'   // 浅灰色
};

// 初始化拖拽
const initSortable = async () => {
  await nextTick();
  if (!tableRef.value) return;
  
  const tbody = tableRef.value.$el.querySelector('.el-table__body-wrapper tbody');
  if (!tbody) {
    console.warn('未找到表格体元素，将在 100ms 后重试');
    setTimeout(initSortable, 100);
    return;
  }

  // 销毁之前的实例（如果存在）
  if (tbody.sortable) {
    tbody.sortable.destroy();
  }

  Sortable.create(tbody, {
    animation: 150,
    ghostClass: 'sortable-ghost',
    handle: '.el-table__row', // 指定拖拽句柄
    onStart: () => {
    },
    onEnd: (evt) => {
      const { newIndex, oldIndex } = evt;
      if (newIndex === oldIndex) return;

      try {
        // 获取原始数据的副本
        const targetRow = localData.value[oldIndex];
        const tempArr = [...localData.value];
        
        // 直接操作数组
        tempArr.splice(oldIndex, 1);
        tempArr.splice(newIndex, 0, targetRow);

        // 更新数据
        localData.value = tempArr;
        emit('update:chartData', tempArr);
      } catch (error) {
        console.error('拖拽排序出错：', error);
      }
    },
    // 设置store选项来保持正确的顺序
    store: {
      get: (sortable) => {
        return Array.from(sortable.el.children).map(element => 
          Array.from(tbody.children).indexOf(element)
        );
      },
      set: (sortable) => {
        const order = sortable.toArray();
        const tbody = sortable.el;
        const children = Array.from(tbody.children);
        
        order.forEach((index) => {
          const element = children[index];
          if (element) tbody.appendChild(element);
        });
      }
    }
  });
};

// 确保在数据变化时重新初始化
watch(() => props.chartData, (newVal) => {
  if (newVal && newVal.length > 0) {
    // localData.value = [...newVal].sort((a, b) => a.deptId - b.deptId);
    localData.value = [...newVal] //前端需要记录移动后的顺序，保证和放大表格顺序一致，所有由后端来排序;
    nextTick(() => {
      initSortable();
    });
  }
}, { deep: true, immediate: true });

// 计算属性
const dataList = computed({
  get: () => localData.value,
  set: (value) => {
    localData.value = value;
    emit('update:chartData', value);
  }
});

const getRowStyle = ({ row }) => {
  return {
    cursor: 'move',
    backgroundColor: deptColors[row.deptId] || 'transparent',
    userSelect: 'none'
  };
};

</script>

<style scoped>
:deep(.el-table) {
  --el-table-tr-bg-color: transparent;
}

:deep(.el-table__row) {
  cursor: move;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.sortable-ghost {
  opacity: 0.8;
  background: #f0f9eb !important;
}

.sortable-drag {
  background: #fff;
  border: 1px dashed #ccc;
}
:deep(.table-header-custom th .cell) {
  display: flex;
  align-items: center;
}
</style>
