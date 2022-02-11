<template>
  <div class="topbar-container">
    <div class="topbar-content">
      <div class="topbar-container-start">
        <div class="logo-container">
          <img class="logo" src="@assets/icons/logo/small-logo.png" />
        </div>
        <div v-if="showProjectSwitcher" class="project-switcher-container">
          <el-dropdown placement="bottom" @command="changeProject">
            <span class="icon-switcher">
              <i class="el-icon-caret-bottom"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-for="(item,index) in projectList" :key="index" :command="item.name">{{item.alias}}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div class="breadcrumb-container">
          <div class="project-switcher"></div>
          <!-- <span v-if="content.title" class="kr-topbar-title">{{content.title}}</span> -->
          <el-breadcrumb v-if="content.breadcrumb && content.breadcrumb.length > 0" separator=">">
            <el-breadcrumb-item v-for="(item,index) in content.breadcrumb" :to="item.url" :key="index">{{item.title}}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
      </div>
      <div class="topbar-container-end">
        <span>
          <Notification class="icon notify" />
        </span>
        <div class="nav nav-item-bottom user-profile">
          <el-popover placement="bottom" width="240" popper-class="dropdown-menu" trigger="click">
            <div class="flex">
              <div class="profile-menu__list">
                <ul class="profile-list profile-list__with-icon">
                  <li class="profile-list__item profile-list__item-nested">
                    <div class="title">
                      <i class="iconfont iconzhanghu"></i>
                      <span class="profile-list__text">用户名</span>
                    </div>
                    <ul class="content profile-list">
                      <li class="profile-list__item active">
                        <span>{{userName}}</span>
                        <el-tag v-if="role.includes('admin')" size="mini" type="primary" effect="plain">管理员</el-tag>
                        <el-tag v-else size="mini" type="primary" effect="plain">普通用户</el-tag>
                      </li>
                    </ul>
                  </li>
                </ul>
                <ul v-if="role.includes('admin')" class="profile-list profile-list__with-icon user-settings">
                  <router-link to="/v1/users/account/manage">
                    <li class="profile-list__item">
                      <i class="iconfont icongeren"></i>
                      <span class="profile-list__text">用户管理</span>
                    </li>
                  </router-link>
                  <router-link to="/v1/system">
                    <li class="profile-list__item">
                      <i class="iconfont iconicon_jichengguanli"></i>
                      <span class="profile-list__text">系统设置</span>
                    </li>
                  </router-link>
                </ul>
                <ul class="profile-list profile-list__with-icon">
                  <router-link to="/v1/profile/info">
                    <li class="profile-list__item">
                      <i class="iconfont iconfenzucopy"></i>
                      <span class="profile-list__text">账号设置</span>
                    </li>
                  </router-link>
                  <li class="profile-list__item profile-list__with-icon">
                    <i class="iconfont icondengchu"></i>
                    <span @click="logOut" class="profile-list__text logout">登出账号</span>
                  </li>
                </ul>
              </div>
            </div>
            <div slot="reference" class="dropdown-menu-reference">
              <img src="@assets/icons/others/topbar-profile.png" class="menu-avatar" alt />
              <span class="username">
                <span>{{userName}}</span>
                <i class="iconfont iconmorelist"></i>
              </span>
            </div>
          </el-popover>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Notification from './common/notification.vue'
import mixin from '@/mixin/topbarMixin'
import bus from '@utils/eventBus'
import { mapState, mapGetters } from 'vuex'
export default {
  data () {
    return {
      content: {
        title: '',
        breadcrumb: [],
        projectList: []
      }
    }
  },
  computed: {
    ...mapGetters(['projectList']),
    ...mapState({
      role: state => state.login.role,
      userInfo: state => state.login.userinfo
    }),
    showProjectSwitcher () {
      return this.$route.path.includes('/v1/projects/detail/')
    },
    userName () {
      // 系统用户
      if (this.userInfo.identityType === 'system') {
        if (this.userInfo.name) {
          return `${this.userInfo.name}(${this.userInfo.account})`
        } else {
          return this.userInfo.account
        } // 第三方登录
      } else if (this.userInfo.preferred_username) {
        return `${this.userInfo.name}(${this.userInfo.preferred_username})`
      } else {
        return this.userInfo.name
      }
    }
  },
  methods: {
    async logOut () {
      await this.$store.dispatch('LOGINOUT')
      this.$router.push('/signin')
    },
    changeProject (projectName) {
      this.$router.push(`/v1/projects/detail/${projectName}/detail`)
    },
    handleCommand (command) {
      if (command === 'logOut') {
        this.logOut()
      }
    },
    changeTitle (params) {
      this.content = params
    }
  },
  created () {
    bus.$on('set-topbar-title', params => {
      this.changeTitle(params)
    })
  },
  components: {
    Notification
  },
  mixins: [mixin]
}
</script>
<style lang="less">
.dropdown-menu-reference {
  display: flex;
  align-items: center;
  color: #44504f;
  line-height: 60px;
  cursor: pointer;

  .username {
    display: inline-block;
    margin-left: 18px;
    font-weight: 300;
    font-size: 18px;
    line-height: 22px;
  }

  .iconmorelist {
    margin-left: 54px;
    color: #c4c4c4;
  }
}

