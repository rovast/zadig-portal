<template>
  <div>
    <div class="build-config-container">
      <el-drawer title="Dockerfile 模板预览" :visible.sync="showDockerfile" direction="rtl">
        <Codemirror
          v-model="dockerfileTemplate.content"
          :cmOption="{
        tabSize: 2,
        readOnly: true,
        theme: 'neo',
        mode: 'text/x-dockerfile',
        lineNumbers: false,
        line: true,
        showGutter: false,
        displayIndentGuides: false,
        showPrintMargin: false,
        collapseIdentical: true
      }"
          class="mirror"
        ></Codemirror>
      </el-drawer>
      <div v-if="jenkinsEnabled" class="build-source">
        <span class="label-title">构建来源</span>
        <el-select v-model="source" size="small" value-key="key" :disabled="!isCreate" filterable>
          <el-option v-for="(item,index) in originOptions" :key="index" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </div>
      <JenkinsBuild
        v-if="jenkinsEnabled"
        v-show="source === 'jenkins'"
        ref="jenkinsBuildRef"
        :jenkinsBuild="jenkinsBuild"
        :isCreate="isCreate"
        :serviceTargets="serviceTargets"
      ></JenkinsBuild>
      <ZadigBuild
        v-show="source === 'zadig'"
        ref="addConfigForm"
        :buildConfig="buildConfig"
        :isCreate="isCreate"
        :serviceTargets="serviceTargets"
        :configDataLoading="configDataLoading"
      ></ZadigBuild>
      <footer class="create-footer">
        <el-row>
          <el-col :span="12">
            <div class="grid-content">
              <div class="description">
                <el-tag type="primary">填写相关信息，然后点击保存</el-tag>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="grid-content button-container">
              <router-link :to="`/v1/projects/detail/${this.projectName}/builds`">
                <el-button style="margin-right: 15px;" class="btn-primary" type="primary">取消</el-button>
              </router-link>
              <el-button
                class="btn-primary"
                @click="isCreate ? createBuildConfig() : saveBuildConfig()"
                :loading="saveLoading"
                type="primary"
              >保存</el-button>
            </div>
          </el-col>
        </el-row>
      </footer>
    </div>
  </div>
