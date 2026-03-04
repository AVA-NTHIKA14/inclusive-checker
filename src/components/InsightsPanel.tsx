import type { Issue, BiasCategory } from "../types/issue"
import type { Context } from "./SideNav"

type Snapshot = {
  id: string
  context: Context
  score: number
  issues: number
  high: number
  medium: number
  low: number
  biasBreakdown: Record<BiasCategory, number>
  textLength: number
  createdAt: number
}

type Props = {
  history: Snapshot[]
  currentIssues: Issue[]
  hasVerified: boolean
  currentContext: Context
}

const CONTEXT_LABELS: Record<Context, string> = {
  general: "General",
  job: "Job Post",
  email: "Email",
  slack: "Slack / Chat",
  policy: "Policy",
}

const ALL_BIASES: BiasCategory[] = [
  "Gender Bias",
  "Age Bias",
  "Disability Bias",
  "Cultural Bias",
  "Tone",
  "Accessibility",
  "Over-qualification",
]

function getScore(issues: Issue[]) {
  const base = Math.max(0, 100 - issues.length * 5)
  const high = issues.filter(i => i.severity === "high").length
  const medium = issues.filter(i => i.severity === "medium").length
  const penalty = high * 8 + medium * 3
  return Math.max(0, Math.min(100, base - penalty))
}

export default function InsightsPanel({
  history,
  currentIssues,
  hasVerified,
  currentContext,
}: Props) {
  const currentScore = getScore(currentIssues)
  const totalRuns = history.length
  const averageScore = totalRuns
    ? Math.round(history.reduce((sum, run) => sum + run.score, 0) / totalRuns)
    : 0
  const latest = history[0]
  const previous = history[1]
  const scoreDelta = latest && previous ? latest.score - previous.score : 0

  const aggregateBias = ALL_BIASES.reduce((acc, bias) => {
    acc[bias] = history.reduce((sum, run) => sum + (run.biasBreakdown[bias] || 0), 0)
    return acc
  }, {} as Record<BiasCategory, number>)

  const maxBiasCount = Math.max(1, ...Object.values(aggregateBias))

  return (
    <div className="col-span-2 p-6 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-1">Insights Dashboard</h1>
      <p className="text-neutral-400 mb-6">
        Track analysis quality over time, understand recurring bias categories, and monitor improvements by context.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="text-xs uppercase text-neutral-400 mb-1">Total Runs</div>
          <div className="text-2xl font-bold">{totalRuns}</div>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="text-xs uppercase text-neutral-400 mb-1">Average Score</div>
          <div className="text-2xl font-bold">{averageScore}</div>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="text-xs uppercase text-neutral-400 mb-1">Current Score</div>
          <div className="text-2xl font-bold">{hasVerified ? currentScore : "-"}</div>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="text-xs uppercase text-neutral-400 mb-1">Last Change</div>
          <div className={`text-2xl font-bold ${scoreDelta > 0 ? "text-green-400" : scoreDelta < 0 ? "text-red-400" : "text-neutral-200"}`}>
            {latest && previous ? `${scoreDelta > 0 ? "+" : ""}${scoreDelta}` : "-"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
          <h2 className="text-lg font-semibold mb-3">Bias Distribution (All Runs)</h2>
          <div className="space-y-3">
            {ALL_BIASES.map(bias => {
              const value = aggregateBias[bias]
              const width = `${(value / maxBiasCount) * 100}%`
              return (
                <div key={bias}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-neutral-300">{bias}</span>
                    <span className="text-neutral-400">{value}</span>
                  </div>
                  <div className="h-2 rounded bg-neutral-800 overflow-hidden">
                    <div className="h-full bg-yellow-400" style={{ width }} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
          <h2 className="text-lg font-semibold mb-3">Recent Analyses</h2>
          {history.length === 0 && (
            <p className="text-sm text-neutral-400">
              No analysis history yet. Run Verify Text in the Editor to populate insights.
            </p>
          )}
          <div className="space-y-2">
            {history.slice(0, 8).map(run => (
              <div key={run.id} className="rounded-lg border border-neutral-800 bg-neutral-900 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-neutral-200">{CONTEXT_LABELS[run.context]}</span>
                  <span className="text-neutral-400">{new Date(run.createdAt).toLocaleTimeString()}</span>
                </div>
                <div className="text-sm text-neutral-300 mt-1">
                  Score {run.score} | Issues {run.issues} | H:{run.high} M:{run.medium} L:{run.low}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 mt-6">
        <h2 className="text-lg font-semibold mb-3">Current Context</h2>
        <div className="text-sm text-neutral-300 mb-2">Active: {CONTEXT_LABELS[currentContext]}</div>
        <p className="text-sm text-neutral-400">
          Use this dashboard to validate whether quality is improving after applying suggestions and re-verifying.
          Compare run history by context to find recurring language risks.
        </p>
      </section>
    </div>
  )
}
