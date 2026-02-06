"use client"

import React from "react"

import { useState, useCallback } from "react"
import useSWR from "swr"
import { LANGUAGES } from "@/lib/languages"
import { RepoCard, RepoCardSkeleton } from "@/components/repo-card"
import { Search, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"

const fetcher = (url: string) =>
  fetch(url, {
    headers: {
      Accept: "application/vnd.github.v3+json",
    },
  }).then((res) => res.json())

const SORT_OPTIONS = [
  { value: "stars", label: "Stars" },
  { value: "forks", label: "Forks" },
  { value: "updated", label: "Recently Updated" },
  { value: "help-wanted-issues", label: "Help Wanted" },
]

export function SearchContent() {
  const [query, setQuery] = useState("")
  const [submittedQuery, setSubmittedQuery] = useState("")
  const [language, setLanguage] = useState("")
  const [sort, setSort] = useState("stars")
  const [page, setPage] = useState(1)

  let fullQuery = submittedQuery
  if (language) {
    fullQuery += ` language:${language}`
  }

  const params = new URLSearchParams({
    q: fullQuery,
    sort,
    order: "desc",
    per_page: "25",
    page: String(page),
  })

  const { data, error, isLoading } = useSWR(
    submittedQuery
      ? `https://api.github.com/search/repositories?${params.toString()}`
      : null,
    fetcher,
    { revalidateOnFocus: false, keepPreviousData: true }
  )

  const repos = data?.items || []
  const totalCount = data?.total_count || 0

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (query.trim()) {
        setSubmittedQuery(query.trim())
        setPage(1)
      }
    },
    [query]
  )

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search repositories..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-md border border-border bg-secondary py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Search
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value)
              setPage(1)
              if (submittedQuery) setSubmittedQuery(submittedQuery)
            }}
            className="rounded-md border border-border bg-secondary px-3 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value)
              setPage(1)
              if (submittedQuery) setSubmittedQuery(submittedQuery)
            }}
            className="rounded-md border border-border bg-secondary px-3 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                Sort: {opt.label}
              </option>
            ))}
          </select>
        </div>
      </form>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>Failed to search repositories. Please try again later.</span>
        </div>
      )}

      {submittedQuery && !error && !isLoading && totalCount > 0 && (
        <p className="text-sm text-muted-foreground">
          Found {totalCount.toLocaleString()} repositories for{" "}
          <span className="font-medium text-foreground">{`"${submittedQuery}"`}</span>
        </p>
      )}

      <div className="flex flex-col gap-3">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
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
          <span className="text-sm text-muted-foreground">Page {page}</span>
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

      {!submittedQuery && (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <Search className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-foreground">
            Start exploring
          </p>
          <p className="max-w-md text-sm text-muted-foreground">
            Search for repositories by name, description, or topic. Filter by
            language and sort by stars, forks, or recent updates.
          </p>
        </div>
      )}

      {submittedQuery && !isLoading && repos.length === 0 && !error && (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <p className="text-lg font-medium text-foreground">
            No results found
          </p>
          <p className="text-sm text-muted-foreground">
            Try different keywords or adjust your filters.
          </p>
        </div>
      )}
    </div>
  )
}
