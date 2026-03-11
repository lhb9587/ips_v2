<template>
  <b-modal
    v-model="showCreateProjectModal"
    @hidden="closeCreateProjectModal"
    :no-close-on-backdrop="true"
    title="新建项目"
    centered
    hide-footer
    size="lg"
    :no-close-on-esc="true"
    :lazy="true"
    body-class="modal-form"
  >
    <el-form
      :model="projectForm"
      :rules="rules"
      ref="projectFormRef"
      class="projectForm p-3"
    >
      <el-form-item
        label="名称"
        prop="name"
      >
        <el-input
          v-model="projectForm.name"
          placeholder="请输入项目名称"
        />
      </el-form-item>
      <el-form-item
        label="关联客户"
        prop="custId"
      >
        <el-select
          v-model="projectForm.custId"
          placeholder="请输入客户名称"
          filterable
          clearable
          :remote="true"
          :remote-method="fetchCustList"
          :loading="custListLoading"
          class="flex-grow-1"
        >
          <el-option
            v-for="item in customerList"
            :label="item.label"
            :value="item.value"
            :key="item.value"
          /> </el-select
      ></el-form-item>
      <el-form-item
        label="标签"
        prop="prjTag"
      >
        <div
          v-if="projectForm.prjTagList"
          style="display: flex; gap: 6px; margin-bottom: 6px"
        >
          <el-tag
            v-for="(tag, index) in projectForm.prjTagList"
            :key="index"
            closable
            type="info"
            @close="removeTag(index)"
          >
            {{ tag.tagName }}
          </el-tag>
        </div>
        <el-input
          v-model="prjTag"
          placeholder="输入标签后按回车添加"
          @keyup.enter="addTag"
        />
        <div class="text-desc">可添加多个标签，回车确认</div>
      </el-form-item>
      <el-form-item label="描述">
        <el-input
          v-model="projectForm.description"
          type="textarea"
          placeholder="请输入项目描述"
          :autosize="{ minRows: 2, maxRows: 4 }"
        ></el-input>
        <div class="text-desc">简要描述项目的目标和范围</div>
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="状态"
            prop="status"
          >
            <el-select
              v-model="projectForm.status"
              style="width: 100px"
            >
              <el-option
                v-for="item in statusList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="优先级"
            prop="priority"
          >
            <el-select
              v-model="projectForm.priority"
              style="width: 100px"
            >
              <el-option
                v-for="item in priorityList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="创建人"
            prop="creator"
          >
            <el-select
              v-model="creator"
              disabled
              style="width: 100px"
            >
              <el-option
                v-for="item in userList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="负责人"
            prop="ownerId"
          >
            <el-select
              v-model="projectForm.ownerId"
              filterable
              style="width: 100px"
            >
              <el-option
                v-for="item in userList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item
        label="参与人"
        prop="memberList"
      >
        <el-select
          v-model="projectForm.memberList"
          filterable
          clearable
          multiple
          placeholder="请选择参与人"
        >
          <el-option
            v-for="item in userList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <div class="text-desc">选择参与协作的人员</div>
      </el-form-item>
      <el-row gutter="20">
        <el-col :span="12">
          <el-form-item
            prop="startDate"
            label="开始日期"
          >
            <el-date-picker
              v-model="projectForm.startDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择开始日期"
              style="width: 100%"
              :clearable="false"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            prop="endDate"
            label="截止日期"
          >
            <el-date-picker
              v-model="projectForm.dueDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择截止日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div class="w-100 modal-footer">
      <div class="text-end">
        <el-button @click="closeCreateProjectModal">取消</el-button>
        <el-button
          type="primary"
          @click="submitForm()"
          >创建项目</el-button
        >
      </div>
    </div>
  </b-modal>
</template>

<script setup>
import { ref, computed, watch, defineEmits, defineProps } from "vue";
import { queryCustomerListNew } from "@/api/customerList";
import { createProject } from "@/api/project.js";
import { ElMessage } from "element-plus";
import dayjs from "dayjs";
import { useStore } from "vuex";
const store = useStore();

// 定义 props 和 emits
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:visible", "success"]);

