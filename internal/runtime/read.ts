// deno-lint-ignore-file no-explicit-any

/**
 * Read from stdin.
 *
 * @internal
 * @param data Uint8Array to store the data.
 */
export function read(data: Uint8Array): Promise<number | null> {
  // dnt-shim-ignore
  const { Deno, process, Bun } = globalThis as any;

  if (Deno) {
    return Deno.stdin.read(data);
  } else if (process) {
    return new Promise((resolve, reject) => {
      // bun keeps the stdin handle open after the read, which keeps the
      // event loop alive and stops the process from exiting.
      Bun && process.stdin.ref?.();

      process.stdin.once("readable", () => {
        try {
          const buffer = process.stdin.read();

          if (buffer === null) {
            return resolve(null);
          }

          for (let i = 0; i < buffer.length; i++) {
            data[i] = buffer[i];
          }

          resolve(buffer.length);
        } catch (error) {
          reject(error);
        } finally {
          Bun && process.stdin.unref?.();
        }
      });
    });
  } else {
    throw new Error("unsupported runtime");
  }
}
