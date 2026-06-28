import { NextRequest, NextResponse } from "next/server";
import { getProductivityInsights } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { tasks, habits } = await request.json();

    const analysis = await getProductivityInsights(tasks || [], habits || []);

    return NextResponse.json({
      insights: analysis?.insights || [],
      productivityScore: analysis?.productivityScore || 50,
      recommendation: analysis?.recommendation || "",
    });
  } catch (error) {
    console.error("Analyze API error:", error);
    return NextResponse.json(
      {
        insights: [],
        productivityScore: 50,
        recommendation: "Keep going! Consistency is key to productivity.",
      },
      { status: 200 }
    );
  }
}
