"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";
import { useProjectStore } from "@/stores/project.store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateShort } from "@/utils/date.utils";

type ProjectStatusFilter = "all" | "active" | "completed" | "archived";
type ProjectSortField = "updatedAt" | "createdAt" | "deadline" | "name" | "progress";
type DeadlineWindowFilter = "any" | "overdue" | "next7" | "next30";

type SavedProjectView = {
  id: string;
  name: string;
  searchTerm: string;
  statusFilter: ProjectStatusFilter;
  sortBy: ProjectSortField;
  sortOrder: "asc" | "desc";
  minProgress: string;
  maxProgress: string;
  deadlineWindow: DeadlineWindowFilter;
};

const SAVED_VIEWS_KEY = "manager-project-saved-views";

function getStatusTone(status: "active" | "completed" | "archived") {
  if (status === "completed") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "archived") return "bg-zinc-100 text-zinc-700 border-zinc-200";
  return "bg-sky-50 text-sky-700 border-sky-200";
}

function getDeadlineBounds(windowFilter: DeadlineWindowFilter): { from?: string; to?: string } {
  const now = new Date();

  if (windowFilter === "overdue") {
    return { to: now.toISOString() };
  }

  if (windowFilter === "next7") {
    const in7Days = new Date(now);
    in7Days.setDate(in7Days.getDate() + 7);
    return { from: now.toISOString(), to: in7Days.toISOString() };
  }

  if (windowFilter === "next30") {
    const in30Days = new Date(now);
    in30Days.setDate(in30Days.getDate() + 30);
    return { from: now.toISOString(), to: in30Days.toISOString() };
  }

  return {};
}

