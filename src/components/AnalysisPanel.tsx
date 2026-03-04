import { useState } from "react"
import type { Issue } from "../types/issue"
import InclusiveScore from "./InclusiveScore"
import IssueCard from "./IssueCard"

type Props = {
  text: string
  setText: (v: string) => void
  issues: Issue[]
  loading: boolean
  hasVerified: boolean
}

export default function AnalysisPanel({
  text,
  setText,
  issues,
  loading,
  hasVerified,
}: Props) {
  const [filterBias, setFilterBias] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"severity" | "category">("severity")

  const escapeRegex = (value: string) =>
    value.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")

  const buildFoundRegex = (found: string) => {
    const escaped = escapeRegex(found.trim())
    const isWordLike = /^[\w\s-]+$/.test(found)
    return isWordLike
      ? new RegExp(`\\b${escaped}\\b`, "gi")
      : new RegExp(escaped, "gi")
  }

  const buildLooseFoundRegex = (found: string) => {
    const cleaned = found.trim()
    const escaped = escapeRegex(cleaned)
    const parts = cleaned.split(/\s+/)
    const last = parts[parts.length - 1] || ""
    const isWordLike = /^[\w\s-]+$/.test(cleaned)

    if (!isWordLike || !last) {
      return new RegExp(escaped, "gi")
    }

    // Tolerate simple singular/plural variance in the final token
    // Example: "native english speaker" should also match "native english speakers"
    const escapedLast = escapeRegex(last)
    const optionalPlural = last.endsWith("s")
      ? `${escapedLast.slice(0, -1)}s?`
      : `${escapedLast}s?`
    const escapedPrefix = parts
      .slice(0, -1)
      .map(part => escapeRegex(part))
      .join("\\s+")

    const pattern = escapedPrefix
      ? `\\b${escapedPrefix}\\s+${optionalPlural}\\b`
      : `\\b${optionalPlural}\\b`

    return new RegExp(pattern, "gi")
  }

  const replaceFound = (source: string, found: string, suggestion: string) => {
    const strictRegex = buildFoundRegex(found)
    const strictReplaced = source.replace(strictRegex, suggestion)
    if (strictReplaced !== source) return strictReplaced

    const looseRegex = buildLooseFoundRegex(found)
    return source.replace(looseRegex, suggestion)
  }

  // Replace a single word/phrase
  const handleSwap = (found: string, suggestion: string) => {
    setText(replaceFound(text, found, suggestion))
  }

  // Apply all suggestions
  const handleApplyAll = () => {
    let updatedText = text

    // Replace longer matches first to avoid partial-overlap replacements.
    const sortedIssues = [...issues].sort(
      (a, b) => b.found.length - a.found.length
    )

    sortedIssues.forEach(issue => {
      updatedText = replaceFound(updatedText, issue.found, issue.suggestion)
    })

    setText(updatedText)
  }

  // Get all unique bias categories
  const allBiasCategories = Array.from(new Set(issues.map(i => i.bias)))

  // Filter issues based on selected category
  const filteredIssues = filterBias
    ? issues.filter(i => i.bias === filterBias)
    : issues

  // Sort issues
  const sortedIssues = [...filteredIssues].sort((a, b) => {
    if (sortBy === "severity") {
      const severityOrder = { high: 0, medium: 1, low: 2 }
      return severityOrder[a.severity] - severityOrder[b.severity]
    }
    return a.bias.localeCompare(b.bias)
  })

  return (
    <aside
      className="bg-neutral-950 border-l border-neutral-800 p-4 w-full overflow-y-auto"
      aria-live="polite"
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">ANALYSIS</h2>

        <div className="flex gap-2">
          {issues.some(i => i.severity === "high") && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-semibold">
              {issues.filter(i => i.severity === "high").length} HIGH
            </span>
          )}

          <span className="bg-neutral-800 text-white text-xs px-2 py-1 rounded">
            {issues.length} FOUND
          </span>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-sm text-neutral-400 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Analyzing text…
        </div>
      )}

      {/* NO TEXT MESSAGE */}
      {!loading && !text.trim() && (
        <div className="text-neutral-500 text-sm italic">
          Start typing to analyze for inclusivity
        </div>
      )}

      {/* INCLUSIVE SCORE */}
      {!loading && text.trim() && hasVerified && (
        <InclusiveScore issues={issues} textLength={text.length} />
      )}

      {!loading && text.trim() && !hasVerified && (
        <div className="mb-4 rounded-lg border border-neutral-800 bg-neutral-900/40 p-3 text-sm text-neutral-400">
          Click <span className="text-yellow-400 font-semibold">Verify Text</span> to run analysis and see score.
        </div>
      )}

      {/* FILTERS & SORTING */}
      {issues.length > 0 && (
        <div className="mb-4 space-y-3">
          {/* FILTER BY CATEGORY */}
          {allBiasCategories.length > 1 && (
            <div>
              <div className="text-xs font-semibold text-neutral-400 mb-2 uppercase">
                Filter by Category
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterBias(null)}
                  className={`text-xs px-3 py-1.5 rounded transition-all ${
                    filterBias === null
                      ? "bg-neutral-600 text-white"
                      : "bg-neutral-800 text-neutral-400 hover:text-white"
                  }`}
                >
                  All ({issues.length})
                </button>
                {allBiasCategories.map(category => {
                  const count = issues.filter(i => i.bias === category).length
                  return (
                    <button
                      key={category}
                      onClick={() => setFilterBias(category)}
                      className={`text-xs px-3 py-1.5 rounded transition-all ${
                        filterBias === category
                          ? "bg-neutral-600 text-white"
                          : "bg-neutral-800 text-neutral-400 hover:text-white"
                      }`}
                    >
                      {category.split(" ")[0]} ({count})
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* SORT OPTIONS */}
          {issues.length > 1 && (
            <div>
              <div className="text-xs font-semibold text-neutral-400 mb-2 uppercase">
                Sort By
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy("severity")}
                  className={`text-xs px-3 py-1.5 rounded transition-all ${
                    sortBy === "severity"
                      ? "bg-neutral-600 text-white"
                      : "bg-neutral-800 text-neutral-400 hover:text-white"
                  }`}
                >
                  Severity
                </button>
                <button
                  onClick={() => setSortBy("category")}
                  className={`text-xs px-3 py-1.5 rounded transition-all ${
                    sortBy === "category"
                      ? "bg-neutral-600 text-white"
                      : "bg-neutral-800 text-neutral-400 hover:text-white"
                  }`}
                >
                  Category
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ISSUES LIST */}
      {sortedIssues.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-semibold text-neutral-400 mb-3 uppercase">
            {filterBias ? `${filterBias} Issues` : "All Issues"}
          </div>
          <div className="space-y-3">
            {sortedIssues.map((issue, index) => (
              <IssueCard
                key={`${issue.found}-${issue.bias}-${index}`}
                issue={issue}
                onSwap={handleSwap}
              />
            ))}
          </div>
        </div>
      )}

      {/* APPLY ALL BUTTON */}
      {issues.length > 1 && (
        <button
          onClick={handleApplyAll}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl mb-4"
        >
          Apply All {filteredIssues.length} Suggestions
        </button>
      )}

      {/* LEGEND / INFO */}
      <div className="mt-6 pt-4 border-t border-neutral-800">
        <div className="text-xs font-semibold text-neutral-400 mb-3 uppercase">
          Legend
        </div>
        <div className="space-y-2 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-red-600 text-white rounded text-xs">HIGH</span>
            <span>Excludes or discriminates based on characteristics</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-yellow-600 text-white rounded text-xs">MEDIUM</span>
            <span>May discourage qualified candidates from applying</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-xs">LOW</span>
            <span>Minor accessibility or clarity improvements</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
