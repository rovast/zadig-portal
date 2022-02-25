<template>
    <div class="projects-service-mgr">
      <el-drawer title="代码源集成"
                 :visible.sync="integrationCodeDrawer"
                 direction="rtl">
        <IntegrationCode @cancel="integrationCodeDrawer = false"/>
      </el-drawer>
      <el-dialog title="是否更新对应环境？"
                 custom-class="dialog-upgrade-env"
                 :visible.sync="updateEnvDialogVisible"
                 width="40%">
        <div class="title">
          <el-alert title="勾选需要更新的环境，点击确定之后，该服务将自动在对应的环境中进行更新"
                    :closable="false"
                    type="warning">
          </el-alert>
          <el-checkbox-group v-model="checkedEnvList">
            <el-checkbox v-for="(env,index) in envNameList"
                         :key="index"
                         :label="env">{{env.name}}</el-checkbox>
          </el-checkbox-group>
          <div v-show="checkedEnvList.find(env => env.is_existed)" class="tip-desc">Zadig 中定义的服务将覆盖所选命名空间中的同名服务，请谨慎操作！</div>
        </div>
        <span slot="footer"
              class="dialog-footer">
          <el-button size="small"
                     type="primary"
                     @click="autoUpgradeEnv">确 定</el-button>
          <el-button size="small"
                     @click="skipUpdate">跳过</el-button>

        </span>
      </el-dialog>
      <div class="service-wrap">
        <div class="service-container">
          <Multipane class="vertical-panes"
                     layout="vertical">
            <div class="service-tree-container">
              <ServiceTree :services="services"
                           :projectInfo="projectInfo"
                           :currentServiceYamlKinds="currentServiceYamlKinds"
                           :sharedServices="sharedServices"
                           :basePath="`/v1/projects/detail/${projectName}/services`"
                           :showNext.sync="showNext"
                           :yamlChange="yamlChange"
                           ref="serviceTree"
                           @onAddCodeSource="addCodeSource"
                           @onJumpToKind="jumpToKind"
                           @onRefreshProjectInfo="checkProjectFeature"
                           @onRefreshService="getServices"
                           @onRefreshSharedService="getSharedServices"
                           @onSelectServiceChange="onSelectServiceChange"
                           @updateYaml="updateYaml($event)"
                           :envDialogVisible.sync="updateEnvDialogVisible"/>
            </div>
            <template v-if="service.service_name  &&  services.length >0">
              <template v-if="service.type==='k8s'">
                <MultipaneResizer/>
                <div class="service-editor-container"
                     :style="{ minWidth: '300px', width: '500px' }">
                  <ServiceEditor ref="serviceEditor"
                                    :serviceInTree="service"
                                    :showNext.sync="showNext"
                                    :yamlChange.sync="yamlChange"
                                    @onParseKind="getYamlKind"
                                    @onRefreshService="getServices"
                                    @onRefreshSharedService="getSharedServices"
                                    @onUpdateService="onUpdateService"/>
                </div>
                <MultipaneResizer/>
                <aside class="service-aside service-aside-right"
                       :style="{ flexGrow: 1 }">
                  <ServiceAside :service="service"
                                :detectedEnvs="detectedEnvs"
                                :detectedServices="detectedServices"
                                :systemEnvs="systemEnvs"
                                :buildBaseUrl="isOnboarding?`/v1/projects/create/${projectName}/k8s/service`:`/v1/projects/detail/${projectName}/services`"
                                @getServiceModules="getServiceModules"/>
                </aside>

              </template>
            </template>
            <div v-else
                 class="no-content">
              <img src="@assets/icons/illustration/editor_nodata.svg"
                   alt="">
              <p v-if="services.length === 0">暂无服务，点击 <el-button size="mini"
                           icon="el-icon-plus"
                           @click="createService()"
                           plain
                           circle>
                </el-button> 创建服务</p>
              <p v-else-if="service.service_name==='服务列表' && services.length >0">请在左侧选择需要编辑的服务</p>
              <p v-else-if="!service.service_name && services.length >0">请在左侧选择需要编辑的服务</p>
            </div>
          </Multipane>
        </div>
      </div>
      <div class="controls__wrap">
          <div v-if="isOnboarding" class="controls__right">
            <el-button type="primary"
                       size="small"
                       class="save-btn"
                       @click="showOnboardingNext"
                       plain>下一步</el-button>
          </div>
          <div v-else v-hasPermi="{projectName: projectName, action: 'config_environment'}" class="controls__right">
            <el-button type="primary"
                       size="small"
                       class="save-btn"
                       @click="upgradeEnv"
                       :disabled="!showNext || !envNameList.length"
                       plain>环境更新</el-button>
          </div>
      </div>
    </div>
