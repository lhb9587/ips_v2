<script>
import html2canvas from "html2canvas";
import axios from "axios";
export default {
  name: "insight",
  data() {
    return {
      insightText: "从公司经营角度分析图中的内容",
      loading: false,
      analysisResult: [],
      currentTypingIndex: 0,    // 当前正在打字的段落索引
      typingText: '',          // 当前打字的文本
      isTyping: false,         // 是否正在打字
    };
  },
  methods: {
    async analysisHandle() {
      if (!this.insightText) {
        return this.$message.error("请输入分析内容");
      }
      this.loading = true;
      try {
        // 获取要截图的元素
        const element = document.getElementById("insight-chart");
        if (!element) {
          throw new Error("Element not found");
        }

        // 等待图表完全渲染
        await this.$nextTick();

        // 配置 html2canvas 选项
        const options = {
          useCORS: true, // 允许跨域图片
          allowTaint: true, // 允许污染画布
          scale: 2, // 提高清晰度
          backgroundColor: "#ffffff", // 设置背景色
          logging: false, // 关闭日志
          imageTimeout: 0, // 禁用图片超时
          onclone: (clonedDoc) => {
            // 处理克隆的 DOM
            const clonedElement = clonedDoc.getElementById("insight-chart");
            if (clonedElement) {
              // 确保所有图表都已完全渲染
              clonedElement.style.visibility = "visible";
            }
          },
        };

        // 使用 html2canvas 进行截图
        const canvas = await html2canvas(element, options);

        // 将截图结果转换为图片格式
        // const screenshotImage = canvas.toDataURL("image/png", 1.0); // 使用最高质量

        // // 验证 base64 数据
        // if (!this.isValidBase64(screenshotImage)) {
        //   throw new Error("Invalid screenshot data");
        // }

        // // 下载图片
        // await this.downloadBase64File(screenshotImage, "图表.png");

        canvas.toBlob(async (blob) => {
          // 创建FormData对象
          const formData = new FormData();
          formData.append("files", blob, "canvas_image.png"); // 将Blob数据添加到表单中
          formData.append("prompt", this.insightText);

          const hostname = window.location.hostname;
          let url = "";
          if(hostname === "ips.wanhuida.cn"){
            url = "https://ips.wanhuida.cn/analyze_api/analyze_images";
          }else{
            url = "http://192.168.89.142:8000/analyze_images";
          }

          // 使用axios上传Blob数据
          try {
            const response = await axios.post(
              url,
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );
            // 在这里预处理文本，将每段文本分割成带标记的数组
            const rawTexts = response.data?.analysis?.split(/\n{1,}/);
            this.analysisResult = rawTexts.map(text => {
              const parts = [];
              let lastIndex = 0;
              // 修改正则表达式，匹配数字序号和加粗内容
              const regex = /(?:\d+\.\s*)?(\*\*.*?\*\*)/g;
              let match;
              
              while ((match = regex.exec(text)) !== null) {
                // 添加加粗前的普通文本
                if (match.index > lastIndex) {
                  parts.push({
                    text: text.slice(lastIndex, match.index),
                    bold: false
                  });
                }
                
                // 获取完整的匹配文本（包括可能的数字序号）
                const fullMatch = match[0];
                // 提取数字序号（如果存在）
                const numberMatch = fullMatch.match(/^(\d+\.\s*)?/);
                const number = numberMatch ? numberMatch[0] : '';
                // 提取加粗内容（去掉**标记）
                const boldContent = fullMatch.replace(/\*\*/g, '').replace(/^\d+\.\s*/, '');
                
                // 如果有数字序号，添加为加粗部分
                if (number) {
                  parts.push({
                    text: number + boldContent,
                    bold: true
                  });
                } else {
                  parts.push({
                    text: boldContent,
                    bold: true
                  });
                }
                
                lastIndex = match.index + fullMatch.length;
              }
              
              // 添加剩余的普通文本
              if (lastIndex < text.length) {
                parts.push({
                  text: text.slice(lastIndex),
                  bold: false
                });
              }
              return parts;
            });
            
            this.loading = false;
            await this.startTypingEffect();
          } catch (error) {
            console.error("上传失败:", error);
            this.loading = false;
          }
        });
      } catch (error) {
        console.error("Screenshot error:", error);
        this.$message.error("截图失败，请重试");
        this.loading = false;
      }
    },

    isValidBase64(str) {
      if (typeof str !== "string") return false;

      // 检查是否是有效的 Data URL
      if (!str.startsWith("data:image/png;base64,")) return false;

      const base64 = str.split(",")[1];
      try {
        return btoa(atob(base64)) === base64;
      } catch (err) {
        return false;
      }
    },

    async downloadBase64File(base64Data, fileName) {
      try {
        if (!base64Data || !this.isValidBase64(base64Data)) {
          throw new Error("Invalid base64 data");
        }

        // 将 base64 转换为 Blob
        const blob = await fetch(base64Data).then((res) => res.blob());

        // 使用 File API 创建文件
        const s = new File([blob], fileName, { type: "image/png" });

        // 创建下载链接
        const url = URL.createObjectURL(s);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;

        // 触发下载
        document.body.appendChild(link);
        link.click();

        // 清理
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 100);
      } catch (error) {
        console.error("Download error:", error);
        this.$message.error("下载失败，请重试");
      }
    },

    async typeEffect(textParts, speed = 5) {
      this.isTyping = true;
      this.typingText = '';
      
      for (const part of textParts) {
        const chars = part.text.split('');
        for (const char of chars) {
          this.typingText += part.bold ? `<strong>${char}</strong>` : char;
          await new Promise(resolve => setTimeout(resolve, speed));
          this.$nextTick(() => {
            const container = document.querySelector('.analysis-result');
            if (container) {
              container.scrollTop = container.scrollHeight;
            }
          });
        }
      }
      this.isTyping = false;
    },

    // 添加一个新的滚动方法
    scrollToBottom() {
      const container = document.querySelector('.analysis-result');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },

    async startTypingEffect() {
      for (let i = 0; i < this.analysisResult.length; i++) {
        this.currentTypingIndex = i;
        await this.typeEffect(this.analysisResult[i]);
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },
  },
  mounted() {
    this.analysisHandle()
  }
};
</script>
<template>
  <div class="h-100 insight-container">
    <div
      class="d-flex justify-content-between insight-header align-items-center"
    >
      <div>
        <i
          style="color: #556ee6; margin-right: 6px"
          class="icon iconfont icon-zhishidianwajue item-icon"
        ></i>
        <span>洞察</span>
      </div>
    </div>
    <div class="insight-input">
      <el-input
        v-model="insightText"
        :rows="2"
        type="textarea"
        class="insight-textarea"
      />
      <div class="insight-submit">
        <el-button
          type="primary"
          @click="analysisHandle"
          :loading="loading"
          >数据分析</el-button
        >
      </div>
    </div>
    <div class="analysis-result">
      <div
        v-for="(item, index) in analysisResult"
        :key="index"
        class="analysis-item"
      >
        <template v-if="index < currentTypingIndex">
          <span v-for="(part, pIndex) in item" :key="pIndex">
            <strong v-if="part.bold">{{ part.text }}</strong>
            <template v-else>{{ part.text }}</template>
          </span>
        </template>
        <template v-else-if="index === currentTypingIndex">
          <span v-html="typingText"></span>
        </template>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.insight-container {
  border-left: 1px solid #e5e6ee;
  height: 100%;
  padding: 0 0 0 16px;
  margin-left: 16px;
}
.insight-header {
  height: 48px;
}
.insight-input {
  background-color: #f8f8f8;
  padding: 8px;
  border-radius: 4px;
  width: 100%;
  min-height: 100px;
}
:deep(.insight-textarea) {
  .el-textarea__inner {
    box-shadow: none;
    background-color: initial;
  }
}
.insight-submit {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}
.analysis-result {
  overflow-y: auto;
  margin-top: 16px;
  height: calc(100% - 180px);
  padding-right: 8px;
  scroll-behavior: smooth;
}
.analysis-item{
  line-height: 24px;
  margin-bottom: 8px;
  font-size: 14px;
  
  strong {
    font-weight: 600;
    color: #333;
  }
}
</style>
