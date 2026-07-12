import { MAX_PRIVATE_TRANSPORT_BYTES } from "@/lib/engine/slot-schema";

export const MAX_EXPORT_REQUEST_BYTES = MAX_PRIVATE_TRANSPORT_BYTES + 16_384;

export type BoundedJsonResult =
  | { ok: true; value: unknown }
  | { ok: false; reason: "missing" | "invalid" | "too-large" };

export async function readBoundedJsonBody(
  request: Request,
  maxBytes = MAX_EXPORT_REQUEST_BYTES,
): Promise<BoundedJsonResult> {
  const declaredLength = request.headers.get("content-length");
  if (declaredLength !== null) {
    const bytes = Number(declaredLength);
    if (!Number.isSafeInteger(bytes) || bytes < 0) {
      return { ok: false, reason: "invalid" };
    }
    if (bytes > maxBytes) return { ok: false, reason: "too-large" };
  }
  if (!request.body) return { ok: false, reason: "missing" };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      await reader.cancel("Export request exceeds the private transport capacity");
      return { ok: false, reason: "too-large" };
    }
    chunks.push(value);
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    const json = new TextDecoder("utf-8", { fatal: true }).decode(body);
    return { ok: true, value: JSON.parse(json) as unknown };
  } catch {
    return { ok: false, reason: "invalid" };
  }
}
