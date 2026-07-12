export type PreviewRenderState = "loading" | "error" | "missing" | null;

export function isRenderablePreviewState({
  hasDocument,
  renderState,
}: {
  hasDocument: boolean;
  renderState: PreviewRenderState;
}): boolean {
  return hasDocument && renderState === null;
}

export function isPdfDocumentBytes(bytes: Uint8Array): boolean {
  const header = [0x25, 0x50, 0x44, 0x46, 0x2d];
  if (bytes.length < header.length + 5) return false;
  if (header.some((byte, index) => bytes[index] !== byte)) return false;

  const eof = [0x25, 0x25, 0x45, 0x4f, 0x46];
  const searchStart = Math.max(header.length, bytes.length - 1024);
  for (let index = bytes.length - eof.length; index >= searchStart; index -= 1) {
    if (eof.every((byte, offset) => bytes[index + offset] === byte)) return true;
  }
  return false;
}

export async function withRenderTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error("Document resource readiness timed out")),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    clearTimeout(timeout);
  }
}
