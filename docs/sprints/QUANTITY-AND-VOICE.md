# Selling units and conservative voice interpretation

New catalogue items can declare piece, kg, g, l, ml or pack. Packs declare their content quantity and content unit. Stock and prices remain in the selling unit: 250 g of a kg-priced product is 0.25 selling units; 500 g of a 250 g pack product is two packs. Incompatible dimensions, fractional pieces/packs and unsupported precision are rejected. The editor keeps existing definitions read-only; create a new SKU to change units rather than silently reinterpret stock and historical money.

The first explicit item sets `quantityVersion: 1` in the book. Older clients reject this unknown marker. `quantitySpec` is validated, protected against later changes, included in selection fingerprints and frozen sale lines, and copied to new transfer destination items. Transfers require compatible definitions. Existing legacy items and their receipts retain their previous behavior; a measured speech request needs an explicitly known unit, not an inference from text such as “1kg” in a product name. A dedicated reviewed conversion/migration of existing SKUs is outside this slice.

Voice results preserve the spoken phrase and display the converted quantity and selling unit before adding anything. Conflicting recognition alternatives produce no selection. Missing unit quantities, multiple numbers, negative quantities and the ambiguous “peace” homophone are sent to manual lookup. A bare product still proposes one unit for explicit confirmation. Stock/unit/price changes invalidate the reviewed selection. Voice never checks out a sale automatically.

## Evidence and consent

`tests/fixtures/voice-units.json` is a synthetic **typed** corpus, currently 24 cases. Exact item/quantity matches and rejection cases are deterministic parser metrics, not speech-recognition accuracy. The browser tests inject final transcripts; they do not use a microphone or contact a speech provider. Existing consent and late-callback lock tests remain mandatory.

Recorded noisy-shop audio, accents, code-switching and target-phone recognition remain unverified under D05. Before collecting a corpus: obtain explicit participant consent for purpose, storage, retention and deletion; exclude customer/payment conversations; keep a provenance/consent manifest separate from test transcripts; record device/browser/provider and noise conditions. Do not commit identifiable audio or invent consent. Keep manual entry available, and do not promise offline browser recognition.

## Recovery and receipt compatibility

Encrypted backups include the unit marker/definitions; current clients validate them before restore. Rewinding code to a pre-unit client does not make the new book readable. Preserve backups and use a compatible client. Old frozen receipt pixels/text remain unchanged; new unit-aware receipts show the frozen selling unit and pack size. Narrow printer layout and QR/page-break qualification remain Sprint 16.
