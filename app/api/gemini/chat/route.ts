import { NextRequest, NextResponse } from "next/server";
import { chatWithAI } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const reply = await chatWithAI(message, {
      tasks: context?.tasks || [],
      recentActivity: context?.recentActivity,
    });

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { reply: "I'm having trouble processing that right now. Please try again." },
      { status: 200 } // Return 200 even on error so the UI doesn't break
    );
  }
}
