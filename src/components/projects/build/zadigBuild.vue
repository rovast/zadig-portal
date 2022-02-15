<template>
  <section class="zadig-build-container">
    <section class="build-block" :class="{ 'show-source': jenkinsEnabled }">
      <div class="section">
        <el-form
          ref="zadigForm"
          :model="buildConfig"
          :rules="createRules"
          label-position="left"
          class="build-form"
          label-width="120px"
          inline-message
        >
          <el-form-item label="构建名称" prop="name">
            <el-input v-model="buildConfig.name" placeholder="构建名称" autofocus size="small" :disabled="!isCreate" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="服务选择">
            <el-select v-model="buildConfig.targets" multiple size="small" value-key="key" filterable>
              <el-option
                v-for="(service,index) in serviceTargets"
                :key="index"
                :label="`${service.service_module}(${service.service_name})`"
                :value="service"
              ></el-option>
            </el-select>
          </el-form-item>
          <section>
            <div class="label-title">构建环境</div>
            <el-form-item label="操作系统" prop="pre_build.image_id" class="secondary-label">
              <el-select size="small" v-model="buildConfig.pre_build.image_id" placeholder="请选择" @change="changeImage('id', $event)">
                <el-option v-for="(sys,index) in systems" :key="index" :label="sys.label" :value="sys.id">
                  <span>
                    {{sys.label}}
                    <el-tag v-if="sys.image_from==='custom'" type="info" size="mini" effect="light">自定义</el-tag>
                  </span>
                </el-option>
                <el-option value="NEWCUSTOM">
                  <router-link to="/v1/system/imgs" style="color: #606266;">新建自定义构建镜像</router-link>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-if="buildConfig.pre_build.installs.length===0" label="依赖的软件包" class="secondary-label">
              <el-button @click="addFirstApp()" type="primary" size="mini" plain>新增</el-button>
            </el-form-item>
            <el-form-item
              v-else
              v-for="(app,appIndex) in buildConfig.pre_build.installs"
              :key="appIndex"
              :prop="`pre_build.installs.${appIndex}.name`"
              :rules="{required: false, message: '不能为空', trigger: 'blur'}"
              :label="appIndex === 0 ? `依赖的软件包` : ''"
              class="secondary-label"
            >
              <el-select v-model="buildConfig.pre_build.installs[appIndex]" placeholder="请选择" size="small" value-key="id" filterable>
                <el-option
                  v-for="(app, index) in allApps"
                  :key="index"
                  :label="`${app.name} ${app.version} `"
                  :value="{'name':app.name,'version':app.version,'id':app.name+app.version}"
                ></el-option>
              </el-select>
              <span :class="mini?'':'app-operation'">
                <el-button v-if="buildConfig.pre_build.installs.length >= 1" @click="deleteApp(appIndex)" type="danger" size="mini" plain>删除</el-button>
                <el-button
                  v-if="appIndex===buildConfig.pre_build.installs.length-1"
                  @click="addApp(appIndex)"
                  type="primary"
                  size="mini"
                  plain
                >新增</el-button>
              </span>
            </el-form-item>
          </section>
        </el-form>
      </div>
      <div class="section">
        <repo-select :config="buildConfig" :validObj="validObj" class="build-secondary-form" showFirstLine></repo-select>
      </div>
      <section>
        <div class="label-title">构建变量</div>
        <EnvVariable :preEnvs="buildConfig.pre_build" :validObj="validObj"></EnvVariable>
        <div class="label-title">通用构建脚本</div>
        <div class="deploy-script">
          <Resize :resize="'both'">
            <Editor v-model="buildConfig.scripts"></Editor>
          </Resize>
        </div>
      </section>
    </section>
    <section>
      <div style="margin-bottom: 8px;">
        <el-button type="primary" size="small" plain @click="showAdvancedConfig = !showAdvancedConfig">
          高级配置
          <i :class="[showAdvancedConfig ? 'el-icon-arrow-up' : 'el-icon-arrow-down']" style="margin-left: 8px;"></i>
        </el-button>
      </div>
      <AdvancedConfig
        ref="advancedConfigRef"
        v-show="showAdvancedConfig"
        class="build-block"
        :isCreate="isCreate"
        :buildConfig="buildConfig"
        :validObj="validObj"
        @validateFailed="showAdvancedConfig = true"
      ></AdvancedConfig>
    </section>
    <section>
      <OtherSteps ref="otherStepsRef" :buildConfig="buildConfig" :validObj="validObj"></OtherSteps>
    </section>
  </section>
</template>

<script>
import Editor from 'vue2-ace-bind'
import Resize from '@/components/common/resize.vue'

import EnvVariable from '@/components/projects/build/envVariable.vue'
import AdvancedConfig from './advancedConfig.vue'
import OtherSteps from './otherSteps.vue'

import ValidateSubmit from '@utils/validateAsync'

