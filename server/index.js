import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { GoogleGenerativeAI } from "@google/generative-ai"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const inclusiveTerms = [
  "everyone",
  "people",
  "chairperson",
  "workforce",
  "partner",
  "older people",
  "person with a disability",
  "pregnant people",
  "prefer not to say",
]

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

function buildPrompt(text, context) {
  return `You are a strict inclusive language checker. Your job is to identify ALL non-inclusive language in the text.

MANDATORY CHECKS - Flag these EVERY time they appear:
1. GENDERED PRONOUNS - Flag: "he", "him", "his", "she", "her", "hers" (singular) → Suggest: "they", "them", "their"
2. GENDERED JOB TITLES - Flag: "Chairman", "Policeman", "Fireman", "Stewardess", "Mailman", "Salesman", "Businessman", "Spokesman", "Housewife", "Cameraman" → Suggest gender-neutral version
3. GENDERED TERMS - Flag: "manpower", "mankind", "girl/boy" (for adults), "man-made" → Suggest inclusive alternative
4. ABLEIST LANGUAGE - Flag: "retard", "dumb", "blind to", "deaf to", "crippled", "suffers from", "confined to wheelchair"
5. AGE BIAS - Flag: "old", "young", "elderly", "seniors" (be specific) → Suggest specific age ranges or "older adults"
6. ABILITY ASSUMPTION - Flag: "disabled person", "sufferer" → Suggest "person with a disability", "person living with"

CONTEXT: ${context}

TEXT TO ANALYZE:
"${text}"

STRICT RULES:
- Return ONLY valid JSON, no explanations
- Find and flag EVERY instance of non-inclusive language
- MUST check for pronouns like "his", "her", "he", "she" and suggest "they/their"
- Include the exact phrase as it appears in the text
- severity must be "high" or "medium"
- bias must be one of: "Gender Bias", "Age Bias", "Disability Bias", "Cultural Bias", "Tone"

Return this JSON format EXACTLY:
{
  "issues": [
    {
      "label": "bias type",
      "found": "exact phrase from text",
      "suggestion": "inclusive alternative",
      "severity": "high",
      "bias": "Gender Bias" | "Age Bias" | "Disability Bias" | "Cultural Bias" | "Tone"
    }
  ]
}

If text has no issues, return: {"issues": []}
`
}

app.post("/analyze", async (req, res) => {
  try {
    const { text, context = "general" } = req.body

    if (!text) {
      return res.status(400).json({ error: "Text is required", issues: [] })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const prompt = buildPrompt(text, context)
    
    try {
      const result = await model.generateContent(prompt)
      const response = result.response
      const responseText = response.text()

      console.log("Raw response:", responseText)

      // Parse JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      
      let issues = []
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0])
          issues = Array.isArray(parsed.issues) ? parsed.issues : []
        } catch (e) {
          console.error("JSON parse error:", e.message, "text:", jsonMatch[0])
          issues = []
        }
      }

      // Validate each issue has required fields
      const validIssues = issues.filter(issue => 
        issue && 
        issue.label && 
        issue.found && 
        issue.suggestion && 
        issue.severity && 
        issue.bias
      )

      console.log("Found issues:", validIssues.length)
      res.json({ issues: validIssues })
    } catch (apiError) {
      console.error("Gemini API error:", apiError.message)
      res.status(500).json({ error: "Analysis failed", issues: [] })
    }
  } catch (error) {
    console.error("Server error:", error)
    res.status(500).json({ error: "Server error", issues: [] })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
