"use client";

export default function TeacherIllustration() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Background circles */}
      <div className="absolute size-40 rounded-full bg-[#FFE8DD] md:size-44" />
      <div className="absolute size-32 rounded-full bg-[#FFEEE5] md:size-36" />

      {/* Decorative sparkles */}
      <svg
        viewBox="0 0 24 24"
        className="absolute -right-4 -top-1 size-4 text-orange-400"
        fill="currentColor"
      >
        <path d="M12 2L13.5 9.5L21 12L13.5 14.5L12 22L10.5 14.5L3 12L10.5 9.5L12 2Z" />
      </svg>
      <svg
        viewBox="0 0 16 16"
        className="absolute -left-3 bottom-4 size-3 text-orange-300"
        fill="currentColor"
      >
        <path d="M8 0L9.2 6.8L16 8L9.2 9.2L8 16L6.8 9.2L0 8L6.8 6.8L8 0Z" />
      </svg>
      <svg
        viewBox="0 0 12 12"
        className="absolute right-0 bottom-0 size-2.5 text-orange-300 opacity-60"
        fill="currentColor"
      >
        <path d="M6 0L7 5L12 6L7 7L6 12L5 7L0 6L5 5L6 0Z" />
      </svg>

      {/* Cute cartoon character - Doraemon-style tutor */}
      <svg
        viewBox="0 0 120 120"
        className="relative size-28 md:size-32"
        aria-label="AI Tutor illustration"
      >
        {/* Body */}
        <ellipse cx="60" cy="100" rx="24" ry="14" fill="#2E7D6F" />
        <ellipse cx="60" cy="96" rx="20" ry="11" fill="#3A9A8A" />

        {/* Collar with bell */}
        <rect x="48" y="84" width="24" height="6" rx="3" fill="#FF633D" />
        <circle cx="60" cy="87" r="3" fill="#FFD700" />

        {/* Arms */}
        <ellipse cx="38" cy="92" rx="8" ry="5" fill="#3A9A8A" />
        <ellipse cx="82" cy="92" rx="8" ry="5" fill="#3A9A8A" />

        {/* Hands holding book */}
        <rect x="44" y="94" width="32" height="10" rx="2" fill="#E8E4DC" />
        <rect x="46" y="92" width="28" height="8" rx="1.5" fill="#D4D0C8" />
        <line x1="50" y1="95" x2="70" y2="95" stroke="#B8B4AC" strokeWidth="0.7" />
        <line x1="50" y1="97" x2="66" y2="97" stroke="#B8B4AC" strokeWidth="0.7" />

        {/* Neck */}
        <rect x="54" y="74" width="12" height="12" rx="3" fill="#E8E4DC" />

        {/* Head - big round head for cute look */}
        <circle cx="60" cy="50" r="28" fill="#E8E4DC" />

        {/* Hair - messy/cute style */}
        <path
          d="M32 45 Q35 25 60 20 Q85 25 88 45 Q85 35 75 32 Q65 28 60 30 Q55 28 45 32 Q35 35 32 45"
          fill="#2D1F14"
        />
        <circle cx="45" cy="28" r="5" fill="#2D1F14" />
        <circle cx="60" cy="22" r="6" fill="#2D1F14" />
        <circle cx="75" cy="28" r="5" fill="#2D1F14" />

        {/* Glasses - big round */}
        <circle
          cx="48"
          cy="52"
          r="10"
          fill="white"
          stroke="#4A3728"
          strokeWidth="2"
        />
        <circle
          cx="72"
          cy="52"
          r="10"
          fill="white"
          stroke="#4A3728"
          strokeWidth="2"
        />
        <path d="M58 52 L62 52" stroke="#4A3728" strokeWidth="2" />
        <path d="M38 52 L34 49" stroke="#4A3728" strokeWidth="1.5" />
        <path d="M82 52 L86 49" stroke="#4A3728" strokeWidth="1.5" />

        {/* Eyes - big cute eyes */}
        <circle cx="48" cy="52" r="5" fill="#2D1F14" />
        <circle cx="72" cy="52" r="5" fill="#2D1F14" />
        {/* Eye highlights */}
        <circle cx="50" cy="50" r="2" fill="white" />
        <circle cx="74" cy="50" r="2" fill="white" />
        <circle cx="47" cy="53" r="1" fill="white" />
        <circle cx="71" cy="53" r="1" fill="white" />

        {/* Nose - small round */}
        <circle cx="60" cy="58" r="2.5" fill="#FF8A80" />

        {/* Mouth - big happy smile */}
        <path
          d="M50 64 Q60 72 70 64"
          fill="none"
          stroke="#2D1F14"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Cheek blush */}
        <ellipse cx="36" cy="60" rx="5" ry="3" fill="#FFB088" opacity="0.5" />
        <ellipse cx="84" cy="60" rx="5" ry="3" fill="#FFB088" opacity="0.5" />

        {/* Whiskers - like Doraemon */}
        <line x1="28" y1="56" x2="38" y2="58" stroke="#4A3728" strokeWidth="1" opacity="0.5" />
        <line x1="28" y1="62" x2="38" y2="62" stroke="#4A3728" strokeWidth="1" opacity="0.5" />
        <line x1="82" y1="58" x2="92" y2="56" stroke="#4A3728" strokeWidth="1" opacity="0.5" />
        <line x1="82" y1="62" x2="92" y2="62" stroke="#4A3728" strokeWidth="1" opacity="0.5" />
      </svg>
    </div>
  );
}
