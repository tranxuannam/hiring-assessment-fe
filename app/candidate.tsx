"use client";

import { useEffect, useState } from "react";
import { api, CandidateAccess, Progress, Question } from "../lib/api";

export default function Candidate() {
  const [token, setToken] = useState("");
  const [activeToken, setActiveToken] = useState("");
  const [candidate, setCandidate] = useState<CandidateAccess | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [position, setPosition] = useState(0);
  const [answer, setAnswer] = useState("");
  const [audio, setAudio] = useState<File | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { const fromLink = new URLSearchParams(window.location.search).get("token"); const saved = fromLink || window.localStorage.getItem("assessment-token"); if (saved) { setToken(saved); load(saved); } }, []);
  async function load(value: string, nextPosition = 0) {
    setError(""); setActiveToken(value); window.localStorage.setItem("assessment-token", value);
    try { const [access, currentProgress] = await Promise.all([api.candidate.access(value), api.candidate.progress(value)]); setCandidate(access); setProgress(currentProgress); const resumePosition = nextPosition === 0 && currentProgress.answered_questions > 0 && currentProgress.answered_questions < currentProgress.total_questions ? currentProgress.answered_questions : nextPosition; const next = Math.min(resumePosition, Math.max(currentProgress.total_questions - 1, 0)); setPosition(next); const item = await api.candidate.question(value, next); setQuestion(item); setAnswer(item.answer_text ?? ""); } catch (e) { setError(e instanceof Error ? e.message : "Unable to open assessment."); }
  }
  async function saveAndNext() {
    if (!question || (!answer.trim() && !audio)) { setError("Please enter a text or audio response before continuing."); return; }
    try { await api.candidate.answer(activeToken, position, answer.trim()); if (audio) await api.candidate.audio(activeToken, position, audio); const updated = await api.candidate.progress(activeToken); setProgress(updated); if (position + 1 < updated.total_questions) await loadQuestion(position + 1); else setNotice("All questions are answered. Review your responses and submit when ready."); } catch (e) { setError(e instanceof Error ? e.message : "Unable to save answer."); }
  }
  async function loadQuestion(next: number) { const item = await api.candidate.question(activeToken, next); setPosition(next); setQuestion(item); setAnswer(item.answer_text ?? ""); setAudio(null); }
  async function submit() { try { const updated = await api.candidate.submit(activeToken); setProgress(updated); setCandidate(candidate ? { ...candidate, submitted: true } : candidate); setNotice("Assessment submitted. Thank you."); } catch (e) { setError(e instanceof Error ? e.message : "Unable to submit assessment."); } }

  if (!activeToken || !candidate) return <section className="hero narrow"><p className="eyebrow">Candidate portal</p><h1>Your perspective matters.</h1><p className="muted">Use the personal assessment link from your invitation to begin or resume.</p><form className="stack" onSubmit={(e) => { e.preventDefault(); load(token.trim()); }}><label>Personal assessment link or token<input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste your token" required /></label><button className="primary" type="submit">Open assessment</button></form>{error && <p className="error">{error}</p>}</section>;
  const percent = progress && progress.total_questions ? Math.round((progress.answered_questions / progress.total_questions) * 100) : 0;
  return <section className="content"><div className="hero"><p className="eyebrow">Candidate portal · {candidate.role_name ?? "Assessment"}</p><h1>Hi, {candidate.full_name.split(" ")[0]}.</h1><p className="muted">Take your time. Your progress is saved as you go.</p></div><div className="progress-row"><div><strong>{progress?.answered_questions ?? 0} of {progress?.total_questions ?? 0}</strong><span> questions answered</span></div><strong>{percent}%</strong></div><div className="progress-track"><div style={{ width: `${percent}%` }} /></div>{candidate.submitted ? <div className="card success"><h2>Assessment submitted</h2><p>We have received your responses. You can close this page.</p></div> : question && <div className="card question-card"><div className="question-number">Question {position + 1} <span>of {progress?.total_questions}</span></div><h2>{question.prompt}</h2><label>Your answer<textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={8} placeholder="Write your response here..." /></label><label className="file-input">Optional audio response<input type="file" accept="audio/*" onChange={(e) => setAudio(e.target.files?.[0] ?? null)} />{audio && <small>{audio.name}</small>}</label><div className="actions"><button className="secondary" disabled={position === 0} onClick={() => loadQuestion(position - 1)}>Back</button>{position + 1 < (progress?.total_questions ?? 0) ? <button className="primary" onClick={saveAndNext}>Save & continue</button> : <button className="primary" onClick={saveAndNext}>Save response</button>}</div>{position + 1 === progress?.total_questions && progress.answered_questions === progress.total_questions && <button className="submit-link" onClick={submit}>Submit assessment</button>}</div>}{notice && <p className="notice">{notice}</p>}{error && <p className="error">{error}</p>}</section>;
}
