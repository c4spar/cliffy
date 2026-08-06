import { brightBlack, brightBlue, yellow } from "jsr:@std/fmt@0.224/colors";
import { GenericPrompt } from "./_generic_prompt.ts";
import {
  GenericSuggestions,
  GenericSuggestionsOptions,
  GenericSuggestionsSettings,
} from "./_generic_suggestions.ts";
import { normalize, resolve } from "@std/path";
import { link } from "../ansi/ansi_escapes.ts";

/** Editor prompt options. */
export interface EditorOptions
  extends GenericSuggestionsOptions<string, string> {
  /** Edit an existing file. */
  sourceFile?: string;
  /** Temp file extension. */
  fileExtension?: string;
  /** Prefer editor mode. */
  editorMode?: "terminal" | "visual";
  /** Suggest editor to use in priority. */
  suggestedEditor?: string;
  /** Set minimum allowed length of editor value. */
  minLength?: number;
  /** Set maximum allowed length of editor value. */
  maxLength?: number;
}

/** Editor prompt settings. */
interface EditorSettings extends GenericSuggestionsSettings<string, string> {
  sourceFile: string;
  fileExtension: string;
  editorMode: "terminal" | "visual";
  suggestedEditor: string;
  minLength: number;
  maxLength: number;
}

/**
 * Editor prompt representation.
 *
 * ```ts
 * import { Editor } from "./mod.ts";
 *
 * const noteContent: string = await Editor.prompt("Edit a note");
 * ```
 */
export class Editor extends GenericSuggestions<string, string> {
  protected readonly settings: EditorSettings;

  /** Execute the prompt with provided options. */
  public static prompt(options: string | EditorOptions): Promise<string> {
    return new this(options).prompt();
  }

  /**
   * Inject prompt value. If called, the prompt doesn't prompt for an input and
   * returns immediately the injected value. Can be used for unit tests or pre
   * selections.
   *
   * @param value Input value.
   */
  public static inject(value: string): void {
    GenericPrompt.inject(value);
  }

  constructor(options: string | EditorOptions) {
    super();
    if (typeof options === "string") {
      options = { message: options };
    }
    this.settings = this.getDefaultSettings(options);
  }

  public getDefaultSettings(options: EditorOptions): EditorSettings {
    const editor = `${brightBlack("(")}${brightBlue("EDITOR")}${
      brightBlack(")")
    }`;
    const bOpen = brightBlack("[");
    const bClose = brightBlack("]");
    const yLink = (path: string) => yellow(link(path, resolve(path)));

    const hasSourceFile = "sourceFile" in options &&
      options.sourceFile !== undefined;

    const pointer = hasSourceFile
      ? `${editor} ${bOpen}${yLink(options.sourceFile!)}${bClose}`
      : options.fileExtension
      ? `${editor} ${bOpen}${brightBlack("ext: ")}${
        yellow(options.fileExtension)
      }${bClose}`
      : editor;

    return {
      ...super.getDefaultSettings(options),
      pointer: options.pointer ?? pointer,
      sourceFile: options.sourceFile ?? "",
      fileExtension: options.fileExtension ?? "",
      suggestedEditor: options.suggestedEditor ?? "",
      editorMode: "terminal",
      minLength: options.minLength ?? 0,
      maxLength: options.maxLength ?? Infinity,
    };
  }

