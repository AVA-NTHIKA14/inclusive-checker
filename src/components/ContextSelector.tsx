export type Context =
  | "general"
  | "job"
  | "email"
  | "slack"
  | "policy"

type Props = {
  context: Context
  setContext: (c: Context) => void
}

const CONTEXTS: {
  key: Context
  label: string
  description: string
}[] = [
  {
    key: "general",
    label: "General",
    description: "Any generic content",
  },
  {
    key: "job",
    label: "Job Post",
    description: "Hiring & role descriptions",
  },
  {
    key: "email",
    label: "Email",
    description: "Professional communication",
  },
  {
    key: "slack",
    label: "Slack / Chat",
    description: "Informal team messages",
  },
  {
    key: "policy",
    label: "Policy",
    description: "Official documents & guidelines",
  },
]

export default function ContextSelector({
  context,
  setContext,
}: Props) {
  return (
    <section
      aria-label="Select content context"
      className="flex gap-2 flex-wrap"
    >
      {CONTEXTS.map(c => (
        <button
          key={c.key}
          onClick={() => setContext(c.key)}
          aria-pressed={context === c.key}
          className={`px-3 py-2 rounded text-sm font-semibold transition
            ${
              context === c.key
                ? "bg-yellow-400 text-black"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            }
          `}
        >
          <div>{c.label}</div>
          <div className="text-[10px] font-normal opacity-70">
            {c.description}
          </div>
        </button>
      ))}
    </section>
  )
}