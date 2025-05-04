import { useEffect, useState } from "react";
import {
  fetchCourses,
  createPromo,
  deletePromo,
  Course,
} from "../services/api";
import StatsPanel from "./StatsPanel";

/* ───────────── Helper ──────────────────────────────────────────── */
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

/** formatiert ein Rest-Intervall wie “4 d 21 h 59 m 36 s” */
function humanDiff(ms: number) {
  if (ms <= 0) return "expired";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${d}d ${h}h ${m}m ${sec}s`;
}

/* ───────────── Component ───────────────────────────────────────── */
export default function AdminPanel() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [codeInput, setCodeInput] = useState<Record<number, string>>({});
  const [busyId, setBusyId] = useState<number | null>(null);
  const [now, setNow] = useState<number>(Date.now()); // für Live-Countdown

  /* initiale Daten laden */
  useEffect(() => {
    fetchCourses().then(setCourses);
  }, []);

  /* jede Sekunde neu rendern, damit der Countdown tickt */
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(id);
  }, []);

  const refresh = async () => setCourses(await fetchCourses());

  async function handleCreate(course: Course) {
    const code = codeInput[course.id]?.trim();
    if (!code) return;

    setBusyId(course.id);
    try {
      await createPromo(course.id, 5, code);
      await refresh();
      setCodeInput((c) => ({ ...c, [course.id]: "" }));
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(course: Course) {
    if (!course.promo_codes?.length) return;

    setBusyId(course.id);
    try {
      await deletePromo(course.id);
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  /* ───────────── Render ───────────────────────────────────────── */
  return (
    <div className="container mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold mb-6">Admin Panel</h2>

      {/* Promo-Verwaltung */}
      <div className="overflow-x-auto rounded-xl bg-black/40 backdrop-blur-md">
        <table className="w-full text-left text-sm">
          <thead className="uppercase text-gray-400 text-xs border-b border-white/20">
            <tr>
              <th className="p-3">Course</th>
              <th className="p-3 w-24">Price</th>
              <th className="p-3">Active Promo</th>
              <th className="p-3 w-60">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => {
              const promo = c.promo_codes?.[0];

              /* +2 h Offset exakt hier */
              const adjustedExpiry = promo
                ? new Date(new Date(promo.expires_at).getTime() + TWO_HOURS_MS)
                : null;

              const absolute = adjustedExpiry
                ? adjustedExpiry.toLocaleDateString()
                : "";

              const relative = adjustedExpiry
                ? humanDiff(adjustedExpiry.getTime() - now)
                : "";

              return (
                <tr key={c.id} className="border-b border-white/10">
                  {/* Title + Price */}
                  <td className="p-3">{c.title}</td>
                  <td className="p-3 whitespace-nowrap">${c.price.toFixed(2)}</td>

                  {/* Aktive Promo */}
                  <td className="p-3 text-xs">
                    {promo ? (
                      <div className="space-y-0.5 font-mono">
                        <span className="inline-flex items-center gap-1">
                          <span className="text-red-400">🎟️</span>
                          <b>{promo.code}</b>
                        </span>
                        <div className="text-gray-300">
                          ends&nbsp;in&nbsp;{relative}
                          <br />
                          (expires&nbsp;{absolute})
                        </div>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>

                  {/* Aktionen */}
                  <td className="p-3">
                    {promo ? (
                      <button
                        onClick={() => handleDelete(c)}
                        disabled={busyId === c.id}
                        className="text-red-400 hover:text-red-300 disabled:opacity-50"
                      >
                        ✕ Remove Promo
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          value={codeInput[c.id] ?? ""}
                          onChange={(e) =>
                            setCodeInput((s) => ({
                              ...s,
                              [c.id]: e.target.value,
                            }))
                          }
                          placeholder="Coupon code"
                          className="flex-1 bg-transparent border border-white/20 rounded px-2 py-1 text-xs"
                        />
                        <button
                          onClick={() => handleCreate(c)}
                          disabled={!codeInput[c.id]?.trim() || busyId === c.id}
                          className="text-primary hover:underline disabled:opacity-50"
                        >
                          + Set 5-Day Promo
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Chat-Statistiken */}
      <StatsPanel />
    </div>
  );
}
