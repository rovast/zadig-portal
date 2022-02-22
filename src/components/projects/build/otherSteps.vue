<template>
  <section class="other-step-container">
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
    <div style="margin: 14px 0 8px;">
      <el-dropdown @command="addExtra">
        <el-button type="primary" size="small" plain>
          添加步骤
          <i style="margin-left: 8px;" class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="docker" :disabled="docker_enabled">镜像构建</el-dropdown-item>
          <el-dropdown-item command="binary" :disabled="binary_enabled">二进制包存储</el-dropdown-item>
          <el-dropdown-item command="script" v-if="!usedToHost" :disabled="post_script_enabled">Shell 脚本执行</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <div class="common-parcel-block" v-if="docker_enabled || binary_enabled || post_script_enabled">
      <el-form
        v-if="docker_enabled && buildConfig.post_build.docker_build"
        :model="buildConfig.post_build.docker_build"
        :rules="docker_rules"
        ref="dockerBuildRef"
        label-width="170px"
        class="secondary-form"
        label-position="left"
      >
        <div class="dashed-container">
          <span class="primary-title">
            镜像构建
            <el-button type="text" @click="removeDocker" icon="el-icon-delete"></el-button>
          </span>
          <div v-if="!usedToHost && allRegistry.length === 0" class="registry-alert">
            <el-alert title="私有镜像仓库未集成，请前往系统设置 -> Registry 管理  进行集成。" type="warning"></el-alert>
          </div>
          <el-form-item label="构建上下文目录" prop="work_dir">
            <el-input v-model="buildConfig.post_build.docker_build.work_dir" size="small">
              <template slot="prepend">$WORKSPACE/</template>
            </el-input>
          </el-form-item>
          <el-form-item label="Dockerfile 来源" prop="source">
            <el-select size="small" v-model="buildConfig.post_build.docker_build.source" placeholder="请选择">
              <el-option label="代码仓库" value="local"></el-option>
              <el-option label="模板库" value="template"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="buildConfig.post_build.docker_build.source === 'local'" label="Dockerfile 的绝对路径" prop="docker_file">
            <el-input v-model="buildConfig.post_build.docker_build.docker_file" size="small">
              <template slot="prepend">$WORKSPACE/</template>
            </el-input>
          </el-form-item>
          <el-form-item v-if="buildConfig.post_build.docker_build.source === 'template'" label="模板选择" prop="template_name">
            <el-select
              style="width: 90%;"
              size="small"
              filterable
              @change="getDockerfileTemplate"
              v-model="buildConfig.post_build.docker_build.template_id"
              placeholder="请选择"
            >
              <el-option v-for="(template,index) in dockerfileTemplates" :key="index" :label="template.name" :value="template.id"></el-option>
            </el-select>
            <template>
              <el-button
                :disabled="!buildConfig.post_build.docker_build.template_id"
                style="margin-left: 5px;"
                type="text"
                @click="showDockerfile = true"
              >预览</el-button>
              <div v-if="dockerfileTemplate.variable && dockerfileTemplate.variable.length > 0" class="dockerfile-args-container">
                <span>ARG</span>
                <span v-for="(item,index) in dockerfileTemplate.variable" :key="index">
                  <span v-if="item.value">{{`${item.key}=${item.value} `}}</span>
                  <span v-else>{{`${item.key} `}}</span>
                </span>
              </div>
            </template>
          </el-form-item>
          <el-form-item label="构建参数">
            <el-tooltip effect="dark" content="支持所有 Docker Build 参数" placement="top-start">
              <el-input v-model="buildConfig.post_build.docker_build.build_args" size="small" placeholder="--build-arg key=value"></el-input>
            </el-tooltip>
          </el-form-item>
        </div>
      </el-form>
      <el-form
        v-if="binary_enabled && buildConfig.post_build.file_archive"
        :model="buildConfig.post_build.file_archive"
        :rules="file_archive_rules"
        ref="fileArchiveRef"
        label-width="170px"
        class="secondary-form"
        label-position="left"
      >
        <div class="dashed-container">
          <span class="primary-title">
            二进制包存储
            <el-button type="text" @click="removeBinary" icon="el-icon-delete"></el-button>
          </span>
          <el-form-item label="二进制包存储路径" prop="file_location">
            <el-input v-model="buildConfig.post_build.file_archive.file_location" size="small">
              <template slot="append">/$PKG_FILE</template>
              <template slot="prepend">$WORKSPACE/</template>
            </el-input>
          </el-form-item>
        </div>
      </el-form>
      <el-form v-if="post_script_enabled && buildConfig.post_build.scripts" :model="buildConfig.post_build" ref="script" label-width="220px" class="stcov label-at-left">
        <div class="dashed-container">
          <div class="primary-title">
            Shell 脚本执行
            <el-tooltip effect="dark" content="构建运行完成后执行的 Shell 脚本" placement="top">
              <i class="el-icon-question" style="color: #a0a0a0;"></i>
            </el-tooltip>
            <el-button type="text" @click="removeScript" icon="el-icon-delete"></el-button>
          </div>
          <div class="script-content">
            <Editor v-model="buildConfig.post_build.scripts" height="100%"></Editor>
          </div>
        </div>
      </el-form>
    </div>
  </section>
