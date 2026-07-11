import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getTemplate } from "@/lib/templates/registry";
import { validateDocumentData } from "@/lib/engine/validator";
import { renderDocumentPdf } from "@/lib/export/render-pdf";
import { resolveTrustedPdfOrigin } from "@/lib/export/trusted-origin";
import { readBoundedJsonBody } from "@/lib/export/request-body";
import type { SatgatDocumentData } from "@/lib/templates/types";

// Headless Chromium needs the Node.js runtime (not edge); PDF render can be slow.
export const runtime = "nodejs";
export const maxDuration = 60;

const ExportRequestSchema = z.object({
  templateId: z.string().min(1),
  slots: z.record(z.string(), z.unknown()),
  lang: z.string().min(1).max(8).optional(),
});



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
    const body = await readBoundedJsonBody(req);
    if (!body.ok) {
      return NextResponse.json(
        { error: "Invalid export request", message: "내보낼 문서 데이터가 올바르지 않습니다." },
        { status: body.reason === "too-large" ? 413 : 400 },
      );
    }
    const parsed = ExportRequestSchema.safeParse(body.value);
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
        { error: "Template not found", message: "지원하지 않는 문서 형식입니다." },
        { status: 404 }
      );
    }

    const data: SatgatDocumentData = { templateId, slots };
    const validation = validateDocumentData(template, data);
    if (!validation.valid) {
      return NextResponse.json(
        { error: "Invalid document", message: "문서 형식이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    const origin = resolveTrustedPdfOrigin({ env: process.env, requestUrl: req.url });
    const fontsCssUrl = `${origin}/fonts/satgat-fonts.css`;

    const pdf = await renderDocumentPdf({
      origin,
      lang,
      data,
      fontsCssUrl,
      overrideCss: PRINT_FONT_OVERRIDE_CSS,
    });

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
