# ðŸš€ SETUP GUIDE - Get The App Working RIGHT NOW

## The Problem You're Seeing
```
Text: "We are looking for young and energetic candidates..."
Result: âœ— 0 FOUND - 100/100 Low Risk
Expected: âœ“ Multiple bias issues detected
```

## The Solution (3 Steps)

### Step 1ï¸âƒ£: Get a FREE Gemini API Key (2 minutes)

1. Go to: **https://aistudio.google.com/app/apikeys**
2. Click: **"Create API Key"**
3. Select: **"Create API key in new Google Cloud project"**
4. Copy the key that appears
5. Keep it safe (don't share)

### Step 2ï¸âƒ£: Create `.env` File in Server Folder

1. Open File Explorer
2. Navigate to: `d:\projects\tink-her-hack-temp\server\`
3. Create a new file called: `.env` (not `.env.txt`)
4. Open it with Notepad
5. Paste:
   ```
   GEMINI_API_KEY=paste_your_key_here
   PORT=5000
   ```
6. Replace `paste_your_key_here` with your actual key
7. Save and close

**Example:**
```
GEMINI_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PORT=5000
```

### Step 3ï¸âƒ£: Restart Server and Test

1. **Close all terminals** (if any running)
2. **Open new terminal** in VS Code
3. **Navigate to server:**
   ```bash
   cd server
   ```
4. **Start server:**
   ```bash
   node index.js
   ```
5. **You should see:**
   ```
   Server running on port 5000
   ```

6. **In another terminal, start frontend:**
   ```bash
   npm run dev
   ```

7. **Test in the app:**
   - Paste this text:
     ```
     We are looking for young and energetic candidates who can work long hours.
     The ideal person should be a strong leader who can dominate the team.
     Native English speakers only.
     ```
   - Click "Verify Text"
   - Should see: **Multiple issues detected** âœ…

---

## ðŸŽ¯ Expected Results After Setup

### Look for these in Server Logs:
```
ðŸ“ ANALYZING TEXT: We are looking for young...
ðŸš€ Sending request to Gemini API...
âœ… Received response from Gemini
âœ¨ Successfully parsed JSON with issues: 5
ðŸŽ¯ Final result: 5 valid issues
```

### In App - You'll See:
```
Score: 35/100 - CRITICAL
High Severity: 4
Medium Severity: 1

Issues:
âœ— "young and energetic" â†’ Age Bias
âœ— "strong leader" â†’ Gender Bias
âœ— "dominate" â†’ Gender Bias
âœ— "Native English speakers only" â†’ Cultural Bias
âœ— "long hours" â†’ Tone Issue
```

---

## âš ï¸ Common Mistakes

### âŒ WRONG: Saving as `.env.txt`
**Don't do this!**
- File must be `.env` (not `.env.txt`)
- Windows shows extensions hidden by default
- Always save as "All Files" type

### âŒ WRONG: No spaces in key
```
GEMINI_API_KEY=AIza...   â† WRONG (extra spaces)
GEMINI_API_KEY=AIza...   â† RIGHT (no extra spaces)
```

### âŒ WRONG: Key has quotes
```
GEMINI_API_KEY="AIza..."   â† WRONG
GEMINI_API_KEY=AIza...     â† RIGHT
```

### âŒ WRONG: Server still showing "0 FOUND"
- Check if `.env` file was actually created
- Restart server (Ctrl+C then `node index.js` again)
- Check server logs for "GEMINI_API_KEY"

---

## âœ… How to Verify It's Working

### In Server Terminal:
```
âœ… You should see:
   "Received response from Gemini"
   "Successfully parsed JSON"
   
âŒ If you see:
   "GEMINI_API_KEY not set"
   "Gemini API error"
```

### In App:
```
âœ… Score shows number other than 100
âœ… Issues appear with color-coded badges
âœ… "Why is this an issue?" button works

âŒ Shows "100/100 Low Risk"
âŒ Shows "0 FOUND"
âŒ No issue cards displayed
```

---

## ðŸ”„ Quick Start Commands

```bash
# Terminal 1: Navigate to server
cd d:\projects\tink-her-hack-temp\server

# Terminal 1: Check .env exists
dir .env

# Terminal 1: Start server
node index.js

# Terminal 2: Start frontend (when server is running)
cd d:\projects\tink-her-hack-temp
npm run dev

# Open browser to http://localhost:5173
```

---

## ðŸ†˜ Still Not Working?

**Check in this order:**

1. **Is `.env` file in `server/` folder?**
   ```bash
   dir server\.env   # Should show the file
   ```

2. **Does `.env` have correct format?**
   ```bash
   type server\.env   # Should show: GEMINI_API_KEY=AIza...
   ```

3. **Did you restart server after creating `.env`?**
   - Close with Ctrl+C
   - Run `node index.js` again

4. **Check server logs carefully**
   - Look for words: "GEMINI_API_KEY" or "API"
   - Any red error text?

5. **Try test endpoint (advanced)**
   ```bash
   # In new terminal:
   curl http://localhost:5000/analyze -X POST -H "Content-Type: application/json" -d "{\"text\":\"test\",\"context\":\"general\"}"
   ```

---

## ðŸ“Š What Happens WITHOUT API Key

The app has a **fallback system**:
1. AI fails (no key)
2. Falls back to regex pattern matching
3. Still detects SOME issues (but not all)
4. Less detailed explanations

**This is why you're seeing "0 FOUND"** - the fallback patterns might not match your exact wording.

With API key â†’ Full AI power â†’ Detects all subtle biases âœ…

---

## ðŸŽ“ Understanding Your API Key

- **What it is:** Permission to use Google's Gemini AI
- **Cost:** FREE tier has 60 requests/minute (more than enough)
- **Where to get:** https://aistudio.google.com/app/apikeys
- **Keep it:** Secret (don't post online or share)
- **How long:** Works forever (until you delete it)

---

## ðŸ“ Checklist

- [ ] Went to https://aistudio.google.com/app/apikeys
- [ ] Created API Key
- [ ] Created file: `server/.env`
- [ ] Pasted: `GEMINI_API_KEY=your_key`
- [ ] Saved `.env` file
- [ ] Closed server (Ctrl+C)
- [ ] Restarted server: `node index.js`
- [ ] Server logs show "Server running on port 5000"
- [ ] Opened app in browser
- [ ] Pasted test text
- [ ] Clicked "Verify Text"
- [ ] Saw issues detected! âœ…

---

## ðŸŽ‰ Once It Works

Now try these examples to see the power:

### Job Posting (triggers gender + age + over-qual bias)
```
Rockstar developer needed! He will lead our technical team.
Recent graduates only. Must be young and energetic.
Must have: JavaScript, React, TypeScript, Node, Python, 
SQL, MongoDB, AWS, Docker, Kubernetes, and 10+ years ago.
```

### Email (triggers tone issues)
```
Hey guys,

You clearly should have known not to miss the deadline.
It's obviously too late now. You failed to deliver on time.

Just try harder next time.
```

### Policy (triggers gender + accessibility)
```
All employees must be physically fit. 
Firemen who are strong leaders preferred.
Chairman of board must be male.
```

---

## ðŸš€ Ready?

1. Get API key now: https://aistudio.google.com/app/apikeys
2. Create `server/.env` with that key
3. Run `node index.js`
4. Test in app

**That's it!** Your AI inclusive language checker will work perfectly. ðŸŽ¯


---
