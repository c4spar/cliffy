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

test("flags optionDepends noArguments", () => {
  const { flags, unknown, literal } = parseFlags([], options);

  assertEquals(flags, {});
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("flags optionDepends videoAudioImageType", () => {
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

test("flags optionDepends videoType", () => {
  assertThrows(
    () => parseFlags(["-v", "value"], options),
    Error,
    `Option "--video-type" depends on option "--audio-type".`,
  );
});

test("flags optionDepends audioType", () => {
  assertThrows(
    () => parseFlags(["-a", "value"], options),
    Error,
    `Option "--audio-type" depends on option "--video-type".`,
  );
});

test("flags optionDepends imageType", () => {
  assertThrows(
    () => parseFlags(["-i", "value"], options),
    Error,
    `Option "--image-type" depends on option "--video-type".`,
  );
});

test("flags optionDepends videoAudio", () => {
  assertThrows(
    () => parseFlags(["-v", "value", "-a", "value"], options),
    Error,
    `Option "--video-type" depends on option "--image-type".`,
  );
});

test("flags optionDepends audioVideo", () => {
  assertThrows(
    () => parseFlags(["-a", "value", "-v", "value"], options),
    Error,
    `Option "--audio-type" depends on option "--image-type".`,
  );
});

test("flags optionDepends imageVideo", () => {
  assertThrows(
    () => parseFlags(["-i", "value", "-v", "value"], options),
    Error,
    `Option "--image-type" depends on option "--audio-type".`,
  );
});

const options2 = {
  allowEmpty: true,
  flags: [{
    name: "standalone",
    type: "boolean",
    optionalValue: true,
    standalone: true,
  }, {
    name: "flag1",
    type: "boolean",
    optionalValue: true,
    depends: ["flag2"],
  }, {
    name: "flag2",
    type: "boolean",
    optionalValue: true,
    depends: ["flag1"],
    default: false,
  }, {
    name: "no-flag1",
  }, {
    name: "no-flag2",
  }],
};

test("flags depends: should accept no arguments", () => {
  const { flags, unknown, literal } = parseFlags([], options2);

  assertEquals(flags, { flag2: false });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("flags depends: should accept --standalone", () => {
  const { flags, unknown, literal } = parseFlags(["--standalone"], options2);

  assertEquals(flags, { standalone: true, flag2: false });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("flags depends: should not accept --flag2", () => {
  assertThrows(
    () => parseFlags(["--flag2"], options2),
    Error,
    `Option "--flag2" depends on option "--flag1".`,
  );
});

test("flags depends: should accept --flag1 --no-flag2", () => {
  const { flags, unknown, literal } = parseFlags(
    ["--flag1", "--no-flag2"],
    options2,
  );

  assertEquals(flags, { flag1: true, flag2: false });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("flags depends: should accept --no-flag1 --no-flag2", () => {
  const { flags, unknown, literal } = parseFlags(
    ["--no-flag1", "--no-flag2"],
    options2,
  );

  assertEquals(flags, { flag1: false, flag2: false });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("flags depends: should accept --flag1", () => {
  const { flags, unknown, literal } = parseFlags(["--flag1"], options2);

  assertEquals(flags, { flag1: true, flag2: false });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("flags depends: should accept --flag1 --flag2", () => {
  const { flags, unknown, literal } = parseFlags(
    ["--flag1", "--flag2"],
    options2,
  );

  assertEquals(flags, { flag1: true, flag2: true });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("flags depends: should accept --flag1 --flag2", () => {
  const { flags, unknown, literal } = parseFlags(
    ["--flag1", "--flag2", "true"],
    options2,
  );

  assertEquals(flags, { flag1: true, flag2: true });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("flags depends: should accept --flag1 --flag2 false", () => {
  const { flags, unknown, literal } = parseFlags(
    ["--flag1", "--flag2", "false"],
    options2,
  );

  assertEquals(flags, { flag1: true, flag2: false });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});
