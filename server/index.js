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
  const raw = String(value).toLowerCase().trim()
  if (raw === "high") return "high"
  if (raw === "low") return "low"
  return "medium"  // default to medium
}

function normalizeBias(value) {
  const raw = String(value || "").toLowerCase()
  if (raw.includes("gender")) return "Gender Bias"
  if (raw.includes("age")) return "Age Bias"
  if (raw.includes("disab") || raw.includes("able")) return "Disability Bias"
  if (raw.includes("cultur") || raw.includes("racial") || raw.includes("relig")) return "Cultural Bias"
  if (raw.includes("accessibility") || raw.includes("readability")) return "Accessibility"
  if (raw.includes("over-qualification") || raw.includes("requirement")) return "Over-qualification"
  return "Tone"
}

const CONTEXT_RULES = {
  general: {
    title: "General content",
    focus: "Analyze this content for basic inclusive language issues. Flag exclusionary words, biased phrasing, and unclear accessibility wording.",
    templatePrompt: "Analyze this content for basic inclusive language issues. Flag exclusionary words, biased phrasing, and unclear accessibility wording.",
    allowedBiases: ["Gender Bias", "Age Bias", "Disability Bias", "Cultural Bias", "Accessibility"],
  },
  job: {
    title: "Job posting / recruitment",
    focus: "Analyze the job description for hiring bias, gender-coded language, age discrimination, disability exclusion, and unrealistic requirements.",
    templatePrompt: "Analyze the job description for hiring bias, gender-coded language, age discrimination, disability exclusion, and unrealistic requirements.",
    allowedBiases: ["Gender Bias", "Age Bias", "Disability Bias", "Cultural Bias", "Over-qualification", "Tone"],
  },
  email: {
    title: "Professional email communication",
    focus: "Analyze this email for tone, professionalism, respectful wording, and inclusive communication.",
    templatePrompt: "Analyze this email for tone, professionalism, respectful wording, and inclusive communication.",
    allowedBiases: ["Tone", "Accessibility"],
  },
  slack: {
    title: "Slack / chat communication",
    focus: "Analyze this chat message for casual language risks, including microaggressions, sarcasm, ableist slang, and dismissive tone.",
    templatePrompt: "Analyze this chat message for casual language risks, including microaggressions, sarcasm, ableist slang, and dismissive tone.",
    allowedBiases: ["Tone", "Disability Bias", "Cultural Bias", "Gender Bias"],
  },
  policy: {
    title: "HR / policy document",
    focus: "Check this policy document for gender-neutral language, binary gender assumptions, accessibility gaps, nationality restrictions, and outdated titles.",
    templatePrompt: "Check this policy document for gender-neutral language, binary gender assumptions, accessibility gaps, nationality restrictions, and outdated titles.",
    allowedBiases: ["Gender Bias", "Cultural Bias", "Accessibility", "Disability Bias"],
  },
}

function getContextRule(context) {
  return CONTEXT_RULES[context] || CONTEXT_RULES.general
}

function allowIssueForContext(issue, context) {
  const rule = getContextRule(context)
  const normalizedBias = normalizeBias(issue?.bias)
  return rule.allowedBiases.includes(normalizedBias)
}

