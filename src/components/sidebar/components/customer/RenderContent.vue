<template>
  <div>
    <div v-if="!data.custContactId">
      <div
        class="labelContent"
        :style="changeStyle()"
      >
        <!--        <div class="leftImg fl-ac-jc" v-if="!data.custfzId">-->
        <!--          &lt;!&ndash;        {{data.editFlag ? '编辑' : '查看'}}&ndash;&gt;-->
        <!--        </div>-->
        <div class="rightContent">
          <div class="topText">
            <el-select
              v-if="editStatus"
              size="mini"
              style="margin-right: 40px"
              class="edit-border"
              default-first-option
              @change="changeCustFz"
              placeholder="请选择客户/分支机构"
              v-model="treeId"
              :popper-append-to-body="true"
              filterable
            >
              <el-option-group
                v-for="group in custAndFzList"
                :key="group.label"
                :label="group.label"
              >
                <el-option
                  v-for="item in group.options"
                  :key="item.treeId"
                  :label="item.name"
                  :value="item.treeId"
                >
                </el-option>
              </el-option-group>
            </el-select>
            <div
              :title="data.name"
              v-else
              class=""
              @click="clickCust"
              :style="{ cursor: 'pointer' }"
            >
              {{ data.name }}
            </div>
            <div
              :title="data.custContactName"
              style="font-size: 14px"
              class=""
            >
              {{ data.custContactName }}
            </div>
          </div>
          <div
            class="bottomText"
            :title="data.fuzeren"
          >
            万慧达对接人: {{ data.fuzeren }}
          </div>
        </div>

        <div
          class="rightIcon"
          v-if="editStatus && !isFullScreen"
        >
          <span
            class="el-icon-circle-plus"
            v-if="!data.custfzId && !data.isCreate"
            @click="addNode"
          ></span>
          <span
            class="el-icon-success"
            v-if="editStatus && data.isCreate"
            @click="createNode"
          ></span>
          <span
            class="el-icon-remove"
            @click="delNode"
            v-if="!(data.root && !data.treeId)"
          ></span>
          <!--        <span class="el-icon-edit"></span>-->
        </div>
      </div>
    </div>
    <div v-else>
      <div
        class="labelContent"
        :style="changeStyle()"
      >
        <el-popover
          trigger="hover"
          ref="dcPopover"
          placement="right"
          width="450"
        >
          <div class="rightPop">
            <p style="font-size: 14px; margin-bottom: 5px">基本信息</p>
            <el-form
              label-width="80px"
              v-if="!data.lxfs"
            >
              <el-form-item label="性别">{{ data.genderStr }}</el-form-item>
              <el-form-item label="邮箱">{{ data.email }}</el-form-item>
              <el-form-item label="电话">{{ data.tel }}</el-form-item>
              <el-form-item label="地址">{{ data.address }}</el-form-item>
              <el-form-item label="来源人">{{
                data.infoFromStaff
              }}</el-form-item>
              <el-form-item label="来源场合">{{
                data.infoFromPlace
              }}</el-form-item>
            </el-form>
            <el-form
              label-width="80px"
              v-else
            >
              <el-form-item label="职务">{{ data.jobtitle }}</el-form-item>
              <el-form-item label="部门">{{ data.department }}</el-form-item>
              <el-form-item label="联系方式">{{ data.lxfs }}</el-form-item>
            </el-form>
          </div>
          <template #reference>
            <div
              class="rightContent"
              style="width: 280px; height: 100%"
            >
              <div class="topText ellipsis">
                <div
                  :title="data.name"
                  class="ellipsis"
                  :style="{ cursor: 'pointer' }"
                >
                  {{ data.name }}
                </div>
                <div
                  :title="data.custContactName"
                  style="font-size: 14px"
                  class="ellipsis"
                >
                  {{ data.custContactName }}
                </div>
              </div>
              <div
                class="bottomText ellipsis"
                :title="data.fuzeren"
              >
                万慧达对接人: {{ data.fuzeren }}
              </div>
              <div
                class="rightIcon"
                v-if="editStatus && !isFullScreen"
              >
                <span
                  class="el-icon-remove"
                  @click="delContactNode"
                  v-if="!(data.root && !data.treeId)"
                ></span>
              </div>
            </div>
          </template>
        </el-popover>
      </div>
    </div>
  </div>
</template>

