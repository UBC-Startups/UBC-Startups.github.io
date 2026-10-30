import type { Metadata } from "next";
import Events from "../../views/Events";

export const metadata: Metadata = { title: "Events | UBC Startups" };
export default function Page() { return <Events />; }
