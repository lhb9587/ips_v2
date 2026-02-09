<template>
  <div
    class="custInfoContainer"
    :style="{ 'max-height': containerMaxHeight + 'px', 'overflow-y': 'scroll' }"
  >
    <div class="card">
      <div class="card-body">
        <h4 class="card-title mb-2">基本信息</h4>

        <div class="table-responsive">
          <table
            class="table table-nowrap mb-0"
            style="width: 100%"
          >
            <tbody>
              <tr>
                <th
                  scope="row"
                  style="width: 15%"
                >
                  简称 :
                </th>
                <td style="width: 35%">{{ customerInfo.name }}</td>
                <th
                  scope="row"
                  style="width: 15%"
                >
                  中文名称/全称 :
                </th>
                <td style="width: 35%">{{ customerInfo.fullname }}</td>
              </tr>
              <tr>
                <th scope="row">客户等级 :</th>
                <td>{{ customerInfo.custGradeStr }}</td>
                <th scope="row">沟通语言 :</th>
                <td>{{ customerInfo.contactLanguageStr }}</td>
              </tr>
              <tr>
                <th scope="row">合作状态 :</th>
                <td>{{ customerInfo.curStatusStr }}</td>
                <th scope="row">国家/省份/城市 :</th>
                <td>
                  {{
                    [
                      customerInfo.country,
                      customerInfo.province,
                      customerInfo.city,
                    ]
                      .filter((item) => !!item)
                      .join("/")
                  }}
                </td>
              </tr>
              <tr>
                <th scope="row">主体法律性质 :</th>
                <td>{{ customerInfo.legalNatureStr }}</td>
                <th scope="row">客户信用等级 :</th>
                <td>{{ customerInfo.level }}</td>
              </tr>
              <tr>
                <th scope="row">电话 :</th>
                <td>{{ customerInfo.phone }}</td>
                <th scope="row">客户来源 :</th>
                <td>{{ customerInfo.sourceStr }}</td>
              </tr>
            </tbody>
            <tbody v-show="showMoreInfoStatus">
              <tr>
                <th scope="row">英文名称 :</th>
                <td>{{ customerInfo.fullnameEn }}</td>
                <th scope="row">所属集团 :</th>
                <td>{{ customerInfo.jtName }}</td>
              </tr>
              <tr>
                <th scope="row">初始来案案型 :</th>
                <td>{{ customerInfo.caseType }}</td>
                <th scope="row">正式客户时间 :</th>
                <td>{{ customerInfo.firstcaseDate }}</td>
              </tr>
              <tr>
                <th scope="row">申请人 :</th>
                <td>{{ customerInfo.isApplicant ? "是" : "否" }}</td>
                <th scope="row">合作资源 :</th>
                <td>{{ customerInfo.isCollaboration ? "是" : "否" }}</td>
              </tr>
              <tr>
                <th scope="row">事务所 :</th>
                <td>{{ customerInfo.isAgent ? "是" : "否" }}</td>
                <th scope="row">官方机构 :</th>
                <td>{{ customerInfo.isOfficial ? "是" : "否" }}</td>
              </tr>
              <tr>
                <th scope="row">简介 :</th>
                <td
                  colspan="3"
                  style="white-space: normal"
                >
                  {{ customerInfo.info }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
          style="
            display: flex;
            justify-content: flex-end;
            margin-top: 10px;
            align-items: center;
          "
        >
          <div
            v-on:click="showMoreInfoStatus = !showMoreInfoStatus"
            style="cursor: pointer; color: #5a6dde"
          >
            <span v-show="!showMoreInfoStatus">查看更多</span>
            <span v-show="showMoreInfoStatus">收起</span>
            <i
              class="mdi mdi-chevron-right font-size-18"
              v-show="!showMoreInfoStatus"
            ></i>
            <i
              class="mdi mdi-chevron-down font-size-18"
              v-show="showMoreInfoStatus"
            ></i>
          </div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-body">
        <h4 class="card-title mb-2">客户负责人信息</h4>
        <div class="table-responsive">
          <table
            class="table table-nowrap mb-0"
            style="width: 100%"
          >
            <tbody>
              <tr>
                <th
                  scope="row"
                  style="width: 10%"
                >
                  客户协调人 :
                </th>
                <td style="width: 23%">{{ customerManage }}</td>
                <th
                  scope="row"
                  style="width: 10%"
                >
                  客户开发人 :
                </th>
                <td style="width: 23%">{{ customerInfo.custIntroductor }}</td>
                <th
                  scope="row"
                  style="width: 10%"
                >
                  客户开发人单位 :
                </th>
                <td style="width: 24%">{{ customerInfo.custIntroCompany }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <b-tabs
          pills
          nav-class="bg-light rounded"
          content-class="mt-2"
        >
          <b-tab
            :title="`${item.label}（${index ? workGroupTotal : headTotal}）`"
            v-model="selectedTab"
            v-for="(item, index) of tabList"
            :key="item.value"
            @click="changeTab(item.value)"
          >
          </b-tab>
        </b-tabs>
        <el-table
          :data="tableData"
          :max-height="300"
          :fit="true"
          :show-overflow-tooltip="{
            effect: 'dark',
            popperClass: 'popper-item',
          }"
          :scrollbar-always-on="true"
        >
          <el-table-column
            :prop="col.value"
            :label="col.title"
            v-for="col of columns"
            :key="col.value"
          >
            <template #default="scope">
              <span v-if="col.value === 'userDomains'">
                {{ scope.row.userDomains && scope.row.userDomains.join(",") }}
              </span>
              <span v-if="col.value === 'userId'">
                {{
                  transformation(
                    this.$store.state.user.userList,
                    scope.row.userId,
                    "userId",
                    "fullname"
                  )
                }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import { queryUserByRoleId } from "@/api/caseList";
import { transformation } from "@/utils";
export default {
  props: {
    customerInfo: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showMoreInfoStatus: false,
      tabList: [
        { value: "head", label: "负责人" },
        { value: "workGroup", label: "负责工作组" },
      ],
      headColumns: [
        { title: "负责人", value: "userId" },
        { title: "角色", value: "principalRoleStr" },
        { title: "领域", value: "userDomains" },
      ],
      workGroupColumns: [
        { title: "负责工作组", value: "groupName" },
        { title: "最近立卷日期", value: "caseDate", width: 110 },
        { title: "领域", value: "userDomain" },
      ],
      selectedTab: "head",
      managementCommitteePartner: [],
      containerMaxHeight: document.documentElement.clientHeight - 100,
    };
  },
  methods: {
    transformation,
    changeTab(val) {
      this.selectedTab = val;
    },
    fetchUserByRoleId() {
      queryUserByRoleId({ roleId: "2049,1" }).then((res) => {
        this.managementCommitteePartner = res.data;
      });
    },
  },
  computed: {
    columns() {
      return this.selectedTab === "head"
        ? this.headColumns
        : this.workGroupColumns;
    },
    tableData() {
      return this.selectedTab === "head"
        ? this.customerInfo.customerResponsibleArray
        : this.customerInfo.customerFenpeiList;
    },
    customerManage() {
      return this.managementCommitteePartner
        .filter((item) =>
          this.customerInfo.customerManageArray?.includes(item.userId)
        )
        .map((item) => item.fullname)
        .join("；");
    },
    headTotal() {
      return this.customerInfo.customerResponsibleArray?.length || 0;
    },
    workGroupTotal() {
      return this.customerInfo.customerFenpeiList?.length || 0;
    },
  },
  created() {
    this.fetchUserByRoleId();
    this.$addCopy()
  },
  beforeUnmount(){
    this.$destroyCopy()
  }
};
</script>

<style scoped lang="scss">
.custInfoContainer {
  .card:last-child {
    margin-bottom: 0;
  }
}
</style>
