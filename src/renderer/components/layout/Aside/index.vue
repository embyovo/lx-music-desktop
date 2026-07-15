<template>
  <div :class="[$style.aside, { [$style.fullscreen]: isFullscreen }]">
    <ControlBtns v-if="appSetting['common.controlBtnPosition'] == 'left'" />
    <div :class="$style.logo">
      <span :class="$style.logoMark">♪</span>
      <span>LX Music</span>
    </div>
    <NavBar />
    <MyList :class="$style.myLists" :list-id="listId" />
    <div :class="$style.welcome">
      <strong>欢迎使用lxmusic 🎉</strong>
      <span>可以配置音源插件来播放你的歌曲</span>
    </div>
  </div>
</template>

<script setup>
import { isFullscreen } from '@renderer/store'
import { appSetting } from '@renderer/store/setting'
import { computed } from '@common/utils/vueTools'
import { useRoute } from '@common/utils/vueRouter'
import { defaultList } from '@renderer/store/list/state'

import ControlBtns from './ControlBtns.vue'
import NavBar from './NavBar.vue'
import MyList from '@renderer/views/List/MyList/index.vue'

const route = useRoute()
const listId = computed(() => typeof route.query.id == 'string' ? route.query.id : defaultList.id)

</script>


<style lang="less" module>
@import '@renderer/assets/styles/layout.less';

.aside {
  transition: @transition-normal;
  transition-property: background-color;
  -webkit-app-region: drag;
  -webkit-user-select: none;
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
  border-right: 1px solid rgba(44, 163, 93, .08);

  &.fullscreen {
    -webkit-app-region: no-drag;
    .logo {
      display: none;
    }
  }
}

.logo {
  box-sizing: border-box;
  padding: 0 18px;
  height: @height-toolbar;
  color: #151515;
  flex: none;
  text-align: left;
  line-height: @height-toolbar;
  font-weight: bold;
  letter-spacing: .2px;
  font-size: 22px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.logoMark {
  width: 39px;
  height: 39px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  color: #fff;
  font-size: 25px;
  background: linear-gradient(145deg, #13de78, #04c965);
  box-shadow: 0 8px 22px rgba(8, 205, 103, .18);
}

.welcome {
  flex: none;
  display: flex;
  flex-flow: column nowrap;
  gap: 5px;
  padding: 0 28px 22px 48px;
  line-height: 1.45;
  -webkit-app-region: no-drag;

  strong {
    color: #12a958;
    font-size: 16px;
  }

  span {
    color: #333;
    font-size: 13px;
  }
}

.myLists {
  flex: auto;
  width: auto;
  min-height: 150px;
  margin: 12px 18px 16px;
  border: 0;
  background: transparent !important;
  box-shadow: none;
  -webkit-app-region: no-drag;
}

</style>
