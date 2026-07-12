export type PdfAttemptStatus = "idle" | "loading" | "error";

export type PdfAttemptState = {
  attempt: number;
  status: PdfAttemptStatus;
};

export function startPdfAttempt(state: PdfAttemptState): PdfAttemptState {
  return { attempt: state.attempt + 1, status: "loading" };
}

export function invalidatePdfAttempt(attempt: number): PdfAttemptState {
  return { attempt: attempt + 1, status: "idle" };
}

export function finishPdfAttempt(
  state: PdfAttemptState,
  attempt: number,
  status: Exclude<PdfAttemptStatus, "loading">,
): PdfAttemptState {
  return state.attempt === attempt ? { attempt, status } : state;
}
