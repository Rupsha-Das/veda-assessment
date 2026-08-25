"use client";

export default function TeacherIllustration() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Decorative circles */}
      <div className="absolute size-44 rounded-full bg-[#FFE8DD] md:size-48" />
      <div className="absolute size-36 rounded-full bg-[#FFEEE5] md:size-40" />

      {/* Decorative dots */}
      <div className="absolute -left-4 top-4 size-2 rounded-full bg-orange-300 opacity-60" />
      <div className="absolute -right-2 top-8 size-1.5 rounded-full bg-orange-400 opacity-50" />
      <div className="absolute -bottom-2 left-8 size-2 rounded-full bg-orange-300 opacity-40" />

      {/* Small sparkle top-right */}
      <svg
        viewBox="0 0 24 24"
        className="absolute -right-6 top-0 size-5 text-orange-400"
        fill="currentColor"
      >
        <path d="M12 2L13.5 9.5L21 12L13.5 14.5L12 22L10.5 14.5L3 12L10.5 9.5L12 2Z" />
      </svg>

      {/* Small sparkle bottom-left */}
      <svg
        viewBox="0 0 16 16"
        className="absolute -left-6 bottom-2 size-3.5 text-orange-300"
        fill="currentColor"
      >
        <path d="M8 0L9.2 6.8L16 8L9.2 9.2L8 16L6.8 9.2L0 8L6.8 6.8L8 0Z" />
      </svg>

      {/* Teacher character */}
      <svg
        viewBox="0 0 120 120"
        className="relative size-28 md:size-32"
        aria-label="AI Teacher illustration"
      >
        {/* Body */}
        <ellipse cx="60" cy="100" rx="28" ry="18" fill="#2F7068" />
        <ellipse cx="60" cy="95" rx="24" ry="14" fill="#38847A" />

        {/* Collar / neckline */}
        <path d="M48 82 Q60 78 72 82 L72 90 Q60 86 48 90 Z" fill="#38847A" />

        {/* Dupatta stripes */}
        <path
          d="M46 78 Q48 90 44 105"
          stroke="#FF633D"
          strokeWidth="2.5"
          fill="none"
          opacity="0.85"
        />
        <path
          d="M74 78 Q72 90 76 105"
          stroke="#FF633D"
          strokeWidth="2.5"
          fill="none"
          opacity="0.85"
        />

        {/* Neck */}
        <rect x="55" y="68" width="10" height="10" rx="2" fill="#D4A574" />

        {/* Head */}
        <ellipse cx="60" cy="52" rx="18" ry="20" fill="#D4A574" />

        {/* Hair */}
        <ellipse cx="60" cy="44" rx="20" ry="16" fill="#2D1F14" />
        <ellipse cx="60" cy="38" rx="14" ry="10" fill="#2D1F14" />
        {/* Bun */}
        <circle cx="60" cy="28" r="8" fill="#2D1F14" />

        {/* Glasses */}
        <circle
          cx="52"
          cy="53"
          r="6"
          fill="none"
          stroke="#4A3728"
          strokeWidth="1.5"
        />
        <circle
          cx="68"
          cy="53"
          r="6"
          fill="none"
          stroke="#4A3728"
          strokeWidth="1.5"
        />
        <path d="M58 53 L62 53" stroke="#4A3728" strokeWidth="1.5" />
        <path d="M46 53 L42 50" stroke="#4A3728" strokeWidth="1.2" />
        <path d="M74 53 L78 50" stroke="#4A3728" strokeWidth="1.2" />

        {/* Eyes */}
        <circle cx="52" cy="53" r="2" fill="#2D1F14" />
        <circle cx="68" cy="53" r="2" fill="#2D1F14" />

        {/* Bindi */}
        <circle cx="60" cy="44" r="1.5" fill="#FF633D" />

        {/* Smile */}
        <path
          d="M54 60 Q60 65 66 60"
          fill="none"
          stroke="#2D1F14"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Earrings */}
        <circle cx="42" cy="54" r="1.5" fill="#FFB088" />
        <circle cx="78" cy="54" r="1.5" fill="#FFB088" />

        {/* Book/Tablet in hands */}
        <rect x="42" y="88" width="36" height="8" rx="2" fill="#E8E4DC" />
        <rect x="44" y="86" width="32" height="6" rx="1" fill="#D4D0C8" />
        <line x1="48" y1="89" x2="72" y2="89" stroke="#B8B4AC" strokeWidth="0.8" />
        <line x1="48" y1="91" x2="68" y2="91" stroke="#B8B4AC" strokeWidth="0.8" />
      </svg>
    </div>
  );
}
