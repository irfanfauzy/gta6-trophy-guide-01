// Rendering: the checklist rows, the detail pane with each trophy's guide
// and sources, the platinum roadmap and the missable lists. Everything is
// built with textContent, never innerHTML, so trophy text cannot inject
// markup. The roadmap and missable flags are built from the official
// descriptions alone.
import { spoilerHides, trophyMatches } from './filters.js';

// The road to the platinum, in the order to earn them. Stage 1 is the story
// (chapters 1-4 and the finale, with its named missions); stage 2 the
// contact finales and stranger strands; stage 3 activities and skills;
// stage 4 robberies and money; stage 5 collectibles, exploration and the
// 100% completion that ends the run.
export const ROADMAP_STAGES = [
  {
    title: 'Stage 1 — Play the story',
    blurb: 'Chapters 1 to 4, the named missions and the finale. Do the Chapter 1 meditation spot while you are here — it feeds the one confirmed missable. Keep a manual save before each big mission.',
    ids: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  },
  {
    title: 'Stage 2 — Contacts & strangers',
    blurb: 'Finish the mission strands for Andy, Kenton, Billy, Randy and Tyrone, the 8 stranger strands across Leonida, Bret\u2019s hunt, and the partnership moments. These unlock as the story opens them up.',
    ids: [22, 23, 24, 26, 27, 25, 29, 47, 48],
  },
  {
    title: 'Stage 3 — Activities & skills',
    blurb: 'The skill grinds: 250 stunts, gold at all 42 shooting-range challenges, 20 different races won, drone races at all 14 spots, 50 challenges, plus fishing, the arcade, bowling and Combat Focus.',
    ids: [15, 16, 17, 18, 19, 20, 21, 32, 36, 46, 51],
  },
  {
    title: 'Stage 4 — Robberies & money',
    blurb: 'Five bank vaults, an armored truck, a jewelry store without being seen, one illegal operation per gang, the partner robberies — then launder $250,000, spend $100,000, buy the garages and register vehicles.',
    ids: [33, 34, 37, 38, 39, 40, 41, 43, 52, 53, 54, 55],
  },
  {
    title: 'Stage 5 — Collectibles, exploration & 100%',
    blurb: 'Meditate at all 18 spots, finish 3 card sets, WAiNK It at 100 places, discover 100 vehicles, explore all 52 areas, then the last odd moments — and A Long Road: 100% completion. The platinum pops with it.',
    ids: [28, 30, 31, 35, 42, 44, 45, 49, 50, 14, 1],
  },
];

export function formatCount(trophy) {
  if (trophy.id === 14) return 'Target: 100% completion';
  if (trophy.id === 52) return 'Target: $250,000 laundered';
  if (trophy.id === 53) return 'Target: $100,000 spent';
  if (typeof trophy.count === 'number') return `Target: ${trophy.count.toLocaleString('en-US')}`;
  return null;
}

function gradeTag(trophy) {
  const tag = document.createElement('span');
  tag.className = `tag grade-${trophy.grade}`;
  tag.textContent = trophy.grade;
  return tag;
}

function tagWith(text, className) {
  const tag = document.createElement('span');
  tag.className = `tag ${className}`;
  tag.textContent = text;
  return tag;
}

export function renderChecklist(listEl, metaEl, trophies, state, earned, selectedId, onToggle, onSelect) {
  listEl.replaceChildren();
  const shown = trophies.filter((t) => trophyMatches(t, state, earned));
  metaEl.textContent = shown.length === trophies.length
    ? `Showing all ${trophies.length} trophies.`
    : `Showing ${shown.length} of ${trophies.length} trophies.`;
  if (shown.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty-list';
    li.textContent = state.kind === 'online'
      ? 'No online trophies: the whole list is single-player, and the game launched with no online mode.'
      : 'No trophies match these filters.';
    listEl.append(li);
    return;
  }
  for (const t of shown) {
    const li = document.createElement('li');
    li.className = 'trophy-row' + (earned.has(t.name) ? ' earned' : '') + (t.id === selectedId ? ' selected' : '');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', `Earned: ${t.name}`);
    box.setAttribute('aria-pressed', String(earned.has(t.name)));
    box.addEventListener('change', () => onToggle(t, box.checked));
    box.addEventListener('click', (e) => e.stopPropagation());
    const medal = document.createElement('span');
    medal.className = `medal ${t.grade}`;
    medal.title = t.grade;
    const body = document.createElement('div');
    const name = document.createElement('div');
    if (spoilerHides(t, earned, state.spoilers)) {
      name.className = 'trophy-name hidden-name';
      name.textContent = 'Hidden story trophy — earn it to reveal';
    } else {
      name.className = 'trophy-name';
      name.textContent = t.name;
    }
    const desc = document.createElement('div');
    desc.className = 'trophy-desc';
    desc.textContent = spoilerHides(t, earned, state.spoilers) ? 'Hidden until earned.' : t.description;
    const tags = document.createElement('div');
    tags.className = 'trophy-tags';
    tags.append(gradeTag(t));
    for (const kind of t.kinds) tags.append(tagWith(kind, ''));
    if (t.missable === 'confirmed') tags.append(tagWith('missable — confirmed', 'missable'));
    if (t.missable === 'watch') tags.append(tagWith('missable — watch', 'missable'));
    if (t.hidden) tags.append(tagWith('hidden on PSN', 'hidden-trophy'));
    const countLabel = formatCount(t);
    if (countLabel) tags.append(tagWith(countLabel, 'count'));
    body.append(name, desc, tags);
    const stateText = document.createElement('div');
    stateText.className = 'trophy-desc';
    stateText.textContent = earned.has(t.name) ? 'Earned ✓' : '';
    li.append(box, medal, body, stateText);
    li.addEventListener('click', () => onSelect(t));
    listEl.append(li);
  }
}

