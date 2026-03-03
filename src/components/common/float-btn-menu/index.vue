<template>
  <div
    class="float-btn-menu"
    ref="menuContainer"
    :style="rootStyle"
  >
    <!-- 主按钮 -->
    <div
      class="main-btn"
      :class="{ active: isExpanded }"
      :style="mainBtnStyle"
      @click="toggleMenu"
      @mouseenter="handleMainBtnHover"
      @mouseleave="handleMainBtnLeave"
      @mousedown="onDragStart"
      @touchstart.passive="onTouchStart"
    >
      <i :class="mainBtnIcon"></i>
    </div>

    <!-- 子按钮环形布局 -->
    <div
      class="sub-buttons-container"
      :class="{ expanded: isExpanded }"
      v-if="menuItems.length > 0"
    >
      <div
        v-for="(item, index) in menuItems"
        :key="item.id || index"
        class="sub-btn"
        :class="{
          hovered: hoveredParentId === item.id,
          'active-hover': hoveredParentId === item.id,
        }"
        :style="getSubBtnStyle(index)"
        @click="handleSubBtnClick(item, $event)"
        @mouseenter="handleSubBtnHover(item)"
        @mouseleave="handleSubBtnLeave(item)"
      >
        <i :class="`bx ${item.icon}`"></i>

        <!-- 子按钮的提示文字 -->
        <div
          class="tooltip"
          v-if="
            item.label &&
            ((hoveredParentId === item.id &&
              item.children &&
              item.children.length > 0 &&
              !hoveredItemId) ||
              hoveredItemId === item.id)
          "
        >
          {{ $t(item.label) }}
        </div>

        <!-- 子按钮的子菜单（二级扇形，围绕当前子按钮） -->
        <div
          class="sub-sub-menu"
          v-if="
            item.children &&
            item.children.length > 0 &&
            hoveredParentId === item.id
          "
          @mouseenter="onSubMenuEnter(item)"
          @mouseleave="onSubMenuLeave"
        >
          <div
            v-for="(child, childIndex) in item.children"
            :key="child.id || childIndex"
            class="sub-sub-btn"
            :class="{
              hovered: hoveredItemId === child.id,
              'active-hover':
                hoveredItemId === child.id || isGrandChildHovered(child),
            }"
            :style="getChildBtnStyle(childIndex, item.children.length, index)"
            @click="handleSubBtnClick(child, $event)"
            @mouseenter="onChildEnter(child)"
            @mouseleave="onChildLeave"
          >
            <i :class="`${child.icon}`"></i>

            <!-- 二级按钮的提示文字 (当尚未悬停三级子项时显示) -->
            <div
              class="sub-sub-tooltip"
              v-if="
                child.label && hoveredItemId === child.id && !hoveredChildId
              "
            >
              {{ $t(child.label) }}
            </div>

            <!-- 三级子菜单（扇形，围绕当前二级按钮） -->
            <div
              class="sub-sub-sub-menu"
              v-if="
                child.children &&
                child.children.length > 0 &&
                hoveredItemId === child.id
              "
              @mouseenter="onGrandChildMenuEnter(child)"
              @mouseleave="onGrandChildMenuLeave"
            >
              <div
                v-for="(grandChild, grandChildIndex) in child.children"
                :key="grandChild.id || grandChildIndex"
                class="sub-sub-sub-btn"
                :style="
                  getGrandChildBtnStyle(
                    grandChildIndex,
                    child.children.length,
                    childIndex,
                    item.children.length,
                    index,
                  )
                "
                @click="handleSubBtnClick(grandChild, $event)"
                @mouseenter="onGrandChildEnter(grandChild)"
                @mouseleave="onGrandChildLeave"
              >
                <i :class="`${grandChild.icon}`"></i>
                <div
                  class="sub-sub-sub-tooltip"
                  v-if="grandChild.label && hoveredChildId === grandChild.id"
                >
                  {{ $t(grandChild.label) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 遮罩层，点击关闭菜单 -->
    <!-- <div 
      class="overlay" 
      v-if="isExpanded" 
      @click="closeMenu"
    ></div> -->
  </div>
</template>

<script>
export default {
  name: "FloatBtnMenu",
  props: {
    menuItems: { type: Array, default: () => [] },
    mainBtnIcon: { type: String, default: "bx bx-x" },
    // 一级子按钮半径（围绕主按钮）
    radius: { type: Number, default: 80 },
    subBtnSize: { type: Number, default: 48 },
    mainBtnSize: { type: Number, default: 56 },
    // 二级子按钮半径（围绕父子按钮）
    childRadius: { type: Number, default: 80 },
    // 二级扇形分布模式：auto(跟随父按钮方向扇形) | fixed(使用固定起止角度)
    childSectorMode: { type: String, default: "auto" },
    // auto 模式下的扇形张角（度），围绕父按钮方向对称展开，例如 120 表示父方向 ±60°
    childSectorSpan: { type: Number, default: 120 },
    // fixed 模式下的固定起止角度（度）。0 在右侧，-90 在上方
    childStartAngle: { type: Number, default: -90 },
    childEndAngle: { type: Number, default: 270 },
    // 子菜单按钮之间的最小角度间距（度），防止重叠
    childMinAngleStep: { type: Number, default: 20 },
    // 当子菜单项较多时，半径扩展系数。例如：1.5 表示最多扩展到基础半径的1.5倍
    childRadiusScaleFactor: { type: Number, default: 1.5 },
    animationDuration: { type: Number, default: 300 },
  },
  data() {
    return {
      isExpanded: false,
      hoveredItemId: null, // Level 2
      hoveredParentId: null, // Level 1
      hoveredChildId: null, // Level 3
      hoverTimeout: null,
      dragging: false,
      dragStartX: 0,
      dragStartY: 0,
      startPosX: 0,
      startPosY: 0,
      posX: null,
      posY: null,
    };
  },
  computed: {
    rootStyle() {
      const size = `${this.mainBtnSize}px`;
      const left = this.posX != null ? `${this.posX}px` : "auto";
      const top = this.posY != null ? `${this.posY}px` : "auto";
      return { width: size, height: size, left, top };
    },
    mainBtnStyle() {
      return {
        width: `${this.mainBtnSize}px`,
        height: `${this.mainBtnSize}px`,
      };
    },
    subBtnStyleBase() {
      return { width: `${this.subBtnSize}px`, height: `${this.subBtnSize}px` };
    },
  },
  mounted() {
    this.$nextTick(() => {
      const vw = window.innerWidth,
        vh = window.innerHeight;
      const initialLeft = 200; // 初始左侧留白 300px
      const initialBottom = 200; // 初始底部留白 20px
      const clampMargin = 8; // 通用夹紧边距
      // 尝试从 localStorage 读取上次位置
      try {
        const saved = localStorage.getItem("floatBtnMenuPos");
        if (saved) {
          const { x, y } = JSON.parse(saved);
          const clampedX = Math.min(
            Math.max(x ?? initialLeft, clampMargin),
            vw - this.mainBtnSize - clampMargin,
          );
          const clampedY = Math.min(
            Math.max(y ?? vh - this.mainBtnSize - initialBottom, clampMargin),
            vh - this.mainBtnSize - clampMargin,
          );
          this.posX = clampedX;
          this.posY = clampedY;
        } else {
          // 默认：左下角（左侧 300px，底部 20px）
          this.posX = initialLeft;
          this.posY = vh - this.mainBtnSize - initialBottom;
        }
      } catch (e) {
        // 读取失败时使用默认左下角
        this.posX = initialLeft;
        this.posY = vh - this.mainBtnSize - initialBottom;
      }
    });
    document.addEventListener("mousemove", this.onDragMove);
    document.addEventListener("mouseup", this.onDragEnd);
    document.addEventListener("touchmove", this.onTouchMove, {
      passive: false,
    });
    document.addEventListener("touchend", this.onTouchEnd);
  },
  beforeUnmount() {
    if (this.hoverTimeout) clearTimeout(this.hoverTimeout);
    document.removeEventListener("mousemove", this.onDragMove);
    document.removeEventListener("mouseup", this.onDragEnd);
    document.removeEventListener("touchmove", this.onTouchMove);
    document.removeEventListener("touchend", this.onTouchEnd);
  },
  methods: {
    toggleMenu() {
      this.isExpanded = !this.isExpanded;
      if (!this.isExpanded) {
        this.hoveredParentId = null;
        this.hoveredItemId = null;
      }
      this.$emit("toggle", this.isExpanded);
    },
    closeMenu() {
      this.isExpanded = false;
      this.hoveredParentId = null;
      this.hoveredItemId = null;
      this.hoveredChildId = null;
      this.$emit("toggle", false);
    },
    handleSubBtnHover(item) {
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout);
        this.hoverTimeout = null;
      }
      if (item && item.children && item.children.length > 0) {
        this.hoveredParentId = item.id;
        this.hoveredItemId = null;
      } else {
        this.hoveredParentId = null;
        this.hoveredItemId = item?.id || null;
      }
      this.$emit("item-hover", item);
    },
    handleSubBtnLeave() {
      if (this.hoverTimeout) clearTimeout(this.hoverTimeout);
      this.hoverTimeout = setTimeout(() => {
        this.hoveredParentId = null;
        this.hoveredItemId = null;
      }, 500);
    },
    onSubMenuEnter(item) {
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout);
        this.hoverTimeout = null;
      }
      this.hoveredParentId = item.id;
    },
    onSubMenuLeave() {
      this.handleSubBtnLeave();
    },
    onChildEnter(child) {
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout);
        this.hoverTimeout = null;
      }
      this.hoveredItemId = child.id;
    },
    onChildLeave() {
      this.handleSubBtnLeave();
    },
    onGrandChildMenuEnter(child) {
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout);
        this.hoverTimeout = null;
      }
      this.hoveredItemId = child.id;
    },
    onGrandChildMenuLeave() {
      this.handleSubBtnLeave();
    },
    onGrandChildEnter(grandChild) {
      this.hoveredChildId = grandChild.id;
    },
    onGrandChildLeave() {
      this.hoveredChildId = null;
    },
    isGrandChildHovered(child) {
      if (!child.children || !this.hoveredChildId) return false;
      return child.children.some((gc) => gc.id === this.hoveredChildId);
    },
    handleSubBtnClick(item, event) {
      event.stopPropagation();
      if (item.children && item.children.length > 0) return;
      this.$emit("item-click", item);
      this.closeMenu();
    },

    // 一级：围绕主按钮
    getSubBtnStyle(index) {
      const angle = (360 / this.menuItems.length) * index - 90;
      const r = (angle * Math.PI) / 180;
      const x = Math.cos(r) * this.radius;
      const y = Math.sin(r) * this.radius;
      return { ...this.subBtnStyleBase, "--tx": `${x}px`, "--ty": `${y}px` };
    },

    // 二级：扇形分布（避免与一级重叠）
    getChildBtnStyle(childIndex, total, parentIndex) {
      // 父按钮的方向角（度）：与一级布局一致
      const parentAngle = (360 / this.menuItems.length) * parentIndex - 90;

      // 最小角度间距（度），确保按钮不会重叠
      const minAngleStep = this.childMinAngleStep;

      let start, end, actualSpan;

      if (this.childSectorMode === "fixed") {
        start = this.childStartAngle;
        const rawEnd = this.childEndAngle;
        end = rawEnd > start ? rawEnd : start + 360;
        actualSpan = end - start;

        // 计算需要的角度范围
        const requiredSpan = total > 1 ? minAngleStep * (total - 1) : 0;

        // 如果固定角度范围不够，动态扩展
        if (actualSpan < requiredSpan) {
          // 以父按钮方向为中心，扩展角度范围
          const centerAngle = (start + end) / 2;
          actualSpan = Math.min(requiredSpan, 360); // 最多360度
          start = centerAngle - actualSpan / 2;
          end = centerAngle + actualSpan / 2;
        }
      } else {
        // auto 模式：以父按钮方向为中心
        let baseSpan = Math.max(1, this.childSectorSpan);

        // 计算需要的角度范围
        const requiredSpan = total > 1 ? minAngleStep * (total - 1) : 0;

        // 使用较大的角度范围，确保不重叠
        actualSpan = Math.max(baseSpan, requiredSpan);
        // 限制最大角度不超过360度
        actualSpan = Math.min(actualSpan, 360);

        start = parentAngle - actualSpan / 2;
        end = parentAngle + actualSpan / 2;
      }

      // 计算按钮间距：确保最小间距，但在空间足够时均匀分布
      const step = total > 1 ? actualSpan / (total - 1) : 0;
      // 均匀分布在扇形区域内，第一个和最后一个按钮距离边界有一定距离
      // 这样可以避免按钮过于靠近边界，同时最大化利用空间
      const angle = total > 1 ? start + step * childIndex : start;

      // 根据子菜单项数量和角度扩展情况动态计算半径
      // 当按钮数量较多或角度扩展较大时，增加半径以提供更多空间
      let dynamicRadius = this.childRadius;

      if (total > 3) {
        // 计算基础角度范围（用于计算扩展比例）
        let baseSpan;
        if (this.childSectorMode === "fixed") {
          const rawStart = this.childStartAngle;
          const rawEnd = this.childEndAngle;
          baseSpan =
            rawEnd > rawStart ? rawEnd - rawStart : rawEnd + 360 - rawStart;
        } else {
          baseSpan = Math.max(1, this.childSectorSpan);
        }

        // 计算角度扩展比例
        const spanRatio = baseSpan > 0 ? actualSpan / baseSpan : 1;

        // 根据按钮数量计算半径增量（每增加一个按钮，半径增加约12-15%）
        const countIncrement = Math.min(
          (total - 3) * 0.12,
          (this.childRadiusScaleFactor - 1) * 0.6,
        );

        // 根据角度扩展计算半径增量（角度扩展越大，半径也需要增加）
        const spanIncrement = Math.min(
          (spanRatio - 1) * 0.3,
          (this.childRadiusScaleFactor - 1) * 0.4,
        );

        // 半径倍数：基础1.0 + 数量增量 + 角度增量，但不超过最大倍数
        const radiusFactor = Math.min(
          1.0 + countIncrement + spanIncrement,
          this.childRadiusScaleFactor,
        );
        dynamicRadius = this.childRadius * radiusFactor;
      }

      const r = (angle * Math.PI) / 180;
      const x = Math.cos(r) * dynamicRadius;
      const y = Math.sin(r) * dynamicRadius;

      return {
        "--child-x": `${x}px`,
        "--child-y": `${y}px`,
        width: `${Math.max(this.subBtnSize - 8, 28)}px`,
        height: `${Math.max(this.subBtnSize - 8, 28)}px`,
      };
    },

    // 三级：扇形分布，围绕二级按钮
    getGrandChildBtnStyle(
      grandChildIndex,
      total,
      childIndex,
      totalChildren,
      parentIndex,
    ) {
      // 1. 计算父级（一级）按钮的角度
      const parentAngle = (360 / this.menuItems.length) * parentIndex - 90;

      // 2. 计算二级按钮相对于一级的角度
      const childSector = this.calculateSectorRange(totalChildren, parentAngle);
      const childAngle =
        totalChildren > 1
          ? childSector.start + childSector.step * childIndex
          : childSector.start;

      // 3. 计算三级按钮在二级按钮周围的扇形分布
      // 三级扇形张角稍微调窄一点 (例如 90度) 以显精致，或者按需保持 120
      const gSpan = 90;
      const gSector = this.calculateSectorRange(total, childAngle, gSpan);
      const angle =
        total > 1
          ? gSector.start + gSector.step * grandChildIndex
          : gSector.start;

      // 三级半径建议稍微小于二级半径，或者保持一致
      const gRadius = this.childRadius * 0.85;

      const r = (angle * Math.PI) / 180;
      const x = Math.cos(r) * gRadius;
      const y = Math.sin(r) * gRadius;

      return {
        "--grand-x": `${x}px`,
        "--grand-y": `${y}px`,
        width: `${Math.max(this.subBtnSize - 12, 24)}px`,
        height: `${Math.max(this.subBtnSize - 12, 24)}px`,
      };
    },

    // 辅助工具：计算扇形范围
    calculateSectorRange(total, centerAngle, preferredSpan = null) {
      const minStep = this.childMinAngleStep;
      const baseSpan = preferredSpan || this.childSectorSpan;
      const requiredSpan = total > 1 ? minStep * (total - 1) : 0;
      const actualSpan = Math.min(Math.max(baseSpan, requiredSpan), 360);

      const start = centerAngle - actualSpan / 2;
      const step = total > 1 ? actualSpan / (total - 1) : 0;

      return { start, step, span: actualSpan };
    },

    onDragStart(e) {
      this.dragging = true;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
      this.startPosX = this.posX ?? 0;
      this.startPosY = this.posY ?? 0;
      e.preventDefault();
    },
    onDragMove(e) {
      if (!this.dragging) return;
      const dx = e.clientX - this.dragStartX,
        dy = e.clientY - this.dragStartY;
      this.updatePosition(this.startPosX + dx, this.startPosY + dy);
    },
    onDragEnd() {
      this.dragging = false;
      this.persistPosition();
    },
    onTouchStart(e) {
      const t = e.touches[0];
      this.dragging = true;
      this.dragStartX = t.clientX;
      this.dragStartY = t.clientY;
      this.startPosX = this.posX ?? 0;
      this.startPosY = this.posY ?? 0;
    },
    onTouchMove(e) {
      if (!this.dragging) return;
      const t = e.touches[0];
      const dx = t.clientX - this.dragStartX,
        dy = t.clientY - this.dragStartY;
      this.updatePosition(this.startPosX + dx, this.startPosY + dy);
      e.preventDefault();
    },
    onTouchEnd() {
      this.dragging = false;
      this.persistPosition();
    },
    updatePosition(x, y) {
      const m = 8,
        w = this.mainBtnSize,
        h = this.mainBtnSize,
        vw = window.innerWidth,
        vh = window.innerHeight;
      this.posX = Math.min(Math.max(x, m), vw - w - m);
      this.posY = Math.min(Math.max(y, m), vh - h - m);
    },
    persistPosition() {
      try {
        if (this.posX != null && this.posY != null) {
          localStorage.setItem(
            "floatBtnMenuPos",
            JSON.stringify({ x: this.posX, y: this.posY }),
          );
        }
      } catch (e) {
        // localStorage access failed, ignore
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.float-btn-menu {
  position: fixed;
  z-index: 1000;
  user-select: none;

  .main-btn {
    background: #2c3e50;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.2s ease;
    position: relative;
    z-index: 1002;

    i {
      color: white;
      font-size: 24px;
      transition: transform 0.2s ease;
    }
    &:hover {
      background: #34495e;
      transform: scale(1.05);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.22);
    }
    &.active {
      i {
        transform: rotate(45deg);
      }
    }
  }

  .sub-buttons-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s ease;
    z-index: 2000; /* place above page content */
    &.expanded {
      opacity: 1;
      pointer-events: auto;
    }

    .sub-btn {
      position: absolute;
      top: 0;
      left: 0;
      background: #f2f5f9;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      transform-origin: center;
      opacity: 0;
      transform: translate(var(--tx, 0), var(--ty, 0)) translate(-50%, -50%);
      z-index: 1; /* base under its tooltip */

      i {
        color: #2c3e50;
        font-size: 20px;
      }
      .tooltip {
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: #2c3e50;
        color: white;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        margin-bottom: 8px;
        pointer-events: none;
        z-index: 9999 !important; /* 确保在最顶层 */
        opacity: 1;
        visibility: visible;
        display: block;
        &::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 4px solid transparent;
          border-top-color: #2c3e50;
        }
      }
    }
    &.expanded .sub-btn {
      opacity: 1;
      transform: translate(var(--tx, 0), var(--ty, 0)) translate(-50%, -50%);

      &:hover {
        transform: translate(var(--tx, 0), var(--ty, 0)) translate(-50%, -50%)
          scale(1.05) !important;
        z-index: 5 !important;
      }

      &.hovered,
      &.active-hover {
        transform: translate(var(--tx, 0), var(--ty, 0)) translate(-50%, -50%)
          scale(1.05) !important;
        z-index: 6 !important;
      }
    }

    .sub-sub-menu {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      pointer-events: auto;
      /* 定位到父级子按钮中心，仅做居中 */
      transform: translate(-50%, -50%);
      z-index: 10; /* above parent buttons and their tooltips */

      .sub-sub-btn {
        position: absolute;
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;
        /* 围绕父按钮环形分布，再自身居中 */
        transform: translate(var(--child-x, 0), var(--child-y, 0))
          translate(-50%, -50%);
        z-index: 1;

        i {
          color: #2c3e50;
          font-size: 16px;
        }
        .sub-sub-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: #2c3e50;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          white-space: nowrap;
          margin-bottom: 8px;
          pointer-events: none;
          z-index: 9999 !important; /* 确保在最顶层 */
          opacity: 1;
          visibility: visible;
          display: block;
          &::after {
            content: "";
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border: 4px solid transparent;
            border-top-color: #2c3e50;
          }
        }
        &:hover {
          background: #f8f9fa;
          transform: translate(var(--child-x, 0), var(--child-y, 0))
            translate(-50%, -50%) scale(1.05);
          z-index: 2; /* ensure hovered child above siblings */
        }
        &.active-hover,
        &.hovered {
          background: #f8f9fa;
          transform: translate(var(--child-x, 0), var(--child-y, 0))
            translate(-50%, -50%) scale(1.05);
          z-index: 3;
        }
      }

      .sub-sub-sub-menu {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        pointer-events: auto;
        transform: translate(-50%, -50%);
        z-index: 20;

        .sub-sub-sub-btn {
          position: absolute;
          background: white;
          border: 1px solid #eef0f2;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
          transition: all 0.2s ease;
          transform: translate(var(--grand-x, 0), var(--grand-y, 0))
            translate(-50%, -50%);
          z-index: 1;

          i {
            color: #2c3e50;
            font-size: 14px;
          }

          .sub-sub-sub-tooltip {
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: #2c3e50;
            color: white;
            padding: 3px 6px;
            border-radius: 4px;
            font-size: 10px;
            white-space: nowrap;
            margin-bottom: 6px;
            pointer-events: none;
            z-index: 9999;
            &::after {
              content: "";
              position: absolute;
              top: 100%;
              left: 50%;
              transform: translateX(-50%);
              border: 3px solid transparent;
              border-top-color: #2c3e50;
            }
          }

          &:hover {
            background: #f1f3f5;
            transform: translate(var(--grand-x, 0), var(--grand-y, 0))
              translate(-50%, -50%) scale(1.05);
            z-index: 2;
          }
        }
      }
    }
  }

  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: transparent;
    z-index: 999;
  }
}
</style>
