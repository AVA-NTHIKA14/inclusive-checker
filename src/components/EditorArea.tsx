import { useRef, useEffect } from "react"
import RealTimeHighlight from "./RealTimeHighlight"
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
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)

  // Sync scroll between textarea and highlight layer
  useEffect(() => {
    const textarea = textareaRef.current
    const highlight = highlightRef.current
    if (!textarea || !highlight) return

    const handleScroll = () => {
      highlight.scrollTop = textarea.scrollTop
      highlight.scrollLeft = textarea.scrollLeft
    }

    textarea.addEventListener("scroll", handleScroll)
    return () => textarea.removeEventListener("scroll", handleScroll)
  }, [])

  /* ---------- Status logic ---------- */
  const hasText = text.trim().length > 0
  const hasIssues = issues.length > 0
  const highSeverityCount = issues.filter(i => i.severity === "high").length

  return (
    <main className="flex flex-col h-full p-4">
      {/* ===== STATUS MESSAGE ===== */}
      {hasIssues && (
        <div
          className={`mb-3 flex items-center gap-2 px-3 py-2 rounded text-sm font-medium ${
            highSeverityCount > 0
              ? "bg-red-900/30 border border-red-500/50 text-red-300"
              : "bg-yellow-900/30 border border-yellow-500/50 text-yellow-300"
          }`}
        >
          {highSeverityCount > 0 ? (
            <>
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {highSeverityCount} high-severity issue{highSeverityCount > 1 ? "s" : ""}
              found - please review
            </>
          ) : (
            <>
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Inclusion improvements suggested - check the analysis panel
            </>
          )}
        </div>
      )}

      {/* ===== EDITOR (Layered Stack) ===== */}
      <div className="relative flex-1 border border-neutral-800 rounded bg-neutral-900 overflow-hidden flex flex-col">
        {/* Highlight layer - Behind textarea, shows colored highlights */}
        <div
          ref={highlightRef}
          className="absolute inset-0 p-3 overflow-auto pointer-events-none"
          aria-hidden="true"
        >
          <RealTimeHighlight text={text} issues={issues} />
        </div>

        {/* Textarea - On top, handles input, transparent background to show highlights */}
        <textarea
          ref={textareaRef}
          id="inclusive-editor"
          aria-label="Inclusive language text editor - Type or paste text to check. Detected biases will be highlighted with colors."
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste or type text to verify inclusive language… Detected issues will be highlighted with color-coded categories."
          className="absolute inset-0 p-3 flex-1 bg-transparent text-transparent resize-none outline-none font-mono text-sm placeholder-neutral-600 relative z-10 caret-blue-400 selection:bg-blue-500/30"
          spellCheck="false"
        />
      </div>

      {/* ===== ACTION BUTTONS ===== */}
      <div className="mt-4 flex justify-between items-center">
        <div className="text-xs text-neutral-500">
          {hasText ? `${text.length} characters` : "Empty"}
        </div>

        <button
          onClick={onVerify}
          disabled={!hasText || loading}
          className={`px-8 py-2 rounded-full font-bold transition ${
            !hasText
              ? "bg-neutral-700 text-neutral-400 cursor-not-allowed"
              : loading
                ? "bg-yellow-600 text-white cursor-wait"
                : "bg-yellow-500 text-white hover:bg-yellow-600 shadow-lg hover:shadow-xl"
          }`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Verifying…
            </span>
          ) : (
            "Verify Text"
          )}
        </button>
      </div>
    </main>
  )
}
