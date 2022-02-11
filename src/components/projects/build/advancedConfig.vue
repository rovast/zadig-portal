<template>
  <section>
    <el-form ref="advancedConfig" :model="buildConfig" label-position="left" class="build-form" label-width="120px" inline-message>
      <div>策略配置</div>
      <el-form-item label="构建超时">
        <el-input-number size="mini" :min="1" v-model="buildConfig.timeout"></el-input-number>
        <span>分钟</span>
      </el-form-item>
      <el-form-item label="开启缓存">
        <el-switch v-model="buildConfig.cache_enable" active-color="#409EFF"></el-switch>
      </el-form-item>
      <el-radio-group v-if="buildConfig.cache_enable" v-model="buildConfig.cache_dir_type" class="radio-group">
        <el-radio label="workspace">工作空间 $WORKSPACE</el-radio>
        <el-radio label="user_defined">
          自定义目录
          <el-input v-model="buildConfig.cache_user_dir" placeholder="请手动输入" size="mini"></el-input>
        </el-radio>
      </el-radio-group>
      <div>资源配置</div>
      <el-form-item label="集群名称" label-width="inherit" prop="pre_build.cluster_id" required :show-message="false">
        <el-select v-model="buildConfig.pre_build.cluster_id" placeholder="选择集群名称" size="small">
          <el-option v-for="cluster in clusters" :key="cluster.id" :label="$utils.showClusterName(cluster)" :value="cluster.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="资源规格" label-width="inherit" required>
        <el-select size="small" v-model="buildConfig.pre_build.res_req" placeholder="请选择">
          <el-option label="高 | CPU: 16 核 内存: 32 GB" value="high"></el-option>
          <el-option label="中 | CPU: 8 核 内存: 16 GB" value="medium"></el-option>
          <el-option label="低 | CPU: 4 核 内存: 8 GB" value="low"></el-option>
          <el-option label="最低 | CPU: 2 核 内存: 2 GB" value="min"></el-option>
          <el-option label="自定义" value="define" @click.native="checkSpec"></el-option>
        </el-select>

        <div v-if="buildConfig.pre_build.res_req_spec && buildConfig.pre_build.res_req === 'define'" class="define-resource">
          <el-form-item
            label="CPU(m)"
            label-width="70px"
            prop="pre_build.res_req_spec.cpu_limit"
            :rules="{ validator: validateCpuLimit, trigger: ['change', 'blur'] }"
          >
            <el-input v-model.number="buildConfig.pre_build.res_req_spec.cpu_limit" placeholder="自定义 CPU" size="small"></el-input>
          </el-form-item>

          <el-form-item
            label="内存(Mi)"
            label-width="70px"
            prop="pre_build.res_req_spec.memory_limit"
            :rules="{ validator: validateMemoryLimit, trigger: ['change', 'blur'] }"
          >
            <el-input v-model.number="buildConfig.pre_build.res_req_spec.memory_limit" placeholder="自定义内存" size="small"></el-input>
          </el-form-item>
        </div>
      </el-form-item>
    </el-form>
  </section>
</template>

<script>
import { getClusterListAPI } from '@api'
export default {
  props: {
    buildConfig: Object
  },
  data () {
    this.validateCpuLimit = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入自定义 CPU'))
      } else if (typeof value === 'string') {
        callback(new Error('请输入正确数字'))
      } else if (value <= 0) {
        callback(new Error('CPU 必须大于 0'))
      } else {
        callback()
      }
    }

    this.validateMemoryLimit = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入自定义内存'))
      } else if (typeof value === 'string') {
        callback(new Error('请输入正确数字'))
      } else if (value <= 0) {
        callback(new Error('内存必须大于 0'))
      } else {
        callback()
      }
    }

    return {
      clusters: []
    }
  },
  methods: {
    checkSpec () {
      if (!this.buildConfig.pre_build.res_req_spec) {
        this.$set(this.buildConfig.pre_build, 'res_req_spec', {
          cpu_limit: 1000,
          memory_limit: 512
        })
      }
    },
    getClusterList () {
      return getClusterListAPI(this.projectName).then(res => {
        this.clusters = res.filter(element => element.status === 'normal')
      })
    }
  },
  created () {
    this.getClusterList()
  }
}
</script>
