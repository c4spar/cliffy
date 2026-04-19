# [v1.0.1](https://github.com/c4spar/deno-cliffy/compare/v1.0.0...v1.0.1) (Apr 19, 2026)

### 🩹 Bug Fixes

- **command:** correct argument type inference for mapped arguments (#868)
- **command:** move default command handling to parseCommand (#860)
- **command:** fix return type for action handler (#855)
- **command:** fix types for `generateShellCompletions` (#854)
- **flags:** allow options after variadic options (#865)
- **flags:** correct prototype assignments for error classes (#858)
- **keycode:** handle paste bracket mode and improve escape sequence parsing
  (#866)

### 🏡 Chore

- **ci:** install deps in canary job
- **deps:** update dependencies (#867)
- **setup:** skip projects without exports (#856)

# [v1.0.0](https://github.com/c4spar/deno-cliffy/compare/v1.0.0-rc.8...v1.0.0) (Feb 10, 2026)

### 💔 Breaking Changes

- **command:** move third argument of the `.command()` method into an options
  object (#841)
- **command:** remove deprecated types (#839)
- **command:** skip version checks when printing help if it will cause
  permission prompts (#663)

  Custom upgrade provider implementations have to implement
  `hasRequiredPermissions()`

- **flags:** remove deprecated types (#839)
- **prompt:** remove deprecated types (#839)
- **table:** remove deprecated types (#839)

### 🖐️ Deprecations

- **command:** deprecate `Type.infer` in favor of `InferType` (#840)

### 🚀 Features

- **command:** add `.argument()` method and support for argument descriptions (
  #843)
- **command:** add `default` and `value` option to argument method (#844)
- **command:** add `generateShellCompletions` function (#808)
- **command:** add new `secret` type and `defaultText` option to override the
  display text for the default option value (#775)
- **command:** sort listed versions in upgrade provider (#800)
- **flags:** set default arguments for parseFlags (#824)
- **prompt:** add vim keybind `hjkl` for up, down, right, left (#837)

### 🩹 Bug Fixes

- **ansi:** add missing method bindings for setColorEnabled and getColorEnabled
  (#812)
- **command:** only execute default command if no arguments have been defined
  (#850)
- **command:** calling `.parse()` on a child command throws an error (#833)
- **command:** fix support for options depending on environment variables (#809)
- **command:** fix types for collected dotted options and wildcard options
  (#799)
- **internal:** fix ignore check for skip warning and node test (#834)
- **prompt:** keypress panic when no nav options (#829)
- **testing:** fix node compatibility (#806)

### 💅 Code Refactoring

- **command:** reorganize command properties into settings, props and
  builderProps (#842)

### 📖 Documentation Updates

- add module documentations (#853)
- **readme:** update badge and add package table (#852)
- **examples:** add `defaultText` option to example (#849)
- **command:** improve argument and arguments method documentation (#848)
- **examples:** add missing command examples (#826)
- **examples:** rename example.ts.ts to example.ts
- **examples:** remove `Deno.args` from examples (#825)

### 🏡 Chore

- **ci:** upgrade actions to latest version (#846)
- **ci:** use .deno-version file and enable ci tests for bun (#845)
- **deps:** upgrade deps to latest versions (#847)
- **fmt:** format changelog
- **node:** update Node.js version to v24.x (#851)

# [v1.0.0-rc.8](https://github.com/c4spar/deno-cliffy/compare/v1.0.0-rc.7...v1.0.0-rc.8) (Jul 1, 2025)

### Features

- add support for dnt (#769)
  ([3d9913b](https://github.com/c4spar/deno-cliffy/commit/3d9913b))

### Bug Fixes

- **command:** global options don't handle `=` correctly if passed before
  subcommand (#797)
  ([12206c4](https://github.com/c4spar/deno-cliffy/commit/12206c4))
- **internal:** Use Bun.stdin when using Bun to prevent process hanging (#760)
  ([db5ae30](https://github.com/c4spar/deno-cliffy/commit/db5ae30))
- **prompt:** catch `NotFund` and `PermissionDenied` error for file suggestions
  and show error message (#784)
  ([79afc20](https://github.com/c4spar/deno-cliffy/commit/79afc20))
- **prompt:** empty inputs are normalized to `.` if the `files` option is
  enabled, which causes the default value to be ignored (#783)
  ([3867697](https://github.com/c4spar/deno-cliffy/commit/3867697))
- **testing:** suppress diagnostic output for snapshot tests (#798)
  ([a4a1247](https://github.com/c4spar/deno-cliffy/commit/a4a1247))

### Chore

- **ci:** update node and deno version (#767)
  ([21a4c61](https://github.com/c4spar/deno-cliffy/commit/21a4c61))
- **ci:** fix test pipeline version matrix
  ([dfb1762](https://github.com/c4spar/deno-cliffy/commit/dfb1762))
- **ci:** fix nightly pipeline for node
  ([979cf6a](https://github.com/c4spar/deno-cliffy/commit/979cf6a))

### Documentation Updates

- update command example (#773)
  ([1d5feed](https://github.com/c4spar/deno-cliffy/commit/1d5feed))
- **ansi:** use cliffy logo in image example (#766)
  ([e575ca0](https://github.com/c4spar/deno-cliffy/commit/e575ca0))

# [v1.0.0-rc.7](https://github.com/c4spar/deno-cliffy/compare/v1.0.0-rc.6...v1.0.0-rc.7) (Sep 28, 2024)

No changes, i only forgot that deno needs an annoying version number in
deno.json.

# [v1.0.0-rc.6](https://github.com/c4spar/deno-cliffy/compare/v1.0.0-rc.5...v1.0.0-rc.6) (Sep 28, 2024)

### Features

- add support for deno v2 ( #745)
  ([64fff28](https://github.com/c4spar/deno-cliffy/commit/64fff28))
- **command:** add support for disabling spinner in upgrade command ( #749)
  ([62fa792](https://github.com/c4spar/deno-cliffy/commit/62fa792))
- **command:** add support for npm package without scope to npm provider ( #748)
  ([f882fa0](https://github.com/c4spar/deno-cliffy/commit/f882fa0))

### Bug Fixes

- **command:** directly print example text w/o capitalization ( #741)
  ([b0f1942](https://github.com/c4spar/deno-cliffy/commit/b0f1942))
- **command:** new version info is displayed if no stable version is available (
  #726) ([3295c7a](https://github.com/c4spar/deno-cliffy/commit/3295c7a))
- **internal:** resolve null instead of returning null ( #752)
  ([779cf08](https://github.com/c4spar/deno-cliffy/commit/779cf08))
- **internal:** fix readSync method ( #747)
  ([2d8aa19](https://github.com/c4spar/deno-cliffy/commit/2d8aa19))
- **prompt:** increase buffer size of input prompts for nodejs to allow paste of
  more than 8 chars ( #739)
  ([dd9aab0](https://github.com/c4spar/deno-cliffy/commit/dd9aab0))

### Code Refactoring

- **command:** remove unused files ( #751)
  ([ced45fc](https://github.com/c4spar/deno-cliffy/commit/ced45fc))
- **prompt:** set list index to 0 instead of 1 when selecting a group option (
  #727) ([09c8c7a](https://github.com/c4spar/deno-cliffy/commit/09c8c7a))

### Chore

- setup tests for node ( #729)
  ([a036cac](https://github.com/c4spar/deno-cliffy/commit/a036cac))
- use workspace property and fix some type and lint errors ( #725)
  ([e9dae18](https://github.com/c4spar/deno-cliffy/commit/e9dae18))
- **deno:** add test:all, node and bun task ( #750)
  ([1bee870](https://github.com/c4spar/deno-cliffy/commit/1bee870))
- **deps:** upgrade @std to latest version ( #746)
  ([2a32a37](https://github.com/c4spar/deno-cliffy/commit/2a32a37))

### Documentation Updates

- **examples:** use workspace specifier for imports ( #728)
  ([33b01f8](https://github.com/c4spar/deno-cliffy/commit/33b01f8))

# [v1.0.0-rc.5](https://github.com/c4spar/deno-cliffy/compare/v1.0.0-rc.4...v1.0.0-rc.5) (Jul 1, 2024)

### Features

- add built-in `jsr` upgrade provider (rework) ( #692)
  ([b976d26](https://github.com/c4spar/deno-cliffy/commit/b976d26))
- publish to jsr.io ( #679)
  ([ff14148](https://github.com/c4spar/deno-cliffy/commit/ff14148))
- **ansi,keypress,prompt:** add support for node.js ( #720)
  ([1e1c2e6](https://github.com/c4spar/deno-cliffy/commit/1e1c2e6))
- **command:** add support for nodejs ( #693)
  ([f81e895](https://github.com/c4spar/deno-cliffy/commit/f81e895))
- **command:** add support for node and bun to upgrade command ( #705)
  ([7011ada](https://github.com/c4spar/deno-cliffy/commit/7011ada))
- **command:** support zsh fpath completion ( #703)
  ([f770de2](https://github.com/c4spar/deno-cliffy/commit/f770de2))
- **command:** add npm upgrade provider ( #701)
  ([45dbe30](https://github.com/c4spar/deno-cliffy/commit/45dbe30))

### Bug Fixes

- **prompt:** expand input value if file suggestions are enabled ( #719)
  ([e377f04](https://github.com/c4spar/deno-cliffy/commit/e377f04))
- **prompt:** fix validation and return type of object option values for
  checkbox and seleect prompt ( #718)
  ([3e92792](https://github.com/c4spar/deno-cliffy/commit/3e92792))

### Code Refactoring

- **command:** add exports for completions and upgrade provider ( #700)
  ([6d08b9a](https://github.com/c4spar/deno-cliffy/commit/6d08b9a))

### Chore

- replace conditional_type_checks with @std/testing/types ( #699)
  ([2bc19f7](https://github.com/c4spar/deno-cliffy/commit/2bc19f7))
- **ci:** enable `DENO_FUTURE` on ci ( #715)
  ([318e2af](https://github.com/c4spar/deno-cliffy/commit/318e2af))
- **ci:** upgrade codecov-action to v4 ( #708)
  ([7a932da](https://github.com/c4spar/deno-cliffy/commit/7a932da))
- **deps:** upgrade @std to latest version ( #721)
  ([a6d2bc9](https://github.com/c4spar/deno-cliffy/commit/a6d2bc9))
- **deps:** upgrade @std to latest version ( #714)
  ([c74892b](https://github.com/c4spar/deno-cliffy/commit/c74892b))
- **lint:** remove unused null coalescing operator ( #713)
  ([da5d7b2](https://github.com/c4spar/deno-cliffy/commit/da5d7b2))

### Unit/Integration Tests

- **command:** add provider tests ( #706)
  ([10d9254](https://github.com/c4spar/deno-cliffy/commit/10d9254))
- **command,prompt:** fix tests ( #697)
  ([fe9726d](https://github.com/c4spar/deno-cliffy/commit/fe9726d))

### deps

- **upgrade:** upgrade @std/* to latest version ( #704)
  ([4e62e39](https://github.com/c4spar/deno-cliffy/commit/4e62e39))

# [v1.0.0-rc.4](https://github.com/c4spar/deno-cliffy/compare/v1.0.0-rc.3...v1.0.0-rc.4) (Apr 7, 2024)

### BREAKING CHANGES

- **ansi,prompt:** remove use of `Deno.isatty()` and `rid` (#672)
  ([bcc7552](https://github.com/c4spar/deno-cliffy/commit/bcc7552))

  This commit removes the `rid` property from the `reader` option and replaces
  the `isTty` method with the `isTerminal` method.

- **command:** remove support for executable sub-commands (#682)
  ([89475a8](https://github.com/c4spar/deno-cliffy/commit/89475a8))

### Features

- Publish to jsr (#679)

  This is the first release on [jsr.io](https://jsr.io/@cliffy) and is used for
  initial testing. Cliffy is still published to
  [deno.land](https://deno.land/x/cliffy/), but as soon as jsr.io becomes
  stable, cliffy will probably only be published on jsr.io and no longer on
  deno.land.

- **flags:** export `InvalidTypeError` (#686)
  ([e9a400a](https://github.com/c4spar/deno-cliffy/commit/e9a400a))

### Bug Fixes

- **command:** file type completion not working for first argument in zsh
  completions (#688)
  ([a5cd35e](https://github.com/c4spar/deno-cliffy/commit/a5cd35e))
- **command:** zsh completion for command aliases not working (#688)
  ([2351c77](https://github.com/c4spar/deno-cliffy/commit/2351c77))
- **command:** arg with no completions followed by args with completions breaks
  zsh completion (#688)
  ([53551ac](https://github.com/c4spar/deno-cliffy/commit/53551ac))
- **command:** use ValidationError from command module instead of flags module
  in upgrade command (#684)
  ([a568c39](https://github.com/c4spar/deno-cliffy/commit/a568c39))
- **command:** infer option default value as const (#660)
  ([c91ddb6](https://github.com/c4spar/deno-cliffy/commit/c91ddb6))
- **command:** command action not triggered for standalone options without
  action handler (#654)
  ([4e63862](https://github.com/c4spar/deno-cliffy/commit/4e63862))
- **command:** escape colons in subCommand name for zsh completions (#661)
  ([aa1311f](https://github.com/c4spar/deno-cliffy/commit/aa1311f))
- **prompt:** fix initial page offset for checkbox and select prompt (#689)
  ([da56395](https://github.com/c4spar/deno-cliffy/commit/da56395))
- **table:** Wrap ANSI codes for multiline cells (#657)
  ([5118a1c](https://github.com/c4spar/deno-cliffy/commit/5118a1c))

### Code Refactoring

- **command,flags:** move some utils functions (#683)
  ([6319a78](https://github.com/c4spar/deno-cliffy/commit/6319a78))
- **flags,prompt:** remove distance method and use std/text (#681)
  ([181e055](https://github.com/c4spar/deno-cliffy/commit/181e055))

### Chore

- **deps:** upgrade to std@0.221.0 (#691)
  ([140f250](https://github.com/c4spar/deno-cliffy/commit/140f250),
  [d337862](https://github.com/c4spar/deno-cliffy/commit/d337862))

### Unit/Integration Tests

- **command:** add file type completion test for zsh (#688)
  ([fba0969](https://github.com/c4spar/deno-cliffy/commit/fba0969))

### Documentation Updates

- **command:** fix markdown formatting for arguments (#677) (#678)
  ([6e67dca](https://github.com/c4spar/deno-cliffy/commit/6e67dca))

# [v1.0.0-rc.3](https://github.com/c4spar/deno-cliffy/compare/v1.0.0-rc.2...v1.0.0-rc.3) (Jul 30, 2023)

### Features

- add select all option to checkbox prompt (#649)
  ([5f2c4f8](https://github.com/c4spar/deno-cliffy/commit/5f2c4f8))

### Bug Fixes

- **prompt:** disabled options can be selected with next page & previous page
  keys (#646) ([6f3ba29](https://github.com/c4spar/deno-cliffy/commit/6f3ba29))
- **prompt:** incorrect info message shown for checkbox prompt on submit (#643)
  ([fd6831c](https://github.com/c4spar/deno-cliffy/commit/fd6831c))

### Chore

- disable deno lock (#651)
  ([bd4ce72](https://github.com/c4spar/deno-cliffy/commit/bd4ce72))
- **upgrade:** deno/std@0.196.0 (#650)
  ([98ecc37](https://github.com/c4spar/deno-cliffy/commit/98ecc37))

### Unit/Integration Tests

- **prompt:** test confirmSubmit option from checkbox prompt (#644)
  ([5d3bf0a](https://github.com/c4spar/deno-cliffy/commit/5d3bf0a))

### Documentation Updates

- remove unstable notice (#652)
  ([99ca3cf](https://github.com/c4spar/deno-cliffy/commit/99ca3cf))

# [v1.0.0-rc.2](https://github.com/c4spar/deno-cliffy/compare/v1.0.0-rc.1...v1.0.0-rc.2) (Jul 4, 2023)

### Bug Fixes

- **prompt:** fix separator option for select prompt (#640)
  ([937f58a](https://github.com/c4spar/deno-cliffy/commit/937f58a))

### Chore

- add check:examples task (#641)
  ([4fd91b6](https://github.com/c4spar/deno-cliffy/commit/4fd91b6))

# [v1.0.0-rc.1](https://github.com/c4spar/deno-cliffy/compare/v0.25.7...v1.0.0-rc.1) (Jul 2, 2023)

### BREAKING CHANGES

- **ansi:** rename `.toBuffer()` method to `.bytes()` (#606)
  ([853c2a6](https://github.com/c4spar/deno-cliffy/commit/853c2a6))
- **ansi:** rename `stdin` and `stdout` options to `reader` and `writer` (#570)
  ([8980c53](https://github.com/c4spar/deno-cliffy/commit/8980c53))
- **flags:** remove `requiredValue` option and rename
  `option.args[].optionalValue` to `option.args[].optional` (#496)
  ([f381e56](https://github.com/c4spar/deno-cliffy/commit/f381e56))

  before:

  ```ts
  parseFlags(Deno.args, {
    flags: [{
      name: "foo",
      type: "boolean",
      requiredValue: true,
    }, {
      name: "bar",
      args: [{
        type: "string",
        optionalValue: true,
      }],
    }],
  });
  ```

  after:

  ```ts
  parseFlags(Deno.args, {
    flags: [{
      name: "foo",
      type: "boolean",
      optionalValue: false,
    }, {
      name: "bar",
      args: [{
        type: "string",
        optional: true,
      }],
    }],
  });
  ```

- **prompt:** remove default indentation (#495)
  ([16790ac](https://github.com/c4spar/deno-cliffy/commit/16790ac))

  To restore the old behavior, you can use the indent option:

  ```ts
  await Input.prompt({
    message: "What's your name?",
    indent: " ",
  });
  ```

### DEPRECATIONS

- **prompt:** deprecate `SelectValueOptions` and `CheckboxValueOptions` types
  (#526) ([20ba587](https://github.com/c4spar/deno-cliffy/commit/20ba587))

  - `SelectValueOptions` -> Use `Array<string | SelectOption>` instead.
  - `CheckboxValueOptions` -> Use `Array<string | CheckboxOption>` instead.
- **table:** refactor table types (#559)
  ([2b1ea19](https://github.com/c4spar/deno-cliffy/commit/2b1ea19))

  - `IBorder` -> Use `Border` instead.
  - `ICell` -> Use `CellType` instead.
  - `IRow` -> Use `RowType` instead.
  - `IDataRow` -> Use `DataRow` instead.
  - `IBorderOptions` -> Use `BorderOptions` instead.
  - `ITable` -> Use `TableType` instead.

### Features

- **ansi:** add `.toArray()` method to `ansi` module (#543)
  ([ca2e7f6](https://github.com/c4spar/deno-cliffy/commit/ca2e7f6))
- **command:** show required options in help usage (#598)
  ([bd08f4b](https://github.com/c4spar/deno-cliffy/commit/bd08f4b))
- **command:** add `--name` option to completion commands (#587)
  ([f9368eb](https://github.com/c4spar/deno-cliffy/commit/f9368eb))
- **command:** add `reader` & `writer` options to `prompt()` function (#574)
  ([72536ea](https://github.com/c4spar/deno-cliffy/commit/72536ea))
- **command:** support multiple option actions (#567)
  ([4fb4f9a](https://github.com/c4spar/deno-cliffy/commit/4fb4f9a))
- **command:** add `.globalAction()` method (#555)
  ([b76524f](https://github.com/c4spar/deno-cliffy/commit/b76524f))
- **prompt:** add format option to select and checkbox prompt (#626)
  ([5b8bc2d](https://github.com/c4spar/deno-cliffy/commit/5b8bc2d))
- **prompt:** allow any type as value for select and checkbox prompt (#625)
  ([20b59ec](https://github.com/c4spar/deno-cliffy/commit/20b59ec))
- **prompt:** add support for multi level options for select and checkbox prompt
  (#445) ([880d472](https://github.com/c4spar/deno-cliffy/commit/880d472))
- **prompt:** refactor and export un-exported `prompt()` types and update docs
  (#578) ([9487d8d](https://github.com/c4spar/deno-cliffy/commit/9487d8d))
- **prompt:** add `reader` and `writer` options (#569)
  ([8923a6f](https://github.com/c4spar/deno-cliffy/commit/8923a6f))
- **table:** implement `Column` class (#554)
  ([738355a](https://github.com/c4spar/deno-cliffy/commit/738355a))
- **table:** set default value for `.border()` method to `true` (#557)
  ([a43d845](https://github.com/c4spar/deno-cliffy/commit/a43d845))
- **testing:** add testing module (#581)
  ([5db0f6e](https://github.com/c4spar/deno-cliffy/commit/5db0f6e),
  [36c8dbe](https://github.com/c4spar/deno-cliffy/commit/36c8dbe),
  [6a8ad25](https://github.com/c4spar/deno-cliffy/commit/6a8ad25),
  [d20d31c](https://github.com/c4spar/deno-cliffy/commit/d20d31c))

### Bug Fixes

- **ansi:** use `opts.stdin.setRaw` instead of `Deno.stdin.setRaw` in`tty`
  module and `getCursorPosition` method and fiy stdin option types (#564)
  ([0bc4cca](https://github.com/c4spar/deno-cliffy/commit/0bc4cca))
- **ansi:** color methods ignore an empty string argument (#558)
  ([39eb048](https://github.com/c4spar/deno-cliffy/commit/39eb048))
- **command:** use `Array<unknown>` for arguments in `.globalAction()` action
  handler (#607)
  ([de75995](https://github.com/c4spar/deno-cliffy/commit/de75995))
- **command:** global parent action handlers are executed if noGlobals is
  enabled (#603)
  ([b7e34fa](https://github.com/c4spar/deno-cliffy/commit/b7e34fa))
- **command:** enum type not always inferred correctly (#573)
  ([31ba2ff](https://github.com/c4spar/deno-cliffy/commit/31ba2ff))
- **command:** incorrect validation when parsing global options with default
  values mixed with non-global options (#548)
  ([ddd3e53](https://github.com/c4spar/deno-cliffy/commit/ddd3e53))
- **command:** error handler not triggered with `.useRawArgs()` enabled (#549)
  ([ecdb98e](https://github.com/c4spar/deno-cliffy/commit/ecdb98e))
- **flags:** `OptionType` is exported as type (#636)
  ([45890b9](https://github.com/c4spar/deno-cliffy/commit/45890b9))
- **flags:** default value for no-value-flag cannot be overridden (#551)
  ([456eb41](https://github.com/c4spar/deno-cliffy/commit/456eb41))
- **table:** more accurate cell width for unicode chars (#632)
  ([d29dce4](https://github.com/c4spar/deno-cliffy/commit/d29dce4))
- **table:** apply column options only to table body (#608)
  ([a7db939](https://github.com/c4spar/deno-cliffy/commit/a7db939))
- **table:** fix hasBodyBorder method (#560)
  ([36d3d5d](https://github.com/c4spar/deno-cliffy/commit/36d3d5d))
- **table:** full width characters are not aligned correctly (#542)
  ([9fea2ac](https://github.com/c4spar/deno-cliffy/commit/9fea2ac))
- **table:** japanese characters are not aligned correctly (#541)
  ([44e48ea](https://github.com/c4spar/deno-cliffy/commit/44e48ea))

### Code Refactoring

- remove main mod.ts (#638)
  ([7de3ddc](https://github.com/c4spar/deno-cliffy/commit/7de3ddc))
- **ansi:** use explicit exports in mod.ts (#610)
  ([7e7063a](https://github.com/c4spar/deno-cliffy/commit/7e7063a))
- **command:** move checkVersion method to separate file (#623)
  ([a7a2d10](https://github.com/c4spar/deno-cliffy/commit/a7a2d10))
- **command:** remove indentation from help output (#605)
  ([e9ab46a](https://github.com/c4spar/deno-cliffy/commit/e9ab46a))
- **command:** re-organize types (#602)
  ([277fb27](https://github.com/c4spar/deno-cliffy/commit/277fb27))
- **command:** use exit code `2` as default for validation errors (#601)
  ([6394f89](https://github.com/c4spar/deno-cliffy/commit/6394f89))
- **command:** improve error message for duplicate option names (#600)
  ([1ef9e68](https://github.com/c4spar/deno-cliffy/commit/1ef9e68))
- **command:** throw an error if the command name is missing when generating
  shell completions (#599)
  ([fa804b5](https://github.com/c4spar/deno-cliffy/commit/fa804b5))
- **command:** switch to `Deno.Command` api (#596)
  ([90d9565](https://github.com/c4spar/deno-cliffy/commit/90d9565))
- **command:** set default value for ignore and only in snapshotTest method
  (#588) ([7f0ec49](https://github.com/c4spar/deno-cliffy/commit/7f0ec49))
- **flags:** use explicit exports in mod.ts (#609)
  ([dd857d7](https://github.com/c4spar/deno-cliffy/commit/dd857d7))
- **keycode:** use explicit exports in mod.ts (#611)
  ([eb4d7a0](https://github.com/c4spar/deno-cliffy/commit/eb4d7a0))
- **prompt:** remove GenericPrompt, GenericInput & GenericList exports (#627)
  ([19a19f4](https://github.com/c4spar/deno-cliffy/commit/19a19f4))
- **prompt:** remove unnecessary border arguments (#617)
  ([ca6c705](https://github.com/c4spar/deno-cliffy/commit/ca6c705))
- **prompt:** remove `GenericInputPromptSettings` export from mod.ts (#614)
  ([ad8be98](https://github.com/c4spar/deno-cliffy/commit/ad8be98))
- **prompt:** use explicit exports in mod.ts (#612)
  ([f5dead8](https://github.com/c4spar/deno-cliffy/commit/f5dead8))
- **prompt:** change default search icon to 🔎 (#577)
  ([52830a8](https://github.com/c4spar/deno-cliffy/commit/52830a8))
- **prompt:** remove windows encoding workaround (#566)
  ([11e379f](https://github.com/c4spar/deno-cliffy/commit/11e379f))
- **prompt:** change default label of secret prompt from `Password` to `Secret`
  (#494) ([ed49579](https://github.com/c4spar/deno-cliffy/commit/ed49579))

### Chore

- fmt (#591) ([6950b5f](https://github.com/c4spar/deno-cliffy/commit/6950b5f))
- remove all `--unstable` flags from tests and examples (#550)
  ([b8bd612](https://github.com/c4spar/deno-cliffy/commit/b8bd612))
- **ci:** refactor tests (#637)
  ([0c950cf](https://github.com/c4spar/deno-cliffy/commit/0c950cf))
- **ci:** adapt check examples step (#572)
  ([95374cc](https://github.com/c4spar/deno-cliffy/commit/95374cc))
- **ci:** enable doc tests (#556)
  ([35f1329](https://github.com/c4spar/deno-cliffy/commit/35f1329))
- **deno:** use top-level exclude option and fmt (#593)
  ([184e2ee](https://github.com/c4spar/deno-cliffy/commit/184e2ee))
- **license:** update copyright year
  ([9918d43](https://github.com/c4spar/deno-cliffy/commit/9918d43))
- **upgrade:** deno/std@0.192.0 (#639)
  ([01e5fd8](https://github.com/c4spar/deno-cliffy/commit/01e5fd8))

### Unit/Integration Tests

- **prompt:** test also stderr in integration tests (#565)
  ([6fa7ef5](https://github.com/c4spar/deno-cliffy/commit/6fa7ef5))
- **prompt:** improve integration tests (#544)
  ([986168f](https://github.com/c4spar/deno-cliffy/commit/986168f))

### Documentation Updates

- fix discussions link in `CONTRIBUTING.md` (#633)
  ([d5d29d9](https://github.com/c4spar/deno-cliffy/commit/d5d29d9))
- **ansi:** documentation improvements (#621)
  ([2928a6f](https://github.com/c4spar/deno-cliffy/commit/2928a6f))
- **ansi:** update examples (#571)
  ([82af874](https://github.com/c4spar/deno-cliffy/commit/82af874))
- **command:** documentation improvements (#622)
  ([e8b7da5](https://github.com/c4spar/deno-cliffy/commit/e8b7da5))
- **flags:** documentation improvements (#620)
  ([46392b1](https://github.com/c4spar/deno-cliffy/commit/46392b1))
- **keypress:** documentation improvements (#619)
  ([385b483](https://github.com/c4spar/deno-cliffy/commit/385b483))
- **keypress:** documentation improvements (#618)
  ([2070858](https://github.com/c4spar/deno-cliffy/commit/2070858))
- **prompt:** update select & checkbox docs (#628)
  ([02949d6](https://github.com/c4spar/deno-cliffy/commit/02949d6))
- **prompt:** documentation improvements (#616)
  ([51dd46b](https://github.com/c4spar/deno-cliffy/commit/51dd46b))
- **table:** documentation improvements (#615)
  ([c67e441](https://github.com/c4spar/deno-cliffy/commit/c67e441))

# [v0.25.7](https://github.com/c4spar/deno-cliffy/compare/v0.25.6...v0.25.7) (Jan 5, 2023)

### Bug Fixes

- **prompt:** suggestions are not completed if input is empty (#528)
  ([06f71aa](https://github.com/c4spar/deno-cliffy/commit/06f71aa))
- **prompt:** suggestions only work with lowercase input (#527)
  ([9da2288](https://github.com/c4spar/deno-cliffy/commit/9da2288))

### Code Refactoring

- **command:** use `brightBlue` and `brightMagenta` instead of `blue` and
  `magenta` in command output (#533)
  ([c9e69e2](https://github.com/c4spar/deno-cliffy/commit/c9e69e2))
- **command:** show expected values in error message for invalid boolean value
  (#534) ([9d47a5e](https://github.com/c4spar/deno-cliffy/commit/9d47a5e))
- **prompt:** use `brightBlue` instead of `blue` in prompt output (#530)
  ([d7388a7](https://github.com/c4spar/deno-cliffy/commit/d7388a7))

# [v0.25.6](https://github.com/c4spar/deno-cliffy/compare/v0.25.5...v0.25.6) (Dec 20, 2022)

### Bug Fixes

- **command:** single quotes in option description breaks fish completions
  (#518) ([c09c74a](https://github.com/c4spar/deno-cliffy/commit/c09c74a))
- **command:** zsh completion broken for options without aliases (#515)
  ([f65465a](https://github.com/c4spar/deno-cliffy/commit/f65465a))
- **kecode:** char property not set for space key (#519)
  ([eafa1be](https://github.com/c4spar/deno-cliffy/commit/eafa1be))

### Code Refactoring

- **command:** refactor `generateOption` method in zsh completions generator
  (#517) ([eb53cd2](https://github.com/c4spar/deno-cliffy/commit/eb53cd2))

### Chore

- **task:** fix check:examples task (#516)
  ([8d753ac](https://github.com/c4spar/deno-cliffy/commit/8d753ac))
- **upgrade:** deno/std@0.170.0 (#521)
  ([f9d0252](https://github.com/c4spar/deno-cliffy/commit/f9d0252))

### Unit/Integration Tests

- **prompt:** test spaces in input prompt (#520)
  ([a68c9d5](https://github.com/c4spar/deno-cliffy/commit/a68c9d5))

# [v0.25.5](https://github.com/c4spar/deno-cliffy/compare/v0.25.4...v0.25.5) (Dec 3, 2022)

### Features

- **command:** expose `.throw()` method (#508)
  ([f07d37a](https://github.com/c4spar/deno-cliffy/commit/f07d37a))
- **command:** add `cmd` property to `ValidationError` (#506)
  ([27ae6cd](https://github.com/c4spar/deno-cliffy/commit/27ae6cd))
- **command:** add error handler (#505)
  ([a9f55b2](https://github.com/c4spar/deno-cliffy/commit/a9f55b2))
- **keypress:** add char property to KeyPressEvent (#504)
  ([0b655c7](https://github.com/c4spar/deno-cliffy/commit/0b655c7))
- **keycode:** add char property to KeyCode and support more special chars
  (#501) ([b0db79e](https://github.com/c4spar/deno-cliffy/commit/b0db79e))

### Bug Fixes

- **command:** add missing await to catch validation error correctly (#500)
  ([f33161a](https://github.com/c4spar/deno-cliffy/commit/f33161a))
- **command:** export UpgradeCommand from command/mod.ts (#482)
  ([fee48bf](https://github.com/c4spar/deno-cliffy/commit/fee48bf))
- **prompt:** ignore special key like F1, escape, etc. in input prompts (#502)
  ([1e444a7](https://github.com/c4spar/deno-cliffy/commit/1e444a7))
- **prompt:** grammar longer then to longer than (#497)
  ([1b6b563](https://github.com/c4spar/deno-cliffy/commit/1b6b563))

### Code Refactoring

- **prompt:** refactor handleEvent method in input prompt (#503)
  ([94fa06b](https://github.com/c4spar/deno-cliffy/commit/94fa06b))
- **prompt:** use long names for generic parameters (#491)
  ([f2a0d2a](https://github.com/c4spar/deno-cliffy/commit/f2a0d2a))

### Chore

- **upgrade:** deno/std@0.167.0 (#510)
  ([3c40677](https://github.com/c4spar/deno-cliffy/commit/3c40677))

### Unit/Integration Tests

- **prompt:** use assertSnapshot for snapshot tests (#493)
  ([e3a2d65](https://github.com/c4spar/deno-cliffy/commit/e3a2d65))

### Documentation Updates

- **command:** update example
  ([572c44f](https://github.com/c4spar/deno-cliffy/commit/572c44f))
- **command:** add example for `.throw()` method (#509)
  ([dd4d33d](https://github.com/c4spar/deno-cliffy/commit/dd4d33d))
- **command:** add missing await in command examples (#507)
  ([1443b38](https://github.com/c4spar/deno-cliffy/commit/1443b38))
- **examples:** don't use deprecated `OptionType` (#487)
  ([a9a0a98](https://github.com/c4spar/deno-cliffy/commit/a9a0a98))

# [v0.25.4](https://github.com/c4spar/deno-cliffy/compare/v0.25.3...v0.25.4) (Oct 27, 2022)

### Bug Fixes

- remove no longer existing `validateFlags` export from `cliffy/mod.ts` (#485)
  ([22938a8](https://github.com/c4spar/deno-cliffy/commit/22938a8))
- **prompt:** add support for stabilized `Deno.consoleSize()` (#484)
  ([096bb00](https://github.com/c4spar/deno-cliffy/commit/096bb00))

### Chore

- **upgrade:** deno/std@0.161.0 (#486)
  ([cf15791](https://github.com/c4spar/deno-cliffy/commit/cf15791))

# [v0.25.3](https://github.com/c4spar/deno-cliffy/compare/v0.25.2...v0.25.3) (Oct 26, 2022)

### DEPRECATIONS

- **command:** rename some types and deprecate old types (#474)
  ([d56ad88](https://github.com/c4spar/deno-cliffy/commit/d56ad88))

  The following types have been deprecated and renamed:

  - `IArgument` -> `Argument`
  - `ICommandGlobalOption` -> `GlobalOptionOptions`
  - `ICommandOption` -> `OptionOptions`
  - `ICompleteOptions` -> `CompleteOptions`
  - `ICompletion` -> `Completion`
  - `IEnvVar` -> `EnvVar`
  - `IEnvVarOptions` -> `EnvVarOptions`
  - `IExample` -> `Example`
  - `IGlobalEnvVarOptions` -> `GlobalEnvVarOptions`
  - `IOption` -> `Option`
  - `IParseResult` -> `CommandResult`
  - `IType` -> `TypeDef`
  - `ITypeOptions` -> `TypeOptions`
  - `IAction` -> `ActionHandler`
  - `ICompleteHandler` -> `CompleteHandler`
  - `IDescription` -> `Description`
  - `IEnvVarValueHandler` -> `EnvVarValueHandler`
  - `IFlagValueHandler` -> `OptionValueHandler`
  - `IHelpHandler` -> `HelpHandler`
  - `IVersionHandler` -> `VersionHandler`
  - `TypeValue` -> `Type.infer`

- **flags:** rename some types and deprecate old types (#473)
  ([7615ed7](https://github.com/c4spar/deno-cliffy/commit/7615ed7))

  The following types have been deprecated and renamed:

  - `IParseOptions` -> `ParseFlagsOptions`
  - `IFlagOptions` -> `FlagOptions`
  - `IFlagArgument` -> `ArgumentOptions`
  - `IDefaultValue` -> `DefaultValue`
  - `IFlagValueHandler` -> `ValueHandler`
  - `IFlagsResult` -> `ParseFlagsContext`
  - `ITypeInfo` -> `ArgumentValue`
  - `ITypeHandler` -> `TypeHandler`
  - `OptionType` -> `ArgumentType`

### Bug Fixes

- **command:** remove duplicate "Missing argument" in error message (#471)
  ([ee52235](https://github.com/c4spar/deno-cliffy/commit/ee52235))
- **command:** escape single quotes in command description for zsh completions
  (#467) ([0b82722](https://github.com/c4spar/deno-cliffy/commit/0b82722))
- **command,flags:** value gets ignored if value of an option with an equals
  sign starts with a dash (#477)
  ([517795a](https://github.com/c4spar/deno-cliffy/commit/517795a))
- **flags:** value of combined short flags with equals sign is assigned to wrong
  option (#479)
  ([dc29ab5](https://github.com/c4spar/deno-cliffy/commit/dc29ab5))
- **flags:** `equalsSign` option not working with `type` option (#476)
  ([08e7465](https://github.com/c4spar/deno-cliffy/commit/08e7465))

### Code Refactoring

- **command:** export `CommandType` and `IntegerType` (#478)
  ([22b8999](https://github.com/c4spar/deno-cliffy/commit/22b8999))
- **command:** use full names for generic parameters (#475)
  ([d93d2e0](https://github.com/c4spar/deno-cliffy/commit/d93d2e0))
- **command,flags:** rename errors (#470)
  ([eb046b2](https://github.com/c4spar/deno-cliffy/commit/eb046b2))
- **flags:** refactor arguments parsing (#480)
  ([273dd41](https://github.com/c4spar/deno-cliffy/commit/273dd41))

### Chore

- **task:** add MAX_PARALLEL env var to check:examples task (#472)
  ([fd74ce1](https://github.com/c4spar/deno-cliffy/commit/fd74ce1))
- **upgrade:** deno/std@0.160.0 (#481)
  ([1242ec9](https://github.com/c4spar/deno-cliffy/commit/1242ec9))

### Documentation Updates

- update readme
  ([3e96df1](https://github.com/c4spar/deno-cliffy/commit/3e96df1))

# [v0.25.2](https://github.com/c4spar/deno-cliffy/compare/v0.25.1...v0.25.2) (Oct 1, 2022)

### Features

- **command:** re-implement support for passing global options before
  sub-commands (#444)
  ([5ff1575](https://github.com/c4spar/deno-cliffy/commit/5ff1575))
- **flags:** add `dotted` option (#456)
  ([cd8d73c](https://github.com/c4spar/deno-cliffy/commit/cd8d73c))
- **flags:** add `stopOnUnknown` option (#453)
  ([b2700e5](https://github.com/c4spar/deno-cliffy/commit/b2700e5))
- **flags:** return matched standalone option (#451)
  ([6c5e27c](https://github.com/c4spar/deno-cliffy/commit/6c5e27c))
- **flags:** implement parse context (#448)
  ([5890402](https://github.com/c4spar/deno-cliffy/commit/5890402))

### Bug Fixes

- **prompt,keycode,keypress**: switch from `Deno.setRaw` to new
  `Deno.stdin.setRaw` (#459)
  ([e5b9416](https://github.com/c4spar/deno-cliffy/commit/e5b9416))
- **command:** fix type errors with typescript => 4.8 (#460)
  ([9763bd4](https://github.com/c4spar/deno-cliffy/commit/9763bd4))
- **command,flags:** throw an error if an option without a value has a value
  (#443) ([166101f](https://github.com/c4spar/deno-cliffy/commit/166101f))
- **flags:** don't throw `UnexpectedOptionValue` error if no flags are defined
  (#450) ([ed50ca3](https://github.com/c4spar/deno-cliffy/commit/ed50ca3))

### Code Refactoring

- **command:** throw to many arguments error for global & none global option
  before a sub-command (#454)
  ([78eec2d](https://github.com/c4spar/deno-cliffy/commit/78eec2d))
- **flags:** refactor stop early parsing (#449)
  ([e48fc0f](https://github.com/c4spar/deno-cliffy/commit/e48fc0f))

### Chore

- **ci:** add codecov flags (#446)
  ([9da9748](https://github.com/c4spar/deno-cliffy/commit/9da9748))
- **task:** type check all examples parallel (#452)
  ([8c1e884](https://github.com/c4spar/deno-cliffy/commit/8c1e884))
- **upgrade:** deno/std@0.158.0 (#463)
  ([8b8ba3b](https://github.com/c4spar/deno-cliffy/commit/8b8ba3b))

# [v0.25.1](https://github.com/c4spar/deno-cliffy/compare/v0.25.0...v0.25.1) (Sep 14, 2022)

### Bug Fixes

- **command:** help text of main command is always shown for validation errors
  (#441) ([41b3547](https://github.com/c4spar/deno-cliffy/commit/41b3547))

### Chore

- **upgrade:** deno/std@0.155.0 (#442)
  ([34f889d](https://github.com/c4spar/deno-cliffy/commit/34f889d))

### Revert

- feat(command): support passing global options before sub-command (#388) (#440)
  ([85d3dac](https://github.com/c4spar/deno-cliffy/commit/85d3dac))

# [v0.25.0](https://github.com/c4spar/deno-cliffy/compare/v0.24.3...v0.25.0) (Sep 3, 2022)

### Features

- **command:** add `.noGlobals()` method (#403)
  ([e37fb99](https://github.com/c4spar/deno-cliffy/commit/e37fb99))
- **table:** allow undefined cell values and override them with row and col span
  (#427) ([89fe0ca](https://github.com/c4spar/deno-cliffy/commit/89fe0ca))

### Bug Fixes

- **command:** required options with conflicting options should be optional
  (#435) ([4c71af1](https://github.com/c4spar/deno-cliffy/commit/4c71af1))
- **command:** type error when trying to add a command instance with child
  commands (#386)
  ([35fe1de](https://github.com/c4spar/deno-cliffy/commit/35fe1de))
- **command:** use instance properties for shouldThrowErrors and shouldExit
  check (#426) ([21d7558](https://github.com/c4spar/deno-cliffy/commit/21d7558))
- **command:** don't call `Deno.exit()` in help command when `.noExit()` is
  called (#424)
  ([41769ec](https://github.com/c4spar/deno-cliffy/commit/41769ec))
- **command:** ignore missing required env vars for global help option (#423)
  ([0290828](https://github.com/c4spar/deno-cliffy/commit/0290828))
- **command:** ignore missing required env vars for help and version option
  (#415) ([275b337](https://github.com/c4spar/deno-cliffy/commit/275b337))
- **command:** do not require full env permission (#416)
  ([bc4c1bd](https://github.com/c4spar/deno-cliffy/commit/bc4c1bd))
- **table:** max call stack error thrown for large tables (#433)
  ([f699178](https://github.com/c4spar/deno-cliffy/commit/f699178))
- **table:** error when first row is empty and colSpan is enabled (#432)
  ([4d07eea](https://github.com/c4spar/deno-cliffy/commit/4d07eea))
- **table:** row doesn't inherit the table settings correctly (#428)
  ([60a781c](https://github.com/c4spar/deno-cliffy/commit/60a781c))

### Code Refactoring

- **command:** refactor `.parseOptions()` method (#409)
  ([58df99d](https://github.com/c4spar/deno-cliffy/commit/58df99d))

### Chore

- **ci:** type-check and fix examples (#414)
  ([63b6613](https://github.com/c4spar/deno-cliffy/commit/63b6613))
- **ci:** run `deno test` with `--parallel` flag (#412)
  ([1186435](https://github.com/c4spar/deno-cliffy/commit/1186435))
- **deno:** add snapshot task (#429)
  ([607182d](https://github.com/c4spar/deno-cliffy/commit/607182d))
- **deno:** add `deno.jsonc` config and use `deno task` (#413)
  ([5f28389](https://github.com/c4spar/deno-cliffy/commit/5f28389))
- **upgrade:** std@0.154.0 and add update deps task (#420)
  ([69e1ab5](https://github.com/c4spar/deno-cliffy/commit/69e1ab5),
  [9af27da](https://github.com/c4spar/deno-cliffy/commit/9af27da))

### Documentation Updates

- **command:** update ansi example (#422)
  ([cab4f51](https://github.com/c4spar/deno-cliffy/commit/cab4f51))
- **command:** fix examples and use local file imports (#410)
  ([4c62043](https://github.com/c4spar/deno-cliffy/commit/4c62043))

### BREAKING CHANGES

- **command:** flatten variadic arguments and fix types for variadic option
  arguments (#418)
  ([bf5f15a](https://github.com/c4spar/deno-cliffy/commit/bf5f15a))

  **Before:**

  ```ts
  new Command()
    .arguments("[arg1] [arg2] [...restArgs]")
    .action((_, arg1, arg2, restArgs) => {});
  ```

  **After:**

  ```ts
  new Command()
    .arguments("[arg1] [arg2] [...restArgs]")
    .action((_, arg1, arg2, ...restArgs) => {});
  ```

# [v0.24.3](https://github.com/c4spar/deno-cliffy/compare/v0.24.2...v0.24.3) (Jul 29, 2022)

### Features

- **command:** support passing global options before sub-command (#388)
  ([ecbbcc0](https://github.com/c4spar/deno-cliffy/commit/ecbbcc0))
- **command:** add support for list type in arguments (#402)
  ([6dd3a6c](https://github.com/c4spar/deno-cliffy/commit/6dd3a6c))
- **command:** indicate required env vars in help text (#394)
  ([8f51cca](https://github.com/c4spar/deno-cliffy/commit/8f51cca))

### Bug Fixes

- **command:** all options should be optional if `.allowEmpty()` is called
  (#408) ([2ba7386](https://github.com/c4spar/deno-cliffy/commit/2ba7386))
- **command:** negatable option causes parsing issues when positioned before
  non-negatable options (#400)
  ([751e1aa](https://github.com/c4spar/deno-cliffy/commit/751e1aa))
- **command:** explicitly scope fish variables in completion script (#397)
  ([2048a1e](https://github.com/c4spar/deno-cliffy/commit/2048a1e))
- **command:** help text not always shown for validation error (#401)
  ([e7bc0e8](https://github.com/c4spar/deno-cliffy/commit/e7bc0e8))
- **command:** error handling not working correctly (#389)
  ([0d66e88](https://github.com/c4spar/deno-cliffy/commit/0d66e88))

### Code Refactoring

- **command:** refactor `.parseCommand()` method (#404)
  ([60b9dd7](https://github.com/c4spar/deno-cliffy/commit/60b9dd7))

### Chore

- **shellcheck:** disable shellcheck warnings temporarily (#395)
  ([f7cccc6](https://github.com/c4spar/deno-cliffy/commit/f7cccc6))
- **upgrade:** std@0.150.0 (#407)
  ([41f3b69](https://github.com/c4spar/deno-cliffy/commit/41f3b69))

### Documentation Updates

- fix typo (#383)
  ([8f3b27f](https://github.com/c4spar/deno-cliffy/commit/8f3b27f))

# [v0.24.2](https://github.com/c4spar/deno-cliffy/compare/v0.24.1...v0.24.2) (May 10, 2022)

### Bug Fixes

- **command:** list type not working in env vars (#379)
  ([9d24d78](https://github.com/c4spar/deno-cliffy/commit/9d24d78))

### Chore

- **upgrade:** deno/std@0.138.0 (#380)
  ([f1f1c4d](https://github.com/c4spar/deno-cliffy/commit/f1f1c4d))

# [v0.24.1](https://github.com/c4spar/deno-cliffy/compare/v0.24.0...v0.24.1) (May 10, 2022)

### Features

- **command:** allow boolean values in enum type (#377)
  ([1f3d47e](https://github.com/c4spar/deno-cliffy/commit/1f3d47e))

### Bug Fixes

- **command:** mapped value not correctly infered in option action handler
  (#378) ([dbde261](https://github.com/c4spar/deno-cliffy/commit/dbde261))

### Chore

- **ci:** run lint and test workflows on pull requests (#374)
  ([cb2bb7e](https://github.com/c4spar/deno-cliffy/commit/cb2bb7e))
- **ci:** disable temporarily the --jobs flag on ci (#376)
  ([235838b](https://github.com/c4spar/deno-cliffy/commit/235838b))

### Documentation Updates

- correct plural/possessive usage of "'s" (#371)
  ([3964dfe](https://github.com/c4spar/deno-cliffy/commit/3964dfe))
- **contributing:** update test command to run successfully (#373) (#375)
  ([23d5436](https://github.com/c4spar/deno-cliffy/commit/23d5436))

# [v0.24.0](https://github.com/c4spar/deno-cliffy/compare/v0.23.2...v0.24.0) (May 2, 2022)

### BREAKING CHANGES

- **command:** refactor handling of optional options defined with an equals sign
  (#369) ([a51e230](https://github.com/c4spar/deno-cliffy/commit/a51e230))

This is a breaking change for the command module. Options defined with an equal
sign must now also be called with an equal sign. Options defined without an
equal sign can be called with and without an equal sign as it was before.

### Features

- **flags:** add equalsSing option (#368)
  ([eb75c0a](https://github.com/c4spar/deno-cliffy/commit/eb75c0a))

### Bug Fixes

- **command,flags:** fix handling of multi option arguments (#368)
  ([eb75c0a](https://github.com/c4spar/deno-cliffy/commit/eb75c0a))

# [v0.23.2](https://github.com/c4spar/deno-cliffy/compare/v0.23.1...v0.23.2) (Apr 29, 2022)

### Features

- **command:** dedent description for better multiline support (#365)
  ([87976a6](https://github.com/c4spar/deno-cliffy/commit/87976a6))
- **command:** add support for grouped options (#364)
  ([9d00c61](https://github.com/c4spar/deno-cliffy/commit/9d00c61))

### Chore

- **ci:** upgrade github actions (#363)
  ([2639872](https://github.com/c4spar/deno-cliffy/commit/2639872))
- **upgrade:** deno/std@0.137.0 (#366)
  ([a5fc61d](https://github.com/c4spar/deno-cliffy/commit/a5fc61d))

### Unit/Integration Tests

- **command:** use assertSnapshot for integration tests (#367)
  ([2dc7872](https://github.com/c4spar/deno-cliffy/commit/2dc7872))

# [v0.23.1](https://github.com/c4spar/deno-cliffy/compare/v0.23.0...v0.23.1) (Apr 26, 2022)

### Bug Fixes

- **command:** add missing default types for the FileType type (#361)
  ([559bb4a](https://github.com/c4spar/deno-cliffy/commit/559bb4a))
- **command:** only first argument of rest arguments is completed with zsh
  completions (#359)
  ([dc0c1de](https://github.com/c4spar/deno-cliffy/commit/dc0c1de))
- **command:** first argument is also completed on index two (#358)
  ([1784eef](https://github.com/c4spar/deno-cliffy/commit/1784eef))
- **command:** zsh completion action not called for arguments (#357)
  ([1a62fe8](https://github.com/c4spar/deno-cliffy/commit/1a62fe8))
- **command:** fix option types for useRawArgs (#356)
  ([7acac27](https://github.com/c4spar/deno-cliffy/commit/7acac27))

### Chore

- **upgrade:** deno/std@0.136.0, sinon@v13.0.2 (#362)
  ([a6e4b45](https://github.com/c4spar/deno-cliffy/commit/a6e4b45))

# [v0.23.0](https://github.com/c4spar/deno-cliffy/compare/v0.22.2...v0.23.0) (Apr 11, 2022)

### BREAKING CHANGES

- **command:** infer types and option names (#312)
  ([efcad62](https://github.com/c4spar/deno-cliffy/commit/efcad62))

  With this release the `Command` class is now strict by default. All names and
  types from option, argument and environment variable definitions will be now
  automatically inferred 🚀

  Previously it was necessary to pass the `void` type as first generic argument
  to the command class `Command<void>` (which is now the default) to enable
  strict typings. The name and the type could than be specified by passing them
  to the `option`, `arguments` or `env` methods:

  ```ts
  new Command<void>()
    .option<{ foo?: string }>("--foo <value:string>")
    .arguments<[string, string?]>("<input> [output]");
  ```

  This is no longer necessary. Names and types are now automatically inferred
  from the definitions `"--foo <value:string>"` and you can define it just like
  the following example. Options and arguments will be automatically typed.

  ```ts
  new Command()
    .option("--foo <value:string>")
    .arguments("<input> [output]");
  ```

  Dotted options, custom types like `EnumType` and options like `default`,
  `value` and `prefix` are supported as well.

  To disable strict types you can pass the `any` type to the command class
  `Command<any>` which was previously the default._
- **command:** fix allowEmpty and disable it by default (#352)
  ([c17718d](https://github.com/c4spar/deno-cliffy/commit/c17718d))

  Previously `.allowEmpty()` was enabled by default, which means if an required
  option was registered no error was thrown if the command was called without
  any arguments. `.allowEmpty()` is now disabled by default and has to be
  enabled manually.

### Features

- **command:** add new file type with path completion support (#353)
  ([969f2dd](https://github.com/c4spar/deno-cliffy/commit/969f2dd))

  If the `CompletionCommand` is registered, path completions will be enabled for
  arguments and options with the `file` type. The new `file` type can be used as
  following:
  ```ts
  new Command()
    .option("--input-file <path:file>", "The input file.")`
  ```

- **command:** show long version format with long --version option (#343)
  ([079b4ba](https://github.com/c4spar/deno-cliffy/commit/079b4ba))
- **command:** show hint in help if a new version is available (#342)
  ([bc9cfbf](https://github.com/c4spar/deno-cliffy/commit/bc9cfbf))
- **command,flags:** add support for wildcard options (#351)
  ([e604e44](https://github.com/c4spar/deno-cliffy/commit/e604e44))

  Wildcard options can be used to allow options with dynamic names. You can
  register them as following:

  ```ts
  new Command()
    .option("--foo.*", "This options allows any name on the foo option.")
    .option(
      "--bar.*.*",
      "This options allows any nested name on the bar option.",
    );
  ```

  Following options are valid options for the `--foo.*` option:

  - `--foo.bar`
  - `--foo.baz`

  Following options are valid options for the `--bar.*.*` option:

  - `--foo.bar.baz`
  - `--foo.beep.boop`

- **flags:** add `ignoreDefaults` option (#349)
  ([22178af](https://github.com/c4spar/deno-cliffy/commit/22178af))
- **prompt:** add n & p keys for next & previous and left & right for next &
  prev page (#345)
  ([d568f37](https://github.com/c4spar/deno-cliffy/commit/d568f37))
- **prompt:** add hideDefault option (#344)
  ([dc460b6](https://github.com/c4spar/deno-cliffy/commit/dc460b6))

### Bug Fixes

- suggestions value is always lower cased (#346)
  ([5d1e3a7](https://github.com/c4spar/deno-cliffy/commit/5d1e3a7))
- **command:** default value from option overrides env var (#350)
  ([2cd7735](https://github.com/c4spar/deno-cliffy/commit/2cd7735))
- **prompt:** prompt is not rendered properly if content is longer than the
  terminal (#347)
  ([56755e1](https://github.com/c4spar/deno-cliffy/commit/56755e1))

### Code Refactoring

- **flags:** infer option types in option callback method (#348)
  ([483bbf7](https://github.com/c4spar/deno-cliffy/commit/483bbf7))
- **prompt:** improve generic types for prompt methd (#335)
  ([42e21f6](https://github.com/c4spar/deno-cliffy/commit/42e21f6))

### Documentation Updates

- update readme
  ([afc7774](https://github.com/c4spar/deno-cliffy/commit/afc7774))
- remove old docs
  ([d674dfb](https://github.com/c4spar/deno-cliffy/commit/d674dfb))

### Chore

- **upgrade:** deno/std@0.134.0 & sinon@v13.0.1 (#354)
  ([f63b687](https://github.com/c4spar/deno-cliffy/commit/f63b687))

# [v0.20.2](https://github.com/c4spar/deno-cliffy/compare/v0.20.1...v0.20.2) (Mar 16, 2022)

### Features

- **command:** add support to show additional information in help text (#300)
  ([e32f826](https://github.com/c4spar/deno-cliffy/commit/e32f826))
- **command:** add support for enums in EnumType (#316)
  ([d71071e](https://github.com/c4spar/deno-cliffy/commit/d71071e))
- **prompt:** add support for path completion and dynamic suggestions (#306)
  ([0be6da7](https://github.com/c4spar/deno-cliffy/commit/0be6da7))

### Bug Fixes

- **command:** only first missing required variadic option throws an error
  (#331) ([cf487de](https://github.com/c4spar/deno-cliffy/commit/cf487de))
- **command:** integer argument with value 0 is ignored (#329)
  ([11b824c](https://github.com/c4spar/deno-cliffy/commit/11b824c))
- **prompt:** checkbox and select prompt fails with only one disabled option
  (#328) ([683f260](https://github.com/c4spar/deno-cliffy/commit/683f260))
- **table:** chinese characters are not aligned correctly (#330)
  ([e31b680](https://github.com/c4spar/deno-cliffy/commit/e31b680))

### Performance Improvements

- **table:** improve performance for tables without col and row span (#327)
  ([29bcfd6](https://github.com/c4spar/deno-cliffy/commit/29bcfd6))

### Code Refactoring

- **command:** change return type of action handler to unknown (#315)
  ([04e6917](https://github.com/c4spar/deno-cliffy/commit/04e6917))

### Chore

- add funding ([ebafd0e](https://github.com/c4spar/deno-cliffy/commit/ebafd0e))
- **ci:** use denoland/setup-deno in lint workflow (#332)
  ([63b47d0](https://github.com/c4spar/deno-cliffy/commit/63b47d0))
- **command:** add script to update all test fixtures (#301)
  ([89cc617](https://github.com/c4spar/deno-cliffy/commit/89cc617))
- **fmt:** fmt readme (#305)
  ([8c63fd8](https://github.com/c4spar/deno-cliffy/commit/8c63fd8))
- **fmt:** fmt changelog
  ([6d51275](https://github.com/c4spar/deno-cliffy/commit/6d51275))
- **upgrade:** deno/std0.130.0 (#333)
  ([336f0a1](https://github.com/c4spar/deno-cliffy/commit/336f0a1))

### Documentation Updates

- **prompt:** add info for required --unstable flag
  ([beca790](https://github.com/c4spar/deno-cliffy/commit/beca790))

# [v0.20.1](https://github.com/c4spar/deno-cliffy/compare/v0.20.0...v0.20.1) (Nov 1, 2021)

### Code Refactoring

- **command:** preparation for the new typescript option
  --useUnknownInCatchVariables (#294)
  ([864e915](https://github.com/c4spar/deno-cliffy/commit/864e915))

### Chore

- **upgrade:** deno/std v0.113.0 (#295)
  ([8d1664a](https://github.com/c4spar/deno-cliffy/commit/8d1664a))

# [v0.20.0](https://github.com/c4spar/deno-cliffy/compare/v0.19.6...v0.20.0) (Oct 23, 2021)

### Features

- **command:** add value option for env vars (#290)
  ([e5b2b2b](https://github.com/c4spar/deno-cliffy/commit/e5b2b2b))

### Bug Fixes

- **command:** help text shows always long description for env vars (#289)
  ([6201e28](https://github.com/c4spar/deno-cliffy/commit/6201e28))
- **command:** fix description column definition in help text (#286)
  ([bf727fb](https://github.com/c4spar/deno-cliffy/commit/bf727fb))
- **command:** highlight command usage in help text (#288)
  ([7181724](https://github.com/c4spar/deno-cliffy/commit/7181724))

### Chore

- **upgrade:** deno/std v0.112.0 (#291)
  ([750d70d](https://github.com/c4spar/deno-cliffy/commit/750d70d))

### BREAKING CHANGES

- **command:** execute command action after option action is called (#285)
  ([9170a65](https://github.com/c4spar/deno-cliffy/commit/9170a65))

  Prior to v0.20.0, when an option action was executed, the command action was
  not executed. Since v0.20.0, this has changed. The command action is now
  executed by default. Only standalone options do not execute the command
  actions (for more informations the
  [docs](https://github.com/c4spar/deno-cliffy/tree/v0.20.0/command#option-action-handler)).

# [v0.19.6](https://github.com/c4spar/deno-cliffy/compare/v0.19.5...v0.19.6) (2021-09-23)

### Features

- **command:** add noExit method (#282, #275)
  ([bc0c5bb](https://github.com/c4spar/deno-cliffy/commit/bc0c5bb),
  [ab38cc7](https://github.com/c4spar/deno-cliffy/commit/ab38cc7))
- **command:** show long help with --help option (#281)
  ([e577f5a](https://github.com/c4spar/deno-cliffy/commit/e577f5a))
- **command:** add usage method (#280)
  ([a32755d](https://github.com/c4spar/deno-cliffy/commit/a32755d))

### Bug Fixes

- **prompt:** key symbols in prompt info are hardcoded (#274)
  ([a6138b2](https://github.com/c4spar/deno-cliffy/commit/a6138b2))

### Documentation Updates

- fix typos (#279)
  ([d802a15](https://github.com/c4spar/deno-cliffy/commit/d802a15))
- **command:** fix incorrectly import module (#276)
  ([6674ea3](https://github.com/c4spar/deno-cliffy/commit/6674ea3))
- **command:** fix import path (#271)
  ([57e7434](https://github.com/c4spar/deno-cliffy/commit/57e7434))

# [v0.19.5](https://github.com/c4spar/deno-cliffy/compare/v0.19.4...v0.19.5) (2021-08-12)

### Features

- **command:** support import map in upgrade command (#265)
  ([b400131](https://github.com/c4spar/deno-cliffy/commit/b400131))
- **command:** add support for required env vars (#261)
  ([ee69526](https://github.com/c4spar/deno-cliffy/commit/ee69526))
- **command:** make parsed environment variables available via command options
  (#263) ([102161e](https://github.com/c4spar/deno-cliffy/commit/102161e))
- **command:** add prefix to environment variable options (#268)
  ([44c80c8](https://github.com/c4spar/deno-cliffy/commit/44c80c8))

```ts
await new Command<void>()
  .env<{ outputFile?: string }>(
    "CC_OUTPUT_FILE=<value:string>",
    "The output file.",
    { prefix: "CC_" },
  )
  .option<{ outputFile?: string }>(
    "--output-file <value:string>",
    "The output file.",
  )
  .action((options) => console.log(options.outputFile))
  .parse();
```

```console
$ CC_OUTPUT_FILE=foo.txt deno run example.ts
foo.txt
$ CC_OUTPUT_FILE=foo.txt deno run example.ts --output-file bar.txt
bar.txt
```

### Bug Fixes

- **command:** output of --version should end with a new line (#256)
  ([8107875](https://github.com/c4spar/deno-cliffy/commit/8107875))

### Code Refactoring

- **command:** refactor executable sub-commands (#259)
  ([a13c79f](https://github.com/c4spar/deno-cliffy/commit/a13c79f))
- **command:** remove extra new line from getHelp() and completion generator
  methods (#257)
  ([99ccc2a](https://github.com/c4spar/deno-cliffy/commit/99ccc2a))
- **table:** use console.log to render output (#258)
  ([4f05fad](https://github.com/c4spar/deno-cliffy/commit/4f05fad))

### Chore

- **ci:** update release workflow
  ([65ba62a](https://github.com/c4spar/deno-cliffy/commit/65ba62a),
  [1c6dc9d](https://github.com/c4spar/deno-cliffy/commit/1c6dc9d))
- **ci:** add codecov config (#267)
  ([c54627a](https://github.com/c4spar/deno-cliffy/commit/c54627a))
- **codecov:** upgrade to codecov/codecov-action@v2 (#266)
  ([18c023c](https://github.com/c4spar/deno-cliffy/commit/18c023c))
- **upgrade:** deno/std v0.104.0 (#270)
  ([15af5bf](https://github.com/c4spar/deno-cliffy/commit/15af5bf))

### Documentation Updates

- update readmes (#269)
  ([83644f9](https://github.com/c4spar/deno-cliffy/commit/83644f9))
- **command:** update docs for environment variables
  ([f4cee28](https://github.com/c4spar/deno-cliffy/commit/f4cee28),
  [9d025fc](https://github.com/c4spar/deno-cliffy/commit/9d025fc))
- **command:** fix incorrectly import module in example (#262)
  ([3e62ad6](https://github.com/c4spar/deno-cliffy/commit/3e62ad6))
- **command:** update docs for executable sub commands
  ([0b2f3d1](https://github.com/c4spar/deno-cliffy/commit/0b2f3d1))

# [v0.19.4](https://github.com/c4spar/deno-cliffy/compare/v0.19.3...v0.19.4) (2021-07-27)

### Bug Fixes

- **command,flags:** equals sign not supported in option value (#253)
  ([b074cb3](https://github.com/c4spar/deno-cliffy/commit/b074cb3))
- **command,flags:** values starting with '-' not supported (#251)
  ([ab598bf](https://github.com/c4spar/deno-cliffy/commit/ab598bf))
- **command,flags:** required option value with default value is not required
  (#249) ([0d3f8fa](https://github.com/c4spar/deno-cliffy/commit/0d3f8fa))
- **flags:** allow collecting options by default if no flags are set (#252)
  ([24e3f46](https://github.com/c4spar/deno-cliffy/commit/24e3f46))

### Chore

- **ci:** add --jobs flag to speed up deno tests (#250)
  ([ce794cf](https://github.com/c4spar/deno-cliffy/commit/ce794cf))
- **upgrade:** deno/std v0.103.0 (#254)
  ([ad65b8e](https://github.com/c4spar/deno-cliffy/commit/ad65b8e))

# [v0.19.3](https://github.com/c4spar/deno-cliffy/compare/v0.19.2...v0.19.3) (2021-07-17)

### Features

- **prompt:** add prefix option (#233)
  ([a4943cb](https://github.com/c4spar/deno-cliffy/commit/a4943cb))

### Bug Fixes

- **command:** external commands not working on windows (#224)
  ([84ac5be](https://github.com/c4spar/deno-cliffy/commit/84ac5be))
- **command:** remove v prefix from version in generated help text (#231)
  ([f882abd](https://github.com/c4spar/deno-cliffy/commit/f882abd))
- **command,flags:** don't normalize arguments if stopEarly is enabled (#246)
  ([2ea4938](https://github.com/c4spar/deno-cliffy/commit/2ea4938))
- **prompt:** use exit code 130 for ctrl+c (#242)
  ([2c014d7](https://github.com/c4spar/deno-cliffy/commit/2c014d7))

### Code Refactoring

- **command:** export github upgrade provider in upgrade/mod.ts (#232)
  ([39a8075](https://github.com/c4spar/deno-cliffy/commit/39a8075))
- **prompt:** replace deprecated Deno.copy with copy method from std/io (#243)
  ([f95b317](https://github.com/c4spar/deno-cliffy/commit/f95b317))

### Chore

- **ci:** use denoland/setup-deno action (#219)
  ([d93ad7d](https://github.com/c4spar/deno-cliffy/commit/d93ad7d))
- **ci:** use latest deno version in release action
  ([36c1c07](https://github.com/c4spar/deno-cliffy/commit/36c1c07))
- **ci:** upgrade eggs to v0.3.8
  ([1efd809](https://github.com/c4spar/deno-cliffy/commit/1efd809))
- **egg:** add keypress module to egg.yaml
  ([fee6ed4](https://github.com/c4spar/deno-cliffy/commit/fee6ed4))
- **upgrade:** deno/std v0.101.0 (#244)
  ([534094b](https://github.com/c4spar/deno-cliffy/commit/534094b))

### Documentation Updates

- **ansi:** fix functional example command (#235)
  ([f3103b9](https://github.com/c4spar/deno-cliffy/commit/f3103b9))
- **command:** fix type of args in stopEarly example (#240)
  ([b909bc6](https://github.com/c4spar/deno-cliffy/commit/b909bc6))

# [v0.19.2](https://github.com/c4spar/deno-cliffy/compare/v0.19.1...v0.19.2) (2021-06-16)

### Features

- **command:** add colors option to help options (#213)
  ([eed2e90](https://github.com/c4spar/deno-cliffy/commit/eed2e90))
- **table:** add align option (#212)
  ([9e10c9e](https://github.com/c4spar/deno-cliffy/commit/9e10c9e))

### Bug Fixes

- **prompt:** unicode characters are not displayed properly on windows (#216)
  ([fb6a22e](https://github.com/c4spar/deno-cliffy/commit/fb6a22e))

### Code Refactoring

- **flags:** show better error message if an option occurs to many times (#215)
  ([8b0dfcb](https://github.com/c4spar/deno-cliffy/commit/8b0dfcb))

### Documentation Updates

- docs: add keypress module to cliffy.io
  ([15fe4e0](https://github.com/c4spar/deno-cliffy/commit/15fe4e0))

### Chore

- update .gitignore
  ([8053930](https://github.com/c4spar/deno-cliffy/commit/8053930))
- **ci:** remove deno 1.4.0 tests (#218)
  ([f0e2ba8](https://github.com/c4spar/deno-cliffy/commit/f0e2ba8))
- **upgrade:** deno/std v0.99.0 (#217)
  ([578cbda](https://github.com/c4spar/deno-cliffy/commit/578cbda))
- **upgrade:** upgrade dev deps (#210)
  ([d10f20d](https://github.com/c4spar/deno-cliffy/commit/d10f20d))

# [v0.19.1](https://github.com/c4spar/deno-cliffy/compare/v0.19.0...v0.19.1) (2021-05-30)

### Bug Fixes

- **prompt:** make `--location` flag optional (#209)
  ([ae89fdb](https://github.com/c4spar/deno-cliffy/commit/ae89fdb),
  [5c35a30](https://github.com/c4spar/deno-cliffy/commit/5c35a30),
  [7c5a678](https://github.com/c4spar/deno-cliffy/commit/7c5a678),
  [4819e2c](https://github.com/c4spar/deno-cliffy/commit/4819e2c),
  [a74ae81](https://github.com/c4spar/deno-cliffy/commit/a74ae81))

### Documentation Updates

- **changelog:** fix commit links
  ([8d8601f](https://github.com/c4spar/deno-cliffy/commit/8d8601f))

# [v0.19.0](https://github.com/c4spar/deno-cliffy/compare/v0.18.2...v0.19.0) (2021-05-26)

### BREAKING CHANGES

- **keycode:** refactor keycode module (#186)
  ([4ac2719](https://github.com/c4spar/deno-cliffy/commit/4ac2719))

  Before:
  ```ts
  const key: KeyEvent = KeyCode.parse(
    "\x1b[A\x1b[B\x1b[C\x1b[D\x1b[E\x1b[F\x1b[H",
  );
  ```

  After:
  ```ts
  const key: KeyCode = parse("\x1b[A\x1b[B\x1b[C\x1b[D\x1b[E\x1b[F\x1b[H");
  ```

### Features

- **command:** add exitCode option to ValidationError (#201)
  ([d4c0f12](https://github.com/c4spar/deno-cliffy/commit/d4c0f12))

  ```ts
  throw new ValidationError("Some validation error", 2);
  ```

- **command:** add enum type (#197)
  ([36289a2](https://github.com/c4spar/deno-cliffy/commit/36289a2))

  ```ts
  cmd.type("log-level", new EnumType(["debug", "info", 0, 1]))
    .option("-L, --log-level <level:log-level>");
  ```

- **command:** improve support for generic custom types (#191)
  ([59b1a93](https://github.com/c4spar/deno-cliffy/commit/59b1a93))

  ```ts
  const color = new EnumType(["red", "blue", "yellow"]);
  cmd.type("color", color)
    // you can pass the type
    .option<{ color: typeof color }>("-c, --color <name:color>");
  ```

- **command:** add upgrade command (#203)
  ([348f743](https://github.com/c4spar/deno-cliffy/commit/348f743))

  ```ts
  // single registry with default options
  cmd.command(
    "upgrade",
    new UpgradeCommand({
      provider: new DenoLandProvider(),
    }),
  );

  // multi registry with custom options
  cmd.command(
    "upgrade",
    new UpgradeCommand({
      main: "cli.ts",
      args: ["--allow-net", "--unstable"],
      provider: [
        new DenoLandProvider({ name: "cliffy" }),
        new NestLandProvider({ name: "cliffy" }),
        new GithubProvider({ repository: "c4spar/deno-cliffy" }),
      ],
    }),
  );
  ```

- **command:** add values method to types to show possible values in help text
  (#202) ([143eb1b](https://github.com/c4spar/deno-cliffy/commit/143eb1b),
  [045c56e](https://github.com/c4spar/deno-cliffy/commit/045c56e))
- **command:** allow numbers for completions (#195)
  ([f30b3af](https://github.com/c4spar/deno-cliffy/commit/f30b3af))
- **command,flags:** add integer type (#190)
  ([2cc7e57](https://github.com/c4spar/deno-cliffy/commit/2cc7e57))

  ```ts
  cmd.option("-a, --amount <amount:integer>");
  ```

- **keycode:** add code property to parse result (#182)
  ([366683f](https://github.com/c4spar/deno-cliffy/commit/366683f))
- **keypress:** add keypress module (#187)
  ([5acf5db](https://github.com/c4spar/deno-cliffy/commit/5acf5db))

  ```ts
  // promise
  const event: KeyPressEvent = await keypress();

  // events
  keypress().addEventListener((event: KeyPressEvent) => {
    console.log("event:", event);
    if (event.ctrlKey && event.key === "c") {
      keypress().dispose();
    }
  });

  // async iterator
  for await (const event: KeyPressEvent of keypress()) {
    console.log("event:", event);
    if (event.ctrlKey && event.key === "c") {
      break;
    }
  }
  ```

- **prompt:** add id option to automatically save suggestions to local storage
  (#204) ([28f25bd](https://github.com/c4spar/deno-cliffy/commit/28f25bd))

  ```ts
  await Input.prompt({
    message: "Enter your name",
    id: "<local-storage-key>",
  });
  ```

### Bug Fixes

- **command,flags:** value handler not called for default value if option is not
  defined on commandline
  ([ef3df5e](https://github.com/c4spar/deno-cliffy/commit/ef3df5e))
- **keycode:** fix esc key and sequence property for escaped keys
  ([b9eb39b](https://github.com/c4spar/deno-cliffy/commit/b9eb39b))
- **table:** fix getBody and hasHeaderBorder methods
  ([2d65cc8](https://github.com/c4spar/deno-cliffy/commit/2d65cc8))

### Code Refactoring

- **command:** add CompleteHandlerResult type (#200)
  ([ade3c3d](https://github.com/c4spar/deno-cliffy/commit/ade3c3d))
- **command:** remove unnecessary dependency (#199)
  ([b26f07c](https://github.com/c4spar/deno-cliffy/commit/b26f07c))
- **flags:** refactor number type (#196)
  ([9b57f54](https://github.com/c4spar/deno-cliffy/commit/9b57f54))
- **flags:** refactor error message for boolean and number types (#189)
  ([2a19c34](https://github.com/c4spar/deno-cliffy/commit/2a19c34))
- **keycode:** refactor special key handling
  ([7aaaec4](https://github.com/c4spar/deno-cliffy/commit/7aaaec4))
- **prompt:** enable raw mode only if stdin is a tty (#183)
  ([83c644a](https://github.com/c4spar/deno-cliffy/commit/83c644a))

### Chore

- **ci:** upgrade to eggs@0.3.6
  ([7a8e3dd](https://github.com/c4spar/deno-cliffy/commit/7a8e3dd))
- **upgrade:** deno/std v0.97.0 (#207)
  ([37dc946](https://github.com/c4spar/deno-cliffy/commit/37dc946))

### Unit/Integration Tests

- **flags:** fix value tests
  ([5ec86e8](https://github.com/c4spar/deno-cliffy/commit/5ec86e8))
- **prompt:** add integration tests (#172)
  ([0031490](https://github.com/c4spar/deno-cliffy/commit/0031490))
- **table:** add more tests
  ([3dd6315](https://github.com/c4spar/deno-cliffy/commit/3dd6315))

### Documentation Updates

- **command,flags:** add integer type to readme
  ([6aec3db](https://github.com/c4spar/deno-cliffy/commit/6aec3db))
- **command:** fix typo
  ([a965ea3](https://github.com/c4spar/deno-cliffy/commit/a965ea3))
- **command:** describe getHelp and showHelp
  ([0e674c8](https://github.com/c4spar/deno-cliffy/commit/0e674c8))
- **command:** documentation fixes
  ([6442ae7](https://github.com/c4spar/deno-cliffy/commit/6442ae7))

# [v0.18.2](https://github.com/c4spar/deno-cliffy/compare/v0.18.1...v0.18.2) (2021-04-14)

### Features

- **command:** allow method as version param (#165)
  ([fd647b8](https://github.com/c4spar/deno-cliffy/commit/fd647b8),
  [e6c3ccc](https://github.com/c4spar/deno-cliffy/commit/e6c3ccc))

### Bug Fixes

- **ansi:** make getCursorPosition options optional (#164)
  ([2e7c35d](https://github.com/c4spar/deno-cliffy/commit/2e7c35d))
- **command:** fix typo in completions command help (#175)
  ([c9f110a](https://github.com/c4spar/deno-cliffy/commit/c9f110a))
- **command:** fix shell completion of default types (#168)
  ([e976378](https://github.com/c4spar/deno-cliffy/commit/e976378))
- **command:** command alias not working (#167)
  ([45fc678](https://github.com/c4spar/deno-cliffy/commit/45fc678))

### Chore

- fix lint errors (#176)
  ([ebccd05](https://github.com/c4spar/deno-cliffy/commit/ebccd05))
- **ci:** add release workflow (#173)
  ([d7f24dc](https://github.com/c4spar/deno-cliffy/commit/d7f24dc))
- **ci:** fix nightly tests (#171)
  ([6e55b57](https://github.com/c4spar/deno-cliffy/commit/6e55b57))
- **upgrade:** deno/std v0.93.0 (#177)
  ([d758012](https://github.com/c4spar/deno-cliffy/commit/d758012))

### Unit/Integration Tests

- **ansi:** add more tests (#163)
  ([e91d651](https://github.com/c4spar/deno-cliffy/commit/e91d651))
- **command:** add integration tests (#169)
  ([37b07e9](https://github.com/c4spar/deno-cliffy/commit/37b07e9))
- **command:** add more tests (#166)
  ([298d5e0](https://github.com/c4spar/deno-cliffy/commit/298d5e0))

### Documentation Updates

- fix license link
  ([717abd8](https://github.com/c4spar/deno-cliffy/commit/717abd8))
- fix discoed link
  ([dad89b1](https://github.com/c4spar/deno-cliffy/commit/dad89b1))

# [v0.18.1](https://github.com/c4spar/deno-cliffy/compare/v0.18.0...v0.18.1) (2021-03-15)

### Bug Fixes

- **prompt:** adopt prompts to work with enabled ts option
  useDefineForClassFields (#162)
  ([ac6ce0e](https://github.com/c4spar/deno-cliffy/commit/ac6ce0e))

### Chore

- **ci:** generate coverage (#160)
  ([63b1a73](https://github.com/c4spar/deno-cliffy/commit/63b1a73))
- **egg:** add _utils to files list
  ([c2e60f9](https://github.com/c4spar/deno-cliffy/commit/c2e60f9))

### Documentation Updates

- update readmes
  ([933c3ed](https://github.com/c4spar/deno-cliffy/commit/933c3ed),
  [62a009c](https://github.com/c4spar/deno-cliffy/commit/62a009c))

# [v0.18.0](https://github.com/c4spar/deno-cliffy/compare/v0.17.2...v0.18.0) (2021-03-07)

### Features

- **command:** add improved support for generic types (#151, #157, #159)
  ([f43a7f1](https://github.com/c4spar/deno-cliffy/commit/f43a7f1),
  [e143799](https://github.com/c4spar/deno-cliffy/commit/e143799),
  [406afc2](https://github.com/c4spar/deno-cliffy/commit/406afc2))
- **command:** add globalOption, globalType, globalComplete and globalEnv alias
  methods (#152)
  ([e1a6bb2](https://github.com/c4spar/deno-cliffy/commit/e1a6bb2))
- **prompt:** improve search and auto suggestions (#153)
  ([6597205](https://github.com/c4spar/deno-cliffy/commit/6597205))

### Bug Fixes

- **command:** help callback does not work with global options and commands
  (#149) ([0972cc0](https://github.com/c4spar/deno-cliffy/commit/0972cc0))

### Chore

- **egg:** ignore .DS_Store files
  ([84fba89](https://github.com/c4spar/deno-cliffy/commit/84fba89))

* **upgrade:** deno/std v0.89.0 (#158)
  ([3ecd38e](https://github.com/c4spar/deno-cliffy/commit/3ecd38e))

### Documentation Updates

- fix ci badges (#156)
  ([bc93ae5](https://github.com/c4spar/deno-cliffy/commit/bc93ae5))

# [v0.17.2](https://github.com/c4spar/deno-cliffy/compare/v0.17.1...v0.17.2) (2021-02-08)

### Features

- **flags:** add option callback method (#147)
  ([246035c](https://github.com/c4spar/deno-cliffy/commit/246035c))

### Bug Fixes

- **command:** option action not executed for options with no value (#148)
  ([c436221](https://github.com/c4spar/deno-cliffy/commit/c436221))

# [v0.17.1](https://github.com/c4spar/deno-cliffy/compare/v0.17.0...v0.17.1) (2021-02-07)

### Bug Fixes

- **command:** actions on hyphenated options won't run (#144)
  ([1ee0366](https://github.com/c4spar/deno-cliffy/commit/1ee0366))
- **prompt:** clear stdout on ctrl+c (#142)
  ([1e15d38](https://github.com/c4spar/deno-cliffy/commit/1e15d38),
  [a6b5d36](https://github.com/c4spar/deno-cliffy/commit/a6b5d36))
- **prompt:** disabled item gets selected when it's the first option (#137)
  ([f5c9be5](https://github.com/c4spar/deno-cliffy/commit/f5c9be5))

### Code Refactoring

- use object spread instead of Object.assign
  ([22681f0](https://github.com/c4spar/deno-cliffy/commit/22681f0))
- **command,flags:** make options.flags an array
  ([eeac740](https://github.com/c4spar/deno-cliffy/commit/eeac740))

### Chore

- **upgrade:** deno/std v0.86.0 (#146)
  ([ce54da4](https://github.com/c4spar/deno-cliffy/commit/ce54da4))

### Documentation Updates

- fix sidebar width
  ([98dfe3b](https://github.com/c4spar/deno-cliffy/commit/98dfe3b))
- fmt reamdes and add discord budget (#140)
  ([821f13d](https://github.com/c4spar/deno-cliffy/commit/821f13d))

# [v0.17.0](https://github.com/c4spar/deno-cliffy/compare/v0.16.0...v0.17.0) (2021-01-11)

### Features

- **ansi:** add a chainable (chalk like) ansi colors module (#128)
  ([f2d8c93](https://github.com/c4spar/deno-cliffy/commit/f2d8c93))
- **command:** make generated help customizable (#134)
  ([0cfceb7](https://github.com/c4spar/deno-cliffy/commit/0cfceb7))
- **command,flags:** add _did-you-mean_ support for improved error messages
  (#131) ([afd8697](https://github.com/c4spar/deno-cliffy/commit/afd8697))
- **prompt:** add cbreak option to support custom signal handling (#106)
  ([a637b54](https://github.com/c4spar/deno-cliffy/commit/a637b54))
- **prompt:** add auto suggestion support to Input, Number, Confirm and List
  prompts ([7dd6660](https://github.com/c4spar/deno-cliffy/commit/7dd6660),
  [a67dc53](https://github.com/c4spar/deno-cliffy/commit/a67dc53))
- **prompt:** add search option to Select and Checkbox prompt
  ([7d09739](https://github.com/c4spar/deno-cliffy/commit/7d09739),
  [a67dc53](https://github.com/c4spar/deno-cliffy/commit/a67dc53))
- **prompt:** add info option to all prompts with a select or suggestions list
  ([c7bfce6](https://github.com/c4spar/deno-cliffy/commit/c7bfce6))
- **prompt:** add pageup and pagedown keys to all prompts with a select or
  suggestions list
  ([44575e3](https://github.com/c4spar/deno-cliffy/commit/44575e3))

### Code Refactoring

- **flags, command:** improve error handling and unify error messages (#133)
  ([8c7789b](https://github.com/c4spar/deno-cliffy/commit/8c7789b))
- **command:** refactor hints formatting in help output (#130)
  ([ed588e2](https://github.com/c4spar/deno-cliffy/commit/ed588e2))
- **prompt:** refactor indent option
  ([ad7923f](https://github.com/c4spar/deno-cliffy/commit/ad7923f))
- **prompt:** refactor internal keypress event handling
  ([37fcbaf](https://github.com/c4spar/deno-cliffy/commit/37fcbaf))

### Documentation Updates

- update documentations and add new example gifs
  ([4dc9991](https://github.com/c4spar/deno-cliffy/commit/4dc9991),
  [87223aa](https://github.com/c4spar/deno-cliffy/commit/87223aa),
  [df45bd8](https://github.com/c4spar/deno-cliffy/commit/df45bd8),
  [5d060b0](https://github.com/c4spar/deno-cliffy/commit/5d060b0),
  [99153ba](https://github.com/c4spar/deno-cliffy/commit/99153ba),
  [2383f5b](https://github.com/c4spar/deno-cliffy/commit/2383f5b))

### BREAKING CHANGES

- **ansi:** re-write ansi_escape module and rename to ansi (#124)
  ([41a39d0](https://github.com/c4spar/deno-cliffy/commit/41a39d0))
- **command:** rename help method to showHelp
  ([0cfceb7](https://github.com/c4spar/deno-cliffy/commit/0cfceb7))

# [v0.16.0](https://github.com/c4spar/deno-cliffy/compare/v0.15.0...v0.16.0) (2020-12-09)

### Features

- **table:** add static `Table.chars()` method to set global default table
  characters (#107)
  ([fec09df](https://github.com/c4spar/deno-cliffy/commit/fec09df))

### Bug Fixes

- **keycode:** f1-f4 + shift returns undefined key name (#111)
  ([112c0b5](https://github.com/c4spar/deno-cliffy/commit/112c0b5))
- **prompt:** fix default value of select prompt (#123)
  ([3a97617](https://github.com/c4spar/deno-cliffy/commit/3a97617))
- **prompt:** wrong cursor position on windows (#114)
  ([0e14b51](https://github.com/c4spar/deno-cliffy/commit/0e14b51))
- **prompt:** remove async modifer from abstract method declartion that breaks
  cliffy on deno 1.6 (#122)
  ([63351d0](https://github.com/c4spar/deno-cliffy/commit/63351d0))

### Code Refactoring

- **command:** remove duplication description from completions command (#118)
  ([d116c73](https://github.com/c4spar/deno-cliffy/commit/d116c73))
- **prompt:** refactor prompts (#122, #120, #119, #117)
  ([63351d0](https://github.com/c4spar/deno-cliffy/commit/63351d0),
  [2fda6e0](https://github.com/c4spar/deno-cliffy/commit/2fda6e0),
  [b5ecced](https://github.com/c4spar/deno-cliffy/commit/b5ecced),
  [f4ca0bb](https://github.com/c4spar/deno-cliffy/commit/f4ca0bb))

### Chore

- **lint:** fix lint errors (#115)
  ([6a088bd](https://github.com/c4spar/deno-cliffy/commit/6a088bd))
- **pagic:** setup pagic (#112)
  ([fdaf064](https://github.com/c4spar/deno-cliffy/commit/fdaf064),
  [0ff1fdc](https://github.com/c4spar/deno-cliffy/commit/0ff1fdc))

### Documentation Updates

- fix discord channel invite link
  ([2b9df6d](https://github.com/c4spar/deno-cliffy/commit/2b9df6d))
- update jsdocs (#109)
  ([27ee6b1](https://github.com/c4spar/deno-cliffy/commit/27ee6b1))

# [v0.15.0](https://github.com/c4spar/deno-cliffy/compare/v0.14.3...v0.15.0) (2020-10-24)

### Features

- **flags,command:** add support for dotted options (#104)
  ([9cd1191](https://github.com/c4spar/deno-cliffy/commit/9cd1191))
- **flags,command:** improve support for negatable options (#103)
  ([220dcea](https://github.com/c4spar/deno-cliffy/commit/220dcea))

# [v0.14.3](https://github.com/c4spar/deno-cliffy/compare/v0.14.2...v0.14.3) (2020-10-18)

### Bug Fixes

- **command:** optional arguments are validated even if they are not specified
  on the command line (#101)
  ([e3d61d7](https://github.com/c4spar/deno-cliffy/commit/e3d61d7))
- **command:** zsh completion values not separated by new line (#98)
  ([a89ccc6](https://github.com/c4spar/deno-cliffy/commit/a89ccc6))
- **flags,command:** single dash not supported in arguments (#100)
  ([5b30372](https://github.com/c4spar/deno-cliffy/commit/5b30372))

### Chore

- fix nightly tests (#97)
  ([e0093b7](https://github.com/c4spar/deno-cliffy/commit/e0093b7))
- **ci:** set deno version to v1.x
  ([c01396c](https://github.com/c4spar/deno-cliffy/commit/c01396c))
- **egg:** use unstable instead of deprecated stale option
  ([1e579b2](https://github.com/c4spar/deno-cliffy/commit/1e579b2))
- **lint:** fix lint errors
  ([2ca7bb6](https://github.com/c4spar/deno-cliffy/commit/2ca7bb6))
- **upgrade:** deno/std v0.74.0
  ([32f01e0](https://github.com/c4spar/deno-cliffy/commit/32f01e0))

# [v0.14.2](https://github.com/c4spar/deno-cliffy/compare/v0.14.2...v0.14.1) (2020-10-05)

### Features

- **command:** add fish completions support (#91)
  ([7e94214](https://github.com/c4spar/deno-cliffy/commit/7e94214),
  [5aaf108](https://github.com/c4spar/deno-cliffy/commit/5aaf108),
  [19e43db](https://github.com/c4spar/deno-cliffy/commit/19e43db))

### Bug Fixes

- **command:** spaces not supported in bash completions (#94)
  ([95b29b2](https://github.com/c4spar/deno-cliffy/commit/95b29b2))
- **command:** spaces not supported in zsh completions (#93)
  ([e9805b6](https://github.com/c4spar/deno-cliffy/commit/e9805b6))
- **command:** prompt method not exported from prompt/mod.ts
  ([cd0d122](https://github.com/c4spar/deno-cliffy/commit/cd0d122))

### Code Refactoring

- use underscore in file names (#92)
  ([357db7f](https://github.com/c4spar/deno-cliffy/commit/357db7f))
- **command:** indent zsh completions script with 2 spaces
  ([310bc00](https://github.com/c4spar/deno-cliffy/commit/310bc00))

### Chore

- **ci:** add separate workflows for test and nightly-test
  ([d8ecece](https://github.com/c4spar/deno-cliffy/commit/d8ecece))
- **ci:** update deno version to v1.4.4
  ([20c45f3](https://github.com/c4spar/deno-cliffy/commit/20c45f3),
  [689fe20](https://github.com/c4spar/deno-cliffy/commit/689fe20))
- **upgrade:** deno/std v0.73.0
  ([bfad89b](https://github.com/c4spar/deno-cliffy/commit/bfad89b),
  [5dbe353](https://github.com/c4spar/deno-cliffy/commit/5dbe353))

# [v0.14.1](https://github.com/c4spar/deno-cliffy/compare/v0.14.0...v0.14.1) (2020-09-13)

### Bug Fixes

- **command:** quotes and brackets in option description breaks shell-completion
  (#82) ([7907413](https://github.com/c4spar/deno-cliffy/commit/7907413))
- **command:** only generate argument completions for types that have
  completions (#81)
  ([1998108](https://github.com/c4spar/deno-cliffy/commit/1998108),
  [8040abf](https://github.com/c4spar/deno-cliffy/commit/8040abf))

### Chore

- **ci:** update deno version to v1.4.0
  ([e1515b9](https://github.com/c4spar/deno-cliffy/commit/e1515b9),
  [1e15d43](https://github.com/c4spar/deno-cliffy/commit/1e15d43))
- **lint:** fix lint errors
  ([2dd4be9](https://github.com/c4spar/deno-cliffy/commit/2dd4be9))
- **ts:** use import/export type for types
  ([fbcff11](https://github.com/c4spar/deno-cliffy/commit/fbcff11))
- **upgrade:** deno/std v0.69.0
  ([bfadcc1](https://github.com/c4spar/deno-cliffy/commit/bfadcc1),
  [9bdd341](https://github.com/c4spar/deno-cliffy/commit/9bdd341))

# [v0.14.0](https://github.com/c4spar/deno-cliffy/compare/v0.13.0...v0.14.0) (2020-09-02)

### Features

- **command:** add bash completions support (#78)
  ([09c0fc2](https://github.com/c4spar/deno-cliffy/commit/09c0fc2))
- **command:** implement argument types validation (#70)
  ([01acb53](https://github.com/c4spar/deno-cliffy/commit/01acb53))

### Bug Fixes

- **command:** fix complete command error "No type registered with name: action"
  (#77) ([f2c6bea](https://github.com/c4spar/deno-cliffy/commit/f2c6bea))
- **command:** fix shell completion bug which occurs when an option has only one
  flag ([9fbef68](https://github.com/c4spar/deno-cliffy/commit/9fbef68))
- **command:** fix shell completion bug which occurs when the conflicts option
  is defined without dashes
  ([2dfa8b1](https://github.com/c4spar/deno-cliffy/commit/2dfa8b1))
- **command:** default command 'help' not found error on completions command
  ([580bacd](https://github.com/c4spar/deno-cliffy/commit/580bacd))
- **command:** fix typo in error message
  ([2fa9d29](https://github.com/c4spar/deno-cliffy/commit/2fa9d29))

### Code Refactoring

- use stripColor from deno/std
  ([56bcc89](https://github.com/c4spar/deno-cliffy/commit/56bcc89))

### Style

- **command:** fix jsdoc formatting
  ([230cac7](https://github.com/c4spar/deno-cliffy/commit/230cac7))

### Chore

- fix test workflow name
  ([0e683c1](https://github.com/c4spar/deno-cliffy/commit/0e683c1))
- use deno fmt for code formatting (#71)
  ([e7dd856](https://github.com/c4spar/deno-cliffy/commit/e7dd856))
- **ci:** run shellcheck on bash/zsh completion scripts (#79)
  ([40f2dc9](https://github.com/c4spar/deno-cliffy/commit/40f2dc9))
- **ci:** add deno lint step
  ([e48f293](https://github.com/c4spar/deno-cliffy/commit/e48f293))
- **ci:** split workflows, add nightly test and lint workflow (#72)
  ([d13af64](https://github.com/c4spar/deno-cliffy/commit/d13af64))
- **ci:** update deno version to v1.3.2
  ([a8d6a60](https://github.com/c4spar/deno-cliffy/commit/a8d6a60))
- **lint:** fix lint errors
  ([25d8e24](https://github.com/c4spar/deno-cliffy/commit/25d8e24),
  [92c84ac](https://github.com/c4spar/deno-cliffy/commit/92c84ac))
- **upgrade:** deno/std v0.67.0
  ([43204a5](https://github.com/c4spar/deno-cliffy/commit/43204a5))

### Documentation Updates

- add contribution guidelines (#73)
  ([afe47ff](https://github.com/c4spar/deno-cliffy/commit/afe47ff))

# [v0.13.0](https://github.com/c4spar/deno-cliffy/compare/v0.12.1...v0.13.0) (2020-08-25)

### Features

- **prompt:** add support for prompt list and dynamic prompts
  ([6968c1d](https://github.com/c4spar/deno-cliffy/commit/6968c1d))

### Bug Fixes

- **flags:** standalone parameter incompatible with dashed parameter which has a
  default value
  ([1aa9b55](https://github.com/c4spar/deno-cliffy/commit/1aa9b55))
- **prompt:** cursor not visible after error
  ([1de8a84](https://github.com/c4spar/deno-cliffy/commit/1de8a84))

### Performance Improvements

- **command,flags:** implement simple camel-case and remove param-case and
  snake-case methods to improve performance
  ([20dc077](https://github.com/c4spar/deno-cliffy/commit/20dc077),
  [4587284](https://github.com/c4spar/deno-cliffy/commit/4587284))

### Code Refactoring

- remove format utils method
  ([2496431](https://github.com/c4spar/deno-cliffy/commit/2496431))
- refactor project structure for url friendly imports
  ([8b5fbdd](https://github.com/c4spar/deno-cliffy/commit/8b5fbdd))
- **ansi-escape:** add return types
  ([2bb165c](https://github.com/c4spar/deno-cliffy/commit/2bb165c))
- **command:** re-export flag types in command module and some refactorings
  ([05b3c9e](https://github.com/c4spar/deno-cliffy/commit/05b3c9e))
- **command:** refactor error message
  ([6f6e750](https://github.com/c4spar/deno-cliffy/commit/6f6e750))
- **command:** remove some helper methods: write, writeError, log, logError from
  command class
  ([88bdc95](https://github.com/c4spar/deno-cliffy/commit/88bdc95))
- **command:** refactor completions command description and disable
  unimplemented bash completions command
  ([a181cbb](https://github.com/c4spar/deno-cliffy/commit/a181cbb))
- **command:** add version option only if version is set
  ([32e6687](https://github.com/c4spar/deno-cliffy/commit/32e6687))
- **prompt:** remove read-line module and move methods to generic prompt class
  ([dd1de10](https://github.com/c4spar/deno-cliffy/commit/dd1de10))

### Style

- **ansi-escape:** add semicolons
  ([7ed6424](https://github.com/c4spar/deno-cliffy/commit/7ed6424))

### Chore

- **ci:** update deno version to v1.3.1 (#62)
  ([1cff32b](https://github.com/c4spar/deno-cliffy/commit/1cff32b))
- **deno:** update deno/std to v0.66.0 (#63)
  ([5c27a4b](https://github.com/c4spar/deno-cliffy/commit/5c27a4b))

### Documentation Updates

- update readmes (#67)
  ([811e310](https://github.com/c4spar/deno-cliffy/commit/811e310))
- **command:** update examples
  ([f42d15f](https://github.com/c4spar/deno-cliffy/commit/f42d15f))

### BREAKING CHANGES

- **command:** refactor external sub-commands (#66)
  ([6181747](https://github.com/c4spar/deno-cliffy/commit/6181747))

  Following line no longer registers an external command.

      ```typescript
      new Command()
        .command("sub-command", "description..."); //

      // is same as
      new Command()
        .command("sub-command")
        .description("description...");
      ```

  To register an external command you have to use the `.external()` method for
  now.

      ```typescript
      new Command()
        .command("sub-command", "description...")
        .external();

      // is same as
      new Command()
        .command("sub-command")
        .description("description...")
        .external();
      ```

- **command,flags:** refactor type handler
  ([bf12441](https://github.com/c4spar/deno-cliffy/commit/bf12441))

  To make types compatible with environment variable and arguments the arguments
  of the type handler has changed from:

      ```typescript
      const myType: ITypeHandler<number> = (
        option: IFlagOptions,
        arg: IFlagArgument,
        value: string,
      ): number => {};
      ```

  to:

      ```typescript
      const myType: ITypeHandler<number> = (
        { label, name, value, type }: ITypeInfo,
      ): number => {};
      ```

  This makes it possible to write a single error messages for different
  contexts.

      ```typescript
      throw new Error(`${label} ${name} must be of type ${type} but got: ${value}`);
      ```

  For options the error message will be:
  `Option --my-option must be of type number but got: abc` For environment
  variables the error message will be:
  `Environment variable MY_ENV_VAR must be of type number but got: abc` For
  arguments the error message will be:
  `Argument my-argument must be of type number but got: abc`

- **command,flags:** rename some types
  ([0645313](https://github.com/c4spar/deno-cliffy/commit/0645313))

  - ICompletionSettings -> ICompletion
  - IArgumentDetails -> IArgument
  - ITypeOption -> ITypeOptions
  - ITypeSettings -> ITypeInfo
  - IEnvVariable -> IEnvVar
  - IEnvVarOption -> IEnvVarOptions

- **table:** rename min/maxCellWidth to min/maxColWidth (#65)
  ([c75b94c](https://github.com/c4spar/deno-cliffy/commit/c75b94c))

# [v0.12.1](https://github.com/c4spar/deno-cliffy/compare/v0.12.0...v0.12.1) (2020-08-03)

### Bug Fixes

- remove "v" prefix from deno std url (#57)
  ([10c951a](https://github.com/c4spar/deno-cliffy/commit/10c951a))

# [v0.12.0](https://github.com/c4spar/deno-cliffy/compare/v0.11.2...v0.12.0) (2020-08-01)

### Features

- **table:** add support for `rowSpan`
  ([9c05cc3](https://github.com/c4spar/deno-cliffy/commit/9c05cc3))
- **table:** add support for `colSpan`
  ([bb6cae9](https://github.com/c4spar/deno-cliffy/commit/bb6cae9))
- **table:** add `.fromJson()` method
  ([4be3edd](https://github.com/c4spar/deno-cliffy/commit/4be3edd))
- **table:** add support for enabling and disabling border per row and cell
  ([d62182d](https://github.com/c4spar/deno-cliffy/commit/d62182d))
- **table:** add `.body()` method to `Table`
  ([2526ff2](https://github.com/c4spar/deno-cliffy/commit/2526ff2))
- **table:** make border chars customizable
  ([866b71e](https://github.com/c4spar/deno-cliffy/commit/866b71e))

### Bug Fixes

- **keycode:** `KeyCode.parse(data)` captures only the first character (#54)
  ([f153909](https://github.com/c4spar/deno-cliffy/commit/f153909))
- **prompt:** pasting clipboard into prompt returns corrupted data (#54)
  ([5de866c](https://github.com/c4spar/deno-cliffy/commit/5de866c))
- **prompt:** show option name instead of value as result with select and
  checkbox prompt (#53)
  ([1d81235](https://github.com/c4spar/deno-cliffy/commit/1d81235))
- **prompt:** cursor not visible after exiting with `ctrl + c`
  ([110a07e](https://github.com/c4spar/deno-cliffy/commit/110a07e))
- **table:** remove trailing line break from `.toString()` method
  ([3af8850](https://github.com/c4spar/deno-cliffy/commit/3af8850))

### Code Refactoring

- **table:** set default table padding to `1`
  ([a6e6aa3](https://github.com/c4spar/deno-cliffy/commit/a6e6aa3))
- **table:** reformat table
  ([16ae13d](https://github.com/c4spar/deno-cliffy/commit/16ae13d))
- **table:** add `TableLayout` class
  ([699c0d1](https://github.com/c4spar/deno-cliffy/commit/699c0d1))
- **table:** refactor `.from()` and `.clone()` methods
  ([ddee9d7](https://github.com/c4spar/deno-cliffy/commit/ddee9d7))

### Chore

- **ci:** update deno version to v1.2.2
  ([3dd48e0](https://github.com/c4spar/deno-cliffy/commit/3dd48e0),
  [90f670a](https://github.com/c4spar/deno-cliffy/commit/90f670a))
- **nest:** update version to v0.12.0
  ([6e212a2](https://github.com/c4spar/deno-cliffy/commit/6e212a2))
- **deno**: update deno/std version to v0.63.0
  ([82c3eae](https://github.com/c4spar/deno-cliffy/commit/82c3eae),
  [adc84c4](https://github.com/c4spar/deno-cliffy/commit/adc84c4))

### Unit/Integration Tests

- **table:** add colspan and rowspan tests
  ([d8df570](https://github.com/c4spar/deno-cliffy/commit/d8df570))

### Documentation Updates

- fix license link
  ([96988d2](https://github.com/c4spar/deno-cliffy/commit/96988d2))
- **changelog:** fix changelog versions
  ([6e71754](https://github.com/c4spar/deno-cliffy/commit/6e71754))
- **keycode:** update keycode example
  ([ae01931](https://github.com/c4spar/deno-cliffy/commit/ae01931))
- **table:** update readme and examples
  ([e837b71](https://github.com/c4spar/deno-cliffy/commit/e837b71),
  [df18516](https://github.com/c4spar/deno-cliffy/commit/df18516))

# [v0.11.2](https://github.com/c4spar/deno-cliffy/compare/v0.11.1...v0.11.2) (2020-07-22)

### Features

- **prompt:** add support for custom keys
  ([5df1f95](https://github.com/c4spar/deno-cliffy/commit/5df1f95))

### Code Refactoring

- **prompt:** add fallback keys for unsupported keys on windows (#47)
  ([71f54f5](https://github.com/c4spar/deno-cliffy/commit/71f54f5))
- **prompt:** extend Toggle prompt from GenericPrompt (#50)
  ([cfe2064](https://github.com/c4spar/deno-cliffy/commit/cfe2064))

# [v0.11.1](https://github.com/c4spar/deno-cliffy/compare/v0.11.0...v0.11.1) (2020-07-15)

### Bug Fixes

- **prompt:** fix default value (#48)
  ([805f5a1](https://github.com/c4spar/deno-cliffy/commit/805f5a1))

# [v0.11.0](https://github.com/c4spar/deno-cliffy/compare/v0.10.0...v0.11.0) (2020-07-14)

### Features

- **command:** add `.versionOption()` and `.helpOption()` methods
  ([85d66b9](https://github.com/c4spar/deno-cliffy/commit/85d66b9))

### Code Refactoring

- remove `IGenericObject` interface
  ([e3c8660](https://github.com/c4spar/deno-cliffy/commit/e3c8660))
- **command:** remove `OptionType` type from `IArgumentDetails`
  ([c8dc229](https://github.com/c4spar/deno-cliffy/commit/c8dc229))
- **command:** refactor `ICommandOption` interface
  ([88263b5](https://github.com/c4spar/deno-cliffy/commit/88263b5))

### Chore

- **deno:** update deno/std to v0.61.0 and deno ci version to v1.2.0 (#45)
  ([f23da64](https://github.com/c4spar/deno-cliffy/commit/f23da64))
- **nest:** add `egg.yaml` config
  ([f8447cc](https://github.com/c4spar/deno-cliffy/commit/f8447cc))

### Unit/Integration Tests

- **command:** fix depends test
  ([9ec513c](https://github.com/c4spar/deno-cliffy/commit/9ec513c))

### Documentation Updates

- **command:** fix options type in action handler examples (#44)
  ([d661cc4](https://github.com/c4spar/deno-cliffy/commit/d661cc4))

# [v0.10.0](https://github.com/c4spar/deno-cliffy/compare/v0.9.0...v0.10.0) (2020-06-30)

### Breaking Changes

- **command:** remove `BaseCommand` class (#27)
  ([029aac5](https://github.com/c4spar/deno-cliffy/commit/029aac5),
  [2bc4660](https://github.com/c4spar/deno-cliffy/commit/2bc4660))

  All commands have to be created with the `Command` class for now. The `help`
  and `completions` commands are now optional and can be registered as
  descripted in the example below. The `--help` and `--version` option will be
  registered only on the main command for now. The `--help` option is a global
  option and available on all child-commands.

      ```typescript
      import {
        Command,
        CompletionsCommand,
        HelpCommand,
      } from "https://deno.land/x/cliffy/command.ts";

      await new Command()
        .command("help", new HelpCommand())
        .command("completions", new CompletionsCommand())
        .parse();
      ```

- **command:** remove optional argument from boolean flags which was registered
  per default (#40)
  ([94ea644](https://github.com/c4spar/deno-cliffy/commit/94ea644))

  An option defined with `.option('-d, --debug', '...')` has no longer an
  boolean argument per default. To add an boolean argument you have add the
  argument explicitly with `.option('-d, --debug [arg:boolean]', '...')`

- **flags:** remove optional argument from boolean flags which was registered
  per default (#40)
  ([00ac846](https://github.com/c4spar/deno-cliffy/commit/00ac846))

  A boolean flag no longer has an optional value per default. To add an optional
  or required value use the `optionalValue` or `requiredValue` option.

### Features

- **command:** add `prepend` option to `.option()` method
  ([5164692](https://github.com/c4spar/deno-cliffy/commit/5164692))
- **command:** add `.getGlobalParent()` method
  ([a1d61c9](https://github.com/c4spar/deno-cliffy/commit/a1d61c9))
- **command:** pass command to completion handler
  ([1e8d51b](https://github.com/c4spar/deno-cliffy/commit/1e8d51b))
- **command:** add support for function as description parameter
  ([8dfe004](https://github.com/c4spar/deno-cliffy/commit/8dfe004))
- **command:** add `.getParent()` and `.getMainCommand()` methods
  ([1a900be](https://github.com/c4spar/deno-cliffy/commit/1a900be))
- **command:** make executed command accessible with `this` in action handler
  (#28) ([461145f](https://github.com/c4spar/deno-cliffy/commit/461145f))
- **flags:** add support for shorthand flags with value e.g. `-n5` results in
  `{n: 5}` but `-abc` will still result in `{a: true, b: true, c: true}`
  ([775c528](https://github.com/c4spar/deno-cliffy/commit/775c528))
- **flags:** add support for equal sign in flags e.g. `--foo=bar`
  ([53ba110](https://github.com/c4spar/deno-cliffy/commit/53ba110))

### Bug Fixes

- **command:** `getGlobal*` methods does not return all globals
  ([c7f5a5a](https://github.com/c4spar/deno-cliffy/commit/c7f5a5a))
- **prompt:** hide cursor in `Secret` prompt only if `hidden` is enabled
  ([5ebf343](https://github.com/c4spar/deno-cliffy/commit/5ebf343))

### Code Refactoring

- **command:** refactor help command
  ([6269e1b](https://github.com/c4spar/deno-cliffy/commit/6269e1b),
  [d3c2fa1](https://github.com/c4spar/deno-cliffy/commit/d3c2fa1))
- **command:** remove `DefaultCommand` class (#27)
  ([9e3913c](https://github.com/c4spar/deno-cliffy/commit/9e3913c),
  [9cdc2d2](https://github.com/c4spar/deno-cliffy/commit/9cdc2d2))
- **command:** make command properties private
  ([7d5e318](https://github.com/c4spar/deno-cliffy/commit/7d5e318))
- **command:** don't reset child commands with `.reset()` method
  ([ba85b2a](https://github.com/c4spar/deno-cliffy/commit/ba85b2a))
- **command:** refactor completions command
  ([5e07fff](https://github.com/c4spar/deno-cliffy/commit/5e07fff))
- **command:** add `ArgumentsParser` util class
  ([c30e474](https://github.com/c4spar/deno-cliffy/commit/c30e474))
- **command:** pass parent command to completion handler
  ([8e4167f](https://github.com/c4spar/deno-cliffy/commit/8e4167f))
- **command:** make `.complete()` method optional in custom types
  ([53a9af7](https://github.com/c4spar/deno-cliffy/commit/53a9af7))
- **prompt:** remove generic options from `Select` prompt
  ([a694881](https://github.com/c4spar/deno-cliffy/commit/a694881))
- **prompt:** remove unused `Separator` class
  ([31b41e4](https://github.com/c4spar/deno-cliffy/commit/31b41e4))

### Chore

- **ci:** update deno version to v1.1.2
  ([57741b0](https://github.com/c4spar/deno-cliffy/commit/57741b0),
  [5517a7e](https://github.com/c4spar/deno-cliffy/commit/5517a7e))

### Documentation Updates

- **command:** update readme and examples
  ([0918d76](https://github.com/c4spar/deno-cliffy/commit/0918d76),
  [9b76c92](https://github.com/c4spar/deno-cliffy/commit/9b76c92),
  [ae371d9](https://github.com/c4spar/deno-cliffy/commit/ae371d9),
  [fe9e06c](https://github.com/c4spar/deno-cliffy/commit/fe9e06c),
  [ddd8208](https://github.com/c4spar/deno-cliffy/commit/ddd8208))
- **flags:** update readme and examples
  ([5ed1ec7](https://github.com/c4spar/deno-cliffy/commit/5ed1ec7))
- **prompt:** update readme and examples
  ([edfae8b](https://github.com/c4spar/deno-cliffy/commit/edfae8b))

# [v0.9.0](https://github.com/c4spar/deno-cliffy/compare/v0.8.2...v0.9.0) (2020-06-05)

### Features

- **command:** implement `.stopEarly()` method (#39)
  ([45f28e7](https://github.com/c4spar/deno-cliffy/commit/45f28e7))
- **command:** add `.getRawArgs()` method
  ([4f18db7](https://github.com/c4spar/deno-cliffy/commit/4f18db7))
- **command:** return `literal` arguments in `.parse()` method and add
  `.getLiteralArgs()` method (#26)
  ([385f38f](https://github.com/c4spar/deno-cliffy/commit/385f38f))
- **flags:** implement `stopEarly` option (#39)
  ([ee683d3](https://github.com/c4spar/deno-cliffy/commit/ee683d3))
- **prompt:** add `minOptions` and `maxOptions` options to `Checkbox` prompt
  (#38) ([0980b42](https://github.com/c4spar/deno-cliffy/commit/0980b42))
- **prompt:** add `minLength`, `maxLength`, `minTags` and `maxTags` option to
  `List` prompt (#37)
  ([6836a7d](https://github.com/c4spar/deno-cliffy/commit/6836a7d))
- **prompt:** add `label` option to `Secret` prompt
  ([9127471](https://github.com/c4spar/deno-cliffy/commit/9127471))
- **prompt:** add `minLength` and `maxLength` to `Input` and `Secret` prompts
  (#36) ([2b13fab](https://github.com/c4spar/deno-cliffy/commit/2b13fab))
- **prompt:** add secret prompt (#35)
  ([9aaa740](https://github.com/c4spar/deno-cliffy/commit/9aaa740))

### Chore

- **ci:** update deno version to v1.0.5
  ([bb2eb25](https://github.com/c4spar/deno-cliffy/commit/bb2eb25))

# [v0.8.2](https://github.com/c4spar/deno-cliffy/compare/v0.8.1...v0.8.2) (2020-05-30)

### Bug Fixes

- **table:** table fails if word is longer than maxCellWidth (#34)
  ([b6c5f07](https://github.com/c4spar/deno-cliffy/commit/b6c5f07))

### Code Refactoring

- **prompt:** remove `undefined` return type from `.prompt()` methods (#25)
  ([15f707a](https://github.com/c4spar/deno-cliffy/commit/15f707a))
- **table:** remove unused method
  ([6d00cc3](https://github.com/c4spar/deno-cliffy/commit/6d00cc3))

# [v0.8.1](https://github.com/c4spar/deno-cliffy/compare/v0.8.0...v0.8.1) (2020-05-29)

### Bug Fixes

- **prompt:** ignore ctrl and meta keys in input prompts
  ([1f266b6](https://github.com/c4spar/deno-cliffy/commit/1f266b6))
- **prompt:** `c` character is not working in input prompts
  ([a0d6545](https://github.com/c4spar/deno-cliffy/commit/a0d6545))

# [v0.8.0](https://github.com/c4spar/deno-cliffy/compare/v0.7.1...v0.8.0) (2020-05-29)

### Features

- **command:** add support for global and hidden environment variables
  ([9e98940](https://github.com/c4spar/deno-cliffy/commit/9e98940))
- **command:** add support for global commands
  ([ec42c7a](https://github.com/c4spar/deno-cliffy/commit/ec42c7a))
- **command:** add support for global completions
  ([1d814e2](https://github.com/c4spar/deno-cliffy/commit/1d814e2))
- **command:** add support for global types
  ([91c1569](https://github.com/c4spar/deno-cliffy/commit/91c1569))
- **command:** add support for global options (#2)
  ([7d6e7cf](https://github.com/c4spar/deno-cliffy/commit/7d6e7cf))
- **command:** make `args` parameter optional in `.parse()` method
  ([fabfd32](https://github.com/c4spar/deno-cliffy/commit/fabfd32))

### Code Refactoring

- **command:** remove `ICommandMap` interface
  ([eb3f578](https://github.com/c4spar/deno-cliffy/commit/eb3f578))

# [v0.7.1](https://github.com/c4spar/deno-cliffy/compare/v0.7.0...v0.7.1) (2020-05-24)

### Bug Fixes

- **command:** help command fails with registered environment variables (#31)
  ([b176bd4](https://github.com/c4spar/deno-cliffy/commit/b176bd4))

### Chore

- **ci:** tests in `packages/command/test/command` were not executed
  ([2436fd2](https://github.com/c4spar/deno-cliffy/commit/2436fd2))

# [v0.7.0](https://github.com/c4spar/deno-cliffy/compare/v0.6.1...v0.7.0) (2020-05-22)

### Features

- **command:** add support for hidden options #23
  ([42f701f](https://github.com/c4spar/deno-cliffy/commit/42f701f))
- **command:** add support for hidden commands #22
  ([1866b75](https://github.com/c4spar/deno-cliffy/commit/1866b75))
- **command:** add `.getHelp()` method to `HelpCommand`
  ([9b96d10](https://github.com/c4spar/deno-cliffy/commit/9b96d10))
- **command:** add `.name()` method and refactor internal name and path handling
  (#21) ([362d8ea](https://github.com/c4spar/deno-cliffy/commit/362d8ea))
- **command:** make arguments generic
  ([8a153a7](https://github.com/c4spar/deno-cliffy/commit/8a153a7))
- **command,flags:** make options generic
  ([09a3d00](https://github.com/c4spar/deno-cliffy/commit/09a3d00))

### Bug Fixes

- **command:** environment variables are always invalid
  ([fa131eb](https://github.com/c4spar/deno-cliffy/commit/fa131eb))
- **command:** separator option is ignored
  ([0405244](https://github.com/c4spar/deno-cliffy/commit/0405244))
- **command:** default option incompatible with standalone option
  ([e9e6aa5](https://github.com/c4spar/deno-cliffy/commit/e9e6aa5))
- **command:** depends info is not shown in help output
  ([0e2e860](https://github.com/c4spar/deno-cliffy/commit/0e2e860))
- **command,keycode:** `CLIFFY_DEBUG` does not work
  ([4e90d77](https://github.com/c4spar/deno-cliffy/commit/4e90d77))
- **flags:** standalone option could be combined with options whose value is
  optional and has a default value
  ([5cd8287](https://github.com/c4spar/deno-cliffy/commit/5cd8287))
- **flags:** standalone option could be combined with another standalone option
  ([cb91b85](https://github.com/c4spar/deno-cliffy/commit/cb91b85))
- **keycode:** fix compile error which happened with deno v1.0.1
  ([dcfa470](https://github.com/c4spar/deno-cliffy/commit/dcfa470))
- **keycode:** remove doublicate export of `IGenericObject`
  ([28fd483](https://github.com/c4spar/deno-cliffy/commit/28fd483))

### Code Refactoring

- use encoding/utf8 for text encoding
  ([81d4b04](https://github.com/c4spar/deno-cliffy/commit/81d4b04))

### Chore

- **ci:** fix typo
  ([33ca82c](https://github.com/c4spar/deno-cliffy/commit/33ca82c))
- **ci:** update deno version to v1.0.1
  ([2f25d8b](https://github.com/c4spar/deno-cliffy/commit/2f25d8b),
  [fd98c80](https://github.com/c4spar/deno-cliffy/commit/fd98c80),
  [15f55ae](https://github.com/c4spar/deno-cliffy/commit/15f55ae))
- **deno:** update deno/std to v0.52.0
  ([4b354cd](https://github.com/c4spar/deno-cliffy/commit/4b354cd))

### Documentation Updates

- fix issues link
  ([c64282e](https://github.com/c4spar/deno-cliffy/commit/c64282e))
- **command:** add executable example commands
  ([8fbe263](https://github.com/c4spar/deno-cliffy/commit/8fbe263))
- **command:** add documentation and examples for hidden commands and options
  ([0c2f400](https://github.com/c4spar/deno-cliffy/commit/0c2f400))
- **command:** add generic types example and documentation
  ([0998f55](https://github.com/c4spar/deno-cliffy/commit/0998f55))
- **prompt:** fix prompt example
  ([90f8595](https://github.com/c4spar/deno-cliffy/commit/90f8595))

### BREAKING CHANGES

- **command:** rename `IFlagsParseResult` to `IParseResult`
  ([eaeb634](https://github.com/c4spar/deno-cliffy/commit/eaeb634))

# [v0.6.1](https://github.com/c4spar/deno-cliffy/compare/v0.6.0...v0.6.1) (2020-05-12)

### Bug Fixes

- add missing entry files and module exports for prompt & keycode module #19
  ([f16863d](https://github.com/c4spar/deno-cliffy/commit/f16863d))

# [v0.6.0](https://github.com/c4spar/deno-cliffy/compare/v0.5.1...v0.6.0) (2020-05-11)

### Code Refactoring

- **command:** make commands executable without --allow-env flag #11
  ([03117ed](https://github.com/c4spar/deno-cliffy/commit/03117ed))
- **x:** make format executable without --allow-env flag #11
  ([2db057e](https://github.com/c4spar/deno-cliffy/commit/2db057e))

### Chore

- add support for deno v1.0.0-rc2
  ([acb84e1](https://github.com/c4spar/deno-cliffy/commit/acb84e1))

### Documentation Updates

- update readmes
  ([7e549c9](https://github.com/c4spar/deno-cliffy/commit/7e549c9))

### BREAKING CHANGES

- **prompt:** prompt requires the --unstable flag to work with deno >= v0.42.0
  ([6cd9d3f](https://github.com/c4spar/deno-cliffy/commit/6cd9d3f))

# [v0.5.1](https://github.com/c4spar/deno-cliffy/compare/v0.5.0...v0.5.1) (2020-05-03)

### Bug Fixes

- **flags:** default option incompatible with depends option and boolean flags
  ([b76a9a7](https://github.com/c4spar/deno-cliffy/commit/b76a9a7))

# [v0.5.0](https://github.com/c4spar/deno-cliffy/compare/v0.4.0...v0.5.0) (2020-05-03)

### Features

- **ansi-escape:** add `ansi escape` module (#1)
  ([0ac92c2](https://github.com/c4spar/deno-cliffy/commit/0ac92c2))
- **keycode:** add `keycode` module
  ([f61d033](https://github.com/c4spar/deno-cliffy/commit/f61d033),
  [3be5b72](https://github.com/c4spar/deno-cliffy/commit/3be5b72),
  [9869720](https://github.com/c4spar/deno-cliffy/commit/9869720))
- **prompt:** add `prompt` module (#4)
  ([df2221e](https://github.com/c4spar/deno-cliffy/commit/df2221e))

### Code Refactoring

- use explicit version of deno std modules
  ([fcdf97a](https://github.com/c4spar/deno-cliffy/commit/fcdf97a))
- use utf8 encoding module instead of `TextEncoder` for text encoding
  ([b29e1ba](https://github.com/c4spar/deno-cliffy/commit/b29e1ba))
- **command:** use new `Table` class in help command
  ([5f203d1](https://github.com/c4spar/deno-cliffy/commit/5f203d1))

### Chore

- add support for deno v0.42.0
  ([d860d3a](https://github.com/c4spar/deno-cliffy/commit/d860d3a),
  [db61141](https://github.com/c4spar/deno-cliffy/commit/db61141),
  [cddb7d1](https://github.com/c4spar/deno-cliffy/commit/cddb7d1),
  [83c767c](https://github.com/c4spar/deno-cliffy/commit/83c767c),
  [e0ff7b5](https://github.com/c4spar/deno-cliffy/commit/e0ff7b5),
  [c8af716](https://github.com/c4spar/deno-cliffy/commit/c8af716))

### Documentation Updates

- update `README.md`
  ([fcf1402](https://github.com/c4spar/deno-cliffy/commit/fcf1402))
- **command:** update `README.md`
  ([7434f79](https://github.com/c4spar/deno-cliffy/commit/7434f79))
- **table:** add table examples
  ([e7c1761](https://github.com/c4spar/deno-cliffy/commit/e7c1761))

### BREAKING CHANGES

- **table:** rewrite table module
  ([65988b7](https://github.com/c4spar/deno-cliffy/commit/65988b7))

  Old table methods like `table` and `renderTable` are replaced by the new
  `Table` class.

# [v0.4.0](https://github.com/c4spar/deno-cliffy/compare/v0.3.0...v0.4.0) (2020-04-04)

### Features

- **command:** add zsh completions support
  ([9493d90](https://github.com/c4spar/deno-cliffy/commit/9493d90),
  [f54d3a2](https://github.com/c4spar/deno-cliffy/commit/f54d3a2))
- **command:** add `complete` sub-command to `completions` command
  ([fb63ec7](https://github.com/c4spar/deno-cliffy/commit/fb63ec7))
- **command:** add complete method for custom auto completions
  ([7d5d25e](https://github.com/c4spar/deno-cliffy/commit/7d5d25e),
  [9406a84](https://github.com/c4spar/deno-cliffy/commit/9406a84),
  [5ce209d](https://github.com/c4spar/deno-cliffy/commit/5ce209d))
- **command:** complete command names on help command
  ([5897be1](https://github.com/c4spar/deno-cliffy/commit/5897be1))
- **command:** add `action` type
  ([164585e](https://github.com/c4spar/deno-cliffy/commit/164585e))
- **command:** add `command` type
  ([2b9608c](https://github.com/c4spar/deno-cliffy/commit/2b9608c))
- **command:** add autocompletion for types
  ([16d5237](https://github.com/c4spar/deno-cliffy/commit/16d5237))
- **flags:** support method as option default value
  ([ce09421](https://github.com/c4spar/deno-cliffy/commit/ce09421))
- **table:** add `border` option
  ([a785164](https://github.com/c4spar/deno-cliffy/commit/a785164))

### Bug Fixes

- **flags:** fix default value
  ([0244b50](https://github.com/c4spar/deno-cliffy/commit/0244b50))

### Code Refactoring

- **command:** export default types
  ([34fcddd](https://github.com/c4spar/deno-cliffy/commit/34fcddd))
- **command:** make `complete` method in custom type classes optional.
  ([253cd74](https://github.com/c4spar/deno-cliffy/commit/253cd74))
- **command:** update `completions` description
  ([a3c5c72](https://github.com/c4spar/deno-cliffy/commit/a3c5c72))
- **flags:** refactor `validateFlags` method
  ([2b51730](https://github.com/c4spar/deno-cliffy/commit/2b51730))
- **flags:** refactor `getOptions` method
  ([3927c36](https://github.com/c4spar/deno-cliffy/commit/3927c36))

### Chore

- add support for deno v0.39.0
  ([d828f0c](https://github.com/c4spar/deno-cliffy/commit/d828f0c))
- **license:** update copyright
  ([8264b1a](https://github.com/c4spar/deno-cliffy/commit/8264b1a))

### Unit/Integration Tests

- **command:** update sub-command test
  ([0939b6d](https://github.com/c4spar/deno-cliffy/commit/0939b6d))
- **command,flags:** don't call `Deno.runTests()` in tests
  ([57f3a34](https://github.com/c4spar/deno-cliffy/commit/57f3a34))
- **flags:** refactor tests
  ([cf97a15](https://github.com/c4spar/deno-cliffy/commit/cf97a15),
  [c021659](https://github.com/c4spar/deno-cliffy/commit/c021659))
- **flags:** add value test
  ([6e3bc57](https://github.com/c4spar/deno-cliffy/commit/6e3bc57))
- **flags:** add default value test
  ([2fbfd54](https://github.com/c4spar/deno-cliffy/commit/2fbfd54))
- **flags:** add collect test
  ([3c14011](https://github.com/c4spar/deno-cliffy/commit/3c14011))

### Documentation Updates

- **command:** update `README.md`
  ([c7ff502](https://github.com/c4spar/deno-cliffy/commit/c7ff502),
  [4eaed60](https://github.com/c4spar/deno-cliffy/commit/4eaed60))
- **command:** add custom type examples
  ([290d24d](https://github.com/c4spar/deno-cliffy/commit/290d24d))

### BREAKING CHANGES

- **command,flags:** rename `requires` option to `depends`
  ([c937466](https://github.com/c4spar/deno-cliffy/commit/c937466))

  To define depending options you have tu use the options `depends` instead of
  `requires` now.

- **command,flags:** call `parseValue` only if the flag has a value
  ([ab5ba30](https://github.com/c4spar/deno-cliffy/commit/ab5ba30))

  Change type of `value` param from `Type.parse()` method from `string | false`
  to `string`

# [v0.3.0](https://github.com/c4spar/deno-cliffy/compare/v0.2.0...v0.3.0) (2020-03-31)

### Features

- add support for deno v0.38.0
  ([80d7ba4](https://github.com/c4spar/deno-cliffy/commit/80d7ba4),
  [9824899](https://github.com/c4spar/deno-cliffy/commit/9824899),
  [26b58be](https://github.com/c4spar/deno-cliffy/commit/26b58be))
- **command:** add support for custom type classes
  ([7006a67](https://github.com/c4spar/deno-cliffy/commit/7006a67))
- **flags:** add `parse` and remove `types` option to simplify custom types
  ([d1bc510](https://github.com/c4spar/deno-cliffy/commit/d1bc510))

### Bug Fixes

- **command:** suppress `Missing argument(s)` error for standalone options
  ([47b162e](https://github.com/c4spar/deno-cliffy/commit/47b162e))
- **command:** fix `IArgumentDetails` and `IOption` interface
  ([52193e5](https://github.com/c4spar/deno-cliffy/commit/52193e5))

### Code Refactoring

- **command:** change type of commands from Array to Map
  ([52f7e1f](https://github.com/c4spar/deno-cliffy/commit/52f7e1f))
- **command:** refactor sub-command helper methods
  ([d6d1b05](https://github.com/c4spar/deno-cliffy/commit/d6d1b05))
- **command:** refactor internal args handling and add some args helper methods
  ([957347e](https://github.com/c4spar/deno-cliffy/commit/957347e))

### Documentation Updates

- update `README.md`
  ([bee4767](https://github.com/c4spar/deno-cliffy/commit/bee4767),
  [d779851](https://github.com/c4spar/deno-cliffy/commit/d779851),
  [063905d](https://github.com/c4spar/deno-cliffy/commit/063905d),
  [4fc534d](https://github.com/c4spar/deno-cliffy/commit/4fc534d))
- **flags:** update `README.md`
  ([3a9a2a4](https://github.com/c4spar/deno-cliffy/commit/3a9a2a4))

# [v0.2.0](https://github.com/c4spar/deno-cliffy/compare/v0.1.0...v0.2.0) (2020-03-23)

### Features

- **command:** validate environment variables
  ([179ef30](https://github.com/c4spar/deno-cliffy/commit/179ef30))
- **command:** add support for custom types
  ([fbfea55](https://github.com/c4spar/deno-cliffy/commit/fbfea55))
- **flags:** add `parseFlagValue()` method
  ([1983bd1](https://github.com/c4spar/deno-cliffy/commit/1983bd1))

### Code Refactoring

- **command:** refactor `env()` method
  ([a1a3364](https://github.com/c4spar/deno-cliffy/commit/a1a3364))
- **command:** print help when the `completions` command is called without
  arguments ([b2c4f91](https://github.com/c4spar/deno-cliffy/commit/b2c4f91))
- **command:** update description of `completions` command
  ([5feeb77](https://github.com/c4spar/deno-cliffy/commit/5feeb77))
- **command:** update description of `help` command
  ([15a3fd5](https://github.com/c4spar/deno-cliffy/commit/15a3fd5))
- **command:** print only first line of description in options and command list
  ([8cf33a1](https://github.com/c4spar/deno-cliffy/commit/8cf33a1))
- **command:** exit program after help and version is printed
  ([05bc677](https://github.com/c4spar/deno-cliffy/commit/05bc677))
- **flags:** refactor `string` type
  ([6900462](https://github.com/c4spar/deno-cliffy/commit/6900462))
- **flags:** refactor `boolean` type
  ([10997f6](https://github.com/c4spar/deno-cliffy/commit/10997f6))
- **table:** refactor `table` method
  ([8228ac1](https://github.com/c4spar/deno-cliffy/commit/8228ac1))

### Documentation Updates

- **command:** add `README.md`
  ([e1d4b33](https://github.com/c4spar/deno-cliffy/commit/e1d4b33))
- **examples:** add examples
  ([d6917c7](https://github.com/c4spar/deno-cliffy/commit/d6917c7))
- **flags:** add `README.md`
  ([7c8a062](https://github.com/c4spar/deno-cliffy/commit/7c8a062))

# [v0.1.0](https://github.com/c4spar/deno-cliffy/compare/1031df6...v0.1.0) (2020-03-18)

- add entry points
  ([e86d44e](https://github.com/c4spar/deno-cliffy/commit/e86d44e))

### Features

- **command:** add `command` module
  ([3f95ec6](https://github.com/c4spar/deno-cliffy/commit/3f95ec6),
  [789faa3](https://github.com/c4spar/deno-cliffy/commit/789faa3),
  [bf3a20c](https://github.com/c4spar/deno-cliffy/commit/bf3a20c),
  [148c810](https://github.com/c4spar/deno-cliffy/commit/148c810),
  [d2faa96](https://github.com/c4spar/deno-cliffy/commit/d2faa96))
- **flags:** add `flags` module
  ([7eaab8b](https://github.com/c4spar/deno-cliffy/commit/7eaab8b))
- **table:** add `table` module
  ([e05aaa3](https://github.com/c4spar/deno-cliffy/commit/e05aaa3))

### Chore

- **ci:** add ci workflow
  ([410383a](https://github.com/c4spar/deno-cliffy/commit/410383a))
- **git:** add `.gitignore`
  ([bc704b4](https://github.com/c4spar/deno-cliffy/commit/bc704b4))

### Documentation Updates

- add `README.md`
  ([9a3d70c](https://github.com/c4spar/deno-cliffy/commit/9a3d70c),
  [4743c8b](https://github.com/c4spar/deno-cliffy/commit/4743c8b),
  [ca653ba](https://github.com/c4spar/deno-cliffy/commit/ca653ba),
  [54603d8](https://github.com/c4spar/deno-cliffy/commit/54603d8),
  [180eb3a](https://github.com/c4spar/deno-cliffy/commit/180eb3a),
  [f65941c](https://github.com/c4spar/deno-cliffy/commit/f65941c))
