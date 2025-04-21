import { useEffect, useState } from "react";
import {
  fetchCourses,
  createPromo,
  deletePromo,
  Course,
} from "../services/api";

export default function Admin() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [codeInput, setCodeInput] = useState<Record<number, string>>({});
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    fetchCourses().then(setCourses);
  }, []);

  /* ── Helpers ─────────────────────────────────────── */
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

  /* ── Render ──────────────────────────────────────── */
  return (
    <div className="container mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold mb-6">Admin Panel</h2>

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
              const expires = promo
                ? new Date(promo.expires_at).toLocaleDateString()
                : null;

              return (
                <tr key={c.id} className="border-b border-white/10">
                  {/* title & price */}
                  <td className="p-3">{c.title}</td>
                  <td className="p-3 whitespace-nowrap">
                    ${c.price.toFixed(2)}
                  </td>

                  {/* active promo */}
                  <td className="p-3 font-mono text-xs">
                    {promo ? `${promo.code} (expires ${expires})` : "—"}
                  </td>

                  {/* actions */}
                  <td className="p-3">
                    {promo ? (
                      <button
                        onClick={() => handleDelete(c)}
                        disabled={busyId === c.id}
                        className="text-red-400 hover:text-red-300 disabled:opacity-50"
                      >
                        ✕ Remove Promo
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
                          + Set 5‑Day Promo
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
    </div>
  );
}
