import type { Metadata } from "next";
import SOAR from "../../../views/SOAR";
import Footer from "../../../home/sections/footer";

export const metadata: Metadata = { title: "SOAR 2026 | UBC Startups" };
export default function Page() { return <SOAR footer={<Footer />} />; }
