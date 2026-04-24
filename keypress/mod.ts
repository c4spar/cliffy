/**
 * A Keypress module with promise, async iterator and event target API for
 * [Deno](https://deno.com), [Node](https://nodejs.org) and [Bun](https://bun.sh/).
 *
 * > [!NOTE]\
 * > The full documentation can be found at
 * > [cliffy.io](https://cliffy.io/docs/keypress).
 *
 * ## Usage
 *
 * ### Promise
 *
 * Await a single `KeyPressEvent` event:
 *
 * ```ts
 * import { keypress, KeyPressEvent } from "@cliffy/keypress";
 *
 * const event: KeyPressEvent = await keypress();
 *
 * console.log("key: %s", event.key);
 * ```
 *
 * ### Async Iterator
 *
 * Listen to `KeyPressEvent` events via async iterator:
 *
 * ```ts
 * import { Keypress, keypress } from "@cliffy/keypress";
 *
 * for await (const event of keypress()) {
 *   console.log("key: %s", event.key);
 *
 *   if (event.ctrlKey && event.key === "c") {
 *     console.log("exit");
 *     break;
 *   }
 * }
 * ```
 *
 * ### Event Target
 *
 * Listen to `KeyPressEvent` events via event listener:
 *
 * ```ts
 * import { keypress, KeyPressEvent } from "@cliffy/keypress";
 *
 * keypress().addEventListener("keydown", (event: KeyPressEvent) => {
 *   console.log("key: %s", event.key);
 *
 *   if (event.ctrlKey && event.key === "c") {
 *     console.log("exit");
 *     keypress().dispose();
 *   }
 * });
 * ```
 *
 * @module
 */

import { type KeyCode, parse } from "@cliffy/keycode";
import { setRaw } from "@cliffy/internal/runtime/set-raw";
import { read } from "@cliffy/internal/runtime/read";

type KeyPressEventType = "keydown";

/** Keypress event options. */
export interface KeyPressEventInit extends EventInit, KeyCode {
  /** Indicates if the alt key is pressed. */
  alt?: boolean;
  /** Indicates if the key was pressed multiple times. */
  repeat?: boolean;
}

/** Keypress event listener. */
export type KeyPressEventListener = (
  evt: KeyPressEvent,
) => void | Promise<void>;

/** Keypress event listener object. */
export interface KeyPressEventListenerObject {
  handleEvent(evt: KeyPressEvent): void | Promise<void>;
}

/** Keypress event listener or event listener object. */
export type KeyPressEventListenerOrEventListenerObject =
  | KeyPressEventListener
  | KeyPressEventListenerObject;

/** Keypress event. */
export class KeyPressEvent extends Event {
  /** Key name. */
  public readonly key?: string;
  /** Key string value. */
  public readonly char?: string;
  /** Key sequence. */
  public readonly sequence?: string;
  /** Key code. */
  public readonly code?: string;
  /** Indicates if the ctrl key is pressed. */
  public readonly ctrlKey: boolean;
  /** Indicates if the meta key is pressed. */
  public readonly metaKey: boolean;
  /** Indicates if the shift key is pressed. */
  public readonly shiftKey: boolean;
  /** Indicates if the alt key is pressed. */
  public readonly altKey: boolean;
  /** Indicates if the key was pressed multiple times. */
  public readonly repeat: boolean;

  constructor(
    type: KeyPressEventType,
    eventInitDict: KeyPressEventInit,
  ) {
    super(type, eventInitDict);
    this.key = eventInitDict.name;
    this.char = eventInitDict.char;
    this.sequence = eventInitDict.sequence;
    this.code = eventInitDict.code;
    this.ctrlKey = eventInitDict.ctrl ?? false;
    this.metaKey = eventInitDict.meta ?? false;
    this.shiftKey = eventInitDict.shift ?? false;
    this.altKey = eventInitDict.alt ?? false;
    this.repeat = eventInitDict.repeat ?? false;
  }
}

type Resolver<T> = (value: T | PromiseLike<T>) => void;
type Reject = (error: Error) => void;

interface PullQueueItem {
  resolve: Resolver<KeyPressEvent | null>;
  reject: Reject;
}

