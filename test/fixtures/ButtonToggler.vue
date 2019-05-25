<template>
  <div>
    <clickable
      class="mountable"
      v-if="active"
      @custom-event="active = !active"
    />
    <clickable
      class="displayable"
      v-show="!active"
      @custom-event="active = !active"
    />
  </div>
</template>
<script>
import Clickable from "./Clickable.vue";
export default {
  data() {
    return { active: false };
  },
  components: {
    Clickable
  }
};
</script>
