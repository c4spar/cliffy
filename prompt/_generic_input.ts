import type { KeyCode } from "@cliffy/keycode";
import {
  GenericPrompt,
  type GenericPromptKeys,
  type GenericPromptOptions,
  type GenericPromptSettings,
} from "./_generic_prompt.ts";
import { stripAnsiCode, underline } from "@std/fmt/colors";

/** Generic input prompt options. */
export interface GenericInputPromptOptions<TValue, TRawValue>
  extends GenericPromptOptions<TValue, TRawValue> {
  /** Keymap to assign key names to prompt actions. */
  keys?: GenericInputKeys;
}

/** Generic input prompt settings. */
export interface GenericInputPromptSettings<TValue, TRawValue>
  extends GenericPromptSettings<TValue, TRawValue> {
  keys?: GenericInputKeys;
}

/** Input keys options. */
export interface GenericInputKeys extends GenericPromptKeys {
  /** Cursor left keymap. Default is `["left"]`. */
  moveCursorLeft?: string[];
  /** Cursor right keymap. Default is `["right"]`. */
  moveCursorRight?: string[];
  /** Delete cursor left keymap. Default is `["backspace"]`. */
  deleteCharLeft?: string[];
  /** Delete cursor right keymap. Default is `["delete"]`. */
  deleteCharRight?: string[];
  /** Move cursor one word left. Default is `["alt+left", "ctrl+left"]`. */
  moveWordLeft?: string[];
  /** Move cursor one word right. Default is `["alt+right", "ctrl+right"]`. */
  moveWordRight?: string[];
  /** Delete word to the left of cursor. Default is `["ctrl+w", "alt+backspace"]`. */
  deleteWordLeft?: string[];
  /** Delete word to the right of cursor. Default is `["alt+d"]`. */
  deleteWordRight?: string[];
}

/** Generic input prompt representation. */
export abstract class GenericInput<
  TValue,
  TRawValue,
> extends GenericPrompt<TValue, TRawValue> {
  // @ts-ignore ignore jsr publish error
  protected abstract override readonly settings: GenericInputPromptSettings<
    TValue,
    TRawValue
  >;
  protected inputValue = "";
  protected inputIndex = 0;

  public override getDefaultSettings(
    options: GenericInputPromptOptions<TValue, TRawValue>,
  ): GenericInputPromptSettings<TValue, TRawValue> {
    const settings = super.getDefaultSettings(options);
    return {
      ...settings,
      keys: {
        moveCursorLeft: ["left"],
        moveCursorRight: ["right"],
        deleteCharLeft: ["backspace"],
        deleteCharRight: ["delete"],
        moveWordLeft: ["alt+left", "ctrl+left"],
        moveWordRight: ["alt+right", "ctrl+right"],
        deleteWordLeft: ["ctrl+w", "alt+backspace"],
        deleteWordRight: ["alt+d"],
        ...(settings.keys ?? {}),
      },
    };
  }

  protected getCurrentInputValue(): string {
    return this.inputValue;
  }

  protected override message(): string {
    const message: string = super.message() + " " + this.settings.pointer + " ";
    this.cursor.x = stripAnsiCode(message).length + this.inputIndex + 1;
    return message + this.input();
  }

  protected input(): string {
    return underline(this.inputValue);
  }

  /**
   * Handle user input event.
   * @param event Key event.
   */
  protected override async handleEvent(event: KeyCode): Promise<void> {
    switch (true) {
      case this.isKey(this.settings.keys, "moveWordLeft", event):
        this.moveWordLeft();
        break;
      case this.isKey(this.settings.keys, "moveWordRight", event):
        this.moveWordRight();
        break;
      case this.isKey(this.settings.keys, "deleteWordLeft", event):
        this.deleteWordLeft();
        break;
      case this.isKey(this.settings.keys, "deleteWordRight", event):
        this.deleteWordRight();
        break;
      case this.isKey(this.settings.keys, "moveCursorLeft", event):
        this.moveCursorLeft();
        break;
      case this.isKey(this.settings.keys, "moveCursorRight", event):
        this.moveCursorRight();
        break;
      case this.isKey(this.settings.keys, "deleteCharRight", event):
        this.deleteCharRight();
        break;
      case this.isKey(this.settings.keys, "deleteCharLeft", event):
        this.deleteChar();
        break;
      case event.char && !event.meta && !event.ctrl:
        this.addChar(event.char);
        break;
      default:
        await super.handleEvent(event);
    }
  }

  /** Add character to current input. */
  protected addChar(char: string): void {
    this.inputValue = this.inputValue.slice(0, this.inputIndex) + char +
      this.inputValue.slice(this.inputIndex);
    this.inputIndex++;
  }

  /** Move prompt cursor left. */
  protected moveCursorLeft(): void {
    if (this.inputIndex > 0) {
      this.inputIndex--;
    }
  }

  /** Move prompt cursor right. */
  protected moveCursorRight(): void {
    if (this.inputIndex < this.inputValue.length) {
      this.inputIndex++;
    }
  }

  /** Delete char left. */
  protected deleteChar(): void {
    if (this.inputIndex > 0) {
      this.inputIndex--;
      this.deleteCharRight();
    }
  }

  /** Delete char right. */
  protected deleteCharRight(): void {
    if (this.inputIndex < this.inputValue.length) {
      this.inputValue = this.inputValue.slice(0, this.inputIndex) +
        this.inputValue.slice(this.inputIndex + 1);
    }
  }

  /** Move cursor one word to the left (whitespace-delimited). */
  protected moveWordLeft(): void {
    let i = this.inputIndex;
    while (i > 0 && this.inputValue[i - 1] === " ") {
      i--;
    }
    while (i > 0 && this.inputValue[i - 1] !== " ") {
      i--;
    }
    this.inputIndex = i;
  }

  /** Move cursor one word to the right (whitespace-delimited). */
  protected moveWordRight(): void {
    let i = this.inputIndex;
    while (i < this.inputValue.length && this.inputValue[i] !== " ") {
      i++;
    }
    while (i < this.inputValue.length && this.inputValue[i] === " ") {
      i++;
    }
    this.inputIndex = i;
  }

  /** Delete the word to the left of the cursor (whitespace-delimited). */
  protected deleteWordLeft(): void {
    let i = this.inputIndex;
    while (i > 0 && this.inputValue[i - 1] === " ") {
      i--;
    }
    while (i > 0 && this.inputValue[i - 1] !== " ") {
      i--;
    }
    this.inputValue = this.inputValue.slice(0, i) +
      this.inputValue.slice(this.inputIndex);
    this.inputIndex = i;
  }

  /** Delete the word to the right of the cursor (whitespace-delimited). */
  protected deleteWordRight(): void {
    let i = this.inputIndex;
    while (i < this.inputValue.length && this.inputValue[i] !== " ") {
      i++;
    }
    while (i < this.inputValue.length && this.inputValue[i] === " ") {
      i++;
    }
    this.inputValue = this.inputValue.slice(0, this.inputIndex) +
      this.inputValue.slice(i);
  }
}