export default function ManagerProjects() {
  const { user } = useAuthStore();
  const {
    projects,
    pagination,
    managerOverview,
    isLoading,
    error,
    getProjectsByManager,
    clearError,
  } = useProjectStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatusFilter>("all");
  const [sortBy, setSortBy] = useState<ProjectSortField>("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [minProgress, setMinProgress] = useState("");
  const [maxProgress, setMaxProgress] = useState("");
  const [deadlineWindow, setDeadlineWindow] = useState<DeadlineWindowFilter>("any");
  const [savedViews, setSavedViews] = useState<SavedProjectView[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 9;

  useEffect(() => {
    const rawViews = window.localStorage.getItem(SAVED_VIEWS_KEY);
    if (!rawViews) {
      return;
    }

    try {
      const parsed = JSON.parse(rawViews) as SavedProjectView[];
      setSavedViews(Array.isArray(parsed) ? parsed : []);
    } catch {
      setSavedViews([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(SAVED_VIEWS_KEY, JSON.stringify(savedViews));
  }, [savedViews]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  const activeQuery = useMemo(() => {
    const minProgressValue = minProgress.trim() === "" ? undefined : Number(minProgress);
    const maxProgressValue = maxProgress.trim() === "" ? undefined : Number(maxProgress);
    const deadlineBounds = getDeadlineBounds(deadlineWindow);

    return {
      page,
      limit: pageSize,
      search: debouncedSearchTerm || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
      sortBy,
      sortOrder,
      minProgress:
        minProgressValue !== undefined && Number.isFinite(minProgressValue)
          ? Math.max(0, Math.min(100, Math.floor(minProgressValue)))
          : undefined,
      maxProgress:
        maxProgressValue !== undefined && Number.isFinite(maxProgressValue)
          ? Math.max(0, Math.min(100, Math.floor(maxProgressValue)))
          : undefined,
      deadlineFrom: deadlineBounds.from,
      deadlineTo: deadlineBounds.to,
    };
  }, [
    page,
    pageSize,
    debouncedSearchTerm,
    statusFilter,
    sortBy,
    sortOrder,
    minProgress,
    maxProgress,
    deadlineWindow,
  ]);

  useEffect(() => {
    if (user?._id && user.role === "manager") {
      getProjectsByManager(user._id, activeQuery);
    }
  }, [user?._id, user?.role, activeQuery, getProjectsByManager]);

  const saveCurrentView = () => {
    const name = window.prompt("Name this view");
    if (!name || name.trim().length === 0) {
      return;
    }

    const newView: SavedProjectView = {
      id: `${Date.now()}`,
      name: name.trim(),
      searchTerm,
      statusFilter,
      sortBy,
      sortOrder,
      minProgress,
      maxProgress,
      deadlineWindow,
    };

    setSavedViews((current) => [newView, ...current].slice(0, 8));
  };

  const applySavedView = (view: SavedProjectView) => {
    setSearchTerm(view.searchTerm);
    setDebouncedSearchTerm(view.searchTerm.trim());
    setStatusFilter(view.statusFilter);
    setSortBy(view.sortBy);
    setSortOrder(view.sortOrder);
    setMinProgress(view.minProgress);
    setMaxProgress(view.maxProgress);
    setDeadlineWindow(view.deadlineWindow);
    setPage(1);
  };

  const deleteSavedView = (viewId: string) => {
    setSavedViews((current) => current.filter((view) => view.id !== viewId));
  };

  const stats = useMemo(() => {
    const total = managerOverview?.totalProjects ?? projects.length;
    const active = projects.filter((project) => project.status === "active").length;
    const completed = projects.filter((project) => project.status === "completed").length;
    const avgProgress =
      projects.length === 0
        ? 0
        : Math.round(
            projects.reduce((sum, project) => sum + (project.progress ?? 0), 0) / projects.length
          );

    return { total, active, completed, avgProgress };
  }, [projects, managerOverview?.totalProjects]);

  if (!user || user.role !== "manager") {
    return (
      <main className="space-y-6">
        <section className="mx-auto w-full max-w-6xl rounded-3xl border border-zinc-200 bg-white p-8">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Manager access required</h1>
          <p className="mt-3 max-w-[65ch] text-zinc-600">
            This workspace is available only for manager accounts. Switch to a manager profile to access projects.
          </p>
          <div className="mt-8">
            <Button asChild>
              <Link href="/manager-dashboard">Back to dashboard</Link>
            </Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="space-y-8">
      <section className="mx-auto w-full max-w-7xl space-y-8">
        <header className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_16px_40px_-28px_rgba(24,24,27,0.35)] md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="inline-flex rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-600">
                manager workspace
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tighter text-zinc-900 md:text-5xl">
                Project command center
              </h1>
              <p className="mt-3 max-w-[65ch] text-sm leading-relaxed text-zinc-600 md:text-base">
                Track project health, monitor progress, and focus your team on the work that matters most this week.
              </p>
            </div>

            <Button asChild className="h-11 rounded-full px-6">
              <Link href="/manager-dashboard">Create or manage projects</Link>
            </Button>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-3xl border border-zinc-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">total projects</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">{stats.total}</p>
          </article>
          <article className="rounded-3xl border border-zinc-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">active</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">{stats.active}</p>
          </article>
          <article className="rounded-3xl border border-zinc-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">completed</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">{stats.completed}</p>
          </article>
          <article className="rounded-3xl border border-zinc-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">avg. progress</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">{stats.avgProgress}%</p>
          </article>
        </section>

        <section className="rounded-[2rem] border border-zinc-200 bg-white p-5 md:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by project name or description"
              className="h-11"
            />
            <Select
              value={statusFilter}
              onValueChange={(value: ProjectStatusFilter) => {
                setStatusFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={`${sortBy}:${sortOrder}`}
              onValueChange={(value) => {
                const [nextSortBy, nextSortOrder] = value.split(":") as [ProjectSortField, "asc" | "desc"];
                setSortBy(nextSortBy);
                setSortOrder(nextSortOrder);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updatedAt:desc">Recently updated</SelectItem>
                <SelectItem value="createdAt:desc">Newest created</SelectItem>
                <SelectItem value="deadline:asc">Deadline soonest</SelectItem>
                <SelectItem value="progress:desc">Highest progress</SelectItem>
                <SelectItem value="name:asc">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={deadlineWindow}
              onValueChange={(value: DeadlineWindowFilter) => {
                setDeadlineWindow(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Deadline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any deadline</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="next7">Due in 7 days</SelectItem>
                <SelectItem value="next30">Due in 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_auto]">
            <Input
              type="number"
              value={minProgress}
              onChange={(event) => {
                setMinProgress(event.target.value);
                setPage(1);
              }}
              min={0}
              max={100}
              placeholder="Min progress (0-100)"
              className="h-11"
            />
            <Input
              type="number"
              value={maxProgress}
              onChange={(event) => {
                setMaxProgress(event.target.value);
                setPage(1);
              }}
              min={0}
              max={100}
              placeholder="Max progress (0-100)"
              className="h-11"
            />
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="h-11" onClick={saveCurrentView}>
                Save view
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11"
                onClick={() => {
                  setSearchTerm("");
                  setDebouncedSearchTerm("");
                  setStatusFilter("all");
                  setSortBy("updatedAt");
                  setSortOrder("desc");
                  setMinProgress("");
                  setMaxProgress("");
                  setDeadlineWindow("any");
                  setPage(1);
                }}
              >
                Reset
              </Button>
            </div>
          </div>

          {savedViews.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {savedViews.map((view) => (
                <div key={view.id} className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 p-1">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-8 rounded-full px-3"
                    onClick={() => applySavedView(view)}
                  >
                    {view.name}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-8 rounded-full px-2 text-zinc-500"
                    onClick={() => deleteSavedView(view.id)}
                  >
                    x
                  </Button>
                </div>
              ))}
            </div>
          ) : null}
          <p className="mt-3 text-xs text-zinc-500">
            Saved views are kept locally in this browser.
          </p>
        </section>

        {error ? (
          <section className="rounded-3xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-lg font-semibold text-red-800">Unable to load projects</h2>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  clearError();
                  if (user._id) {
                    getProjectsByManager(user._id, {
                      ...activeQuery,
                    });
                  }
                }}
              >
                Retry
              </Button>
            </div>
          </section>
        ) : null}

        {isLoading ? (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="rounded-3xl border border-zinc-200 bg-white p-5">
                <div className="h-5 w-3/4 animate-pulse rounded bg-zinc-200" />
                <div className="mt-4 h-4 w-full animate-pulse rounded bg-zinc-100" />
                <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-zinc-100" />
                <div className="mt-5 h-2 w-full animate-pulse rounded bg-zinc-100" />
                <div className="mt-5 h-10 w-full animate-pulse rounded-xl bg-zinc-100" />
              </div>
            ))}
          </section>
        ) : projects.length === 0 ? (
          <section className="rounded-[2rem] border border-zinc-200 bg-white p-8 text-center md:p-12">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">No projects match your filters</h2>
            <p className="mx-auto mt-3 max-w-[60ch] text-zinc-600">
              Adjust search criteria or create a new project from your dashboard to get started.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link href="/manager-dashboard">Go to manager dashboard</Link>
              </Button>
            </div>
          </section>
        ) : (
          <section className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => {
              const progress = Math.max(0, Math.min(100, project.progress ?? 0));

              return (
                <article
                  key={project._id}
                  className="rounded-3xl border border-zinc-200 bg-white p-5 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold tracking-tight text-zinc-900">{project.name}</h3>
                    <Badge className={`border ${getStatusTone(project.status)}`}>{project.status}</Badge>
                  </div>

                  <p className="mt-3 line-clamp-3 min-h-[3.75rem] text-sm leading-relaxed text-zinc-600">
                    {project.description || "No description provided yet."}
                  </p>

                  <div className="mt-5 space-y-2">
                    <div className="flex items-center justify-between text-sm text-zinc-600">
                      <span>Progress</span>
                      <span className="font-medium text-zinc-800">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                      <dt className="text-xs uppercase tracking-[0.12em] text-zinc-500">Team size</dt>
                      <dd className="mt-1 font-medium text-zinc-900">{project.team?.length ?? 0}</dd>
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                      <dt className="text-xs uppercase tracking-[0.12em] text-zinc-500">Deadline</dt>
                      <dd className="mt-1 font-medium text-zinc-900">
                        {project.deadline ? formatDateShort(project.deadline) : "Not set"}
                      </dd>
                    </div>
                  </dl>
                </article>
              );
            })}
            </div>

            {pagination && pagination.totalPages > 1 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3">
                <p className="text-sm text-zinc-600">
                  Page {pagination.page} of {pagination.totalPages} · {pagination.total} total projects
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9"
                    disabled={pagination.page <= 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() =>
                      setPage((current) => Math.min(pagination.totalPages, current + 1))
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </section>
        )}
      </section>
    </main>
  );
}
