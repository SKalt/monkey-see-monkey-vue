import delve from "dlv";
import { upperCamelCase, resolve } from "../common";

export const isRoot = vm => delve(vm, "$root", false) === vm;
export const getRoot = vm => vm.$root;

export function nameOf(vm) {
  if (isRoot(vm)) return "Root";
  return upperCamelCase(
    resolve(
      vm,
      "$options.name",
      "$options._componentTag",
      "$options.__file", // from vue-loader
      "$vnode.tag"
    ) || ""
  ).replace(/^[-_/]/, "");
}

// TODO: use just one of these.
export const getName = vm => {
  const {
    $options: { name, _componentTag }
  } = vm;
  return `${name || _componentTag || "anonymous"}[${vm._uid}]`;
};

export const isAbstract = vm => delve(vm, "$options.abstract", false);
export const vmOf = vnode => vnode.componentInstance; // naive
// vnode.context can yield the overarching vm
// I'm betting vnode.fnContext could as well.
