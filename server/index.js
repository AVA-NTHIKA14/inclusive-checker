import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { GoogleGenerativeAI } from "@google/generative-ai"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

function pickSingleSuggestion(rawSuggestion) {
  if (!rawSuggestion || typeof rawSuggestion !== "string") return ""

  // Keep only the first concise suggestion and remove choice-style formatting.
  let suggestion = rawSuggestion
    .replace(/^[\s\-*"\u201c\u201d']+|[\s"\u201c\u201d']+$/g, "")
    .split("\n")[0]
    .trim()

  const choiceSplit = suggestion.split(/\s+(?:or|and\/or)\s+|\/|;|,/i)
  if (choiceSplit.length > 1) {
    suggestion = choiceSplit[0].trim()
  }

  return suggestion.replace(/\s{2,}/g, " ").trim()
}

function normalizeSeverity(value) {
  return String(value).toLowerCase() === "high" ? "high" : "medium"
}

function normalizeBias(value) {
  const raw = String(value || "").toLowerCase()
  if (raw.includes("gender")) return "Gender Bias"
  if (raw.includes("age")) return "Age Bias"
  if (raw.includes("disab") || raw.includes("able")) return "Disability Bias"
  if (raw.includes("cultur") || raw.includes("racial") || raw.includes("relig")) return "Cultural Bias"
  return "Tone"
}

function fallbackIssuesFromText(text) {
  const fallbackRules = [
    // Gendered pronouns
    { regex: /\b(his|her|him|hers)\b/gi, label: "Gendered pronoun", suggestion: "they/their/them", severity: "medium", bias: "Gender Bias" },
    // Gendered job titles
    { regex: /\bchairman\b/gi, label: "Gendered job title", suggestion: "chairperson", severity: "high", bias: "Gender Bias" },
    { regex: /\bpoliceman\b/gi, label: "Gendered job title", suggestion: "police officer", severity: "high", bias: "Gender Bias" },
    { regex: /\bfireman\b/gi, label: "Gendered job title", suggestion: "firefighter", severity: "high", bias: "Gender Bias" },
    { regex: /\bstewardess\b/gi, label: "Gendered job title", suggestion: "flight attendant", severity: "high", bias: "Gender Bias" },
    { regex: /\bmailman\b/gi, label: "Gendered job title", suggestion: "postal worker", severity: "high", bias: "Gender Bias" },
    { regex: /\bsalesman\b/gi, label: "Gendered job title", suggestion: "salesperson", severity: "high", bias: "Gender Bias" },
    { regex: /\b(businessman|businesswoman)\b/gi, label: "Gendered job title", suggestion: "business professional", severity: "high", bias: "Gender Bias" },
    { regex: /\bspokesman\b/gi, label: "Gendered job title", suggestion: "spokesperson", severity: "high", bias: "Gender Bias" },
    { regex: /\bcameraman\b/gi, label: "Gendered job title", suggestion: "camera operator", severity: "high", bias: "Gender Bias" },
    // Gendered terms
    { regex: /\bmanpower\b/gi, label: "Gendered terminology", suggestion: "workforce", severity: "high", bias: "Gender Bias" },
    { regex: /\bmankind\b/gi, label: "Gendered terminology", suggestion: "humanity", severity: "high", bias: "Gender Bias" },
    { regex: /\bman-made\b/gi, label: "Gendered terminology", suggestion: "human-made", severity: "high", bias: "Gender Bias" },
    { regex: /\bguys\b/gi, label: "Gendered group reference", suggestion: "everyone", severity: "medium", bias: "Gender Bias" },
    // Ableist language
    { regex: /\bretard\b/gi, label: "Offensive ableist term", suggestion: "person with intellectual disability", severity: "high", bias: "Disability Bias" },
    { regex: /\bdumb\b/gi, label: "Ableist language", suggestion: "ineffective", severity: "medium", bias: "Disability Bias" },
    { regex: /\blame\b/gi, label: "Ableist language", suggestion: "ineffective", severity: "medium", bias: "Disability Bias" },
    { regex: /\bblind\s+to\b/gi, label: "Ableist metaphor", suggestion: "unaware of", severity: "medium", bias: "Disability Bias" },
    { regex: /\bdeaf\s+to\b/gi, label: "Ableist metaphor", suggestion: "ignoring", severity: "medium", bias: "Disability Bias" },
    { regex: /\bcrippled\b/gi, label: "Outdated term", suggestion: "person with mobility disability", severity: "high", bias: "Disability Bias" },
  ]

  const issues = []
  const seen = new Set()

  for (const rule of fallbackRules) {
    const matches = text.match(rule.regex) || []
    for (const match of matches) {
      const key = `${match.toLowerCase()}::${rule.suggestion.toLowerCase()}`
      if (seen.has(key)) continue
      seen.add(key)
      issues.push({
        label: rule.label,
        found: match,
        suggestion: rule.suggestion,
        severity: rule.severity,
        bias: rule.bias,
      })
    }
  }

  return issues
}

function buildPrompt(text, context) {
  return `You are an expert inclusive language checker. Your job is to identify ALL non-inclusive language in the text regardless of type.

Context (audience/setting): ${context}

Text to analyze:
"${text}"

Your task:
1. Scan the ENTIRE text for non-inclusive language including but not limited to:
   - Gendered language (he/she/his/her → they/their, chairman → chairperson, fireman → firefighter)
   - Ableist language (deaf to, blind to, dumb, retard, crippled, lame)
   - Age bias (elderly, seniors, old people → specific age groups or "older adults")
   - Assumptions about abilities or backgrounds
   - Tone issues (words that could be disrespectful or marginalizing)
   - Cultural insensitivity
   - Any other exclusionary or discriminatory language

2. For EACH issue found:
   - Provide the EXACT phrase from the text
   - Give ONE definitive inclusive suggestion (no alternatives, no multiple choices, no "or", no slash)
   - Mark severity as "high" (problematic) or "medium" (could be improved)
   - Categorize the bias type

3. Return ONLY valid JSON, no explanations:
{
  "issues": [
    {
      "label": "Clear description of the issue",
      "found": "exact phrase from text",
      "suggestion": "single inclusive alternative",
      "severity": "high" or "medium",
      "bias": "Gender Bias" or "Age Bias" or "Disability Bias" or "Cultural Bias" or "Tone"
    }
  ]
}

If no issues found, return: {"issues": []}
`
}

app.post("/analyze", async (req, res) => {
  try {
    const { text, context = "general" } = req.body

    if (!text) {
      return res.status(400).json({ error: "Text is required", issues: [] })
    }

    console.log("📝 Analyzing text:", text.substring(0, 50) + "...")
    console.log("🎯 Context:", context)

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const prompt = buildPrompt(text, context)
    
    try {
      let result
      try {
        console.log("🔍 Attempting structured JSON analysis...")
        result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            topP: 0.8,
            responseMimeType: "application/json",
          },
        })
      } catch (structuredError) {
        // Fallback for SDK/model variants that do not support responseMimeType.
        console.warn(
          "⚠️  Structured JSON mode failed, retrying with plain prompt:",
          structuredError.message
        )
        result = await model.generateContent(prompt)
      }
      const response = result.response
      const responseText = (response.text() || "").trim()

      console.log("📊 Raw response:", responseText.substring(0, 100) + "...")

      // Parse JSON from response
      const cleanedText = responseText.replace(/```json|```/gi, "").trim()
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/)
      
      let issues = []
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0])
          issues = Array.isArray(parsed.issues) ? parsed.issues : []
          console.log("✅ Gemini found:", issues.length, "issues")
        } catch (e) {
          console.error("❌ JSON parse error:", e.message, "text:", jsonMatch[0])
          issues = []
        }
      }

      // Validate each issue has required fields
      const validIssues = issues
        .map(issue => {
          if (!issue || typeof issue !== "object") return null

          const found = String(issue.found || "").trim()
          const suggestion = pickSingleSuggestion(issue.suggestion)

          if (!found || !suggestion) return null

          return {
            label: String(issue.label || "Inclusive language improvement").trim(),
            found,
            suggestion,
            severity: normalizeSeverity(issue.severity),
            bias: normalizeBias(issue.bias),
          }
        })
        .filter(Boolean)

      const finalIssues =
        validIssues.length > 0 ? validIssues : fallbackIssuesFromText(text)

      if (finalIssues.length === 0 && validIssues.length === 0) {
        console.log("🔄 Gemini returned empty, using fallback rules...")
        const fallbackIssues = fallbackIssuesFromText(text)
        console.log("✅ Fallback found:", fallbackIssues.length, "issues")
      }

      console.log("📋 Final issues:", finalIssues.length)
      res.json({ issues: finalIssues })
    } catch (apiError) {
      console.error("❌ Gemini API error:", apiError.message)
      console.log("🔄 Using fallback detection...")
      const fallbackIssues = fallbackIssuesFromText(text)
      console.log("✅ Fallback found:", fallbackIssues.length, "issues")
      if (fallbackIssues.length > 0) {
        return res.json({ issues: fallbackIssues })
      }
      res.status(500).json({ error: "Analysis failed", issues: [] })
    }
  } catch (error) {
    console.error("❌ Server error:", error)
    res.status(500).json({ error: "Server error", issues: [] })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
