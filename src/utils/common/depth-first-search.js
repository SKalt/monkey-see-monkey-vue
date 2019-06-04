import { noop } from "./functional.js";
// an abstract function for walking a tree
export default function dfs(
  node,
  getChildren = noop,
  shouldRecur = noop,
  callbacks = [],
  state = {},
  parentState = { ...state }
) {
  // TODO: make immutable; eliminate one of the state args
  state = callbacks.reduce(
    (currentState, cb) => cb(node, currentState, parentState),
    parentState
  );
  parentState = state;
  return (getChildren(node) || []).reduce((state, child) => {
    return shouldRecur(child, state)
      ? dfs(child, getChildren, shouldRecur, callbacks, state, parentState)
      : state;
  }, state);
}
