// Progress store: earned trophies live in localStorage under one key, so
// ticks survive reloads. Export writes them to a JSON file; import reads
// one back. Nothing leaves the browser.
export const STORE_KEY = 'leonida-platinum-progress-v1';

// A fixed demo set for screenshots: 13 earned trophies, a plausible spread
// across story, activities and collectibles. Only used when the page is
// opened with ?demo=13.
export const DEMO_IDS = [2, 3, 15, 16, 19, 21, 28, 33, 35, 42, 46, 52, 53];

export function loadEarned() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((name) => typeof name === 'string'));
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  localStorage.setItem(STORE_KEY, JSON.stringify([...earned]));
}

export function demoEarned(trophies) {
  const wanted = new Set(DEMO_IDS);
  return new Set(trophies.filter((t) => wanted.has(t.id)).map((t) => t.name));
}

export function exportEarned(earned) {
  const payload = JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned] }, null, 2);
  const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'gta6-trophy-progress.json';
  link.click();
  URL.revokeObjectURL(url);
}

export async function importEarnedFile(file, knownNames) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const names = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(names)) throw new Error('That file holds no trophy list.');
  const known = new Set(knownNames);
  const kept = names.filter((name) => typeof name === 'string' && known.has(name));
  return new Set(kept);
}
