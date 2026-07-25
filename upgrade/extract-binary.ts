import type { BinaryAsset, Extension, ExtractFn } from "./provider.ts";
import { AssetNotFoundError } from "./asset-not-found-error.ts";

export interface ExtractBinaryOptions {
  name: string;
}

export async function extractBinary(
  bytes: Uint8Array<ArrayBuffer>,
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
  bytes: Uint8Array<ArrayBuffer>,
  asset: BinaryAsset,
  options: ExtractBinaryOptions,
): Promise<Uint8Array> {
  const { UntarStream } = await import("@std/tar/untar-stream");
  const binaryName = asset.binaryName ?? options.name;
  const stream = toStream(bytes)
    .pipeThrough(new DecompressionStream("gzip"))
    .pipeThrough(new UntarStream());

  const entries: Array<string> = [];
  for await (const entry of stream) {
    entries.push(entry.path);
    const base = entry.path.split("/").pop() ?? "";
    if (
      entry.readable && (base === binaryName || base === `${binaryName}.exe`)
    ) {
      return new Uint8Array(await new Response(entry.readable).arrayBuffer());
    }
    await entry.readable?.cancel();
  }

  throw new AssetNotFoundError(
    `Binary "${binaryName}" not found in archive "${asset.name}". Available entries: ${
      entries.join(", ")
    }`,
  );
}

async function gunzip(bytes: Uint8Array<ArrayBuffer>): Promise<Uint8Array> {
  return new Uint8Array(
    await new Response(
      toStream(bytes).pipeThrough(new DecompressionStream("gzip")),
    ).arrayBuffer(),
  );
}

export function toStream(
  bytes: Uint8Array<ArrayBuffer>,
): ReadableStream<Uint8Array<ArrayBuffer>> {
  return new Blob([bytes]).stream();
}
