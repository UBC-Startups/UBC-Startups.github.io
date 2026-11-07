// Copy for the CaseHack event page, taken from the Figma design
// (UBC Startups Club → "EVENT DETAIL — CaseHack"). Edit details here, not in JSX.

export const casehack = {
  hero: {
    eyebrow: "UBC STARTUPS PRESENTS",
    titleTop: "CASE",
    titleBottom: "HACK",
    tagline: "48 HOURS / ONE REAL-WORLD CHALLENGE",
    facts: ["NOV 27–29, 2026", "UBC VANCOUVER", "16–20 TEAMS", "FREE FOR ALL UBC STUDENTS"],
    chart: {
      title: "IDEA → STRATEGY → PROTOTYPE → VALUE",
      bars: [
        { label: "FRAME", height: 56, tone: "dim" },
        { label: "DESIGN", height: 96, tone: "dim" },
        { label: "BUILD", height: 136, tone: "mint" },
        { label: "PITCH", height: 176, tone: "bright" },
      ],
      kpis: [
        { label: "TEAMS", value: "16–20" },
        { label: "HOURS", value: "48" },
        { label: "ELIGIBLE", value: "ALL TEAMS", small: true },
      ],
    },
  },

  strategy: {
    headingTop: "Think like a strategist.",
    headingBottom: "Build like a founder.",
    intro: "CaseHack sits between a case competition and a hackathon. You'll need a business argument and something you built to back it up.",
    steps: [
      { step: "01 / FRAME", title: "The problem", description: "Pull apart the case and find the real question." },
      { step: "02 / DESIGN", title: "The model", description: "Sketch the business: customer, value, how it makes money." },
      { step: "03 / BUILD", title: "The proof", description: "Prototype the thing that makes your case believable." },
      { step: "04 / PITCH", title: "The pitch", description: "Five minutes to convince the judges." },
    ],
  },

  welcome: {
    paragraphs: [
      "CaseHack is UBC Startups' flagship innovation competition. Students from business, computer science, engineering and design work in interdisciplinary teams to solve a real-world challenge by developing both a business solution and a prototype.",
      "The case stays locked until Friday night. You'll form a team, get time with mentors who've built companies, and pitch what you made to a panel of judges on Sunday. You don't need an idea or a team going in.",
    ],
    details: [
      { label: "FORMAT", value: "Challenge drop, team formation, mentor check-ins, prototyping, final pitches, awards" },
      { label: "WHO IT'S FOR", value: "Business, Computer Science, Engineering and Design students interested in startups and building products" },
    ],
  },

  hackathon: {
    paragraphs: [
      "A hackathon is a short, intense event where small teams build something from scratch. You get a problem, a deadline and people to help, and at the end every team shows what they made.",
      "CaseHack adds a case competition on top. Alongside your prototype, you'll pitch the business behind it, which is why every team mixes business, CS, engineering and design.",
    ],
    roles: [
      { label: "BIZ", caption: "STRATEGY", tone: "mint" },
      { label: "CS", caption: "CODE", tone: "bright" },
      { label: "ENG", caption: "SYSTEMS", tone: "dim" },
      { label: "DESIGN", caption: "UX + STORY", tone: "outline" },
    ],
  },

  prizes: {
    intro: "At CaseHack, our goal is to celebrate both learning and innovation. There's one prize category this year, and every team is eligible, whether it's your first hackathon or your tenth.",
    items: [{
      label: "PRIZE / OVERALL",
      title: "Overall Prize",
      description: "Open to all teams. Recognizes the projects that best show innovation, execution and impact across all submissions.",
      eligibility: "OPEN TO ALL TEAMS",
    }],
  },

  faq: [
    { question: "Do I need a team or an idea?", answer: "No. Most people come solo. Team formation happens right after the challenge drops, and you'll leave Friday night with a group of 4–6." },
    { question: "Do I need to know how to code?", answer: "No. Teams need business, design and technical people. If you don't build, you'll be framing the case, researching or leading the pitch." },
    { question: "Is it really 48 hours straight?", answer: "The venue closes overnight, so you won't be sleeping on campus. Most teams keep working remotely between checkpoints." },
    { question: "What should I bring?", answer: "A laptop, a charger and whatever you need to build. Food is covered all three days." },
    { question: "Can non-UBC students join?", answer: "CaseHack is open to UBC students. Mentors and judges come from across Vancouver's startup scene." },
  ],

  registration: {
    status: "OPEN",
    rows: [
      { label: "DATE", value: "Fri Nov 27 – Sun Nov 29, 2026" },
      { label: "TIME", value: "Fri 5:30 PM to Sun 5:00 PM" },
      { label: "LOCATION", value: "UBC Vancouver · room shared after sign-up" },
      { label: "TEAMS", value: "4–6 people · 16–20 teams" },
      { label: "COST", value: "Free for all UBC students" },
    ],
    // Placeholder numbers from the Figma mockup. Update with real counts or remove.
    capacity: { taken: 84, total: 120 },
    deadline: "REGISTRATION CLOSES NOV 20",
    // TODO: add the real sign-up link (e.g. a Luma URL). Until then the
    // sign-up buttons render as "coming soon" instead of linking nowhere.
    signUpUrl: undefined as string | undefined,
    soloNote: {
      title: "> COMING SOLO?",
      body: "Most people do. Team formation happens right after the challenge drops on Friday.",
    },
  },

  calendar: {
    title: "CaseHack — UBC Startups",
    start: "20261127T173000",
    end: "20261129T170000",
    timeZone: "America/Vancouver",
    location: "UBC Vancouver",
  },

  sponsors: [
    { tier: "TITLE SPONSOR", slots: 1, size: "lg" },
    { tier: "GOLD", slots: 3, size: "md" },
    { tier: "COMMUNITY PARTNERS", slots: 5, size: "sm" },
  ],

  // Short blurbs for the "Next events" list; dates and titles come from data/events.js.
  upNext: [
    { slug: "launchlink", blurb: "Meet startups hiring for internships, co-op and full-time roles." },
    { slug: "capital-connect", blurb: "Meet VCs, angels and founders without the pressure." },
    { slug: "soar", blurb: "Our flagship pitch competition, in front of investors." },
  ],
} as const;

export type CaseHackTone = "dim" | "mint" | "bright" | "outline";