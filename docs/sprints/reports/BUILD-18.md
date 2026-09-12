# BUILD-18 — Local release and recovery kit

Status: **built-unverified for the tooling slice; field milestone blocked**. Code **`d74b80cb5e572c9f79838321c3b6a7946a70de75`**; predecessor pushed hardware-gate report `88ca9f2414b5deff41f7a044b2d9b77929ce2b2d`. The application remains the verified Sprint 16 runtime. Date: 12 September 2026.

## What changed and why

Added a local release-manifest checker that compares the public build byte-for-byte with source, rejects extra/missing/stale files and emits public asset hashes. Added a strict observation sanitizer and browser-test observer: phase, outcome, error class, coarse duration, browser family and device class only. Customer names, amounts, IDs, URLs, error text/stacks and credentials are excluded. No upload, automatic retention, browser-book read, telemetry hook or runtime asset was added.

The [operator kit](../../pilot/README.md) documents scope/owners, independent paper accounting, all money/stock movements, native-language/device review, cold offline startup, waiting updates, interrupted writes, encrypted fresh restore, wrong key/tamper, incident handling and code/data rollback limitations.

## Independent preparation and seam reassessment

Sprint 17 has no selected physical printer. Under the verification strategy's independent-work exception, this slice prepares release tooling against the verified Sprint 16 app. It does not promote the pilot milestone or waive VERIFY-17. No application code, schema, permissions or public asset changed. All 120 earlier automated pairs retain their exact application evidence. New Sprint 18 field pairs remain open; the 17–18 printer/toolkit integration must be checked when the real transport first coexists, at VERIFY-17, and the field milestone still requires VERIFY-18. Sprint 19 is not unlocked by this report.

## Builder checks

- **122 module tests passed**, including sanitizer privacy, stale/extra artifact rejection and observer listener cleanup.
- **8 new desktop browser groups passed** in Edge 152.0.4191.66 across both repositories: explicit local service-worker setup, cold offline reopen, real checkout and restart, waiting update with two old tabs, activation after tabs close, and another offline reopen. One two-unit sale at 25 leaves stock **8**, bill count **1**, total **50** throughout.
- Public version remains **`a93414d27add65f18a44`**, 33 reviewed artifact files including headers; manifest digest **`2039474053b83a6c34b487aeedeef9a87df2a33eb0bcec994b3db945369f5ae5`**. Plan and whitespace checks pass.
- The interrupted first test waited indefinitely for registration that the app deliberately skips on localhost. The harness now registers explicitly and uses bounded asynchronous state checks. It also waits for both tabs to be controlled. These are test setup corrections; the production worker was unchanged. Final cold-start observations were 1,400 ms buckets in this disposable desktop run, not a phone performance claim.

## Missing acceptance

No named phone/installed-PWA trial, physical printer scan/disconnect, representative workload, participant agreement, native-language/assistive-technology review or independent release reviewer is available. Actual field capacity is unmeasured. Failed final builder checks: None. Independent review: None. No deployment, purchase, real payments, participant outreach or upstream merge. VERIFY-18 must separately review the pushed kit and record these blockers rather than marking the field milestone passed.
