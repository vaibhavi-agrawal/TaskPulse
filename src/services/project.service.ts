import { prisma } from "@/lib/prisma";

export async function getProjects() {
  return prisma.project.findMany({
    include: {
      _count: {
        select: {
          tasks: true,
          members: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getProjectById(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        include: {
          user: true,
        },
      },
      tasks: {
        include: {
          assignedUser: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
}

export async function createProject(data: { name: string; description?: string | null }) {
  return prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
    },
  });
}

export async function updateProject(projectId: string, data: { name?: string; description?: string | null }) {
  const existing = await prisma.project.findUnique({ where: { id: projectId } });
  if (!existing) {
    throw new Error("Project not found");
  }

  return prisma.project.update({
    where: { id: projectId },
    data,
  });
}

export async function deleteProject(projectId: string) {
  const existing = await prisma.project.findUnique({ where: { id: projectId } });
  if (!existing) {
    throw new Error("Project not found");
  }

  return prisma.project.delete({
    where: { id: projectId },
  });
}

export async function getProjectMembers(projectId: string) {
  const members = await prisma.projectMember.findMany({
    where: { projectId },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return members;
}

export async function addProjectMember(projectId: string, userId: string, role: string = "MEMBER") {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error("Project not found");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const existingMember = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });

  if (existingMember) {
    throw new Error("User is already a member of this project");
  }

  return prisma.projectMember.create({
    data: {
      projectId,
      userId,
      role,
    },
    include: {
      user: true,
    },
  });
}

export async function getAllUsers() {
  return prisma.user.findMany({
    orderBy: { name: "asc" },
  });
}
