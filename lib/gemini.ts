import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;
let geminiAvailable = false;

const SYSTEM_INSTRUCTION = `You are LifeSaver AI, an advanced proactive productivity companion. Your role is to help users manage tasks, meet deadlines, and optimize their productivity.

Core capabilities:
1. Task Analysis & Prioritization - Analyze tasks by urgency, importance, and impact
2. Smart Scheduling - Suggest optimal time slots based on workload and deadlines
3. Task Breakdown - Break complex tasks into manageable subtasks
4. Productivity Insights - Identify patterns and suggest improvements
5. Proactive Alerts - Warn about at-risk deadlines before they're missed

Personality: Empathetic, direct, and motivational. You're like a personal coach who genuinely cares about the user's success but isn't afraid to give tough love when deadlines are at risk.

Always be concise and actionable in your responses. Use data from the user's tasks to make specific, personalized recommendations.`;

function initGemini(): boolean {
  if (geminiAvailable) return true;
  
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.log("GEMINI_API_KEY not set, using local fallback AI");
      return false;
    }
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
    });
    geminiAvailable = true;
    return true;
  } catch (error) {
    console.error("Failed to initialize Gemini:", error);
    return false;
  }
}

// ============================================
// Local Fallback AI Responses
// ============================================

function getLocalChatResponse(message: string, tasks: any[]): string {
  const msg = message.toLowerCase();
  
  // Check for task-related queries
  if (msg.includes("what should i work on") || msg.includes("most important")) {
    const pending = tasks.filter(t => t.status !== "completed");
    if (pending.length === 0) return "You're all caught up! 🎉 Take a break or set some new goals.";
    
    const sorted = [...pending].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    const urgent = sorted.filter(t => {
      const hoursLeft = (new Date(t.deadline).getTime() - Date.now()) / (1000 * 60 * 60);
      return hoursLeft < 24 && hoursLeft > 0;
    });
    
    if (urgent.length > 0) {
      return `🚨 **Priority Alert!** You have ${urgent.length} urgent task${urgent.length > 1 ? "s" : ""}:\n\n${urgent.map(t => `• **${t.title}** — Due ${new Date(t.deadline).toLocaleDateString()}`).join("\n")}\n\nI'd suggest starting with "${urgent[0].title}" right away!`;
    }
    
    return `Here's what's on your plate:\n\n**Top Priority:** "${sorted[0].title}" (due ${new Date(sorted[0].deadline).toLocaleDateString()})\n\nYou have ${pending.length} pending task${pending.length > 1 ? "s" : ""} total. Tackle the top one first!`;
  }
  
  if (msg.includes("plan my day") || msg.includes("schedule")) {
    const pending = tasks.filter(t => t.status !== "completed");
    if (pending.length === 0) return "No tasks to schedule! Add some tasks and I'll help you plan your day.";
    
    const sorted = [...pending].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    
    return `📅 **Today's Game Plan:**\n\n${sorted.slice(0, 5).map((t, i) => {
      const priority = t.priority === "critical" ? "🔴" : t.priority === "high" ? "🟡" : "🟢";
      return `${priority} **${i + 1}. ${t.title}** — ${new Date(t.deadline).toLocaleDateString()}`;
    }).join("\n\n")}\n\n💡 **Tip:** Start with the highest priority task and block focused time for it.`;
  }
  
  if (msg.includes("overwhelmed") || msg.includes("stressed") || msg.includes("too much")) {
    const overdue = tasks.filter(t => t.status !== "completed" && new Date(t.deadline) < new Date());
    const pending = tasks.filter(t => t.status !== "completed");
    
    if (overdue.length > 0) {
      return `Take a deep breath! 😮‍💨 Let's break this down:\n\n1️⃣ **Overdue (${overdue.length}):** Let's triage these first. Can any be dropped or delegated?\n2️⃣ **Pending (${pending.length}):** Focus on just the top 3 most important ones.\n\nRemember: Done is better than perfect! Start with one small step.`;
    }
    
    return `I hear you! Let's simplify:\n\n1️⃣ **Pick your TOP 3** most important tasks\n2️⃣ **Break them** into tiny 10-minute steps\n3️⃣ **Start with just ONE** small step\n\nYou don't have to do everything at once. Progress, not perfection! 💪`;
  }
  
  if (msg.includes("break down") || msg.includes("breakdown") || msg.includes("subtask")) {
    const pending = tasks.filter(t => t.status !== "completed");
    if (pending.length === 0) return "Add some tasks first, and I'll help you break them down!";
    
    return `🧩 **Task Breakdown Guide:**\n\nTake "${pending[0].title}" and split it into:\n1️⃣ Research & gather info (15 min)\n2️⃣ Outline key points (15 min)\n3️⃣ First draft (30 min)\n4️⃣ Review & refine (15 min)\n5️⃣ Final submission (10 min)\n\nWant me to break down a specific task? Just tell me which one!`;
  }
  
  if (msg.includes("on track") || msg.includes("progress") || msg.includes("how am i")) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "completed").length;
    const overdue = tasks.filter(t => t.status !== "completed" && new Date(t.deadline) < new Date());
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    if (total === 0) return "You haven't added any tasks yet! Start by creating your first task.";
    
    return `📊 **Your Progress Report:**\n\n• **${completed}/${total}** tasks completed (${rate}%)\n• ${overdue.length > 0 ? `⚠️ ${overdue.length} overdue — need attention!` : "✅ No overdue tasks — great job!"}\n\n${rate >= 70 ? "🌟 You're crushing it! Keep the momentum going!" : rate >= 40 ? "👍 Making good progress! Focus on the remaining tasks." : "💪 You've got this! Start with one task at a time."}`;
  }
  
  if (msg.includes("motivat") || msg.includes("encourage") || msg.includes("inspire")) {
    const quotes = [
      "🔥 **You've got this!** Every task you complete is a step toward your goals.",
      "💪 **Success is the sum of small efforts repeated day in and day out.** Start now!",
      "🌟 **The secret to getting ahead is getting started.** Mark Twain knew what he was talking about!",
      "🚀 **Don't watch the clock. Do what it does — keep moving!** Let's tackle that next task.",
      "🎯 **You don't have to be great to start, but you have to start to be great.** Take the first step!",
      "⚡ **Your future self will thank you for what you do today.** Let's make it count!",
    ];
    return quotes[Math.floor(Math.random() * quotes.length)] + "\n\nWhat's the first task you want to tackle?";
  }
  
  if (msg.includes("hello") || msg.includes("hi ") || msg.includes("hey")) {
    const pending = tasks.filter(t => t.status !== "completed").length;
    return `Hey there! 👋 I'm your LifeSaver AI companion.\n\nYou have **${pending} task${pending !== 1 ? "s" : ""}** pending right now.\n\nHow can I help you today?\n• Tell me what you're working on\n• Ask me to plan your day\n• Get motivation\n• Break down a task`;
  }
  
  if (msg.includes("help") || msg.includes("what can you do")) {
    return `🤖 **Here's how I can help:**\n\n• 🎯 **\"What should I work on?\"** — Prioritize your tasks\n• 📅 **\"Plan my day\"** — Get a schedule\n• 🧩 **\"Break down [task]\"** — Split tasks into steps\n• 😮‍💨 **\"I'm overwhelmed\"** — Get calm & focused\n• 📊 **\"Am I on track?\"** — Check progress\n• 🔥 **\"Motivate me!\"** — Get inspired\n\nWhat would you like help with?`;
  }
  
  // Default response with task context
  if (tasks.length > 0) {
    const pending = tasks.filter(t => t.status !== "completed");
    return `I understand you're asking about "${message}". Based on your current workload:\n\nYou have **${pending.length} pending task${pending.length !== 1 ? "s" : ""}** to focus on.\n\nHere's what I'd suggest:\n1️⃣ Check your most urgent deadlines\n2️⃣ Prioritize tasks that align with your goals\n3️⃣ Take it one step at a time\n\nWant me to dive deeper into any specific task or area?`;
  }
  
  return `That's a great question! To give you the best answer, could you tell me more about what you're looking for? I can help with task management, productivity tips, scheduling, and more. 🤖`;
}

