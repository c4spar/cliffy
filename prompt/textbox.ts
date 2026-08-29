import { brightBlack, brightBlue } from "jsr:@std/fmt@0.224/colors";
import { GenericPrompt } from "./_generic_prompt.ts";
import {
  GenericSuggestions,
  GenericSuggestionsKeys,
  GenericSuggestionsOptions,
  GenericSuggestionsSettings,
} from "./_generic_suggestions.ts";
import { normalize } from "@std/path";

/** TextBox prompt options. */
export interface TextBoxOptions
  extends GenericSuggestionsOptions<string, string> {
  /** Prompt end delimiter. */
  endDelimiter?: string;
  /** Set minimum allowed length of text box value. */
  minLength?: number;
  /** Set maximum allowed length of text box value. */
  maxLength?: number;
}

/** TextBox prompt settings. */
interface TextBoxSettings extends GenericSuggestionsSettings<string, string> {
  minLength: number;
  maxLength: number;
  endDelimiter: string;
}

/**
 * TextBox prompt representation.
 *
 * ```ts
 * import { TextBox } from "./mod.ts";
 *
 * const confirmed: string = await TextBox.prompt("Enter your name");
 * ```
 */
export class TextBox extends GenericSuggestions<string, string> {
  protected readonly settings: TextBoxSettings;

  /** Execute the prompt with provided options. */
  public static prompt(options: string | TextBoxOptions): Promise<string> {
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

  constructor(options: string | TextBoxOptions) {
    super();
    if (typeof options === "string") {
      options = { message: options };
    }
    this.settings = this.getDefaultSettings(options);
  }

  public getDefaultSettings(options: TextBoxOptions): TextBoxSettings {
    return {
      ...super.getDefaultSettings(options),
      pointer: options.pointer ?? `${brightBlack('EOF: (')}${brightBlue(options.endDelimiter ?? '.')}${brightBlack(')')}`,
      endDelimiter: options.endDelimiter ?? '.',
      minLength: options.minLength ?? 0,
      maxLength: options.maxLength ?? Infinity,
    };
  }

  public async prompt() {
    //TODO fix stdin error
    GenericPrompt.inject('\n')
    //Show default prompt
    await super.prompt()

    const lines = Deno.stdin.readable.pipeThrough(new TextDecoderStream())

    let text = ''
    for await (const line of lines) {
        if (
            line === `${this.settings.endDelimiter}\r\n` ||
            line === `${this.settings.endDelimiter}\n`
        ) {
            Deno.stdin.close()
            break
        }
        text += line
    }
    

    return text
  }

  protected success(value: string): string | undefined {
    //TODO
    this.saveSuggestions(value);
    return super.success(value);
  }

  /** Get text box value. */
  protected getValue(): string {
    //TODO
    return this.settings.files ? normalize(this.inputValue) : this.inputValue;
  }

  /**
   * Validate text box value.
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
