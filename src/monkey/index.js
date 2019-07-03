/*
     __
w  c(..)o
\__(-)
     /\   (
    /(_)___)
   w /|
    | \

*/
import { flattenDeep } from "lodash-es";
import random from "@mozillasecurity/octo/lib/random/random.js";
import { nameOf } from "../utils";
// export async function monkey({ observer, ticker, select, keepGoing }) {
//   const actions = []; // must be usable for repro
//   const errors = []; //  <-- fuzz state, mostly
//   let nticks = 0; //
//   const testState = {
//     actions,
//     errors,
//     nticks
//   };
//   const getActions = observed => [
//     /*...observed.values()*/
//   ];
//
//   while (keepGoing(actions, errors, nticks /*fuzzState*/)) {
//     try {
//       doAction(actions.push(select(getActions(observer))));
//       makeAssertions(state);
//       await ticker.nextTick();
//     } catch (err) {
//       // echo error message
//       // write repro code
//     }
//   }
// }
/* eslint-disable no-console */
class AbstractMonkey {
  constructor({ observer, ticker, assertions = [], seed = null }) {
    this.ticker = ticker;
    this.observer = observer;
    this.assertions = assertions || [];
    this.errors = [];
    this.actions = [];
    this.nticks = 0;
    this.random = random;
    this.random.init(seed);
  }
  getActions() {
    const result = [];
    for (let [vm, obj] of this.observer.entries()) {
      for (let [selector, events] of Object.entries(obj)) {
        for (let e of events) {
          result.push([vm, selector, e]);
        }
      }
    }
    return result;
  }
  keepGoing() {
    this.nticks += 1;
    return this.nticks < 10;
  }
  selectAction(actions) {
    // do some randomized process to grab
    return this.random.item(actions);
  }

  makeAssertions() {
    this.assertions.forEach(assertion => assertion(this));
  }
  writeRepro() {
    console.log(
      this.actions
        .map(([vm, sel, evt]) => `<${nameOf(vm)}> ${sel} ${evt}`)
        .join("\n")
    );
  }
  test() {
    return new Promise((resolve, reject) => {
      testLoop: while (this.keepGoing()) {
        try {
          const actions = this.getActions();
          console.log({ actions });
          const action = this.selectAction(actions);
          console.log({ action });
          this.doAction(action);
          this.makeAssertions();
        } catch (err) {
          console.error(err);
          this.writeRepro();
          reject();
          break testLoop;
        }
      }
      resolve();
    });
  }
}

export default class Monkey extends AbstractMonkey {
  constructor({ observer, ticker, assertions = [], seed = 1, wrapper }) {
    super({ observer, ticker, assertions, seed });
    this.wrapper = wrapper;
  }
  doAction([vm, selector, evt]) {
    console.log(`<${nameOf(vm)}> ${selector} ${evt}`);
    this.wrapper
      .find(vm)
      .find(selector)
      .trigger(evt);
  }
}
