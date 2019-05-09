<template>
  <span class="click-me" ref="main" @click="onClick">
    There's no reason to suspect any given span to be clickable clicked
    {{ count }} times
  </span>
</template>
<script>
export default {
  data() {
    return {
      neverUsed: true,
      count: -1
    };
  },
  props: {
    notUsed: { type: Boolean, default: true }
  },
  methods: {
    onClick() {
      this.count++;
      this.$emit("custom-event", this.count);
    }
  }
};
</script>
<style scoped>
/* wonder what happens when I add this */
span {
  color: red;
}
</style>
