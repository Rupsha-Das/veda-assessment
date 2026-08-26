"use client";

const LinedBg = {
  backgroundImage:
    "repeating-linear-gradient(transparent 0 25px, #e0dcd4 25px 26px)",
  backgroundPosition: "0 44px",
};

const pages: Record<number, React.ReactNode> = {
  1: (
    <div
      className="relative h-full w-full font-handwriting text-[17px] leading-[26px]"
      style={{ backgroundColor: "#fcfbf7", color: "#2b3a8f" }}
    >
      <div className="absolute inset-0" style={LinedBg} />
      <div className="relative h-full pl-10 pr-8 pt-10">
        <p className="text-[15px] font-semibold" style={{ color: "#5a6ab8" }}>
          Q1.
        </p>
        <p className="mt-1 font-semibold">
          Photosynthesis is the process used by green plants and some other
          organisms to convert light energy into chemical energy.
        </p>

        <div
          className="my-3 rounded-lg border border-dashed p-3 text-center"
          style={{
            borderColor: "#c8c4bc",
            backgroundColor: "rgba(255,255,255,0.6)",
          }}
        >
          <p className="text-[19px] font-semibold tracking-wide">
            6CO&#8322; + 6H&#8322;O{" "}
            <span style={{ color: "#5a6ab8" }}>
              &mdash;Chlorophyll&rarr;
            </span>{" "}
            C&#8326;H&#8322;O&#8326; + 6O&#8322;
          </p>
        </div>

        <svg
          viewBox="0 0 320 180"
          className="mx-auto mt-2 w-[280px]"
          aria-hidden="true"
        >
          <circle cx="260" cy="40" r="24" fill="#FFB74D" opacity="0.7" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line
              key={a}
              x1={260 + Math.cos((a * Math.PI) / 180) * 30}
              y1={40 + Math.sin((a * Math.PI) / 180) * 30}
              x2={260 + Math.cos((a * Math.PI) / 180) * 44}
              y2={40 + Math.sin((a * Math.PI) / 180) * 44}
              stroke="#FFB74D"
              strokeWidth="2.5"
              opacity="0.5"
            />
          ))}
          <text
            x="260"
            y="45"
            textAnchor="middle"
            fontSize="11"
            fill="#E65100"
            fontWeight="500"
          >
            Sunlight
          </text>

          <line
            x1="225"
            y1="55"
            x2="165"
            y2="75"
            stroke="#5a6ab8"
            strokeWidth="1.2"
            markerEnd="url(#arrowB)"
          />

          <line
            x1="40"
            y1="110"
            x2="100"
            y2="110"
            stroke="#5a6ab8"
            strokeWidth="1.2"
            markerEnd="url(#arrowB)"
          />
          <text x="20" y="105" fontSize="11" fill="#5a6ab8" fontWeight="500">
            Carbon
          </text>
          <text x="28" y="118" fontSize="11" fill="#5a6ab8" fontWeight="500">
            dioxide
          </text>

          <line
            x1="170"
            y1="110"
            x2="240"
            y2="110"
            stroke="#5a6ab8"
            strokeWidth="1.2"
            markerEnd="url(#arrowB)"
          />
          <text x="250" y="105" fontSize="11" fill="#5a6ab8" fontWeight="500">
            Oxygen
          </text>

          <line
            x1="135"
            y1="155"
            x2="135"
            y2="100"
            stroke="#4CAF50"
            strokeWidth="3"
          />
          <ellipse cx="120" cy="90" rx="22" ry="12" fill="#66BB6A" opacity="0.7" />
          <ellipse cx="150" cy="90" rx="22" ry="12" fill="#66BB6A" opacity="0.7" />
          <ellipse cx="125" cy="108" rx="18" ry="10" fill="#81C784" opacity="0.6" />
          <ellipse cx="145" cy="108" rx="18" ry="10" fill="#81C784" opacity="0.6" />

          <line
            x1="135"
            y1="165"
            x2="135"
            y2="155"
            stroke="#5a6ab8"
            strokeWidth="1.2"
          />
          <text x="105" y="175" fontSize="11" fill="#5a6ab8" fontWeight="500">
            Water
          </text>

          <defs>
            <marker
              id="arrowB"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#5a6ab8" />
            </marker>
          </defs>
        </svg>

        <p className="mt-4 text-[15px] font-semibold" style={{ color: "#5a6ab8" }}>
          Q2.
        </p>
        <p className="mt-1 font-semibold">
          The process mainly occurs in the chloroplast of the plant cell. It has
          two main stages:
        </p>
        <ol className="mt-1 list-inside list-decimal text-[16px]" style={{ color: "#5a6ab8" }}>
          <li>Light reaction &mdash; Captures light energy.</li>
          <li>Dark reaction &mdash; Uses energy to make glucose.</li>
        </ol>
      </div>
    </div>
  ),
  2: (
    <div
      className="relative h-full w-full font-handwriting text-[17px] leading-[26px]"
      style={{ backgroundColor: "#fcfbf7", color: "#2b3a8f" }}
    >
      <div className="absolute inset-0" style={LinedBg} />
      <div className="relative h-full pl-10 pr-8 pt-10">
        <p className="text-[15px] font-semibold" style={{ color: "#5a6ab8" }}>
          Q3.
        </p>
        <p className="mt-1 font-semibold">
          Chloroplasts contain chlorophyll which absorbs light energy. The two
          stages are light-dependent reactions and the Calvin cycle.
        </p>

        <p className="mt-5 text-[15px] font-semibold" style={{ color: "#5a6ab8" }}>
          Q5.
        </p>
        <p className="mt-1 font-semibold">
          Alveolus diagram showing capillaries and air space with gas exchange
          arrows.
        </p>
        <svg
          viewBox="0 0 200 100"
          className="mt-2 w-[180px]"
          aria-hidden="true"
        >
          <ellipse
            cx="100"
            cy="50"
            rx="80"
            ry="35"
            fill="#FFECB3"
            stroke="#FFB74D"
            strokeWidth="1"
          />
          <text
            x="100"
            y="45"
            textAnchor="middle"
            fontSize="9"
            fill="#2b3a8f"
          >
            Alveolus
          </text>
          <text
            x="100"
            y="58"
            textAnchor="middle"
            fontSize="8"
            fill="#5a6ab8"
          >
            Air space
          </text>
          <defs>
            <marker
              id="arr2"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#5a6ab8" />
            </marker>
          </defs>
          <line
            x1="30"
            y1="50"
            x2="15"
            y2="50"
            stroke="#5a6ab8"
            strokeWidth="0.8"
            markerEnd="url(#arr2)"
          />
          <line
            x1="170"
            y1="50"
            x2="185"
            y2="50"
            stroke="#5a6ab8"
            strokeWidth="0.8"
            markerEnd="url(#arr2)"
          />
        </svg>

        <p className="mt-5 text-[15px] font-semibold" style={{ color: "#5a6ab8" }}>
          Q6.
        </p>
        <p className="mt-1 font-semibold">
          Human digestive system: stomach, small intestine, large intestine,
          liver, pancreas labelled.
        </p>

        <p className="mt-5 text-[15px] font-semibold" style={{ color: "#5a6ab8" }}>
          Q7.
        </p>
        <p className="mt-1 font-semibold">
          Nephron diagram: Bowman&apos;s capsule, glomerulus, proximal tubule,
          loop of Henle, distal tubule, collecting duct.
        </p>
      </div>
    </div>
  ),
  3: (
    <div
      className="relative h-full w-full font-handwriting text-[17px] leading-[26px]"
      style={{ backgroundColor: "#fcfbf7", color: "#2b3a8f" }}
    >
      <div className="absolute inset-0" style={LinedBg} />
      <div className="relative h-full pl-10 pr-8 pt-10">
        <p className="text-[15px] font-semibold" style={{ color: "#5a6ab8" }}>
          Q8.
        </p>
        <p className="mt-1 font-semibold">
          Palisade mesophyll: column-shaped cells packed with chloroplasts for
          maximum photosynthesis.
        </p>
        <p className="mt-1 font-semibold">
          Spongy mesophyll: loosely arranged with air spaces for gas exchange.
        </p>

        <p className="mt-5 text-[15px] font-semibold" style={{ color: "#5a6ab8" }}>
          Q9.
        </p>
        <p className="mt-1 font-semibold">
          Transpiration is the loss of water vapour from leaves through stomata.
          Factors: high temperature, wind.
        </p>

        <p className="mt-5 text-[15px] font-semibold" style={{ color: "#5a6ab8" }}>
          Q10.
        </p>
        <p className="mt-1 font-semibold">
          Xylem vessels have lignified walls that provide mechanical support and
          prevent collapse under tension.
        </p>

        <p className="mt-5 text-[15px] font-semibold" style={{ color: "#5a6ab8" }}>
          Q11.
        </p>
        <p className="mt-1 font-semibold">
          Plant B shows etiolation due to lack of light for chlorophyll
          synthesis.
        </p>
      </div>
    </div>
  ),
  4: (
    <div
      className="relative h-full w-full font-handwriting text-[17px] leading-[26px]"
      style={{ backgroundColor: "#fcfbf7", color: "#2b3a8f" }}
    >
      <div className="absolute inset-0" style={LinedBg} />
      <div className="relative h-full pl-10 pr-8 pt-10">
        <p className="text-[15px] font-semibold" style={{ color: "#5a6ab8" }}>
          Q12.
        </p>
        <p className="mt-1 font-semibold">
          Minute ventilation = TV x RR = 0.5 x 12 = 6 L/min
        </p>

        <p className="mt-5 text-[15px] font-semibold" style={{ color: "#5a6ab8" }}>
          Additional Notes
        </p>
        <div className="mt-4 space-y-3 text-[16px]" style={{ color: "#5a6ab8" }}>
          <p>&#8226; C&#8341; plants vs C&#8343; plants</p>
          <p>&#8226; CAM photosynthesis in succulents</p>
          <p>&#8226; Photorespiration and its effects</p>
        </div>
      </div>
    </div>
  ),
};

interface AnswerSheetPageProps {
  pageNumber: number;
}

export default function AnswerSheetPage({ pageNumber }: AnswerSheetPageProps) {
  return pages[pageNumber] ?? pages[1];
}
