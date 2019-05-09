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
// function resolve(obj, ...keys) {
//   // const last = keys.pop();
//   // const allowed = {"object": true, "string": true}
//   // const typeCheck = x => allowed[typeof x] || false;
//   // while (keys.length && typeCheck(obj)) {
//   //   console.log("pre", obj);
//   //   obj = obj[keys.shift()] || {};
//   //   console.log("post", obj, typeof obj);
//   // }
//   while (keys.length) {
//     try {
//       obj = obj[keys.shift()];
//     } catch (e) {
//       return undefined;
//     }
//   }
//   return obj;
// }
