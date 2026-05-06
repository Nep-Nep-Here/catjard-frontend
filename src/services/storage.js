export function loadState(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveState(key, state) {
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch {}
}

export function removeState(key) {
  try {
    localStorage.removeItem(key);
  } catch {}
}
