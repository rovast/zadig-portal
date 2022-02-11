<template>
  <section>
    <div>
      <el-dropdown @command="addExtra">
        <el-button size="small">
          新增构建步骤
          <i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="docker" :disabled="docker_enabled">镜像构建</el-dropdown-item>
          <el-dropdown-item command="binary" :disabled="binary_enabled">二进制包归档</el-dropdown-item>
          <el-dropdown-item command="script" :disabled="post_script_enabled">Shell 脚本</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-form
      v-if="docker_enabled"
      :model="buildConfig.post_build.docker_build"
      :rules="docker_rules"
      ref="docker_build"
      label-width="220px"
      class="docker label-at-left input-width-middle"
    >
      <div class="dashed-container">
        <span class="title">
          镜像构建
          <el-button type="text" @click="removeDocker" icon="el-icon-delete"></el-button>
        </span>
        <div v-if="allRegistry.length === 0" class="registry-alert">
          <el-alert title="私有镜像仓库未集成，请前往系统设置 -> Registry 管理  进行集成。" type="warning"></el-alert>
        </div>
        <el-form-item label="镜像构建目录：" prop="work_dir">
          <el-input v-model="buildConfig.post_build.docker_build.work_dir" size="small">
            <template slot="prepend">$WORKSPACE/</template>
          </el-input>
        </el-form-item>
        <el-form-item label="Dockerfile 来源：" prop="source">
          <el-select size="small" style="width: 100%;" v-model="buildConfig.post_build.docker_build.source" placeholder="请选择">
            <el-option label="代码仓库" value="local"></el-option>
            <el-option label="模板库" value="template"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="buildConfig.post_build.docker_build.source === 'local'" label="Dockerfile 文件的完整路径：" prop="docker_file">
          <el-input v-model="buildConfig.post_build.docker_build.docker_file" size="small">
            <template slot="prepend">$WORKSPACE/</template>
          </el-input>
        </el-form-item>
        <el-form-item v-if="buildConfig.post_build.docker_build.source === 'template'" label="选择模板：" prop="template_name">
          <el-select
            style="width: 95%;"
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
        <el-form-item label="镜像构建参数：">
          <el-tooltip effect="dark" content="支持所有 Docker Build 参数" placement="top-start">
            <el-input v-model="buildConfig.post_build.docker_build.build_args" size="small" placeholder="--build-arg key=value"></el-input>
          </el-tooltip>
        </el-form-item>
      </div>
      <div class="divider"></div>
    </el-form>
    <el-form
      v-if="binary_enabled"
      :model="buildConfig.post_build.file_archive"
      :rules="file_archive_rules"
      ref="file_archive"
      label-width="220px"
      class="stcov label-at-left"
    >
      <div class="dashed-container">
        <span class="title">
          二进制包归档
          <el-button type="text" @click="removeBinary" icon="el-icon-delete"></el-button>
        </span>
        <el-form-item label="二进制包存放路径：" prop="file_location">
          <el-input v-model="buildConfig.post_build.file_archive.file_location" size="small">
            <template slot="append">/$PKG_FILE</template>
            <template slot="prepend">$WORKSPACE/</template>
          </el-input>
        </el-form-item>
      </div>
      <div class="divider"></div>
    </el-form>
    <el-form v-if="post_script_enabled" :model="buildConfig.post_build" ref="script" label-width="220px" class="stcov label-at-left">
      <div class="dashed-container">
        <span class="title">
          Shell 脚本
          <el-button type="text" @click="removeScript" icon="el-icon-delete"></el-button>
        </span>
        <div class="divider item"></div>
        <el-row>
          <el-col :span="24">
            <Editor v-model="buildConfig.post_build.scripts" height="300px"></Editor>
          </el-col>
        </el-row>
      </div>
      <div class="divider"></div>
    </el-form>
  </section>
</template>

<script>
import Editor from 'vue2-ace-bind'
import {
  getDockerfileAPI,
  getDockerfileTemplatesAPI,
  getRegistryWhenBuildAPI
} from '@api'
export default {
  props: {
    buildConfig: Object,
    validObj: Object
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
    addExtra (command) {
      if (command === 'docker') {
        this.docker_enabled = true
        if (!this.buildConfig.post_build) {
          this.$set(this.buildConfig, 'post_build', {})
        }
        this.$set(this.buildConfig.post_build, 'docker_build', {
          work_dir: '',
          docker_file: '',
          build_args: '',
          source: 'local'
        })
      }
      if (command === 'binary') {
        this.binary_enabled = true
        if (!this.buildConfig.post_build) {
          this.$set(this.buildConfig, 'post_build', {})
        }
        this.$set(this.buildConfig.post_build, 'file_archive', {
          file_location: ''
        })
      }
      if (command === 'script') {
        this.post_script_enabled = true
        if (!this.buildConfig.post_build) {
          this.$set(this.buildConfig, 'post_build', {})
        }
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
    initData () {
      const projectName = this.$route.params.project_name
      getRegistryWhenBuildAPI(projectName).then(res => {
        this.allRegistry = res
      })
      getDockerfileTemplatesAPI().then(res => {
        this.dockerfileTemplates = res.dockerfile_template
      })
    },
    async getDockerfileTemplate (id) {
      const res = await getDockerfileAPI(id).catch(err => {
        console.log(err)
      })
      if (res) {
        this.dockerfileTemplate = res
      }
    }
  },
  created () {
    this.initData()
  },
  components: {
    Editor
  }
}
</script>
