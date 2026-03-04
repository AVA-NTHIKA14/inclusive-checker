import { useState } from "react"
import type { Issue } from "../types/issue"
import BiasBadge from "./BiasBadge"

type Props = {
  issue: Issue
  onSwap: (found: string, suggestion: string) => void
}

export default function IssueCard({ issue, onSwap }: Props) {
  const [showExplanation, setShowExplanation] = useState(false)

  const severityColors = {
    high: "bg-red-500/20 border-red-500/50 text-red-300",
    medium: "bg-yellow-500/20 border-yellow-500/50 text-yellow-300",
    low: "bg-blue-500/20 border-blue-500/50 text-blue-300",
  }

  const severityBadgeColors = {
    high: "bg-red-600 text-white",
    medium: "bg-yellow-600 text-white",
    low: "bg-blue-600 text-white",
  }

  return (
    <div
      className={`rounded-lg border p-4 mb-3 transition-all hover:shadow-md ${severityColors[issue.severity]}`}
    >
      {/* HEADER */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-bold px-2 py-1 rounded ${severityBadgeColors[issue.severity]}`}>
              {issue.severity.toUpperCase()}
            </span>
            <BiasBadge bias={issue.bias} size="sm" />
          </div>
          <p className="text-sm font-medium text-white">{issue.label}</p>
        </div>
      </div>

      {/* FOUND & SUGGESTION */}
      <div className="space-y-2 mb-3">
        <div>
          <div className="text-xs font-semibold text-neutral-300 mb-1">Found:</div>
          <div className="bg-neutral-950/50 rounded px-3 py-2 font-mono text-sm text-neutral-200 break-words">
            "{issue.found}"
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-neutral-300 mb-1">Suggestion:</div>
          <div className="bg-neutral-950/50 rounded px-3 py-2 font-mono text-sm text-green-300 break-words">
            "{issue.suggestion}"
          </div>
        </div>
      </div>

      {/* EXPLANATION */}
      {issue.explanation && (
        <div className="mb-3">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="text-xs font-medium text-neutral-400 hover:text-neutral-300 flex items-center gap-1"
          >
            <span className={showExplanation ? "rotate-90" : ""}>▶</span>
            Why is this an issue?
          </button>
          {showExplanation && (
            <div className="mt-2 text-sm text-neutral-300 bg-neutral-950/50 rounded p-3 border border-neutral-700">
              {issue.explanation}
            </div>
          )}
        </div>
      )}

      {/* ACTION BUTTON */}
      <button
        onClick={() => onSwap(issue.found, issue.suggestion)}
        className="w-full bg-neutral-700 hover:bg-neutral-600 text-white font-medium py-2 px-3 rounded transition-colors text-sm"
      >
        Apply Suggestion
      </button>
    </div>
  )
}
