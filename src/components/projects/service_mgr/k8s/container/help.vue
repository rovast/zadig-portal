<template>
  <section class="pipeline-help">
    <p class="pipelines-aside-help__welcome-message">
      欢迎使用帮助指南。可参考以下步骤配置服务
    </p>
    <h3 class="pipelines-aside-help__step-header">
    </h3>
    <ul class="pipelines-aside-help__step-list">
      <li class="pipelines-aside-help__step-list-item">
        <div class="pipelines-aside-help__step-list-item-counter">
          1
        </div>
        <p class="pipelines-aside-help__step-list-item-text">
          点击 + 新建服务，输入服务名称，例如：voting
        </p>
      </li>
      <li class="pipelines-aside-help__step-list-item">
        <div class="pipelines-aside-help__step-list-item-counter">
          2
        </div>
        <p class="pipelines-aside-help__step-list-item-text">
          填写该服务的配置信息，支持三种方式
        <ul>
          <li> 方式一：服务的 YAML 保存在平台上</li>
          <li> 方式二：服务的 YAML 保存在代码仓库中，平台通过配置的代码仓库地址实时获取服务配置</li>
          <li> 方式三：服务的 YAML 从模板库导入</li>
        </ul>
        </p>
      </li>
      <li class="pipelines-aside-help__step-list-item">
        <div class="pipelines-aside-help__step-list-item-counter">
          3
        </div>
        <p class="pipelines-aside-help__step-list-item-text">
          添加和修改 YAML 中的变量，在运行环境中会被作为环境变量使用
        <ul>
          <li>容器(服务组件)的镜像版本：通过配置构建步骤，实现版本升级（代码构建->构建镜像->镜像部署）
          </li>
          <li>系统内置变量：可以直接在服务模板配置中引用</li>
          <li>自定义变量：在运行环境中会被作为环境变量使用</li>
        </ul>
        </p>
      </li>
      <li class="pipelines-aside-help__step-list-item">
        <div class="pipelines-aside-help__step-list-item-counter">
          4
        </div>
        <p class="pipelines-aside-help__step-list-item-text">
          添加多个服务，加入运行环境； 也可后续在项目中添加或者删除
        </p>
      </li>
    </ul>
    <h3 class="pipelines-aside-help__step-header">
      文档指南
    </h3>
    <ul class="pipelines-aside-help__step-list">
      <el-row :gutter="20">
        <el-col :span="8">
          <li class="pipelines-aside-help__step-list-item">
            <a target="_blank"
               href="https://docs.koderover.com/zadig/project/service/#%E6%97%A0%E7%8A%B6%E6%80%81%E6%9C%8D%E5%8A%A1"
               class="pipelines-aside-help__step-list-item-link">
              <i class="icon el-icon-link"></i>
              <span class="pipelines-aside-help__step-list-item-link-text">
                无状态服务</span>
            </a>
          </li>
        </el-col>
        <el-col :span="8">
          <li class="pipelines-aside-help__step-list-item">
            <a href="https://docs.koderover.com/zadig/project/service/#%E6%9C%89%E7%8A%B6%E6%80%81%E6%9C%8D%E5%8A%A1"
               target="_blank"
               class="pipelines-aside-help__step-list-item-link">
              <i class="icon el-icon-link"></i>
              <span class="pipelines-aside-help__step-list-item-link-text">有状态服务 </span>
            </a>
          </li>
        </el-col>

      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">
          <li class="pipelines-aside-help__step-list-item">
            <a href="https://docs.koderover.com/zadig/project/build/#%E6%96%B0%E5%BB%BA%E6%9E%84%E5%BB%BA"
               target="_blank"
               class="pipelines-aside-help__step-list-item-link">
              <i class="icon el-icon-link"></i>
              <span class="pipelines-aside-help__step-list-item-link-text">新增构建步骤</span>
            </a>
          </li>
        </el-col>
      </el-row>
    </ul>
  </section>
</template>
<script>
</script>
<style lang="less" scoped>
@import "~@assets/css/component/service-help.less";
</style>
