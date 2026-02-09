<template>
    <div class="card">
      <div class="card-body">
        <h4 class="card-title mb-2">基本信息</h4>
        <div class="table-responsive">
          <table
            class="table table-nowrap mb-0"
            style="width: 100%"
          >
            <tbody>
              <tr>
                <th style="width: 10%">姓名 :</th>
                <td style="width: 40%">{{ detailInfo.talentName }}</td>
                <th style="width: 10%">工号 :</th>
                <td style="width: 40%">{{ detailInfo.talentCode }}</td>
              </tr>
              <tr>
                <th>性别 :</th>
                <td>{{ detailInfo.gender }}</td>
                <th>年龄 :</th>
                <td>{{ detailInfo.age }}</td>
              </tr>
              <tr>
                <th>出生日期 :</th>
                <td>{{ detailInfo.birthday }}</td>
                <th>政治面貌 :</th>
                <td>{{ detailInfo.politicsStatus }}</td>
              </tr>
              <tr>
                <th>民族 :</th>
                <td>{{ detailInfo.nationality }}</td>
                <th>婚姻状况 :</th>
                <td>{{ detailInfo.maritalStatus }}</td>
              </tr>
              <tr>
                <th>手机号码 :</th>
                <td>{{ detailInfo.phoneNumber }}</td>
                <th>备用邮箱 :</th>
                <td>{{ detailInfo.secondEmail }}</td>
              </tr>
              <tr>
                <th>档案存放单位 :</th>
                <td>{{ detailInfo.archiveUnit }}</td>
                <th>参加工作时间 :</th>
                <td>{{ detailInfo.startWorkDate }}</td>
              </tr>
              <tr>
                <th>证件类型 :</th>
                <td>{{ detailInfo.certificateType }}</td>
                <th>证件号码 :</th>
                <td>{{ detailInfo.certificateNumber }}</td>
              </tr>
              <tr>
                <th>证件颁发日期 :</th>
                <td>{{ detailInfo.certificateIssueDate }}</td>
                <th>证件有效期 :</th>
                <td>{{ detailInfo.certificateValidityDate }}</td>
              </tr>
              <tr>
                <th>户籍地址 :</th>
                <td>{{ detailInfo.domicile }}</td>
                <th>户籍地-邮编 :</th>
                <td>{{ detailInfo.domicilePostCode }}</td>
              </tr>
              <tr>
                <th>现居住地址 :</th>
                <td>{{ detailInfo.living }}</td>
                <th>现居住地-邮编 :</th>
                <td>{{ detailInfo.livingPostCode }}</td>
              </tr>
              <tr>
                <th>紧急联系人姓名 :</th>
                <td>{{ detailInfo.emergencyName }}</td>
                <th>紧急联系人电话 :</th>
                <td>{{ detailInfo.emergencyPhone }}</td>
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
      detailInfo: {
        type: Object,
        required: true,
        default: () => {}
      },
    },
    created() {
      this.$addCopy()
    },
    beforeUnmount(){
      this.$destroyCopy()
    }
  };
  </script>
  
  <style></style>
  