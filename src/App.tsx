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

// NOTE: Using Gemini API for universal dynamic detection
// No hardcoded terms - all analysis is done by AI

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("editor")
  const [context, setContext] = useState<Context>("general")
  const [text, setText] = useState("")
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(false)

  const handleVerify = async () => {
    if (!text.trim()) return
    setLoading(true)
    try {
      const result = await analyzeWithGemini(text, context)
      console.log("Analysis result:", result)
      
      const detectedIssues: Issue[] = (result && result.issues) ? result.issues : []
      setIssues(detectedIssues)
      console.log("Issues detected:", detectedIssues.length)
    } catch (error) {
      console.error("Analysis failed:", error)
      setIssues([])
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
