import { upperCamelCase, truthyKeys } from "./common.js";
import delve from "dlv";
export const isRoot = vm => delve(vm, "$root", false) === vm;

const getRoot = vm => vm.$root;

export function walkComponentTree(vm, callbacks = []) {
  const root = getRoot(vm);
  function recur(vm) {
    callbacks.forEach(cb => cb(vm));
    (vm.$children || []).forEach(recur);
  }
  recur(root);
}
// see
// https://github.com/vuejs/vue-devtools/blob/dev/src/backend/index.js#L354:10
// at captureChild()
// const isComponentInstance = vnode => Boolean(vnode.componentInstance);
// const isFunctionalComponent = vnode =>
//   vnode.fnContext && !vnode.componentInstance;
// if (child.fnContext && !child.componentInstance) {
//     return capture(child)
//   } else if (child.componentInstance) {
//     if (!child.componentInstance._isBeingDestroyed) return capture(child.componentInstance)
//   } else if (child.children) {
//     return flatten(child.children.map(captureChild))
//   }

export function bindHook(vm, hook, callback) {
  vm.$on(`hook:${hook}`, callback);
}
// const onUpdated = (vm, callback) => bindHook(vm, 'updated', callback)

export function nameOf(vm) {
  if (isRoot(vm)) return "Root";
  return upperCamelCase(
    delve(
      vm,
      "$options.name",
      delve(
        vm,
        "$options._componentTag",
        delve(vm, "$options.__file", "").replace(/^[-_/]/, "") ||
          delve(vm, "$vnode.tag")
      )
    )
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
