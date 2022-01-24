<template>
  <div style="width: 100%; height: 100%;">
    <v-chart :options="option"
             :autoresize="true" />
  </div>
</template>
<script>
import ECharts from 'vue-echarts'
import 'echarts/lib/component/title'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/legend'
import 'echarts/lib/chart/pie'
import { getServiceHealthAPI } from '@api'
export default {
  data () {
    return {
      option: {
        color: ['#ff1949', '#67c23a'],
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          x: 'left',
          //   data: ['失败', '成功'],
          formatter: (name) => {
            const data = this.option.series[0].data
            if (name && data.length && data[0]) {
              let total = 0
              let target
              for (let i = 0, l = data.length; i < l; i++) {
                total += data[i].value
                if (data[i].name === name) {
                  target = data[i].value
                }
              }
              const percentage = ((target / total) * 100).toFixed(2)
              return `${name} ${target} ${total !== 0 ? '(' + percentage + '%)' : ''}`
            }
            return '-'
          }
        },
        series: [
          {
            name: '任务状态',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            stillShowZeroSum: false,
            label: {
              normal: {
                show: true,
                position: 'center',
                color: '#ccc',
                textStyle: {
                  fontSize: '30',
                  fontWeight: 'bold'
                },
                formatter: (name) => {
                  const data = this.option.series[0].data
                  if (name && data.length && data[0]) {
                    let total = 0
                    for (let i = 0, l = data.length; i < l; i++) {
                      total += data[i].value
                    }
                    return `${total}`
                  }
                  return '-'
                }
              },
              emphasis: {
                show: false,
                textStyle: {
                  fontSize: '30',
                  fontWeight: 'bold'
                }
              }
            },
            labelLine: {
              normal: {
                show: false
              }
            },
            data: [
              { value: 0, name: '失败' },
              { value: 0, name: '成功' }
            ]
          }
        ]
      }
    }
  },
  methods: {
    getServiceHealth () {
      const startTime = Math.floor(this.startTime.getTime() / 1000)
      const endTime = Math.floor(this.endTime.getTime() / 1000)
      const selectedProjects = this.selectedProjects
      getServiceHealthAPI({ startDate: startTime, endDate: endTime, projectNames: selectedProjects }).then((res) => {
        this.option.series[0].data = [{
          value: res.totalFailure, name: '失败'
        }, { value: res.totalSuccess, name: '成功' }
        ]
      })
    }
  },
  components: {
    'v-chart': ECharts
  },
  watch: {
    'startTime' (val, old_val) {
      this.getServiceHealth()
    },
    'endTime' (val, old_val) {
      this.getServiceHealth()
    },
    'selectedProjects' (val, old_val) {
      this.getServiceHealth()
    }
  },
  props: {
    startTime: {
      required: true
    },
    endTime: {
      required: true
    },
    selectedProjects: {
      required: true
    }
  }
}
</script>
<style lang="less">
.echarts {
  width: 100% !important;
  height: 100% !important;
}
</style>
