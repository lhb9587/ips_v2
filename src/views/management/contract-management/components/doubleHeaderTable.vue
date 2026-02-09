<template>
    <div>
      <el-table :data="tableData" border class="computed-table">
        <!-- 横向时间表头 -->
        <el-table-column
          prop="parameter"
          label="时间"
          width="200"
          align="center"
          fixed
        >
          <el-table-column
            prop="parameter"
            label="参数"
            align="center"
            width="200"
            fixed
          >
          </el-table-column>
        </el-table-column>
  
        <!-- 纵向参数名表头 -->
        <el-table-column
          v-for="(time, index) in times"
          :key="index"
          :label="time"
          align="center"
          width="100"
        >
          <template #default="scope">
            {{ scope.row.values[index] }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        tableData: [],
        parameters: Array.from({ length: 15 }, (_, i) => `Parameter${i + 1}`), // 参数名列表
        times: []
      }
    },
    mounted() {
      this.times = this.generateTimeLabels()
      this.tableData = this.generateTableData()
    },
    methods: {
      generateTableData() {
        const tableData = this.parameters.map(parameter => ({
          parameter: parameter,
          values: this.generateParameterValues()
        }))
        return tableData
      },
      generateParameterValues() {
        return Array.from({ length: 48 }, () =>
          Math.floor(Math.random() * 100)
        ) // 48个时间段，每30分钟一个
      },
      generateTimeLabels() {
        const times = []
        for (let hour = 0; hour < 24; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const time = `${hour.toString().padStart(2, '0')}:${minute
              .toString()
              .padStart(2, '0')}`
            times.push(time)
          }
        }
        return times
      }
    }
  }
  </script>
  <style lang="scss">
  .el-table {
    &.computed-table {
      thead.is-group th {
        background: none;
        padding: 0px;
      }
      thead.is-group tr:first-of-type th:first-of-type,
      thead.is-group tr:last-of-type th:first-of-type {
        background: #fff !important;
      }
      thead.is-group tr:first-of-type th:first-of-type {
        border-bottom: none;
      }
      thead.is-group tr:first-of-type th:first-of-type div.cell {
        text-align: right;
      }
      thead.is-group tr:last-of-type th:first-of-type div.cell {
        text-align: left;
      }
      thead.is-group tr:first-of-type th:first-of-type:before {
        content: '';
        position: absolute;
        width: 1px;
        height: 102px; //自行调整
        top: 0;
        left: 0;
        background-color: #808080;
        display: block;
        transform: rotate(-77deg); //自行调整
        -webkit-transform-origin: top;
        transform-origin: top;
      }
      thead.is-group tr:last-of-type th:first-of-type:before {
        content: '';
        position: absolute;
        width: 1px;
        height: 102px; //自行调整
        bottom: 0;
        right: 0;
        background-color: #808080;
        display: block;
        transform: rotate(-77deg);
        -webkit-transform-origin: bottom;
        transform-origin: bottom;
      }
    }
  }
  </style>