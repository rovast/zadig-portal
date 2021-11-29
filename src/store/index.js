import Vue from 'vue'
import Vuex from 'vuex'
// Login
import login from './modules/login'

// Env
import project_list from './modules/project_list'

// Sidebar
import sidebar_status from './modules/sidebar_status'

// Service
import service_manage from './modules/service_manage'

// External Link
import external_link from './modules/external_link'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  modules: {
    login,
    project_list,
    sidebar_status,
    service_manage,
    external_link
  },
  strict: debug
})
