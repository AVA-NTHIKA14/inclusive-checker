import { useMemo } from "react"
import type { Issue } from "../types/issue"
import { BIAS_COLORS } from "../types/issue"

type TextSegment = {
  text: string
  issue?: Issue
}

type Props = {
  text: string
  issues: Issue[]
}

export default function RealTimeHighlight({ text, issues }: Props) {
  // Find all positions of issues in text and create segments
  const segments = useMemo(() => {
    if (!text || issues.length === 0) {
      return [{ text, issue: undefined }]
    }

    // Find all highlight ranges
    const ranges: Array<{start: number; end: number; issue: Issue}> = []

    issues.forEach(issue => {
      const escaped = issue.found.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")
      const regex = new RegExp(escaped, "gi")

      let match
      while ((match = regex.exec(text)) !== null) {
        ranges.push({
          start: match.index,
          end: match.index + match[0].length,
          issue,
        })
      }
    })

    if (ranges.length === 0) {
      return [{ text, issue: undefined }]
    }

    // Sort and remove overlapping ranges (keep first occurrence)
    ranges.sort((a, b) => a.start - b.start)
    const filtered: typeof ranges = []
    
    for (const range of ranges) {
      const overlaps = filtered.some(f => range.start < f.end && range.end > f.start)
      if (!overlaps) {
        filtered.push(range)
      }
    }

    // Build segments by iterating through text once
    const segs: TextSegment[] = []
    let lastEnd = 0

    filtered.forEach(range => {
      // Add text before this highlight
      if (lastEnd < range.start) {
        segs.push({
          text: text.substring(lastEnd, range.start),
          issue: undefined,
        })
      }

      // Add the highlighted text
      segs.push({
        text: text.substring(range.start, range.end),
        issue: range.issue,
      })

      lastEnd = range.end
    })

    // Add remaining text after last highlight
    if (lastEnd < text.length) {
      segs.push({
        text: text.substring(lastEnd),
        issue: undefined,
      })
    }

    return segs.length === 0 ? [{ text, issue: undefined }] : segs
  }, [text, issues])

  return (
    <div className="whitespace-pre-wrap break-words text-white font-mono text-sm leading-relaxed">
      {segments.map((seg, idx) => {
        if (!seg.issue) {
          return <span key={`text-${idx}`}>{seg.text}</span>
        }

        const color = BIAS_COLORS[seg.issue.bias]
        const highlightMap = {
          red: "bg-red-500/40 hover:bg-red-500/60",
          yellow: "bg-yellow-500/40 hover:bg-yellow-500/60",
          blue: "bg-blue-500/40 hover:bg-blue-500/60",
          purple: "bg-purple-500/40 hover:bg-purple-500/60",
          orange: "bg-orange-500/40 hover:bg-orange-500/60",
          green: "bg-green-500/40 hover:bg-green-500/60",
          pink: "bg-pink-500/40 hover:bg-pink-500/60",
        }

        return (
          <span
            key={`highlight-${idx}`}
            className={`${highlightMap[color]} cursor-help relative group transition-colors rounded px-0.5`}
            title={`${seg.issue.bias}: ${seg.issue.label}`}
          >
            {seg.text}
            {/* Tooltip - shown on hover, accessible */}
            <div
              className="absolute left-0 top-full mt-1 hidden group-hover:block z-50 bg-neutral-950 border border-neutral-600 rounded shadow-lg p-2 text-xs text-white whitespace-nowrap pointer-events-none"
              role="tooltip"
            >
              <div className="font-bold text-yellow-300">{seg.issue.bias}</div>
              <div>{seg.issue.label}</div>
              {seg.issue.severity && (
                <div className="mt-1 text-orange-300">
                  Severity: {seg.issue.severity.toUpperCase()}
                </div>
              )}
            </div>
          </span>
        )
      })}
    </div>
  )
}
