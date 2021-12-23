<template>
  <section class="policy-content">
    <div class="top">
      <span class="top-title">选择参与成员</span>
      <el-select v-model="model" placeholder="请选择参与的成员" multiple clearable filterable collapse-tags size="small">
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
        <el-option label="all-users(所有用户包括新建用户)" value="all-users"></el-option>
      </el-select>
    </div>

    <div class="level-one-title">配置协作规则</div>

    <div class="level-two-title">工作流</div>
    <el-table :data="data" style="width: 100%;">
      <el-table-column prop="prop" label="基准工作流">
        <template slot-scope="{ row }">
          <el-select v-model="row.xx" placeholder="请选择基准工作流" clearable filterable size="small">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column prop="prop" label="配置">
        <template slot-scope="{ row }">
          <el-radio-group v-model="row.xx">
            <el-radio label="label1">新建</el-radio>
            <el-radio label="label2">共享</el-radio>
          </el-radio-group>
        </template>
      </el-table-column>
      <el-table-column prop="prop" label="操作">
        <template slot-scope="{  }">
          <el-popover ref="popover1" placement="top-start" width="200" trigger="click">
            <div>
              <div class="title">
                <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange"></el-checkbox>
                <i></i>
                所有权限
              </div>
              <el-checkbox-group v-model="test" @change="handleCheckedCitiesChange">
                <el-checkbox label="add">
                  <i class="iconfont iconinformation_add icon"></i> 新建
                </el-checkbox>
                <el-checkbox label="delete">
                  <i class="el-icon-delete"></i> 删除
                </el-checkbox>
                <el-checkbox label="edit">
                  <i class="el-icon-edit-outline"></i> 编辑
                </el-checkbox>
                <el-checkbox label="look">
                  <i class="el-icon-view"></i> 查看
                </el-checkbox>
                <el-checkbox label="run">
                  <i class="el-icon-video-play"></i> 执行
                </el-checkbox>
              </el-checkbox-group>
            </div>
            <el-button type="primary" slot="reference">权限</el-button>
          </el-popover>

          <el-button type="primary">回收策略</el-button>
        </template>
      </el-table-column>
      <el-table-column>
        <template slot-scope="{  }">
          <el-button type="primary">x</el-button>
          <el-button type="primary">+</el-button>
        </template>
      </el-table-column>
      <div slot="empty">
        <el-button type="primary" icon="el-icon-plus" size="small" plain></el-button>
        <el-tag effect="dark">删除工作流将影响参与成员操作权限</el-tag>
      </div>
    </el-table>

    <div class="level-two-title">集成环境</div>
    <el-table :data="data" style="width: 100%;">
      <el-table-column prop="prop" label="基准环境">
        <template slot-scope="{ row }">
          <el-select v-model="row.xx" placeholder="请选择基准环境" clearable filterable size="small">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column prop="prop" label="配置">
        <template slot-scope="{ row }">
          <el-radio-group v-model="row.xx">
            <el-radio label="label1">新建</el-radio>
            <el-radio label="label2">共享</el-radio>
          </el-radio-group>
        </template>
      </el-table-column>
      <el-table-column prop="prop" label="操作">
        <template slot-scope="{  }">
          <el-button type="primary">权限</el-button>
          <el-button type="primary">回收策略</el-button>
        </template>
      </el-table-column>
      <el-table-column>
        <template slot-scope="{  }">
          <el-button type="primary">x</el-button>
          <el-button type="primary">+</el-button>
        </template>
      </el-table-column>
      <div slot="empty">
        <el-button type="primary" icon="el-icon-plus" size="small" plain></el-button>
      </div>
    </el-table>
    <div class="bottom">
      <el-button type="primary" size="small">确认生成</el-button>
    </div>
  </section>
</template>

<script>
export default {
  data () {
    return {
      test: []
    }
  }
}
</script>

<style lang="less" scoped>
.policy-content {
  width: 70%;
  min-width: 600px;
  padding: 10px;
  color: #8a8a8a;
  font-size: 16px;
  line-height: 22px;

  .top {
    .top-title {
      display: inline-block;
      width: 100px;
      font-size: 14px;
    }

    /deep/.el-select {
      width: calc(~'100% - 110px');
    }
  }

  .level-one-title {
    padding-top: 24px;
  }

  .level-two-title {
    padding: 20px 0 16px;
    color: #434548;
    font-weight: 500;
    font-size: 14px;
  }

  /deep/.el-table {
    .el-table__empty-block {
      text-align: left;

      .el-table__empty-text {
        width: 100%;

        .el-button {
          margin-right: 10px;
        }
      }
    }
  }

  .bottom {
    margin: 20px 0;
  }

  .icon {
    font-size: 14px;
  }
}
</style>
