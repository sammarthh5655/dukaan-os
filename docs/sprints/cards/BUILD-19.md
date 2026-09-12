# BUILD-19 — Local backend identity and store authorization

Status: **planned**. Track: Cloud.
Sizing target: 1–2 focused engineering days; split this card before exceeding 3. This is a slice budget, not a promised date.

## Why

Cloud data must have a trusted identity boundary before any synchronization writes.

## Entry conditions

- [VERIFY-00](VERIFY-00.md) establishes the current baseline.
- Required predecessor gates: [VERIFY-12](VERIFY-12.md).
- Decision records: [D03](../DECISIONS.md), [D07](../DECISIONS.md), [D08](../DECISIONS.md).
- Use a verified integration tree. Missing decisions/hardware block only work that depends on them; reordering requires the seam reassessment in [VERIFICATION](../VERIFICATION.md).

## Build scope

Confirm provider ADR; build local/emulated backend migrations, account identity mapping, shops/stores/memberships and least-privilege allow/deny policies; store secrets only server-side.

Author-requested integration includes provider-backed email/password sign-up, verification, sign-in/out, session expiry/renewal and password reset, wired to application forms against a local/emulated provider. Use a local mail sink and explicit local-shop linking; do not upload the existing book automatically or trust local roles as server membership. See [authentication integration scope](../AUTH-INTEGRATION.md). Split this slice before implementation if it exceeds the existing size limit.

Likely touch points (current files or proposed modules, not an instruction to create all of them blindly): `new backend migrations/API`; `auth adapter`; `policy tests`.

Out of scope: Creating paid/live resources or uploading local customer records.

## Acceptance contract

Two unrelated shops and owner/cashier/removed users cannot read or mutate each other's records via direct API calls, views or functions; migration/reset works on disposable backend data.

Actual browser sign-up/verification/sign-in/reset journeys succeed against the local provider; duplicate accounts, invalid/expired/reused links, removed users and stale sessions fail safely. No reset email is sent to a real person during tests. Existing offline books survive linking cancellation and authentication failure.

Commit success must remain durable, permissions must be checked at the action boundary, and all affected existing bug/security regressions must remain passing. Builder tests should use independently derived expected results.

## Compatibility and recovery

Provisional recommendation is Postgres/Supabase, subject to local proof and operating constraints. The current local login is never treated as cloud identity.

## Integration handoff

Domain surfaces: identity, schema, persistence, release. Default next gate: [VERIFY-19](VERIFY-19.md).

The default gate assesses this build against **all 18 earlier numbered builds**, plus the pre-plan baseline. This list is not limited to directly shared files. See all rows whose later build is `BUILD-19` in [the seam matrix](../SEAM-MATRIX.md). Later builds will add this feature to their own verification. Shared-contract changes also reopen affected older-to-older rows.

## Required pushed report

Create `docs/sprints/reports/BUILD-19.md` using the [build report template](../templates/BUILD-REPORT.md). Record what changed and why, actual tests and code hash, data/schema effects, deviations, failed or missing evidence, affected seams, recovery limitations and remote push verification. Mark **built-unverified** until VERIFY-19 passes. Follow [delivery rules](../DELIVERY.md); no merge or deployment is implied.
