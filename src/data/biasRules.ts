import type { BiasCategory } from "../types/issue"

export interface BiasRule {
  regex: RegExp
  label: string
  severity: "high" | "medium" | "low"
  bias: BiasCategory
  suggestion: string
  explanation: string
}

// Comprehensive bias detection rules
export const BIAS_RULES: BiasRule[] = [
  // ===================== GENDER BIAS =====================
  // Gendered Pronouns
  {
    regex: /\bhe\s+(will|is|has|would|could|should)/gi,
    label: "Gendered pronoun in job context",
    severity: "high",
    bias: "Gender Bias",
    suggestion: "they will/is/has/would/could/should",
    explanation:
      "Using 'he' assumes developers are male and may discourage women from applying.",
  },
  {
    regex: /\bshe\s+(will|is|has|would|could|should)/gi,
    label: "Gendered pronoun",
    severity: "high",
    bias: "Gender Bias",
    suggestion: "they will/is/has/would/could/should",
    explanation:
      "Using 'she' can reinforce gender stereotypes. Use gender-neutral pronouns instead.",
  },
  {
    regex: /\bhis\b/gi,
    label: "Gendered pronoun",
    severity: "medium",
    bias: "Gender Bias",
    suggestion: "their",
    explanation: "Replace gendered pronouns with 'their' to be inclusive of all genders.",
  },
  {
    regex: /\bher\b(?!\s+(?:own|role|position|work|team|department|project|contribution))/gi,
    label: "Gendered pronoun",
    severity: "medium",
    bias: "Gender Bias",
    suggestion: "their",
    explanation: "Replace gendered pronouns with 'their' to be inclusive of all genders.",
  },
  {
    regex: /\bhim\b/gi,
    label: "Gendered pronoun",
    severity: "medium",
    bias: "Gender Bias",
    suggestion: "them",
    explanation: "Replace gendered pronouns with 'them' to be inclusive of all genders.",
  },

  // Gendered Job Titles & Terms
  {
    regex: /\brockstar\s+(?:developer|engineer|programmer)\b/gi,
    label: "Masculine-coded descriptor in job posting",
    severity: "high",
    bias: "Gender Bias",
    suggestion: "skilled developer/engineer",
    explanation:
      "'Rockstar' appeals to masculine traits and can discourage diverse candidates from applying.",
  },
  {
    regex: /\bchairman\b/gi,
    label: "Gendered job title",
    severity: "high",
    bias: "Gender Bias",
    suggestion: "chairperson",
    explanation: "Use gender-neutral job titles to avoid excluding candidates of any gender.",
  },
  {
    regex: /\bchairwoman\b/gi,
    label: "Gendered job title",
    severity: "high",
    bias: "Gender Bias",
    suggestion: "chairperson",
    explanation: "Use gender-neutral job titles to avoid excluding candidates of any gender.",
  },
  {
    regex: /\bpoliceman\b/gi,
    label: "Gendered job title",
    severity: "high",
    bias: "Gender Bias",
    suggestion: "police officer",
    explanation: "Use gender-neutral terminology to make the role accessible to all candidates.",
  },
  {
    regex: /\bpolicewoman\b/gi,
    label: "Gendered job title",
    severity: "high",
    bias: "Gender Bias",
    suggestion: "police officer",
    explanation: "Use gender-neutral terminology to make the role accessible to all candidates.",
  },
  {
    regex: /\bfireman\b/gi,
    label: "Gendered job title",
    severity: "high",
    bias: "Gender Bias",
    suggestion: "firefighter",
    explanation: "Use gender-neutral job titles to encourage diverse applications.",
  },
  {
    regex: /\bfirewoman\b/gi,
    label: "Gendered job title",
    severity: "high",
    bias: "Gender Bias",
    suggestion: "firefighter",
    explanation: "Use gender-neutral job titles to encourage diverse applications.",
  },
  {
    regex: /\bstewardess\b/gi,
    label: "Gendered job title",
    severity: "high",
    bias: "Gender Bias",
    suggestion: "flight attendant",
    explanation: "Use inclusive job titles that welcome candidates of all genders.",
  },
  {
    regex: /\bsteward\b/gi,
    label: "Gendered job title",
    severity: "high",
    bias: "Gender Bias",
    suggestion: "flight attendant",
    explanation: "Use inclusive job titles that welcome candidates of all genders.",
  },
  {
    regex: /\bmailman\b/gi,
    label: "Gendered job title",
    severity: "high",
    bias: "Gender Bias",
    suggestion: "postal worker",
    explanation: "Make job titles inclusive to all candidates regardless of gender.",
  },
  {
    regex: /\bsalesman\b/gi,
    label: "Gendered job title",
    severity: "high",
    bias: "Gender Bias",
    suggestion: "salesperson",
    explanation: "Use neutral titles to welcome candidates of all genders.",
  },
  {
    regex: /\bspokesman\b/gi,
    label: "Gendered job title",
    severity: "high",
    bias: "Gender Bias",
    suggestion: "spokesperson",
    explanation: "Replace gendered job titles with neutral alternatives.",
  },

  // Gendered Terminology
  {
    regex: /\bmanpower\b/gi,
    label: "Gendered term",
    severity: "high",
    bias: "Gender Bias",
    suggestion: "workforce",
    explanation: "'Manpower' is gendered. Use 'workforce' or 'staff' for inclusive language.",
  },
  {
    regex: /\bmankind\b/gi,
    label: "Gendered term",
    severity: "high",
    bias: "Gender Bias",
    suggestion: "humanity",
    explanation: "Replace 'mankind' with gender-neutral terms like 'humanity' or 'people'.",
  },
  {
    regex: /\bman-made\b/gi,
    label: "Gendered term",
    severity: "high",
    bias: "Gender Bias",
    suggestion: "human-made",
    explanation:
      "Use 'human-made' instead of 'man-made' for more inclusive language.",
  },

  // Masculine-coded Language
  {
    regex: /\baggressive\b/gi,
    label: "Masculine-coded trait (may discourage women)",
    severity: "high",
    bias: "Gender Bias",
    suggestion: "assertive or passionate",
    explanation:
      "'Aggressive' is masculine-coded and may discourage women from applying. Use 'assertive' or describe the specific skill needed.",
  },
  {
    regex: /\bcompetitive\b/gi,
    label: "Masculine-coded trait",
    severity: "high",
    bias: "Gender Bias",
    suggestion: "collaborative or driven",
    explanation:
      "'Competitive' is masculine-coded. Use 'collaborative', 'driven', or 'results-focused' instead.",
  },
  {
    regex: /\bfearless\b/gi,
    label: "Masculine-coded trait",
    severity: "medium",
    bias: "Gender Bias",
    suggestion: "confident",
    explanation:
      "'Fearless' appeals to masculine traits. Use 'confident' or describe the actual competency.",
  },
  {
    regex: /\bstrong\s+leader\b/gi,
    label: "Masculine-coded phrase",
    severity: "medium",
    bias: "Gender Bias",
    suggestion: "effective leader",
    explanation:
      "'Strong leader' is masculine-coded. Use 'effective leader' or describe leadership qualities.",
  },
  {
    regex: /\bdominant\b/gi,
    label: "Masculine-coded trait",
    severity: "medium",
    bias: "Gender Bias",
    suggestion: "leading or influential",
    explanation:
      "'Dominant' is masculine-coded. Use 'leading', 'influential', or describe the specific skill.",
  },

  // Feminine-coded Language
  {
    regex: /\bnurturing\b/gi,
    label: "Feminine-coded trait",
    severity: "medium",
    bias: "Gender Bias",
    suggestion: "supportive",
    explanation:
      "'Nurturing' is feminine-coded. Focus on job-related skills instead of personality traits.",
  },
  {
    regex: /\bsupportive\b/gi,
    label: "Potential feminine-coded trait",
    severity: "low",
    bias: "Gender Bias",
    suggestion: "consider if this describes actual job duties",
    explanation:
      "Use skill-based language. If 'supportive' is job-critical, be specific about what support is needed.",
  },
  {
    regex: /\bunderstanding\b/gi,
    label: "Potential feminine-coded trait",
    severity: "low",
    bias: "Gender Bias",
    suggestion: "empathetic or collaborative if actual job requirement",
    explanation:
      "Be specific about job-related qualities rather than personality traits.",
  },

  // ===================== AGE BIAS =====================
  {
    regex: /\brecentg?(?:ly)?\s+graduate\b/gi,
    label: "Age bias - excludes experienced candidates",
    severity: "high",
    bias: "Age Bias",
    suggestion: "Open to candidates at different career stages",
    explanation:
      "'Recent graduate' discriminates against age and excludes experienced workers. Encourage applications from diverse backgrounds.",
  },
  {
    regex: /\byoung.*(?:talent|professional|energetic|vibrant)\b/gi,
    label: "Age bias - youth requirement",
    severity: "high",
    bias: "Age Bias",
    suggestion: "motivated professional or talented individual",
    explanation:
      "'Young' as a requirement discriminates based on age and excludes older, experienced candidates.",
  },
  {
    regex: /\b\d+[–-]?\d+\s+years?\s+max\b/gi,
    label: "Age bias - experience cap",
    severity: "high",
    bias: "Age Bias",
    suggestion: "X years of experience preferred",
    explanation:
      "Experience caps discriminate against older workers. Allow candidates with more experience to apply.",
  },
  {
    regex: /\bdigital\s+native\b/gi,
    label: "Age bias - generational stereotype",
    severity: "high",
    bias: "Age Bias",
    suggestion: "tech-savvy or proficient with digital tools",
    explanation:
      "'Digital native' is an age/generational stereotype. Describe specific technical skills instead.",
  },
  {
    regex: /\b(?:millennial|Gen\s+Z|Gen\s+X|boomer)\b/gi,
    label: "Generational stereotyping",
    severity: "medium",
    bias: "Age Bias",
    suggestion: "avoid generational labels and describe actual skills needed",
    explanation:
      "Generational labels invite stereotyping. Focus on specific competencies instead.",
  },
  {
    regex: /\bfresh(?:er|man|person)\b/gi,
    label: "Age/experience discrimination",
    severity: "high",
    bias: "Age Bias",
    suggestion: "entry-level candidate",
    explanation:
      "'Fresher' implies age/inexperience and can trigger age discrimination. Use 'entry-level'.",
  },
  {
    regex: /\bright\s+out\s+of\s+school\b/gi,
    label: "Age discrimination",
    severity: "high",
    bias: "Age Bias",
    suggestion: "early-career professional",
    explanation:
      "Implies age requirement. Use 'early-career professional' to focus on experience level.",
  },
  {
    regex: /\bnot\s+(?:too|over)\s+qualified\b/gi,
    label: "Age/experience bias",
    severity: "high",
    bias: "Age Bias",
    suggestion: "remove this phrase and describe the actual role requirements",
    explanation:
      "This discourages experienced candidates. Describe the actual role and let qualified people decide.",
  },

  // ===================== DISABILITY BIAS =====================
  {
    regex: /\b(?:must\s+)?be\s+(?:physically|mentally)?\s*fit\b/gi,
    label: "Disability exclusion",
    severity: "high",
    bias: "Disability Bias",
    suggestion: "Reasonable accommodations available",
    explanation:
      "'Must be fit' excludes people with disabilities. Specify essential job functions and offer accommodations.",
  },
  {
    regex: /\bstrong\s+eyesight\s+required\b/gi,
    label: "Disability exclusion",
    severity: "high",
    bias: "Disability Bias",
    suggestion: "Describe visual requirements and accommodations available",
    explanation:
      "This requirement excludes blind and low-vision employees. Describe what's actually needed and mention accessibility.",
  },
  {
    regex: /\bable-bodied\s+(?:candidate|person|employee)\b/gi,
    label: "Disability exclusion",
    severity: "high",
    bias: "Disability Bias",
    suggestion: "remove this phrase",
    explanation:
      "'Able-bodied' directly excludes people with disabilities. Describe actual job requirements instead.",
  },
  {
    regex: /\bretard(?:ed)?\b/gi,
    label: "Offensive ableist term",
    severity: "high",
    bias: "Disability Bias",
    suggestion: "person with intellectual disability",
    explanation:
      "'Retard' is a slur. Use respectful terminology if discussing disability.",
  },
  {
    regex: /\b(?:dumb|stupid)\b(?!\s+(?:question|mistake))/gi,
    label: "Ableist language",
    severity: "medium",
    bias: "Disability Bias",
    suggestion: "use 'ineffective' or describe the actual issue",
    explanation:
      "'Dumb' perpetuates ableist stereotypes. Use specific, descriptive language.",
  },
  {
    regex: /\blame\b(?!\s+(?:for|them))/gi,
    label: "Ableist language",
    severity: "medium",
    bias: "Disability Bias",
    suggestion: "weak or ineffective",
    explanation:
      "'Lame' is ableist slang. Use descriptive language instead.",
  },
  {
    regex: /\b(?:blind|deaf)\s+(?:to|folded)\b/gi,
    label: "Ableist metaphor",
    severity: "medium",
    bias: "Disability Bias",
    suggestion: "unaware of / ignoring / overlooking",
    explanation:
      "Using disability as metaphor for failure perpetuates negative stereotypes.",
  },
  {
    regex: /\bcrippled\b/gi,
    label: "Outdated/offensive term",
    severity: "high",
    bias: "Disability Bias",
    suggestion: "person with mobility disability",
    explanation:
      "'Crippled' is outdated and dehumanizing. Use person-first or identity-first language respectfully.",
  },
  {
    regex: /\bconfined\s+to\s+(?:a\s+)?wheelchair\b/gi,
    label: "Stigmatizing language",
    severity: "high",
    bias: "Disability Bias",
    suggestion: "uses a wheelchair or wheelchair user",
    explanation:
      "'Confined to' has negative connotations. People who use wheelchairs aren't confined—they're mobile.",
  },
  {
    regex: /\bwheel.?chair\s+bound\b/gi,
    label: "Stigmatizing language",
    severity: "high",
    bias: "Disability Bias",
    suggestion: "wheelchair user",
    explanation:
      "'Wheelchair bound' assumes limitation. 'Wheelchair user' is neutral and respectful.",
  },
  {
    regex: /\bsuffers?\s+from\s+(?:autism|ADHD|epilepsy|diabetes|depression|mental\s+illness)/gi,
    label: "Stigmatizing language",
    severity: "medium",
    bias: "Disability Bias",
    suggestion: "has or person with",
    explanation:
      "'Suffers from' emphasizes pain/suffering. Use 'has' or 'person with' for neutral language.",
  },
  {
    regex: /\bsufferer\s+of\b/gi,
    label: "Stigmatizing language",
    severity: "medium",
    bias: "Disability Bias",
    suggestion: "person with or person who has",
    explanation:
      "'Sufferer' dehumanizes. Use person-centered language.",
  },

  // ===================== CULTURAL / NATIONAL BIAS =====================
  {
    regex: /\bnative\s+(?:English\s+)?speaker\b/gi,
    label: "Cultural bias - language requirement",
    severity: "high",
    bias: "Cultural Bias",
    suggestion: "Proficient in English or fluent in English",
    explanation:
      "'Native speaker' is exclusionary and doesn't reflect actual job requirements. Use 'proficient' or 'fluent'.",
  },
  {
    regex: /\bonly\s+(?:candidates?\s+)?from\s+\w+\b/gi,
    label: "National origin discrimination",
    severity: "high",
    bias: "Cultural Bias",
    suggestion: "remove this restriction unless legally required",
    explanation:
      "Geographic restrictions are discriminatory unless legally necessary. Be open to diverse backgrounds.",
  },
  {
    regex: /\b(?:Indian|Indian\s+candidates|local\s+candidates\s+only)\b/gi,
    label: "National origin discrimination",
    severity: "high",
    bias: "Cultural Bias",
    suggestion: "Open to diverse backgrounds unless legally required",
    explanation:
      "Restricting by nationality or origin is discriminatory and limits your talent pool.",
  },
  {
    regex: /\bWestern\s+(?:mindset|values|background)\b/gi,
    label: "Cultural bias - exclusionary requirement",
    severity: "high",
    bias: "Cultural Bias",
    suggestion: "describe actual values or skills needed",
    explanation:
      "'Western mindset' excludes diverse global perspectives. Describe job-relevant values instead.",
  },
  {
    regex: /\b(?:exotic|foreign)\s+(?:worker|national|candidate)\b/gi,
    label: "Othering language",
    severity: "high",
    bias: "Cultural Bias",
    suggestion: "international professional or specific country name",
    explanation:
      "'Exotic' and 'foreign' create an 'us vs them' dynamic. Use respectful, specific language.",
  },
  {
    regex: /\bfluent\s+in\s+local\s+(?:language|dialect)\b/gi,
    label: "Cultural bias - unclear requirement",
    severity: "medium",
    bias: "Cultural Bias",
    suggestion: "fluent in [specific language] or specify actual communication needs",
    explanation:
      "Be specific about language requirements. 'Local' is vague and can exclude diverse candidates.",
  },

  // ===================== TONE / RESPECTFULNESS =====================
  {
    regex: /\byou\s+(?:failed|forgot|did\s+not|failed\s+to)\b/gi,
    label: "Blame language in tone",
    severity: "high",
    bias: "Tone",
    suggestion: "This task is pending or hasn't been completed yet. Could you please...?",
    explanation:
      "Blame language creates a hostile tone. Use constructive, collaborative language instead.",
  },
  {
    regex: /\b(?:clearly|obviously|should\s+be\s+aware)\b/gi,
    label: "Passive-aggressive tone",
    severity: "medium",
    bias: "Tone",
    suggestion: "remove or rephrase without judgment",
    explanation:
      "Words like 'clearly' or 'obviously' are passive-aggressive and can make people feel excluded.",
  },
  {
    regex: /\b(?:just|simply|merely|just\s+need\s+to)\b/gi,
    label: "Dismissive tone",
    severity: "medium",
    bias: "Tone",
    suggestion: "remove minimizing language",
    explanation:
      "'Just' minimizes effort and can be dismissive. Remove for clearer, respectful communication.",
  },
  {
    regex: /\b(?:you\s+(?:people|guys)|those\s+people)\b/gi,
    label: "Othering language",
    severity: "high",
    bias: "Tone",
    suggestion: "use inclusive language without 'vs them' dynamic",
    explanation:
      "Separating 'you people' from 'us' creates division. Use inclusive language.",
  },
  {
    regex: /\b(?:crazy|insane|mental|psycho)\b/gi,
    label: "Ableist/stigmatizing language in tone",
    severity: "medium",
    bias: "Tone",
    suggestion: "surprising, intense, or use specific descriptive words",
    explanation:
      "Using mental illness as slang is stigmatizing. Use specific, descriptive words.",
  },

  // ===================== ACCESSIBILITY ISSUES =====================
  {
    regex: /^.{500,}/m,
    label: "Dense paragraph - accessibility issue",
    severity: "low",
    bias: "Accessibility",
    suggestion: "Break into shorter paragraphs for better readability",
    explanation:
      "Large blocks of text are harder to read. Break content into shorter, scannable sections.",
  },
  {
    regex: /\b(?:duh|obviously|basically|literally|actually)\b/gi,
    label: "Unnecessary filler word - clarity issue",
    severity: "low",
    bias: "Accessibility",
    suggestion: "remove unnecessary filler word",
    explanation:
      "Filler words can confuse readers and make text harder to follow.",
  },

  // ===================== OVER-QUALIFICATION BARRIERS =====================
  {
    regex: /(?:must\s+)?have\s+(?:all|every)\s+(?:of\s+)?(?:the\s+)?following/gi,
    label: "Over-qualification barrier - all requirements mandatory",
    severity: "high",
    bias: "Over-qualification",
    suggestion:
      'Separate into "Required" and "Nice-to-have". Add: "We encourage you to apply if you meet most of these."',
    explanation:
      "Women and minorities statistically apply only if they meet 100% of requirements. Making all requirements mandatory reduces diversity.",
  },
  {
    regex: /\d{2,}\+?\s+(?:mandatory\s+)?(?:skill|requirement|qualification|bullet)/gi,
    label: "Excessive mandatory requirements",
    severity: "high",
    bias: "Over-qualification",
    suggestion: "Reduce to 5-8 key requirements. Put others in 'nice-to-have' section.",
    explanation:
      "Too many requirements create artificial barriers. Focus on what's critical to job success.",
  },
]
