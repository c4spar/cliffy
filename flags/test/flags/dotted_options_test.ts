import { test } from "@cliffy/internal/testing/test";
import { assertEquals, assertThrows } from "@std/assert";
import { ValidationError } from "../../_errors.ts";
import { parseFlags } from "../../flags.ts";
import type { ParseFlagsOptions } from "../../types.ts";

const options: ParseFlagsOptions = {
  flags: [{
    name: "bitrate.audio",
    aliases: ["b.a", "audio-bitrate"],
    type: "number",
    depends: ["bitrate.video"],
  }, {
    name: "bitrate.video",
    aliases: ["b.v", "video-bitrate"],
    type: "number",
    depends: ["bitrate.audio"],
  }],
};

test("[flags] should parse dotted short options", () => {
  const { flags, unknown, literal } = parseFlags(
    ["-b.a", "300", "-b.v", "900"],
    options,
  );

  assertEquals(flags, { bitrate: { audio: 300, video: 900 } });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("[flags] should parse dotted long options", () => {
  const { flags, unknown, literal } = parseFlags(
    ["--bitrate.audio", "300", "--bitrate.video", "900"],
    options,
  );

  assertEquals(flags, { bitrate: { audio: 300, video: 900 } });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("[flags] should parse dotted alias options", () => {
  const { flags, unknown, literal } = parseFlags(
    ["--audio-bitrate", "300", "--video-bitrate", "900"],
    options,
  );

  assertEquals(flags, { bitrate: { audio: 300, video: 900 } });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("[flags] should not parse dotted options with dotted options disabled", () => {
  const { flags, unknown, literal } = parseFlags(
    ["-b.a", "300", "-b.v", "900"],
    { ...options, dotted: false },
  );

  assertEquals(flags, { "bitrate.audio": 300, "bitrate.video": 900 });
  assertEquals(unknown, []);
  assertEquals(literal, []);
});

test("[flags] should throw error for missing depending options with dotted option", () => {
  assertThrows(
    () => parseFlags(["--bitrate.audio", "300"], options),
    ValidationError,
    `Option "--bitrate.audio" depends on option "--bitrate.video".`,
  );
});

test("[flags] should throw error for missing depending options with dotted alias option", () => {
  assertThrows(
    () => parseFlags(["--audio-bitrate", "300"], options),
    ValidationError,
    `Option "--bitrate.audio" depends on option "--bitrate.video".`,
  );
});

test("[flags] should throw an error for dotted option with invalid value", () => {
  assertThrows(
    () =>
      parseFlags(
        ["--bitrate.audio", "300", "--bitrate.video", "900k"],
        options,
      ),
    ValidationError,
    `Option "--bitrate.video" must be of type "number", but got "900k".`,
  );
});
