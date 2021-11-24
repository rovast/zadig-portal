<template>
  <div class="helm-version-detail">
    <el-tabs type="border-card">
      <el-tab-pane label="版本信息">
        <div v-loading="loading">
          <div class="version-title">基本信息</div>
          <div class="basic-info">
            <el-row :gutter="10">
              <el-col :span="10">
                版本：
                <span class="dark-color">{{versionInfo.version}}</span>
              </el-col>
              <el-col :span="10">
                标签：
                <el-tag size="mini" v-for="(label,index) in versionInfo.labels" :key="index" style="margin-right: 5px;">{{label}}</el-tag>
              </el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="10">
                创建人：
                <span class="dark-color">{{versionInfo.createdBy}}</span>
              </el-col>
              <el-col :span="10">
                创建时间：
                <span class="dark-color">{{$utils.convertTimestamp(versionInfo.created_at)}}</span>
              </el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="10">
                描述：
                <span class="dark-color">{{versionInfo.desc}}</span>
              </el-col>
            </el-row>
          </div>
          <div class="version-title">
            交付内容
            <el-popover placement="right" trigger="click">
              <div>
                <div>
                  进度详情
                  <el-button type="text" class="little-btn">重试</el-button>
                </div>
                <div style="width: 250px; padding: 0 5px;">
                  <p>上传 Chart 和镜像：{{}}</p>
                  <p>上传离线包：{{}}</p>
                  <p>错误信息：{{}}</p>
                </div>
              </div>
              <el-button slot="reference" type="text" class="little-btn">进度详情</el-button>
            </el-popover>
          </div>
          <div class="push-info">
            <div class="push-title">Chart 信息</div>
            <el-table :data="charts" style="width: 100%;">
              <el-table-column prop="name" label="Chart 名称"></el-table-column>
              <el-table-column prop="repo" label="Chart 仓库"></el-table-column>
              <el-table-column prop="version" label="版本库"></el-table-column>
              <el-table-column label="操作">
                <!-- <el-button type="text">预览</el-button> -->
                <el-button type="text">下载</el-button>
              </el-table-column>
            </el-table>
            <div class="push-title">服务信息</div>
            <el-table :data="services" style="width: 100%;">
              <el-table-column prop="service" label="服务名称"></el-table-column>
              <el-table-column prop="image" label="镜像名称"></el-table-column>
            </el-table>
            <div class="push-title">离线包信息</div>
            <el-table :data="tars" style="width: 100%;">
              <el-table-column prop="name" label="离线包名称"></el-table-column>
              <el-table-column prop="store" label="对象存储"></el-table-column>
            </el-table>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane disabled>
        <span slot="label" class="version-push" @click="upgradeVersion">
          <i class="el-icon-upload2"></i> 版本发布
        </span>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { getVersionListAPI } from '@api'
export default {
  data () {
    return {
      loading: false,
      versionInfo: {},
      version: '1.3.0',
      tag: '开源版',
      desc: 'test',
      charts: [
        {
          name: 'zadig',
          repo: 'xxx',
          version: '1.3.0'
        }
      ],
      services: [
        {
          service: 'aslan',
          image: 'xxx'
        }
      ],
      tars: [
        {
          name: 'zadig.tar.gz',
          store: 'xxx',
          status: 'succss'
        }
      ]
    }
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    },
    versionId () {
      return this.$route.params.id
    }
  },
  methods: {
    upgradeVersion () {
      console.log('upgrade')
    },
    getVersionDetail () {
      this.loading = true
      const versionId = this.versionId
      const projectName = this.projectName
      getVersionListAPI('', projectName, '').then(res => {
        this.loading = false
        this.versionInfo = res.find(
          item => item.versionInfo.id === versionId
        ).versionInfo
      })
    }
  },
  created () {
    this.getVersionDetail()
  }
}
</script>

<style lang="less" scoped>
.helm-version-detail {
  padding: 20px 30px;

  /deep/.el-tabs {
    .el-tabs__nav.is-top {
      width: 100%;

      .el-tabs__item.is-disabled {
        float: right;

        .version-push {
          color: #1989fa;
          cursor: pointer;
        }
      }
    }
  }

  .version-title {
    padding-bottom: 5px;
    color: #999;
    font-size: 16px;
    line-height: 20px;
    border-bottom: 1px solid #ebeef5;
  }

  .basic-info {
    padding: 12px 20px;
    color: #8d9199;
    font-size: 13px;

    /deep/.el-row {
      margin-bottom: 15px;
    }
  }

  .push-title {
    width: 200px;
    margin: 20px 0 15px;
    color: #666;
    font-size: 14px;
    line-height: 2;
    border-bottom: 1px solid #eee;
  }

  .push-info {
    padding: 0 20px 12px;
  }

  /deep/.el-table {
    .el-table__cell {
      padding: 6px 0;
    }
  }

  .dark-color {
    color: #303133;
  }
}

.little-btn {
  margin-left: 5px;
  font-size: 12px;
}
</style>
