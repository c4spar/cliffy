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
