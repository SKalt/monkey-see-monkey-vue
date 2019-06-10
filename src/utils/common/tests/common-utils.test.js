/*eslint-env jest*/
import { fnOrNoop, noop } from "../"; // functional

test("fnOrNoop rejects sth", () => {
  let fn = () => 1;
  expect(fnOrNoop(fn)).toEqual(fn);
  fn = function() {
    return 1;
  };
  expect(fnOrNoop(fn)).toEqual(fn);
  fn = 1;
  expect(fnOrNoop(fn)).toEqual(noop);
  fn = new Promise(r => setTimeout(r, 1000));
  expect(fnOrNoop(fn)).toEqual(noop);
  fn = new Map();
  expect(fnOrNoop(fn)).toEqual(noop);
  fn = new Proxy({}, {});
  expect(fnOrNoop(fn)).toEqual(noop);
});

import { idSequence, namespacer } from "../"; // string
test("id sequence generation", () => {
  let id = idSequence("foo");
  expect(id()).toEqual("foo-0");
  expect(id.next()).toEqual("foo-1");
  id = idSequence();
  expect(id()).toEqual(0);
  expect(id()).toEqual(1);
});

test("prop namespacing", () => {
  let ns = namespacer("");
  expect(ns("foo")).toEqual("foo");
  expect(ns("")).toEqual("");
  expect(ns(1)).toEqual(1);
});