  get #osShell(): string {
    return Deno.build.os === "windows" ? "pwsh" : "bash";
  }

  get #osShellArgs(): string[] {
    return Deno.build.os === "windows" ? ["-nop", "-c"] : ["-c"];
  }

  #getDefaultVisualEditor(): Promise<string> {
    const sh = {
      custom:
        `(which "${this.settings.suggestedEditor}" &> /dev/null && echo "${this.settings.suggestedEditor}")`,
      xdgText:
        '(gtk-launch $(xdg-mime query default text/plain) --version &> /dev/null && echo "gtk-launch $(xdg-mime query default text/plain)")',
      gedit: '(gedit --version &> /dev/null && echo "gedit")',
      gvim: 'echo "gvim"',
    };

    const pwsh = {
      custom:
        `$($(Get-Command "${this.settings.suggestedEditor}") 2>&1> $null && echo "${this.settings.suggestedEditor}")`,
      code: '$($(code -h) 2>&1> $null && echo "code")',
      sublime: '$($(subl -h) 2>&1> $null && echo "subl")',
      gvim: '$($(gvim -h) 2>&1> $null && echo "gvim")',
      notepadPLusPlus: '$($(notepad++ --help) 2>&1> $null && echo "notepad++")',
      notepad: '$(echo "notepad")',
    };

    return this.#queryEditor(
      //sh
      // try $VISUAL global var then custom if provided, else xdg-open (force text), else gedit, else gvim
      `"\${VISUAL:-$(${sh.custom} || ${sh.xdgText} || ${sh.gedit} || ${sh.gvim})}"`,
      //pwsh
      // try $VISUAL global var then custom if provided, else sublime text, else notepad++, else gvim, else notepad
      `"$($VISUAL ?? $(${pwsh.custom} ?? ${pwsh.code} ?? ${pwsh.sublime} ?? ${pwsh.notepadPLusPlus} ?? ${pwsh.gvim} ?? ${pwsh.notepad})"`,
    );
  }
  #getDefaultTerminalEditor(): Promise<string> {
    const sh = {
      custom:
        `(which "${this.settings.suggestedEditor}" &> /dev/null && echo "${this.settings.suggestedEditor}")`,
      git: "git config core.editor 2> /dev/null",
      sensible:
        '(sensible-editor --version &> /dev/null && echo "sensible-editor")',
      vi: '(vi --version &> /dev/null && echo "vi")',
      nano: 'echo "nano"',
    };

    const pwsh = {
      custom:
        `$($(Get-Command "${this.settings.suggestedEditor}") 2>&1> $null && echo "${this.settings.suggestedEditor}")`,
      git: "$(git config core.editor) 2> $null)",
      vim: '$($(vim -h) 2>&1> $null && echo "vim")',
      notepad: '$(echo "notepad")',
    };

    return this.#queryEditor(
      //sh
      // try $EDITOR global var then custom if provided, else git user defined editor, else os terminal defined editor if available, else vi, else nano.
      `"\${EDITOR:-$(${sh.custom} || ${sh.git} || ${sh.sensible} || ${sh.vi} || ${sh.nano})}"`,
      //pwsh
      // try $EDITOR global var then custom if provided, else git user defined editor, else vim, default notepad (required fallback despite terminal mode).
      `"$($EDITOR ?? $(${pwsh.custom} ?? ${pwsh.git} ?? ${pwsh.vim} ?? ${pwsh.notepad})"`,
    );
  }

  async #queryEditor(shQuery: string, pwshQuery: string): Promise<string> {
    const queryEditor = Deno.build.os === "windows" ? pwshQuery : shQuery;

    const { stdout, stderr, success } = await new Deno.Command(this.#osShell, {
      args: [...this.#osShellArgs, `echo ${queryEditor}`],
    }).output();

    const decoder = new TextDecoder();

    if (success) {
      return decoder.decode(stdout).trim();
    } else {
      throw new Error("unable to determine user default editor", {
        cause: new Error(decoder.decode(stderr).trim()),
      });
    }
  }

  public async prompt() {
    //TODO fix stdin error
    GenericPrompt.inject("\n");
    //Show default prompt
    await super.prompt();

    const filePath = this.settings.sourceFile ??
      await Deno.makeTempFile({ suffix: `.${this.settings.fileExtension}` });

    const editor = this.settings.editorMode === "visual"
      ? await this.#getDefaultVisualEditor()
      : await this.#getDefaultTerminalEditor();

    //open editor
    const { success } = await new Deno.Command(this.#osShell, {
      args: [...this.#osShellArgs, `${editor} ${filePath}`],
      stdout: "inherit",
      stderr: "inherit",
      stdin: "inherit",
    }).output();

    if (!success) {
      throw new Error(
        `unable to open detected user defined editor (${editor})`,
      );
    }

    const content = await Deno.readTextFile(filePath);
    if (!this.settings.sourceFile) {
      await Deno.remove(filePath);
    }

    return content;
  }

  protected success(value: string): string | undefined {
    //TODO
    this.saveSuggestions(value);
    return super.success(value);
  }

  /** Get editor value. */
  protected getValue(): string {
    //TODO
    return this.settings.files ? normalize(this.inputValue) : this.inputValue;
  }

  /**
   * Validate editor value.
   * @param value User input value.
   * @return True on success, false or error message on error.
   */
  protected validate(value: string): boolean | string {
    if (typeof value !== "string") {
      return false;
    }
    if (value.length < this.settings.minLength) {
      return `Value must be longer than ${this.settings.minLength} but has a length of ${value.length}.`;
    }
    if (value.length > this.settings.maxLength) {
      return `Value can't be longer than ${this.settings.maxLength} but has a length of ${value.length}.`;
    }
    return true;
  }

  /**
   * Map input value to output value.
   * @param value Input value.
   * @return Output value.
   */
  protected transform(value: string): string | undefined {
    //TODO
    return value.trim();
  }

  /**
   * Format output value.
   * @param value Output value.
   */
  protected format(value: string): string {
    return value;
  }
}
