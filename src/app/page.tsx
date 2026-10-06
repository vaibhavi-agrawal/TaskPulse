"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Project, Task, ProjectMember, UserWorkload, TaskStatus, Priority } from "@/types";
import {
  fetchProjects,
  fetchProject,
  fetchTasks,
  fetchMembers,
  fetchWorkload,
  createTaskApi,
  updateTaskApi,
  updateTaskStatusApi,
  deleteTaskApi,
} from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { TeamMembersSection } from "@/components/team/TeamMembersSection";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { TaskModal } from "@/components/tasks/TaskModal";
import { AddMemberModal } from "@/components/team/AddMemberModal";
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Plus,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [workloads, setWorkloads] = useState<UserWorkload[]>([]);

  // Filters & Search
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [userFilter, setUserFilter] = useState<string | null>(null);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [defaultTaskStatus, setDefaultTaskStatus] = useState<TaskStatus>("TODO");
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial load: get projects
  useEffect(() => {
    fetchProjects()
      .then((data) => {
        setProjects(data);
        if (data.length > 0) {
          setSelectedProjectId(data[0].id);
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load projects");
        setLoading(false);
      });
  }, []);

  // Reload current project data
  const loadProjectData = useCallback(
    async (projectId: string, showRefresh = false) => {
      if (!projectId) return;
      try {
        if (showRefresh) setRefreshing(true);
        const [projData, tasksData, membersData, workloadData] = await Promise.all([
          fetchProject(projectId),
          fetchTasks(projectId, priorityFilter),
          fetchMembers(projectId),
          fetchWorkload(projectId),
        ]);

        setCurrentProject(projData);
        setTasks(tasksData);
        setMembers(membersData);
        setWorkloads(workloadData.membersWorkload);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load project details");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [priorityFilter]
  );

  useEffect(() => {
    if (selectedProjectId) {
      loadProjectData(selectedProjectId);
    }
  }, [selectedProjectId, loadProjectData]);

  // Handle Drag & Drop status change with optimistic UI update
  const handleTaskStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    // 1. Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      // 2. Persist to API
      await updateTaskStatusApi(taskId, newStatus);
      // 3. Immediately refresh workload from server to recalculate overloaded status
      if (selectedProjectId) {
        const workloadData = await fetchWorkload(selectedProjectId);
        setWorkloads(workloadData.membersWorkload);
      }
    } catch (err: any) {
      // Revert if error
      if (selectedProjectId) {
        loadProjectData(selectedProjectId);
      }
      alert(`Error updating task status: ${err.message}`);
    }
  };

  // Create or Update task
  const handleSaveTask = async (formData: {
    title: string;
    description?: string;
    priority: Priority;
    status: TaskStatus;
    dueDate?: string | null;
    assignedUserId?: string | null;
  }) => {
    if (taskToEdit) {
      await updateTaskApi(taskToEdit.id, formData);
    } else {
      await createTaskApi(selectedProjectId, formData);
    }
    // Refresh board & workloads
    await loadProjectData(selectedProjectId);
  };

  // Delete task
  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      await deleteTaskApi(taskToDelete);
      setTaskToDelete(null);
      await loadProjectData(selectedProjectId);
    } catch (err: any) {
      alert(`Failed to delete task: ${err.message}`);
    }
  };

  // Filter tasks locally by search & assigned user filter
  const filteredTasks = tasks.filter((task) => {
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchDesc) return false;
    }
    // Assigned user filter
    if (userFilter) {
      if (task.assignedUserId !== userFilter) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={(id) => setSelectedProjectId(id)}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={(p) => setPriorityFilter(p)}
        searchQuery={searchQuery}
        onSearchChange={(q) => setSearchQuery(q)}
        onCreateTaskClick={() => {
          setTaskToEdit(null);
          setDefaultTaskStatus("TODO");
          setIsTaskModalOpen(true);
        }}
      />

      {/* Main Container */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-center justify-between rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700 border border-red-200 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => loadProjectData(selectedProjectId, true)}
              className="rounded-lg bg-red-100 px-3 py-1 text-xs text-red-800 hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex h-96 flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="text-sm font-medium text-slate-500">Loading TaskPulse workspace...</p>
          </div>
        ) : !currentProject ? (
          <div className="flex h-96 flex-col items-center justify-center text-center">
            <FolderKanban className="h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-base font-bold text-slate-700">No project selected</h3>
            <p className="text-xs text-slate-400">Please choose or create a project to get started.</p>
          </div>
        ) : (
          <>
            {/* Project Title Header Banner */}
            <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    {currentProject.name}
                  </h1>
                  <button
                    onClick={() => loadProjectData(selectedProjectId, true)}
                    title="Refresh data"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                  </button>
                </div>
                {currentProject.description && (
                  <p className="mt-1 text-xs text-slate-500 max-w-2xl">
                    {currentProject.description}
                  </p>
                )}
              </div>

              {/* Quick stats pills */}
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-slate-700">
                  Total: {tasks.length} tasks
                </span>
                <span className="rounded-lg bg-amber-50 px-3 py-1.5 text-amber-800 border border-amber-200">
                  Active: {tasks.filter((t) => t.status === "IN_PROGRESS").length}
                </span>
                <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-emerald-800 border border-emerald-200">
                  Done: {tasks.filter((t) => t.status === "DONE").length}
                </span>
              </div>
            </div>

            {/* Team Members Workload Section (with pulsing red overloaded avatar) */}
            <TeamMembersSection
              workloads={workloads}
              onAddMemberClick={() => setIsAddMemberOpen(true)}
              selectedUserId={userFilter}
              onSelectUserFilter={(uid) => setUserFilter(uid)}
            />

            {/* User Filter Indicator Banner */}
            {userFilter && (
              <div className="mb-4 flex items-center justify-between rounded-xl bg-indigo-50 px-4 py-2 text-xs font-medium text-indigo-800 border border-indigo-200">
                <span>
                  Filtering tasks assigned to:{" "}
                  <strong>{workloads.find((w) => w.userId === userFilter)?.name}</strong>
                </span>
                <button
                  onClick={() => setUserFilter(null)}
                  className="font-bold underline hover:text-indigo-950"
                >
                  Clear filter
                </button>
              </div>
            )}

            {/* Kanban Board with Drag & Drop */}
            <KanbanBoard
              tasks={filteredTasks}
              onTaskStatusChange={handleTaskStatusChange}
              onAddTask={(status) => {
                setTaskToEdit(null);
                setDefaultTaskStatus(status);
                setIsTaskModalOpen(true);
              }}
              onEditTask={(task) => {
                setTaskToEdit(task);
                setIsTaskModalOpen(true);
              }}
              onDeleteTask={(taskId) => setTaskToDelete(taskId)}
            />
          </>
        )}
      </main>

      {/* Task Create / Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        taskToEdit={taskToEdit}
        defaultStatus={defaultTaskStatus}
        members={members}
        onSubmit={handleSaveTask}
      />

      {/* Add Member Modal */}
      {currentProject && (
        <AddMemberModal
          isOpen={isAddMemberOpen}
          onClose={() => setIsAddMemberOpen(false)}
          projectId={currentProject.id}
          currentMembers={members}
          onMemberAdded={() => loadProjectData(selectedProjectId)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Delete Task?</h3>
            <p className="mt-2 text-xs text-slate-500">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setTaskToDelete(null)}
                className="rounded-xl px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteTask}
                className="rounded-xl bg-red-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
