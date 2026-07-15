<template>
  <button
    :class="[$style.btn, {[$style.min]: min}, {[$style.outline]: outline}]"
    tabindex="0"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script>
export default {
  props: {
    min: {
      type: Boolean,
    },
    outline: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
}
</script>


<style lang="less" module>
@import '@renderer/assets/styles/layout.less';

.btn {
  display: inline-block;
  border: none;
  border-radius: @form-radius;
  cursor: pointer;
  padding: 8px 20px;
  color: #ffffff;
  outline: none;
  transition: opacity 0.2s ease, background-color 0.2s ease;
  background-color: var(--color-primary);
  font-size: 14px;
  &[disabled] {
    opacity: .4;
    cursor: default;
  }

  &.outline {
    background-color: transparent;
    border: 1px solid #eeeeee;
    color: #666666;
  }

  &:hover {
    opacity: .9;
  }
  &:active {
    opacity: .8;
  }
}

.min {
  padding: 3px 8px;
  font-size: 12px;
}

</style>