export function renderDetail(detailEl, trophy, state, earned, onToggle) {
  detailEl.replaceChildren();
  if (!trophy) {
    const p = document.createElement('p');
    p.className = 'detail-empty';
    p.textContent = 'Pick a trophy to read its guide and sources.';
    detailEl.append(p);
    return;
  }
  const hidden = spoilerHides(trophy, earned, state.spoilers);
  const title = document.createElement('h3');
  title.textContent = hidden ? 'Hidden story trophy' : trophy.name;
  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = hidden
    ? 'Official description: hidden until earned.'
    : `Official description: “${trophy.description}” — ${trophy.grade}${trophy.hidden ? ' · hidden on PSN until earned' : ''}.`;
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.textContent = earned.has(trophy.name) ? 'Mark as not earned' : 'Mark as earned';
  toggle.addEventListener('click', () => onToggle(trophy, !earned.has(trophy.name)));
  const toggleWrap = document.createElement('p');
  toggleWrap.className = 'earned-state';
  toggleWrap.append(toggle);
  const guide = document.createElement('p');
  guide.className = 'guide-text';
  guide.textContent = hidden ? 'Turn spoilers off, or earn this trophy, to read its guide.' : trophy.guide;
  const sources = document.createElement('p');
  sources.className = 'sources';
  const strong = document.createElement('strong');
  strong.textContent = 'Sources: ';
  sources.append(strong);
  sources.append(document.createTextNode(hidden ? 'Hidden until earned.' : trophy.sources));
  detailEl.append(title, official, toggleWrap, guide, sources);
}

export function renderRoadmap(container, trophies, earned) {
  container.replaceChildren();
  const byId = new Map(trophies.map((t) => [t.id, t]));
  for (const stage of ROADMAP_STAGES) {
    const done = stage.ids.filter((id) => earned.has(byId.get(id).name)).length;
    const box = document.createElement('div');
    box.className = 'stage';
    const h = document.createElement('h3');
    h.textContent = stage.title;
    const count = document.createElement('span');
    count.className = 'stage-count';
    count.textContent = `${done}/${stage.ids.length} earned`;
    h.append(count);
    const p = document.createElement('p');
    p.textContent = stage.blurb;
    const ul = document.createElement('ul');
    for (const id of stage.ids) {
      const t = byId.get(id);
      const li = document.createElement('li');
      if (earned.has(t.name)) li.className = 'done';
      li.textContent = `${t.name} `;
      const g = document.createElement('span');
      g.className = 'mini-grade';
      g.textContent = t.grade;
      li.append(g);
      ul.append(li);
    }
    box.append(h, p, ul);
    container.append(box);
  }
}

export function renderMissables(confirmedEl, watchEl, trophies, earned) {
  const card = (t, why) => {
    const box = document.createElement('div');
    box.className = 'missable-card' + (t.missable === 'watch' ? ' watch' : '');
    const name = document.createElement('div');
    name.className = 'm-name';
    name.textContent = `${t.name} — ${t.description} (${t.grade})${earned.has(t.name) ? ' · Earned ✓' : ''}`;
    const p = document.createElement('p');
    p.className = 'm-why';
    p.textContent = why;
    box.append(name, p);
    return box;
  };
  confirmedEl.replaceChildren();
  watchEl.replaceChildren();
  for (const t of trophies.filter((x) => x.missable === 'confirmed')) {
    confirmedEl.append(card(t, 'Confirmed by a published guide: PowerPyx (reported by GGRecon) says a first meditation in Chapter 1 can be missed. Meditate at the first spot the moment the game lets you.'));
  }
  for (const t of trophies.filter((x) => x.missable === 'watch')) {
    watchEl.append(card(t, 'Flagged from its official description only: tied to one named mission or one specific moment. No published guide confirms it as missable yet, and mission replay may recover it — keep a manual save before it.'));
  }
}