</template>
<script>
import mixin from '@/mixin/serviceModuleMixin'
import ServiceAside from './k8s/serviceAside.vue'
import ServiceEditor from './k8s/serviceEditor.vue'
import ServiceTree from './common/serviceTree.vue'
import IntegrationCode from './common/integrationCode.vue'
import { sortBy } from 'lodash'
import { getSingleProjectAPI, getServiceTemplatesAPI, getServicesTemplateWithSharedAPI, serviceTemplateWithConfigAPI, autoUpgradeEnvAPI, listProductAPI } from '@api'
import { Multipane, MultipaneResizer } from 'vue-multipane'
export default {
  props: {
    isOnboarding: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      projectInfo: {},
      service: {},
      services: [],
      sharedServices: [],
      detectedEnvs: [],
      detectedServices: [],
      systemEnvs: [],
      checkedEnvList: [],
      currentServiceYamlKinds: {},
      showNext: false,
      yamlChange: false,
      updateEnvDialogVisible: false,
      integrationCodeDrawer: false,
      envNameList: []
    }
  },
  methods: {
    addCodeSource () {
      if (!this.$utils.roleCheck('admin')) {
        this.$message('私有镜像仓库未集成，请联系系统管理员前往「系统设置 -> 镜像仓库」进行集成！')
      } else {
        this.integrationCodeDrawer = true
      }
    },
    createService () {
      this.$refs.serviceTree.createService('platform')
    },
    upgradeEnv () {
      this.updateEnvDialogVisible = true
    },
    onSelectServiceChange (service) {
      this.$set(this, 'service', service)
    },
    getServices () {
      const projectName = this.projectName
      this.$set(this, 'service', {})
      getServiceTemplatesAPI(projectName).then((res) => {
        this.services = sortBy((res.data.map(service => {
          service.idStr = `${service.service_name}/${service.type}`
          service.status = 'added'
          return service
        })), 'service_name')
      })
    },
    getSharedServices () {
      const projectName = this.projectName
      getServicesTemplateWithSharedAPI(projectName).then((res) => {
        this.sharedServices = sortBy((res.map(service => {
          service.status = 'added'
          service.type = 'k8s'
          return service
        })), 'service_name')
      })
    },
    getServiceModules () {
      const serviceName = this.service.service_name
      const projectName = this.projectName
      serviceTemplateWithConfigAPI(serviceName, projectName).then(res => {
        this.detectedEnvs = res.custom_variable ? res.custom_variable : []
        this.detectedServices = res.service_module ? res.service_module : []
        this.systemEnvs = res.system_variable ? res.system_variable : []
      })
    },
    onUpdateService ({ service_name, service_status, res }) {
      this.showNext = true
      this.$router.replace({
        query: Object.assign(
          {},
          {},
          {
            service_name: service_name,
            rightbar: 'var'
          })
      })
      if (service_status === 'named') {
        this.getServices()
        this.$refs.serviceTree.getServiceGroup()
        this.getSharedServices()
      }
      this.detectedEnvs = res.custom_variable ? res.custom_variable : []
      this.detectedServices = res.service_module ? res.service_module : []
      this.systemEnvs = res.system_variable ? res.system_variable : []
    },
    updateYaml (switchNode) {
      this.$refs.serviceEditor.updateService().then(() => {
        if (switchNode) {
          this.$refs.serviceTree.selectAndSwitchTreeNode()
        }
      })
    },
    getYamlKind (payload) {
      this.currentServiceYamlKinds = payload
    },
    jumpToKind (payload) {
      this.$nextTick(() => {
        this.$refs.serviceEditor.jumpToWord(`kind: ${payload.kind}`)
      })
    },
    async checkProjectFeature () {
      const projectName = this.projectName
      this.projectInfo = await getSingleProjectAPI(projectName)
    },
    autoUpgradeEnv () {
      const payload = {
        env_names: this.checkedEnvList.map(env => env.name)
      }
      const projectName = this.projectName
      const force = false
      autoUpgradeEnvAPI(projectName, payload, force).then((res) => {
        this.$router.push(`/v1/projects/detail/${projectName}/envs`)
        this.$message({
          message: '更新环境成功',
          type: 'success'
        })
      }).catch(error => {
        const description = error.response.data.description
        const res = description.match('the following services are modified since last update')
        if (res) {
          this.updateEnv(description)
        }
      })
    },
    updateEnv (res) {
      const message = JSON.parse(res.match(/{.+}/g)[0])
      const key = Object.keys(message)[0]
      const value = message[key].map(item => {
        return item.name + ';'
      })
      this.$confirm(`您的更新操作将覆盖集成环境中${key}的${value}服务变更，确认继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const payload = {
          env_names: this.checkedEnvList.map(env => env.name)
        }
        const force = true
        const projectName = this.projectName
        autoUpgradeEnvAPI(projectName, payload, force).then((res) => {
          this.$router.push(`/v1/projects/detail/${projectName}/envs`)
          this.$message({
            message: '更新环境成功',
            type: 'success'
          })
        })
      })
    },
    skipUpdate () {
      this.updateEnvDialogVisible = false
    },
    async getEnvNameList () {
      const projectName = this.projectName
      const envNameList = await listProductAPI(projectName)
      if (envNameList.length) {
        this.envNameList = envNameList.map(env => {
          return {
            name: env.name,
            is_existed: env.is_existed || false
          }
        })
      }
    },
    showOnboardingNext () {
      this.$router.push(`/v1/projects/create/${this.projectName}/k8s/runtime?serviceName=${this.serviceName}`)
    }
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    },
    serviceName () {
      return this.$route.query.service_name
    }
  },
  mounted () {
    this.getEnvNameList()
    this.checkProjectFeature()
    this.getServices()
    this.getSharedServices()
  },
  components: {
    ServiceAside,
    ServiceEditor,
    ServiceTree,
    Multipane,
    MultipaneResizer,
    IntegrationCode
  },
  mixins: [mixin]
}
</script>

<style lang="less">
@import "~@assets/css/component/service-mgr.less";
</style>
