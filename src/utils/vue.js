import { flattenDeep } from "lodash-es";
export function isRoot(vm) {
  return vm.$root === vm;
}

// function resolve()

export function getVNodeListeners(vnode) {
  const { data = {} } = vnode || {};
  return [
    ...new Set(
      flattenDeep(["on", "nativeOn"].map(k => Object.keys(data[k] || {})))
    )
  ];
}

function gatherVirtualDom(vnode, dom = new Set()) {
  // const dom = new Set();
  // const
  // dom.add(vnode);
  dom.add(vnode);
  (vnode.children || []).forEach(vnode => gatherVirtualDom(vnode, dom));
  return dom;
}

// function review(dom) {
//   dom.forEach(vnode )
// }

// https://vuejs.org/v2/guide/render-function.html#Event-amp-Key-Modifiers
export function getAllVNodeListeners(
  vnode,
  parentSelector = [],
  agg = new Map()
) {
  const selector = [...parentSelector, vnode.tag];
  const listeners = getVNodeListeners(vnode);
  if (listeners.length) agg.set(selector, listeners);
  (vnode.children || []).forEach(vn => getAllVNodeListeners(vn, selector, agg));
  return agg;
}

export function getListeners(vm) {
  // from https://vuejs.org/v2/guide/render-function.html#Functional-Components:
  // listeners in a vnode is an alias of context.data.on
  return Object.entries(vm.$listeners).reduce((a, [k, v]) =>
    // normalize to key: callback[]
    Object.assign(a, { [k]: [].concat(v) })
  );
}
