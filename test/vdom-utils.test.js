/* eslint-env jest */
// const { cleanup, Vue, utils } = require("./forge");
import utils from "@vue/test-utils";
import Counter2 from "./fixtures/Counter.vue";
import { displayComponentTree, nameOf } from "../src/utils/component.js";
import {
  getAllVNodeListeners,
  tagTree,
  selectorOf,
  watchInteractivityChanges
} from "../src/utils/virtual-dom/index.js";
import dedent from "dedent";
import { truthyKeys } from "../src/utils/common";

import Counter from "./fixtures/counter.js";
test("finding a DOM event within a single component", async () => {
  const mounted = utils.mount(Counter);
  const result = getAllVNodeListeners(mounted.vnode);
  expect(result).toEqual({ "div > button": ["click"] });
});

import ClickCounter from "./fixtures/ClickCounter.vue";
test("find all DOM events in a tree of components", () => {
  const localVue = utils.createLocalVue();
  let log = [];
  let expected;
  // watchInteractivityChanges returns a Map of component instances to objects
  // mapping css selectors within the component to interactive items.
  watchInteractivityChanges(localVue, {
    mounted: (vm, evts) => {
      evts = Object.keys(evts).length ? ": " + JSON.stringify(evts) : "";
      log.push(`mounted ${nameOf(vm)}${evts}`);
    },
    updated: (vm, prev, next) => {
      prev = JSON.stringify(prev);
      next = JSON.stringify(next);
      log.push(`updated ${nameOf(vm)}: ${prev} -> ${next}`);
    }
  });
  const mounted = utils.mount(ClickCounter, { localVue });

  expect(log).toEqual(
    (expected = [
      'mounted Clickable: {"span.click-me":["click"]}',
      "mounted VueComponent8",
      "mounted Root"
    ])
  );
  mounted.find(".click-me").trigger("click");
  expect(log).toEqual([
    ...expected,
    "updated Clickable: " +
      '{"span.click-me":["click"]} -> {"span.click-me":["click"]}'
  ]);
});
test("generating selectors", () => {});
