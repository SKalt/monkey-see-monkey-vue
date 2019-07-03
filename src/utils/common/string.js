export function upperCamelCase(word) {
  if (!word || typeof word !== "string") return "";
  const result = [...word.split(/[ -._]/g)]
    .map(w => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join("");
  return result;
}

export const idSequence = (prefix = "") => {
  let index = 0;
  const result = prefix ? () => `${prefix}-${index++}` : () => index++;
  result.next = result; // sugar
  return result;
};

export const namespacer = (namespacePrefix = "") => {
  if (namespacePrefix) return propName => `${namespacePrefix}_${propName}`;
  else return propname => propname;
};
