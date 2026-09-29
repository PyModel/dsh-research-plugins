# Fix: dsh-market plugin install fails with ERR_PNPM_UNEXPECTED_STORE (DSH Desktop)

Status: FIXED on this machine 2026-09-20 by the profile workaround (change 1
below). Status as of 2026-09-28:

- dsh-market/dsh-market#652 — variant-aware unexpected-store message — MERGED
  2026-09-21 after one review round (path check narrowed to
  `.generations/staging`; copy cut to the two honest remediations).
  `dshmarket-unexpected-store-staging-message.patch` is the merged version.
- dataelement/dsh-desktop#487 — always-write staging workspace + storeMismatch
  retry/detail (fork elkaix, branch fix/generation-staging-workspace-isolation)
  — OPEN, mergeable, no review yet.
- Local app-bundle patch: moot. `/Applications/DSH Desktop.app` and its
  `.orig920` backup were both gone by 2026-09-28. After a reinstall, change 1
  still covers the bug until #487 ships.

## Root cause (verified by reproduction)

Chain:

1. DSH Desktop 0.9.1 (dataelement/dsh-desktop) installs market plugins as
   "generations": bundled pnpm 10.34.5 runs `add` in a fresh staging dir
   `$DSH_HOME/profiles/.generations/staging/<uuid>`
   (`~/Library/Application Support/dsh-desktop/harness/...`).
2. `installGeneration` (dsh-desktop-market-installer/generations/installer.mjs)
   writes a `pnpm-workspace.yaml` into staging ONLY when build approvals exist.
   `@pymodel/dsh-tavily` needs none -> no workspace file.
3. Without it, pnpm resolves the workspace root by walking ancestors. This
   machine's HOME is itself a pnpm workspace: `~/pnpm-workspace.yaml` +
   `~/node_modules/.modules.yaml` recording `storeDir: ~/Library/pnpm/store/v11`
   (packageManager pnpm@11.17.0).
4. Bundled pnpm 10 resolves store `~/Library/pnpm/store/v10` != recorded v11 ->
   `ERR_PNPM_UNEXPECTED_STORE`, exit 1 in ~234ms. Market log:
   `web/.dsh-market/log.ndjson` 2026-09-20T23:14:15Z.

Evidence matrix (bundled node+pnpm, identical staging files):
- /tmp (not under $HOME): install proceeds.
- under $HOME without workspace file: UNEXPECTED_STORE (v11 vs v10).
- under $HOME WITH `pnpm-workspace.yaml` in staging: install succeeds.
- fake `.modules.yaml` echoed back in the error => pnpm reads exactly the
  workspace-root manifest; `~/node_modules/.modules.yaml` is the v11 source.

## Changes applied on this machine

1. **`harness/profiles/web/pnpm-workspace.yaml`** (user space, live):
   added inert `allowBuilds: dsh-desktop-staging-workaround: true`.
   DSH Desktop forwards approved keys into every staging workspace, so staging
   now ALWAYS carries its own `pnpm-workspace.yaml` -> pnpm never walks up to
   `~/pnpm-workspace.yaml`. No app restart needed (file is read per install).
2. **dshmarket installed build** `web/node_modules/dshmarket/lib/pnpm-compat.js`:
   `unexpected-store` classification is now variant-aware. When pnpm's named
   modules dir is under `.generations` (desktop staging), the message explains
   the ancestor-workspace capture and does NOT tell the user to relink the
   profile. Takes effect on harness restart; dshmarket auto-update overwrites
   it (upstream patch below supersedes).

## Upstream patches (in this dir)

- `dsh-desktop-generation-staging-store-fix.patch` — installer.mjs:
  (a) staging `pnpm-workspace.yaml` always written; (b) `storeMismatch()`
  classifier + actionable bilingual-capable detail; (c) one bounded retry in a
  fresh staging workspace on store mismatch only.
  Apply: needs App Management TCC for the terminal (or `sudo cp`) into
  `/Applications/DSH Desktop.app/Contents/Resources/app/node_modules/dsh-desktop-market-installer/generations/installer.mjs`.
  PR target: github.com/dataelement/dsh-desktop.
- `dshmarket-unexpected-store-staging-message.patch` — src/pnpm-compat.ts,
  same variant-aware message for the TS source. PR target:
  github.com/dsh-market/dsh-market.

## Verification (all run, 2026-09-20)

- [x] repro6: staging + workspace yaml under real registry -> pnpm add succeeds
- [x] app's own `installGeneration` (unmodified code) with the profile
      workaround: ok:true, generation `pymodel+dsh-tavily+0.3.0+f134f856f1c9`
      promoted in scratch home (approvals forwarded: 1)
- [x] patched installer without workaround: ok:true (always-yaml path)
- [x] patched installer retry: simulated mismatch on attempt 1 -> 2 calls,
      clean traces, ok:true
- [x] patched installer double-failure: ok:false with storeMismatchDetail
- [x] patched dshmarket classifier: staging output -> staging-variant message
      ("do not relink the profile"); profile output -> original relink advice
- [x] cleanup: repro staging dirs + /tmp scratch removed
- [ ] real-world: click Install again in the DSH Desktop market UI
      (expected to succeed; agent-busy guard may ask to wait/cancel first)

## Notes

- dshmarket's retry/recovery machinery (`withHoistRecovery`) already covers
  pnpm-major drift, release-age, host-peer 404, transient network, fetch
  timeout — nothing to add there.
- Agent-busy guard already exists in dshmarket (`agentBusyInstall` /
  `install-blocked`, src/routes.ts:4430) and fired correctly on this machine
  (2026-09-20T23:20:04Z, session-930dc3fe…).
- Environmental trigger kept as-is: `~/pnpm-workspace.yaml` + `~/node_modules`
  (hosts the user's pi tooling, pnpm 11). Do not relink it casually.
