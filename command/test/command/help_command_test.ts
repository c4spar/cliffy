import { test } from "@cliffy/internal/testing/test";
import { snapshotTest } from "@cliffy/testing";
import { assertEquals } from "@std/assert";
import { CompletionsCommand } from "../../completions/completions_command.ts";
import { HelpCommand } from "../../help/help_command.ts";
import { Command } from "../../command.ts";

function command(defaultOptions?: boolean, hintOption?: boolean) {
  const cmd = new Command()
    .throwErrors()
    .version("1.0.0")
    .description("Test description ...")
    .help({
      hints: true,
      types: true,
      colors: false,
    });

  if (!defaultOptions) {
    cmd.versionOption(false)
      .helpOption(false);
  }

  cmd.option("-t, --test [val:string]", "test description")
    .option(
      "-D, --default [val:string]",
      "I have a default value!",
      { default: "test" },
    )
    .option(
      "--default-func [val:string]",
      "I have a default handler!",
      { default: () => "test" },
    )
    .option(
      "-T, --default-text [val:string]",
      "I have a default text!",
      { defaultText: "test" },
    )
    .option(
      "--default-text-func [val:string]",
      "I have a default text handler!",
      { default: "test", defaultText: (value) => value },
    )
    .option("-r, --required [val:string]", "I am required!", { required: true })
    .option(
      "-H, --hidden [val:string]",
      "Nobody knows about me!",
      { hidden: true },
    )
    .option(
      "-d, --depends [val:string]",
      "I depend on test!",
      { depends: ["test"] },
    )
    .option(
      "-c, --conflicts [val:string]",
      "I conflict with test!",
      { conflicts: ["test"] },
    );

  if (hintOption) {
    cmd.option("-a, --all <val:string>", "I have many hints!", {
      default: "test",
      required: true,
      depends: ["test"],
      conflicts: ["depends"],
    });
  }

  cmd
    .env("SOME_ENV_VAR=<value:number>", "Description ...")
    .env("SOME_ENV_VAR_2 <value>", "Description 2 ...")
    .env("SOME_REQUIRED_ENV_VAR=<value>", "This one is required!", {
      required: true,
    })
    .command("help", new HelpCommand())
    .command("completions", new CompletionsCommand())
    .command("sub-command <input:string> <output:string>")
    .description("sub command description.")
    .command("hidden-command <input:string> <output:string>")
    .description("Nobody knows about me!")
    .hidden()
    .reset();

  return cmd;
}

test({
  name: "command: help command with line break",
  fn() {
    const output: string = command(true, true).getHelp();

    assertEquals(
      output,
      `
Usage:   COMMAND --required [val:string] --all <val:string>
Version: 1.0.0                                             

Description:

  Test description ...

Options:

  -h, --help                         - Show this help.                                                                                   
  -V, --version                      - Show the version number for this program.                                                         
  -t, --test           [val:string]  - test description                                                                                  
  -D, --default        [val:string]  - I have a default value!                    (Default: "test")                                      
  --default-func       [val:string]  - I have a default handler!                  (Default: "test")                                      
  -T, --default-text   [val:string]  - I have a default text!                     (Default: "test")                                      
  --default-text-func  [val:string]  - I have a default text handler!             (Default: "test")                                      
  -r, --required       [val:string]  - I am required!                             (required)                                             
  -d, --depends        [val:string]  - I depend on test!                          (Depends: --test)                                      
  -c, --conflicts      [val:string]  - I conflict with test!                      (Conflicts: --test)                                    
  -a, --all            <val:string>  - I have many hints!                         (required, Default: "test", Depends: --test, Conflicts:
                                                                                  --depends)                                             

Commands:

  help         [command:command]               - Show this help or the help of a sub-command.
  completions                                  - Generate shell completions.                 
  sub-command  <input:string> <output:string>  - sub command description.                    

Environment variables:

  SOME_ENV_VAR           <value:number>  - Description ...                  
  SOME_ENV_VAR_2         <value:string>  - Description 2 ...                
  SOME_REQUIRED_ENV_VAR  <value:string>  - This one is required!  (required)
`,
    );
  },
});

test({
  name: "command: help command with line break but without default options",
  fn() {
    const output: string = command(false, true).getHelp();

    assertEquals(
      output,
      `
Usage:   COMMAND --required [val:string] --all <val:string>
Version: 1.0.0                                             

Description:

  Test description ...

Options:

  -t, --test           [val:string]  - test description                                                                       
  -D, --default        [val:string]  - I have a default value!         (Default: "test")                                      
  --default-func       [val:string]  - I have a default handler!       (Default: "test")                                      
  -T, --default-text   [val:string]  - I have a default text!          (Default: "test")                                      
  --default-text-func  [val:string]  - I have a default text handler!  (Default: "test")                                      
  -r, --required       [val:string]  - I am required!                  (required)                                             
  -d, --depends        [val:string]  - I depend on test!               (Depends: --test)                                      
  -c, --conflicts      [val:string]  - I conflict with test!           (Conflicts: --test)                                    
  -a, --all            <val:string>  - I have many hints!              (required, Default: "test", Depends: --test, Conflicts:
                                                                       --depends)                                             

Commands:

  help         [command:command]               - Show this help or the help of a sub-command.
  completions                                  - Generate shell completions.                 
  sub-command  <input:string> <output:string>  - sub command description.                    

Environment variables:

  SOME_ENV_VAR           <value:number>  - Description ...                  
  SOME_ENV_VAR_2         <value:string>  - Description 2 ...                
  SOME_REQUIRED_ENV_VAR  <value:string>  - This one is required!  (required)
`,
    );
  },
});

await snapshotTest({
  name: "[command] should print help for root command",
  meta: import.meta,
  steps: {
    rootCommand: { args: ["-h"] },
    fooCommand: { args: ["foo", "-h"] },
  },
  async fn(): Promise<void> {
    const child = new Command()
      .description("Child command.")
      .option("--beep [value:number]", "Beep.")
      .command("foo [bar]")
      .description("Foo command.")
      .option("--Boop [value:number]", "Boop.");

    const cmd = new Command()
      .throwErrors()
      .command("child", child);

    await cmd.getCommand("child")?.parse(Deno.args);
  },
});
