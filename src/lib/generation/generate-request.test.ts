import { expect, test } from "bun:test";
import {
  GenerateRequestSchema,
  buildGenerateRequest,
} from "./generate-request";

test("rejects unknown request and brand fields", () => {
  expect(GenerateRequestSchema.safeParse({
    templateId: "resume",
    prompt: "경력 중심 이력서를 작성해 주세요",
    unknown: "private",
  }).success).toBe(false);
  expect(GenerateRequestSchema.safeParse({
    templateId: "resume",
    prompt: "경력 중심 이력서를 작성해 주세요",
    brand: { name: "결 스튜디오", unknown: "private" },
  }).success).toBe(false);
});

test("trims canonical template IDs and rejects blank or over-bound IDs", () => {
  expect(GenerateRequestSchema.parse({
    templateId: "  brand-onepager  ",
    prompt: "브랜드 핵심 내용을 정리해 주세요",
  }).templateId).toBe("brand-onepager");

  for (const templateId of ["   ", "a".repeat(65)]) {
    expect(GenerateRequestSchema.safeParse({
      templateId,
      prompt: "브랜드 핵심 내용을 정리해 주세요",
    }).success).toBe(false);
  }
});

test("rejects unsafe email and website values", () => {
  for (const brand of [
    { email: "not-an-email" },
    { website: "javascript:alert(1)" },
    { website: "/relative/path" },
  ]) {
    expect(GenerateRequestSchema.safeParse({
      templateId: "resume",
      prompt: "경력 중심 이력서를 작성해 주세요",
      brand,
    }).success).toBe(false);
  }
});

test("accepts a valid email and absolute https website", () => {
  expect(GenerateRequestSchema.parse({
    templateId: "resume",
    prompt: "경력 중심 이력서를 작성해 주세요",
    brand: {
      email: "hello@gyeol.example",
      website: "https://gyeol.example/profile",
    },
  }).brand).toEqual({
    email: "hello@gyeol.example",
    website: "https://gyeol.example/profile",
  });
});

test("request builder omits brand unless explicitly applied", () => {
  const request = buildGenerateRequest({
    templateId: "resume",
    prompt: "경력 중심 이력서를 작성해 주세요",
    brand: { name: "결 스튜디오" },
    applyBrand: false,
  });

  expect(request).toEqual({
    templateId: "resume",
    prompt: "경력 중심 이력서를 작성해 주세요",
  });
});

test("request builder includes only normalized browser brand fields", () => {
  const request = buildGenerateRequest({
    templateId: "resume",
    prompt: "경력 중심 이력서를 작성해 주세요",
    brand: {
      name: "  결 스튜디오  ",
      role: "   ",
      website: " https://gyeol.example ",
      tone: " 따뜻하고 단정하게 ",
    },
    applyBrand: true,
  });

  expect(request.brand).toEqual({
    name: "결 스튜디오",
    website: "https://gyeol.example",
    tone: "따뜻하고 단정하게",
  });
  expect(request.brand).not.toHaveProperty("email");
});

test("request builder fails closed for runtime browser brands containing email", () => {
  for (const unsafeBrand of [
    { name: "결 스튜디오", email: "hidden@gyeol.example" },
    { email: "hidden@gyeol.example" },
  ]) {
    const runtimeInput: Parameters<typeof buildGenerateRequest>[0] = {
      templateId: "resume",
      prompt: "경력 중심 이력서를 작성해 주세요",
      brand: unsafeBrand,
      applyBrand: true,
    };

    expect(() => buildGenerateRequest(runtimeInput)).toThrow();
  }
});
