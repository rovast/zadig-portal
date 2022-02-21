<template>
  <section class="zadig-build-container">
    <section class="common-parcel-block" :class="{ 'show-source': jenkinsEnabled }">
      <div class="section">
        <el-form
          ref="zadigForm"
          :model="buildConfig"
          :rules="createRules"
          label-position="left"
          class="primary-form"
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
          <BuildEnv ref="buildEnvRef" :buildConfig="buildConfig" :isCreate="isCreate" :mini="mini"></BuildEnv>
        </el-form>
      </div>
      <div class="section">
        <RepoSelect :config="buildConfig" :validObj="validObj" class="build-secondary-form" showFirstLine></RepoSelect>
      </div>
      <section>
        <div class="primary-title not-first-child">构建变量</div>
        <EnvVariable :preEnvs="buildConfig.pre_build" :validObj="validObj"></EnvVariable>
        <div class="primary-title not-first-child">通用构建脚本</div>
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
        class="common-parcel-block"
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

import BuildEnv from './buildEnv.vue'
import EnvVariable from './envVariable.vue'
import AdvancedConfig from './advancedConfig.vue'
import OtherSteps from './otherSteps.vue'

import ValidateSubmit from '@utils/validateAsync'

import {
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
    jenkinsEnabled: Boolean,
    isCreate: Boolean
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
          image_from: '',
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

      this.$refs.buildEnvRef.initData()

      // Automatic selection of local clusters
      this.$refs.advancedConfigRef.initAdvancedConfig(this.buildConfig)
    }
  },
  created () {
    this.loadPage()
  },
  components: {
    Editor,
    Resize,
    BuildEnv,
    EnvVariable,
    AdvancedConfig,
    OtherSteps
  }
}
</script>

<style lang="less" scoped>
@import url('~@assets/css/common/scroll-bar.less');

@labelWeight: 300;
@secondaryColor: #8a8a8a;
@formItemBottom: 8px;

.zadig-build-container {
  .common-parcel-block {
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
