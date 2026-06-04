import { test } from "@cliffy/internal/testing/test";
import { assertEquals, assertThrows } from "@std/assert";
import { parseFlags } from "../../flags.ts";
import type { ParseFlagsOptions } from "../../types.ts";

const options: ParseFlagsOptions = {
  allowEmpty: false,
  flags: [{
    name: "type",
    aliases: ["t"],
    type: "string",
    required: true,
    conflicts: ["video-type", "audio-type", "image-type"],
  }, {
    name: "video-type",
    aliases: ["v"],
    type: "string",
    required: true,
    depends: ["audio-type", "image-type"],
    conflicts: ["type"],
  }, {
    name: "audio-type",
    aliases: ["a"],
    type: "string",
    required: true,
    depends: ["video-type", "image-type"],
    conflicts: ["type"],
  }, {
    name: "image-type",
    aliases: ["i"],
    type: "string",
    required: true,
    depends: ["video-type", "audio-type"],
    conflicts: ["type"],
  }],
};

test("flags optionConflicts noArguments", () => {
  assertThrows(
    () => parseFlags([], options),
    Error,
    `Missing required option "--type".`,
  );
});

test("flags optionConflicts type", () => {
  const { flags, unknown, literal } = parseFlags(["-t", "value"], options);

  assertEquals(flags, { type: "value" });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("flags optionConflicts videoAudioImageType", () => {
  const { flags, unknown, literal } = parseFlags(
    ["-v", "value", "-a", "value", "--image-type", "value"],
    options,
  );

  assertEquals(
    flags,
    { videoType: "value", audioType: "value", imageType: "value" },
  );
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("flags optionConflicts videoTypeDependsOnImageType", () => {
  assertThrows(
    () => parseFlags(["-v", "value", "-a", "value"], options),
    Error,
    `Option "--video-type" depends on option "--image-type".`,
  );
});

const defaultValueOptions: ParseFlagsOptions = {
  flags: [{
    name: "json",
    type: "boolean",
    optionalValue: true,
    default: true,
  }, {
    name: "table",
    type: "boolean",
    optionalValue: true,
    conflicts: ["json"],
  }],
};

test("flags optionConflicts should not conflict with default value", () => {
  const { flags } = parseFlags(["--table"], defaultValueOptions);

  assertEquals(flags, { json: true, table: true });
});

test("flags optionConflicts should conflict with explicitly provided option", () => {
  assertThrows(
    () => parseFlags(["--json", "--table"], defaultValueOptions),
    Error,
    `Option "--table" conflicts with option "--json".`,
  );
});

test("flags optionConflicts should not throw for conflicts of an option with a default value", () => {
  const { flags } = parseFlags(["--json"], {
    flags: [{
      name: "json",
      type: "boolean",
      optionalValue: true,
    }, {
      name: "table",
      type: "boolean",
      optionalValue: true,
      default: true,
      conflicts: ["json"],
    }],
  });

  assertEquals(flags, { json: true, table: true });
});

test("flags optionConflicts should conflict with explicitly provided combined short flags", () => {
  const combinedShortFlagOptions: ParseFlagsOptions = {
    flags: [{
      name: "alpha",
      aliases: ["a"],
      type: "boolean",
      optionalValue: true,
      default: true,
    }, {
      name: "beta",
      aliases: ["b"],
      type: "boolean",
      optionalValue: true,
      conflicts: ["alpha"],
    }],
  };

  const { flags } = parseFlags(["-b"], combinedShortFlagOptions);
  assertEquals(flags, { alpha: true, beta: true });

  assertThrows(
    () => parseFlags(["-ab"], combinedShortFlagOptions),
    Error,
    `Option "--beta" conflicts with option "--alpha".`,
  );
});
