require("jsdom-global")();
const Vue = require("vue");
const utils = require("@vue/test-utils");

const Counter = {
  template: `
    <div>
      <span class="count">{{ count }}</span>
      <button @click="increment">Increment</button>
    </div>
  `,

  data() {
    return {
      count: 0
    };
  },

  methods: {
    increment() {
      this.count++;
    }
  }
};
