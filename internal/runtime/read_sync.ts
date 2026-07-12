// deno-lint-ignore-file no-explicit-any

type ReadSyncNode = (
  fd: number,
  buffer: Uint8Array,
  offset: number,
  length: number,
  position: number | null,
) => number;

let readSyncNode: ReadSyncNode | null | undefined;

/**
 * Read from stdin.
 *
 * @internal
 * @param data Uint8Array to store the data.
 */
export function readSync(data: Uint8Array): number {
  // dnt-shim-ignore
  const { Deno, process, Buffer } = globalThis as any;

  if (Deno) {
    return Deno.stdin.readSync(data);
  }

  if (process) {
    const read: ReadSyncNode = readSyncNode ??=
      process.getBuiltinModule("node:fs").readSync;

    const buffer = Buffer.alloc(data.byteLength);
    const bytesRead = read(
      process.stdout.fd,
      buffer,
      0,
      buffer.length,
      null,
    );

    for (let i = 0; i < bytesRead; i++) {
      data[i] = buffer[i];
    }

    return bytesRead;
  }

  throw new Error("unsupported runtime");
}
