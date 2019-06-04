export const noop = () => null;
export const fnOrNoop = f => (typeof f === "function" ? f : noop);
