<script>
import { queryConflicterListUrl } from "@/api/caseDetail";
import { transformation } from "@/utils";

export default {
  props: {
    caseInfo: {
      type: Object,
      required: () => {},
    },
  },
  components: {},
  data() {
    return {
      columns: [
        { title: "序号", width: "70", type: "index" },
        {
          title: "目标名称",
          value: "conId",
        },
        {
          title: "目标性质",
          value: "conNature",
          width: "100",
        },
      ],
      maxHeight: document.documentElement.clientHeight - 168,
      liyiarr: [],
    };
  },
  computed: {
    tableData() {
      return this.caseInfo.lawsuitConflicterList || [];
    },
  },
  methods: {
    transformation,
    fetchLiyiarr() {
      let conarrs = [
        ...this.caseInfo.adversaryArray,
        ...this.caseInfo.otherPartyArray,
        ...this.caseInfo.lawsuitConflicterList,
      ];
      conarrs = conarrs
        .filter((itm) => !!itm.nameId || !!itm.conId)
        .map((res) => res.nameId || res.conId);
      queryConflicterListUrl({ conIdArray: conarrs }).then((res) => {
        this.liyiarr = res.data || [];
      });
    },
  },
  created() {
    this.fetchLiyiarr()
  },
};
</script>
<template>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title">侵权人信息</h4>
      <el-table
        :data="tableData"
        :max-height="maxHeight"
      >
        <el-table-column
          :prop="col.value"
          :label="col.title"
          v-for="col of columns"
          :key="col.value"
          :type="col.type ? col.type : 'text'"
          :width="col.width ? col.width : 'auto'"
        >
          <template #default="scope">
            <span v-if="col.value == 'conId'">{{
              transformation(liyiarr, scope.row.conId, "conId", "fullname")
            }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
