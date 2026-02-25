const SESSION_HISTORY_KEY = "learning_app_session_history";
const MAX_ITEMS = 20;

const canUseStorage = () => typeof window !== "undefined";

export const getSessionHistoryIds = (): string[] => {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(SESSION_HISTORY_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
};

export const pushSessionHistoryId = (sessionId: string) => {
  if (!canUseStorage() || !sessionId.trim()) {
    return;
  }

  const current = getSessionHistoryIds();
  const deduped = [sessionId, ...current.filter((id) => id !== sessionId)].slice(
    0,
    MAX_ITEMS,
  );
  window.localStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(deduped));
};
