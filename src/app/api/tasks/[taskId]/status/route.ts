import { NextResponse } from "next/server";
import { updateTaskStatus } from "@/services/task.service";
import { updateTaskStatusSchema } from "@/lib/validations";

export async function PATCH(request: Request, { params }: { params: { taskId: string } }) {
  try {
    const body = await request.json();
    const validated = updateTaskStatusSchema.parse(body);

    const updatedTask = await updateTaskStatus(params.taskId, validated.status);
    return NextResponse.json(updatedTask);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    const statusCode = error.message.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: error.message || "Failed to update task status" }, { status: statusCode });
  }
}
