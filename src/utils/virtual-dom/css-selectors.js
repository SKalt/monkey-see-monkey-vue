export function htmlId(vnode) {
  const id = (vnode.elm || {}).id;
  return id ? "#" + id : "";
}

export function className(vnode) {
  const cls = (vnode.elm || {}).className || (vnode.elm || {})._prevClass || "";
  return cls
    .split(" ")
    .sort()
    .filter(Boolean)
    .map(cls => "." + cls)
    .join("");
}

export function childNumber(vnode, family = []) {
  // vnode.parent isn't reliably defined.
  family = family.filter(f => f.tag);
  if (family.filter(f => f.tag === vnode.tag).length === 1) return "";
  const n = family.indexOf(vnode) + 1; // css selectors are 1-indexed
  if (n == 0) throw new Error("vnode not in family");
  if (n == 1) return ":first-child";
  if (n == family.length - 1) return ":last-child";
  return `:nth-child(${n})`;
}

const getStyle = vnode => (vnode.elm || {}).style || {};
const isDisplayNone = (style = {}) => style.display === "none";
const isVisibilityHidden = (style = {}) => style.visibility === "hidden";
export function isVisible(vnode) {
  const style = getStyle(vnode);
  return !isDisplayNone(style) && !isVisibilityHidden(style);
}

export function selectorOf(vnode, siblings = []) {
  if (!vnode.tag) return "";
  return [
    vnode.tag,
    htmlId(vnode),
    className(vnode),
    childNumber(vnode, siblings)
  ].join("");
}
