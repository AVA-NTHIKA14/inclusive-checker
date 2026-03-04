import { useState } from "react"
import TopBar from "./components/TopBar"
import SideNav, { type Context } from "./components/SideNav"
import EditorArea from "./components/EditorArea"
import AnalysisPanel from "./components/AnalysisPanel"
import Library from "./components/Library"
import InsightsPanel from "./components/InsightsPanel"
import AuthPage from "./components/AuthPage"
import ContextSelector from "./components/ContextSelector"
import { analyzeWithGemini } from "./api/gemini"
import type { Issue, BiasCategory } from "./types/issue"
import type { AuthUser } from "./types/auth"
import { clearSession, loadSession } from "./auth/session"
import { auth } from "./firebase"
import { signOut } from "firebase/auth"

type Tab = "editor" | "library" | "insights"

type AnalysisSnapshot = {
  id: string
  context: Context
  score: number
  issues: number
  high: number
  medium: number
  low: number
  biasBreakdown: Record<BiasCategory, number>
  textLength: number
  createdAt: number
}

// NOTE: Using Gemini API for universal dynamic detection
// No hardcoded terms - all analysis is done by AI

export default function App() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => loadSession())
  const [activeTab, setActiveTab] = useState<Tab>("editor")
  const [context, setContext] = useState<Context>("general")
  const [text, setText] = useState("")
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(false)
  const [hasVerified, setHasVerified] = useState(false)
  const [history, setHistory] = useState<AnalysisSnapshot[]>([])

  const escapeRegex = (value: string) =>
    value.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")

  const issueStillPresent = (source: string, found: string) => {
    const cleanedFound = found.trim()
    if (!cleanedFound || !source) return false

    if (source.toLowerCase().includes(cleanedFound.toLowerCase())) {
      return true
    }

    const parts = cleanedFound.split(/\s+/)
    const last = parts[parts.length - 1] || ""
    const escapedPrefix = parts
      .slice(0, -1)
      .map(part => escapeRegex(part))
      .join("\\s+")

    if (!last) return false

    const escapedLast = escapeRegex(last)
    const optionalPlural = last.endsWith("s")
      ? `${escapedLast.slice(0, -1)}s?`
      : `${escapedLast}s?`

    const pattern = escapedPrefix
      ? `\\b${escapedPrefix}\\s+${optionalPlural}\\b`
      : `\\b${optionalPlural}\\b`

    return new RegExp(pattern, "i").test(source)
  }

  const updateText = (nextText: string) => {
    setText(nextText)
    setIssues(prev => prev.filter(issue => issueStillPresent(nextText, issue.found)))
    setHasVerified(false)
  }

  const updateContext = (nextContext: Context) => {
    setContext(nextContext)
    setIssues([])
    setHasVerified(false)
  }

  const calculateScore = (detectedIssues: Issue[]) => {
    const base = Math.max(0, 100 - detectedIssues.length * 5)
    const high = detectedIssues.filter(i => i.severity === "high").length
    const medium = detectedIssues.filter(i => i.severity === "medium").length
    const penalty = high * 8 + medium * 3
    return Math.max(0, Math.min(100, base - penalty))
  }

  const createSnapshot = (detectedIssues: Issue[]) => {
    const high = detectedIssues.filter(i => i.severity === "high").length
    const medium = detectedIssues.filter(i => i.severity === "medium").length
    const low = detectedIssues.filter(i => i.severity === "low").length
    const score = calculateScore(detectedIssues)

    const biasBreakdown = detectedIssues.reduce((acc, issue) => {
      acc[issue.bias] = (acc[issue.bias] || 0) + 1
      return acc
    }, {
      "Gender Bias": 0,
      "Age Bias": 0,
      "Disability Bias": 0,
      "Cultural Bias": 0,
      "Tone": 0,
      "Accessibility": 0,
      "Over-qualification": 0,
    } as Record<BiasCategory, number>)

    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      context,
      score,
      issues: detectedIssues.length,
      high,
      medium,
      low,
      biasBreakdown,
      textLength: text.length,
      createdAt: Date.now(),
    }
  }

  const handleVerify = async () => {
    if (!text.trim()) return
    setLoading(true)
    try {
      const result = await analyzeWithGemini(text, context)
      console.log("Analysis result:", result)
      
      const detectedIssues: Issue[] = (result && result.issues) ? result.issues : []
      setIssues(detectedIssues)
      setHasVerified(true)
      const snapshot = createSnapshot(detectedIssues)
      setHistory(prev => [snapshot, ...prev].slice(0, 30))
      console.log("Issues detected:", detectedIssues.length)
    } catch (error) {
      console.error("Analysis failed:", error)
      setIssues([])
      setHasVerified(false)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = () => {
    void signOut(auth)
    clearSession()
    setAuthUser(null)
    setActiveTab("editor")
    setText("")
    setIssues([])
    setHistory([])
    setHasVerified(false)
  }

  if (!authUser) {
    return <AuthPage onAuthSuccess={setAuthUser} />
  }

  return (
    <div className="h-screen bg-neutral-950 text-white grid grid-rows-[56px_1fr]">
      {/* TOP BAR */}
      <TopBar
        active={activeTab}
        setActive={setActiveTab}
        userName={authUser.name}
        userEmail={authUser.email}
        onSignOut={handleSignOut}
      />

      {/* BODY */}
      <div className="grid grid-cols-[64px_1fr_420px] h-full">
        {/* SIDE NAV */}
        <SideNav active={activeTab} setActive={setActiveTab} />

        {/* CENTER */}
        {activeTab === "editor" && (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-neutral-800">
              <ContextSelector context={context} setContext={updateContext} />
            </div>

            <EditorArea
              text={text}
              setText={updateText}
              issues={issues}
              onVerify={handleVerify}
              loading={loading}
            />
          </div>
        )}

        {activeTab === "library" && <Library />}

        {activeTab === "insights" && (
          <InsightsPanel
            history={history}
            currentIssues={issues}
            hasVerified={hasVerified}
            currentContext={context}
          />
        )}

        {/* RIGHT PANEL */}
        {activeTab === "editor" && (
          <AnalysisPanel
            text={text}
            setText={updateText}
            issues={issues}
            loading={loading}
            hasVerified={hasVerified}
          />
        )}
      </div>
    </div>
  )
}
