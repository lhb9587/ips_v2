<script>
import {
  queryCustAndFenzhiInfo,
  updateCustomerJiagouById,
  queryCustTree,
  addCustomerJiagou,
  stopCustomerContact,
  delCustomerJiagou,
} from "@/api/customerList";
import { extractTree } from "@/utils";
import RenderContent from "./RenderContent";
export default {
  props: {
    custId: {
      type: Number,
      default: 305527,
    },
  },
  components: {},
  data() {
    return {
      zmProps: {
        id: "treeId",
        pid: "parentId",
        label: "name",
      },
      allCustAndFzList: [],
      hideCustAndCustFzList: [],
      style: {
        background: "#fff",
        color: "#5e6d82",
      },
      toolBar: {
        scale: false,
        restore: false,
        expand: false,
        zoom: false,
        fullscreen: false,
      },
      editStatus: false,
      treeData:{}
    };
  },
  computed: {},
  methods: {
    extractTree,
    updateCustList() {
      const existCustAndFzList = this.extractTree([this.treeData], "children", [
        "custId",
        "name",
        "custfzId",
        "parentId",
        "ctId",
      ]).filter((item) => item.custId);
      this.hideCustAndCustFzList = this.allCustAndFzList
        .filter((item) => {
          if (item.custfzId) {
            return !existCustAndFzList.find(
              (i) => i.custfzId === item.custfzId
            );
          } else {
            return !existCustAndFzList.find(
              (i) => i.custId === item.custId && !i.custfzId
            );
          }
        })
        .filter((item) => item.name);
    },
    queryCustAndFenzhiInfo() {
      queryCustAndFenzhiInfo({ custId: 305527 }).then((res) => {
        this.allCustAndFzList = res.data;
        this.updateCustList();
      });
    },
    beforeDragEnd(node, targetNode) {
      return new Promise((resolve, reject) => {
        if (!targetNode) reject();
        if (node.id === targetNode.id) {
          reject();
        } else {
          resolve();
        }
      });
    },
    renderContent(e, node) {
      return (
        <RenderContent
          key={node.treeId || node.vid}
          v-on:updateNode={this.updateNode}
          v-on:updateCustList={this.updateCustList}
          v-on:changeTree={this.changeTree}
          hideCustAndCustFzList={this.hideCustAndCustFzList}
          editStatus={this.editStatus}
          custId={this.custId}
          data={node}
        
        />
      );
    },
    updateNode(node) {
      // const parent = this.findParent(this.treeData, node.parentId || node.pid)
      updateCustomerJiagouById({
        ctId: node.ctId,
        parentId: node.parentId,
        custId: node.custId,
        custfzId: node.custfzId,
      }).then((res) => {
        if (res.data.custId && !node.custfzId) {
          queryCustTree({ custId: res.data.custId, childTree: 1 }).then(
            (res) => {
              this.$set(node, "children", res.data.children);
              this.updateCustList();
            }
          );
        } else {
          this.updateCustList();
        }
        this.$message.success("修改成功!");
      });
    },
    filterNodeMethod(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    onNodeDblclick(e, data) {
      this.$set(data, "editFlag", true);
    },
    queryCustTree() {
      queryCustTree({ custId: this.custId }).then((res) => {
        const data = res.data;
        if (data && data.custId) {
          this.handleTreeId(data);
          this.treeData = JSON.parse(JSON.stringify(data));
          this.custData = JSON.parse(JSON.stringify(data));
        } else {
          this.treeData = {
            id: "",
            vid: new Date().getTime() + "",
            pid: 0,
            isCreate: true,
          };
          this.custData = {
            id: "",
            vid: new Date().getTime() + "",
            pid: 0,
            isCreate: true,
          };
        }
        this.queryCustAndFenzhiInfo();
      });
    },
    handleTreeId(obj) {
      obj.treeId = [obj.custId, obj.custfzId].filter(Boolean) + "";
      if (obj.children && obj.children.length) {
        obj.children.forEach((item) => {
          this.handleTreeId(item);
        });
      }
    },
    changeTree(treeData) {
      this.peopleView = true;
      this.peopleData = treeData;
      this.treeData = JSON.parse(JSON.stringify(treeData));
      this.props = {
        id: "custContactId",
        pid: "parentId",
        label: "name",
      };
    },
    nodeCreate(node) {
      let pid, custId, parent;
      if (node.root && node.pid === 0) {
        pid = node.custId;
        custId = this.custId;
        parent = 0;
      } else {
        parent = undefined;
        pid = node.pid;
        custId = node.custId;
      }
      if (pid === custId) {
        this.$message.error("父客户和子客户不能为同一客户！");
        return;
      }
      addCustomerJiagou({
        parent,
        parentId: pid,
        custId: custId,
        custfzId: node.custfzId,
      }).then((res) => {
        node.isCreate = undefined;
        this.$message.success("添加成功!");
        this.$set(node, "ctId", res.data.ctId);
        this.$set(node, "custId", res.data.custId);
        this.$set(node, "custfzId", res.data.custfzId);
        this.$set(node, "parentId", res.data.parentId);
        if (res.data.custId && !node.custfzId) {
          queryCustTree({ custId: pid, childTree: 1 }).then((res) => {
            this.$set(node, "children", res.data.children);
            this.updateCustList();
          });
        } else {
          this.updateCustList();
        }
      });
    },
    nodeAdd(node) {
      node.expand = true;
      !node.children && this.$set(node, "children", []);
      node.children.push({
        id: "",
        vid: new Date().getTime() + "",
        pid: node.custId,
        isCreate: true,
      }); // vid: virtual id 便于后续节点操作
    },
    delContactNode(node) {
      this.$confirm("此操作将停用该联系人, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        stopCustomerContact({ custContactId: node.custContactId }).then(() => {
          const parent = this.findParentContact(
            this.treeData,
            node.parentId || node.pid
          );
          if (parent) {
            parent.children.splice(
              parent.children.findIndex(
                (item) => item.custContactId === node.custContactId
              ),
              1
            );
            this.$message.success("停用成功!");
          }
        });
      });
    },
    findParentContact(data, pid) {
      let parent;
      const find = (data, pid) => {
        if (data.custContactId === pid) {
          parent = data;
        } else if (data.children) {
          data.children.forEach((item) => {
            find(item, pid);
          });
        }
      };
      find(data, pid);
      return parent;
    },
    nodeDel(node) {
      if (!node.isCreate) {
        let notice = "";
        if (node.custfzId) {
          notice = "此操作将删除该分支机构, 是否继续?";
        } else {
          notice = "此操作将删除该客户以及子客户/分支机构, 是否继续?";
        }
        this.$confirm(notice, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }).then(() => {
          const parent = this.findParent(
            this.treeData,
            node.parentId || node.pid
          );
          delCustomerJiagou({ ctId: node.ctId }).then(() => {
            parent &&
              parent.children &&
              parent.children.splice(
                parent.children.findIndex(
                  (item) => item.treeId === node.treeId
                ),
                1
              );
            this.$message.success("删除成功!");
            this.updateCustList();
          });
        });
      } else {
        const parent = this.findParent(
          this.treeData,
          node.parentId || node.pid
        );
        if (parent) {
          parent.children.splice(
            parent.children.findIndex((item) => item.vid === node.vid),
            1
          );
          this.updateCustList();
        }
      }
    },
    findParent(data, pid) {
      let parent;
      const find = (data, pid) => {
        if (data.custId === pid) {
          parent = data;
        } else if (data.children) {
          data.children.forEach((item) => {
            if (!item.custfzId) {
              find(item, pid);
            }
          });
        }
      };
      find(data, pid);
      return parent;
    },
  },
  created() {
    this.queryCustTree();
  },
};
</script>
<template>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-4">分支机构</h4>
      <vue3-tree-org
        ref="tree"
        :props="zmProps"
        :data="treeData"
        :disabled="false"
        :horizontal="false"
        :collapsable="true"
        :label-style="style"
        :node-draggable="false"
        :scalable="false"
        :default-expand-level="1"
        :define-menus="[]"
        :only-one-node="true"
        :clone-node-drag="false"
        :before-drag-end="beforeDragEnd"
        :toolBar="toolBar"
        :filterNodeMethod="filterNodeMethod"
        @on-node-dblclick="onNodeDblclick"
      >
      </vue3-tree-org>
    </div>
  </div>
</template>

