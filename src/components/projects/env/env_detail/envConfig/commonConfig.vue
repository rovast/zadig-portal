<template>
  <div class="env-common-config-container">
    <el-button type="primary" size="small" plain @click="operateConfig('add')" style="margin-bottom: 12px;">添加</el-button>
    <ETable :tableData="currentInfos.tableData" :tableColumns="currentInfos.tableColumns" :id="currentInfos.id"></ETable>
  </div>
</template>

<script>
import ETable from '@/components/common/etable/index.vue'
export default {
  props: {
    currentType: String
  },
  data () {
    return {
      configInfos: {
        Ingress: {
          id: 'ingress_name',
          tableData: [],
          tableColumns: [
            {
              prop: 'ingress_name',
              label: '名称'
            },
            {
              prop: 'host_info',
              label: 'HOSTS'
            },
            {
              prop: 'address',
              label: '地址'
            },
            {
              prop: 'ports',
              label: '端口'
            },
            {
              width: '210',
              render: this.operation
            }
          ]
        },
        ConfigMap: {
          id: 'cm_name',
          tableData: [],
          tableColumns: [
            {
              prop: 'cm_name',
              label: '名称'
            },
            {
              prop: 'services',
              label: '关联服务',
              render: scope => {
                return <span>{scope.row.services.join(', ')}</span>
              }
            },
            {
              width: '210',
              render: this.operation
            }
          ]
        },
        Secret: {
          id: 'secret_name',
          tableData: [],
          tableColumns: [
            {
              prop: 'secret_name',
              label: '名称'
            },
            {
              prop: 'secret_type',
              label: '类型'
            },
            {
              prop: 'services',
              label: '关联服务',
              render: scope => {
                return <span>{scope.row.services.join(', ')}</span>
              }
            },
            {
              width: '210',
              render: this.operation
            }
          ]
        },
        PVC: {
          id: 'pvc_name',
          tableData: [],
          tableColumns: [
            {
              prop: 'pvc_name',
              label: '名称'
            },
            {
              prop: 'status',
              label: '状态'
            },
            {
              prop: 'volume',
              label: '挂载点'
            },
            {
              prop: 'capacity',
              label: '容量'
            },
            {
              prop: 'access_modes',
              label: '访问模式'
            },
            {
              prop: 'storageclass',
              label: 'STORAGECLASS'
            },
            {
              prop: 'services',
              label: '关联服务',
              render: scope => {
                return <span>{scope.row.services.join(', ')}</span>
              }
            },
            {
              width: '210',
              render: this.operation
            }
          ]
        }
      }
    }
  },
  computed: {
    currentInfos () {
      return (
        this.configInfos[this.currentType] || {
          id: 'id',
          tableData: [],
          tableColumns: []
        }
      )
    }
  },
  methods: {
    operation (scope) {
      return (
        <div>
          <el-button
            type="text"
            onClick={() => {
              this.operateConfig('view', scope.row, scope.$index)
            }}
          >
            查看
          </el-button>
          <el-button
            type="text"
            onClick={() => {
              this.operateConfig('edit', scope.row, scope.$index)
            }}
            disabled={scope.row.immutable}
          >
            编辑
          </el-button>
          <el-button
            type="text"
            onClick={() => {
              this.viewHistoryVersion(scope.row, scope.$index)
            }}
          >
            历史版本
          </el-button>
          <el-button
            type="text"
            onClick={() => {
              this.deleteConfig(scope.$index)
            }}
          >
            删除
          </el-button>
        </div>
      )
    },
    getAllConfig () {
      console.log('请求所有的  配置')
    },
    deleteConfig (index) {
      console.log('删除', index)
      this.getAllConfig()
    },
    operateConfig (ope) {
      if (ope === 'view') {
        console.log('查看  配置, 提交事件')
      } else if (ope === 'edit') {
        console.log('编辑  配置, 提交事件')
      } else if (ope === 'add') {
        this.$emit('addConfig')
      }
    },
    viewHistoryVersion () {
      console.log('对比历史版本')
    }
  },
  created () {
    this.getAllConfig()
  },
  components: {
    ETable
  }
}
</script>

<style lang="less" scoped>
.env-common-config-container {
  background: #fff;
}
</style>
