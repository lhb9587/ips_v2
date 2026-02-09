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
              <th
                scope="row"
                style="width: 10%"
              >
                客户名称 :
              </th>
              <td
                style="width: 40%"
              >
                <span class="clickable" @click="showCustomerInfo">
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
                        "name"
                      )
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
  <div class="card mb-0">
    <div
      class="card-body"
      :style="{ maxHeight: `${appMaxHeight}px`, overflowY: 'auto' }"
    >
      <h4 class="card-title mb-2">申请人信息</h4>

      <div class="table-responsive">
        <table class="table table-nowrap mb-0">
          <tbody>
            <tr>
              <th
                scope="row"
                style="width: 10%"
              >
                申请人中文名称 :
              </th>
              <td style="width: 40%">
                {{
                  caseInfo.appCnName && caseInfo.appCnName.replace(/\s+/g, "")
                }}
              </td>
              <th
                scope="row"
                style="width: 10%"
              >
                主体法律性质 :
              </th>
              <td style="width: 40%">{{ caseInfo.legalNature }}</td>
            </tr>
            <tr>
              <th scope="row">申请人英文名称 :</th>
              <td>{{ caseInfo.appEnName }}</td>
              <th scope="row">国籍 :</th>
              <td>{{ caseInfo.appGJdq }}</td>
            </tr>
            <tr v-if="caseInfo.legalNature == '自然人'">
              <th scope="row">证件名称 :</th>
              <td>{{ caseInfo.appCertificate }}</td>
              <th scope="row">证件号码 :</th>
              <td>{{ caseInfo.appCertificateNum }}</td>
            </tr>
            <tr>
              <th scope="row">申请人中文地址 :</th>
              <td :colspan="caseInfo.appGJdq != '中国'? 1 : 3">{{ caseInfo.appCnAddr }}</td>
              <template v-if="caseInfo.appGJdq != '中国'">
                <th scope="row">
                  国家或地区 :
                </th>
                <td>{{ caseInfo.appCountryOrRegion }}</td>
              </template>
            </tr>
            <tr>
              <th scope="row">申请人英文地址 :</th>
              <td colspan="3">{{ caseInfo.appEnAddr }}</td>
            </tr>
            <tr>
              <th scope="row">代理人姓名 :</th>
              <td colspan="3">{{ caseInfo.agentPerson }}</td>
            </tr>
            <tr>
              <th scope="row">委托书 :</th>
              <td class="nocopy">
                <p
                  v-for="item in getAddressAndName('1000')"
                  :key="item.address"
                  style="margin-bottom: 0"
                >
                  <a
                    style="color: #409eff"
                    target="_blank"
                    :href="`/ipdoc${item.address}`"
                    >{{ item.name }}</a
                  >
                </p>
              </td>
              <th scope="row">统一社会信用代码 :</th>
              <td>{{ caseInfo.certCode }}</td>
            </tr>
            <tr>
              <th scope="row">申请人上传文件的语言类型 :</th>
              <td>{{ caseInfo.uploadFileLanguage }}</td>
              <th scope="row">证明文件是否为中文 :</th>
              <td>{{ caseInfo.appCertFileIsCn }}</td>
            </tr>
            <tr>
              <th scope="row">主体资格证明文件（中文） :</th>
              <td class="nocopy">
                <p
                  v-for="item in getAddressAndName('1003')"
                  :key="item.address"
                  style="margin-bottom: 0"
                >
                  <a
                    style="color: #409eff"
                    target="_blank"
                    :href="`/ipdoc${item.address}`"
                    >{{ item.name }}</a
                  >
                </p>
              </td>
              <th scope="row">主体资格证明文件（外文） :</th>
              <td class="nocopy">
                <p
                  v-for="item in getAddressAndName('1004')"
                  :key="item.address"
                  style="margin-bottom: 0"
                >
                  <a
                    style="color: #409eff"
                    target="_blank"
                    :href="`/ipdoc${item.address}`"
                    >{{ item.name }}</a
                  >
                </p>
              </td>
            </tr>
            <tr>
              <th scope="row">身份证明文件（中文） :</th>
              <td>
                <p
                  v-for="item in getAddressAndName('1001')"
                  :key="item.address"
                >
                  <a
                    style="color: #409eff"
                    target="_blank"
                    :href="`/ipdoc${item.address}`"
                    >{{ item.name }}</a
                  >
                </p>
              </td>
              <th scope="row">身份证明文件（外文） :</th>
              <td>
                <p
                  v-for="item in getAddressAndName('1002')"
                  :key="item.address"
                >
                  <a
                    style="color: #409eff"
                    target="_blank"
                    :href="`/ipdoc${item.address}`"
                    >{{ item.name }}</a
                  >
                </p>
              </td>
            </tr>
            <tr>
              <th scope="row">有关说明文件 :</th>
              <td colspan="3">
                <a
                  v-for="item in getAddressAndName('1020')"
                  style="color: #409eff"
                  target="_blank"
                  :href="`/ipdoc${item.address}`"
                  :key="item.address"
                  >{{ item.name }}</a
                >
              </td>
            </tr>
            <tr>
              <th scope="row">代理人姓名 :</th>
              <td>{{ caseInfo.agentPerson }}</td>
              <th scope="row">联系人 :</th>
              <td>{{ caseInfo.appContactPerson }}</td>
            </tr>
            <tr>
              <th scope="row">电话 :</th>
              <td>{{ caseInfo.appContactTel }}</td>
              <th scope="row">邮箱 :</th>
              <td>{{ caseInfo.appContactEmail }}</td>
            </tr>
            <tr>
              <th scope="row">邮政编码 :</th>
              <td>{{ caseInfo.appContactZip }}</td>
              <th scope="row">共同申请 :</th>
              <td>{{ caseInfo.ifShareTm ? "是" : "否" }}</td>
            </tr>
            <tr>
              <th scope="row">共同申请列表 :</th>
              <td colspan="3">{{ caseInfo.uploadFileLanguage }}</td>
            </tr>
            <tr>
              <th scope="row">共有人名称（中文） :</th>
              <td>{{ caseInfo.uploadFileLanguage }}</td>
              <th scope="row">共有人名称（英文） :</th>
              <td>{{ caseInfo.uploadFileLanguage }}</td>
            </tr>
            <tr>
              <th scope="row">上传证明文件 :</th>
              <td colspan="3">{{ caseInfo.uploadFileLanguage }}</td>
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
      appMaxHeight: document.documentElement.clientHeight - 370,
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
