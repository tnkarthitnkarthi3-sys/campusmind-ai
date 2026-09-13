import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "Please upload a PDF or text file.",
        },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "The uploaded file is empty.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "File size must be 10 MB or less.",
        },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());

    let text = "";

    if (fileName.endsWith(".pdf")) {
      const parser = new PDFParse({
        data: buffer,
      });

      const result = await parser.getText();

      text = result.text;

      await parser.destroy();
    } else if (
      fileName.endsWith(".txt") ||
      fileName.endsWith(".md")
    ) {
      text = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Supported formats: PDF, TXT and Markdown.",
        },
        { status: 400 }
      );
    }

    text = text
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!text) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No readable text was found. The PDF may contain scanned images instead of selectable text.",
        },
        { status: 422 }
      );
    }

    const words = text.split(/\s+/).filter(Boolean);

    return NextResponse.json({
      success: true,
      file: {
        name: file.name,
        size: file.size,
        type: file.type || "unknown",
      },
      text,
      stats: {
        characters: text.length,
        words: words.length,
      },
    });
  } catch (error) {
    console.error("NOTE EXTRACTION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to read the uploaded file.",
      },
      { status: 500 }
    );
  }
}
