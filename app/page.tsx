"use client";

import { useState } from "react";
import Candidate from "./candidate";
import HrWorkspace from "./hr";

export default function Home() {
  const [area, setArea] = useState<"candidate" | "hr">("candidate");
  return <main className="shell">
    <header className="topbar"><strong>clarity<span>·</span>assessments</strong><nav><button className={area === "candidate" ? "nav-active" : ""} onClick={() => setArea("candidate")}>Candidate</button><button className={area === "hr" ? "nav-active" : ""} onClick={() => setArea("hr")}>HR workspace</button></nav></header>
    {area === "candidate" ? <Candidate /> : <HrWorkspace />}
  </main>;
}
