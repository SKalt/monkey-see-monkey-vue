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
export const vmOfRootVNode = vnode => vnode.componentInstance; // naive
// TODO: check how these handle with abstract / functional components
export function vmOf(vnode) {
  const paths = ["componentInstance", "context", "fnContext"];
  return resolve(vnode, ...paths, ...paths.map(path => `parent.${path}`));
}
