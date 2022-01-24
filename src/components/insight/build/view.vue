<template>
  <div class="insight-build">
    <el-row class="row-container"
            :gutter="20">
      <el-col :span="8">
        <div class="chart-wrapper">
          <div class="chart-container">
            <div class="chart-title">
              <span class="head">构建趋势(周)</span>
              <span class="duration">{{getSetTime}}</span>
            </div>
            <BuildTrend :startTime="selectedDuration[0]"
                        :endTime="selectedDuration[1]"
                        :selectedProjects="selectedProjects"/>
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="chart-wrapper">
          <div class="chart-container">
            <div class="chart-title">
              <span class="head">构建健康度</span>
              <span class="duration">{{getSetTime}}</span>
            </div>
            <Health :startTime="selectedDuration[0]"
                         :endTime="selectedDuration[1]"
                         :selectedProjects="selectedProjects"/>
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="chart-wrapper">
          <div class="chart-container">
            <div class="chart-title">
              <span class="head">最近 10 次构建</span>
            </div>
            <RecentBuild :selectedProjects="selectedProjects"/>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row class="row-container"
            :gutter="20">
      <el-col :span="8">
        <div class="chart-wrapper">
          <div class="chart-container">
            <div class="chart-title">
              <span class="head">日构建频次</span>
              <span class="duration">{{getSetTime}}</span>
            </div>
            <DaliyBuildFeq :startTime="selectedDuration[0]"
                           :endTime="selectedDuration[1]"
                           :selectedProjects="selectedProjects"/>
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="chart-wrapper">
          <div class="chart-container">
            <div class="chart-title">
              <span class="head">平均构建时长</span>
              <span class="duration">{{getSetTime}}</span>
            </div>
            <AverageBuildDuration :startTime="selectedDuration[0]"
                                  :endTime="selectedDuration[1]"
                                  :selectedProjects="selectedProjects"/>

          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="chart-wrapper">
          <div class="chart-container">
            <div class="chart-title">
              <span class="head">Top 10 耗时较长的构建</span>
              <span class="duration">{{getSetTime}}</span>
            </div>
            <LongestBuild :startTime="selectedDuration[0]"
                          :endTime="selectedDuration[1]"
                          :selectedProjects="selectedProjects"/>

          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import moment from 'moment'
import RecentBuild from './recentBuilds.vue'
import LongestBuild from './longestBuilds.vue'
import BuildTrend from './trend.vue'
import Health from './health.vue'
import AverageBuildDuration from './averageDuration.vue'
import DaliyBuildFeq from './daliyFeq.vue'
export default {
  components: {
    RecentBuild,
    LongestBuild,
    Health,
    AverageBuildDuration,
    DaliyBuildFeq,
    BuildTrend
  },
  props: {
    selectedProjects: {
      required: true
    },
    selectedDuration: {
      required: true
    }
  },
  computed: {
    getSetTime () {
      const start = moment(this.selectedDuration[0], 'X').format('YYYY/MM/DD')
      const end = moment(this.selectedDuration[1], 'X').format('YYYY/MM/DD')
      return `${start} - ${end}`
    }
  }
}
</script>
<style lang="less">
@import "~@assets/css/component/insight-charts.less";
</style>
