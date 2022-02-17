<template>
  <div class="subtopbar-container">
    <div class="nav-container">
      <div class="nav-content">
        <ul v-if="routerList.length > 0" class="nav-item-list">
          <router-link v-for="(item,index) in routerList" :key="index" active-class="active" :to="item.url">
            <li class="nav-item">
              <i v-if="item.icon" class="icon" :class="[item.icon]"></i>
              <span class="name">{{item.name}}</span>
            </li>
          </router-link>
        </ul>
      </div>
    </div>
    <div class="operation">
      <template v-if="$route.path === `/v1/projects/detail/${projectName}/pipelines`">
        <el-button @click="bindComp(comp,'workflow')" icon="el-icon-plus" plain>新建工作流</el-button>
      </template>
      <template v-if="$route.path === `/v1/projects/detail/${projectName}/envs/detail`">
        <el-button @click="bindComp(comp,'env')" icon="el-icon-plus" plain>创建环境</el-button>
      </template>
      <template v-if="$route.path === `/v1/projects/detail/${projectName}/builds`">
        <el-button @click="bindComp(comp,'build')" icon="el-icon-plus" plain>新建构建</el-button>
      </template>
      <template v-if="$route.path === `/v1/projects/detail/${projectName}/test`">
        <el-button @click="bindComp(comp,'test')" icon="el-icon-plus" plain>新建测试</el-button>
      </template>
      <template>
        <el-dropdown v-if="comp && comp.isProjectAdmin && $route.path === `/v1/projects/detail/${projectName}/detail`" placement="bottom" trigger="click">
          <button type="button" class="display-btn el-button">
            <i class="el-icon-s-operation el-icon--left"></i>
            配置
            <i class="el-icon-caret-bottom el-icon--right"></i>
          </button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item icon="el-icon-edit-outline" @click.native="$router.push(`/v1/projects/edit/${projectName}`)">修改</el-dropdown-item>
            <el-dropdown-item icon="el-icon-lock" @click.native="$router.push(`/v1/projects/detail/${projectName}/rbac`)">权限</el-dropdown-item>
            <el-dropdown-item icon="el-icon-delete" @click.native="comp.deleteProject">删除</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {}
  },
  props: {
    projectName: {
      type: String,
      required: true
    },
    comp: {
      required: false
    }
  },
  computed: {
    routerList () {
      return [
        {
          name: '工作流',
          icon: 'iconfont icongongzuoliucheng',
          url: `/v1/projects/detail/${this.projectName}/pipelines`
        },
        {
          name: '环境',
          icon: 'iconfont iconrongqi',
          url: `/v1/projects/detail/${this.projectName}/envs`
        },
        {
          name: '服务',
          icon: 'iconfont iconrongqifuwu',
          url: `/v1/projects/detail/${this.projectName}/services`
        },
        {
          name: '构建',
          icon: 'iconfont icongoujianzhong',
          url: `/v1/projects/detail/${this.projectName}/builds`
        },
        {
          name: '测试',
          icon: 'iconfont icontest',
          url: `/v1/projects/detail/${this.projectName}/test`
        },
        {
          name: '版本管理',
          icon: 'iconfont iconbanben',
          url: `/v1/projects/detail/${this.projectName}/version`
        }
      ]
    }
  },
  methods: {
    bindComp (comp, type) {
      if (type === 'workflow') {
        comp.showSelectWorkflowType = true
      } else if (type === 'env') {
        this.$router.push(`/v1/projects/detail/${this.projectName}/envs/create`)
      } else if (type === 'build') {
        this.$router.push(
          `/v1/projects/detail/${this.projectName}/builds/create`
        )
      } else if (type === 'test') {
        this.$router.push(
          `/v1/projects/detail/${this.projectName}/test/add/function`
        )
      }
    }
  }
}
</script>
<style lang="less">
.subtopbar-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding-left: 26px;
  background-color: #fff;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);

  .nav-container {
    .nav-content {
      .nav-item-list {
        display: flex;

        .nav-item {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 42px;
          padding: 9px 12px;
          color: #000;
          font-weight: 300;
          font-size: 16px;
          line-height: 22px;
          cursor: pointer;

          .icon {
            margin-right: 18px;
            color: #d2d2d2;
            font-size: 22px;
          }
        }

        a {
          margin-right: 16px;

          &.active {
            box-shadow: inset 0 -2px 0 @themeColor;

            .icon {
              color: @themeColor;
            }
          }
        }
      }
    }
  }

  .operation {
    display: flex;
    margin-right: 80px;

    .el-button {
      padding: 10px 15px;
      color: @themeColor;
      font-weight: 300;
      border: 1px solid @themeColor;
      border-radius: 4px;
      box-shadow: 0 4px 4px rgba(0, 0, 0, 0.05);
    }

    .display-btn {
      padding: 10px 15px;
      color: @themeColor;
      font-weight: 300;
      font-size: 14px;
      background-color: #fff;
      border: 1px solid @themeColor;
      border-radius: 4px;
      box-shadow: 0 4px 4px rgba(0, 0, 0, 0.05);
      cursor: pointer;
    }
  }
}
</style>
