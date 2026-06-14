import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getTemplate } from "@/lib/templates/registry";
import { validateDocumentData } from "@/lib/engine/validator";
import { renderDocumentPdf } from "@/lib/export/render-pdf";
import type { SatgatDocumentData } from "@/lib/templates/types";

// Headless Chromium needs the Node.js runtime (not edge); PDF render can be slow.
export const runtime = "nodejs";
export const maxDuration = 60;

const ExportRequestSchema = z.object({
  templateId: z.string().min(1),
  slots: z.record(z.string(), z.unknown()),
  lang: z.string().min(1).max(8).optional(),
});

/** base64url encode, matching the preview page's decode (-/_ , no padding). */
function encodePreviewPayload(data: unknown): string {
  return Buffer.from(JSON.stringify(data), "utf8")
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

function requestOrigin(req: NextRequest): string {
  const host = req.headers.get("host");
  if (host) {
    const proto = req.headers.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  }
  return req.nextUrl.origin;
}

// Print-only font override: force every satgat font var onto self-hosted faces
// (Hangul → Nanum/Gowun, Hanja → Noto Serif KR) so a headless-Chromium PDF on
// Linux never falls back to an absent system font (AppleMyungjo/SD Gothic Neo) → tofu.
const PRINT_FONT_OVERRIDE_CSS = `
:root, html, body, [lang], .preview-wrap, .doc-stage, .satgat-document {
  --serif: 'Gowun Batang','Nanum Myeongjo','Noto Serif KR',serif !important;
  --serif-display: 'Nanum Myeongjo','Noto Serif KR',serif !important;
  --serif-latin: 'Nanum Myeongjo','Noto Serif KR',serif !important;
  --sans: 'Gowun Dodum','Nanum Myeongjo','Noto Serif KR',sans-serif !important;
  --mono: 'Gowun Dodum','Noto Serif KR',monospace !important;
  --font-myeongjo: 'Nanum Myeongjo','Noto Serif KR',serif !important;
  --font-serif-kr: 'Nanum Myeongjo','Noto Serif KR',serif !important;
  --font-display-bold: 'Nanum Myeongjo','Noto Serif KR',serif !important;
  --font-latin: 'Nanum Myeongjo','Noto Serif KR',serif !important;
  --font-batang: 'Gowun Batang','Nanum Myeongjo','Noto Serif KR',serif !important;
  --font-dodum: 'Gowun Dodum','Nanum Myeongjo','Noto Serif KR',sans-serif !important;
  --font-sans-kr: 'Gowun Dodum','Nanum Myeongjo','Noto Serif KR',sans-serif !important;
  --font-mono: 'Gowun Dodum','Noto Serif KR',monospace !important;
}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => undefined);
    const parsed = ExportRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid export request", message: "내보낼 문서 데이터가 올바르지 않습니다." },
        { status: 400 }
      );
    }

    const { templateId, slots, lang = "ko" } = parsed.data;
    const template = getTemplate(templateId);
    if (!template) {
      return NextResponse.json(
        { error: `Template not found: ${templateId}`, message: "지원하지 않는 문서 형식입니다." },
        { status: 404 }
      );
    }

    const data: SatgatDocumentData = { templateId, slots };
    const validation = validateDocumentData(template, data);
    if (!validation.valid) {
      return NextResponse.json(
        { error: `Invalid document: ${validation.errors.join("; ")}`, message: "문서에 필요한 내용이 부족합니다." },
        { status: 400 }
      );
    }

    const origin = requestOrigin(req);
    const previewUrl = `${origin}/${encodeURIComponent(lang)}/preview?data=${encodePreviewPayload(data)}`;
    const fontsCssUrl = `${origin}/fonts/satgat-fonts.css`;

    const pdf = await renderDocumentPdf(previewUrl, { fontsCssUrl, overrideCss: PRINT_FONT_OVERRIDE_CSS });

    return new NextResponse(Buffer.from(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="satgat-${templateId}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    // Log full detail server-side only; never leak internal paths/URLs to the client.
    console.error("Export error:", error);
    return NextResponse.json(
      {
        error: "Export failed",
        message: "PDF로 내보내는 중 문제가 생겼습니다. 잠시 뒤 다시 시도해 주세요.",
      },
      { status: 500 }
    );
  }
}
