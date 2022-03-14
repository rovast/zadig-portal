<template>
  <el-dialog title :visible.sync="dialogVisible" width="700px" custom-class="manage-service-dialog" :close-on-click-modal="false">
    <div slot="title">{{ productInfo.env_name }} 环境 - {{ opeDesc }}服务</div>
    <div class="manage-services-container">
      <el-form ref="serviceFormRef" class="primary-form" :model="updateServices" label-width="100px" label-position="left">
        <el-form-item
          label="服务选择"
          props="service_names"
          :rules="{ required: true, type: 'array', message: '请选择服务名称', trigger: ['blur', 'change']}"
        >
          <el-select v-model="updateServices.service_names" placeholder="请选择服务" size="small" filterable multiple clearable collapse-tags>
            <el-option v-for="service in currentAllInfo.services" :key="service" :label="service" :value="service"></el-option>
          </el-select>
          <el-button type="primary" size="mini" plain @click="updateServices.service_names = currentAllInfo.services">全选</el-button>
        </el-form-item>
      </el-form>
      <template v-if="opeType !== 'delete'">
        <div class="var-title">所选服务有使用环境变量，请确认对应变量值</div>
        <el-table :data="currentVars" style="width: 100%;">
          <el-table-column prop="key" label="键"></el-table-column>
          <el-table-column label="值">
            <template slot-scope="{ row }">
              <el-input v-model="row.value" placeholder="请输入值" size="small"></el-input>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </div>
    <div slot="footer">
      <el-button @click="closeDialog" size="small">取 消</el-button>
      <el-button type="primary" size="small" @click="updateEnvironment">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { initProductAPI, autoUpgradeEnvAPI, deleteEnvServicesAPI } from '@api'
import { cloneDeep, flatten, difference, intersection } from 'lodash'
export default {
  props: {
    fetchAllData: Function,
    productInfo: Object // add: vars/services
  },
  data () {
    return {
      opeType: '',
      dialogVisible: false,
      allProductInfo: {
        // all services and variables
        services: [],
        vars: []
      },
      currentAllInfo: {
        // currently available services and variables
        services: [],
        vars: []
      },
      updateServices: {
        // env_names: [], // use this parameter when adding or updating services
        service_names: []
        // vars: []  // use this parameter when adding or updating services
      }
    }
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    },
    currentVars () {
      const services = this.updateServices.service_names
      return this.currentAllInfo.vars.filter(
        item => intersection(item.services, services).length
      )
    },
    opeDesc () {
      const typeEnum = {
        add: '添加',
        update: '更新',
        delete: '删除'
      }
      return typeEnum[this.opeType] || ''
    }
  },
  methods: {
    updateEnvironment () {
      let payload = {
        service_names: cloneDeep(this.updateServices.service_names)
      }
      if (this.opeType !== 'delete') {
        payload = {
          ...payload,
          env_names: [this.productInfo.env_name],
          vars: this.currentVars
        }
      }
      ;(this.opeType === 'delete'
        ? deleteEnvServicesAPI(
          this.projectName,
          this.productInfo.env_name,
          payload
        )
        : autoUpgradeEnvAPI(this.projectName, payload, false)
      ).then(res => {
        this.$message.success(`${this.opeDesc}服务成功！`)
        this.closeDialog()
        this.fetchAllData()
      })
    },
    closeDialog () {
      this.dialogVisible = false
      this.updateServices.service_names = []
    },
    openDialog (type) {
      this.dialogVisible = true
      this.opeType = type

      const productServices = flatten(this.productInfo.services)

      let vars = []
      let services = []
      switch (this.opeType) {
        case 'add':
          vars = cloneDeep(this.allProductInfo.vars)
          services = difference(this.allProductInfo.services, productServices)
          break
        case 'update':
        case 'delete':
          vars = cloneDeep(this.productInfo.vars)
          services = productServices
          break
      }
      this.currentAllInfo = { vars, services }
    },
    getInitProduct () {
      initProductAPI(this.projectName).then(res => {
        const services = []
        for (const group of res.services) {
          for (const ser of group) {
            services.push(ser.service_name)
          }
        }
        this.allProductInfo = {
          services,
          vars: res.vars
        }
      })
    }
  },
  created () {
    this.getInitProduct()
  }
}
</script>

<style lang="less">
.manage-service-dialog {
  .el-dialog__header {
    padding: 15px;
    text-align: center;
    border-bottom: 1px solid #e4e4e4;
  }

  .el-dialog__body {
    padding: 30px 40px;

    .var-title {
      margin: 20px 0 10px;
    }
  }
}
</style>
