<template>
  <section>
    <el-form ref="jenkinsForm" :model="jenkinsBuild" label-position="left" class="build-form" label-width="120px">
      <slot name="origin"></slot>
      <el-row>
        <el-col :span="8">
          <el-form-item label="构建方式" prop="name" :rules="[{ required: true, message: '构建方式不能为空' }]">
            <el-input v-model="jenkinsBuild.name" placeholder="构建方式" autofocus size="small" :disabled="!isCreate" auto-complete="off"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="构建服务">
            <el-select v-model="jenkinsBuild.targets" multiple size="small" value-key="key" filterable>
              <el-option
                v-for="(service,index) in serviceTargets"
                :key="index"
                :label="`${service.service_module}(${service.service_name})`"
                :value="service"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item
            label="jenkins job"
            prop="jenkins_build.job_name"
            :rules="[{ required: true, trigger: 'change', message: 'jobs不能为空' }]"
          >
            <el-select
              v-model="jenkinsBuild.jenkins_build.job_name"
              size="small"
              value-key="key"
              @change="changeJobName"
              filterable
            >
              <el-option v-for="(item,index) in jenkinsJobList" :key="index" :label="item" :value="item"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <span class="item-title">构建参数</span>
      <el-alert
        class="description"
        show-icon
        title="Jenkins Build Parameters 中必须存在“IMAGE”变量，作为构建镜像的名称，Jenkins 成功构建镜像后，部署阶段会使用该镜像更新服务"
        :closable="false"
        type="warning"
      ></el-alert>
      <div class="divider item"></div>
      <el-row v-for="(item) in jenkinsBuild.jenkins_build.jenkins_build_params" :key="item.name">
        <el-col :span="8">
          <el-form-item label-width="140px" :label="item.name" class="form-item">
            <el-input size="medium" v-model="item.value" placeholder="请输入值"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </section>
</template>

<script>
import { queryJenkinsJob, queryJenkinsParams } from '@api'
export default {
  props: {
    jenkinsBuild: Object,
    isCreate: Boolean,
    serviceTargets: Array
  },
  data () {
    return {
      jenkinsJobList: []
    }
  },
  methods: {
    validate () {
      return this.$refs.jenkinsForm.validate()
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
