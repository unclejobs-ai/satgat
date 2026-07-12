import { expect, test } from "bun:test";
import { generateDocumentData, type SlotGenerator } from "./document-generator";
import { getTemplate } from "@/lib/templates/registry";
import {
  normalizeWebBrandProfile,
} from "@/lib/design-system/brand-resolver";

const resume = getTemplate("resume");
if (!resume) throw new Error("Resume template must exist for generation tests.");

test("passes an explicitly applied brand profile into the generation prompt", async () => {
  let receivedPrompt = "";
  const generator: SlotGenerator = async ({ prompt }) => {
    receivedPrompt = prompt;
    throw new Error("intentional generator stop");
  };

  await expect(
    generateDocumentData(
      resume,
      "이력서를 만들어 주세요.",
      {
        name: "결 스튜디오",
        email: "hello@gyeol.example",
        tone: "단정하고 따뜻한 한국어",
      },
      { generateSlots: generator, maxRetries: 0 },
    ),
  ).rejects.toThrow("intentional generator stop");

  expect(receivedPrompt).toContain("결 스튜디오");
  expect(receivedPrompt).toContain("단정하고 따뜻한 한국어");
  expect(receivedPrompt).toContain("hello@gyeol.example");
});

test("normalizes bounded non-empty web fields without inventing values", () => {
  expect(normalizeWebBrandProfile({
    name: "  결 스튜디오  ",
    role: "   ",
    website: "  https://gyeol.example  ",
    tone: " 따뜻하고 단정하게 ",
  })).toEqual({
    name: "결 스튜디오",
    website: "https://gyeol.example",
    tone: "따뜻하고 단정하게",
  });
});

test("rejects semantically invalid web profiles", () => {
  expect(normalizeWebBrandProfile({ email: "not-an-email" })).toBeNull();
  expect(normalizeWebBrandProfile({ website: "javascript:alert(1)" })).toBeNull();
  expect(normalizeWebBrandProfile({ website: "/relative/path" })).toBeNull();
  expect(normalizeWebBrandProfile({ name: "가".repeat(121) })).toBeNull();
  expect(normalizeWebBrandProfile({ name: "결 스튜디오", unknown: "secret" })).toBeNull();
});
