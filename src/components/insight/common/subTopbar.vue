<template>
  <div class="insight-subtopbar-container">
    <div class="nav-container">
      <div class="nav-content">
        <ul v-if="routerList.length > 0" class="nav-item-list">
          <router-link v-for="(item,index) in routerList" :key="index" active-class="active" :to="item.url">
            <li class="nav-item">
              <i v-if="item.icon" class="icon" :class="[item.icon]"></i>
              <span class="name">{{item.name}}</span>
            </li>
          </router-link>
        </ul>
      </div>
    </div>
    <div class="operation">
      <el-select v-model="selectedProjects" @change="changeProject" size="small" collapse-tags multiple placeholder="筛选项目">
        <el-option v-for="item in projects" :key="item.name" :label="item.alias" :value="item.name"></el-option>
      </el-select>
      <el-date-picker
        v-model="selectedDuration"
        @change="changeDuration"
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
</template>
<script>
import { getProjectsAPI } from '@api'
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
      selectedDuration: [
        new Date().getTime() - 3600 * 1000 * 24 * 30,
        new Date().getTime()
      ],
      selectedProjects: [],
      projects: []
    }
  },
  props: {},
  computed: {
    routerList () {
      return [
        {
          name: '构建效能',
          icon: 'iconfont icongongzuoliucheng',
          url: `/v1/insight/build`
        },
        {
          name: '测试效能',
          icon: 'iconfont iconvery-testing',
          url: `/v1/insight/test`
        },
        {
          name: '部署效能',
          icon: 'iconfont iconvery-environ',
          url: `/v1/insight/service`
        }
      ]
    }
  },
  methods: {
    changeProject () {
      this.$emit('changeProject', this.selectedProjects)
    },
    changeDuration () {
      this.$emit('changeDuration', this.selectedDuration)
    },
    getProjects () {
      getProjectsAPI().then(res => {
        this.projects = res
      })
    }
  },
  mounted () {
    this.getProjects()
  }
}
</script>
<style lang="less">
.insight-subtopbar-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 60px;
  padding-right: 40px;
  padding-left: 26px;
  background-color: #fff;

  .nav-container {
    .nav-content {
      .nav-item-list {
        display: flex;

        .nav-item {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 42px;
          padding: 9px 12px;
          color: #000;
          font-weight: 300;
          font-size: 16px;
          line-height: 22px;
          cursor: pointer;

          .icon {
            margin-right: 18px;
            color: #d2d2d2;
            font-size: 22px;
          }
        }

        a {
          margin-right: 16px;

          &.active {
            box-shadow: inset 0 -2px 0 @themeColor;

            .icon {
              color: @themeColor;
            }
          }
        }
      }
    }
  }

  .operation {
    display: flex;

    .el-select {
      width: 240px;
      margin-right: 24px;
    }

    .el-range-editor {
      &.el-input__inner {
        align-items: baseline;
        width: 240px;
        padding: 0 10px;
      }
    }
  }
}
</style>
