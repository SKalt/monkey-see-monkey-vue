import { noop } from "../common.js";
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

// function dfs({ vnode, ctx, cb }) {
//   ctx = cb({ vnode, ctx });
//   (vnode.children || []).forEach(child => dfs({ vnode: child, ctx, cb }));
// }

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
    if (deep && child.componentInstance) {
      // continue down through the vdom owned by child components
      agg = getAllVNodeListeners(
        vnodeOf(child.componentInstance),
        vnode.children,
        [...selector, nameOf(child.componentInstance)],
        agg,
        true
      );
    }
  });

  return agg;
}

export function tagTree(vnode, indent = 0) {
  const repr = " ".repeat(2 * indent) + (vnode.tag || "<node>");
  const children = (vnode.children || [])
    .map(child => {
      return (
        tagTree(child, indent + 1) +
        (child.componentInstance
          ? tagTree(child.componentInstance._vnode, indent + 2)
          : "")
      );
    })
    .join("");
  return repr + "\n" + children;
}

function getInstanceChildren(vm) {
  return [...getVnodeChildren(vm._vnode || {}), vm.$chilren].filter(Boolean);
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

// export function componentTagTree(vm) {
//   const vms = new Map();
//   function recur(vm, indent = 0) {
//     return [];
//   }
//   return recur(vm).join("\n");
// }

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
  state = {}
) {
  console.log({ pre: { state } });
  state = callbacks.reduce((currentState, cb) => cb(node, currentState), state);
  console.log({ mid: { state } });
  (getChildren(node) || []).forEach(child => {
    if (shouldRecur(child, state)) {
      state = dfs(child, getChildren, shouldRecur, callbacks, state);
    }
  });
  return state;
}

export function componentTagTree(vm) {
  const getChildren = vm => vm.$children || [];
  // const shouldRecur = () => true
  const getName = vm => vm.$options.name || vm.$options._componentTag;
  const callbacks = [
    (vm, { repr = "", indent = 0 } = {}) => {
      repr = repr + " ".repeat(2 * indent) + (getName(vm) || "<node>") + "\n";
      indent += 1;
      return { repr, indent };
    }
  ];
  return dfs(vm, getChildren, () => true, callbacks, { repr: "", indent: 0 });
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
function update(vm, vms, actions) {
  vm;
}
export function watch(vm) {
  const vms = new Map();
  const actions = new Map();
  const bindHooks = vm => {
    vm.$on(`hook:updated`, () => {
      // update vm
    });
    vm.$on(`hook:beforeDestroy`, () => {
      vms.delete(vm);
      actions.delete(vm);
    });
  };

  // const observed = new Set();
  // state: {
  //   visible: bool,
  //   siblings: VNode[],
  //   selector: string,
  //   agg: Map(selector => action)
  // }
  // visibility utils
  const vmOf = vnode => {};
  const _callbacks = [
    (v, state = { visible: true, selector: "" }) => {
      const [vm, vnode] = vm => {
        if (
          vm.$options &&
          vm.$options.abstract &&
          vm._vnode &&
          vm._vnode.componentInstance
        ) {
          vm = vm._vnode.componentInstance;
        }
      };

      state.visible = markVisible(vnode, state);
      // state.vm =
      // state.vnode =
      state.selector = makeSelector(v, state);
      state.agg = getListeners(v, state);
      return state;
    }
  ];
  // const setHidden = v => (v[visibilityMark] = true);
  // const setVisible = v => (v[visibilityMark] = false);

  function process(vnode, siblings = [vnode], selector = "", agg = {}) {
    const listeners = getVNodeListeners(vnode);
    selector += ` > ${selectorOf(vnode, siblings)}`;
    assert(
      !(selector in agg),
      `selector unexpectedly in aggregator: '${selector}'`
    );
    agg[selector] = listeners;
    return agg;
  }

  function recur(vnode, siblings = [vnode] /*state will go here*/) {
    const selector = selectorOf(vnode, siblings);
    getVNodeListeners(vnode);
  }
  recur(vm._vnode);
  return dfs();
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
