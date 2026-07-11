import type { SatgatDocumentData } from "@/lib/templates/types";
import { draftStorageKey, isDraftId } from "./draft-id";

export { draftStorageKey, isDraftId } from "./draft-id";

const STORAGE_USER_MESSAGE = "임시 문서를 저장하거나 불러올 수 없습니다. 브라우저 저장 공간을 확인해 주세요.";
const CURRENT_DRAFT_ID_KEY = "satgat:current-draft-id";

type StoragePort = Pick<Storage, "getItem" | "setItem" | "removeItem">;

type DraftStorageDependencies = {
  storage?: StoragePort;
  randomUUID?: () => string;
};

export class DraftStorageError extends Error {
  readonly userMessage = STORAGE_USER_MESSAGE;

  constructor(cause?: unknown) {
    super("Draft storage is unavailable", { cause });
    this.name = "DraftStorageError";
  }
}

function browserStorage(): StoragePort {
  try {
    if (typeof window === "undefined" || !window.sessionStorage) {
      throw new Error("sessionStorage unavailable");
    }
    return window.sessionStorage;
  } catch (error) {
    throw new DraftStorageError(error);
  }
}

function browserRandomUUID(): string {
  try {
    if (typeof crypto === "undefined" || typeof crypto.randomUUID !== "function") {
      throw new Error("crypto.randomUUID unavailable");
    }
    return crypto.randomUUID();
  } catch (error) {
    throw new DraftStorageError(error);
  }
}

export function createDraft(
  data: SatgatDocumentData,
  dependencies: DraftStorageDependencies = {},
): string {
  try {
    const id = (dependencies.randomUUID ?? browserRandomUUID)();
    if (!isDraftId(id)) throw new Error("crypto.randomUUID returned an invalid identifier");
    (dependencies.storage ?? browserStorage()).setItem(
      draftStorageKey(id),
      JSON.stringify(data),
    );
    return id;
  } catch (error) {
    if (error instanceof DraftStorageError) throw error;
    throw new DraftStorageError(error);
  }
}

export function readDraft(
  id: string,
  dependencies: Pick<DraftStorageDependencies, "storage"> = {},
): unknown | null {
  try {
    const raw = (dependencies.storage ?? browserStorage()).getItem(draftStorageKey(id));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      return null;
    }
  } catch (error) {
    if (error instanceof DraftStorageError) throw error;
    throw new DraftStorageError(error);
  }
}

export function isDocumentData(value: unknown): value is SatgatDocumentData {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    "templateId" in value &&
    typeof value.templateId === "string" &&
    "slots" in value &&
    typeof value.slots === "object" &&
    value.slots !== null &&
    !Array.isArray(value.slots)
  );
}

export function removeDraft(
  id: string,
  dependencies: Pick<DraftStorageDependencies, "storage"> = {},
): void {
  try {
    (dependencies.storage ?? browserStorage()).removeItem(draftStorageKey(id));
  } catch (error) {
    if (error instanceof DraftStorageError) throw error;
    throw new DraftStorageError(error);
  }
}


export function replaceCurrentDraft(
  data: SatgatDocumentData,
  dependencies: DraftStorageDependencies = {},
): string {
  const storage = dependencies.storage ?? browserStorage();
  try {
    const trackedId = storage.getItem(CURRENT_DRAFT_ID_KEY);
    const previousId = isDraftId(trackedId) ? trackedId : null;
    const nextId = createDraft(data, { ...dependencies, storage });
    try {
      storage.setItem(CURRENT_DRAFT_ID_KEY, nextId);
    } catch (pointerError) {
      try {
        removeDraft(nextId, { storage });
      } catch (rollbackError) {
        throw new DraftStorageError(
          new AggregateError(
            [pointerError, rollbackError],
            "Current draft pointer and rollback failed",
          ),
        );
      }
      throw pointerError;
    }
    if (previousId && previousId !== nextId) {
      removeDraft(previousId, { storage });
    }
    return nextId;
  } catch (error) {
    if (error instanceof DraftStorageError) throw error;
    throw new DraftStorageError(error);
  }
}
