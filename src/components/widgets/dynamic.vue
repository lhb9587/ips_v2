<script>
import { SimpleBar } from "simplebar-vue3";
export default {
  components: {
    SimpleBar,
  },
};
</script>
<template>
  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-4">动态信息</h4>
      <SimpleBar style="max-height: 376px;">
        <ul class="verti-timeline list-unstyled">
          <li class="event-list">
            <div class="event-timeline-dot">
              <i class="bx bx-right-arrow-circle font-size-18"></i>
            </div>
            <div class="d-flex">
              <div class="flex-shrink-0 me-3">
                <img src="@/assets/images/users/avatar-5.jpg" alt="" class="avatar-xs rounded-circle">
              </div>
              <div class="flex-grow-1">
                <div>
                  <b>Charles Brown</b>申请了<b>高级前端开发人员职位</b>
                  <p class="mb-0 text-muted">3 分钟前</p>
                </div>
              </div>
            </div>
          </li>
          <li class="event-list">
            <div class="event-timeline-dot">
              <i class="bx bx-right-arrow-circle font-size-18"></i>
            </div>
            <div class="d-flex">
              <div class="flex-shrink-0 me-3">
                <div class="avatar-xs">
                  <div class="avatar-title bg-primary text-primary bg-soft rounded-circle">
                    <i class='bx bx-revision font-size-14'></i>
                  </div>
                </div>
              </div>
              <div class="flex-grow-1">
                <div>
                  某某客户合同即将到期 <a href="javascript: void(0);">立即续签</a>
                  <p class="text-muted mb-0">53 分钟前</p>
                </div>
              </div>
            </div>
          </li>
          <li class="event-list">
            <div class="event-timeline-dot">
              <i class="bx bx-right-arrow-circle font-size-18"></i>
            </div>
            <div class="d-flex">
              <div class="flex-shrink-0 me-3">
                <img src="@/assets/images/users/avatar-5.jpg" alt="" class="avatar-xs rounded-circle">
              </div>
              <div class="flex-grow-1">
                <div>
                  新客户<b> 某某客户名称</b> 审查中<b></b>
                  <p class="mb-0 text-muted">1 小时前</p>
                </div>
              </div>
            </div>
          </li>
          <li class="event-list">
            <div class="event-timeline-dot">
              <i class="bx bx-right-arrow-circle font-size-18"></i>
            </div>
            <div class="d-flex">
              <div class="flex-shrink-0 me-3">
                <img src="@/assets/images/users/avatar-5.jpg" alt="" class="avatar-xs rounded-circle">
              </div>
              <div class="flex-grow-1">
                <div>
                  <b>Charles Brown</b>申请了<b>高级前端开发人员职位</b>
                  <p class="mb-0 text-muted">1 小时前</p>
                </div>
              </div>
            </div>
          </li>
        </ul>
        <div class="text-center mt-4"><a href="javascript: void(0);"
            class="btn btn-primary waves-effect waves-light btn-sm">查看更多 <i
              class="mdi mdi-arrow-right ms-1"></i></a></div>
      </SimpleBar>
    </div>
  </div>
</template>
<style scoped>
.event-list{
  padding: 0px 0px 38px 30px;
}
</style>