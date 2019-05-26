import delve from "dlv";
import { noop, truthyKeys } from "../common.js";
import { nameOf } from "../component.js";
import { selectorOf, isVisible } from "./css-selectors.js";
import assert from "assert";
export function getVNodeListeners(vnode) {
  return [
    ...new Set([
      ...Object.keys((vnode.data || {}).on || {}),
      ...Object.keys((vnode.data || {}).nativeOn || {})
    ])
  ].sort();
}

function vnodeOf(vm) {
  return vm._vnode || vm.$vnode;
}

// https://vuejs.org/v2/guide/render-function.html#Event-amp-Key-Modifiers
export function getAllVNodeListeners(
  vnode,
  siblings = [vnode],
  path = [],
  agg = {},
  deep = false
) {
  if (!vnode) return agg; // it's a root
  const selector = [...path, selectorOf(vnode, siblings)];
  const listeners = getVNodeListeners(vnode);
  if (listeners.length) {
    agg[selector.join(" > ")] = listeners;
  }
  (vnode.children || []).forEach(child => {
    agg = getAllVNodeListeners(child, vnode.children, selector, agg);
  });

  return agg;
}

function getVnodeChildren(vnode) {
  return vnode.children || [];
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

// an abstract function for walking a tree
function dfs(
  node,
  getChildren = noop,
  shouldRecur = noop,
  callbacks = [],
  state = {},
  parentState = {}
) {
  state = callbacks.reduce(
    (currentState, cb) => cb(node, currentState, parentState),
    state
  );
  parentState = state;
  return (getChildren(node) || []).reduce((state, child) => {
    return shouldRecur(child, state)
      ? dfs(child, getChildren, shouldRecur, callbacks, state, parentState)
      : state;
  }, state);
}
const getName = vm => {
  const {
    $options: { name, _componentTag }
  } = vm;
  return `${name || _componentTag || "anonymous"}[${vm._uid}]`;
};

export function tagTree(vnode, indent = 0) {
  const getChildren = getVnodeChildren;
  const state = { repr: "", indent: 0 };
  const callbacks = [
    (vnode, { repr = "" } = {}, { indent = 0 } = {}) => {
      const name = vnode.componentInstance
        ? getName(vnode.componentInstance)
        : vnode.tag;
      return {
        repr: repr + "\n" + " ".repeat(indent) + name,
        indent: indent + 1
      };
    }
  ];
  const shouldRecur = vnode => Boolean(vnode.tag) && vnode.elm.nodeType != 3;
  return dfs(vnode, getChildren, shouldRecur, callbacks, state, state).repr;
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
  return dfs(vm, getChildren, () => true, callbacks, { repr: "", indent: 0 })
    .repr;
}

const namespace = ns("__MONKEY");
const visibilityMark = namespace("visible__");
const markVisible = (v, { visible = true } = {}) => {
  return (v[visibilityMark] = visible || isVisible(v || v._vnode));
};

// const vmOf = vnode => vnode.componentInstance;
// const fnContext = vnode => vnode.fnContext;
// import { isFunctional } from "../component";
const makeSelector = (v, { siblings = [v], selector = "" } = {}) => {
  return (selector += ` > ${selectorOf(v, siblings)}`);
};
const getListeners = (v, { visible = true, selector = "", agg = {} } = {}) => {
  const listeners = visible ? getVNodeListeners(v) : [];
  // TODO: case for vm
  agg[selector] = listeners;
  return agg;
};

const bindHooks = (vm, { vms, actions } = {}) => {
  vm.$on(`hook:updated`, () => {
    // update vm
  });
  vm.$on(`hook:beforeDestroy`, () => {
    vms.delete(vm);
    actions.delete(vm);
  });
};
const isAbstract = vm => delve(vm, "$options.abstract", false);
export function watch(vm) {
  const actions = new Map();
  const getChildren = vnode =>
    [
      ...getVnodeChildren(vnode),
      delve(vnode, "componentInstance._vnode")
    ].filter(Boolean);
  let state = {
    visible: true,
    siblings: undefined,
    selector: "",
    actions,
    agg: {}
  };

  // const observed = new Set();
  // state: {
  //   visible: bool,
  //   siblings: VNode[],
  //   selector: string,
  //   agg: Map(selector => action)
  // }
  // const vmOf = vnode => {};
  const refresh = vm => {
    actions.set(vm, getAllVNodeListeners(vnodeOf(vm)));
  };
  const callbacks = [
    (vnode, state = { visible: true, selector: "" }) => {
      // const [vm, vnode] = vm => {
      //   }
      // };

      state.visible = markVisible(vnode, state); // side-effect: marks vnode
      const vm = vnode.componentInstance || null;
      if (vnode.componentInstance) {
      }
      if (isAbstract(vm) && delve(vm, "_vnode.componentInstance")) {
        vm = vm._vnode.componentInstance;
      }
      if (state.vm) {
        state.vm[visibilityMark] = state.visible;
      }
      // state.vnode =
      state.selector = makeSelector(vnode, state);
      state.agg = getListeners(vnode, state);
      return state;
    }
  ];
  // const setHidden = v => (v[visibilityMark] = true);
  // const setVisible = v => (v[visibilityMark] = false);

  function process(vnode, siblings = [vnode], selector = "", agg = {}) {
    selector += ` > ${selectorOf(vnode, siblings)}`;
    assert(
      !(selector in agg),
      `selector unexpectedly in aggregator: '${selector}'`
    );
    agg[selector] = listeners;
    return agg;
  }

  state = dfs(vm.$vnode, getChildren, () => true, callbacks, state);
  return state.actions;
}
export function _watch(vm) {
  const vms = new Map(/*id:vm*/);
  const actions = new Map(/*vm: {[selector]: Array<string>}*/);

  function recur(
    vnode,
    visible = true,
    family = [vnode],
    selector = "",
    agg = {}
  ) {
    visible = markVisible(vnode, { visible });
    console.log({ visible });
  }
  recur(vm._vnode);
}