function normalizeForMatch(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/["'\u2018\u2019\u201c\u201d]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function foundExistsInText(found, text) {
  if (!found || !text) return false

  const exactFound = String(found).trim()
  if (!exactFound) return false

  // Fast path: exact phrase match (case-insensitive)
  if (String(text).toLowerCase().includes(exactFound.toLowerCase())) {
    return true
  }

  // Fallback: normalize quotes/spacing and try again
  const normalizedFound = normalizeForMatch(exactFound)
  const normalizedText = normalizeForMatch(text)
  return normalizedFound.length > 0 && normalizedText.includes(normalizedFound)
}

function fallbackIssuesFromText(text, context = "general") {
  const fallbackRules = [
    // ===== AGE BIAS (PRIORITY) =====
    { regex: /\byoung\s+and\s+energetic/gi, label: "Age bias - youth requirement", suggestion: "motivated and energetic", severity: "high", bias: "Age Bias" },
    { regex: /\byoung\s+(?:talent|person|professional|people)/gi, label: "Age bias - youth preference", suggestion: "talented person/professional", severity: "high", bias: "Age Bias" },
    { regex: /\brecentg?(?:ly)?\s+graduate/gi, label: "Age discrimination - experience barrier", suggestion: "early-career or entry-level candidate", severity: "high", bias: "Age Bias" },
    { regex: /\bdigital\s+native/gi, label: "Generational stereotype", suggestion: "tech-savvy or proficient with technology", severity: "high", bias: "Age Bias" },
    { regex: /\bfresh(?:er|man)/gi, label: "Age/experience discrimination", suggestion: "entry-level", severity: "high", bias: "Age Bias" },
    { regex: /\d+\s*-\s*\d+\s+years?\s+(?:max|maximum)/gi, label: "Age bias - experience cap", suggestion: "remove or change to 'X years preferred'", severity: "high", bias: "Age Bias" },
    
    // ===== MASCULINE-CODED LANGUAGE (PRIORITY) =====
    { regex: /\baggressive\s+(?:person|leader|developer|writer)/gi, label: "Masculine-coded language", suggestion: "assertive or passionate", severity: "high", bias: "Gender Bias" },
    { regex: /\bstrong\s+leader/gi, label: "Masculine-coded language", suggestion: "effective leader", severity: "medium", bias: "Gender Bias" },
    { regex: /\bdominate/gi, label: "Masculine-coded language", suggestion: "lead or influence", severity: "medium", bias: "Gender Bias" },
    { regex: /\bcompetitive/gi, label: "Masculine-coded language", suggestion: "driven or collaborative", severity: "medium", bias: "Gender Bias" },
    { regex: /\brockstar\s+(?:developer|engineer|worker)/gi, label: "Masculine-coded appeal", suggestion: "skilled developer/engineer", severity: "high", bias: "Gender Bias" },
    { regex: /\bgung\s+ho/gi, label: "Masculine-coded language", suggestion: "enthusiastic or passionate", severity: "medium", bias: "Gender Bias" },
    
    // ===== CULTURAL/LANGUAGE BIAS (PRIORITY) =====
    { regex: /\bnative\s+(?:English\s+)?speaker/gi, label: "Cultural/language bias", suggestion: "proficient in English or fluent in English", severity: "high", bias: "Cultural Bias" },
    { regex: /\b(?:Indian|local)\s+candidates?\s+only/gi, label: "National origin discrimination", suggestion: "open to diverse backgrounds", severity: "high", bias: "Cultural Bias" },
    
    // ===== GENDERED PRONOUNS =====
    { regex: /\bhe\s+(?:will|would|should|is|has|can)\b/gi, label: "Gendered pronoun", suggestion: "they", severity: "high", bias: "Gender Bias" },
    { regex: /\bshe\s+(?:will|would|should|is|has|can)\b/gi, label: "Gendered pronoun", suggestion: "they", severity: "high", bias: "Gender Bias" },
    { regex: /\bhis\b(?!\s+own)/gi, label: "Gendered pronoun", suggestion: "their", severity: "medium", bias: "Gender Bias" },
    { regex: /\bher\b(?!\s+own)/gi, label: "Gendered pronoun", suggestion: "their", severity: "medium", bias: "Gender Bias" },
    { regex: /\bhim\b/gi, label: "Gendered pronoun", suggestion: "them", severity: "medium", bias: "Gender Bias" },
    { regex: /\bHe\s+(?:will|would|should|is|has|can)\b/g, label: "Gendered pronoun", suggestion: "They", severity: "high", bias: "Gender Bias" },
    
    // ===== GENDERED TERMS =====
    { regex: /\bman\s+(?:power|kind|made)/gi, label: "Gendered terminology", suggestion: "workforce/humanity/human-made", severity: "high", bias: "Gender Bias" },
    { regex: /\bguys/gi, label: "Gendered group reference", suggestion: "everyone/team/people", severity: "medium", bias: "Gender Bias" },
    
    // ===== TONE/HARSH LANGUAGE =====
    { regex: /\blike\s+a\s+man\b/gi, label: "Gender stereotype in tone", suggestion: "remove this phrase", severity: "high", bias: "Tone" },
    { regex: /\bwithout\s+complaints/gi, label: "Harsh requirement wording", suggestion: "professionally or reliably", severity: "medium", bias: "Tone" },
    { regex: /\bcan\s+handle\s+pressure/gi, label: "Potential tone issue", suggestion: "be specific about job requirements", severity: "low", bias: "Tone" },
    
    // ===== ABLEIST LANGUAGE =====
    { regex: /\bretard\b/gi, label: "Offensive ableist term", suggestion: "person with intellectual disability", severity: "high", bias: "Disability Bias" },
    { regex: /\bdumb\b/gi, label: "Ableist language", suggestion: "ineffective", severity: "medium", bias: "Disability Bias" },
    { regex: /\blame\b/gi, label: "Ableist language", suggestion: "weak or ineffective", severity: "medium", bias: "Disability Bias" },
    { regex: /\bblind\s+to\b/gi, label: "Ableist metaphor", suggestion: "unaware of", severity: "medium", bias: "Disability Bias" },
    { regex: /\bdeaf\s+to\b/gi, label: "Ableist metaphor", suggestion: "ignoring or dismissing", severity: "medium", bias: "Disability Bias" },
    { regex: /\bcrippled/gi, label: "Offensive/outdated term", suggestion: "person with mobility disability", severity: "high", bias: "Disability Bias" },
    { regex: /\b(?:must\s+)?be\s+(?:physically|mentally)?\s*fit/gi, label: "Disability exclusion", suggestion: "remove or add 'reasonable accommodations available'", severity: "high", bias: "Disability Bias" },
    { regex: /\bwheelchair\s+bound/gi, label: "Stigmatizing language", suggestion: "wheelchair user", severity: "high", bias: "Disability Bias" },
    { regex: /\bconfined\s+to\s+(?:a\s+)?wheelchair/gi, label: "Stigmatizing language", suggestion: "uses a wheelchair", severity: "high", bias: "Disability Bias" },
    { regex: /\bsuffers?\s+from\s+/gi, label: "Stigmatizing language about disability", suggestion: "has or person with", severity: "medium", bias: "Disability Bias" },
    
    // ===== GENDERED JOB TITLES =====
    { regex: /\bchairman\b/gi, label: "Gendered job title", suggestion: "chairperson", severity: "high", bias: "Gender Bias" },
    { regex: /\bfireman\b/gi, label: "Gendered job title", suggestion: "firefighter", severity: "high", bias: "Gender Bias" },
    { regex: /\bpoliceman\b/gi, label: "Gendered job title", suggestion: "police officer", severity: "high", bias: "Gender Bias" },
    { regex: /\bsalesman\b/gi, label: "Gendered job title", suggestion: "salesperson", severity: "high", bias: "Gender Bias" },
    { regex: /\bspokesman\b/gi, label: "Gendered job title", suggestion: "spokesperson", severity: "high", bias: "Gender Bias" },
    
    // ===== OTHERING LANGUAGE =====
    { regex: /\b(?:exotic|foreign)\s+(?:worker|candidate|person)/gi, label: "Othering language", suggestion: "international professional", severity: "medium", bias: "Cultural Bias" },
    
    // ===== OVER-QUALIFICATION BARRIERS =====
    { regex: /\bmust\s+have\s+(?:all|every)/gi, label: "Over-qualification barrier", suggestion: "Separate required vs nice-to-have skills", severity: "high", bias: "Over-qualification" },
  ]

  const issues = []
  const seen = new Set()

  console.log("\n🔍 FALLBACK: Running regex rules on", text.length, "chars...")
  
  for (const rule of fallbackRules) {
    const matches = text.match(rule.regex) || []
    if (matches.length > 0) {
      console.log(`  ✓ "${rule.regex.source}" found ${matches.length} match(es)`)
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
        explanation: `Flagged by pattern matching: ${rule.label}`,
      })
    }
  }

  console.log(`✅ Fallback detected: ${issues.length} total issues\n`)
  const filtered = issues.filter(issue => allowIssueForContext(issue, context))
  console.log(`✅ Fallback context-filtered (${context}): ${filtered.length} issues\n`)
  return filtered
}

