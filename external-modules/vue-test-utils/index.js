// reuse test components
export {
  default as asAClass
} from "./submodule/test/resources/components/component-as-a-class.vue";
export {
  default as asAClassWithChild
} from "./submodule/test/resources/components/component-as-a-class-with-child.vue";
export {
  default as component
} from "./submodule/test/resources/components/component.vue";
export {
  default as withChild
} from "./submodule/test/resources/components/component-with-child.vue";
export {
  default as withComputed
} from "./submodule/test/resources/components/component-with-computed.vue";
export {
  default as withCssModules
} from "./submodule/test/resources/components/component-with-css-modules.vue";
export {
  default as withEvents
} from "./submodule/test/resources/components/component-with-events.vue";
export {
  default as withInject
} from "./submodule/test/resources/components/component-with-inject.vue";
export {
  default as withInput
} from "./submodule/test/resources/components/component-with-input.vue";
export {
  default as withLifecycleHooks
} from "./submodule/test/resources/components/component-with-lifecycle-hooks.vue";
export {
  default as withMethods
} from "./submodule/test/resources/components/component-with-methods.vue";
export {
  default as withMixin
} from "./submodule/test/resources/components/component-with-mixin.vue";
export {
  default as withNestedChildren
} from "./submodule/test/resources/components/component-with-nested-children.vue";
export {
  default as withoutName
} from "./submodule/test/resources/components/component-without-name.vue";
export {
  default as withParentName
} from "./submodule/test/resources/components/component-with-parent-name.vue";
export {
  default as withProps
} from "./submodule/test/resources/components/component-with-props.vue";
export {
  default as withRouter
} from "./submodule/test/resources/components/component-with-router.vue";
export {
  default as withScopedSlots
} from "./submodule/test/resources/components/component-with-scoped-slots.vue";
export {
  default as withSlots
} from "./submodule/test/resources/components/component-with-slots.vue";
export {
  default as withStyle
} from "./submodule/test/resources/components/component-with-style.vue";
export {
  default as withTransitionGroup
} from "./submodule/test/resources/components/component-with-transition-group.vue";
export {
  default as withTransition
} from "./submodule/test/resources/components/component-with-transition.vue";
export {
  default as withVFor
} from "./submodule/test/resources/components/component-with-v-for.vue";
export {
  default as withVIf
} from "./submodule/test/resources/components/component-with-v-if.vue";
export {
  default as withVShow
} from "./submodule/test/resources/components/component-with-v-show.vue";
export {
  default as withVuex
} from "./submodule/test/resources/components/component-with-vuex.vue";
export {
  default as withWatch
} from "./submodule/test/resources/components/component-with-watch.vue";
export {
  default as functionalComponent
} from "./submodule/test/resources/components/functional-component.vue";
export {
  default as recursiveComponent
} from "./submodule/test/resources/components/recursive-component.vue";

export const store = {
  state: {
    count: 0
  },
  mutations: {
    increment(state) {
      state.count++;
    }
  },
  modules: {
    foo: {
      state: () => ({ bar: 1 })
    }
  }
};
