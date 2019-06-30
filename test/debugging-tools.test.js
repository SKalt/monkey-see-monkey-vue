/* eslint-env jest */
import { idSequence } from "../src/utils/common";
test("id sequence generation", () => {
  let id = idSequence("foo");
  expect(id()).toEqual("foo-0");
  expect(id.next()).toEqual("foo-1");
  id = idSequence();
  expect(id()).toEqual(0);
  expect(id()).toEqual(1);
});
