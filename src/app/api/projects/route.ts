import { NextResponse } from "next/server";
import { getProjects, createProject } from "@/services/project.service";
import { createProjectSchema } from "@/lib/validations";

export async function GET() {
  try {
    const projects = await getProjects();
    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = createProjectSchema.parse(body);
    const project = await createProject(validated);
    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to create project" }, { status: 500 });
  }
}
