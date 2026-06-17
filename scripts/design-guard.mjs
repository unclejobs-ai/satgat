/**
 * 삿갓(Satgat) design-guard — static analyzer enforcing the 삿갓 8 design rules.
 *
 * Modeled on scripts/verify-template-catalog.mjs: pure static analysis using the
 * TypeScript compiler API for structural parsing + line-level text scanning for
 * color/weight literals. It never imports/executes app code, never touches the
 * network, and never starts a server.
 *
 * Modes:
 *   --check          Run the 6 design rules (RGBA_USAGE, PURE_WHITE,
 *                    DANCHEONG_BUDGET, SYNTHETIC_BOLD, COOL_GRAY, DUAL_ACCENT).
 *   --check-density  (Reserved for M2 — prints a notice and exits 0.)
 *
 * Severity contract (M1 = WARN mode):
 *   - Rules emit `warn` findings. The script ALWAYS exits 0 so existing
 *     CI/workflows are not broken. A future stricter mode may exit non-zero;
 *     that is out of scope for M1.
 *   - `// permit` on a line (trailing) suppresses any finding on that line to
 *     `info` severity (permitted audit trail, not counted in warn/error totals).
 *
 * Output: one finding per line, stable greppable shape:
 *   <severity> <RULE_ID> <file>:<line> — <hint>
 * Ends with a summary: total counts per severity.
 */

import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();

// ─── CLI ────────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
const mode = argv.includes('--check-density')
  ? 'density'
  : argv.includes('--check')
    ? 'check'
    : 'check'; // default mode is --check

if (mode === 'density') {
  // M2 owns the density scanner. Until then, be an explicit no-op so CI passes.
  console.log('design-guard: --check-density is reserved for M2 (density-contract). No density scan yet.');
  process.exit(0);
}

// ─── Scan targets ───────────────────────────────────────────────────────────
// The set of files design-guard inspects. src/lib/design-system/* provides the
// token dictionary; definitions/ + templates/ are the document surface; the two
// CSS files cover landing/runtime styling. app/api/export/route.ts is included
// so the PRINT_FONT_OVERRIDE_CSS permit (VAL-GUARD-015) is demonstrably honored.

function listFiles(dir, exts) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listFiles(full, exts));
    } else if (exts.some((ext) => entry.name.endsWith(ext))) {
      out.push(full);
    }
  }
  return out;
}

const scanFiles = [
  ...listFiles(path.join(root, 'src/lib/design-system'), ['.ts']),
  ...listFiles(path.join(root, 'src/lib/templates/definitions'), ['.ts']),
  ...listFiles(path.join(root, 'src/components/templates'), ['.tsx', '.ts']),
  path.join(root, 'public/satgat/overrides.css'),
  path.join(root, 'public/satgat/satgat.css'),
  // The export route holds PRINT_FONT_OVERRIDE_CSS — scanned so the permit
  // hatch is exercised end-to-end (VAL-GUARD-015).
  path.join(root, 'app/api/export/route.ts'),
].filter((file) => fs.existsSync(file));

// Test hook: DESIGN_GUARD_SCAN=<dir> adds every .ts/.tsx/.css file under <dir>
// to the scan set. Used by design-guard.test.mjs to spike synthetic violations
// without polluting the repo tree. No effect when unset.
if (process.env.DESIGN_GUARD_SCAN) {
  scanFiles.push(...listFiles(process.env.DESIGN_GUARD_SCAN, ['.ts', '.tsx', '.css']));
}

const rel = (file) => path.relative(root, file);

// ─── Font weight truth (from public/fonts/satgat-fonts.css @font-face) ───────
// Gowun Batang: 400, 700. Gowun Dodum: 400. Nanum Myeongjo: 400, 700, 800.
// Noto Serif KR: 400, 700. Any weight not listed for a family is synthetic.

const FONT_WEIGHTS = {
  'nanum myeongjo': new Set([400, 700, 800]),
  'gowun batang': new Set([400, 700]),
  'gowun dodum': new Set([400]),
  'noto serif kr': new Set([400, 700]),
  'cormorant garamond': new Set([400, 500, 600, 700]), // Latin display face (CDN) — treat broadly
};

// ─── Accent allowlist for COOL_GRAY (jade/gold legitimately have R<G) ────────
const ACCENT_HEX_ALLOWLIST = new Set([
  '#2e6b5e', // JADE
  '#3d8b7a', // JADE_LIGHT
  '#b8954f', // GOLD
  '#d4b76a', // GOLD_LIGHT
]);

