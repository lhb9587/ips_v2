<template>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title">特殊指示</h4>
      <b-tabs
        justified
        nav-class="nav-tabs-custom"
        content-class="p-3 text-muted"
      >
        <b-tab
          :title="item.label"
          v-model="selectedTab"
          v-for="item of tabList"
          :key="item.value"
        >
          <template v-slot:title>
            <span class="d-inline-block d-sm-none">
              <i class="fas fa-home"></i>
            </span>
            <span class="d-none d-sm-inline-block">{{ item.label }}</span>
          </template>
          <!-- <BAccordion flush>
            <BAccordionItem
              :visible="index == 0"
              :title="`${baItem.startDate} ${baItem.subject}`"
              @toggle="toggleAccordionItem(index)"
              v-for="(baItem, index) of instructList[item.value]"
              :key="index"
            >
              {{ baItem.subject }}
              <p>
                {{ baItem.specialInfo }}
              </p>
            </BAccordionItem>
          </BAccordion> -->
          <SimpleBar
            data-simplebar
            style="max-height:calc(100vh - 240px)"
          >
            <el-collapse
              v-model="activeItems"
              class="collapse_custom"
            >
              <el-collapse-item
                :title="`${baItem.startDate} ${
                  baItem.subject ? baItem.subject : ''
                }`"
                v-for="(baItem, index) of instructList[item.value]"
                :name="`${item.value}${index}`"
                :key="`${item.label}${index}`"
              >
                <div>
                  {{ baItem.subject }}
                </div>
                {{ baItem.specialInfo }}
              </el-collapse-item>
            </el-collapse>
          </SimpleBar>
        </b-tab>
      </b-tabs>
    </div>
  </div>
</template>

<script>
import { SimpleBar } from "simplebar-vue3";
import { queryCustomerReqUrl } from "@/api/caseDetail";
export default {
  components: {
    SimpleBar,
  },
  props: {
    caseInfo: {
      type: Object,
      required: () => {},
    },
  },
  data() {
    return {
      selectedTab: "custActivity",
      tabList: [
        { value: "custReqCases", label: "案件指示" },
        { value: "custReqBills", label: "账单指示" },
        { value: "custActivity", label: "信息变更" },
        { value: "custCommands", label: "客户个按要求" },
      ],
      instructList: {},
      activeItems: [],
      maxHeight: document.documentElement.clientHeight - 308,
    };
  },
  computed: {
    caseId() {
      return this.caseInfo.caseId;
    },
    custId() {
      return this.caseInfo.custId;
    },
  },
  methods: {
    fetchCustomerReq() {
      const data = {
        caseId: this.caseId,
        custId: this.custId,
      };
      queryCustomerReqUrl(data).then((res) => {
        const actives = [];
        for (let key in res.data) {
          console.log(key + ": " + res.data[key]);
          if (res.data[key] && res.data[key].length) {
            res.data[key].forEach((item, index) => {
              item.nameKey = `${key}${index}`;
              actives.push(`${key}${index}`);
            });
          }
        }
        console.log(res.data, "res.data");
        this.instructList = res.data;
        console.log(actives, "actives");
        this.activeItems = actives;
        const sortArr = JSON.parse(JSON.stringify(this.tabList));
        sortArr.sort((a, b) => {
          const lengthA = this.instructList[a.value].length;
          const lengthB = this.instructList[b.value].length;
          return lengthB - lengthA;
        });
        this.tabList = sortArr;
        console.log(sortArr, "sortArr");
      });
    },
    toggleAccordionItem(index) {
      console.log(index, "index");
    },
  },
  created() {
    this.fetchCustomerReq();
    console.log(this.caseInfo, "detail");
  },
};
</script>

<style scoped lang="scss">
.collapse_custom {
  :deep(.el-collapse-item .is-active) {
    color: #4d63cf;
    background-color: #eef1fd;
  }
  :deep(.el-collapse-item__header) {
    padding-left: 16px;
    padding-right: 8px;
  }
  :deep(.el-collapse-item__content) {
    padding: 16px;
  }
}
</style>
