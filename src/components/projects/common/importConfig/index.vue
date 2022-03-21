<template>
  <div class="values-yaml-container">
    <div class="secondary-title">添加环境配置</div>
    <div>
      <el-button type="text" class="title-btn" @click="showGitImportDialog = true">从代码库导入</el-button>
    </div>
    <Resize class="desc mirror" @sizeChange="$refs.codemirror.refresh()">
      <codemirror ref="codemirror" v-model="importRepoInfoUse.overrideYaml"></codemirror>
    </Resize>
    <el-dialog title="环境配置 - 从代码库导入" :visible.sync="showGitImportDialog" append-to-body>
      <Repository ref="valueRepoRef" :repoSource="importRepoInfoUse.gitRepoConfig" :fileType="'k8sYaml'"></Repository>
      <div slot="footer">
        <el-button @click="showGitImportDialog = false" size="small">取 消</el-button>
        <el-button type="primary" @click="importConfigYaml" size="small" :loading="loadValueYamls">导 入</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Resize from '@/components/common/resize'
import Codemirror from '../codemirror.vue'
import Repository from '../importValues/repository.vue'
import { cloneDeep } from 'lodash'
import { getConfigYamlAPI } from '@api'

const valueInfo = {
  overrideYaml: '',
  gitRepoConfig: {
    codehostID: null,
    owner: '',
    repo: '',
    branch: '',
    path: '',
    isDir: false
  }
}

export default {
  data () {
    return {
      showGitImportDialog: false,
      loadValueYamls: false
    }
  },
  props: {
    importRepoInfo: Object
  },
  computed: {
    importRepoInfoUse: {
      get () {
        let gitRepoConfig = {}
        if (!this.importRepoInfo.gitRepoConfig) {
          gitRepoConfig = { gitRepoConfig: cloneDeep(valueInfo.gitRepoConfig) }
        }
        return Object.assign(this.importRepoInfo, gitRepoConfig)
      }
    }
  },
  methods: {
    importConfigYaml () {
      this.$refs.valueRepoRef.validate().then(async () => {
        const repoConfig = this.importRepoInfoUse.gitRepoConfig
        const params = {
          codehostId: repoConfig.codehostID,
          repoOwner: repoConfig.owner,
          repoName: repoConfig.repo,
          branchName: repoConfig.branch,
          path: repoConfig.path,
          isDir: repoConfig.isDir
        }
        this.loadValueYamls = true
        const res = await getConfigYamlAPI(params).catch(error =>
          console.log(error)
        )
        this.loadValueYamls = false
        if (res) {
          this.showGitImportDialog = false
          this.importRepoInfoUse.overrideYaml = res
        }
      })
    }
  },
  components: {
    Codemirror,
    Resize,
    Repository
  }
}
</script>

<style lang="less" scoped>
.values-yaml-container {
  margin: 12px 0;
  line-height: 1;

  .title-btn {
    font-weight: 300;
    font-size: 12px;
  }

  .desc {
    color: #a1a3a7;
    font-size: 14px;
  }
}

/deep/.el-dialog {
  .el-dialog__header {
    text-align: center;
    border-bottom: 1px solid #d2d2d2;
  }

  .el-dialog__body {
    padding: 40px 106px 0;
  }
}
</style>
