<template>
    <div :class="{ hidden: hidden }" class="pagination-container">
      <el-pagination
        :popper-append-to-body="true"
        :background="background"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :layout="layout"
        :page-sizes="pageSizes"
        :total="total"
        v-bind="$attrs"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </template>
  
  <script>
    export default {
      name: 'Pagination',
      props: {
        total: {
          required: true,
        },
        page: {
          default: 1,
        },
        limit: {
          default: 20,
        },
        pageSizes: {
          type: Array,
          default() {
            return [10, 20, 30, 50]
          },
        },
        storage: {
          default: true,
        },
        layout: {
          type: String,
          default: 'total, sizes, prev, pager, next, jumper',
        },
        background: {
          type: Boolean,
          default: true,
        },
        autoScroll: {
          type: Boolean,
          default: false,
        },
        hidden: {
          type: Boolean,
          default: false,
        },
        storageName: {
          type: String,
          default: '',
        },
      },
      computed: {
        currentPage: {
          get() {
            return Number(this.page)
          },
          set(val) {
            this.$emit('update:page', Number(val))
          },
        },
        pageSize: {
          get() {
            if (this.storage) {
              const pageSizeData = JSON.parse(localStorage.getItem('pageSize')) || [];
              const routeName = this.storageName || this.$route.name;
              const savedData = pageSizeData.find(item => item.name === routeName);
              if (savedData) {
                this.$emit('update:limit', savedData.pageSize)
              }
            }
            return this.limit;
          },
          set(val) {
            if (isNaN(val)) {
              val = 1000000
            }
            this.$emit('update:limit', val)
            if (!this.storage) {
              return
            }
            let arr = JSON.parse(localStorage.getItem('pageSize')) || [];
            const routeName = this.storageName || this.$route.name;
            
            if (arr.find((item) => item.name === routeName)) {
              arr.find((item) => item.name === routeName).pageSize = val;
            } else {
              arr.push({ name: routeName, pageSize: val });
            }
            localStorage.setItem('pageSize', JSON.stringify(arr));
          },
        },
      },
      methods: {
        handleSizeChange(val) {
          this.currentPage = 1;
          this.$emit('pagination', { page: 1, limit: val });
        },
        handleCurrentChange(val) {
          this.$emit('pagination', { page: val, limit: this.pageSize });
        },
      },
    }
  </script>
  
  <style lang="scss" scoped>
    .pagination-container.hidden {
      display: none;
    }
    :deep(.el-pagination) {
      flex-wrap: wrap;
    }
  </style>
  