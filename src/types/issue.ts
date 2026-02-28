export type Issue = {
  label: string
  found: string
  suggestion: string
  severity: "high" | "medium"
  bias: "Gender Bias" | "Cultural Bias" | "Age Bias" | "Tone"
}