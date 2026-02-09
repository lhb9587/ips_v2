<template>
  <div class="drag-container">
    <draggable
      v-model="dragList"
      animation="300"
      @change="onMoveCallback"
      chosenClass="chosenClass"
      ghostClass="ghost"
      forceFallback="true"
      handle=".move"
      item-key="id"
      ><template #item="{ element }">
        <div class="company-item">
          <div class="drag-handle move">
            <i class="dots"></i>
          </div>

          <div
            class="left"
            @click="clickCustItem(element.id)"
          >
            <span class="icon bx bx-buildings"></span>
            <span class="name">{{ element.label }}</span>
          </div>
          <div
            class="delete-btn"
            @click="remove(element.id)"
            placement="top"
          >
            <i class="mdi mdi-delete-outline"></i>
          </div></div></template
    ></draggable>
  </div>
</template>

<script setup>
import { defineProps, ref, onMounted, defineEmits,defineExpose } from "vue";
import draggable from "vuedraggable";
import { delUserFollowCust } from "@/api/customerList";
import { ElMessage, ElMessageBox } from "element-plus";

const props = defineProps({
  list: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["handleClick"]);
// 拖动回调函数
const onMoveCallback = () => {};
onMounted(() => {
  console.log(props.list, "list");
});

const dragList = ref(props.list);
const remove = (id) => {
  ElMessageBox.confirm("确定要取消关注该客户吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    delUserFollowCust({ custId: id }).then((res) => {
      if (res.success) {
        dragList.value = dragList.value.filter((item) => item.id !== id);
        ElMessage.success("操作成功");
      }
    });
  });
};
const clickCustItem = (id) => {
  const parmas = {
    id,
    type: "company",
  };
  emit("handleClick", parmas);
};
const exportData = () => {
  return dragList.value;
}
defineExpose({
  exportData,
});
</script>

<style lang="scss" scoped>
.drag-container {
  height: calc(100vh - 160px);
  overflow-y: auto;
  user-select: none;
}
.company-item {
  display: flex;
  align-items: center;
  padding: 0 12px;
  border-bottom: 1px solid #f0f0f0;
  padding: 4px;

  .drag-handle {
    width: 20px;
    margin-right: 8px;
    cursor: grab;
    display: flex;
    justify-content: center;

    .dots {
      width: 4px;
      height: 12px;
      background-image: radial-gradient(#999 1px, transparent 1px);
      background-size: 4px 4px;
    }
  }

  .left {
    flex: 1;
    display: flex;
    align-items: center;
    padding: 8px;
    border-radius: 6px;
    cursor: pointer;
    &:hover {
      background-color: #f5f7fa;
    }
    .icon {
      font-size: 16px;
      margin-right: 8px;
    }

    .name {
      font-size: 14px;
      color: #333;
      width: 200px;
      //超出隐藏
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .delete-btn {
    color: #ff4d4f;
    cursor: pointer;
    font-size: 16px;
    padding: 4px;

    &:hover {
      color: #ff7875;
    }
  }
}
.ghost {
  opacity: 0.2;
}
</style>