</template>
<script>
import ZadigBuild from './zadigBuild.vue'
import JenkinsBuild from './jenkinsBuild.vue'
import BuildEnv from '@/components/projects/build/build_env.vue'
import {
  getBuildConfigDetailAPI,
  getDockerfileTemplatesAPI,
  getDockerfileAPI,
  getCodeSourceMaskedAPI,
  createBuildConfigAPI,
  updateBuildConfigAPI,
  getServiceTargetsAPI,
  checkJenkinsConfigExistsAPI
} from '@api'
import Editor from 'vue2-ace-bind'
import bus from '@utils/eventBus'
import Codemirror from '@/components/projects/common/codemirror.vue'
import Resize from '@/components/common/resize.vue'
import EnvVariable from '@/components/projects/build/env_variable.vue'
const validateBuildConfigName = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入构建名称'))
  } else {
    if (!/^[a-z0-9-]+$/.test(value)) {
      callback(new Error('名称只支持小写字母和数字，特殊字符只支持中划线'))
    } else {
      callback()
    }
  }
}
export default {
  data () {
    return {
      source: 'zadig',
      dockerfileTemplate: {},
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
      jenkinsBuild: {
        name: '',
        desc: '',
        targets: [],
        timeout: 60,
        jenkins_build: {
          job_name: '',
          jenkins_build_params: []
        },
        pre_build: {
          res_req: 'low'
        }
      },
      buildConfig: {
        name: '',
        desc: '',
        repos: [],
        timeout: 60,
        cache_enable: false,
        cache_dir_type: '',
        cache_user_dir: '',
        pre_build: {
          res_req: 'low', // high 、medium、low、min、define
          res_req_spec: {
            cpu_limit: 1000,
            memory_limit: 512
          },
          build_os: 'xenial',
          image_id: '',
          installs: [],
          envs: [],
          enable_proxy: false,
          enable_gocov: false,
          parameters: []
        },
        scripts: '#!/bin/bash\nset -e',
        post_build: {}
      },
      docker_enabled: false,
      binary_enabled: false,
      post_script_enabled: false,
      showDockerfile: false,
      serviceTargets: [],
      allCodeHosts: [],
      dockerfileTemplates: [],
      createRules: {
        name: [
          {
            type: 'string',
            required: true,
            validator: validateBuildConfigName,
            trigger: 'blur'
          }
        ]
      },

      saveLoading: false,
      configDataLoading: true
    }
  },
  methods: {
    async createBuildConfig () {
      let payload = null
      let formName = null
      if (this.source === 'zadig') {
        const res = await this.validObj.validateAll()
        if (!res[1]) {
          return
        }
        formName = 'addConfigForm'
        payload = this.$utils.cloneObj(this.buildConfig)
        payload.repos.forEach(repo => {
          this.allCodeHosts.forEach(codehost => {
            if (repo.codehost_id === codehost.id) {
              repo.source = codehost.type
            }
          })
        })
        if (
          payload.post_build &&
          payload.post_build.docker_build &&
          payload.post_build.docker_build.source
        ) {
          const docker_build = payload.post_build.docker_build
          if (docker_build.source === 'template' && docker_build.docker_file) {
            docker_build.docker_file = ''
          } else if (
            docker_build.source === 'local' &&
            docker_build.template_id
          ) {
            docker_build.template_id = ''
          }
        }
      } else {
        formName = 'jenkinsBuildRef'
        payload = this.$utils.cloneObj(this.jenkinsBuild)
        if (
          !this.jenkinsBuild.jenkins_build.jenkins_build_params.find(
            item => item.name === 'IMAGE'
          )
        ) {
          this.$message.error(
            'Jenkins Build Parameters 中必须存在“IMAGE”变量，作为构建镜像的名称，Jenkins 成功构建镜像后，部署阶段会使用该镜像更新服务'
          )
          return
        }
      }
      payload.source = this.source
      payload.product_name = this.projectName
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.saveLoading = true
          createBuildConfigAPI(payload).then(() => {
            this.saveLoading = false
            this.$router.push(`/v1/projects/detail/${this.projectName}/builds`)
            this.$message({
              type: 'success',
              message: '新建构建配置成功'
            })
          })
        } else {
          return false
        }
      })
    },
    async saveBuildConfig () {
      let payload = null
      if (this.source === 'zadig') {
        const res = await this.validObj.validateAll()
        if (!res[1]) {
          return
        }
        payload = this.$utils.cloneObj(this.buildConfig)
        payload.repos.forEach(repo => {
          this.allCodeHosts.forEach(codehost => {
            if (repo.codehost_id === codehost.id) {
              repo.source = codehost.type
            }
          })
        })
        if (
          payload.post_build &&
          payload.post_build.docker_build &&
          payload.post_build.docker_build.source
        ) {
          const docker_build = payload.post_build.docker_build
          if (docker_build.source === 'template' && docker_build.docker_file) {
            docker_build.docker_file = ''
          } else if (
            docker_build.source === 'local' &&
            docker_build.template_id
          ) {
            docker_build.template_id = ''
          }
        }
      } else {
        payload = this.$utils.cloneObj(this.jenkinsBuild)
        if (
          !this.jenkinsBuild.jenkins_build.jenkins_build_params.find(
            item => item.name === 'IMAGE'
          )
        ) {
          this.$message.error(
            'Jenkins Build Parameters 中必须存在“IMAGE”变量，作为构建镜像的名称，Jenkins 成功构建镜像后，部署阶段会使用该镜像更新服务'
          )
          return
        }
      }
      this.saveLoading = true
      payload.source = this.source
      payload.productName = this.projectName
      updateBuildConfigAPI(payload).then(response => {
        this.saveLoading = false
        this.$router.push(`/v1/projects/detail/${this.projectName}/builds`)
        this.$message({
          message: '保存成功',
          type: 'success'
        })
      })
    },
    async getDockerfileTemplate (id) {
      const res = await getDockerfileAPI(id).catch(err => {
        console.log(err)
      })
      if (res) {
        this.dockerfileTemplate = res
      }
    },
    async loadPage () {
      this.configDataLoading = true
      const projectName = this.projectName
      if (!this.isCreate) {
        const buildConfig = await getBuildConfigDetailAPI(
          this.buildConfigName,
          this.projectName
        ).catch(error => console.log(error))
        const serviceTagets = await getServiceTargetsAPI(
          projectName
        ).catch(error => console.log(error))
        if (buildConfig && serviceTagets) {
          buildConfig.pre_build.installs.forEach(element => {
            element.id = element.name + element.version
          })
          buildConfig.targets.forEach(t => {
            t.key = t.service_name + '/' + t.service_module
          })
          this.buildConfig = buildConfig
          this.serviceTargets = [
            ...serviceTagets,
            ...this.buildConfig.targets
          ].map(element => {
            element.key = element.service_name + '/' + element.service_module
            return element
          })
          if (this.buildConfig.source) {
            this.source = this.buildConfig.source
            if (this.source === 'jenkins') {
              this.jenkinsBuild = buildConfig
            }
          }
          if (!this.buildConfig.timeout) {
            this.$set(this.buildConfig, 'timeout', 60)
          }
          if (this.buildConfig.post_build.docker_build) {
            this.docker_enabled = true
            if (this.buildConfig.post_build.docker_build.template_id) {
              this.getDockerfileTemplate(
                this.buildConfig.post_build.docker_build.template_id
              )
            }
          }
          if (this.buildConfig.post_build.file_archive) {
            this.binary_enabled = true
          }
          if (this.buildConfig.post_build.scripts) {
            this.post_script_enabled = true
          }
        }
      } else {
        getServiceTargetsAPI(projectName).then(response => {
          this.serviceTargets = [...response, ...this.buildConfig.targets].map(
            element => {
              element.key = element.service_name + '/' + element.service_module
              return element
            }
          )
        })
      }
      this.jenkinsEnabled = (
        await checkJenkinsConfigExistsAPI().catch(error => console.log(error))
      ).exists
      this.configDataLoading = false
      getDockerfileTemplatesAPI().then(res => {
        this.dockerfileTemplates = res.dockerfile_template
      })
      getCodeSourceMaskedAPI().then(response => {
        this.allCodeHosts = response
      })
      getServiceTargetsAPI(projectName).then(response => {
        this.serviceTargets = [...response, ...this.buildConfig.targets].map(
          element => {
            element.key = element.service_name + '/' + element.service_module
            return element
          }
        )
      })
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
    this.loadPage()
    if (this.isCreate) {
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
          { title: '新建', url: '' }
        ]
      })
    } else {
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
          { title: this.buildConfigName, url: '' }
        ]
      })
    }
  },
  components: {
    Editor,
    Resize,
    Codemirror,
    BuildEnv,
    EnvVariable,
    JenkinsBuild,
    ZadigBuild
  }
}
</script>
<style lang="less" scoped>
@import url('~@assets/css/common/scroll-bar.less');

