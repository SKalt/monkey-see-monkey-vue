import delve from "dlv";
export function resolve(object, ...paths) {
  for (let path of paths) {
    let result = delve(object, path);
    if (result !== undefined) return result;
  }
}
