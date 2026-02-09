<script>
import BillSidebar from "@/views/finance/bill-overseas/detail-sidebar";
import { downLoadAll, viewPdf, getProgID } from "@/utils";

export default {
  props: {
    abroadBillList: {
      type: Array,
      required: () => [],
    },
  },
  components: {
    BillSidebar,
  },
  data() {
    return {
      columns: [
        { title: "境外账单号", value: "abroadBillNo", width: 120 },
        {
          title: "境外代理所",
          value: "agencyCustName",
        },
        {
          title: "费用概要",
          value: "abroadContent",
        },
        {
          title: "总金额",
          value: "abroadBillSum",
        },
        {
          title: "收款情况",
          value: "paymentStatusStr",
        },
        {
          title: "账单电子版",
          value: "materialList",
        },
      ],
      isBillDetail: false,
      abroadBillId: undefined,
      maxHeight: document.documentElement.clientHeight - 168,
    };
  },
  methods: {
    downLoadAll,
    viewPdf,
    handleSidebarUpdate(value) {
      this.isBillDetail = value;
    },
    toggleSidebar(rowInfo) {
      console.log(rowInfo, "rowInfo");
      this.abroadBillId = rowInfo.abroadBillId;
      this.isBillDetail = !this.isBillDetail;
    },
    preView(data) {
      let url = data.address;
      if (
        getProgID(url) ||
        ["eml", "msg"].includes(url.replace(/.+\./, "").toLocaleLowerCase())
      ) {
        if (
          ["doc", "docx"].includes(url.replace(/.+\./, "").toLocaleLowerCase())
        ) {
          viewPdf(`${url}`);
        } else {
          let flag = "";
          if (data.mailId) {
            flag = "mailId";
          } else if (data.materialId) {
            flag = "materialId";
          }
          url = url.replace(/&/g, "%26");
          window.open(
            `#/preView?address=ipdoc${url}&${flag}=${data[flag]}`.replace(
              /[+]/g,
              "%2B"
            )
          );
        }
      } else if (
        ["pdf", "jpg", "png"].some(
          (item) => url.replace(/.+\./, "").toLocaleLowerCase() == item
        )
      ) {
        window.open(`/ipdoc${url}`.replace(/[+]/g, "%2B"));
      } else {
        downLoadAll({ url: `/ipdoc${url}` });
      }
    },
  },
};
</script>
<template>
  <div class="card">
    <div class="card-body">
      <div class="p-3 pt-0">
        <el-table
          :data="abroadBillList"
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
              <span
                v-if="col.value === 'abroadBillNo'"
                class="clickable"
                @click="toggleSidebar(scope.row)"
                >{{ scope.row.abroadBillNo }}</span
              >
              <span
                v-if="
                  col.value === 'materialList' &&
                  scope.row.materialList &&
                  scope.row.materialList.length > 0
                "
                class="clickable"
                ><span
                  v-for="(item, index) of scope.row.materialList"
                  :key="index"
                  @click="preView(item)"
                  >{{ item.materialName }}</span
                ></span
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
  <BillSidebar
    v-if="isBillDetail"
    :showSidebar="isBillDetail"
    @update:showSidebar="handleSidebarUpdate"
    :billId="abroadBillId"
  />
</template>
