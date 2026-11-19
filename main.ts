// Leonida Platinum — GTA VI trophy guide & tracker (gta6-trophy-guide-01).
//
// This program is the entry's hand-in step. It runs on Node 22 with the
// standard library only, in a container with no network: it copies this
// repository's app/ (the offline guide) and screenshots/ (real renders of
// the guide) into the output directory, then writes dossier.json there with
// the vendored make.fun library. The scorer rebuilds that dossier from the
// same library and compares the two byte for byte, so vendor/
// makefun-frontend.ts must stay exactly as the kit shipped it. The hand-in
// is deterministic: the same repository files always produce the same
// /output bytes, so the grader's two runs agree.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The gate's own caps (reference/gate.json): text_max_bytes shapes the
// dossier text; the other limits refuse an entry the scorer would refuse
// (more than 4 screenshots or one over 256 KiB; app/ over 993 files and
// directories or 48 MiB — app/ shares /output's own 1000-entry cap with
// screenshots/ and dossier.json).
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
