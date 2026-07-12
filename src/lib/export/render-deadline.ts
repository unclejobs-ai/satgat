import { withRenderTimeout } from "./render-readiness";

export interface RenderPhaseOptions<T> {
  onLateResolve?: (value: T) => PromiseLike<void> | void;
}

export interface RenderDeadline {
  remainingMs(): number;
  run<T>(
    phase: (signal: AbortSignal) => PromiseLike<T>,
    options?: RenderPhaseOptions<T>,
  ): Promise<T>;
}

export function createRenderDeadline(
  timeoutMs: number,
  now: () => number = Date.now,
): RenderDeadline {
  const deadline = now() + timeoutMs;
  const controller = new AbortController();
  const remainingMs = () => {
    const remaining = deadline - now();
    if (remaining <= 0) throw new Error("PDF render timed out");
    return remaining;
  };

  return {
    remainingMs,
    run: async <T>(
      phase: (signal: AbortSignal) => PromiseLike<T>,
      options?: RenderPhaseOptions<T>,
    ) => {
      const phaseTimeoutMs = remainingMs();
      let timedOut = false;
      const operation = Promise.resolve().then(() => phase(controller.signal));
      void operation.then(async (value) => {
        if (!timedOut || !options?.onLateResolve) return;
        try {
          await options.onLateResolve(value);
        } catch {
          // The caller has already observed the timeout; late cleanup must settle
          // without creating a detached unhandled rejection.
        }
      }, () => undefined);
      try {
        const result = await withRenderTimeout(operation, phaseTimeoutMs);
        try {
          remainingMs();
        } catch (error) {
          timedOut = true;
          controller.abort();
          await options?.onLateResolve?.(result);
          throw error;
        }
        return result;
      } catch (error) {
        timedOut = true;
        controller.abort();
        throw error;
      }
    },
  };
}

export async function withBoundedCleanup<T>(
  work: () => Promise<T>,
  cleanup: (signal: AbortSignal) => PromiseLike<void>,
  cleanupTimeoutMs: number,
  now: () => number = Date.now,
): Promise<T> {
  try {
    return await work();
  } finally {
    const cleanupDeadline = now() + cleanupTimeoutMs;
    const controller = new AbortController();
    try {
      await withRenderTimeout(
        Promise.resolve().then(() => cleanup(controller.signal)),
        cleanupTimeoutMs,
      );
      if (cleanupDeadline - now() <= 0) {
        throw new Error("PDF render timed out");
      }
    } catch (error) {
      controller.abort();
      throw error;
    }
  }
}
