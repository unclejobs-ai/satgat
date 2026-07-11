import { afterAll, beforeEach, expect, mock, spyOn, test } from "bun:test";
import { NextRequest } from "next/server";
import { POST } from "./route";

const generateDocumentDataMock = mock(async () => ({
  templateId: "resume",
  slots: { name: "홍길동" },
}));

mock.module("@/lib/generation/document-generator", () => ({
  generateDocumentData: generateDocumentDataMock,
}));

const originalApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const consoleErrorSpy = spyOn(console, "error").mockImplementation(() => {});

function request(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-api-key";
  generateDocumentDataMock.mockReset();
  generateDocumentDataMock.mockResolvedValue({
    templateId: "resume",
    slots: { name: "홍길동" },
  });
  consoleErrorSpy.mockClear();
});

afterAll(() => {
  if (originalApiKey === undefined) {
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  } else {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = originalApiKey;
  }
  consoleErrorSpy.mockRestore();
});

test("missing generation config returns only stable generic Korean copy", async () => {
  delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  const response = await POST(request({ templateId: "resume", prompt: "경력 중심 이력서를 작성해 주세요" }));
  const body = await response.json();
  const serialized = JSON.stringify(body);

  expect(response.status).toBe(503);
  expect(body).toEqual({
    error: "문서 생성 서비스를 사용할 수 없습니다.",
    message: "잠시 뒤 다시 시도해 주세요.",
  });
  expect(serialized).not.toContain("GOOGLE_GENERATIVE_AI_API_KEY");
  expect(serialized).not.toContain(".env.local");
  expect(serialized).not.toContain("dev 서버");
  expect(generateDocumentDataMock).not.toHaveBeenCalled();
  expect(consoleErrorSpy).toHaveBeenCalledWith("Generate unavailable:", {
    reason: "missing configuration",
  });
  expect(JSON.stringify(consoleErrorSpy.mock.calls)).not.toContain("GOOGLE_GENERATIVE_AI_API_KEY");
  expect(JSON.stringify(consoleErrorSpy.mock.calls)).not.toContain("test-api-key");
});

test("malformed JSON returns only generic Korean copy", async () => {
  const malformedRequest = new NextRequest("http://localhost/api/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{\"templateId\":",
  });

  const response = await POST(malformedRequest);
  const body = await response.json();

  expect(response.status).toBe(400);
  expect(body).toEqual({
    error: "요청을 처리할 수 없습니다.",
    message: "요청 형식이 올바르지 않습니다. 다시 시도해 주세요.",
  });
  expect(JSON.stringify(body)).not.toContain("JSON");
});

test("invalid generation request returns only generic Korean copy", async () => {
  const response = await POST(request({ templateId: "resume", prompt: "짧음" }));
  const body = await response.json();

  expect(response.status).toBe(400);
  expect(body).toEqual({
    error: "요청을 처리할 수 없습니다.",
    message: "종이와 원고를 조금 더 분명히 적어 주세요.",
  });
  expect(JSON.stringify(body)).not.toContain("Invalid generation request");
});

test("unknown template does not reflect the supplied identifier", async () => {
  const technicalCanary = "private-schema/path?token=secret";
  const response = await POST(request({
    templateId: technicalCanary,
    prompt: "경력 중심 이력서를 작성해 주세요",
  }));
  const body = await response.json();

  expect(response.status).toBe(404);
  expect(body).toEqual({
    error: "문서 형식을 찾을 수 없습니다.",
    message: "지원하지 않는 문서 형식입니다. 다른 종이를 골라 주세요.",
  });
  expect(JSON.stringify(body)).not.toContain(technicalCanary);
});

for (const technicalFailure of [
  "Gemini provider rejected secret-key-123",
  "Schema validation failed at slots.experience[0].company",
]) {
  test(`caught generation failure hides technical detail: ${technicalFailure}`, async () => {
    generateDocumentDataMock.mockRejectedValueOnce(new Error(`${technicalFailure}; applicant=홍길동`));

    const response = await POST(request({ templateId: "resume", prompt: "경력 중심 이력서를 작성해 주세요" }));
    const body = await response.json();
    const responseText = JSON.stringify(body);
    const logText = JSON.stringify(consoleErrorSpy.mock.calls);

    expect(response.status).toBe(500);
    expect(body).toEqual({
      error: "문서를 생성하지 못했습니다.",
      message: "잠시 뒤 다시 시도해 주세요.",
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith("Generate error:", {
      kind: "error",
    });
    for (const canary of ["Gemini", "secret-key-123", "Schema", "slots.experience", "applicant", "홍길동"]) {
      expect(responseText).not.toContain(canary);
      expect(logText).not.toContain(canary);
    }
  });
}

test("successful generation response remains unchanged", async () => {
  const generated = {
    templateId: "resume",
    slots: { name: "홍길동" },
  };
  generateDocumentDataMock.mockResolvedValueOnce(generated);

  const response = await POST(request({ templateId: "resume", prompt: "경력 중심 이력서를 작성해 주세요" }));

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual(generated);
});
