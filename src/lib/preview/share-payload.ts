import type { SatgatDocumentData } from "@/lib/templates/types";
// Browser share URLs need a much smaller budget than private draft/export storage.
// 64 KiB of UTF-8 JSON stays responsive across practical fragment navigation.
export const MAX_SHARE_PAYLOAD_BYTES = 64 * 1024;
export const SHARE_PAYLOAD_TOO_LARGE_MESSAGE =
  "공유 링크에 담기에는 문서가 너무 큽니다. 내용을 줄인 뒤 다시 시도해 주세요.";

export class SharePayloadTooLargeError extends Error {
  readonly userMessage = SHARE_PAYLOAD_TOO_LARGE_MESSAGE;

  constructor() {
    super(SHARE_PAYLOAD_TOO_LARGE_MESSAGE);
    this.name = "SharePayloadTooLargeError";
  }
}

const BASE64URL = /^[A-Za-z0-9_-]+$/;
const MAX_ENCODED_SHARE_LENGTH = Math.ceil(MAX_SHARE_PAYLOAD_BYTES * 4 / 3);

export function encodeSharePayload(data: SatgatDocumentData): string {
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  if (bytes.byteLength > MAX_SHARE_PAYLOAD_BYTES) {
    throw new SharePayloadTooLargeError();
  }
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

export function decodeSharePayload(value: string): unknown | null {
  if (
    value.length > MAX_ENCODED_SHARE_LENGTH ||
    !BASE64URL.test(value) ||
    value.length % 4 === 1
  ) return null;

  try {
    const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    if (bytes.byteLength > MAX_SHARE_PAYLOAD_BYTES) return null;
    const json = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return JSON.parse(json) as unknown;
  } catch {
    return null;
  }
}

export type PreviewSource =
  | { value: unknown; source: "share" | "draft" }
  | { value: null; source: "invalid-share" | "missing" };

export function resolvePreviewSource(
  hash: string,
  draftId: string | null,
  readDraftValue: (id: string) => unknown | null,
): PreviewSource {
  const share = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash).get("share");
  if (share) {
    const value = decodeSharePayload(share);
    return value === null
      ? { value: null, source: "invalid-share" }
      : { value, source: "share" };
  }
  if (draftId) return { value: readDraftValue(draftId), source: "draft" };
  return { value: null, source: "missing" };
}
