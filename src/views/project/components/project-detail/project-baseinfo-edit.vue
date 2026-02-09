<template>
  <div class="project-base-info">
    <div class="section-header">
      <div class="section-header-left">
        <i class="bx bx-file section-icon"></i>
        <span class="section-title">项目信息</span>
      </div>
    </div>
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      class="base-info-form"
      label-position="top"
    >
      <el-form-item prop="custId">
        <template #label>
          <div class="field-label">
            <i class="bx bx-link-alt"></i>
            关联客户
          </div>
        </template>
        <el-select
          v-model="formData.custId"
          placeholder="请输入客户名称"
          filterable
          clearable
          :remote="true"
          :remote-method="fetchCustList"
          class="flex-grow-1"
        >
          <el-option
            v-for="item in customerList"
            :label="item.label"
            :value="item.value"
            :key="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item prop="description">
        <template #label>
          <div class="field-label">
            <i class="bx bx-detail"></i>
            项目描述
          </div>
        </template>
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          maxlength="300"
          show-word-limit
          placeholder="请输入项目描述"
        />
      </el-form-item>

      <el-form-item>
        <template #label>
          <div class="field-label">
            <i class="bx bx-purchase-tag-alt"></i>
            项目标签
          </div>
        </template>
        <div class="tags-editor">
          <div class="tags-list">
            <el-tag
              v-for="(tag, index) in formData.prjTagList"
              :key="tag + index"
              closable
              @close="removeTag(index)"
            >
              {{ tag.tagName }}
            </el-tag>
          </div>
          <el-input
            v-model="tagInput"
            placeholder="输入标签后回车添加"
            @keyup.enter="addTag"
          />
        </div>
      </el-form-item>

      <div class="info-row">
        <el-form-item prop="status">
          <template #label>
            <div class="field-label">
              <i class="bx bx-layer"></i>
              项目状态
            </div>
          </template>
          <el-select
            v-model="formData.status"
            placeholder="选择状态"
          >
            <el-option
              v-for="item in statusList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item prop="priority">
          <template #label>
            <div class="field-label">
              <i class="bx bx-target-lock"></i>
              优先级
            </div>
          </template>
          <el-select
            v-model="formData.priority"
            placeholder="选择优先级"
          >
            <el-option
              v-for="item in priorityList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </div>

      <div class="info-row">
        <el-form-item prop="creator">
          <template #label>
            <div class="field-label">
              <i class="bx bx-user-circle"></i>
              创建人
            </div>
          </template>
          <el-select
            v-model="formData.creatorId"
            placeholder="选择创建人"
            disabled
          >
            <el-option
              v-for="item in userList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item prop="ownerId">
          <template #label>
            <div class="field-label">
              <i class="bx bx-user-voice"></i>
              负责人
            </div>
          </template>
          <el-select
            v-model="formData.ownerId"
            placeholder="选择负责人"
            filterable
          >
            <el-option
              v-for="item in userList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </div>

      <el-form-item prop="memberList">
        <template #label>
          <div class="field-label">
            <i class="bx bx-group"></i>
            参与人
          </div>
        </template>
        <el-select
          v-model="formData.memberList"
          multiple
          filterable
          placeholder="选择参与人"
        >
          <el-option
            v-for="item in userList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <div class="info-row">
        <el-form-item prop="startDate">
          <template #label>
            <div class="field-label">
              <i class="bx bx-calendar"></i>
              开始日期
            </div>
          </template>
          <el-date-picker
            v-model="formData.startDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择开始日期"
            :clearable="false"
          />
        </el-form-item>
        <el-form-item prop="endDate">
          <template #label>
            <div class="field-label">
              <i class="bx bx-calendar-exclamation"></i>
              截止日期
            </div>
          </template>
          <el-date-picker
            v-model="formData.dueDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择截止日期"
          />
        </el-form-item>
      </div>

      <el-form-item prop="createdAt">
        <template #label>
          <div class="field-label">
            <i class="bx bx-time"></i>
            创建时间
          </div>
        </template>
        <el-input
          v-model="formData.createdAt"
          disabled
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, onMounted, defineExpose } from "vue";
import { queryList } from "@/api/caseList.js";
import { ElMessage } from "element-plus";
import { useStore } from "vuex";
const store = useStore();

const props = defineProps({
  detailInfo: {
    type: Object,
    default: () => ({}),
  },
});
const formRef = ref(null);
// 格式化detailInfo中的数据
const formatDetailInfo = () => {
  const formattedData = { ...props.detailInfo };

  // 如果memberList存在且是数组，提取userId组成新的数组
  if (formattedData.memberList && Array.isArray(formattedData.memberList)) {
    formattedData.memberList = formattedData.memberList.map(
      (member) => member.userId
    );
  }

  return formattedData;
};

const formData = ref(formatDetailInfo());

