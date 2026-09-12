# Local pilot release and recovery kit

**Field release blocked.** This kit prepares an observed trial; it does not authorize deployment, collect participant data, or certify phone/printer compatibility. Sprint 17 needs named physical hardware, and Sprint 18 needs a named phone/browser, participant scope, native-language reviewer and recovery owner. Keep real business books separate from synthetic fixtures.

## Release identity and privacy

Run `node scripts/build-public.cjs`, then `node scripts/pilot-kit.cjs`. Save the resulting public asset hashes and `publicVersion` beside the exact Git commit in a private operator record. The checker rejects extra files and source/build mismatch. It does not read localStorage, IndexedDB, accounts, backups or environment variables. It is not an independent release approval or a source-code secret scanner; existing security/public-artifact tests remain required. Pilot reports never enter `dist`.

For voluntary local error/performance notes, `node scripts/pilot-kit.cjs --observation path-to-local-observation.json` emits a strict allowlist: phase, outcome, error class, 100 ms duration bucket, browser family and device class. Names, amounts, IDs, timestamps, URLs, stacks, error messages, credentials and arbitrary fields are discarded. Invalid evidence stays blocked/unknown. Nothing is uploaded or automatically retained. Inspect the emitted result before sharing it. Keep raw observations private and delete them according to the agreed retention period. The Playwright observer records only error presence, never the error payload.

## Operator record to complete before a trial

Record the release commit and artifact digest; named phone/tablet/computer model, OS/browser/installed-PWA version; printer model/connection/driver and measured printable width; agreed participants, trial duration and permitted data; person responsible for accounting comparison; independent security/storage reviewer; native Hindi/assistive-technology reviewer; recovery owner and a private incident channel. Do not put participant identities or real customer data in the public repository. Proposed 5,000-item/50,000-transaction capacity is unmeasured and is not a supported limit.

## Parallel-record shop-day drill

1. Start with synthetic stock, customer debt and supplier debt independently written down. Set explicit selling units. Verify store/staff assignments and establish a cash-shift opening float.
2. Record a supplier delivery with partial payment, a cash sale, a credit sale, partial collection, returned goods, refund, supplier return, stock count and a store transfer with partial receipt/recall. Each event gets a paper reference and an independently calculated stock/debt/cash expectation. Do not send real money.
3. Use English and Hindi UI, keyboard and voice review; explicitly confirm converted quantity. Cancel once, try a duplicate click and lock a pending form. Check that no unintended movement appears.
4. Close/count the shift, explain any variance, compare all seven statements/CSV exports with the paper ledger and print original/return/void receipts. Reprint after changing current shop details: original facts must remain original.
5. Compare all receipts, inventory classes and in-transit units, customer/supplier balances, refund liability and cash. Any unexplained difference stops the trial. Preserve evidence; do not repair by deleting or rewriting historical records.

## Offline, update and recovery drill

Use only a disposable profile/book until the operator has rehearsed recovery. Cache the public app online, close it, disconnect and cold-open it. Make a sale offline and reopen again. Introduce a newer service worker while two old tabs remain open: it must wait rather than replace a running till. Close all old tabs, reopen and confirm the new public version plus unchanged records. A desktop automated simulation is not proof of installation/update behavior on the pilot phone.

Inject an interrupted/rejected write in the test harness; confirm there is no success receipt and that retry commits once. Export an encrypted backup, keep it outside the app's public directory, and restore into a fresh disposable profile. Wrong password and tampered backup must reject. Compare the entire synthetic book through statements and journal replay; confirm current credentials/access/payment settings were not overwritten unintentionally. Keep the original book untouched until recovery is accepted. A Git checkout of older code does not downgrade the book schema: preserve the current backup and use a compatible forward recovery build. Do not delete source archives or close a live shop on an untested downgrade.

## Evidence checklist

Each drill row needs the exact commit/public version, device/browser, observed result, independent expectation and operator/reviewer sign-off. Record missing tests as blocked, never passed. Required field rows: cold offline start; installed-PWA update; interrupted write/retry; encrypted fresh restore; wrong key/tamper; full money/stock comparison; physical QR scan and disconnect/reconnect; native Hindi and assistive technology. No participant outreach, deployment, telemetry or paid provisioning is included.

Sprint 18 tooling may be reviewed on the verified Sprint 16 application while Sprint 17 waits for hardware. The 17–18 seam is deferred to the first real printer integration gate; the Sprint 18 milestone remains blocked until all field evidence is present. Cloud identity in Sprint 19 is still planned and cannot be represented as released by this kit.
