import { assert, assertStringIncludes } from "@std/assert";
import { assertSnapshot } from "@std/testing/snapshot";
import { quoteString } from "./_quote_string.ts";
import { dirname, fromFileUrl } from "@std/path";
import { test } from "@cliffy/internal/testing/test";

test({
  name: "should run snapshot only tests",
  ignore: ["node", "bun"],
  async fn(ctx) {
    const testDir = dirname(fromFileUrl(import.meta.url));
    const snapshotDir = testDir + "/__snapshots__";

    const snapshotPath = `${snapshotDir}/snapshot_only_test_fixture.ts.snap`;

    const args = [
      "test",
      "--allow-run=deno",
      `--allow-read=${testDir}`,
      `--allow-write=${testDir}`,
      "testing/snapshot_only_test_fixture.ts",
      "--",
      "--update",
    ];

    const cmd = new Deno.Command("deno", { args });

    const { success, stdout, stderr } = await cmd.output();

    const decoder = new TextDecoder();
    assert(!success, decoder.decode(stderr) + decoder.decode(stdout));
    assertStringIncludes(
      decoder.decode(stderr),
      'Test failed because the "only" option was used',
    );

    const snapshotContent = await Deno.readTextFile(snapshotPath);

    await assertSnapshot(ctx, snapshotContent, { serializer: quoteString });

    await Deno.remove(snapshotPath);
  },
});
