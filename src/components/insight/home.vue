<template>
  <div class="insight-home">
    <div class="header">
      <div class="type-container">
        <el-select style="width: 200px;" v-model="activeTab" size="small" @change="changeRoute" placeholder="请选择指标">
          <el-option label="构建洞察" value="build"></el-option>
          <el-option label="测试洞察" value="test"></el-option>
          <el-option label="持续交付洞察" value="service"></el-option>
        </el-select>
      </div>
      <div class="date-container">
        <el-select style="width: 350px;" v-model="selectedProjects" size="small" multiple placeholder="筛选项目">
          <el-option v-for="item in projects" :key="item.name" :label="item.name" :value="item.name"></el-option>
        </el-select>
        <el-date-picker
          v-model="selectedDuration"
          type="daterange"
          align="right"
          size="small"
          unlink-panels
          range-separator="-"
          value-format="timestamp"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="pickerOptions"
        ></el-date-picker>
      </div>
    </div>
    <router-view :selectedProjects="selectedProjects" :selectedDuration="selectedDuration"></router-view>
  </div>
</template>
<script>
import { getProjectsAPI } from '@api'
import bus from '@utils/eventBus'
export default {
  data () {
    return {
      pickerOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick (picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick (picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三个月',
            onClick (picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一年',
            onClick (picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 365)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      },
      selectedDuration: [new Date().getTime() - 3600 * 1000 * 24 * 30, new Date().getTime()],
      selectedProjects: [],
      projects: [],
      activeTab: 'build'
    }
  },
  methods: {
    getProjects () {
      getProjectsAPI().then(res => {
        this.projects = res
      })
    },
    changeRoute (tab) {
      if (tab === 'build') {
        this.activeTab = 'build'
        this.$router.push(`/v1/insight/build`)
      } else if (tab === 'test') {
        this.activeTab = 'test'
        this.$router.push(`/v1/insight/test`)
      } else if (tab === 'service') {
        this.activeTab = 'service'
        this.$router.push(`/v1/insight/service`)
      }
    },
    setActiveTab () {
      if (this.$route.path === '/v1/insight/build') {
        this.activeTab = 'build'
      } else if (this.$route.path === '/v1/insight/test') {
        this.activeTab = 'test'
      } else if (this.$route.path === '/v1/insight/service') {
        this.activeTab = 'service'
      } else {
        this.$router.push(`/v1/insight/build`)
      }
    }
  },
  watch: {
    '$route' (to, from) {
      this.setActiveTab()
    }
  },
  mounted () {
    this.setActiveTab()
    this.getProjects()
    bus.$emit(`show-sidebar`, true)
    bus.$emit(`set-topbar-title`, { title: '效能洞察', breadcrumb: [] })
  }
}
</script>
<style lang="less">
.insight-home {
  position: relative;
  flex: 1;
  padding: 20px 30px;
  overflow: auto;
  line-height: 1.5;

  .header {
    display: flex;
    justify-content: space-between;

    .type-container {
      flex-shrink: 0;
      margin-bottom: 15px;
    }

    .date-container {
      flex-shrink: 0;
      margin-bottom: 15px;

      .el-range-editor {
        &.el-input__inner {
          align-items: baseline;
          padding: 0 10px;
        }
      }
    }
  }
}
</style>
