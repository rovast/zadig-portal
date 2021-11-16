<template>
  <div class="run-common-workflow">
    <section>
      <div class="title">构建</div>
      <el-table class="content" :data="build" style="width: 100%;">
        <el-table-column prop="repo" label="仓库"></el-table-column>
        <el-table-column prop="branch" label="分支">
          <template slot-scope="{row}">
            <el-select v-model="row.branch" placeholder="请选择分支" size="small">
              <el-option v-for="branch in row.branchs" :key="branch" :label="branch" :value="branch"></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="pr" label="PR">
          <template slot-scope="{row}">
            <el-select v-model="row.pr" placeholder="请选择分支" size="small">
              <el-option v-for="pr in row.prs" :key="pr" :label="pr" :value="pr"></el-option>
            </el-select>
          </template>
        </el-table-column>
      </el-table>
    </section>
    <section>
      <div class="title">变量设置</div>
      <el-table class="content" :data="varSetting" style="width: 100%;">
        <el-table-column prop="key" label="变量"></el-table-column>
        <el-table-column label="值">
          <template slot-scope="{row}">
            <span v-if="row.type === 'string'">{{row.value}}</span>
            <el-select v-else v-model="row.value" placeholder="请选择值" size="small">
              <el-option v-for="val in row.defaults" :key="val" :label="val" :value="val"></el-option>
            </el-select>
          </template>
        </el-table-column>
      </el-table>
    </section>
    <footer>
      <el-button type="primary" plain size="small">启动任务</el-button>
    </footer>
  </div>
</template>

<script>
export default {
  data () {
    return {
      build: [
        {
          repo: '',
          branch: '',
          branchs: ['b1', 'b2', 'b3'],
          pr: '',
          prs: ['p1', 'p2', 'p3']
        }
      ],
      varSetting: [
        {
          key: '',
          value: '',
          defaults: ['1', '2', '3'],
          type: 'string'
        }
      ]
    }
  }
}
</script>

<style lang="less" scoped>
.run-common-workflow {
  margin: 0 20px 10px;

  .title {
    font-weight: 600;
    font-size: 14px;
    line-height: 2;
  }

  .content {
    width: 80%;
    margin: auto;
    margin-bottom: 10px;
  }

  footer {
    text-align: right;
  }
}
</style>
