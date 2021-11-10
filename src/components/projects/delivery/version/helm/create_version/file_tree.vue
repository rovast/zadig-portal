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
import {
  getChartInfoAPI,
  getHelmChartServiceFilePath,
  getHelmChartServiceFileContent
} from '@api'
export default {
  props: {
    fileData: Array
  },
  data () {
    this.defaultProps = { children: 'children', label: 'name' }
    return {
      treeDate: []
    }
  },
  methods: {
    handleNodeClick (data) {
      console.log(data)
      const params = {
        projectName,
        serviceName: data,
        path: data,
        fileName: data.name,
        revision
      }
      if (data.is_dir) {
        if (!data.children) {
          // 请求文件目录信息
        }
      } else {
        // 请求文件内容
        // 两种情况  一种直接请求数据  另一种使用缓存
      }
    },
    getPath ({
      projectName,
      serviceName,
      path,
      revision,
      deliveryVersion = true
    }) {},
    getContent ({
      projectName,
      serviceName,
      path,
      fileName,
      revision,
      deliveryVersion = true
    }) {}
  },
  watch: {
    fileData: {
      handler (newV, oldV) {
        const treeData = this.treeDate
        this.treeDate = newV.map(val => {
          const data = treeData.find(data => data.name === val)
          return (
            data || {
              name: val,
              is_dir: true,
              children: []
            }
          )
        })
      },
      deep: true
    }
  }
}
</script>

<style lang="less" scoped>
.file-tree {
  /deep/ .el-tree {
    height: 100%;

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
