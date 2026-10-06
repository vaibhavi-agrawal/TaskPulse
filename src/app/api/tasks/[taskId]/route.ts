import { NextResponse } from "next/server";
import { getTaskById, updateTask, deleteTask } from "@/services/task.service";
import { updateTaskSchema } from "@/lib/validations";

export async function GET(request: Request, { params }: { params: { taskId: string } }) {
  try {
    const task = await getTaskById(params.taskId);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json(task);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch task" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { taskId: string } }) {
  try {
    const body = await request.json();
    const validated = updateTaskSchema.parse(body);

    const task = await updateTask(params.taskId, {
      title: validated.title,
      description: validated.description,
      status: validated.status,
      priority: validated.priority,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : validated.dueDate === null ? null : undefined,
      assignedUserId: validated.assignedUserId,
    });

    return NextResponse.json(task);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    const statusCode = error.message.includes("not found") ? 404 : error.message.includes("not a member") ? 400 : 500;
    return NextResponse.json({ error: error.message || "Failed to update task" }, { status: statusCode });
  }
}

export async function DELETE(request: Request, { params }: { params: { taskId: string } }) {
  try {
    await deleteTask(params.taskId);
    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error: any) {
    const statusCode = error.message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: error.message || "Failed to delete task" }, { status: statusCode });
  }
}
