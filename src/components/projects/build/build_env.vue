<template>
  <div>
    <span v-if="title" class="item-title">{{title}}</span>
    <div v-if="title" class="divider item"></div>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="构建系统" label-width="inherit" required>
          <el-select size="small" v-model="pre_build.image_id" placeholder="请选择" @change="changeImage('id', $event)">
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
      </el-col>
      <el-col :span="12">
        <el-form-item label="资源规格" label-width="inherit" required>
          <el-select size="small" v-model="pre_build.res_req" placeholder="请选择">
            <el-option label="高 | CPU: 16 核 内存: 32 GB" value="high"></el-option>
            <el-option label="中 | CPU: 8 核 内存: 16 GB" value="medium"></el-option>
            <el-option label="低 | CPU: 4 核 内存: 8 GB" value="low"></el-option>
            <el-option label="最低 | CPU: 2 核 内存: 2 GB" value="min"></el-option>
            <el-option label="自定义" value="define" @click.native="checkSpec"></el-option>
          </el-select>

          <div v-if="pre_build.res_req_spec && pre_build.res_req === 'define'" class="define-resource">
            <el-form-item
              label="CPU(m)"
              label-width="70px"
              :prop="`${propPre}.res_req_spec.cpu_limit`"
              :rules="{ validator: validateCpuLimit, trigger: ['change', 'blur'] }"
            >
              <el-input v-model.number="pre_build.res_req_spec.cpu_limit" placeholder="自定义 CPU" size="small"></el-input>
            </el-form-item>

            <el-form-item
              label="内存(Mi)"
              label-width="70px"
              :prop="`${propPre}.res_req_spec.memory_limit`"
              :rules="{ validator: validateMemoryLimit, trigger: ['change', 'blur'] }"
            >
              <el-input v-model.number="pre_build.res_req_spec.memory_limit" placeholder="自定义内存" size="small"></el-input>
            </el-form-item>
          </div>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="集群名称" label-width="inherit" :prop="`${propPre}.cluster_id`" required :show-message="false">
          <el-select v-model="pre_build.cluster_id" placeholder="选择集群名称" size="small" @change="changeNamespaces">
            <el-option v-for="cluster in clusters" :key="cluster.id" :label="$utils.showClusterName(cluster)" :value="cluster.id"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="命名空间" label-width="inherit" :prop="`${propPre}.namespace`" required :show-message="false">
          <el-select v-model="pre_build.namespace" placeholder="选择命名空间" size="small" filterable>
            <el-option v-for="namespace in namespaces" :key="namespace.name" :label="namespace.name" :value="namespace.name"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import {
  getImgListAPI,
  getClusterListAPI,
  productHostingNamespaceAPI
} from '@api'
export default {
  props: {
    pre_build: Object,
    isCreate: {
      default: false,
      type: Boolean
    },
    mini: {
      default: false,
      type: Boolean
    },
    title: {
      default: '运行时环境',
      type: String
    },
    propPre: {
      default: 'pre_build',
      type: String
    },
    initFlag: Boolean
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
      systems: [],
      clusters: [],
      namespaces: []
    }
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    }
  },
  methods: {
    getImgList () {
      return getImgListAPI().then(response => {
        this.systems = response
      })
    },
    getClusterList () {
      return getClusterListAPI(this.projectName).then(res => {
        this.clusters = res.filter(element => element.status === 'normal')
      })
    },
    changeNamespaces (id) {
      this.pre_build.namespace = ''
      this.getProductHostingNamespace(id).then(() => {
        const ns = this.namespaces.find(ns => ns.current)
        this.pre_build.namespace = ns ? ns.name : ''
      })
    },
    getProductHostingNamespace (id) {
      this.namespaces = []
      return productHostingNamespaceAPI(id).then(res => {
        this.namespaces = res
      })
    },

    // init information should handle in the home page after get build data
    // the method must callback after init data requested
    paddingData () {
      const initNs = () => {
        this.$set(this.pre_build, 'cluster_id', '')
        this.$set(this.pre_build, 'namespace', '')

        const local = this.clusters.find(cluster => cluster.local)
        this.pre_build.cluster_id = local ? local.id : ''
        this.getProductHostingNamespace(this.pre_build.cluster_id).then(() => {
          const ns = this.namespaces.find(ns => ns.current)
          this.pre_build.namespace = ns ? ns.name : ''
        })
      }

      if (this.isCreate) {
        this.changeImage('', '', 0)
        initNs()
      } else {
        const key = this.pre_build.image_id
          ? 'id'
          : this.pre_build.build_os
            ? 'value'
            : ''
        const value = this.pre_build.image_id || this.pre_build.build_os
        if (key) {
          this.changeImage(key, value)
        }

        // compatible with old data: use the local and zadig namespace by default
        if (!this.pre_build.cluster_id) {
          initNs()
        } else {
          // request namespaces of current cluster
          this.getProductHostingNamespace(this.pre_build.cluster_id)
        }
      }
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
        this.pre_build.image_id = imageSys.id
        this.pre_build.image_from = imageSys.image_from
        this.pre_build.build_os = imageSys.value
      }
    },
    checkSpec () {
      if (!this.pre_build.res_req_spec) {
        this.$set(this.pre_build, 'res_req_spec', {
          cpu_limit: 1000,
          memory_limit: 512
        })
      }
    }
  },
  watch: {
    initFlag: {
      handler (newV) {
        // when false, it represents the end of the data request for editing the build
        // cannot init when the initial data is not requested
        if (!newV && this.systems.length && this.clusters.length) {
          this.paddingData()
        }
      },
      immediate: true
    }
  },
  created () {
    // data before initialization must be obtained first
    Promise.all([this.getClusterList(), this.getImgList()]).then(() => {
      // if the build data has not been requested, it cannot be initialized
      if (!this.initFlag) {
        this.paddingData()
      }
    })
  }
}
</script>

<style lang="less" scoped>
.item-title {
  font-size: 15px;
}

.divider {
  width: 100%;
  height: 1px;
  margin: 5px 0 15px 0;
  background-color: #dfe0e6;

  &.item {
    width: 30%;
  }
}

.define-resource {
  margin-left: 10px;
  color: #606266;

  /deep/.el-input {
    max-width: 190px;
  }
}
</style>
