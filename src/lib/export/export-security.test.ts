import { expect, test } from "bun:test";
import {
  assertTrustedNavigation,
  isTrustedPdfRequestUrl,
  resolveTrustedPdfOrigin,
} from "./trusted-origin";
import {
  isPdfDocumentBytes,
  isRenderablePreviewState,
  withRenderTimeout,
} from "./render-readiness";
import { readBoundedJsonBody } from "./request-body";

test("production origin uses explicit configuration and ignores forged request hosts", () => {
  expect(resolveTrustedPdfOrigin({
    env: { NODE_ENV: "production", SATGAT_APP_ORIGIN: "https://satgat.example" },
    requestUrl: "https://evil.example/api/export",
  })).toBe("https://satgat.example");

  expect(() => resolveTrustedPdfOrigin({
    env: { NODE_ENV: "production" },
    requestUrl: "https://evil.example/api/export",
  })).toThrow("trusted application origin");
});

test("origin validation rejects credentials, paths, insecure production, and forged Vercel hosts", () => {
  for (const origin of [
    "https://user:pass@satgat.example",
    "https://satgat.example/path",
    "http://satgat.example",
  ]) {
    expect(() => resolveTrustedPdfOrigin({ env: { NODE_ENV: "production", SATGAT_APP_ORIGIN: origin } })).toThrow();
  }

  expect(() => resolveTrustedPdfOrigin({
    env: { NODE_ENV: "production", VERCEL_URL: "169.254.169.254" },
  })).toThrow();
  expect(resolveTrustedPdfOrigin({
    env: { NODE_ENV: "production", VERCEL_URL: "satgat-git-main-team.vercel.app" },
  })).toBe("https://satgat-git-main-team.vercel.app");
  expect(() => resolveTrustedPdfOrigin({
    env: { NODE_ENV: "production", VERCEL_URL: "vercel.app" },
  })).toThrow();
});

test("development request fallback is localhost-only", () => {
  expect(resolveTrustedPdfOrigin({ env: { NODE_ENV: "development" }, requestUrl: "http://localhost:3000/api/export" })).toBe("http://localhost:3000");
  expect(resolveTrustedPdfOrigin({ env: { NODE_ENV: "development" }, requestUrl: "http://127.0.0.1:3000/api/export" })).toBe("http://127.0.0.1:3000");
  expect(() => resolveTrustedPdfOrigin({ env: { NODE_ENV: "development" }, requestUrl: "http://evil.example/api/export" })).toThrow();
  expect(() => resolveTrustedPdfOrigin({ env: {}, requestUrl: "http://localhost:3000/api/export" })).toThrow();
  expect(() => resolveTrustedPdfOrigin({ env: { NODE_ENV: "staging" }, requestUrl: "http://localhost:3000/api/export" })).toThrow();
  expect(resolveTrustedPdfOrigin({
    env: { NODE_ENV: "development", VERCEL_URL: "satgat.vercel.app" },
    requestUrl: "http://localhost:3000/api/export",
  })).toBe("http://localhost:3000");
  expect(() => resolveTrustedPdfOrigin({
    env: { NODE_ENV: "test" },
    requestUrl: "http://localhost:3000/api/export",
  })).toThrow();
});

test("navigation invariant rejects cross-origin redirects", () => {
  expect(() => assertTrustedNavigation("https://satgat.example/ko", "https://satgat.example")).not.toThrow();
  expect(() => assertTrustedNavigation("https://login.example/redirect", "https://satgat.example")).toThrow("cross-origin redirect");
});

test("PDF request policy allows same-origin and bounded raster data resources only", () => {
  expect(isTrustedPdfRequestUrl("https://satgat.example/fonts/font.woff2", "https://satgat.example")).toBe(true);
  expect(isTrustedPdfRequestUrl("data:image/png;base64,aGVsbG8=", "https://satgat.example")).toBe(true);
  expect(isTrustedPdfRequestUrl("data:image/svg+xml,%3Csvg/%3E", "https://satgat.example")).toBe(false);
  expect(isTrustedPdfRequestUrl("data:text/html,%3Cscript%3E", "https://satgat.example")).toBe(false);
  expect(isTrustedPdfRequestUrl("https://tracker.example/pixel.png", "https://satgat.example")).toBe(false);
  expect(isTrustedPdfRequestUrl("file:///etc/passwd", "https://satgat.example")).toBe(false);
  expect(isTrustedPdfRequestUrl("blob:https://satgat.example/id", "https://satgat.example")).toBe(false);
  expect(isTrustedPdfRequestUrl("not a URL", "https://satgat.example")).toBe(false);
});

test("PDF readiness requires a real document and no renderer failure state", () => {
  expect(isRenderablePreviewState({ hasDocument: true, renderState: null })).toBe(true);
  expect(isRenderablePreviewState({ hasDocument: false, renderState: null })).toBe(false);
  expect(isRenderablePreviewState({ hasDocument: true, renderState: "loading" })).toBe(false);
  expect(isRenderablePreviewState({ hasDocument: true, renderState: "error" })).toBe(false);
  expect(isRenderablePreviewState({ hasDocument: true, renderState: "missing" })).toBe(false);
});

test("PDF success requires a nonempty document envelope", () => {
  expect(isPdfDocumentBytes(new TextEncoder().encode("%PDF-1.7\nbody\n%%EOF\n"))).toBe(true);
  expect(isPdfDocumentBytes(new Uint8Array())).toBe(false);
  expect(isPdfDocumentBytes(new TextEncoder().encode("%PDF-1.7\nbody"))).toBe(false);
  expect(isPdfDocumentBytes(new TextEncoder().encode("not a pdf\n%%EOF"))).toBe(false);
});

test("render timeout rejects a never-settling document resource", async () => {
  await expect(withRenderTimeout(Promise.resolve("ready"), 20)).resolves.toBe("ready");
  await expect(
    withRenderTimeout(new Promise<never>(() => undefined), 5),
  ).rejects.toThrow("timed out");
});

test("export JSON reader rejects declared and streamed oversized bodies", async () => {
  const declared = new Request("https://satgat.example/api/export", {
    method: "POST",
    headers: { "content-length": "9" },
    body: "{}",
  });
  expect(await readBoundedJsonBody(declared, 8)).toEqual({
    ok: false,
    reason: "too-large",
  });

  const streamed = new Request("https://satgat.example/api/export", {
    method: "POST",
    body: "123456789",
  });
  expect(await readBoundedJsonBody(streamed, 8)).toEqual({
    ok: false,
    reason: "too-large",
  });

  const valid = new Request("https://satgat.example/api/export", {
    method: "POST",
    body: JSON.stringify({ templateId: "resume", slots: {} }),
  });
  expect(await readBoundedJsonBody(valid, 100)).toEqual({
    ok: true,
    value: { templateId: "resume", slots: {} },
  });
});