<script>
import { queryCustContactTree } from "@/api/customerList";
/* eslint-disable */
export default {
  name: "RenderContent",
  props: {
    hideCustAndCustFzList: {
      type: Array,
      default: () => [],
    },
    editStatus: {
      type: Boolean,
      default: false,
    },
    data: {},
    custId: {},
  },
  watch: {
    treeId: {
      handler(n, o) {
        // const {
        //   ctId,
        //   custContactName,
        //   custId,
        //   custfzId,
        //   name,
        //   parentId,
        //   treeId,
        // } = this.hideCustAndCustFzList.find((item) => item.treeId === n) || {};
        if (this.hideCustAndCustFzList.find((item) => item.treeId === n)) {
          const obj = JSON.parse(
            JSON.stringify(
              this.hideCustAndCustFzList.find((item) => item.treeId === n)
            )
          );
          const targetObj = this.hideCustAndCustFzList.find(
            (item) => item.treeId === n
          );
          targetObj.custId = this.data.custId;
          targetObj.name = this.data.name;
          targetObj.custfzId = this.data.custfzId;
          targetObj.treeId = o;

          this.data.custContactName = obj.custContactName;
          this.data.custId = obj.custId;
          this.data.name = obj.name;
          this.data.custfzId = obj.custfzId;
          this.data.treeId = obj.treeId;
          this.data.fuzeren = obj.fuzeren;
          this.$emit("updateCustList");
        }
      },
    },
    hideCustAndCustFzList: {
      handler(n) {
        n.forEach((obj) => {
          obj.treeId = [obj.custId, obj.custfzId].filter(Boolean) + "";
        });
      },
      deep: true,
    },
    custAndFzList: {
      handler(n) {
        console.log(n);
      },
      deep: true,
    },
  },
  computed: {
    isFullScreen() {
      return this.$store.getters.isFullScreen;
    },
    custAndFzList() {
      let list = [];
      if (this.data.name) {
        list = [this.data, ...this.hideCustAndCustFzList];
      } else {
        list = this.hideCustAndCustFzList;
      }
      const custList = [];
      const fzList = [];
      list.forEach((item) => {
        if (item.custfzId) {
          fzList.push(item);
        } else {
          custList.push(item);
        }
      });
      if (this.data.isCreate) {
        return [
          {
            label: "客户",
            options: this.$commonUtils.unique(custList, "treeId"),
            // options: custList
          },
          {
            label: "分支机构",
            options: this.$commonUtils.unique(
              fzList.filter((item) => item.custId === this.data.pid),
              "treeId"
            ),
            // options: fzList
          },
        ];
      }
      if (this.data.custfzId) {
        return [
          {
            label: "分支机构",
            options: this.$commonUtils.unique(
              fzList.filter((item) => item.custId === this.data.custId),
              "treeId"
            ),
            // options: fzList
          },
        ];
      } else {
        return [
          {
            label: "客户",
            options: this.$commonUtils.unique(custList, "treeId"),
            // options: custList
          },
          // {
          //   label: '分支机构',
          //   options: this.$commonUtils.unique(fzList.filter(item => item.custId === (this.data.custId || this.data.pid) ), 'treeId')
          //   // options: fzList
          // }
        ];
      }
    },
  },
  data() {
    return {
      treeId: "",
      allCustAndCustFzList: [],
    };
  },
  created() {
    this.$set(this, "treeId", this.data.treeId);
  },
  methods: {
    clickCust() {
      const key = this.data.custfzId ? "custfzId" : "custId";
      this.data.custId &&
        queryCustContactTree({ [key]: this.data[key] }).then((res) => {
          if (res.data[0].name || res.data[0].name === "") {
            this.$emit("changeTree", res.data[0] || {});
          } else {
            this.$message.warning("该客户下暂无对方联系人");
          }
        });
    },
    changeCustFz(value) {
      if (this.data.isCreate) return;
      if (this.data.treeId) {
        const list = value.split(",");
        this.data.custId = list[0] && +list[0];
        this.data.custfzId = list[1] && +list[1];
      }

      this.$emit("updateNode", this.data);
      // this.$set(this, 'data', this.hideCustAndCustFzList.find(item => item.treeId === n))
    },
    createNode() {
      if (!this.data.treeId) {
        this.$message.error("请选择客户/机构!");
        return;
      }
      // this.data.isCreate = undefined
      const list = this.data.treeId.split(",");
      this.data.custId = list[0] && +list[0];
      this.data.custfzId = list[1] && +list[1];
      if (this.data.custfzId) {
        this.data.custId = undefined;
      }
      if (this.data.custId) {
        this.data.custfzId = undefined;
      }
      this.$emit("nodeCreate", this.data);
    },
    delContactNode() {
      this.$emit("delContactNode", this.data);
    },
    delNode() {
      this.$emit("nodeDel", this.data);
    },
    addNode() {
      this.$emit("nodeAdd", this.data);
    },
    changeStyle() {
      if (this.data.custfzId) {
        return { backgroundColor: "#F9BB4C" };
      }
      if (this.data.root) {
        return { backgroundColor: "#52A0F5" };
      }
      //&& !this.data.custfzId
      if (this.data.custId === this.custId && !this.data.custfzId) {
        return { backgroundColor: "#8DC73F" };
      }
      return { backgroundColor: "skyblue" };
    },
  },
};
</script>

<style lang="scss" scoped>
.labelContent {
  position: relative;
  width: 300px;
  height: 110px;
  padding: 10px;
  border-radius: 5px;
  /*background-color: #52A0F5;*/
  display: flex;
  text-align: left;
  color: #fff;

  .rightIcon {
    display: flex;
    flex-direction: row;
    position: absolute;
    top: 0;
    right: 0;
    color: #333;

    span {
      cursor: pointer;
      margin-left: 5px;
      z-index: 10;
    }

    .el-icon-circle-plus {
    }

    .el-icon-remove {
      color: #f4313d;
    }
  }

  .leftImg {
    width: 70px;
    height: 90px;
    background-color: #fff;
    border: 1px solid #333;
    color: #333;
    flex-shrink: 0;
  }

  .rightContent {
    margin-left: 10px;
    overflow: hidden;

    .topText {
      font-size: 18px;
    }

    .bottomText {
      font-size: 12px;
    }
  }
}

.rightPop {
  .el-form {
    &:last-child {
      border-bottom: 1px solid #d7d7d7;
    }

    .el-form-item {
      display: flex;
      margin-bottom: 0;
      border: 1px solid #d7d7d7;
      border-bottom: none;

      :deep(.el-form-item__label) {
        flex-shrink: 0;
        background-color: #f2f2f2;
        line-height: 30px;
        text-align: right;
      }

      :deep(.el-form-item__content) {
        flex: 1;
        margin-left: 0 !important;
        min-height: 30px;
        line-height: 30px;
        padding-left: 10px;
      }
    }
  }
}
</style>
