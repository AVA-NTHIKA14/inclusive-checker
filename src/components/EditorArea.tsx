import type { Issue } from "../types/issue"

type Props = {
  text: string
  setText: (v: string) => void
  issues: Issue[]
  onVerify: () => void
  loading: boolean
}

export default function EditorArea({
  text,
  setText,
  issues,
  onVerify,
  loading,
}: Props) {
  /* ---------- Highlight detected issues ---------- */
  const highlightText = () => {
    let output = text || ""

    issues.forEach(issue => {
      if (!issue.found) return
      const escaped = issue.found.replace(
        /[-/\\^$*+?.()|[\]{}]/g,
        "\\$&"
      )
      const regex = new RegExp(`(${escaped})`, "gi")
      output = output.replace(
        regex,
        `<mark class="bg-yellow-400 text-black px-1 rounded">$1</mark>`
      )
    })

    return output.replace(/\n/g, "<br/>")
  }

  /* ---------- Status logic ---------- */
  const hasText = text.trim().length > 0
  const isInclusive = hasText && issues.length === 0
  const hasIssues = issues.length > 0

  return (
    <main className="flex flex-col h-full p-4">
      {/* ===== STATUS MESSAGE ===== */}
      {hasIssues && (
        <div className="mb-3 text-yellow-400 flex items-center gap-2">
          ⚠️ Inclusion improvements suggested
        </div>
      )}

      {/* ===== EDITOR ===== */}
      <div className="relative flex-1 border border-neutral-800 rounded">
        {/* Highlight layer */}
        <div
          className="absolute inset-3 text-white whitespace-pre-wrap pointer-events-none"
          aria-hidden
          dangerouslySetInnerHTML={{ __html: highlightText() }}
        />

        {/* Text input */}
        <textarea
          id="inclusive-editor"
          aria-label="Inclusive language editor"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste or type text to verify inclusive language…"
          className="absolute inset-3 bg-transparent text-transparent caret-white resize-none outline-none"
        />
      </div>

      {/* ===== VERIFY BUTTON ===== */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={onVerify}
          disabled={!hasText || loading}
          className={`px-6 py-2 rounded font-bold transition
            ${
              !hasText
                ? "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                : "bg-yellow-400 text-black hover:bg-yellow-300"
            }
          `}
        >
          {loading ? "Verifying…" : "Verify Text"}
        </button>
      </div>
    </main>
  )
}