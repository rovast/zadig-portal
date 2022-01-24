<template>
  <div class="insight-service">
    <el-row class="row-container"
            :gutter="20">
      <el-col :span="12">
        <div class="chart-wrapper">
          <div class="chart-container">
            <div class="chart-title">
              <span class="head">微服务健康度</span>
              <span class="duration">{{getSetTime}}</span>
            </div>
            <Health :startTime="selectedDuration[0]"
                           :endTime="selectedDuration[1]"
                           :selectedProjects="selectedProjects"/>
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="chart-wrapper">
          <div class="chart-container">
            <div class="chart-title">
              <span class="head">微服务周部署频次</span>
              <span class="duration">{{getSetTime}}</span>
            </div>
            <Deploy :startTime="selectedDuration[0]"
                           :endTime="selectedDuration[1]"
                           :selectedProjects="selectedProjects"/>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row class="row-container"
            :gutter="20">
      <el-col :span="12">
        <div class="chart-wrapper">
          <div class="chart-container">
            <div class="chart-title">
              <span class="head">Top 5 微服务部署统计</span>
              <span class="duration">{{getSetTime}}</span>
            </div>
            <DeploySummary :startTime="selectedDuration[0]"
                                  :endTime="selectedDuration[1]"
                                  :selectedProjects="selectedProjects"/>
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="chart-wrapper">
          <div class="chart-container">
            <div class="chart-title">
              <span class="head">Top 5 微服务部署失败统计</span>
              <span class="duration">{{getSetTime}}</span>
            </div>
            <ServiceFailure :startTime="selectedDuration[0]"
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
import Health from './health.vue'
import Deploy from './deploy.vue'
import ServiceFailure from './failure.vue'
import DeploySummary from './deploySummary.vue'

export default {
  components: {
    Health,
    Deploy,
    ServiceFailure,
    DeploySummary
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
