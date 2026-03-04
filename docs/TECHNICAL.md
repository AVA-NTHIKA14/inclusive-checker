# Technical Documentation - Implementation Details

## ðŸ—ï¸ Architecture Overview

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    Frontend (React + TypeScript)             â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  App Component                                              â”‚
â”‚  â”œâ”€ EditorArea (with RealTimeHighlight)                     â”‚
â”‚  â”œâ”€ AnalysisPanel                                           â”‚
â”‚  â”‚  â”œâ”€ InclusiveScore                                       â”‚
â”‚  â”‚  â””â”€ IssueCard (multiple)                                 â”‚
â”‚  â”‚      â”œâ”€ BiasBadge                                        â”‚
â”‚  â”‚      â””â”€ Explanation Toggle                               â”‚
â”‚  â””â”€ Context Selector                                        â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
              â†“ /analyze API call â†“
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚              Backend (Node.js + Express)                     â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  Server Endpoint: POST /analyze                             â”‚
â”‚  â”œâ”€ Receives: text, context                                 â”‚
â”‚  â”œâ”€ buildPrompt() â†’ Enhanced Gemini prompt                  â”‚
â”‚  â”œâ”€ Gemini API Call                                         â”‚
â”‚  â”œâ”€ Response Parsing & Validation                           â”‚
â”‚  â”œâ”€ Fallback Regex Rules (if Gemini fails)                 â”‚
â”‚  â””â”€ Response: Array of Issues with explanations             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
              â†“ Issue data â†“
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚            Data Types (src/types/issue.ts)                  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  BiasCategory (7 types)                                     â”‚
â”‚  BiasColor (7 colors)                                       â”‚
â”‚  Issue{                                                     â”‚
â”‚    label, found, suggestion,                                â”‚
â”‚    severity, bias,                                          â”‚
â”‚    explanation, context                                     â”‚
â”‚  }                                                          â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## ðŸ“ File Structure

```
src/
â”œâ”€â”€ types/
â”‚   â””â”€â”€ issue.ts                 # Core Issue type, BiasCategory, BiasColor
â”œâ”€â”€ data/
â”‚   â”œâ”€â”€ inclusiveLibrary.ts      # Previous inclusive terms db
â”‚   â””â”€â”€ biasRules.ts             # NEW: 60+ detection rules
â”œâ”€â”€ api/
â”‚   â””â”€â”€ gemini.ts                # Gemini API client
â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ BiasBadge.tsx            # NEW: Color-coded category badge
â”‚   â”œâ”€â”€ InclusiveScore.tsx       # NEW: Score & breakdown display
â”‚   â”œâ”€â”€ IssueCard.tsx            # NEW: Enhanced issue card
â”‚   â”œâ”€â”€ RealTimeHighlight.tsx    # NEW: Color-coded editor highlighting
â”‚   â”œâ”€â”€ AnalysisPanel.tsx        # UPDATED: New UI + filters
â”‚   â”œâ”€â”€ EditorArea.tsx           # UPDATED: Uses RealTimeHighlight
â”‚   â””â”€â”€ (other components)
â””â”€â”€ App.tsx                       # Main component with state

server/
â””â”€â”€ index.js                      # UPDATED: Enhanced prompt + validation
```

---

## ðŸ”„ Data Flow

### Step 1: User Input
```
User types/pastes text
    â†“
EditorArea component stores in `text` state
    â†“
RealTimeHighlight shows color-coded issues (real-time)
```

### Step 2: Analysis Request
```
User clicks "Verify Text"
    â†“
App.tsx â†’ handleVerify()
    â†“
analyzeWithGemini(text, context)
    â†“
POST http://localhost:5000/analyze
{
  text: "...",
  context: "job" | "email" | "policy" | "slack" | "general"
}
```

