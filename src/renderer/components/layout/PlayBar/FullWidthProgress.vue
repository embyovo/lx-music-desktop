<template>
  <div :class="$style.player" @click="showPlayerDetail">
    <div :class="$style.progress" @click.stop>
      <common-progress-bar v-if="!isShowPlayerDetail" :class-name="$style.progressBar" :progress="progress" :handle-transition-end="handleTransitionEnd" :is-active-transition="isActiveTransition" />
    </div>
    <div :class="$style.picContent" :aria-label="$t('player__pic_tip')" @contextmenu="handleToMusicLocation" @click="showPlayerDetail">
      <img v-if="musicInfo.pic" :src="musicInfo.pic" decoding="async" @error="imgError">
      <div v-else :class="$style.emptyPic">L<span>X</span></div>
    </div>
    <div :class="$style.infoContent">
      <div :class="$style.title" :aria-label="title + $t('copy_tip')" @click="handleCopy(title)">
        {{ title }}
      </div>
      <div :class="$style.status">{{ statusText }}</div>
    </div>
    <div :class="$style.playBtnContent" @click.stop>
      <div :class="$style.playBtn" :aria-label="$t('player__prev')" @click="playPrev()">
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" height="100%" viewBox="0 0 1024 1024" space="preserve">
          <use xlink:href="#icon-prevMusic" />
        </svg>
      </div>
      <div :class="$style.playBtn" :aria-label="isPlay ? $t('player__pause') : $t('player__play')" @click="togglePlay">
        <svg v-if="isPlay" version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" height="100%" viewBox="0 0 1024 1024" space="preserve">
          <use xlink:href="#icon-pause" />
        </svg>
        <svg v-else version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" height="100%" viewBox="0 0 1024 1024" space="preserve">
          <use xlink:href="#icon-play" />
        </svg>
      </div>
      <div :class="$style.playBtn" :aria-label="$t('player__next')" @click="playNext()">
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" height="100%" viewBox="0 0 1024 1024" space="preserve">
          <use xlink:href="#icon-nextMusic" />
        </svg>
      </div>
    </div>
    <div :class="$style.timeContent">
      <span>{{ nowPlayTimeStr }}</span>
      <span style="margin: 0 4px;">/</span>
      <span>{{ maxPlayTimeStr }}</span>
    </div>
    <control-btns @click.stop />
  </div>
</template>

<script>
import { computed } from '@common/utils/vueTools'
import { useRouter } from '@common/utils/vueRouter'
import { clipboardWriteText } from '@common/utils/electron'
import ControlBtns from './ControlBtns.vue'
// import PlayProgress from './PlayProgress'
import usePlayProgress from '@renderer/utils/compositions/usePlayProgress'
// import { lyric } from '@renderer/core/share/lyric'
import {
  statusText,
  musicInfo,
  isShowPlayerDetail,
  isPlay,
  playInfo,
  playMusicInfo,
} from '@renderer/store/player/state'
import {
  setMusicInfo,
  setShowPlayerDetail,
} from '@renderer/store/player/action'
import { appSetting } from '@renderer/store/setting'
import { togglePlay, playNext, playPrev } from '@renderer/core/player'
import { LIST_IDS } from '@common/constants'
import { formatMusicName } from '@renderer/utils'

