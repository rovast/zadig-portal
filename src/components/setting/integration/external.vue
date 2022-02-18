<template>
  <div class="integration-external">
    <h4 class="title">Jenkins 集成</h4>
    <Jenkins class="content"></Jenkins>

    <h4 class="title">Jira 集成</h4>
    <Jira class="content"></Jira>

    <h4 class="title">其他外部系统</h4>
    <Other class="content"></Other>
  </div>
</template>

<script>
import Jira from './jira.vue'
import Jenkins from './jenkins.vue'
import Other from './other.vue'

export default {
  components: {
    Jira,
    Jenkins,
    Other
  }
}
</script>

<style lang="less" scoped>
.integration-external {
  h4 {
    margin: 14px 0;
  }

  .content {
    margin-bottom: 20px;
  }
}
</style>
