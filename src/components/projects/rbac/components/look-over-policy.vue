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
      <el-table :data="policyInfo.rules || []">
        <el-table-column label="模块名称">
          <template slot-scope="{ row }">{{ getPolicyDesc(row.resources) }}</template>
        </el-table-column>
        <el-table-column label="权限项">
          <template slot-scope="{ row }">
            <div v-for="verb in row.verbs" :key="verb">{{ getPolicyDesc(verb) }}</div>
          </template>
        </el-table-column>
        <!-- <el-table-column label="过滤规则">
          <template slot-scope="{ row }">
            <div v-for="(attribute, index) in row.match_attributes" :key="index">{{ attribute.key }}={{ attribute.value }}</div>
          </template>
        </el-table-column>-->
        <el-table-column label="关联资源">
          <template slot-scope="{ row }">
            <div v-for="resource in row.relatedResources" :key="resource">{{ resource }}</div>
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
export default {
  props: {
    dialogFlag: Boolean,
    policyInfo: Object,
    policyMap: Object
  },
  data () {
    return {
      loading: false
    }
  },
  computed: {
    policyDialog: {
      get () {
        return this.dialogFlag
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
    getPolicyDesc (action) {
      return this.policyMap[action] || action
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
