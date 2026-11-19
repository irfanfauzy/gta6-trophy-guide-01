// Leonida Platinum — boot and wiring. Loads the trophy list, restores saved
// progress, wires the tabs, filters, spoiler setting, export/import and the
// detail pane, and honours screenshot/test URLs: ?view=roadmap|missables|
// about, ?open=<id>, ?kind=story|missable|collectibles|activities|online,
// ?spoilers=on, ?demo=13 (seeds 13 earned trophies for screenshots).
import { loadEarned, saveEarned, demoEarned, exportEarned, importEarnedFile } from './store.js';
import { createFilterState, kindCounts } from './filters.js';
import { renderChecklist, renderDetail, renderRoadmap, renderMissables } from './views.js';

const params = new URLSearchParams(location.search);
const state = createFilterState();
const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;

let earned = loadEarned();
if (params.get('demo') === '13') earned = demoEarned(trophies);
if (params.get('spoilers') === 'on') state.spoilers = true;
if (params.get('kind')) state.kind = params.get('kind');
let selectedId = params.get('open') ? Number(params.get('open')) : null;

const $ = (id) => document.getElementById(id);
const listEl = $('trophy-list');
const metaEl = $('list-meta');
const detailEl = $('detail');

function gradeTotals() {
  const totals = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  const got = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) {
    totals[t.grade] += 1;
    if (earned.has(t.name)) got[t.grade] += 1;
  }
  return { totals, got };
}

function updateProgress() {
  const { totals, got } = gradeTotals();
  const pct = Math.round((earned.size / trophies.length) * 100);
  $('earned-count').textContent = earned.size;
  $('progress-fill').style.width = `${pct}%`;
  $('progress-bar').setAttribute('aria-valuenow', String(earned.size));
  $('progress-text').textContent = `${earned.size} of ${trophies.length} earned · ${pct}% to the platinum`;
  $('grade-line').textContent = `Platinum ${got.platinum}/${totals.platinum} · Gold ${got.gold}/${totals.gold} · Silver ${got.silver}/${totals.silver} · Bronze ${got.bronze}/${totals.bronze}`;
}

function selectedTrophy() {
  return trophies.find((t) => t.id === selectedId) ?? null;
}

function renderAll() {
  updateProgress();
  renderChecklist(listEl, metaEl, trophies, state, earned, selectedId, onToggle, onSelect);
  renderDetail(detailEl, selectedTrophy(), state, earned, onToggle);
  renderRoadmap($('roadmap-stages'), trophies, earned);
  renderMissables($('missable-confirmed'), $('missable-watch'), trophies, earned);
}

function onToggle(trophy, checked) {
  if (checked) earned.add(trophy.name);
  else earned.delete(trophy.name);
  saveEarned(earned);
  renderAll();
}

function onSelect(trophy) {
  selectedId = trophy.id;
  renderAll();
  detailEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showView(view) {
  for (const name of ['checklist', 'roadmap', 'missables', 'about']) {
    $(`view-${name}`).hidden = name !== view;
    $(`tab-${name}`).classList.toggle('active', name === view);
  }
}

for (const tab of document.querySelectorAll('.tab')) {
  tab.addEventListener('click', () => showView(tab.dataset.view));
}

$('search').addEventListener('input', (e) => {
  state.query = e.target.value;
  renderAll();
});

for (const button of document.querySelectorAll('.kind')) {
  button.addEventListener('click', () => {
    state.kind = button.dataset.kind;
    for (const b of document.querySelectorAll('.kind')) b.classList.toggle('active', b === button);
    renderAll();
  });
}

$('grade-filter').addEventListener('change', (e) => {
  state.grade = e.target.value;
  renderAll();
});

$('status-filter').addEventListener('change', (e) => {
  state.status = e.target.value;
  renderAll();
});

const spoilerBox = $('spoiler-toggle');
spoilerBox.checked = state.spoilers;
spoilerBox.addEventListener('change', () => {
  state.spoilers = spoilerBox.checked;
  renderAll();
});

$('export-btn').addEventListener('click', () => exportEarned(earned));

$('import-file').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    earned = await importEarnedFile(file, trophies.map((t) => t.name));
    saveEarned(earned);
    renderAll();
  } catch (err) {
    alert(`Could not import that file: ${err.message}`);
  }
  e.target.value = '';
});

$('reset-btn').addEventListener('click', () => {
  if (confirm('Clear all earned ticks?')) {
    earned = new Set();
    saveEarned(earned);
    renderAll();
  }
});

// Label the kind buttons with their real counts, including Online (0).
const counts = kindCounts(trophies);
for (const button of document.querySelectorAll('.kind')) {
  const kind = button.dataset.kind;
  if (kind !== 'all') button.textContent = `${button.textContent} (${counts[kind]})`;
}

const startView = params.get('view');
if (['roadmap', 'missables', 'about'].includes(startView)) showView(startView);
const kindButton = document.querySelector(`.kind[data-kind="${state.kind}"]`);
if (kindButton) {
  for (const b of document.querySelectorAll('.kind')) b.classList.toggle('active', b === kindButton);
}

renderAll();
window.__appReady = true;
