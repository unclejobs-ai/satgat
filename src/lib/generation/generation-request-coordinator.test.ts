import { expect, test } from "bun:test";
import {
  disposeGenerationOnRouteExit,
  GenerationRequestCoordinator,
} from "./generation-request-coordinator";

test("input invalidation aborts the active request and rejects its stale completion", () => {
  const coordinator = new GenerationRequestCoordinator();
  const request = coordinator.begin();

  coordinator.invalidate();

  expect(request.signal.aborted).toBe(true);
  expect(coordinator.isCurrent(request.id)).toBe(false);
});

test("starting a replacement request invalidates the previous request identity", () => {
  const coordinator = new GenerationRequestCoordinator();
  const first = coordinator.begin();
  const second = coordinator.begin();

  expect(first.signal.aborted).toBe(true);
  expect(coordinator.isCurrent(first.id)).toBe(false);
  expect(coordinator.isCurrent(second.id)).toBe(true);
  expect(coordinator.finish(second.id)).toBe(true);
  expect(coordinator.isCurrent(second.id)).toBe(false);
});

test("a stale request cleanup cannot finish a newer request", () => {
  const coordinator = new GenerationRequestCoordinator();
  const stale = coordinator.begin();
  const current = coordinator.begin();

  expect(coordinator.finish(stale.id)).toBe(false);
  expect(coordinator.isCurrent(current.id)).toBe(true);
});

test("unmount disposal aborts the active request and invalidates its identity", () => {
  const coordinator = new GenerationRequestCoordinator();
  const request = coordinator.begin();

  coordinator.dispose();

  expect(request.signal.aborted).toBe(true);
  expect(coordinator.isCurrent(request.id)).toBe(false);
  expect(coordinator.finish(request.id)).toBe(false);
});

test("repeated lifecycle disposal is idempotent", () => {
  const coordinator = new GenerationRequestCoordinator();
  const active = coordinator.begin();

  coordinator.dispose();
  coordinator.dispose();
  const next = coordinator.begin();

  expect(next.id).toBe(active.id + 2);
  expect(coordinator.isCurrent(next.id)).toBe(true);
});

test("route state keeps the request on the create path and aborts it after navigation", () => {
  const coordinator = new GenerationRequestCoordinator();
  const request = coordinator.begin();

  expect(disposeGenerationOnRouteExit(coordinator, "/ko/new", "/ko/new")).toBe(false);
  expect(request.signal.aborted).toBe(false);

  expect(disposeGenerationOnRouteExit(coordinator, "/ko/new", "/ko")).toBe(true);
  expect(request.signal.aborted).toBe(true);
  expect(coordinator.isCurrent(request.id)).toBe(false);
});

test("a deferred stale response cannot reach the commit seam after brand data changes", async () => {
  const coordinator = new GenerationRequestCoordinator();
  const request = coordinator.begin();
  let resolveResponse: ((value: string) => void) | undefined;
  const response = new Promise<string>((resolve) => {
    resolveResponse = resolve;
  });
  const committed: string[] = [];

  const completion = response.then((value) => {
    if (coordinator.isCurrent(request.id)) committed.push(value);
  });
  coordinator.invalidate();
  resolveResponse?.("stale branded document");
  await completion;

  expect(committed).toEqual([]);
});
