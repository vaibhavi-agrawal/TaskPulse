import { prisma } from "@/lib/prisma";

export async function validateProjectMember(projectId: string, userId?: string | null): Promise<boolean> {
  if (!userId) return true; // Unassigned is valid
  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });
  return !!member;
}

export async function getProjectTasks(projectId: string, priority?: string | null) {
  const where: any = { projectId };
  if (priority && priority !== "ALL") {
    where.priority = priority;
  }

  return prisma.task.findMany({
    where,
    include: {
      assignedUser: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getTaskById(taskId: string) {
  return prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignedUser: true,
      project: true,
    },
  });
}

export async function createTask(projectId: string, data: {
  title: string;
  description?: string | null;
  status?: string;
  priority?: string;
  dueDate?: Date | null;
  assignedUserId?: string | null;
}) {
  // Validate assigned user belongs to project
  if (data.assignedUserId) {
    const isMember = await validateProjectMember(projectId, data.assignedUserId);
    if (!isMember) {
      throw new Error("Assigned user is not a member of this project");
    }
  }

  return prisma.task.create({
    data: {
      projectId,
      title: data.title,
      description: data.description,
      status: data.status || "TODO",
      priority: data.priority || "MEDIUM",
      dueDate: data.dueDate,
      assignedUserId: data.assignedUserId,
    },
    include: {
      assignedUser: true,
    },
  });
}

export async function updateTask(taskId: string, data: {
  title?: string;
  description?: string | null;
  status?: string;
  priority?: string;
  dueDate?: Date | null;
  assignedUserId?: string | null;
}) {
  const existing = await prisma.task.findUnique({ where: { id: taskId } });
  if (!existing) {
    throw new Error("Task not found");
  }

  if (data.assignedUserId) {
    const isMember = await validateProjectMember(existing.projectId, data.assignedUserId);
    if (!isMember) {
      throw new Error("Assigned user is not a member of this project");
    }
  }

  return prisma.task.update({
    where: { id: taskId },
    data,
    include: {
      assignedUser: true,
    },
  });
}

export async function updateTaskStatus(taskId: string, status: string) {
  const validStatuses = ["TODO", "IN_PROGRESS", "DONE"];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(", ")}`);
  }

  const existing = await prisma.task.findUnique({ where: { id: taskId } });
  if (!existing) {
    throw new Error("Task not found");
  }

  return prisma.task.update({
    where: { id: taskId },
    data: { status },
    include: {
      assignedUser: true,
    },
  });
}

export async function deleteTask(taskId: string) {
  const existing = await prisma.task.findUnique({ where: { id: taskId } });
  if (!existing) {
    throw new Error("Task not found");
  }

  return prisma.task.delete({
    where: { id: taskId },
  });
}
