import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const apiKey = process.env.OPENAI_API_KEY;

const openai = apiKey
  ? new OpenAI({
      apiKey,
    })
  : null;

export async function POST(request: Request) {
  try {
    if (!openai) {
      return NextResponse.json(
        {
          success: false,
          message: "OpenAI API key is not configured.",
        },
        { status: 503 }
      );
    }

    const body = await request.json();

    const text = String(body.text || "").trim();

    if (!text) {
      return NextResponse.json(
        {
          success: false,
          message: "Text is required.",
        },
        { status: 400 }
      );
    }

    const speech = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "coral",
      input: text.slice(0, 4000),
      response_format: "mp3",
    });

    const audioBuffer = Buffer.from(await speech.arrayBuffer());

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Voice generation error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate AI voice.",
      },
      { status: 500 }
    );
  }
}