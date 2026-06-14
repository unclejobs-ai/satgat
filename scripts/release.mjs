#!/usr/bin/env node
/**
 * satgat release — Option C′ "staged-dir publish".
 *
 * Builds a staging COPY of the publishable surface whose `package.json` already
 * declares `dependencies: {}`, then runs `npm publish` from that copy. Because
 * the staging manifest IS the manifest npm publishes, the published registry
 * packument AND the tarball both carry zero runtime deps — by construction.
 * The source tree is NEVER mutated.
 *
 * Why staged-dir and NOT an on-disk prepack/postpack strip:
 *   npm's publish flow re-reads package.json AFTER `postpack` (getManifest read
 *   #2) and builds the registry packument from THAT read. `npm install`
 *   resolves dependency trees from the packument, not from the tarball's
 *   package.json. So an on-disk "strip deps in prepack → restore in postpack"
 *   leaves the published packument carrying every framework dep (the install
 *   bloat is UNFIXED) while the tarball falsely shows {} — divergent metadata
 *   ("manifest confusion") that also misleads audit/security tooling. Skipping
 *   the restore instead leaves the working tree permanently stripped. Publishing
 *   from a copy sidesteps the re-read entirely.
 *
 * `publishConfig` cannot strip `dependencies` (it only overrides fields like
 * registry/access/tag), so the strip must be a build step — this script.
 *
 * Usage:
 *   node scripts/release.mjs --dry-run        Build staging, `npm pack`, and assert
 *                                             the PACKED package.json has dependencies == {}.
 *   node scripts/release.mjs [npm-args…]      Build staging and `npm publish` from it.
 *                                             Extra args pass through (e.g. --tag next,
 *                                             --otp 123456, --registry http://localhost:4873).
 *   node scripts/release.mjs --keep           Leave the staging dir in place for inspection.
 *
 * Verdaccio packument-level verification harness (the AC gate of record, L3):
 *   1. npx verdaccio --listen 4873 &                       # ephemeral local registry
 *   2. CACHE=$(mktemp -d); HOME2=$(mktemp -d)              # isolated cache + prefix
 *   3. node scripts/release.mjs --registry http://localhost:4873  # publish to it
 *   4. npm install satgat --registry http://localhost:4873 \
 *        --cache "$CACHE" --prefix "$HOME2"                 # fresh resolve from the packument
 *   5. assert the installed tree under "$HOME2" contains ZERO framework deps
 *      (no next/react/react-dom/@ai-sdk/google/ai/zod/lucide-react).
 *   Use a unique throwaway version each run so no stale packument is cached.
 */

import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, readFileSync, writeFileSync, cpSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Throws so the caller's finally{} can clean up the staging dir; never exits directly.
function fail(message) {
  throw new Error(message);
}

// Validates the publish surface BEFORE any temp dir is created, so a config
// error (missing/empty files allowlist) cannot leak a staging directory.
function readManifestAndFiles() {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  const files = Array.isArray(pkg.files) ? pkg.files : [];
  if (files.length === 0) fail('package.json has no "files" allowlist — refusing to publish the whole tree.');
  for (const entry of files) {
    if (!existsSync(join(ROOT, entry))) fail(`"files" entry not found: ${entry}`);
  }
  return { pkg, files };
}

function populateStaging(staging, pkg, files) {
  // Copy only the publishable surface. npm always adds package.json/README/LICENSE,
  // but copying the declared files explicitly keeps the staging dir self-contained.
  for (const entry of files) {
    cpSync(join(ROOT, entry), join(staging, entry), { recursive: true });
  }

  // The published manifest: real deps replaced with {}, dev deps and scripts dropped.
  // Dropping `scripts` means the staged `npm publish` never re-triggers the
  // source-tree prepublishOnly guard (no self-block) and runs no lifecycle code.
  const stagedPkg = { ...pkg, dependencies: {} };
  delete stagedPkg.devDependencies;
  delete stagedPkg.scripts;

  writeFileSync(join(staging, 'package.json'), JSON.stringify(stagedPkg, null, 2) + '\n');
  return stagedPkg;
}

function assertCleanManifest(manifest, label) {
  const deps = manifest.dependencies || {};
  const depKeys = Object.keys(deps);
  if (depKeys.length !== 0) fail(`${label} still declares dependencies: ${depKeys.join(', ')} (expected none).`);
}

function readPackedManifest(staging) {
  // Build the real tarball and read its package.json so we verify the artifact,
  // not just the staging source. `npm pack` prints the tarball filename last.
  const pack = spawnSync('npm', ['pack', '--silent'], { cwd: staging, encoding: 'utf8' });
  if (pack.status !== 0) fail(`npm pack failed in staging:\n${pack.stderr || pack.stdout}`);
  const tgz = pack.stdout.trim().split('\n').filter(Boolean).pop();
  if (!tgz) fail('npm pack produced no tarball name.');
  const extract = spawnSync('tar', ['-xzOf', join(staging, tgz), 'package/package.json'], { encoding: 'utf8' });
  if (extract.status !== 0) fail(`failed to read package.json from ${tgz}:\n${extract.stderr}`);
  return { manifest: JSON.parse(extract.stdout), tgz };
}

const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');
const keep = argv.includes('--keep');
const publishArgs = argv.filter((a) => a !== '--dry-run' && a !== '--keep');

let staging;
try {
  const { pkg, files } = readManifestAndFiles();
  staging = mkdtempSync(join(tmpdir(), 'satgat-publish-'));
  const stagedPkg = populateStaging(staging, pkg, files);
  assertCleanManifest(stagedPkg, 'staging package.json');

  if (dryRun) {
    const { manifest, tgz } = readPackedManifest(staging);
    assertCleanManifest(manifest, 'packed tarball package.json');
    const shipped = readdirSync(staging).filter((n) => n !== 'package.json' && !n.endsWith('.tgz'));
    console.log('release --dry-run OK');
    console.log(`  staging:        ${staging}`);
    console.log(`  tarball:        ${tgz}`);
    console.log('  dependencies:   {} (staging == packed == packument by construction)');
    console.log(`  shipped top:    ${shipped.join(', ')}`);
    console.log('  packument-level proof: see the verdaccio harness in the header comment.');
  } else {
    const publish = spawnSync('npm', ['publish', ...publishArgs], { cwd: staging, stdio: 'inherit' });
    if (publish.status !== 0) fail('npm publish failed.');
    console.log(`release: published from staging with dependencies: {} (${staging})`);
  }
} catch (err) {
  console.error(`release: ${err.message}`);
  process.exitCode = 1;
} finally {
  if (staging) {
    if (keep) console.log(`release: staging kept at ${staging}`);
    else rmSync(staging, { recursive: true, force: true });
  }
}