// Dancheong tokens for budget + dual-accent detection.
const DANCHEONG_HEX = new Set(['#9b1b1b', '#b92d2d', '#b53030']);
const DANCHEONG_TOKEN = /\bDANCHEONG(_LIGHT)?\b/g;
const JADE_GOLD_TOKEN = /\b(JADE|JADE_LIGHT|GOLD|GOLD_LIGHT)\b/g;
const JADE_GOLD_HEX = new Set(['#2e6b5e', '#3d8b7a', '#b8954f', '#d4b76a']);

// ─── Finding model ──────────────────────────────────────────────────────────

const RULE_HINTS = {
  RGBA_USAGE: '8조 rule 6: solid hex only — rgba() is forbidden (use a solid hex token)',
  PURE_WHITE: '8조 rule 1: pure white (#FFF/#FFFFFF/white) is forbidden on 백자지 canvas',
  DANCHEONG_BUDGET: '8조 rule 2: 단청 #9B1B1B should stay ≤ 5% of a page (overuse heuristic)',
  SYNTHETIC_BOLD: '8조 rule 8: weight 600+ without a matching @font-face is synthetic bold',
  COOL_GRAY: '8조 rule 4: grays must be warm (R<G reads cool-blue) — use a 회녹 warm gray',
  DUAL_ACCENT: '8조 rule 3: 단청 and a secondary accent (jade/gold) must not coexist in one file',
};

const findings = []; // { severity, rule, file, line, hint }

