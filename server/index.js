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
    // ===== GENDERED PRONOUNS =====
    { regex: /\bhis\b/gi, label: "Gendered pronoun", suggestion: "their", severity: "medium", bias: "Gender Bias" },
    { regex: /\bher\b/gi, label: "Gendered pronoun", suggestion: "their", severity: "medium", bias: "Gender Bias" },
    { regex: /\bhim\b/gi, label: "Gendered pronoun", suggestion: "them", severity: "medium", bias: "Gender Bias" },
    { regex: /\bhe\b/gi, label: "Gendered pronoun", suggestion: "they", severity: "medium", bias: "Gender Bias" },
    { regex: /\bshe\b/gi, label: "Gendered pronoun", suggestion: "they", severity: "medium", bias: "Gender Bias" },
    { regex: /\bhers\b/gi, label: "Gendered pronoun", suggestion: "theirs", severity: "medium", bias: "Gender Bias" },
    
    // ===== GENDERED JOB TITLES =====
    { regex: /\bchairman\b/gi, label: "Gendered job title", suggestion: "chairperson", severity: "high", bias: "Gender Bias" },
    { regex: /\bchairwoman\b/gi, label: "Gendered job title", suggestion: "chairperson", severity: "high", bias: "Gender Bias" },
    { regex: /\bpoliceman\b/gi, label: "Gendered job title", suggestion: "police officer", severity: "high", bias: "Gender Bias" },
    { regex: /\bpolicewoman\b/gi, label: "Gendered job title", suggestion: "police officer", severity: "high", bias: "Gender Bias" },
    { regex: /\bfireman\b/gi, label: "Gendered job title", suggestion: "firefighter", severity: "high", bias: "Gender Bias" },
    { regex: /\bfirewoman\b/gi, label: "Gendered job title", suggestion: "firefighter", severity: "high", bias: "Gender Bias" },
    { regex: /\bstewardess\b/gi, label: "Gendered job title", suggestion: "flight attendant", severity: "high", bias: "Gender Bias" },
    { regex: /\bsteward\b/gi, label: "Gendered job title", suggestion: "flight attendant", severity: "high", bias: "Gender Bias" },
    { regex: /\bmailman\b/gi, label: "Gendered job title", suggestion: "postal worker", severity: "high", bias: "Gender Bias" },
    { regex: /\bmailwoman\b/gi, label: "Gendered job title", suggestion: "postal worker", severity: "high", bias: "Gender Bias" },
    { regex: /\bsalesman\b/gi, label: "Gendered job title", suggestion: "salesperson", severity: "high", bias: "Gender Bias" },
    { regex: /\bsaleswoman\b/gi, label: "Gendered job title", suggestion: "salesperson", severity: "high", bias: "Gender Bias" },
    { regex: /\bspokesman\b/gi, label: "Gendered job title", suggestion: "spokesperson", severity: "high", bias: "Gender Bias" },
    { regex: /\bspokewoman\b/gi, label: "Gendered job title", suggestion: "spokesperson", severity: "high", bias: "Gender Bias" },
    { regex: /\bcameraman\b/gi, label: "Gendered job title", suggestion: "camera operator", severity: "high", bias: "Gender Bias" },
    { regex: /\bcamerawoman\b/gi, label: "Gendered job title", suggestion: "camera operator", severity: "high", bias: "Gender Bias" },
    { regex: /\blineman\b/gi, label: "Gendered job title", suggestion: "line technician", severity: "high", bias: "Gender Bias" },
    { regex: /\brepairman\b/gi, label: "Gendered job title", suggestion: "repair technician", severity: "high", bias: "Gender Bias" },
    { regex: /\bassistant\s+manager\b/gi, label: "Gendered job title", suggestion: "assistant manager", severity: "medium", bias: "Gender Bias" },
    { regex: /\bwaiter\b/gi, label: "Gendered job title", suggestion: "server", severity: "medium", bias: "Gender Bias" },
    { regex: /\bwaitress\b/gi, label: "Gendered job title", suggestion: "server", severity: "medium", bias: "Gender Bias" },
    { regex: /\bactор\b/gi, label: "Gendered job title", suggestion: "actor", severity: "medium", bias: "Gender Bias" },
    { regex: /\bactress\b/gi, label: "Gendered job title", suggestion: "actor", severity: "medium", bias: "Gender Bias" },
    { regex: /\bhost\b/gi, label: "Gendered job title", suggestion: "host", severity: "medium", bias: "Gender Bias" },
    { regex: /\bhostess\b/gi, label: "Gendered job title", suggestion: "host", severity: "medium", bias: "Gender Bias" },
    
    // ===== GENDERED TERMS =====
    { regex: /\bmanpower\b/gi, label: "Gendered terminology", suggestion: "workforce", severity: "high", bias: "Gender Bias" },
    { regex: /\bmankind\b/gi, label: "Gendered terminology", suggestion: "humanity", severity: "high", bias: "Gender Bias" },
    { regex: /\bman-made\b/gi, label: "Gendered terminology", suggestion: "human-made", severity: "high", bias: "Gender Bias" },
    { regex: /\bguys?\b/gi, label: "Gendered group reference", suggestion: "everyone/people/candidates", severity: "medium", bias: "Gender Bias" },
    { regex: /\bgirls?\b/gi, label: "Gendered group reference", suggestion: "people/women", severity: "medium", bias: "Gender Bias" },
    { regex: /\bboys?\b/gi, label: "Gendered group reference", suggestion: "people/men", severity: "medium", bias: "Gender Bias" },
    { regex: /\blads?\b/gi, label: "Gendered group reference", suggestion: "people", severity: "medium", bias: "Gender Bias" },
    { regex: /\bwomankind\b/gi, label: "Gendered terminology", suggestion: "humanity", severity: "high", bias: "Gender Bias" },
    
    // ===== ABLEIST LANGUAGE =====
    { regex: /\bretard\b/gi, label: "Offensive ableist term", suggestion: "person with intellectual disability", severity: "high", bias: "Disability Bias" },
    { regex: /\bdumb\b/gi, label: "Ableist language", suggestion: "ineffective", severity: "medium", bias: "Disability Bias" },
    { regex: /\blame\b/gi, label: "Ableist language", suggestion: "ineffective", severity: "medium", bias: "Disability Bias" },
    { regex: /\bblind\s+to\b/gi, label: "Ableist metaphor", suggestion: "unaware of", severity: "medium", bias: "Disability Bias" },
    { regex: /\bdeaf\s+to\b/gi, label: "Ableist metaphor", suggestion: "ignoring", severity: "medium", bias: "Disability Bias" },
    { regex: /\bcrippled\b/gi, label: "Outdated term", suggestion: "person with mobility disability", severity: "high", bias: "Disability Bias" },
    { regex: /\bparalyzed\b/gi, label: "Ableist term", suggestion: "unable to move forward", severity: "medium", bias: "Disability Bias" },
    { regex: /\bsurvivors?\s+of\s+(?:abuse|assault)/gi, label: "Stigmatizing term", suggestion: "people affected by/person who experienced", severity: "medium", bias: "Disability Bias" },
    { regex: /\bsuffers?\s+from\s+(?:autism|ADHD|epilepsy|diabetes)/gi, label: "Stigmatizing language", suggestion: "has/people with", severity: "medium", bias: "Disability Bias" },
    { regex: /\bconfined\s+to\s+(?:wheelchair|bed)/gi, label: "Stigmatizing language", suggestion: "uses a wheelchair/in bed", severity: "high", bias: "Disability Bias" },
    { regex: /\bwheel-?chair\s+bound\b/gi, label: "Stigmatizing language", suggestion: "wheelchair user", severity: "high", bias: "Disability Bias" },
    
    // ===== AGE BIAS =====
    { regex: /\bold\s+(?:person|people|woman|man|age)\b/gi, label: "Age bias - vague term", suggestion: "older adults or specific age range", severity: "medium", bias: "Age Bias" },
    { regex: /\b(?:elderly|seniors?|golden years?)\b/gi, label: "Age stereotyping", suggestion: "older adults or specific age", severity: "medium", bias: "Age Bias" },
    { regex: /\byoung\s+(?:person|people|woman|man)\b/gi, label: "Age bias - vague term", suggestion: "younger adults or specific age", severity: "medium", bias: "Age Bias" },
    { regex: /\bgeneration\s+(?:x|y|z|millennial|boomer)\b/gi, label: "Generational stereotyping", suggestion: "people born in [specific years]", severity: "medium", bias: "Age Bias" },
    { regex: /\bfreshers?\b/gi, label: "Age/experience discrimination", suggestion: "early-career professionals or entry-level candidates", severity: "high", bias: "Age Bias" },
    { regex: /\bexperienced\s+professional\b/gi, label: "Age bias - indirect", suggestion: "professional with [X years] experience", severity: "medium", bias: "Age Bias" },
    
    // ===== MARITAL/PERSONAL STATUS DISCRIMINATION =====
    { regex: /\bunmarried\b/gi, label: "Marital status discrimination", suggestion: "available/flexible", severity: "high", bias: "Tone" },
    { regex: /\b(?:married|single|divorced)\s+(?:women?|men?|candidates?|personnel|employees?)\b/gi, label: "Inappropriate personal criteria", suggestion: "remove marital status requirement", severity: "high", bias: "Tone" },
    { regex: /\bwith(?:out)?\s+(?:children?|kids?)\b/gi, label: "Family status discrimination", suggestion: "remove family status requirement", severity: "high", bias: "Tone" },
    { regex: /\bonly\s+(?:unmarried|single|childless)/gi, label: "Marital status discrimination", suggestion: "remove personal status requirement", severity: "high", bias: "Tone" },
    
    // ===== CULTURAL/RELIGIOUS BIAS =====
    { regex: /\bforeign\s+(?:workers?|nationals?)\b/gi, label: "Othering language", suggestion: "international workers/workers from [country]", severity: "medium", bias: "Cultural Bias" },
    { regex: /\bexotic\b/gi, label: "Othering language (food/culture)", suggestion: "different or unfamiliar", severity: "medium", bias: "Cultural Bias" },
    { regex: /\boriental\b/gi, label: "Outdated term", suggestion: "East Asian or specific country", severity: "high", bias: "Cultural Bias" },
    { regex: /\bChinese\s+(?:whisper|whispers)\b/gi, label: "Stigmatizing term", suggestion: "pass along message", severity: "medium", bias: "Cultural Bias" },
    { regex: /\bEskimo\b/gi, label: "Outdated/offensive term", suggestion: "Inuit or Inupiat", severity: "high", bias: "Cultural Bias" },
    { regex: /\bIndian(?:\s+giver)?\b/gi, label: "Offensive/outdated term", suggestion: "Indigenous/Native American", severity: "high", bias: "Cultural Bias" },
    
    // ===== TONE/RESPECTFULNESS =====
    { regex: /\bbeast\b/gi, label: "Dehumanizing language", suggestion: "hardworking or dedicated person", severity: "medium", bias: "Tone" },
    { regex: /\bgangsta?\b/gi, label: "Stereotyping slang", suggestion: "use professional terminology", severity: "medium", bias: "Tone" },
    { regex: /\baggressive\b/gi, label: "Trait-based discrimination (may favor certain genders)", suggestion: "specify required job competencies", severity: "medium", bias: "Tone" },
    { regex: /\bcompetitive\b/gi, label: "Trait-based discrimination (may favor certain genders)", suggestion: "specify required job competencies", severity: "medium", bias: "Tone" },
    { regex: /\bdominant\b/gi, label: "Trait-based discrimination (may favor certain genders)", suggestion: "specify required job competencies", severity: "medium", bias: "Tone" },
    { regex: /\b(?:warm|nurturing|caring|motherly)\b/gi, label: "Gender stereotype in traits", suggestion: "focus on job-related skills", severity: "medium", bias: "Tone" },
  ]

  const issues = []
  const seen = new Set()

  console.log("🔍 Fallback: Starting regex matching on", text.length, "chars")
  
  for (const rule of fallbackRules) {
    const matches = text.match(rule.regex) || []
    if (matches.length > 0) {
      console.log(`  ✓ "${rule.regex}" matched:`, matches.join(", "))
    }
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

  console.log("🔍 Fallback: Found", issues.length, "total issues")
  return issues
}

