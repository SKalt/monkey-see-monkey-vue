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
 * gets the vnode of the vm within the parent component's vnode tree
 * @param  {VueComponent} vm
 * @return {VNode}
 */
export const outerVNode = vm => vm.$vnode;

/**
 * @function
 * @param  {VNode}
 * @return {VNode[]}
 */
export const getVNodeChildren = vnode => vnode.children || [];

/**
 * returns whether the vnode is not text
 * @param  {VNode} vnode [description]
 * @return {Boolean}       [description]
 */
export function notText(vnode) {
  return delve(vnode, "elm.nodeType") !== 3;
}
