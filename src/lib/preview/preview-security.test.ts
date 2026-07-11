import { expect, test } from "bun:test";
import type { SatgatDocumentData } from "@/lib/templates/types";
import {
  DraftStorageError,
  createDraft,
  readDraft,
  removeDraft,
  replaceCurrentDraft,
} from "./draft-storage";
import { isDraftId } from "./draft-id";
import {
  encodeSharePayload,
  resolvePreviewSource,
} from "./share-payload";
import {
  finishPdfAttempt,
  invalidatePdfAttempt,
  startPdfAttempt,
  type PdfAttemptState,
} from "./pdf-attempt";

const documentData: SatgatDocumentData = {
  templateId: "resume",
  slots: { name: "김수민" },
};

class FakeStorage {
  readonly values = new Map<string, string>();
  fail: "get" | "set" | "remove" | null = null;

  getItem(key: string): string | null {
    if (this.fail === "get") throw new DOMException("denied", "SecurityError");
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    if (this.fail === "set") throw new DOMException("full", "QuotaExceededError");
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    if (this.fail === "remove") throw new DOMException("denied", "SecurityError");
    this.values.delete(key);
  }
}

const fixedId = "8dc1d22e-95cb-4f36-83a8-0112d0f28647";

test("draft storage creates, reads, removes, and isolates UUID keys", () => {
  const storage = new FakeStorage();
  const id = createDraft(documentData, { storage, randomUUID: () => fixedId });

  expect(id).toBe(fixedId);
  expect(readDraft(id, { storage })).toEqual(documentData);
  expect(readDraft("24fb2f6d-4d4a-4873-ad04-fb5e90e60f45", { storage })).toBeNull();
  removeDraft(id, { storage });
  expect(readDraft(id, { storage })).toBeNull();
});


test("current draft retention survives client remounts and stays bounded", () => {
  const storage = new FakeStorage();
  const secondId = "24fb2f6d-4d4a-4873-ad04-fb5e90e60f45";
  let nextId = fixedId;
  const randomUUID = () => nextId;

  expect(replaceCurrentDraft(documentData, { storage, randomUUID })).toBe(fixedId);
  nextId = secondId;
  expect(replaceCurrentDraft({
    ...documentData,
    slots: { name: "재방문 문서" },
  }, { storage, randomUUID })).toBe(secondId);

  expect(readDraft(fixedId, { storage })).toBeNull();
  expect(readDraft(secondId, { storage })).toEqual({
    ...documentData,
    slots: { name: "재방문 문서" },
  });
  expect(storage.values.size).toBe(2);
});

test("draft storage wraps crypto and Storage failures with stable friendly copy", () => {
  const storage = new FakeStorage();
  storage.fail = "set";
  expect(() => createDraft(documentData, { storage, randomUUID: () => fixedId })).toThrow(DraftStorageError);

  storage.fail = "get";
  try {
    readDraft(fixedId, { storage });
    throw new Error("expected readDraft to throw");
  } catch (error) {
    expect(error).toBeInstanceOf(DraftStorageError);
    expect((error as DraftStorageError).userMessage).toBe("임시 문서를 저장하거나 불러올 수 없습니다. 브라우저 저장 공간을 확인해 주세요.");
  }

  storage.fail = "remove";
  expect(() => removeDraft(fixedId, { storage })).toThrow(DraftStorageError);

  expect(() => createDraft(documentData, { storage: new FakeStorage(), randomUUID: () => { throw new Error("crypto unavailable"); } })).toThrow(DraftStorageError);
});

test("shared UUID validation rejects non-v4 and nil identifiers", () => {
  expect(isDraftId(fixedId)).toBe(true);
  expect(isDraftId("8dc1d22e-95cb-1f36-83a8-0112d0f28647")).toBe(false);
  expect(isDraftId("00000000-0000-0000-0000-000000000000")).toBe(false);
});

test("share source gives a non-empty fragment precedence and fails closed", () => {
  const shared = { ...documentData, slots: { name: "공유 문서" } };
  const draft = { ...documentData, slots: { name: "임시 문서" } };
  const read = () => draft;

  expect(resolvePreviewSource(`#share=${encodeSharePayload(shared)}`, fixedId, read)).toEqual({ value: shared, source: "share" });
  expect(resolvePreviewSource("#share=%%%", fixedId, read)).toEqual({ value: null, source: "invalid-share" });
  expect(resolvePreviewSource("#share=", fixedId, read)).toEqual({ value: draft, source: "draft" });
  expect(resolvePreviewSource("", null, read)).toEqual({ value: null, source: "missing" });
});

test("stale PDF completions cannot overwrite the latest attempt", () => {
  const initial: PdfAttemptState = { attempt: 0, status: "idle" };
  const first = startPdfAttempt(initial);
  const second = startPdfAttempt(first);
  const sourceChanged = invalidatePdfAttempt(second.attempt);

  expect(finishPdfAttempt(second, first.attempt, "error")).toEqual(second);
  expect(finishPdfAttempt(second, second.attempt, "error")).toEqual({ attempt: 2, status: "error" });
  expect(startPdfAttempt({ attempt: 2, status: "error" })).toEqual({ attempt: 3, status: "loading" });
  expect(finishPdfAttempt(sourceChanged, second.attempt, "idle")).toEqual(sourceChanged);
});
