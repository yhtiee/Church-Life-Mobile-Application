// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // `lib/supabase/functions` holds Deno edge functions, which resolve their
    // imports over URLs and are already excluded from the app's tsconfig.
    ignores: ['dist/*', 'lib/supabase/functions/*'],
  },
]);
