import {
  isAbstract,
  dfs,
  innerVNode,
  outerVNode
  // nameOf,
  // vmOf
} from "../utils";

import {
  markVisible,
  visibilityMark,
  vmUidMark,
  uid,
  getAllVNodeListeners,
  aggregateVNodeListeners,
  getNonTextVNodeChildren,
  propagateVisibility
} from "./recursion";
import delve from "dlv";
import assert from "assert";

function bindHooks(vm, { actions } = {}) {
  const vnode = innerVNode(vm);
  const refresh = vm => {
    actions.set(vm, getAllVNodeListeners(vnode, [vnode], [], {}));
    (vm.$children || [])
      .filter(child => !actions.has(child))
      .forEach(child => {
        refresh(child);
        bindHooks(child, { actions });
      });
  };
  vm.$on("hook:updated", () => {
    // update vm in actions
    propagateVisibility(
      vnode,
      !outerVNode(vm) || Boolean(outerVNode(vm)[visibilityMark])
    );
    refresh(vm);
  });
  vm.$on(`hook:beforeDestroy`, () => {
    actions.delete(vm);
  });
}

export function refresh(
  vnode,
  _,
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
  const vnode = outerVNode(vm) || innerVNode(vm);
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
  // const log = (vn, c) => {
  //   console.log(vn, vmOf(vn) && nameOf(vmOf(vn)));
  //   return c;
  // };
  const callbacks = [/*log,*/ refresh];
  state = dfs(vnode, getChildren, () => true, callbacks, state, state);
  return state.actions;
}
