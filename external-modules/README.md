# How to use

## structure

```
external-modules
  `- [resource-name]/
      |- index.js  # re-exports the desired portions of the submodule
      `- submodule/
         |- ...
```

This will prevent imports of shifting external resources from needing to be rewritten.
