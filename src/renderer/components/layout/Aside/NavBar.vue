<template>
  <div ref="dom_menu" :class="$style.menu">
    <ul :class="$style.list" role="toolbar">
      <li v-for="item in menus" :key="item.to" :class="$style.navItem" role="presentation">
        <router-link :class="[$style.link, {[$style.active]: $route.meta.name == item.name}]" role="tab" :aria-selected="$route.meta.name == item.name" :to="item.to" :aria-label="item.tips">
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" :viewBox="item.iconSize" :height="item.size" :width="item.size" space="preserve">
            <use :xlink:href="item.icon" />
          </svg>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { appSetting } from '@renderer/store/setting'
import { useI18n } from '@root/lang'
import { ref, computed } from '@common/utils/vueTools'
import { useIconSize } from '@renderer/utils/compositions/useIconSize'

export default {
  name: 'NavBar',
  setup() {
    const t = useI18n()
    const dom_menu = ref<HTMLElement>()
    const iconSize = useIconSize(dom_menu, 0.32)

    const menus = computed(() => {
      const size = iconSize.value
      return [
        {
          to: '/search',
          tips: '发现',
          icon: '#icon-search-2',
          iconSize: '0 0 425.2 425.2',
          size,
          name: 'Search',
          enable: true,
        },
        {
          to: '/songList/list',
          tips: '歌单',
          icon: '#icon-album',
          iconSize: '0 0 425.2 425.2',
          size,
          name: 'SongList',
          enable: true,
        },
        {
          to: '/leaderboard',
          tips: t('leaderboard'),
          icon: '#icon-leaderboard',
          iconSize: '0 0 425.22 425.2',
          size,
          name: 'Leaderboard',
          enable: false,
        },
        {
          to: '/download',
          tips: t('download'),
          icon: '#icon-download-2',
          iconSize: '0 0 425.2 425.2',
          size,
          enable: appSetting['download.enable'],
          name: 'Download',
        },
        {
          to: '/setting',
          tips: t('setting'),
          icon: '#icon-setting',
          iconSize: '0 0 493.23 436.47',
          size,
          enable: false,
          name: 'Setting',
        },
      ].filter(m => m.enable)
    })
    return {
      appSetting,
      menus,
      dom_menu,
    }
  },
}
</script>

<style lang="less" module>
@import '@renderer/assets/styles/layout.less';

.menu {
  flex: none;
  padding: 2px 0;
}
.list {
  -webkit-app-region: no-drag;
  display: flex;
  flex-flow: column nowrap;
  gap: 5px;
  padding: 0 18px;
  &:last-child {
    margin-bottom: 0;
  }
}
.navItem {
  position: relative;
  height: 41px;
  flex: none;
}
.link {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  transition: @transition-fast;
  transition-property: background-color, color, opacity;
  color: #333333;
  cursor: pointer;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 17px;
  border-radius: 10px;
  font-size: 15px;
  .mixin-ellipsis-1();

  svg {
    width: 16px !important;
    height: 16px !important;
    flex: none;
  }

  // 用 CSS 伪元素显示导航文字（不修改模板）
  &::after {
    content: attr(aria-label);
    margin-left: 10px;
    font-size: 15px;
    white-space: nowrap;
    .mixin-ellipsis-1();
  }

  &.active {
    color: #ffffff;
    background: linear-gradient(100deg, #12d875, #05ce68);
    box-shadow: 0 7px 18px rgba(7, 206, 104, .16);

    &:hover {
      opacity: .92;
    }
  }

  &:hover {
    color: var(--color-primary);

    &:not(.active) {
      background-color: #f0f5f0;
    }
  }
  &:active:not(.active) {
    background-color: #e8f0e8;
  }
}

</style>
