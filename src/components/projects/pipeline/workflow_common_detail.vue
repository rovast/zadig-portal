<template>
  <div class="common-detail">
    <h4>基本信息</h4>
    <section class="basic">
      <div>
        <span class="info">
          <i class="el-icon-user-solid"></i> 修改人
        </span>
        <span class="detail">{{}}</span>
      </div>
      <div>
        <span class="info">
          <i class="el-icon-chat-line-square"></i> 描述
        </span>
        <span class="detail">{{}}</span>
      </div>
      <div>
        <span class="info">
          <i class="el-icon-time"></i> 更新时间
        </span>
        <span class="detail">{{}}</span>
      </div>
      <div>
        <span class="info">
          <i class="el-icon-finished"></i> 包含流程
        </span>
        <span class="detail">
          <el-tag size="mini">{{}}</el-tag>
        </span>
      </div>
      <div>
        <span class="info">
          <i class="el-icon-s-operation"></i> 操作
        </span>
        <span class="detail">
          <i class="icon el-icon-video-play" @click="showRunCommonPipeline = true"></i>
          <i class="icon el-icon-edit-outline"></i>
          <i class="icon el-icon-delete"></i>
        </span>
      </div>
    </section>
    <h4>历史任务</h4>
    <section>
      <task-list
        :taskList="workflowTasks"
        :total="total"
        :pageSize="pageSize"
        :projectName="projectName"
        :baseUrl="`/v1/projects/detail/${projectName}/pipelines/multi/${workflowName}`"
        :workflowName="workflowName"
        :functionTestBaseUrl="`/v1/projects/detail/${projectName}/pipelines/multi/testcase/${workflowName}`"
        @cloneTask="rerun"
        @currentChange="changeTaskPage"
        showEnv
        showTestReport
        showServiceNames
        showOperation
      ></task-list>
    </section>

    <el-dialog :visible.sync="showRunCommonPipeline" title="运行 通用-工作流" width="60%">
      <RunCommonWorkflow></RunCommonWorkflow>
    </el-dialog>
  </div>
</template>

<script>
import RunCommonWorkflow from './common/run_common_workflow.vue'
import bus from '@utils/event_bus'
export default {
  components: {
    RunCommonWorkflow
  },
  data () {
    return {
      showRunCommonPipeline: false
    }
  },
  mounted () {
    this.projectName = this.$route.params.project_name
    bus.$emit('set-topbar-title', {
      title: '',
      breadcrumb: [
        { title: '项目', url: '/v1/projects' },
        {
          title: this.projectName,
          url: `/v1/projects/detail/${this.projectName}`
        },
        {
          title: '工作流',
          url: `/v1/projects/detail/${this.projectName}/pipelines`
        },
        { title: this.workflowName, url: '' }
      ]
    })
    bus.$emit('set-sub-sidebar-title', {
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
.common-detail {
  padding: 0 30px;
  color: #8d9199;

  h4 {
    width: 400px;
    margin: 15px 0;
    padding: 18px 20px 18px 0;
    font-weight: normal;
    font-size: 16px;
    line-height: 20px;
    border-bottom: 1px solid #eee;
  }

  .basic {
    font-size: 13px;

    .info {
      display: inline-block;
      width: 100px;
      margin-bottom: 15px;
    }

    .detail {
      color: #000;

      .icon {
        margin-right: 0.3em;
        font-size: 1.3rem;
        cursor: pointer;

        &:hover {
          color: #409eff;
        }
      }
    }
  }
}
</style>
