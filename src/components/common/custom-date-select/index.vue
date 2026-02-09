<template>
  <el-select
    v-model="selectValue"
    style="width: 140px"
    popper-class="custom-year-select"
    @visible-change="handleDropdown"
    :multiple="false"
    :clearable="false"
    :filterable="false"
    :collapse-tags="false"
    :collapse-tags-tooltip="false"
    size="small"
    :placeholder="customLabel"
  >
    <el-option
      v-for="item in quickOptions"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
    <template #footer>
      <div class="custom-years-title">自定义选择年份</div>
      <div style="max-height: 160px; overflow-y: auto">
        <el-checkbox-group
          v-model="customYears"
          class="custom-years-group"
        >
          <el-checkbox
            v-for="year in yearOptions"
            :key="year"
            :label="year"
            :disabled="customYears.length >= 5 && !customYears.includes(year)"
            >{{ year }}年</el-checkbox
          >
        </el-checkbox-group>
      </div>
      <div
        class="custom-years-tip"
        :class="{ limit: customYears.length >= 5 }"
      >
        最多选择5个年份
      </div>
    </template>
  </el-select>
</template>

<script setup>
import { ref, watch, computed } from "vue";

const quickOptions = [
  { label: "本年", value: 1 },
  { label: "近2年对比", value: 2 },
  { label: "近3年对比", value: 3 },
];

const currentYear = new Date().getFullYear();
const yearOptions = Array.from(
  { length: currentYear - 2000 + 1 },
  (_, i) => currentYear - i
);

const selectValue = ref(3);
const customYears = ref([yearOptions[0], yearOptions[1], yearOptions[2]]);

const customLabel = computed(() => {
  return `自定义(${customYears.value.length})`;
});

const handleDropdown = (visible) => {
  // 可选：下拉时自动切换到自定义
  if (visible && selectValue.value === "custom") {
    // do nothing
  }
};

// 联动：selectValue变化时自动设置customYears
watch(selectValue, (val) => {
  if (val === 1) {
    customYears.value = [yearOptions[0]];
  } else if (val === 2) {
    customYears.value = [yearOptions[0], yearOptions[1]];
  } else if (val === 3) {
    customYears.value = [yearOptions[0], yearOptions[1], yearOptions[2]];
  }
});
// 联动：checkbox变化时，如果是手动勾选则selectValue置为空
watch(customYears, (val) => {
  // 只有在不是selectValue驱动时才置空
  if (
    selectValue.value &&
    !(
      (selectValue.value === 1 &&
        val.length === 1 &&
        val[0] === yearOptions[0]) ||
      (selectValue.value === 2 &&
        val.length === 2 &&
        val[0] === yearOptions[0] &&
        val[1] === yearOptions[1]) ||
      (selectValue.value === 3 &&
        val.length === 3 &&
        val[0] === yearOptions[0] &&
        val[1] === yearOptions[1] &&
        val[2] === yearOptions[2])
    )
  ) {
    selectValue.value = "";
  }
  // 新增逻辑：当selectValue为空且customYears长度为0时，自动选择本年对比
  if (selectValue.value === "" && val.length === 0) {
    selectValue.value = 1;
    customYears.value = [yearOptions[0]];
  }
});
</script>

<style scoped>
.custom-year-select .el-select-dropdown__item.custom-group-label {
  cursor: default;
  background: #f5f5f5;
  font-weight: 600;
  color: #888;
  padding-top: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}
.custom-years-title {
  font-size: 13px;
  color: #888;
  margin-bottom: 4px;
}
.custom-years-group {
  display: flex;
  flex-direction: column;
  padding: 4px 0;
}
.custom-years-tip {
  text-align: left;
  color: #b0b0b0;
  font-size: 12px;
}
</style>
