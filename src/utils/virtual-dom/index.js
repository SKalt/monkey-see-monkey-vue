import delve from "dlv";
import { noop, truthyKeys } from "../common.js";
import { nameOf } from "../component.js";
import { selectorOf, isVisible } from "./css-selectors.js";
import assert from "assert";
// const debug = require("debug");
// debug.enable("*");
function interactableElement(vnode) {
  return delve(vnode, "elm.nodeType") !== 3;
}
// an abstract function for walking a tree
function dfs(
  node,
  getChildren = noop,
  shouldRecur = noop,
  callbacks = [],
  state = {},
  parentState = { ...state }
) {
  // TODO: make immutable; eliminate one of the state args
  state = callbacks.reduce(
    (currentState, cb) => cb(node, currentState, parentState),
    parentState
  );
  parentState = state;
  return (getChildren(node) || []).reduce((state, child) => {
    return shouldRecur(child, state)
      ? dfs(child, getChildren, shouldRecur, callbacks, state, parentState)
      : state;
  }, state);
}

export function getVNodeListeners(vnode) {
  return [
    ...new Set([
      ...Object.keys(delve(vnode, "data.on", {})),
      ...Object.keys(delve(vnode, "data.nativeOn", {}))
    ])
  ].sort();
}
/**
 * @param  {VueComponent} vm
 * @return {VNode} the root vnode
 */
export function vnodeOf(vm) {
  return vm._vnode || vm.$vnode;
}
/**
 * @param  {VNode}
 * @return {VNode[]}
 */
function getVNodeChildren(vnode) {
  return vnode.children || [];
}

// https://vuejs.org/v2/guide/render-function.html#Event-amp-Key-Modifiers
function aggregateVNodeListeners(
  vnode,
  _,
  { selector = [], family = [vnode], agg = {} } = {}
) {
  selector = [...selector, selectorOf(vnode, family)];
  const listeners = getVNodeListeners(vnode);
  assert(!(selector in agg), `${selector} in ${JSON.stringify(agg, null, 2)}`);
  if (listeners.length) agg[selector.join(" > ")] = listeners;
  family = getNonTextVnodeChildren(vnode);
  // dbg(family.map(f => f.tag));
  family = [...family];
  return { selector, family, agg };
}

export function getAllVNodeListeners(vnode) {
  let state = { selector: [], family: [vnode], agg: {} };
  const getChildren = getVNodeChildren;
  const shouldRecur = vnode => Boolean(vnode) && isVisible(vnode);
  const callbacks = [aggregateVNodeListeners];

  return dfs(vnode, getChildren, shouldRecur, callbacks, state, state).agg;
}

export const idSequence = (prefix = "") => {
  let index = 0;
  const result = prefix ? () => `${prefix}-${index++}` : () => index++;
  result.next = result; // sugar
  return result;
};

export const ns = (namespacePrefix = "") => {
  if (namespacePrefix) return propName => `${namespacePrefix}_${propName}`;
  else return propname => propname;
};

const makeMixin = ({ mounted = noop, updated = noop, destroyed = noop }) => {
  // Map {vm => {[sel]: evts}}
  const fnOrNoop = f => (typeof f === "function" ? f : noop);
  mounted = fnOrNoop(mounted);
  updated = fnOrNoop(updated);
  destroyed = fnOrNoop(destroyed);

  const result = {
    vms: new Map()
  };

  function refresh(vm) {
    const vnode = vnodeOf(vm);
    if (!vnode) return; // this is the root
    const prev = result.vms.get(vm);
    const next = getAllVNodeListeners(vnode, [vnode], [], {});
    if ([...Object.keys(next)].length) {
      result.vms.set(vm, next);
    }
    return [prev, next];
  }
  result.mixin = {
    mounted() {
      const [, next] = refresh(this);
      mounted(this, next);
    },
    updated() {
      const [prev, next] = refresh(this);
      updated(this, prev, next);
    },
    destroyed() {
      result.vms.delete(this);
      destroyed(this);
    }
  };
  return result;
};

