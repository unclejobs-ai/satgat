import { afterAll, beforeEach, expect, mock, spyOn, test } from "bun:test";
import { NextRequest } from "next/server";
import * as routeModule from "./route";
import { POST } from "./route";
import { GenerateRequestSchema } from "@/lib/generation/generate-request";

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

test("route module exports only the supported POST handler", () => {
  expect(Object.keys(routeModule)).toEqual(["POST"]);
});

test("accepts a bounded, explicit optional brand profile", () => {
  const body = GenerateRequestSchema.parse({
    templateId: "resume",
    prompt: "이력서를 만들어 주세요.",
    brand: {
      name: "결 스튜디오",
      role: "브랜드 디렉터",
      email: "hello@gyeol.example",
      website: "https://gyeol.example",
      tone: "단정하고 따뜻한 한국어",
    },
  });

  expect(body.brand).toEqual({
    name: "결 스튜디오",
    role: "브랜드 디렉터",
    email: "hello@gyeol.example",
    website: "https://gyeol.example",
    tone: "단정하고 따뜻한 한국어",
  });
});

test("keeps an absent optional brand profile absent", () => {
  const body = GenerateRequestSchema.parse({
    templateId: "resume",
    prompt: "이력서를 만들어 주세요.",
  });

  expect(body.brand).toBeUndefined();
});

for (const brand of [
  { name: "가".repeat(121) },
  { role: "가".repeat(121) },
  { email: "a".repeat(255) },
  { website: "a".repeat(2049) },
  { tone: "가".repeat(501) },
  { name: "결 스튜디오", unknown: "not allowed" },
  { email: "not-an-email" },
  { website: "javascript:alert(1)" },
  { website: "/relative/path" },
  { name: 42 },
]) {
  test(`rejects an invalid strict brand profile: ${Object.keys(brand).join(",")}`, () => {
    const result = GenerateRequestSchema.safeParse({
      templateId: "resume",
      prompt: "이력서를 만들어 주세요.",
      brand,
    });

    expect(result.success).toBe(false);
  });
}

test("rejects unknown root request keys", () => {
  const result = GenerateRequestSchema.safeParse({
    templateId: "resume",
    prompt: "이력서를 만들어 주세요.",
    unknown: "not allowed",
  });

  expect(result.success).toBe(false);
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

for (const { label, brand, canary } of [
  {
    label: "unknown field",
    brand: { name: "결 스튜디오", "private-brand-field": "secret" },
    canary: "private-brand-field",
  },
  {
    label: "overlong field",
    brand: { name: `private-overlong-${"가".repeat(121)}` },
    canary: "private-overlong",
  },
  {
    label: "invalid field type",
    brand: { name: 42 },
    canary: "42",
  },
]) {
  test(`invalid brand profile returns only generic Korean copy: ${label}`, async () => {
    const response = await POST(request({
      templateId: "resume",
      prompt: "경력 중심 이력서를 작성해 주세요",
      brand,
    }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({
      error: "요청을 처리할 수 없습니다.",
      message: "종이와 원고를 조금 더 분명히 적어 주세요.",
    });
    expect(JSON.stringify(body)).not.toContain(canary);
    expect(generateDocumentDataMock).not.toHaveBeenCalled();
  });
}

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

test("successful generation passes the explicit brand as the third generator argument", async () => {
  const brand = {
    name: "결 스튜디오",
    email: "hello@gyeol.example",
    tone: "단정하고 따뜻한 한국어",
  };

  const response = await POST(request({
    templateId: "resume",
    prompt: "경력 중심 이력서를 작성해 주세요",
    brand,
  }));

  expect(response.status).toBe(200);
  expect(generateDocumentDataMock).toHaveBeenCalledTimes(1);
  expect(generateDocumentDataMock.mock.calls[0]?.[1]).toBe("경력 중심 이력서를 작성해 주세요");
  expect(generateDocumentDataMock.mock.calls[0]?.[2]).toEqual(brand);
});

test("successful generation response remains unchanged", async () => {
  const generated = {
    templateId: "resume",
    slots: { name: "홍길동" },
  };
  generateDocumentDataMock.mockResolvedValueOnce(generated);

  const response = await POST(request({ templateId: "resume", prompt: "경력 중심 이력서를 작성해 주세요" }));

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual(generated);
  expect(generateDocumentDataMock).toHaveBeenCalledTimes(1);
  expect(generateDocumentDataMock.mock.calls[0]?.[2]).toBeNull();
});
