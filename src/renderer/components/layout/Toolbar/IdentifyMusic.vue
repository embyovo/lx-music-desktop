<template>
  <button type="button" aria-label="听歌识曲" :class="$style.trigger" @click="open">
    <svg :class="$style.icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="8" y="3" width="8" height="13" rx="4" />
      <path d="M5.5 11.5v1a6.5 6.5 0 0 0 13 0v-1M12 19v3M8.5 22h7" />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { useRouter } from '@common/utils/vueRouter'

const router = useRouter()
const open = () => { void router.push('/identify') }
</script>

<style lang="less" module>
.trigger {
  display: flex;
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  color: #333;
  &:hover { color: var(--color-primary); background: #edf9f2; }
}
.icon { display: block; width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; }
</style>
