# Core language and accessibility scope

Sprint 13 adds the English/Hindi account and core-control dictionary in `js/core-accessibility.js`, alongside the existing keyed dictionary in `js/i18n.js`. `App.coreLocaleInventory()` exposes the new visible-string inventory. The module test checks every literal `uiText` call and `data-core-text` reference, Hindi text presence and placeholder parity. It does not prove that every English sentence anywhere in the application has been translated.

Covered flows: optional local account creation, confirmation and duplicate errors, login/logout, local-only account notice, PIN entry, navigation, product lookup/editor labels, quantity controls, payment selection, sale feedback and common stale-cart failures. The new money, stock correction, report and recovery workflows remain Sprint 14. Diagnostic validation errors outside this inventory can still fall back to English. Existing frozen receipt content is preserved; a text alternative exposes the same bill without changing exported image pixels.

Controls have associated labels, dialog titles, focus trapping and restoration, keyboard quantity/cart controls, selected payment state and live/error announcements. Global route shortcuts pause while a dialog is open. Saves and deferred redraws preserve focused controls. Touch quantity/auth/icon buttons have a 44-pixel minimum; a visible focus outline is provided.

The anonymous offline counter still opens without an account. Settings -> Turn on login moves the existing shop into the created local account. This browser-only gate does not encrypt the book, synchronize devices or provide online password recovery. A non-sensitive browser language preference lets the logged-out page retain the selected language. Provider-backed email sign-up and recovery remain Sprint 19, using the user's approved discretionary choice of Postgres/Supabase.

## Actual evidence and qualification limits

`node tests/browser-core-accessibility.cjs` uses actual Settings/front-door registration controls, login, logout, search, checkout and PIN controls with keyboard actions in fresh profiles for both storage modes. It tests mismatch/duplicate/wrong-password errors, retained shop data, focus boundaries, frozen receipts and a 360-pixel viewport. The root-font preference check is not equivalent to a full browser 200% text-resize or zoom certification: existing fixed pixel typography remains. Browser semantics and keyboard tests do not substitute for listening to NVDA, VoiceOver or TalkBack.

Native-speaker review, actual assistive-technology acceptance, Android/PWA device acceptance and comprehensive large-text qualification remain **unverified/experimental under D05**. No WCAG conformance claim. Record the reviewer, browser/device/AT version and any corrected strings before claiming those outcomes. No live accounts or messages are used by these tests.

The separate `tests/browser-core-verification.cjs` additionally checks nested-dialog focus, one error announcement and clean retry, stale callbacks after locking, and actual doubled label/input/button text in the Hindi registration dialog at 360 pixels. It inspects the browser accessibility tree. This strengthens the registration-form evidence but does not certify every screen or replace an assistive-technology user test.
