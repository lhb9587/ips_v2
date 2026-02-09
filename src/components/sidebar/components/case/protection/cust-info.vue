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
                class="nocopy"
              >
                <span class="clickable" @click="showCustomerInfo">
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
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-2">权利信息</h4>

      <div class="table-responsive">
        <table
          class="table table-nowrap mb-0"
          style="width: 100%"
        >
          <tbody>
            <tr>
              <th style="width: 10%">权利授权号 :</th>
              <td style="width: 40%">{{ caseInfo.droitNumber }}</td>
              <th style="width: 10%">权利名称 :</th>
              <td style="width: 40%">{{ caseInfo.rightName }}</td>
            </tr>
            <tr>
              <th>权利类型 :</th>
              <td>
                {{
                  transformation(
                    selectDataByClass["1020"],
                    caseInfo.rightType,
                    "id",
                    "typeName"
                  )
                }}
              </td>
              <th>权利所属 :</th>
              <td>
                {{ caseInfo.rightBelongType }}
              </td>
            </tr>
            <tr>
              <th>申请人 :</th>
              <td colspan="3">
                {{
                  caseInfo.lawsuitApplicantArray
                    ?.map((item) =>
                      transformation(appList, item, "appId", "applicantName")
                    )
                    .join(",")
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import {
  queryCustomerContactByCustIdUrl,
  querycustSelectClass,
} from "@/api/caseDetail";
import { queryApplicantByIdList } from "@/api/caseList";
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
      selectDataByClass: [],
      appList: [],
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
    fetchSelectDataByClass() {
      querycustSelectClass({ classId: "1042,1134,1135,1027,1029,1020" }).then(
        (response) => {
          if (response.success) {
            this.selectDataByClass = response.data;
          } else {
            this.$message.error(response.message);
          }
        }
      );
    },
    fetAppList() {
      if (this.caseInfo.lawsuitApplicantArray.length) {
        queryApplicantByIdList({
          appIdArray: this.caseInfo.lawsuitApplicantArray,
        }).then((res) => {
          this.appList = res.data;
        });
      }
      if (this.caseInfo.appId) {
        queryApplicantByIdList({ appIdArray: this.caseInfo.appId }).then(
          (res) => {
            this.appList = res.data;
          }
        );
      }
    },
  },
  created() {
    this.queryCustomerContactByCustIdUrl();
    this.fetchSelectDataByClass();
    this.fetAppList();
    this.$addCopy()
  },
  beforeUnmount(){
    this.$destroyCopy()
  }
};
</script>

<style></style>
