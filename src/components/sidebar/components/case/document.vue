<script>
import { queryCaseEventListUrl } from "@/api/caseDetail";
import VueEasyLightbox from "vue-easy-lightbox";
import { getProgID, viewPdf } from '@/utils'
export default {
  props: {
    caseInfo: {
      type: Object,
      required: () => {},
    },
  },
  components: {
    VueEasyLightbox,
  },
  data() {
    return {
      columns: [
        {
          title: "事件名称",
          value: "eventName",
          width: 280,
        },
        {
          title: "附件名称",
          value: "fileName",
        },
        {
          title: "上传人",
          value: "creater",
          width: 80,
        },
        {
          title: "上传时间",
          value: "createDate",
          width: 180,
        },
      ],
      eventList: [],
      visible: false,
      imgs: [],
      index: 0,
    };
  },
  computed: {
    caseId() {
      return this.caseInfo.caseId;
    },
  },
  created() {
    this.fetchCaseEventList();
  },
  methods: {
    viewPdf,
    getProgID,
    handleHide() {
      this.visible = false;
    },
    fetchCaseEventList() {
      queryCaseEventListUrl({ caseId: this.caseId }).then((res) => {
        // queryCaseEventListUrl({ caseId: 39331841 }).then((res) => {
        // queryCaseEventListUrl({ caseId: 39331846 }).then((res) => {
        // res.data[0].evenList.forEach(item => {
        //     // item.materialList.push()
        //     item.materialList.splice(0,1,{
        //         materialId:1112213123,
        //         materialName:"士大夫艰苦上岛咖啡"
        //     })
        // })
        // res.data.push({
        //   docTypeName: "递交官方",
        //   evenList: [
        //     {
        //       typeName: "测试内容",
        //       createDate: "2023-11-14 10:00:00",
        //       creater: "张三",
        //       materialList: [
        //         {
        //           materialId: 1112213123,
        //           materialName: "士大夫艰苦上岛咖啡",
        //         },
        //       ],
        //     },
        //   ],
        // });
        this.eventList = res.data || [];
      });
    },
    viewFile(data) {
      let url = data.address || data.url;
      // window.open(`/ipdoc${url}`.replace(/[+]/g, "%2B"));
      if (getProgID(url) || ['eml', 'msg'].includes(url.replace(/.+\./, '').toLocaleLowerCase())) {
        if (
          ["doc", "docx"].includes(url.replace(/.+\./, "").toLocaleLowerCase())
        ) {
          viewPdf(`${url}`);
        } else {
          let flag = ''
          if(data.mailId){
            flag = 'mailId'
          }else if (data.materialId) {
            flag = 'materialId'
          }
          url = url.replace(/&/g, '%26')
          window.open(`/preView?address=ipdoc${url}&${flag}=${data[flag]}`.replace(/[+]/g,'%2B'))
        }
      } else if (
        ["pdf"].some(
          (item) => url.replace(/.+\./, "").toLocaleLowerCase() == item
        )
      ) {
        window.open(`/ipdoc${url}`.replace(/[+]/g, "%2B"));

      } else if (
        ["jpg", "png"].some(
          (item) => url.replace(/.+\./, "").toLocaleLowerCase() == item
        )
      ) {
        this.imgs = [`/ipdoc${url}`];
        this.visible = true;
      } else {
        this.downLoad(data);
      }
    },
    downLoad(data) {
      const link = document.createElement("a");
      link.href = `/ipdoc${data.address}`;
      link.setAttribute("download", data.materialName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  },
};
</script>
<template>
  <div
    class="card"
    v-for="item of eventList"
    :key="item.id"
  >
    <div class="card-body">
      <h4 class="card-title mb-2">{{ item.docTypeName }}</h4>
      <el-table
        :data="item.evenList"
        :max-height="400"
        :fit="true"
        show-overflow-tooltip
      >
        <el-table-column
          :prop="col.value"
          :label="col.title"
          v-for="col of columns"
          :key="col.value"
          :width="col.width || 'auto'"
        >
          <template
            v-if="col.value === 'fileName'"
            #default="scope"
          >
            <div
              v-for="file of scope.row.materialList"
              :key="file.materialId"
              style="
                display: flex;
                align-items: center;
                gap: 6px;
                cursor: pointer;
                color: #556ee6;
                overflow: hidden; /* 隐藏溢出内容 */
              "
              v-on:click="viewFile(file)"
            >
              <div
                style="
                  flex-grow: 1; /* 自适应宽度 */
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                "
              >
                {{ file.materialName }}
              </div>
              <i class="fas fa-eye" style="flex-shrink: 0;"></i>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <VueEasyLightbox
        :visible="visible"
        :imgs="imgs"
        :index="index"
        @hide="handleHide"
      ></VueEasyLightbox>
    </div>
  </div>
  <div
    class="card"
    v-if="!eventList.length"
  >
    <div class="card-body">
      <el-empty description="暂无数据" />
    </div>
  </div>
</template>
