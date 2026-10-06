"use client";

import React from "react";
import { Task, TaskStatus } from "@/types";
import { TaskCard } from "./TaskCard";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus, ListTodo, PlayCircle, CheckCircle2 } from "lucide-react";

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onAddTask: (status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  title,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: "Column",
      status,
    },
  });

  // Column header configurations
  const configMap: Record<
    TaskStatus,
    { icon: React.ReactNode; badgeClass: string; borderClass: string }
  > = {
    TODO: {
      icon: <ListTodo className="h-4 w-4 text-slate-500" />,
      badgeClass: "bg-slate-100 text-slate-700",
      borderClass: "border-slate-300",
    },
    IN_PROGRESS: {
      icon: <PlayCircle className="h-4 w-4 text-amber-600" />,
      badgeClass: "bg-amber-100 text-amber-800",
      borderClass: "border-amber-400",
    },
    DONE: {
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
      badgeClass: "bg-emerald-100 text-emerald-800",
      borderClass: "border-emerald-400",
    },
  };

  const { icon, badgeClass, borderClass } = configMap[status];

  return (
    <div className="flex flex-1 flex-col rounded-2xl border border-slate-200 bg-slate-100/70 p-3 shadow-inner min-w-[280px]">
      {/* Column Header with Count */}
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">{title}</h2>
          {/* Column count badge: To-Do (4), In Progress (7), Done (12) */}
          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${badgeClass}`}>
            {tasks.length}
          </span>
        </div>

        <button
          onClick={() => onAddTask(status)}
          title={`Add task to ${title}`}
          className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-slate-700 transition-colors shadow-sm border border-transparent hover:border-slate-200"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Droppable Task List */}
      <div
        ref={setNodeRef}
        className={`flex flex-1 flex-col gap-2.5 rounded-xl p-1 transition-colors min-h-[300px] ${
          isOver ? "bg-indigo-50/60 ring-2 ring-indigo-400/50" : ""
        }`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>

        {/* Empty Column State */}
        {tasks.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-12 text-center text-slate-400">
            <p className="text-xs font-medium">No tasks in {title}</p>
            <button
              onClick={() => onAddTask(status)}
              className="mt-2 text-xs font-semibold text-indigo-600 hover:underline"
            >
              + Create one
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
