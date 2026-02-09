<template>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-2">法律/司法鉴定/仲裁/专利/商标资格</h4>
      <div class="table-responsive">
        <table
          class="table table-nowrap mb-0"
          style="width: 100%"
        >
          <tbody>
            <tr>
              <th style="width: 10%">法律资格 :</th>
              <td style="width: 40%">{{ detailInfo.practiceType }}</td>
              <th style="width: 10%">专利资格 :</th>
              <td style="width: 40%">{{ detailInfo.patentType }}</td>
            </tr>
            <tr>
              <th>商标资格 :</th>
              <td>{{ detailInfo.trademarkType }}</td>
              <th>仲裁员资格 :</th>
              <td>{{ detailInfo.arbiterType }}</td>
            </tr>
            <tr>
              <th>司法鉴定人资格 :</th>
              <td colspan="3">{{ detailInfo.judicialType }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-2">职称和专业技术人员资格（人力社保局）</h4>

      <el-table
        :data="tableData"
        :max-height="maxHeight"
        :fit="true"
        :show-overflow-tooltip="true"
        :scrollbar-always-on="true"
      >
        <el-table-column
          :prop="col.value"
          :label="col.title"
          v-for="col of columns"
          :key="col.value"
          :type="col.type || 'text'"
          :width="col.width || 'auto'"
          :min-width="col.minWidth || ''"
        />
      </el-table>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    detailInfo: {
      type: Object,
      required: true,
      default: () => {},
    },
  },
  data() {
    return {
      columns: [
        {
          title: "资格名称",
          value: "name",
        },
        {
          title: "资格等级",
          value: "level",
        },
        {
          title: "取得资格证书时间",
          value: "acquireDate",
        },
        {
          title: "证书编号",
          value: "certificationNumber",
        },
        {
          title: "颁发单位",
          value: "organization",
        },
        {
          title: "专业",
          value: "major",
        },
      ],
      maxHeight: 400,
    };
  },
  computed: {
    tableData() {
      return this.detailInfo.certificates || [];
    },
  },
};
</script>
