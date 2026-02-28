import type { Issue } from "../types/issue"

type Props = {
  text: string
  setText: (v: string) => void
  issues: Issue[]
  loading: boolean
}

export default function AnalysisPanel({
  text,
  setText,
  issues,
  loading,
}: Props) {
  // Replace a single word/phrase
  const handleSwap = (found: string, suggestion: string) => {
    const regex = new RegExp(`\\b${found}\\b`, "gi")
    setText(text.replace(regex, suggestion))
  }

  // Apply all suggestions
  const handleApplyAll = () => {
    let updatedText = text

    issues.forEach(issue => {
      const regex = new RegExp(`\\b${issue.found}\\b`, "gi")
      updatedText = updatedText.replace(regex, issue.suggestion)
    })

    setText(updatedText)
  }

  return (
    <aside
      className="bg-neutral-950 border-l border-neutral-800 p-4 w-full overflow-y-auto"
      aria-live="polite"
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold">SUGGESTIONS</h2>

        <div className="flex gap-2">
          {issues.some(i => i.severity === "high") && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
              {
                issues.filter(i => i.severity === "high")
                  .length
              }{" "}
              HIGH
            </span>
          )}

          <span className="bg-neutral-800 text-white text-xs px-2 py-1 rounded">
            {issues.length} FOUND
          </span>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-sm text-neutral-400 mb-4">
          Analyzing text…
        </div>
      )}

      {/* NO ISSUES */}
      {!loading && issues.length === 0 && text.trim() && (
        <div className="text-green-400 text-sm">
          ✅ No inclusion issues detected
        </div>
      )}

      {/* ISSUES LIST */}
      <div className="space-y-4 mt-4">
        {issues.map((issue, index) => (
          <div
            key={`${issue.found}-${index}`}
            className={`border rounded p-3 bg-neutral-900 ${
              issue.severity === "high"
                ? "border-red-500"
                : "border-yellow-400"
            }`}
          >
            {/* LABEL */}
            <div
              className={`text-xs font-bold mb-1 ${
                issue.severity === "high"
                  ? "text-red-400"
                  : "text-yellow-400"
              }`}
            >
              {issue.label.toUpperCase()}
            </div>

            {/* ORIGINAL */}
            <div className="text-xs text-neutral-400">
              ORIGINAL
            </div>
            <div className="line-through text-neutral-500">
              {issue.found}
            </div>

            {/* SUGGESTION */}
            <div className="text-xs text-neutral-400 mt-2">
              SUGGESTION
            </div>
            <div className="font-bold text-green-400">
              {issue.suggestion}
            </div>

            {/* SWAP BUTTON */}
            <button
              onClick={() =>
                handleSwap(
                  issue.found,
                  issue.suggestion
                )
              }
              className={`mt-3 w-full py-2 rounded font-bold ${
                issue.severity === "high"
                  ? "bg-red-500 text-white"
                  : "bg-yellow-400 text-black"
              }`}
            >
              Swap Word
            </button>
          </div>
        ))}
      </div>

      {/* APPLY ALL */}
      {issues.length > 1 && (
        <button
          onClick={handleApplyAll}
          className="mt-6 w-full bg-neutral-800 hover:bg-neutral-700 py-3 rounded font-semibold"
        >
          Apply All Suggestions
        </button>
      )}
    </aside>
  )
}