import {
  getImgListAPI,
  getAllAppsAPI,
  getBuildConfigDetailAPI,
  getCodeSourceMaskedAPI,
  getServiceTargetsAPI
} from '@api'

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
  props: {
    mini: {
      default: false,
      type: Boolean
    },
    jenkinsEnabled: Boolean
  },
  data () {
    return {
      createRules: {
        name: [
          {
            type: 'string',
            required: true,
            validator: validateBuildConfigName,
            trigger: 'blur'
          }
        ],
        'pre_build.image_id': {
          type: 'string',
          required: true,
          message: '请选择操作系统',
          trigger: 'blur'
        }
      },
      validObj: new ValidateSubmit(),
      allApps: [],
      systems: [],
      showAdvancedConfig: false,
      allCodeHosts: [],
      configDataLoading: true,
      serviceTargets: [],
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
      }
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
  methods: {
    async validate () {
      const valid = []
      const res = await this.validObj.validateAll()
      if (!res[1]) {
        valid.push(Promise.reject())
      }
      valid.push(this.$refs.zadigForm.validate())
      return Promise.all(valid).then(() => {
        const payload = this.$utils.cloneObj(this.buildConfig)
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
        return payload
      })
    },
    changeImage (key, value) {
      const imageSys = this.systems.find(item => {
        return item[key] === value
      })
      if (imageSys) {
        this.buildConfig.pre_build.image_id = imageSys.id
        this.buildConfig.pre_build.image_from = imageSys.image_from
        this.buildConfig.pre_build.build_os = imageSys.value
      }
    },
    addFirstApp () {
      this.buildConfig.pre_build.installs.push({
        name: '',
        version: '',
        id: ''
      })
    },
    addApp () {
      this.buildConfig.pre_build.installs.push({
        name: '',
        version: '',
        id: ''
      })
    },
    deleteApp (index) {
      this.buildConfig.pre_build.installs.splice(index, 1)
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
          if (buildConfig.source === 'jenkins') {
            this.$emit('jenkinsBuild', buildConfig)
          }
          if (!buildConfig.timeout) {
            this.$set(buildConfig, 'timeout', 60)
          }
          this.$refs.otherStepsRef.initStepStatus(buildConfig)
          this.buildConfig = buildConfig
          this.serviceTargets = [
            ...serviceTagets,
            ...this.buildConfig.targets
          ].map(element => {
            element.key = element.service_name + '/' + element.service_module
            return element
          })
        }
      } else {
        await getServiceTargetsAPI(projectName).then(response => {
          this.serviceTargets = [...response, ...this.buildConfig.targets].map(
            element => {
              element.key = element.service_name + '/' + element.service_module
              return element
            }
          )
        })
      }
      this.configDataLoading = false
      this.$emit('getServiceTargets', this.serviceTargets)
      // be used on Repo
      getCodeSourceMaskedAPI().then(response => {
        this.allCodeHosts = response
      })
      // be used on Operating System
      getImgListAPI().then(res => {
        this.systems = res
        this.initOperatingSystem()
      })
      // be used on Dependent Packages
      getAllAppsAPI().then(res => {
        const apps = this.$utils.sortVersion(res, 'name', 'asc')
        this.allApps = apps.map(app => {
          return {
            name: app.name,
            version: app.version,
            id: app.name + app.version
          }
        })
      })
      // Automatic selection of local clusters
      this.$refs.advancedConfigRef.initAdvancedConfig(this.buildConfig)
    },
    initOperatingSystem () {
      if (this.isCreate) {
        this.changeImage('value', 'focal') // default use 20.04
      } else {
        const key = this.buildConfig.pre_build.image_id
          ? 'id'
          : this.buildConfig.pre_build.build_os
            ? 'value'
            : ''
        const value =
          this.buildConfig.pre_build.image_id ||
          this.buildConfig.pre_build.build_os
        if (key) {
          this.changeImage(key, value)
        }
      }
    }
  },
  created () {
    this.loadPage()
  },
  components: {
    Editor,
    Resize,
    EnvVariable,
    AdvancedConfig,
    OtherSteps
  }
}
</script>

<style lang="less" scoped>
@import url('~@assets/css/common/scroll-bar.less');

@itemWidth: 400px;
@labelColor: #000;
@labelWeight: 300;
@secondaryColor: #8a8a8a;
@formItemBottom: 8px;

.zadig-build-container {
  .build-block {
    box-sizing: border-box;
    margin-bottom: 16px;
    padding: 16px 40px;
    background-color: #fff;
    border-radius: 6px;

    &.show-source {
      padding-top: 0;
      border-start-start-radius: 0;
      border-start-end-radius: 0;
    }

    .deploy-script {
      .ace_editor.ace-xcode {
        &:hover {
          .scrollBar();
        }
      }
    }
  }

  /deep/.el-form-item.secondary-label {
    .el-form-item__label {
      color: @secondaryColor;
    }
  }

  .label-title {
    margin: 24px 0 14px;
    color: @labelColor;
    font-weight: @labelWeight;
    font-size: 14px;
    line-height: 22px;
  }

  /deep/.el-form.build-secondary-form {
    .el-form-item {
      margin-bottom: @formItemBottom;
    }

    .el-form-item__label {
      color: @secondaryColor;
      font-weight: @labelWeight;
    }
  }
}
</style>
