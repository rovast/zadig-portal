<template>
  <section>
    <div class="section">
      <el-form
        ref="addConfigForm"
        :model="buildConfig"
        :rules="createRules"
        label-position="left"
        class="build-form"
        label-width="120px"
        inline-message
      >
        <el-form-item label="构建方式" prop="name">
          <el-input v-model="buildConfig.name" placeholder="构建方式" autofocus size="small" :disabled="!isCreate" auto-complete="off"></el-input>
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
          <el-form-item label="构建系统" required>
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
          <div v-if="buildConfig.pre_build.installs.length===0" :gutter="20">
            <el-form-item label="应用列表" style="width: 80px;">
              <el-button @click="addFirstApp()" type="primary" size="mini" plain>新增</el-button>
            </el-form-item>
          </div>
          <el-row v-for="(app,appIndex) in buildConfig.pre_build.installs" :key="appIndex" :gutter="20">
            <el-col :span="24">
              <el-form-item
                :prop="`pre_build.installs.${appIndex}.name`"
                :rules="{required: false, message: '应用名不能为空', trigger: 'blur'}"
                :label="appIndex === 0 ? `应用列表` : ''"
              >
                <el-select v-model="buildConfig.pre_build.installs[appIndex]" placeholder="请选择应用" size="small" value-key="id" filterable>
                  <el-option
                    v-for="(app, index) in allApps"
                    :key="index"
                    :label="`${app.name} ${app.version} `"
                    :value="{'name':app.name,'version':app.version,'id':app.name+app.version}"
                  ></el-option>
                </el-select>
                <span :class="mini?'':'app-operation'">
                  <el-button
                    v-if="buildConfig.pre_build.installs.length >= 1"
                    @click="deleteApp(appIndex)"
                    type="danger"
                    size="mini"
                    plain
                  >删除</el-button>
                  <el-button
                    v-if="appIndex===buildConfig.pre_build.installs.length-1"
                    @click="addApp(appIndex)"
                    type="primary"
                    size="mini"
                    plain
                  >新增</el-button>
                </span>
              </el-form-item>
            </el-col>
          </el-row>
        </section>
      </el-form>
    </div>
    <div class="section">
      <repo-select :config="buildConfig" :validObj="validObj" showFirstLine showDivider></repo-select>
    </div>
    <section>
      <div>构建变量</div>
      <EnvVariable :preEnvs="buildConfig.pre_build" :validObj="validObj"></EnvVariable>
      <div>通用构建脚本</div>
      <Resize :resize="'both'">
        <Editor v-model="buildConfig.scripts"></Editor>
      </Resize>
    </section>
    <section>
      <div>高级配置</div>
      <AdvancedConfig :buildConfig="buildConfig" :validObj="validObj"></AdvancedConfig>
    </section>
    <section>
      <OtherSteps :buildConfig="buildConfig" :validObj="validObj"></OtherSteps>
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

import { getImgListAPI, getAllAppsAPI } from '@api'

const validateBuildConfigName = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入构建方式'))
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
    buildConfig: Object,
    isCreate: Boolean,
    serviceTargets: Array,
    configDataLoading: Boolean,
    mini: {
      default: false,
      type: Boolean
    }
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
        ]
      },
      validObj: new ValidateSubmit(),
      allApps: [],
      systems: []
    }
  },
  methods: {
    getImgList () {
      return getImgListAPI().then(res => {
        this.systems = res
      })
    },
    getApps () {
      return getAllAppsAPI().then(res => {
        const apps = this.$utils.sortVersion(res, 'name', 'asc')
        this.allApps = apps.map(app => {
          return {
            name: app.name,
            version: app.version,
            id: app.name + app.version
          }
        })
      })
    },
    changeImage (key, value, index = -1) {
      let imageSys = null
      if (index !== -1) {
        imageSys = this.systems[index]
      } else {
        imageSys = this.systems.find(item => {
          return item[key] === value
        })
      }
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
    }
  },
  created () {
    this.getImgList()
    this.getApps()
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
