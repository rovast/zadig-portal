import * as types from '../mutations'

const state = {
  links: []
}

const mutations = {
  [types.SET_EXTERNAL_LINK] (state, payload) {
    state.links = payload
  }
}

export default {
  state,
  mutations
}