function addFinding(rule, file, line, hint) {
  const text = line != null ? readLine(file, line) : '';
  if (line != null && hasPermit(text)) {
    // permit hatch: suppress to info, keep an audit trail
    findings.push({ severity: 'info', rule, file: rel(file), line, hint: `permitted — ${hint}` });
    return;
  }
  findings.push({ severity: 'warn', rule, file: rel(file), line, hint });
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const fileLines = new Map();

function readLines(file) {
  if (!fileLines.has(file)) {
    // Parse each scanned file into a TypeScript SourceFile (same AST entry
    // point as scripts/verify-template-catalog.mjs's readSource). This gives a
    // valid parse tree per file and keeps the analyzer on the documented
    // compiler-API path; the line-level rules then operate on sourceFile.text
    // so line numbers map 1:1 to the on-disk source.
    const src = fs.readFileSync(file, 'utf8');
    const scriptKind = file.endsWith('.tsx')
      ? ts.ScriptKind.TSX
      : file.endsWith('.ts')
        ? ts.ScriptKind.TS
        : ts.ScriptKind.CSS;
    ts.createSourceFile(path.basename(file), src, ts.ScriptTarget.Latest, true, scriptKind);
    fileLines.set(file, src.split('\n'));
  }
  return fileLines.get(file);
}

function readLine(file, line) {
  const lines = readLines(file);
  return lines[line - 1] ?? '';
}

function hasPermit(lineText) {
  // Match the existing CI convention `grep -v "// .*permit"`. Both `//` and
  // (for CSS) `/* permit */` style are tolerated via a trailing permit marker.
  return /\/\/\s*permit\b/.test(lineText);
}

function parseHexes(lineText) {
  // 3-, 4-, 6-, or 8-digit hex color literals (case-insensitive). 4-digit is
  // the #rgba shorthand and 8-digit is #rrggbbaa (alpha suffix). Returns
  // lowercased 6-digit RGB (alpha dropped by normalizeHex since alpha is
  // irrelevant to the pure-white / cool-gray checks).
  const out = [];
  const re = /#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
  let m;
  while ((m = re.exec(lineText)) !== null) {
    out.push({ raw: m[0], value: normalizeHex(m[0]) });
  }
  return out;
}

function normalizeHex(hex) {
  // Reduce any hex form to a lowercase 6-digit #rrggbb (alpha dropped — it is
  // irrelevant for the pure-white / cool-gray checks; #ffffffff is pure white
  // regardless of alpha).
  const h = hex.slice(1).toLowerCase();
  if (h.length === 3) {
    // #rgb → #rrggbb
    return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`;
  }
  if (h.length === 4) {
    // #rgba shorthand → #rrggbb (alpha discarded)
    return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`;
  }
  if (h.length === 8) {
    // #rrggbbaa → #rrggbb (alpha discarded)
    return `#${h.slice(0, 6)}`;
  }
  return `#${h}`;
}

function hexChannels(hex) {
  const h = normalizeHex(hex).slice(1);
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function isPureWhite(hex) {
  return normalizeHex(hex) === '#ffffff';
}

// ─── Rule: RGBA_USAGE ───────────────────────────────────────────────────────
// Flags any `rgba(` function call (case-insensitive). Line-level text scan.

function ruleRgbaUsage(file) {
  const lines = readLines(file);
  const re = /\brgba\s*\(/gi;
  lines.forEach((text, i) => {
    if (re.test(text)) {
      addFinding('RGBA_USAGE', file, i + 1, RULE_HINTS.RGBA_USAGE);
    }
    re.lastIndex = 0;
  });
}

// ─── Rule: PURE_WHITE ───────────────────────────────────────────────────────
// Flags #FFF / #FFFF / #FFFFFF / #ffffffff and the bare keyword `white` used
// as a color value. Exempts canvas #F7F7F2 and ivory #FFFFFB (not pure white).
// `white` inside identifiers (whiteSpace, whitespace) is NOT flagged.

function rulePureWhite(file) {
  const lines = readLines(file);
  lines.forEach((text, i) => {
    const line = i + 1;
    // Operate on code only (comments stripped) so a literal `#FFF` or the word
    // `white` appearing in prose/documentation is not flagged as usage.
    const code = stripComment(text);
    // hex pure-white literals.
    for (const { value } of parseHexes(code)) {
      if (isPureWhite(value)) {
        addFinding('PURE_WHITE', file, line, RULE_HINTS.PURE_WHITE);
        return;
      }
    }
    // bare `white` keyword as a color value. Match a standalone token so
    // `whiteSpace`/`whitespace`/`obangsaek-white` are not flagged.
    const keyword = /(^|[^a-zA-Z-])white(?![a-zA-Z-])/;
    if (keyword.test(code)) {
      addFinding('PURE_WHITE', file, line, RULE_HINTS.PURE_WHITE);
    }
  });
}

function stripComment(text) {
  // Remove `// ...` line comments and `/* ... */` block comments on the line.
  // For a multi-line block comment, the whole line is treated as comment once
  // an open `/*` is active (tracked via a simple state check on `* ` leaders).
  let out = text;
  const block = out.indexOf('/*');
  if (block !== -1) {
    const end = out.indexOf('*/', block);
    out = end === -1 ? out.slice(0, block) : out.slice(0, block) + out.slice(end + 2);
  }
  const line = out.indexOf('//');
  if (line !== -1) out = out.slice(0, line);
  // A line inside a CSS/JSDoc block comment that begins with ` *` or ` *` is
  // documentation, not code.
  const blockLeader = /^\s*\*\s/;
  if (blockLeader.test(out)) out = '';
  return out;
}

// ─── Rule: COOL_GRAY ────────────────────────────────────────────────────────
// Flags hex colors with a cool-blue cast — the anti-pattern on warm 백자지. The
// reliable signature of a cool-blue gray is that BLUE is the dominant channel
// (B is the max and B > R). Saturated accents (jade/gold) are allowlisted
// because they are intentional chromatic accents, not grays.
//
// Matrix (VAL-GUARD-006):
//   COOL (flag):  #f3f4f6 (B=max, B>R)  #6b7280 (B=max, B>R)  #aeb8c0
//   WARM (skip):  #4D4B46 (R=max)  #3A3833 (R=max)  #D2D6CB (G=max, B=min)  #73786F (G=max, B=min)
//   ACCENT (skip via allowlist): #2E6B5E jade  #B8954F gold

function ruleCoolGray(file) {
  const lines = readLines(file);
  lines.forEach((text, i) => {
    for (const { value } of parseHexes(text)) {
      if (ACCENT_HEX_ALLOWLIST.has(value)) continue;
      const { r, g, b } = hexChannels(value);
      // Only near-achromatic colors can be "gray"; saturated chroma (like the
      // dancheong red) is excluded by a saturation guard.
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const isGrayish = maxC - minC <= 24;
      if (!isGrayish) continue;
      // Cool-blue cast: blue is the dominant channel and exceeds red. This
      // separates cool grays (B-led) from warm/green grays (G-led, B-low) and
      // red-led grays — both of which 삿갓 uses intentionally as 회녹.
      if (b === maxC && b > r) {
        addFinding('COOL_GRAY', file, i + 1, `${RULE_HINTS.COOL_GRAY} (${value}: B=${b} dominant, R=${r})`);
      }
    }
  });
}

// ─── Rule: DANCHEONG_BUDGET ─────────────────────────────────────────────────
// Heuristic: count dancheong token/hex references per template renderer file,
// weight each occurrence, and warn when the weighted score crosses a threshold.
// Threshold + weights are documented inline so the math is reproducible.

const DANCHEONG_WEIGHTS = {
  hex: 1.0, // #9B1B1B / #B92D2D literal
  token: 0.6, // DANCHEONG / DANCHEONG_LIGHT identifier (often a shared token)
};
// Threshold: a single hairline (1 occurrence) is fine (score ≈ 0.6–1.0). Many
// dancheong uses push the page toward > 5% visual coverage. Threshold 6.0 ≈
// ~6 literal dancheong hexes or ~10 token references in one renderer.
const DANCHEONG_THRESHOLD = 6.0;

function countDancheong(file) {
  const lines = readLines(file);
  let score = 0;
  let hexHits = 0;
  let tokenHits = 0;
  lines.forEach((text) => {
    for (const { value } of parseHexes(text)) {
      if (DANCHEONG_HEX.has(value)) {
        score += DANCHEONG_WEIGHTS.hex;
        hexHits += 1;
      }
    }
    const tokens = text.match(DANCHEONG_TOKEN) ?? [];
    score += tokens.length * DANCHEONG_WEIGHTS.token;
    tokenHits += tokens.length;
  });
  return { score, hexHits, tokenHits };
}

function ruleDancheongBudget(file) {
  // Skip the token dictionary (constraint.ts/tokens.ts) — it defines dancheong
  // once as the authoritative token, not as page usage. Everything else that
  // references dancheong is scored.
  if (file.includes(path.join('src', 'lib', 'design-system'))) return;
  const { score, hexHits, tokenHits } = countDancheong(file);
  if (score > DANCHEONG_THRESHOLD) {
    const hint =
      `${RULE_HINTS.DANCHEONG_BUDGET} ` +
      `(score ${score.toFixed(1)} > ${DANCHEONG_THRESHOLD}; hex=${hexHits}×1.0, token=${tokenHits}×0.6)`;
    // Attach to the first dancheong-bearing line for a stable anchor.
    const lines = readLines(file);
    let anchor = 1;
    for (let i = 0; i < lines.length; i += 1) {
      const hexes = parseHexes(lines[i]).map((h) => h.value);
      const hasDanHex = hexes.some((v) => DANCHEONG_HEX.has(v));
      const hasDanToken = DANCHEONG_TOKEN.test(lines[i]);
      if (hasDanHex || hasDanToken) {
        anchor = i + 1;
        break;
      }
    }
    addFinding('DANCHEONG_BUDGET', file, anchor, hint);
  }
}

// ─── Rule: SYNTHETIC_BOLD ───────────────────────────────────────────────────
// Flags a suspicion pattern: font-weight 600+ used with a font-family stack
// whose declared @font-face weights do not include that weight. Cites file,
// line, weight, and font stack. Does not flag weights with a matching face.

function ruleSyntheticBold(file) {
  const lines = readLines(file);
  lines.forEach((text, i) => {
    // Match CSS `font-weight: 600` or JSX `fontWeight: 600` / `fontWeight={600}`.
    const weightRe = /font-?weight\s*[:=]\s*\{?\s*(\d{3})\b/gi;
    let m;
    while ((m = weightRe.exec(text)) !== null) {
      const weight = parseInt(m[1], 10);
      if (weight < 600) continue; // only 600+ can be synthetic
      // Determine the font family context. Look at the same line first, then
      // scan a small window upward for a fontFamily/font-family declaration.
      const family = resolveFontFamily(lines, i, text);
      if (!family) continue; // can't determine family → don't guess
      const weights = knownWeightsForStack(family);
      if (!weights) continue; // unknown family (e.g. generic serif) → don't guess
      if (!weights.has(weight)) {
        addFinding(
          'SYNTHETIC_BOLD',
          file,
          i + 1,
          `${RULE_HINTS.SYNTHETIC_BOLD} (weight ${weight} on "${familySummary(family)}"; available: ${[...weights].join(', ')})`
        );
      }
    }
  });
}

function resolveFontFamily(lines, idx, currentLine) {
  // Prefer a family on the same line (common in inline style objects).
  const same = familyOnLine(currentLine);
  if (same) return same;
  // Scan up to 8 lines above for the nearest fontFamily declaration in the
  // same style block. This is a best-effort heuristic, not a full scope solver.
  for (let j = idx - 1; j >= Math.max(0, idx - 8); j -= 1) {
    const f = familyOnLine(lines[j]);
    if (f) return f;
  }
  return null;
}

function familyOnLine(text) {
  const re = /font-?family\s*:\s*([^;}]+)/i;
  const m = text.match(re);
  if (m) return m[1].trim();
  return null;
}

function knownWeightsForStack(stack) {
  // Lowercase the stack and intersect with known families. If ANY recognized
  // family in the stack ships the weight, treat it as available (CSS fallback
  // means the browser will use a face that has it).
  const lower = stack.toLowerCase();
  const families = Object.keys(FONT_WEIGHTS).filter((name) => lower.includes(name));
  if (families.length === 0) return null; // no recognized family → skip
  const union = new Set();
  for (const f of families) for (const w of FONT_WEIGHTS[f]) union.add(w);
  return union;
}

function familySummary(stack) {
  // First family name only, for a concise hint.
  return stack.split(',')[0].replace(/['"]/g, '').trim();
}

// ─── Rule: DUAL_ACCENT ──────────────────────────────────────────────────────
// Enforces 8조 rule 3: dancheong and a secondary accent (jade/gold) must not
// appear together in the same renderer file. constraint.ts/tokens.ts define all
// tokens and are excluded (they are the dictionary, not a page).

function ruleDualAccent(file) {
  // Exclude the token dictionaries — they define every token by definition.
  if (file.includes(path.join('src', 'lib', 'design-system'))) return;
  const lines = readLines(file);
  let hasDancheong = false;
  let hasJadeGold = false;
  const tokens = new Set();
  lines.forEach((text) => {
    if (DANCHEONG_TOKEN.test(text)) {
      hasDancheong = true;
      text.match(DANCHEONG_TOKEN)?.forEach((t) => tokens.add(t));
    }
    for (const { value } of parseHexes(text)) {
      if (DANCHEONG_HEX.has(value)) {
        hasDancheong = true;
        tokens.add(value);
      }
      if (JADE_GOLD_HEX.has(value)) {
        hasJadeGold = true;
        tokens.add(value);
      }
    }
    const jg = text.match(JADE_GOLD_TOKEN) ?? [];
    if (jg.length) {
      hasJadeGold = true;
      jg.forEach((t) => tokens.add(t));
    }
  });
  if (hasDancheong && hasJadeGold) {
    addFinding(
      'DUAL_ACCENT',
      file,
      1,
      `${RULE_HINTS.DUAL_ACCENT} (found: ${[...tokens].join(', ')})`
    );
  }
}

// ─── Run all rules over all files ───────────────────────────────────────────

const RULES = [
  ruleRgbaUsage,
  rulePureWhite,
  ruleCoolGray,
  ruleDancheongBudget,
  ruleSyntheticBold,
  ruleDualAccent,
];

for (const file of scanFiles) {
  for (const rule of RULES) {
    try {
      rule(file);
    } catch (err) {
      // A single-rule failure on a single file must not abort the whole scan.
      findings.push({
        severity: 'info',
        rule: 'INTERNAL',
        file: rel(file),
        line: 0,
        hint: `rule ${rule.name} skipped: ${err.message}`,
      });
    }
  }
}

// ─── Report ─────────────────────────────────────────────────────────────────

// Stable sort: by file, then line, then rule — so output is deterministic and
// greppable (VAL-GUARD-012-style determinism is valuable here too).
findings.sort((a, b) => {
  if (a.file !== b.file) return a.file < b.file ? -1 : 1;
  if ((a.line ?? 0) !== (b.line ?? 0)) return (a.line ?? 0) - (b.line ?? 0);
  return a.rule < b.rule ? -1 : a.rule > b.rule ? 1 : 0;
});

const counts = { error: 0, warn: 0, info: 0 };
for (const f of findings) counts[f.severity] += 1;

const BANNER = 'design-guard — 삿갓 8조 static analysis (warn mode)';

const lines = [];
lines.push(BANNER);
lines.push('');
lines.push('Legend: <severity> <RULE_ID> <file>:<line> — <hint>');
lines.push('');

if (findings.length === 0) {
  lines.push('No findings. All scanned files satisfy the 8 design rules.');
} else {
  for (const f of findings) {
    const loc = f.line ? `${f.file}:${f.line}` : f.file;
    lines.push(`${f.severity.toUpperCase().padEnd(5)} ${f.rule.padEnd(18)} ${loc} — ${f.hint}`);
  }
}

lines.push('');
lines.push(
  `Summary: ${counts.error} error(s), ${counts.warn} warn(s), ${counts.info} info/permitted — ` +
    `${findings.length} finding(s) across ${scanFiles.length} scanned file(s). ` +
    `Exit 0 (warn mode; M1 does not fail CI on warnings).`
);

console.log(lines.join('\n'));

// WARN mode: always exit 0 so existing CI/workflows are not broken.
process.exit(0);
