<template>
  <div class="projects-pm-service-container">
    <UpdateEnv ref="updateEnv"/>
    <div class="config-container-pm">
      <ServiceList
        ref="serviceList"
        :editService="editService"
        :addService="addService"
        :changeShowBuild="(value) =>showBuild = value"
      />
      <PmConfig
        v-if="showBuild"
        ref="pm-service"
        :serviceName="serviceName"
        :isEdit="isEdit"
        :changeUpdateEnvDisabled="changeUpdateEnvDisabled"
        @listenCreateEvent="listenEvent"/>
      <div v-else class="no-content">
            <img src="@assets/icons/illustration/editor_nodata.svg"
                 alt="">
            <p style="color: #909399;">暂无服务，创建服务请在左侧栏点击&nbsp;<el-button size="mini"
                           icon="el-icon-plus"
                           @click="$refs.serviceList.newService()"
                           plain
                           circle>
                </el-button>&nbsp;创建服务</p>
      </div>
    </div>
    <div class="controls__wrap">
      <div class="controls__right">
        <el-button type="primary" size="small" @click="openDialog" :disabled="updateEnvDisabled">
          更新环境
        </el-button>
      </div>
    </div>
  </div>
</template>
<script>
import ServiceList from '@/components/projects/common/pm/serviceList.vue'
import PmConfig from '@/components/projects/common/pm/pmConfig.vue'
import UpdateEnv from './pm/updateEnv'
export default {
  data () {
    return {
      showNext: false,
      isEdit: false,
      serviceName: '',
      updateEnvDisabled: true,
      showBuild: true
    }
  },
  methods: {
    openDialog () {
      this.$refs.updateEnv.openDialog()
    },
    changeUpdateEnvDisabled () {
      this.updateEnvDisabled = false
    },
    addService (obj) {
      this.isEdit = false
      this.serviceName = ''
      this.$refs['pm-service'].addNewService(obj)
    },
    editService (obj) {
      this.serviceName = obj.service_name
      this.isEdit = true
    },
    listenEvent (res) {
      if (res === 'success') {
        this.showNext = true
        this.$refs.serviceList.getServiceTemplates()
      }
    }
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    }
  },
  components: {
    PmConfig,
    ServiceList,
    UpdateEnv
  }
}
</script>

<style lang="less">
.no-content {
  width: 360px;
  height: 300px;
  margin: auto;

  img {
    display: block;
    width: 30%;
    height: auto;
    margin: 50px auto 0 auto;
  }
}

.projects-pm-service-container {
  position: relative;
  flex: 1;
  height: calc(~'100% - 60px');
  overflow: auto;

  .config-container-pm {
    position: relative;
    display: flex;
    height: calc(~'100% - 90px') !important;
    margin-bottom: 0;
    padding: 5px 15px 15px 15px;
  }

  .controls__wrap {
    position: relative;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 2;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
    margin: 0 15px;
    padding: 0 10px;
    background-color: #fff;
    box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.05);

    > * {
      margin-right: 10px;
    }

    .controls__right {
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      align-items: center;
      -webkit-box-align: center;
      -ms-flex-align: center;

      .save-btn,
      .next-btn {
        margin-right: 15px;
        padding: 10px 17px;
        color: #fff;
        font-size: 13px;
        text-decoration: none;
        background-color: @themeColor;
        border: 1px solid @themeColor;
        cursor: pointer;
        transition: background-color 300ms, color 300ms, border 300ms;
      }

      .save-btn[disabled],
      .next-btn[disabled] {
        background-color: #9ac9f9;
        border: 1px solid #9ac9f9;
        cursor: not-allowed;
      }
    }
  }
}
</style>
