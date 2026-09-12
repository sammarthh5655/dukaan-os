# BUILD-13 — Local account clarity, Hindi and keyboard access

Status: **built-unverified**. Implementation `9a6a8664617f514711bcc1287731ed28d35eeac3`; predecessor report `55486e3e54bc76b6d54fc0b7939fe3a47c11452a`. Date: 12 September 2026.

## Changes and reasons

Added visible browser-only account notices and actual local sign-up form coverage, preserving optional anonymous use. Hindi account/control text supplements the existing catalogue/checkout translations. Labels, dialog naming, focus trapping, keyboard cart controls, selected payment state, receipt text alternatives and live errors make core interactions more accessible. Saves and redraws preserve control focus. A pending redraw and delayed autofocus could previously steal keyboard focus; builder tests exposed and repaired both. Dialog failure text is announced once inside the dialog rather than duplicated in a toast.

The user delegated provider choice; Postgres/Supabase email/password registration, verification and recovery remain BUILD-19. This commit does not create an online account, provider project or reset service. See [scope and qualifications](../CORE-LANGUAGE-ACCESSIBILITY.md) and [auth integration](../AUTH-INTEGRATION.md).

## Builder evidence

- 104 module tests passed on the committed implementation. Locale inventory checks validate literal references and substitution tokens; language changes preserve IDs, money, stock and frozen receipt text.
- 12 new real-browser groups passed in Edge 152.0.4191.66, covering both repositories: actual Settings signup/mismatch, front-door duplicate error, Hindi wrong-password correction, retained shop, keyboard sale, UI logout/login, PIN correction and narrow viewport controls. Ten starting units become nine after one 100-unit-price sale; one bill survives login/reload.
- Existing 93 browser groups passed during building. The last dialog-autofocus repair was followed by the 12 focused groups, not another full 93-group run yet. VERIFY-13 must run the cumulative suite on its final runtime.
- Public build `f225e509e66b9428c3aa` and plan structure checks passed. Visually inspected the narrow Hindi settings screen and corrected excessive connectivity-label wrapping.

## Data, seams and limits

No book schema migration. The added `dukaanos.uiLanguage` preference contains only en/hi and is separate from shop data. Business transactions and receipt snapshots retain their previous definitions. All 12 new pairs need verification; shared modal/save/focus changes reopen earlier UI and protection seams.

Native Hindi review and actual NVDA/VoiceOver/TalkBack use were not performed. Root-font preference and 360-pixel tests are not comprehensive 200% text-resize certification; fixed-pixel typography remains. These claims stay experimental under D05. Secondary money/recovery workflows and some diagnostic messages still use English and remain assigned to Sprint 14. Independent reviewer: **None**. Failed final builder checks: **None** within the stated automated scope. No production deployment, upstream merge, payment, purchase or real email. The Sprint 1–10 PR branch remains pinned.

Rewind this code through Git only after preserving current shop backups. UI rollback does not roll back shop transactions or remove earlier data-version fences.
