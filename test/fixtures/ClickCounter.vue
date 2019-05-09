<template>
  <div class="detectable probably">
    <!-- <button @click="onClick">A button</button> -->
    <clickable weird-attr="1" @custom-event="onCustomEvent" @click="onClick" />
    Text
    <span>More text</span>
  </div>
</template>
<script>
import Clickable from "./Clickable.vue";
const increment = key => {
  return function increment() {
    this.count[key]++;
  };
};
export default {
  components: { Clickable },
  props: {
    notEvenVaguelyUsed: { type: Boolean, default: () => true }
  },
  data() {
    return { count: { custom: 0, normal: 0 } };
  },
  methods: {
    onCustomEvent: increment("custom"),
    onClick: increment("custom") // <-- programmer error!
  }
};
</script>
