import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getTemplate } from "@/lib/templates/registry";
import { generateDocumentData } from "@/lib/generation/document-generator";

const GenerateRequestSchema = z.object({
  templateId: z.string().min(1),
  prompt: z.string().trim().min(10).max(8000),
});

async function readJsonBody(req: NextRequest): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return undefined;
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error("Generate unavailable:", { reason: "missing configuration" });
      return NextResponse.json(
        {
          error: "문서 생성 서비스를 사용할 수 없습니다.",
          message: "잠시 뒤 다시 시도해 주세요.",
        },
        { status: 503 }
      );
    }

    const body = await readJsonBody(req);
    if (body === undefined) {
      return NextResponse.json(
        {
          error: "요청을 처리할 수 없습니다.",
          message: "요청 형식이 올바르지 않습니다. 다시 시도해 주세요.",
        },
        { status: 400 }
      );
    }

    const parsed = GenerateRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "요청을 처리할 수 없습니다.",
          message: "종이와 원고를 조금 더 분명히 적어 주세요.",
        },
        { status: 400 }
      );
    }

    const { templateId, prompt } = parsed.data;
    const template = getTemplate(templateId);
    if (!template) {
      return NextResponse.json(
        {
          error: "문서 형식을 찾을 수 없습니다.",
          message: "지원하지 않는 문서 형식입니다. 다른 종이를 골라 주세요.",
        },
        { status: 404 }
      );
    }

    const data = await generateDocumentData(template, prompt);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Generate error:", {
      kind: error instanceof Error ? "error" : "unknown",
    });
    return NextResponse.json(
      {
        error: "문서를 생성하지 못했습니다.",
        message: "잠시 뒤 다시 시도해 주세요.",
      },
      { status: 500 }
    );
  }
}
