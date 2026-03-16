<template>
  <div
    v-if="showLawReasonInfo"
    class="card mb-0 mt-2"
  >
    <div class="card-body">
      <h4 class="card-title mb-2">法律条款和事实理由</h4>

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
                是否引用其他异议申请证据材料 :
              </th>
              <td style="width: 40%">
                {{ yesNoDisplay(caseInfo.quotedOthersMaterial) }}
              </td>
              <th
                v-if="showQuotedAppNumber"
                scope="row"
                style="width: 10%"
              >
                引证异议申请号 :
              </th>
              <td
                v-if="showQuotedAppNumber"
                style="width: 40%"
              >
                {{ caseInfo.quotedAppNumber }}
              </td>
            </tr>
            <tr v-if="showSubBusinessSecrets">
              <th scope="row">是否提交涉商业机密证据材料 :</th>
              <td>{{ yesNoDisplay(caseInfo.subBusinessSecrets) }}</td>
              <th
                v-if="showBusinessSecretsMaterial"
                scope="row"
              >
                涉商业机密证据材料 :
              </th>
              <td
                v-if="showBusinessSecretsMaterial"
                class="nocopy"
              >
                <p
                  v-for="item in getAddressAndName('301677')"
                  :key="item.address"
                  style="margin-bottom: 0"
                >
                  <a
                    style="color: #409eff"
                    target="_blank"
                    :href="`/ipdoc${item.address}`"
                  >
                    {{ item.name }}
                  </a>
                </p>
              </td>
            </tr>
            <tr>
              <th scope="row">其他说明文件 :</th>
              <td
                colspan="3"
                class="nocopy"
              >
                <p
                  v-for="item in getAddressAndName('1020')"
                  :key="item.address"
                  style="margin-bottom: 0"
                >
                  <a
                    style="color: #409eff"
                    target="_blank"
                    :href="`/ipdoc${item.address}`"
                  >
                    {{ item.name }}
                  </a>
                </p>
              </td>
            </tr>
            <tr>
              <th scope="row">法律条款和事实理由列表 :</th>
              <td
                colspan="3"
                class="nocopy"
              >
                <el-table
                  :data="lawReasonTableData"
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
                    v-for="col of lawReasonColumns"
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
      lawReasonColumns: [
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
      ],
    };
  },
  computed: {
    showLawReasonInfo() {
      return !this.caseInfo.usAgency && this.caseInfo.caseType === "异议";
    },
    showQuotedAppNumber() {
      return !!this.caseInfo.quotedOthersMaterial;
    },
    showSubBusinessSecrets() {
      return !this.caseInfo.quotedOthersMaterial;
    },
    showBusinessSecretsMaterial() {
      return (
        this.showSubBusinessSecrets &&
        String(this.caseInfo.subBusinessSecrets) === "1"
      );
    },
    lawReasonTableData() {
      return Array.isArray(this.caseInfo.demurCaseLaws)
        ? this.caseInfo.demurCaseLaws
        : [];
    },
  },
  methods: {
    yesNoDisplay(value) {
      if (value === true || value === 1 || value === "1" || value === "是")
        return "是";
      if (value === false || value === 0 || value === "0" || value === "否")
        return "否";
      return value || "-";
    },
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
    getAddressAndName(materialTypeId) {
      if (this.caseInfo.materials) {
        return this.caseInfo.materials.filter(
          (item) => item.materialTypeId == materialTypeId,
        );
      }
      return [];
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
