<template>
  <div
    v-for="info of caseInfo.trademarkCaseCustWorkgroups"
    :key="info.groupId"
  >
    <caseHandlerDetail
      :handlerInfo="info"
      handleType="客户组"
    />
  </div>
  <div
    v-for="info of caseInfo.trademarkCaseCBWorkgroups"
    :key="info.groupId"
  >
    <caseHandlerDetail
      :handlerInfo="info"
      handleType="承办组"
    />
  </div>
  <div
    v-for="info of caseInfo.trademarkCaseLCWorkgroups"
    :key="info.groupId"
  >
    <caseHandlerDetail
      :handlerInfo="info"
      handleType="流程组"
    />
  </div>
  <div class="card" v-if="caseInfo.actualAttorneyName">
    <div class="card-body">
      <div class="d-flex">
        <div class="flex-shrink-0 me-4">
          <div class="avatar-md">
            <span
              class="avatar-title rounded-circle bg-light text-danger font-size-16"
            >
              <img
                :src="`/ipdoc${caseInfo.actualAttorneyIcon}`"
                alt=""
                class="rounded-circle avatar-md"
              />
            </span>
          </div>
        </div>

        <div class="flex-grow-1 overflow-hidden">
          <h5 class="text-truncate font-size-15">
            <a
              href="javascript: void(0);"
              class="text-dark"
              >{{ caseInfo.actualAttorneyName }}</a
            >
          </h5>
          <p class="text-muted mb-4">撰写人</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import caseHandlerDetail from "./case-handler-detail.vue";
export default {
  components: {
    caseHandlerDetail,
  },
  data() {
    return {};
  },
  props: {
    caseInfo: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style></style>
