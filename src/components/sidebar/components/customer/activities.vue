<script>
import { queryActivityOneUrl } from "@/api/customerList";
import { getProgID,viewPdf } from '@/utils'
export default {
  props: {
    customerInfo: {
      type: Object,
      default: () => {},
    },
    workTimeActiveList: {
      type: Array,
      default: () => [],
    },
    activeList: {
      type: Array,
      default: () => [],
    },
  },
  components: {},
  data() {
    return {
      columns: [
        { title: "主题", value: "subject" },
        {
          title: "开始时间",
          value: "begindate",
          width: 120,
        },
        {
          title: "赠送礼品",
          value: "putGift",
        },
        { title: "内容描述", value: "description" },
        {
          title: "操作",
          value: "operate",
          width: 100,
        },
      ],
      workTimeColumns: [
        {
          title: "姓名",
          value: "userFullName",
        },
        {
          title: "角色",
          value: "userRoleName",
        },
        {
          title: "活动类型",
          value: "actTypeStr",
        },
        {
          title: "开始时间",
          value: "begindate",
        },
        {
          title: "内容描述",
          value: "description",
        },
      ],
      maxHeight: 300,
      showCommonActsModal: false,
      detail: {},
      otherContactColumns: [
        {
          title: "序号",
          value: "index",
          width: 60,
        },
        {
          title: "对方联系人",
          value: "custContactName",
          width: "auto",
        },
        {
          title: "备注",
          value: "memo",
          width: "auto",
        },
      ],
      ourContactColumns: [
        {
          title: "序号",
          value: "index",
          width: 60,
        },
        {
          title: "我方联系人",
          value: "userName",
          width: "auto",
        },
        {
          title: "备注",
          value: "memo",
          width: "auto",
        },
      ],
    };
  },
  computed: {
    // commonTableData() {
    //   return this.customerInfo.activities || [];
    // },
    fullName() {
      return this.customerInfo.fullname;
    },
    materialList() {
      return this.detail.materialList || [];
    },
  },
  methods: {
    viewPdf,
    getProgID,
    viewDetail(row) {
      this.fetchActivityOne(row.custActId);
      this.showCommonActsModal = true;
    },
    fetchActivityOne(custActId) {
      queryActivityOneUrl({ custActId })
        .then((response) => {
          this.detail = response.data;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    previewFile(data){
      let url = data.address
      if (getProgID(url)||url.replace(/.+\./,"").toLocaleLowerCase()=='msg') {
        if(['doc','docx'].includes(url.replace(/.+\./,"").toLocaleLowerCase())){
          viewPdf(`${url}`)
        }else {
          let flag = ''
          if(data.mailId){
            flag = 'mailId'
          }else if (data.materialId) {
            flag = 'materialId'
          }
          url = url.replace(/&/g, '%26')
          window.open(`/#/preView?address=ipdoc${url}&${flag}=${data[flag]}`.replace(/[+]/g,'%2B'))
        }
      } else if(['pdf','jpg','png'].some(item=>url.replace(/.+\./,"").toLocaleLowerCase()==item)){
        window.open(`/ipdoc${url}`.replace(/[+]/g,'%2B'))
      } else {
        this.downLoad(data)
      }
    }
  },
};
</script>
<template>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-4">客户活动-普通</h4>
      <div class="table-responsive">
        <el-table
          :data="activeList"
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
            :width="col.width ? col.width : 'auto'"
          >
            <template #default="scope">
              <button
                v-if="col.value === 'operate'"
                type="button"
                class="btn btn-soft-primary btn-sm btn-rounded"
                @click="viewDetail(scope.row)"
              >
                查看详情
              </button>
              <span
                v-if="col.value === 'sysStatusStr'"
                class="badge badge-pill font-size-11"
                :class="{
                  'badge-soft-warning': `${scope.row.sysStatusStr}` == '未启用',
                  'badge-soft-success': `${scope.row.sysStatusStr}` == '启用',
                  'badge-soft-danger': `${scope.row.sysStatusStr}` == '停用',
                }"
                >{{ scope.row.sysStatusStr }}</span
              >
            </template></el-table-column
          >
        </el-table>
      </div>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-4">客户活动-工时</h4>
      <div class="table-responsive">
        <el-table
          :data="workTimeActiveList"
          :max-height="maxHeight"
          :fit="true"
          :show-overflow-tooltip="true"
          :scrollbar-always-on="true"
        >
          <el-table-column
            :prop="col.value"
            :label="col.title"
            v-for="col of workTimeColumns"
            :key="col.value"
          >
            <template #default="scope">
              <button
                v-if="col.value === 'operate'"
                type="button"
                class="btn btn-soft-primary btn-sm btn-rounded"
                @click="viewDetail(scope.row)"
              >
                查看详情
              </button>
              <span
                v-if="col.value === 'sysStatusStr'"
                class="badge badge-pill font-size-11"
                :class="{
                  'badge-soft-warning': `${scope.row.sysStatusStr}` == '未启用',
                  'badge-soft-success': `${scope.row.sysStatusStr}` == '启用',
                  'badge-soft-danger': `${scope.row.sysStatusStr}` == '停用',
                }"
                >{{ scope.row.sysStatusStr }}</span
              >
            </template></el-table-column
          >
        </el-table>
      </div>
    </div>
  </div>
  <b-modal
    v-model="showCommonActsModal"
    title="活动-查看"
    centered
    hide-footer
    size="lg"
  >
    <div class="table-responsive">
      <table
        class="table table-td-nowrap mb-0"
        style="width: 100%"
      >
        <tbody>
          <tr>
            <th style="width: 15%">活动状态 :</th>
            <td style="width: 35%">{{ detail.actStatusStr }}</td>
            <th style="width: 15%">主题 :</th>
            <td style="width: 35%; white-space: normal">
              {{ detail.subject }}
            </td>
          </tr>
          <tr>
            <th style="width: 15%">活动类型 :</th>
            <td style="width: 35%">{{ detail.actTypeStr }}</td>
            <th style="width: 15%">活动方式 :</th>
            <td style="width: 35%">{{ detail.actKindStr }}</td>
          </tr>
          <tr>
            <th style="width: 15%">开始时间 :</th>
            <td style="width: 35%">{{ detail.begindate }}</td>
            <th style="width: 15%">结束时间 :</th>
            <td style="width: 35%">{{ detail.enddate }}</td>
          </tr>
          <tr>
            <th>地点 :</th>
            <td colspan="3">{{ fullName }}</td>
          </tr>
          <tr>
            <th style="width: 15%">招待类型 :</th>
            <td style="width: 35%">{{ detail.serviceTypeStr }}</td>
            <th style="width: 15%">招待地点 :</th>
            <td style="width: 35%">{{ detail.servicePlace }}</td>
          </tr>
          <tr>
            <th style="width: 15%">赠送礼品 :</th>
            <td>{{ detail.putGift }}</td>
            <th>收到礼品 :</th>
            <td>{{ detail.getGift }}</td>
          </tr>
          <tr>
            <th>内容描述 :</th>
            <td
              colspan="3"
              style="white-space: normal"
            >
              {{ detail.description }}
            </td>
          </tr>
          <tr>
            <th>上传文件 :</th>
            <td colspan="3">
              <div style="display: flex; flex-direction: column">
                <div
                  v-for="(item, index) in materialList"
                  :key="index"
                  @click="previewFile(item)"
                  style="gap: 6px;display: flex;align-items: center;"
                  class="pointer"
                >
                  <div>{{ item.materialName }}</div>
                  <i class="fas fa-eye"></i>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <th>对方联系人 :</th>
            <td colspan="3">
              <el-table
                :data="detail.customerContactActs"
                :max-height="200"
                :scrollbar-always-on="true"
              >
                <el-table-column
                  :prop="col.value"
                  :label="col.title"
                  v-for="col of otherContactColumns"
                  :key="col.value"
                  :type="col.value === 'index' ? 'index' : ''"
                  :width="col.width"
                />
              </el-table>
            </td>
          </tr>
          <tr>
            <th>我方联系人 :</th>
            <td colspan="3">
              <el-table
                :data="detail.agencyContactActs"
                :max-height="200"
                :scrollbar-always-on="true"
              >
                <el-table-column
                  :prop="col.value"
                  :label="col.title"
                  v-for="col of ourContactColumns"
                  :key="col.value"
                  :type="col.value === 'index' ? 'index' : ''"
                  :width="col.width"
                />
              </el-table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </b-modal>
</template>
<style scoped lang="scss">
.pointer {
  color: #556ee6;
  cursor: pointer;
}
</style>
