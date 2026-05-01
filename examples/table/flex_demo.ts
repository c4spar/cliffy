#!/usr/bin/env -S deno run

import { Table } from "@cliffy/table";
import { colors } from "@cliffy/ansi/colors";
import { keypress } from "@cliffy/keypress";

console.log(colors.dim("Fetching package info from jsr.io..."));
const packages = await fetchPackages();

const headers = ["Package", "Description", "Version"].map(colors.bold);
const rows = packages
  .filter((pkg) => !["internal", "testing"].includes(pkg.name))
  .map((pkg) => [
    colors.bold(`@cliffy/${pkg.name}`),
    colors.cyan(pkg.description),
    colors.yellow(pkg.latestVersion),
  ]);

const slides: Array<Slide> = [{
  title: "no flex — natural content width",
  render() {
    ln("Table.from(rows).header(headers).border()");
    ln();
    hint(
      "Without flex properties the column widths are determined purely by",
      "cell content. The table has no awareness of the terminal width.",
    );
    ln();
    Table.from(rows).header(headers).border().render();
  },
}, {
  title: "flex-shrink — compress columns on overflow",
  render(width) {
    ln(`.maxWidth(${width}).flexShrink([0, 1, 0])`);
    ln();
    hint(
      "When total column width exceeds maxWidth, columns with factor > 0",
      "absorb the overflow in proportion to factor × current_width.",
      "Factor 0 = rigid, never shrinks.",
    );
    ln();
    Table.from(rows).header(headers).border()
      .maxWidth(width)
      .flexShrink([0, 1, 0])
      .render();
  },
}, {
  title: "flex-grow — fill available space",
  render(width) {
    ln(`.maxWidth(${width}).flexGrow([0, 1, 0])`);
    ln();
    hint(
      "Slack remaining after natural column widths is distributed in",
      "proportion to grow weight. Description expands to fill the terminal.",
      "Without flexShrink the table only grows, never compresses.",
    );
    ln();
    Table.from(rows).header(headers).border()
      .maxWidth(width)
      .flexGrow([0, 1, 0])
      .render();
  },
}, {
  title: "flex — grow AND shrink (shorthand)",
  render(width) {
    ln(`.maxWidth(${width}).flex([0, 1, 0])`);
    ln();
    hint(
      "flex(n) is shorthand for flexGrow(n) + flexShrink(n).",
      "Description adapts in both directions: shrinks when narrow,",
      "grows when wide. Resize the terminal to see both effects.",
    );
    ln();
    Table.from(rows).header(headers).border()
      .maxWidth(width)
      .flex([0, 1, 0])
      .render();
  },
}, {
  title: "flex-shrink weights — proportional overflow sharing",
  render(width) {
    ln(
      `.flex([0, 2, 1])  vs  .flex([0, 1, 2])  vs  .flexShrink([0, 1, 0]).flexGrow([0, 0, 1])`,
    );
    ln();
    hint(
      "Overflow reduction is weighted by factor × width.",
      "Doubling a factor roughly doubles that column's share of the cut.",
    );
    ln();

    label(
      "flex: [0, 2, 1]  —  description carries twice the shrink burden:",
    );
    ln();
    Table.from(rows).header(headers).border()
      .maxWidth(width)
      .flex([0, 2, 1])
      .render();

    ln();
    label(
      "flex: [0, 1, 2]  —  version carries twice the shrink burden:",
    );
    ln();
    Table.from(rows).header(headers).border()
      .maxWidth(width)
      .flex([0, 1, 2])
      .render();

    ln();
    label(
      "flexShrink: [0, 1, 0] + flexGrow: [0, 0, 1] — description shrinks but version grows:",
    );
    ln();
    Table.from(rows).header(headers).border()
      .maxWidth(width)
      .flexShrink([0, 1, 0])
      .flexGrow([0, 0, 1])
      .render();
  },
}];

let currentIndex = 0;
let lastWidth = 0;

render();

if (Deno.stdin.isTerminal()) {
  keypress().addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === "c") {
      console.clear();
      keypress().dispose();
      Deno.exit(0);
    }
    if (event.key === "right") {
      currentIndex = (currentIndex + 1) % slides.length;
      render();
    }
    if (event.key === "left") {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      render();
    }
  });
}

if (Deno.build.os === "windows") {
  setInterval(() => {
    const width = getColumns();
    if (width !== lastWidth) {
      render();
    }
  }, 100);
} else {
  Deno.addSignalListener("SIGWINCH", render);
}

Deno.addSignalListener("SIGINT", () => {
  console.clear();
  Deno.exit(0);
});

await new Promise<never>(() => {});

type Slide = {
  title: string;
  render(w: number): void;
};

interface JsrPackage {
  name: string;
  description: string;
  latestVersion: string;
  score: number;
}

function render(): void {
  const w = getColumns();
  lastWidth = w;
  const slide = slides[currentIndex];

  const tabs = slides
    .map((s, i) => {
      const num = colors.dim(`${i + 1}.`);
      const lbl = i === currentIndex
        ? colors.bold(colors.cyan(s.title))
        : colors.dim(s.title);
      return `${num} ${lbl}`;
    })
    .join(colors.dim("  ·  "));

  const footer = colors.dim(
    `  terminal: ${w} cols  ·  ← → navigate  ·  Ctrl+C to exit`,
  );

  console.clear();
  console.log("\n" + tabs);
  console.log(footer);
  console.log();
  console.log();

  slide.render(w);
}

async function fetchPackages(): Promise<Array<JsrPackage>> {
  const res = await fetch("https://jsr.io/api/scopes/cliffy/packages");
  if (!res.ok) {
    throw new Error(`Failed to fetch @cliffy packages: ${res.status}`);
  }
  const data: { items: JsrPackage[] } = await res.json();
  return data.items;
}

function getColumns(): number {
  try {
    return Deno.consoleSize().columns;
  } catch {
    return 80;
  }
}

function ln(snippet?: string): void {
  if (snippet) {
    console.log("  " + colors.dim("❯ ") + colors.green(snippet));
  } else {
    console.log();
  }
}

function hint(...lines: string[]): void {
  for (const line of lines) {
    console.log("  " + colors.dim(line));
  }
}

function label(text: string): void {
  console.log("  " + colors.bold(text));
}
