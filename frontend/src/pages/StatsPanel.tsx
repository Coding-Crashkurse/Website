import { useEffect, useState } from "react";
import { fetchStats, Stat } from "../services/api";

export default function StatsPanel() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-6">Loading stats…</p>;

  return (
    <div className="overflow-x-auto rounded-xl bg-black/40 backdrop-blur-md mt-10">
      <table className="w-full text-left text-sm">
        <thead className="uppercase text-gray-400 text-xs border-b border-white/20">
          <tr>
            <th className="p-3">Date</th>
            <th className="p-3">Requests</th>
            <th className="p-3">Ø Q-Tokens</th>
            <th className="p-3">Ø A-Tokens</th>
            <th className="p-3">Total Tokens</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((s) => (
            <tr key={s.date} className="border-b border-white/10">
              <td className="p-3 whitespace-nowrap">{s.date}</td>
              <td className="p-3">{s.requests}</td>
              <td className="p-3">{s.avg_q_tokens.toFixed(1)}</td>
              <td className="p-3">{s.avg_a_tokens.toFixed(1)}</td>
              <td className="p-3">{s.total_tokens}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