### Step 3: Server Processing
```
server/index.js: POST /analyze
    â†“
buildPrompt(text, context)  // Create detailed AI prompt
    â†“
Gemini API â†’ model.generateContent()
    â†“
Parse response JSON
    â†“
Validate & normalize each issue
    â†“
Fallback to regex rules if needed
    â†“
Return: { issues: Issue[] }
```

### Step 4: UI Rendering
```
Issue[] data received
    â†“
AnalysisPanel renders:
  - InclusiveScore (calculates 0-100 score)
  - Filter/Sort controls
  - Array of IssueCard components
    â†“
Each IssueCard shows:
  - BiasBadge (category with color)
  - Found text
  - Suggested replacement
  - Explanation (toggleable)
  - Apply button
```

### Step 5: User Action
```
User clicks "Apply Suggestion" or "Apply All"
    â†“
handleSwap() or handleApplyAll()
    â†“
Regex replace in text
    â†“
setText() updates state
    â†“
Editor updates
    â†“
User re-verifies to check improvements
```

---

## ðŸ”‘ Key Components Explained

### **1. BiasBadge.tsx**
```typescript
// Props
type Props = {
  bias: BiasCategory         // One of 7 categories
  size?: "sm" | "md"        // Compact or normal size
}

// Renders
<div className={`flex items-center gap-2 ...`}>
  <div className="w-2 h-2 rounded-full" />  {/* Colored dot */}
  <span className="font-medium">{bias}</span>
</div>
```

**Colors mapping:**
- Gender Bias â†’ red
- Age Bias â†’ yellow
- Disability Bias â†’ blue
- Cultural Bias â†’ purple
- Tone â†’ orange
- Accessibility â†’ green
- Over-qualification â†’ pink

---

### **2. InclusiveScore.tsx**
```typescript
// Algorithm
const baseScore = Math.max(0, 100 - issues.length * 5)
const severityPenalty = highCount * 8 + mediumCount * 3
const inclusiveScore = Math.max(0, Math.min(100, baseScore - severityPenalty))

// Risk Level
80+ = Low Risk (Green)
60-79 = Medium Risk (Yellow)
40-59 = High Risk (Orange)
0-39 = Critical (Red)
```

**Displays:**
- Large score number (0-100)
- Risk level with color
- High/medium severity counts
- Category breakdown with tooltips

---

### **3. IssueCard.tsx**
```typescript
// Severity styling
{
  high: "bg-red-500/20 border-red-500/50",
  medium: "bg-yellow-500/20 border-yellow-500/50",
  low: "bg-blue-500/20 border-blue-500/50"
}

// Content
- Severity badge
- Category badge (BiasBadge)
- Issue label
- Found text (monospace, quoted)
- Suggested replacement (green)
- Explanation toggle
- Apply button
```

---

### **4. RealTimeHighlight.tsx**
```typescript
// Algorithm
1. Find all issue.found matches in text (case-insensitive)
2. Store position ranges and associated Issue
3. Build JSX by iterating through text
4. Insert <span> with color and tooltip for each match
5. Preserve all untouched text in between

// Tooltip
Hover to see: "{biasCategory} - {issue.label}"

// Colors
Each BiasCategory gets its color from BIAS_COLORS map
With semi-transparent background and bottom border
```

---

### **5. AnalysisPanel.tsx (Enhanced)**
```typescript
// State
[filterBias, setFilterBias]        // Selected category filter
[sortBy, setSortBy]                // "severity" | "category"

// Computed
allBiasCategories = unique bias types
filteredIssues = filterBias ? filter : all
sortedIssues = sorted by selected order

// Sections
1. Header (title + badges)
2. Loading state
3. No-text message
4. InclusiveScore (if text exists)
5. Success message (if no issues)
6. Filter & Sort controls
7. IssueCard list (mapped)
8. Apply All button
9. Legend / Info section
```

---

## ðŸ§  Bias Detection Logic

