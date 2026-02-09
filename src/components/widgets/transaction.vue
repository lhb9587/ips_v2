<script>
import CaseSidebar from "../sidebar/case-sidebar"
import Loader from "./loader";

/**
 * Transactions component
 */
export default {
  components: {
    Loader,
    CaseSidebar
  },
  props: {
    transactions: {
      type: Array,
      default: function () {
        return [];
      },
    },
    updating: {
      type: Boolean,
    },
  },
  data() {
    return {
      showModal: false,
      isCaseDetail: false
    };
  },
  methods: {
    toggleSidebar() {
      this.isCaseDetail = true;
    },
    handleSidebarUpdate(value) {
      console.log('this.isCaseDetail',value)
      this.isCaseDetail = value;
    }
  }
};
</script>

<template>
  <CaseSidebar v-if="isCaseDetail" :showSidebar="isCaseDetail" @update:showSidebar="handleSidebarUpdate" />
  <Loader :loading="updating">
    <div class="table-responsive mb-0">
      <table class="table align-middle table-nowrap">
        <!-- <thead class="table-light">
          <tr>
            <th style="width: 20px">
              <div class="form-check font-size-16 align-middle">
                <input class="form-check-input" type="checkbox" id="transactionCheck01" />
                <label class="form-check-label" for="transactionCheck01"></label>
              </div>
            </th>
            <th class="align-middle">案件文号</th>
            <th class="align-middle">类型</th>
            <th class="align-middle">客户</th>
            <th class="align-middle">时间</th>
            <th class="align-middle">状态</th>
            <th class="align-middle">待办类型</th>
            <th class="align-middle">操作</th>
          </tr>
        </thead> -->
        <tbody>
          <tr>
            <th style="width: 20px">
              <div class="form-check font-size-16 align-middle">
                <input class="form-check-input" type="checkbox" id="transactionCheck01" />
                <label class="form-check-label" for="transactionCheck01"></label>
              </div>
            </th>
            <th class="align-middle">案件文号</th>
            <th class="align-middle">类型</th>
            <th class="align-middle">客户</th>
            <th class="align-middle">时间</th>
            <th class="align-middle">状态</th>
            <th class="align-middle">待办类型</th>
            <th class="align-middle">操作</th>
          </tr>
          <tr v-for="data in transactions" :key="data.id">
            <td>
              <div class="form-check font-size-16">
                <input class="form-check-input" type="checkbox" :id="`transactionCheck${data.index}`" />
                <label class="form-check-label" :for="`transactionCheck${data.index}`"></label>
              </div>
            </td>
            <td>
              <a href="javascript: void(0);" @click="toggleSidebar()" class="text-body fw-bold">{{
                data.id
              }}</a>
            </td>
            <td>{{ data.name }}</td>
            <td>{{ data.date }}</td>
            <td>{{ data.total }}</td>
            <td>
              <span class="badge badge-pill badge-soft-success font-size-11" :class="{
                'badge-soft-danger': `${data.status}` === '退回',
                'badge-soft-warning': `${data.status}` === '待审核',
              }">{{ data.status }}</span>
            </td>
            <td>{{ data.payment }}</td>
            <td>
              <!-- Button trigger modal -->
              <button type="button" class="btn btn-soft-primary btn-sm btn-rounded" @click="showModal = !showModal">
                查看详情
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- end table -->
  </Loader>
  <b-modal v-model="showModal" title="Order Details" centered>
    <p class="mb-2">Product id: <span class="text-primary">#SK2540</span></p>
    <p class="mb-4">Billing Name: <span class="text-primary">Neal Matthews</span></p>

    <div class="table-responsive">
      <table class="table align-middle table-nowrap">
        <thead>
          <tr>
            <th scope="col">Product</th>
            <th scope="col">Product Name</th>
            <th scope="col">Price</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">
              <div>
                <img src="@/assets/images/product/img-7.png" alt="" class="avatar-sm">
              </div>
            </th>
            <td>
              <div>
                <h5 class="text-truncate font-size-14">Wireless Headphone (Black)</h5>
                <p class="text-muted mb-0">$ 225 x 1</p>
              </div>
            </td>
            <td>$ 255</td>
          </tr>
          <tr>
            <th scope="row">
              <div>
                <img src="@/assets/images/product/img-4.png" alt="" class="avatar-sm">
              </div>
            </th>
            <td>
              <div>
                <h5 class="text-truncate font-size-14">Phone patterned cases</h5>
                <p class="text-muted mb-0">$ 145 x 1</p>
              </div>
            </td>
            <td>$ 145</td>
          </tr>
          <tr>
            <td colspan="2">
              <h6 class="m-0 text-right">Sub Total:</h6>
            </td>
            <td>
              $ 400
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <h6 class="m-0 text-right">Shipping:</h6>
            </td>
            <td>
              Free
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <h6 class="m-0 text-right">Total:</h6>
            </td>
            <td>
              $ 400
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <template v-slot:modal-footer>
      <b-button variant="secondary" @click="showModal = !showModal">Close</b-button>
    </template>
  </b-modal>
</template>