import { NextRequest, NextResponse } from "next/server";
import { getTemplate } from "@/lib/templates/registry";
import { generateDocumentData } from "@/lib/generation/document-generator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { templateId, prompt } = body;

    if (!templateId || !prompt) {
      return NextResponse.json(
        { error: "templateId and prompt are required" },
        { status: 400 }
      );
    }

    const template = getTemplate(templateId);
    if (!template) {
      return NextResponse.json(
        { error: `Template not found: ${templateId}` },
        { status: 404 }
      );
    }

    const data = await generateDocumentData(template, prompt);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
