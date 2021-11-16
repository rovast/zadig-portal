<template>
  <div class="common-detail">
    <h4>基本信息</h4>
    <section class="basic">
      <div>
        <span class="info">修改人</span>
        <span class="detail">{{}}</span>
      </div>
      <div>
        <span class="info">描述</span>
        <span class="detail">{{}}</span>
      </div>
      <div>
        <span class="info">更新时间</span>
        <span class="detail">{{}}</span>
      </div>
      <div>
        <span class="info">包含流程</span>
        <span class="detail">
          <el-tag>{{}}</el-tag>
        </span>
      </div>
      <div>
        <span class="info">操作</span>
        <span class="detail">
          <i class="el-icon-video-play"></i>
          <i class="el-icon-edit-outline"></i>
          <i class="el-icon-delete"></i>
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

    <el-dialog :visible.sync="taskDialogVisible" title="运行 通用-工作流" width="60%" class="dialog">
      <RunCommonWorkflow></RunCommonWorkflow>
    </el-dialog>
  </div>
</template>

<script>
import RunCommonWorkflow from './common/run_common_workflow.vue'
export default {
  components: {
    RunCommonWorkflow
  }
}
</script>

<style lang="less" scoped>
.common-detail {
  color: #8d9199;

  .basic {
    line-height: 2;

    .info {
      display: inline-block;
      width: 100px;
    }

    .detail {
      color: #000;
    }
  }
}
</style>
