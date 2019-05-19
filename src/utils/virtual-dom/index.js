import { noop } from "../common.js";
import { nameOf } from "../component.js";
import { selectorOf } from "./css-selectors.js";
export function getVNodeListeners(vnode) {
  return [
    ...new Set([
      ...Object.keys((vnode.data || {}).on || {}),
      ...Object.keys((vnode.data || {}).nativeOn || {})
    ])
  ].sort();
}

function vnodeOf(vm) {
  return vm._vnode || vm.$vnode;
}

// function dfs({ vnode, ctx, cb }) {
//   ctx = cb({ vnode, ctx });
//   (vnode.children || []).forEach(child => dfs({ vnode: child, ctx, cb }));
// }

// https://vuejs.org/v2/guide/render-function.html#Event-amp-Key-Modifiers
export function getAllVNodeListeners(
  vnode,
  siblings = [vnode],
  path = [],
  agg = {},
  deep = false
) {
  if (!vnode) return agg; // it's a root
  const selector = [...path, selectorOf(vnode, siblings)];
  const listeners = getVNodeListeners(vnode);
  if (listeners.length) {
    agg[selector.join(" > ")] = listeners;
  }
  (vnode.children || []).forEach(child => {
    agg = getAllVNodeListeners(child, vnode.children, selector, agg);
    if (deep && child.componentInstance) {
      // continue down through the vdom owned by child components
      agg = getAllVNodeListeners(
        vnodeOf(child.componentInstance),
        vnode.children,
        [...selector, nameOf(child.componentInstance)],
        agg,
        true
      );
    }
  });

  return agg;
}

// TODO: clean this fn up.  Originally intended as a debugging helper.
export function tagTree(vnode, indent = 0) {
  const repr = " ".repeat(2 * indent) + (vnode.tag || "<node>");
  const children = (vnode.children || [])
    .map(child => {
      return (
        tagTree(child, indent + 1) +
        (child.componentInstance
          ? tagTree(child.componentInstance._vnode, indent + 2)
          : "")
      );
    })
    .join("");
  return repr + "\n" + children;
}

export const idSequence = (prefix = "") => {
  let index = 0;
  if (prefix) return () => `${prefix}-${index++}`;
  else return () => index++;
};

}

export const ns = (namespacePrefix = "") => {
  if (namespacePrefix) return propName => `${namespacePrefix}_${propName}`;
  else return propname => propname;
};

const makeMixin = ({ mounted = noop, updated = noop, destroyed = noop }) => {
  // Map {vm => {[sel]: evts}}
  const fnOrNoop = f => (typeof f === "function" ? f : noop);
  mounted = fnOrNoop(mounted);
  updated = fnOrNoop(updated);
  destroyed = fnOrNoop(destroyed);

  const result = {
    vms: new Map()
  };

  function refresh() {
    const vnode = vnodeOf(this);
    if (!vnode) return; // this is the root
    const prev = result.vms.get(this);
    const next = getAllVNodeListeners(vnode, [vnode], [], {});
    if ([...Object.keys(next)].length) {
      result.vms.set(this, next);
    }
    return [prev, next];
  }
  result.mixin = {
    mounted() {
      const [, next] = refresh.bind(this)();
      if (!next) console.log(nameOf(this));
      mounted(this, next);
    },
    updated() {
      const [prev, next] = refresh.bind(this)();
      updated(this, prev, next);
    },
    destroyed() {
      result.vms.delete(this);
      destroyed(this);
    }
  };
  return result;
};

export function watchInteractivityChanges(
  Vue,
  { mounted = noop, updated = noop, destroyed = noop }
) {
  const { mixin, ...watcher } = makeMixin({ mounted, updated, destroyed });
  Vue.mixin(mixin);
  return watcher;
}
