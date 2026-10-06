"use client";

import React from "react";
import { UserWorkload } from "@/types";
import { AlertTriangle, Plus, Users, ShieldAlert } from "lucide-react";

interface TeamMembersSectionProps {
  workloads: UserWorkload[];
  onAddMemberClick: () => void;
  selectedUserId?: string | null;
  onSelectUserFilter?: (userId: string | null) => void;
}

export const TeamMembersSection: React.FC<TeamMembersSectionProps> = ({
  workloads,
  onAddMemberClick,
  selectedUserId,
  onSelectUserFilter,
}) => {
  const overloadedCount = workloads.filter((m) => m.overloaded).length;

  return (
    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Users className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Team Workload & Capacity
          </h2>
          {overloadedCount > 0 && (
            <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 border border-red-200">
              <ShieldAlert className="h-3.5 w-3.5 text-red-600 animate-bounce" />
              {overloadedCount} Member Overloaded (&gt;5 Active Tasks)
            </span>
          )}
        </div>

        <button
          onClick={onAddMemberClick}
          className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <Plus className="h-3.5 w-3.5 text-slate-500" />
          Add Member
        </button>
      </div>

      {/* Member cards scroll/grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {workloads.map((member) => {
          const isSelected = selectedUserId === member.userId;
          return (
            <div
              key={member.userId}
              onClick={() => onSelectUserFilter && onSelectUserFilter(isSelected ? null : member.userId)}
              className={`relative flex cursor-pointer flex-col items-center rounded-xl border p-3 text-center transition-all ${
                isSelected
                  ? "border-indigo-500 bg-indigo-50/50 shadow-sm ring-2 ring-indigo-500/20"
                  : member.overloaded
                  ? "border-red-200 bg-red-50/20 hover:border-red-300"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
              }`}
            >
              {/* Avatar with pulsing red indicator when overloaded */}
              <div className="relative mb-2">
                <div
                  className={`h-12 w-12 overflow-hidden rounded-full border-2 transition-all ${
                    member.overloaded
                      ? "border-red-500 pulse-red-glow ring-4 ring-red-400/40"
                      : "border-slate-200"
                  }`}
                >
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm font-bold text-slate-600">
                      {member.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Overloaded badge overlay icon */}
                {member.overloaded && (
                  <span
                    title="Workload Warning: >5 tasks currently In Progress"
                    className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white shadow-sm ring-2 ring-white"
                  >
                    <AlertTriangle className="h-3 w-3 stroke-[3]" />
                  </span>
                )}
              </div>

              {/* Name */}
              <span className="truncate w-full text-xs font-semibold text-slate-800" title={member.name}>
                {member.name}
              </span>

              {/* In Progress count with highlighted badge */}
              <div className="mt-1.5 flex items-center gap-1.5">
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[11px] font-bold ${
                    member.overloaded
                      ? "bg-red-600 text-white shadow-sm"
                      : member.inProgressCount > 0
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {member.inProgressCount} In Progress
                </span>
              </div>

              {/* Overloaded Warning text */}
              {member.overloaded && (
                <span className="mt-1 text-[10px] font-extrabold uppercase tracking-wide text-red-600">
                  Overloaded!
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
