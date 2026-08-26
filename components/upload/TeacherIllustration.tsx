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

      {/* Teacher character - cute face */}
      <svg
        viewBox="0 0 120 120"
        className="relative size-28 md:size-32"
        aria-label="AI Teacher illustration"
      >
        {/* Body */}
        <ellipse cx="60" cy="102" rx="26" ry="16" fill="#2F7068" />
        <ellipse cx="60" cy="97" rx="22" ry="12" fill="#38847A" />

        {/* Collar / neckline */}
        <path d="M48 84 Q60 80 72 84 L72 92 Q60 88 48 92 Z" fill="#38847A" />

        {/* Dupatta stripes */}
        <path
          d="M46 80 Q48 92 44 107"
          stroke="#FF633D"
          strokeWidth="2.5"
          fill="none"
          opacity="0.85"
        />
        <path
          d="M74 80 Q72 92 76 107"
          stroke="#FF633D"
          strokeWidth="2.5"
          fill="none"
          opacity="0.85"
        />

        {/* Neck */}
        <rect x="55" y="70" width="10" height="10" rx="2" fill="#D4A574" />

        {/* Head - rounder for cuteness */}
        <ellipse cx="60" cy="52" rx="20" ry="22" fill="#F5CBA7" />

        {/* Hair */}
        <ellipse cx="60" cy="42" rx="22" ry="18" fill="#2D1F14" />
        <ellipse cx="60" cy="36" rx="16" ry="12" fill="#2D1F14" />
        {/* Bun */}
        <circle cx="60" cy="24" r="9" fill="#2D1F14" />

        {/* Glasses - bigger, rounder for cute look */}
        <circle
          cx="50"
          cy="54"
          r="8"
          fill="white"
          stroke="#4A3728"
          strokeWidth="1.8"
        />
        <circle
          cx="70"
          cy="54"
          r="8"
          fill="white"
          stroke="#4A3728"
          strokeWidth="1.8"
        />
        <path d="M58 54 L62 54" stroke="#4A3728" strokeWidth="1.8" />
        <path d="M42 54 L38 51" stroke="#4A3728" strokeWidth="1.2" />
        <path d="M78 54 L82 51" stroke="#4A3728" strokeWidth="1.2" />

        {/* Eyes - bigger, cuter with highlights */}
        <circle cx="50" cy="54" r="3.5" fill="#2D1F14" />
        <circle cx="70" cy="54" r="3.5" fill="#2D1F14" />
        <circle cx="51.5" cy="52.5" r="1.2" fill="white" />
        <circle cx="71.5" cy="52.5" r="1.2" fill="white" />

        {/* Eyebrows - soft弧形 */}
        <path
          d="M44 46 Q50 43 56 46"
          fill="none"
          stroke="#2D1F14"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M64 46 Q70 43 76 46"
          fill="none"
          stroke="#2D1F14"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Bindi */}
        <circle cx="60" cy="44" r="1.8" fill="#FF633D" />

        {/* Nose - tiny */}
        <path
          d="M58 58 Q60 60 62 58"
          fill="none"
          stroke="#C4956A"
          strokeWidth="1"
          strokeLinecap="round"
        />

        {/* Smile - cute, curved */}
        <path
          d="M52 63 Q60 69 68 63"
          fill="none"
          stroke="#2D1F14"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Cheek blush */}
        <ellipse cx="40" cy="60" rx="4" ry="2.5" fill="#FFB088" opacity="0.4" />
        <ellipse cx="80" cy="60" rx="4" ry="2.5" fill="#FFB088" opacity="0.4" />

        {/* Earrings */}
        <circle cx="38" cy="56" r="2" fill="#FFB088" />
        <circle cx="82" cy="56" r="2" fill="#FFB088" />

        {/* Book/Tablet in hands */}
        <rect x="42" y="90" width="36" height="8" rx="2" fill="#E8E4DC" />
        <rect x="44" y="88" width="32" height="6" rx="1" fill="#D4D0C8" />
        <line x1="48" y1="91" x2="72" y2="91" stroke="#B8B4AC" strokeWidth="0.8" />
        <line x1="48" y1="93" x2="68" y2="93" stroke="#B8B4AC" strokeWidth="0.8" />
      </svg>
    </div>
  );
}
