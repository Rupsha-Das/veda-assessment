import type { ProcessExamResponse } from "@/types/exam";
import type { UploadedFileMeta } from "@/types/mapping";

const DATABASE_NAME = "veda-assessment";
const STORE_NAME = "exam-session";
const SESSION_KEY = "current";
const FALLBACK_STORAGE_KEY = "veda-assessment-exam-session";

export type PersistedExamSession = {
  questionPaper: UploadedFileMeta;
  answerSheet: UploadedFileMeta;
  questionFile: File;
  answerFile: File;
  examData: ProcessExamResponse;
};

type StoredFile = {
  name: string;
  type: string;
  lastModified: number;
  dataUrl: string;
};

type FallbackSession = Omit<PersistedExamSession, "questionFile" | "answerFile"> & {
  questionFile: StoredFile;
  answerFile: StoredFile;
};

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
    fileToDataUrl(session.questionFile),
    fileToDataUrl(session.answerFile),
  ]);

  const fallbackSession: FallbackSession = {
    questionPaper: session.questionPaper,
    answerSheet: session.answerSheet,
    examData: session.examData,
    questionFile: {
      name: session.questionFile.name,
      type: session.questionFile.type,
      lastModified: session.questionFile.lastModified,
      dataUrl: questionDataUrl,
    },
    answerFile: {
      name: session.answerFile.name,
      type: session.answerFile.type,
      lastModified: session.answerFile.lastModified,
      dataUrl: answerDataUrl,
    },
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

export async function saveExamSession(session: PersistedExamSession) {
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
      dataUrlToFile(fallback.questionFile),
      dataUrlToFile(fallback.answerFile),
    ]);

    return { ...fallback, questionFile, answerFile };
  } catch {
    return null;
  }
}

export async function clearExamSession() {
  window.localStorage.removeItem(FALLBACK_STORAGE_KEY);

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
