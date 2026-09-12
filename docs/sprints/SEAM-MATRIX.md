# Every-build seam matrix

All 465 unordered pairs are listed: 406 core pairs and 59 conditional-vault pairs. Statuses are planning records, not test results. See [verification rules](VERIFICATION.md) and machine-readable [seams.json](seams.json). Recipe meanings are in the verification rules.

The default gate is shown below. If tracks are reordered, update the actual gate to the first verification where both features coexist. A passed row requires commit-specific evidence; shared-platform tests still apply to pairs without shared domains.

| Pair | Earlier build | Later build | Gate | Recipes | Status |
| --- | --- | --- | --- | --- | --- |
| SEAM-01-02 | [BUILD-01](cards/BUILD-01.md) | [BUILD-02](cards/BUILD-02.md) | [VERIFY-02](cards/VERIFY-02.md) | BASE, MONEY, STOCK, AUTH | passed |
| SEAM-01-03 | [BUILD-01](cards/BUILD-01.md) | [BUILD-03](cards/BUILD-03.md) | [VERIFY-03](cards/VERIFY-03.md) | BASE, MONEY, STOCK, AUTH, SCHEMA | passed |
| SEAM-02-03 | [BUILD-02](cards/BUILD-02.md) | [BUILD-03](cards/BUILD-03.md) | [VERIFY-03](cards/VERIFY-03.md) | BASE, MONEY, STOCK, AUTH, STORE | passed |
| SEAM-01-04 | [BUILD-01](cards/BUILD-01.md) | [BUILD-04](cards/BUILD-04.md) | [VERIFY-04](cards/VERIFY-04.md) | BASE, MONEY, STOCK, AUTH, SCHEMA | passed |
| SEAM-02-04 | [BUILD-02](cards/BUILD-02.md) | [BUILD-04](cards/BUILD-04.md) | [VERIFY-04](cards/VERIFY-04.md) | BASE, MONEY, STOCK, AUTH, STORE | passed |
| SEAM-03-04 | [BUILD-03](cards/BUILD-03.md) | [BUILD-04](cards/BUILD-04.md) | [VERIFY-04](cards/VERIFY-04.md) | BASE, MONEY, STOCK, SCHEMA, STORE, AUTH | passed |
| SEAM-01-05 | [BUILD-01](cards/BUILD-01.md) | [BUILD-05](cards/BUILD-05.md) | [VERIFY-05](cards/VERIFY-05.md) | BASE, MONEY, STOCK, AUTH | passed |
| SEAM-02-05 | [BUILD-02](cards/BUILD-02.md) | [BUILD-05](cards/BUILD-05.md) | [VERIFY-05](cards/VERIFY-05.md) | BASE, MONEY, STOCK, AUTH, STORE, UI | passed |
| SEAM-03-05 | [BUILD-03](cards/BUILD-03.md) | [BUILD-05](cards/BUILD-05.md) | [VERIFY-05](cards/VERIFY-05.md) | BASE, MONEY, STOCK, STORE, AUTH | passed |
| SEAM-04-05 | [BUILD-04](cards/BUILD-04.md) | [BUILD-05](cards/BUILD-05.md) | [VERIFY-05](cards/VERIFY-05.md) | BASE, MONEY, STOCK, STORE, AUTH | passed |
| SEAM-01-06 | [BUILD-01](cards/BUILD-01.md) | [BUILD-06](cards/BUILD-06.md) | [VERIFY-06](cards/VERIFY-06.md) | BASE, MONEY, AUTH | passed |
| SEAM-02-06 | [BUILD-02](cards/BUILD-02.md) | [BUILD-06](cards/BUILD-06.md) | [VERIFY-06](cards/VERIFY-06.md) | BASE, MONEY, AUTH, STORE | passed |
| SEAM-03-06 | [BUILD-03](cards/BUILD-03.md) | [BUILD-06](cards/BUILD-06.md) | [VERIFY-06](cards/VERIFY-06.md) | BASE, MONEY, STORE, AUTH | passed |
| SEAM-04-06 | [BUILD-04](cards/BUILD-04.md) | [BUILD-06](cards/BUILD-06.md) | [VERIFY-06](cards/VERIFY-06.md) | BASE, MONEY, STORE, AUTH | passed |
| SEAM-05-06 | [BUILD-05](cards/BUILD-05.md) | [BUILD-06](cards/BUILD-06.md) | [VERIFY-06](cards/VERIFY-06.md) | BASE, MONEY, AUTH, STORE | passed |
| SEAM-01-07 | [BUILD-01](cards/BUILD-01.md) | [BUILD-07](cards/BUILD-07.md) | [VERIFY-07](cards/VERIFY-07.md) | BASE, MONEY, STOCK | passed |
| SEAM-02-07 | [BUILD-02](cards/BUILD-02.md) | [BUILD-07](cards/BUILD-07.md) | [VERIFY-07](cards/VERIFY-07.md) | BASE, MONEY, STOCK, STORE | passed |
| SEAM-03-07 | [BUILD-03](cards/BUILD-03.md) | [BUILD-07](cards/BUILD-07.md) | [VERIFY-07](cards/VERIFY-07.md) | BASE, MONEY, STOCK, STORE | passed |
| SEAM-04-07 | [BUILD-04](cards/BUILD-04.md) | [BUILD-07](cards/BUILD-07.md) | [VERIFY-07](cards/VERIFY-07.md) | BASE, MONEY, STOCK, STORE | passed |
| SEAM-05-07 | [BUILD-05](cards/BUILD-05.md) | [BUILD-07](cards/BUILD-07.md) | [VERIFY-07](cards/VERIFY-07.md) | BASE, MONEY, STOCK, STORE, RECEIPT | passed |
| SEAM-06-07 | [BUILD-06](cards/BUILD-06.md) | [BUILD-07](cards/BUILD-07.md) | [VERIFY-07](cards/VERIFY-07.md) | BASE, MONEY, STORE, REPORT | passed |
| SEAM-01-08 | [BUILD-01](cards/BUILD-01.md) | [BUILD-08](cards/BUILD-08.md) | [VERIFY-08](cards/VERIFY-08.md) | BASE, MONEY, STOCK | passed |
| SEAM-02-08 | [BUILD-02](cards/BUILD-02.md) | [BUILD-08](cards/BUILD-08.md) | [VERIFY-08](cards/VERIFY-08.md) | BASE, MONEY, STOCK, STORE | passed |
| SEAM-03-08 | [BUILD-03](cards/BUILD-03.md) | [BUILD-08](cards/BUILD-08.md) | [VERIFY-08](cards/VERIFY-08.md) | BASE, MONEY, STOCK, STORE | passed |
| SEAM-04-08 | [BUILD-04](cards/BUILD-04.md) | [BUILD-08](cards/BUILD-08.md) | [VERIFY-08](cards/VERIFY-08.md) | BASE, MONEY, STOCK, STORE | passed |
| SEAM-05-08 | [BUILD-05](cards/BUILD-05.md) | [BUILD-08](cards/BUILD-08.md) | [VERIFY-08](cards/VERIFY-08.md) | BASE, MONEY, STOCK, STORE | passed |
| SEAM-06-08 | [BUILD-06](cards/BUILD-06.md) | [BUILD-08](cards/BUILD-08.md) | [VERIFY-08](cards/VERIFY-08.md) | BASE, MONEY, STORE, REPORT | passed |
| SEAM-07-08 | [BUILD-07](cards/BUILD-07.md) | [BUILD-08](cards/BUILD-08.md) | [VERIFY-08](cards/VERIFY-08.md) | BASE, MONEY, STOCK, STORE, REPORT | passed |
| SEAM-01-09 | [BUILD-01](cards/BUILD-01.md) | [BUILD-09](cards/BUILD-09.md) | [VERIFY-09](cards/VERIFY-09.md) | BASE, MONEY, STOCK, AUTH | passed |
| SEAM-02-09 | [BUILD-02](cards/BUILD-02.md) | [BUILD-09](cards/BUILD-09.md) | [VERIFY-09](cards/VERIFY-09.md) | BASE, MONEY, STOCK, AUTH, STORE | passed |
| SEAM-03-09 | [BUILD-03](cards/BUILD-03.md) | [BUILD-09](cards/BUILD-09.md) | [VERIFY-09](cards/VERIFY-09.md) | BASE, MONEY, STOCK, STORE, AUTH | passed |
| SEAM-04-09 | [BUILD-04](cards/BUILD-04.md) | [BUILD-09](cards/BUILD-09.md) | [VERIFY-09](cards/VERIFY-09.md) | BASE, MONEY, STOCK, STORE, AUTH | passed |
| SEAM-05-09 | [BUILD-05](cards/BUILD-05.md) | [BUILD-09](cards/BUILD-09.md) | [VERIFY-09](cards/VERIFY-09.md) | BASE, MONEY, STOCK, AUTH, STORE | passed |
| SEAM-06-09 | [BUILD-06](cards/BUILD-06.md) | [BUILD-09](cards/BUILD-09.md) | [VERIFY-09](cards/VERIFY-09.md) | BASE, MONEY, AUTH, STORE, REPORT | passed |
| SEAM-07-09 | [BUILD-07](cards/BUILD-07.md) | [BUILD-09](cards/BUILD-09.md) | [VERIFY-09](cards/VERIFY-09.md) | BASE, MONEY, STOCK, STORE, REPORT | passed |
| SEAM-08-09 | [BUILD-08](cards/BUILD-08.md) | [BUILD-09](cards/BUILD-09.md) | [VERIFY-09](cards/VERIFY-09.md) | BASE, MONEY, STOCK, STORE, REPORT | passed |
| SEAM-01-10 | [BUILD-01](cards/BUILD-01.md) | [BUILD-10](cards/BUILD-10.md) | [VERIFY-10](cards/VERIFY-10.md) | BASE, STOCK, AUTH | passed |
| SEAM-02-10 | [BUILD-02](cards/BUILD-02.md) | [BUILD-10](cards/BUILD-10.md) | [VERIFY-10](cards/VERIFY-10.md) | BASE, STOCK, AUTH, STORE | passed |
| SEAM-03-10 | [BUILD-03](cards/BUILD-03.md) | [BUILD-10](cards/BUILD-10.md) | [VERIFY-10](cards/VERIFY-10.md) | BASE, STOCK, STORE, AUTH | passed |
| SEAM-04-10 | [BUILD-04](cards/BUILD-04.md) | [BUILD-10](cards/BUILD-10.md) | [VERIFY-10](cards/VERIFY-10.md) | BASE, STOCK, STORE, AUTH | passed |
| SEAM-05-10 | [BUILD-05](cards/BUILD-05.md) | [BUILD-10](cards/BUILD-10.md) | [VERIFY-10](cards/VERIFY-10.md) | BASE, STOCK, AUTH, STORE, RECEIPT | passed |
| SEAM-06-10 | [BUILD-06](cards/BUILD-06.md) | [BUILD-10](cards/BUILD-10.md) | [VERIFY-10](cards/VERIFY-10.md) | BASE, AUTH, STORE, REPORT | passed |
| SEAM-07-10 | [BUILD-07](cards/BUILD-07.md) | [BUILD-10](cards/BUILD-10.md) | [VERIFY-10](cards/VERIFY-10.md) | BASE, STOCK, STORE, RECEIPT, REPORT | passed |
| SEAM-08-10 | [BUILD-08](cards/BUILD-08.md) | [BUILD-10](cards/BUILD-10.md) | [VERIFY-10](cards/VERIFY-10.md) | BASE, STOCK, STORE, REPORT | passed |
| SEAM-09-10 | [BUILD-09](cards/BUILD-09.md) | [BUILD-10](cards/BUILD-10.md) | [VERIFY-10](cards/VERIFY-10.md) | BASE, STOCK, AUTH, STORE, REPORT | passed |
| SEAM-01-11 | [BUILD-01](cards/BUILD-01.md) | [BUILD-11](cards/BUILD-11.md) | [VERIFY-11](cards/VERIFY-11.md) | BASE, MONEY, AUTH | passed |
| SEAM-02-11 | [BUILD-02](cards/BUILD-02.md) | [BUILD-11](cards/BUILD-11.md) | [VERIFY-11](cards/VERIFY-11.md) | BASE, MONEY, AUTH, STORE | passed |
| SEAM-03-11 | [BUILD-03](cards/BUILD-03.md) | [BUILD-11](cards/BUILD-11.md) | [VERIFY-11](cards/VERIFY-11.md) | BASE, MONEY, STORE, AUTH | passed |
| SEAM-04-11 | [BUILD-04](cards/BUILD-04.md) | [BUILD-11](cards/BUILD-11.md) | [VERIFY-11](cards/VERIFY-11.md) | BASE, MONEY, STORE, AUTH | passed |
| SEAM-05-11 | [BUILD-05](cards/BUILD-05.md) | [BUILD-11](cards/BUILD-11.md) | [VERIFY-11](cards/VERIFY-11.md) | BASE, MONEY, AUTH, STORE | passed |
| SEAM-06-11 | [BUILD-06](cards/BUILD-06.md) | [BUILD-11](cards/BUILD-11.md) | [VERIFY-11](cards/VERIFY-11.md) | BASE, MONEY, AUTH, STORE, REPORT | passed |
| SEAM-07-11 | [BUILD-07](cards/BUILD-07.md) | [BUILD-11](cards/BUILD-11.md) | [VERIFY-11](cards/VERIFY-11.md) | BASE, MONEY, STORE, REPORT | passed |
| SEAM-08-11 | [BUILD-08](cards/BUILD-08.md) | [BUILD-11](cards/BUILD-11.md) | [VERIFY-11](cards/VERIFY-11.md) | BASE, MONEY, STORE, REPORT | passed |
| SEAM-09-11 | [BUILD-09](cards/BUILD-09.md) | [BUILD-11](cards/BUILD-11.md) | [VERIFY-11](cards/VERIFY-11.md) | BASE, MONEY, AUTH, STORE, REPORT | passed |
| SEAM-10-11 | [BUILD-10](cards/BUILD-10.md) | [BUILD-11](cards/BUILD-11.md) | [VERIFY-11](cards/VERIFY-11.md) | BASE, AUTH, STORE, REPORT | passed |
| SEAM-01-12 | [BUILD-01](cards/BUILD-01.md) | [BUILD-12](cards/BUILD-12.md) | [VERIFY-12](cards/VERIFY-12.md) | BASE, MONEY, STOCK | passed |
| SEAM-02-12 | [BUILD-02](cards/BUILD-02.md) | [BUILD-12](cards/BUILD-12.md) | [VERIFY-12](cards/VERIFY-12.md) | BASE, MONEY, STOCK, STORE | passed |
| SEAM-03-12 | [BUILD-03](cards/BUILD-03.md) | [BUILD-12](cards/BUILD-12.md) | [VERIFY-12](cards/VERIFY-12.md) | BASE, MONEY, STOCK, STORE | passed |
| SEAM-04-12 | [BUILD-04](cards/BUILD-04.md) | [BUILD-12](cards/BUILD-12.md) | [VERIFY-12](cards/VERIFY-12.md) | BASE, MONEY, STOCK, STORE | passed |
| SEAM-05-12 | [BUILD-05](cards/BUILD-05.md) | [BUILD-12](cards/BUILD-12.md) | [VERIFY-12](cards/VERIFY-12.md) | BASE, MONEY, STOCK, STORE, RECEIPT | passed |
| SEAM-06-12 | [BUILD-06](cards/BUILD-06.md) | [BUILD-12](cards/BUILD-12.md) | [VERIFY-12](cards/VERIFY-12.md) | BASE, MONEY, STORE, REPORT | passed |
| SEAM-07-12 | [BUILD-07](cards/BUILD-07.md) | [BUILD-12](cards/BUILD-12.md) | [VERIFY-12](cards/VERIFY-12.md) | BASE, MONEY, STOCK, STORE, RECEIPT, REPORT | passed |
| SEAM-08-12 | [BUILD-08](cards/BUILD-08.md) | [BUILD-12](cards/BUILD-12.md) | [VERIFY-12](cards/VERIFY-12.md) | BASE, MONEY, STOCK, STORE, REPORT | passed |
| SEAM-09-12 | [BUILD-09](cards/BUILD-09.md) | [BUILD-12](cards/BUILD-12.md) | [VERIFY-12](cards/VERIFY-12.md) | BASE, STOCK, MONEY, STORE, REPORT | passed |
| SEAM-10-12 | [BUILD-10](cards/BUILD-10.md) | [BUILD-12](cards/BUILD-12.md) | [VERIFY-12](cards/VERIFY-12.md) | BASE, STOCK, STORE, RECEIPT, REPORT | passed |
| SEAM-11-12 | [BUILD-11](cards/BUILD-11.md) | [BUILD-12](cards/BUILD-12.md) | [VERIFY-12](cards/VERIFY-12.md) | BASE, MONEY, STORE, REPORT | passed |
| SEAM-01-13 | [BUILD-01](cards/BUILD-01.md) | [BUILD-13](cards/BUILD-13.md) | [VERIFY-13](cards/VERIFY-13.md) | BASE, AUTH | passed |
| SEAM-02-13 | [BUILD-02](cards/BUILD-02.md) | [BUILD-13](cards/BUILD-13.md) | [VERIFY-13](cards/VERIFY-13.md) | BASE, AUTH, UI | passed |
| SEAM-03-13 | [BUILD-03](cards/BUILD-03.md) | [BUILD-13](cards/BUILD-13.md) | [VERIFY-13](cards/VERIFY-13.md) | BASE, AUTH | passed |
| SEAM-04-13 | [BUILD-04](cards/BUILD-04.md) | [BUILD-13](cards/BUILD-13.md) | [VERIFY-13](cards/VERIFY-13.md) | BASE, AUTH | passed |
| SEAM-05-13 | [BUILD-05](cards/BUILD-05.md) | [BUILD-13](cards/BUILD-13.md) | [VERIFY-13](cards/VERIFY-13.md) | BASE, AUTH, RECEIPT, UI | passed |
| SEAM-06-13 | [BUILD-06](cards/BUILD-06.md) | [BUILD-13](cards/BUILD-13.md) | [VERIFY-13](cards/VERIFY-13.md) | BASE, AUTH | passed |
| SEAM-07-13 | [BUILD-07](cards/BUILD-07.md) | [BUILD-13](cards/BUILD-13.md) | [VERIFY-13](cards/VERIFY-13.md) | BASE, RECEIPT | passed |
| SEAM-08-13 | [BUILD-08](cards/BUILD-08.md) | [BUILD-13](cards/BUILD-13.md) | [VERIFY-13](cards/VERIFY-13.md) | BASE | passed |
| SEAM-09-13 | [BUILD-09](cards/BUILD-09.md) | [BUILD-13](cards/BUILD-13.md) | [VERIFY-13](cards/VERIFY-13.md) | BASE, AUTH | passed |
| SEAM-10-13 | [BUILD-10](cards/BUILD-10.md) | [BUILD-13](cards/BUILD-13.md) | [VERIFY-13](cards/VERIFY-13.md) | BASE, AUTH, RECEIPT | passed |
| SEAM-11-13 | [BUILD-11](cards/BUILD-11.md) | [BUILD-13](cards/BUILD-13.md) | [VERIFY-13](cards/VERIFY-13.md) | BASE, AUTH | passed |
| SEAM-12-13 | [BUILD-12](cards/BUILD-12.md) | [BUILD-13](cards/BUILD-13.md) | [VERIFY-13](cards/VERIFY-13.md) | BASE, RECEIPT, LOCALE | passed |
| SEAM-01-14 | [BUILD-01](cards/BUILD-01.md) | [BUILD-14](cards/BUILD-14.md) | [VERIFY-14](cards/VERIFY-14.md) | BASE, MONEY, STOCK | passed |
| SEAM-02-14 | [BUILD-02](cards/BUILD-02.md) | [BUILD-14](cards/BUILD-14.md) | [VERIFY-14](cards/VERIFY-14.md) | BASE, MONEY, STOCK, UI | passed |
| SEAM-03-14 | [BUILD-03](cards/BUILD-03.md) | [BUILD-14](cards/BUILD-14.md) | [VERIFY-14](cards/VERIFY-14.md) | BASE, MONEY, STOCK | passed |
| SEAM-04-14 | [BUILD-04](cards/BUILD-04.md) | [BUILD-14](cards/BUILD-14.md) | [VERIFY-14](cards/VERIFY-14.md) | BASE, MONEY, STOCK, RECOVER | passed |
| SEAM-05-14 | [BUILD-05](cards/BUILD-05.md) | [BUILD-14](cards/BUILD-14.md) | [VERIFY-14](cards/VERIFY-14.md) | BASE, MONEY, STOCK, UI | passed |
| SEAM-06-14 | [BUILD-06](cards/BUILD-06.md) | [BUILD-14](cards/BUILD-14.md) | [VERIFY-14](cards/VERIFY-14.md) | BASE, MONEY, REPORT | passed |
| SEAM-07-14 | [BUILD-07](cards/BUILD-07.md) | [BUILD-14](cards/BUILD-14.md) | [VERIFY-14](cards/VERIFY-14.md) | BASE, MONEY, STOCK, REPORT | passed |
| SEAM-08-14 | [BUILD-08](cards/BUILD-08.md) | [BUILD-14](cards/BUILD-14.md) | [VERIFY-14](cards/VERIFY-14.md) | BASE, MONEY, STOCK, REPORT | passed |
| SEAM-09-14 | [BUILD-09](cards/BUILD-09.md) | [BUILD-14](cards/BUILD-14.md) | [VERIFY-14](cards/VERIFY-14.md) | BASE, STOCK, MONEY, REPORT | passed |
| SEAM-10-14 | [BUILD-10](cards/BUILD-10.md) | [BUILD-14](cards/BUILD-14.md) | [VERIFY-14](cards/VERIFY-14.md) | BASE, STOCK, REPORT | passed |
| SEAM-11-14 | [BUILD-11](cards/BUILD-11.md) | [BUILD-14](cards/BUILD-14.md) | [VERIFY-14](cards/VERIFY-14.md) | BASE, MONEY, REPORT | passed |
| SEAM-12-14 | [BUILD-12](cards/BUILD-12.md) | [BUILD-14](cards/BUILD-14.md) | [VERIFY-14](cards/VERIFY-14.md) | BASE, MONEY, STOCK, REPORT, LOCALE | passed |
| SEAM-13-14 | [BUILD-13](cards/BUILD-13.md) | [BUILD-14](cards/BUILD-14.md) | [VERIFY-14](cards/VERIFY-14.md) | BASE, UI, LOCALE | passed |
| SEAM-01-15 | [BUILD-01](cards/BUILD-01.md) | [BUILD-15](cards/BUILD-15.md) | [VERIFY-15](cards/VERIFY-15.md) | BASE, MONEY, STOCK, AUTH | passed |
| SEAM-02-15 | [BUILD-02](cards/BUILD-02.md) | [BUILD-15](cards/BUILD-15.md) | [VERIFY-15](cards/VERIFY-15.md) | BASE, MONEY, STOCK, AUTH, UI | passed |
| SEAM-03-15 | [BUILD-03](cards/BUILD-03.md) | [BUILD-15](cards/BUILD-15.md) | [VERIFY-15](cards/VERIFY-15.md) | BASE, MONEY, STOCK, AUTH | passed |
| SEAM-04-15 | [BUILD-04](cards/BUILD-04.md) | [BUILD-15](cards/BUILD-15.md) | [VERIFY-15](cards/VERIFY-15.md) | BASE, MONEY, STOCK, AUTH | passed |
| SEAM-05-15 | [BUILD-05](cards/BUILD-05.md) | [BUILD-15](cards/BUILD-15.md) | [VERIFY-15](cards/VERIFY-15.md) | BASE, MONEY, STOCK, AUTH, UI | passed |
| SEAM-06-15 | [BUILD-06](cards/BUILD-06.md) | [BUILD-15](cards/BUILD-15.md) | [VERIFY-15](cards/VERIFY-15.md) | BASE, MONEY, AUTH | passed |
| SEAM-07-15 | [BUILD-07](cards/BUILD-07.md) | [BUILD-15](cards/BUILD-15.md) | [VERIFY-15](cards/VERIFY-15.md) | BASE, MONEY, STOCK | passed |
| SEAM-08-15 | [BUILD-08](cards/BUILD-08.md) | [BUILD-15](cards/BUILD-15.md) | [VERIFY-15](cards/VERIFY-15.md) | BASE, MONEY, STOCK | passed |
| SEAM-09-15 | [BUILD-09](cards/BUILD-09.md) | [BUILD-15](cards/BUILD-15.md) | [VERIFY-15](cards/VERIFY-15.md) | BASE, STOCK, MONEY, AUTH | passed |
| SEAM-10-15 | [BUILD-10](cards/BUILD-10.md) | [BUILD-15](cards/BUILD-15.md) | [VERIFY-15](cards/VERIFY-15.md) | BASE, STOCK, AUTH | passed |
| SEAM-11-15 | [BUILD-11](cards/BUILD-11.md) | [BUILD-15](cards/BUILD-15.md) | [VERIFY-15](cards/VERIFY-15.md) | BASE, MONEY, AUTH | passed |
| SEAM-12-15 | [BUILD-12](cards/BUILD-12.md) | [BUILD-15](cards/BUILD-15.md) | [VERIFY-15](cards/VERIFY-15.md) | BASE, MONEY, STOCK, LOCALE | passed |
| SEAM-13-15 | [BUILD-13](cards/BUILD-13.md) | [BUILD-15](cards/BUILD-15.md) | [VERIFY-15](cards/VERIFY-15.md) | BASE, UI, LOCALE, AUTH | passed |
| SEAM-14-15 | [BUILD-14](cards/BUILD-14.md) | [BUILD-15](cards/BUILD-15.md) | [VERIFY-15](cards/VERIFY-15.md) | BASE, UI, LOCALE, MONEY, STOCK | passed |
| SEAM-01-16 | [BUILD-01](cards/BUILD-01.md) | [BUILD-16](cards/BUILD-16.md) | [VERIFY-16](cards/VERIFY-16.md) | BASE, MONEY, STOCK | passed |
| SEAM-02-16 | [BUILD-02](cards/BUILD-02.md) | [BUILD-16](cards/BUILD-16.md) | [VERIFY-16](cards/VERIFY-16.md) | BASE, MONEY, STOCK, UI | passed |
| SEAM-03-16 | [BUILD-03](cards/BUILD-03.md) | [BUILD-16](cards/BUILD-16.md) | [VERIFY-16](cards/VERIFY-16.md) | BASE, MONEY, STOCK | passed |
| SEAM-04-16 | [BUILD-04](cards/BUILD-04.md) | [BUILD-16](cards/BUILD-16.md) | [VERIFY-16](cards/VERIFY-16.md) | BASE, MONEY, STOCK | passed |
| SEAM-05-16 | [BUILD-05](cards/BUILD-05.md) | [BUILD-16](cards/BUILD-16.md) | [VERIFY-16](cards/VERIFY-16.md) | BASE, MONEY, STOCK, RECEIPT, UI | passed |
| SEAM-06-16 | [BUILD-06](cards/BUILD-06.md) | [BUILD-16](cards/BUILD-16.md) | [VERIFY-16](cards/VERIFY-16.md) | BASE, MONEY | passed |
| SEAM-07-16 | [BUILD-07](cards/BUILD-07.md) | [BUILD-16](cards/BUILD-16.md) | [VERIFY-16](cards/VERIFY-16.md) | BASE, MONEY, STOCK, RECEIPT | passed |
| SEAM-08-16 | [BUILD-08](cards/BUILD-08.md) | [BUILD-16](cards/BUILD-16.md) | [VERIFY-16](cards/VERIFY-16.md) | BASE, MONEY, STOCK | passed |
| SEAM-09-16 | [BUILD-09](cards/BUILD-09.md) | [BUILD-16](cards/BUILD-16.md) | [VERIFY-16](cards/VERIFY-16.md) | BASE, STOCK, MONEY | passed |
| SEAM-10-16 | [BUILD-10](cards/BUILD-10.md) | [BUILD-16](cards/BUILD-16.md) | [VERIFY-16](cards/VERIFY-16.md) | BASE, STOCK, RECEIPT | passed |
| SEAM-11-16 | [BUILD-11](cards/BUILD-11.md) | [BUILD-16](cards/BUILD-16.md) | [VERIFY-16](cards/VERIFY-16.md) | BASE, MONEY | passed |
| SEAM-12-16 | [BUILD-12](cards/BUILD-12.md) | [BUILD-16](cards/BUILD-16.md) | [VERIFY-16](cards/VERIFY-16.md) | BASE, MONEY, STOCK, RECEIPT, LOCALE | passed |
| SEAM-13-16 | [BUILD-13](cards/BUILD-13.md) | [BUILD-16](cards/BUILD-16.md) | [VERIFY-16](cards/VERIFY-16.md) | BASE, UI, LOCALE, RECEIPT | passed |
| SEAM-14-16 | [BUILD-14](cards/BUILD-14.md) | [BUILD-16](cards/BUILD-16.md) | [VERIFY-16](cards/VERIFY-16.md) | BASE, UI, LOCALE, MONEY, STOCK | passed |
| SEAM-15-16 | [BUILD-15](cards/BUILD-15.md) | [BUILD-16](cards/BUILD-16.md) | [VERIFY-16](cards/VERIFY-16.md) | BASE, UI, LOCALE, STOCK, MONEY | passed |
| SEAM-01-17 | [BUILD-01](cards/BUILD-01.md) | [BUILD-17](cards/BUILD-17.md) | [VERIFY-17](cards/VERIFY-17.md) | BASE, AUTH | blocked |
| SEAM-02-17 | [BUILD-02](cards/BUILD-02.md) | [BUILD-17](cards/BUILD-17.md) | [VERIFY-17](cards/VERIFY-17.md) | BASE, AUTH, UI | blocked |
| SEAM-03-17 | [BUILD-03](cards/BUILD-03.md) | [BUILD-17](cards/BUILD-17.md) | [VERIFY-17](cards/VERIFY-17.md) | BASE, AUTH | blocked |
| SEAM-04-17 | [BUILD-04](cards/BUILD-04.md) | [BUILD-17](cards/BUILD-17.md) | [VERIFY-17](cards/VERIFY-17.md) | BASE, AUTH, RELEASE | blocked |
| SEAM-05-17 | [BUILD-05](cards/BUILD-05.md) | [BUILD-17](cards/BUILD-17.md) | [VERIFY-17](cards/VERIFY-17.md) | BASE, AUTH, RECEIPT, UI | blocked |
| SEAM-06-17 | [BUILD-06](cards/BUILD-06.md) | [BUILD-17](cards/BUILD-17.md) | [VERIFY-17](cards/VERIFY-17.md) | BASE, AUTH | blocked |
| SEAM-07-17 | [BUILD-07](cards/BUILD-07.md) | [BUILD-17](cards/BUILD-17.md) | [VERIFY-17](cards/VERIFY-17.md) | BASE, RECEIPT | blocked |
| SEAM-08-17 | [BUILD-08](cards/BUILD-08.md) | [BUILD-17](cards/BUILD-17.md) | [VERIFY-17](cards/VERIFY-17.md) | BASE | blocked |
| SEAM-09-17 | [BUILD-09](cards/BUILD-09.md) | [BUILD-17](cards/BUILD-17.md) | [VERIFY-17](cards/VERIFY-17.md) | BASE, AUTH | blocked |
| SEAM-10-17 | [BUILD-10](cards/BUILD-10.md) | [BUILD-17](cards/BUILD-17.md) | [VERIFY-17](cards/VERIFY-17.md) | BASE, AUTH, RECEIPT | blocked |
| SEAM-11-17 | [BUILD-11](cards/BUILD-11.md) | [BUILD-17](cards/BUILD-17.md) | [VERIFY-17](cards/VERIFY-17.md) | BASE, AUTH | blocked |
| SEAM-12-17 | [BUILD-12](cards/BUILD-12.md) | [BUILD-17](cards/BUILD-17.md) | [VERIFY-17](cards/VERIFY-17.md) | BASE, RECEIPT, LOCALE | blocked |
| SEAM-13-17 | [BUILD-13](cards/BUILD-13.md) | [BUILD-17](cards/BUILD-17.md) | [VERIFY-17](cards/VERIFY-17.md) | BASE, UI, LOCALE, AUTH, RECEIPT | blocked |
| SEAM-14-17 | [BUILD-14](cards/BUILD-14.md) | [BUILD-17](cards/BUILD-17.md) | [VERIFY-17](cards/VERIFY-17.md) | BASE, UI, LOCALE | blocked |
| SEAM-15-17 | [BUILD-15](cards/BUILD-15.md) | [BUILD-17](cards/BUILD-17.md) | [VERIFY-17](cards/VERIFY-17.md) | BASE, UI, LOCALE, AUTH | blocked |
| SEAM-16-17 | [BUILD-16](cards/BUILD-16.md) | [BUILD-17](cards/BUILD-17.md) | [VERIFY-17](cards/VERIFY-17.md) | BASE, RECEIPT, LOCALE, UI | blocked |
| SEAM-01-18 | [BUILD-01](cards/BUILD-01.md) | [BUILD-18](cards/BUILD-18.md) | [VERIFY-18](cards/VERIFY-18.md) | BASE, MONEY, STOCK, AUTH | blocked |
| SEAM-02-18 | [BUILD-02](cards/BUILD-02.md) | [BUILD-18](cards/BUILD-18.md) | [VERIFY-18](cards/VERIFY-18.md) | BASE, MONEY, STOCK, AUTH, STORE, UI | blocked |
| SEAM-03-18 | [BUILD-03](cards/BUILD-03.md) | [BUILD-18](cards/BUILD-18.md) | [VERIFY-18](cards/VERIFY-18.md) | BASE, MONEY, STOCK, STORE, AUTH | blocked |
| SEAM-04-18 | [BUILD-04](cards/BUILD-04.md) | [BUILD-18](cards/BUILD-18.md) | [VERIFY-18](cards/VERIFY-18.md) | BASE, MONEY, STOCK, STORE, AUTH, RECOVER, RELEASE | blocked |
| SEAM-05-18 | [BUILD-05](cards/BUILD-05.md) | [BUILD-18](cards/BUILD-18.md) | [VERIFY-18](cards/VERIFY-18.md) | BASE, MONEY, STOCK, AUTH, STORE, RECEIPT, UI | blocked |
| SEAM-06-18 | [BUILD-06](cards/BUILD-06.md) | [BUILD-18](cards/BUILD-18.md) | [VERIFY-18](cards/VERIFY-18.md) | BASE, MONEY, AUTH, STORE | blocked |
| SEAM-07-18 | [BUILD-07](cards/BUILD-07.md) | [BUILD-18](cards/BUILD-18.md) | [VERIFY-18](cards/VERIFY-18.md) | BASE, MONEY, STOCK, STORE, RECEIPT | blocked |
| SEAM-08-18 | [BUILD-08](cards/BUILD-08.md) | [BUILD-18](cards/BUILD-18.md) | [VERIFY-18](cards/VERIFY-18.md) | BASE, MONEY, STOCK, STORE | blocked |
| SEAM-09-18 | [BUILD-09](cards/BUILD-09.md) | [BUILD-18](cards/BUILD-18.md) | [VERIFY-18](cards/VERIFY-18.md) | BASE, STOCK, MONEY, AUTH, STORE | blocked |
| SEAM-10-18 | [BUILD-10](cards/BUILD-10.md) | [BUILD-18](cards/BUILD-18.md) | [VERIFY-18](cards/VERIFY-18.md) | BASE, STOCK, AUTH, STORE, RECEIPT | blocked |
| SEAM-11-18 | [BUILD-11](cards/BUILD-11.md) | [BUILD-18](cards/BUILD-18.md) | [VERIFY-18](cards/VERIFY-18.md) | BASE, MONEY, AUTH, STORE | blocked |
| SEAM-12-18 | [BUILD-12](cards/BUILD-12.md) | [BUILD-18](cards/BUILD-18.md) | [VERIFY-18](cards/VERIFY-18.md) | BASE, MONEY, STOCK, STORE, RECEIPT, LOCALE | blocked |
| SEAM-13-18 | [BUILD-13](cards/BUILD-13.md) | [BUILD-18](cards/BUILD-18.md) | [VERIFY-18](cards/VERIFY-18.md) | BASE, UI, LOCALE, AUTH, RECEIPT | blocked |
| SEAM-14-18 | [BUILD-14](cards/BUILD-14.md) | [BUILD-18](cards/BUILD-18.md) | [VERIFY-18](cards/VERIFY-18.md) | BASE, UI, LOCALE, MONEY, STOCK, RECOVER | blocked |
| SEAM-15-18 | [BUILD-15](cards/BUILD-15.md) | [BUILD-18](cards/BUILD-18.md) | [VERIFY-18](cards/VERIFY-18.md) | BASE, UI, LOCALE, STOCK, MONEY, AUTH | blocked |
| SEAM-16-18 | [BUILD-16](cards/BUILD-16.md) | [BUILD-18](cards/BUILD-18.md) | [VERIFY-18](cards/VERIFY-18.md) | BASE, RECEIPT, LOCALE, MONEY, STOCK, UI | blocked |
| SEAM-17-18 | [BUILD-17](cards/BUILD-17.md) | [BUILD-18](cards/BUILD-18.md) | [VERIFY-17](cards/VERIFY-17.md) | BASE, RECEIPT, UI, LOCALE, AUTH, RELEASE | blocked |
| SEAM-01-19 | [BUILD-01](cards/BUILD-01.md) | [BUILD-19](cards/BUILD-19.md) | [VERIFY-19](cards/VERIFY-19.md) | BASE, AUTH, SCHEMA | planned |
| SEAM-02-19 | [BUILD-02](cards/BUILD-02.md) | [BUILD-19](cards/BUILD-19.md) | [VERIFY-19](cards/VERIFY-19.md) | BASE, AUTH, STORE | planned |
| SEAM-03-19 | [BUILD-03](cards/BUILD-03.md) | [BUILD-19](cards/BUILD-19.md) | [VERIFY-19](cards/VERIFY-19.md) | BASE, SCHEMA, STORE, AUTH | planned |
| SEAM-04-19 | [BUILD-04](cards/BUILD-04.md) | [BUILD-19](cards/BUILD-19.md) | [VERIFY-19](cards/VERIFY-19.md) | BASE, SCHEMA, STORE, AUTH, RELEASE | planned |
| SEAM-05-19 | [BUILD-05](cards/BUILD-05.md) | [BUILD-19](cards/BUILD-19.md) | [VERIFY-19](cards/VERIFY-19.md) | BASE, AUTH, STORE | planned |
| SEAM-06-19 | [BUILD-06](cards/BUILD-06.md) | [BUILD-19](cards/BUILD-19.md) | [VERIFY-19](cards/VERIFY-19.md) | BASE, AUTH, STORE | planned |
| SEAM-07-19 | [BUILD-07](cards/BUILD-07.md) | [BUILD-19](cards/BUILD-19.md) | [VERIFY-19](cards/VERIFY-19.md) | BASE, STORE | planned |
| SEAM-08-19 | [BUILD-08](cards/BUILD-08.md) | [BUILD-19](cards/BUILD-19.md) | [VERIFY-19](cards/VERIFY-19.md) | BASE, STORE | planned |
| SEAM-09-19 | [BUILD-09](cards/BUILD-09.md) | [BUILD-19](cards/BUILD-19.md) | [VERIFY-19](cards/VERIFY-19.md) | BASE, AUTH, STORE | planned |
| SEAM-10-19 | [BUILD-10](cards/BUILD-10.md) | [BUILD-19](cards/BUILD-19.md) | [VERIFY-19](cards/VERIFY-19.md) | BASE, AUTH, STORE | planned |
| SEAM-11-19 | [BUILD-11](cards/BUILD-11.md) | [BUILD-19](cards/BUILD-19.md) | [VERIFY-19](cards/VERIFY-19.md) | BASE, AUTH, STORE | planned |
| SEAM-12-19 | [BUILD-12](cards/BUILD-12.md) | [BUILD-19](cards/BUILD-19.md) | [VERIFY-19](cards/VERIFY-19.md) | BASE, STORE | planned |
| SEAM-13-19 | [BUILD-13](cards/BUILD-13.md) | [BUILD-19](cards/BUILD-19.md) | [VERIFY-19](cards/VERIFY-19.md) | BASE, AUTH | planned |
| SEAM-14-19 | [BUILD-14](cards/BUILD-14.md) | [BUILD-19](cards/BUILD-19.md) | [VERIFY-19](cards/VERIFY-19.md) | BASE | planned |
| SEAM-15-19 | [BUILD-15](cards/BUILD-15.md) | [BUILD-19](cards/BUILD-19.md) | [VERIFY-19](cards/VERIFY-19.md) | BASE, AUTH | planned |
| SEAM-16-19 | [BUILD-16](cards/BUILD-16.md) | [BUILD-19](cards/BUILD-19.md) | [VERIFY-19](cards/VERIFY-19.md) | BASE | planned |
| SEAM-17-19 | [BUILD-17](cards/BUILD-17.md) | [BUILD-19](cards/BUILD-19.md) | [VERIFY-19](cards/VERIFY-19.md) | BASE, AUTH, RELEASE | planned |
| SEAM-18-19 | [BUILD-18](cards/BUILD-18.md) | [BUILD-19](cards/BUILD-19.md) | [VERIFY-19](cards/VERIFY-19.md) | BASE, AUTH, STORE, RELEASE | planned |
| SEAM-01-20 | [BUILD-01](cards/BUILD-01.md) | [BUILD-20](cards/BUILD-20.md) | [VERIFY-20](cards/VERIFY-20.md) | BASE, MONEY, STOCK, AUTH, SCHEMA | planned |
| SEAM-02-20 | [BUILD-02](cards/BUILD-02.md) | [BUILD-20](cards/BUILD-20.md) | [VERIFY-20](cards/VERIFY-20.md) | BASE, MONEY, STOCK, AUTH, STORE | planned |
| SEAM-03-20 | [BUILD-03](cards/BUILD-03.md) | [BUILD-20](cards/BUILD-20.md) | [VERIFY-20](cards/VERIFY-20.md) | BASE, MONEY, STOCK, SCHEMA, STORE, AUTH | planned |
| SEAM-04-20 | [BUILD-04](cards/BUILD-04.md) | [BUILD-20](cards/BUILD-20.md) | [VERIFY-20](cards/VERIFY-20.md) | BASE, MONEY, STOCK, SCHEMA, STORE, AUTH | planned |
| SEAM-05-20 | [BUILD-05](cards/BUILD-05.md) | [BUILD-20](cards/BUILD-20.md) | [VERIFY-20](cards/VERIFY-20.md) | BASE, MONEY, STOCK, AUTH, STORE | planned |
| SEAM-06-20 | [BUILD-06](cards/BUILD-06.md) | [BUILD-20](cards/BUILD-20.md) | [VERIFY-20](cards/VERIFY-20.md) | BASE, MONEY, AUTH, STORE, REPORT | planned |
| SEAM-07-20 | [BUILD-07](cards/BUILD-07.md) | [BUILD-20](cards/BUILD-20.md) | [VERIFY-20](cards/VERIFY-20.md) | BASE, MONEY, STOCK, STORE, REPORT | planned |
| SEAM-08-20 | [BUILD-08](cards/BUILD-08.md) | [BUILD-20](cards/BUILD-20.md) | [VERIFY-20](cards/VERIFY-20.md) | BASE, MONEY, STOCK, STORE, REPORT | planned |
| SEAM-09-20 | [BUILD-09](cards/BUILD-09.md) | [BUILD-20](cards/BUILD-20.md) | [VERIFY-20](cards/VERIFY-20.md) | BASE, STOCK, MONEY, AUTH, STORE, REPORT | planned |
| SEAM-10-20 | [BUILD-10](cards/BUILD-10.md) | [BUILD-20](cards/BUILD-20.md) | [VERIFY-20](cards/VERIFY-20.md) | BASE, STOCK, AUTH, STORE, REPORT | planned |
| SEAM-11-20 | [BUILD-11](cards/BUILD-11.md) | [BUILD-20](cards/BUILD-20.md) | [VERIFY-20](cards/VERIFY-20.md) | BASE, MONEY, AUTH, STORE, REPORT | planned |
| SEAM-12-20 | [BUILD-12](cards/BUILD-12.md) | [BUILD-20](cards/BUILD-20.md) | [VERIFY-20](cards/VERIFY-20.md) | BASE, MONEY, STOCK, STORE, REPORT | planned |
| SEAM-13-20 | [BUILD-13](cards/BUILD-13.md) | [BUILD-20](cards/BUILD-20.md) | [VERIFY-20](cards/VERIFY-20.md) | BASE, AUTH | planned |
| SEAM-14-20 | [BUILD-14](cards/BUILD-14.md) | [BUILD-20](cards/BUILD-20.md) | [VERIFY-20](cards/VERIFY-20.md) | BASE, MONEY, STOCK, REPORT | planned |
| SEAM-15-20 | [BUILD-15](cards/BUILD-15.md) | [BUILD-20](cards/BUILD-20.md) | [VERIFY-20](cards/VERIFY-20.md) | BASE, STOCK, MONEY, AUTH | planned |
| SEAM-16-20 | [BUILD-16](cards/BUILD-16.md) | [BUILD-20](cards/BUILD-20.md) | [VERIFY-20](cards/VERIFY-20.md) | BASE, MONEY, STOCK | planned |
| SEAM-17-20 | [BUILD-17](cards/BUILD-17.md) | [BUILD-20](cards/BUILD-20.md) | [VERIFY-20](cards/VERIFY-20.md) | BASE, AUTH | planned |
| SEAM-18-20 | [BUILD-18](cards/BUILD-18.md) | [BUILD-20](cards/BUILD-20.md) | [VERIFY-20](cards/VERIFY-20.md) | BASE, MONEY, STOCK, AUTH, STORE | planned |
| SEAM-19-20 | [BUILD-19](cards/BUILD-19.md) | [BUILD-20](cards/BUILD-20.md) | [VERIFY-20](cards/VERIFY-20.md) | BASE, AUTH, SCHEMA, STORE | planned |
| SEAM-01-21 | [BUILD-01](cards/BUILD-01.md) | [BUILD-21](cards/BUILD-21.md) | [VERIFY-21](cards/VERIFY-21.md) | BASE, MONEY, STOCK, AUTH | planned |
| SEAM-02-21 | [BUILD-02](cards/BUILD-02.md) | [BUILD-21](cards/BUILD-21.md) | [VERIFY-21](cards/VERIFY-21.md) | BASE, MONEY, STOCK, AUTH, STORE, UI | planned |
| SEAM-03-21 | [BUILD-03](cards/BUILD-03.md) | [BUILD-21](cards/BUILD-21.md) | [VERIFY-21](cards/VERIFY-21.md) | BASE, MONEY, STOCK, STORE, AUTH | planned |
| SEAM-04-21 | [BUILD-04](cards/BUILD-04.md) | [BUILD-21](cards/BUILD-21.md) | [VERIFY-21](cards/VERIFY-21.md) | BASE, MONEY, STOCK, STORE, AUTH, RECOVER | planned |
| SEAM-05-21 | [BUILD-05](cards/BUILD-05.md) | [BUILD-21](cards/BUILD-21.md) | [VERIFY-21](cards/VERIFY-21.md) | BASE, MONEY, STOCK, AUTH, STORE, UI | planned |
| SEAM-06-21 | [BUILD-06](cards/BUILD-06.md) | [BUILD-21](cards/BUILD-21.md) | [VERIFY-21](cards/VERIFY-21.md) | BASE, MONEY, AUTH, STORE | planned |
| SEAM-07-21 | [BUILD-07](cards/BUILD-07.md) | [BUILD-21](cards/BUILD-21.md) | [VERIFY-21](cards/VERIFY-21.md) | BASE, MONEY, STOCK, STORE | planned |
| SEAM-08-21 | [BUILD-08](cards/BUILD-08.md) | [BUILD-21](cards/BUILD-21.md) | [VERIFY-21](cards/VERIFY-21.md) | BASE, MONEY, STOCK, STORE | planned |
| SEAM-09-21 | [BUILD-09](cards/BUILD-09.md) | [BUILD-21](cards/BUILD-21.md) | [VERIFY-21](cards/VERIFY-21.md) | BASE, STOCK, MONEY, AUTH, STORE | planned |
| SEAM-10-21 | [BUILD-10](cards/BUILD-10.md) | [BUILD-21](cards/BUILD-21.md) | [VERIFY-21](cards/VERIFY-21.md) | BASE, STOCK, AUTH, STORE | planned |
| SEAM-11-21 | [BUILD-11](cards/BUILD-11.md) | [BUILD-21](cards/BUILD-21.md) | [VERIFY-21](cards/VERIFY-21.md) | BASE, MONEY, AUTH, STORE | planned |
| SEAM-12-21 | [BUILD-12](cards/BUILD-12.md) | [BUILD-21](cards/BUILD-21.md) | [VERIFY-21](cards/VERIFY-21.md) | BASE, MONEY, STOCK, STORE | planned |
| SEAM-13-21 | [BUILD-13](cards/BUILD-13.md) | [BUILD-21](cards/BUILD-21.md) | [VERIFY-21](cards/VERIFY-21.md) | BASE, UI, AUTH | planned |
| SEAM-14-21 | [BUILD-14](cards/BUILD-14.md) | [BUILD-21](cards/BUILD-21.md) | [VERIFY-21](cards/VERIFY-21.md) | BASE, UI, MONEY, STOCK, RECOVER | planned |
| SEAM-15-21 | [BUILD-15](cards/BUILD-15.md) | [BUILD-21](cards/BUILD-21.md) | [VERIFY-21](cards/VERIFY-21.md) | BASE, UI, STOCK, MONEY, AUTH | planned |
| SEAM-16-21 | [BUILD-16](cards/BUILD-16.md) | [BUILD-21](cards/BUILD-21.md) | [VERIFY-21](cards/VERIFY-21.md) | BASE, MONEY, STOCK, UI | planned |
| SEAM-17-21 | [BUILD-17](cards/BUILD-17.md) | [BUILD-21](cards/BUILD-21.md) | [VERIFY-21](cards/VERIFY-21.md) | BASE, UI, AUTH | planned |
| SEAM-18-21 | [BUILD-18](cards/BUILD-18.md) | [BUILD-21](cards/BUILD-21.md) | [VERIFY-21](cards/VERIFY-21.md) | BASE, MONEY, STOCK, AUTH, STORE, RECOVER, UI | planned |
| SEAM-19-21 | [BUILD-19](cards/BUILD-19.md) | [BUILD-21](cards/BUILD-21.md) | [VERIFY-21](cards/VERIFY-21.md) | BASE, AUTH, STORE | planned |
| SEAM-20-21 | [BUILD-20](cards/BUILD-20.md) | [BUILD-21](cards/BUILD-21.md) | [VERIFY-21](cards/VERIFY-21.md) | BASE, MONEY, STOCK, AUTH, STORE | planned |
| SEAM-01-22 | [BUILD-01](cards/BUILD-01.md) | [BUILD-22](cards/BUILD-22.md) | [VERIFY-22](cards/VERIFY-22.md) | BASE, MONEY, STOCK, AUTH, SCHEMA | planned |
| SEAM-02-22 | [BUILD-02](cards/BUILD-02.md) | [BUILD-22](cards/BUILD-22.md) | [VERIFY-22](cards/VERIFY-22.md) | BASE, MONEY, STOCK, AUTH, STORE, UI | planned |
| SEAM-03-22 | [BUILD-03](cards/BUILD-03.md) | [BUILD-22](cards/BUILD-22.md) | [VERIFY-22](cards/VERIFY-22.md) | BASE, MONEY, STOCK, SCHEMA, STORE, AUTH | planned |
| SEAM-04-22 | [BUILD-04](cards/BUILD-04.md) | [BUILD-22](cards/BUILD-22.md) | [VERIFY-22](cards/VERIFY-22.md) | BASE, MONEY, STOCK, SCHEMA, STORE, AUTH, RECOVER | planned |
| SEAM-05-22 | [BUILD-05](cards/BUILD-05.md) | [BUILD-22](cards/BUILD-22.md) | [VERIFY-22](cards/VERIFY-22.md) | BASE, MONEY, STOCK, AUTH, STORE, UI | planned |
| SEAM-06-22 | [BUILD-06](cards/BUILD-06.md) | [BUILD-22](cards/BUILD-22.md) | [VERIFY-22](cards/VERIFY-22.md) | BASE, MONEY, AUTH, STORE | planned |
| SEAM-07-22 | [BUILD-07](cards/BUILD-07.md) | [BUILD-22](cards/BUILD-22.md) | [VERIFY-22](cards/VERIFY-22.md) | BASE, MONEY, STOCK, STORE | planned |
| SEAM-08-22 | [BUILD-08](cards/BUILD-08.md) | [BUILD-22](cards/BUILD-22.md) | [VERIFY-22](cards/VERIFY-22.md) | BASE, MONEY, STOCK, STORE | planned |
| SEAM-09-22 | [BUILD-09](cards/BUILD-09.md) | [BUILD-22](cards/BUILD-22.md) | [VERIFY-22](cards/VERIFY-22.md) | BASE, STOCK, MONEY, AUTH, STORE | planned |
| SEAM-10-22 | [BUILD-10](cards/BUILD-10.md) | [BUILD-22](cards/BUILD-22.md) | [VERIFY-22](cards/VERIFY-22.md) | BASE, STOCK, AUTH, STORE | planned |
| SEAM-11-22 | [BUILD-11](cards/BUILD-11.md) | [BUILD-22](cards/BUILD-22.md) | [VERIFY-22](cards/VERIFY-22.md) | BASE, MONEY, AUTH, STORE | planned |
| SEAM-12-22 | [BUILD-12](cards/BUILD-12.md) | [BUILD-22](cards/BUILD-22.md) | [VERIFY-22](cards/VERIFY-22.md) | BASE, MONEY, STOCK, STORE | planned |
| SEAM-13-22 | [BUILD-13](cards/BUILD-13.md) | [BUILD-22](cards/BUILD-22.md) | [VERIFY-22](cards/VERIFY-22.md) | BASE, UI, AUTH | planned |
| SEAM-14-22 | [BUILD-14](cards/BUILD-14.md) | [BUILD-22](cards/BUILD-22.md) | [VERIFY-22](cards/VERIFY-22.md) | BASE, UI, MONEY, STOCK, RECOVER | planned |
| SEAM-15-22 | [BUILD-15](cards/BUILD-15.md) | [BUILD-22](cards/BUILD-22.md) | [VERIFY-22](cards/VERIFY-22.md) | BASE, UI, STOCK, MONEY, AUTH | planned |
| SEAM-16-22 | [BUILD-16](cards/BUILD-16.md) | [BUILD-22](cards/BUILD-22.md) | [VERIFY-22](cards/VERIFY-22.md) | BASE, MONEY, STOCK, UI | planned |
| SEAM-17-22 | [BUILD-17](cards/BUILD-17.md) | [BUILD-22](cards/BUILD-22.md) | [VERIFY-22](cards/VERIFY-22.md) | BASE, UI, AUTH | planned |
| SEAM-18-22 | [BUILD-18](cards/BUILD-18.md) | [BUILD-22](cards/BUILD-22.md) | [VERIFY-22](cards/VERIFY-22.md) | BASE, MONEY, STOCK, AUTH, STORE, RECOVER, UI | planned |
| SEAM-19-22 | [BUILD-19](cards/BUILD-19.md) | [BUILD-22](cards/BUILD-22.md) | [VERIFY-22](cards/VERIFY-22.md) | BASE, AUTH, SCHEMA, STORE | planned |
| SEAM-20-22 | [BUILD-20](cards/BUILD-20.md) | [BUILD-22](cards/BUILD-22.md) | [VERIFY-22](cards/VERIFY-22.md) | BASE, MONEY, STOCK, AUTH, SCHEMA, STORE | planned |
| SEAM-21-22 | [BUILD-21](cards/BUILD-21.md) | [BUILD-22](cards/BUILD-22.md) | [VERIFY-22](cards/VERIFY-22.md) | BASE, MONEY, STOCK, AUTH, STORE, RECOVER, UI | planned |
| SEAM-01-23 | [BUILD-01](cards/BUILD-01.md) | [BUILD-23](cards/BUILD-23.md) | [VERIFY-23](cards/VERIFY-23.md) | BASE, MONEY, STOCK, AUTH | planned |
| SEAM-02-23 | [BUILD-02](cards/BUILD-02.md) | [BUILD-23](cards/BUILD-23.md) | [VERIFY-23](cards/VERIFY-23.md) | BASE, MONEY, STOCK, AUTH, STORE, UI | planned |
| SEAM-03-23 | [BUILD-03](cards/BUILD-03.md) | [BUILD-23](cards/BUILD-23.md) | [VERIFY-23](cards/VERIFY-23.md) | BASE, MONEY, STOCK, STORE, AUTH | planned |
| SEAM-04-23 | [BUILD-04](cards/BUILD-04.md) | [BUILD-23](cards/BUILD-23.md) | [VERIFY-23](cards/VERIFY-23.md) | BASE, MONEY, STOCK, STORE, AUTH, RECOVER | planned |
| SEAM-05-23 | [BUILD-05](cards/BUILD-05.md) | [BUILD-23](cards/BUILD-23.md) | [VERIFY-23](cards/VERIFY-23.md) | BASE, MONEY, STOCK, AUTH, STORE, UI | planned |
| SEAM-06-23 | [BUILD-06](cards/BUILD-06.md) | [BUILD-23](cards/BUILD-23.md) | [VERIFY-23](cards/VERIFY-23.md) | BASE, MONEY, AUTH, STORE | planned |
| SEAM-07-23 | [BUILD-07](cards/BUILD-07.md) | [BUILD-23](cards/BUILD-23.md) | [VERIFY-23](cards/VERIFY-23.md) | BASE, MONEY, STOCK, STORE | planned |
| SEAM-08-23 | [BUILD-08](cards/BUILD-08.md) | [BUILD-23](cards/BUILD-23.md) | [VERIFY-23](cards/VERIFY-23.md) | BASE, MONEY, STOCK, STORE | planned |
| SEAM-09-23 | [BUILD-09](cards/BUILD-09.md) | [BUILD-23](cards/BUILD-23.md) | [VERIFY-23](cards/VERIFY-23.md) | BASE, STOCK, MONEY, AUTH, STORE | planned |
| SEAM-10-23 | [BUILD-10](cards/BUILD-10.md) | [BUILD-23](cards/BUILD-23.md) | [VERIFY-23](cards/VERIFY-23.md) | BASE, STOCK, AUTH, STORE | planned |
| SEAM-11-23 | [BUILD-11](cards/BUILD-11.md) | [BUILD-23](cards/BUILD-23.md) | [VERIFY-23](cards/VERIFY-23.md) | BASE, MONEY, AUTH, STORE | planned |
| SEAM-12-23 | [BUILD-12](cards/BUILD-12.md) | [BUILD-23](cards/BUILD-23.md) | [VERIFY-23](cards/VERIFY-23.md) | BASE, MONEY, STOCK, STORE | planned |
| SEAM-13-23 | [BUILD-13](cards/BUILD-13.md) | [BUILD-23](cards/BUILD-23.md) | [VERIFY-23](cards/VERIFY-23.md) | BASE, UI, AUTH | planned |
| SEAM-14-23 | [BUILD-14](cards/BUILD-14.md) | [BUILD-23](cards/BUILD-23.md) | [VERIFY-23](cards/VERIFY-23.md) | BASE, UI, MONEY, STOCK, RECOVER | planned |
| SEAM-15-23 | [BUILD-15](cards/BUILD-15.md) | [BUILD-23](cards/BUILD-23.md) | [VERIFY-23](cards/VERIFY-23.md) | BASE, UI, STOCK, MONEY, AUTH | planned |
| SEAM-16-23 | [BUILD-16](cards/BUILD-16.md) | [BUILD-23](cards/BUILD-23.md) | [VERIFY-23](cards/VERIFY-23.md) | BASE, MONEY, STOCK, UI | planned |
| SEAM-17-23 | [BUILD-17](cards/BUILD-17.md) | [BUILD-23](cards/BUILD-23.md) | [VERIFY-23](cards/VERIFY-23.md) | BASE, UI, AUTH | planned |
| SEAM-18-23 | [BUILD-18](cards/BUILD-18.md) | [BUILD-23](cards/BUILD-23.md) | [VERIFY-23](cards/VERIFY-23.md) | BASE, MONEY, STOCK, AUTH, STORE, RECOVER, UI | planned |
| SEAM-19-23 | [BUILD-19](cards/BUILD-19.md) | [BUILD-23](cards/BUILD-23.md) | [VERIFY-23](cards/VERIFY-23.md) | BASE, AUTH, STORE | planned |
| SEAM-20-23 | [BUILD-20](cards/BUILD-20.md) | [BUILD-23](cards/BUILD-23.md) | [VERIFY-23](cards/VERIFY-23.md) | BASE, MONEY, STOCK, AUTH, STORE | planned |
| SEAM-21-23 | [BUILD-21](cards/BUILD-21.md) | [BUILD-23](cards/BUILD-23.md) | [VERIFY-23](cards/VERIFY-23.md) | BASE, MONEY, STOCK, AUTH, STORE, RECOVER, UI | planned |
| SEAM-22-23 | [BUILD-22](cards/BUILD-22.md) | [BUILD-23](cards/BUILD-23.md) | [VERIFY-23](cards/VERIFY-23.md) | BASE, MONEY, STOCK, AUTH, STORE, RECOVER, UI | planned |
| SEAM-01-24 | [BUILD-01](cards/BUILD-01.md) | [BUILD-24](cards/BUILD-24.md) | [VERIFY-24](cards/VERIFY-24.md) | BASE, MONEY, STOCK, AUTH, SCHEMA | planned |
| SEAM-02-24 | [BUILD-02](cards/BUILD-02.md) | [BUILD-24](cards/BUILD-24.md) | [VERIFY-24](cards/VERIFY-24.md) | BASE, MONEY, STOCK, AUTH, STORE, UI | planned |
| SEAM-03-24 | [BUILD-03](cards/BUILD-03.md) | [BUILD-24](cards/BUILD-24.md) | [VERIFY-24](cards/VERIFY-24.md) | BASE, MONEY, STOCK, SCHEMA, STORE, AUTH | planned |
| SEAM-04-24 | [BUILD-04](cards/BUILD-04.md) | [BUILD-24](cards/BUILD-24.md) | [VERIFY-24](cards/VERIFY-24.md) | BASE, MONEY, STOCK, SCHEMA, STORE, AUTH, RECOVER | planned |
| SEAM-05-24 | [BUILD-05](cards/BUILD-05.md) | [BUILD-24](cards/BUILD-24.md) | [VERIFY-24](cards/VERIFY-24.md) | BASE, MONEY, STOCK, AUTH, STORE, UI | planned |
| SEAM-06-24 | [BUILD-06](cards/BUILD-06.md) | [BUILD-24](cards/BUILD-24.md) | [VERIFY-24](cards/VERIFY-24.md) | BASE, MONEY, AUTH, STORE, REPORT | planned |
| SEAM-07-24 | [BUILD-07](cards/BUILD-07.md) | [BUILD-24](cards/BUILD-24.md) | [VERIFY-24](cards/VERIFY-24.md) | BASE, MONEY, STOCK, STORE, REPORT | planned |
| SEAM-08-24 | [BUILD-08](cards/BUILD-08.md) | [BUILD-24](cards/BUILD-24.md) | [VERIFY-24](cards/VERIFY-24.md) | BASE, MONEY, STOCK, STORE, REPORT | planned |
| SEAM-09-24 | [BUILD-09](cards/BUILD-09.md) | [BUILD-24](cards/BUILD-24.md) | [VERIFY-24](cards/VERIFY-24.md) | BASE, STOCK, MONEY, AUTH, STORE, REPORT | planned |
| SEAM-10-24 | [BUILD-10](cards/BUILD-10.md) | [BUILD-24](cards/BUILD-24.md) | [VERIFY-24](cards/VERIFY-24.md) | BASE, STOCK, AUTH, STORE, REPORT | planned |
| SEAM-11-24 | [BUILD-11](cards/BUILD-11.md) | [BUILD-24](cards/BUILD-24.md) | [VERIFY-24](cards/VERIFY-24.md) | BASE, MONEY, AUTH, STORE, REPORT | planned |
| SEAM-12-24 | [BUILD-12](cards/BUILD-12.md) | [BUILD-24](cards/BUILD-24.md) | [VERIFY-24](cards/VERIFY-24.md) | BASE, MONEY, STOCK, STORE, REPORT | planned |
| SEAM-13-24 | [BUILD-13](cards/BUILD-13.md) | [BUILD-24](cards/BUILD-24.md) | [VERIFY-24](cards/VERIFY-24.md) | BASE, UI, AUTH | planned |
| SEAM-14-24 | [BUILD-14](cards/BUILD-14.md) | [BUILD-24](cards/BUILD-24.md) | [VERIFY-24](cards/VERIFY-24.md) | BASE, UI, MONEY, STOCK, RECOVER, REPORT | planned |
| SEAM-15-24 | [BUILD-15](cards/BUILD-15.md) | [BUILD-24](cards/BUILD-24.md) | [VERIFY-24](cards/VERIFY-24.md) | BASE, UI, STOCK, MONEY, AUTH | planned |
| SEAM-16-24 | [BUILD-16](cards/BUILD-16.md) | [BUILD-24](cards/BUILD-24.md) | [VERIFY-24](cards/VERIFY-24.md) | BASE, MONEY, STOCK, UI | planned |
| SEAM-17-24 | [BUILD-17](cards/BUILD-17.md) | [BUILD-24](cards/BUILD-24.md) | [VERIFY-24](cards/VERIFY-24.md) | BASE, UI, AUTH | planned |
| SEAM-18-24 | [BUILD-18](cards/BUILD-18.md) | [BUILD-24](cards/BUILD-24.md) | [VERIFY-24](cards/VERIFY-24.md) | BASE, MONEY, STOCK, AUTH, STORE, RECOVER, UI | planned |
| SEAM-19-24 | [BUILD-19](cards/BUILD-19.md) | [BUILD-24](cards/BUILD-24.md) | [VERIFY-24](cards/VERIFY-24.md) | BASE, AUTH, SCHEMA, STORE | planned |
| SEAM-20-24 | [BUILD-20](cards/BUILD-20.md) | [BUILD-24](cards/BUILD-24.md) | [VERIFY-24](cards/VERIFY-24.md) | BASE, MONEY, STOCK, AUTH, SCHEMA, STORE, REPORT | planned |
| SEAM-21-24 | [BUILD-21](cards/BUILD-21.md) | [BUILD-24](cards/BUILD-24.md) | [VERIFY-24](cards/VERIFY-24.md) | BASE, MONEY, STOCK, AUTH, STORE, RECOVER, UI | planned |
| SEAM-22-24 | [BUILD-22](cards/BUILD-22.md) | [BUILD-24](cards/BUILD-24.md) | [VERIFY-24](cards/VERIFY-24.md) | BASE, MONEY, STOCK, AUTH, SCHEMA, STORE, RECOVER, UI | planned |
| SEAM-23-24 | [BUILD-23](cards/BUILD-23.md) | [BUILD-24](cards/BUILD-24.md) | [VERIFY-24](cards/VERIFY-24.md) | BASE, MONEY, STOCK, AUTH, STORE, RECOVER, UI | planned |
| SEAM-01-25 | [BUILD-01](cards/BUILD-01.md) | [BUILD-25](cards/BUILD-25.md) | [VERIFY-25](cards/VERIFY-25.md) | BASE, MONEY, STOCK, AUTH, SCHEMA | planned |
| SEAM-02-25 | [BUILD-02](cards/BUILD-02.md) | [BUILD-25](cards/BUILD-25.md) | [VERIFY-25](cards/VERIFY-25.md) | BASE, MONEY, STOCK, AUTH, STORE, UI | planned |
| SEAM-03-25 | [BUILD-03](cards/BUILD-03.md) | [BUILD-25](cards/BUILD-25.md) | [VERIFY-25](cards/VERIFY-25.md) | BASE, MONEY, STOCK, SCHEMA, STORE, AUTH | planned |
| SEAM-04-25 | [BUILD-04](cards/BUILD-04.md) | [BUILD-25](cards/BUILD-25.md) | [VERIFY-25](cards/VERIFY-25.md) | BASE, MONEY, STOCK, SCHEMA, STORE, AUTH, RECOVER, RELEASE | planned |
| SEAM-05-25 | [BUILD-05](cards/BUILD-05.md) | [BUILD-25](cards/BUILD-25.md) | [VERIFY-25](cards/VERIFY-25.md) | BASE, MONEY, STOCK, AUTH, STORE, UI | planned |
| SEAM-06-25 | [BUILD-06](cards/BUILD-06.md) | [BUILD-25](cards/BUILD-25.md) | [VERIFY-25](cards/VERIFY-25.md) | BASE, MONEY, AUTH, STORE, REPORT | planned |
| SEAM-07-25 | [BUILD-07](cards/BUILD-07.md) | [BUILD-25](cards/BUILD-25.md) | [VERIFY-25](cards/VERIFY-25.md) | BASE, MONEY, STOCK, STORE, REPORT | planned |
| SEAM-08-25 | [BUILD-08](cards/BUILD-08.md) | [BUILD-25](cards/BUILD-25.md) | [VERIFY-25](cards/VERIFY-25.md) | BASE, MONEY, STOCK, STORE, REPORT | planned |
| SEAM-09-25 | [BUILD-09](cards/BUILD-09.md) | [BUILD-25](cards/BUILD-25.md) | [VERIFY-25](cards/VERIFY-25.md) | BASE, STOCK, MONEY, AUTH, STORE, REPORT | planned |
| SEAM-10-25 | [BUILD-10](cards/BUILD-10.md) | [BUILD-25](cards/BUILD-25.md) | [VERIFY-25](cards/VERIFY-25.md) | BASE, STOCK, AUTH, STORE, REPORT | planned |
| SEAM-11-25 | [BUILD-11](cards/BUILD-11.md) | [BUILD-25](cards/BUILD-25.md) | [VERIFY-25](cards/VERIFY-25.md) | BASE, MONEY, AUTH, STORE, REPORT | planned |
| SEAM-12-25 | [BUILD-12](cards/BUILD-12.md) | [BUILD-25](cards/BUILD-25.md) | [VERIFY-25](cards/VERIFY-25.md) | BASE, MONEY, STOCK, STORE, REPORT | planned |
| SEAM-13-25 | [BUILD-13](cards/BUILD-13.md) | [BUILD-25](cards/BUILD-25.md) | [VERIFY-25](cards/VERIFY-25.md) | BASE, UI, AUTH | planned |
| SEAM-14-25 | [BUILD-14](cards/BUILD-14.md) | [BUILD-25](cards/BUILD-25.md) | [VERIFY-25](cards/VERIFY-25.md) | BASE, UI, MONEY, STOCK, RECOVER, REPORT | planned |
| SEAM-15-25 | [BUILD-15](cards/BUILD-15.md) | [BUILD-25](cards/BUILD-25.md) | [VERIFY-25](cards/VERIFY-25.md) | BASE, UI, STOCK, MONEY, AUTH | planned |
| SEAM-16-25 | [BUILD-16](cards/BUILD-16.md) | [BUILD-25](cards/BUILD-25.md) | [VERIFY-25](cards/VERIFY-25.md) | BASE, MONEY, STOCK, UI | planned |
| SEAM-17-25 | [BUILD-17](cards/BUILD-17.md) | [BUILD-25](cards/BUILD-25.md) | [VERIFY-25](cards/VERIFY-25.md) | BASE, UI, AUTH, RELEASE | planned |
| SEAM-18-25 | [BUILD-18](cards/BUILD-18.md) | [BUILD-25](cards/BUILD-25.md) | [VERIFY-25](cards/VERIFY-25.md) | BASE, MONEY, STOCK, AUTH, STORE, RECOVER, RELEASE, UI | planned |
| SEAM-19-25 | [BUILD-19](cards/BUILD-19.md) | [BUILD-25](cards/BUILD-25.md) | [VERIFY-25](cards/VERIFY-25.md) | BASE, AUTH, SCHEMA, STORE, RELEASE | planned |
| SEAM-20-25 | [BUILD-20](cards/BUILD-20.md) | [BUILD-25](cards/BUILD-25.md) | [VERIFY-25](cards/VERIFY-25.md) | BASE, MONEY, STOCK, AUTH, SCHEMA, STORE, REPORT | planned |
| SEAM-21-25 | [BUILD-21](cards/BUILD-21.md) | [BUILD-25](cards/BUILD-25.md) | [VERIFY-25](cards/VERIFY-25.md) | BASE, MONEY, STOCK, AUTH, STORE, RECOVER, UI | planned |
| SEAM-22-25 | [BUILD-22](cards/BUILD-22.md) | [BUILD-25](cards/BUILD-25.md) | [VERIFY-25](cards/VERIFY-25.md) | BASE, MONEY, STOCK, AUTH, SCHEMA, STORE, RECOVER, UI | planned |
| SEAM-23-25 | [BUILD-23](cards/BUILD-23.md) | [BUILD-25](cards/BUILD-25.md) | [VERIFY-25](cards/VERIFY-25.md) | BASE, MONEY, STOCK, AUTH, STORE, RECOVER, UI | planned |
| SEAM-24-25 | [BUILD-24](cards/BUILD-24.md) | [BUILD-25](cards/BUILD-25.md) | [VERIFY-25](cards/VERIFY-25.md) | BASE, MONEY, STOCK, AUTH, SCHEMA, STORE, RECOVER, REPORT, UI | planned |
| SEAM-01-26 | [BUILD-01](cards/BUILD-01.md) | [BUILD-26](cards/BUILD-26.md) | [VERIFY-26](cards/VERIFY-26.md) | BASE, MONEY, STOCK, SCHEMA | planned |
| SEAM-02-26 | [BUILD-02](cards/BUILD-02.md) | [BUILD-26](cards/BUILD-26.md) | [VERIFY-26](cards/VERIFY-26.md) | BASE, MONEY, STOCK, UI | planned |
| SEAM-03-26 | [BUILD-03](cards/BUILD-03.md) | [BUILD-26](cards/BUILD-26.md) | [VERIFY-26](cards/VERIFY-26.md) | BASE, MONEY, STOCK, SCHEMA | planned |
| SEAM-04-26 | [BUILD-04](cards/BUILD-04.md) | [BUILD-26](cards/BUILD-26.md) | [VERIFY-26](cards/VERIFY-26.md) | BASE, MONEY, STOCK, SCHEMA | planned |
| SEAM-05-26 | [BUILD-05](cards/BUILD-05.md) | [BUILD-26](cards/BUILD-26.md) | [VERIFY-26](cards/VERIFY-26.md) | BASE, MONEY, STOCK, RECEIPT, UI | planned |
| SEAM-06-26 | [BUILD-06](cards/BUILD-06.md) | [BUILD-26](cards/BUILD-26.md) | [VERIFY-26](cards/VERIFY-26.md) | BASE, MONEY | planned |
| SEAM-07-26 | [BUILD-07](cards/BUILD-07.md) | [BUILD-26](cards/BUILD-26.md) | [VERIFY-26](cards/VERIFY-26.md) | BASE, MONEY, STOCK, RECEIPT | planned |
| SEAM-08-26 | [BUILD-08](cards/BUILD-08.md) | [BUILD-26](cards/BUILD-26.md) | [VERIFY-26](cards/VERIFY-26.md) | BASE, MONEY, STOCK | planned |
| SEAM-09-26 | [BUILD-09](cards/BUILD-09.md) | [BUILD-26](cards/BUILD-26.md) | [VERIFY-26](cards/VERIFY-26.md) | BASE, STOCK, MONEY | planned |
| SEAM-10-26 | [BUILD-10](cards/BUILD-10.md) | [BUILD-26](cards/BUILD-26.md) | [VERIFY-26](cards/VERIFY-26.md) | BASE, STOCK, RECEIPT | planned |
| SEAM-11-26 | [BUILD-11](cards/BUILD-11.md) | [BUILD-26](cards/BUILD-26.md) | [VERIFY-26](cards/VERIFY-26.md) | BASE, MONEY | planned |
| SEAM-12-26 | [BUILD-12](cards/BUILD-12.md) | [BUILD-26](cards/BUILD-26.md) | [VERIFY-26](cards/VERIFY-26.md) | BASE, MONEY, STOCK, RECEIPT, LOCALE | planned |
| SEAM-13-26 | [BUILD-13](cards/BUILD-13.md) | [BUILD-26](cards/BUILD-26.md) | [VERIFY-26](cards/VERIFY-26.md) | BASE, UI, LOCALE, RECEIPT | planned |
| SEAM-14-26 | [BUILD-14](cards/BUILD-14.md) | [BUILD-26](cards/BUILD-26.md) | [VERIFY-26](cards/VERIFY-26.md) | BASE, UI, LOCALE, MONEY, STOCK | planned |
| SEAM-15-26 | [BUILD-15](cards/BUILD-15.md) | [BUILD-26](cards/BUILD-26.md) | [VERIFY-26](cards/VERIFY-26.md) | BASE, UI, LOCALE, STOCK, MONEY | planned |
| SEAM-16-26 | [BUILD-16](cards/BUILD-16.md) | [BUILD-26](cards/BUILD-26.md) | [VERIFY-26](cards/VERIFY-26.md) | BASE, RECEIPT, LOCALE, MONEY, STOCK, UI | planned |
| SEAM-17-26 | [BUILD-17](cards/BUILD-17.md) | [BUILD-26](cards/BUILD-26.md) | [VERIFY-26](cards/VERIFY-26.md) | BASE, RECEIPT, UI, LOCALE | planned |
| SEAM-18-26 | [BUILD-18](cards/BUILD-18.md) | [BUILD-26](cards/BUILD-26.md) | [VERIFY-26](cards/VERIFY-26.md) | BASE, MONEY, STOCK, UI, RECEIPT, LOCALE | planned |
| SEAM-19-26 | [BUILD-19](cards/BUILD-19.md) | [BUILD-26](cards/BUILD-26.md) | [VERIFY-26](cards/VERIFY-26.md) | BASE, SCHEMA | planned |
| SEAM-20-26 | [BUILD-20](cards/BUILD-20.md) | [BUILD-26](cards/BUILD-26.md) | [VERIFY-26](cards/VERIFY-26.md) | BASE, MONEY, STOCK, SCHEMA | planned |
| SEAM-21-26 | [BUILD-21](cards/BUILD-21.md) | [BUILD-26](cards/BUILD-26.md) | [VERIFY-26](cards/VERIFY-26.md) | BASE, MONEY, STOCK, UI | planned |
| SEAM-22-26 | [BUILD-22](cards/BUILD-22.md) | [BUILD-26](cards/BUILD-26.md) | [VERIFY-26](cards/VERIFY-26.md) | BASE, MONEY, STOCK, SCHEMA, UI | planned |
| SEAM-23-26 | [BUILD-23](cards/BUILD-23.md) | [BUILD-26](cards/BUILD-26.md) | [VERIFY-26](cards/VERIFY-26.md) | BASE, MONEY, STOCK, UI | planned |
| SEAM-24-26 | [BUILD-24](cards/BUILD-24.md) | [BUILD-26](cards/BUILD-26.md) | [VERIFY-26](cards/VERIFY-26.md) | BASE, MONEY, STOCK, SCHEMA, UI | planned |
| SEAM-25-26 | [BUILD-25](cards/BUILD-25.md) | [BUILD-26](cards/BUILD-26.md) | [VERIFY-26](cards/VERIFY-26.md) | BASE, MONEY, STOCK, SCHEMA, UI | planned |
| SEAM-01-27 | [BUILD-01](cards/BUILD-01.md) | [BUILD-27](cards/BUILD-27.md) | [VERIFY-27](cards/VERIFY-27.md) | BASE, MONEY, STOCK | planned |
| SEAM-02-27 | [BUILD-02](cards/BUILD-02.md) | [BUILD-27](cards/BUILD-27.md) | [VERIFY-27](cards/VERIFY-27.md) | BASE, MONEY, STOCK, UI | planned |
| SEAM-03-27 | [BUILD-03](cards/BUILD-03.md) | [BUILD-27](cards/BUILD-27.md) | [VERIFY-27](cards/VERIFY-27.md) | BASE, MONEY, STOCK | planned |
| SEAM-04-27 | [BUILD-04](cards/BUILD-04.md) | [BUILD-27](cards/BUILD-27.md) | [VERIFY-27](cards/VERIFY-27.md) | BASE, MONEY, STOCK, RECOVER | planned |
| SEAM-05-27 | [BUILD-05](cards/BUILD-05.md) | [BUILD-27](cards/BUILD-27.md) | [VERIFY-27](cards/VERIFY-27.md) | BASE, MONEY, STOCK, RECEIPT, UI | planned |
| SEAM-06-27 | [BUILD-06](cards/BUILD-06.md) | [BUILD-27](cards/BUILD-27.md) | [VERIFY-27](cards/VERIFY-27.md) | BASE, MONEY | planned |
| SEAM-07-27 | [BUILD-07](cards/BUILD-07.md) | [BUILD-27](cards/BUILD-27.md) | [VERIFY-27](cards/VERIFY-27.md) | BASE, MONEY, STOCK, RECEIPT | planned |
| SEAM-08-27 | [BUILD-08](cards/BUILD-08.md) | [BUILD-27](cards/BUILD-27.md) | [VERIFY-27](cards/VERIFY-27.md) | BASE, MONEY, STOCK | planned |
| SEAM-09-27 | [BUILD-09](cards/BUILD-09.md) | [BUILD-27](cards/BUILD-27.md) | [VERIFY-27](cards/VERIFY-27.md) | BASE, STOCK, MONEY | planned |
| SEAM-10-27 | [BUILD-10](cards/BUILD-10.md) | [BUILD-27](cards/BUILD-27.md) | [VERIFY-27](cards/VERIFY-27.md) | BASE, STOCK, RECEIPT | planned |
| SEAM-11-27 | [BUILD-11](cards/BUILD-11.md) | [BUILD-27](cards/BUILD-27.md) | [VERIFY-27](cards/VERIFY-27.md) | BASE, MONEY | planned |
| SEAM-12-27 | [BUILD-12](cards/BUILD-12.md) | [BUILD-27](cards/BUILD-27.md) | [VERIFY-27](cards/VERIFY-27.md) | BASE, MONEY, STOCK, RECEIPT, LOCALE | planned |
| SEAM-13-27 | [BUILD-13](cards/BUILD-13.md) | [BUILD-27](cards/BUILD-27.md) | [VERIFY-27](cards/VERIFY-27.md) | BASE, UI, LOCALE, RECEIPT | planned |
| SEAM-14-27 | [BUILD-14](cards/BUILD-14.md) | [BUILD-27](cards/BUILD-27.md) | [VERIFY-27](cards/VERIFY-27.md) | BASE, UI, LOCALE, MONEY, STOCK, RECOVER | planned |
| SEAM-15-27 | [BUILD-15](cards/BUILD-15.md) | [BUILD-27](cards/BUILD-27.md) | [VERIFY-27](cards/VERIFY-27.md) | BASE, UI, LOCALE, STOCK, MONEY | planned |
| SEAM-16-27 | [BUILD-16](cards/BUILD-16.md) | [BUILD-27](cards/BUILD-27.md) | [VERIFY-27](cards/VERIFY-27.md) | BASE, RECEIPT, LOCALE, MONEY, STOCK, UI | planned |
| SEAM-17-27 | [BUILD-17](cards/BUILD-17.md) | [BUILD-27](cards/BUILD-27.md) | [VERIFY-27](cards/VERIFY-27.md) | BASE, RECEIPT, UI, LOCALE | planned |
| SEAM-18-27 | [BUILD-18](cards/BUILD-18.md) | [BUILD-27](cards/BUILD-27.md) | [VERIFY-27](cards/VERIFY-27.md) | BASE, MONEY, STOCK, RECOVER, UI, RECEIPT, LOCALE | planned |
| SEAM-19-27 | [BUILD-19](cards/BUILD-19.md) | [BUILD-27](cards/BUILD-27.md) | [VERIFY-27](cards/VERIFY-27.md) | BASE | planned |
| SEAM-20-27 | [BUILD-20](cards/BUILD-20.md) | [BUILD-27](cards/BUILD-27.md) | [VERIFY-27](cards/VERIFY-27.md) | BASE, MONEY, STOCK | planned |
| SEAM-21-27 | [BUILD-21](cards/BUILD-21.md) | [BUILD-27](cards/BUILD-27.md) | [VERIFY-27](cards/VERIFY-27.md) | BASE, MONEY, STOCK, RECOVER, UI | planned |
| SEAM-22-27 | [BUILD-22](cards/BUILD-22.md) | [BUILD-27](cards/BUILD-27.md) | [VERIFY-27](cards/VERIFY-27.md) | BASE, MONEY, STOCK, RECOVER, UI | planned |
| SEAM-23-27 | [BUILD-23](cards/BUILD-23.md) | [BUILD-27](cards/BUILD-27.md) | [VERIFY-27](cards/VERIFY-27.md) | BASE, MONEY, STOCK, RECOVER, UI | planned |
| SEAM-24-27 | [BUILD-24](cards/BUILD-24.md) | [BUILD-27](cards/BUILD-27.md) | [VERIFY-27](cards/VERIFY-27.md) | BASE, MONEY, STOCK, RECOVER, UI | planned |
| SEAM-25-27 | [BUILD-25](cards/BUILD-25.md) | [BUILD-27](cards/BUILD-27.md) | [VERIFY-27](cards/VERIFY-27.md) | BASE, MONEY, STOCK, RECOVER, UI | planned |
| SEAM-26-27 | [BUILD-26](cards/BUILD-26.md) | [BUILD-27](cards/BUILD-27.md) | [VERIFY-27](cards/VERIFY-27.md) | BASE, LOCALE, UI, MONEY, STOCK, RECEIPT | planned |
| SEAM-01-28 | [BUILD-01](cards/BUILD-01.md) | [BUILD-28](cards/BUILD-28.md) | [VERIFY-28](cards/VERIFY-28.md) | BASE, MONEY, STOCK | planned |
| SEAM-02-28 | [BUILD-02](cards/BUILD-02.md) | [BUILD-28](cards/BUILD-28.md) | [VERIFY-28](cards/VERIFY-28.md) | BASE, MONEY, STOCK, UI | planned |
| SEAM-03-28 | [BUILD-03](cards/BUILD-03.md) | [BUILD-28](cards/BUILD-28.md) | [VERIFY-28](cards/VERIFY-28.md) | BASE, MONEY, STOCK | planned |
| SEAM-04-28 | [BUILD-04](cards/BUILD-04.md) | [BUILD-28](cards/BUILD-28.md) | [VERIFY-28](cards/VERIFY-28.md) | BASE, MONEY, STOCK, RECOVER | planned |
| SEAM-05-28 | [BUILD-05](cards/BUILD-05.md) | [BUILD-28](cards/BUILD-28.md) | [VERIFY-28](cards/VERIFY-28.md) | BASE, MONEY, STOCK, RECEIPT, UI | planned |
| SEAM-06-28 | [BUILD-06](cards/BUILD-06.md) | [BUILD-28](cards/BUILD-28.md) | [VERIFY-28](cards/VERIFY-28.md) | BASE, MONEY | planned |
| SEAM-07-28 | [BUILD-07](cards/BUILD-07.md) | [BUILD-28](cards/BUILD-28.md) | [VERIFY-28](cards/VERIFY-28.md) | BASE, MONEY, STOCK, RECEIPT | planned |
| SEAM-08-28 | [BUILD-08](cards/BUILD-08.md) | [BUILD-28](cards/BUILD-28.md) | [VERIFY-28](cards/VERIFY-28.md) | BASE, MONEY, STOCK | planned |
| SEAM-09-28 | [BUILD-09](cards/BUILD-09.md) | [BUILD-28](cards/BUILD-28.md) | [VERIFY-28](cards/VERIFY-28.md) | BASE, STOCK, MONEY | planned |
| SEAM-10-28 | [BUILD-10](cards/BUILD-10.md) | [BUILD-28](cards/BUILD-28.md) | [VERIFY-28](cards/VERIFY-28.md) | BASE, STOCK, RECEIPT | planned |
| SEAM-11-28 | [BUILD-11](cards/BUILD-11.md) | [BUILD-28](cards/BUILD-28.md) | [VERIFY-28](cards/VERIFY-28.md) | BASE, MONEY | planned |
| SEAM-12-28 | [BUILD-12](cards/BUILD-12.md) | [BUILD-28](cards/BUILD-28.md) | [VERIFY-28](cards/VERIFY-28.md) | BASE, MONEY, STOCK, RECEIPT, LOCALE | planned |
| SEAM-13-28 | [BUILD-13](cards/BUILD-13.md) | [BUILD-28](cards/BUILD-28.md) | [VERIFY-28](cards/VERIFY-28.md) | BASE, UI, LOCALE, RECEIPT | planned |
| SEAM-14-28 | [BUILD-14](cards/BUILD-14.md) | [BUILD-28](cards/BUILD-28.md) | [VERIFY-28](cards/VERIFY-28.md) | BASE, UI, LOCALE, MONEY, STOCK, RECOVER | planned |
| SEAM-15-28 | [BUILD-15](cards/BUILD-15.md) | [BUILD-28](cards/BUILD-28.md) | [VERIFY-28](cards/VERIFY-28.md) | BASE, UI, LOCALE, STOCK, MONEY | planned |
| SEAM-16-28 | [BUILD-16](cards/BUILD-16.md) | [BUILD-28](cards/BUILD-28.md) | [VERIFY-28](cards/VERIFY-28.md) | BASE, RECEIPT, LOCALE, MONEY, STOCK, UI | planned |
| SEAM-17-28 | [BUILD-17](cards/BUILD-17.md) | [BUILD-28](cards/BUILD-28.md) | [VERIFY-28](cards/VERIFY-28.md) | BASE, RECEIPT, UI, LOCALE | planned |
| SEAM-18-28 | [BUILD-18](cards/BUILD-18.md) | [BUILD-28](cards/BUILD-28.md) | [VERIFY-28](cards/VERIFY-28.md) | BASE, MONEY, STOCK, RECOVER, UI, RECEIPT, LOCALE | planned |
| SEAM-19-28 | [BUILD-19](cards/BUILD-19.md) | [BUILD-28](cards/BUILD-28.md) | [VERIFY-28](cards/VERIFY-28.md) | BASE | planned |
| SEAM-20-28 | [BUILD-20](cards/BUILD-20.md) | [BUILD-28](cards/BUILD-28.md) | [VERIFY-28](cards/VERIFY-28.md) | BASE, MONEY, STOCK | planned |
| SEAM-21-28 | [BUILD-21](cards/BUILD-21.md) | [BUILD-28](cards/BUILD-28.md) | [VERIFY-28](cards/VERIFY-28.md) | BASE, MONEY, STOCK, RECOVER, UI | planned |
| SEAM-22-28 | [BUILD-22](cards/BUILD-22.md) | [BUILD-28](cards/BUILD-28.md) | [VERIFY-28](cards/VERIFY-28.md) | BASE, MONEY, STOCK, RECOVER, UI | planned |
| SEAM-23-28 | [BUILD-23](cards/BUILD-23.md) | [BUILD-28](cards/BUILD-28.md) | [VERIFY-28](cards/VERIFY-28.md) | BASE, MONEY, STOCK, RECOVER, UI | planned |
| SEAM-24-28 | [BUILD-24](cards/BUILD-24.md) | [BUILD-28](cards/BUILD-28.md) | [VERIFY-28](cards/VERIFY-28.md) | BASE, MONEY, STOCK, RECOVER, UI | planned |
| SEAM-25-28 | [BUILD-25](cards/BUILD-25.md) | [BUILD-28](cards/BUILD-28.md) | [VERIFY-28](cards/VERIFY-28.md) | BASE, MONEY, STOCK, RECOVER, UI | planned |
| SEAM-26-28 | [BUILD-26](cards/BUILD-26.md) | [BUILD-28](cards/BUILD-28.md) | [VERIFY-28](cards/VERIFY-28.md) | BASE, LOCALE, UI, MONEY, STOCK, RECEIPT | planned |
| SEAM-27-28 | [BUILD-27](cards/BUILD-27.md) | [BUILD-28](cards/BUILD-28.md) | [VERIFY-28](cards/VERIFY-28.md) | BASE, LOCALE, UI, MONEY, STOCK, RECEIPT, RECOVER | planned |
| SEAM-01-29 | [BUILD-01](cards/BUILD-01.md) | [BUILD-29](cards/BUILD-29.md) | [VERIFY-29](cards/VERIFY-29.md) | BASE, MONEY, STOCK | planned |
| SEAM-02-29 | [BUILD-02](cards/BUILD-02.md) | [BUILD-29](cards/BUILD-29.md) | [VERIFY-29](cards/VERIFY-29.md) | BASE, MONEY, STOCK, UI | planned |
| SEAM-03-29 | [BUILD-03](cards/BUILD-03.md) | [BUILD-29](cards/BUILD-29.md) | [VERIFY-29](cards/VERIFY-29.md) | BASE, MONEY, STOCK | planned |
| SEAM-04-29 | [BUILD-04](cards/BUILD-04.md) | [BUILD-29](cards/BUILD-29.md) | [VERIFY-29](cards/VERIFY-29.md) | BASE, MONEY, STOCK, RECOVER | planned |
| SEAM-05-29 | [BUILD-05](cards/BUILD-05.md) | [BUILD-29](cards/BUILD-29.md) | [VERIFY-29](cards/VERIFY-29.md) | BASE, MONEY, STOCK, RECEIPT, UI | planned |
| SEAM-06-29 | [BUILD-06](cards/BUILD-06.md) | [BUILD-29](cards/BUILD-29.md) | [VERIFY-29](cards/VERIFY-29.md) | BASE, MONEY | planned |
| SEAM-07-29 | [BUILD-07](cards/BUILD-07.md) | [BUILD-29](cards/BUILD-29.md) | [VERIFY-29](cards/VERIFY-29.md) | BASE, MONEY, STOCK, RECEIPT | planned |
| SEAM-08-29 | [BUILD-08](cards/BUILD-08.md) | [BUILD-29](cards/BUILD-29.md) | [VERIFY-29](cards/VERIFY-29.md) | BASE, MONEY, STOCK | planned |
| SEAM-09-29 | [BUILD-09](cards/BUILD-09.md) | [BUILD-29](cards/BUILD-29.md) | [VERIFY-29](cards/VERIFY-29.md) | BASE, STOCK, MONEY | planned |
| SEAM-10-29 | [BUILD-10](cards/BUILD-10.md) | [BUILD-29](cards/BUILD-29.md) | [VERIFY-29](cards/VERIFY-29.md) | BASE, STOCK, RECEIPT | planned |
| SEAM-11-29 | [BUILD-11](cards/BUILD-11.md) | [BUILD-29](cards/BUILD-29.md) | [VERIFY-29](cards/VERIFY-29.md) | BASE, MONEY | planned |
| SEAM-12-29 | [BUILD-12](cards/BUILD-12.md) | [BUILD-29](cards/BUILD-29.md) | [VERIFY-29](cards/VERIFY-29.md) | BASE, MONEY, STOCK, RECEIPT, LOCALE | planned |
| SEAM-13-29 | [BUILD-13](cards/BUILD-13.md) | [BUILD-29](cards/BUILD-29.md) | [VERIFY-29](cards/VERIFY-29.md) | BASE, UI, LOCALE, RECEIPT | planned |
| SEAM-14-29 | [BUILD-14](cards/BUILD-14.md) | [BUILD-29](cards/BUILD-29.md) | [VERIFY-29](cards/VERIFY-29.md) | BASE, UI, LOCALE, MONEY, STOCK, RECOVER | planned |
| SEAM-15-29 | [BUILD-15](cards/BUILD-15.md) | [BUILD-29](cards/BUILD-29.md) | [VERIFY-29](cards/VERIFY-29.md) | BASE, UI, LOCALE, STOCK, MONEY | planned |
| SEAM-16-29 | [BUILD-16](cards/BUILD-16.md) | [BUILD-29](cards/BUILD-29.md) | [VERIFY-29](cards/VERIFY-29.md) | BASE, RECEIPT, LOCALE, MONEY, STOCK, UI | planned |
| SEAM-17-29 | [BUILD-17](cards/BUILD-17.md) | [BUILD-29](cards/BUILD-29.md) | [VERIFY-29](cards/VERIFY-29.md) | BASE, RECEIPT, UI, LOCALE | planned |
| SEAM-18-29 | [BUILD-18](cards/BUILD-18.md) | [BUILD-29](cards/BUILD-29.md) | [VERIFY-29](cards/VERIFY-29.md) | BASE, MONEY, STOCK, RECOVER, UI, RECEIPT, LOCALE | planned |
| SEAM-19-29 | [BUILD-19](cards/BUILD-19.md) | [BUILD-29](cards/BUILD-29.md) | [VERIFY-29](cards/VERIFY-29.md) | BASE | planned |
| SEAM-20-29 | [BUILD-20](cards/BUILD-20.md) | [BUILD-29](cards/BUILD-29.md) | [VERIFY-29](cards/VERIFY-29.md) | BASE, MONEY, STOCK | planned |
| SEAM-21-29 | [BUILD-21](cards/BUILD-21.md) | [BUILD-29](cards/BUILD-29.md) | [VERIFY-29](cards/VERIFY-29.md) | BASE, MONEY, STOCK, RECOVER, UI | planned |
| SEAM-22-29 | [BUILD-22](cards/BUILD-22.md) | [BUILD-29](cards/BUILD-29.md) | [VERIFY-29](cards/VERIFY-29.md) | BASE, MONEY, STOCK, RECOVER, UI | planned |
| SEAM-23-29 | [BUILD-23](cards/BUILD-23.md) | [BUILD-29](cards/BUILD-29.md) | [VERIFY-29](cards/VERIFY-29.md) | BASE, MONEY, STOCK, RECOVER, UI | planned |
| SEAM-24-29 | [BUILD-24](cards/BUILD-24.md) | [BUILD-29](cards/BUILD-29.md) | [VERIFY-29](cards/VERIFY-29.md) | BASE, MONEY, STOCK, RECOVER, UI | planned |
| SEAM-25-29 | [BUILD-25](cards/BUILD-25.md) | [BUILD-29](cards/BUILD-29.md) | [VERIFY-29](cards/VERIFY-29.md) | BASE, MONEY, STOCK, RECOVER, UI | planned |
| SEAM-26-29 | [BUILD-26](cards/BUILD-26.md) | [BUILD-29](cards/BUILD-29.md) | [VERIFY-29](cards/VERIFY-29.md) | BASE, LOCALE, UI, MONEY, STOCK, RECEIPT | planned |
| SEAM-27-29 | [BUILD-27](cards/BUILD-27.md) | [BUILD-29](cards/BUILD-29.md) | [VERIFY-29](cards/VERIFY-29.md) | BASE, LOCALE, UI, MONEY, STOCK, RECEIPT, RECOVER | planned |
| SEAM-28-29 | [BUILD-28](cards/BUILD-28.md) | [BUILD-29](cards/BUILD-29.md) | [VERIFY-29](cards/VERIFY-29.md) | BASE, LOCALE, UI, MONEY, STOCK, RECEIPT, RECOVER | planned |
| SEAM-01-30 (conditional) | [BUILD-01](cards/BUILD-01.md) | [BUILD-30](cards/BUILD-30.md) | [VERIFY-30](cards/VERIFY-30.md) | BASE, AUTH, SCHEMA | planned |
| SEAM-02-30 (conditional) | [BUILD-02](cards/BUILD-02.md) | [BUILD-30](cards/BUILD-30.md) | [VERIFY-30](cards/VERIFY-30.md) | BASE, AUTH, STORE | planned |
| SEAM-03-30 (conditional) | [BUILD-03](cards/BUILD-03.md) | [BUILD-30](cards/BUILD-30.md) | [VERIFY-30](cards/VERIFY-30.md) | BASE, SCHEMA, STORE, AUTH | planned |
| SEAM-04-30 (conditional) | [BUILD-04](cards/BUILD-04.md) | [BUILD-30](cards/BUILD-30.md) | [VERIFY-30](cards/VERIFY-30.md) | BASE, SCHEMA, STORE, AUTH, RECOVER, RELEASE | planned |
| SEAM-05-30 (conditional) | [BUILD-05](cards/BUILD-05.md) | [BUILD-30](cards/BUILD-30.md) | [VERIFY-30](cards/VERIFY-30.md) | BASE, AUTH, STORE | planned |
| SEAM-06-30 (conditional) | [BUILD-06](cards/BUILD-06.md) | [BUILD-30](cards/BUILD-30.md) | [VERIFY-30](cards/VERIFY-30.md) | BASE, AUTH, STORE | planned |
| SEAM-07-30 (conditional) | [BUILD-07](cards/BUILD-07.md) | [BUILD-30](cards/BUILD-30.md) | [VERIFY-30](cards/VERIFY-30.md) | BASE, STORE | planned |
| SEAM-08-30 (conditional) | [BUILD-08](cards/BUILD-08.md) | [BUILD-30](cards/BUILD-30.md) | [VERIFY-30](cards/VERIFY-30.md) | BASE, STORE | planned |
| SEAM-09-30 (conditional) | [BUILD-09](cards/BUILD-09.md) | [BUILD-30](cards/BUILD-30.md) | [VERIFY-30](cards/VERIFY-30.md) | BASE, AUTH, STORE | planned |
| SEAM-10-30 (conditional) | [BUILD-10](cards/BUILD-10.md) | [BUILD-30](cards/BUILD-30.md) | [VERIFY-30](cards/VERIFY-30.md) | BASE, AUTH, STORE | planned |
| SEAM-11-30 (conditional) | [BUILD-11](cards/BUILD-11.md) | [BUILD-30](cards/BUILD-30.md) | [VERIFY-30](cards/VERIFY-30.md) | BASE, AUTH, STORE | planned |
| SEAM-12-30 (conditional) | [BUILD-12](cards/BUILD-12.md) | [BUILD-30](cards/BUILD-30.md) | [VERIFY-30](cards/VERIFY-30.md) | BASE, STORE | planned |
| SEAM-13-30 (conditional) | [BUILD-13](cards/BUILD-13.md) | [BUILD-30](cards/BUILD-30.md) | [VERIFY-30](cards/VERIFY-30.md) | BASE, AUTH | planned |
| SEAM-14-30 (conditional) | [BUILD-14](cards/BUILD-14.md) | [BUILD-30](cards/BUILD-30.md) | [VERIFY-30](cards/VERIFY-30.md) | BASE, RECOVER | planned |
| SEAM-15-30 (conditional) | [BUILD-15](cards/BUILD-15.md) | [BUILD-30](cards/BUILD-30.md) | [VERIFY-30](cards/VERIFY-30.md) | BASE, AUTH | planned |
| SEAM-16-30 (conditional) | [BUILD-16](cards/BUILD-16.md) | [BUILD-30](cards/BUILD-30.md) | [VERIFY-30](cards/VERIFY-30.md) | BASE | planned |
| SEAM-17-30 (conditional) | [BUILD-17](cards/BUILD-17.md) | [BUILD-30](cards/BUILD-30.md) | [VERIFY-30](cards/VERIFY-30.md) | BASE, AUTH, RELEASE | planned |
| SEAM-18-30 (conditional) | [BUILD-18](cards/BUILD-18.md) | [BUILD-30](cards/BUILD-30.md) | [VERIFY-30](cards/VERIFY-30.md) | BASE, AUTH, STORE, RECOVER, RELEASE | planned |
| SEAM-19-30 (conditional) | [BUILD-19](cards/BUILD-19.md) | [BUILD-30](cards/BUILD-30.md) | [VERIFY-30](cards/VERIFY-30.md) | BASE, AUTH, SCHEMA, STORE, RELEASE | planned |
| SEAM-20-30 (conditional) | [BUILD-20](cards/BUILD-20.md) | [BUILD-30](cards/BUILD-30.md) | [VERIFY-30](cards/VERIFY-30.md) | BASE, AUTH, SCHEMA, STORE | planned |
| SEAM-21-30 (conditional) | [BUILD-21](cards/BUILD-21.md) | [BUILD-30](cards/BUILD-30.md) | [VERIFY-30](cards/VERIFY-30.md) | BASE, AUTH, STORE, RECOVER | planned |
| SEAM-22-30 (conditional) | [BUILD-22](cards/BUILD-22.md) | [BUILD-30](cards/BUILD-30.md) | [VERIFY-30](cards/VERIFY-30.md) | BASE, AUTH, SCHEMA, STORE, RECOVER | planned |
| SEAM-23-30 (conditional) | [BUILD-23](cards/BUILD-23.md) | [BUILD-30](cards/BUILD-30.md) | [VERIFY-30](cards/VERIFY-30.md) | BASE, AUTH, STORE, RECOVER | planned |
| SEAM-24-30 (conditional) | [BUILD-24](cards/BUILD-24.md) | [BUILD-30](cards/BUILD-30.md) | [VERIFY-30](cards/VERIFY-30.md) | BASE, AUTH, SCHEMA, STORE, RECOVER | planned |
| SEAM-25-30 (conditional) | [BUILD-25](cards/BUILD-25.md) | [BUILD-30](cards/BUILD-30.md) | [VERIFY-30](cards/VERIFY-30.md) | BASE, AUTH, SCHEMA, STORE, RECOVER, RELEASE | planned |
| SEAM-26-30 (conditional) | [BUILD-26](cards/BUILD-26.md) | [BUILD-30](cards/BUILD-30.md) | [VERIFY-30](cards/VERIFY-30.md) | BASE, SCHEMA | planned |
| SEAM-27-30 (conditional) | [BUILD-27](cards/BUILD-27.md) | [BUILD-30](cards/BUILD-30.md) | [VERIFY-30](cards/VERIFY-30.md) | BASE, RECOVER | planned |
| SEAM-28-30 (conditional) | [BUILD-28](cards/BUILD-28.md) | [BUILD-30](cards/BUILD-30.md) | [VERIFY-30](cards/VERIFY-30.md) | BASE, RECOVER | planned |
| SEAM-29-30 (conditional) | [BUILD-29](cards/BUILD-29.md) | [BUILD-30](cards/BUILD-30.md) | [VERIFY-30](cards/VERIFY-30.md) | BASE, RECOVER | planned |
| SEAM-01-31 (conditional) | [BUILD-01](cards/BUILD-01.md) | [BUILD-31](cards/BUILD-31.md) | [VERIFY-31](cards/VERIFY-31.md) | BASE, MONEY, STOCK, AUTH, SCHEMA | planned |
| SEAM-02-31 (conditional) | [BUILD-02](cards/BUILD-02.md) | [BUILD-31](cards/BUILD-31.md) | [VERIFY-31](cards/VERIFY-31.md) | BASE, MONEY, STOCK, AUTH, STORE, UI | planned |
| SEAM-03-31 (conditional) | [BUILD-03](cards/BUILD-03.md) | [BUILD-31](cards/BUILD-31.md) | [VERIFY-31](cards/VERIFY-31.md) | BASE, MONEY, STOCK, SCHEMA, STORE, AUTH | planned |
| SEAM-04-31 (conditional) | [BUILD-04](cards/BUILD-04.md) | [BUILD-31](cards/BUILD-31.md) | [VERIFY-31](cards/VERIFY-31.md) | BASE, MONEY, STOCK, SCHEMA, STORE, AUTH, RECOVER, RELEASE | planned |
| SEAM-05-31 (conditional) | [BUILD-05](cards/BUILD-05.md) | [BUILD-31](cards/BUILD-31.md) | [VERIFY-31](cards/VERIFY-31.md) | BASE, MONEY, STOCK, AUTH, STORE, UI | planned |
| SEAM-06-31 (conditional) | [BUILD-06](cards/BUILD-06.md) | [BUILD-31](cards/BUILD-31.md) | [VERIFY-31](cards/VERIFY-31.md) | BASE, MONEY, AUTH, STORE | planned |
| SEAM-07-31 (conditional) | [BUILD-07](cards/BUILD-07.md) | [BUILD-31](cards/BUILD-31.md) | [VERIFY-31](cards/VERIFY-31.md) | BASE, MONEY, STOCK, STORE | planned |
| SEAM-08-31 (conditional) | [BUILD-08](cards/BUILD-08.md) | [BUILD-31](cards/BUILD-31.md) | [VERIFY-31](cards/VERIFY-31.md) | BASE, MONEY, STOCK, STORE | planned |
| SEAM-09-31 (conditional) | [BUILD-09](cards/BUILD-09.md) | [BUILD-31](cards/BUILD-31.md) | [VERIFY-31](cards/VERIFY-31.md) | BASE, STOCK, MONEY, AUTH, STORE | planned |
| SEAM-10-31 (conditional) | [BUILD-10](cards/BUILD-10.md) | [BUILD-31](cards/BUILD-31.md) | [VERIFY-31](cards/VERIFY-31.md) | BASE, STOCK, AUTH, STORE | planned |
| SEAM-11-31 (conditional) | [BUILD-11](cards/BUILD-11.md) | [BUILD-31](cards/BUILD-31.md) | [VERIFY-31](cards/VERIFY-31.md) | BASE, MONEY, AUTH, STORE | planned |
| SEAM-12-31 (conditional) | [BUILD-12](cards/BUILD-12.md) | [BUILD-31](cards/BUILD-31.md) | [VERIFY-31](cards/VERIFY-31.md) | BASE, MONEY, STOCK, STORE | planned |
| SEAM-13-31 (conditional) | [BUILD-13](cards/BUILD-13.md) | [BUILD-31](cards/BUILD-31.md) | [VERIFY-31](cards/VERIFY-31.md) | BASE, UI, AUTH | planned |
| SEAM-14-31 (conditional) | [BUILD-14](cards/BUILD-14.md) | [BUILD-31](cards/BUILD-31.md) | [VERIFY-31](cards/VERIFY-31.md) | BASE, UI, MONEY, STOCK, RECOVER | planned |
| SEAM-15-31 (conditional) | [BUILD-15](cards/BUILD-15.md) | [BUILD-31](cards/BUILD-31.md) | [VERIFY-31](cards/VERIFY-31.md) | BASE, UI, STOCK, MONEY, AUTH | planned |
| SEAM-16-31 (conditional) | [BUILD-16](cards/BUILD-16.md) | [BUILD-31](cards/BUILD-31.md) | [VERIFY-31](cards/VERIFY-31.md) | BASE, MONEY, STOCK, UI | planned |
| SEAM-17-31 (conditional) | [BUILD-17](cards/BUILD-17.md) | [BUILD-31](cards/BUILD-31.md) | [VERIFY-31](cards/VERIFY-31.md) | BASE, UI, AUTH, RELEASE | planned |
| SEAM-18-31 (conditional) | [BUILD-18](cards/BUILD-18.md) | [BUILD-31](cards/BUILD-31.md) | [VERIFY-31](cards/VERIFY-31.md) | BASE, MONEY, STOCK, AUTH, STORE, RECOVER, RELEASE, UI | planned |
| SEAM-19-31 (conditional) | [BUILD-19](cards/BUILD-19.md) | [BUILD-31](cards/BUILD-31.md) | [VERIFY-31](cards/VERIFY-31.md) | BASE, AUTH, SCHEMA, STORE, RELEASE | planned |
| SEAM-20-31 (conditional) | [BUILD-20](cards/BUILD-20.md) | [BUILD-31](cards/BUILD-31.md) | [VERIFY-31](cards/VERIFY-31.md) | BASE, MONEY, STOCK, AUTH, SCHEMA, STORE | planned |
| SEAM-21-31 (conditional) | [BUILD-21](cards/BUILD-21.md) | [BUILD-31](cards/BUILD-31.md) | [VERIFY-31](cards/VERIFY-31.md) | BASE, MONEY, STOCK, AUTH, STORE, RECOVER, UI | planned |
| SEAM-22-31 (conditional) | [BUILD-22](cards/BUILD-22.md) | [BUILD-31](cards/BUILD-31.md) | [VERIFY-31](cards/VERIFY-31.md) | BASE, MONEY, STOCK, AUTH, SCHEMA, STORE, RECOVER, UI | planned |
| SEAM-23-31 (conditional) | [BUILD-23](cards/BUILD-23.md) | [BUILD-31](cards/BUILD-31.md) | [VERIFY-31](cards/VERIFY-31.md) | BASE, MONEY, STOCK, AUTH, STORE, RECOVER, UI | planned |
| SEAM-24-31 (conditional) | [BUILD-24](cards/BUILD-24.md) | [BUILD-31](cards/BUILD-31.md) | [VERIFY-31](cards/VERIFY-31.md) | BASE, MONEY, STOCK, AUTH, SCHEMA, STORE, RECOVER, UI | planned |
| SEAM-25-31 (conditional) | [BUILD-25](cards/BUILD-25.md) | [BUILD-31](cards/BUILD-31.md) | [VERIFY-31](cards/VERIFY-31.md) | BASE, MONEY, STOCK, AUTH, SCHEMA, STORE, RECOVER, RELEASE, UI | planned |
| SEAM-26-31 (conditional) | [BUILD-26](cards/BUILD-26.md) | [BUILD-31](cards/BUILD-31.md) | [VERIFY-31](cards/VERIFY-31.md) | BASE, UI, MONEY, STOCK, SCHEMA | planned |
| SEAM-27-31 (conditional) | [BUILD-27](cards/BUILD-27.md) | [BUILD-31](cards/BUILD-31.md) | [VERIFY-31](cards/VERIFY-31.md) | BASE, UI, MONEY, STOCK, RECOVER | planned |
| SEAM-28-31 (conditional) | [BUILD-28](cards/BUILD-28.md) | [BUILD-31](cards/BUILD-31.md) | [VERIFY-31](cards/VERIFY-31.md) | BASE, UI, MONEY, STOCK, RECOVER | planned |
| SEAM-29-31 (conditional) | [BUILD-29](cards/BUILD-29.md) | [BUILD-31](cards/BUILD-31.md) | [VERIFY-31](cards/VERIFY-31.md) | BASE, UI, MONEY, STOCK, RECOVER | planned |
| SEAM-30-31 (conditional) | [BUILD-30](cards/BUILD-30.md) | [BUILD-31](cards/BUILD-31.md) | [VERIFY-31](cards/VERIFY-31.md) | BASE, AUTH, SCHEMA, STORE, RECOVER, RELEASE | planned |