### Client-Side Prompt (buildPrompt)
```javascript
// Server/index.js
function buildPrompt(text, context) {
  // Context-aware description
  // Score details
  // 7 category definitions
  // Detection examples
  // Required output format
  // Critical rules
}
```

**Prompt includes:**
- Context information (job/email/policy/etc)
- All 7 bias categories with examples
- Severity definitions
- Required JSON format
- CRITICAL: Single suggestion only
- Fallback rules

### AI Response Parsing
```javascript
// 1. Try structured JSON mode (Gemini 2.0 feature)
// 2. Fallback to plain text if that fails
// 3. Extract JSON from response
// 4. Validate each issue
// 5. Normalize fields
// 6. Use fallback regex if needed
```

### Validation & Normalization
```javascript
// For each issue:
const validatedIssue = {
  label: normalizeString(issue.label),
  found: trimmedString(issue.found),
  suggestion: pickSingleSuggestion(issue.suggestion),  // Extract first option
  severity: normalizeSeverity(issue.severity),         // "high" or "medium" or "low"
  bias: normalizeBias(issue.bias),                     // Match to 7 categories
  explanation: normalizeString(issue.explanation)      // New field
}
```

---

## ðŸŽ¨ Color System

### BIAS_COLORS Map
```typescript
export const BIAS_COLORS: Record<BiasCategory, BiasColor> = {
  "Gender Bias": "red",
  "Age Bias": "yellow",
  "Disability Bias": "blue",
  "Cultural Bias": "purple",
  "Tone": "orange",
  "Accessibility": "green",
  "Over-qualification": "pink",
}
```

### Color Palette
```
red:    { bg: "bg-red-900/30", border: "border-red-500/50", text: "text-red-300", dot: "bg-red-500" }
yellow: { bg: "bg-yellow-900/30", border: "border-yellow-500/50", text: "text-yellow-300", dot: "bg-yellow-500" }
blue:   { bg: "bg-blue-900/30", border: "border-blue-500/50", text: "text-blue-300", dot: "bg-blue-500" }
// etc.
```

---

## ðŸ“Š Scoring Algorithm

### Base Score
```
startScore = 100
issuesPenalty = issues.length * 5     // Each issue: -5 points

baseScore = max(0, 100 - issuesPenalty)
```

### Severity Adjustment
```
highPenalty = highSeverityCount * 8        // -8 per high issue
mediumPenalty = mediumSeverityCount * 3    // -3 per medium issue

severityPenalty = highPenalty + mediumPenalty
```

### Final Score
```
inclusiveScore = max(0, min(100, baseScore - severityPenalty))
```

### Risk Level
```
if score >= 80: "Low Risk"      (ðŸŸ¢ Green)
if score >= 60: "Medium Risk"   (ðŸŸ¡ Yellow)
if score >= 40: "High Risk"     (ðŸŸ  Orange)
else:           "Critical"      (ðŸ”´ Red)
```

---

## ðŸ”§ Context Modes

Each context adjusts the prompt:

### **"job"**
Focus on:
- Gender bias in roles and requirements
- Age discrimination in descriptions
- Over-qualification barriers
- Masculine/feminine-coded language
- Disability exclusions
- Experience caps

### **"email"**
Focus on:
- Tone and respectfulness
- Greetings ("Hey guys" vs "Hello everyone")
- Blame language
- Passive-aggressive wording
- Clarity for accessibility

### **"policy"**
Focus on:
- Gender-specific terms
- Binary gender assumptions
- Non-inclusive language
- Accessibility clauses
- Formal correctness

### **"slack"**
Focus on:
- Casual sexism
- Microaggressions
- Exclusionary humor
- Stereotypes
- Informal but still inclusive

### **"general"**
Focus on:
- All categories equally
- Standard inclusive guidelines

---

## âš™ï¸ API Contract

### Request
```typescript
POST /analyze
Content-Type: application/json

{
  text: string,
  context: "job" | "email" | "policy" | "slack" | "general"
}
```

