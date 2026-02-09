<template>
    <div
      v-if="
        caseInfo.caseTypeId == 63 ||
        caseInfo.caseTypeId == 64 ||
        caseInfo.caseTypeId == 123
      "
    >
      <SpecialPatentInfo :caseInfo="caseInfo" />
    </div>
    <div v-else>
      <CommonPatentInfo :caseInfo="caseInfo" />
    </div>
  </template>
  
  <script>
  import { transformation } from "@/utils";
  import { querycustSelectClass } from "@/api/caseDetail";
  import CommonPatentInfo from "./common-patent-info.vue";
  import SpecialPatentInfo from "./special-patent-info.vue";
  export default {
    components: {
      SpecialPatentInfo,
      CommonPatentInfo,
    },
    props: {
      caseInfo: {
        type: Object,
        required: true,
      },
    },
    data() {
      return {
        selectData: {},
      };
    },
    methods: {
      transformation,
      fetchCustSelectClass() {
        querycustSelectClass({
          classId: "1042,1134,1135,1027,1029,1136,1031,1020",
        }).then((response) => {
          if (response.success) {
            this.selectData = response.data || {};
          } else {
            this.$message.error(response.message);
          }
        });
      },
    },
    created() {
      this.fetchCustSelectClass();
      this.$addCopy()
    },
    beforeUnmount(){
      this.$destroyCopy()
    }
  };
  </script>
  
  <style></style>
  