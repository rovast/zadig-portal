<template>
  <el-dialog title="是否更新对应环境？" :visible.sync="updateHelmEnvDialogVisible" width="60%">
    <div class="title">
      <el-alert title="勾选需要更新的环境，点击确定之后，该服务将自动在对应的环境中进行更新" :closable="false" type="warning"></el-alert>
    </div>
    <div class="content">
      <el-checkbox-group v-model="checkedEnvList">
        <el-checkbox v-for="(env, index) in envList" :key="index" :label="env">{{env.name}}</el-checkbox>
      </el-checkbox-group>
      <ChartValues
        v-if="chartNames"
        class="chart-value"
        ref="chartValuesRef"
        :envNames="checkedEnvList.map(env => env.name)"
        :chartNames="chartNames"
        showEnvTabs
        :envScene="`updateEnv`"
      ></ChartValues>
    </div>
    <div class="overwrite-warning" v-show="checkedEnvList.find(env => env.is_existed)">
      <p>Zadig 中定义的服务将覆盖所选命名空间中的同名服务，请谨慎操作！</p>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" :disabled="!checkedEnvList.length" type="primary" @click="autoUpgradeEnv">确 定</el-button>
      <el-button size="small" @click="skipUpdate">跳过</el-button>
    </span>
  </el-dialog>
</template>
<script>
import ChartValues from '@/components/projects/env/env_detail/common/updateHelmEnvChart.vue'
import { updateHelmEnvAPI, listProductAPI } from '@api'
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'updateHelmEnv',
  props: {
    value: Boolean
  },
  data () {
    return {
      checkedEnvList: [],
      envList: []
    }
  },
  methods: {
    async autoUpgradeEnv () {
      const res = await this.$refs.chartValuesRef.validate().catch(err => {
        console.log(err)
      })
      if (!res) {
        return
      }
      this.$confirm('更新环境, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const payload = {
          envNames: this.checkedEnvList.map(env => env.name),
          replacePolicy: 'notUseEnvImage',
          chartValues: this.$refs.chartValuesRef.getAllChartNameInfo()
        }
        const projectName = this.projectName
        updateHelmEnvAPI(projectName, payload).then(res => {
          this.$router.push(`/v1/projects/detail/${projectName}/envs`)
          this.$message({
            message: '更新环境成功',
            type: 'success'
          })
        })
      })
    },
    skipUpdate () {
      this.updateHelmEnvDialogVisible = false
    },
    async getProducts () {
      await this.$store.dispatch('getProjectList')
    },
    async getEnvNameList () {
      const projectName = this.projectName
      const envNameList = await listProductAPI(projectName)
      if (envNameList.length) {
        this.envList = envNameList.map(env => {
          return {
            name: env.name,
            is_existed: env.is_existed || false
          }
        })
      }
    }
  },
  computed: {
    ...mapState({
      chartNames: state => state.serviceManage.chartNames
    }),
    updateHelmEnvDialogVisible: {
      get: function () {
        if (!this.value) {
          this.checkedEnvList = []
        }
        return this.value
      },
      set: function (val) {
        this.$emit('input', val)
      }
    },
    ...mapGetters(['projectList']),
    envNameList () {
      const envNameList = []
      this.projectList.forEach(element => {
        if (element.name === this.projectName) {
          element.envs.forEach(envName => {
            envNameList.push({
              envName
            })
          })
        }
      })
      return envNameList
    },
    projectName () {
      return this.$route.params.project_name
    }
  },
  mounted () {
    this.getProducts()
    this.getEnvNameList()
  },
  components: {
    ChartValues
  }
}
</script>

<style lang="less" scoped>
/deep/.el-dialog {
  .el-dialog__body {
    padding-top: 10px;

    .title {
      margin-bottom: 20px;
    }

    .content {
      .chart-value {
        margin-top: 12px;
      }
    }
  }

  .overwrite-warning {
    color: #f56c6c;
    font-size: 13px;
  }
}
</style>
