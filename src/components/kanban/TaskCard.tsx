"use client";

import React from "react";
import { Task } from "@/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, MoreVertical, Edit2, Trash2, GripVertical, Clock } from "lucide-react";
import { format, isPast, parseISO } from "date-fns";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Due date & overdue calculation
  const formattedDueDate = task.dueDate
    ? format(new Date(task.dueDate), "MMM dd")
    : null;
  const isOverdue =
    task.dueDate && task.status !== "DONE" && isPast(new Date(task.dueDate));

  // Priority color styles
  const priorityStyles: Record<string, string> = {
    HIGH: "bg-red-50 text-red-700 border-red-200",
    MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
    LOW: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md ${
        isDragging ? "opacity-40 ring-2 ring-indigo-500 shadow-lg cursor-grabbing" : ""
      }`}
    >
      {/* Top Header: Priority badge & Drag Grip */}
      <div className="mb-2 flex items-center justify-between">
        <span
          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${
            priorityStyles[task.priority] || "bg-slate-50 text-slate-700 border-slate-200"
          }`}
        >
          {task.priority}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(task)}
            title="Edit Task"
            className="rounded p-1 text-slate-400 opacity-0 transition-opacity hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            title="Delete Task"
            className="rounded p-1 text-slate-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>

          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab text-slate-400 hover:text-slate-600 active:cursor-grabbing p-0.5"
            title="Drag to move column"
          >
            <GripVertical className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Title */}
      <h3
        onClick={() => onEdit(task)}
        className="cursor-pointer text-sm font-semibold text-slate-900 line-clamp-2 hover:text-indigo-600"
      >
        {task.title}
      </h3>

      {/* Description Snippet */}
      {task.description && (
        <p className="mt-1 text-xs text-slate-500 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Bottom Footer: Due date & Assigned User */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
        {/* Due Date */}
        {formattedDueDate ? (
          <div
            className={`flex items-center gap-1 text-[11px] font-medium ${
              isOverdue ? "text-red-600 font-semibold" : "text-slate-500"
            }`}
          >
            <Calendar className="h-3 w-3" />
            <span>{formattedDueDate}</span>
            {isOverdue && <span className="text-[10px] uppercase font-bold text-red-600">(Overdue)</span>}
          </div>
        ) : (
          <span className="text-[11px] text-slate-400 italic">No due date</span>
        )}

        {/* Assigned User Avatar */}
        {task.assignedUser ? (
          <div className="flex items-center gap-1.5" title={`Assigned to ${task.assignedUser.name}`}>
            {task.assignedUser.avatar ? (
              <img
                src={task.assignedUser.avatar}
                alt={task.assignedUser.name}
                className="h-5 w-5 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
                {task.assignedUser.name.slice(0, 1)}
              </div>
            )}
            <span className="hidden text-[11px] font-medium text-slate-600 sm:inline truncate max-w-[80px]">
              {task.assignedUser.name.split(" ")[0]}
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400">Unassigned</span>
        )}
      </div>
    </div>
  );
};
