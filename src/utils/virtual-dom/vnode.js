import delve from "dlv";
export function getVNodeListeners(vnode) {
  return [
    ...new Set([
      ...Object.keys(delve(vnode, "data.on", {})),
      ...Object.keys(delve(vnode, "data.nativeOn", {}))
    ])
  ].sort();
}
/**
 * @param  {VueComponent} vm
 * @return {VNode} the root vnode
 */
export const innerVNode = vm => vm._vnode;
/**
 * @param  {VNode}
 * @return {VNode[]}
 */
export const getVNodeChildren = vnode => vnode.children || [];

export function notText(vnode) {
  return delve(vnode, "elm.nodeType") !== 3;
}
