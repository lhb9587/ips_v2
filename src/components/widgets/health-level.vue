<script>
export default {
  data() {
    return {};
  },
};
</script>

<template>
  <div class="card">
    <div class="card-body">
      <div class="d-flex flex-wrap">
        <div class="me-2">
          <span class="card-title mb-3">客户健康度</span>
        </div>
      </div>
      <div>
        <ul class="list-group list-group-flush">
          <li class="list-group-item">
            <div class="py-2">
              <h5 class="font-size-14">
                L Oreal/欧莱雅 <span class="float-end">78%</span>
              </h5>
              <div class="progress animated-progess progress-sm">
                <div
                  class="progress-bar"
                  role="progressbar"
                  style="width: 78%"
                  aria-valuenow="78"
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
            </div>
          </li>
          <li class="list-group-item">
            <div class="py-2">
              <h5 class="font-size-14">
                INTERPARFUMS <span class="float-end">69%</span>
              </h5>
              <div class="progress animated-progess progress-sm">
                <div
                  class="progress-bar bg-warning"
                  role="progressbar"
                  style="width: 69%"
                  aria-valuenow="69"
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
            </div>
          </li>
          <li class="list-group-item">
            <div class="py-2">
              <h5 class="font-size-14">
                上美 <span class="float-end">61%</span>
              </h5>
              <div class="progress animated-progess progress-sm">
                <div
                  class="progress-bar bg-success"
                  role="progressbar"
                  style="width: 61%"
                  aria-valuenow="61"
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>