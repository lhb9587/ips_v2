<template>
  <div class="task-detail-edit">
    <div class="content-title">属性</div>
    <div class="form-content">
      <!-- 状态 -->
      <div class="form-row">
        <div class="form-label">状态</div>
        <div class="form-value">
          <el-select
            v-model="taskForm.status"
            placeholder="请选择状态"
            style="width: 100%"
          >
            <el-option
              v-for="item in statusList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </div>

      <!-- 开始日期 -->
      <div class="form-row">
        <div class="form-label">开始日期</div>
        <div class="form-value">
          <el-date-picker
            v-model="taskForm.startDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="年/月/日"
            style="width: 100%"
            :clearable="false"
          />
        </div>
      </div>

      <!-- 截止日期 -->
      <div class="form-row">
        <div class="form-label">截止日期</div>
        <div class="form-value">
          <el-date-picker
            v-model="taskForm.dueDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="年/月/日"
            style="width: 100%"
          />
        </div>
      </div>

      <!-- 优先级 -->
      <div class="form-row">
        <div class="form-label">优先级</div>
        <div class="form-value">
          <el-select
            v-model="taskForm.priority"
            placeholder="请选择优先级"
            style="width: 100%"
          >
            <el-option
              v-for="item in priorityList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </div>

      <!-- 创建人 -->
      <div class="form-row">
        <div class="form-label">创建人</div>
        <div class="form-value">
          <el-input
            v-model="taskForm.creatorName"
            disabled
            style="width: 100%"
          />
        </div>
      </div>

      <!-- 负责人 -->
      <div class="form-row">
        <div class="form-label">负责人</div>
        <div class="form-value">
          <el-select
            v-model="taskForm.ownerId"
            filterable
            placeholder="请选择负责人"
            style="width: 100%"
          >
            <el-option
              v-for="item in userList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </div>

      <!-- 参与人 -->
      <div class="form-section">
        <div class="section-header">
          <i class="bx bx-group"></i>
          <span>参与人</span>
        </div>
        <!-- <div
          v-if="inheritedParticipants.length > 0"
          class="inherited-participants"
        >
          <div class="inherited-bracket">└</div>
          <div class="inherited-text">
            从项目继承: {{ inheritedParticipants.join("、") }}
          </div>
        </div> -->
        <el-select
          v-model="taskForm.memberList"
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
      </div>

      <!-- 标签 -->
      <div class="form-section">
        <div class="section-header">
          <span>标签</span>
        </div>
        <div class="tags-input-wrapper">
          <div
            v-if="taskForm.tagList && taskForm.tagList.length > 0"
            class="tags-display"
          >
            <el-tag
              v-for="(tag, index) in taskForm.tagList"
              :key="index"
              closable
              type="info"
              @close="removeTag(index)"
              style="margin-right: 6px; margin-bottom: 6px"
            >
              {{ tag.tagName || tag }}
            </el-tag>
          </div>
          <el-input
            v-model="tagInput"
            placeholder="输入标签名称,按回车添加"
            @keyup.enter="addTag"
            style="width: 100%"
          />
        </div>

        <div class="quick-tags">
          <div class="quick-tags-label">快捷标签:</div>
          <div class="quick-tags-buttons">
            <el-button
              v-for="quickTag in quickTags"
              :key="quickTag"
              type="default"
              size="small"
              class="quick-tag-btn"
              @click="addQuickTag(quickTag)"
            >
              <i class="bx bx-plus"></i>
              {{ quickTag }}
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineExpose, defineProps } from "vue";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import { getUserInfo } from "@/utils/user";
import dayjs from "dayjs";

const store = useStore();
const props = defineProps({
  detailInfo: {
    type: Object,
    default: () => ({
      status: 0, // 待开始
      priority: 1, // 中
      ownerId: getUserInfo()?.userId || "",
      memberList: [],
      tagList: [],
      creatorName: getUserInfo()?.name || "",
      startDate: dayjs().format("YYYY-MM-DD"),
    }),
  },
});
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
const taskForm = ref(formatDetailInfo());
// 状态列表
const statusList = ref([
  { label: "待开始", value: 0 },
  { label: "进行中", value: 1 },
  { label: "已完成", value: 2 },
  { label: "已暂停", value: 3 },
  { label: "已取消", value: 4 },
]);

