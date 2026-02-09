<script>
import Stat from "@/components/widgets/stat";
export default {
  name: "expirationOfContract",
  components: {
    Stat,
  },
}
</script>
<template>
  <Stat
    icon="bx bx-copy-alt"
    title="合同到期"
    value="0"
    :showDetail="true"
    helpText="显示即将到期的客户合同数量，点击可查看详细时限列表"
  />
</template>
