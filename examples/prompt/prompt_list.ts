#!/usr/bin/env -S deno run

import { prompt, type PromptOptions } from "@cliffy/prompt";
import { Input } from "@cliffy/prompt/input";
import { Number } from "@cliffy/prompt/number";
import { Confirm } from "@cliffy/prompt/confirm";
import { Checkbox } from "@cliffy/prompt/checkbox";

const animalsPrompt: PromptOptions<
  "animals",
  typeof Checkbox,
  { name?: string }
> = {
  name: "animals",
  message: "Select some animals",
  type: Checkbox,
  options: ["dog", "cat", "snake"],
  before({ name }, next) {
    console.log("Name is:", name);
    return next();
  },
};

const result = await prompt([{
  name: "name",
  message: "What's your name?",
  type: Input,
}, {
  name: "age",
  message: "How old are you?",
  type: Number,
}, {
  name: "like",
  message: "Do you like animals?",
  type: Confirm,
}, animalsPrompt]);

console.log(result);
