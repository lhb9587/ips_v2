<template>
  <div class="card">
    <div class="card-body">
      <div class="event-header">
        <h4 class="card-title mb-4">重大事件</h4>
        <div>
          <el-button
            type="primary"
            @click="addEvent"
            >添加事件</el-button
          >
        </div>
      </div>
      <div class="table-responsive">
        <el-table
          :data="dataList"
          :fit="true"
          :max-height="maxHeight"
          :show-overflow-tooltip="true"
          :scrollbar-always-on="true"
          @cell-click="viewDetail"
          :row-style="{ cursor: 'pointer' }"
        >
          <el-table-column
            :prop="col.value"
            :label="col.title"
            v-for="col of columns"
            :key="col.value"
            :width="col.width ? col.width : 'auto'"
          >
            <template
              #default="scope"
              v-if="col.value == 'operate'"
            >
              <div
                class="d-flex gap-2"
                v-if="scope.row.isModifyOrDelete || permissions.includes(507)"
              >
                <button
                  type="button"
                  class="btn btn-soft-primary btn-sm btn-rounded"
                  @click.stop="editInfo(scope.row)"
                >
                  编辑
                </button>
                <button
                  type="button"
                  class="btn btn-soft-danger btn-sm btn-rounded"
                  @click.stop="delEvent(scope.row)"
                >
                  删除
                </button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
  <b-modal
    v-model="modalStatus"
    @hidden="closeEventModal"
    :no-close-on-backdrop="true"
    centered
    size="lg"
    :no-fade="true"
    :no-close-on-esc="true"
    body-class="creatme-modal"
    hide-footer
  >
    <template #header>
      <div
        class="my-header"
        style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        "
      >
        <div class="d-flex align-items-center">
          <span style="font-size: 16px">{{
            eventForm.eventId ? "编辑事件" : "新建事件"
          }}</span>
          <el-popover
            placement="bottom-start"
            title="事件类型描述"
            :width="500"
            trigger="hover"
            ref="descPopoverRef"
            popper-style="{'width':'auto'}"
          >
            <template #reference>
              <i
                class="bx bx-help-circle"
                style="font-size: 16px; cursor: pointer; margin-left: 4px"
              ></i>
            </template>
            <div>
              <div class="d-flex">
                <div class="tip-title">关联公司变更：</div>
                <div>客户发生控股、被控股、并购、股东变更等情况；</div>
              </div>
              <div class="d-flex">
                <div class="tip-title">对手公司动态：</div>
                <div>关注的竞争对手发生了重要行为，如诉讼、战略变动；</div>
              </div>
              <div class="d-flex">
                <div class="tip-title">内部结构调整：</div>
                <div>客户出现重大高管更替、组织架构调整；</div>
              </div>
              <div class="d-flex">
                <div class="tip-title">法律诉讼：</div>
                <div>涉及客户或对手方的重大案件、判决</div>
              </div>
              <div class="d-flex">
                <div class="tip-title">商业合作：</div>
                <div>客户与第三方达成战略合作、合资等；</div>
              </div>
              <div class="d-flex">
                <div class="tip-title">风险信息：</div>
                <div>涉及客户的不良舆论、处罚、媒体曝光等；</div>
              </div>
              <div class="d-flex">
                <div class="tip-title">行业政策影响：</div>
                <div>新政/监管规则对客户经营有重大影响（如平台监管加强）。</div>
              </div>
            </div>
          </el-popover>
        </div>
        <div
          style="width: 16px; cursor: pointer"
          @click="closeEventModal"
        >
          <span class="btn-close"></span>
        </div>
      </div>
    </template>
    <div class="majorEvents-form">
      <el-form
        :model="eventForm"
        ref="eventFormRef"
        label-width="80px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="事件标题"
              prop="title"
              :rules="[
                {
                  required: true,
                  message: '请输入事件标题',
                  trigger: 'change',
                },
              ]"
            >
              <el-input
                v-model="eventForm.title"
                placeholder="请输入事件标题"
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="事件类型"
              prop="eventType"
              :rules="[
                {
                  required: true,
                  message: '请输入事件类型',
                  trigger: 'change',
                },
              ]"
            >
              <el-select
                v-model="eventForm.eventType"
                placeholder="请输入事件类型"
                clearable
              >
                <el-option
                  v-for="item in typeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              /></el-select>
            </el-form-item> </el-col
        ></el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="涉及公司"
              prop="involvedCompanies"
              :rules="[
                {
                  required: true,
                  message: '请输入涉及公司',
                  trigger: 'change',
                },
              ]"
            >
              <el-select
                v-model="eventForm.involvedCompanies"
                placeholder="请输入涉及公司"
                clearable
                filterable
                multiple
                remote
                :remote-method="fetchInvolvedCompanies"
                allow-create
              >
                <el-option
                  v-for="item in companyList"
                  :key="item.companyName"
                  :label="item.companyName"
                  :value="item.companyName"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="时间"
              prop="eventDate"
              :rules="[
                {
                  required: true,
                  message: '请选择时间',
                  trigger: 'change',
                },
              ]"
            >
              <el-date-picker
                v-model="eventForm.eventDate"
                type="date"
                placeholder="请选择时间"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item> </el-col
        ></el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item
              label="事件描述"
              prop="description"
            >
              <el-input
                v-model="eventForm.description"
                type="textarea"
                placeholder="请输入事件描述"
                :autosize="{ minRows: 3, maxRows: 5 }"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item
              label="来源"
              prop="eventSource"
            >
              <el-input
                v-model="eventForm.eventSource"
                placeholder="请输入事件来源"
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div class="text-end modal-footer">
      <el-button @click="closeEventModal">取消</el-button>
      <el-button
        type="primary"
        @click="submitForm"
        >确定</el-button
      >
    </div>
  </b-modal>

  <MajorEventInfo
    v-model="detailModalStatus"
    :eventDetail="eventDetail"
    :showFooter="false"
  />