</template>

<script>
import Editor from 'vue2-ace-bind'
import Codemirror from '@/components/projects/common/codemirror.vue'
import {
  getDockerfileAPI,
  getDockerfileTemplatesAPI,
  getRegistryWhenBuildAPI
} from '@api'
export default {
  props: {
    buildConfig: Object,
    validObj: Object,
    usedToHost: Boolean // Cloud hosting builds do not require mirror repositories
  },
  data () {
    return {
      docker_rules: {
        work_dir: [
          {
            type: 'string',
            message: '请填写镜像构建目录',
            required: true,
            trigger: 'blur'
          }
        ],
        docker_file: [
          {
            type: 'string',
            message: '请填写Dockerfile路径',
            required: true,
            trigger: 'blur'
          }
        ]
      },
      file_archive_rules: {
        file_location: [
          {
            type: 'string',
            message: '请填写文件路径',
            required: true,
            trigger: 'blur'
          }
        ]
      },
      allRegistry: [],
      dockerfileTemplates: [],
      showDockerfile: false,
      post_script_enabled: false,
      docker_enabled: false,
      binary_enabled: false,
      dockerfileTemplate: {}
    }
  },
  methods: {
    // called by the parent component at edit time
    initStepStatus (buildConfig = this.buildConfig) {
      if (buildConfig.post_build.docker_build) {
        this.docker_enabled = true
        if (buildConfig.post_build.docker_build.template_id) {
          this.getDockerfileTemplate(
            buildConfig.post_build.docker_build.template_id
          )
        }
      } else {
        this.docker_enabled = false
      }
      if (buildConfig.post_build.file_archive) {
        this.binary_enabled = true
      } else {
        this.binary_enabled = false
      }
      if (buildConfig.post_build.scripts) {
        this.post_script_enabled = true
      } else {
        this.post_script_enabled = false
      }
    },
    addExtra (command) {
      if (command === 'docker') {
        this.docker_enabled = true
        this.$set(this.buildConfig.post_build, 'docker_build', {
          work_dir: '',
          docker_file: '',
          build_args: '',
          source: 'local'
        })
      }
      if (command === 'binary') {
        this.binary_enabled = true
        this.$set(this.buildConfig.post_build, 'file_archive', {
          file_location: ''
        })
      }
      if (command === 'script') {
        this.post_script_enabled = true
        this.$set(this.buildConfig.post_build, 'scripts', '#!/bin/bash\nset -e')
      }
      this.$nextTick(this.$utils.scrollToBottom)
    },
    removeDocker () {
      this.docker_enabled = false
      delete this.buildConfig.post_build.docker_build
    },
    removeBinary () {
      this.binary_enabled = false
      delete this.buildConfig.post_build.file_archive
    },
    removeScript () {
      this.post_script_enabled = false
      delete this.buildConfig.post_build.scripts
    },
    async getDockerfileTemplate (id) {
      const res = await getDockerfileAPI(id).catch(err => {
        console.log(err)
      })
      if (res) {
        this.dockerfileTemplate = res
      }
    },
    getUsedData () {
      const projectName = this.$route.params.project_name
      if (!this.usedToHost) {
        getRegistryWhenBuildAPI(projectName).then(res => {
          this.allRegistry = res
        })
      }
      getDockerfileTemplatesAPI().then(res => {
        this.dockerfileTemplates = res.dockerfile_template
      })
    },
    validate () {
      const valid = []
      if (this.docker_enabled) {
        valid.push(this.$refs.dockerBuildRef.validate())
      }
      if (this.binary_enabled) {
        valid.push(this.$refs.fileArchiveRef.validate())
      }
      return Promise.all(valid)
    }
  },
  created () {
    this.getUsedData()
    this.validObj.addValidate({
      name: 'otherStepsValid',
      valid: this.validate
    })
  },
  components: {
    Editor,
    Codemirror
  }
}
</script>

<style lang="less" scoped>
@inputWidth: 400px;
@secondaryColor: #8a8a8a;
@primaryColor: #000;
@formItemBottom: 8px;
@labelWeight: 300;

.other-step-container {
  .common-parcel-block {
    .primary-title {
      margin: 0;
      line-height: 28px;
    }

    /deep/.el-form.secondary-form {
      .el-input,
      .el-select {
        width: 100%;
      }
    }
  }

  .script-content {
    height: 250px;
    border: 1px solid @borderGray;
  }

  .registry-alert {
    margin-bottom: 10px;
  }
}
</style>
