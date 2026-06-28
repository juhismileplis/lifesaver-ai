import { NextRequest, NextResponse } from "next/server";
import { breakDownTask } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { task } = await request.json();

    if (!task) {
      return NextResponse.json(
        { error: "Task object is required" },
        { status: 400 }
      );
    }

    const breakdown = await breakDownTask(task);

    return NextResponse.json({
      subtasks: breakdown?.subtasks || [],
      estimatedTotalTime: breakdown?.estimatedTotalTime || 0,
      approach: breakdown?.approach || "",
      tips: breakdown?.tips || [],
    });
  } catch (error) {
    console.error("Breakdown API error:", error);
    return NextResponse.json(
      {
        subtasks: [],
        estimatedTotalTime: 0,
        approach: "Start with the first small step you can take.",
        tips: ["Break the task into smaller pieces mentally."],
      },
      { status: 200 }
    );
  }
}
