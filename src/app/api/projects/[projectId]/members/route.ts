import { NextResponse } from "next/server";
import { getProjectMembers, addProjectMember } from "@/services/project.service";
import { addMemberSchema } from "@/lib/validations";

export async function GET(request: Request, { params }: { params: { projectId: string } }) {
  try {
    const members = await getProjectMembers(params.projectId);
    return NextResponse.json(members);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch project members" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { projectId: string } }) {
  try {
    const body = await request.json();
    const validated = addMemberSchema.parse(body);

    const member = await addProjectMember(params.projectId, validated.userId, validated.role);
    return NextResponse.json(member, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    const statusCode = error.message.includes("already a member")
      ? 409
      : error.message.includes("not found")
      ? 404
      : 500;
    return NextResponse.json({ error: error.message || "Failed to add member" }, { status: statusCode });
  }
}
