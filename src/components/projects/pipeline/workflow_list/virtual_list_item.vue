<template>
  <div>
    <CommonWorkflowRow v-if="source.type === 'common'" :workflow="source"></CommonWorkflowRow>
    <ProductWorkflowRow
      v-else
      :name="workflow.name"
      :isFavorite="workflow.isFavorite"
      :type="'workflow'"
      :projectName="workflow.projectName"
      :pipelineLink="`/v1/projects/detail/${workflow.projectName}/pipelines/multi/${workflow.name}`"
      :recentTaskStatus="workflow.recentTask?workflow.recentTask.status:'-'"
      :recentSuccessID="workflow.recentSuccessfulTask?`#${workflow.recentSuccessfulTask.taskID}`:'-'"
      :avgRuntime="makeAvgRunTime(workflow.averageExecutionTime)"
      :avgSuccessRate="makeAvgSuccessRate(workflow.successRate)"
      :recentSuccessLink="makeTaskDetailLink(workflow.projectName,workflow.recentSuccessfulTask)"
      :recentFailID="workflow.recentFailedTask?`#${workflow.recentFailedTask.taskID}`:'-'"
      :recentFailLink="makeTaskDetailLink(workflow.projectName,workflow.recentFailedTask)"
      :updateTime="$utils.convertTimestamp(workflow.update_time)"
      :description="workflow.description"
      @refreshWorkflow="refreshWorkflow"
    >
      <section slot="more" class="stages">
        <span>
          <span v-for="(stage,index) in workflow.enabledStages" :key="index" class="stage-tag">
            <el-tag size="mini">{{wordTranslation(stage,'workflowStage')}}</el-tag>
          </span>
        </span>
      </section>
      <template slot="operations">
        <el-button
          v-hasPermi="{projectName: workflow.projectName, action: 'run_workflow'}"
          type="success"
          class="button-exec"
          @click="startProductWorkflowBuild(workflow)"
        >
          <span class="el-icon-video-play">&nbsp;执行</span>
        </el-button>
        <router-link
          v-hasPermi="{projectName: workflow.projectName, action: 'edit_workflow'}"
          :to="`/workflows/product/edit/${workflow.name}?projectName=${workflow.projectName}`"
        >
          <span class="menu-item el-icon-setting start-build"></span>
        </router-link>
        <el-dropdown
          v-hasPermi="{projectName: workflow.projectName, logic:{operator: 'or', actions: ['create_workflow','delete_workflow', 'edit_workflow']}}"
          @visible-change="(status) => fnShowTimer(status, index, workflow)"
        >
          <span class="el-dropdown-link">
            <i class="el-icon-s-operation more-operation"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-hasPermi="{projectName: workflow.projectName, action: 'edit_workflow'}"
              @click.native="changeSchedule(workflow.projectName)"
            >
              <span>{{workflow.schedulerEnabled ? '关闭': '打开'}}定时器</span>
            </el-dropdown-item>
            <el-dropdown-item
              v-hasPermi="{projectName: workflow.projectName, action: 'create_workflow'}"
              @click.native="copyWorkflow(workflow)"
            >
              <span>复制</span>
            </el-dropdown-item>
            <el-dropdown-item
              v-hasPermi="{projectName: workflow.projectName, action: 'delete_workflow'}"
              @click.native="deleteProductWorkflow(workflow)"
            >
              <span>删除</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </ProductWorkflowRow>
  </div>
</template>

<script>
import ProductWorkflowRow from './pipeline_row.vue'
import CommonWorkflowRow from './common_row.vue'
import mixins from '@/mixin/virtualScrollListMixin'
import { wordTranslate } from '@utils/wordTranslate.js'
import { getWorkflowDetailAPI, updateWorkflowAPI } from '@api'
export default {
  name: 'workflow-list-item',
  mixins: [mixins],
  data () {
    return {
      workflowInfo: null
    }
  },
  props: {
    index: {
      type: Number
    },
    source: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  inject: [
    'startProductWorkflowBuild',
    'copyWorkflow',
    'deleteProductWorkflow',
    'renamePipeline'
  ],
  computed: {
    workflow () {
      return this.source
    },
    projectName () {
      return this.workflow.projectName
    }
  },
  methods: {
    makeAvgRunTime (number) {
      if (number > 0) {
        return number.toFixed(1) + 's'
      } else {
        return '-'
      }
    },
    makeAvgSuccessRate (number) {
      if (number) {
        return (number * 100).toFixed(2) + '%'
      } else {
        return '-'
      }
    },
    makeTaskDetailLink (projectName, taskInfo) {
      if (taskInfo) {
        return `/v1/projects/detail/${projectName}/pipelines/multi/${taskInfo.pipelineName}/${taskInfo.taskID}?status=${taskInfo.status}`
      } else {
        return ''
      }
    },
    wordTranslation (word, category, subitem) {
      return wordTranslate(word, category, subitem)
    },
    async fnShowTimer (status, index, workflow) {
      if (status && !workflow.showTimer) {
        this.workflowInfo = await getWorkflowDetailAPI(
          workflow.projectName,
          workflow.name
        ).catch(error => console.log(error))
        if (_.get(this.workflowInfo, 'schedules.items', '[]').length) {
          this.$set(this.source, 'showTimer', true)
          this.$forceUpdate()
        }
      }
    },
    async changeSchedule (projectName) {
      const workflowInfo = this.workflowInfo
      workflowInfo.schedulerEnabled = !workflowInfo.schedulerEnabled
      const res = await updateWorkflowAPI(this.workflowInfo).catch(error =>
        console.log(error)
      )
      if (res) {
        if (workflowInfo.schedulerEnabled) {
          this.$message.success('定时器开启成功')
        } else {
          this.$message.success('定时器关闭成功')
        }
        this.refreshWorkflow(projectName)
      }
    },
    refreshWorkflow (projectName) {
      this.dispatch('workflow-list', 'refreshWorkflow', projectName)
    }
  },
  components: {
    ProductWorkflowRow,
    CommonWorkflowRow
  }
}
</script>
