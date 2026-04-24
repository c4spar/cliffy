/**
 * A table module to render unicode tables with [Deno](https://deno.com),
 * [Node](https://nodejs.org) and [Bun](https://bun.sh/).
 *
 * > [!NOTE]\
 * > The full documentation can be found at
 * > [cliffy.io](https://cliffy.io/docs/table).
 *
 * ## Usage
 *
 * The table class provides a few chainable option methods. To see a list of all
 * available options see [Table options](https://cliffy.io/docs/table/options).
 *
 * ```ts
 * import { Table } from "@cliffy/table";
 *
 * const table = new Table()
 *   .header(["Name", "Date", "City", "Country"])
 *   .body([
 *     ["Baxter Herman", "Oct 1, 2020", "Harderwijk", "Slovenia"],
 *     ["Jescie Wolfe", "Dec 4, 2020", "Alto Hospicio", "Japan"],
 *     ["Allegra Cleveland", "Apr 16, 2020", "Avernas-le-Bauduin", "Samoa"],
 *   ])
 *   .maxColWidth(10)
 *   .padding(1)
 *   .indent(2)
 *   .border(true)
 *   .render();
 *
 * table.push(["Aretha Gamble", "Feb 22, 2021", "Honolulu", "Georgia"]);
 * table.sort();
 * table.render();
 * ```
 *
 * @module
 */

export { type Border, border } from "./border.ts";
export { Cell, type CellType, type CellValue, type Direction } from "./cell.ts";
export { Column, type ColumnOptions } from "./column.ts";
export { consumeWords } from "./consume_words.ts";
export { type DataRow, Row, type RowType } from "./row.ts";
export { type BorderOptions, Table, type TableType } from "./table.ts";
