import bus from '@utils/eventBus'

export default {
  methods: {
    checkCurrentTab () {
      return new Promise((resolve, reject) => {
        console.log(this.currentTab)
        bus.$once(`receive-tab-check:${this.currentTab}`, pass => {
          console.log(pass)
          if (pass) {
            resolve()
          } else {
            console.log(111111)
            reject()
          }
        })
        bus.$emit(`check-tab:${this.currentTab}`)
      })
    }
  }
}
