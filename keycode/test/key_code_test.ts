import { test } from "@cliffy/internal/testing/test";
import { assertEquals } from "@std/assert";
import { type KeyCode, parse } from "../key_code.ts";
import {
  KeyMap,
  KeyMapCtrl,
  KeyMapShift,
  SpecialKeyMap,
} from "../_key_codes.ts";

const ESC = "\x1B";

const defaults: KeyCode = {
  name: undefined,
  char: undefined,
  sequence: undefined,
  code: undefined,
  ctrl: false,
  meta: false,
  shift: false,
};

for (const char of "abcdefghijklmnopqrstuvwxyz123456789") {
  test(`keycode - parse key - ${char}`, function () {
    const keys: KeyCode[] = parse(char);

    assertEquals(
      keys,
      [{
        ...defaults,
        char,
        name: char.toLowerCase(),
        sequence: char,
      }],
    );
  });
}

for (const char of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
  test(`keycode - parse key - shift + ${char}`, function () {
    const keys: KeyCode[] = parse(char);

    assertEquals(
      keys,
      [{
        ...defaults,
        char,
        name: char.toLowerCase(),
        sequence: char,
        shift: true,
      }],
    );
  });
}

for (const char of '!"§$%&/()=?,;.:-_¬”#£ﬁ^^˜·¯˙»„‰') {
  test(`keycode - parse special key - ${char}`, function () {
    const keys: KeyCode[] = parse(char);

    assertEquals(
      keys,
      [{
        ...defaults,
        char,
        name: char,
        sequence: char,
      }],
    );
  });
}

for (const code of Object.keys(SpecialKeyMap)) {
  const name = SpecialKeyMap[code];

  // test(`keycode - parse key - SpecialKeyMap - ${name} (${code})`, function () {
  test(`keycode - parse key - SpecialKeyMap - ${name}`, function () {
    // const keys: KeyEvent[] = parse( ESC + code );
    const keys: KeyCode[] = parse(code);

    assertEquals(
      keys,
      [{
        ...defaults,
        char: name === "space" ? code : undefined,
        name,
        sequence: code,
      }],
    );
  });
}

for (const code of Object.keys(KeyMap)) {
  const name = KeyMap[code];

  test(`keycode - parse key - KeyMap - ${name} (${code})`, function () {
    const keys: KeyCode[] = parse(ESC + code);

    assertEquals(
      keys,
      [{
        ...defaults,
        name,
        sequence: ESC + code,
        code,
      }],
    );
  });
}

for (const code of Object.keys(KeyMapShift)) {
  const name = KeyMapShift[code];

  test(`keycode - parse key - KeyMapShift - shift + ${name} (${code})`, function () {
    const keys: KeyCode[] = parse(ESC + code);

    assertEquals(
      keys,
      [{
        ...defaults,
        name,
        sequence: ESC + code,
        code,
        shift: true,
      }],
    );
  });
}

for (const code of Object.keys(KeyMapCtrl)) {
  const name = KeyMapCtrl[code];

  test(`keycode - parse key - KeyMapCtrl - ctrl + ${name} (${code})`, function () {
    const keys: KeyCode[] = parse(ESC + code);

    assertEquals(
      keys,
      [{
        ...defaults,
        name,
        sequence: ESC + code,
        code,
        ctrl: true,
      }],
    );
  });
}

test(`keycode - parse string - abc`, function () {
  const keys: KeyCode[] = parse("abc");

  assertEquals(
    keys,
    [{
      ...defaults,
      name: "a",
      char: "a",
      sequence: "a",
    }, {
      ...defaults,
      name: "b",
      char: "b",
      sequence: "b",
    }, {
      ...defaults,
      name: "c",
      char: "c",
      sequence: "c",
    }],
  );
});

test("keycode - parse incomplete escape sequence", function () {
  const keys: KeyCode[] = parse(`${ESC}[`);

  assertEquals(
    keys,
    [{
      ...defaults,
      name: "escape",
      sequence: ESC,
    }, {
      ...defaults,
      name: "[",
      char: "[",
      sequence: "[",
    }],
  );
});

test("keycode - xterm/gnome ESC [ letter (with modifiers)", function () {
  const keys = parse(
    "\x1b[2P\x1b[3P\x1b[4P\x1b[5P\x1b[6P\x1b[7P\x1b[8P\x1b[3Q\x1b[8Q\x1b[3R\x1b[8R\x1b[3S\x1b[8S",
  );
  assertEquals(keys, [
    {
      name: "f1",
      char: undefined,
      sequence: "\x1b[2P",
      code: "[P",
      shift: true,
      meta: false,
      ctrl: false,
    },
    {
      name: "f1",
      char: undefined,
      sequence: "\x1b[3P",
      code: "[P",
      shift: false,
      meta: true,
      ctrl: false,
    },
    {
      name: "f1",
      char: undefined,
      sequence: "\x1b[4P",
      code: "[P",
      shift: true,
      meta: true,
      ctrl: false,
    },
    {
      name: "f1",
      char: undefined,
      sequence: "\x1b[5P",
      code: "[P",
      shift: false,
      meta: false,
      ctrl: true,
    },
    {
      name: "f1",
      char: undefined,
      sequence: "\x1b[6P",
      code: "[P",
      shift: true,
      meta: false,
      ctrl: true,
    },
    {
      name: "f1",
      char: undefined,
      sequence: "\x1b[7P",
      code: "[P",
      shift: false,
      meta: true,
      ctrl: true,
    },
    {
      name: "f1",
      char: undefined,
      sequence: "\x1b[8P",
      code: "[P",
      shift: true,
      meta: true,
      ctrl: true,
    },
    {
      name: "f2",
      char: undefined,
      sequence: "\x1b[3Q",
      code: "[Q",
      shift: false,
      meta: true,
      ctrl: false,
    },
    {
      name: "f2",
      char: undefined,
      sequence: "\x1b[8Q",
      code: "[Q",
      shift: true,
      meta: true,
      ctrl: true,
    },
    {
      name: "f3",
      char: undefined,
      sequence: "\x1b[3R",
      code: "[R",
      shift: false,
      meta: true,
      ctrl: false,
    },
    {
      name: "f3",
      char: undefined,
      sequence: "\x1b[8R",
      code: "[R",
      shift: true,
      meta: true,
      ctrl: true,
    },
    {
      name: "f4",
      char: undefined,
      sequence: "\x1b[3S",
      code: "[S",
      shift: false,
      meta: true,
      ctrl: false,
    },
    {
      name: "f4",
      char: undefined,
      sequence: "\x1b[8S",
      code: "[S",
      shift: true,
      meta: true,
      ctrl: true,
    },
  ]);
});
