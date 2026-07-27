import { basename, dirname, join } from "@std/path";
import { dim } from "@std/fmt/colors";
import { chmod } from "@cliffy/internal/runtime/chmod";
import { getExecPath } from "@cliffy/internal/runtime/get-exec-path";
import { getOs } from "@cliffy/internal/runtime/get-os";
import { mkdir } from "@cliffy/internal/runtime/mkdir";
import { remove } from "@cliffy/internal/runtime/remove";
import { rename } from "@cliffy/internal/runtime/rename";
import { stat } from "@cliffy/internal/runtime/stat";
import { writeFile } from "@cliffy/internal/runtime/write-file";
import type { BinaryAsset } from "./provider.ts";
import type { Logger } from "./logger.ts";
import { extractBinary } from "./extract-binary.ts";

export interface InstallBinaryOptions {
  name: string;
  location?: string;
  logger?: Logger;
}

export async function installBinary(
  asset: BinaryAsset,
  options: InstallBinaryOptions,
): Promise<void> {
  const targetPath = await resolveTargetPath(options);
  const windows = getOs() === "windows";

  options.logger?.log(dim("  - downloading: %s"), asset.url);
  const response = await fetch(asset.url, { headers: asset.headers });
  if (!response.ok) {
    throw new Error(
      `Failed to download ${asset.name}: ${response.status} ${response.statusText}`,
    );
  }
  const data = new Uint8Array(await response.arrayBuffer());
  const binary = await extractBinary(data, asset, options);

  const targetDir = dirname(targetPath);
  await mkdir(targetDir);
  const tempPath = join(
    targetDir,
    `.${basename(targetPath)}.tmp-${crypto.randomUUID()}`,
  );
  try {
    await writeFile(tempPath, binary);
    await chmod(tempPath, 0o755);
    options.logger?.log(dim("  - installing: %s"), targetPath);
    await swapBinary(tempPath, targetPath, { windows });
  } catch (error) {
    await remove(tempPath).catch(() => {});
    throw error;
  }
}

export async function swapBinary(
  tempPath: string,
  targetPath: string,
  { windows }: { windows: boolean },
): Promise<void> {
  if (!windows) {
    await rename(tempPath, targetPath);
    return;
  }

  const backupPath = `${targetPath}.old`;
  await remove(backupPath).catch(() => {});

  let moved = false;
  try {
    await rename(targetPath, backupPath);
    moved = true;
  } catch (error) {
    if (!isNotFoundError(error)) {
      throw error;
    }
  }

  try {
    await rename(tempPath, targetPath);
  } catch (error) {
    if (moved) {
      await rename(backupPath, targetPath).catch(() => {});
    }
    throw error;
  }

  if (moved) {
    await remove(backupPath).catch(() => {});
  }
}

async function resolveTargetPath(
  options: InstallBinaryOptions,
): Promise<string> {
  const location = options.location ?? getExecPath();
  const fileName = getOs() === "windows" ? `${options.name}.exe` : options.name;

  if (location.endsWith("/") || location.endsWith("\\")) {
    return join(location, fileName);
  }
  try {
    const info = await stat(location);
    if (info.isDirectory) {
      return join(location, fileName);
    }
  } catch (error) {
    if (isPermissionDeniedError(error)) {
      throw error;
    }
  }
  return location;
}

export function isPermissionDeniedError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  const code = (error as { code?: string }).code;
  return error.name === "PermissionDenied" || code === "EACCES" ||
    code === "EPERM";
}

function isNotFoundError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  return error.name === "NotFound" ||
    (error as { code?: string }).code === "ENOENT";
}
