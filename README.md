# `monkey-see-monkey-vue` 🍌

> monkey-testing tools for Vue.js apps.

the more complicated your vue.js application is, the harder it becomes to find the user interactions that cause errors or unexpected behavior. `monkey-see-monkey-vue` is a monkey-testing tool to simulate users (basically more advanced monkeys banging on more advanced typewriters). Overall, `monkey-see-monkey-vue`

1. finds all the things that vue reacts to (metaphorical buttons to press, levers to pull)
2. Semi-randomly interacts with them until something breaks or an exit condition is reached.
3. Reports back with code that will reproduce the error.

### Prior art

<details><summary>Inspired by</summary>

- [`gremlins.js`](https://github.com/marmelab/gremlins.js)
- [Jarno Rantanen's presentation on fuzzing redux](https://github.com/jareware/fuzzing-redux-prese)

</details>

<details><summary>dependencies</summary>

- [`Vue.js`](https://vuejs.org/) (obviously)
- [`@vue/test-utils`](https://vue-test-utils.vuejs.org/)
- [`@mozillasecurity/octo`](https://github.com/MozillaSecurity/octo) for fuzzing utilities
- [and others](./package.json).

</details>

## Contributing

Please note that this project is released with a [Contributor Code of Conduct](CODE-OF-CONDUCT.md). By participating in this project you agree to abide by its terms.
