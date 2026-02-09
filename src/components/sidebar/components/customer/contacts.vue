<script>
import OrgchartContacts from "./orgchart-contacts.vue";
import ContactsInfoModal from "./contacts-info-modal.vue";
import { queryCustomerContactCustIdUrl } from "@/api/customerList";
import defaultAvatar from "@/assets/images/users/defaultavatar.png";

export default {
  props: {
    customerInfo: {
      type: Object,
      required: () => {},
    },
  },
  components: {
    OrgchartContacts,
    ContactsInfoModal,
  },
  data() {
    return {
      columns: [
        { title: "姓名", value: "name" },
        {
          title: "职务",
          value: "jobtitle",
        },
        {
          title: "部门",
          value: "department",
        },
        { title: "办公电话", value: "tel" },
        {
          title: "邮箱",
          value: "email",
        },
        {
          title: "状态",
          value: "statusStr",
          width: 80,
        },
        {
          title: "启用",
          value: "sysStatusStr",
          width: 80,
        },
        {
          title: "操作",
          value: "operate",
          width: 100,
        },
      ],
      showContactsModal: false,
      detail: {},
      maxHeight: document.documentElement.clientHeight - 248,
      selectedTab: 0,
      tabList: [
        { value: 0, label: "关系网络" },
        { value: 1, label: "列表" },
      ],
      dataList: [],
      classList: [
        { label: "全部", value: 0 },
        { label: "启用", value: 1210 },
        { label: "停用", value: 1211 },
      ],
      searchInput: "",
      sysStatus: "",
      defaultAvatar: defaultAvatar,
    };
  },
  computed: {
    fullName() {
      return this.customerInfo.fullname;
    },
  },
  watch: {
    "customerInfo.custId": {
      handler() {
        this.searchInput = "";
        this.sysStatus = "";
        this.fetchDataList();
      },
      immediate: true,
    },
  },
  methods: {
    viewDetail(row) {
      this.showContactsModal = true;
      this.detail = row;
    },
    fetchDataList(type) {
      if (!this.customerInfo.custId) return false;
      queryCustomerContactCustIdUrl({
        customerId: this.customerInfo.custId,
        keyword: this.searchInput,
        sysStatus: this.sysStatus || "",
      }).then((res) => {
        const list = res.data || []
        this.dataList = list.map((item) => {
          return {
            ...item,
            id: item.custContactId,
            parentId:
              type !== "search"
                ? item.bossCustContactId || undefined
                : undefined,
            image: item.photo ? `/ipdoc${item.photo}` : this.defaultAvatar,
            role: item.jobtitle
              ? item.jobtitle + "-" + item.statusStr
              : item.statusStr,
          };
        });
      });
    },
  },
};
</script>
<template>
  <div class="card mb-0">
    <div class="card-body">
      <h4 class="card-title mb-3">客户联系人</h4>
      <div class="d-flex align-items-center justify-content-between">
        <b-tabs
          pills
          nav-class="bg-light rounded contact-tabs"
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
        <div class="search-bar-row">
          <el-input
            v-model="searchInput"
            placeholder="模糊查询..."
            clearable
            style="width: 160px"
          />
          <el-select
            v-model="sysStatus"
            placeholder="启用状态"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="item in classList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-button
            type="primary"
            @click="fetchDataList('search')"
            >搜索</el-button
          >
        </div>
      </div>
      <div
        class="table-responsive"
        v-if="selectedTab"
      >
        <el-table
          :data="dataList"
          :fit="true"
          :max-height="maxHeight"
          :show-overflow-tooltip="true"
        >
          <el-table-column
            :prop="col.value"
            :label="col.title"
            v-for="col of columns"
            :key="col.value"
            :width="col.width ? col.width : 'auto'"
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
                v-if="col.value === 'sysStatusStr'"
                class="badge badge-pill font-size-11"
                :class="{
                  'badge-soft-warning': `${scope.row.sysStatusStr}` == '未启用',
                  'badge-soft-success': `${scope.row.sysStatusStr}` == '启用',
                  'badge-soft-danger': `${scope.row.sysStatusStr}` == '停用',
                }"
                >{{ scope.row.sysStatusStr }}</span
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
          contactstype="customer"
          :maxHeight="maxHeight"
          :custId="customerInfo.custId"
          :customerInfo="customerInfo"
          :dataList="dataList"
        />
      </div>
    </div>
  </div>
  <!-- 详细信息弹框 -->
  <ContactsInfoModal
    v-if="showContactsModal"
    :showDetailModal="showContactsModal"
    :detailInfos="detail"
    :orgName="fullName"
    @close="showContactsModal = false"
  />
</template>

<style lang="scss">
.contact-tabs {
  width: 142px;
}
</style>
<style lang="scss" scoped>
.search-bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
</style>
