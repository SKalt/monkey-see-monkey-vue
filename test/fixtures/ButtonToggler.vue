<template>
  <div>
    <a href="#" @click="active = !active"></a>
    <clickable
      class="mountable"
      v-if="active"
      @custom-event="active = !active"
    />
    <clickable
      class="displayable"
      v-show="active"
      @custom-event="active = !active"
    />
    <div v-if="active" @hover="yellIncoherently"></div>
    <div v-show="active" @click="yellIncoherently"></div>
  </div>
</template>
<script>
import Clickable from "./Clickable.vue";
export default {
  data() {
    return { active: true };
  },
  components: {
    Clickable
  },
  methods: {
    yellIncoherently() {
      console.error("asdfqwer!"); // eslint-disable-line no-console
    }
  }
};
</script>
