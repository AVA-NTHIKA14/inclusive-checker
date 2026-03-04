import type { Issue } from "../types/issue"
import BiasBadge from "./BiasBadge"

type Props = {
  issues: Issue[]
  textLength?: number
}

export default function InclusiveScore({ issues }: Props) {
  // Calculate base score (100 - issues)
  const baseScore = Math.max(0, 100 - issues.length * 5)
  
  // Adjust by severity
  const highSeverityCount = issues.filter(i => i.severity === "high").length
  const mediumSeverityCount = issues.filter(i => i.severity === "medium").length
  
  const severityPenalty = highSeverityCount * 8 + mediumSeverityCount * 3
  const inclusiveScore = Math.max(0, Math.min(100, baseScore - severityPenalty))

  // Count issues by category
  const issueCounts = issues.reduce(
    (acc, issue) => {
      acc[issue.bias] = (acc[issue.bias] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // Determine risk level
  const getRiskLevel = (score: number) => {
    if (score >= 80) return { level: "Low Risk", color: "text-green-400" }
    if (score >= 60) return { level: "Medium Risk", color: "text-yellow-400" }
    if (score >= 40) return { level: "High Risk", color: "text-orange-400" }
    return { level: "Critical", color: "text-red-400" }
  }

  const risk = getRiskLevel(inclusiveScore)

  return (
    <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4 mb-4">
      {/* SCORE DISPLAY */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-4xl font-bold text-white mb-1">
            {Math.round(inclusiveScore)}
            <span className="text-2xl text-neutral-500">/100</span>
          </div>
          <div className={`text-sm font-medium ${risk.color}`}>{risk.level}</div>
        </div>

        <div className="text-right">
          <div className="text-sm text-neutral-400 mb-2">Issues Found</div>
          <div className="text-2xl font-bold text-neutral-300">{issues.length}</div>
        </div>
      </div>

      {/* SEVERITY BREAKDOWN */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-red-900/20 rounded p-3 border border-red-500/30">
          <div className="text-xs text-neutral-400 mb-1">High Severity</div>
          <div className="text-xl font-bold text-red-400">{highSeverityCount}</div>
        </div>
        <div className="bg-yellow-900/20 rounded p-3 border border-yellow-500/30">
          <div className="text-xs text-neutral-400 mb-1">Medium Severity</div>
          <div className="text-xl font-bold text-yellow-400">{mediumSeverityCount}</div>
        </div>
      </div>

      {/* CATEGORY BREAKDOWN */}
      {Object.keys(issueCounts).length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-neutral-400 mb-3 uppercase">
            Issues by Category
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(issueCounts).map(([category, count]) => (
              <div key={category} className="relative group">
                <div className="flex items-center gap-1 px-2 py-1 rounded bg-neutral-800/50 border border-neutral-700">
                  <span className="text-xs font-medium text-neutral-300">{category}</span>
                  <span className="text-xs font-bold text-neutral-400">{count}</span>
                </div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                  <BiasBadge bias={category as any} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUGGESTIONS */}
      <div className="mt-6 pt-4 border-t border-neutral-800">
        <div className="text-xs font-semibold text-neutral-400 mb-2 uppercase">
          Next Steps
        </div>
        <ul className="text-sm text-neutral-400 space-y-1">
          {highSeverityCount > 0 && (
            <li>✓ Address {highSeverityCount} high-severity issues first</li>
          )}
          {mediumSeverityCount > 0 && (
            <li>✓ Review {mediumSeverityCount} medium-severity recommendations</li>
          )}
          {issues.length === 0 && (
            <li>✓ Great! Your content is inclusive and welcoming</li>
          )}
        </ul>
      </div>
    </div>
  )
}
