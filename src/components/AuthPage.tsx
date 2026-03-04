import { useState } from "react"
import {
  GoogleAuthProvider,
  type User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth"
import { auth, trackUserActivity } from "../firebase"
import { saveSession } from "../auth/session"
import type { AuthUser } from "../types/auth"

type Props = {
  onAuthSuccess: (user: AuthUser) => void
}

function toAuthUser(user: Pick<User, "uid" | "email" | "displayName">): AuthUser {
  const fallbackName = user.email?.split("@")[0] || "User"
  return {
    uid: user.uid,
    name: user.displayName || fallbackName,
    email: user.email || "",
  }
}

function getGoogleAuthErrorMessage(error: unknown) {
  const code = typeof error === "object" && error && "code" in error
    ? String((error as { code?: string }).code || "")
    : ""

  if (code === "auth/popup-closed-by-user") {
    return "Google sign-in was cancelled."
  }

  if (code === "auth/popup-blocked") {
    return "Popup blocked by browser. Allow popups for this site and try again."
  }

  if (code === "auth/unauthorized-domain") {
    return "This domain is not authorized in Firebase. Add it in Authentication -> Settings -> Authorized domains."
  }

  if (code === "auth/operation-not-allowed") {
    return "Google sign-in is disabled in Firebase. Enable Google provider in Authentication -> Sign-in method."
  }

  if (code === "auth/network-request-failed") {
    return "Network error during Google sign-in. Check internet and try again."
  }

  return "Google sign-in failed. Please try again."
}

export default function AuthPage({ onAuthSuccess }: Props) {
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const resetForm = () => {
    setName("")
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setError("")
  }

  const switchMode = (next: "signin" | "signup") => {
    setMode(next)
    resetForm()
  }

  const completeAuth = async (user: User) => {
    const authUser = toAuthUser(user)
    saveSession(authUser)
    onAuthSuccess(authUser)
    await trackUserActivity(user)
  }

  const handleSignIn = async () => {
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail || !password.trim()) {
      setError("Enter email and password.")
      return
    }

    setBusy(true)
    setError("")

    try {
      const cred = await signInWithEmailAndPassword(auth, normalizedEmail, password)
      await completeAuth(cred.user)
    } catch {
      setError("Invalid email or password.")
    } finally {
      setBusy(false)
    }
  }

  const handleSignUp = async () => {
    const trimmedName = name.trim()
    const normalizedEmail = email.trim().toLowerCase()

    if (!trimmedName || !normalizedEmail || !password.trim()) {
      setError("Fill in all required fields.")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setBusy(true)
    setError("")

    try {
      const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, password)
      await updateProfile(cred.user, { displayName: trimmedName })
      await completeAuth(auth.currentUser || cred.user)
    } catch {
      setError("Could not create account. Try another email.")
    } finally {
      setBusy(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setBusy(true)
    setError("")

    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: "select_account" })
      const cred = await signInWithPopup(auth, provider)
      await completeAuth(cred.user)
    } catch (error) {
      setError(getGoogleAuthErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
      <section className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
        <h1 className="text-2xl font-bold mb-1">Inclusive Checker</h1>
        <p className="text-neutral-400 text-sm mb-6">Sign in or create an account to continue.</p>

        <div className="grid grid-cols-2 gap-2 mb-5">
          <button
            onClick={() => switchMode("signin")}
            disabled={busy}
            className={`rounded-lg py-2 text-sm font-semibold ${
              mode === "signin" ? "bg-yellow-400 text-black" : "bg-neutral-800 text-neutral-300"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => switchMode("signup")}
            disabled={busy}
            className={`rounded-lg py-2 text-sm font-semibold ${
              mode === "signup" ? "bg-yellow-400 text-black" : "bg-neutral-800 text-neutral-300"
            }`}
          >
            Sign Up
          </button>
        </div>

        <div className="space-y-3">
          {mode === "signup" && (
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-lg bg-neutral-950 border border-neutral-700 px-3 py-2 text-sm outline-none focus:border-yellow-400"
            />
          )}

          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="w-full rounded-lg bg-neutral-950 border border-neutral-700 px-3 py-2 text-sm outline-none focus:border-yellow-400"
          />

          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="w-full rounded-lg bg-neutral-950 border border-neutral-700 px-3 py-2 text-sm outline-none focus:border-yellow-400"
          />

          {mode === "signup" && (
            <input
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              type="password"
              className="w-full rounded-lg bg-neutral-950 border border-neutral-700 px-3 py-2 text-sm outline-none focus:border-yellow-400"
            />
          )}
        </div>

        {error && <p className="text-red-400 text-sm mt-3">{error}</p>}

        <button
          onClick={mode === "signin" ? handleSignIn : handleSignUp}
          disabled={busy}
          className="w-full mt-5 rounded-lg bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 text-black font-bold py-2 transition-colors"
        >
          {busy ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
        </button>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px bg-neutral-800 flex-1" />
          <span className="text-xs text-neutral-400">OR</span>
          <div className="h-px bg-neutral-800 flex-1" />
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={busy}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-60 text-neutral-100 font-semibold py-2 transition-colors"
        >
          Continue with Google
        </button>
      </section>
    </main>
  )
}
