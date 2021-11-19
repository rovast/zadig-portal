<template>
  <div class="run-common-workflow">
    <section v-if="!cantRun">
      <div class="title">构建</div>
      <el-table class="content" :data="runCommonInfo.builds" style="width: 100%;">
        <el-table-column prop="repo_name" label="仓库"></el-table-column>
        <el-table-column prop="branch" label="分支">
          <template slot-scope="{row}">
            <el-select v-model="row.branch" placeholder="请选择分支" size="small">
              <el-option v-for="branch in row.branches" :key="branch.key" :label="branch.name" :value="branch.name"></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="pr" label="PR">
          <template slot-scope="{row}">
            <el-select v-model="row.pr" placeholder="请选择分支" size="small">
              <el-option
                v-for="pr in row.prs.filter(pr=>pr.targetBranch === row.branch)"
                :key="pr.id"
                :label="`#${pr.id} ${pr.title}`"
                :value="pr.id"
              ></el-option>
            </el-select>
          </template>
        </el-table-column>
      </el-table>
    </section>
    <section v-if="!cantRun">
      <div class="title">变量设置</div>
      <el-table class="content" :data="runCommonInfo.build_args" style="width: 100%;">
        <el-table-column prop="key" label="变量"></el-table-column>
        <el-table-column label="值">
          <template slot-scope="{row}">
            <el-input v-if="row.type === 'string'" v-model="row.value" placeholder="请输入默认值" size="small"></el-input>
            <el-select v-else v-model="row.value" placeholder="请选择值" size="small">
              <el-option v-for="val in row.choice_option" :key="val" :label="val" :value="val"></el-option>
            </el-select>
          </template>
        </el-table-column>
      </el-table>
    </section>
    <footer>
      <el-button :loading="loading" type="primary" plain size="small" :disabled="cantRun" @click="runCommonPipeline">启动任务</el-button>
    </footer>
  </div>
</template>

<script>
import {
  getAllBranchInfoAPI,
  runCommonPipelineAPI,
  getCommonPipelineAPI,
  getParamsInfoAPI
} from '@api'
import { cloneDeep } from 'lodash'

export default {
  props: {
    value: Boolean,
    workflow: Object
  },
  data () {
    return {
      runCommonInfo: {
        id: '',
        name: '',
        project_name: '',
        builds: [],
        build_args: []
      },
      cantRun: false,
      loading: false
    }
  },
  methods: {
    getAllBranchInfo (payload) {
      getAllBranchInfoAPI(payload, 'bp').then(res => {
        console.log(res)
        const builds = this.runCommonInfo.builds
        res.forEach(re => {
          const key = `${re.codehost_id}/${re.repo_owner}/${re.repo}`
          const build = builds.find(build => build.key === key)
          if (build) {
            build.branches = re.branches
            build.prs = re.prs
          }
        })
      })
    },
    getCommonPipelineInfo () {
      getCommonPipelineAPI(this.workflow.id).then(res => {
        console.log(res)

        const buildStep = res.sub_tasks.find(task => task.type === 'buildv3')
        // 没有构建不能运行工作流
        if (!buildStep) {
          this.cantRun = true
          return
        }

        const infos = [] // 用来请求branch pr信息
        const builds = [] // post 信息，页面使用信息

        if (buildStep.job_ctx.builds && buildStep.job_ctx.builds.length) {
          buildStep.job_ctx.builds.forEach(build => {
            infos.push({
              codehost_id: build.codehost_id,
              default_branch: build.branch,
              repo: build.repo_name,
              repo_owner: build.repo_owner
            })

            builds.push({
              key: `${build.codehost_id}/${build.repo_owner}/${build.repo_name}`, // useless
              repo_name: build.repo_name,
              repo_owner: build.repo_owner,
              pr: '',
              branch: build.branch,
              branches: [], // useless
              prs: [] // useless
            })
          })
        }

        this.runCommonInfo = {
          id: res.id,
          name: res.name,
          project_name: res.project_name,
          builds,
          build_args: res.parameters
        }

        if (infos.length) {
          this.getAllBranchInfo({ infos })
        }
      })
    },
    runCommonPipeline () {
      const payload = cloneDeep(this.runCommonInfo)

      payload.builds.forEach(build => {
        delete build.key
        delete build.branches
        delete build.prs
      })

      console.log('payload:', payload)
      // this.loading = true
      // runCommonPipelineAPI(payload).then(res => {
      //   this.loading = false
      //   this.$message.success('创建成功')
      // this.$router.push(``)
      // }).catch(err=>{
      //   this.loading = false
      // })
    }
  },
  watch: {
    value: {
      handler (val) {
        if (val) {
          this.getCommonPipelineInfo()
        } else {
          this.loading = false
        }
      },
      immediate: true
    }
  }
}
</script>

<style lang="less" scoped>
.run-common-workflow {
  margin: 0 20px 10px;

  .title {
    font-weight: 600;
    font-size: 14px;
    line-height: 2;
  }

  .content {
    width: 80%;
    margin: auto;
    margin-bottom: 10px;

    /deep/.el-select,
    .el-input {
      width: 200px;
    }
  }

  footer {
    text-align: right;
  }
}
</style>
