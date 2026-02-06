"use client"

import { useState } from "react"
import useSWR from "swr"
import { cn } from "@/lib/utils"
import { LANGUAGES } from "@/lib/languages"
import { RepoCard, RepoCardSkeleton } from "@/components/repo-card"
import { Flame, Calendar, CalendarDays, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"

const fetcher = (url: string) =>
  fetch(url, {
    headers: {
      Accept: "application/vnd.github.v3+json",
    },
  }).then((res) => res.json())

const TIME_RANGES = [
  { value: "daily", label: "Today", icon: Flame },
  { value: "weekly", label: "This Week", icon: Calendar },
  { value: "monthly", label: "This Month", icon: CalendarDays },
]

function getDateSince(range: string): string {
  const now = new Date()
  switch (range) {
    case "weekly":
      now.setDate(now.getDate() - 7)
      break
    case "monthly":
      now.setMonth(now.getMonth() - 1)
      break
    default:
      now.setDate(now.getDate() - 1)
      break
  }
  return now.toISOString().split("T")[0]
}

export function TrendingList() {
  const [range, setRange] = useState("daily")
  const [language, setLanguage] = useState("")
  const [page, setPage] = useState(1)

  const dateSince = getDateSince(range)
  let query = `created:>${dateSince}`
  if (language) {
    query += ` language:${language}`
  }

  const sortMap: Record<string, string> = {
    daily: "stars",
    weekly: "stars",
    monthly: "stars",
  }

  const params = new URLSearchParams({
    q: query,
    sort: sortMap[range] || "stars",
    order: "desc",
    per_page: "25",
    page: String(page),
  })

  const { data, error, isLoading } = useSWR(
    `https://api.github.com/search/repositories?${params.toString()}`,
    fetcher,
    { revalidateOnFocus: false, keepPreviousData: true }
  )

  const repos = data?.items || []
  const totalCount = data?.total_count || 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-1 rounded-lg bg-secondary p-1">
          {TIME_RANGES.map((tr) => {
            const Icon = tr.icon
            return (
              <button
                key={tr.value}
                type="button"
                onClick={() => {
                  setRange(tr.value)
                  setPage(1)
                }}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  range === tr.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tr.label}
              </button>
            )
          })}
        </div>

        <select
          value={language}
          onChange={(e) => {
            setLanguage(e.target.value)
            setPage(1)
          }}
          className="rounded-md border border-border bg-secondary px-3 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>Failed to load trending repositories. Please try again later.</span>
        </div>
      )}

      {!error && !isLoading && totalCount > 0 && (
        <p className="text-sm text-muted-foreground">
          Showing {repos.length} of {totalCount.toLocaleString()} repositories
        </p>
      )}

      <div className="flex flex-col gap-3">
        {isLoading
          ? Array.from({ length: 10 }).map((_, i) => (
              <RepoCardSkeleton key={`skeleton-${i}`} />
            ))
          : repos.map((repo: any, i: number) => (
              <RepoCard
                key={repo.id}
                repo={repo}
                rank={(page - 1) * 25 + i + 1}
              />
            ))}
      </div>

      {!isLoading && repos.length > 0 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex items-center gap-1 rounded-md border border-border bg-secondary px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page}
          </span>
          <button
            type="button"
            disabled={repos.length < 25}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-1 rounded-md border border-border bg-secondary px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {!isLoading && repos.length === 0 && !error && (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <p className="text-lg font-medium text-foreground">
            No repositories found
          </p>
          <p className="text-sm text-muted-foreground">
            Try changing the time range or language filter.
          </p>
        </div>
      )}
    </div>
  )
}
