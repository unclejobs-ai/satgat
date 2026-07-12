import { expect, test } from "bun:test";
import { NextRequest } from "next/server";
import { MAX_EXPORT_REQUEST_BYTES } from "@/lib/export/request-body";
import { POST } from "./route";

test("returns a specific message when export input exceeds the private transport limit", async () => {
  const request = new NextRequest("http://localhost/api/export", {
    method: "POST",
    headers: {
      "content-length": String(MAX_EXPORT_REQUEST_BYTES + 1),
      "content-type": "application/json",
    },
    body: "{}",
  });

  const response = await POST(request);

  expect(response.status).toBe(413);
  expect(await response.json()).toEqual({
    error: "Invalid export request",
    message: "문서가 너무 커서 PDF로 내보낼 수 없습니다.",
  });
});
