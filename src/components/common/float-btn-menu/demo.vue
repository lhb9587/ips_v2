<template>
  <!-- 悬浮按钮菜单 -->
  <FloatBtnMenu
    :menu-items="menuItem"
    :main-btn-icon="mainBtnIcon"
    :radius="80"
    :sub-btn-size="48"
    :main-btn-size="56"
    @toggle="handleToggle"
    @item-click="handleItemClick"
    @item-hover="handleItemHover"
  />
  <el-dialog
    v-model="showSetting"
    title="浮动菜单配置"
    width="480px"
    :close-on-click-modal="false"
    append-to-body
    :cneter="true"
    @close="closeSetting"
  >
    <div class="settings-wrapper">
      <div>
        <div class="section-title with-count">
          <span>功能项</span>
          <span class="enabled-count">已启用 {{ enabledCount }} 项</span>
        </div>
        <div class="features-panel">
          <draggable
            v-model="featureItems"
            handle=".drag-handle"
            item-key="id"
            ghost-class="drag-ghost"
            draggable=".draggable-row"
            :move="onDragMove"
            @end="onDragEnd"
          >
            <template #item="{ element }">
              <div
                class="feature-row"
                :class="[
                  { active: element.enabled },
                  element.enabled ? 'draggable-row' : '',
                ]"
              >
                <div class="left">
                  <div class="drag-handle-container">
                    <div
                      class="drag-handle-box"
                      v-if="element.enabled"
                    >
                      <i class="mdi mdi-drag-vertical drag-handle"></i>
                    </div>
                  </div>
                  <i
                    :class="`bx ${element.icon}`"
                    class="feat-icon"
                  ></i>
                  <span class="feat-text">{{ $t(element.label) }}</span>
                </div>
                <div class="right">
                  <el-switch
                    v-model="element.enabled"
                    size="small"
                    @change="onEnabledChange(element)"
                    :disabled="!element.enabled && enabledCount >= 8"
                  />
                </div>
              </div>
            </template>
          </draggable>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dlg-footer">
        <el-button
          @click="resetDefaults"
          plain
        >
          <i class="mdi mdi-restore"></i>
          重置默认
        </el-button>
        <el-button
          type="primary"
          @click="saveSettings"
          >完成</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>

<script>
import FloatBtnMenu from "@/components/common/float-btn-menu/index.vue";
import Draggable from "vuedraggable";
import { menuItems } from "@/components/menu";
import {
  queryMenuFabConfigByUserId,
  saveMenuFabConfig,
} from "@/api/systemList";
import { layoutComputed } from "@/state/helpers";

