<template>
  <div class="create-helm-version">
    <h4>创建版本</h4>

    <el-steps :active="activeStep" finish-status="success" align-center>
      <el-step title="填写基本信息"></el-step>
      <el-step title="检查配置"></el-step>
      <el-step title="推送仓库"></el-step>
    </el-steps>

    <keep-alive>
      <component ref="versionComp" class="step-content" :is="isComp" :releaseInfo="deliveryRelease"></component>
    </keep-alive>

    <footer class="footer">
      <el-button size="small" v-show="activeStep !== 0" @click="activeStep -= 1" :disabled="createLoading">上一步</el-button>
      <el-button size="small" type="primary" @click="nextStep" :loading="createLoading">{{activeStep - 2 ? '下一步' : '完成' }}</el-button>
      <el-button size="small" type="text" @click="cancel">取 消</el-button>
    </footer>
  </div>
</template>

<script>
import bus from '@utils/event_bus'

import Info from './create_version/info.vue'
import Config from './create_version/config.vue'
import Push from './create_version/push.vue'

import { createHelmVersionAPI } from '@api'

import { cloneDeep } from 'lodash'

export default {
  data () {
    return {
      activeStep: 0,
      deliveryRelease: {
        productName: '',
        version: '',
        retry: false, // true 用于重试
        labels: '', // []string 接口使用时进行转换
        desc: '',
        envName: '',
        chartDatas: [], // {serviceName, version, valuesYamlContent} and lastVersion but not post
        globalVariables: '',
        chartRepoName: '', // 仓库名称
        imageRegistryID: '', // 镜像仓库 ID
        options: {} // enableOfflineDist, s3StorageID
      },
      createLoading: false
    }
  },
  computed: {
    isComp () {
      let comp = null
      switch (this.activeStep) {
        case 0:
          comp = Info
          break
        case 1:
          comp = Config
          break
        case 2:
          comp = Push
          break
      }
      return comp
    }
  },
  methods: {
    async nextStep () {
      const res = await this.$refs.versionComp
        .validate()
        .catch(error => console.log(error))
      if (res) {
        if (this.activeStep === 2) {
          this.createHelmVersion()
        } else {
          this.activeStep += 1
        }
      }
    },
    async createHelmVersion () {
      const deliveryRelease = cloneDeep(this.deliveryRelease)
      deliveryRelease.chartDatas.forEach(chart => {
        delete chart.lastVersion
      })
      deliveryRelease.labels = deliveryRelease.labels
        .split(',')
        .map(label => label.trim())
      this.createLoading = true
      const res = await createHelmVersionAPI(deliveryRelease).catch(err =>
        console.log(err)
      )
      this.createLoading = false
      if (res) {
        this.$message.success(
          `${this.deliveryRelease.productName} 创建版本 ${this.deliveryRelease.version} 成功！`
        )
        this.activeStep = 0
        this.cancel()
      }
    },
    cancel () {
      this.$router.push({
        path: `/v1/delivery/version/${this.$route.params.project_name}`,
        query: {
          deployType: 'helm'
        }
      })
    }
  },
  created () {
    const projectName = this.$route.params.project_name
    bus.$emit(`set-topbar-title`, {
      title: '',
      breadcrumb: [
        { title: '版本管理', url: `` },
        {
          title: projectName,
          url: `/v1/delivery/version/${projectName}?deployType=helm`
        },
        { title: '创建版本', url: `` }
      ]
    })
  },
  mounted () {
    this.deliveryRelease.productName = this.$route.params.project_name
  }
}
</script>

<style lang="less" scoped>
.create-helm-version {
  min-width: 820px;
  height: calc(~'100% - 60px');
  padding: 20px 30px;

  h4 {
    margin-top: 5px;
  }

  /deep/.el-step__title {
    font-size: 15px;
    line-height: 32px;
  }

  /deep/.el-step__icon {
    width: 24px;
    height: 24px;
    font-size: 16px;
  }

  .el-button--text {
    color: #606266;
  }

  .step-content {
    min-height: calc(~'100% - 200px');
    margin: 30px 8% 20px;
  }

  .footer {
    margin: 40px 8% 0 0;
    text-align: right;
  }
}
</style>
