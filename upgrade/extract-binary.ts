import type { BinaryAsset, Extension, ExtractFn } from "./provider.ts";
import { AssetNotFoundError } from "./asset-not-found-error.ts";

export interface ExtractBinaryOptions {
  name: string;
}

export async function extractBinary(
  bytes: Uint8Array,
  asset: BinaryAsset,
  options: ExtractBinaryOptions,
): Promise<Uint8Array> {
  const name = asset.name.toLowerCase();

  if (typeof asset.extract === "function") {
    return asset.extract(bytes, asset);
  }
  if (asset.extract) {
    const extract = matchLongestSuffix(name, asset.extract);
    if (extract) {
      return extract(bytes, asset);
    }
  }

  if (name.endsWith(".tar.gz") || name.endsWith(".tgz")) {
    return await extractTarGz(bytes, asset, options);
  }
  if (name.endsWith(".gz")) {
    return await gunzip(bytes);
  }

  return bytes;
}

function matchLongestSuffix(
  name: string,
  extractors: Record<Extension, ExtractFn>,
): ExtractFn | undefined {
  let match: { length: number; extract: ExtractFn } | undefined;
  for (const [suffix, extract] of Object.entries(extractors)) {
    if (
      name.endsWith(suffix.toLowerCase()) &&
      (!match || suffix.length > match.length)
    ) {
      match = { length: suffix.length, extract };
    }
  }
  return match?.extract;
}

async function extractTarGz(
  bytes: Uint8Array,
  asset: BinaryAsset,
  options: ExtractBinaryOptions,
): Promise<Uint8Array> {
  const binaryName = asset.binaryName ?? options.name;
  let entries: Array<string> = [];

  // TODO(bun): drop `extractTarBytes` once bun ships `ReadableStream.from`
  //  (oven-sh/bun#33193).
  if (typeof (ReadableStream as { from?: unknown }).from !== "function") {
    const match = extractTarBytes(await gunzip(bytes), binaryName);
    if (match.binary) {
      return match.binary;
    }
    entries = match.entries;
  } else {
    const { UntarStream } = await import("@std/tar/untar-stream");
    const stream = toStream(bytes)
      .pipeThrough(
        new DecompressionStream("gzip") as unknown as ReadableWritablePair<
          Uint8Array,
          Uint8Array
        >,
      )
      .pipeThrough(new UntarStream());

    for await (const entry of stream) {
      entries.push(entry.path);
      if (entry.readable && matchesBinary(entry.path, binaryName)) {
        return new Uint8Array(await new Response(entry.readable).arrayBuffer());
      }
      await entry.readable?.cancel();
    }
  }

  throw new AssetNotFoundError(
    `Binary "${binaryName}" not found in archive "${asset.name}". Available entries: ${
      entries.join(", ")
    }`,
  );
}

interface TarMatch {
  binary?: Uint8Array;
  entries: Array<string>;
}

function matchesBinary(path: string, binaryName: string): boolean {
  const base = path.split("/").pop() ?? "";
  return base === binaryName || base === `${binaryName}.exe`;
}

/** Minimal tar reader for runtimes without `ReadableStream.from`. */
export function extractTarBytes(tar: Uint8Array, binaryName: string): TarMatch {
  const decoder = new TextDecoder();
  const entries: Array<string> = [];
  for (let offset = 0; offset + 512 <= tar.length;) {
    const header = tar.subarray(offset, offset + 512);
    const name = decoder.decode(header.subarray(0, 100)).replace(/\0.*/s, "");
    if (!name) {
      break;
    }
    const size = parseInt(
      decoder.decode(header.subarray(124, 136)).replace(/\0.*/s, "").trim(),
      8,
    ) || 0;
    const isFile = header[156] === 0x30 || header[156] === 0;
    offset += 512;
    entries.push(name);
    if (isFile && matchesBinary(name, binaryName)) {
      return { binary: tar.slice(offset, offset + size), entries };
    }
    offset += Math.ceil(size / 512) * 512;
  }
  return { entries };
}

async function gunzip(bytes: Uint8Array): Promise<Uint8Array> {
  if ("Bun" in globalThis) {
    const { gunzip: gunzipCb } = await import("node:zlib");
    const { promisify } = await import("node:util");
    return new Uint8Array(await promisify(gunzipCb)(bytes));
  }
  return new Uint8Array(
    await new Response(
      toStream(bytes).pipeThrough(
        new DecompressionStream("gzip") as unknown as ReadableWritablePair<
          Uint8Array,
          Uint8Array
        >,
      ),
    ).arrayBuffer(),
  );
}

export function toStream(
  bytes: Uint8Array,
): ReadableStream<Uint8Array> {
  return new Blob([bytes as BufferSource]).stream();
}
