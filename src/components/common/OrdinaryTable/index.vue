<template>
  <div class="table-responsive mb-0">
    <table class="table align-middle table-nowrap" :style="{ 'max-height': '500px' }">
      <thead class="table-light">
        <tr>
          <th
            class="align-middle"
            v-for="col of columns"
            :key="col.value"
          >
            {{ col.title }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="data in tableData"
          :key="data.id"
        >
          <td
            v-for="item of columns"
            :key="item.value"
            style="height: 52px"
          >
            <div v-if="!item.custom">{{data[item.value] || '' }}</div>
            <slot
              v-else
              :name="item.value"
              :data="data"
            ></slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: "table",
  props: {
    columns: {
      type: Array,
      default: () => [],
    },
    tableData: {
      type: Array,
      default: () => [],
    },
    maxHeight: {
      type: String,
      default: "auto",
    },
  },
  data() {
    return {
      message: "欢迎使用Vue 2!",
    };
  },
  methods: {
    updateMessage() {
      this.message = "消息已更新!";
    },
  },
  created() {
    console.log(this.tableData, "tableData");
    console.log(this.maxHeight, "maxHeight");
  },
};
</script>

<style>
h1 {
  color: blue;
}
</style>
