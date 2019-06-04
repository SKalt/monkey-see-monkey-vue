import { dfs } from "../common";
import { getName } from "../component";
import { getVNodeChildren } from "../virtual-dom";
export function truthyKeys(obj) {
  return Object.entries(obj)
    .filter(([, v]) => Boolean(v))
    .map(([k, v]) => ({ [k]: v }));
}

export const debug = require("debug");
export const dbgr = n => (...args) => debug(`msmv${n ? ":" + n : ""}`)(...args);
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
