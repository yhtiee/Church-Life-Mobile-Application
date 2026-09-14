#!/usr/bin/env node
/**
 * Starts the dev server in a form Expo Go can open.
 *
 *   npm run start:go
 *   npm run start:go -- --tunnel     (testers on another network)
 *
 * Sets EXPO_GO_PREVIEW=1, which app.config.js reads to leave out
 * `runtimeVersion`. Expo Go rejects a project that reports a custom runtime
 * version, but EAS Build and EAS Update need one, so it is dropped only for
 * this command. Done in a script rather than inline in package.json because
 * `VAR=1 cmd` does not work in the Windows shell npm uses.
 */
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// Run the project's own Expo CLI with this Node binary rather than through
// `npx`. `npx` is a .cmd on Windows, which Node only launches via a shell,
// and passing arguments through a shell is what Node's DEP0190 warns about.
const expoCli = require.resolve('expo/bin/cli');

const child = spawn(process.execPath, [expoCli, 'start', ...process.argv.slice(2)], {
  // Inherited so the QR code and the interactive key commands reach the
  // terminal you ran this from.
  stdio: 'inherit',
  env: { ...process.env, EXPO_GO_PREVIEW: '1' },
});

child.on('exit', (code) => process.exit(code ?? 0));