export function watchInteractivityChanges(
  Vue,
  { mounted = noop, updated = noop, destroyed = noop }
) {
  const { mixin, ...watcher } = makeMixin({ mounted, updated, destroyed });
  Vue.mixin(mixin);
  return watcher;
}

const getName = vm => {
  const {
    $options: { name, _componentTag }
  } = vm;
  return `${name || _componentTag || "anonymous"}[${vm._uid}]`;
};

export function tagTree(vnode) {
  const getChildren = getVNodeChildren;
  const state = { repr: "", indent: 0 };
  const callbacks = [
    (vnode, { repr = "" } = {}, { indent = 0 } = {}) => {
      const vm = vnode.componentInstance;
      const name = vm ? getName(vm) : vnode.tag;
      return {
        repr: repr + "\n" + " ".repeat(indent) + name,
        indent: indent + 1
      };
    }
  ];
  const shouldRecur = vnode => Boolean(vnode.tag) && vnode.elm.nodeType != 3;
  return dfs(vnode, getChildren, shouldRecur, callbacks, state).repr;
}

export function componentTagTree(vm) {
  const getChildren = vm => vm.$children || [];
  // const shouldRecur = () => true
  const callbacks = [
    (vm, { repr = "" } = {}, { indent = 0 } = {}) => {
      repr = repr + " ".repeat(2 * indent) + (getName(vm) || "<node>") + "\n";
      indent += 1;
      return { repr, indent };
    }
  ];
  const state = {
    repr: "",
    indent: 0
  };
  return dfs(vm, getChildren, () => true, callbacks, state, state).repr;
}

const namespace = ns("__MONKEY"),
  visibilityMark = namespace("VISIBLE__"),
  vmUidMark = namespace("UID__"),
  uid = idSequence();
const markVisible = (v, { visible = true } = {}) => {
  return (v[visibilityMark] = visible || isVisible(v || v._vnode));
};

// const fnContext = vnode => vnode.fnContext;
// import { isFunctional } from "../component";
//  updated = noop, beforeDestroy = noop,
const bindHooks = (vm, { actions } = {}) => {
  vm.$on(`hook:updated`, () => {
    // update vm
  });
  vm.$on(`hook:beforeDestroy`, () => {
    actions.delete(vm);
  });
};
// const aggId = idSequence("agg");
const isAbstract = vm => delve(vm, "$options.abstract", false);

export const vmOf = vnode => vnode.componentInstance; // naive
// vnode.context can yield the overarching vm
// I'm betting vnode.fnContext could as well.
const _refresh = (
  vnode,
  parentState = {
    visible: true,
    selector: [],
    family: [vnode],
    agg: {}
    // actions,
    // captured
  }
) => {
  const { actions } = parentState;
  const { visible } = markVisible(vnode, parentState); // side-effect: marks vnode
  assert(
    // TODO: remove assertion
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
    vnode = vnodeOf(vm);
    family = [vnode];
  }
  return { visible, selector, family, agg, actions };
};

function getNonTextVnodeChildren(vnode) {
  return [...getVNodeChildren(vnode), delve(vnode, "componentInstance._vnode")]
    .filter(Boolean)
    .filter(interactableElement);
}

export function watch(vm) {
  const vnode = vm.$vnode;
  let state = {
    // inhereted -- vnode
    visible: true,
    family: [vnode], // normally an array of vnodes
    selector: [],
    agg: {
      /*id: aggId.next()*/
    }
  };
  const actions = new Map([[vm, state.agg]]); // never overwritten in recursion
  state = { ...state, actions };
  const getChildren = getNonTextVnodeChildren;

  const callbacks = [_refresh];
  state = dfs(vnode, getChildren, () => true, callbacks, state, state);
  return state.actions;
}
