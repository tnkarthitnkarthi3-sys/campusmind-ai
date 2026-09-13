import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "OPENAI_API_KEY is missing.",
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const audio = formData.get("audio");

    if (!(audio instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "Audio file was not received.",
        },
        { status: 400 }
      );
    }

    const openAIForm = new FormData();

    openAIForm.append("file", audio);
    openAIForm.append(
      "model",
      "gpt-4o-mini-transcribe"
    );

    const response = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: openAIForm,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OPENAI TRANSCRIPTION ERROR:", data);

      return NextResponse.json(
        {
          success: false,
          error:
            data?.error?.message ||
            "OpenAI transcription failed.",
        },
        { status: response.status }
      );
    }

    const text = String(data?.text || "").trim();

    if (!text) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No speech was detected. Please speak clearly and try again.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      text,
    });
  } catch (error) {
    console.error("VOICE TRANSCRIBE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Voice transcription failed.",
      },
      { status: 500 }
    );
  }
}
