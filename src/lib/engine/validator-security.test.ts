import { expect, test } from "bun:test";
import { getTemplate } from "@/lib/templates/registry";
import type { SatgatDocumentData, TemplateCatalogEntry } from "@/lib/templates/types";
import {
  isSafeImageSource,
  validateDocumentData,
} from "./validator";

function template(id: string) {
  const value = getTemplate(id);
  if (!value) throw new Error(`missing test template: ${id}`);
  return value;
}

function validDocument(templateValue: TemplateCatalogEntry): SatgatDocumentData {
  const slots: Record<string, unknown> = {};
  for (const slot of templateValue.slots) {
    if (!slot.required) continue;
    switch (slot.type) {
      case "list":
        slots[slot.id] = [{ title: "항목", description: "설명" }];
        break;
      case "table":
        slots[slot.id] = { headers: ["항목"], rows: [["내용"]] };
        break;
      case "image":
        slots[slot.id] = { url: "/images/test.png", alt: "테스트" };
        break;
      case "visual":
        slots[slot.id] = { kind: "bar", data: [{ label: "항목", value: 1 }] };
        break;
      default:
        slots[slot.id] = "필수 내용";
    }
  }
  return { templateId: templateValue.id, slots };
}

test("image policy permits only local paths and bounded raster data URLs", () => {
  expect(isSafeImageSource("/uploads/photo.webp")).toBe(true);
  expect(isSafeImageSource("data:image/png;base64,aGVsbG8=")).toBe(true);
  expect(isSafeImageSource("https://tracker.example/pixel.png")).toBe(false);
  expect(isSafeImageSource("//tracker.example/pixel.png")).toBe(false);
  expect(isSafeImageSource("javascript:alert(1)")).toBe(false);
  expect(isSafeImageSource("blob:https://satgat.example/id")).toBe(false);
  expect(isSafeImageSource("data:image/svg+xml,<svg/onload=alert(1)>")).toBe(false);
  expect(isSafeImageSource("/uploads/payload.svg")).toBe(false);
  expect(isSafeImageSource(`data:image/png;base64,${"a".repeat(2_800_000)}`)).toBe(false);
  expect(isSafeImageSource("/uploads/payload%2Esvg")).toBe(false);
  expect(isSafeImageSource("data:image/png;base64,a")).toBe(false);
});

test("document validation rejects malformed nested tables and unknown slot keys", () => {
  const report = template("report");
  const tableSlot = report.slots.find((slot) => slot.type === "table");
  if (!tableSlot) throw new Error("report needs a table slot for this test");

  const malicious: SatgatDocumentData = {
    templateId: report.id,
    slots: {
      [tableSlot.id]: {
        headers: ["항목"],
        rows: [{ 0: "객체 행" }],
      },
      __protoPollution: "rejected",
    },
  };

  expect(validateDocumentData(report, malicious).valid).toBe(false);
});

test("document validation rejects external images nested inside list items", () => {
  const resume = template("resume");
  const listSlot = resume.slots.find((slot) => slot.type === "list");
  if (!listSlot) throw new Error("resume needs a list slot for this test");

  const baseline = validDocument(resume);
  const localImage: SatgatDocumentData = {
    ...baseline,
    slots: {
      ...baseline.slots,
      [listSlot.id]: [{ title: "경력", image_url: "/uploads/photo.webp" }],
    },
  };
  const malicious: SatgatDocumentData = {
    ...baseline,
    slots: {
      ...baseline.slots,
      [listSlot.id]: [
        {
          title: "경력",
          image_url: "https://tracker.example/pixel.png",
        },
      ],
    },
  };

  expect(validateDocumentData(resume, baseline).valid).toBe(true);
  expect(validateDocumentData(resume, localImage).valid).toBe(true);
  expect(validateDocumentData(resume, malicious).valid).toBe(false);
  expect(validateDocumentData(resume, {
    ...baseline,
    slots: {
      ...baseline.slots,
      [listSlot.id]: [{ title: { nested: "rejected" } }],
    },
  }).valid).toBe(false);
});

test("document validation rejects aggregate payloads that exceed private transport capacity", () => {
  const resume = template("resume");
  const oversized: SatgatDocumentData = {
    templateId: resume.id,
    slots: {
      name: "대용량",
      title: "검증",
      experiences: [
        { title: "하나", image: { url: `data:image/png;base64,${"a".repeat(1_100_000)}` } },
        { title: "둘", image: { url: `data:image/png;base64,${"a".repeat(1_100_000)}` } },
      ],
    },
  };

  expect(validateDocumentData(resume, oversized).valid).toBe(false);
});
