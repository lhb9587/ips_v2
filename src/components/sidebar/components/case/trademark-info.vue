<template>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-2">商标信息</h4>

      <div class="table-responsive">
        <table
          class="table table-nowrap mb-0"
          style="width: 100%"
        >
          <tbody>
            <tr>
              <th
                scope="row"
                style="width: 10%"
              >
                商标名称 :
              </th>
              <td style="width: 40%">{{ caseInfo.tmName }}</td>
              <th
                scope="row"
                style="width: 10%"
              >
                商标英文 :
              </th>
              <td style="width: 40%">{{ caseInfo.tmNameEn }}</td>
            </tr>
            <tr>
              <th scope="row">商标图样 :</th>
              <td>
                <img
                  style="width: 100px"
                  :src="tyimage"
                  alt=""
                />
              </td>
              <th scope="row">商标设计说明 :</th>
              <td>{{ caseInfo.tmDesignDeclare }}</td>
            </tr>
            <tr>
              <th scope="row">递交日期 :</th>
              <td>{{ caseInfo.submitDate }}</td>
              <th scope="row">申请日期 :</th>
              <td>{{ caseInfo.appDate }}</td>
            </tr>
            <tr>
              <th scope="row">申请号 :</th>
              <td>{{ caseInfo.appNumber }}</td>
              <th scope="row">初审公告号 :</th>
              <td>{{ caseInfo.approvalNo }}</td>
            </tr>
            <tr>
              <th scope="row">初审公告日期 :</th>
              <td>{{ caseInfo.approvalDate }}</td>
              <th scope="row">初审公告期号 :</th>
              <td>{{ caseInfo.approvalNumber }}</td>
            </tr>
            <tr>
              <th scope="row">注册日期 :</th>
              <td>{{ caseInfo.regDate }}</td>
              <th scope="row">注册号 :</th>
              <td>{{ caseInfo.regNumber }}</td>
            </tr>
            <tr>
              <th scope="row">有效期起始日 :</th>
              <td>{{ caseInfo.validStartDate }}</td>
              <th scope="row">有效期截止日 :</th>
              <td>{{ caseInfo.validEndDate }}</td>
            </tr>
            <tr>
              <th scope="row">商标国际分类 :</th>
              <td colspan="3">{{ caseInfo.goodClasses }}</td>
            </tr>
            <tr>
              <th scope="row">商品/服务项目 :</th>
              <td colspan="3" class="nocopy"> 
                      <el-table
                        :data="caseInfo.goods"
                        :max-height="280"
                        :show-overflow-tooltip="true"
                      >
                        <el-table-column
                          :prop="col.value"
                          :label="col.title"
                          v-for="col of goodColumns"
                          :key="col.value"
                        />
                      </el-table>
              </td>
            </tr>
            <tr>
              <th scope="row">种类 :</th>
              <td>
                <span v-if="caseInfo.tmType == 1">一般</span>
                <span v-if="caseInfo.tmType == 2">集体</span>
                <span v-if="caseInfo.tmType == 3">证明</span>
              </td>
              <th scope="row">是否三维标志 :</th>
              <td>{{ caseInfo.ifSolidTm == '1' ? "是" : "否" }}</td>
            </tr>
            <tr>
              <th scope="row">是否颜色组合 :</th>
              <td>{{ caseInfo.colorSign == '1' ? "是" : "否" }}</td>
              <th scope="row">指定颜色 :</th>
              <td>{{ caseInfo.assignColor ? "是" : "否" }}</td>
            </tr>
            <tr>
              <th scope="row">声音标志 :</th>
              <td colspan="3">{{ caseInfo.tmVoice == '1' ? "是" : "否" }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    caseInfo: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      tyimage: "",
      goodColumns: [
        {
          title: "类别",
          value: "goodClass",
        },
        {
          title: "商品类似群组",
          value: "similarGroup",
        },
        {
          title: "商品代码",
          value: "goodCode",
        },
        {
          title: "商品中文名称",
          value: "goodName",
        },
        {
          title: "商品英文名称",
          value: "goodEnName",
        },
        {
          title: "商品日文名称",
          value: "goodJpName",
        },
      ],
    };
  },
  methods: {
    gettyimage() {
      if (this.caseInfo.imageFile) {
        if (/^tmFile|\/tmFile/.test(this.caseInfo.imageFile)) {
          this.tyimage = `${this.caseInfo.imageFile}`;
        } else {
          this.tyimage = `/ipdoc${this.caseInfo.imageFile}`;
        }
      }
    },
  },
  created() {
    this.gettyimage();
    this.$addCopy()
  },
  beforeUnmount(){
    this.$destroyCopy()
  }
};
</script>

<style></style>
