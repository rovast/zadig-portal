<template>
  <section>
    <div class="primary-title not-first-child">构建环境</div>
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
        <el-button v-if="appIndex===buildConfig.pre_build.installs.length-1" @click="addApp(appIndex)" type="primary" size="mini" plain>新增</el-button>
      </span>
    </el-form-item>
  </section>
</template>

<script>
import { getImgListAPI, getAllAppsAPI } from '@api'
export default {
  props: {
    buildConfig: Object,
    isCreate: Boolean,
    mini: {
      default: false,
      type: Boolean
    }
  },
  data () {
    return {
      systems: [],
      allApps: []
    }
  },
  methods: {
    addFirstApp () {
      this.buildConfig.pre_build.installs.push({
        name: '',
        version: '',
        id: ''
      })
    },
    deleteApp (index) {
      this.buildConfig.pre_build.installs.splice(index, 1)
    },
    addApp () {
      this.buildConfig.pre_build.installs.push({
        name: '',
        version: '',
        id: ''
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
    initData (initImage = true) {
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
      // be used on Operating System
      getImgListAPI().then(res => {
        this.systems = res
        if (initImage) {
          this.initOperatingSystem()
        }
      })
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
    this.initData()
  }
}
</script>
