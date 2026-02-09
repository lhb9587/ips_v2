<script>
import CustomerSidebar from "../sidebar/customer-sidebar";
import { queryCustomerByBillorCase } from "@/api/customerList";
import LoadingOverlay from "@/components/common/loading";

export default {
  components: {
    LoadingOverlay,
    CustomerSidebar,
  },
  props: {
    cardDesc: {
      type: String,
    },
  },
  data() {
    return {
      isCustomerDetail: false,
      customerList: [],
      filterValue: 1,
      filterOptions: [
        {
          value: 1,
          label: "按账单收入排序",
        },
        {
          value: 2,
          label: "按案件数量排序",
        },
        {
          value: 3,
          label: "按最近来案时间排序",
        },
        {
          value: 4,
          label: "按最近开账单时间排序",
        },
      ],
      custId: "",
      loading: false,
      avatarLoadErrorList: [],
      mouseInner: false,
    };
  },
  methods: {
    handleAvatarError(userIcon) {
      this.avatarLoadErrorList = [...this.avatarLoadErrorList, userIcon];
    },
    toggleSidebar(custId) {
      this.custId = custId;
      this.isCustomerDetail = !this.isCustomerDetail;
    },
    handleSidebarUpdate() {
      this.isCustomerDetail = false;
    },
    fetchCustomerList() {
      this.loading = true;
      queryCustomerByBillorCase({ type: this.filterValue }).then((res) => {
        this.customerList = res.data?.slice(0, 6);
        this.loading = false;
        this.$nextTick(() => {
          this.triggerResize();
        });
      });
    },
    updateItemStyle(newFlexValue) {
      const items = document.querySelectorAll(".custItem");
      items.forEach((item) => {
        item.style.flex = newFlexValue;
      });
    },
    triggerResize() {
      const container = this.$refs.cardContainer;
      const width = container?.offsetWidth;
      if (width && width <= 916) {
        this.updateItemStyle("calc(33.33% - 20px)");
      } else {
        this.updateItemStyle("calc(16.666% - 20px)");
      }
    },
    handleMouseLeave(event) {
      if (event.relatedTarget && event.relatedTarget.classList) {
        const contentClass = [
          "el-popover--plain",
          "el-popover",
          "is-light",
          "el-popper",
          "el-popper__arrow"
        ];
        let isLeave = true;
        contentClass.forEach((item) => {
          if (event.relatedTarget.classList.contains(item)) {
            return (isLeave = false);
          }
        });
        if (event.relatedTarget.classList.length == 0) {
          isLeave = false;
        }
        if (isLeave) {
          this.$nextTick(() => {
            if (this.$refs.descPopoverRef) {
              this.$refs.descPopoverRef.hide();
            }
            setTimeout(() => {
              this.mouseInner = false;
            }, 100);
          });
        }
      } else {
        this.mouseInner = false;
      }
    },
  },
  created() {
    this.fetchCustomerList();
  },
  mounted() {
    const container = this.$refs.cardContainer;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        if (width <= 916) {
          this.updateItemStyle("calc(33.33% - 20px)");
        } else {
          this.updateItemStyle("calc(16.666% - 20px)");
        }
      }
    });

    resizeObserver.observe(container);
  },
};
</script>
<template>
  <CustomerSidebar
    :custId="custId"
    v-if="isCustomerDetail"
    :showSidebar="isCustomerDetail"
    @update:showSidebar="handleSidebarUpdate"
  />
  <div 
    class="card h-100 mb-0"
    @mouseenter="mouseInner = true"
    @mouseleave="handleMouseLeave"
  >
    <LoadingOverlay :loading="loading" />
    <div
      class="card-body h-100"
      style="padding-bottom: 10px"
    >
      <div>
        <div class="d-flex mb-4">
          <div
            class="d-flex flex-grow-1"
            style="align-items: center; gap: 8px"
          >
          <div class="d-flex align-items-center gap-1">
            <h4 class="card-title mb-0">
              <span>客户信息</span>
              <el-popover
                placement="bottom-start"
                title="客户信息"
                :width="350"
                trigger="hover"
                :content="cardDesc"
                ref="descPopoverRef"
              >
                <template #reference>
                  <i v-show="cardDesc&&mouseInner" class="bx bx-help-circle" style="font-size: 16px;cursor: pointer;margin-left: 4px;"></i>
                </template>
              </el-popover>
            </h4>
            <div class="float-end">
              <el-select
                v-model="filterValue"
                placeholder="Select"
                style="width: 200px"
                @change="fetchCustomerList"
              >
                <el-option
                  v-for="item in filterOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>
          </div>
            
          </div>
          <!-- <div>
        <a
          href="/jobs/job-list"
          class="btn btn-primary btn-sm"
          >查看全部 <i class="bx bx-right-arrow-alt"></i
        ></a>
      </div> -->
        </div>
      </div>
      <div
        class="card-container"
        ref="cardContainer"
      >
        <div
          v-for="item in customerList"
          :key="item.custId"
          class="custItem"
        >
          <el-card
            class="card w-100 mb-0"
            @click="toggleSidebar(item.custId)"
            body-style="cursor: pointer;padding: 0"
          >
            <div class="card-body p-4 customer-card">
              <div class="text-center mb-3">
                <img
                  v-if="
                    item.userIcon &&
                    !avatarLoadErrorList.includes(item.userIcon)
                  "
                  :src="`/ipdoc${item.userIcon}`"
                  style="max-width: 100%"
                  class="avatar-custom-sm"
                  @error="handleAvatarError(item.userIcon)"
                />
                <span class="avatar-custom-sm"></span>
                <span class="text-body span-title">
                  <h5 class="mt-4 mb-2 font-size-15">{{ item.name }}</h5>
                </span>
                <div style="height: 20px">
                  <p class="mb-0 text-muted">
                    {{ item.responsibleUserNameStr }}
                  </p>
                </div>
              </div>

              <div
                class="d-flex"
                style="flex-wrap: wrap"
              >
                <p class="mb-0 flex-grow-1 text-muted">
                  <i class="bx bx-map text-body"></i> {{ item.country }}
                </p>
                <p
                  v-if="filterValue === 1"
                  class="mb-0 text-muted"
                >
                  <b>{{ item.number }}</b> ￥
                </p>
                <p
                  v-else
                  class="mb-0 text-muted"
                >
                  <b>{{ item.number }}</b>
                </p>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>

  <!--end col-->

  <!--end col-->
</template>
<style scoped>
.span-title {
  cursor: pointer;
}
.customer-card {
  height: 200px !important;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
/* .columns {
    -moz-columns: 240px;
    -webkit-columns: 240px;
    columns: 240px;
} */
.card-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  height: calc(100% - 74px);
  overflow-y: auto;
}

.custItem {
  flex: 0 0 calc(16.666% - 20px); /* 六个元素平分容器宽度 */
  max-width: 350px
}
.card-title {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
