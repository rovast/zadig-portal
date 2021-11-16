<template>
  <div class="common-task-detail">
    <section>
      <h4>基本信息</h4>
      <article>
        <el-row :gutter="10">
          <el-col :span="6" class="basic-info">
            <div>
              <span class="info">状态</span>
              <span class="detail">
                <el-tag>{{}}</el-tag>
              </span>
            </div>
            <div>
              <span>创建者</span>
              <span>
                <el-tag>{{}}</el-tag>
              </span>
            </div>
            <div>
              <span>持续时间</span>
              <span>
                <el-tag>{{}}</el-tag>
              </span>
            </div>
            <div>
              <span>操作</span>
              <span>
                <el-button type="text">失败重试</el-button>
              </span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="section-head">变量列表</div>
            <el-table :data="varList" style="width: 100%;" max-height="200">
              <el-table-column prop="key" label="变量"></el-table-column>
              <el-table-column prop="value" label="值"></el-table-column>
            </el-table>
          </el-col>
        </el-row>
      </article>
    </section>
    <section>
      <h4>构建</h4>
      <article>
        <el-row :gutter="10">
          <el-col :span="6">
            <i class></i>创建状态
          </el-col>
          <el-col :span="6">{{}}</el-col>
          <el-col :span="6">
            <i class></i>持续时间
          </el-col>
          <el-col :span="6">{{}}</el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="6">
            <i class></i>
            代码库{{}}
          </el-col>
          <el-col :span="6">{{}}</el-col>
          <el-col :span="6">
            <i class></i>构建信息
          </el-col>
          <el-col :span="6">{{}}</el-col>
        </el-row>
        <el-collapse>
          <el-collapse-item title="查看构建日志">
            <div>xterm</div>
          </el-collapse-item>
        </el-collapse>
      </article>
    </section>
    <section>
      <h4>扩展</h4>
      <article>
        <el-row :gutter="10">
          <el-col :span="6">状态</el-col>
          <el-col :span="6">{{}}</el-col>
          <el-col :span="6">持续时间</el-col>
          <el-col :span="6">{{}}</el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="6">AppID</el-col>
          <el-col :span="6">{{}}</el-col>
          <el-col :span="6">版本号</el-col>
          <el-col :span="6">{{}}</el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="6">体验码</el-col>
          <el-col :span="6">image</el-col>
        </el-row>
      </article>
    </section>
  </div>
</template>

<script>
export default {
  data () {
    return {
      varList: [
        {
          key: 'key-test',
          value: 'value-test'
        }
      ],
      external: {}
    }
  }
}
</script>

<style lang="less" scoped>
.common-task-detail {
  .basic-info {
    line-height: 2;

    .info {
      display: inline-block;
      width: 100px;
    }

    .detail {
      color: #000;
    }
  }
}
</style>
