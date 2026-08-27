import type { ProcessExamResponse } from "@/types/exam";
import type { UploadedFileMeta } from "@/types/mapping";

const DATABASE_NAME = "veda-assessment";
const STORE_NAME = "exam-session";
const SESSION_KEY = "current";
const FALLBACK_STORAGE_KEY = "veda-assessment-exam-session";
const DRAFT_METADATA_KEY = "veda-assessment-uploaded-files";
const DRAFT_COOKIE_KEY = "veda_assessment_uploaded_files";

export type PersistedExamSession = {
  questionPaper: UploadedFileMeta | null;
  answerSheet: UploadedFileMeta | null;
  questionFile: File | null;
  answerFile: File | null;
  examData: ProcessExamResponse | null;
};

type StoredFile = {
  name: string;
  type: string;
  lastModified: number;
  dataUrl: string;
};

type FallbackSession = Omit<PersistedExamSession, "questionFile" | "answerFile"> & {
  questionFile: StoredFile | null;
  answerFile: StoredFile | null;
};

export type DraftMetadata = Pick<PersistedExamSession, "questionPaper" | "answerSheet">;

let saveQueue: Promise<void> = Promise.resolve();

export function saveDraftMetadata(metadata: DraftMetadata) {
  const value = JSON.stringify(metadata);
  try {
    window.localStorage.setItem(DRAFT_METADATA_KEY, value);
  } catch {
    // File persistence below may still work through IndexedDB.
  }
  try {
    document.cookie = `${DRAFT_COOKIE_KEY}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    // Some embedded browsers can disable cookies as well.
  }
}

export function loadDraftMetadata(): DraftMetadata | null {
  try {
    const stored = window.localStorage.getItem(DRAFT_METADATA_KEY);
    if (stored) return JSON.parse(stored) as DraftMetadata;
  } catch {
    // Try the cookie fallback below.
  }

  try {
    const cookie = document.cookie
      .split("; ")
      .find((item) => item.startsWith(`${DRAFT_COOKIE_KEY}=`));
    if (!cookie) return null;
    return JSON.parse(decodeURIComponent(cookie.slice(DRAFT_COOKIE_KEY.length + 1))) as DraftMetadata;
  } catch {
    return null;
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Could not read uploaded file."));
    reader.readAsDataURL(file);
  });
}

async function dataUrlToFile(file: StoredFile) {
  const response = await fetch(file.dataUrl);
  const blob = await response.blob();
  return new File([blob], file.name, { type: file.type || blob.type, lastModified: file.lastModified });
}

async function saveFallbackSession(session: PersistedExamSession) {
  const [questionDataUrl, answerDataUrl] = await Promise.all([
    session.questionFile ? fileToDataUrl(session.questionFile) : Promise.resolve(null),
    session.answerFile ? fileToDataUrl(session.answerFile) : Promise.resolve(null),
  ]);

  const fallbackSession: FallbackSession = {
    questionPaper: session.questionPaper,
    answerSheet: session.answerSheet,
    examData: session.examData,
    questionFile: session.questionFile && questionDataUrl ? {
      name: session.questionFile.name,
      type: session.questionFile.type,
      lastModified: session.questionFile.lastModified,
      dataUrl: questionDataUrl,
    } : null,
    answerFile: session.answerFile && answerDataUrl ? {
      name: session.answerFile.name,
      type: session.answerFile.type,
      lastModified: session.answerFile.lastModified,
      dataUrl: answerDataUrl,
    } : null,
  };

  window.localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(fallbackSession));
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, 1);

    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open session storage."));
  });
}

async function saveExamSessionNow(session: PersistedExamSession) {
  try {
    const database = await openDatabase();

    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      try {
        transaction.objectStore(STORE_NAME).put(session, SESSION_KEY);
      } catch (error) {
        reject(error);
        return;
      }
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Could not save exam session."));
      transaction.onabort = () => reject(transaction.error ?? new Error("Could not save exam session."));
    });

    database.close();
  } catch {
    // The localStorage fallback below still supports browsers with no IndexedDB.
  }

  try {
    await saveFallbackSession(session);
  } catch {
    // Quota or file-read failures should not interrupt a completed process.
  }
}

export function saveExamSession(session: PersistedExamSession) {
  const nextSave = saveQueue.then(() => saveExamSessionNow(session));
  saveQueue = nextSave.catch(() => undefined);
  return nextSave;
}

export async function loadExamSession(): Promise<PersistedExamSession | null> {
  try {
    const database = await openDatabase();

    const session = await new Promise<PersistedExamSession | null>((resolve, reject) => {
      const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(SESSION_KEY);
      request.onsuccess = () => resolve((request.result as PersistedExamSession | undefined) ?? null);
      request.onerror = () => reject(request.error ?? new Error("Could not load exam session."));
    });

    database.close();
    if (session) return session;
  } catch {
    // Try the localStorage fallback below.
  }

  try {
    const stored = window.localStorage.getItem(FALLBACK_STORAGE_KEY);
    if (!stored) return null;

    const fallback = JSON.parse(stored) as FallbackSession;
    const [questionFile, answerFile] = await Promise.all([
      fallback.questionFile ? dataUrlToFile(fallback.questionFile) : Promise.resolve(null),
      fallback.answerFile ? dataUrlToFile(fallback.answerFile) : Promise.resolve(null),
    ]);

    return { ...fallback, questionFile, answerFile };
  } catch {
    return null;
  }
}

export async function clearExamSession() {
  await saveQueue.catch(() => undefined);
  window.localStorage.removeItem(DRAFT_METADATA_KEY);
  window.localStorage.removeItem(FALLBACK_STORAGE_KEY);
  document.cookie = `${DRAFT_COOKIE_KEY}=; path=/; max-age=0; SameSite=Lax`;

  try {
    const database = await openDatabase();

    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      try {
        transaction.objectStore(STORE_NAME).delete(SESSION_KEY);
      } catch (error) {
        reject(error);
        return;
      }
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Could not clear exam session."));
      transaction.onabort = () => reject(transaction.error ?? new Error("Could not clear exam session."));
    });

    database.close();
  } catch {
    // There may be no IndexedDB database to clear.
  }
}
