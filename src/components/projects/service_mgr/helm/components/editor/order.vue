<template>
  <div class="service-order">
    <el-tree
      :props="defaultProps"
      :data="nodeData"
      node-key="label"
      default-expand-all
      draggable
      @node-drop="handleDrop"
      :allow-drag="allowDrag"
      :allow-drop="allowDrop"
    ></el-tree>
  </div>
</template>

<script>
import { updateServicesOrchestrationAPI } from '@api'
import { mapState } from 'vuex'

export default {
  name: 'serviceOrder',
  computed: {
    ...mapState({
      services: state => state.service_manage.services
    }),
    projectName () {
      return this.$route.params.project_name
    }
  },
  data () {
    return {
      defaultProps: { children: 'children', label: 'label' },
      nodeData: []
    }
  },
  methods: {
    handleDrop (draggingNode, dropNode, dropType, ev) {
      // 拖拽到尾节点，则新增一条记录
      if (dropNode.data.label === this.nodeData[this.nodeData.length - 1].label) {
        this.nodeData.push({
          label: `启动顺序 ${this.nodeData.length}`,
          children: []
        })
      }
      const services = Object.values(this.nodeData)
        .map(node => {
          return node.children.map(child => child.label)
        })
      updateServicesOrchestrationAPI(this.projectName, { services })
    },
    allowDrop (draggingNode, dropNode, type) {
      if (dropNode.data.label.indexOf('启动顺序') === -1) {
        return type !== 'inner'
      } else {
        return type === 'inner'
      }
    },
    allowDrag (draggingNode) {
      return draggingNode.data.label.indexOf('启动顺序') === -1
    },
    generateNodeData () {
      const nodeData = []
      if (this.isCreate) {
        nodeData.push({
          label: `启动顺序 0`,
          children: []
        })
      }
      this.services.forEach((service, index) => {
        nodeData.push({
          label: `启动顺序 ${nodeData.length}`,
          children: service.map(se => {
            return {
              label: se
            }
          })
        })
      })
      nodeData.push({
        label: `启动顺序 ${nodeData.length}`,
        children: []
      })
      this.nodeData = nodeData
    }
  },
  props: {
    isCreate: {
      default: false,
      type: Boolean
    }
  },
  watch: {
    services: {
      handler (newV, oldV) {
        this.generateNodeData()
      },
      immediate: true
    }
  }
}
</script>

<style lang="less" scoped>
.service-order {
  /deep/.el-tree {
    .el-tree-node__content {
      height: 30px;
    }

    .el-tree-node__label {
      font-size: 13px;
    }
  }
}
</style>
