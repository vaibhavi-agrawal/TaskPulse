"use client";

import React from "react";
import { Project, Priority } from "@/types";
import { Activity, Plus, Search, Filter, FolderKanban } from "lucide-react";

interface NavbarProps {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (p: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onCreateTaskClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  priorityFilter,
  onPriorityFilterChange,
  searchQuery,
  onSearchChange,
  onCreateTaskClick,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-100">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900">TaskPulse</span>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-100">
                MVP
              </span>
            </div>
            <p className="hidden text-xs text-slate-500 sm:block">Workload-Balanced Kanban</p>
          </div>
        </div>

        {/* Center: Project selector & Filters */}
        <div className="flex items-center gap-3">
          {/* Project Selector */}
          <div className="relative">
            <select
              value={selectedProjectId}
              onChange={(e) => onSelectProject(e.target.value)}
              className="h-9 rounded-lg border border-slate-300 bg-white px-3 pr-8 text-sm font-medium text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  📁 {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search box */}
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 w-44 rounded-lg border border-slate-300 bg-slate-50/70 pl-8 pr-3 text-sm placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 lg:w-56"
            />
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
            <Filter className="ml-1.5 h-3.5 w-3.5 text-slate-400" />
            {(["ALL", "LOW", "MEDIUM", "HIGH"] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => onPriorityFilterChange(lvl)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  priorityFilter === lvl
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {lvl === "ALL" ? "All" : lvl.charAt(0) + lvl.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Right Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={onCreateTaskClick}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:bg-indigo-800"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Task</span>
          </button>
        </div>
      </div>
    </header>
  );
};