### Response (200 OK)
```typescript
{
  issues: [
    {
      label: string,              // What's wrong
      found: string,              // Exact text from input
      suggestion: string,         // ONE specific replacement
      severity: "high" | "medium" | "low",
      bias: BiasCategory,        // 7 types
      explanation?: string       // Why it matters
    }
  ]
}
```

### Error Response (500)
```typescript
{
  error: string,
  issues: []
}
```

---

## ðŸš€ Extending the System

### Adding a New Bias Category

1. **Update types/issue.ts**
   ```typescript
   export type BiasCategory = 
     | "Gender Bias"
     // ... existing
     | "New Category"   // Add here
   
   export const BIAS_COLORS: Record<BiasCategory, BiasColor> = {
     // ...
     "New Category": "pink",  // Add mapping
   }
   ```

2. **Update BiasBadge.tsx**
   ```typescript
   const colorMap = {
     // ... existing
     pink: { /* pink color scheme */ },  // Add if new color needed
   }
   ```

3. **Update server prompt**
   Add to buildPrompt() function in server/index.js

4. **Add fallback rules** (optional)
   In fallbackIssuesFromText() in server/index.js

### Adding New Severity Level

1. Update type: `severity: "critical" | ...`
2. Add styling in components
3. Update score calculation in InclusiveScore.tsx

---

## ðŸ” Testing the System

### Manual Testing
1. Start server: `node server/index.js`
2. Start frontend: `npm run dev`
3. Paste test content
4. Select context
5. Click "Verify Text"
6. Check results

### Test Cases
```javascript
// Gender Bias
"He will lead the team" â†’ suggestion, explanation

// Age Bias
"Recent graduates only" â†’ suggestion, explanation

// Color Validation
Check each category has correct color badge

// Score Calculation
10 issues (5 high, 5 medium) â†’ Score = ?
Base = 100 - (10 * 5) = 50
Penalty = (5 * 8) + (5 * 3) = 55
Final = max(0, 50 - 55) = 0 âœ“ Correct!

// Filter Works
Filter by "Gender Bias" â†’ shows only gender issues

// Highlighting
Text highlight appears as user types
Hover shows correct category
```

---

## ðŸ“¦ Dependencies

### Frontend
- React 18+ (UI framework)
- TypeScript (type safety)
- Tailwind CSS (styling)

### Backend
- Express (web framework)
- Google Generative AI SDK (@google/generative-ai)
- dotenv (env variables)
- cors (cross-origin requests)

---

## ðŸ” Environment Variables

```bash
# .env (backend)
GEMINI_API_KEY=your_api_key_here
PORT=5000              # Optional, defaults to 5000
```

---

## ðŸ› Debugging

### Enable Verbose Logging
Server logs include:
- ðŸ“ Text preview
- ðŸŽ¯ Context
- ðŸ” Fallback activation
- âœ… Issues found count
- âŒ Errors with details

### Common Issues

**"No issues found"**
- Check Gemini API key
- Verify text contains actual content
- Try different context
- Check JSON parsing in response

**"Unexpected color"**
- Verify normalizeBias() correctly identifies category
- Check BIAS_COLORS map has entry

**"Score doesn't match expectation"**
- Verify calculation: (100 - issues*5) - (high*8 + medium*3)
- Check severity normalization

---

## ðŸ“š References

### Bias Detection Standards
- [EEOC Anti-Discrimination Laws](https://www.eeoc.gov/)
- [Inclusive Language Guidelines](https://www.ap.org/)
- [Gendered Language Research](https://gap.hks.harvard.edu/gender-bias-language)

### Implementation Patterns
- React Hooks (useState)
- TypeScript Union Types
- Regex Matching
- Color Mapping Systems

---

This implementation provides a comprehensive, extensible, and user-friendly inclusive language checking system! ðŸŽ‰


---
