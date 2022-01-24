<template>
  <div style="width: 100%; height: 250px;">
    <el-table :data="tableData"
              v-loading="loading"
              :show-header="true"
              class="build-table">
      <el-table-column prop="taskId"
                       label="任务号">
        <template slot-scope="scope">
          <router-link class="task-link"
                       :to="`/v1/projects/detail/${scope.row.productName}/pipelines/multi/${scope.row.pipelineName}/${scope.row.taskId}?status=${scope.row.status}`">
            {{scope.row.pipelineName}}#{{scope.row.taskId}}</router-link>
        </template>
      </el-table-column>
      <el-table-column prop="maxDuration"
                       width="100px"
                       label="时长">
        <template slot-scope="scope">
          {{ $utils.timeFormat(scope.row.maxDuration) }}
        </template>
      </el-table-column>
      <el-table-column prop="createTime"
                       label="日期">
        <template slot-scope="scope">
          <span class="date-info">
            {{ $utils.convertTimestamp(scope.row.createTime) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="status"
                       width="60px"
                       label="状态">
        <template slot-scope="scope">
          <el-tag effect="dark"
                  size="mini"
                  :type="$utils.taskElTagType(scope.row.status)"
                  close-transition>
            {{ wordTranslation(scope.row.status,'pipeline','task') }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import { getLongestBuildsAPI } from '@api'
import { wordTranslate } from '@utils/wordTranslate'
export default {
  data () {
    return {
      tableData: [
      ],
      loading: true
    }
  },
  methods: {
    getLongestBuilds () {
      this.loading = true
      const startTime = Math.floor(this.startTime.getTime() / 1000)
      const endTime = Math.floor(this.endTime.getTime() / 1000)
      const selectedProjects = this.selectedProjects
      getLongestBuildsAPI({ startDate: startTime, endDate: endTime, projectNames: selectedProjects }).then((res) => {
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
      this.getLongestBuilds()
    },
    'startTime' (val, old_val) {
      this.getLongestBuilds()
    },
    'endTime' (val, old_val) {
      this.getLongestBuilds()
    }
  },
  mounted () {
    this.getLongestBuilds()
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
.task-link {
  color: #1989fa;
}

.task-link,
.date-info {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.build-table {
  width: 100%;
  font-size: 12px;

  th,
  tr {
    background-color: #f5f7f7 !important;
  }

  &.el-table {
    th,
    td {
      padding: 0;
    }
  }
}
</style>
