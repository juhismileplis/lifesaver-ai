import { NextRequest, NextResponse } from "next/server";

// In-memory task storage (for demo purposes)
// In production, this would be a database
let tasks: any[] = [];

export async function GET() {
  return NextResponse.json({ tasks });
}

export async function POST(request: NextRequest) {
  try {
    const task = await request.json();
    const newTask = {
      ...task,
      id: Math.random().toString(36).substring(2) + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      subtasks: task.subtasks || [],
    };
    tasks.push(newTask);
    return NextResponse.json({ task: newTask }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid task data" }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    tasks[index] = { ...tasks[index], ...updates };
    return NextResponse.json({ task: tasks[index] });
  } catch (error) {
    return NextResponse.json({ error: "Invalid update data" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Task ID required" }, { status: 400 });
  }
  tasks = tasks.filter((t) => t.id !== id);
  return NextResponse.json({ success: true });
}
