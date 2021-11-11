<template>
  <div class="file-tree">
    <el-tree ref="treeRef" :data="treeDate" :props="defaultProps" @node-click="handleNodeClick" node-key="fullPath" highlight-current>
      <span slot-scope="{data}">
        <i class="icon el-icon-document" v-if="!data.is_dir"></i>
        <i class="icon el-icon-folder" v-else></i>
        {{ data.name }}
      </span>
    </el-tree>
  </div>
</template>

<script>
import { getChartInfoAPI, getHelmChartServiceFilePath } from '@api'

import { debounce } from 'lodash'

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
    this.addServices = [] // 记录新添加的服务项，用来请求版本信息
    this.serviceRevision = {} // 保存服务的版本，用来请求目录、文件内容

    return {
      treeDate: [],
      chartVersions: []
    }
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    }
  },
  methods: {
    async handleNodeClick (data) {
      console.log('nodeDate: ', data)
      const serviceName = data.fullPath.split('/')[0]
      const params = {
        projectName: this.projectName,
        serviceName,
        path: data.parent,
        fileName: data.name,
        revision: this.serviceRevision[serviceName],
        deliveryVersion: true
      }
      if (data.is_dir) {
        if (!data.children) {
          // 请求文件目录信息
          await getHelmChartServiceFilePath(params).then(res => {
            this.setChildren(data.children, serviceName, res)
          })
        }
      } else {
        // 请求文件内容
        this.$emit('clickFile', {
          params,
          fullPath: data.fullPath
        })
      }
    },
    setChildren (children, serviceName, fileInfos) {
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
    },
    getChartInfo () {
      // 请求版本信息
      getChartInfoAPI(this.projectName, this.envName, this.addServices).then(
        res => {
          res.chartInfos.forEach((chart, index) => {
            this.serviceRevision[chart.serviceName] = chart.revision // 保存版本信息

            if (index === 0) {
              // 第一个数据有目录信息
              this.setChildren(
                this.treeData.find(data => data.name === chart.serviceName)
                  .children,
                chart.serviceName,
                res.fileInfos
              )
            }
          })
        }
      )
    },
    getRevision () {
      return this.serviceRevision
    }
  },
  watch: {
    fileData: {
      handler: debounce(function (newV, oldV) {
        const treeData = this.treeDate
        this.addServices = []

        this.treeDate = newV.map(val => {
          const serviceName = val.serviceName
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
      }, 500),
      deep: true
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
        color: #1989fa;
      }

      .display-none {
        display: none;
      }

      &:hover {
        .display-none.folder {
          display: inline-block;

          .icon {
            padding-left: 10px;
          }
        }
      }
    }
  }

  /deep/.el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
    background-color: #1989fa33;
  }
}
</style>