function buildPrompt(text, context) {
  const rule = getContextRule(context)
  const allowedBiasList = rule.allowedBiases.join(", ")
  
  return `You are an EXPERT INCLUSIVE LANGUAGE CHECKER trained in DEI (Diversity, Equity, Inclusion).

YOUR TASK: Find ALL non-inclusive language in the text below. Be thorough and comprehensive.

CONTEXT MODE: ${rule.title}
CONTEXT FOCUS: ${rule.focus}
TAB PROMPT TEMPLATE: ${rule.templatePrompt}
ALLOWED BIAS TYPES FOR THIS CONTEXT: ${allowedBiasList}

TEXT TO ANALYZE:
"""
${text}
"""

DETECT THESE 7 BIAS TYPES:

1️⃣ GENDER BIAS - Gendered pronouns (he/she/his/her), job titles (chairman/fireman), gendered terms (manpower), masculine-coded language (aggressive, competitive, dominant, fearless), feminine-coded language (nurturing, caring).

2️⃣ AGE BIAS - Age requirements (recent graduate, young, elderly), experience caps, generational stereotypes (digital native, Gen Z), phrases like "fresh talent" or "old money".

3️⃣ DISABILITY BIAS - Ableist language (dumb, lame, blind to, crippled, suffers from), exclusionary requirements (must be fit, strong eyesight required, able-bodied), stigmatizing terms (wheelchair bound, confined to wheelchair).

4️⃣ CULTURAL/NATIONAL BIAS - Language requirements (native English speaker), geographic restrictions (Indian candidates only), othering (exotic, foreign worker), stereotypes.

5️⃣ TONE/RESPECTFULNESS - Blame language (you failed, you forgot), passive-aggressive (clearly, obviously, just), inappropriate greetings (hey guys, dear sir), harsh/dismissive tone.

6️⃣ ACCESSIBILITY - Dense paragraphs, unclear jargon, overly complex sentences, filler words that reduce clarity.

7️⃣ OVER-QUALIFICATION BARRIERS - "Must have ALL requirements", 10+ mandatory skills, missing encouragement for partial matches, unrealistic checklists.

INSTRUCTIONS:
1. SCAN EVERY WORD AND PHRASE carefully
2. Flag only issues that match this context mode and focus
3. Do not return issues outside the allowed bias types
4. For EACH issue:
   a) Provide the EXACT phrase from text (found)
   b) Suggest ONE specific replacement (never multiple options)
   c) Classify as high/medium/low severity:
      - HIGH: Discriminatory, exclusionary, legally problematic
      - MEDIUM: May discourage qualified candidates
      - LOW: Minor accessibility/clarity improvements
   d) Identify which of the 7 bias types
   e) Explain WHY it's problematic in 1-2 sentences

CRITICAL: Output ONLY valid JSON array. NO markdown. NO code blocks. NO extra text.

RESPONSE FORMAT - JSON ONLY:
{
  "issues": [
    {
      "found": "exact phrase from text",
      "suggestion": "single replacement word/phrase only",
      "severity": "high|medium|low",
      "bias": "Gender Bias|Age Bias|Disability Bias|Cultural Bias|Tone|Accessibility|Over-qualification",
      "label": "short description of problem",
      "explanation": "Why this is problematic and who it affects"
    }
  ]
}

IMPORTANT NOTES:
- If found nothing, return: {"issues": []}
- One suggestion per issue - NEVER use "or", "and/or", "/"
- Be comprehensive WITHIN this context's focus
- Match the severity as described above
- Explanations should help user understand the impact
`
}

