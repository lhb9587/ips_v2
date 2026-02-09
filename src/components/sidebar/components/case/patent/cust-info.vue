<template>
  <CustomerSidebar
    :custId="caseInfo.custId"
    v-if="isCustDetail"
    :showSidebar="isCustDetail"
    @update:showSidebar="custSidebarUpdate"
  />
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-2">客户信息</h4>

      <div class="table-responsive">
        <table
          class="table table-nowrap mb-0"
          style="width: 100%"
        >
          <tbody>
            <tr>
              <th style="width: 10%">客户名称 :</th>
              <td
                style="width: 40%"
              >
                <span @click="showCustomerInfo" class="clickable">
                  {{ caseInfo.custName }}
                </span>
              </td>
              <th style="width: 10%">来自国家 :</th>
              <td style="width: 40%">{{ caseInfo.country }}</td>
            </tr>
            <tr>
              <th>折扣率 :</th>
              <td>{{ caseInfo.discount }}</td>
              <th>账单联系人 :</th>
              <td>{{ caseInfo.billCustContactName }}</td>
            </tr>
            <tr>
              <th>客户联系人 :</th>
              <td>
                {{
                  this.customerContacts.find(
                    (i) => i.custContactId == caseInfo.custConId
                  ) &&
                  this.customerContacts.find(
                    (i) => i.custContactId == caseInfo.custConId
                  ).name +
                    "(" +
                    this.customerContacts.find(
                      (i) => i.custContactId == caseInfo.custConId
                    ).email +
                    ")"
                }}
              </td>
              <th>抄送人 :</th>
              <td>
                {{ caseInfo.patentCaseCustContactStr }}
              </td>
            </tr>
            <tr>
              <th>文件邮址 :</th>
              <td
                colspan="3"
                style="white-space: normal"
              >
                {{ caseInfo.letterAddrCn }}
              </td>
            </tr>
            <tr>
              <th>账单邮址 :</th>
              <td>{{ caseInfo.billAddrCn }}</td>
              <th>技术联系人 :</th>
              <td>{{ caseInfo.techLinkman }}</td>
            </tr>
            <tr>
              <th>客户案号 :</th>
              <td>{{ caseInfo.custRefNo }}</td>
              <th>申请人案号 :</th>
              <td>{{ caseInfo.applicantRefNo }}</td>
            </tr>
            <tr v-if="caseInfo.custCommand">
              <th>个案要求 :</th>
              <td colspan="3">
                <span
                  v-for="(item, index) in caseInfo.custCommand.split('\n')"
                  :key="index"
                >
                  {{ item }}
                </span>
              </td>
            </tr>
            <template
              v-if="
                caseInfo.caseTypeId == 63 ||
                caseInfo.caseTypeId == 64 ||
                caseInfo.caseTypeId == 123
              "
            >
              <tr
                v-if="
                  (caseInfo.caseTypeId == 63 && caseInfo.patentType == 1296) ||
                  (caseTypeId != 123 &&
                    (caseInfo.patentType == 1297 ||
                      caseInfo.patentType == 1298)) ||
                  (caseTypeId == 123 &&
                    (caseInfo.patentType == 1296 ||
                      caseInfo.patentType == 1297))
                "
              >
                <th>转出所至 :</th>
                <td colspan="3">{{ caseInfo.alteragency }}</td>
              </tr>
            </template>
            <template v-else>
              <tr v-if="caseInfo.caseTypeId == 101">
                <th>申请人客户 :</th>
                <td colspan="3">{{ caseInfo.applicantCustName }}</td>
              </tr>
              <tr
                v-if="caseInfo.caseTypeId == 101 || caseInfo.caseTypeId == 69"
              >
                <th>转出所至 :</th>
                <td colspan="3">{{ caseInfo.applicantCustName }}</td>
              </tr>
              <tr v-if="caseInfo.caseTypeId == 106">
                <th>申请人客户 :</th>
                <td>{{ caseInfo.applicantCustName }}</td>
                <th>要求返稿期限 :</th>
                <td>{{ caseInfo.cliSubmitDlDate }}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { queryCustomerContactByCustIdUrl } from "@/api/caseDetail";
import CustomerSidebar from "@/components/sidebar/customer-sidebar";

export default {
  components: {
    CustomerSidebar
  },
  props: {
    caseInfo: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      customerContacts: [],
      isCustDetail:false
    };
  },
  methods: {
    queryCustomerContactByCustIdUrl() {
      this.caseInfo.custId &&
        queryCustomerContactByCustIdUrl({
          caseTypeId: this.caseInfo.caseTypeId,
          custId: this.caseInfo.custId,
        })
          .then((response) => {
            this.customerContacts = response.data.customerContacts;
          })
          .catch((err) => {
            console.log(err);
          });
    },
    showCustomerInfo() {
      this.isCustDetail = true;
      console.log('sdklfjsdlk');
    },
    custSidebarUpdate(value) {
      this.isCustDetail = value;
    },
  },
  created() {
    this.queryCustomerContactByCustIdUrl();
    this.$addCopy()
  },
  beforeUnmount(){
    this.$destroyCopy()
  }
};
</script>

<style></style>
