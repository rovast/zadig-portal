<template>
  <div class="create-product-detail-container" v-loading="loading" element-loading-text="正在加载中" element-loading-spinner="el-icon-loading">
    <div class="module-title">
      <h1>创建环境</h1>
    </div>
    <div v-if="showEmptyServiceModal" class="no-resources">
      <div>
        <img src="@assets/icons/illustration/environment.svg" alt />
      </div>
      <div class="description">
        <p>
          该环境暂无服务，请点击
          <router-link :to="`/v1/projects/detail/${projectName}/services`">
            <el-button type="primary" size="mini" round plain>项目->服务</el-button>
          </router-link>添加服务
        </p>
      </div>
    </div>
    <div v-else>
      <el-form label-width="80px" label-position="right"  ref="create-env-ref" :model="projectConfig" :rules="rules">
        <el-form-item label="环境名称" prop="env_name">
          <el-input @input="changeEnvName" v-model="projectConfig.env_name" size="small"></el-input>
        </el-form-item>
        <el-form-item label="命名空间" prop="defaultNamespace">
          <el-input style="width: 250px;" :disabled="editButtonDisabled" v-model="projectConfig.defaultNamespace" size="small"></el-input>
          <span class="editButton" @click="editButtonDisabled = !editButtonDisabled">{{editButtonDisabled? '编辑' : '完成'}}</span>
        </el-form-item>
        <el-form-item label="创建方式" prop="source">
          <el-select class="select" @change="changeCreateMethod" v-model="projectConfig.source" size="small" placeholder="请选择环境类型">
            <el-option label="系统创建" value="system"></el-option>
            <el-option label="复制环境" value="copy"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="projectConfig.source === 'copy'" label="复制环境" prop="baseEnvName">
          <el-select class="select" @change="changeBaseEnv" v-model="projectConfig.baseEnvName" size="small" placeholder="请选择复制的环境名称">
            <el-option v-for="name in projectEnvNames" :key="name" :label="name" :value="name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="集群" prop="cluster_id">
          <el-select class="select" filterable v-model="projectConfig.cluster_id" size="small" placeholder="请选择集群">
            <el-option v-for="cluster in allCluster" :key="cluster.id" :label="$utils.showClusterName(cluster)" :value="cluster.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="镜像仓库">
          <el-select class="select" v-model.trim="projectConfig.registry_id" placeholder="请选择镜像仓库" size="small">
            <el-option
              v-for="registry in imageRegistry"
              :key="registry.id"
              :label="`${registry.reg_addr}/${registry.namespace}`"
              :value="registry.id"
            ></el-option>
          </el-select>
          <div class="image-secret">imagePullSecret 名称：default-registry-secret</div>
        </el-form-item>
      </el-form>

      <div style="color: rgb(153, 153, 153); font-size: 16px; line-height: 20px;">服务列表</div>
      <el-card class="box-card-service" :body-style="{padding: '0px'}">
        <div slot="header" class="clearfix">
          <span class="second-title">Chart (HELM 部署)</span>
        </div>
        <HelmEnvTemplate
          class="chart-value"
          ref="helmEnvTemplateRef"
          :chartNames="chartNames"
          :envNames="envNames"
          :handledEnv="envName"
          :envScene="envScene"
        ></HelmEnvTemplate>
      </el-card>
      <el-form label-width="200px" class="ops">
        <el-form-item>
          <el-button @click="deployHelmEnv" :loading="startDeployLoading" type="primary" size="medium">确定</el-button>
          <el-button @click="$router.back()" :loading="startDeployLoading" size="medium">取消</el-button>
        </el-form-item>
      </el-form>
      <footer v-if="startDeployLoading" class="create-footer">
        <el-row :gutter="20">
          <el-col :span="16">
            <div class="grid-content bg-purple">
              <div class="description">
                <el-tag type="primary">正在创建环境中....</el-tag>
              </div>
            </div>
          </el-col>

          <el-col :span="8">
            <div class="grid-content bg-purple">
              <div class="deploy-loading">
                <div class="spinner__item1"></div>
                <div class="spinner__item2"></div>
                <div class="spinner__item3"></div>
                <div class="spinner__item4"></div>
              </div>
            </div>
          </el-col>
        </el-row>
      </footer>
    </div>
  </div>
</template>

<script>
import {
  initProductAPI,
  getClusterListAPI,
  getSingleProjectAPI,
  createHelmEnvAPI,
  getEnvironmentsAPI,
  getRegistryWhenBuildAPI
} from '@api'
import bus from '@utils/eventBus'
import { cloneDeep } from 'lodash'
import HelmEnvTemplate from './env_detail/components/updateHelmEnvTemp.vue'

