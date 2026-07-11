import { expect, test } from "bun:test";
import { createRenderDeadline, withBoundedCleanup } from "./render-deadline";

test("cumulative phases exhaust one absolute deadline and still run bounded cleanup", async () => {
  let now = 0;
  let cleanupRan = false;
  const deadline = createRenderDeadline(45, () => now);

  await expect(withBoundedCleanup(async () => {
    await deadline.run(() => Promise.resolve("launched"));
    now = 20;
    await deadline.run(() => Promise.resolve("navigated"));
    now = 46;
    await deadline.run(() => Promise.resolve());
  }, async () => {
    cleanupRan = true;
  }, 20)).rejects.toThrow("PDF render timed out");

  expect(cleanupRan).toBe(true);
});

test("remaining time shrinks across completed phases", async () => {
  let now = 1_000;
  const deadline = createRenderDeadline(100, () => now);

  expect(deadline.remainingMs()).toBe(100);
  now += 35;
  await deadline.run(() => Promise.resolve());
  expect(deadline.remainingMs()).toBe(65);
  now += 66;
  expect(() => deadline.remainingMs()).toThrow("PDF render timed out");
});

test("phase and cleanup timeout guards are installed before work starts", async () => {
  const originalSetTimeout = globalThis.setTimeout;
  let timeoutInstalled = false;
  globalThis.setTimeout = ((handler, timeout, ...arguments_) => {
    timeoutInstalled = true;
    return originalSetTimeout(handler, timeout, ...arguments_);
  }) as typeof setTimeout;

  try {
    const deadline = createRenderDeadline(100);
    await deadline.run(async () => {
      expect(timeoutInstalled).toBe(true);
    });

    timeoutInstalled = false;
    await withBoundedCleanup(
      async () => undefined,
      async () => {
        expect(timeoutInstalled).toBe(true);
      },
      100,
    );
  } finally {
    globalThis.setTimeout = originalSetTimeout;
  }
});

test("deadline rejects a phase that completes after its budget while timers are blocked", async () => {
  let now = 0;
  const resource = { closed: false };
  const deadline = createRenderDeadline(5, () => now);

  await expect(deadline.run(async () => {
    now = 6;
    return resource;
  }, {
    onLateResolve: (lateResource) => {
      lateResource.closed = true;
    },
  })).rejects.toThrow("PDF render timed out");
  expect(resource.closed).toBe(true);
});

test("cleanup rejects when it completes after its independent budget", async () => {
  let now = 0;

  await expect(withBoundedCleanup(
    async () => undefined,
    async () => {
      now = 6;
    },
    5,
    () => now,
  )).rejects.toThrow("PDF render timed out");
});

test("timed-out asynchronous phases receive cancellation before cleanup", async () => {
  const originalSetTimeout = globalThis.setTimeout;
  const originalClearTimeout = globalThis.clearTimeout;
  let fireTimeout: (() => void) | null = null;
  let aborted = false;
  globalThis.setTimeout = ((handler) => {
    fireTimeout = () => {
      if (typeof handler === "function") handler();
    };
    return 1;
  }) as typeof setTimeout;
  globalThis.clearTimeout = (() => undefined) as typeof clearTimeout;

  try {
    const deadline = createRenderDeadline(5);
    const pending = deadline.run((signal) => new Promise<never>((_, reject) => {
      signal.addEventListener("abort", () => {
        aborted = true;
        reject(new Error("cancelled"));
      }, { once: true });
      queueMicrotask(() => fireTimeout?.());
    }));

    await expect(pending).rejects.toThrow("timed out");
    expect(aborted).toBe(true);
  } finally {
    globalThis.setTimeout = originalSetTimeout;
    globalThis.clearTimeout = originalClearTimeout;
  }
});

test("timed-out asynchronous resolution runs typed late cleanup to settlement", async () => {
  const originalSetTimeout = globalThis.setTimeout;
  const originalClearTimeout = globalThis.clearTimeout;
  let fireTimeout: (() => void) | null = null;
  let resolvePhase: ((value: { closed: boolean }) => void) | null = null;
  let resolveCleanup: (() => void) | null = null;
  let cleanupSettled = false;
  globalThis.setTimeout = ((handler) => {
    fireTimeout = () => {
      if (typeof handler === "function") handler();
    };
    return 1;
  }) as typeof setTimeout;
  globalThis.clearTimeout = (() => undefined) as typeof clearTimeout;

  try {
    const deadline = createRenderDeadline(5);
    const cleanupFinished = new Promise<void>((resolve) => {
      resolveCleanup = resolve;
    });
    const pending = deadline.run(
      () => new Promise<{ closed: boolean }>((resolve) => {
        resolvePhase = resolve;
        queueMicrotask(() => fireTimeout?.());
      }),
      {
        onLateResolve: async (resource) => {
          resource.closed = true;
          await Promise.resolve();
          cleanupSettled = true;
          resolveCleanup?.();
        },
      },
    );

    await expect(pending).rejects.toThrow("timed out");
    const resource = { closed: false };
    resolvePhase?.(resource);
    await cleanupFinished;
    expect(resource.closed).toBe(true);
    expect(cleanupSettled).toBe(true);
  } finally {
    globalThis.setTimeout = originalSetTimeout;
    globalThis.clearTimeout = originalClearTimeout;
  }
});

test("timed-out cleanup receives cancellation", async () => {
  const originalSetTimeout = globalThis.setTimeout;
  const originalClearTimeout = globalThis.clearTimeout;
  let fireTimeout: (() => void) | null = null;
  let aborted = false;
  globalThis.setTimeout = ((handler) => {
    fireTimeout = () => {
      if (typeof handler === "function") handler();
    };
    return 1;
  }) as typeof setTimeout;
  globalThis.clearTimeout = (() => undefined) as typeof clearTimeout;

  try {
    const pending = withBoundedCleanup(
      async () => undefined,
      (signal) => new Promise<never>((_, reject) => {
        signal.addEventListener("abort", () => {
          aborted = true;
          reject(new Error("cancelled"));
        }, { once: true });
        queueMicrotask(() => fireTimeout?.());
      }),
      5,
    );

    await expect(pending).rejects.toThrow("timed out");
    expect(aborted).toBe(true);
  } finally {
    globalThis.setTimeout = originalSetTimeout;
    globalThis.clearTimeout = originalClearTimeout;
  }
});
