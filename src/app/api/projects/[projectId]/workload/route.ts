import { NextResponse } from "next/server";
import { getProjectWorkload } from "@/services/workload.service";

export async function GET(request: Request, { params }: { params: { projectId: string } }) {
  try {
    const workload = await getProjectWorkload(params.projectId);
    return NextResponse.json(workload);
  } catch (error: any) {
    const statusCode = error.message === "Project not found" ? 404 : 500;
    return NextResponse.json({ error: error.message || "Failed to fetch project workload" }, { status: statusCode });
  }
}
