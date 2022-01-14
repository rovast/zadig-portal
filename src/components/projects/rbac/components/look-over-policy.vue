<template>
  <el-dialog title="策略详情" :visible.sync="policyDialog" width="50%">
    <section class="policy-content" v-loading="loading">
      <div>
        <span class="info-title">策略名称</span>
        <span>{{ policyInfo.name }}</span>
      </div>
      <div style="margin-bottom: 10px;">
        <span class="info-title">描述信息</span>
        <span>{{ policyInfo.describe || '无' }}</span>
      </div>
      <el-table :data="policyInfo.labels || []">
        <el-table-column prop="resource_type" label="模块名称"></el-table-column>
        <el-table-column label="权限项">
          <template slot-scope="{ row }">
            <div v-for="permission in row.permissions" :key="permission">{{ permission }}</div>
          </template>
        </el-table-column>
        <el-table-column label="过滤规则">
          <template slot-scope="{ row }">{{ row.label.key }}={{ row.label.value }}</template>
        </el-table-column>
        <el-table-column label="关联资源">
          <template slot-scope="{ row }">
            <div v-for="resource in row.resources" :key="resource">{{ resource }}</div>
          </template>
        </el-table-column>
      </el-table>
    </section>
    <div slot="footer">
      <el-button type="primary" @click="policyDialog = false" size="small">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getPolicyByIdAPI } from '@api'
export default {
  props: {
    dialogFlag: Boolean,
    policyInfo: Object
  },
  data () {
    return {
      loading: false
    }
  },
  computed: {
    policyDialog: {
      get () {
        const visible = this.dialogFlag
        if (visible) {
          this.getPolicy()
        }
        return visible
      },
      set (val) {
        this.loading = false
        this.$emit('update:dialogFlag', val)
      }
    },
    projectName () {
      return this.$route.params.project_name
    }
  },
  methods: {
    getPolicy () {
      if (this.policyInfo.labels) {
        return
      }
      this.loading = true
      getPolicyByIdAPI(this.projectName, this.policyInfo.id).then(res => {
        this.loading = false
        // this.$set(this.policyInfo, 'labels', res.labels)
        this.$set(this.policyInfo, 'labels', [
          {
            resource_type: 'workflow',
            permissions: ['create', 'edit', 'get', 'management'],
            label: {
              key: 'user',
              value: 'zhangsan'
            },
            resources: ['workflow1', 'workflow2']
          }
        ])
      })
    }
  }
}
</script>

<style lang="less" scoped>
/deep/.el-dialog__body {
  padding-top: 10px;

  .policy-content {
    margin: auto 10px;
    color: #777;

    .info-title {
      display: inline-block;
      margin-right: 10px;
      font-weight: 500;
      line-height: 2;
    }
  }
}
</style>
