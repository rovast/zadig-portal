<template>
  <div class="file-tree">
    <el-tree
      ref="treeRef"
      :data="treeData"
      :props="defaultProps"
      @node-click="handleNodeClick"
      node-key="fullPath"
      highlight-current
      :default-expanded-keys="expandedKey"
    >
      <span slot-scope="{data}">
        <i class="icon el-icon-document" v-if="!data.is_dir"></i>
        <i class="icon el-icon-folder" v-else></i>
        {{ data.name }}
        <i v-if="data.fullPath === data.name" class="display-none icon el-icon-close" @click.stop="deleteNode(data)"></i>
      </span>
    </el-tree>
  </div>
</template>

<script>
import { getChartInfoAPI, getHelmChartServiceFilePath } from '@api'

const dataStructure = {
  name: '',
  parent: '',
  fullPath: '',
  children: null, // is_dir: true -> []
  content: '',
  is_dir: false
}
export default {
  props: {
    fileData: Array,
    envName: String
  },
  data () {
    this.defaultProps = { children: 'children', label: 'name' }
    this.addServices = [] // record the new added services, for requesting version info
    this.serviceRevision = {} // save services version, for request directory and file content

    return {
      treeData: [],
      chartVersions: [],
      expandedKey: []
    }
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    }
  },
  methods: {
    async handleNodeClick (data) {
      const serviceName = data.fullPath.split('/')[0]
      const isService = data.fullPath === data.name
      const params = {
        projectName: this.projectName,
        serviceName,
        path: isService ? '' : `${data.parent}/${data.name}`,
        fileName: data.name,
        revision: this.serviceRevision[serviceName],
        deliveryVersion: true
      }
      if (data.is_dir) {
        if (!data.children.length) {
          // request directory
          await getHelmChartServiceFilePath(params).then(res => {
            this.setChildren(data, serviceName, res)
          })
        }
      } else {
        // request file content
        this.$emit('clickFile', {
          ...params,
          path: data.parent,
          fullPath: data.fullPath
        })
      }
    },
    setChildren (data, serviceName, fileInfos) {
      const children = data.children
      fileInfos.forEach(info => {
        children.push({
          ...dataStructure,
          name: info.name,
          parent: info.parent,
          fullPath: `${serviceName}${info.parent}/${info.name}`,
          children: info.is_dir ? [] : null,
          is_dir: info.is_dir
        })
      })
      this.expandedKey.splice(0, 1, data.fullPath)
    },
    getChartInfo () {
      // request version info
      getChartInfoAPI(this.projectName, this.envName, this.addServices).then(
        res => {
          res.chartInfos.forEach((chart, index) => {
            this.serviceRevision[chart.serviceName] = chart.revision // save version info

            if (index === 0) {
              // directory information for the first service
              this.setChildren(
                this.treeData.find(data => data.name === chart.serviceName),
                chart.serviceName,
                res.fileInfos
              )
            }
          })
        }
      )
    },
    deleteNode ({ name }) {
      this.$emit('deleteService', name)
    }
  },
  watch: {
    fileData: {
      handler (newV, oldV) {
        const treeData = this.treeData
        this.addServices = []

        const newServices = []
        this.treeData = newV.map(val => {
          const serviceName = val.serviceName
          newServices.push(serviceName)
          const data = treeData.find(data => data.name === serviceName)
          if (!data) {
            this.addServices.push(serviceName)
          }
          return (
            data || {
              ...dataStructure,
              name: serviceName,
              fullPath: serviceName,
              children: [],
              is_dir: true
            }
          )
        })
        if (this.addServices.length) {
          this.getChartInfo()
        }
      },
      deep: true,
      immediate: true
    }
  }
}
</script>

<style lang="less" scoped>
.file-tree {
  /deep/ .el-tree {
    max-width: 100%;
    height: 100%;
    overflow-x: auto;

    .el-tree-node__content {
      .icon {
        color: @themeColor;
      }

      .display-none {
        display: none;
      }

      &:hover {
        .display-none.icon {
          display: inline-block;
          padding-left: 5px;
        }
      }
    }
  }

  /deep/.el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
    background-color: #1989fa33;
  }
}
</style>
