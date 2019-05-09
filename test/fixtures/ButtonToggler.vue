<template>
  <div>
    <Clickable v-if="active" @custom-event="active = !active" />
  </div>
</template>
<script>
import Clickable from "./Clickable.vue";
export default {
  components: {
    Clickable
  }
};
</script>
