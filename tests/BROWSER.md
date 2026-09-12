# Disposable browser regression run

`node tests/browser-baseline.cjs` runs the real application in new Chromium contexts against its own ephemeral localhost server. It closes those contexts and the server on completion. No existing browser profile, account or shop is opened. Fixtures are explicitly synthetic.

Install Playwright in your development environment, and its Chromium browser (`npx playwright install chromium`), or set `BROWSER_CHANNEL=msedge` / `chrome` to use an installed browser. The test resolves `playwright` using normal Node module resolution, including `NODE_PATH` if it is installed outside this checkout. Playwright is test tooling only and is excluded from public assets.

The script uses application APIs to create fixtures and switch synthetic roles. Sale, void, backup export/import, password login and PIN entry use actual DOM controls. This distinguishes API setup from UI evidence. A headless desktop run does not certify Android, installed-PWA behavior, accessibility, microphones, cameras or printers.

Run the existing `npm test` suite for quota injection, stale snapshots, service-worker logic and other module regressions. Browser coverage supplements these checks; it does not replace them.

`node tests/browser-core-accessibility.cjs` exercises the actual local registration forms (including retained existing shops), duplicate/mismatch errors, Hindi login, keyboard sales, focus handling, logout and PIN correction in both repositories. See `docs/sprints/CORE-LANGUAGE-ACCESSIBILITY.md` for the exact scope and the native-language, screen-reader and large-text qualifications still needed.
