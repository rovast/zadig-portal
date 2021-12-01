<template>
  <div class="account-integrations cf-block__list">
    <el-table v-loading="loading" :data="mapWorkflows" style="width: 100%;">
      <el-table-column label="工作流名称">
        <template slot-scope="scope">
          <span style="margin-left: 10px;">{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column width="200px" label="包含步骤">
        <template slot-scope="scope">
          <span>
            <span v-for="(stage,index) in scope.row.enabledStages" :key="index" class="stage-tag">
              <el-tag size="mini">{{wordTranslation(stage,'workflowStage')}}</el-tag>
            </span>
          </span>
        </template>
      </el-table-column>
      <el-table-column width="400px" label="更新信息（时间/操作人）">
        <template slot-scope="scope">
          {{ $utils.convertTimestamp(scope.row.updateTime)}}/ {{scope.row.updateBy}}
        </template>
      </el-table-column>
      <el-table-column width="120px" label="操作">
        <template slot-scope="scope">
          <el-button
            type="success"
            size="mini"
            round
            @click="runCurrentTask(scope.row)"
            plain
            >点击运行</el-button
          >
        </template>
      </el-table-column>
    </el-table>
        <el-dialog :visible.sync="taskDialogVisible"
               title="运行 产品-工作流"
               custom-class="run-workflow"
               width="60%"
               class="dialog">
      <RunWorkflow v-if="taskDialogVisible"
                    :workflowName="workflow.name"
                    :workflowMeta="workflow"
                    :targetProduct="workflow.product_tmpl_name"
                    @success="hideAfterSuccess"></RunWorkflow>
    </el-dialog>
  </div>
</template>
<script>
import { wordTranslate } from '@utils/word_translate.js'
import RunWorkflow from '../../pipeline/common/run_workflow.vue'
import { getProjectIngressAPI, getWorkflowDetailAPI, getWorkflowsInProjectAPI, generatePipeAPI } from '@api'

export default {
  name: 'runWorkflow',
  data () {
    return {
      loading: true,
      workflow: {},
      taskDialogVisible: false,
      mapWorkflows: []
    }
  },
  methods: {
    async getWorkflows () {
      this.loading = true
      const projectName = this.projectName
      const workflows = await getWorkflowsInProjectAPI(projectName)
      const ingresses = await getProjectIngressAPI(projectName)
      if (workflows && ingresses) {
        this.loading = false
        const currentWorkflows = workflows
        currentWorkflows.forEach(workflow => {
          ingresses.forEach(ingress => {
            if (ingress.env_name === workflow.env_name) {
              workflow.ingress_infos = ingress.ingress_infos
            }
          })
        })
        this.mapWorkflows = currentWorkflows
      }
    },
    wordTranslation (word, category, subitem) {
      return wordTranslate(word, category, subitem)
    },
    runCurrentTask (scope) {
      getWorkflowDetailAPI(scope.projectName, scope.name).then(res => {
        this.taskDialogVisible = true
        this.workflow = res
      }).catch(err => {
        console.log(err)
        this.taskDialogVisible = false
      })
    },
    hideAfterSuccess () {
      this.taskDialogVisible = false
    }
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    }
  },
  async created () {
    await generatePipeAPI(this.projectName)
    this.getWorkflows()
  },
  components: {
    RunWorkflow
  }
}
</script>
<style lang="less" scoped>
      .cf-block__list {
        -ms-flex: 1;
        flex: 1;
        margin-top: 15px;
        padding: 0 30px;
        overflow-y: auto;
        background-color: inherit;
        -webkit-box-flex: 1;

        .env-name {
          color: #1989fa;
        }
      }
</style>
