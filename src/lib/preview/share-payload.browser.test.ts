import { expect, test } from "bun:test";
import type { SatgatDocumentData } from "@/lib/templates/types";
import puppeteer from "puppeteer-core";
import {
  decodeSharePayload,
  encodeSharePayload,
  MAX_SHARE_PAYLOAD_BYTES,
  SHARE_PAYLOAD_TOO_LARGE_MESSAGE,
} from "./share-payload";

const executablePath = process.env.CHROMIUM_PATH;
const chromiumTest = executablePath ? test : test.skip;

function payloadAt(byteLength: number): SatgatDocumentData {
  const empty: SatgatDocumentData = {
    templateId: "resume",
    slots: { name: "" },
  };
  const overhead = new TextEncoder().encode(JSON.stringify(empty)).byteLength;
  return {
    ...empty,
    slots: { name: "a".repeat(byteLength - overhead) },
  };
}

chromiumTest("maximum share fragment navigates and round-trips responsively in Chromium", async () => {
  const exact = payloadAt(MAX_SHARE_PAYLOAD_BYTES);
  const oneByteOver = payloadAt(MAX_SHARE_PAYLOAD_BYTES + 1);
  const fragment = encodeSharePayload(exact);
  const server = Bun.serve({
    port: 0,
    fetch: () => new Response("<!doctype html><title>share boundary</title><main>ready</main>", {
      headers: { "content-type": "text/html; charset=utf-8" },
    }),
  });
  try {
    const browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: ["--no-sandbox"],
    });
    try {
      const page = await browser.newPage();
      await page.goto(`${server.url}#share=${fragment}`, {
        waitUntil: "domcontentloaded",
        timeout: 10_000,
      });
      const state = await page.evaluate(() => ({
        fragment: location.hash.slice("#share=".length),
        readyState: document.readyState,
        probe: 21 * 2,
      }));

      expect(state.readyState).not.toBe("loading");
      expect(state.probe).toBe(42);
      expect(decodeSharePayload(state.fragment)).toEqual(exact);
      expect(() => encodeSharePayload(oneByteOver)).toThrow(
        SHARE_PAYLOAD_TOO_LARGE_MESSAGE,
      );
      expect(await page.evaluate(() => document.querySelector("main")?.textContent)).toBe("ready");
    } finally {
      await browser.close();
    }
  } finally {
    server.stop(true);
  }
}, 15_000);
