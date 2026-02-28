import { MdEdit, MdLibraryBooks, MdInsights } from "react-icons/md"

export type Context =
  | "general"
  | "job"
  | "email"
  | "slack"
  | "policy"

type Tab = "editor" | "library" | "insights"

type Props = {
  active: Tab
  setActive: (tab: Tab) => void
}

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "editor", label: "Editor", icon: <MdEdit size={24} /> },
  { key: "library", label: "Library", icon: <MdLibraryBooks size={24} /> },
  { key: "insights", label: "Insights", icon: <MdInsights size={24} /> },
]

export default function SideNav({ active, setActive }: Props) {
  return (
    <nav
      className="bg-neutral-950 border-r border-neutral-800 flex flex-col items-center gap-4 p-4"
      aria-label="Main navigation"
    >
      {TABS.map(tab => (
        <button
          key={tab.key}
          onClick={() => setActive(tab.key)}
          aria-current={active === tab.key}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded transition ${
            active === tab.key
              ? "bg-yellow-400 text-black"
              : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
          }`}
          title={tab.label}
        >
          {tab.icon}
        </button>
      ))}
    </nav>
  )
}