<template>
  <div :class="$style.view">
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" :key="$route.fullPath" class="view-container" />
      </transition>
    </router-view>
  </div>
</template>

<style lang="less" module>
@import '@renderer/assets/styles/layout.less';

.view {
  position: relative;
  z-index: 1;
  overflow: hidden;
  > :global(.view-container) {
    position: relative !important;
    height: 100%;
    width: 100%;
  }
}

:global(.page-enter-active),
:global(.page-leave-active) {
  transition: opacity .2s ease, transform .24s cubic-bezier(.22, .61, .36, 1);
}
:global(.page-enter-from) {
  opacity: 0;
  transform: translateY(8px) scale(.995);
}
:global(.page-leave-to) {
  opacity: 0;
  transform: translateY(-5px) scale(.998);
}

</style>
