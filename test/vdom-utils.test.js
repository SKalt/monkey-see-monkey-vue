// const { cleanup, Vue, utils } = require("./forge");
import utils from "@vue/test-utils";
import Counter from "./fixtures/counter.js";
import { getAllVNodeListeners } from "../src/utils/vue.js";
test("foo", () => {
  const mounted = utils.shallowMount(Counter);
  const result = getAllVNodeListeners(mounted.vnode);
  console.log(result);
});
