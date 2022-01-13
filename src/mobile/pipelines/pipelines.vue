<template>
  <div class="mobile-workflow-list">
    <van-nav-bar fixed>
      <template #title>
        工作流列表
      </template>
    </van-nav-bar>
    <form action="/">
      <van-search v-model="keyword"
                  input-align="center"
                  placeholder="请输入搜索关键词"
                  @search="onSearch" />
    </form>
    <van-cell-group>
      <van-cell v-for="(workflow,index) in filteredWorkflows"
                center
                border
                :key="index"
                :to="`/mobile/pipelines/project/${workflow.projectName}/multi/${workflow.name}`">
        <template #title>
          <span class="workflow-name">{{`${workflow.name}`}}</span>
        </template>
        <template #label>
          <span v-for="(stage,index) in workflow.enabledStages" :key="index" class="stage-tag">
            <van-tag type="primary">{{wordTranslation(stage,'workflowStage')}}</van-tag>
          </span>
        </template>
        <template #default>
          <van-icon @click.stop.prevent="showAction(workflow)"
                    name="more-o"
                    size="2em"
                    color="#1989fa" />
        </template>

      </van-cell>
    </van-cell-group>
    <van-action-sheet v-model="currentAction.show"
                      cancel-text="取消"
                      close-on-click-action
                      :actions="actions"
                      @select="onSelectAction" />
    <el-dialog :visible.sync="taskDialogVisible"
               title="运行 产品-工作流"
               custom-class="run-workflow"
               width="100%"
               class="dialog">
      <run-workflow v-if="taskDialogVisible"
                    :workflowName="workflowToRun.name"
                    :workflowMeta="workflowToRun"
                    :targetProject="workflowToRun.product_tmpl_name"
                    @success="hideTaskDialog"></run-workflow>
    </el-dialog>
  </div>
</template>
<script>
import { NavBar, Tag, Panel, Loading, Button, Notify, Tab, Tabs, Cell, CellGroup, Icon, Empty, Search, Toast, ActionSheet } from 'vant'
import qs from 'qs'
import { getProductWorkflowsAPI } from '@api'
import { wordTranslate } from '@utils/wordTranslate.js'
import runWorkflow from './run_workflow.vue'
export default {
  components: {
    [NavBar.name]: NavBar,
    [Tag.name]: Tag,
    [Panel.name]: Panel,
    [Loading.name]: Loading,
    [Button.name]: Button,
    [Notify.name]: Notify,
    [Tab.name]: Tab,
    [Tabs.name]: Tabs,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup,
    [Icon.name]: Icon,
    [Empty.name]: Empty,
    [Search.name]: Search,
    [Toast.name]: Toast,
    [ActionSheet.name]: ActionSheet,
    runWorkflow
  },
  data () {
    return {
      keyword: '',
      loading: false,
      workflowToRun: {},
      taskDialogVisible: false,
      actions: [
        { name: '启动' }
      ],
      currentAction: {
        show: false,
        workflow_name: ''
      },
      workflows: []
    }
  },
  computed: {
    filteredWorkflows () {
      this.$router.replace({
        query: Object.assign(
          {},
          qs.parse(window.location.search, { ignoreQueryPrefix: true }),
          {
            name: this.keyword
          })
      })
      const list = this.$utils.filterObjectArrayByKey('name', this.keyword, this.workflows)
      return list
    }
  },
  methods: {
    onSearch (val) {
      Toast(val)
    },
    onSelectAction (action) {
      if (action.name === '启动') {
        this.taskDialogVisible = true
      }
    },
    wordTranslation (word, category, subitem) {
      return wordTranslate(word, category, subitem)
    },
    async getWorkflows () {
      this.loading = true
      this.workflows = await getProductWorkflowsAPI().catch(err => {
        console.log(err)
        return []
      })
      this.loading = false
    },
    showAction (workflow) {
      this.workflowToRun = workflow
      this.$set(this.currentAction, 'show', true)
      this.$set(this.currentAction, 'workflow_name', workflow.name)
    },
    hideTaskDialog () {
      this.taskDialogVisible = false
    }
  },
  mounted () {
    this.getWorkflows()
  }
}
</script>
<style lang="less">
.mobile-workflow-list {
  padding-top: 46px;
  padding-bottom: 50px;

  .stage-tag {
    margin-right: 4px;
  }
}
</style>
