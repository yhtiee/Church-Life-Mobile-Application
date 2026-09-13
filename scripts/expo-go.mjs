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

const isWindows = process.platform === 'win32';

const child = spawn(isWindows ? 'npx.cmd' : 'npx', ['expo', 'start', ...process.argv.slice(2)], {
  // Inherited so the QR code and the interactive key commands reach the
  // terminal you ran this from.
  stdio: 'inherit',
  // Node will not launch a .cmd on Windows without a shell.
  shell: isWindows,
  env: { ...process.env, EXPO_GO_PREVIEW: '1' },
});

child.on('exit', (code) => process.exit(code ?? 0));
