import type { Direction } from "./cell.ts";

/** Column options. */
export interface ColumnOptions {
  /** Enable/disable cell border. */
  border?: boolean;
  /** Cell cell alignment direction. */
  align?: Direction;
  /** Set min column width. */
  minWidth?: number;
  /** Set max column width. */
  maxWidth?: number;
  /** Set cell padding. */
  padding?: number;
  /**
   * Set column flex-shrink weight. Follows CSS flex-shrink semantics: reduction
   * is proportional to `weight × width`. 0 = no shrink (default), >= 1 = shrinkable.
   */
  flexShrink?: number;
  /**
   * Set column flex-grow weight. Follows CSS flex-grow semantics: available
   * slack is distributed proportionally by weight. 0 = no grow (default), >= 1 = growable.
   */
  flexGrow?: number;
}

/**
 * Column representation.
 *
 * Can be used to customize a single column.
 *
 * ```ts
 * import { Column, Table } from "./mod.ts";
 *
 * new Table()
 *   .body([
 *     ["Foo", "bar"],
 *     ["Beep", "Boop"],
 *   ])
 *   .column(0, new Column().border())
 *   .render();
 * ```
 */
export class Column {
  /**
   * Create a new cell from column options or an existing column.
   * @param options
   */
  static from(options: ColumnOptions | Column): Column {
    const opts = options instanceof Column ? options.opts : options;
    return new Column().options(opts);
  }

  protected opts: ColumnOptions = {};

  /** Set column options. */
  options(options: ColumnOptions): this {
    Object.assign(this.opts, options);
    return this;
  }

  /** Set min column width. */
  minWidth(width: number): this {
    this.opts.minWidth = width;
    return this;
  }

  /** Set max column width. */
  maxWidth(width: number): this {
    this.opts.maxWidth = width;
    return this;
  }

  /** Set column border. */
  border(border = true): this {
    this.opts.border = border;
    return this;
  }

  /** Set column padding. */
  padding(padding: number): this {
    this.opts.padding = padding;
    return this;
  }

  /** Set column alignment. */
  align(direction: Direction): this {
    this.opts.align = direction;
    return this;
  }

  /**
   * Set column flex-shrink weight. Follows CSS flex-shrink semantics: each
   * column's share of the reduction is proportional to `weight × width`, so
   * a wider column or one with a higher weight absorbs more of the overflow.
   * 0 = rigid (never shrinks), 1 = default. See MDN flex-shrink for full detail.
   */
  flexShrink(weight = 1): this {
    this.opts.flexShrink = weight;
    return this;
  }

  /**
   * Set column flex-grow weight. Follows CSS flex-grow semantics: available
   * slack is distributed proportionally by weight, so weight 2 receives twice
   * the extra space of weight 1. 0 = no grow.
   * See MDN flex-grow for full detail.
   */
  flexGrow(weight = 1): this {
    this.opts.flexGrow = weight;
    return this;
  }

  /**
   * Shorthand to set both flex-grow and flex-shrink to the same value. Follows
   * CSS flex semantics: the column will both expand into and contract out of
   * available space proportionally. 0 = rigid.
   * See MDN flex for full detail.
   */
  flex(weight = 1): this {
    this.opts.flexGrow = weight;
    this.opts.flexShrink = weight;
    return this;
  }

  /** Get min column width. */
  getMinWidth(): number | undefined {
    return this.opts.minWidth;
  }

  /** Get max column width. */
  getMaxWidth(): number | undefined {
    return this.opts.maxWidth;
  }

  /** Get column border. */
  getBorder(): boolean | undefined {
    return this.opts.border;
  }

  /** Get column padding. */
  getPadding(): number | undefined {
    return this.opts.padding;
  }

  /** Get column alignment. */
  getAlign(): Direction | undefined {
    return this.opts.align;
  }

  /** Get column flex-shrink weight. */
  getFlexShrink(): number | undefined {
    return this.opts.flexShrink;
  }

  /** Get column flex-grow weight. */
  getFlexGrow(): number | undefined {
    return this.opts.flexGrow;
  }
}