const validateEnvName = (rule, value, callback) => {
  if (typeof value === 'undefined' || value === '') {
    callback(new Error('填写环境名称'))
  } else {
    if (!/^[a-z0-9-]+$/.test(value)) {
      callback(new Error('环境名称只支持小写字母和数字，特殊字符只支持中划线'))
    } else {
      callback()
    }
  }
}
export default {
  data () {
    return {
      editButtonDisabled: true,
      projectConfig: {
        product_name: '',
        cluster_id: '',
        env_name: '',
        source: 'system',
        baseEnvName: '',
        namespace: '',
        defaultNamespace: '',
        isPublic: true,
        registry_id: ''
      },
      projectInfo: {},
      allCluster: [],
      startDeployLoading: false,
      loading: false,
      rules: {
        cluster_id: [
          { required: true, trigger: 'change', message: '请选择集群' }
        ],
        source: [
          { required: true, trigger: 'change', message: '请选择环境类型' }
        ],
        baseEnvName: [
          { required: true, trigger: 'change', message: '请选择复制的环境名称' }
        ],
        namespace: [
          { required: true, trigger: 'change', message: '请选择命名空间' }
        ],
        defaultNamespace: [
          { required: true, trigger: 'change', message: '命名空间不能为空' }
        ],
        env_name: [
          { required: true, trigger: 'change', validator: validateEnvName }
        ]
      },
      projectEnvNames: [],
      projectChartNames: [],
      chartNames: null,
      envNames: [],
      envName: '',
      envScene: 'createEnv', // updateRenderSet
      imageRegistry: []
    }
  },

  computed: {
    projectName () {
      return this.$route.params.project_name
    },
    showEmptyServiceModal () {
      return this.projectChartNames.length === 0
    }
  },
  methods: {
    changeEnvName (value) {
      this.projectConfig.defaultNamespace = this.projectName + '-env-' + value
    },
    async getCluster () {
      const projectName = this.projectName
      const res = await getClusterListAPI(projectName)
      const cluster_id = this.projectConfig.cluster_id
      this.allCluster = res.filter(element => {
        if (element.local && !cluster_id) {
          this.projectConfig.cluster_id = element.id
        }
        return element.status === 'normal'
      })
    },
    async checkProjectFeature () {
      const projectName = this.projectName
      this.projectInfo = await getSingleProjectAPI(projectName)
    },
    async getTemplateAndImg () {
      this.loading = true
      const template = await initProductAPI(this.projectName, this.isStcov)
      this.loading = false
      this.projectChartNames = template.chart_infos
        ? template.chart_infos.map(chart => {
          return {
            serviceName: chart.service_name,
            chartVersion: chart.chart_version,
            type: 'common'
          }
        })
        : []
      this.chartNames = this.projectChartNames
      this.projectConfig.source = 'system'
    },
    changeCreateMethod () {
      const source = this.projectConfig.source
      if (source === 'system') {
        this.chartNames = this.projectChartNames
        this.envNames = []
        this.envName = ''
        this.envScene = 'createEnv'
        // this.getTemplateAndImg()
      } else if (source === 'copy') {
        if (!this.projectConfig.baseEnvName) {
          this.projectConfig.baseEnvName = this.projectEnvNames[0]
        }
        this.changeBaseEnv()
      }
    },
    changeBaseEnv () {
      this.chartNames = null
      this.envNames = [this.projectConfig.baseEnvName]
      this.envName = this.projectConfig.baseEnvName
      this.envScene = 'updateRenderSet'
    },
    async deployHelmEnv () {
      const res = await this.$refs.helmEnvTemplateRef.validate().catch(err => {
        console.log(err)
      })
      if (!res) {
        return
      }
      this.$refs['create-env-ref'].validate(valid => {
        if (valid) {
          const valueInfo = cloneDeep(
            this.$refs.helmEnvTemplateRef.getAllInfo()
          )

          const isCopy = this.projectConfig.source === 'copy'
          const baseEnvName = this.projectConfig.baseEnvName
          if (isCopy) {
            valueInfo.chartInfo.forEach(info => {
              info.envName = ''
            })
          }
          const defaultEnv = isCopy ? baseEnvName : 'DEFAULT'
          const payload = {
            envName: this.projectConfig.env_name,
            clusterID: this.projectConfig.cluster_id,
            registry_id: this.projectConfig.registry_id,
            baseEnvName: isCopy ? baseEnvName : '',
            chartValues: valueInfo.chartInfo,
            defaultValues: valueInfo.envInfo[defaultEnv] || '',
            namespace: this.projectConfig.defaultNamespace
          }
          this.startDeployLoading = true
          function sleep (time) {
            return new Promise(resolve => setTimeout(resolve, time))
          }
          createHelmEnvAPI(
            this.projectConfig.product_name,
            [payload],
            isCopy ? 'copy' : ''
          ).then(
            res => {
              // Add delay to solve the back-end permission synchronization problem
              sleep(5000).then(() => {
                const envName = payload.envName
                this.startDeployLoading = false
                this.$message({
                  message: '创建环境成功',
                  type: 'success'
                })
                this.$router.push(
                  `/v1/projects/detail/${this.projectName}/envs/detail?envName=${envName}`
                )
              })
            },
            () => {
              this.startDeployLoading = false
            }
          )
        }
      })
    },
    getEnvNames () {
      getEnvironmentsAPI(this.projectName).then(res => {
        this.projectEnvNames = res.map(re => re.name)
      })
    }
  },
  created () {
    bus.$emit('set-topbar-title', {
      title: '',
      breadcrumb: [
        { title: '项目', url: `/v1/projects/detail/${this.projectName}/detail` },
        {
          title: `${this.projectName}`,
          url: `/v1/projects/detail/${this.projectName}/detail`
        },
        { title: '集成环境', url: '' },
        { title: '创建', url: '' }
      ]
    })
    this.projectConfig.product_name = this.projectName
    this.checkProjectFeature()
    this.getCluster()
    this.getEnvNames()
    getRegistryWhenBuildAPI(this.projectName).then(res => {
      this.imageRegistry = res
      if (!this.projectConfig.registry_id) {
        const registry = res.find(reg => reg.is_default)
        this.projectConfig.registry_id = registry ? registry.id : ''
      }
      this.getTemplateAndImg()
    })
  },
  components: {
    HelmEnvTemplate
  }
}
</script>

