<template>
  <el-dialog title="构建设置" :visible.sync="isShowBuildOperateDialog" width="40%" center>
    <template>
      <div class="build-configs">
        <h4>代码信息</h4>
        <el-table :data="value.branch_filter">
          <el-table-column prop="repo_name" label="代码库" width="200px"></el-table-column>
          <el-table-column prop="filter_regexp" label="Branch/Tag 过滤规则">
            <template slot-scope="scope">
              <el-input
                style="width: 70%;"
                size="mini"
                placeholder="正则表达式"
                @input="(currentValue)=>{inputCheck(currentValue,scope.row)}"
                v-model="scope.row.filter_regexp"
              ></el-input>
              <div v-if="scope.row.filter_regexp">
                <span>匹配到分支：</span>
                <span v-if="scope.row.matchedBranches" class="match">{{scope.row.matchedBranches.toString()}}</span>
              </div>
              <div v-if="scope.row.filter_regexp">
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
import {
  checkRegularAPI,
  getBuildConfigDetailAPI,
  getBranchInfoByIdAPI,
  getTagsInfoByIdAPI
} from '@api'
import { debounce } from 'lodash'

export default {
  data () {
    return {
      form: {
        repo: ''
      },
      originRepoList: [],
      isShowBuildOperateDialog: false,
      firstload: null
    }
  },
  props: {
    value: {
      type: Object,
      required: true
    },
    buildName: {
      type: String,
      default: ''
    }
  },
  watch: {
    'value.branch_filter': {
      handler () {
        this.filter()
      },
      deep: true,
      immediate: true
    },
    'value.target.build_name': {
      handler (val) {
        // store current branch-filter
        if (!this.firstload) {
          this.firstload = {}
          this.firstload[val] = this.value.branch_filter
          return
        }
        this.$set(this.value, 'branch_filter', this.firstload && this.firstload[val] ? this.firstload[val] : [])
        this.getRepoList(val, this.$route.query.projectName)
        this.$emit('input', this.value)
      },
      immediate: true
    }
  },
  mounted () {
    this.value.branch_filter.forEach(item => {
      this.checkRegular(item.filter_regexp, item)
    })
  },
  methods: {
    filter () {
      this.originRepoList = this.originRepoList.filter(
        x =>
          !this.value.branch_filter.some(item => x.repo_name === item.repo_name)
      )
    },
    showCurBuildOpeDialog () {
      this.isShowBuildOperateDialog = true
      if (!this.value.target.build_name) {
        return
      }
      this.getRepoList(this.buildName, this.$route.query.projectName)
    },
    addBuild () {
      if (Object.keys(this.form.repo).length > 0) {
        this.value.branch_filter.push(this.form.repo)
        this.form.repo = {}
      }
    },
    delBuild (index, row) {
      this.value.branch_filter.splice(index, 1)
      this.originRepoList.push(row)
    },
    getRepoList (buildName, projectName) {
      if (!buildName) return
      getBuildConfigDetailAPI(buildName, projectName).then(res => {
        this.originRepoList = [...res.repos] || []
        this.filter()
      })
    },
    setRow (regular, row) {
      if (!regular) return
      const { branches, tags } = row
      if (tags && tags.length > 0) {
        const payload = {
          branches: tags,
          regular
        }
        checkRegularAPI(payload).then(res => {
          this.$set(row, 'matchedTags', res)
        })
      }
      if (branches && branches.length > 0) {
        const payload = {
          branches: branches,
          regular
        }
        checkRegularAPI(payload).then(res => {
          this.$set(row, 'matchedBranches', res)
        })
      }
    },
    inputCheck: function (regular, row) {
      debounce(() => this.checkRegular(regular, row), 500)()
    },
    checkRegular: function (regular, row) {
      const { codehost_id, repo_owner, repo_name, branches, tags } = row
      if ((branches && branches.length) > 0 || (tags && tags.length) > 0) {
        this.setRow(regular, row)
      } else {
        if (!branches) {
          getBranchInfoByIdAPI(codehost_id, repo_owner, repo_name).then(res => {
            const branches = []
            res.forEach(item => {
              branches.push(item.name)
            })
            this.$set(row, 'branches', branches)
            this.setRow(regular, row)
          })
        }
        if (!tags) {
          getTagsInfoByIdAPI(codehost_id, repo_owner, repo_name).then(res => {
            const tags = []
            res.forEach(item => {
              tags.push(item.name)
            })
            this.$set(row, 'tags', tags)
            this.setRow(regular, row)
          })
        }
      }
    }
  }
}
</script>
<style lang="less" scoped>
.build-configs {
  margin-top: -50px;

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
