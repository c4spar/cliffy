#!/usr/bin/env -S deno run

import { Cell, type CellType, Table } from "@cliffy/table";
import { tty } from "@cliffy/ansi/tty";
import {
  blue,
  bold,
  cyan,
  dim,
  green,
  italic,
  magenta,
  strikethrough,
  underline,
  yellow,
} from "@std/fmt/colors";

tty.cursorHide();

Deno.addSignalListener("SIGINT", () => {
  console.log("interrupted!");
  tty.cursorShow();
  Deno.exit();
});

loop();

function loop() {
  const table: Table = createTable();
  tty.eraseScreen.cursorTo(0, 0);
  table.render();
  setTimeout(loop, 1000);
}

function createTable(): Table {
  return new Table()
    .header(
      ["ID", "First Name", "Last Name", "Email", "Gender", "IP-Address"].map(
        (value) => dim(value),
      ),
    )
    .body(
      [
        [
          "1",
          "Gino",
          "Aicheson",
          "gaicheson0@nydailynews.com",
          "Male",
          "186.87.102.85",
        ],
        [
          "2",
          "Godfry",
          "Pedycan",
          "gpedycan1@state.gov",
          "Male",
          "53.95.85.89",
        ],
        [
          "3",
          "Loni",
          "Miller",
          "lmiller2@chron.com",
          "Female",
          "134.230.62.147",
        ],
        [
          "4",
          "Frayda",
          "Oman",
          "foman3@bloglovin.com",
          "Female",
          "232.19.202.61",
        ],
        [
          "5",
          "Ernaline",
          "Hucklesby",
          "ehucklesby4@comcast.net",
          "Female",
          "0.102.177.91",
        ],
        ["6", "Lilla", "Cattel", "lcattel5@gov.uk", "Female", "253.205.45.62"],
      ].map<Array<CellType>>((row: Array<CellType>) => randomizeRow(row)),
    )
    .padding(1);
}

function randomizeRow(row: Array<CellType>) {
  // return row;
  const rnd = (index: number = row.length) =>
    Math.round(Math.random() * (index - 2)) + 1;
  const styles = [
    bold,
    bold,
    blue,
    green,
    magenta,
    yellow,
    cyan,
    strikethrough,
    underline,
    italic,
    dim,
  ];
  const style = (val: string) => styles[rnd(styles.length)](val);
  const cell: CellType = row[0];

  if (cell instanceof Cell) {
    // cell.setValue( style( cell.toString() ) );
  } else if (cell) {
    row[0] = dim(`#${cell}`);
    for (let i = 0; i < 20; i++) {
      const r = rnd();
      if (typeof row[r] === "string") {
        row[r] = style(row[r] as string);
      }
    }
  }

  const cells: Array<CellType> = row;
  const r1 = rnd();
  if (typeof cells[r1] === "string") {
    cells[r1] = Cell.from(cells[r1]).border();
  }
  return cells;
}
