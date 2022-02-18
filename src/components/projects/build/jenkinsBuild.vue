<template>
  <section class="jenkins-build-container">
    <el-form ref="jenkinsForm" :model="jenkinsBuild" label-position="left" class="primary-form" label-width="120px" inline-message>
      <slot name="origin"></slot>
      <el-form-item
        label="构建名称"
        prop="name"
        :rules="[
              { required: true, message: '构建名称不能为空', trigger: ['blur', 'change'] },
              { validator: validName, trigger: ['blur', 'change'] }
            ]"
      >
        <el-input v-model="jenkinsBuild.name" placeholder="构建名称" autofocus size="small" :disabled="!isCreate" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="服务选择">
        <el-select v-model="jenkinsBuild.targets" multiple size="small" value-key="key" filterable>
          <el-option
            v-for="(service,index) in serviceTargets"
            :key="index"
            :label="`${service.service_module}(${service.service_name})`"
            :value="service"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="jenkins job" prop="jenkins_build.job_name" :rules="[{ required: true, trigger: 'change', message: 'jobs不能为空' }]">
        <el-select v-model="jenkinsBuild.jenkins_build.job_name" size="small" value-key="key" @change="changeJobName" filterable>
          <el-option v-for="(item,index) in jenkinsJobList" :key="index" :label="item" :value="item"></el-option>
        </el-select>
      </el-form-item>
      <span class="item-title">构建参数</span>
      <el-alert
        class="description"
        show-icon
        title="Jenkins Build Parameters 中必须存在“IMAGE”变量，作为构建镜像的名称，Jenkins 成功构建镜像后，部署阶段会使用该镜像更新服务"
        :closable="false"
        type="warning"
      ></el-alert>
      <div class="divider item"></div>
      <div v-for="(item) in jenkinsBuild.jenkins_build.jenkins_build_params" :key="item.name">
        <el-form-item :label="item.name" class="form-item">
          <el-input size="medium" v-model="item.value" placeholder="请输入值"></el-input>
        </el-form-item>
      </div>
    </el-form>
  </section>
</template>

<script>
import { queryJenkinsJob, queryJenkinsParams } from '@api'
const validName = (rule, value, callback) => {
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
    jenkinsBuildData: Object,
    isCreate: Boolean,
    serviceTargets: Array
  },
  data () {
    return {
      jenkinsJobList: [],
      validName,
      initJenkinsBuild: {
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
      }
    }
  },
  computed: {
    jenkinsBuild () {
      return this.jenkinsBuildData || this.initJenkinsBuild
    }
  },
  methods: {
    validate () {
      if (
        !this.jenkinsBuild.jenkins_build.jenkins_build_params.find(
          item => item.name === 'IMAGE'
        )
      ) {
        this.$message.error(
          'Jenkins Build Parameters 中必须存在“IMAGE”变量，作为构建镜像的名称，Jenkins 成功构建镜像后，部署阶段会使用该镜像更新服务'
        )
        return Promise.reject()
      }
      return this.$refs.jenkinsForm.validate().then(() => {
        return this.$utils.cloneObj(this.jenkinsBuild)
      })
    },
    async getJenkinsJob () {
      const res = await queryJenkinsJob().catch(error => console.log(error))
      if (res) {
        this.jenkinsJobList = res
      }
    },
    async changeJobName (value) {
      const res = await queryJenkinsParams(value).catch(error =>
        console.log(error)
      )
      if (res) {
        this.jenkinsBuild.jenkins_build.jenkins_build_params = res
      }
    }
  },
  created () {
    this.getJenkinsJob()
  }
}
</script>

<style lang="less" scoped>
@secondaryColor: #8a8a8a;
@primaryColor: #000;

.jenkins-build-container {
  margin-bottom: 16px;
  padding: 0 40px 16px;
  background-color: #fff;
  border-end-start-radius: 6px;
  border-end-end-radius: 6px;

  .item-title {
    color: @primaryColor;
    font-weight: 300;
    font-size: 14px;
    line-height: 28px;
  }

  /deep/.el-form-item.form-item {
    .el-form-item__label {
      color: @secondaryColor;
    }
  }
}
</style>
