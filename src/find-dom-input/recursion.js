import {
  // common
  dfs,
  namespacer,
  idSequence,
  // vnode
  getVNodeChildren,
  getVNodeListeners,
  selectorOf,
  isVisible,
  notText
} from "../utils";
import delve from "dlv";
import assert from "assert";
// https://vuejs.org/v2/guide/render-function.html#Event-amp-Key-Modifiers
export function getNonTextVNodeChildren(vnode) {
  return [...getVNodeChildren(vnode), delve(vnode, "componentInstance._vnode")]
    .filter(Boolean)
    .filter(notText);
}

export function aggregateVNodeListeners(
  vnode,
  _,
  { selector = [], family = [vnode], agg = {} } = {}
) {
  selector = [...selector, selectorOf(vnode, family)];
  const listeners = getVNodeListeners(vnode);
  assert(!(selector in agg), `${selector} in ${JSON.stringify(agg, null, 2)}`);
  if (listeners.length) agg[selector.join(" > ")] = listeners;
  family = [...getNonTextVNodeChildren(vnode)];
  return { selector, family, agg };
}

export function getAllVNodeListeners(vnode) {
  let state = { selector: [], family: [vnode], agg: {} };
  const getChildren = getVNodeChildren;
  const shouldRecur = vnode => Boolean(vnode) && isVisible(vnode);
  const callbacks = [aggregateVNodeListeners];

  return dfs(vnode, getChildren, shouldRecur, callbacks, state, state).agg;
}

export const namespace = namespacer("__MONKEY");
export const visibilityMark = namespace("VISIBLE__");
// vmUidMark = namespace("UID__"),
export const uid = idSequence();

export const markVisible = (v, parentIsVisible) => {
  return (v[visibilityMark] = !!parentIsVisible || isVisible(v || v._vnode));
};

export function propagateVisibility(vnode, parentIsVisible) {
  const visible = markVisible(vnode, parentIsVisible);
  getNonTextVNodeChildren(vnode).forEach(c => propagateVisibility(c, visible));
}
