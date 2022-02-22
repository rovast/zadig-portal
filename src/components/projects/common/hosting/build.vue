<template>
  <div class="build-config-container">
    <div v-if="jenkinsEnabled" class="build-source">
      <span class="build-source-title">构建方式</span>
      <el-select v-model="source" size="small" value-key="key" :disabled="isEdit" filterable>
        <el-option v-for="(item,index) in originOptions" :key="index" :label="item.label" :value="item.value"></el-option>
      </el-select>
    </div>
    <JenkinsBuild
      v-if="jenkinsEnabled"
      v-show="source === 'jenkins'"
      ref="jenkinsBuildRef"
      :jenkinsBuildData="jenkinsBuild"
      :isCreate="!isEdit"
      :serviceTargets="serviceTargets"
    ></JenkinsBuild>
    <ZadigBuild
      v-show="source === 'zadig'"
      ref="zadigBuildRef"
      :isCreate="!isEdit"
      :jenkinsEnabled="jenkinsEnabled"
      :buildConfigData="buildConfig"
      :serviceTargets="serviceTargets"
    ></ZadigBuild>
  </div>
</template>
<script>
import ZadigBuild from '@/components/projects/build/zadigBuild.vue'
import JenkinsBuild from '@/components/projects/build/jenkinsBuild.vue'
import {
  createBuildConfigAPI,
  updateBuildConfigAPI,
  checkJenkinsConfigExistsAPI,
  getBuildConfigDetailAPI,
  getServiceTargetsAPI
} from '@api'

export default {
  props: {
    name: String,
    buildName: String,
    isEdit: Boolean,
    handlerSubmit: Function
  },
  data () {
    return {
      source: 'zadig',
      originOptions: [
        {
          value: 'zadig',
          label: 'Zadig 构建'
        },
        {
          value: 'jenkins',
          label: 'Jenkins 构建'
        }
      ],
      jenkinsEnabled: false,
      jenkinsBuild: {},
      serviceTargets: [],
      saveLoading: false,
      configDataLoading: true,
      buildConfig: {}
    }
  },
  methods: {
    async updateBuildConfig () {
      const reqAPI = this.isEdit ? updateBuildConfigAPI : createBuildConfigAPI
      const formName =
        this.source === 'zadig' ? 'zadigBuildRef' : 'jenkinsBuildRef'
      this.$refs[formName]
        .validate()
        .then(data => {
          console.log('yeah, success!', data)
          const payload = data
          payload.source = this.source
          payload.product_name = this.projectName
          this.saveLoading = true
          reqAPI(payload).then(() => {
            this.saveLoading = false
            this.$message({
              type: 'success',
              message: this.isEdit ? '保存成功' : '新建构建配置成功'
            })
          })
        })
        .catch(err => {
          console.log('傻了吧', err)
        })
    },
    async checkJenkinsEnabled () {
      this.jenkinsEnabled = (
        await checkJenkinsConfigExistsAPI().catch(error => console.log(error))
      ).exists
    },
    async loadPage () {
      this.buildConfig = {}
      this.jenkinsBuild = {}
      this.configDataLoading = true
      const projectName = this.projectName
      this.$set(
        this.buildConfig,
        'name',
        this.projectName + '-build-' + this.name
      )
      this.$set(
        this.jenkinsBuild,
        'name',
        this.projectName + '-build-' + this.name
      )
      const response = await getServiceTargetsAPI(projectName).catch(error =>
        console.log(error)
      )
      if (response) {
        this.serviceTargets = response.map(element => {
          element.key = element.service_name + '/' + element.service_module
          return element
        })
      }
      if (this.isEdit) {
        const buildConfig = await getBuildConfigDetailAPI(
          this.buildName,
          this.projectName
        ).catch(error => console.log(error))
        if (buildConfig) {
          buildConfig.pre_build.installs.forEach(element => {
            element.id = element.name + element.version
          })

          this.buildConfig = buildConfig

          if (this.buildConfig.source === 'jenkins') {
            this.source = 'jenkins'
            this.jenkinsBuild = buildConfig
          }

          const targets = this.buildConfig.targets.map(t => {
            t.key = t.service_name + '/' + t.service_module
            return t
          })
          this.buildConfig.targets = targets
          this.jenkinsBuild.targets = targets

          this.serviceTargets = [
            ...this.serviceTargets,
            ...this.buildConfig.targets
          ].map(element => {
            element.key = element.service_name + '/' + element.service_module
            return element
          })
        }
        this.$refs.zadigBuildRef.initData(this.buildConfig)
      } else {
        const item = this.serviceTargets.find(
          item => item.service_module === this.name
        )
        const target = item ? [item] : []
        this.$set(this.buildConfig, 'targets', target)
        this.$set(this.jenkinsBuild, 'targets', target)
        this.$refs.zadigBuildRef.initData()
      }

      this.configDataLoading = false
    }
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    }
  },
  watch: {
    name: {
      handler (val) {
        if (val) {
          this.loadPage()
        }
      },
      immediate: true
    }
  },
  created () {
    this.checkJenkinsEnabled()
  },
  components: {
    JenkinsBuild,
    ZadigBuild
  }
}
</script>
<style lang="less" scoped>
@inputWidth: 400px;
@labelColor: #000;
@labelWeight: 300;
@formItemBottom: 8px;

.build-config-container {
  position: relative;
  flex: 1;
  box-sizing: border-box;
  height: 100%;
  max-height: 100%;
  overflow: auto;
  background-color: @globalBackgroundColor;

  .build-source {
    padding: 16px 40px @formItemBottom;
    white-space: nowrap;
    background-color: #fff;
    border-start-start-radius: 6px;
    border-start-end-radius: 6px;

    .build-source-title {
      display: inline-block;
      width: 116px;
      color: @labelColor;
      font-weight: @labelWeight;
      font-size: 14px;
    }

    /deep/.el-select {
      width: @inputWidth;
      max-width: calc(~'100% - 130px');
    }
  }
}
</style>
