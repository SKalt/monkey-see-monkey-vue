import { fnOrNoop, innerVNode, outerVNode, noop } from "../utils";
import {
  getAllVNodeListeners,
  propagateVisibility,
  visibilityMark
} from "./recursion.js";

// import {
//   // util imports for debugging
//   // nameOf
// } from "../utils";
/**
 * initializer upsert for a Map. Comes with invokable default
 * @param  {Map} map
 * @param  {any} key
 * @param  {Function} fallback
 * @return {Map}
 */
function upsert(map, key, fallback) {
  const result = map.get(key);
  return result !== undefined ? result : map.set(key, fallback()).get(key);
}

export function watchAll(
  Vue,
  { mounted = noop, updated = noop, destroyed = noop } = {}
) {
  mounted = fnOrNoop(mounted);
  updated = fnOrNoop(updated);
  destroyed = fnOrNoop(destroyed);
  const roots = new Map(); // Map { rootVm => Map { vm => {[selector]: evts}} }
  function getOrCreateActions(vm) {
    return upsert(roots, vm.$root, () => new Map());
  }
  function refresh(vm) {
    const vnode = innerVNode(vm);
    const actions = getOrCreateActions(vm);
    const prev = actions.get(vm);
    const next = getAllVNodeListeners(vnode, [vnode], [], {});
    actions.set(vm, next);
    propagateVisibility(
      vnode,
      !outerVNode(vm) || Boolean(outerVNode(vm)[visibilityMark])
    );
    return [prev, next];
  }
  const mixin = {
    mounted() {
      const [, next] = refresh(this);
      mounted(this, next);
    },
    updated() {
      const [prev, next] = refresh(this);
      updated(this, prev, next);
    },
    destroyed() {
      const actions = getOrCreateActions(this);
      actions.delete(this);
      destroyed(this);
    }
  };
  Vue.mixin(mixin);
  return roots;
}
