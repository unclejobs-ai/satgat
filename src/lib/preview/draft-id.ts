const DRAFT_STORAGE_PREFIX = "satgat:draft:";
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isDraftId(value: string | null | undefined): value is string {
  return typeof value === "string" && UUID_V4.test(value);
}

export function draftStorageKey(id: string): string {
  return `${DRAFT_STORAGE_PREFIX}${id}`;
}
