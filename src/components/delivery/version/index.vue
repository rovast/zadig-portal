<template>
  <div
    v-loading="loading"
    element-loading-text="加载中..."
    element-loading-spinner="iconfont iconfont-loading iconbanben"
    class="version-list-container"
  >
    <div v-if="versionList.length !== 0" class="operation">
      <el-select
        style="width: 160px;"
        v-model="selectedService"
        @change="searchVersionByService"
        placeholder="请选择服务名称"
        clearable
        size="medium"
      >
        <el-option v-for="(item,index) in serviceList" :key="index" :label="item" :value="item"></el-option>
      </el-select>
    </div>
    <el-table :data="versionList" v-show="versionList.length > 0" style="width: 100%;">
      <el-table-column label="版本">
        <template slot-scope="scope">
          <span class="version-link">
            <router-link
              v-if="projectName"
              :to="`/v1/projects/detail/proxy/version/detail/${scope.row.versionInfo.productName}/${scope.row.versionInfo.id}?version=${scope.row.versionInfo.version}&type=${scope.row.versionInfo.type}`"
            >
              {{
              scope.row.versionInfo.version }}
            </router-link>
            <router-link
              v-else
              :to="`/v1/delivery/version/detail/${scope.row.versionInfo.productName}/${scope.row.versionInfo.id}?version=${scope.row.versionInfo.version}&type=${scope.row.versionInfo.type}`"
            >
              {{
              scope.row.versionInfo.version }}
            </router-link>
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="create_by" label="所属项目">
        <template slot-scope="scope">
          <span>{{ scope.row.versionInfo.productName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="标签">
        <template slot-scope="scope">
          <span v-for="(label,index) in scope.row.versionInfo.labels" :key="index" style="margin-right: 3px;">
            <el-tag size="small">{{label}}</el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="create_by" label="创建人">
        <template slot-scope="scope">
          <span>{{ scope.row.versionInfo.createdBy }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="create_at" label="创建时间">
        <template slot-scope="scope">
          <span>{{ $utils.convertTimestamp(scope.row.versionInfo.created_at) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button size="mini" @click="deleteVersion(scope.row.versionInfo)" type="danger" plain>删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-if="versionList.length === 0 || loading" class="version-not-available">
      <img src="@assets/icons/illustration/version_manage.svg" alt />
    </div>
  </div>
</template>

<script>
import bus from '@utils/eventBus'
import {
  getVersionListAPI,
  getVersionServiceListAPI,
  deleteVersionAPI
} from '@api'
export default {
  data () {
    return {
      loading: false,
      versionList: [],
      serviceList: [],
      selectedService: ''
    }
  },
  methods: {
    deleteVersion (version) {
      const projectName = version.productName
      const versionId = version.id
      this.$confirm(`确定删除 ${version.version} 这个版本？`, '删除版本', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteVersionAPI(projectName, versionId).then(res => {
            this.$message({
              type: 'success',
              message: '版本删除成功'
            })
            this.getVersionServiceList()
            this.searchVersionByService()
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    searchVersionByService () {
      this.loading = true
      const selectedService = this.selectedService
      const projectName = this.projectName ? this.projectName : ''
      getVersionListAPI('', projectName, '', selectedService, 'brief')
        .then(res => {
          this.versionList = res
          this.loading = false
        })
        .catch(err => {
          this.$message.error(`获取版本信息出错：${err}`)
          this.loading = false
        })
    },
    getVersionServiceList () {
      const projectName = this.projectName ? this.projectName : ''
      getVersionServiceListAPI(projectName).then(res => {
        this.serviceList = res
      })
    }
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    },
    inProject () {
      return this.$route.path.indexOf('/v1/projects/detail') > -1
    }
  },
  created () {
    if (this.inProject) {
      bus.$emit(`set-topbar-title`, {
        title: '',
        breadcrumb: [
          { title: '项目', url: `/v1/projects` },
          {
            title: this.projectName,
            url: `/v1/projects/detail/${this.projectName}/detail`
          },
          { title: '版本管理', url: `` }
        ]
      })
    } else {
      bus.$emit(`set-topbar-title`, {
        title: '',
        breadcrumb: [
          { title: '交付中心', url: `/v1/delivery` },
          { title: '版本管理', url: `` }
        ]
      })
    }

    this.getVersionServiceList()
    this.searchVersionByService()
  }
}
</script>

<style lang="less">
.version-list-container {
  position: relative;
  flex: 1;
  padding: 24px 24px;
  overflow: auto;

  .version-link {
    a {
      color: @themeColor;
    }
  }

  .operation {
    margin-bottom: 16px;
  }

  .version-not-available {
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
  }
}
</style>
