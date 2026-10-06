import { Project, Task, ProjectMember, User, ProjectWorkloadSummary, Priority, TaskStatus } from "@/types";

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch("/api/projects");
  if (!res.ok) throw new Error("Failed to load projects");
  return res.json();
}

export async function fetchProject(projectId: string): Promise<Project> {
  const res = await fetch(`/api/projects/${projectId}`);
  if (!res.ok) throw new Error("Failed to load project");
  return res.json();
}

export async function fetchTasks(projectId: string, priority?: string): Promise<Task[]> {
  const url = priority && priority !== "ALL" 
    ? `/api/projects/${projectId}/tasks?priority=${priority}` 
    : `/api/projects/${projectId}/tasks`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load tasks");
  return res.json();
}

export async function fetchMembers(projectId: string): Promise<ProjectMember[]> {
  const res = await fetch(`/api/projects/${projectId}/members`);
  if (!res.ok) throw new Error("Failed to load project members");
  return res.json();
}

export async function fetchWorkload(projectId: string): Promise<ProjectWorkloadSummary> {
  const res = await fetch(`/api/projects/${projectId}/workload`);
  if (!res.ok) throw new Error("Failed to load workload statistics");
  return res.json();
}

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch("/api/users");
  if (!res.ok) throw new Error("Failed to load users");
  return res.json();
}

export async function createTaskApi(projectId: string, data: {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string | null;
  assignedUserId?: string | null;
}): Promise<Task> {
  const res = await fetch(`/api/projects/${projectId}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to create task");
  }
  return res.json();
}

export async function updateTaskApi(taskId: string, data: Partial<{
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string | null;
  assignedUserId?: string | null;
}>): Promise<Task> {
  const res = await fetch(`/api/tasks/${taskId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to update task");
  }
  return res.json();
}

export async function updateTaskStatusApi(taskId: string, status: TaskStatus): Promise<Task> {
  const res = await fetch(`/api/tasks/${taskId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to update status");
  }
  return res.json();
}

export async function deleteTaskApi(taskId: string): Promise<void> {
  const res = await fetch(`/api/tasks/${taskId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to delete task");
  }
}

export async function addMemberApi(projectId: string, userId: string, role: string = "MEMBER"): Promise<ProjectMember> {
  const res = await fetch(`/api/projects/${projectId}/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, role }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to add member to project");
  }
  return res.json();
}
