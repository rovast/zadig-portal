<template>
  <div class="version-config">
    <div class="left">
      <el-tree ref="treeRef" :data="fileData" :props="defaultProps" @node-click="handleNodeClick" node-key="fullPath" highlight-current>
        <span slot-scope="{data}">
          <i class="icon el-icon-document" v-if="!data.is_dir"></i>
          <i class="icon el-icon-folder" v-else></i>
          {{ data.name }}
        </span>
      </el-tree>
    </div>
    <div class="right">
      <Codemirror class="mirror" v-model="yaml"></Codemirror>
    </div>
  </div>
</template>

<script>
import Codemirror from '@/components/projects/common/codemirror.vue'
export default {
  data () {
    this.defaultProps = { children: 'children', label: 'label' }
    return {
      fileData: [],
      yaml: '',

      versionConfig: {}
    }
  },
  methods: {
    handleNodeClick (data) {
      console.log(data)
    }
  },
  components: {
    Codemirror
  }
}
</script>

<style lang="less" scoped>
.version-config {
  display: flex;
  box-sizing: border-box;
  height: 40vh;
  background-color: #f5f7f7;
  border: 3px solid transparent;

  .left {
    width: 200px;
    height: 100%;
    max-height: 100%;
    overflow: auto;

    /deep/.el-tree {
      height: 100%;
    }
  }

  .right {
    flex: 1 1 auto;
    height: 100%;
    padding: 0 5px 0 10px;
    overflow: hidden;
  }
}
</style>
