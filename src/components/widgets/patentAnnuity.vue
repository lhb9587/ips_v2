<script>
import Stat from "@/components/widgets/stat";
export default {
  name: "patentAnnuity",
  components: {
    Stat,
  },
}
</script>
<template>
  <Stat
    icon="bx bx-purchase-tag-alt"
    title="专利年费"
    value="0"
    :showDetail="true"
    helpText="显示即将到期的专利年费数量，点击可查看详细时限列表"
  />
</template>
