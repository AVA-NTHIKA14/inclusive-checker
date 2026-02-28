import { useState } from "react"
import TopBar from "./components/TopBar"
import SideNav, { type Context } from "./components/SideNav"
import EditorArea from "./components/EditorArea"
import AnalysisPanel from "./components/AnalysisPanel"
import Library from "./components/Library"
import ContextSelector from "./components/ContextSelector"
import { analyzeWithGemini } from "./api/gemini"
import type { Issue } from "./types/issue"

type Tab = "editor" | "library" | "insights"

// Client-side fallback detection for common non-inclusive terms
const BIASED_TERMS = [
  // Gendered pronouns
  { words: ["his", "her", "him", "hers"], suggestion: "they/their/them", severity: "medium" as const, bias: "Gender Bias" as const },
  // Gendered job titles
  { words: ["chairman", "policeman", "fireman", "stewardess", "mailman", "salesman", "businessman", "spokesman", "cameraman"], suggestion: "use gender-neutral version (e.g., chair, police officer)", severity: "high" as const, bias: "Gender Bias" as const },
  // Gendered manpower terms
  { words: ["manpower", "mankind", "man-made"], suggestion: "workforce/humanity/human-made", severity: "high" as const, bias: "Gender Bias" as const },
  // Ableist language
  { words: ["retard", "dumb", "lame"], suggestion: "use respectful, person-first language", severity: "high" as const, bias: "Disability Bias" as const },
]

// Helper function to find word boundaries correctly
const findWordMatches = (text: string, word: string): string[] => {
  const matches: string[] = []
  // Create a regex that matches whole words, case-insensitive
  const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi')
  let match
  while ((match = regex.exec(text)) !== null) {
    matches.push(match[0]) // Push the actual matched text
  }
  return matches
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("editor")
  const [context, setContext] = useState<Context>("general")
  const [text, setText] = useState("")
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(false)

  // Client-side fallback detection
  const detectClientSide = (textToCheck: string): Issue[] => {
    const detectedIssues: Issue[] = []
    
    BIASED_TERMS.forEach(({ words, suggestion, severity, bias }) => {
      words.forEach(word => {
        const matches = findWordMatches(textToCheck, word)
        matches.forEach(matchedText => {
          detectedIssues.push({
            label: `Non-inclusive ${bias.toLowerCase()}`,
            found: matchedText,
            suggestion,
            severity,
            bias,
          })
        })
      })
    })
    
    // Remove duplicates while preserving order
    const uniqueIssues = Array.from(new Map(
      detectedIssues.map(issue => [`${issue.found}-${issue.bias}`, issue])
    ).values())
    
    console.log("Detected unique issues:", uniqueIssues)
    return uniqueIssues
  }

  const handleVerify = async () => {
    if (!text.trim()) return
    setLoading(true)
    try {
      let issues: Issue[] = []
      
      // Try server-side analysis first
      try {
        const result = await analyzeWithGemini(text, context)
        console.log("Analysis result:", result)
        
        if (result && result.issues && result.issues.length > 0) {
          issues = result.issues
          console.log("Using server-side detection:", issues)
        } else {
          console.log("Server returned no issues, using fallback")
          issues = detectClientSide(text)
        }
      } catch (serverError) {
        console.error("Server error, using client-side fallback:", serverError)
        issues = detectClientSide(text)
      }
      
      setIssues(issues)
      console.log("Final issues set:", issues)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen bg-neutral-950 text-white grid grid-rows-[56px_1fr]">
      {/* TOP BAR */}
      <TopBar active={activeTab} setActive={setActiveTab} />

      {/* BODY */}
      <div className="grid grid-cols-[64px_1fr_420px] h-full">
        {/* SIDE NAV */}
        <SideNav active={activeTab} setActive={setActiveTab} />

        {/* CENTER */}
        {activeTab === "editor" && (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-neutral-800">
              <ContextSelector context={context} setContext={setContext} />
            </div>

            <EditorArea
              text={text}
              setText={setText}
              issues={issues}
              onVerify={handleVerify}
              loading={loading}
            />
          </div>
        )}

        {activeTab === "library" && <Library />}

        {activeTab === "insights" && (
          <div className="p-6 text-neutral-400">
            <h2 className="text-xl font-bold mb-2">Insights</h2>
            <p>
              Inclusion score, bias distribution, and improvement trends
              will appear here.
            </p>
          </div>
        )}

        {/* RIGHT PANEL */}
        {activeTab === "editor" && (
          <AnalysisPanel
            text={text}
            setText={setText}
            issues={issues}
            loading={loading}
          />
        )}
      </div>
    </div>
  )
}
