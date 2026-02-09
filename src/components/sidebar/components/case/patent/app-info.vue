<template>
  <div class="card mb-0">
    <div class="card-body">
      <h4 class="card-title mb-2">申请人信息</h4>
      <el-table
        :data="appTableList"
        :max-height="300"
        :show-overflow-tooltip="true"
        :scrollbar-always-on="true"
      >
        <el-table-column
          label="序号"
          type="index"
          width="60"
        >
        </el-table-column>
        <el-table-column
          prop="applicantName"
          label="申请人中文名称"
          width="150"
        >
        </el-table-column>
        <el-table-column
          prop="applicantEnName"
          label="申请人英文名称"
          width="150"
        >
        </el-table-column>
        <el-table-column
          width="60"
          label="总委"
        >
          <template #default="scope">
            {{ scope.row.iszw ? "是" : "否" }}
          </template>
        </el-table-column>
        <el-table-column
          width="150"
          label="中文地址"
        >
          <template #default="scope">
            {{
              scope.row.appAddrArray &&
              scope.row.appAddrArray.find(
                (i) => i.addrId == scope.row.addrId
              ) &&
              scope.row.appAddrArray.find((i) => i.addrId == scope.row.addrId)
                .addressCn
            }}
          </template>
        </el-table-column>
        <el-table-column
          prop="addressEn"
          label="英文地址"
          width="150"
        >
        </el-table-column>
        <el-table-column
          prop="post"
          key="post"
          width="100"
          label="邮编"
        >
        </el-table-column>
        <el-table-column
          v-if="caseType == 'PCT国际申请'"
          prop="pctzwno"
          key="pctzwno"
          width="100"
          label="PCT总委号"
        >
        </el-table-column>
        <el-table-column
          v-else
          prop="zwNo"
          key="zwNo"
          width="130"
          label="总委号"
        >
        </el-table-column>
        <el-table-column
          width="140"
          prop="beianYear"
          label="费用减缴费用年度"
        >
        </el-table-column>
        <el-table-column
          v-if="hasApplicationType"
          prop="applicationType"
          key="applicationType"
          width="140"
          label="证件号"
        >
        </el-table-column>
        <el-table-column
          v-else
          prop="certCode"
          key="certCode"
          width="150"
          label="统一社会信用代码"
        >
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { queryAddrByAppIds } from "@/api/applicant";

export default {
  props: {
    appTableList: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      appList: [],
    };
  },
  computed: {
    hasApplicationType() {
      return (
        this.appTableList &&
        this.appTableList.find(
          (item) => item.applicationType == "1752"
        )
      );
    },
  },
  methods: {
    fetchAddrByAppIds(appList) {
      if (!(appList && appList.length)) return;
      let appIds = appList
        .map((i) => i.appId)
        .filter((item) => !!item)
        .join(",");
      if (!appIds.length) return;
      queryAddrByAppIds({ appIds }).then((res) => {
        res.data.forEach((i) => {
          appList.forEach((j) => {
            if (j.appId == i.appId) {
              j.post =
                i.appAddrArray.find((item) => item.addrId == j.addrId) &&
                i.appAddrArray.find((item) => item.addrId == j.addrId).post;
              j.addressEn =
                i.appAddrArray.find((item) => item.addrId == j.addrId) &&
                i.appAddrArray.find((item) => item.addrId == j.addrId)
                  .addressEn;
              j.appAddrArray = i.appAddrArray;
            }
          });
        });
      });
    },
  },
  created() {
    this.fetchAddrByAppIds(this.appTableList);
  },
};
</script>

<style></style>
