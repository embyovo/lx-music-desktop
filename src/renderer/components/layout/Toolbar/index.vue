<template>
  <div :class="[$style.toolbar, { [$style.fullscreen]: isFullscreen }, appSetting['common.controlBtnPosition'] == 'left' ? $style.controlBtnLeft : $style.controlBtnRight]">
    <div :class="$style.history">
      <button type="button" aria-label="后退" @click="router.back()"><svg viewBox="0 0 24 24"><path d="m14.5 6-6 6 6 6" /></svg></button>
      <button type="button" aria-label="前进" @click="router.forward()"><svg viewBox="0 0 24 24"><path d="m9.5 6 6 6-6 6" /></svg></button>
    </div>
    <div :class="$style.searchGroup">
      <SearchInput />
      <IdentifyMusic />
    </div>
    <div :class="$style.toolbarRight">
      <router-link to="/setting" :class="$style.setting" aria-label="设置">
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 493.23 436.47"><use xlink:href="#icon-setting" /></svg>
      </router-link>
      <ControlBtns v-if="appSetting['common.controlBtnPosition'] != 'left'" />
    </div>
  </div>
</template>

<script setup>
import { isFullscreen } from '@renderer/store'
import { appSetting } from '@renderer/store/setting'
import ControlBtns from './ControlBtns.vue'
import SearchInput from './SearchInput.vue'
import IdentifyMusic from '@renderer/components/layout/Toolbar/IdentifyMusic.vue'
import { useRouter } from '@common/utils/vueRouter'

const router = useRouter()

</script>


<style lang="less" module>
@import '@renderer/assets/styles/layout.less';

.toolbar {
  display: flex;
  height: @height-toolbar;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  padding: 0 18px 0 28px;
  -webkit-app-region: drag;
  z-index: 2;
  background-color: #ffffff;
  border-bottom: 0;
  transition: background-color @transition-normal, border-color @transition-normal;

  &.fullscreen {
    -webkit-app-region: no-drag;
    .logo {
      display: none;
    }
  }

  &.controlBtnLeft {
    .control {
      display: none;
    }
  }
  &.controlBtnRight {
    justify-content: flex-start;
  }
}

.history {
  display: flex;
  gap: 10px;
  -webkit-app-region: no-drag;

  button {
    width: 36px;
    height: 36px;
    border: 0;
    border-radius: 50%;
    background: #f0f1f1;
    color: #5e6262;
    display: grid;
    place-items: center;
    cursor: pointer;
    transition: background .2s ease, color .2s ease;

    &:hover { background: #e6f7ed; color: var(--color-primary); }

    svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  }
}

.searchGroup {
  width: 292px;
  height: 38px;
  display: flex;
  align-items: center;
  padding-left: 6px;
  border-radius: @radius-pill;
  background: #fff;
  box-shadow: 0 5px 22px rgba(47, 91, 68, .05);
  -webkit-app-region: no-drag;

  :global(.container) { height: 38px; }
}

.toolbarRight {
  flex: auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 14px;
  height: 100%;
  -webkit-app-region: no-drag;
}

.setting {
  width: 28px;
  height: 28px;
  padding: 5px;
  color: #333;
  box-sizing: border-box;
  border-radius: 50%;
  transition: background .2s ease, color .2s ease;

  svg { width: 100%; height: 100%; fill: currentColor; }
  &:hover { color: var(--color-primary); background: #edf9f2; }
}

.logo {
  box-sizing: border-box;
  padding: 0 @spacing-md;
  height: @height-toolbar;
  color: var(--color-primary);
  flex: none;
  text-align: center;
  line-height: @height-toolbar;
  font-weight: bold;
  font-size: 16px;
}

</style>
