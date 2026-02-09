<script>
import { SimpleBar } from "simplebar-vue3";
import {
  queryItineraryList,
  createItinerary,
  deleteItinerary,
  modifyItinerary,
  queryItineraryDetail,
} from "@/api/schedule";
import {
  queryCustomerNameId,
  getCaseHistory,
  getAllCaseInfo,
} from "@/api/caseList";
import dayjs from "dayjs";
import { ElMessage } from "element-plus";
import { mapState } from "vuex";
import CaseSidebar from "@/components/sidebar/case-sidebar";
import CustomerSidebar from "@/components/sidebar/customer-sidebar";

export default {
  components: {
    SimpleBar,
    CaseSidebar,
    CustomerSidebar,
  },
  props: {
    containerHegiht: {
      type: Number,
    },
    cardDesc: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      tabList: [
        { value: "todo", label: "进行中" },
        { value: "finish", label: "已结束" },
      ],
      loading: false,
      selectedTab: "todo",
      addModalStatus: false,
      taskList: {
        activities: "",
        timeRange: [
          dayjs().format("YYYY-MM-DD h:m:s"),
          dayjs().add(1, "hour").format("YYYY-MM-DD h:m:s"),
        ],
        caseId: "",
        custId: "",
        details: "",
      },
      submitted: false,
      rules: {
        activities: [{ required: true, message: "此项为必填项" }],
        timeRange: [{ required: true, message: "此项为必填项" }],
      },
      custList: [],
      caseList: [],
      itineraryList: [],
      todayDate: dayjs().format("YYYY-MM-DD"),
      showDetailModal: false,
      detailInfo: {},
      caseLoading: false,
      custLoading: false,
      isCaseDetail: false,
      isCustDetail: false,
      showDelModal: false,
      mouseInner: false,
    };
  },
  methods: {
    changeCase(value) {
      if (!value) {
        return false;
      }
      const list = this.caseList.filter((item) => item.caseId === value);
      if (list && list.length) {
        // this.fetCustList(list[0].custName);
        queryCustomerNameId({
          isCustomer: 1,
          pageNo: 1,
          pageSize: 20,
          keyword: list[0].custName.replace(/[']/g, ""),
        }).then((res) => {
          this.custList = res.data;
          this.taskList.custId = list[0].custId;
        });
      }
    },
    changeCust(value) {
      if (!value) {
        return false;
      }
      this.taskList.caseId = "";
      getAllCaseInfo(
        { pageNo: 1, pageSize: 20, custIdArray: [value] },
        { isLoading: false }
      ).then((res) => {
        this.caseList = res.data;
      });
    },
    viewDetail(info) {
      this.fetchDetail(info.itId);
      this.showDetailModal = true;
    },
    fetchDetail(id) {
      queryItineraryDetail({ itId: id }).then((res) => {
        if (res.success) {
          this.detailInfo = res.data;
        }
      });
    },
    resetForm() {
      this.$refs.taskFormRef.resetFields();
      this.taskList = {
        activities: "",
        timeRange: [
          dayjs().format("YYYY-MM-DD h:m:s"),
          dayjs().add(1, "hour").format("YYYY-MM-DD h:m:s"),
        ],
        caseId: "",
        custId: "",
        details: "",
      };
      this.detailInfo = {};
    },
    deleteIt() {
      this.showDelModal = true;
    },
    confirmDeletion(){
      deleteItinerary({ itId: this.detailInfo.itId }).then((res) => {
          if (res.success) {
            res.message &&
              ElMessage({
                message: "删除成功",
                type: "success",
                duration: 3 * 1000,
              });
            this.showDelModal = false;
            this.addModalStatus = false;
            this.resetForm();
            this.fetchItineraryList();
          } else {
            res.message &&
              ElMessage({
                message: res.message,
                type: "error",
                duration: 3 * 1000,
              });
          }
        });
    },
    saveEditIt() {
      this.$refs.taskFormRef.validate((valid) => {
        if (valid) {
          const data = {
            activities: this.taskList.activities,
            itStartDate: this.taskList.timeRange[0],
            itEndDate: this.taskList.timeRange[1],
            caseList: this.caseInfoList,
            custList: this.custInfoList,
            details: this.taskList.details,
            itId: this.detailInfo.itId,
            itType: 1,
          };
          modifyItinerary(data).then((res) => {
            if (res.success) {
              ElMessage({
                message: "保存成功",
                type: "success",
                duration: 3 * 1000,
              });
              this.addModalStatus = false;
              this.resetForm();
              this.fetchItineraryList();
            } else {
              res.message &&
                ElMessage({
                  message: res.message,
                  type: "error",
                  duration: 3 * 1000,
                });
            }
          });
        }
      });
    },
    closeModal() {
      this.addModalStatus = false;
      this.showDetailModal = false;
      this.resetForm();
    },

    editModal() {
      const caseId = this.detailInfo?.caseList[0]?.caseId;
      const caseName = this.detailInfo?.caseList[0]?.caseName;
      const custId = this.detailInfo?.custList[0]?.custId;
      const custName = this.detailInfo?.custList[0]?.custName;
      if (caseId && caseName) {
        this.fetchCaseList(caseName);
      } else {
        this.firstFetCaseList();
      }
      if (custId && custName) {
        this.fetCustList(custName);
      } else {
        this.firstFetCustList();
      }
      this.taskList = this.detailInfo;
      this.taskList.caseId = caseId;
      this.taskList.custId = custId;
      this.taskList.timeRange = [
        this.detailInfo.itStartDate,
        this.detailInfo.itEndDate,
      ];
      this.addModalStatus = true;
      this.showDetailModal = false;
    },
    addIt() {
      this.$refs.taskFormRef.validate((valid) => {
        if (valid) {
          this.createIt();
        }
      });
    },
    fetchItineraryList() {
      this.loading = true;
      const data = {
        keyWord: this.selectedTab,
        userId: this.userId,
        pageNo: 1,
        pageSize: 99999,
      };
      queryItineraryList(data).then((res) => {
        this.itineraryList = res.data;
        this.loading = false;
      });
    },
    createIt() {
      const data = {
        activities: this.taskList.activities,
        itStartDate: this.taskList.timeRange[0],
        itEndDate: this.taskList.timeRange[1],
        caseList: this.caseInfoList,
        custList: this.custInfoList,
        details: this.taskList.details,
        itType: 1,
        personList: [{ userId: this.userId, wx: 0 }],
      };
      createItinerary(data).then((res) => {
        if (res.success) {
          ElMessage({
            message: "添加成功",
            type: "success",
            duration: 3 * 1000,
          });
          this.addModalStatus = false;
          this.resetForm();
          this.fetchItineraryList();
        } else {
          res.message &&
            ElMessage({
              message: res.message,
              type: "error",
              duration: 3 * 1000,
            });
        }
      });
    },
    addModal() {
      this.resetForm();
      this.addModalStatus = true;
      this.firstFetCustList();
      this.firstFetCaseList();
    },
    changeTab(value) {
      this.selectedTab = value;
    },
    fetCustList(query) {
      if (!this.custLoading) {
        if (query) {
          this.custLoading = true;
          queryCustomerNameId({
            isCustomer: 1,
            pageNo: 1,
            pageSize: 20,
            keyword: query.replace(/[']/g, ""),
          }).then((res) => {
            this.custList = res.data;
            this.custLoading = false;
          });
        }
      }
    },
    fetchCaseList(query) {
      if (!this.caseLoading) {
        if (query) {
          this.caseLoading = true;
          getCaseHistory({
            pageNo: 1,
            pageSize: 100,
            keyWord: query.replace(/[']/g, ""),
            businessList: [2, 3, 4, 5, 6, 11, 23],
          }).then((res) => {
            this.caseList = res.data;
            this.caseLoading = false;
          });
        }
      }
    },
    firstFetCaseList() {
      getCaseHistory({
        pageNo: 1,
        pageSize: 20,
        businessList: [2, 3, 4, 5, 6, 11, 23],
      }).then((res) => {
        this.caseList = res.data;
      });
    },

    firstFetCustList() {
      queryCustomerNameId({
        isCustomer: 1,
        pageNo: 1,
        pageSize: 20,
      }).then((res) => {
        this.custList = res.data;
      });
    },
    toggleCaseSidebar() {
      this.taskType = this.detailInfo?.caseList[0]?.taskType;
      this.caseId = this.detailInfo?.caseList[0]?.caseId;
      this.isCaseDetail = true;
    },
    caseSidebarUpdate(value) {
      this.isCaseDetail = value;
    },
    toggleCustSidebar() {
      this.custId = this.detailInfo?.custList[0]?.custId;
      if (this.custId) {
        this.isCustDetail = true;
      }
    },
    custSidebarUpdate(value) {
      this.isCustDetail = value;
    },
    handleMouseLeave(event) {
      if (event.relatedTarget && event.relatedTarget.classList) {
        const contentClass = [
          "el-popover--plain",
          "el-popover",
          "is-light",
          "el-popper",
          "el-popper__arrow"
        ];
        let isLeave = true;
        contentClass.forEach((item) => {
          if (event.relatedTarget.classList.contains(item)) {
            return (isLeave = false);
          }
        });
        if (event.relatedTarget.classList.length == 0) {
          isLeave = false;
        }
        if (isLeave) {
          this.$nextTick(() => {
            if (this.$refs.descPopoverRef) {
              this.$refs.descPopoverRef.hide();
            }
            setTimeout(() => {
              this.mouseInner = false;
            }, 100);
          });
        }
      } else {
        this.mouseInner = false;
      }
    },
  },
  computed: {
    ...mapState({
      userId: (state) => state.user.userId,
    }),
    caseInfoList() {
      const list = this.caseList.filter(
        (item) => item.caseId == this.taskList.caseId
      );
      if (list.length == 0) {
        return [];
      } else {
        return [
          {
            caseId: list[0].caseId,
            caseName: list[0].caseName,
            agentNum: list[0].agentNum,
          },
        ];
      }
    },
    custInfoList() {
      const list = this.custList.filter(
        (item) => item.custId == this.taskList.custId
      );
      if (list.length == 0) {
        return [];
      } else {
        return [{ custId: list[0].custId, custName: list[0].fullname }];
      }
    },
    contentHeight(){
      return this.containerHegiht - 180
    }
  },
  created() {
    if (this.userId) {
      this.fetchItineraryList();
    }
  },
  watch: {
    selectedTab: {
      handler: function () {
        this.fetchItineraryList();
      },
      deep: true,
    },
    userId: {
      handler: function () {
        this.fetchItineraryList();
      },
    },
  },
};
</script>
<template>
  <div 
    class="card"
    @mouseenter="mouseInner = true"
    @mouseleave="handleMouseLeave"
  >
    <div class="card-body pb-0">
      <div class="mb-4 d-flex align-items-center gap-1">
        <h4 class="card-title mb-0">
          <span>计划日程</span>
          <el-popover
            placement="bottom-start"
            title="计划日程"
            :width="350"
            trigger="hover"
            :content="cardDesc"
            ref="descPopoverRef"
          >
            <template #reference>
              <i v-show="cardDesc&&mouseInner" class="bx bx-help-circle" style="font-size: 16px;cursor: pointer;margin-left: 4px;"></i>
            </template>
          </el-popover>
        </h4>
      </div>
      <b-tabs
        pills
        nav-class="bg-light rounded"
        content-class="mt-4"
      >
        <b-tab
          :title="item.label"
          v-for="item of tabList"
          :key="item.value"
          @click="changeTab(item.value)"
        >
          <b-card-text 
            v-loading="loading"
            element-loading-text="请等待">
            <SimpleBar
              data-simplebar
              :style="{ height:`${contentHeight}px`}"
            >
              <ul class="verti-timeline list-unstyled">
                <li
                  v-for="it of itineraryList"
                  :key="it.itId"
                  class="event-list"
                  :class="{
                    active: it.itDate == todayDate,
                  }"
                >
                  <div class="event-timeline-dot">
                    <i
                      class="bx font-size-18"
                      :class="{
                        'bx-fade-right': it.itDate == todayDate,
                        'bx-right-arrow-circle': it.itDate !== todayDate,
                        'bxs-right-arrow-circle': it.itDate == todayDate,
                      }"
                    ></i>
                  </div>
                  <div class="d-flex">
                    <div class="me-3">
                      <h5 class="font-size-14" style="white-space: nowrap;">
                        {{ it.itDate }}
                        <i
                          class="bx bx-right-arrow-alt font-size-16 text-primary align-middle ms-2"
                        ></i>
                      </h5>
                    </div>
                    <div class="flex-grow-1">
                      <div>
                        <a
                          href="javascript: void(0);"
                          @click="viewDetail(it)"
                          >{{ it.activities }}</a
                        >
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
              <el-empty
                v-if="!itineraryList.length"
                description="暂无日程"
                :image-size="100"
              />
            </SimpleBar>
          </b-card-text>
        </b-tab>
      </b-tabs>
    </div>

    <div class="card-footer bg-transparent border-top">
      <div class="text-center">
        <a
          href="javascript: void(0);"
          class="btn btn-primary"
          @click="addModal"
        >
          添加新任务
        </a>
      </div>
    </div>
  </div>
  <b-modal
    :title="detailInfo.itId ? '修改计划' : '添加新计划'"
    v-model="addModalStatus"
    hide-footer
    centered
    @close="resetForm"
    :no-close-on-backdrop="true"
  >
    <el-form
      :model="taskList"
      :rules="rules"
      ref="taskFormRef"
      class="taskForm"
    >
      <el-form-item
        label="标题"
        prop="activities"
      >
        <el-input
          v-model="taskList.activities"
          placeholder="请输入标题"
        />
      </el-form-item>
      <el-form-item
        label="时间范围"
        prop="timeRange"
      >
        <el-date-picker
          id="timeRange"
          v-model="taskList.timeRange"
          type="datetimerange"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          format="YYYY/MM/DD hh:mm:ss"
          value-format="YYYY-MM-DD h:m:s"
          date-format="YYYY/MM/DD ddd"
          time-format="hh:mm:ss"
        />
      </el-form-item>
      <el-form-item
        label="关联案件"
        prop="caseId"
      >
        <el-select
          v-model="taskList.caseId"
          filterable
          remote
          clearable
          reserve-keyword
          placeholder="输入关键字搜索关联案件"
          remote-show-suffix
          :remote-method="fetchCaseList"
          popper-class="caseSelect"
          @change="changeCase"
        >
          <el-option
            v-for="item in caseList"
            :key="item.caseId"
            :label="`${item.agentNum}${
              item.caseName ? '-' + item.caseName : ''
            } `"
            :value="item.caseId"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="关联客户"
        prop="custId"
      >
        <el-select
          v-model="taskList.custId"
          filterable
          remote
          clearable
          reserve-keyword
          placeholder="输入关键字搜索关联客户"
          remote-show-suffix
          :remote-method="fetCustList"
          @change="changeCust"
        >
          <el-option
            v-for="item in custList"
            :key="item.custId"
            :label="item.fullname"
            :value="item.custId"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="描述"
        prop="details"
      >
        <el-input
          id="details"
          type="textarea"
          v-model="taskList.details"
          placeholder="请输入描述"
          :rows="3"
        />
      </el-form-item>
      <div class="text-end mt-3">
        <b-button
          variant="light"
          @click="closeModal"
          >取消</b-button
        >
        <b-button
          v-if="detailInfo.itId"
          variant="danger"
          class="ms-1"
          @click="deleteIt()"
          >删除</b-button
        >
        <b-button
          v-if="detailInfo.itId"
          variant="success"
          class="ms-1"
          @click="saveEditIt()"
          >保存</b-button
        >
        <b-button
          v-if="!detailInfo.itId"
          variant="success"
          class="ms-1"
          @click="addIt()"
          >添加计划</b-button
        >
      </div>
    </el-form>
  </b-modal>
  <b-modal
    v-model="showDetailModal"
    title="计划日程"
    centered
    hide-footer
    @close="resetForm"
    style="z-index: 1040"
    content-class="autoWidth-modal"
  >
    <div class="table-responsive">
      <table
        class="table table-td-nowrap mb-0"
        style="width: 100%"
      >
        <tbody>
          <tr v-if="detailInfo.itType == 0">
            <th
              scope="row"
              style="width: 20%"
            >
              会议 :
            </th>
            <td style="width: 80%">{{ detailInfo.title }}</td>
          </tr>
          <tr v-if="detailInfo.itType == 0">
            <th
              scope="row"
              style="width: 20%"
            >
              活动 :
            </th>
            <td style="width: 80%">{{ detailInfo.activities }}</td>
          </tr>
          <tr v-if="detailInfo.itType == 0">
            <th
              scope="row"
              style="width: 20%"
            >
              地点 :
            </th>
            <td style="width: 80%">{{ detailInfo.site }}</td>
          </tr>
          <tr v-if="detailInfo.itType == 1">
            <th
              scope="row"
              style="width: 20%"
            >
              标题 :
            </th>
            <td style="width: 80%">{{ detailInfo.activities }}</td>
          </tr>

          <tr>
            <th scope="row">时间范围 :</th>
            <td>{{ detailInfo.itStartDate }} - {{ detailInfo.itEndDate }}</td>
          </tr>
          <tr v-if="detailInfo.itType == 1">
            <th scope="row">关联案件 :</th>
            <td>
              <span
                class="agent-number"
                v-on:click="toggleCaseSidebar"
                >{{
                  detailInfo?.caseList?.length
                    ? detailInfo.caseList[0].agentNum
                    : ""
                }}</span
              >
            </td>
          </tr>
          <tr>
            <th scope="row">关联客户 :</th>
            <td>
              <span
                :class="{'agent-number': detailInfo?.custList?.length > 0 && detailInfo?.custList[0]?.custId}"
                v-on:click="toggleCustSidebar"
              >
                {{
                  detailInfo?.custList?.length
                    ? detailInfo.custList
                        .map((item) => item.custName)
                        .join("；")
                    : ""
                }}
              </span>
            </td>
          </tr>
          <tr>
            <th scope="row">描述 :</th>
            <td>{{ detailInfo.details }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div
      class="text-end mt-3"
      v-if="selectedTab == 'todo' && detailInfo.itType == 1"
    >
      <b-button
        variant="light"
        @click="closeModal"
        >取消</b-button
      >
      <a
        href="javascript: void(0);"
        class="btn btn-primary ms-1"
        @click="editModal"
      >
        编辑
      </a>
    </div>
  </b-modal>
  <b-modal
    v-model="showDelModal"
    title-class="text-black font-18"
    body-class="px-4 py-5 text-center"
    hide-header
    hide-footer
    class="v-modal-custom"
    size="sm"
    centered
  >
    <button
      type="button"
      class="btn-close position-absolute end-0 top-0 m-3"
      @click="showDelModal = !showDelModal"
    ></button>

    <div class="avatar-sm mb-4 mx-auto">
      <div
        class="avatar-title bg-primary text-primary bg-opacity-10 font-size-20 rounded-3"
      >
        <i class="mdi mdi-trash-can-outline"></i>
      </div>
    </div>
    <p class="text-muted font-size-16 mb-4">
      确定要删除该日程吗
    </p>

    <div class="hstack gap-2 justify-content-center mb-0">
      <button
        type="button"
        class="btn btn-danger"
        @click="confirmDeletion"
      >
        立即删除
      </button>
      <button
        type="button"
        class="btn btn-secondary"
        @click="showDelModal = !showDelModal"
      >
        取消
      </button>
    </div>
  </b-modal>
  <CaseSidebar
    v-if="isCaseDetail"
    :showSidebar="isCaseDetail"
    @update:showSidebar="caseSidebarUpdate"
    :caseId="caseId"
    :taskType="taskType"
  />
  <CustomerSidebar
    :custId="custId"
    v-if="isCustDetail"
    :showSidebar="isCustDetail"
    @update:showSidebar="custSidebarUpdate"
  />
</template>
<style lang="scss">
.event-list {
  padding: 0px 0px 12px 30px !important;
}
:deep(.dataTimeSelect) {
  display: block;
}
.taskForm .el-form-item {
  display: block;
}

.caseSelect .el-select-dropdown__item {
  max-width: 480px; /* 设置最大宽度 */
}
.agent-number {
  cursor: pointer;
  color: #556ee6 !important;
} 
.card-title {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