@inputWidth: 400px;
@labelColor: #000;
@labelWeight: 300;
@formItemBottom: 8px;

.dashed-container {
  width: calc(~'100% - 120px');
}

.deploy-script {
  width: calc(~'100% - 120px');
  margin-top: 10px;
  margin-bottom: 10px;

  .ace_editor.ace-xcode {
    &:hover {
      .scrollBar();
    }
  }
}

.create-footer {
  position: fixed;
  right: 130px;
  bottom: 0;
  z-index: 5;
  box-sizing: border-box;
  width: 400px;
  padding: 10px 10px 10px 10px;
  text-align: left;
  background-color: transparent;
  border-radius: 4px;

  .btn-primary {
    color: @themeColor;
    background-color: rgba(25, 137, 250, 0.04);
    border-color: rgba(25, 137, 250, 0.4);

    &:hover {
      color: #fff;
      background-color: @themeColor;
      border-color: @themeColor;
    }
  }

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

    &.button-container {
      float: right;
    }
  }
}

.build-config-container {
  position: relative;
  flex: 1;
  box-sizing: border-box;
  max-height: 100%;
  padding: 15px 40px;
  overflow: auto;

  .build-source {
    margin-bottom: @formItemBottom;

    .label-title {
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

  .radio-group {
    margin: -8px 0 0 10px;

    .el-radio {
      padding: 5px 0;
      font-weight: 400;

      .el-input {
        margin-left: 8px;
      }
    }
  }

  .form-container {
    .el-form-item {
      margin-bottom: 0;
      padding-bottom: 15px;
    }
  }

  /deep/.el-form.build-form {
    .el-form-item {
      margin-bottom: @formItemBottom;
    }

    .el-form-item__label {
      color: @labelColor;
      font-weight: @labelWeight;
    }

    .el-input,
    .el-select {
      width: @inputWidth;

      .el-input {
        width: 100%;
      }
    }

    .el-input-number.el-input-number--mini {
      .el-input {
        width: 100%;
      }
    }
  }

  .divider {
    width: calc(~'100% - 120px');
    height: 1px;
    margin: 5px 0 15px 0;
    background-color: #dfe0e6;

    &.item {
      width: 30%;
    }
  }

  .breadcrumb {
    .el-breadcrumb {
      font-size: 16px;
      line-height: 1.35;

      .el-breadcrumb__item__inner a:hover,
      .el-breadcrumb__item__inner:hover {
        color: @themeColor;
        cursor: pointer;
      }
    }
  }

  .registry-alert {
    margin-bottom: 10px;
  }

  .dockerfile-args-container {
    line-height: 1;

    span {
      color: #606266;
      font-size: 14px;
    }
  }

  .section {
    margin-bottom: 15px;

    .input-width-middle {
      .el-form-item__content {
        margin-right: 200px;
      }
    }
  }

  .el-form {
    .item-title {
      font-size: 15px;
    }

    .item-desc {
      color: #606266;
      font-size: 14px;
    }

    .variable {
      color: #409eff;
      font-size: 13px;
    }
  }

  .operation-container {
    margin: 20px 0;

    .text {
      margin-right: 25px;
      color: #8d9199;
    }
  }
}
</style>
