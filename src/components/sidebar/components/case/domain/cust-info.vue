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
              <th style="width: 10%">客户文号 :</th>
              <td style="width: 40%">{{ caseInfo.custRefno }}</td>
            </tr>
            <tr>
              <th>客户联系人 :</th>
              <td>
                {{
                  transformation(
                    customerContacts,
                    caseInfo.custConId,
                    "custContactId",
                    "name"
                  )
                }}
              </td>
              <th>抄送人 :</th>
              <td>
                {{
                  caseInfo.lawsuitCaseCcArray
                    ?.map((item) =>
                      transformation(
                        customerContacts,
                        item,
                        "custContactId",
                        "name"
                      )
                    )
                    .join("，")
                }}
              </td>
            </tr>
            <tr>
              <th>账单联系人 :</th>
              <td>{{ caseInfo.billCustContactName }}</td>
              <th>折扣率 :</th>
              <td>{{ caseInfo.discount }}</td>
            </tr>
            <tr>
              <th>账单地址 :</th>
              <td
                colspan="3"
                style="white-space: normal"
              >
                {{ caseInfo.billAddre }}
              </td>
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
    transformation(arr, val, valType, labelStr) {
      if (arr && arr.length) {
        var item = arr.find((item) => item[valType] == val);
        if (item) {
          return item[labelStr];
        } else {
          return "";
        }
      }
      return "";
    },
    showCustomerInfo() {
      this.isCustDetail = true;
    },
    custSidebarUpdate(value) {
      this.isCustDetail = value;
    },
    getAddressAndName(materialTypeId) {
      if (this.caseInfo.materials) {
        return this.caseInfo.materials.filter(
          (item) => item.materialTypeId == materialTypeId
        );
      } else {
        return [];
      }
    },
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