export default {
  name: 'CorePlayBar',
  components: {
    ControlBtns,
    // PlayProgress,
  },
  setup() {
    const router = useRouter()

    const {
      nowPlayTimeStr,
      maxPlayTimeStr,
      progress,
      isActiveTransition,
      handleTransitionEnd,
    } = usePlayProgress()

    const showPlayerDetail = () => {
      if (!playMusicInfo.musicInfo) return
      setShowPlayerDetail(true)
    }
    const handleCopy = (text) => {
      clipboardWriteText(text)
    }

    const imgError = () => {
      // console.log(e)
      setMusicInfo({ pic: null })
    }

    const handleToMusicLocation = () => {
      const listId = playMusicInfo.listId
      if (!listId || listId == LIST_IDS.DOWNLOAD || !playMusicInfo.musicInfo) return
      if (playInfo.playIndex == -1) return
      void router.push({
        path: '/list',
        query: {
          id: listId,
          scrollIndex: playInfo.playIndex,
        },
      })
    }

    const title = computed(() => {
      return musicInfo.name
        ? formatMusicName(appSetting['download.fileName'], musicInfo.name, musicInfo.singer)
        : ''
    })

    // onBeforeUnmount(() => {
    // window.eventHub.emit(eventPlayerNames.setTogglePlay)
    // })

    return {
      musicInfo,
      nowPlayTimeStr,
      maxPlayTimeStr,
      progress,
      isActiveTransition,
      handleTransitionEnd,
      handleCopy,
      imgError,
      statusText,
      title,
      showPlayerDetail,
      isPlay,
      togglePlay,
      playNext,
      playPrev,
      handleToMusicLocation,
      isShowPlayerDetail,
    }
  },
}
</script>


<style lang="less" module>
@import '@renderer/assets/styles/layout.less';

.player {
  position: relative;
  height: @height-player;
  box-sizing: border-box;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  contain: strict;
  padding: 0 28px 0 20px;
  z-index: 2;
  color: #fff;
  background: transparent;
  border-top: 0;
  * {
    box-sizing: border-box;
  }
}
.progress {
  position: absolute;
  top: 0;
  bottom: auto;
  left: 0;
  width: 100%;
  transform: none;
  padding-bottom: 0;
  .progressBar {
    height: 2px;
    border-radius: @radius-pill;
  }
}

.picContent {
  height: 100%;
  aspect-ratio: 1 / 1;
  flex: none;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  transition: opacity @transition-fast;

  &:hover {
    opacity: .8;
  }

  img {
    max-width: 100%;
    max-height: 100%;
    border-radius: @radius-cover;
    transition: @transition-normal;
    transition-property: border-color;
  }

  .emptyPic {
    background-color: #f5f5f5;
    border-radius: @radius-cover;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #cccccc;
    user-select: none;
    font-size: 20px;
    font-family: Consolas, "Courier New", monospace;

    span {
      padding-left: 3px;
    }
  }
}

.infoContent {
  padding-left: 12px;
  flex: 0 1 250px;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: flex-start;
  font-size: 13px;
  color: #1a1a1a;
  min-width: 0;
  line-height: 1.5;
}

.title {
  max-width: 100%;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  .mixin-ellipsis-1();
}
.status {
  padding-top: 2px;
  height: 20px;
  font-size: 12px;
  color: rgba(255, 255, 255, .68);
  .mixin-ellipsis-1();
  max-width: 100%;
}

.timeContent {
  flex: none;
  color: rgba(255, 255, 255, .82);
  font-size: 12px;
  margin-left: auto;
  padding-left: 18px;
}

.playBtnContent {
  height: 100%;
  flex: none;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: 22px;
  position: absolute;
  left: 44%;
  top: 0;
  transform: translateX(-50%);
}

.playBtn {
  flex: none;
  transition: @transition-fast;
  transition-property: color, opacity, transform;
  color: #fff;
  cursor: pointer;
  width: 25px;
  height: 25px;

  svg {
    fill: currentColor;
  }
  &:hover {
    color: var(--color-primary);
  }
  &:active {
    transform: scale(0.92);
  }

  // 中间的播放/暂停按钮：大圆形薄荷绿
  &:nth-child(2) {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background-color: var(--color-primary);
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(52, 208, 102, 0.3);

    svg {
      width: 20px !important;
      height: 20px !important;
    }

    &:hover {
      background-color: var(--color-primary-dark-100);
      color: #ffffff;
    }
    &:active {
      transform: scale(0.92);
    }
  }
}

</style>
