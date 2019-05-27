/* eslint-env jest */
/* eslint-disable no-unused-vars */
// const { cleanup, Vue, utils } = require("./forge");
import debug from "debug";
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

import ButtonToggler from "./fixtures/ButtonToggler.vue";
import { componentTagTree, idSequence, watch } from "../src/utils/virtual-dom";
test("id sequence generation", () => {
  let id = idSequence("foo");
  expect(id()).toEqual("foo-0");
  expect(id.next()).toEqual("foo-1");
  id = idSequence();
  expect(id()).toEqual(0);
  expect(id()).toEqual(1);
});
test("walker", () => {
  /* eslint-disable no-console */
  const mounted = utils.mount(ButtonToggler);
  console.log(tagTree(mounted.vm._vnode));
  // console.log(truthyKeys(mounted.vm));
  // const _ = watch(mounted.vm);
  // console.log({ _ });
  // console.log([mounted.findAll(".click-me").length]);
  console.log(componentTagTree(mounted.vm.$root));
  // mounted.vm.__hidden__ = true;
  // console.log(mounted.vm.__hidden__); // you can
  debug.enable("msmv:agg*");
  const result = watch(mounted.vm);
  for (let [k, v] of result.entries()) {
    console.log(`${nameOf(k)} :: ${JSON.stringify(v, null, 2)}`);
  }
  // console.log(result.entries());
});
