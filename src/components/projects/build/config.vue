<template>
  <div class="buildConfig-container">
    <!--start of edit service target dialog-->
    <el-dialog title="修改服务" width="40%" custom-class="create-buildconfig" :visible.sync="dialogEditTargetVisible">
      <el-form label-position="top" :model="editBuildManageTargets" @submit.native.prevent ref="editTargetForm">
        <el-form-item label="服务组件">
          <el-select v-model="editBuildManageTargets.targets" value-key="key" multiple filterable>
            <el-option
              v-for="(service,index) in serviceTargets"
              :key="index"
              :label="`${service.service_module}(${service.service_name})`"
              :value="service"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" native-type="submit" @click="saveServiceTarget()" class="start-create">确定</el-button>
      </div>
    </el-dialog>
    <!--end of edit service target dialog-->
    <section class="tab-container">
      <div class="build-search-container">
        <el-input v-model.lazy="searchBuildConfig" placeholder="请输入构建名称" class="search-test" autofocus prefix-icon="el-icon-search"></el-input>
      </div>
      <el-table :data="filteredBuildConfigs">
        <el-table-column label="名称" prop="name" min-width="180"></el-table-column>
        <el-table-column prop="services" label="服务组件" min-width="180">
          <template slot-scope="scope">
            <div class="service-container">
              <div v-if="scope.row.targets.length > 0" class="service-left">
                <div v-for="(item,index) in scope.row.targets" :key="index">
                  <el-tooltip effect="dark" :content="item.service_name" placement="top">
                    <span>{{ item.service_module }}</span>
                  </el-tooltip>
                </div>
              </div>
              <div v-hasPermi="{projectName: projectName, action: 'edit_build'}" class="change-serviceTarget">
                <i @click="changeServiceTargets(scope.row)" class="el-icon-edit-outline"></i>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="180">
          <template slot-scope="scope">{{ $utils.convertTimestamp(scope.row.update_time) }}</template>
        </el-table-column>
        <el-table-column label="最后修改" prop="update_by" width="180"></el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <router-link
              v-hasPermi="{projectName: projectName, action: 'edit_build'}"
              :to="`/v1/projects/detail/${scope.row.productName}/builds/detail/${scope.row.name}`"
            >
              <el-button type="primary" size="mini" plain>编辑</el-button>
            </router-link>
            <el-button
              v-hasPermi="{projectName: projectName, action: 'delete_build'}"
              @click="removeBuildConfig(scope.row)"
              type="danger"
              size="mini"
              plain
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>

<script>
import {
  getBuildConfigsAPI,
  deleteBuildConfigAPI,
  saveBuildConfigTargetsAPI,
  getServiceTargetsAPI
} from '@api'
import { flattenDeep } from 'lodash'
import bus from '@utils/eventBus'
export default {
  data () {
    return {
      buildConfigs: [],
      serviceTargets: [],
      editBuildManageTargets: {
        name: '',
        targets: []
      },
      searchBuildConfig: '',
      dialogEditTargetVisible: false,
      searchInputVisible: false
    }
  },
  methods: {
    filterAvailableServices (services) {
      const existServices = []
      this.buildConfigs.forEach(element => {
        existServices.push(element.targets)
      })
      return services.filter(element => {
        if (!flattenDeep(existServices).includes(element.service_name)) {
          return element
        }
        return false
      })
    },
    removeBuildConfig (obj) {
      const projectName = this.projectName
      const str =
        obj.pipelines.length > 0
          ? `该配置在 ${obj.pipelines} 存在引用，确定要删除 ${obj.name} 吗？`
          : `确定要删除 ${obj.name} 吗？`
      this.$confirm(str, '确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteBuildConfigAPI(obj.name, obj.version, projectName).then(() => {
          this.$message.success('删除成功')
          this.getBuildConfig()
        })
      })
    },
    changeServiceTargets (scope) {
      const projectName = this.projectName
      getServiceTargetsAPI(projectName).then(data => {
        this.serviceTargets = [
          ...this.filterAvailableServices(data),
          ...scope.targets
        ].map(element => {
          element.key = element.service_name + '/' + element.service_module
          return element
        })
      })
      this.editBuildManageTargets = this.$utils.cloneObj(scope)
      this.dialogEditTargetVisible = true
    },
    saveServiceTarget () {
      const projectName = this.projectName
      const targetsPayload = {
        name: this.editBuildManageTargets.name,
        targets: this.editBuildManageTargets.targets,
        productName: projectName
      }
      saveBuildConfigTargetsAPI(projectName, targetsPayload).then(() => {
        this.dialogEditTargetVisible = false
        this.getBuildConfig()
        this.$message({
          type: 'success',
          message: '修改服务成功'
        })
      })
    },
    getBuildConfig () {
      const projectName = this.projectName
      getBuildConfigsAPI(projectName).then(res => {
        res.forEach(element => {
          element.targets = element.targets.map(t => {
            t.key = t.service_name + '/' + t.service_module
            return t
          })
        })
        this.buildConfigs = this.$utils.deepSortOn(res, 'name')
      })
    }
  },
  computed: {
    filteredBuildConfigs () {
      if (this.searchBuildConfig) {
        this.$router.replace({
          query: {
            name: this.searchBuildConfig
          }
        })
      }
      return this.$utils.filterObjectArrayByKey(
        'name',
        this.searchBuildConfig,
        this.buildConfigs
      )
    },
    projectName () {
      return this.$route.params.project_name
    }
  },
  created () {
    this.getBuildConfig()
    if (this.$route.query.name) {
      this.searchInputVisible = true
      this.searchBuildConfig = this.$route.query.name
    } else if (this.$route.query.add) {
      this.$router.replace(
        `/v1/projects/detail/${this.projectName}/builds/create`
      )
    }
    bus.$emit('set-topbar-title', {
      title: '',
      breadcrumb: [
        { title: '项目', url: '/v1/projects' },
        {
          title: this.projectName,
          url: `/v1/projects/detail/${this.projectName}/detail`
        },
        { title: '构建', url: '' }
      ]
    })
  }
}
</script>

<style lang="less" scoped>
.buildConfig-container {
  position: relative;
  flex: 1;
  height: 100%;
  padding: 15px 20px;
  overflow: auto;

  .create-buildconfig {
    width: 400px;

    .dialog-footer {
      .start-create {
        width: 100%;
      }
    }

    .el-select {
      width: 100%;
    }
  }

  .build-search-container {
    height: 40px;
    margin-bottom: 10px;
    text-align: right;

    .search-test {
      width: 400px;
    }
  }

  .service-container {
    display: flex;
    align-items: center;

    .service-left {
      width: 180px;
    }

    .change-serviceTarget {
      margin-left: 20px;
      color: @themeColor;
      font-size: 16px;
      cursor: pointer;
    }
  }
}
</style>