//客户列表
const customerList = ref([]);
const fetchCustList = (value) => {
  if (value) {
    const params = { pageNo: 1, pageSize: 100, sign: 1, parameter: value };
    queryList(params).then((res) => {
      customerList.value = res.data.map((item) => ({
        value: item.custId,
        label: item.fullname,
      }));
    });
  }
};
const statusList = ref([
  { label: "待开始", value: 0 },
  { label: "进行中", value: 1 },
  { label: "已完成", value: 2 },
  { label: "已暂停", value: 3 },
  { label: "已取消", value: 4 },
]);

const priorityList = [
  { label: "低", value: 0 },
  { label: "中", value: 1 },
  { label: "高", value: 2 },
  { label: "紧急", value: 3 },
];

const userList = computed(() => {
  return store.state.user.userList;
});

const formRules = {
  status: [{ required: true, message: "请选择项目状态" }],
  priority: [{ required: true, message: "请选择优先级" }],
  ownerId: [{ required: true, message: "请选择负责人" }],
};

const tagInput = ref("");

const addTag = () => {
  // 检查输入是否为空
  if (!tagInput.value.trim()) {
    return;
  }

  // 初始化prjTagList（如果不存在）
  if (!formData.value.prjTagList) {
    formData.value.prjTagList = [];
  }

  // 检查标签是否已存在
  const tagName = tagInput.value.trim();
  const isTagExists = formData.value.prjTagList.some(
    (tag) => tag.tagName === tagName
  );

  if (isTagExists) {
    // 如果标签已存在，清空输入框并返回
    tagInput.value = "";
    return;
  }

  // 添加新标签，生成一个临时ID（实际项目中可能需要后端返回）
  const newTag = {
    tagName: tagName,
  };

  formData.value.prjTagList.push(newTag);
  tagInput.value = "";
};

const removeTag = (index) => {
  // 确保prjTagList存在
  if (!formData.value.prjTagList || !Array.isArray(formData.value.prjTagList)) {
    return;
  }

  // 检查索引是否有效
  if (index < 0 || index >= formData.value.prjTagList.length) {
    console.error(`Invalid tag index: ${index}`);
    return;
  }

  // 删除标签
  formData.value.prjTagList.splice(index, 1);
};

const getFormData = () => {
  return new Promise((resolve) => {
    formRef.value?.validate((valid) => {
      if (valid) {
        let data = JSON.parse(JSON.stringify(formData.value));
        let formatData = {
          prjId: data.prjId,
          name: data.name,
          description: data.description || undefined,
          status: data.status,
          priority: data.priority,
          ownerId: data.ownerId,
          ownerName: data.ownerName,
          startDate: data.startDate,
          dueDate: data.dueDate,
          custId: data.custId || undefined,
          custName: data.custName || undefined,
          memberList: data.memberList,
          prjTagList: data.prjTagList,
        };
        //格式化参数
        if (formatData.memberList && formatData.memberList.length > 0) {
          //变更参数为对象数组包括userId和userName
          formatData.memberList = formatData.memberList.map((item) => {
            const user = userList.value.find((user) => user.value === item);
            return {
              userId: item,
              userName: user.label,
            };
          });
        } else {
          formatData.memberList = [];
        }
        console.log(formatData, "formatData@@");

        //添加负责人的ownerName
        const owner = userList.value.find(
          (user) => user.value === formatData.ownerId
        );
        formatData.ownerName = owner.label;

        //添加客户名称
        if (formatData.custId) {
          const customer = customerList.value.find(
            (customer) => customer.value === formatData.custId
          );
          if (customer) {
            formatData.custName = customer.label;
          }
        }
        resolve(formatData);
      } else {
        ElMessage.warning("请填写必填项");
        resolve(false);
      }
    });
  });
};

// 暴露方法给父组件
defineExpose({
  getFormData,
});
onMounted(() => {
  if (props.detailInfo.custId && props.detailInfo.custName) {
    fetchCustList(props.detailInfo.custName);
  }
});
</script>

<style scoped lang="scss">
.project-base-info {
  margin-top: 16px;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  .section-header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .section-icon {
    font-size: 18px;
    color: #303133;
  }
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #232f41;
  }
  .section-actions {
    display: flex;
    gap: 8px;
  }
}
.base-info-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  :deep(.el-form-item) {
    margin-bottom: 0;
  }
  :deep(.el-form-item__label) {
    padding: 0 0 6px;
  }
  :deep(.el-input__inner),
  :deep(.el-textarea__inner),
  :deep(.el-select),
  :deep(.el-date-editor.el-input),
  :deep(.el-date-editor.el-input__inner) {
    border-radius: 12px;
  }
}
.info-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.field-label {
  font-size: 13px;
  color: #7b8aab;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.tags-editor {
  background: #f8f9fd;
  border: 1px solid #edf0fb;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}
.info-row :deep(.el-form-item) {
  width: 100%;
}
:deep(.el-select),
:deep(.el-input),
:deep(.el-textarea),
:deep(.el-date-editor) {
  width: 100%;
}
@media (max-width: 992px) {
  .info-row {
    grid-template-columns: 1fr;
  }
}
</style>