function getLocalInsights(tasks: any[], habits: any[]): any {
  const total = tasks.length;
  const completed = tasks.filter((t: any) => t.status === "completed").length;
  const pending = tasks.filter((t: any) => t.status !== "completed").length;
  const overdue = tasks.filter((t: any) => t.status !== "completed" && new Date(t.deadline) < new Date()).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  const insights: any[] = [];
  
  if (overdue > 0) {
    insights.push({
      id: "overdue-tasks",
      type: "warning",
      title: "⚠️ Overdue Tasks Need Your Attention",
      description: `You have ${overdue} task${overdue > 1 ? "s" : ""} past deadline. Don't worry — review each one, see if deadlines can be adjusted, and prioritize what's still valuable. Break them down into smaller steps to make progress easier.`,
      severity: "high",
    });
  }
  
  if (completionRate >= 70 && completed > 0) {
    insights.push({
      id: "great-progress",
      type: "achievement",
      title: "🏆 Excellent Progress!",
      description: `You've completed ${completed} out of ${total} tasks (${completionRate}%). That's impressive! To keep this momentum, try batching similar tasks together and taking short breaks between them.`,
      severity: "low",
    });
  }
  
  if (pending > 3) {
    insights.push({
      id: "workload-balance",
      type: "suggestion",
      title: "💡 Workload Management Tip",
      description: `With ${pending} tasks pending, try the "Eat the Frog" method — tackle the most difficult or unpleasant task first thing. The rest of your day will feel easier!`,
      severity: "medium",
    });
  }
  
  if (habits && habits.length > 0) {
    const bestHabit = habits.reduce((best: any, h: any) => (h.streak > (best?.streak || 0) ? h : best), null);
    if (bestHabit && bestHabit.streak > 0) {
      insights.push({
        id: "habit-streak",
        type: "trend",
        title: "🔥 Habit Streak Going Strong!",
        description: `You've maintained "${bestHabit.name}" for ${bestHabit.streak} day${bestHabit.streak > 1 ? "s" : ""} in a row! Consistency is key — try linking this habit to an existing routine to make it stick forever.`,
        severity: "low",
      });
    }
  }
  
  if (insights.length === 0 && total > 0) {
    insights.push({
      id: "getting-started",
      type: "suggestion",
      title: "🚀 Let's Get Things Moving!",
      description: "You've got tasks ready to go. Try completing just one task right now to build momentum. Remember: progress, not perfection!",
      severity: "low",
    });
  }
  
  return {
    insights,
    productivityScore: completionRate || 50,
    recommendation: overdue > 0 
      ? "Focus on clearing overdue tasks first. Reschedule or reprioritize as needed."
      : pending > 0
      ? "Great foundation! Build momentum by completing your highest-priority task."
      : "You're all caught up! Consider setting new goals or learning a new skill.",
  };
}

