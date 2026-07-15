<template>
  <div :class="$style.content">
    <div :class="$style.progress">
      <div :class="[$style.progressBar, {[$style.barTransition]: isActiveTransition}]" :style="{ transform: `scaleX(${progress || 0})` }" @transitionend="handleTransitionEnd" />
    </div>
    <div ref="dom_btn" :class="$style.timeContent">
      <span>{{ nowPlayTimeStr }}</span>
      <span style="margin: 0 1px;">/</span>
      <span>{{ maxPlayTimeStr }}</span>
      <base-popup v-model:visible="visible" :btn-el="dom_btn" @mouseenter="handlMsEnter" @mouseleave="handlMsLeave" @transitionend="handleTranEnd">
        <div :class="$style.popupProgress">
          <common-progress-bar v-if="visibleProgress" :progress="progress" :handle-transition-end="handleTransitionEnd" :is-active-transition="isActiveTransition" />
        </div>
      </base-popup>
    </div>
  </div>
</template>

<script>
import { ref } from '@common/utils/vueTools'
import usePlayProgress from '@renderer/utils/compositions/usePlayProgress'
import { isShowPlayerDetail } from '@renderer/store/player/state'

export default {
  setup() {
    const visible = ref(false)
    const visibleProgress = ref(false)
    const dom_btn = ref(null)

    const handleShowPopup = (evt) => {
      if (visible.value) {
        evt.stopPropagation()
        handlMsLeave()
      } else handlMsEnter()
    }
    const {
      nowPlayTimeStr,
      maxPlayTimeStr,
      progress,
      isActiveTransition,
      handleTransitionEnd,
    } = usePlayProgress()

    let timeout = null
    const handlMsEnter = () => {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      if (visible.value) return
      timeout = setTimeout(() => {
        visible.value = true
        visibleProgress.value = true
      }, 100)
    }
    const handlMsLeave = () => {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      if (!visible.value) return
      timeout = setTimeout(() => {
        timeout = null
        visible.value = false
      }, 100)
    }
    const handleTranEnd = () => {
      if (visible.value) return
      visibleProgress.value = false
    }

    // onMounted(() => {
    //   visible.value = true
    //   requestAnimationFrame(() => {
    //     visible.value = false
    //   })
    // })

    return {
      visible,
      visibleProgress,
      dom_btn,
      handleShowPopup,
      nowPlayTimeStr,
      maxPlayTimeStr,
      progress,
      isActiveTransition,
      handleTransitionEnd,
      handlMsLeave,
      handlMsEnter,
      handleTranEnd,
      isShowPlayerDetail,
    }
  },
}

</script>


<style lang="less" module>
@import '@renderer/assets/styles/layout.less';
// .content {
//   flex: none;
//   position: relative;
//   // display: inline-block;
//   padding: 5px 0;
//   color: var(--color-300);
//   font-size: 13px;
//   cursor: pointer;
//   transition: opacity @transition-fast;

//   &:hover {
//     opacity: .7;
//   }
// }
.content {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  margin-left: 0;
  pointer-events: none;
  &:hover {
    .progress {
      opacity: 1;
    }
  }
}
.timeContent {
  // width: 30%;
  position: absolute;
  right: 235px;
  top: 50%;
  transform: translateY(-50%);
  // flex: none;
  color: rgba(255, 255, 255, .82);
  font-size: 13px;
  // padding-left: 10px;
  // display: flex;
  // flex-flow: column nowrap;
  // align-items: center;
  display: flex;
  justify-content: center;
  gap: 3px;
  padding-bottom: 0;
}

.progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  flex: auto;
  margin-top: 0;
  height: 3px;
  opacity: .72;
  overflow: hidden;
  transition: @transition-normal;
  transition-property: background-color, opacity;
  background-color: #eeeeee;
  border-radius: @radius-pill;

  .progressBar {
    height: 100%;
    width: 100%;
    background-color: var(--color-primary);
    transform-origin: 0;
    will-change: transform;
    border-radius: @radius-pill;
  }

  .barTransition {
    transition-property: transform;
    transition-timing-function: ease-out;
    transition-duration: 0.2s;
  }
}

.popupProgress {
  position: relative;
  width: 300px;
  height: 15px;
  box-sizing: border-box;
  padding: 5px 0;
  margin: 0 5px;
}


</style>
