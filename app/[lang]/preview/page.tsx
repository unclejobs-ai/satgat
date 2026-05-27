import PreviewClient from "./PreviewClient";
import { validateDocumentData } from "@/lib/engine/validator";
import { getTemplate } from "@/lib/templates/registry";
import type { SatgatDocumentData } from "@/lib/templates/types";

type PreviewPageProps = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ data?: string | string[] }>;
};

type PreviewPayload =
  | { data: SatgatDocumentData; error: null }
  | { data: null; error: string };

function decodePreviewData(value: string | undefined): PreviewPayload {
  if (!value) return { data: null, error: "불러올 문서가 없습니다." };

  try {
    const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const json = Buffer.from(padded, "base64").toString("utf8");
    const parsed = JSON.parse(json) as SatgatDocumentData;

    if (!parsed || typeof parsed.templateId !== "string" || !parsed.slots || typeof parsed.slots !== "object") {
      return { data: null, error: "문서 형식이 올바르지 않습니다." };
    }

    const template = getTemplate(parsed.templateId);
    if (!template) {
      return { data: null, error: "지원하지 않는 문서입니다." };
    }

    const validation = validateDocumentData(template, parsed);
    if (!validation.valid) {
      return { data: null, error: "문서에 필요한 내용이 부족합니다." };
    }

    return { data: parsed, error: null };
  } catch {
    return { data: null, error: "문서를 읽지 못했습니다." };
  }
}

export default async function PreviewPage({ params, searchParams }: PreviewPageProps) {
  const [{ lang }, query] = await Promise.all([params, searchParams]);
  const dataParam = Array.isArray(query.data) ? query.data[0] : query.data;

  return <PreviewClient lang={lang} preview={decodePreviewData(dataParam)} />;
}
