import * as types from '../mutations'
import { } from '@api'

const state = {
  tabs: [{
    tab: '基本信息',
    selected: true,
    isCurrent: true
  },
  {
    tab: '构建',
    selected: false,
    isCurrent: false
  }, {
    tab: '扩展',
    selected: false,
    isCurrent: false
  }, {
    tab: '触发器',
    selected: false,
    isCurrent: false
  }],
  commonInfo: {
    pipelineName: '',
    projectName: '',
    desc: '',
    vars: [{
      key: 'key',
      type: 'string',
      value: 'value',
      is_credential: false
    }]
  },
  validObj: null

}

const getters = {
  currentTab: (state) => {
    return state.tabs.filter(tab => tab.isCurrent)[0].tab
  },
  selectedTabs: (state) => {
    return state.tabs.filter(tab => tab.selected)
  }
}

const actions = {

}

const mutations = {
  [types.UPDATE_TABS] (state, payload) {
    if (payload.type === 'delete') {
      const tab = state.tabs.filter(tab => tab.tab === payload.tab)[0]
      tab.selected = false
      if (tab.isCurrent) state.tabs[0].isCurrent = true
    } else {
      state.tabs.forEach(tab => {
        tab.isCurrent = false
        if (tab.tab === payload.tab) {
          tab.selected = true
          tab.isCurrent = true
        }
      })
    }
  },
  [types.UPDATE_COMMON_INFO] (state, payload) {
    Object.assign(state.commonInfo, payload)
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
