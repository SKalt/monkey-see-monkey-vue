import { fnOrNoop, innerVNode, getAllVNodeListeners, noop } from "../utils";
// import {refresh}

const makeMixin = ({ mounted = noop, updated = noop, destroyed = noop }) => {
  mounted = fnOrNoop(mounted);
  updated = fnOrNoop(updated);
  destroyed = fnOrNoop(destroyed);

  const result = {
    vms: new Map() // Map {vm => {[selector]: evts}}
  };

  function refresh(vm) {
    const vnode = innerVNode(vm);
    if (!vnode) return; // this is the root
    const prev = result.vms.get(vm);
    const next = getAllVNodeListeners(vnode, [vnode], [], {});
    if (Object.keys(next).length) {
      result.vms.set(vm, next);
    }
    return [prev, next];
  }
  result.mixin = {
    mounted() {
      const [, next] = refresh(this);
      mounted(this, next);
    },
    updated() {
      const [prev, next] = refresh(this);
      updated(this, prev, next);
    },
    destroyed() {
      result.vms.delete(this);
      destroyed(this);
    }
  };
  return result;
};

export function watchAll(
  Vue,
  { mounted = noop, updated = noop, destroyed = noop }
) {
  mounted = fnOrNoop(mounted);
  updated = fnOrNoop(updated);
  destroyed = fnOrNoop(destroyed);

  const roots = new Map(/*rootVM => vm => actions*/);

  const _ = root => {
    if (!roots.has(root)) roots.set(root, new Map());
    return roots.get(root);
  };
  const { mixin, ...watcher } = makeMixin({ mounted, updated, destroyed });
  Vue.mixin(mixin);
  return watcher;
}
