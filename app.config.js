/**
 * Dynamic layer over app.json. Everything still lives in app.json; this file
 * only adjusts it for one case.
 *
 * Expo Go decides whether it can open a project from the runtime version the
 * dev server reports. With `runtimeVersion` set in app.json the server
 * reports "1.0.0", which Expo Go rejects as "incompatible with this version
 * of Expo Go". Without it, the server reports "exposdk:57.0.0", which Expo Go
 * 57 accepts.
 *
 * EAS Build and EAS Update need `runtimeVersion`, so it is removed only when
 * EXPO_GO_PREVIEW=1 is set, which `npm run start:go` does. Builds and
 * published updates never set it, so they keep the runtime version and
 * installed builds keep receiving updates.
 */
module.exports = ({ config }) => {
  if (process.env.EXPO_GO_PREVIEW !== '1') return config;

  const { runtimeVersion, ...forExpoGo } = config;
  return forExpoGo;
};