// 优先级列表
const priorityList = ref([
  { label: "低", value: 0 },
  { label: "中", value: 1 },
  { label: "高", value: 2 },
  { label: "紧急", value: 3 },
]);

// 用户列表
const userList = computed(() => {
  return store.state.user.userList || [];
});

// 标签输入
const tagInput = ref("");

// 快捷标签
const quickTags = ref(["资料准备", "文件撰写", "内部审核", "客户沟通", "官方应对", "权利分析", "程序节点", "风险评估"]);

// 添加标签
const addTag = () => {
  if (!tagInput.value.trim()) {
    return;
  }

  // 检查是否已存在相同标签
  const isExist = taskForm.value.tagList.some(
    (tag) =>
      (tag.tagName || tag).toLowerCase().trim() ===
      tagInput.value.trim().toLowerCase()
  );

  if (!isExist) {
    taskForm.value.tagList.push({
      tagName: tagInput.value.trim(),
    });
  }

  tagInput.value = "";
};

// 添加快捷标签
const addQuickTag = (tagName) => {
  const isExist = taskForm.value.tagList?.some(
    (tag) => (tag.tagName || tag).toLowerCase() === tagName.toLowerCase()
  );

  if (!isExist) {
    taskForm.value.tagList.push({
      tagName: tagName,
    });
  }
};

// 删除标签
const removeTag = (index) => {
  taskForm.value.tagList.splice(index, 1);
};

const getFormData = () => {
  let data = JSON.parse(JSON.stringify(taskForm.value));

  // 验证状态（status 可能是 0，所以不能用 !data.status）
  if (data.status === undefined || data.status === null || data.status === "") {
    ElMessage.warning("请选择事项状态");
    return false;
  }

  // 验证优先级（priority 可能是 0，所以不能用 !data.priority）
  if (
    data.priority === undefined ||
    data.priority === null ||
    data.priority === ""
  ) {
    ElMessage.warning("请选择事项优先级");
    return false;
  }

  // 验证负责人
  if (!data.ownerId) {
    ElMessage.warning("请选择事项负责人");
    return false;
  }
  //格式化参数
  if (data.memberList && data.memberList.length > 0) {
    //变更参数为对象数组包括userId和userName
    data.memberList = data.memberList.map((item) => {
      const user = userList.value.find((user) => user.value === item);
      return {
        userId: item,
        userName: user.label,
      };
    });
  }
  //添加负责人的ownerName
  const owner = userList.value.find((user) => user.value === data.ownerId);
  data.ownerName = owner ? owner.label : "管理员";

  return data;
};

// 暴露方法给父组件
defineExpose({
  getFormData,
});
</script>

<style lang="scss" scoped>
.task-detail-edit {
  margin-top: 16px;
  padding: 16px 0;
  border-top: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
}

.content-title {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 16px;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 80px;

  .form-label {
    width: 80px;
    font-size: 14px;
    color: #606266;
    flex-shrink: 0;
  }

  .form-value {
    flex: 1;
    min-width: 0;
  }
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .section-header {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;

    i {
      font-size: 16px;
    }
  }

  .inherited-participants {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    background-color: #f5f7fa;
    border-radius: 4px;

    .inherited-bracket {
      color: #909399;
      font-size: 18px;
      line-height: 1.4;
      font-weight: normal;
    }

    .inherited-text {
      color: #909399;
      font-size: 12px;
      line-height: 1.4;
      flex: 1;
    }
  }

  .select-participants-btn {
    width: fit-content;
    display: flex;
    align-items: center;
    gap: 4px;

    i {
      font-size: 14px;
    }
  }

  .tags-input-wrapper {
    margin-bottom: 8px;
  }

  .tags-display {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .quick-tags {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .quick-tags-label {
      font-size: 12px;
      color: #909399;
    }

    .quick-tags-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;

      .quick-tag-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-left: 0;

        i {
          font-size: 12px;
        }
      }
    }
  }
}
</style>
