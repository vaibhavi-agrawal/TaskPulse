import { NextResponse } from "next/server";
import { getProjectTasks, createTask } from "@/services/task.service";
import { createTaskSchema } from "@/lib/validations";

export async function GET(request: Request, { params }: { params: { projectId: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const priority = searchParams.get("priority");
    const tasks = await getProjectTasks(params.projectId, priority);
    return NextResponse.json(tasks);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { projectId: string } }) {
  try {
    const body = await request.json();
    const validated = createTaskSchema.parse(body);

    const task = await createTask(params.projectId, {
      title: validated.title,
      description: validated.description,
      status: validated.status,
      priority: validated.priority,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
      assignedUserId: validated.assignedUserId,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    const statusCode = error.message.includes("not a member") ? 400 : 500;
    return NextResponse.json({ error: error.message || "Failed to create task" }, { status: statusCode });
  }
}
