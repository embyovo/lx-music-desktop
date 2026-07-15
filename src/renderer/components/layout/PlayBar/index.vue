<template>
  <div :class="$style.host" @click="showPlayerDetail">
    <div :class="$style.dynamicBg" :style="playerCoverStyle" />
    <FullWidthProgress v-if="appSetting['common.playBarProgressStyle'] == 'full'" />
    <MiddleWidthProgress v-else-if="appSetting['common.playBarProgressStyle'] == 'middle'" />
    <MiniWidthProgress v-else />
  </div>
</template>

<script setup>
import { computed } from '@common/utils/vueTools'
import { appSetting } from '@renderer/store/setting'
import { musicInfo, playMusicInfo } from '@renderer/store/player/state'
import { setShowPlayerDetail } from '@renderer/store/player/action'
import MiniWidthProgress from './MiniWidthProgress.vue'
import FullWidthProgress from './FullWidthProgress.vue'
import MiddleWidthProgress from './MiddleWidthProgress.vue'

const playerCoverStyle = computed(() => musicInfo.pic ? { backgroundImage: `url(${musicInfo.pic})` } : null)
const showPlayerDetail = () => {
  if (playMusicInfo.musicInfo) setShowPlayerDetail(true)
}
</script>

<style lang="less" module>
@import '@renderer/assets/styles/layout.less';

.host {
  position: relative;
  height: @height-player;
  overflow: hidden;
  background: #4b4d34;
  cursor: pointer;

  > :not(.dynamicBg) { position: relative; z-index: 1; }
}
.dynamicBg {
  position: absolute;
  z-index: 0;
  inset: -38px;
  background-position: center 42%;
  background-size: cover;
  filter: blur(32px) saturate(1.35) brightness(.6);
  opacity: .9;
  transform: scale(1.12);
  transition: background-image .45s ease, opacity .3s ease;

  &:after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(38, 39, 25, .28), rgba(20, 22, 15, .56));
  }
}
</style>