</template>

<script setup>
import { ref, onMounted, defineProps, computed,watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getEventList,
  getCompanyName,
  createEvent,
  updateEvent,
  deleteEvent,
  querycustSelectClass,
} from "@/api/customerList";

import { useStore } from "vuex";
const store = useStore();

import MajorEventInfo from "./majorEvent-info/index.vue";
const permissions = computed(() => store.state.user.permissions);

const props = defineProps({
  customerInfo: {
    type: Object,
    default: () => {},
  },
});
const eventForm = ref({});
const eventFormRef = ref(null);
const eventDetail = ref({});
const modalStatus = ref(false);
const custId = computed(() => props.customerInfo.custId);
const custInfo = computed(() => props.customerInfo);
const companyList = ref([]);
const detailModalStatus = ref(false);

const dataList = ref([]);
const maxHeight = document.documentElement.clientHeight - 204;
const columns = [
  { title: "事件标题", value: "title" },
  { title: "事件类型", value: "eventTypeStr" },
  { title: "涉及公司", value: "involvedCompanies" },
  { title: "事件描述", value: "description" },
  { title: "时间", value: "eventDate" },
  { title: "来源", value: "eventSource" },
  { title: "添加人", value: "createUserIdStr", width: 80 },
  { title: "操作", value: "operate", width: 120 },
];

watch(custId, () => {
  fetchDataList();
});

const typeOptions = ref([]);
//获取事项类型
const fetchtypeOptions = () => {
  querycustSelectClass({ classId: 1186 }).then((res) => {
    const data = res.data[1186] || [];
    typeOptions.value = data.map((item) => {
      return {
        label: item.typeName,
        value: item.id,
      };
    });
  });
};
const fetchDataList = () => {
  const params = {
    custId: custId.value,
    pageSize: 9999,
  };
  getEventList(params).then((res) => {
    dataList.value = res.data || [];
  });
};
//获取涉及公司列表
const fetchInvolvedCompanies = (value) => {
  if (!value) return;
  getCompanyName({ keyword: value }).then((res) => {
    companyList.value = res.data || [];
  });
};
const addEvent = () => {
  modalStatus.value = true;
};
const closeEventModal = () => {
  modalStatus.value = false;
  resetForm();
};
const resetForm = () => {
  eventForm.value = {};
  eventFormRef.value.resetFields();
};
const viewDetail = (info) => {
  eventDetail.value = {
    eventId: info.eventId,
    title: info.title,
    eventType: info.eventType,
    eventTypeStr: info.eventTypeStr,
    involvedCompanies: info.involvedCompanies,
    eventDate: info.eventDate,
    description: info.description,
    eventSource: info.eventSource,
    createUserIdStr: info.createUserIdStr,
    custName: custInfo.value.fullname,
  };
  detailModalStatus.value = true;
};
const editInfo = (info) => {
  let companys;
  if (info.involvedCompanies) {
    companys = info.involvedCompanies?.split(";");
    console.log(companys, "companys");
    companyList.value = companys.map((item) => {
      return {
        companyName: item,
      };
    });
  }
  eventForm.value = {
    eventId: info.eventId,
    title: info.title,
    eventType: info.eventType,
    involvedCompanies: companys,
    eventDate: info.eventDate,
    description: info.description,
    eventSource: info.eventSource,
  };
  modalStatus.value = true;
};
const delEvent = (info) => {
  ElMessageBox.confirm("确认要删除该重大事件吗", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    deleteEvent({ eventId: info.eventId }).then((res) => {
      if (res.success) {
        fetchDataList();
        ElMessage.success("删除成功");
      }
    });
  });
};
const submitFormData = async () => {
  const companylist = eventForm.value.involvedCompanies;
  const companystr = companylist.join(";");
  const params = {
    ...eventForm.value,
    custId: custId.value,
    involvedCompanies: companystr,
  };
  let res = {};
  if (eventForm.value.eventId) {
    res = await updateEvent(params);
  } else {
    res = await createEvent(params);
  }
  if (res.success) {
    modalStatus.value = false;
    fetchDataList();
    resetForm();
    ElMessage.success("操作成功");
  }
};
const submitForm = () => {
  eventFormRef.value.validate((valid) => {
    if (valid) {
      submitFormData();
    } else {
      ElMessage.warning("请填写必填项");
      return false;
    }
  });
};
onMounted(() => {
  fetchtypeOptions();
  if (custId.value) {
    fetchDataList();
  }
});
</script>
<style lang="scss" scoped>
.event-header {
  display: flex;
  justify-content: space-between;
}
.majorEvents-form {
  padding: 16px 16px 0 16px;
}
</style>

<style lang="scss">
.creatme-modal {
  padding: 0;
}
</style>