app.post("/analyze", async (req, res) => {
  try {
    const { text, context = "general" } = req.body

    if (!text) {
      return res.status(400).json({ error: "Text is required", issues: [] })
    }

    console.log("\n" + "=".repeat(60))
    console.log("📝 ANALYZING TEXT:", text.substring(0, 80) + "...")
    console.log("🎯 CONTEXT:", context)
    console.log("📊 TEXT LENGTH:", text.length)
    console.log("=".repeat(60))

    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY not set! Using fallback rules only.")
      const fallbackIssues = fallbackIssuesFromText(text, context)
      return res.json({ issues: fallbackIssues })
    }

    // Use the latest Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
    const prompt = buildPrompt(text, context)
    
    console.log("🚀 Sending request to Gemini API...")

    try {
      // Latest models support better JSON output
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,  // Lower temp for consistency
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 2048,
        },
      })

      if (!result || !result.response) {
        throw new Error("No response from Gemini API")
      }

      const response = result.response
      const responseText = (response.text() || "").trim()

      if (!responseText) {
        throw new Error("Empty response text from Gemini")
      }

      console.log("✅ Received response from Gemini")
      console.log("📄 Response length:", responseText.length)
      console.log("📌 Response preview:", responseText.substring(0, 150) + "...")

      // Try to parse JSON from response
      let issues = []
      
      // Try multiple extraction patterns
      const patterns = [
        /\{[\s\S]*"issues"[\s\S]*\}/,  // Greedy - find any object with "issues"
        /```json\n?([\s\S]*?)\n?```/,  // Markdown code block
        /\{[\s\S]*\}/,                 // Any JSON object
      ]

      for (const pattern of patterns) {
        const cleanedText = responseText.replace(/```json|```/gi, "").trim()
        const match = cleanedText.match(pattern)
        
        if (match) {
          try {
            const jsonStr = match[1] || match[0]
            const parsed = JSON.parse(jsonStr)
            if (parsed.issues && Array.isArray(parsed.issues)) {
              issues = parsed.issues
              console.log("✨ Successfully parsed JSON with issues:", issues.length)
              break
            }
          } catch (e) {
            console.log("⚠️ JSON parse attempt failed:", e.message)
            continue
          }
        }
      }

      // Validate and normalize each issue
      const validIssues = issues
        .map((issue, idx) => {
          if (!issue || typeof issue !== "object") {
            console.log(`  ⚠️ Issue ${idx} is not an object`)
            return null
          }

          const found = String(issue.found || "").trim()
          const suggestion = pickSingleSuggestion(issue.suggestion)

          if (!found || !suggestion) {
            console.log(`  ⚠️ Issue ${idx} missing found or suggestion`)
            return null
          }

          if (!foundExistsInText(found, text)) {
            console.log(`  ⚠️ Issue ${idx} found phrase not in input text: "${found}"`)
            return null
          }

          const normalized = {
            label: String(issue.label || "Inclusive language improvement").trim(),
            found,
            suggestion,
            severity: normalizeSeverity(issue.severity),
            bias: normalizeBias(issue.bias),
            explanation: String(issue.explanation || "").trim(),
          }

          if (!allowIssueForContext(normalized, context)) {
            console.log(`  ⚠️ Issue ${idx} out of context scope: "${normalized.bias}"`)
            return null
          }

          console.log(`  ✓ Valid issue ${idx}: "${found}" → "${suggestion}" [${normalized.bias}]`)
          return normalized
        })
        .filter(Boolean)

      console.log(`\n🎯 Final result: ${validIssues.length} valid issues`)

      if (validIssues.length > 0) {
        console.log("✅ Successfully detected bias issues via Gemini")
        return res.json({ issues: validIssues })
      } else {
        console.log("⚠️ Gemini returned no valid issues, triggering fallback...")
        throw new Error("No valid issues parsed from Gemini response")
      }

    } catch (apiError) {
      console.error("❌ Gemini API error:", apiError.message)
      console.log("🔄 Falling back to regex-based detection...")
      
      const fallbackIssues = fallbackIssuesFromText(text, context)
      console.log(`✅ Fallback detection found: ${fallbackIssues.length} issues`)
      
      if (fallbackIssues.length > 0) {
        console.log("📋 Note: Using regex fallback (not AI-based)")
        fallbackIssues.forEach(issue => {
          console.log(`  - "${issue.found}" [${issue.bias}]`)
        })
        return res.json({ issues: fallbackIssues })
      }
      
      return res.json({ issues: [] })
    }
  } catch (error) {
    console.error("❌ Server error:", error.message)
    console.error(error.stack)
    res.status(500).json({ error: "Server error", issues: [] })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
