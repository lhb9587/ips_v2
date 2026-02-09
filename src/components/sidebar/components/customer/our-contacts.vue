<script>
import OrgchartContacts from "./orgchart-contacts.vue";
import { queryAgencyContactListUrl } from "@/api/customerList";
import defaultAvatar from '@/assets/images/users/defaultavatar.png';

export default {
  props: {
    customerAddrList: {
      type: Array,
      default: () => [],
    },
    customerInfo: {
      type: Object,
      default: () => {},
    },
  },
  components: {
    OrgchartContacts,
  },
  data() {
    return {
      columns: [
        { title: "姓名", value: "fullname" },
        {
          title: "业务领域",
          value: "business",
        },
        {
          title: "开始日期",
          value: "startdate",
        },
        { title: "查全部案件", value: "ischeckStr" },
        {
          title: "操作",
          value: "operate",
        },
      ],
      showOurContactsModal: false,
      detail: {},
      maxHeight: document.documentElement.clientHeight - 248,
      selectedTab: 0,
      tabList: [
        { value: 0, label: "关系网络" },
        { value: 1, label: "列表" },
      ],
      dataList: [],
      tableData: [],
      defaultAvatar:defaultAvatar
    };
  },
  methods: {
    viewDetail(row) {
      this.showOurContactsModal = true;
      this.detail = row;
    },
    fetListData() {
      if (!this.customerInfo.custId) return false;
      queryAgencyContactListUrl({
        customerID: this.customerInfo.custId,
        hasBussiness: 1,
      }).then((res) => {
        //根据noDetail，noDetail ==1排在前面
        this.dataList = res.data
          .sort((a, b) => {
            return b.noDetail - a.noDetail;
          })
          .map((item) => {
            return {
              ...item,
              id: this.simpleHash(item.fullname),
              name: item.fullname,
              parentId: item.business ? this.simpleHash(item.business) : undefined,
              role: item.name,
              image: item.userIcon ? `/ipdoc${item.userIcon}` : this.defaultAvatar,
              location: item.startdate,
            };
          });
      });
    },
    simpleHash(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0; // 转为32位整数
      }
      return hash;
    },
    fetTableData() {
      queryAgencyContactListUrl({
        customerID: this.customerInfo.custId,
      }).then((res) => {
        this.tableData = res.data || [];
      });
    },
  },
  watch: {
    "customerInfo.custId": {
      handler(val) {
        if (val) {
          this.fetListData();
          this.fetTableData();
        }
      },
      immediate: true,
    },
  },
};
</script>
<template>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-4">我方联系人</h4>
      <b-tabs
        pills
        nav-class="bg-light rounded"
        content-class="mt-2"
        v-model="selectedTab"
      >
        <b-tab
          :title="item.label"
          v-for="item of tabList"
          :key="item.value"
        >
        </b-tab>
      </b-tabs>
      <div
        class="table-responsive"
        v-if="selectedTab"
      >
        <el-table
          :data="tableData"
          :fit="true"
          :max-height="maxHeight"
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
                v-if="col.value === 'ischeckStr'"
                class="badge badge-pill font-size-11"
                :class="{
                  'badge-soft-warning': `${scope.row.ischeckStr}` == '否',
                  'badge-soft-success': `${scope.row.ischeckStr}` == '是',
                }"
                >{{ scope.row.ischeckStr }}</span
              >
            </template></el-table-column
          >
        </el-table>
      </div>
      <div
        v-if="!selectedTab"
        :style="{ height: maxHeight }"
      >
        <OrgchartContacts
          contactstype="ourside"
          :maxHeight="maxHeight"
          :custId="customerInfo.custId"
          :dataList="dataList"
        />
      </div>
    </div>
  </div>
  <b-modal
    v-model="showOurContactsModal"
    title="我方联系人-查看"
    centered
    hide-footer
    size="lg"
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
              姓名 :
            </th>
            <td style="width: 35%">
              {{ detail.fullname }}
            </td>
            <th
              scope="row"
              style="width: 15%"
            >
              业务领域 :
            </th>
            <td style="width: 35%">{{ detail.business }}</td>
          </tr>
          <tr>
            <th scope="row">案件类型 :</th>
            <td>
              {{ detail.caseTypeStr }}
            </td>
            <th scope="row">职位 :</th>
            <td>{{ detail.position }}</td>
          </tr>
          <tr>
            <th scope="row">开始日期 :</th>
            <td>
              {{ detail.startdate }}
            </td>
            <th scope="row">截至日期 :</th>
            <td>{{ detail.enddate }}</td>
          </tr>
          <tr>
            <th scope="row">角色描述 :</th>
            <td>
              {{ detail.userrole }}
            </td>
            <th scope="row">能否查看全部案件 :</th>
            <td>{{ detail.ischeck ? "是" : "否" }}</td>
          </tr>
          <tr>
            <th scope="row">能否查看全部时限 :</th>
            <td>
              {{ detail.isAllTlt ? "是" : "否" }}
            </td>
            <th scope="row">是否处理全部报告 :</th>
            <td>{{ detail.mailtodoStr }}</td>
          </tr>
          <tr>
            <th scope="row">备注 :</th>
            <td
              colspan="3"
              style="white-space: normal"
            >
              {{ detail.memo }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </b-modal>
</template>
<style scoped lang="scss">
.modal-dialog {
  max-width: 600px !important;
}
</style>
