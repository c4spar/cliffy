import { test } from "@cliffy/internal/testing/test";
import { assertEquals, assertRejects } from "@std/assert";
import { Command } from "../../command.ts";

const cmd = new Command()
  .throwErrors()
  .allowEmpty(false)
  .option("-t, --type [value:string]", "description ...", {
    required: true,
    conflicts: ["video-type", "audio-type", "image-type"],
  })
  .option("-v, --video-type [value:string]", "description ...", {
    required: true,
    depends: ["audio-type", "image-type"],
    conflicts: ["type"],
  })
  .option("-a, --audio-type [value:string]", "description ...", {
    required: true,
    depends: ["video-type", "image-type"],
    conflicts: ["type"],
  })
  .option("-i, --image-type [value:string]", "description ...", {
    required: true,
    depends: ["video-type", "audio-type"],
    conflicts: ["type"],
  })
  .action(() => {});

test("command optionConflicts noArguments", async () => {
  await assertRejects(
    async () => {
      await cmd.parse([]);
    },
    Error,
    `Missing required option "--type".`,
  );
});

test("command optionConflicts type", async () => {
  const { options, args } = await cmd.parse(["-t", "value"]);

  assertEquals(options, { type: "value" });
  assertEquals(args, []);
});

test("command optionConflicts videoAudioImageType", async () => {
  const { options, args } = await cmd.parse(
    ["-v", "value", "-a", "value", "--image-type", "value"],
  );

  assertEquals(
    options,
    { videoType: "value", audioType: "value", imageType: "value" },
  );
  assertEquals(args, []);
});

test("command optionConflicts videoAudioImageType", async () => {
  await assertRejects(
    async () => {
      await cmd.parse(["-v", "value", "-a", "value"]);
    },
    Error,
    `Option "--video-type" depends on option "--image-type".`,
  );
});

test("command optionConflicts should not conflict with default value on nested sub-command", async () => {
  const { options } = await new Command()
    .throwErrors()
    .globalOption("-j, --json", "Output as JSON", { default: true })
    .globalOption("--table", "Force table output", { conflicts: ["json"] })
    .command("foo", new Command().command("bar"))
    .parse(["foo", "bar", "--table"]);

  assertEquals(options, { json: true, table: true });
});

test("command optionConflicts should not conflict with its own negated option on nested sub-command", async () => {
  const { options } = await new Command()
    .throwErrors()
    .globalOption("-j, --json", "Output as JSON", { default: true })
    .globalOption("--no-json", "Force table output", { conflicts: ["json"] })
    .command("foo", new Command().command("bar"))
    .parse(["foo", "bar", "--no-json"]);

  assertEquals(options, { json: false });
});

test("command optionConflicts should conflict with explicitly provided option", async () => {
  await assertRejects(
    async () => {
      await new Command()
        .throwErrors()
        .globalOption("-j, --json", "Output as JSON", { default: true })
        .globalOption("--table", "Force table output", { conflicts: ["json"] })
        .command("foo", new Command().command("bar"))
        .parse(["foo", "bar", "--json", "--table"]);
    },
    Error,
    `Option "--table" conflicts with option "--json".`,
  );
});

test("command optionConflicts should reject a negation combined with its positive option", async () => {
  await assertRejects(
    async () => {
      await new Command()
        .throwErrors()
        .globalOption("-j, --json", "Output as JSON", { default: true })
        .globalOption("--no-json", "Force table output", {
          conflicts: ["json"],
        })
        .command("foo", new Command().command("bar"))
        .parse(["foo", "bar", "--json", "--no-json"]);
    },
    Error,
    `Option "--json" can only occur once, but was found several times.`,
  );
});
