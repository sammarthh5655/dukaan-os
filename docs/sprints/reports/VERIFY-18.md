# VERIFY-18 — Release kit verified; field milestone blocked

Verdict: **tooling checks passed, self-verified; required field acceptance blocked**. Pushed build/report `ef0cbb52609ad0d9008e9525eb36d6ef8a8c9f2d`; final test checkpoint **`89d0e62274b5892f4141a84c5ea1953f4dcb896b`**. Application assets remain byte-identical to Sprint 16. Date: 12 September 2026.

## Separate review and evidence

Reviewed the release checker, local observation input/output, public allowlist, operator drill and desktop service-worker harness. Separate CLI tests feed synthetic credentials, names, amounts, URLs and error text, and confirm none appears in output. Malformed JSON exits with a generic message and never echoes its contents. Unknown device/browser/phase remain unknown, and error listeners are removed after observation. No runtime repair was needed.

**124 module tests passed.** Re-ran **8 pilot browser groups** and **8 cumulative shop-day/statement groups** on the pushed code; both storage modes passed. These are 16 executed groups in this phase, not a claim that the full earlier 155 were rerun. Their application evidence remains current because no public runtime byte changed.

Desktop rehearsal: cached cold-open; one real offline checkout for two units at 25; stock 10 -> **8**, sale count **1**, total **50** after restart and update. A newer service worker waits with two old tabs open, activates after they close and retains the records on another offline reopen. The fixture explicitly registers the worker because localhost development deliberately skips automatic registration. Bounded, awaited state checks prevent the original harness stall. Synthetic cold-start observations were 1,400 ms buckets; these are not target-phone capacity/latency claims.

The cumulative shop-day suite again produced net sales **210**, tax **10**, cost **120**, gross profit **80**, customer balance **255**, supplier balance **280**, stock **4**, expected cash **425**, variance **-5**, and **zero reconciliation differences**. Seven CSV exports, journal replay and fresh encrypted restore matched; restored cash movement **-75**. Prior interruption/tamper/authorization checks remain recorded in VERIFY-16 on the same application bytes.

Public version **`a93414d27add65f18a44`**, 33 artifact files and digest **`2039474053b83a6c34b487aeedeef9a87df2a33eb0bcec994b3db945369f5ae5`** match the builder manifest exactly. No scripts/tests/docs or observations enter the public artifact. Structural plan and whitespace checks pass.

## Every new pair and remaining field proof

All following rows remain **blocked** as Sprint 18 field-acceptance pairs. The listed automated/tooling evidence does not replace the real pilot.

| Pair | Prepared/observed evidence and missing acceptance |
| --- | --- |
| 01–18 | Independent synthetic money/stock totals match. Named-device parallel-record accounting still required. |
| 02–18 | Existing interrupted-write tests and new restart/update rehearsal retain records. Real device power/interruption/retry drill remains open. |
| 03–18 | Legacy and IndexedDB offline/reopen/update tests pass. Representative device storage/quota/performance remains unmeasured. |
| 04–18 | Fresh encrypted restore and journal rebuild match. Operator-led lost-device/compatible-version recovery still required. |
| 05–18 | Offline UI checkout creates one saved bill; restart retains it. Field draft/retry/receipt acceptance remains open. |
| 06–18 | Customer balance 255 and complete statement export match. Paper-ledger comparison on the trial device remains required. |
| 07–18 | Return/refund effects appear in the combined day and restored statements. Native operator return/refund workflow still needs acceptance. |
| 08–18 | Supplier balance 280, delivery/partial-payment/return effects match. Real trial operator must independently reconcile them. |
| 09–18 | Count/quarantine/stock histories remain available; combined stock 4 matches replay. Physical shelf/parallel records still required. |
| 10–18 | Combined transfer/receipt/recall conserves stock. Actual staff/store assignment and device handling require field review. |
| 11–18 | Expected cash 425, counted variance -5 and cash movement -75 remain explained. Operator cash-close drill remains required. |
| 12–18 | Seven exports and zero differences pass desktop rehearsal. Signed paper-account comparison and representative workload remain open. |
| 13–18 | No signup/locale/runtime byte changed; prior automated UI checks remain valid. Native Hindi, phone and assistive-technology reviewers are missing. |
| 14–18 | Private observation fields cannot expose financial text; existing Hindi money/recovery evidence remains valid. Native financial-language review remains open. |
| 15–18 | Operator kit requires explicit selling units and reviewed voice. Real recorded-audio/phone/noise evidence remains missing. |
| 16–18 | Manifest retains the simulated narrow renderer and its exact PDF/QR evidence. Driver width, paper glyphs and scan proof remain absent. |
| 17–18 | No transport/hardware exists to test. Pair ownership moves to VERIFY-17, the first gate where a real transport and this kit will coexist; VERIFY-18 still requires its field milestone afterward. |

Matrix: **120 prior passed automated pairs, 33 blocked hardware/field pairs, 312 future planned pairs**. No absent feature is labelled N/A or passed. Earlier evidence is not invalidated by private tooling/docs/test additions that are excluded from the byte-identical public build. Any later transport, identity, schema or app change must reopen affected pairs.

## Missing evidence and handoff

Required: named phone/browser and installed-PWA upgrade; named physical printer/connection and physical scan/disconnect/reconnect; agreed participant/data/retention scope; native Hindi/assistive-technology review; representative workload; recovery owner; independent release/security/storage reviewer. These prevent pilot promotion and keep dependent Sprint 19 planned under the current roadmap. The local app remains usable; no field or production release is claimed.

Failed final automated checks: **None**. Independent reviewer: **None**. Deployment, purchases, real payments, telemetry upload, participant outreach and upstream merge: **None**. Preserve current encrypted backups before code rewind; Git does not reverse business records. The outstanding printer/device question can be answered with hardware already available; no purchase is implied.
