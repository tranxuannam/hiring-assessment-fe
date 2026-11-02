const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit, token?: string): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (token) headers.set("X-HR-Mock-Token", token);
  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail ?? "Something went wrong. Please try again.");
  }
  return response.json() as Promise<T>;
}

export type Progress = { answered_questions: number; total_questions: number; submitted: boolean };
export type CandidateAccess = { candidate_id: string; full_name: string; role_name: string | null; submitted: boolean };
export type Question = { id: string; position: number; prompt: string; answer_text: string | null; has_audio: boolean; submitted: boolean };
export type CandidateSummary = { id: string; full_name: string; email: string; role_name: string | null; submitted: boolean };
export type HrAnswer = {
  answer_id: string; question_id: string; question: string; answer_text: string; has_audio: boolean;
  suggested_score: number | null; suggested_reason: string | null; final_score: number | null;
  override_reason: string | null; scoring_status: "queued" | "processing" | "scored" | "failed" | "needs_human" | null;
  scoring_error: string | null;
};

export const api = {
  candidate: {
    access: (token: string) => request<CandidateAccess>(`/candidate/${encodeURIComponent(token)}`),
    progress: (token: string) => request<Progress>(`/candidate/${encodeURIComponent(token)}/progress`),
    question: (token: string, position: number) => request<Question>(`/candidate/${encodeURIComponent(token)}/questions/${position}`),
    answer: (token: string, position: number, answer_text: string) => request(`/candidate/${encodeURIComponent(token)}/questions/${position}/answer`, { method: "PUT", body: JSON.stringify({ answer_text }) }),
    audio: (token: string, position: number, audio: File) => request(`/candidate/${encodeURIComponent(token)}/questions/${position}/audio`, { method: "POST", body: (() => { const data = new FormData(); data.append("audio", audio); return data; })() }),
    submit: (token: string) => request<Progress>(`/candidate/${encodeURIComponent(token)}/submit`, { method: "POST" }),
  },
  hr: {
    signIn: (label: string) => request<{ token: string; warning: string }>("/hr/mock-sign-in", { method: "POST", body: JSON.stringify({ label }) }),
    candidates: (token: string) => request<Record<string, CandidateSummary[]>>("/hr/candidates", undefined, token),
    answers: (id: string, token: string) => request<HrAnswer[]>(`/hr/candidates/${id}/answers`, undefined, token),
    override: (id: string, score: number, reason: string, token: string) => request<HrAnswer>(`/hr/answers/${id}/override`, { method: "POST", body: JSON.stringify({ score, reason }) }, token),
    retry: (id: string, token: string) => request(`/scoring/answers/${id}/retry`, { method: "POST" }, token),
  },
};
