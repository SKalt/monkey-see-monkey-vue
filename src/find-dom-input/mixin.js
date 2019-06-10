import { fnOrNoop, innerVNode, noop } from "../utils";
import {
  getAllVNodeListeners,
  propagateVisibility,
  visibilityMark
} from "./recursion.js";

export function watchAll(
  Vue,
  { mounted = noop, updated = noop, destroyed = noop }
) {
  mounted = fnOrNoop(mounted);
  updated = fnOrNoop(updated);
  destroyed = fnOrNoop(destroyed);
  const roots = new Map(); // Map { rootVm => Map { vm => {[selector]: evts}} }

  function getOrCreateActions(vm) {
    const root = vm.$root;
    if (!roots.has(root)) roots.set(vm, new Map());
    return roots.get(vm.$root);
  }
  function refresh(vm) {
    const vnode = innerVNode(vm);
    const actions = getOrCreateActions(vm);
    if (!vnode) return; // this is the root
    const prev = actions.get(vm);
    const next = getAllVNodeListeners(vnode, [vnode], [], {});
    actions.set(vm, next);
    propagateVisibility(vnode, Boolean(vm.$vnode[visibilityMark]));
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
