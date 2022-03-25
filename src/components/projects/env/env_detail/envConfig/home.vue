<template>
  <div class="env-config-container">
    <el-tabs v-model="currentConfig" @tab-click="handleClick" type="card">
      <el-tab-pane v-for="name in allConfig" :key="name" :label="name" :name="name"></el-tab-pane>
    </el-tabs>
    <div class="env-config-content">
      <CommonConfig :currentType="currentConfig"></CommonConfig>
    </div>
  </div>
</template>

<script>
import CommonConfig from '@/components/projects/env/env_detail/envConfig/commonConfig'
export default {
  data () {
    return {
      currentConfig: '',
      allConfig: ['Ingress', 'ConfigMap', 'Secret', 'PVC']
    }
  },
  methods: {
    handleClick () {
      this.$router.push({ query: { type: this.currentConfig } })
    }
  },
  created () {
    this.currentConfig = this.$route.query.type || this.allConfig[0]
  },
  components: {
    CommonConfig
  }
}
</script>

<style lang="less" scoped>
.env-config-container {
  flex: 1;
  padding: 20px;
  background: #fff;
  border-top: 1px solid #eee;

  .env-config-content {
    margin: 0;
  }
}
</style>
