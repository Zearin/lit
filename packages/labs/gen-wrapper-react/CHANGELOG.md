# @lit-labs/gen-wrapper-react

## 0.2.4

### Patch Changes

- Updated dependencies [[`2c59ceb9`](https://github.com/lit/lit/commit/2c59ceb9427ca76a591084258eedab76644f2a63)]:
  - @lit-labs/analyzer@0.7.0

## 0.2.3

### Patch Changes

- Updated dependencies [[`dfdc3f71`](https://github.com/lit/lit/commit/dfdc3f714e511d30acc28809fa6643a4c764cad1), [`cabc6189`](https://github.com/lit/lit/commit/cabc61894e57ba89ecadc1deb20f121fecdfffc9), [`b7b01c0d`](https://github.com/lit/lit/commit/b7b01c0d21c0ac301cd5b8d4cb595f3bbfeebe6b), [`520b4713`](https://github.com/lit/lit/commit/520b47132af8e21868df5dc4dfdf5e003a38d158), [`39ac5275`](https://github.com/lit/lit/commit/39ac52758064dc521c2e3701e28348d7dc637a98), [`7e20a528`](https://github.com/lit/lit/commit/7e20a5287a46eadcd06a0804147b3b27110326ad), [`389d0c55`](https://github.com/lit/lit/commit/389d0c558d78982d8265588d1935ede91f46f3a0)]:
  - @lit-labs/analyzer@0.6.0

## 0.2.2

### Patch Changes

- Updated dependencies [[`b152db29`](https://github.com/lit/lit/commit/b152db291932aa25356543395251a9b42e12292d), [`b152db29`](https://github.com/lit/lit/commit/b152db291932aa25356543395251a9b42e12292d), [`b152db29`](https://github.com/lit/lit/commit/b152db291932aa25356543395251a9b42e12292d)]:
  - @lit-labs/analyzer@0.5.0
  - @lit-labs/gen-utils@0.2.0

## 0.2.1

### Patch Changes

- [#3384](https://github.com/lit/lit/pull/3384) [`9f802646`](https://github.com/lit/lit/commit/9f802646d955198cbaf6e521283fe137e7f5b7a6) - Updates generated wrappers to better support types for properties and events, tested via a suite of test elements.

- [#3377](https://github.com/lit/lit/pull/3377) [`0af4e79b`](https://github.com/lit/lit/commit/0af4e79b51d34d959488ceae4caa2240a76c15e0) - Adds type info for props/events for Vue/React wrappers. Vue wrapper properly handles defaults.

- Updated dependencies [[`fc2b1c88`](https://github.com/lit/lit/commit/fc2b1c885211e4334d5ae5637570df85dd2e3f9e), [`ad361cc2`](https://github.com/lit/lit/commit/ad361cc22303f759afbefe60512df34fffdee771)]:
  - @lit-labs/analyzer@0.4.0

## 0.2.0

### Minor Changes

- [#3288](https://github.com/lit/lit/pull/3288) [`569a6237`](https://github.com/lit/lit/commit/569a6237377eeef0c8dced2c369c77ebdd81218e) - Refactored Analyzer into better fit for use in plugins. Analyzer class now takes a ts.Program, and PackageAnalyzer takes a package path and creates a program to analyze a package on the filesystem.

- [#3254](https://github.com/lit/lit/pull/3254) [`fc2fd4c8`](https://github.com/lit/lit/commit/fc2fd4c8f4a25b9a85073afcb38614209e079bb9) - Fixes bug where global install of CLI resulted in incompatible use of analyzer between CLI packages. Fixes #3234.

### Patch Changes

- [#3310](https://github.com/lit/lit/pull/3310) [`b225bd3a`](https://github.com/lit/lit/commit/b225bd3ae1f03d46119650c997719b86742831fe) - Test-output points to the same dependencies as monorepo.

- Updated dependencies [[`31bed8d6`](https://github.com/lit/lit/commit/31bed8d6542c44a64bad8282b9ce5e5d6514e44a), [`569a6237`](https://github.com/lit/lit/commit/569a6237377eeef0c8dced2c369c77ebdd81218e), [`fc2fd4c8`](https://github.com/lit/lit/commit/fc2fd4c8f4a25b9a85073afcb38614209e079bb9)]:
  - @lit-labs/analyzer@0.3.0

## 0.1.0

### Minor Changes

- [#3225](https://github.com/lit/lit/pull/3225) [`198da7ce`](https://github.com/lit/lit/commit/198da7ceabc944b142a666cae56ea239624cd019) - Initial release
