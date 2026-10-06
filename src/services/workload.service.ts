import { prisma } from "@/lib/prisma";
import { UserWorkload, ProjectWorkloadSummary } from "@/types";

export const OVERLOADED_THRESHOLD = 5;

/**
 * Pure business rule: a user is overloaded if they have MORE THAN 5 tasks in IN_PROGRESS.
 */
export function isUserOverloaded(inProgressCount: number): boolean {
  return inProgressCount > OVERLOADED_THRESHOLD;
}

/**
 * Calculates workload metrics for all members of a project.
 * Enforces business logic on the server side.
 */
export async function getProjectWorkload(projectId: string): Promise<ProjectWorkloadSummary> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        include: {
          user: true,
        },
      },
      tasks: true,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // Column counts
  let todoCount = 0;
  let inProgressCount = 0;
  let doneCount = 0;

  for (const task of project.tasks) {
    if (task.status === "TODO") todoCount++;
    else if (task.status === "IN_PROGRESS") inProgressCount++;
    else if (task.status === "DONE") doneCount++;
  }

  // Calculate per-member workload
  const membersWorkload: UserWorkload[] = project.members.map((member) => {
    const userTasks = project.tasks.filter((t) => t.assignedUserId === member.userId);
    const mTodo = userTasks.filter((t) => t.status === "TODO").length;
    const mInProgress = userTasks.filter((t) => t.status === "IN_PROGRESS").length;
    const mDone = userTasks.filter((t) => t.status === "DONE").length;

    return {
      userId: member.userId,
      name: member.user.name,
      email: member.user.email,
      avatar: member.user.avatar,
      totalAssignedTasks: userTasks.length,
      todoCount: mTodo,
      inProgressCount: mInProgress,
      doneCount: mDone,
      overloaded: isUserOverloaded(mInProgress),
    };
  });

  return {
    projectId: project.id,
    projectName: project.name,
    columnCounts: {
      TODO: todoCount,
      IN_PROGRESS: inProgressCount,
      DONE: doneCount,
      total: project.tasks.length,
    },
    membersWorkload,
  };
}
