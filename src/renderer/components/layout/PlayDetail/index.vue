<template lang="pug">
transition(enter-active-class="animated slideInRight" leave-active-class="animated slideOutDown" @after-enter="handleAfterEnter" @after-leave="handleAfterLeave")
  div(v-if="isShowPlayerDetail" :class="[$style.container, { fullscreen: isFullscreen }]" @contextmenu="handleContextMenu")
    div(:class="$style.bg" :style="musicInfo.pic ? { backgroundImage: `url(${musicInfo.pic})` } : null")
    //- div(:class="$style.bg2")
    ControlBtnsLeftHeader(v-if="appSetting['common.controlBtnPosition'] == 'left'")
    ControlBtnsRightHeader(v-else)
    div(:class="[$style.main, {[$style.showComment]: isShowPlayComment}]")
      div.left(:class="$style.left")
        div(:class="$style.turntable")
          div(:class="[$style.info, {[$style.playing]: isPlay}]")
            img(v-if="musicInfo.pic" :class="$style.img" :src="musicInfo.pic")
          div(:class="[$style.tonearm, {[$style.onRecord]: isPlay}]")
          div.description(:class="['scroll', $style.description]")
            p {{ $t('player__music_name') }}{{ musicInfo.name }}
            p {{ $t('player__music_singer') }}{{ musicInfo.singer }}
            p(v-if="musicInfo.album") {{ $t('player__music_album') }}{{ musicInfo.album }}

      transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
        LyricPlayer(v-if="visibled")
      music-comment(v-if="visibled" :class="$style.comment" :show="isShowPlayComment" :music-info="playMusicInfo.musicInfo" @close="hideComment")
    transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
      play-bar(v-if="visibled")
    transition(enter-active-class="animated-slow fadeIn" leave-active-class="animated-slow fadeOut")
      common-audio-visualizer(v-if="appSetting['player.audioVisualization'] && visibled")
</template>


<script>
import { ref, watch } from '@common/utils/vueTools'
import { isFullscreen } from '@renderer/store'
import {
  isShowPlayerDetail,
  isShowPlayComment,
  isPlay,
  musicInfo,
  playMusicInfo,
} from '@renderer/store/player/state'
import {
  setShowPlayerDetail,
  setShowPlayComment,
  setShowPlayLrcSelectContentLrc,
} from '@renderer/store/player/action'
import LyricPlayer from './LyricPlayer.vue'
import PlayBar from './PlayBar.vue'
import MusicComment from './components/MusicComment/index.vue'
import ControlBtnsLeftHeader from './ControlBtnsLeftHeader.vue'
import ControlBtnsRightHeader from './ControlBtnsRightHeader.vue'
import { registerAutoHideMounse, unregisterAutoHideMounse } from './autoHideMounse'
import { appSetting } from '@renderer/store/setting'
import { closeWindow, maxWindow, minWindow, setFullScreen } from '@renderer/utils/ipc'

export default {
  name: 'CorePlayDetail',
  components: {
    ControlBtnsLeftHeader,
    ControlBtnsRightHeader,
    LyricPlayer,
    PlayBar,
    MusicComment,
  },
  setup() {
    const visibled = ref(false)

    let clickTime = 0

    const hide = () => {
      setShowPlayerDetail(false)
    }
    const handleContextMenu = () => {
      if (window.performance.now() - clickTime > 400) {
        clickTime = window.performance.now()
        return
      }
      clickTime = 0
      hide()
    }

    const hideComment = () => {
      setShowPlayComment(false)
    }

    const handleAfterEnter = () => {
      if (isFullscreen.value) registerAutoHideMounse()

      visibled.value = true
    }

    const handleAfterLeave = () => {
      setShowPlayLrcSelectContentLrc(false)
      hideComment(false)
      visibled.value = false

      unregisterAutoHideMounse()
    }

    watch(isFullscreen, isFullscreen => {
      (isFullscreen ? registerAutoHideMounse : unregisterAutoHideMounse)()
    })


    return {
      appSetting,
      playMusicInfo,
      isShowPlayerDetail,
      isShowPlayComment,
      musicInfo,
      isPlay,
      hide,
      handleContextMenu,
      hideComment,
      handleAfterEnter,
      handleAfterLeave,
      visibled,
      isFullscreen,
      fullscreenExit() {
        void setFullScreen(false).then((fullscreen) => {
          isFullscreen.value = fullscreen
        })
      },
      min() {
        minWindow()
      },
      max() {
        maxWindow()
      },
      close() {
        closeWindow()
      },
    }
  },
}
</script>


