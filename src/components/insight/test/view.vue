<template>
  <div class="insight-test">
    <el-row class="row-container" :gutter="20">
      <el-col :span="8">
        <div class="chart-wrapper">
          <div class="chart-container">
            <div class="chart-title">
              <span class="head">测试趋势</span>
              <span class="duration">{{getSetTime}}</span>
            </div>
            <Trend :startTime="selectedDuration[0]" :endTime="selectedDuration[1]" :selectedProjects="selectedProjects"/>
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="chart-wrapper">
          <div class="chart-container">
            <div class="chart-title">
              <span class="head">测试健康度</span>
              <span class="duration">{{getSetTime}}</span>
            </div>
            <Health :startTime="selectedDuration[0]" :endTime="selectedDuration[1]" :selectedProjects="selectedProjects"/>
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="chart-wrapper">
          <div class="chart-container">
            <div class="chart-title">
              <span class="head">周测试收益（执行次数 x 测试用例数）</span>
              <span class="duration">{{getSetTime}}</span>
            </div>
            <TestCases :startTime="selectedDuration[0]" :endTime="selectedDuration[1]" :selectedProjects="selectedProjects"/>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row class="row-container" :gutter="20">
      <el-col :span="8">
        <div class="chart-wrapper">
          <div class="chart-container">
            <div class="chart-title">
              <span class="head">平均测试时长</span>
              <span class="duration">{{getSetTime}}</span>
            </div>
            <AverageTestDuration :startTime="selectedDuration[0]" :endTime="selectedDuration[1]" :selectedProjects="selectedProjects"/>
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="chart-wrapper">
          <div class="chart-container">
            <div class="chart-title">
              <span class="head">周交付部署次数</span>
              <span style="visibility: hidden;" class="duration">{{getSetTime}}</span>
            </div>
            <Deploy :startTime="selectedDuration[0]" :endTime="selectedDuration[1]" :selectedProjects="selectedProjects"/>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import moment from 'moment'
import Trend from './trend.vue'
import Health from './health.vue'
import AverageTestDuration from './averageDuration.vue'
import TestCases from './TestCases.vue'
import Deploy from './deploy.vue'
export default {
  components: {
    Health,
    AverageTestDuration,
    Trend,
    TestCases,
    Deploy
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
