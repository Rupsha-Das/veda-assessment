import type { MockQuestion } from "@/types/mapping";

export const mockQuestions: MockQuestion[] = [
  {
    id: 1,
    question: "Which blood vessel carries blood away from the heart?",
    status: "mapped",
    confidence: 95,
    score: "2/2",
    answerExcerpt: "Arteries carry oxygenated blood away from the heart.",
    answerRegion: { page: 1, x: 5, y: 3, width: 90, height: 22 },
  },
  {
    id: 2,
    question:
      "Which of the following organelles is primarily involved in photosynthesis?",
    status: "review",
    confidence: 88,
    score: "2/2",
    feedback:
      "Excellent work! You correctly identified the chloroplast as the organelle responsible for photosynthesis. Keep it up!",
    answerExcerpt:
      "Chloroplast is the organelle primarily involved in photosynthesis.",
    answerRegion: { page: 1, x: 5, y: 27, width: 90, height: 22 },
  },
  {
    id: 3,
    question:
      "Explain the role of chloroplasts in photosynthesis, naming the main pigments involved and briefly outlining the two major stages of the process.",
    status: "mapped",
    confidence: 92,
    score: "2/2",
    answerExcerpt:
      "Chloroplasts contain chlorophyll which absorbs light energy. The two stages are light-dependent reactions and the Calvin cycle.",
    answerRegion: { page: 1, x: 5, y: 51, width: 90, height: 20 },
  },
  {
    id: 4,
    question:
      "Describe the flow of blood through the human heart starting from the right atrium and ending at the aorta; include the names of valves crossed.",
    status: "unmapped",
    confidence: 0,
    score: "0/2",
  },
  {
    id: 5,
    question:
      "Draw a labelled diagram of an alveolus showing capillaries and air space. Label alveolar sac, capillary, and direction of gas exchange.",
    status: "mapped",
    confidence: 90,
    score: "2/2",
    answerExcerpt: "[Diagram present on answer sheet]",
    answerRegion: { page: 2, x: 5, y: 3, width: 90, height: 22 },
  },
  {
    id: 6,
    question:
      "Draw a neat labelled diagram of the human digestive system (stomach, small intestine, large intestine, liver, pancreas) and label the site where most absorption occurs.",
    status: "review",
    confidence: 82,
    score: "4/5",
    feedback:
      "Good diagram overall. The labelling of the large intestine and the site of absorption could be more precise. Consider adding the duodenum label.",
    answerExcerpt: "[Diagram present on answer sheet]",
    answerRegion: { page: 2, x: 5, y: 27, width: 90, height: 22 },
  },
  {
    id: 7,
    question:
      "Draw and label a nephron (Bowman's capsule, glomerulus, proximal tubule, loop of Henle, distal tubule, collecting duct).",
    status: "mapped",
    confidence: 94,
    score: "5/5",
    answerExcerpt: "[Diagram present on answer sheet]",
    answerRegion: { page: 2, x: 5, y: 51, width: 90, height: 20 },
  },
  {
    id: 8,
    question:
      "Explain the structural differences between palisade mesophyll and spongy mesophyll and state how each structure aids its function in the leaf.",
    status: "review",
    confidence: 78,
    score: "3/5",
    feedback:
      "The student correctly describes palisade cells as vertically elongated. However, the spongy mesophyll description lacks detail about air spaces and their role in gas exchange.",
    answerExcerpt:
      "Palisade mesophyll: column-shaped cells packed with chloroplasts. Spongy mesophyll: loosely arranged with air spaces.",
    answerRegion: { page: 3, x: 5, y: 3, width: 90, height: 20 },
  },
  {
    id: 9,
    question:
      "Describe the process of transpiration in plants in two to three sentences and name two environmental factors that increase its rate.",
    status: "mapped",
    confidence: 93,
    score: "5/5",
    answerExcerpt:
      "Transpiration is the loss of water vapour from leaves through stomata. Factors: high temperature, wind, low humidity.",
    answerRegion: { page: 3, x: 5, y: 25, width: 90, height: 20 },
  },
  {
    id: 10,
    question:
      "Explain how the structure of xylem vessels facilitates water transport in plants (mention one structural feature and its role).",
    status: "review",
    confidence: 80,
    score: "4/5",
    feedback:
      "Good mention of lignified walls. Could also mention the narrow lumen that helps in capillary action and the dead cells that allow unobstructed flow.",
    answerExcerpt:
      "Xylem vessels have lignified walls that provide mechanical support and prevent collapse under tension.",
    answerRegion: { page: 3, x: 5, y: 47, width: 90, height: 20 },
  },
  {
    id: 11,
    question:
      "A diagram shows two potted plants \u2014 Plant A in bright light with green leaves, Plant B kept in dim light with pale, elongated leaves.",
    status: "mapped",
    confidence: 91,
    score: "2/2",
    answerExcerpt:
      "Plant B shows etiolation due to lack of light for chlorophyll synthesis.",
    answerRegion: { page: 3, x: 5, y: 69, width: 90, height: 18 },
  },
  {
    id: 12,
    question:
      "A resting person has tidal volume per breath of 0.5 L and breathes 12 times per minute.",
    status: "review",
    confidence: 75,
    score: "4/5",
    feedback:
      "The calculation is mostly correct. The student should explicitly state the formula: TV x RR = Minute ventilation.",
    answerExcerpt: "Minute ventilation = 0.5 x 12 = 6 L/min",
    answerRegion: { page: 4, x: 5, y: 3, width: 90, height: 20 },
  },
];

export function getTotalScore(): string {
  let earned = 0;
  let total = 0;
  for (const q of mockQuestions) {
    if (q.score) {
      const [e, t] = q.score.split("/").map(Number);
      earned += e;
      total += t;
    }
  }
  return `${earned}/${total}`;
}
