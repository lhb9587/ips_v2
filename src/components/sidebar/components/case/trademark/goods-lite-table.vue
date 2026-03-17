<template>
  <div class="goods-lite-table">
    <div class="goods-lite-toolbar">
      <el-input
        v-model="searchKeyword"
        clearable
        class="goods-lite-input"
        placeholder="请输入商品/服务项目关键词"
        @keyup.enter="searchGoods"
      />
      <el-button
        type="primary"
        @click="searchGoods"
      >
        查询
      </el-button>
      <el-button
        type="primary"
        @click="exportGoods"
      >
        导出
      </el-button>
      <el-button
        type="primary"
        @click="showAllGoods"
      >
        全部
      </el-button>
    </div>

    <el-table
      :data="pageGoods"
      :max-height="280"
      :show-overflow-tooltip="true"
    >
      <el-table-column
        type="index"
        label="序号"
        width="60"
      />
      <el-table-column
        v-for="col in columns"
        :key="col.value"
        :prop="col.value"
        :label="col.title"
      />
    </el-table>

    <div class="goods-lite-pagination" v-show="pageData.total > 0">
      <pagination
        :storage="false"
        :limit="pageData.pageSize"
        :page="pageData.pageNo"
        :total="pageData.total"
        :pageSizes="[10, 50, 100, 200]"
        @pagination="handlePagination"
      />
    </div>
  </div>
  <el-dialog
    title="全部商品信息"
    width="80%"
    :append-to-body="true"
    v-model="showAllGoodsView"
  >
    <el-table
      :data="allGoodsData"
      :max-height="500"
      :show-overflow-tooltip="true"
    >
      <el-table-column
        type="index"
        label="序号"
        width="60"
      />
      <el-table-column
        v-for="col in columns"
        :key="`all-${col.value}`"
        :prop="col.value"
        :label="col.title"
      />
    </el-table>
  </el-dialog>
</template>

<script>
import Pagination from "@/components/common/pagination/index.vue";
import { ExportExcel } from "@/utils";

const DEFAULT_PAGE_SIZE = 10;

export default {
  name: "GoodsLiteTable",
  components: {
    Pagination,
  },
  props: {
    goodsList: {
      type: Array,
      default: () => [],
    },
    appFromto: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      searchKeyword: "",
      columns: [
        { title: "类别", value: "goodClass" },
        { title: "商品类似群组", value: "similarGroup" },
        { title: "商品代码", value: "goodCode" },
        { title: "商品中文名称", value: "goodName" },
        { title: "商品英文名称", value: "goodEnName" },
        { title: "商品日文名称", value: "goodJpName" },
      ],
      filteredGoods: [],
      pageGoods: [],
      showAllGoodsView: false,
      pageData: {
        pageNo: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        total: 0,
      },
    };
  },
  computed: {
    allGoodsData() {
      return Array.isArray(this.goodsList) ? this.goodsList : [];
    },
  },
  watch: {
    goodsList: {
      immediate: true,
      deep: true,
      handler(val) {
        this.filteredGoods = Array.isArray(val) ? val : [];
        this.pageData.pageNo = 1;
        this.pageData.pageSize = DEFAULT_PAGE_SIZE;
        this.updatePageGoods();
      },
    },
  },
  methods: {
    updatePageGoods() {
      this.pageData.total = this.filteredGoods.length;
      const offset = (this.pageData.pageNo - 1) * this.pageData.pageSize;
      this.pageGoods =
        offset + this.pageData.pageSize >= this.filteredGoods.length
          ? this.filteredGoods.slice(offset, this.filteredGoods.length)
          : this.filteredGoods.slice(offset, offset + this.pageData.pageSize);
    },
    matchKeyword(row, keyword) {
      const values = [
        row.goodClass,
        row.similarGroup,
        row.goodCode,
        row.goodName,
        row.goodEnName,
        row.goodJpName,
      ];
      return values.some((val) => String(val || "").includes(keyword));
    },
    searchGoods() {
      const allGoods = Array.isArray(this.goodsList) ? this.goodsList : [];
      const tokens = (this.searchKeyword || "")
        .replace(/；/g, ";")
        .split(";")
        .map((item) => item.trim())
        .filter(Boolean);

      this.filteredGoods = !tokens.length
        ? allGoods
        : allGoods.filter((row) =>
            tokens.some((token) => this.matchKeyword(row, token)),
          );

      this.pageData.pageNo = 1;
      this.pageData.pageSize = DEFAULT_PAGE_SIZE;
      this.updatePageGoods();
    },
    handlePagination({ page, limit }) {
      this.pageData.pageNo = page;
      this.pageData.pageSize = limit;
      this.updatePageGoods();
    },
    showAllGoods() {
      this.showAllGoodsView = true;
    },
    getExportHeaders() {
      if (["内-外", "外-外"].includes(this.appFromto)) {
        return this.columns
          .filter((item) =>
            ["goodClass", "goodName", "goodEnName"].includes(item.value),
          )
          .map((item) => ({
            key: item.value,
            title: item.title.replace("名称", ""),
          }));
      }
      return this.columns.map((item) => ({
        key: item.value,
        title: item.title,
      }));
    },
    exportGoods() {
      if (!this.filteredGoods.length) {
        this.$message.warning("暂无可导出的商品/服务项目");
        return;
      }
      const headers = this.getExportHeaders();
      ExportExcel(headers, this.filteredGoods, "商品服务项目.xlsx");
      this.$message.success("导出成功");
    },
  },
};
</script>

<style scoped>
.goods-lite-table {
  width: 100%;
}

.goods-lite-toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 10px;
  gap: 8px;
}

.goods-lite-input {
  flex: 1;
  min-width: 0;
  max-width: none;
}

.goods-lite-pagination {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
</style>
