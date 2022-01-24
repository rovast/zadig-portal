<template>
  <div style="width: 100%; height: 250px;">
    <el-table :data="tableData"
              v-loading="loading"
              height="250"
              :show-header="true"
              class="service-table">
      <el-table-column prop="serviceName"
                       label="服务名">
        <template slot-scope="scope">
          <router-link :to="`/v1/projects/detail/${scope.row.productName}/services?name=${scope.row.serviceName}`">
            <span class="service-name">{{scope.row.serviceName}}</span>
          </router-link>
        </template>
      </el-table-column>

      <el-table-column prop="totalFailure"
                       label="失败次数">
        <template slot-scope="scope">
          <span>{{scope.row.totalFailure}}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import { getServiceFailureAPI } from '@api'
export default {
  data () {
    return {
      tableData: [
      ],
      loading: true
    }
  },
  methods: {
    getServiceFailure () {
      this.loading = true
      const startTime = Math.floor(this.startTime.getTime() / 1000)
      const endTime = Math.floor(this.endTime.getTime() / 1000)
      const selectedProjects = this.selectedProjects
      getServiceFailureAPI({ startDate: startTime, endDate: endTime, projectNames: selectedProjects }).then((res) => {
        this.tableData = res
        this.loading = false
      })
    },
    wordTranslation (word, category, subitem) {
      return wordTranslate(word, category, subitem)
    }
  },
  watch: {
    'selectedProjects' (val, old_val) {
      this.getServiceFailure()
    },
    'startTime' (val, old_val) {
      this.getServiceFailure()
    },
    'endTime' (val, old_val) {
      this.getServiceFailure()
    }
  },
  mounted () {
    this.getServiceFailure()
  },
  props: {
    selectedProjects: {
      required: true
    },
    startTime: {
      required: true
    },
    endTime: {
      required: true
    }
  }
}
</script>

<style lang="less">
.service-name {
  overflow: hidden;
  color: #1989fa;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.service-table {
  width: 100%;
  font-size: 14px;

  th,
  tr {
    background-color: #f5f7f7 !important;
  }

  &.el-table {
    th,
    td {
      padding: 10px;
    }
  }
}
</style>
