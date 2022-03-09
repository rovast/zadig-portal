<template>
  <div
    class="el-step"
    :style="style"
    :class="[
      !isSimple && `is-${$parent.direction}`,
      isSimple && 'is-simple',
      isLast && !space && !isCenter && 'is-flex',
      isCenter && !isVertical && !isSimple && 'is-center'
     ]">
    <!-- icon & line -->
    <div
      class="el-step__head"
      :class="`is-${currentStatus}`">
      <div
        class="el-step__line"
        :style="isLast ? '' : { marginRight: $parent.stepOffset + 'px' }"
      >
        <i class="el-step__line-inner" :style="lineStyle"></i>
      </div>

      <div class="el-step__icon" :class="`is-${icon ? 'icon' : 'text'}`">
        <slot
          v-if="currentStatus !== 'success' && currentStatus !== 'error'"
          name="icon">
          <i v-if="icon" class="el-step__icon-inner" :class="[icon]"></i>
          <div class="el-step__icon-inner" v-if="!icon && isSimple">{{ index + 1 }}</div>
        </slot>
        <i
          v-else
          :class="['el-icon-' + (currentStatus === 'success' ? 'check' : 'close')]"
          class="el-step__icon-inner is-status"
        >
        </i>
      </div>
    </div>
    <!-- title & description -->
    <div class="el-step__main">
      <div
        class="el-step__title"
        ref="title"
        :class="['is-' + currentStatus]">
        <slot name="title">{{ title }}</slot>
      </div>
      <div v-if="isSimple && !isLast" class="el-step__arrow"></div>
      <div
        v-else
        class="el-step__description"
        :class="['is-' + currentStatus]">
        <slot name="description">{{ description }}</slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OnboardingStep',

  props: {
    title: String,
    icon: String,
    description: String,
    status: String
  },

  data () {
    return {
      index: -1,
      lineStyle: {},
      internalStatus: ''
    }
  },

  beforeCreate () {
    this.$parent.steps.push(this)
  },

  beforeDestroy () {
    const steps = this.$parent.steps
    const index = steps.indexOf(this)
    if (index >= 0) {
      steps.splice(index, 1)
    }
  },

  computed: {
    currentStatus () {
      return this.status || this.internalStatus
    },
    prevStatus () {
      const prevStep = this.$parent.steps[this.index - 1]
      return prevStep ? prevStep.currentStatus : 'wait'
    },
    isCenter () {
      return this.$parent.alignCenter
    },
    isVertical () {
      return this.$parent.direction === 'vertical'
    },
    isSimple () {
      return this.$parent.simple
    },
    isLast () {
      const parent = this.$parent
      return parent.steps[parent.steps.length - 1] === this
    },
    stepsCount () {
      return this.$parent.steps.length
    },
    space () {
      const { isSimple, $parent: { space } } = this
      return isSimple ? '' : space
    },
    style: function () {
      const style = {}
      const parent = this.$parent
      const len = parent.steps.length

      const space = (typeof this.space === 'number'
        ? this.space + 'px'
        : this.space
          ? this.space
          : 100 / (len - (this.isCenter ? 0 : 1)) + '%')
      style.flexBasis = space
      if (this.isVertical) return style
      if (this.isLast) {
        style.maxWidth = 100 / this.stepsCount + '%'
      } else {
        style.marginRight = -this.$parent.stepOffset + 'px'
      }

      return style
    }
  },

  methods: {
    updateStatus (val) {
      const prevChild = this.$parent.$children[this.index - 1]

      if (val > this.index) {
        this.internalStatus = this.$parent.finishStatus
      } else if (val === this.index && this.prevStatus !== 'error') {
        this.internalStatus = this.$parent.processStatus
      } else {
        this.internalStatus = 'wait'
      }

      if (prevChild) prevChild.calcProgress(this.internalStatus)
    },

    calcProgress (status) {
      let step = 100
      const style = {}

      style.transitionDelay = 150 * this.index + 'ms'
      if (status === this.$parent.processStatus) {
        step = this.currentStatus !== 'error' ? 0 : 0
      } else if (status === 'wait') {
        step = 0
        style.transitionDelay = (-150 * this.index) + 'ms'
      }

      style.borderWidth = step && !this.isSimple ? '1px' : 0
      this.$parent.direction === 'vertical'
        ? style.height = step + '%'
        : style.width = step + '%'

      this.lineStyle = style
    }
  },

  mounted () {
    const unwatch = this.$watch('index', val => {
      this.$watch('$parent.active', this.updateStatus, { immediate: true })
      this.$watch('$parent.processStatus', () => {
        const activeIndex = this.$parent.active
        this.updateStatus(activeIndex)
      }, { immediate: true })
      unwatch()
    })
  }
}
</script>
<style lang="less" scoped>
.el-step.is-simple .el-step__head {
  width: auto;
  margin-right: -25px;
  font-size: 0;
}

.el-step__icon.is-text {
  padding: 2px;
  border: 2px solid #eaf2ff;
  border-color: none;
  border-radius: 50%;
}

.el-step__icon {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 30px;
  height: 30px;
  font-size: 14px;
  background: #fff;
  transition: 0.15s ease-out;
}

.el-step.is-simple .el-step__icon {
  width: 30px;
  height: 30px;
  font-size: 12px;
  background: #fff;
}

.el-step__icon-inner {
  display: inline-block;
  width: 16px;
  height: 16px;
  padding: 4px;
  color: #44447e;
  font-size: 16px;
  line-height: 16px;
  text-align: center;
  background: #eaf2ff;
  border-radius: 50%;
  user-select: none;
}

.el-step.is-simple .el-step__title {
  padding: 6px 25px;
  font-weight: 300;
  font-size: 12px;
  line-height: 12px;
  background: #eaf2ff;
  border-radius: 20px;
}

.el-step__title.is-success {
  color: #67c23a;
}

.el-step__title.is-wait {
  color: #44447e;
}

.el-step.is-simple .el-step__arrow {
  display: flex;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
}

.el-step.is-simple .el-step__arrow::before {
  display: none;
}

.el-step.is-simple .el-step__arrow::after {
  position: absolute;
  display: inline-block;
  width: 60%;
  height: 2px;
  background: #eaf2ff;
  transform: none;
  content: '';
}

.el-step__head.is-success {
  .el-step__icon-inner {
    color: #fff;
    background: #55c32d;
  }
}

.el-step__head.is-process {
  .el-step__icon-inner {
    color: #fff;
    background: @themeColor;
  }
}

</style>
