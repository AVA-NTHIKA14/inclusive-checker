# ðŸ”§ Troubleshooting Guide - Why Isn't The App Detecting Issues?

## âŒ Problem: Showing "0 FOUND" or No Issues Detected

Your app is an **AI-based tool**, so if it's not detecting bias, the issue is usually:

### **1. GEMINI API KEY NOT SET** âš ï¸ (MOST COMMON)

**Signs:**
- Returns "0 FOUND" on clearly biased text
- Server logs show: "GEMINI_API_KEY not set"
- Console shows blank analysis panel

**Fix:**

1. **Get your API key:**
   - Go to [https://aistudio.google.com/app/apikeys](https://aistudio.google.com/app/apikeys)
   - Click "Create API Key"
   - Copy the key

2. **Create `.env` file in `server/` folder:**
   ```
   GEMINI_API_KEY=your_key_here
   PORT=5000
   ```

3. **Restart server:**
   ```bash
   cd server
   npm install  # if needed
   node index.js
   ```

4. **Check logs:**
   Look for: `âœ… Received response from Gemini` in terminal

### **2. GEMINI API KEY INVALID**

**Signs:**
- Server logs show API errors
- Error message in terminal about authentication

**Fix:**
- Verify your API key is correct (copy-paste from Google AI Studio)
- Make sure there are no extra spaces
- Try generating a new key

### **3. GEMINI API RATE LIMITED OR QUOTA EXCEEDED**

**Signs:**
- Works sometimes, then stops
- Error about rate limits

**Fix:**
- Wait a few minutes
- Check your usage: [https://aistudio.google.com/app/usage](https://aistudio.google.com/app/usage)
- Free tier has 60 requests/minute limit

### **4. MODEL NAME OUTDATED**

**If error mentions "gemini-pro not found":**

The server now uses `gemini-2.0-flash` (the latest model).

If you still get errors, the fallback regex rules will kick in. Check server logs.

---

## ðŸ” How AI Detection Works

```
1. User enters text in editor
   â†“
2. Clicks "Verify Text"
   â†“
3. Text sent to server
   â†“
4. Server builds detailed prompt for Gemini
   â†“
5. Gemini API analyzes 7 types of bias
   â†“
6. Returns structured JSON with:
   - What phrase needs fixing
   - Why it's problematic
   - What to use instead
   - Severity level
   - Category of bias
   â†“
7. App displays with color coding
```

## ðŸš€ Making it Work

### Step 1: Verify API Key Setup
```bash
cd server
cat .env  # Should show: GEMINI_API_KEY=xxx
```

### Step 2: Check Server Logs
Run server and look for these messages:

âœ… **Good signs:**
```
ðŸ“ ANALYZING TEXT: We are looking for young...
ðŸš€ Sending request to Gemini API...
âœ… Received response from Gemini
âœ¨ Successfully parsed JSON with issues: 5
ðŸŽ¯ Final result: 5 valid issues
```

âŒ **Bad signs:**
```
âŒ GEMINI_API_KEY not set!
âŒ Gemini API error: ...
ðŸ”„ Using fallback detection...
```

### Step 3: Restart Everything
```bash
# Terminal 1: Server
cd server
node index.js

# Terminal 2: Frontend (new terminal)
npm run dev
```

### Step 4: Test with Sample Text
Paste this in the editor:
```
We are looking for young and energetic candidates who can work long hours without complaints.
The ideal person should be a strong leader who can dominate the team.
Native English speakers only.
```

**Expected detections:**
- âœ“ "young and energetic" â†’ Age Bias
- âœ“ "strong leader" â†’ Gender Bias  
- âœ“ "dominate" â†’ Gender Bias
- âœ“ "Native English speakers" â†’ Cultural Bias

**Gets 0?** â†’ Your API key is the issue

---

## ðŸ“Š Why The Fallback Rules Exist

If Gemini API:
- Fails
- Is rate limited
- Has no key configured
- Returns invalid response

Then fallback regex rules activate to detect common bias patterns.

**Fallback covers:**
- "young and energetic"
- "strong leader"
- "dominate"
- "aggressive"
- "native English speaker"
- "he/she" pronouns
- "recent graduate"
- Many other patterns

But fallback is NOT as smart as AI:
- Can't understand context
- Only matches known patterns
- Misses subtle biases
- Won't explain WHY something is problematic

---

## ðŸŽ¯ Testing Checklist

- [ ] Created `.env` file in `server/` folder
- [ ] Added `GEMINI_API_KEY=xxx` to `.env`
- [ ] Restarted server: `node index.js`
- [ ] See âœ… API logs saying "Received response"
- [ ] Frontend loads without errors
- [ ] Paste test text above
- [ ] Click "Verify Text"
- [ ] See issues detected with explanations

---

## ðŸ’¡ Understanding the Output

### When AI Detection Works (BEST)
```
Issue: "young and energetic"
Category: Age Bias (ðŸŸ¡ Yellow)
Severity: HIGH
Explanation: "May discourage experienced candidates from applying"
Suggestion: "motivated and energetic"
```

Why this is better:
- âœ… Understands context
- âœ… Provides explanation
- âœ… Explains who it affects
- âœ… More accurate

### When Fallback Rules Work (OK)
```
Issue: "young and energetic"
Category: Age Bias (ðŸŸ¡ Yellow)
Severity: HIGH
Suggestion: "motivated and energetic"
Explanation: "Flagged by pattern matching"
```

Why this is less ideal:
- âŒ No contextual explanation
- âŒ Generic response
- âŒ Only known patterns

---

## ðŸ”´ Critical Issues to Fix

### Issue 1: Invalid API Key
```javascript
// server/index.js line ~264
if (!process.env.GEMINI_API_KEY) {
  console.error("âŒ GEMINI_API_KEY not set!")
  // Falls back to regex only
}
```

**SOLUTION:** Create `.env` file with valid key

### Issue 2: Old Model Name
```javascript
// OLD (broken):
const model = genAI.getGenerativeModel({ model: "gemini-pro" })

// NEW (fixed):
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
```

**Already fixed in latest version**

### Issue 3: JSON Parsing Fails
```javascript
// Server tries multiple patterns to extract JSON
// If all fail, uses fallback regex
// Check logs to see which pattern worked
```

---

## ðŸ’¬ What To Do if Still Not Working

1. **Check Terminal Output**
   - Look for "GEMINI_API_KEY not set"
   - Look for API errors with message

2. **Verify `.env` File**
   ```bash
   cd server
   ls -la  # Should show .env file
   cat .env  # Should show your API key
   ```

3. **Test API Key Directly** (Optional)
   ```bash
   curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "contents": [{"parts": [{"text": "Say hello"}]}]
     }'
   ```

4. **Check Google AI Studio**
   - API key still valid?
   - Usage quota not exceeded?
   - Enable billing if needed?

5. **Restart Everything**
   ```bash
   # Close all terminals
   # Kill any running processes
   # cd server && node index.js
   # cd app && npm run dev
   ```

---

## ðŸŽ“ Expected Behavior

### With Proper Setup
```
Input: "We need a rockstar developer who is aggressive"
Output: 
  1. "rockstar developer" â†’ Gender Bias (HIGH) 
     Explanation: Masculine-coded appeals discourage diverse candidates
  2. "aggressive" â†’ Gender Bias (HIGH)
     Explanation: May favor masculine traits
Score: 70/100 - Medium Risk
```

### Without API Key (Fallback)
```
Input: "We need a rockstar developer"
Output:
  1. "rockstar developer" â†’ Gender Bias (HIGH)
     (from fallback regex pattern)
  2. No other issues (fallback doesn't catch "aggressive")
Score: Still high, but less accurate
```

---

## ðŸ“ž Quick Summary

The app is **100% AI-powered**. If it's not detecting issues:

**99% of the time:** Missing or invalid `GEMINI_API_KEY`

**Solution:**
1. Get key from https://aistudio.google.com/app/apikeys
2. Create `server/.env` with `GEMINI_API_KEY=xxx`
3. Restart server
4. Done! âœ…

That's it! ðŸš€

# Inclusive Language Checker

AI-powered web app for detecting non-inclusive language and suggesting inclusive alternatives.

Hosted app: https://inclusive-checker-b3lh.vercel.app/

## Docs

- [Features](docs/FEATURES.md)
- [Quick Start](docs/QUICK_START.md)
- [Setup](docs/SETUP.md)
- [Technical](docs/TECHNICAL.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express
- AI: Google Gemini API
- Auth: Firebase Authentication (Email/Password + Google)
- User tracking: Firestore

## Development

```bash
npm install
npm run dev
```

Run backend in a separate terminal:

```bash
cd server
npm install
npm start
```

## License

MIT
