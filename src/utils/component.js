import { upperCamelCase, truthyKeys } from "./common.js";
export const isRoot = vm => vm.$root === vm;

const getRoot = vm => vm.$root;

export function walkComponentTree(vm, callbacks = []) {
  const root = getRoot(vm);
  function recur(vm) {
    callbacks.forEach(cb => cb(vm));
    (vm.$children || []).forEach(recur);
  }
  recur(root);
}

export function nameOf(vm) {
  if (isRoot(vm)) return "Root";
  return upperCamelCase(
    vm.$options.name ||
      vm.$options._componentTag ||
      (vm.$options.__file || "").replace(/^[-_/]/, "") ||
      vm.$vnode.tag
  );
}

export function ancestry(vm) {
  function recur(vm, indent = 0) {
    let agg = `\n${"  ".repeat(indent)}${nameOf(vm)}`;
    if (vm.$parent) agg += recur(vm.$parent, indent + 1);
    return agg;
  }
  return recur(vm);
}

export function displayComponentTree(vm) {
  const root = getRoot(vm);

  function recur(vm, indent = 0) {
    let agg = `\n${"  ".repeat(indent)}${nameOf(vm)}`;
    (vm.$children || []).forEach(child => {
      agg += recur(child, indent + 1);
    });
    return agg;
  }
  return recur(root);
}

export function getListeners(vm) {
  // possibly useful:
  // from https://vuejs.org/v2/guide/render-function.html#Functional-Components:
  // listeners in a vnode is an alias of context.data.on
  return Object.entries(vm.$listeners).reduce((a, [k, v]) =>
    // normalize to key: callback[]
    Object.assign(a, { [k]: [].concat(v) })
  );
}
