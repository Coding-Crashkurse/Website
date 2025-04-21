import { useEffect, useState } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { Course } from "../services/api";
dayjs.extend(duration);

interface Props {
  course: Course;
}

/**
 * Single course tile used on the landing page.
 * – dark glassy background
 * – “SALE” ribbon in the top‑left corner while a promo is active
 * – old price struck‑through, new price highlighted
 * – blue Udemy button that always works with/without coupon
 */
export default function CourseCard({ course }: Props) {
  const promo = course.promo_codes?.[0]; // first (and only) active promo
  const [remaining, setRemaining] = useState("");

  /* live countdown ------------------------------------------------------- */
  useEffect(() => {
    if (!promo) return;
    const id = setInterval(() => {
      const diff = dayjs(promo.expires_at).diff(dayjs());
      setRemaining(dayjs.duration(diff).format("D[d] H[h] m[m] s[s]"));
    }, 1000);
    return () => clearInterval(id);
  }, [promo]);

  return (
    <div
      className="relative rounded-xl border border-white/20 bg-black/30
                    backdrop-blur-md p-4 flex flex-col gap-3"
    >
      {/* red SALE ribbon (only when promo exists) ------------------------- */}
      {promo && (
        <span
          className="absolute -top-2 -left-2 rotate-[-45deg]
                         bg-red-600 text-white text-[11px] font-bold
                         px-3 py-[3px] shadow-md select-none"
        >
          SALE
        </span>
      )}

      {/* course thumbnail ------------------------------------------------- */}
      <img
        src={course.image_url}
        alt={course.title}
        className="rounded-lg aspect-video object-cover"
      />

      {/* title ------------------------------------------------------------ */}
      <h3 className="font-semibold">{course.title}</h3>

      {/* price (old → line‑through, new → bold) --------------------------- */}
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

      {/* promo details (ticket icon + countdown) -------------------------- */}
      {promo && (
        <div className="text-white text-sm flex flex-col gap-[2px]">
          <span>
            🎟️ <b>{promo.code}</b>
          </span>
          <span className="ml-6">ends in {remaining}</span>
        </div>
      )}

      {/* Udemy CTA button ------------------------------------------------- */}
      <a
        href={course.udemy_url + (promo ? `?couponCode=${promo.code}` : "")}
        target="_blank"
        className="mt-auto block bg-[#1e8aff] hover:bg-[#1261c4]
                   text-white py-2 rounded text-center transition-colors"
      >
        View on Udemy
      </a>
    </div>
  );
}
