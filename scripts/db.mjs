#!/usr/bin/env node
/**
 * Supabase migration runner.
 *
 * Wraps the Supabase CLI so migrations can be applied without Docker and
 * without typing the database password each time. `db push` talks to Postgres
 * directly, so unlike `db pull` / `db dump` / `db diff` it has no container
 * dependency.
 *
 *   node scripts/db.mjs status      List local migrations and what a push would do
 *   node scripts/db.mjs push        Apply pending migrations to the linked project
 *   node scripts/db.mjs push --dry-run
 *
 * Reads SUPABASE_DB_PASSWORD from the environment, falling back to .env.
 * Keep that variable UNPREFIXED: anything named EXPO_PUBLIC_* is injected into
 * development bundles by Expo and must never hold a credential like this one.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const PASSWORD_VAR = 'SUPABASE_DB_PASSWORD';

/** Minimal .env reader — we only need one unprefixed variable out of it. */
function readEnvFile(file) {
  if (!existsSync(file)) return {};
  const out = {};
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!match) continue;
    out[match[1]] = match[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

function resolvePassword() {
  if (process.env[PASSWORD_VAR]) return process.env[PASSWORD_VAR];
  for (const name of ['.env.local', '.env']) {
    const value = readEnvFile(join(root, name))[PASSWORD_VAR];
    if (value) return value;
  }
  return null;
}

function listMigrations() {
  const dir = join(root, 'supabase', 'migrations');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
}

function run(args, password) {
  // Pass the password through the environment rather than argv so it does not
  // show up in the process list or in shell history.
  //
  // Output is captured and re-emitted rather than inherited: an inherited
  // handle here goes straight to the real terminal and is invisible to
  // anything that wraps this script (CI logs, agents, `npm run ... | tee`).
  const isWindows = process.platform === 'win32';
  const result = spawnSync(isWindows ? 'npx.cmd' : 'npx', ['supabase', ...args], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    // Node refuses to spawn a .cmd without a shell on Windows, and fails
    // silently with EINVAL if you try. Nothing we pass in argv is
    // attacker-controlled, and the password travels in the environment.
    shell: isWindows,
    env: { ...process.env, [PASSWORD_VAR]: password },
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.error) {
    console.error(`Failed to run the Supabase CLI: ${result.error.message}`);
    return 1;
  }
  return result.status ?? 1;
}

const [command, ...rest] = process.argv.slice(2);
const migrations = listMigrations();

if (command === 'status') {
  console.log(`${migrations.length} local migration(s):`);
  for (const m of migrations) console.log(`  ${m}`);
  process.exit(run(['migration', 'list', '--linked'], resolvePassword() ?? ''));
}

if (command !== 'push') {
  console.error('Usage: node scripts/db.mjs <status|push> [--dry-run]');
  process.exit(2);
}

const password = resolvePassword();
if (!password) {
  console.error(
    `Missing ${PASSWORD_VAR}.\n\n` +
      `Add it to .env (which is gitignored) as an UNPREFIXED variable:\n` +
      `  ${PASSWORD_VAR}=your-database-password\n\n` +
      `Find it under Project Settings > Database > Database password in the Supabase dashboard.\n` +
      `Do not name it EXPO_PUBLIC_*, or Expo will embed it in development bundles.`
  );
  process.exit(1);
}

if (migrations.length === 0) {
  console.error('No migrations found in supabase/migrations.');
  process.exit(1);
}

process.exit(run(['db', 'push', '--linked', '--password', password, ...rest], password));
