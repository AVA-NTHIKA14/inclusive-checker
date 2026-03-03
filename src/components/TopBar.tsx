type Tab = "editor" | "library" | "insights"

type Props = {
  active: Tab
  setActive: (tab: Tab) => void
}

export default function TopBar({ active, setActive }: Props) {
  return (
    <header
      className="h-14 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-6"
      role="banner"
    >
      {/* LEFT: Logo and App Title */}
      <div className="flex items-center gap-3">
        <img 
          src="/logo.png" 
          alt="Inclusive Checker Logo" 
          className="h-10 w-10"
        />
        <div className="font-bold tracking-wide text-white">
          INCLUSIVE CHECKER
        </div>
      </div>

      {/* RIGHT: Navigation */}
      <nav
        className="flex gap-6 text-sm"
        aria-label="Top navigation"
      >
        <button
          onClick={() => setActive("editor")}
          aria-current={active === "editor"}
          className={`font-semibold transition ${
            active === "editor"
              ? "text-yellow-400"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          EDITOR
        </button>

        <button
          onClick={() => setActive("library")}
          aria-current={active === "library"}
          className={`font-semibold transition ${
            active === "library"
              ? "text-yellow-400"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          LIBRARY
        </button>

        <button
          onClick={() => setActive("insights")}
          aria-current={active === "insights"}
          className={`font-semibold transition ${
            active === "insights"
              ? "text-yellow-400"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          INSIGHTS
        </button>
      </nav>
    </header>
  )
}