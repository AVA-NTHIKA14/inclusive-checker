export type Issue = {
  found: string
  suggestion: string
  label:
    | "Gender Bias"
    | "Cultural Bias"
    | "Age Bias"
    | "Disability Bias"
    | "Tone"
  severity: "low" | "medium" | "high"
}
