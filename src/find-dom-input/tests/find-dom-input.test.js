/* eslint-env jest */
import utils from "@vue/test-utils";
import { getAllVNodeListeners, watchAll, watch } from "../";
import { nameOf, componentTagTree } from "../../utils";
const CounterComponent = {
  template: `
    <div class="">
      <div id="click-me" @click="add">
        you've clicked here {{ count }} times
        <span class="hover-me" @hover="add">
          hover here
        </span>
      </div>
    </div>
  `,
  data() {
    return { count: 0 };
  },
  methods: {
    add() {
      this.count += 1;
      this.$emit("custom-event");
    }
  }
};

test("finding DOM events within a single component", async () => {
  const mounted = utils.mount(CounterComponent);
  const result = getAllVNodeListeners(mounted.vnode);
  expect(result).toEqual({
    "div > div#click-me": ["click"],
    "div > div#click-me > span.hover-me": ["hover"]
  });
});

const ShowHide = {
  components: {
    CounterComponent
  },
  data() {
    return { toggled: true };
  },
  template: `
    <div>
      <div v-if="toggled">
        <counter-component />
      </div>
      <div class="toggler" @click="toggled = !toggled">
        Click here to toggle
      </div>
    </div>
  `
};
describe("watchAll", () => {
  test("mounting and unmounting a component", () => {
    const localVue = utils.createLocalVue();
    const roots = watchAll(localVue);
    const mounted = utils.mount(ShowHide, { localVue });
    const counter = () => mounted.find("div > div > div").vm;
    const actions = roots.get(mounted.vm.$root);
    expect(actions).toBeInstanceOf(Map);
    expect(actions.get(counter())).toBeDefined();
    mounted.find(".toggler").trigger("click");
    expect(actions.get(counter())).toBeUndefined();
    mounted.find(".toggler").trigger("click");
    expect(actions.get(counter())).toBeDefined();
  });
});
describe("watch", () => {
  test("mounting and unmounting a component", () => {
    const mounted = utils.mount(ShowHide);
    const counter = () => mounted.find("div > div > div").vm;
    const actions = watch(mounted.vm.$root);
    expect(actions).toBeInstanceOf(Map);
    // console.log(nameOf(counter()));
    // console.log(componentTagTree(mounted.vm.$root));
    expect(actions.get(counter())).toBeDefined();
    mounted.find(".toggler").trigger("click");
    expect(actions.get(counter())).toBeUndefined();
    mounted.find(".toggler").trigger("click");
    expect(actions.get(counter())).toBeDefined();
  });
});
