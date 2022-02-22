<template>
  <div class="build-config-container">
    <div v-if="jenkinsEnabled" class="build-source" :class="{'small-padding': mini}">
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
      :mini="mini"
    ></JenkinsBuild>
    <ZadigBuild
      v-show="source === 'zadig'"
      ref="zadigBuildForm"
      :isCreate="!isEdit"
      :jenkinsEnabled="jenkinsEnabled"
      :buildConfigData="buildConfig"
      :serviceTargets="serviceTargets"
      :mini="mini"
    >
      <template v-slot:buildName>
        <el-form-item label="构建名称" prop="name">
          <el-select
            style="width: 100%;"
            v-model="buildConfig.name"
            placeholder="构建名称"
            :disabled="isEdit"
            size="small"
            @change="loadBuild"
            allow-create
            filterable
            clearable
          >
            <el-option v-for="item in buildNames" :key="item" :label="item" :value="item"></el-option>
            <el-option v-if="!buildNames.includes(defaultBuildName)" :label="defaultBuildName" :value="defaultBuildName"></el-option>
          </el-select>
        </el-form-item>
      </template>
    </ZadigBuild>
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
  getServiceTargetsAPI,
  getBuildConfigsAPI
} from '@api'

import qs from 'qs'

export default {
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
      configDataLoading: true,
      buildConfig: {},
      buildInfos: [],
      mini: true
    }
  },
  methods: {
    async handleBuildConfig () {
      const isAdd = this.buildNames.includes(this.buildConfig.name)
      const reqAPI = isAdd ? updateBuildConfigAPI : createBuildConfigAPI
      const formName =
        this.source === 'zadig' ? 'zadigBuildForm' : 'jenkinsBuildRef'
      this.$refs[formName]
        .validate()
        .then(data => {
          console.log('yeah, success!', data)
          const payload = data
          payload.source = this.source
          payload.product_name = this.projectName
          reqAPI(payload).then(() => {
            this.$emit('getServiceModules')
            this.$router.replace({
              query: Object.assign(
                {},
                qs.parse(window.location.search, { ignoreQueryPrefix: true }),
                {
                  rightbar: 'var'
                }
              )
            })
            this.$message({
              type: 'success',
              message: this.isEdit ? '保存构建成功' : '新建构建成功'
            })
          })
        })
        .catch(err => {
          console.log('傻了吧', err)
        })
    },
    async loadBuild (buildConfigName) {
      this.buildConfig = {}
      this.jenkinsBuild = {}

      this.configDataLoading = true
      await getServiceTargetsAPI(this.projectName).then(response => {
        this.serviceTargets = response.map(element => {
          element.key = element.service_name + '/' + element.service_module
          return element
        })
      })

      if (this.buildNames.includes(buildConfigName)) {
        await this.getCurrentBuild(buildConfigName)
      } else {
        await this.initBuildInfo()
      }

      if (!this.buildConfig.name && !this.jenkinsBuild.name) {
        this.$set(this.buildConfig, 'name', this.defaultBuildName)
        this.$set(this.jenkinsBuild, 'name', this.defaultBuildName)
      }
      this.configDataLoading = false
    },
    async getCurrentBuild (buildConfigName) {
      const buildConfig = await getBuildConfigDetailAPI(
        buildConfigName,
        this.projectName
      ).catch(error => console.log(error))
      if (buildConfig) {
        buildConfig.pre_build.installs.forEach(element => {
          element.id = element.name + element.version
        })
        buildConfig.targets.forEach(t => {
          t.key = t.service_name + '/' + t.service_module
        })
        if (buildConfig.source === 'jenkins') {
          this.source = 'jenkins'
          this.jenkinsBuild = buildConfig
        }
        if (!buildConfig.timeout) {
          this.$set(buildConfig, 'timeout', 60)
        }
        this.buildConfig = buildConfig

        this.serviceTargets = [
          ...this.serviceTargets,
          ...this.buildConfig.targets
        ]
        if (this.buildAdd) {
          const currentServices = [
            ...this.buildConfig.targets,
            ...this.serviceTargets.filter(element => {
              return element.service_module === this.buildServiceName
            })
          ]
          this.$set(this.buildConfig, 'targets', currentServices)
          this.$set(this.jenkinsBuild, 'targets', currentServices)
        }
      }
      this.$refs.zadigBuildForm.initData(this.buildConfig)
    },
    async initBuildInfo () {
      const currentService = this.serviceTargets.filter(element => {
        return element.service_module === this.buildServiceName
      })
      this.$set(this.buildConfig, 'targets', currentService)
      this.$set(this.jenkinsBuild, 'targets', currentService)

      this.$refs.zadigBuildForm.initData()
    },
    async initGlobalData () {
      // existed jenkins
      checkJenkinsConfigExistsAPI().then(res => {
        this.jenkinsEnabled = res.exists
      })

      // get all builds of the current project
      return await getBuildConfigsAPI(this.projectName).then(res => {
        this.buildInfos = res
      })
    }
  },
  computed: {
    buildConfigName () {
      return this.$route.query.build_name
    },
    buildAdd () {
      return !!this.$route.query.build_add
    },
    buildServiceName () {
      return this.$route.query.service_name
    },
    projectName () {
      return this.$route.params.project_name
    },
    isEdit () {
      return !!this.$route.query.build_name
    },
    buildNames () {
      return this.buildInfos.map(build => build.name)
    },
    buildServices () {
      const target = this.buildInfos.find(
        build => build.name === this.buildConfig.name
      )
      if (target) {
        return target.targets.map(tar => {
          this.$set(tar, 'key', `${tar.service_name}/${tar.service_module}`)
          return tar
        })
      } else {
        return []
      }
    },
    defaultBuildName () {
      return this.projectName + '-build-' + this.buildServiceName
    }
  },
  created () {
    this.initGlobalData().then(() => {
      this.loadBuild(this.buildConfigName)
    })
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
  margin-right: -3px;
  padding-top: 2px;
  overflow: auto;
  background-color: @globalBackgroundColor;

  .build-source {
    padding: 16px 40px @formItemBottom;
    white-space: nowrap;
    background-color: #fff;
    border-start-start-radius: 6px;
    border-start-end-radius: 6px;

    &.small-padding {
      padding: 10px 10px @formItemBottom;
    }

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
