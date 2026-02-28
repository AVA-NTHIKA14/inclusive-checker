import { type Context } from "../components/SideNav"

export async function analyzeWithGemini(text: string, context: Context) {
  const res = await fetch("http://localhost:5000/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, context }),
  })

  if (!res.ok) throw new Error("Gemini failed")

  return res.json()
}