export type BiasCategory = 
  | "Gender Bias"
  | "Age Bias"
  | "Disability Bias"
  | "Cultural Bias"
  | "Tone"
  | "Accessibility"
  | "Over-qualification"

export type BiasColor = "red" | "yellow" | "blue" | "purple" | "green" | "orange" | "pink"

export const BIAS_COLORS: Record<BiasCategory, BiasColor> = {
  "Gender Bias": "red",
  "Age Bias": "yellow",
  "Disability Bias": "blue",
  "Cultural Bias": "purple",
  "Tone": "orange",
  "Accessibility": "green",
  "Over-qualification": "pink",
}

export type Issue = {
  label: string
  found: string
  suggestion: string
  severity: "high" | "medium" | "low"
  bias: BiasCategory
  explanation?: string
  context?: string
}
