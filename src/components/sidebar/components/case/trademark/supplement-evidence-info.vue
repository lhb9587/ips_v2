<template>
  <div
    v-if="showSupplementEvidenceInfo"
    class="card mb-0 mt-2"
  >
    <div class="card-body">
      <div style="display: flex; justify-content: space-between">
        <h4 class="card-title mb-2">补充证据</h4>
        <span
          style="color: #9099a4; font-size: 12px"
          v-if="caseInfo.yybcFileSize"
        >
          附件大小：{{ caseInfo.yybcFileSize }}
        </span>
      </div>
      <div class="table-responsive">
        <table
          class="table table-nowrap mb-0"
          style="width: 100%"
        >
          <tbody>
            <tr>
              <td
                colspan="4"
                class="nocopy"
              >
                <el-table
                  :data="supplementEvidenceTableData"
                  :max-height="280"
                  :show-overflow-tooltip="true"
                >
                  <el-table-column
                    type="index"
                    label="序号"
                    width="60"
                  />
                  <el-table-column
                    :prop="col.value"
                    :label="col.title"
                    v-for="col of supplementEvidenceColumns"
                    :key="col.value"
                  >
                    <template
                      v-if="col.value === 'material'"
                      #default="{ row }"
                    >
                      <template v-if="normalizeMaterials(row.material).length">
                        <p
                          v-for="(item, idx) in normalizeMaterials(
                            row.material,
                          )"
                          :key="`${item.name}-${idx}`"
                          style="margin-bottom: 0"
                        >
                          <a
                            v-if="item.href"
                            style="color: #409eff"
                            target="_blank"
                            :href="item.href"
                          >
                            {{ item.name }}
                          </a>
                          <span v-else>{{ item.name }}</span>
                        </p>
                      </template>
                      <span v-else>-</span>
                    </template>
                  </el-table-column>
                </el-table>
              </td>
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
      supplementEvidenceColumns: [
        {
          title: "法律条款",
          value: "law",
        },
        {
          title: "事实理由",
          value: "reason",
        },
        {
          title: "附件",
          value: "material",
        },
        {
          title: "创建日期",
          value: "createDate",
        },
      ],
    };
  },
  computed: {
    showSupplementEvidenceInfo() {
      return !this.caseInfo.usAgency && this.caseInfo.caseType === "异议";
    },
    supplementEvidenceTableData() {
      return Array.isArray(this.caseInfo.demurCaseLawBCs)
        ? this.caseInfo.demurCaseLawBCs
        : [];
    },
  },
  methods: {
    normalizeMaterials(material) {
      if (!material) return [];
      const list = Array.isArray(material) ? material : [material];
      return list.map((item) => {
        if (typeof item === "string") {
          return { name: item, href: "" };
        }
        if (!item || typeof item !== "object") {
          return { name: "-", href: "" };
        }
        const name =
          item.materialName ||
          item.name ||
          item.fileName ||
          item.filename ||
          "-";
        const path =
          item.address || item.url || item.materialPath || item.fileUrl || "";
        const href = path
          ? path.startsWith("http")
            ? path
            : `/ipdoc${path}`
          : "";
        return { name, href };
      });
    },
  },
  created() {
    this.$addCopy();
  },
  beforeUnmount() {
    this.$destroyCopy();
  },
};
</script>

<style></style>
