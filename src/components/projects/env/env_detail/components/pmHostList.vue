<template>
  <div>
    <el-dialog title="编辑主机资源" :visible.sync="editHostDialogVisible" width="30%" center>
      <el-select style="width: 100%;" size="small" multiple filterable v-model="serviceHosts" placeholder="请选择主机">
        <el-option-group label="主机标签">
          <el-option v-for="(item,index) in allHostLabels" :key="index" :label="`${item}`" :value="item"></el-option>
        </el-option-group>
        <el-option-group label="主机列表">
          <el-option v-for="item in allHost" :key="item.name" :label="`${item.name}-${item.ip}`" :value="item.id"></el-option>
        </el-option-group>
      </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="editHostDialogVisible = false">取 消</el-button>
        <el-button type="primary" size="small" :disabled="!serviceHosts" @click="bindHost">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { getHostLabelListAPI, getHostListAPI, addHostToPmEnvAPI } from '@api'
export default {
  name: 'pmHostList',
  props: {
    currentPmServiceData: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  data () {
    return {
      editHostDialogVisible: false,
      serviceHosts: [],
      allHost: [],
      allHostLabels: []
    }
  },
  watch: {
    currentPmServiceData (newVal, oldVal) {
      if (newVal.env_statuses) {
        this.serviceHosts = newVal.env_statuses.map((item) => {
          return item.host_id
        })
      }
    }
  },
  methods: {
    getHosts () {
      getHostLabelListAPI().then((res) => {
        this.allHostLabels = res
      })
      getHostListAPI().then((res) => {
        this.allHost = res
      })
    },
    bindHost () {
      const allHostIds = this.allHost.map(item => {
        return item.id
      })
      const labels = this.serviceHosts.filter(item => {
        return (allHostIds.indexOf(item) < 0)
      })
      const hostIds = this.serviceHosts.filter(item => {
        return (allHostIds.indexOf(item) >= 0)
      })
      const projectName = this.currentPmServiceData.product_name
      const envConfigs = this.serviceHosts.length > 0
        ? [{
          env_name: this.currentPmServiceData.env_name,
          host_ids: hostIds,
          labels: labels
        }]
        : []
      const envStatus = this.serviceHosts.length > 0
        ? hostIds.map(item => {
          return {
            host_id: item,
            address: this.allHost.find(host => {
              return host.id === item
            }).ip,
            env_name: this.currentPmServiceData.env_name
          }
        })
        : []
      const payload = {
        product_name: this.currentPmServiceData.product_name,
        service_name: this.currentPmServiceData.service_name,
        env_name: this.currentPmServiceData.env_name,
        revision: this.currentPmServiceData.revision,
        is_manu: true,
        env_configs: envConfigs,
        env_status: envStatus
      }
      addHostToPmEnvAPI(projectName, payload).then((res) => {
        this.$message({
          message: '主机资源修改成功',
          type: 'success'
        })
        this.editHostDialogVisible = false
      })
    }
  },
  mounted () {
    this.getHosts()
  }
}
</script>