<style lang="less" module>
@import '@renderer/assets/styles/layout.less';

@control-btn-width: @height-toolbar * .26;

.container {
  position: absolute;
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-color: #2b3028;
  z-index: 10;
  // -webkit-app-region: drag;
  overflow: hidden;
  border-radius: @radius-border;
  color: var(--color-font);
  // border-left: 12px solid var(--color-primary-alpha-900);
  -webkit-app-region: no-drag;
  contain: strict;

  box-sizing: border-box;

  * {
    box-sizing: border-box;
  }
}
.bg {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  filter: blur(64px) saturate(1.18) brightness(.82);
  transform: scale(1.2);
  opacity: .96;
  z-index: -1;
  &:before {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    background: linear-gradient(105deg, rgba(10, 14, 12, .3), rgba(255, 255, 255, .08) 50%, rgba(12, 14, 13, .2));
  }
  &:after {
    position: absolute;
    left: 0;
    top: 0;
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 28% 48%, rgba(255, 255, 255, .08), transparent 46%), rgba(20, 22, 20, .12);
  }
}
// .bg2 {
//   position: absolute;
//   width: 100%;
//   height: 100%;
//   top: 0;
//   left: 0;
//   z-index: -1;
//   background-color: rgba(255, 255, 255, .8);
// }

.main {
  flex: auto;
  min-height: 0;
  overflow: hidden;
  display: flex;
  margin: 0 54px 0 48px;
  position: relative;

  &.showComment {
    :global {
      .left {
        flex-basis: 18%;
        .description p {
          font-size: 12px;
        }
      }
      .right {
        flex-basis: 30%;
        .lyricSelectContent {
          font-size: 14px;
        }
      }
      .comment {
        opacity: 1;
        transform: scaleX(1);
      }
    }
  }
}
.left {
  flex: 0 0 43%;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  padding: 50px 20px 20px;
  overflow: hidden;
  transition: flex-basis @transition-normal;
}

.turntable {
  width: min(390px, 34vw);
  height: min(390px, 34vw);
  position: relative;
}

.info {
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
  max-width: none;
  min-height: 0;
  position: relative;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background:
    repeating-radial-gradient(circle at center, rgba(255,255,255,.025) 0 2px, rgba(0,0,0,.025) 3px 5px),
    radial-gradient(circle at center, #202020 0 62%, #101010 63% 100%);
  box-shadow: 0 28px 45px rgba(15, 21, 9, .28), inset 0 0 0 2px rgba(255,255,255,.035);
  animation: vinyl-spin 18s linear infinite;
  animation-play-state: paused;
  will-change: transform;
}
.playing {
  animation-play-state: running;
}
.tonearm {
  position: absolute;
  z-index: 3;
  width: 168px;
  height: 11px;
  left: 52%;
  top: -58px;
  border-radius: 8px;
  background: linear-gradient(180deg, #f8f8f4, #c9cbc5);
  box-shadow: 0 4px 10px rgba(0, 0, 0, .24);
  transform: rotate(18deg);
  transform-origin: 17px 50%;
  transition: transform .72s cubic-bezier(.2, .82, .24, 1);

  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    width: 34px;
    height: 34px;
    transform: translateY(-50%);
    border-radius: 50%;
    background: radial-gradient(circle, #f4f5ef 0 35%, #aeb2aa 38% 62%, #e7e8e2 65%);
    box-shadow: 0 5px 13px rgba(0, 0, 0, .25);
  }
  &:after {
    content: '';
    position: absolute;
    right: -7px;
    top: -5px;
    width: 24px;
    height: 22px;
    border-radius: 4px 2px 7px 7px;
    background: #30332f;
    box-shadow: inset 0 -4px 0 #111;
  }
}
.onRecord {
  transform: rotate(46deg);
}
@keyframes vinyl-spin {
  to { transform: rotate(360deg); }
}
.img {
  width: 53%;
  height: 53%;
  min-width: 0;
  object-fit: cover;
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(10, 10, 10, .5);
  opacity: .92;
}
.description {
  position: absolute;
  left: calc(100% + 72px);
  top: 42%;
  width: 420px;
  max-width: 38vw;
  margin-top: 0;
  padding-bottom: 15px;
  min-height: 0;
  p {
    line-height: 1.8;
    font-size: 24px;
    font-weight: 600;
    color: rgba(255, 255, 255, .78);
    overflow-wrap: break-word;
  }
}


.comment {
  position: absolute;
  right: 0;
  top: 0;
  width: 50%;
  height: 100%;
  opacity: 1;
  margin-left: 10px;
  transform: scaleX(0);
}


</style>
