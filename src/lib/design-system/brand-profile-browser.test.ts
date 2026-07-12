import { expect, test } from "bun:test";
import {
  loadBrandProfileFromStorage,
  removeBrandProfileFromStorage,
  saveBrandProfileToStorage,
} from "./brand-profile-browser";
import type { BrowserBrandProfile } from "./brand-resolver";

const STORAGE_KEY = "satgat-brand-profile";

function memoryStorage(initial?: string) {
  const values = new Map<string, string>();
  if (initial !== undefined) values.set(STORAGE_KEY, initial);
  return {
    values,
    storage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => {
        values.set(key, value);
      },
      removeItem: (key: string) => {
        values.delete(key);
      },
    },
  };
}

test("explicit save writes the normalized browser profile", () => {
  const { values, storage } = memoryStorage();

  expect(values.has(STORAGE_KEY)).toBe(false);
  expect(saveBrandProfileToStorage({ name: "  결 스튜디오  " }, storage)).toBe(true);
  expect(values.get(STORAGE_KEY)).toBe('{"name":"결 스튜디오"}');
});

test("removes the established browser profile key", () => {
  const { values, storage } = memoryStorage('{"name":"결 스튜디오"}');

  expect(removeBrandProfileFromStorage(storage)).toBe(true);
  expect(values.has(STORAGE_KEY)).toBe(false);
});

test("email-only legacy storage loads as no active browser profile without mutation", () => {
  const initial = '{"email":"hidden@gyeol.example"}';
  const { values, storage } = memoryStorage(initial);

  expect(loadBrandProfileFromStorage(storage)).toEqual({ profile: null, failed: false });
  expect(values.get(STORAGE_KEY)).toBe(initial);
});

test("mixed legacy storage projects visible fields without persisting hidden email", () => {
  const initial = '{"name":" 결 스튜디오 ","email":"hidden@gyeol.example","tone":" 단정하게 "}';
  const { values, storage } = memoryStorage(initial);

  expect(loadBrandProfileFromStorage(storage)).toEqual({
    profile: { name: "결 스튜디오", tone: "단정하게" },
    failed: false,
  });
  expect(values.get(STORAGE_KEY)).toBe(initial);

  expect(saveBrandProfileToStorage({ name: "결 스튜디오", tone: "단정하게" }, storage)).toBe(true);
  expect(values.get(STORAGE_KEY)).toBe('{"name":"결 스튜디오","tone":"단정하게"}');
  expect(values.get(STORAGE_KEY)).not.toContain("email");
});

test("legacy records project visible fields while recognizing every baseline-only key", () => {
  for (const [initial, expected] of [
    [
      '{"name":" 결 스튜디오 ","github":"gyeol"}',
      { profile: { name: "결 스튜디오" }, failed: false },
    ],
    [
      '{"name":" 결 스튜디오 ","brandColor":"#123456","body":"내부 메모"}',
      { profile: { name: "결 스튜디오" }, failed: false },
    ],
  ] as const) {
    const { values, storage } = memoryStorage(initial);

    expect(loadBrandProfileFromStorage(storage)).toEqual(expected);
    expect(values.get(STORAGE_KEY)).toBe(initial);
  }
});

test("legacy records containing only hidden baseline fields load as empty without mutation", () => {
  for (const initial of [
    '{"email":"hidden@gyeol.example"}',
    '{"github":"gyeol"}',
    '{"brandColor":"#123456"}',
    '{"language":"ko"}',
    '{"body":"내부 메모"}',
    '{"email":"hidden@gyeol.example","github":"gyeol","brandColor":"#123456","language":"ko","body":"내부 메모"}',
  ]) {
    const { values, storage } = memoryStorage(initial);

    expect(loadBrandProfileFromStorage(storage)).toEqual({ profile: null, failed: false });
    expect(values.get(STORAGE_KEY)).toBe(initial);
  }
});

test("legacy projection rejects mixed records containing an unknown key", () => {
  const initial = '{"name":"결 스튜디오","github":"gyeol","unknown":"private"}';
  const { values, storage } = memoryStorage(initial);

  expect(loadBrandProfileFromStorage(storage)).toEqual({ profile: null, failed: true });
  expect(values.get(STORAGE_KEY)).toBe(initial);
});

test("save rejects runtime objects containing email without changing storage", () => {
  const initial = '{"name":"기존"}';
  const { values, storage } = memoryStorage(initial);
  const unsafeProfile: unknown = {
    name: "결 스튜디오",
    email: "hidden@gyeol.example",
  };

  expect(saveBrandProfileToStorage(unsafeProfile as BrowserBrandProfile, storage)).toBe(false);
  expect(values.get(STORAGE_KEY)).toBe(initial);
});

test("reports storage failures without throwing", () => {
  const failure = new Error("quota detail must stay internal");
  const storage = {
    getItem: () => { throw failure; },
    setItem: () => { throw failure; },
    removeItem: () => { throw failure; },
  };

  expect(loadBrandProfileFromStorage(storage)).toEqual({ profile: null, failed: true });
  expect(saveBrandProfileToStorage({ name: "결 스튜디오" }, storage)).toBe(false);
  expect(removeBrandProfileFromStorage(storage)).toBe(false);
});

test("treats malformed or semantically invalid stored data as a non-throwing failure", () => {
  for (const raw of [
    "{not-json",
    '{"name":42}',
    '{"website":"javascript:alert(1)"}',
    '{"name":"결 스튜디오","unknown":"secret"}',
  ]) {
    const { storage } = memoryStorage(raw);
    expect(loadBrandProfileFromStorage(storage)).toEqual({ profile: null, failed: true });
  }
});
