<script>
// import OrdinaryTable from "@/components/common/OrdinaryTable/index";

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
    // OrdinaryTable,
  },
  data() {
    return {
      columns: [
        { title: "信函抬头", value: "title" },
        {
          title: "中文地址",
          value: "addressCn",
        },
        {
          title: "英文地址",
          value: "addressEn",
        },
        { title: "状态", value: "statusStr",width:80 },
        {
          title: "操作",
          value: "operate",
          width: 100
        },
      ],
      tableData: [],
      showCustomerAddrModal: false,
      detail: {},
      maxHeight: document.documentElement.clientHeight - 204,
    };
  },
  computed: {
    fullName() {
      return this.customerInfo.fullname;
    },
  },
  methods: {
    viewDetail(row) {
      this.showCustomerAddrModal = true;
      this.detail = row;
    },
  },
  created() {
    console.log(this.customerAddrList, "customerAddrList!!");
  },
  watch: {},
};
</script>
<template>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-4">客户地址</h4>
      <div class="table-responsive">
        <el-table
          :data="customerAddrList"
          :fit="true"
          :max-height="maxHeight"
          :show-overflow-tooltip="true"
        >
          <el-table-column
            :prop="col.value"
            :label="col.title"
            v-for="col of columns"
            :key="col.value"
            :width="col.width?col.width:'auto'"
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
                v-if="col.value === 'statusStr'"
                class="badge badge-pill font-size-11"
                :class="{
                  'badge-soft-warning': `${scope.row.statusStr}` == '未启用',
                  'badge-soft-success': `${scope.row.statusStr}` == '启用',
                  'badge-soft-danger': `${scope.row.statusStr}` == '停用',
                }"
                >{{ scope.row.statusStr }}</span
              >
            </template></el-table-column
          >
        </el-table>
      </div>
    </div>
  </div>
  <b-modal
    v-model="showCustomerAddrModal"
    title="客户地址-查看"
    centered
    hide-footer
    content-class="largeAutoWidth-modal"
    size="lg"
  >
    <div class="table-responsive">
      <table
        class="table table-td-nowrap mb-0"
        style="width: 100%"
      >
        <tbody>
          <tr>
            <th scope="row">单位 :</th>
            <td colspan="3">{{ fullName }}</td>
          </tr>
          <tr>
            <th scope="row">信函抬头 :</th>
            <td colspan="3">{{ detail.title }}</td>
          </tr>
          <tr>
            <th scope="row">中文地址 :</th>
            <td colspan="3">{{ detail.addressCn }}</td>
          </tr>
          <tr>
            <th scope="row">英文地址 :</th>
            <td colspan="3">{{ detail.addressEn }}</td>
          </tr>
          <tr>
            <th scope="row">邮寄地址 :</th>
            <td colspan="3">{{ detail.addressMail }}</td>
          </tr>
          <tr>
            <th
              scope="row"
              style="width: 15%"
            >
              邮编 :
            </th>
            <td style="width: 35%">{{ detail.post }}</td>
            <th
              scope="row"
              style="width: 15%"
            >
              状态 :
            </th>
            <td style="width: 35%">{{ detail.statusStr }}</td>
          </tr>
          <tr>
            <th
              scope="row"
              style="width: 15%"
            >
              国家/省份/城市 :
            </th>
            <td style="width: 35%">
              <!-- <div
                style="
                  max-width: 180px;
                  overflow: hidden;
                  white-space: nowrap;
                  text-overflow: ellipsis;
                "
              > -->
              <span v-if="detail.country">{{ detail.country }}</span>
              <span v-if="detail.province">{{ "/" + detail.province }}</span>
              <span v-if="detail.city">{{ "/" + detail.city }}</span>
              <!-- </div> -->
            </td>
            <th
              scope="row"
              style="width: 15%"
            >
              大洲 :
            </th>
            <td style="width: 35%">{{ detail.continent }}</td>
          </tr>
          <tr>
            <th scope="row">备注 :</th>
            <td colspan="3" style="white-space:normal">{{ detail.memo }}</td>
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
