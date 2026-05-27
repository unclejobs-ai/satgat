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
      return NextResponse.json(
        {
          error: "GOOGLE_GENERATIVE_AI_API_KEY missing",
          message:
            "AI 키가 설정되지 않았습니다. 프로젝트 루트에 .env.local을 만들고 GOOGLE_GENERATIVE_AI_API_KEY=<키>를 추가한 뒤 dev 서버를 다시 시작해 주세요.",
        },
        { status: 503 }
      );
    }

    const body = await readJsonBody(req);
    if (body === undefined) {
      return NextResponse.json(
        {
          error: "Invalid JSON body",
          message: "요청 형식이 올바르지 않습니다. 다시 시도해 주세요.",
        },
        { status: 400 }
      );
    }

    const parsed = GenerateRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid generation request",
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
          error: `Template not found: ${templateId}`,
          message: "지원하지 않는 문서 형식입니다. 다른 종이를 골라 주세요.",
        },
        { status: 404 }
      );
    }

    const data = await generateDocumentData(template, prompt);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Generation failed",
        message: "문서 생성 중 문제가 생겼습니다. 잠시 뒤 다시 시도해 주세요.",
      },
      { status: 500 }
    );
  }
}
