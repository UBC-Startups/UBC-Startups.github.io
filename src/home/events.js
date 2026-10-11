// 2026–27 event lineup for the Events page (Figma: EVENTS PAGE).
// `signup` can be an external URL (Luma, Google Forms) or a site route like "/event-poster/soar-2026".
// Events without a `signup` link show no button until one is added.

const red = ["#dd3322", "#000000"];
const orange = ["#ff5a1f", "#1a1a1a"];
const green = ["#88dcbe", "#1a1a1a"];

export const terms = [
  {
    name: "Term 1",
    range: "September to November 2026",
    events: [
      {
        number: "01",
        name: "Founder's Circle",
        date: "Sep 24",
        year: "2026",
        gradient: red,
        tags: [],
        description:
          "Founder’s Circle UBC is UBC Startups' kickoff networking event for the year. It brings together students, founders, alumni, faculty, and members of the UBC entrepreneurship community to meet, exchange ideas, and build new connections.",
        details: {
          Duration: "2 hours",
          Expected: "60–70 attendees",
          Format: "Networking mixer with icebreakers and conversation prompts",
          "Who it's for":
            "Students interested in entrepreneurship, founders, alumni, faculty, and campus entrepreneurship organizations.",
        },
        signup: "https://luma.com/r54t2zy9",
      },
      {
        number: "02",
        name: "Intern Info Session: Diagram Ventures | UBC Startups",
        date: "Oct 15",
        year: "2026",
        gradient: orange,
        tags: ["Virtual"],
        description:
          "Diagram is looking for its Summer 2027 intern class in Toronto or Montreal to help de-risk startup ideas across its venture builder and venture investor teams. UBC students are invited to connect with the Diagram team for a virtual info session and learn how to approach the application.",
        details: {
          Duration: "To be announced",
          Expected: "To be announced",
          Format: "Virtual info session and Q&A",
          "Who it's for": "UBC students interested in Summer 2027 internships in Toronto or Montreal.",
        },
        signup: "https://luma.com/we9e417e",
      },
      {
        number: "03",
        name: "Pitch & Propel",
        date: "Oct 29",
        year: "2026",
        gradient: orange,
        tags: [],
        description:
          "Pitch & Propel is a two-part event that helps students develop and present startup ideas. It begins with a short workshop covering startup fundamentals, pitching, and idea validation, followed by elevator-style pitches where participants present either their own idea or respond to a prompt.",
        highlight:
          "The elevator pitch: you get 60–90 seconds, about the length of an elevator ride, to pitch your own idea or one from a prompt. Mentors give 1–2 minutes of live feedback after each ride.",
        details: {
          Duration: "2.5–3 hours",
          Expected: "80–90 attendees",
          Format: "Workshop, pitch prep, elevator pitches, feedback, networking",
          "Who it's for":
            "Students interested in startups, first-time founders, and anyone looking to improve their pitching skills.",
        },
        signup: null, // TODO: sign-up link
      },
      {
        number: "04",
        name: "CaseHack",
        date: "Nov 28–29",
        year: "2026",
        gradient: green,
        tags: ["Flagship", "New"],
        description:
          "CaseHack is UBC Startups' flagship innovation competition. Students from business, computer science, engineering, and design work in interdisciplinary teams to solve a real-world challenge by developing both a business solution and a prototype.",
        details: {
          Duration: "One day or weekend",
          Expected: "90–120 attendees (16–20 teams)",
          Format: "Challenge reveal, team formation, mentorship, prototyping, final pitches, awards",
          "Who it's for":
            "Business, Computer Science, Engineering, and Design students interested in startups, innovation, and product development.",
        },
        signup: null, // TODO: sign-up link
      },
    ],
  },
  {
    name: "Term 2",
    range: "January to March 2027",
    events: [
      {
        number: "05",
        name: "LaunchLink",
        date: "Jan 14",
        year: "2027",
        gradient: red,
        tags: [],
        description:
          "LaunchLink is a career-focused networking event that connects students with startups, scale-ups, and local businesses looking for emerging talent. Unlike a traditional career fair, the focus is on meaningful conversations, learning about startup careers, and exploring internship, co-op, and full-time opportunities.",
        details: {
          Duration: "2–3 hours",
          Expected: "60–80 attendees",
          Format: "Opening remarks, company intros, open networking, career advice stations",
          "Who it's for":
            "Students seeking internships, co-op, or full-time opportunities in startups and innovation-focused companies.",
        },
        signup: null, // TODO: sign-up link
      },
      {
        number: "06",
        name: "Capital Connect",
        date: "Feb 25",
        year: "2027",
        gradient: orange,
        tags: [],
        description:
          "Capital Connect is a networking event that brings together venture capitalists, angel investors, founders, and students interested in entrepreneurship. The goal is to make funding and investing more approachable while helping students build relationships with people in Vancouver's startup ecosystem.",
        details: {
          Duration: "2–2.5 hours",
          Expected: "50–60 attendees",
          Format: "Icebreaker game, panel or fireside chat, open networking",
          "Who it's for":
            "Students interested in startups, venture capital, investing, and entrepreneurship, plus founders looking to grow their network.",
        },
        signup: null, // TODO: sign-up link
      },
      {
        number: "07",
        name: "SOAR",
        date: "Mar 21",
        year: "2027",
        gradient: green,
        tags: ["Flagship"],
        description:
          "SOAR is UBC Startups' flagship annual pitch competition, bringing together the university's top student founders to showcase their ventures in front of investors, founders, and industry leaders.",
        details: {
          Duration: "Full day",
          Expected: "100–120 attendees",
          Format: "Opening ceremony, pitch sessions, judge Q&A, networking, awards",
          "Who it's for":
            "Student founders, aspiring entrepreneurs, investors, industry professionals, alumni, faculty, and the broader startup ecosystem.",
        },
        signup: "/event-poster/soar-2026",
      },
    ],
  },
];
