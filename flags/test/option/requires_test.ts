import { test } from "@cliffy/internal/testing/test";
import { assertEquals, assertThrows } from "@std/assert";
import { parseFlags } from "../../flags.ts";
import type { ParseFlagsOptions } from "../../types.ts";

const options: ParseFlagsOptions = {
  allowEmpty: true,
  flags: [{
    name: "video-type",
    aliases: ["v"],
    type: "string",
    depends: ["audio-type", "image-type"],
  }, {
    name: "audio-type",
    aliases: ["a"],
    type: "string",
    depends: ["video-type", "image-type"],
  }, {
    name: "image-type",
    aliases: ["i"],
    type: "string",
    depends: ["video-type", "audio-type"],
  }],
};

test("flags optionRequire noArguments", () => {
  const { flags, unknown, literal } = parseFlags([], options);

  assertEquals(flags, {});
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("flags optionRequire videoAudioImageType", () => {
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

test("flags optionRequire videoType", () => {
  assertThrows(
    () => parseFlags(["-v", "value"], options),
    Error,
    `Option "--video-type" depends on option "--audio-type".`,
  );
});

test("flags optionRequire audioType", () => {
  assertThrows(
    () => parseFlags(["-a", "value"], options),
    Error,
    `Option "--audio-type" depends on option "--video-type".`,
  );
});

test("flags optionRequire imageType", () => {
  assertThrows(
    () => parseFlags(["-i", "value"], options),
    Error,
    `Option "--image-type" depends on option "--video-type".`,
  );
});

test("flags optionRequire videoAudio", () => {
  assertThrows(
    () => parseFlags(["-v", "value", "-a", "value"], options),
    Error,
    `Option "--video-type" depends on option "--image-type".`,
  );
});

test("flags optionRequire audioVideo", () => {
  assertThrows(
    () => parseFlags(["-a", "value", "-v", "value"], options),
    Error,
    `Option "--audio-type" depends on option "--image-type".`,
  );
});

test("flags optionRequire imageVideo", () => {
  assertThrows(
    () => parseFlags(["-i", "value", "-v", "value"], options),
    Error,
    `Option "--image-type" depends on option "--audio-type".`,
  );
});
