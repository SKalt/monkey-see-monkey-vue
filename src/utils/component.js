export function isRoot(vm) {
  return vm.$root === vm;
}

export function getListeners(vm) {
  // from https://vuejs.org/v2/guide/render-function.html#Functional-Components:
  // listeners in a vnode is an alias of context.data.on
  return Object.entries(vm.$listeners).reduce((a, [k, v]) =>
    // normalize to key: callback[]
    Object.assign(a, { [k]: [].concat(v) })
  );
}
