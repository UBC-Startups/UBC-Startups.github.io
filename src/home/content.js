// Homepage copy and data. Edit content here; layout lives in ./sections.
import { teamSections } from "../data/team";
import { figma } from "./theme";

import linde from "../images/partnerPhotos/linde.jpeg";
import teadot from "../images/partnerPhotos/teadot.png";
import bonMacaron from "../images/partnerPhotos/bonMacaron.png";
import rumble from "../images/partnerPhotos/rumble.png";
import kernels from "../images/partnerPhotos/kernels.png";
import formationStudio from "../images/partnerPhotos/formationStudio.png";

import liftoff from "../images/eventPhotos/liftoff.jpg";
import soar1 from "../images/eventPhotos/soar1.jpg";
import batterUp from "../images/eventPhotos/batterup_team.JPG";
import liftoffAbout from "../images/eventPhotos/liftoff_about1.jpg";
import liftoffEvents from "../images/eventPhotos/liftoff_events.jpg";
import liftoffActivity from "../images/eventPhotos/liftoff_activity.jpg";
import foundersCirclePoster from "../images/eventPhotos/founders_circle_poster.jpeg";

export const links = {
  instagram: "https://www.instagram.com/ubcstartups/",
  linkedin: "https://www.linkedin.com/company/ubc-startups/",
  discord: "https://discord.gg/6HEmMc2mCh",
  email: "mailto:ubcstartups@gmail.com",
};

// `to` = react-router route, `hash` = section on the homepage
export const navLinks = [
  { label: "Home", to: "/" },
  { label: "About Us", hash: "/#aboutUs" },
  { label: "Events", to: "/events" },
  { label: "Team", to: "/meetOurTeam" },
  { label: "FAQ", hash: "/#faq" },
];

// `x` = position along the hero arrow (0–1), measured from Figma.
export const timeline = [
  { name: "Founder’s Circle", date: "Sept. 24th", x: 0.1158, side: "above" },
  { name: "Pitch & Propel", date: "Oct 29th", x: 0.2551, side: "below" },
  { name: "CaseHack", date: "Nov 27-28", x: 0.3942, side: "above" },
  { name: "LaunchLink", date: "Jan 14", x: 0.5428, side: "below" },
  { name: "Capital Connect", date: "Feb 25", x: 0.6858, side: "above" },
  { name: "SOAR", date: "March 21", x: 0.8717, side: "below" },
];

export const featuredEvent = {
  status: "Upcoming · Sept 24",
  title: ["Founder’s", "Circle"],
  blurb: "Our kickoff: hear from founders, meet students & alumni.",
  image: foundersCirclePoster,
  to: "/event-poster/foundher-2026",
};

export const partners = [
  { name: "Linde Equity", logo: linde, width: 170, height: 30 },
  { name: "Teadot", logo: teadot, width: 150, height: 72 },
  { name: "Bon Macaron", logo: bonMacaron, width: 72, height: 72 },
  { name: "Rumble", logo: rumble, width: 108, height: 72 },
  { name: "Kernels", logo: kernels, width: 150, height: 64 },
  { name: "Formation Studio", logo: formationStudio, width: 110, height: 72 },
];

export const about = {
  label: "About us",
  title: "Building a startup ecosystem on campus",
  body: "Our mission is to equip students, alumni, and faculty with the resources, network, and support needed to turn innovative ideas into successful ventures. With a strong focus on interdisciplinary collaboration, we bring together individuals from diverse backgrounds to learn, connect, and grow as entrepreneurs. Through workshops, events, and mentorship opportunities, UBC Startups provides a comprehensive ecosystem that empowers UBC's entrepreneurial community to take their ideas to the next level.",
  photos: [
    { src: liftoff, alt: "LiftOff event" },
    { src: soar1, alt: "SOAR pitch competition" },
    { src: batterUp, alt: "Batter Up team" },
    { src: liftoffAbout, alt: "LiftOff attendees" },
    { src: liftoffEvents, alt: "LiftOff event space" },
    { src: liftoffActivity, alt: "LiftOff activity" },
  ],
};

export const stats = [
  { value: "15+", label: "Events" },
  { value: "$12,000+", label: "Prizes Awarded" },
  { value: "15+", label: "Partners" },
];

