<template>
  <div class="function-test-manage">
    <el-dialog title="选择关联的工作流" :visible.sync="selectWorkflowDialogVisible" width="30%" center>
      <el-select v-model="selectWorkflow" style="width: 100%;" filterable value-key="name" size="small" placeholder="请选择要关联的工作流，支持搜索">
        <el-option
          v-for="(workflow,index) in availableWorkflows"
          :key="index"
          :label="`${workflow.name} (${workflow.product_tmpl_name})`"
          :value="workflow"
        ></el-option>
      </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="selectWorkflowDialogVisible = false">取 消</el-button>
        <el-button type="primary" size="small" :disabled="!selectWorkflow" @click="bindWorkflow">确 定</el-button>
      </span>
    </el-dialog>
    <div class="tab-container">
      <div class="test-container">
        <el-input v-model="selectKey" placeholder="搜索测试" class="search-test" prefix-icon="el-icon-search" clearable></el-input>
      </div>
      <ul class="test-content" v-if="testList.length > 0">
        <TestRow
          v-for="(testInfo, index) in selectedTestList"
          :key="index"
          :testInfo="testInfo"
          :removeTest="removeTest"
          :addConnection="addConnection"
          :deleteConnection="deleteConnection"
          :runTests="runTests"
        ></TestRow>
      </ul>

      <div v-else class="no-product">
        <img src="@assets/icons/illustration/test.svg" alt />
        <p>暂无可展示的测试用例，请手动新建测试</p>
      </div>
    </div>
  </div>
</template>

<script>
import TestRow from './container/testRow.vue'
import moment from 'moment'
import {
  testsAPI,
  runTestsAPI,
  updateWorkflowAPI,
  deleteTestAPI,
  getWorkflowBindAPI,
  singleTestAPI
} from '@api'

export default {
  data () {
    return {
      testList: [],
      activeTab: 'function',
      selectWorkflowDialogVisible: false,
      currentTestName: '',
      currentProjectName: '',
      selectWorkflow: null,
      availableWorkflows: [],
      selectKey: ''
    }
  },
  props: {
    basePath: {
      request: true,
      type: String
    }
  },
  computed: {
    projectName () {
      return this.$route.params.project_name || ''
    },
    selectedTestList () {
      return this.testList.filter(test => test.name.includes(this.selectKey))
    }
  },
  methods: {
    fetchTestList () {
      const projectName = this.projectName
      const testType = 'function'
      testsAPI(projectName, testType).then(res => {
        for (const row of res) {
          row.updateTimeReadable = moment(row.update_time, 'X').format(
            'YYYY-MM-DD HH:mm:ss'
          )
        }
        this.testList = res
      })
    },
    async bindWorkflow () {
      const workflow = this.selectWorkflow
      if (workflow.test_stage.test_names) {
        workflow.test_stage.enabled = true
        workflow.test_stage.test_names.push(this.currentTestName)
      } else {
        const res = await singleTestAPI(this.currentTestName, this.currentProjectName)
        workflow.test_stage.enabled = true
        workflow.test_stage.tests = workflow.test_stage.tests || []
        workflow.test_stage.tests.push({
          test_name: this.currentTestName,
          envs: res.pre_test.envs || []
        })
      }
      updateWorkflowAPI(workflow).then(() => {
        this.$message({
          type: 'success',
          message: '关联工作流成功'
        })
        this.selectWorkflow = null
        this.availableWorkflows = []
        this.selectWorkflowDialogVisible = false
        this.fetchTestList()
      })
    },
    runTests (name, projectName) {
      const payload = {
        product_name: projectName,
        test_name: name
      }
      runTestsAPI(payload)
        .then(res => {
          this.$message.success('任务启动成功')
          return res
        })
        .then(res => {
          this.$router.push(
            `/v1/projects/detail/${projectName}/test/detail/function/${res.pipeline_name}/${res.task_id}?status=running`
          )
        })
    },
    removeTest (obj) {
      this.$confirm(`确定要删除 ${obj.name} 吗？`, '确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteTestAPI(obj.name, obj.product_name).then(() => {
          this.$message.success('删除成功')
          this.fetchTestList()
        })
      })
    },
    addConnection (testName, projectName) {
      this.selectWorkflowDialogVisible = true
      this.currentTestName = testName
      this.currentProjectName = projectName
      getWorkflowBindAPI(projectName, testName).then(res => {
        this.availableWorkflows = res.filter(element => {
          return element.product_tmpl_name
        })
      })
    },
    deleteConnection (testName, workflow) {
      this.$confirm(`确定要取消和工作流 ${workflow.name} 的关联`, '取消关联', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          if (workflow.test_stage.test_names) {
            const index = workflow.test_stage.test_names.indexOf(testName)
            workflow.test_stage.test_names.splice(index, 1)
          } else if (workflow.test_stage.tests) {
            workflow.test_stage.tests = workflow.test_stage.tests.filter(
              test => {
                return test.test_name !== testName
              }
            )
          }
          updateWorkflowAPI(workflow).then(() => {
            this.$message({
              type: 'success',
              message: '移除关联成功'
            })
            this.fetchTestList()
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    }
  },
  created () {
    this.activeTab = 'function'
    this.fetchTestList()
  },
  components: {
    TestRow
  }
}
</script>

<style lang="less" scoped>
.function-test-manage {
  position: relative;
  flex: 1;
  height: 100%;
  overflow: auto;
  background-color: @globalBackgroundColor;

  .tab-container {
    height: calc(~'100% - 20px');

    .test-container {
      height: 40px;
      margin: 15px 20px;
      text-align: right;

      .search-test {
        width: 400px;
      }
    }

    .test-content {
      height: calc(~'100% - 70px');
      padding: 0 20px;
      overflow: auto;
    }
  }

  .add-test {
    margin-top: 15px;
  }

  .no-product {
    display: flex;
    flex-direction: column;
    align-content: center;
    align-items: center;
    justify-content: center;
    height: 70vh;

    img {
      width: 400px;
      height: 400px;
    }

    p {
      color: #606266;
      font-size: 15px;
    }
  }
}
</style>
