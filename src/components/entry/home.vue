<template>
  <div class="main-home-container">
    <div class="main-view">
      <div class="topbar-wrap">
        <Topbar />
      </div>
      <div class="content-wrap">
        <div class="side-bar-container">
          <Sidebar class="side-bar-component" @sidebar-width="sideWide = $event" />
        </div>
        <div class="content-container">
          <Announcement v-for="(ann,index) in announcements" :key="index" :title="ann.content.title" :content="ann.content.content" />
          <Announcement title="系统提示" isHtml v-if="isAdmin && SMTPDisabled" :content="htmlTemplate" />
          <!-- <FloatLink class="main-float"/> -->
          <router-view class="content-detail"></router-view>
        </div>
      </div>
      <!-- <div class="bottom-bar-wrap">
        <BottomBar/>
      </div>-->
    </div>
  </div>
</template>

<script>
import { getAnnouncementsAPI, getEmailHostAPI } from '@api'
import Sidebar from './home/sidebar.vue'
import Topbar from './home/topbar.vue'
import BottomBar from './home/bottomBar.vue'
import Announcement from './home/announcement.vue'
import FloatLink from './home/floatLink.vue'
export default {
  data () {
    return {
      announcements: [],
      sideWide: true,
      SMTPDisabled: false,
      htmlTemplate:
        '管理员请及时配置 <a href="/v1/system/integration?currentTab=mail">SMTP 邮箱服务器</a> 以便于用户密码丢失找回'
    }
  },
  methods: {
    getAnnouncements () {
      getAnnouncementsAPI().then(res => {
        this.announcements = res
      })
    },
    async checkSMTP () {
      const res = await getEmailHostAPI()
      if (res) {
        this.SMTPDisabled = false
      } else {
        this.SMTPDisabled = true
      }
    }
  },
  computed: {
    isAdmin () {
      if (this.$store.state.login.role.includes('admin')) {
        return true
      } else {
        return false
      }
    }
  },
  watch: {
    isAdmin: {
      handler (val, oldVal) {
        if (val) {
          // 检查 SMTP 配置
          this.checkSMTP()
        }
      },
      immediate: true
    }
  },
  components: {
    Sidebar,
    Topbar,
    BottomBar,
    Announcement,
    FloatLink
  },
  created () {
    this.$store.dispatch('GETUSERINFO')
    this.$store.dispatch('getProjectList')
    this.getAnnouncements()
  }
}
</script>

<style lang="less">
a {
  color: @themeColor;
  text-decoration: none;
}

button {
  &:focus {
    outline: none;
  }
}

body {
  height: 100%;
  overflow: hidden;
  overflow-y: auto;
  background-color: #fff;

  .main-home-container {
    width: 100vw;
    min-width: 768px;
    height: 100vh;
    min-height: 100vh;

    .main-view {
      > * {
        -ms-flex: 0 0 auto;
        flex: 0 0 auto;
        -webkit-box-flex: 0;
      }

      display: flex;
      flex-direction: column;
      align-items: stretch;
      justify-content: flex-start;
      height: 100%;
      overflow: hidden;

      .topbar-wrap {
        z-index: 1000;
        width: 100%;
        height: 40px;
        box-shadow: 0 0 8px rgba(0, 0, 0, 0.12);
      }

      .bottom-bar-wrap {
        width: 100%;
        height: 32px;
        color: blue;
      }

      .content-wrap {
        display: flex;
        height: calc(~'100% - 40px');

        .sidebar-container {
          height: 100%;
        }

        .content-container {
          width: 100%;
          height: 100%;
        }
      }
    }
  }
}
</style>
