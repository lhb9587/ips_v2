<script setup>
import { computed, defineEmits, defineProps, reactive, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  leaveTypeOptions: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue", "confirm"]);

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const createDefaultForm = () => ({
  targetType: "condition",
  leaveType: "",
  periodMode: "exact",
  periodStartDate: "",
  periodEndDate: "",
  employeeScope: "allWithinRange",
  specifiedExtendedDate: "",
  extensionType: "fixedDate",
  fixedDate: "",
  monthCount: 1,
});

const targetOptions = [
  {
    value: "all",
    title: "对列表中所有的记录进行延期",
    description: "直接对当前列表范围内的全部记录统一延期。",
  },
  {
    value: "selected",
    title: "对列表中选中的记录进行延期",
    description: "仅处理你在列表中手动选中的记录。",
  },
  {
    value: "condition",
    title: "按下面的条件进行延期",
    description: "按假期类型、周期和员工范围筛选后再延期。",
  },
];

const formData = reactive(createDefaultForm());

const resetForm = () => {
  Object.assign(formData, createDefaultForm());
};

watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      resetForm();
    }
  },
);

watch(
  () => formData.extensionType,
  (type) => {
    if (type === "fixedDate") {
      formData.monthCount = 1;
      return;
    }
    formData.fixedDate = "";
  },
);

const showConditionFields = computed(() => formData.targetType === "condition");

const selectTargetType = (value) => {
  formData.targetType = value;
};

const closeDialog = () => {
  dialogVisible.value = false;
};

const handleConfirm = () => {
  emit("confirm", { ...formData });
};
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="批量延期"
    width="860px"
    destroy-on-close
    append-to-body
  >
    <div class="batch-extend">
      <div
        class="batch-extend__target-group"
        role="radiogroup"
        aria-label="延期范围"
      >
        <button
          v-for="item in targetOptions"
          :key="item.value"
          type="button"
          class="target-option"
          :class="{ 'target-option--active': formData.targetType === item.value }"
          role="radio"
          :aria-checked="formData.targetType === item.value"
          @click="selectTargetType(item.value)"
        >
          <span class="target-option__marker"></span>
          <span class="target-option__content">
            <span class="target-option__title">{{ item.title }}</span>
            <span class="target-option__desc">{{ item.description }}</span>
          </span>
        </button>
      </div>

      <div
        v-if="showConditionFields"
        class="batch-extend__condition"
      >
        <div class="form-row">
          <div class="form-label">假期类型</div>
          <div class="form-content">
            <el-select
              v-model="formData.leaveType"
              placeholder="请选择假期类型"
              clearable
              style="width: 280px"
            >
              <el-option
                v-for="item in leaveTypeOptions"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </div>
        </div>

        <div class="form-row form-row--top">
          <div class="form-label">周期选择</div>
          <div class="form-content form-content--column">
            <el-radio-group v-model="formData.periodMode">
              <el-radio label="exact">精确匹配周期</el-radio>
              <el-radio label="latest">最新有效周期</el-radio>
            </el-radio-group>

            <div
              v-if="formData.periodMode === 'exact'"
              class="period-range"
            >
              <div class="period-range__item">
                <span class="period-range__label">开始日期</span>
                <el-date-picker
                  v-model="formData.periodStartDate"
                  type="date"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  placeholder="请选择日期"
                  style="width: 220px"
                />
              </div>
              <div class="period-range__item">
                <span class="period-range__label">结束日期</span>
                <el-date-picker
                  v-model="formData.periodEndDate"
                  type="date"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  placeholder="请选择日期"
                  style="width: 220px"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="form-row form-row--top">
          <div class="form-label">员工范围</div>
          <div class="form-content form-content--column">
            <el-radio-group v-model="formData.employeeScope">
              <el-radio label="allWithinRange">更新所有延期日期(权限范围内)</el-radio>
              <el-radio label="specifiedDate">更新指定延期日期</el-radio>
            </el-radio-group>

            <el-date-picker
              v-if="formData.employeeScope === 'specifiedDate'"
              v-model="formData.specifiedExtendedDate"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              placeholder="请选择延期日期"
              style="width: 280px"
            />
          </div>
        </div>
      </div>

      <div class="batch-extend__method">
        <el-radio-group
          v-model="formData.extensionType"
          class="batch-extend__method-group"
        >
          <div class="method-row">
            <el-radio label="fixedDate">固定日期</el-radio>
            <el-date-picker
              v-model="formData.fixedDate"
              :disabled="formData.extensionType !== 'fixedDate'"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              placeholder="请选择日期"
              style="width: 280px"
            />
          </div>
          <div class="method-row">
            <el-radio label="byMonths">按月数</el-radio>
            <el-input-number
              v-model="formData.monthCount"
              :disabled="formData.extensionType !== 'byMonths'"
              :min="1"
              :step="1"
              :precision="0"
              controls-position="right"
              style="width: 280px"
            />
          </div>
        </el-radio-group>
      </div>
    </div>

    <template #footer>
      <div class="batch-extend__footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button
          type="primary"
          @click="handleConfirm"
        >
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.batch-extend {
  padding: 4px 8px 0;
}

.batch-extend__target-group {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.target-option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #dce3f0;
  border-radius: 8px;
  background: #fff;
  text-align: left;
  transition: all 0.2s ease;
}

.target-option:hover {
  border-color: #8aa4d6;
  background: #f8fbff;
}

.target-option--active {
  border-color: #4f80c2;
  background: #eef5ff;
  box-shadow: 0 0 0 1px rgba(79, 128, 194, 0.12);
}

.target-option__marker {
  position: relative;
  flex: 0 0 18px;
  width: 18px;
  height: 18px;
  margin-top: 2px;
  border: 1px solid #b7c3d7;
  border-radius: 50%;
  background: #fff;
}

.target-option--active .target-option__marker {
  border-color: #4f80c2;
}

.target-option--active .target-option__marker::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4f80c2;
  transform: translate(-50%, -50%);
}

.target-option__content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.target-option__title {
  color: #1f2d49;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
}

.target-option__desc {
  color: #7b879c;
  font-size: 12px;
  line-height: 1.5;
}

.batch-extend__condition,
.batch-extend__method {
  margin-top: 20px;
  padding-left: 28px;
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
}

.form-row--top {
  align-items: flex-start;
}

.form-label {
  width: 96px;
  flex: 0 0 96px;
  color: #606266;
  line-height: 32px;
}

.form-content {
  flex: 1;
  min-width: 0;
}

.form-content--column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
}

.period-range {
  display: flex;
  align-items: center;
  gap: 48px;
  flex-wrap: wrap;
}

.period-range__item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.period-range__label {
  color: #606266;
}

.batch-extend__method-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
}

.method-row {
  display: flex;
  align-items: center;
  gap: 18px;
}

.batch-extend__footer {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 900px) {
  .batch-extend__target-group {
    grid-template-columns: 1fr;
  }

  .batch-extend__condition,
  .batch-extend__method {
    padding-left: 0;
  }
}
</style>
