const debug = require("debug");
export const dbgr = n => (...args) => debug(`msmv${n ? ":" + n : ""}`)(...args);
export function upperCamelCase(word) {
  if (!word || typeof word !== "string") return;
  const result = [...word.split(/[ -._]/g)]
    .map(w => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join("");
  return result;
}

export const noop = () => null;

export function truthyKeys(obj) {
  return Object.entries(obj)
    .filter(([k, v]) => !!v)
    .map(([k, v]) => ({ [k]: v }));
}
