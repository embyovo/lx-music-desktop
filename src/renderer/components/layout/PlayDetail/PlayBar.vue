<template>
  <div :class="$style.footer">
    <div :class="$style.progressContainer">
      <common-progress-bar
        :class-name="$style.progress"
        :progress="progress"
        :handle-transition-end="handleTransitionEnd"
        :is-active-transition="isActiveTransition"
      />
    </div>
    <div :class="$style.trackInfo">
      <img v-if="musicInfo.pic" :src="musicInfo.pic">
      <div :class="$style.trackMeta">
        <strong>{{ musicInfo.name }}</strong>
        <span>{{ musicInfo.singer }}</span>
      </div>
    </div>
    <div :class="$style.playControl">
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
    <div :class="$style.footerRight">
      <div :class="$style.timeLabel"><span>{{ nowPlayTimeStr }}</span><span style="margin: 0 5px;">/</span><span>{{ maxPlayTimeStr }}</span></div>
      <control-btns />
    </div>
  </div>
</template>

<script setup>
import { playNext, playPrev, togglePlay } from '@renderer/core/player'
import { isPlay, musicInfo } from '@renderer/store/player/state'
import usePlayProgress from '@renderer/utils/compositions/usePlayProgress'

import ControlBtns from './components/ControlBtns.vue'

const {
  nowPlayTimeStr,
  maxPlayTimeStr,
  progress,
  isActiveTransition,
  handleTransitionEnd,
} = usePlayProgress()

</script>

<style lang="less" module>
@import '@renderer/assets/styles/layout.less';

.footer {
  flex: 0 0 92px;
  overflow: hidden;
  display: flex;
  align-items: center;
  position: relative;
  padding: 0 34px 0 48px;
  color: rgba(255, 255, 255, .88);
  background: rgba(52, 74, 19, .28);
  backdrop-filter: blur(16px);
}
.trackInfo {
  width: 340px;
  display: flex;
  align-items: center;
  gap: 14px;
  overflow: hidden;
  img { width: 62px; height: 62px; object-fit: cover; border-radius: 5px; }
}

.trackMeta {
  min-width: 0;
  display: flex;
  flex-flow: column nowrap;
  gap: 5px;
  strong, span { .mixin-ellipsis-1(); }
  strong { font-size: 16px; }
  span { font-size: 13px; color: rgba(255,255,255,.68); }
}

.progressContainer {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 2px;
}
.progress {
  height: 2px;
}

.barTransition {
  transition-property: transform;
  transition-timing-function: ease-out;
  transition-duration: 0.2s;
}
.timeLabel {
  flex: none;
  display: flex;
  color: rgba(255,255,255,.82);
  span {
    font-size: 13px;
  }
}

.playControl {
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  height: 92px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 22px;
  color: #fff;
}
.playBtn {
  width: 26px;
  height: 26px;
  padding: 0;
  cursor: pointer;
  flex: none;
  // transition: @transition-normal;
  // transition-property: color;
  color: #fff;
  transition: opacity 0.2s ease;
  opacity: 1;
  cursor: pointer;

  svg {
    fill: currentColor;
    filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.2));
  }
  &:hover {
    opacity: 0.8;
  }
  &:active {
    opacity: 0.6;
  }
  &:nth-child(2) {
    width: 52px;
    height: 52px;
    padding: 15px;
    color: #fff;
    border-radius: 50%;
    background: rgba(255,255,255,.22);
  }
}

.footerRight {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 22px;
}

</style>
