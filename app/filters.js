// Filters and the spoiler rule. A trophy's kinds come from its official
// description: story (chapters, named missions, contact finales), collectibles
// (counts of things to find), activities (things to do), and missable (a
// separate flag, not a kind of its own). The list has no online trophies —
// the game launched with no online mode — so the Online filter is honestly 0.
export function createFilterState() {
  return { kind: 'all', grade: 'all', status: 'all', query: '', spoilers: false };
}

export function isStoryTrophy(trophy) {
  return trophy.hidden && trophy.kinds.includes('story');
}

export function spoilerHides(trophy, earned, spoilersOn) {
  return spoilersOn && isStoryTrophy(trophy) && !earned.has(trophy.name);
}

export function kindCounts(trophies) {
  const counts = { all: trophies.length, story: 0, missable: 0, collectibles: 0, activities: 0, online: 0 };
  for (const t of trophies) {
    if (t.kinds.includes('story')) counts.story += 1;
    if (t.missable) counts.missable += 1;
    if (t.kinds.includes('collectibles')) counts.collectibles += 1;
    if (t.kinds.includes('activities')) counts.activities += 1;
    if (t.kinds.includes('online')) counts.online += 1;
  }
  return counts;
}

export function trophyMatches(trophy, state, earned) {
  if (state.kind === 'story' && !trophy.kinds.includes('story')) return false;
  if (state.kind === 'missable' && !trophy.missable) return false;
  if (state.kind === 'collectibles' && !trophy.kinds.includes('collectibles')) return false;
  if (state.kind === 'activities' && !trophy.kinds.includes('activities')) return false;
  if (state.kind === 'online' && !trophy.kinds.includes('online')) return false;
  if (state.grade !== 'all' && trophy.grade !== state.grade) return false;
  if (state.status === 'earned' && !earned.has(trophy.name)) return false;
  if (state.status === 'remaining' && earned.has(trophy.name)) return false;
  const q = state.query.trim().toLowerCase();
  if (q) {
    const hay = `${trophy.name} ${trophy.description}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}
