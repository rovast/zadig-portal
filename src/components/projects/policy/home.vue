<template>
  <div class="cooperation-container">
    <el-alert type="warning" :closable="false" title="管理项目各个角色协作过程中使用功能模块和权限"></el-alert>
    <el-tabs type="card">
      <el-tab-pane v-for="(mode, index) in allMode" :key="mode.initName" :name="mode.initName">
        <span slot="label" class="policy-title">
          <el-input v-model="mode.name" placeholder="协作模式名称" size="small"></el-input>
          <i class="el-icon-delete icon" @click.stop="deleteMode(index)"></i>
        </span>
      </el-tab-pane>
      <el-tab-pane disabled>
        <span slot="label" class="policy-title">
          <i class="el-icon-circle-plus add-icon" @click="addMode"></i>
        </span>
      </el-tab-pane>
    </el-tabs>
    <Policy></Policy>
  </div>
</template>

<script>
import Policy from './policy.vue'
import bus from '@utils/event_bus'
export default {
  data () {
    return {
      allMode: [
        {
          name: '',
          initName: ''
        }
      ]
    }
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    }
  },
  methods: {
    deleteMode (index) {
      console.log('删除需要做个判断：是删除已有的还是只是添加但未保存的', index)
      this.allMode.splice(index, 1)
    },
    addMode () {
      if (!this.allMode.lastLength) {
        this.allMode.lastLength = this.allMode.length - 1
      }
      this.allMode.lastLength++
      this.allMode.push({
        name: '',
        initName: `zadig-add-mode-${this.allMode.lastLength}`
      })
    }
  },
  components: {
    Policy
  },
  created () {
    bus.$emit(`set-topbar-title`, {
      title: '',
      breadcrumb: [
        { title: '项目', url: '/v1/projects' },
        {
          title: this.projectName,
          url: `/v1/projects/detail/${this.projectName}`
        },
        { title: '协作模式', url: '' }
      ]
    })
    bus.$emit(`set-sub-sidebar-title`, {
      title: this.projectName,
      url: `/v1/projects/detail/${this.projectName}`,
      routerList: [
        {
          name: '工作流',
          url: `/v1/projects/detail/${this.projectName}/pipelines`
        },
        {
          name: '集成环境',
          url: `/v1/projects/detail/${this.projectName}/envs`
        },
        {
          name: '服务',
          url: `/v1/projects/detail/${this.projectName}/services`
        },
        { name: '构建', url: `/v1/projects/detail/${this.projectName}/builds` },
        { name: '测试', url: `/v1/projects/detail/${this.projectName}/test` }
      ]
    })
  }
}
</script>

<style lang="less" scoped>
.cooperation-container {
  padding: 15px 20px;

  /deep/.el-tabs {
    margin-top: 10px;

    .el-tabs__item {
      padding: 0 10px;

      &:last-child {
        padding: 0 15px;
      }

      .policy-title {
        display: inline-flex;
        align-items: center;
        justify-content: space-between;

        .el-input {
          width: calc(~'100% - 25px');
        }

        .icon {
          font-size: 16px;
        }

        .add-icon {
          position: relative;
          top: 7px;
          color: #409eff;
          font-size: 26px;
          cursor: pointer;
        }
      }
    }
  }
}
</style>
