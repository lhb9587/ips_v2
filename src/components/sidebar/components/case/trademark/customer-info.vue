<template>
  <CustomerSidebar
    v-if="isCustDetail"
    :custId="caseInfo.custId"
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
              <th
                scope="row"
                style="width: 10%"
              >
                客户名称 :
              </th>
              <td style="width: 40%">
                <span
                  class="clickable"
                  @click="showCustomerInfo"
                >
                  {{ caseInfo.custName }}
                </span>
              </td>
              <th
                scope="row"
                style="width: 10%"
              >
                客户文号 :
              </th>
              <td style="width: 40%">{{ caseInfo.custRefno }}</td>
            </tr>
            <tr>
              <th scope="row">客户联系人 :</th>
              <td>{{ caseInfo.custContactName }}</td>
              <th scope="row">信函地址 :</th>
              <td>{{ caseInfo.letterAddrName }}</td>
            </tr>
            <tr>
              <th scope="row">账单联系人 :</th>
              <td>{{ caseInfo.billCustContactName }}</td>
              <th scope="row">账单地址 :</th>
              <td>{{ caseInfo.billAddrName }}</td>
            </tr>
            <tr>
              <th scope="row">抄送人 :</th>
              <td>
                {{
                  caseInfo.trademarkCaseCustContacts
                    ?.map((item) =>
                      transformation(
                        customerContacts,
                        item,
                        "custContactId",
                        "name",
                      ),
                    )
                    .join(",")
                }}
              </td>
              <th scope="row">折扣率 :</th>
              <td>{{ caseInfo.discount }}</td>
            </tr>
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
    CustomerSidebar,
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
      isCustDetail: false,
    };
  },
  methods: {
    transformation(arr, val, valType, labelStr) {
      if (arr && arr.length) {
        const item = arr.find((it) => it[valType] == val);
        return item ? item[labelStr] : "";
      }
      return "";
    },
    showCustomerInfo() {
      this.isCustDetail = true;
    },
    custSidebarUpdate(value) {
      this.isCustDetail = value;
    },
    queryCustomerContactByCustIdUrl() {
      if (!this.caseInfo.custId) return;
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
  },
  created() {
    this.queryCustomerContactByCustIdUrl();
    this.$addCopy();
  },
  beforeUnmount() {
    this.$destroyCopy();
  },
};
</script>

<style></style>

