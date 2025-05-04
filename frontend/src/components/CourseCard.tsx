import { useEffect, useState } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import utc from "dayjs/plugin/utc";          // ➊ UTC-Plugin
import { Course } from "../services/api";

dayjs.extend(duration);
dayjs.extend(utc);                           // ➋ aktivieren

interface Props {
  course: Course;
}

/**
 * Single course tile (landing page).
 * – dark, glassy card
 * – SALE ribbon while promo is active
 * – strikethrough old price, highlight promo price
 */
export default function CourseCard({ course }: Props) {
  const promo = course.promo_codes?.[0];                 // first (only) promo
  const [remaining, setRemaining] = useState("");

  /* live countdown --------------------------------------------------- */
  useEffect(() => {
    if (!promo) return;

    const interval = setInterval(() => {
      // ➌ Zeitstempel explizit als UTC interpretieren
      const diff = dayjs.utc(promo.expires_at).diff(dayjs());
      setRemaining(dayjs.duration(diff).format("D[d] H[h] m[m] s[s]"));
    }, 1000);

    return () => clearInterval(interval);
  }, [promo]);

  return (
    <div className="relative rounded-xl border border-white/20 bg-black/30 backdrop-blur-md p-4 flex flex-col gap-3">
      {promo && (
        <span className="absolute -top-2 -left-2 rotate-[-45deg] bg-red-600 text-white text-[11px] font-bold px-3 py-[3px] shadow-md">
          SALE
        </span>
      )}

      <img
        src={course.image_url}
        alt={course.title}
        className="rounded-lg aspect-video object-cover"
      />

      <h3 className="font-semibold">{course.title}</h3>

      {promo ? (
        <p>
          <span className="line-through text-gray-300 mr-1">
            ${course.price.toFixed(2)}
          </span>
          <span className="font-semibold">$9.99</span>
        </p>
      ) : (
        <p>${course.price.toFixed(2)}</p>
      )}

      {promo && (
        <div className="text-white text-sm flex flex-col gap-[2px]">
          <span>🎟️ <b>{promo.code}</b></span>
          <span className="ml-6">ends in {remaining}</span>
        </div>
      )}

      <a
        href={course.udemy_url + (promo ? `?couponCode=${promo.code}` : "")}
        target="_blank"
        className="mt-auto block bg-[#1e8aff] hover:bg-[#1261c4] text-white py-2 rounded text-center transition-colors"
      >
        View on Udemy
      </a>
    </div>
  );
}
