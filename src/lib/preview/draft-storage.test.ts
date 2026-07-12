import { expect, test } from "bun:test";
import type { SatgatDocumentData } from "@/lib/templates/types";
import {
  draftStorageKey,
  isDocumentData,
  isDraftId,
} from "./draft-storage";
import {
  decodeSharePayload,
  encodeSharePayload,
  MAX_SHARE_PAYLOAD_BYTES,
  SharePayloadTooLargeError,
  SHARE_PAYLOAD_TOO_LARGE_MESSAGE,
} from "./share-payload";

const data: SatgatDocumentData = {
  templateId: "resume",
  slots: {
    name: "김수민",
    title: "프론트엔드 엔지니어",
    experiences: [{ title: "경력", description: "성과" }],
  },
};

test("share payload round-trips Unicode as URL-fragment-safe base64url", () => {
  const encoded = encodeSharePayload(data);

  expect(encoded).not.toContain("+");
  expect(encoded).not.toContain("/");
  expect(encoded).not.toContain("=");
  expect(decodeSharePayload(encoded)).toEqual(data);
});

test("malformed share payloads decode to null", () => {
  expect(decodeSharePayload("")).toBeNull();
  expect(decodeSharePayload("%%%not-base64url%%%")).toBeNull();
  expect(decodeSharePayload("e30")).toEqual({});
  expect(decodeSharePayload("bm90LWpzb24")).toBeNull();
});

test("share codec accepts exactly 64 KiB and rejects one UTF-8 byte over", () => {
  const payloadAt = (byteLength: number): SatgatDocumentData => {
    const empty: SatgatDocumentData = {
      templateId: "resume",
      slots: { name: "" },
    };
    const overhead = new TextEncoder().encode(JSON.stringify(empty)).byteLength;
    return {
      ...empty,
      slots: { name: "a".repeat(byteLength - overhead) },
    };
  };
  const exact = payloadAt(MAX_SHARE_PAYLOAD_BYTES);
  const oneByteOver = payloadAt(MAX_SHARE_PAYLOAD_BYTES + 1);

  expect(new TextEncoder().encode(JSON.stringify(exact))).toHaveLength(
    MAX_SHARE_PAYLOAD_BYTES,
  );
  expect(decodeSharePayload(encodeSharePayload(exact))).toEqual(exact);
  let clipboardCalled = false;
  const copyOversizedShare = () => {
    encodeSharePayload(oneByteOver);
    clipboardCalled = true;
  };
  expect(copyOversizedShare).toThrow(SHARE_PAYLOAD_TOO_LARGE_MESSAGE);
  expect(clipboardCalled).toBe(false);
  try {
    encodeSharePayload(oneByteOver);
  } catch (error) {
    expect(error).toBeInstanceOf(SharePayloadTooLargeError);
    expect((error as SharePayloadTooLargeError).userMessage).toBe(
      SHARE_PAYLOAD_TOO_LARGE_MESSAGE,
    );
  }

  const oversizedBytes = new TextEncoder().encode(JSON.stringify(oneByteOver));
  let binary = "";
  for (const byte of oversizedBytes) binary += String.fromCharCode(byte);
  const oversizedFragment = btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
  const originalAtob = globalThis.atob;
  let atobCalled = false;
  globalThis.atob = (value) => {
    atobCalled = true;
    return originalAtob(value);
  };
  try {
    expect(decodeSharePayload(oversizedFragment)).toBeNull();
    expect(atobCalled).toBe(false);
  } finally {
    globalThis.atob = originalAtob;
  }
});

test("draft IDs use opaque UUID values and stable session keys", () => {
  const id = "8dc1d22e-95cb-4f36-83a8-0112d0f28647";

  expect(isDraftId(id)).toBe(true);
  expect(isDraftId(id.toUpperCase())).toBe(true);
  expect(draftStorageKey(id)).toBe(
    "satgat:draft:8dc1d22e-95cb-4f36-83a8-0112d0f28647",
  );
  expect(isDraftId("eyJ0ZW1wbGF0ZUlkIjoicmVzdW1lIn0")).toBe(false);
  expect(isDraftId("00000000-0000-0000-0000-000000000000")).toBe(false);
  expect(isDraftId(null)).toBe(false);
});

test("document guard narrows only object-shaped unknown values", () => {
  expect(isDocumentData(data)).toBe(true);
  expect(isDocumentData(JSON.parse(JSON.stringify(data)) as unknown)).toBe(true);
  expect(isDocumentData(null)).toBe(false);
  expect(isDocumentData({ templateId: "resume", slots: [] })).toBe(false);
  expect(isDocumentData({ templateId: 1, slots: {} })).toBe(false);
  expect(isDocumentData({ templateId: "resume" })).toBe(false);
});
