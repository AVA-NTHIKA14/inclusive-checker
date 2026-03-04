import { useState } from "react"

type PromptTemplate = {
  key: string
  label: string
  text: string
}

type GuidanceItem = {
  title: string
  description: string
}

type PairItem = {
  avoid: string
  prefer: string
  why: string
}

export default function Library() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const PROMPT_TEMPLATES: PromptTemplate[] = [
    {
      key: "general",
      label: "General Prompt",
      text: "Analyze this content for basic inclusive language issues. Flag exclusionary words, biased phrasing, and unclear accessibility wording.",
    },
    {
      key: "job",
      label: "Job Post Prompt",
      text: "Analyze the job description for hiring bias, gender-coded language, age discrimination, disability exclusion, and unrealistic requirements.",
    },
    {
      key: "email",
      label: "Email Prompt",
      text: "Analyze this email for tone, professionalism, respectful wording, and inclusive communication.",
    },
    {
      key: "slack",
      label: "Slack / Chat Prompt",
      text: "Analyze this chat message for casual language risks, including microaggressions, sarcasm, ableist slang, and dismissive tone.",
    },
    {
      key: "policy",
      label: "Policy Prompt",
      text: "Check this policy document for gender-neutral language, binary gender assumptions, accessibility gaps, nationality restrictions, and outdated titles.",
    },
  ]

  const WHY_IT_MATTERS: GuidanceItem[] = [
    {
      title: "Belonging",
      description: "Inclusive language helps people feel respected and represented in workplace communication.",
    },
    {
      title: "Fair Access",
      description: "Neutral wording reduces hidden barriers in hiring, reviews, policy communication, and daily collaboration.",
    },
    {
      title: "Culture and Trust",
      description: "Respectful language strengthens team trust and improves communication quality across different backgrounds.",
    },
    {
      title: "Risk Reduction",
      description: "Inclusive, precise language helps reduce legal and reputational risk in official and public content.",
    },
  ]

  const PRINCIPLES: GuidanceItem[] = [
    {
      title: "Put People First",
      description: "Describe people with respect and avoid reducing someone to one trait, diagnosis, identity, or stereotype.",
    },
    {
      title: "Be Specific",
      description: "Describe the exact skill or requirement. Avoid vague coded terms like aggressive, native, or culture fit.",
    },
    {
      title: "Avoid Assumptions",
      description: "Do not assume gender, age, ability, religion, nationality, or family structure in broad communication.",
    },
    {
      title: "Write for Clarity",
      description: "Plain language, shorter sentences, and clear structure make content more accessible for everyone.",
    },
  ]

  const AVOID_PREFER: PairItem[] = [
    {
      avoid: "guys",
      prefer: "everyone, team, all",
      why: "Gender-neutral group terms include more people.",
    },
    {
      avoid: "chairman",
      prefer: "chairperson, chair",
      why: "Role titles should not imply one gender.",
    },
    {
      avoid: "native English speaker",
      prefer: "fluent in English",
      why: "This focuses on ability rather than origin.",
    },
    {
      avoid: "young and energetic",
      prefer: "motivated and proactive",
      why: "Age-coded language can discourage qualified candidates.",
    },
    {
      avoid: "must be able-bodied",
      prefer: "essential tasks listed, accommodations available",
      why: "State role needs without excluding people with disabilities.",
    },
    {
      avoid: "you failed to provide this",
      prefer: "this is still pending, please share when possible",
      why: "Respectful tone improves outcomes and accountability.",
    },
  ]

  const LIBRARY: Record<string, string[]> = {
    "General Inclusive Terms": ["everyone", "people", "individuals", "community", "team", "colleagues", "workforce", "staff", "users"],
    "Gender-Neutral Language": ["they", "them", "their", "partner", "spouse", "chairperson", "staff member", "firefighter", "police officer", "representative"],
    "Age-Inclusive Language": ["early-career professional", "experienced professional", "later-career professional", "professionals at different career stages"],
    "Disability-Inclusive Language": ["person with a disability", "wheelchair user", "person with low vision", "person who is deaf", "person who is hard of hearing"],
    "Accessibility Language": ["accessible", "inclusive design", "plain language", "captions available", "alt text included", "reasonable accommodations"],
    "Race and Ethnicity Language": ["under-represented communities", "people of diverse backgrounds", "specific community names when context requires"],
    "Religion and Belief Language": ["religion or belief", "faith community", "religious accommodation"],
    "Family and Caregiving Language": ["parent", "guardian", "caregiver", "partner", "family member"],
    "Data Collection Language": ["prefer not to say", "self-describe", "optional", "not disclosed"],
  }

  const fallbackCopy = (value: string) => {
    const el = document.createElement("textarea")
    el.value = value
    el.setAttribute("readonly", "true")
    el.style.position = "absolute"
    el.style.left = "-9999px"
    document.body.appendChild(el)
    el.select()
    document.execCommand("copy")
    document.body.removeChild(el)
  }

  const handleCopy = async (key: string, text: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        fallbackCopy(text)
      }
      setCopiedKey(key)
      window.setTimeout(() => setCopiedKey(null), 1200)
    } catch {
      fallbackCopy(text)
      setCopiedKey(key)
      window.setTimeout(() => setCopiedKey(null), 1200)
    }
  }

  return (
    <div className="p-6 overflow-y-auto text-white">
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Inclusive Language Library</h1>
        <p className="text-neutral-300 max-w-3xl">
          A practical reference for writing language that is respectful, clear, and accessible.
          Use it to improve job posts, emails, chat messages, and policy documents.
        </p>
      </section>

      <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        {WHY_IT_MATTERS.map(item => (
          <article key={item.title} className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
            <h2 className="text-lg font-semibold mb-1">{item.title}</h2>
            <p className="text-sm text-neutral-300">{item.description}</p>
          </article>
        ))}
      </section>

      <section className="mb-8 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
        <h2 className="text-2xl font-bold mb-3">Core Principles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PRINCIPLES.map(item => (
            <div key={item.title} className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3">
              <h3 className="font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-neutral-300">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
        <h2 className="text-2xl font-bold mb-1">Context Prompt Templates</h2>
        <p className="text-neutral-300 mb-5">
          Use these tab-specific prompts so each context gives distinct analysis.
        </p>

        <div className="space-y-4">
          {PROMPT_TEMPLATES.map(template => (
            <div key={template.key}>
              <h3 className="text-lg font-semibold mb-2">{template.label}</h3>
              <div className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-3 flex items-start gap-3">
                <p className="text-sm leading-relaxed text-neutral-200 flex-1">
                  {template.text}
                </p>
                <button
                  onClick={() => handleCopy(template.key, template.text)}
                  className="shrink-0 text-xs px-3 py-1.5 rounded border border-neutral-600 bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
                  aria-label={`Copy ${template.label}`}
                  title={`Copy ${template.label}`}
                >
                  {copiedKey === template.key ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
        <h2 className="text-2xl font-bold mb-3">Avoid vs Prefer</h2>
        <p className="text-neutral-300 mb-4">
          Common replacements that improve inclusivity without changing intent.
        </p>

        <div className="space-y-3">
          {AVOID_PREFER.map(item => (
            <div key={item.avoid} className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                <div>
                  <div className="text-xs uppercase tracking-wide text-neutral-400 mb-1">Avoid</div>
                  <div className="text-sm text-red-300">{item.avoid}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-neutral-400 mb-1">Prefer</div>
                  <div className="text-sm text-green-300">{item.prefer}</div>
                </div>
              </div>
              <div className="text-sm text-neutral-300">{item.why}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3">Reference Terms by Category</h2>
        <p className="text-neutral-300 mb-6">
          Use these terms as a starting point and adapt to context.
        </p>
      </section>

      <div className="space-y-6">
        {Object.entries(LIBRARY).map(([category, terms]) => (
          <section key={category} className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4">
            <h2 className="text-lg font-semibold mb-3">{category}</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              {terms.map(term => (
                <li key={term} className="bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-neutral-200">
                  {term}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