function buildPrompt(text, context) {
  const contextDescriptions = {
    general: "General/any content - use standard inclusive language guidelines",
    job: "Job posting/hiring context - avoid gendered language in roles and requirements",
    email: "Professional email communication - maintain inclusive and respectful tone",
    slack: "Informal team chat/Slack message - still avoid biased or exclusionary language",
    policy: "Official policy document - must be formal and completely inclusive",
  }
  
  const contextDesc = contextDescriptions[context] || contextDescriptions.general
  
  return `You are an expert inclusive language checker. Your job is to identify ALL non-inclusive language in the text and provide SINGLE, SPECIFIC replacements.

Context: ${contextDesc}

Text to analyze:
"${text}"

Your task:
1. Scan the ENTIRE text for non-inclusive language including but not limited to:
   - Gendered pronouns: "he" → "they", "she" → "they", "him" → "them", "her" (object) → "them", "his" → "their", "hers" → "theirs"
   - Gendered job titles: "chairman" → "chairperson", "policeman" → "police officer", "fireman" → "firefighter", "stewardess" → "flight attendant", etc.
   - Gendered terms: "manpower" → "workforce", "mankind" → "humanity", "man-made" → "human-made"
   - Ableist language: "retard", "dumb", "lame", "blind to", "deaf to", "crippled", "suffers from"
   - Age bias and stereotypes
   - Cultural insensitivity
   - Tone issues

2. For EACH issue found, provide ONLY ONE specific suggestion:
   - NO alternatives (no "or", "and/or", "/" separators)
   - NO multiple options
   - ONLY the single best inclusive word
   - Example: for "his" → suggest ONLY "their" (not "their/them")
   - Example: for "he" → suggest ONLY "they"

3. Return ONLY valid JSON, no explanations:
{
  "issues": [
    {
      "label": "Clear description",
      "found": "exact phrase from text",
      "suggestion": "single word only",
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

    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
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
