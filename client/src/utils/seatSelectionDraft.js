const STORAGE_KEY = 'skylink_seat_selection_draft';

export function saveSeatSelectionDraft(draft) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function readSeatSelectionDraft() {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearSeatSelectionDraft() {
  sessionStorage.removeItem(STORAGE_KEY);
}
