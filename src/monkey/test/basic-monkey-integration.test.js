/* eslint-env jest */
import utils from "@vue/test-utils";
import Monkey from "../";
import { watch } from "../../find-dom-input";

const BadCounter = {
  template: `
  <div>
  {{ ok }}
  <button @click="count+=1" />
  </div>
  `,
  data() {
    return {
      count: 0
    };
  },
  computed: {
    ok() {
      if (this.count > 3) {
        throw new Error("Count can't be greater than three");
      }
      return true;
    }
  }
};
test("integration", () => {
  const localVue = utils.createLocalVue();
  const mounted = utils.shallowMount(BadCounter, { localVue });
  const observer = watch(mounted.vm);
  const monkey = new Monkey({
    observer,
    ticker: localVue,
    start: false,
    seed: 1,
    wrapper: mounted
  });
  return monkey.test();
});
