import { NextRequest, NextResponse } from "next/server";
import { getScheduleSuggestions } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { tasks } = await request.json();

    if (!tasks || !Array.isArray(tasks)) {
      return NextResponse.json(
        { error: "Tasks array is required" },
        { status: 400 }
      );
    }

    const suggestions = await getScheduleSuggestions(tasks);

    return NextResponse.json({
      schedule: suggestions?.schedule || [],
      tips: suggestions?.tips || [],
      focusRecommendation: suggestions?.focusRecommendation || "",
    });
  } catch (error) {
    console.error("Schedule API error:", error);
    return NextResponse.json(
      {
        schedule: [],
        tips: ["Break your work into 25-minute focused sessions."],
        focusRecommendation: "Start with your most important task first.",
      },
      { status: 200 }
    );
  }
}
