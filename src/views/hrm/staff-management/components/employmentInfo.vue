<template>
    <div class="card">
      <div class="card-body">
        <h4 class="card-title mb-2">在职信息</h4>
        <div class="table-responsive">
          <table
            class="table table-nowrap mb-0"
            style="width: 100%"
          >
            <tbody>
              <tr>
                <th style="width: 10%">员工类型 :</th>
                <td style="width: 40%">{{ detailInfo.empType }}</td>
                <th style="width: 10%">部门 :</th>
                <td style="width: 40%">{{ detailInfo.department }}</td>
              </tr>
              <tr>
                <th>工作组 :</th>
                <td>{{ detailInfo.groupName }}</td>
                <th>岗位名称 :</th>
                <td>{{ detailInfo.posName }}</td>
              </tr>
              <tr>
                <th>合同签订主体 :</th>
                <td>{{ detailInfo.contractOwner }}</td>
                <th>合同起始日期 :</th>
                <td>{{ detailInfo.contractDate }}</td>
              </tr>
              <tr>
                <th>合同终止日期 :</th>
                <td>{{ detailInfo.expirationDate }}</td>
                <th>合同年限 :</th>
                <td>{{ detailInfo.contractLimit }}</td>
              </tr>
              <tr>
                <th>工作邮箱 :</th>
                <td>{{ detailInfo.email }}</td>
                <th>入职日期 :</th>
                <td>{{ detailInfo.joinDate }}</td>
              </tr>
              <tr>
                <th>转正日期 :</th>
                <td>{{ detailInfo.regularDate }}</td>
                <th>离职日期 :</th>
                <td>{{ detailInfo.leaveDate }}</td>
              </tr>
              <tr>
                <th>司龄 :</th>
                <td>{{ detailInfo.companyAge }}</td>
                <th>社会工龄 :</th>
                <td>{{ detailInfo.workAge }}</td>
              </tr>
              <tr>
                <th>工资发放地 :</th>
                <td>{{ detailInfo.paymentPlace }}</td>
                <th>调整时间(年) :</th>
                <td>{{ detailInfo.workAdjustTime }}</td>
              </tr>
              <tr>
                <th>所属公司 :</th>
                <td colspan="3">{{ detailInfo.belongToCompany }}</td>
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