import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // Browser sendet Basic-Auth-Cookies / Header weiter
});

/* ── Typen ─────────────────────────────────────────── */
export interface PromoCode {
  id: number;
  code: string;
  expires_at: string;
}

export interface Course {
  id: number;
  title: string;
  price: number;
  image_url: string;
  udemy_url: string;
  promo_codes?: PromoCode[];
}

export interface Stat {
  date: string;        // YYYY-MM-DD
  requests: number;
  avg_q_tokens: number;
  avg_a_tokens: number;
  total_tokens: number;
}

/* ── Queries ───────────────────────────────────────── */
export const fetchCourses = () =>
  api.get<Course[]>("/courses").then((r) => r.data);

export const fetchStats = () =>
  api.get<Stat[]>("/stats").then((r) => r.data);

/* ── Promo-Mutationen ─────────────────────────────── */
export const createPromo = (
  courseId: number,
  daysValid: number,
  couponCode?: string
) => {
  const body = new URLSearchParams({
    days_valid: String(daysValid),
    ...(couponCode ? { coupon_code: couponCode } : {}),
  });

  return api.post<PromoCode>(`/courses/${courseId}/promo`, body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
};

export const deletePromo = (courseId: number) =>
  api.delete(`/courses/${courseId}/promo`);

/* ── Chat-Helper ───────────────────────────────────── */
export const newThread = () =>
  api.post("/chat/thread").then((r) => r.data.thread_id);

export const sendMessage = (id: string, message: string) =>
  api
    .post<{ reply: string }>(`/chat/${id}`, { message })
    .then((r) => r.data.reply);