export const programs = [
  {
    name: "Networking",
    number: "01",
    dots: figma("program-dots-networking.svg"),
    from: "#dd3322",
    to: "#000000",
    body: "We offer dynamic and inclusive networking events to connect entrepreneurs, investors, and industry experts. Whether you're looking to pitch your startup, find a co-founder, or simply meet like-minded individuals, we have something for everyone.",
  },
  {
    name: "Workshops",
    number: "02",
    dots: figma("program-dots-workshops.svg"),
    from: "#ff5a1f",
    to: "#1a1a1a",
    body: "We offer workshops with experienced mentors who guide you through the startup journey, such as pitching workshops, pitch competitions, and startup fundamentals sessions. Whether you're refining an idea or getting ready to launch, you'll walk away with practical skills and the confidence to make it happen.",
  },
  {
    name: "Resources",
    number: "03",
    dots: figma("program-dots-resources.svg"),
    from: "#88dcbe",
    to: "#1a1a1a",
    body: "We offer and promote a variety of resources for aspiring entrepreneurs to help turn their ideas into reality! Follow us on Instagram or join our Discord community of aspiring and like-minded entrepreneurs. We're here to help you and your dreams!",
  },
];

export const values = [
  {
    name: "Boldness",
    body: "We embrace risk, break patterns, and back creativity without apology.",
    icon: figma("value-icon-boldness.svg"),
    iconSize: { active: [26.918, 36], idle: [17.945, 24] },
    dot: figma("value-dot-boldness.svg"),
    accent: "linear-gradient(#dd3322, #000000)",
    circle: "linear-gradient(#dd3322 0%, #dd3322 40%, #63170f 100%)",
  },
  {
    name: "Growth",
    body: "We learn fast, grow faster, and build the confidence to shape our own path.",
    icon: figma("value-icon-growth.svg"),
    iconSize: { active: [32.4, 36], idle: [21.6, 24] },
    dot: figma("value-dot-growth.svg"),
    accent: "linear-gradient(#88dcbe, #1a1a1a)",
    circle: "linear-gradient(#88dcbe 0%, #88dcbe 40%, #3d6356 100%)",
  },
  {
    name: "Community",
    body: "We are a welcoming home for students and founders to connect and belong.",
    icon: figma("value-icon-community.svg"),
    iconSize: { active: [34.569, 36], idle: [23.046, 24] },
    dot: figma("value-dot-community.svg"),
    accent: "linear-gradient(#ff5a1f, #1a1a1a)",
    circle: "linear-gradient(#ff5a1f 0%, #ff5a1f 40%, #73290e 100%)",
  },
  {
    name: "Exclusivity",
    body: "We curate rare, intentional experiences that make members feel special.",
    icon: figma("value-icon-exclusivity.svg"),
    iconSize: { active: [34.94, 36], idle: [23.293, 24] },
    dot: figma("value-dot-exclusivity.svg"),
    accent: "linear-gradient(#484848, #0a0a0a)",
    circle: "linear-gradient(#606060 0%, #606060 40%, #181818 100%)",
  },
];

// Everyone on the current roster who has a photo, in roster order (Leadership first).
export const team = teamSections.flatMap((s) => s.members).filter((m) => m.image);

// Answers carried over from the current site's FAQ.
export const faqs = [
  {
    q: "What is UBC Startups?",
    a: "UBC Startups is a student-run organization that connects UBC students with startup opportunities, resources, and a supportive entrepreneurial community.",
  },
  {
    q: "How can I join UBC Startups?",
    a: "You can join by attending our events, signing up for our newsletter, or applying for our membership program. Check our website for upcoming recruitment periods.",
  },
  {
    q: "Do I need to have a startup idea to join?",
    a: "No! We welcome students at all stages of their entrepreneurial journey, whether you have an idea or are just curious about startups.",
  },
  {
    q: "What kind of events do you host?",
    a: "We host workshops, networking events, pitch competitions, speaker series with successful entrepreneurs, and social gatherings for our community.",
  },
  { q: "Is there a membership fee?", a: "All of our events are free for UBC students!" },
  {
    q: "Can I get funding for my startup idea?",
    a: "Yes! We host pitch competitions including SOAR, our flagship event with a $10,000 prize pool. We also connect students with accelerators and investor networks to help secure additional funding opportunities.",
  },
];
