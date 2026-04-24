/**
 * Interactive prompts with many different types, auto suggestions support and more
 * for [Deno](https://deno.com), [Node](https://nodejs.org) and
 * [Bun](https://bun.sh/).
 *
 * > [!NOTE]\
 * > The full documentation can be found at
 * > [cliffy.io](https://cliffy.io/docs/prompt).
 *
 * ## Usage
 *
 * ### Single Prompt
 *
 * Execute a single prompt:
 *
 * ```ts
 * import { Input } from "@cliffy/prompt/input";
 *
 * const name = await Input.prompt(`What's your name?`);
 * ```
 *
 * Execute a single prompt with an options object:
 *
 * ```ts
 * import { Input } from "@cliffy/prompt/input";
 *
 * const name = await Input.prompt({
 *   message: "Please create username",
 *   minLength: 8,
 * });
 * ```
 *
 * ### Prompt List
 *
 * Execute multiple prompts as a list:
 *
 * ```ts
 * import { prompt } from "@cliffy/prompt";
 * import { Confirm } from "@cliffy/prompt/confirm";
 * import { Input } from "@cliffy/prompt/input";
 * import { Secret } from "@cliffy/prompt/secret";
 *
 * const { username, password, remember } = await prompt([{
 *   name: "username",
 *   message: "Please enter your username",
 *   type: Input,
 * }, {
 *   name: "password",
 *   message: "Please enter your password",
 *   type: Secret,
 * }, {
 *   name: "remember",
 *   message: "Do you want to remember your login information?",
 *   type: Confirm,
 * }]);
 *
 * console.log({ username, password, remember });
 * ```
 *
 * @module
 */

export {
  type GenericPromptKeys,
  type GenericPromptOptions,
  type StaticGenericPrompt,
  type ValidateResult,
} from "./_generic_prompt.ts";
export {
  type GenericInputKeys,
  type GenericInputPromptOptions,
} from "./_generic_input.ts";
export {
  type GenericListKeys,
  type GenericListOption,
  type GenericListOptionGroup,
  type GenericListOptions,
} from "./_generic_list.ts";

export {
  Checkbox,
  type CheckboxKeys,
  type CheckboxOption,
  type CheckboxOptionGroup,
  type CheckboxOptions,
} from "./checkbox.ts";
export { Confirm, type ConfirmKeys, type ConfirmOptions } from "./confirm.ts";
export { Input, type InputKeys, type InputOptions } from "./input.ts";
export { List, type ListKeys, type ListOptions } from "./list.ts";
export { Number, type NumberKeys, type NumberOptions } from "./number.ts";
export { Secret, type SecretKeys, type SecretOptions } from "./secret.ts";
export {
  Select,
  type SelectKeys,
  type SelectOption,
  type SelectOptionGroup,
  type SelectOptions,
} from "./select.ts";
export { Toggle, type ToggleKeys, type ToggleOptions } from "./toggle.ts";

export {
  type GlobalPromptMiddleware,
  type GlobalPromptOptions,
  inject,
  type Next,
  prompt,
  type PromptMiddleware,
  type PromptOptions,
} from "./prompt.ts";
