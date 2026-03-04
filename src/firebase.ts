import { getApp, getApps, initializeApp } from "firebase/app"
import { getAnalytics, isSupported } from "firebase/analytics"
import { getAuth, type User } from "firebase/auth"
import { doc, getFirestore, serverTimestamp, setDoc } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCn2U2CFT3saKqJVVdRcrw2uGt6kcuZ7gQ",
  authDomain: "inclusive-language-checker.firebaseapp.com",
  projectId: "inclusive-language-checker",
  storageBucket: "inclusive-language-checker.firebasestorage.app",
  messagingSenderId: "66514297271",
  appId: "1:66514297271:web:95e1b4ed5421ee1b8bc832",
  measurementId: "G-YE7VBD4TQK",
}

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

export const analyticsPromise = isSupported().then(supported =>
  supported ? getAnalytics(app) : null
)

export async function trackUserActivity(user: User) {
  const userRef = doc(db, "users", user.uid)

  await setDoc(
    userRef,
    {
      uid: user.uid,
      name: user.displayName || "",
      email: user.email || "",
      photoURL: user.photoURL || "",
      providerIds: user.providerData.map(p => p.providerId),
      lastSignInAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  )
}
