<template>
  <div class="card">
    <div class="card-body" v-loading="loading">
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
                商标号 :
              </th>
              <td style="width: 40%">{{ caseInfo.droitNumber }}</td>
              <th
                scope="row"
                style="width: 10%"
              >
                申请日 :
              </th>
              <td style="width: 40%">{{ goodsDetailData.appDate }}</td>
            </tr>
            <tr>
              <th scope="row">商标名称 :</th>
              <td>{{ goodsDetailData.tmName }}</td>
              <th scope="row">注册日 :</th>
              <td>{{ goodsDetailData.regDate }}</td>
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
              <th scope="row">商标国际分类 :</th>
              <td>{{ goodsDetailData.goodClasses }}</td>
            </tr>
            <tr>
              <th scope="row">商品/服务项目 :</th>
              <td colspan="3" class="nocopy">
                <el-table
                  :data="goodsDetailData.goods"
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
              <td colspan="3">
                <span v-if="goodsDetailData.tmType == 1">一般</span>
                <span v-if="goodsDetailData.tmType == 2">集体</span>
                <span v-if="goodsDetailData.tmType == 3">证明</span>
              </td>
            </tr>
            <tr v-if="goodsDetailData.tmType == '2' || goodsDetailData.tmType == '3'">
              <th scope="row">集体/证明商标使用管理规则 :</th>
              <td>{{ goodsDetailData.memberRule }}</td>
              <th scope="row">集体/证明商标使用管理规则(附件) :</th>
              <td>{{ fileName[1005] }}</td>
            </tr>
            <tr v-if="goodsDetailData.tmType == '2'">
              <th scope="row">集体成员名单 :</th>
              <td>{{ goodsDetailData.memberNamelist }}</td>
              <th scope="row">集体成员名单(附件) :</th>
              <td>{{ fileName[1006] }}</td>
            </tr>
            <tr v-if="goodsDetailData.tmType == 2">
              <th scope="row">申请人是否具备检测能力 :</th>
              <td colspan="3">{{ goodsDetailData.isAppWithDetectAbility }}</td>
            </tr>
            <template v-if="goodsDetailData.isAppWithDetectAbility == '是'">
              <tr>
                <th scope="row">申请人检测资质证书（附件） :</th>
                <td>{{ fileName[1007] }}</td>
                <th scope="row">申请人专业检测设备清单 :</th>
                <td>{{ fileName[1008] }}</td>
              </tr>
              <tr>
                <th scope="row">申请人专业技术人员名单（附件） :</th>
                <td>{{ fileName[1009] }}</td>
                <th scope="row">申请人技术人员证书 :</th>
                <td>{{ fileName[1010] }}</td>
              </tr>
            </template>

            <tr>
              <th scope="row">是否三维标志 :</th>
              <td>{{ goodsDetailData.ifSolidTm == '1' ? "是" : "否" }}</td>
              <th scope="row">指定颜色 :</th>
              <td>{{ goodsDetailData.assignColor == '1'  ? "是" : "否" }}</td>
            </tr>
            <tr>
              <th scope="row">声音标志 :</th>
              <td :colspan="goodsDetailData.tmVoice ? 1 : 3">
                {{ goodsDetailData.tmVoice ? "是" : "否" }}
              </td>
              <template v-if="goodsDetailData.tmVoice">
                <th scope="row">声音文件 :</th>
                <td colspan="3">{{ fileName[1016] }}</td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { queryMaterialTypeUrl } from "@/api/caseDetail";
import { searchTmUrl } from "@/api/customerList";
import { getLanglist } from "@/utils";

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
          width: 130
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
      fileName: {},
      goodsDetailData: {
        goods: [],
      },
      loading:false
    };
  },
  methods: {
    getLanglist,
    gettyimage() {
      if (this.caseInfo.imageFile) {
        if (/^tmFile|\/tmFile/.test(this.caseInfo.imageFile)) {
          this.tyimage = `${this.caseInfo.imageFile}`;
        } else {
          this.tyimage = `/ipdoc${this.caseInfo.imageFile}`;
        }
      }
    },
    fetchMaterialType(id) {
      queryMaterialTypeUrl(id).then((res) => {
        this.fileName = res.data || {};
      });
    },
    fetchTmDetail() {
      if (!this.caseInfo.droitNumber) {
        return false
      }
      this.loading = true
      searchTmUrl({
        regNumbers: this.caseInfo.droitNumber,
        trans: 20,
        pageSize: 100,
        pageNo: 1,
      }).then((res) => {
        this.loading = false
        if (!res.data || !res.data.length) {
          return;
        }
        this.goodsDetailData.appCnName = res.data[0].applicantName;
        this.goodsDetailData.tmName = res.data[0].tmName;
        this.goodsDetailData.regNumber = res.data[0].regNumber;
        this.goodsDetailData.validStartDate = res.data[0].validStartDate;
        this.goodsDetailData.validEndDate = res.data[0].validEndDate;
        this.goodsDetailData.regDate = res.data[0].regNoticeDate;
        this.goodsDetailData.approvalDate = res.data[0].approvalDate;
        this.goodsDetailData.approvalNumber = res.data[0].approvalNumber;
        this.goodsDetailData.appDate = res.data[0].appDate;
        this.goodsDetailData.tmType =
          res.data[0].classify === "证明"
            ? "3"
            : res.data[0].classify === "集体"
            ? "2"
            : "1";
        this.goodsDetailData.imageFile = "/tmFile" + res.data[0].imgFilePath;
        this.tyimage = "/tmFile" + res.data[0].imgFilePath;
        // this.goodsDetailData.ifSolidTm =
        //   res.data[0].ifSolidTm == "是" ? "1" : "0";
        // this.goodsDetailData.assignColor = res.data[0].colorDesc
        //   ? res.data[0].colorDesc
        //   : false;
        this.goodsDetailData.tmVoice = res.data[0].tmForm !== "文字"
        this.goodsDetailData.colorSign = "0";
        if (res.data[0].trademarkCategories.length) {
          this.goodsDetailData.goods = 
            getLanglist(
              res.data
                .map((item) => item.trademarkCategories)
                .filter((item) => item)
            )
            .map((item) => ({
              goodClass: item.tmType,
              goodEnName: item.enName,
              goodName: item.name,
              id: item.id,
              similarGroup: item.tmGroup,
            }));
          this.goodsDetailData.goodClasses = [
            ...new Set(
              this.goodsDetailData.goods.map((item) => item.goodClass)
            ),
          ].join(";");
        } else {
          this.goodsDetailData.goodClasses = res.data[0].tmType;
        }
      });
    },
  },
  created() {
    // this.gettyimage();
    this.fetchMaterialType();
    this.fetchTmDetail()
    this.$addCopy()
  },
  beforeUnmount(){
    this.$destroyCopy()
  }
};
</script>

<style></style>
