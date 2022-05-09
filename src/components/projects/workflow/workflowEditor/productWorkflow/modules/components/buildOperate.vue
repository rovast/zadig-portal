<template>
  <el-dialog title="构建设置" :visible.sync="isShowBuildOperateDialog" width="40%" center>
    <template>
      <div class="build-configs">
        <h4>代码信息</h4>
        <el-table :data="configs.branch_filter">
          <el-table-column prop="repo_name" label="代码库" width="200px"></el-table-column>
          <el-table-column prop="filter_regexp" label="Branch/Tag过滤规则">
            <template slot-scope="scope">
              <el-input
                style="width: 70%;"
                size="mini"
                @change="(currentValue)=>{checkRegular(currentValue,scope.row)}"
                v-model="scope.row.filter_regexp"
              ></el-input>
              <div>
                <span>匹配到分支：</span>
                <span v-if="scope.row.matchedBranches" class="match">{{scope.row.matchedBranches.toString()}}</span>
              </div>
              <div>
                <span>匹配到 Tag：</span>
                <span v-if="scope.row.matchedTags" class="match">{{scope.row.matchedTags.toString()}}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100px">
            <template slot-scope="scope">
              <el-button @click="delBuild(scope.$index,scope.row)" type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="repo">
          <el-select v-model="form.repo" value-key="repo_name" filterable size="small" placeholder="请选择代码库" style="width: 200px;">
            <el-option v-for="repo of originRepoList" :key="repo.repo_name" :label="repo.repo_name" :value="repo"></el-option>
          </el-select>
          <el-button @click="addBuild" type="default" size="small" icon="el-icon-plus">添加</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script type="text/javascript">
import { debounce } from 'lodash'
import {
  checkRegularAPI,
  getBuildConfigDetailAPI,
  getBranchInfoByIdAPI,
  getTagsInfoByIdAPI
} from '@api'
export default {
  data () {
    return {
      form: {
        repo: ''
      },
      originRepoList: [],
      isShowBuildOperateDialog: false,
      configs: { branch_filter: [] }
    }
  },
  props: {
    value: {
      type: Object,
      required: true
    }
  },
  watch: {
    value: {
      handler (val) {
        this.configs = { ...val }
        this.$emit('input', Object.assign({}, this.configs))
      },
      deep: true,
      immediate: true
    },
    'configs.branch_filter': {
      handler () {
        this.filter()
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    filter () {
      this.originRepoList = this.originRepoList.filter(
        x =>
          !this.configs.branch_filter.some(
            item => x.repo_name === item.repo_name
          )
      )
    },
    showCurBuildOpeDialog () {
      this.isShowBuildOperateDialog = true
      if (!this.configs.target.build_name) {
        return
      }
      this.getRepoList(
        this.configs.target.build_name,
        this.$route.query.projectName
      )
    },
    addBuild () {
      if (Object.keys(this.form.repo).length > 0) {
        this.configs.branch_filter.push(this.form.repo)
        this.form.repo = {}
      }
    },
    delBuild (index, row) {
      this.configs.branch_filter.splice(index, 1)
      this.originRepoList.push(row)
    },
    getRepoList (buildName, projectName) {
      if (!buildName) return
      getBuildConfigDetailAPI(buildName, projectName).then(res => {
        this.originRepoList = [...res.repos] || []
        this.filter()
      })
    },
    setRow (row, regular) {
      if (row.tags.length > 0) {
        const payload = {
          branches: row.tags,
          regular
        }
        checkRegularAPI(payload).then(res => {
          if (res.length > 0) {
            this.$set(row, 'matchedTags', res)
            this.$set(row, 'matchedBranches', [])
          }
        })
      }
      if (row.branches.length > 0) {
        const payload = {
          branches: row.branches,
          regular
        }
        checkRegularAPI(payload).then(res => {
          if (res.length > 0) {
            this.$set(row, 'matchedBranches', res)
            this.$set(row, 'matchedTags', [])
          }
        })
      }
    },
    checkRegular: debounce(function (regular, row) {
      if (row.branches && row.branches.length > 0) {
        this.setRow(row, regular)
      } else {
        const { codehost_id, repo_owner, repo_name } = row
        Promise.all([
          getBranchInfoByIdAPI(codehost_id, repo_owner, repo_name),
          getTagsInfoByIdAPI(codehost_id, repo_owner, repo_name)
        ]).then(res => {
          const branches = []
          const tags = []
          res[0].forEach(item => {
            branches.push(item.name)
          })
          this.$set(row, 'branches', branches)

          res[1].forEach(item => {
            tags.push(item.name)
          })
          this.$set(row, 'tags', tags)
          this.setRow(row, regular)
        })
      }
    }, 500)
  }
}
</script>
<style lang="less" scoped>
.build-configs {
  .repo {
    margin: 20px 0;
  }

  .match {
    display: inline-block;
    max-width: 100px;
    margin-left: 8px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    vertical-align: bottom;
  }
}
</style>
