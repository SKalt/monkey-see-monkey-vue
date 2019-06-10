/* eslint-env jest */
import utils from "@vue/test-utils";
import { nameOf } from "../";
import { componentTagTree, tagTree } from "../../debugging";
import Clickable from "../../../../test/fixtures/Clickable.vue";
test("retrieving the name of a component", () => {
  const FancySpan = {
    template: '<span class="fancy" />'
  };
  const FancyDiv = {
    components: { FancySpan },
    template: "<div><fancy-span /></div>"
  };
  const mounted = utils.mount(FancyDiv);
  // for technical reasons, nameOf(mounted.vm) will be an anonymous component
  expect(nameOf(mounted.find(".fancy").vm)).toBe("FancySpan");
});
