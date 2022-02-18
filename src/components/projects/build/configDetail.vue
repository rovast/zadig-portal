<template>
  <div class="build-config-container">
    <div v-if="jenkinsEnabled" class="build-source">
      <span class="build-source-title">构建方式</span>
      <el-select v-model="source" size="small" value-key="key" :disabled="!isCreate" filterable>
        <el-option v-for="(item,index) in originOptions" :key="index" :label="item.label" :value="item.value"></el-option>
      </el-select>
    </div>
    <JenkinsBuild
      v-if="jenkinsEnabled"
      v-show="source === 'jenkins'"
      ref="jenkinsBuildRef"
      :jenkinsBuildData="jenkinsBuild"
      :isCreate="isCreate"
      :serviceTargets="serviceTargets"
    ></JenkinsBuild>
    <ZadigBuild
      v-show="source === 'zadig'"
      ref="zadigBuildForm"
      :isCreate="isCreate"
      :jenkinsEnabled="jenkinsEnabled"
      @jenkinsBuild="changeToJenkins"
      @getServiceTargets="serviceTargets = $event"
    ></ZadigBuild>
    <footer class="create-footer">
      <router-link :to="`/v1/projects/detail/${this.projectName}/builds`">
        <el-button style="margin-right: 15px;" type="primary" plain>取消</el-button>
      </router-link>
      <el-button @click="handleBuildConfig(isCreate)" :loading="saveLoading" type="primary">保存</el-button>
    </footer>
  </div>
</template>
<script>
import bus from '@utils/eventBus'

import ZadigBuild from './zadigBuild.vue'
import JenkinsBuild from './jenkinsBuild.vue'
import {
  createBuildConfigAPI,
  updateBuildConfigAPI,
  checkJenkinsConfigExistsAPI
} from '@api'

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
      jenkinsBuild: null,
      serviceTargets: [],
      saveLoading: false
    }
  },
  methods: {
    changeToJenkins (data) {
      this.source = 'jenkins'
      this.jenkinsBuild = data
    },
    async handleBuildConfig (isCreate) {
      const reqAPI = isCreate ? createBuildConfigAPI : updateBuildConfigAPI
      const formName =
        this.source === 'zadig' ? 'zadigBuildForm' : 'jenkinsBuildRef'
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
            this.$router.push(`/v1/projects/detail/${this.projectName}/builds`)
            this.$message({
              type: 'success',
              message: isCreate ? '新建构建配置成功' : '保存成功'
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
    }
  },
  computed: {
    buildConfigName () {
      return this.$route.params.build_name
    },
    projectName () {
      return this.$route.params.project_name
    },
    isCreate () {
      return (
        this.$route.path ===
        `/v1/projects/detail/${this.projectName}/builds/create`
      )
    }
  },
  created () {
    this.checkJenkinsEnabled()
    bus.$emit('set-topbar-title', {
      title: '',
      breadcrumb: [
        { title: '项目', url: '/v1/projects' },
        {
          title: this.projectName,
          url: `/v1/projects/detail/${this.projectName}/detail`
        },
        {
          title: '构建',
          url: `/v1/projects/detail/${this.projectName}/builds`
        },
        { title: this.isCreate ? '新建' : this.buildConfigName, url: '' }
      ]
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
  height: calc(~'100% - 60px');
  max-height: calc(~'100% - 60px');
  padding: 16px 40px 60px;
  overflow: auto;
  background-color: @backgroundColor;

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
    }
  }

  .create-footer {
    position: fixed;
    right: calc(~'50% - 200px');
    bottom: 0;
    z-index: 1;
    padding: 10px 10px 10px 10px;
    background-color: transparent;
  }
}
</style>
