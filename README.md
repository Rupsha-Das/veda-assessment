# Veda Assessment

Veda Assessment is an AI-assisted teacher workspace for turning a question paper and a handwritten answer sheet into a structured, reviewable assessment.

Upload both documents, let the application extract their contents, and inspect the resulting question-to-answer mapping side by side. Selecting a question focuses the corresponding answer and highlights its exact region on the answer sheet.

## Live demo

[Open the deployed application](https://veda-assessment.vercel.app)

## What it does

- Accepts question papers and answer sheets as PDF, PNG, or JPEG files.
- Extracts questions in their printed order, including labelled sub-parts such as `11 (a)` and `11 (b)`.
- Extracts handwritten answers and maps them to the corresponding questions, including answers written out of order.
- Identifies unanswered questions and answers that cannot be confidently matched.
- Supports answers that continue across multiple pages.
- Displays the question list beside the answer sheet.
- Highlights the precise answer region when a question is selected.
- Can provide marks, correctness, and feedback through AI evaluation when the optional OpenRouter integration is configured.

## How the processing works

1. The teacher uploads a question paper and an answer sheet.
2. Mistral OCR extracts text and page/block coordinates from both files.
3. Questions are normalized into a stable ordered list.
4. Answers are segmented and associated with questions using OpenRouter when available, with a deterministic fallback for resilience.
5. Optional AI evaluation adds marks and feedback per question.
6. The mapping workspace presents the extracted questions, answer status, evaluation, and highlighted answer regions together.

## Tech stack

- Next.js 16 with the App Router
- React 19 and TypeScript
- Tailwind CSS v4 and shadcn/ui components
- Mistral OCR for document text and layout coordinates
- OpenRouter with Gemini for answer segmentation and evaluation
- `react-pdf` for rendering answer-sheet pages

## Getting started

### Prerequisites

- Node.js 20 or later
- npm
- API keys for the AI-powered processing described below

### Install and run locally

```bash
npm install
copy .env.example .env.local
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

On macOS/Linux, use `cp .env.example .env.local` instead of the Windows `copy` command.

## Environment variables

Add the following values to `.env.local`:

```env
# Used for answer segmentation and optional evaluation.
OPENROUTER_API_KEY=your_openrouter_api_key

# Supplies OCR text and page/block coordinates for highlighting.
MISTRAL_API_KEY=your_mistral_api_key

# Optional attribution URL sent to OpenRouter.
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`MISTRAL_API_KEY` is required for document processing. `OPENROUTER_API_KEY` enables AI-assisted segmentation and evaluation; the application falls back to deterministic answer segmentation when it is unavailable or fails.

For production uploads, each file must be smaller than 4 MB. Supported file types are PDF, PNG, and JPEG.

## Available commands

```bash
npm run dev       # Start the development server
npm run build     # Create a production build
npm start         # Start the production server
npm run lint      # Run ESLint
npx tsc --noEmit  # Run TypeScript checks
npx vitest run    # Run the extraction and segmentation tests
```

## Project structure

```text
app/                    Next.js routes and API handlers
components/             Dashboard, upload, extraction, and mapping UI
lib/exam/               Question extraction, answer mapping, and evaluation logic
lib/mistral/            Mistral OCR integration
lib/openrouter/         OpenRouter client and structured AI responses
types/                  Shared assessment and mapping types
data/                   Local mock data used by the interface
docs/spec.md             Assignment specification
```

## Deployment

The application is deployed on Vercel. To deploy your own instance:

1. Import the repository into Vercel.
2. Add `MISTRAL_API_KEY` and `OPENROUTER_API_KEY` as environment variables.
3. Set `NEXT_PUBLIC_APP_URL` to the deployed URL.
4. Deploy using the default Next.js build settings.

## Notes and limitations

- No authentication or database is required; uploaded files and the active assessment session are handled in the browser for this assignment.
- OCR and AI output can require teacher review, especially for difficult handwriting, unusual layouts, or ambiguous numbering.
- Highlighting depends on OCR returning usable page and block coordinates.
- The production upload endpoint enforces the 4 MB per-file limit.
