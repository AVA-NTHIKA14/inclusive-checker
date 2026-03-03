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
   - Give ONE definitive inclusive suggestion (no alternatives)
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