.help-droplist {
  .dropdown-menu {
    margin: 0 2px;
    padding: 8px 0;
    list-style: none;

    .divider {
      height: 1px;
      margin: 9px 0;
      overflow: hidden;
      background-color: #e5e5e5;
    }

    li {
      & > a {
        display: block;
        clear: both;
        padding: 3px 20px;
        padding: 4px 0 4px 5px;
        color: #333;
        font-weight: normal;
        line-height: 1.42857143;
        white-space: nowrap;

        .icon {
          position: relative;
          margin-right: 5px;
          font-size: 16px;
        }
      }

      &:hover {
        color: #262626;
        text-decoration: none;
        background-color: #f5f5f5;

        & > a {
          color: @themeColor;
        }
      }
    }
  }
}

.flex {
  display: flex;

  .profile-menu__list {
    width: 100%;
    padding: 8px 21px 2px 14px;

    .profile-list {
      margin: 0;
      padding: 10px 0;
      list-style-type: none;
      border-bottom: 1px solid #dbdbdb;

      .profile-list__item-nested {
        padding: 0;

        .title {
          margin-bottom: 5px;
        }
      }

      .profile-list__item {
        padding: 5px 0;
        font-size: 13px;

        .profile-list__text {
          color: #434548;
        }

        &:hover {
          .profile-list__text {
            color: @themeColor;
          }
        }

        i {
          display: inline-block;
          width: 20px;
          margin-right: 10px;
          color: @themeColor;
          font-size: 16px;
          text-align: center;
        }

        .logout {
          cursor: pointer;
        }
      }

      &.content {
        padding: 0;
        border-bottom: none;

        .profile-list__item {
          font-weight: normal;
        }
      }

      &:last-child {
        border-bottom: none;
      }
    }
  }
}

.topbar-container {
  top: 0;
  right: 0;
  left: 66px;
  z-index: 1010;
  height: 40px;
  padding: 0 24px;
  font-size: 14px;
  background-color: #fff;
  border-bottom: 1px solid #ebedef;

  .topbar-content {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    -webkit-box-align: center;
    -ms-flex-align: center;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;

    .topbar-container-start {
      display: flex;
      flex: 0 1 auto;
      flex-basis: auto;
      flex-grow: 1;
      flex-shrink: 1;
      align-items: center;
      justify-content: flex-start;
      min-width: 0;
      margin-right: 10px;

      .logo-container {
        display: flex;
        align-items: center;
        margin-right: 10px;

        .logo {
          width: 18.5px;
          height: 21px;
          margin-right: 10px;
        }
      }

      .project-switcher-container {
        margin-right: 30px;

        .icon-switcher {
          i {
            color: #a0a0ff;
            cursor: pointer;
          }
        }
      }

      span {
        &.kr-topbar-title {
          display: block;
          flex-grow: 0;
          overflow: hidden;
          font-weight: 300;
          font-size: 21px;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }

      .el-breadcrumb {
        color: #000;
        font-weight: 300;
        font-size: 14px;
      }

      .el-breadcrumb__separator {
        margin: 0 9px;
        color: #a0a0a0;
        font-weight: 300;
      }

      .el-breadcrumb__inner.is-link {
        color: #000;
        font-weight: 300;
      }

      .el-breadcrumb__inner {
        color: #8a8a8a;
      }
    }

    .topbar-container-end {
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      flex-grow: 0;
      flex-shrink: 0;
      align-items: center;
      justify-content: space-between;
      -webkit-box-align: center;
      -ms-flex-align: center;
      -webkit-box-pack: justify;
      -ms-flex-pack: justify;
      -webkit-box-flex: 0;
      -ms-flex-positive: 0;
      -ms-flex-negative: 0;

      * {
        max-height: 100%;
      }

      .icon {
        color: #a0a0a0;
        font-size: 18px;
        cursor: pointer;

        &:hover {
          color: @themeColor;
        }
      }

      .notify {
        font-size: 20px;
        line-height: 60px;
      }

      .user-profile {
        margin-left: 38px;

        .menu-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
        }
      }
    }
  }
}

.el-select-dropdown.el-popper {
  .el-scrollbar {
    .el-select-dropdown__item {
      .k8s-product-option {
        position: relative;

        span {
          padding-right: 20px;
        }

        i {
          position: absolute;
          right: 0;
          padding-left: 8px;
          line-height: 34px;
          visibility: hidden;
          cursor: pointer;
        }

        &:hover {
          i {
            visibility: visible;
          }
        }
      }
    }
  }
}
</style>
