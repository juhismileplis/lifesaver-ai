import { NextRequest, NextResponse } from "next/server";
import { analyzeTasks } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { tasks } = await request.json();

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json(
        { error: "Tasks array is required" },
        { status: 400 }
      );
    }

    const analysis = await analyzeTasks(tasks);

    return NextResponse.json({
      priorities: analysis?.priorities || [],
      atRisk: analysis?.atRisk || [],
      suggestions: analysis?.suggestions || [],
      overallAssessment: analysis?.overallAssessment || "",
    });
  } catch (error) {
    console.error("Prioritize API error:", error);
    return NextResponse.json(
      {
        priorities: [],
        atRisk: [],
        suggestions: ["Take a moment to review your tasks manually."],
        overallAssessment: "AI analysis temporarily unavailable.",
      },
      { status: 200 }
    );
  }
}
