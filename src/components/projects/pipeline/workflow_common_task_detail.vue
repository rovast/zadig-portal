<template>
  <div class="common-task-detail">
    <el-row :gutter="30">
      <el-col :span="10" class="basic-info">
        <h4>基本信息</h4>
        <div>
          <span class="info">状态</span>
          <span class="detail">
            <el-tag size="mini">{{}}</el-tag>
          </span>
        </div>
        <div>
          <span class="info">创建者</span>
          <span class="detail">{{}}</span>
        </div>
        <div>
          <span class="info">持续时间</span>
          <span class="detail">{{}}</span>
        </div>
        <div>
          <span class="info">操作</span>
          <span class="detail">
            <el-button type="text">失败重试</el-button>
          </span>
        </div>
      </el-col>
      <el-col :span="10">
        <h4>变量列表</h4>
        <el-table :data="varList" style="width: 100%;" max-height="200">
          <el-table-column prop="key" label="变量"></el-table-column>
          <el-table-column prop="value" label="值"></el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <section>
      <h4>构建</h4>
      <article>
        <el-row :gutter="10">
          <el-col :span="6">
            <i class="iconfont iconzhuangtai"></i> 创建状态
          </el-col>
          <el-col :span="6">{{}}</el-col>
          <el-col :span="6">
            <i class="iconfont iconshijian"></i> 持续时间
          </el-col>
          <el-col :span="6">{{}}</el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="6">
            <i class="iconfont icondaima"></i>
            代码库{{}}
          </el-col>
          <el-col :span="6">{{}}</el-col>
          <el-col :span="6">
            <i class="iconfont iconinfo"></i> 构建信息
          </el-col>
          <el-col :span="6">{{}}</el-col>
        </el-row>
        <el-collapse>
          <el-collapse-item title="查看构建日志">
            <div>xterm</div>
          </el-collapse-item>
        </el-collapse>
      </article>
    </section>
    <section>
      <h4>扩展</h4>
      <article>
        <el-row :gutter="10">
          <el-col :span="6">状态</el-col>
          <el-col :span="6">{{}}</el-col>
          <el-col :span="6">持续时间</el-col>
          <el-col :span="6">{{}}</el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="6">AppID</el-col>
          <el-col :span="6">{{}}</el-col>
          <el-col :span="6">版本号</el-col>
          <el-col :span="6">{{}}</el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="6">体验码</el-col>
          <el-col :span="6">image</el-col>
        </el-row>
      </article>
    </section>
  </div>
</template>

<script>
import bus from '@utils/event_bus'
export default {
  data () {
    return {
      varList: [
        {
          key: 'key-test',
          value: 'value-test'
        }
      ],
      external: {}
    }
  },
  mounted () {
    this.projectName = this.$route.params.project_name
    bus.$emit('set-topbar-title', {
      title: '',
      breadcrumb: [
        { title: '项目', url: '/v1/projects' },
        {
          title: this.projectName,
          url: `/v1/projects/detail/${this.projectName}`
        },
        {
          title: '工作流',
          url: `/v1/projects/detail/${this.projectName}/pipelines`
        },
        { title: this.workflowName, url: '' }
      ]
    })
    bus.$emit('set-sub-sidebar-title', {
      title: this.projectName,
      url: `/v1/projects/detail/${this.projectName}`,
      routerList: [
        {
          name: '工作流',
          url: `/v1/projects/detail/${this.projectName}/pipelines`
        },
        {
          name: '集成环境',
          url: `/v1/projects/detail/${this.projectName}/envs`
        },
        {
          name: '服务',
          url: `/v1/projects/detail/${this.projectName}/services`
        },
        { name: '构建', url: `/v1/projects/detail/${this.projectName}/builds` },
        { name: '测试', url: `/v1/projects/detail/${this.projectName}/test` }
      ]
    })
  }
}
</script>

<style lang="less" scoped>
.common-task-detail {
  padding: 0 30px;
  color: #8d9199;
  font-size: 13px;

  h4 {
    width: 90%;
    margin: 15px 0;
    padding: 18px 20px 18px 0;
    font-weight: normal;
    font-size: 16px;
    line-height: 20px;
    border-bottom: 1px solid #eee;
  }

  .basic-info {
    .info {
      display: inline-block;
      width: 100px;
      margin-bottom: 15px;
    }

    .detail {
      color: #000;

      .icon {
        margin-right: 0.3em;
        font-size: 1.3rem;
        cursor: pointer;

        &:hover {
          color: #409eff;
        }
      }
    }
  }

  section {
    article {
      /deep/.el-row {
        margin-bottom: 15px;
      }
    }
  }
}
</style>
