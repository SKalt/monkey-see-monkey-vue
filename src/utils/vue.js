import { flattenDeep } from "lodash-es";
export function isRoot(vm) {
  return vm.$root === vm;
}

// function resolve()

function getVNodeListensers(vnode) {
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
function getAllVnodeLiseners(vnode) {
  // const selectors = new Set();
  // walk the tree
  const selectorToListeners = new Map();
  function recur(vnode, parentSelector, aggregator = selectorToListeners) {
    const selector = [...parentSelector, vnode.tag];
    const listeners = getVNodeListensers(vnode);
    if (listeners.length) {
      aggregator.set(selector, listeners);
    }
    (vnode.children || []).forEach(vn => recur(vn, selector, aggregator));
  }
  recur(vnode);
  const stringify = selector => selector.join(" > ");
  // there's probably a better way to do this.
  return {
    /*[selector: str]: event-names: string[] */
  };
}

export function getListeners(vm) {
  return Object.entries(vm.$listeners).reduce((a, [k, v]) =>
    // normalize to key: callback[]
    Object.assign(a, { [k]: [].concat(v) })
  );
}

/*
 * breadth-first search of the vue instance tree
 */
function findListeners(vm) {}

function eventFuzz(/*vm*/) {
  // find all elements
}
