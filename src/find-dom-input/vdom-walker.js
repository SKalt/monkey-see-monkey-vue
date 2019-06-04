import { isAbstract, innerVNode, dfs, getNonTextVNodeChildren } from "../utils";

import {
  markVisible,
  visibilityMark,
  vmUidMark,
  uid,
  aggregateVNodeListeners
} from "./recursion";
import delve from "dlv";
import assert from "assert";

function bindHooks(vm, { actions } = {}) {
  vm.$on("hook:updated", () => {
    // update vm in actions
    const vnode = vm._vnode;
    const agg = {},
      selector = [],
      family = [vnode];
    aggregateVNodeListeners(vnode, null, { agg, selector, family });
  });
  vm.$on(`hook:beforeDestroy`, () => {
    actions.delete(vm);
  });
}

function refresh(
  vnode,
  parentState = {
    visible: true,
    selector: [],
    family: [vnode],
    agg: {}
    // actions,
    // captured
  }
) {
  const { actions } = parentState;
  assert(typeof actions === "object", "un-assignable actions");
  const visible = markVisible(vnode, parentState); // side-effect: marks vnode

  assert(
    parentState.family.indexOf(vnode) >= 0,
    `${vnode.tag}\n${parentState.family.map(f => f.tag)}`
  );
  let { selector, family = [vnode], agg } = aggregateVNodeListeners(
    vnode,
    null,
    parentState
  );
  let vm = vnode.componentInstance;
  if (vm) {
    if (!actions.has(vm) && !vm[vmUidMark]) {
      bindHooks(vm, { actions });
      vm[vmUidMark] = uid.next();
    }
    agg = {
      /*id: aggId.next()*/
    }; // break inheritence
    actions.set(vm, agg); // will get populated by callbacks on children
    selector = []; // selectors should be relative to the nearest VM

    if (isAbstract(vm) && delve(vm, "_vnode.componentInstance")) {
      vm = vm._vnode.componentInstance;
    }
    vm[visibilityMark] = visible;
    // register listeners in actions here
    vnode = innerVNode(vm);
    family = [vnode];
  }
  return { visible, selector, family, agg, actions };
}

export function watch(vm, actions = new Map()) {
  const vnode = vm.$vnode;
  let state = {
    // inhereted -- vnode
    visible: true,
    family: [vnode], // normally an array of vnodes
    selector: [],
    agg: {
      /*id: aggId.next()*/
    },
    actions
  };
  if (!actions.has(vm)) actions.set(vm, state.agg);
  // never overwritten in recursion
  bindHooks(vm, { actions });
  state = { ...state, actions };
  const getChildren = getNonTextVNodeChildren;
  const callbacks = [refresh];
  state = dfs(vnode, getChildren, () => true, callbacks, state, state);
  return state.actions;
}
