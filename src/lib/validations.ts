import { z } from "zod";

export const TaskStatusEnum = z.enum(["TODO", "IN_PROGRESS", "DONE"]);
export const PriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required").max(100, "Project name must be under 100 characters"),
  description: z.string().trim().max(500, "Description must be under 500 characters").optional().nullable(),
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(1, "Project name cannot be empty").max(100).optional(),
  description: z.string().trim().max(500).optional().nullable(),
});

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Task title is required").max(200, "Title must be under 200 characters"),
  description: z.string().trim().max(2000, "Description must be under 2000 characters").optional().nullable(),
  status: TaskStatusEnum.default("TODO"),
  priority: PriorityEnum.default("MEDIUM"),
  dueDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .or(z.date())
    .optional()
    .nullable(),
  assignedUserId: z.string().uuid("Invalid user ID").optional().nullable(),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1, "Title cannot be empty").max(200).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  status: TaskStatusEnum.optional(),
  priority: PriorityEnum.optional(),
  dueDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .or(z.date())
    .optional()
    .nullable(),
  assignedUserId: z.string().uuid("Invalid user ID").optional().nullable(),
});

export const updateTaskStatusSchema = z.object({
  status: TaskStatusEnum,
});

export const addMemberSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  role: z.string().trim().min(1).default("MEMBER"),
});
