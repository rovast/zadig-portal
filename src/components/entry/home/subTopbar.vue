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

    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      projectName: 'test'
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
        }
      ]
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
  width: 100%;
  height: 50px;
  padding-left: 26px;
  background-color: #fff;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);

  .nav-container {
    .nav-content {
      .nav-item-list {
        display: flex;

        a {
          margin-right: 16px;
        }

        .nav-item {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 32px;
          padding: 9px 12px;
          color: #000;
          font-weight: 300;
          font-size: 18px;
          line-height: 22px;
          cursor: pointer;

          &.active {
            box-shadow: inset 0 -2px 0 #55f;
          }

          .icon {
            margin-right: 18px;
            color: #d2d2d2;
            font-size: 22px;
          }
        }
      }
    }
  }
}
</style>
