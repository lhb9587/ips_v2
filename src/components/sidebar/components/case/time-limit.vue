<script>
import dayjs from "dayjs";
import { getCaseTimelimitList } from "@/api/caseList";
// import LimitDetail from "@/components/sidebar/components/limit/detail.vue";
import Pagination from "@/components/common/pagination/index.vue";

export default {
  name: "TimeLimit",
  components: {
    // LimitDetail,
    Pagination,
  },
  props: {
    caseInfo: {
      type: Object,
      required: () => {},
    },
  },
  data() {
    return {
      // default page size
      perPage: 2,
      // start and end index
      startIndex: 1,
      endIndex: 2,
      fetchingStats: true,
      timelimitState: "",
      detail: {},
      maxHeight: document.documentElement.clientHeight - 198,
      columns: [
        { title: "时限类型", value: "typeName" },
        {
          title: "绝限日期",
          value: "abslimitDate",
        },
        {
          title: "状态",
          value: "writeoffState",
          custom: true,
        },
        { title: "时限员工", value: "timeUser" },
        {
          title: "监督员工",
          value: "watcherUserNmaes",
        },
        {
          title: "时限种类",
          value: "kindStr",
        },
        {
          title: "操作",
          value: "operate",
          custom: true,
        },
      ],
      tableData: [],
      total: 0,
      showDetailModal: false,
      listQuery: {
        pageNo: 1,
        pageSize: 10,
      },
      pageSizesList: [10, 50, 100, 500],
    };
  },
  computed: {
    caseId() {
      return this.caseInfo.caseId;
    },
  },
  created() {
    console.log(this.caseInfo, "caseInfo!!");
    this.fetchLimitList();
    this.startIndex = 1;
    this.endIndex = this.perPage;
  },
  watch: {
    timelimitState: {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.fetchLimitList();
        }
      },
    },
  },
  methods: {
    dayjs,
    viewDetail(data) {
      this.detail = data || {};
      this.showDetailModal = true;
    },
    fetchLimitList() {
      const data = {
        caseId: this.caseId,
        timelimitState: this.timelimitState,
        ...this.listQuery,
      };
      getCaseTimelimitList(data)
        .then((res) => {
          this.tableData = res.data || [];
          this.total = res.total || 0;
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>
<template>
  <div class="card mb-0">
    <div class="btn-toolbar p-3 pb-0 d-block">
      <div>
        <div
          class="btn-group btn-group-sm"
          role="group"
          aria-label="Basic radio toggle button group"
        >
          <input
            type="radio"
            class="btn-check"
            name="btnradio"
            id="btnradio1"
            autocomplete="off"
            checked
            @click="timelimitState = ''"
          />
          <label
            class="btn btn-outline-primary"
            for="btnradio1"
            >全部</label
          >

          <input
            type="radio"
            class="btn-check"
            name="btnradio"
            id="btnradio2"
            autocomplete="off"
            @click="timelimitState = 1"
          />
          <label
            class="btn btn-outline-primary"
            for="btnradio2"
            >未核销</label
          >

          <input
            type="radio"
            class="btn-check"
            name="btnradio"
            id="btnradio3"
            autocomplete="off"
            @click="timelimitState = 2"
          />
          <label
            class="btn btn-outline-primary"
            for="btnradio3"
            >已核销</label
          >
        </div>

        <!-- <button
          type="button"
          class="btn btn-primary btn-sm float-end"
        >
          <i class="fa fa-plus"></i> 创建时限
        </button> -->
      </div>
    </div>
    <div class="p-3 pt-0">
      <el-table
        :data="tableData"
        :max-height="maxHeight"
        :fit="true"
        :show-overflow-tooltip="true"
      >
        <el-table-column
          :prop="col.value"
          :label="col.title"
          v-for="col of columns"
          :key="col.value"
        >
          <template #default="scope">
            <button
              v-if="col.value === 'operate'"
              type="button"
              class="btn btn-soft-primary btn-sm btn-rounded"
              @click="viewDetail(scope.row)"
            >
              查看详情
            </button>
            <span
              v-if="col.value === 'writeoffState'"
              class="badge badge-pill badge-soft-success font-size-11"
              :class="{
                'badge-soft-warning': `${scope.row.writeoffState}` < 1,
              }"
              >{{ scope.row.writeoffState ? "已核销" : "未核销" }}</span
            >
          </template>
        </el-table-column>
      </el-table>
      <div
        class="mt-3"
        v-if="total > 0"
      >
        <Pagination
          :total="total"
          v-model:page="listQuery.pageNo"
          v-model:limit="listQuery.pageSize"
          @pagination="fetchLimitList"
          :pageSizes="pageSizesList"
        ></Pagination>
      </div>
    </div>
  </div>
  <!-- <div class="row justify-content-md-between align-items-md-center">
    <div class="col-xl-7">
      显示 {{ startIndex }} - {{ endIndex }} 共 {{ total }} 条
    </div>
    <div class="col-xl-5">
      <div class="text-md-right float-end mt-2 pagination-rounded">
        <b-pagination
          v-model="currentPage"
          :total-rows="total"
          :per-page="perPage"
          @input="onPageChange"
        ></b-pagination>
      </div>
    </div>
  </div> -->
  <b-modal
    v-model="showDetailModal"
    title="时限详情"
    centered
    hide-footer
    content-class="autoWidth-modal"
  >
    <div class="table-responsive">
      <table
        class="table table-td-nowrap mb-0"
        style="width: 100%"
      >
        <tbody>
          <tr>
            <th
              scope="row"
              style="width: 15%"
            >
              案件文号 :
            </th>
            <td style="width: 35%">
              {{ detail.agentNum }}
            </td>
            <th
              scope="row"
              style="width: 15%"
            >
              客户 :
            </th>

            <td style="width: 35%">
              {{ detail.custName }}
            </td>
          </tr>
          <tr>
            <th scope="row">时限种类 :</th>
            <td>{{ detail.kindStr }}</td>
            <th scope="row">时限类型 :</th>
            <td>{{ detail.kindStr }}</td>
          </tr>
          <tr>
            <th scope="row">计算基准日期 :</th>
            <td>{{ detail.sendDateStart }}</td>
            <th scope="row">绝限日期 :</th>
            <td>{{ detail.abslimitDate }}</td>
          </tr>
          <tr>
            <th scope="row">内部期限 :</th>
            <td>{{ detail.abslimitInternalDate }}</td>
            <th scope="row">时限工作组 :</th>
            <td>{{ detail.timeWorks }}</td>
          </tr>
          <tr v-if="detail.writeoffState > 0">
            <th scope="row">时限状态 :</th>
            <td>{{ detail.writeoffState > 0 ? "已核销" : "未核销" }}</td>
            <th scope="row">处理方式 :</th>
            <td>{{ detail.operation }}</td>
          </tr>
          <tr v-if="detail.writeoffState > 0">
            <th scope="row">核销人 :</th>
            <td>{{ detail.writeoffUserName }}</td>
            <th scope="row">核销日期 :</th>
            <td>{{ detail.writeoffDate }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </b-modal>
</template>
