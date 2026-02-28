export default function Library() {
  const LIBRARY: Record<string, string[]> = {
    "General Inclusive Terms": [
      "everyone",
      "people",
      "individuals",
      "community",
      "team",
      "colleagues",
      "workforce",
      "staff",
      "users",
    ],

    "Gender-Neutral Language": [
      "they",
      "them",
      "theirs",
      "partner",
      "spouse",
      "chair",
      "chairperson",
      "staff member",
      "firefighter",
      "police officer",
      "server",
      "representative",
    ],

    "Gender Identity": [
      "gender",
      "gender identity",
      "non-binary",
      "trans person",
      "transgender",
      "gender-neutral",
      "gender-diverse",
    ],

    "Age-Inclusive Terms": [
      "older people",
      "young people",
      "young adults",
      "early-career professional",
      "experienced professional",
      "later-career professional",
    ],

    "Disability-Inclusive Terms": [
      "person with a disability",
      "person without a disability",
      "person with a learning difficulty",
      "person of restricted growth",
      "wheelchair user",
      "people who are deaf",
      "people who are hard of hearing",
      "people who are blind",
      "people who are visually impaired",
    ],

    "Accessibility Terms": [
      "accessible",
      "inclusive design",
      "accessible content",
      "accessible building",
      "accessible parking",
      "reasonable adjustments",
    ],

    "Mental Health Terms": [
      "mental health",
      "mental wellbeing",
      "person experiencing anxiety",
      "person living with depression",
      "emotional wellbeing",
    ],

    "Sexual Orientation Terms": [
      "sexual orientation",
      "gay",
      "lesbian",
      "bisexual",
      "heterosexual",
      "straight",
      "asexual",
    ],

    "Family & Relationships": [
      "partner",
      "spouse",
      "parent",
      "carer",
      "accompanying person",
      "guardian",
    ],

    "Race & Ethnicity Terms": [
      "minority ethnic groups",
      "under-represented ethnic groups",
      "Black",
      "Black British",
      "Asian",
      "Asian British",
      "mixed race",
      "mixed heritage",
    ],

    "Religion or Belief": [
      "religion or belief",
      "Muslim community",
      "Christian community",
      "Jewish community",
      "Hindu community",
      "Sikh community",
    ],

    "Pregnancy & Parenthood": [
      "pregnant people",
      "expectant parents",
      "new parents",
      "birth parent",
    ],

    "Marriage & Civil Partnership": [
      "relationship status",
      "marital status",
      "civil partnership",
      "civil partner",
    ],

    "Titles & Forms of Address": [
      "Dr",
      "Prof",
      "Mr",
      "Mrs",
      "Ms",
      "Mx",
      "Imam",
      "Rabbi",
      "Rev",
      "Sir",
      "Dame",
    ],

    "Form & Data Collection Terms": [
      "prefer not to say",
      "self-describe",
      "optional",
      "not disclosed",
    ],
  }

  return (
    <div className="p-6 overflow-y-auto text-white">
      <h1 className="text-2xl font-bold mb-2">
        Inclusive Language Library
      </h1>

      <p className="text-neutral-400 mb-6">
        Reference guide to inclusive, respectful, and
        accessible language. Use these terms to
        communicate more thoughtfully.
      </p>

      <div className="space-y-8">
        {Object.entries(LIBRARY).map(
          ([category, terms]) => (
            <section key={category}>
              <h2 className="text-lg font-semibold mb-3">
                {category}
              </h2>

              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                {terms.map(term => (
                  <li
                    key={term}
                    className="bg-neutral-900 border border-neutral-800 rounded px-3 py-2"
                  >
                    ✅ {term}
                  </li>
                ))}
              </ul>
            </section>
          )
        )}
      </div>
    </div>
  )
}