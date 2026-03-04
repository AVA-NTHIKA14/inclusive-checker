type Tab = "editor" | "library" | "insights"

type Props = {
  active: Tab
  setActive: (tab: Tab) => void
  userName?: string
  userEmail?: string
  onSignOut?: () => void
}

export default function TopBar({ active, setActive, userName, userEmail, onSignOut }: Props) {
  const avatarLetter = (userEmail?.trim()?.[0] || userName?.trim()?.[0] || "U").toUpperCase()

  return (
    <header
      className="h-14 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-6"
      role="banner"
    >
      {/* LEFT: App Title */}
      <div className="font-bold tracking-wide text-white">
        INCLUSIVE CHECKER
      </div>

      <div className="flex items-center gap-6">
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

        {userName && onSignOut && (
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full bg-yellow-400 text-black font-bold text-sm flex items-center justify-center"
              aria-label={`User avatar: ${avatarLetter}`}
              title={`Signed in as ${userName}`}
            >
              {avatarLetter}
            </div>
            <button
              onClick={onSignOut}
              aria-label="Sign out"
              className="text-xs font-semibold px-3 py-1.5 rounded border border-neutral-700 bg-neutral-800 text-neutral-100 hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 transition"
            >
              SIGN OUT
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
