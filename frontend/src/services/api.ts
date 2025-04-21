import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // keeps Basic‑Auth cookie
});

/* ── Types ─────────────────────────────────────────── */
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

/* ── Queries ───────────────────────────────────────── */
export const fetchCourses = () =>
  api.get<Course[]>("/courses").then((r) => r.data);

/* ── Promo Mutations ──────────────────────────────── */
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

/* ── Chat helpers ─────────────────────────────────── */
export const newThread = () =>
  api.post("/chat/thread").then((r) => r.data.thread_id);

export const sendMessage = (id: string, message: string) =>
  api
    .post<{ reply: string }>(`/chat/${id}`, { message })
    .then((r) => r.data.reply);
