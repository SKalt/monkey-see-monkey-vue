/* eslint-env jest */
/* eslint-disable no-unused-vars */
// const { cleanup, Vue, utils } = require("./forge");
const debug = require("debug");
debug.disable("*");
// const debug = require("debug");
import utils from "@vue/test-utils";
import Counter2 from "./fixtures/Counter.vue";
import { displayComponentTree, nameOf } from "../src/utils/component.js";
import {
  getAllVNodeListeners,
  tagTree,
  selectorOf,
  vmOf,
  vnodeOf,
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
test("vnodeOf(vm) accesses the inner virtual dom of a component", () => {
  const mounted = utils.mount(ButtonToggler);
  const vnode = vnodeOf(mounted.vm);
  expect(vnode).not.toEqual(mounted.vm.$vnode);
  // vm.$vnode is the vnode representing the component in the parent virtual dom
  // vm._vnode is the root of the component's section of the virtual dom
  expect(vnode).toEqual(mounted.vm._vnode);
  expect(vnode.context).toEqual(mounted.vm);
});
test("walking the vdom to aggregate component instances", () => {
  debug.enable("*");
  const dbg = debug("walker");
  const mounted = utils.mount(ButtonToggler);
  const result = watch(mounted.vm);
  let [root, ...subcomponents] = [...result.entries()];
  expect(result.get(mounted.vm)).toEqual({
    "div > a": ["click"],
    // and then the Clickables
    "div > div:last-child": ["hover"],
    "div > div:nth-child(5)": ["click"]
  });
  expect(root[0]).toEqual(mounted.vm);
  expect(subcomponents.length).toEqual(2);
  {
    let [vm, listeners] = subcomponents[0];
    expect(nameOf(vm)).toEqual("Clickable");
    expect(listeners).toEqual({
      "span.click-me.mountable": ["click"]
    });
  }
  {
    let [vm, listeners] = subcomponents[1];
    expect(nameOf(vm)).toEqual("Clickable");
    expect(listeners).toEqual({
      "span.click-me.displayable": ["click"]
    });
  }
});
