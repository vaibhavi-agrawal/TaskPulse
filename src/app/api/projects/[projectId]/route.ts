import { NextResponse } from "next/server";
import { getProjectById, updateProject, deleteProject } from "@/services/project.service";
import { updateProjectSchema } from "@/lib/validations";

export async function GET(request: Request, { params }: { params: { projectId: string } }) {
  try {
    const project = await getProjectById(params.projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch project" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { projectId: string } }) {
  try {
    const body = await request.json();
    const validated = updateProjectSchema.parse(body);
    const updated = await updateProject(params.projectId, validated);
    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { projectId: string } }) {
  try {
    await deleteProject(params.projectId);
    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete project" }, { status: 500 });
  }
}
