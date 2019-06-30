import delve from "dlv";
export function resolve(object, ...paths) {
  for (let path of paths) {
    let result = delve(object, path);
    if (result !== undefined) return result;
  }
}

export function upsert(map, key, fallback) {
  const result = map.get(key);
  return result !== undefined ? result : map.set(key, fallback).get(key);
}