// 使用计算属性处理模态框显示状态
const showCreateProjectModal = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val),
});
const projectForm = ref({
  name: "",
  prjTagList: [], // 初始化标签列表
  startDate: dayjs().format("YYYY-MM-DD"),
  status: 0,
  priority: 1,
  ownerId: store.state.user.userId,
});
//标签
const prjTag = ref("");
// 添加标签方法
const addTag = () => {
  // 检查标签是否为空
  if (!prjTag.value.trim()) {
    return;
  }

  // 检查是否已存在相同标签
  const isExist = projectForm.value.prjTagList.some(
    (tag) =>
      tag.tagName &&
      tag.tagName.toLowerCase() === prjTag.value.trim().toLowerCase(),
  );

  // 如果不存在相同标签，则添加
  if (!isExist) {
    projectForm.value.prjTagList.push({
      tagName: prjTag.value.trim(),
    });
  }

  // 清空输入框
  prjTag.value = "";
};

// 删除标签方法
const removeTag = (index) => {
  projectForm.value.prjTagList.splice(index, 1);
};

const statusList = ref([
  { label: "待开始", value: 0 },
  { label: "进行中", value: 1 },
]);
const priorityList = ref([
  { label: "低", value: 0 },
  { label: "中", value: 1 },
  { label: "高", value: 2 },
  { label: "紧急", value: 3 },
]);
const projectFormRef = ref(null);
const closeCreateProjectModal = () => {
  showCreateProjectModal.value = false;
  projectFormRef.value.resetFields();
  prjTag.value = "";
};
const creator = ref(store.state.user.userId);
const rules = ref({
  name: [{ required: true, message: "此项为必填项" }],
  status: [{ required: true, message: "此项为必填项" }],
  priority: [{ required: true, message: "此项为必填项" }],
  ownerId: [{ required: true, message: "此项为必填项" }],
});
const submitForm = () => {
  projectFormRef.value.validate((valid) => {
    if (valid) {
      submitFormData();
    } else {
      ElMessage.warning("请填写必填项");
      return false;
    }
  });
};
const submitFormData = () => {
  const params = JSON.parse(JSON.stringify(projectForm.value));
  //格式化参数
  if (params.memberList && params.memberList.length > 0) {
    //变更参数为对象数组包括userId和userName
    params.memberList = params.memberList.map((item) => {
      const user = userList.value.find((user) => user.value === item);
      return {
        userId: item,
        userName: user.label,
      };
    });
  }
  //添加负责人的ownerName
  const owner = userList.value.find((user) => user.value === params.ownerId);
  params.ownerName = owner.label;

  //添加客户名称
  if (params.custId) {
    const customer = customerList.value.find(
      (customer) => customer.value === params.custId,
    );
    params.custName = customer.label;
  }

  createProject(params).then((res) => {
    if (res.success) {
      ElMessage.success("创建成功");
      closeCreateProjectModal();
      // 触发成功事件
      emit("success");
    }
  });
};
//客户列表
const customerList = ref([]);
const custListLoading = ref(false);
const fetchCustList = (value) => {
  if (value) {
    custListLoading.value = true;
    const params = {
      pageNo: 1,
      pageSize: 100,
      myFollow: 0,
      keywords: value,
    };
    queryCustomerListNew(params).then((res) => {
      customerList.value = res.data.map((item) => ({
        value: item.custId,
        label: item.fullname,
      }));
      custListLoading.value = false;
    }).catch(() => {
      custListLoading.value = false;
    });
  }
};

const userList = computed(() => {
  return store.state.user.userList;
});

// 监听模态框关闭，重置表单
watch(
  () => props.visible,
  (newVal) => {
    if (!newVal && projectFormRef.value) {
      projectFormRef.value.resetFields();
      prjTag.value = "";
    }
  },
);
</script>
<style lang="scss" scoped>
.projectForm {
  max-height: calc(80vh - 88px);
  overflow-y: auto;
  .el-form-item {
    display: block;
    :deep(.el-form-item__label) {
      margin-bottom: 0 !important;
    }
  }
}
.text-desc {
  color: #909399;
}
</style>
<style lang="scss">
.modal-form {
  padding: 0;
}
</style>