// ============================================
// Public API Functions
// ============================================

export async function analyzeTasks(tasks: any[]) {
  if (!initGemini()) {
    const pending = tasks.filter((t: any) => t.status !== "completed");
    const sorted = [...pending].sort((a: any, b: any) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    return {
      priorities: sorted.slice(0, 5).map((t: any, i: number) => ({
        taskId: t.id,
        score: Math.max(1, 10 - i * 2),
        reason: t.priority === "critical" ? "Critical priority task" : `Priority ${i + 1} based on deadline and importance`,
        suggestedAction: `Focus on "${t.title}" first — due ${new Date(t.deadline).toLocaleDateString()}`,
      })),
      atRisk: sorted.filter((t: any) => new Date(t.deadline) < new Date()).map((t: any) => ({
        taskId: t.id,
        reason: `"${t.title}" is overdue`,
        urgency: "high",
      })),
      suggestions: pending.length > 0 
        ? ["Start with your most urgent task first", "Break large tasks into smaller steps", "Take short breaks between tasks"]
        : ["You're all caught up! Consider setting new goals"],
      overallAssessment: pending.length === 0 
        ? "No pending tasks. Great job!" 
        : `${pending.length} task${pending.length > 1 ? "s" : ""} pending. ${sorted.filter((t: any) => new Date(t.deadline) < new Date()).length > 0 ? "Some tasks are overdue — prioritize those first." : "Stay on track by maintaining your current momentum."}`,
    };
  }

  const prompt = `Analyze these tasks and provide prioritization, scheduling suggestions, and identify any at-risk deadlines.\n\nTasks: ${JSON.stringify(tasks, null, 2)}\n\nReturn a JSON object with:\n{\n  "priorities": [{ "taskId": "id", "score": 1-10, "reason": "why", "suggestedAction": "what to do" }],\n  "atRisk": [{ "taskId": "id", "reason": "why at risk", "urgency": "high|medium|low" }],\n  "suggestions": ["actionable suggestion 1", "actionable suggestion 2"],\n  "overallAssessment": "brief assessment of workload"\n}`;

  try {
    const result = await model!.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json\\n?/g, "").replace(/```\\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return null;
  }
}

export async function getScheduleSuggestions(tasks: any[]) {
  if (!initGemini()) {
    const pending = tasks.filter((t: any) => t.status !== "completed");
    const sorted = [...pending].sort((a: any, b: any) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    return {
      schedule: sorted.slice(0, 5).map((t: any, i: number) => ({
        taskId: t.id,
        suggestedTime: `${9 + i}:00`,
        duration: 60,
        reason: `Priority ${i + 1} — due ${new Date(t.deadline).toLocaleDateString()}`,
      })),
      tips: ["Start with your most important task first", "Take a 5-minute break between tasks", "Turn off notifications during focus time"],
      focusRecommendation: sorted[0]?.title || "Start with any task to build momentum",
    };
  }

  const prompt = `Given these tasks, suggest an optimal schedule for today. Consider deadlines, priority, estimated effort, and workload balance.\n\nTasks: ${JSON.stringify(tasks, null, 2)}\n\nReturn a JSON object:\n{\n  "schedule": [{ "taskId": "id", "suggestedTime": "09:00", "duration": 60, "reason": "why scheduled here" }],\n  "tips": ["productivity tip 1", "tip 2"],\n  "focusRecommendation": "what to focus on first"\n}`;

  try {
    const result = await model!.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json\\n?/g, "").replace(/```\\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Gemini schedule error:", error);
    return null;
  }
}

export async function breakDownTask(task: any) {
  if (!initGemini()) {
    return {
      subtasks: [
        { title: `Research & gather materials for "${task.title}"`, estimatedMinutes: 15 },
        { title: `Create an outline/plan for "${task.title}"`, estimatedMinutes: 15 },
        { title: `Work on the main content of "${task.title}"`, estimatedMinutes: 30 },
        { title: `Review and refine "${task.title}"`, estimatedMinutes: 15 },
        { title: `Finalize and submit "${task.title}"`, estimatedMinutes: 10 },
      ],
      estimatedTotalTime: 85,
      approach: "Start with research, then outline, execute, review, and finalize. Take short breaks between each step.",
      tips: ["Break down large tasks into 25-minute focused sessions", "Use the Pomodoro technique for better focus"],
    };
  }

  const prompt = `Break this task down into smaller, actionable subtasks.\n\nTask: ${JSON.stringify(task, null, 2)}\n\nReturn a JSON object:\n{\n  "subtasks": [{ "title": "subtask description", "estimatedMinutes": 30 }],\n  "estimatedTotalTime": 120,\n  "approach": "brief suggested approach",\n  "tips": ["tip 1", "tip 2"]\n}`;

  try {
    const result = await model!.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json\\n?/g, "").replace(/```\\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Gemini breakdown error:", error);
    return null;
  }
}

export async function getProductivityInsights(tasks: any[], habits: any[] = []) {
  if (!initGemini()) {
    return getLocalInsights(tasks, habits);
  }

  const prompt = `Based on this user's task history and habits, provide personalized productivity insights.\n\nTasks: ${JSON.stringify(tasks, null, 2)}\nHabits: ${JSON.stringify(habits, null, 2)}\n\nReturn a JSON object:\n{\n  "insights": [{ "type": "warning|suggestion|achievement|trend", "title": "short title", "description": "detailed insight", "severity": "low|medium|high" }],\n  "productivityScore": 75,\n  "recommendation": "single most important action to improve"\n}`;

  try {
    const result = await model!.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json\\n?/g, "").replace(/```\\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Gemini insights error:", error);
    return null;
  }
}

export async function chatWithAI(
  message: string,
  context: { tasks: any[]; recentActivity?: string }
) {
  if (!initGemini()) {
    return getLocalChatResponse(message, context.tasks);
  }

  const prompt = `User message: "${message}"\n\nCurrent context - Tasks: ${JSON.stringify(context.tasks, null, 2)}\n${context.recentActivity ? `Recent activity: ${context.recentActivity}` : ""}\n\nRespond as LifeSaver AI - a proactive productivity companion. Be conversational, empathetic, and actionable. If the user mentions a task or deadline concern, check their tasks and provide specific guidance. Use markdown sparingly - plain text is preferred.\n\nIf you detect that the user is at risk of missing a deadline, be firm but supportive. Suggest specific actions they can take right now.`;

  try {
    const result = await model!.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini chat error:", error);
    return "I'm having trouble connecting right now. Please try again in a moment.";
  }
}
