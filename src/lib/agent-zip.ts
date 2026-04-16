import { strToU8, zipSync } from "fflate";

/** UTF-8 문자열 맵 → ZIP 바이너리 */
export function zipStringFiles(files: Record<string, string>): Uint8Array {
  const out: Record<string, Uint8Array> = {};
  for (const [path, content] of Object.entries(files)) {
    out[path] = strToU8(content, true);
  }
  return zipSync(out, { level: 6 });
}