export default {
  name: "FloatMenuDemo",
  components: {
    FloatBtnMenu,
    Draggable,
  },
  data() {
    return {
      mainBtnIcon: "bx bx-plus",
      logs: [],
      layoutMode: "auto",
      menuItems: menuItems,
      defaultItemIds: [1, 3, 86],
      checkedItemIds: [],
      featureItems: [],
      menuItem: [],
      showSetting: false,
    };
  },
  computed: {
    enabledCount() {
      return this.featureItems.filter((i) => i.enabled).length;
    },
    permissions() {
      const list = this.$store.state?.user?.permissions || [];
      if (list.length > 0) {
        return this.$store.state.user.permissions;
      } else {
        return [];
      }
    },
    authMenuItems() {
      // const idlist = [2,3,4,5,22,84,85,213,299]
      const menus = this.filterMenusByPermissions(menuItems, this.permissions);
      return menus;
    },
    ...layoutComputed,
  },
  methods: {
    closeSetting() {
      // this.initFeatureitems()
    },
    filterMenusByPermissions(menus, idList) {
      if (idList.length === 0) {
        return [];
      }
      const menuList = menus.reduce((filteredMenus, menu) => {
        // 检查当前菜单是否有permissions数组
        if (
          !menu.permissions ||
          menu.permissions.some((perm) => idList?.includes(perm))
        ) {
          // 如果当前菜单没有permissions属性，或者当前菜单有权限
          // 可能还有子菜单，递归处理子菜单
          if (menu.subItems) {
            menu.subItems = this.filterMenusByPermissions(
              menu.subItems,
              idList,
            );
            // 如果子菜单被过滤后为空，可以选择移除subItems属性（可选）
            if (menu.subItems.length === 0) {
              delete menu.subItems; // 可选步骤，取决于是否需要保留空数组或删除该属性
            }
          }
          // 添加当前菜单到结果数组
          filteredMenus.push(menu);
        }
        // 注意：这里没有else if来处理只有子菜单有权限的情况，
        // 因为如果当前菜单没有permissions或用户有权限，我们总是添加当前菜单（可能包含过滤后的子菜单）
        // 不修改原始数组，只返回过滤后的新数组
        return filteredMenus;
      }, []);

      return menuList;
    },
    handleToggle(isExpanded) {
      this.addLog(`菜单${isExpanded ? "展开" : "收起"}`);
    },

    handleItemClick(item) {
      if (item.id === "settings") {
        this.showSetting = true;
        return;
      }
      if (item.children && item.children.length > 0) {
        return;
      } else {
        if (item.link) {
          this.$router.push({ path: item.link });
        }
      }
    },

    handleItemHover(item) {
      // 可以在这里处理悬浮事件，比如显示更多信息
      console.log("悬浮在:", item.label || item.id);
    },

    addLog(message) {
      const timestamp = new Date().toLocaleTimeString();
      this.logs.unshift(`[${timestamp}] ${message}`);

      // 限制日志数量
      if (this.logs.length > 20) {
        this.logs = this.logs.slice(0, 20);
      }
    },
    // 拖拽守卫：
    // 1) enabled === false 的项不可拖动（通过 draggable 选择器已限制）
    // 2) enabled === true 的项不可被拖拽到任何 disabled 区域之下
    onDragMove(e) {
      const dragged = e.draggedContext && e.draggedContext.element;
      if (!dragged || !dragged.enabled) return false;

      // 计算未来索引
      const futureIndex =
        e.draggedContext.futureIndex != null
          ? e.draggedContext.futureIndex
          : e.relatedContext && e.relatedContext.index != null
          ? e.relatedContext.index
          : e.draggedContext.index;

      // 找到第一个 disabled 的分界线
      const firstDisabledIdx = this.featureItems.findIndex((i) => !i.enabled);
      const boundary =
        firstDisabledIdx === -1 ? this.featureItems.length : firstDisabledIdx;

      // 不能越过分界线
      return futureIndex < boundary;
    },
    onDragEnd() {
      // 保守校正：确保启用项始终在前，禁用项在后，保持各自相对顺序
      const enabled = this.featureItems.filter((i) => i.enabled);
      const disabled = this.featureItems.filter((i) => !i.enabled);
      this.featureItems = [...enabled, ...disabled];
    },
    // 切换开关时，维持“上面全是启用，下面全是禁用”的不变式
    onEnabledChange(item) {
      const idx = this.featureItems.findIndex((i) => i.id === item.id);
      if (idx === -1) return;

      // 如果尝试启用新项，但已启用项已达到8个，则阻止操作
      if (item.enabled && this.enabledCount > 8) {
        // 恢复开关状态
        this.$nextTick(() => {
          item.enabled = false;
        });
        this.$message.warning("最多只能启用8个功能项");
        return;
      }
      if (item.enabled) {
        // 移到启用区的末尾（分界线之前）
        // 先移除，再基于“剩余数组”计算分界，避免自身参与导致偏移
        const [moved] = this.featureItems.splice(idx, 1);
        const boundaryAfterRemoval = this.featureItems.findIndex(
          (i) => !i.enabled,
        );
        const to =
          boundaryAfterRemoval === -1
            ? this.featureItems.length
            : boundaryAfterRemoval;
        this.featureItems.splice(
          Math.min(to, this.featureItems.length),
          0,
          moved,
        );
      } else {
        // 取消启用：放到禁用区的顶部（第一个未启用项的位置）
        const [moved] = this.featureItems.splice(idx, 1);
        const firstDisabledIdx = this.featureItems.findIndex((i) => !i.enabled);
        const insertAt =
          firstDisabledIdx === -1 ? this.featureItems.length : firstDisabledIdx;
        this.featureItems.splice(insertAt, 0, moved);
      }
    },
    resetDefaults() {
      // 恢复到初始顺序与开关
      const list = this.authMenuItems.map((item) => {
        return {
          id: item.id,
          label: item.label,
          icon: item.icon,
          enabled: Boolean(this.defaultItemIds.includes(item.id)),
        };
      });
      this.featureItems = list.sort((a, b) => {
        if (a.enabled !== b.enabled) {
          return a.enabled ? -1 : 1; // true排前面时返回负值，false排后面时返回正值
        }
        return 0;
      });
    },
    async fetchMenuFabConfigByUserId() {
      if (this.menuBarCollapseMode === "float" && this.leftSidebarCondensed) {
        await queryMenuFabConfigByUserId().then((res) => {
          this.checkedItemIds = res.data.menuIdList || [];
        });
      }
    },
    initFeatureitems() {
      const list = this.authMenuItems.map((item) => {
        return {
          id: item.id,
          label: item.label,
          icon: item.icon,
          enabled: Boolean(this.checkedItemIds.includes(item.id)),
        };
      });
      this.featureItems = list.sort((a, b) => {
        // 获取元素在 checkedItemIds 中的索引位置
        const indexA = this.checkedItemIds.indexOf(a.id);
        const indexB = this.checkedItemIds.indexOf(b.id);

        // 处理不在 checkedItemIds 中的元素（排到最后）
        if (indexA === -1 && indexB === -1) return 0; // 两者都不在数组中，保持原顺序
        if (indexA === -1) return 1; // a 不在数组中，排在后面
        if (indexB === -1) return -1; // b 不在数组中，a 排前面

        // 两者都在数组中时，按原顺序排序
        return indexA - indexB;
      });
      this.fetchMenuItems();
    },
    fetchMenuItems() {
      // 将设置同步到浮动菜单或存储，可按需扩展
      const idList =
        this.featureItems.filter((item) => item.enabled).map((msg) => msg.id) ||
        [];
      let filterList = [];
      if (idList.length > 0) {
        filterList = this.authMenuItems
          .filter((item) => idList.includes(item.id))
          .map((msg) => {
            return {
              id: msg.id,
              icon: msg.icon,
              label: msg.label,
              link: msg.link,
              // 递归转换 subItems -> children
              children: this.mapMenuChildren(msg.subItems),
            };
          });
      }
      filterList.sort((a, b) => {
        // 获取元素在 idList 中的索引位置
        const indexA = idList.indexOf(a.id);
        const indexB = idList.indexOf(b.id);

        // 处理不在 idList 中的元素（排到最后）
        if (indexA === -1 && indexB === -1) return 0; // 两者都不在数组中，保持原顺序
        if (indexA === -1) return 1; // a 不在数组中，排在后面
        if (indexB === -1) return -1; // b 不在数组中，a 排前面

        // 两者都在数组中时，按原顺序排序
        return indexA - indexB;
      });
      filterList.push({
        id: "settings",
        icon: "bx-cog",
        label: "设置",
      });
      this.menuItem = filterList;
    },
    saveSettings() {
      this.fetchMenuItems();
      const idList =
        this.featureItems.filter((item) => item.enabled).map((msg) => msg.id) ||
        [];
      saveMenuFabConfig({ menuIdList: idList }).then((res) => {
        if (res.success) {
          res.message && this.$message.success(res.message);
          this.showSetting = false;
        }
      });
    },
    // 递归处理子菜单，将 subItems 统一映射为 children 以供 FloatBtnMenu 使用
    mapMenuChildren(items) {
      if (!items || items.length === 0) return [];
      return items.map((item) => ({
        id: item.id,
        icon: item.icon,
        label: item.label,
        link: item.link,
        children: this.mapMenuChildren(item.subItems),
      }));
    },
  },
  async beforeMount() {
    await this.fetchMenuFabConfigByUserId();
    this.initFeatureitems();
  },
};
</script>

<style lang="scss" scoped>
.settings-wrapper {
  padding: 4px 4px 0 4px;
}
.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
  &.with-count {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
.enabled-count {
  color: #909399;
  font-size: 12px;
}

.features-panel {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px 0;
  max-height: 280px;
  overflow: auto;
}
.feature-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  margin: 4px 8px;
  border-radius: 8px;
  background: #f8fafc;
  &.active {
    background: #eef5ff;
  }
}
.feature-row .left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.drag-handle-container {
  width: 20px;
  height: 20px;
  .drag-handle-box {
    width: 100%;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 3px;
    &:hover {
      background: #dcdfe6;
    }
  }
  .drag-handle {
    cursor: grab;
    color: #000;
    font-size: 20px;
  }
}
.feat-icon {
  color: #2c3e50;
  font-size: 16px;
  width: 18px;
  text-align: center;
}
.feat-text {
  font-size: 14px;
  color: #2c3e50;
}
.drag-ghost {
  opacity: 0.6;
}

.dlg-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
