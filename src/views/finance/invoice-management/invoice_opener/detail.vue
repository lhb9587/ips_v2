<script setup>
/**
 * Invoice-detail component
 */
import { ref, defineProps, computed, onMounted } from "vue";
import { queryReceiptCompany } from "@/api/caseList";
import { formatAmount } from "@/utils";
import CustomerSidebar from "@/components/sidebar/customer-sidebar";
import BillSidebar from "@/components/sidebar/bill-sidebar";
import { ArrowDown } from '@element-plus/icons-vue'

const props = defineProps({
  detailInfo: {
    type: Object,
    default: () => {},
  },
});
const isCustDetail = ref(false);
const invoiceInfo = computed(() => props.detailInfo);
// const receiptBillWkgList = computed(
//   () => props.detailInfo.receiptBillWkgList || []
// );
const groupNameList = computed(
  () => props.detailInfo?.receiptBillWkgList.map((item) => item.groupName) || []
);
const transformation = (arr, val, valType, labelStr) => {
  if (arr && arr.length) {
    var item = arr.find((item) => item[valType] == val);
    if (item) {
      return item[labelStr];
    } else {
      return "";
    }
  }
  return "";
};
const receiptCompanyList = ref([]);
const fetchReceiptCompany = () => {
  queryReceiptCompany().then((res) => {
    receiptCompanyList.value = res.data;
  });
};
const invoiceDetailsColumns = [
  {
    value: "item",
    title: "发票项目",
  },
  {
    value: "itemType",
    title: "项目类型",
  },
  {
    value: "unitPrice",
    title: "单价",
  },
  {
    value: "number",
    title: "数量",
  },
  {
    value: "unit",
    title: "单位",
  },
  {
    value: "amount",
    title: "金额",
  },
];
const custSidebarUpdate = (value) => {
  isCustDetail.value = value;
};
const toggleCustSidebar = () => {
  isCustDetail.value = !isCustDetail.value;
};
const billNo = ref();
const isBillDetail = ref(false);
const toggleBillSidebar = (value) => {
  billNo.value = value;
  isBillDetail.value = !isBillDetail.value;
};
const billSidebarUpdate = (value) => {
  isBillDetail.value = value;
};
onMounted(() => {
  fetchReceiptCompany();
});
</script>

<template>
  <div class="row">
    <div class="col-lg-12">
      <div class="card">
        <div class="card-body">
          <div class="invoice-title">
            <h4 class="float-end font-size-16">
              {{ invoiceInfo.receiptType ? "无账单发票" : "账单发票" }}
            </h4>
            <div class="mb-4">
              <!-- <img
                src="@/assets/images/logo-dark.png"
                alt="logo"
                height="20"
              /> -->
              <div style="height: 20px"></div>
            </div>
          </div>
          <hr />
          <div class="row">
            <div class="col-6">
              <address>
                <strong>受票方:</strong>
                <br /><span
                  class="clickable"
                  v-on:click="toggleCustSidebar"
                  >{{ invoiceInfo.custFullName }}</span
                >
                <br />{{ invoiceInfo.receiptTitle }} <br />{{
                  invoiceInfo.taxNo
                }}
              </address>
            </div>
            <div class="col-6 text-sm-end">
              <address>
                <strong>开具方:</strong>
                <br />{{
                  transformation(
                    receiptCompanyList,
                    invoiceInfo.companyId,
                    "repCompId",
                    "fullname"
                  )
                }}
                <br />{{ invoiceInfo.stateTaxReceipt }} <br />{{
                  invoiceInfo.receiptClass
                }}
              </address>
            </div>
          </div>

          <div class="row">
            <div class="col-6 mt-3">
              <address>
                <strong>送达信息:</strong>
                <br />{{ invoiceInfo.receiverName }} <br />{{
                  invoiceInfo.receiverMail
                }}
              </address>
            </div>
            <div class="col-6 mt-3 text-sm-end">
              <address>
                <strong>开票信息:</strong>
                <br />{{ invoiceInfo.optName }} <br />{{ invoiceInfo.optDate }}
              </address>
            </div>
          </div>
          <div
            class="row"
            v-if="invoiceInfo.receiptType == 0"
          >
            <div class="col-12">
              <address>
                <strong>账单信息:</strong>
                <br />
                <span
                  class="clickable"
                  v-for="(item, index) in invoiceInfo?.billNos?.split(';').slice(0,4)"
                  :key="index"
                  ><span v-if="index != 0">，</span
                  ><span v-on:click="toggleBillSidebar(item)">{{
                    item
                  }}</span></span
                >
                <el-dropdown
                  placement="bottom-start"
                  v-if="invoiceInfo?.billNos?.split(';').length > 4"
                  trigger="click"
                  popper-class="dropdown-menu-custom"
                >
                  <div class="el-dropdown-link clickable">... 查看更多<el-icon class="el-icon--right"><arrow-down /></el-icon></div>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        v-for="item of invoiceInfo?.billNos?.split(';').slice(4)"
                        :key="item"
                        v-on:click.stop="toggleBillSidebar(item)"
                        >{{ item }}</el-dropdown-item
                      >
                    </el-dropdown-menu>
                  </template> </el-dropdown
                >
                <br />
                {{ groupNameList.length > 0 && groupNameList.join("，") }}
              </address>
            </div>
          </div>
          <div class="p-2 mt-3">
            <h3 class="font-size-16">发票明细</h3>
          </div>
          <el-table
            :data="invoiceInfo.details"
            :max-height="300"
            :fit="true"
          >
            <el-table-column
              :prop="col.value"
              :label="col.title"
              v-for="col of invoiceDetailsColumns"
              :key="col.value"
            >
              <template #default="scope">
                <span v-if="['unitPrice', 'amount'].includes(col.value)">{{
                  formatAmount(scope.row[col.value])
                }}</span>
                <span v-else>{{ scope.row[col.value] }}</span>
              </template></el-table-column
            >
          </el-table>
          <div
            style="
              display: flex;
              justify-content: end;
              align-items: center;
              height: 48px;
            "
          >
            <span class="border-0 text-sm-end">
              <strong>发票金额</strong>
            </span>
            <span class="border-0 text-sm-end">
              <h4 class="m-0">
                ￥{{ formatAmount(invoiceInfo.receiptTotal) }}
              </h4>
            </span>
          </div>
          <!-- <div class="d-print-none">
            <div class="float-end">
              <a
                href="#"
                class="btn btn-primary w-md waves-effect waves-light"
                >查看票据</a
              >
            </div>
          </div> -->
        </div>
      </div>
    </div>
  </div>
  <CustomerSidebar
    :custId="invoiceInfo.custId"
    v-if="isCustDetail"
    :showSidebar="isCustDetail"
    @update:showSidebar="custSidebarUpdate"
  />
  <BillSidebar
    v-if="isBillDetail"
    :showSidebar="isBillDetail"
    @update:showSidebar="billSidebarUpdate"
    :billNo="billNo"
  />
</template>

<style scoped lang="scss">
.card {
  margin-bottom: 0px;
}
.el-dropdown-link {
  line-height: 19px;
  margin-left: 8px;
  display: flex;
  align-items: center;
}
</style>
