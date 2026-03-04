import { type Context } from "../components/SideNav"
import type { Issue } from "../types/issue"
import { BIAS_RULES } from "../data/biasRules"
import type { BiasCategory } from "../types/issue"

export type AnalysisResponse = {
  issues: Issue[]
}

const CONTEXT_BIAS_MAP: Record<Context, BiasCategory[]> = {
  general: ["Gender Bias", "Age Bias", "Disability Bias", "Cultural Bias", "Accessibility"],
  job: ["Gender Bias", "Age Bias", "Disability Bias", "Cultural Bias", "Over-qualification", "Tone"],
  email: ["Tone", "Accessibility"],
  slack: ["Tone", "Disability Bias", "Cultural Bias", "Gender Bias"],
  policy: ["Gender Bias", "Cultural Bias", "Accessibility", "Disability Bias"],
}

function detectLocally(text: string, context: Context): Issue[] {
  const allowedBiases = CONTEXT_BIAS_MAP[context] || CONTEXT_BIAS_MAP.general
  const issues: Issue[] = []
  const seen = new Set<string>()

  for (const rule of BIAS_RULES) {
    if (!allowedBiases.includes(rule.bias)) continue

    const matches = text.match(rule.regex) || []
    for (const match of matches) {
      const found = match.trim()
      if (!found) continue

      const dedupeKey = `${found.toLowerCase()}::${rule.bias}::${rule.suggestion.toLowerCase()}`
      if (seen.has(dedupeKey)) continue
      seen.add(dedupeKey)

      issues.push({
        label: rule.label,
        found,
        suggestion: rule.suggestion,
        severity: rule.severity,
        bias: rule.bias,
        explanation: rule.explanation,
      })
    }
  }

  return issues
}

export async function analyzeWithGemini(
  text: string,
  context: Context
): Promise<AnalysisResponse> {
  try {
    const res = await fetch("http://localhost:5000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, context }),
    })

    if (!res.ok) {
      return { issues: detectLocally(text, context) }
    }

    const data = (await res.json()) as Partial<AnalysisResponse>
    const issues = Array.isArray(data?.issues) ? data.issues : []

    if (issues.length > 0) {
      return { issues }
    }

    return { issues: detectLocally(text, context) }
  } catch {
    return { issues: detectLocally(text, context) }
  }
}
