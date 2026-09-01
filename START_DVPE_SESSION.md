# Session Entry: DVPE Application Development

**Primary target:** `dvpe_CLD/`

**Runtime:** browser application

**Language:** TypeScript / React / Vite

## Resolve the checkout first

- Treat `dvpe_CLD/src/`, its tests, `package.json`, and `package-lock.json` as
  the application authority.
- A local `noderr/noderr/` checkout can provide planning and identity context,
  but it is ignored and is not present in a normal public clone.
- `DaisyExamples/` is a separate optional firmware workspace with its own
  instructions. Do not use it as proof that an exported DVPE project builds.

## Start DVPE

On Windows, double-click `START_DVPE.cmd` at the repository root. It verifies
Node.js 20+, runs `npm ci` when the lockfile changes, starts the fixed local
server, and opens the browser.

Manual start:

```sh
cd dvpe_CLD
npm ci
npm run dev -- --open
```

DVPE runs at `http://127.0.0.1:1420/`.

## Verify application changes

```sh
cd dvpe_CLD
npm test -- --run
npm run lint
npm run build
```

The current public application has no `src-tauri/` project or packaged desktop
runtime. Do not advertise or invoke `tauri:dev` unless a runnable Tauri target
is added and verified later.