/** Keypress class. */
export class Keypress extends EventTarget
  implements AsyncIterableIterator<KeyPressEvent>, PromiseLike<KeyPressEvent> {
  #disposed = false;
  #pullQueue: PullQueueItem[] = [];
  #pushQueue: (KeyPressEvent | null)[] = [];
  #lastEvent?: KeyPressEvent;
  #listeners: Record<
    KeyPressEventType,
    Set<EventListenerOrEventListenerObject | null>
  > = {
    keydown: new Set(),
  };

  [Symbol.asyncIterator](): AsyncIterableIterator<KeyPressEvent> {
    return this;
  }

  /** Indicates if event loop is disposed. */
  get disposed(): boolean {
    return this.#disposed;
  }

  async next(): Promise<IteratorResult<KeyPressEvent>> {
    const event: KeyPressEvent | null | false = !this.#disposed &&
      await this.#pullEvent();

    return event && !this.#disposed
      ? { done: false, value: event }
      : { done: true, value: undefined };
  }

  then<T, S>(
    f: (v: KeyPressEvent) => T | Promise<T>,
    g?: (v: Error) => S | Promise<S>,
  ): Promise<T | S> {
    return this.next()
      .then(({ value }) => {
        this.dispose();
        return value;
      })
      .then(f)
      .catch(g);
  }

  /**
   * Add keydown event listener.
   *
   * @param type      Event type.
   * @param listener  Event listener.
   * @param options   Event listener options.
   */
  override addEventListener(
    type: "keydown",
    listener: KeyPressEventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ): void;
  override addEventListener(
    type: KeyPressEventType,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ): void {
    if (!this.#hasListeners()) {
      void this.#eventLoop();
    }
    super.addEventListener(type, listener, options);
    this.#listeners[type].add(listener);
  }

  /**
   * Remove keydown event listener.
   *
   * @param type      Event type.
   * @param listener  Event listener.
   * @param options   Event listener options.
   */
  override removeEventListener(
    type: "keydown",
    listener: KeyPressEventListenerOrEventListenerObject | null,
    options?: EventListenerOptions | boolean,
  ): void;
  override removeEventListener(
    type: KeyPressEventType,
    listener: EventListenerOrEventListenerObject | null,
    options?: EventListenerOptions | boolean,
  ): void {
    super.removeEventListener(type, listener, options);
    this.#listeners[type].delete(listener);
  }

  /**
   * Dispose event loop.
   *
   * @param error If an error is passed, the event loop will throw an error.
   */
  dispose(error?: Error) {
    if (this.#disposed) {
      throw new Error("KeyCodeStream already disposed");
    }
    this.#disposed = true;
    if (this.#pullQueue.length > 0) {
      const { resolve, reject } = this.#pullQueue[0];
      this.#pullQueue.shift();
      error ? reject(error) : resolve(null);
    }
  }

  #eventLoop = async (): Promise<void> => {
    if (this.#disposed) {
      return;
    }
    await this.#read();

    // Jump into the next cycle of deno's event loop.
    await new Promise((resolve) => setTimeout(resolve));

    // Stop event loop if there are no listeners available.
    if (this.#pullQueue.length || this.#hasListeners()) {
      await this.#eventLoop();
    }
  };

  #read = async (): Promise<void> => {
    const buffer = new Uint8Array(8);
    setRaw(true);
    const nread: number | null = await read(buffer).catch(
      (error) => {
        if (!this.#disposed) {
          this.dispose(error);
        }
        return null;
      },
    );
    setRaw(false);

    if (this.#disposed) {
      return;
    }

    let keys: Array<KeyCode>;
    try {
      keys = nread === null ? parse(buffer) : parse(buffer.subarray(0, nread));
    } catch (_) {
      // Ignore invalid characters and read again from stdin.
      return this.#read();
    }

    this.#dispatch(keys);
  };

  #dispatch = (keys: Array<KeyCode>): void => {
    for (const key of keys) {
      const event = new KeyPressEvent("keydown", {
        ...key,
        cancelable: true,
        repeat: this.#lastEvent && this.#lastEvent.sequence === key.sequence &&
          Date.now() - this.#lastEvent.timeStamp < 100,
      });
      if (this.#pullQueue.length || !this.#hasListeners()) {
        this.#pushEvent(event);
      }
      if (this.#hasListeners()) {
        // const canceled = !this.dispatchEvent(event);
        // if (canceled || this.#disposed) {
        // if (this.#disposed) {
        //   if (!this.#disposed) {
        //     this.dispose();
        //   }
        //   break;
        // }
        this.dispatchEvent(event);
        if (this.#disposed) {
          break;
        }
      }
      this.#lastEvent = event;
    }
  };

  #pushEvent = (event: KeyPressEvent): void => {
    if (this.#pullQueue.length > 0) {
      const { resolve } = this.#pullQueue.shift() as PullQueueItem;
      resolve(event);
    } else {
      this.#pushQueue.push(event);
    }
  };

  #pullEvent = async (): Promise<KeyPressEvent | null> => {
    if (!this.#hasListeners()) {
      await this.#read();
    }
    return new Promise<KeyPressEvent | null>(
      (resolve: Resolver<KeyPressEvent | null>, reject: Reject) => {
        if (this.#pushQueue.length > 0) {
          const event: KeyPressEvent | null = this.#pushQueue.shift() ?? null;
          resolve(event);
        } else {
          this.#pullQueue.push({ resolve, reject });
        }
      },
    );
  };

  #hasListeners = (): boolean => {
    return Object.values(this.#listeners).some((listeners) => listeners.size);
  };
}

let keyPress: Keypress;

/**
 * Listens to keypress events.
 *
 * ### Promise
 *
 * ```
 * import { keypress, KeyPressEvent } from "./mod.ts";
 *
 * const event: KeyPressEvent = await keypress();
 *
 * console.log(event);
 * ```
 *
 * ### Async Iterator
 *
 * ```ts
 * import { keypress, KeyPressEvent } from "./mod.ts";
 *
 * console.log("Press ctrl+c to exit.");
 *
 * for await (const event of keypress()) {
 *   console.log(event);
 *
 *   if (event.ctrlKey && event.key === "c") {
 *     console.log("exit");
 *     break;
 *   }
 * }
 * ```
 *
 * ### Event Target
 *
 * ```
 * import { keypress, KeyPressEvent } from "./mod.ts";
 *
 * keypress().addEventListener("keydown", (event: KeyPressEvent) => {
 *   console.log(event);
 *
 *   if (event.ctrlKey && event.key === "c") {
 *     console.log("exit");
 *     keypress().dispose();
 *   }
 * });
 * ```
 */
export function keypress(): Keypress {
  if (!keyPress || keyPress.disposed) {
    keyPress = new Keypress();
  }
  return keyPress;
}
