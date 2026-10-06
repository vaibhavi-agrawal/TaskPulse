export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type Priority = "LOW" | "MEDIUM" | "HIGH";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  tasks?: Task[];
  members?: ProjectMember[];
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: string;
  createdAt: string | Date;
  user: User;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string | Date | null;
  assignedUserId?: string | null;
  assignedUser?: User | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface UserWorkload {
  userId: string;
  name: string;
  email: string;
  avatar: string | null;
  totalAssignedTasks: number;
  todoCount: number;
  inProgressCount: number;
  doneCount: number;
  overloaded: boolean; // BUSINESS RULE: inProgressCount > 5
}

export interface ProjectWorkloadSummary {
  projectId: string;
  projectName: string;
  columnCounts: {
    TODO: number;
    IN_PROGRESS: number;
    DONE: number;
    total: number;
  };
  membersWorkload: UserWorkload[];
}