<style lang="less" scoped>
.create-product-detail-container {
  position: relative;
  flex: 1;
  padding: 15px 20px;
  overflow: auto;
  font-size: 13px;

  .image-secret {
    margin-left: 3px;
    color: #cdcfd4;
    font-size: 12px;
    line-height: 1.5;
  }

  .module-title h1 {
    margin-bottom: 30px;
    font-weight: 200;
    font-size: 1.5rem;
  }

  .box-card-service {
    margin-top: 25px;
    margin-bottom: 25px;
    border: none;
    box-shadow: none;

    .chart-value {
      width: 80%;
      min-width: 450px;
      margin-left: 5px;
    }
  }

  /deep/.el-card__header {
    position: relative;
    box-sizing: border-box;
    padding-top: 10px;
    padding-bottom: 10px;
    padding-left: 0;
    border-bottom: none;

    &::before {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 400px;
      height: 1px;
      border-bottom: 1px solid #eee;
      content: '';
    }
  }

  /deep/.el-collapse-item__header {
    padding-left: 0;
  }

  .no-resources {
    padding: 45px;
    border-style: hidden;
    border-radius: 4px;
    border-collapse: collapse;
    box-shadow: 0 0 0 2px #f1f1f1;

    img {
      display: block;
      width: 360px;
      height: 360px;
      margin: 10px auto;
    }

    .description {
      margin: 16px auto;
      text-align: center;

      p {
        color: #8d9199;
        font-size: 15px;
      }
    }
  }

  .create-footer {
    position: fixed;
    bottom: 0;
    z-index: 5;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    width: 800px;
    padding: 15px 60px 10px 0;
    text-align: left;
    background-color: #fff;
    border-top: 1px solid #fff;

    .grid-content {
      min-height: 36px;
      border-radius: 4px;

      .description {
        line-height: 36px;

        p {
          margin: 0;
          color: #676767;
          font-size: 16px;
          line-height: 36px;
          text-align: left;
        }
      }

      .deploy-loading {
        width: 100px;
        margin-left: 70px;
        line-height: 36px;
        text-align: center;

        div {
          display: inline-block;
          width: 8px;
          height: 8px;
          margin-right: 4px;
          background-color: @themeColor;
          border-radius: 100%;
          animation: sk-bouncedelay 1.4s infinite ease-in-out both;
        }

        .spinner__item1 {
          animation-delay: -0.6s;
        }

        .spinner__item2 {
          animation-delay: -0.4s;
        }

        .spinner__item3 {
          animation-delay: -0.2s;
        }

        @keyframes sk-bouncedelay {
          0%,
          80%,
          100% {
            -webkit-transform: scale(0);
            transform: scale(0);
            opacity: 0;
          }

          40% {
            -webkit-transform: scale(1);
            transform: scale(1);
            opacity: 1;
          }
        }
      }
    }
  }

  /deep/.el-input__inner {
    width: 250px;
  }

  .second-title {
    color: #606266;
    font-size: 14px;
  }

  /deep/.el-tag {
    background-color: rgba(64, 158, 255, 0.2);
  }

  .ops {
    margin-top: 25px;
  }
}

.editButton {
  display: inline-block;
  margin-left: 10px;
  color: @themeColor;
  cursor: pointer;
}
</style>
