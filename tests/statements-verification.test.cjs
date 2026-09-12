const {test}=require('node:test'),assert=require('node:assert/strict');
const {create,item,customer,cart}=require('./harness.cjs');
test('VERIFY-12: draft, local signup migration and Hindi settings preserve statement identity and stock history',async()=>{
 const {A}=await create();await A.boot('local');const i=item(A,{unit:'kg'});await A.save();await A.actions.startStockHistory();await A.posAdd(i.id,1.25);assert.equal(A.DB().stockBook.entries.length,0);
 const account=await A.auth.signUp({username:'statement_owner',password:'Synthetic-owner-password',confirm:'Synthetic-owner-password',shopName:'Synthetic statements'});await A.auth.enableGate(account.id);const draft=A.drafts.current(),request={...JSON.parse(JSON.stringify(draft.cart)),draftId:draft.id};const bill=await A.actions.checkout(request);await A.actions.checkout(request);const receipt=A.billText(bill);assert.equal(A.DB().stockBook.entries.length,1);assert.equal(A.reconcileBook().stock[0].expected,8.75);assert.equal(A.salesStatement().sales,125);
 A.DB().settings.lang='hi';await A.save();assert.equal(A.DB().stockBook.entries.length,1);assert.equal(A.billText(bill),receipt);assert.equal(A.statementRows('sales')[1][6],125);await A.auth.disableGate();assert.equal(A.reconcileBook().stock[0].expected,8.75);assert.equal(A.reconcileBook().differences.length,0);
});
test('VERIFY-12: reconciliation exposes invoice and stock-unit disagreement instead of a clean result',async()=>{
 const {A}=await create(),i=item(A,{unit:'kg'});A.DB().settings.gstEnabled=true;await A.save();await A.actions.startStockHistory();const bill=await A.actions.checkout(cart(i));A.DB().bills[0].total+=0.01;
 assert.ok(A.reconcileBook().differences.some(d=>d.domain==='invoice'&&d.id===bill.id));assert.ok(A.statementRows('reconciliation').some(row=>row[0]==='invoice'));A.DB().bills[0].total-=0.01;i.unit='bottle';assert.ok(A.reconcileBook().differences.some(d=>d.domain==='stock_unit'&&d.id===i.id));
});
test('VERIFY-12: malformed stock histories and projections reject while complete exports retain archived accounts',async()=>{
 const {A}=await create(),i=item(A);for(let n=0;n<75;n++)customer(A,{name:n===0?'=Synthetic formula':'Synthetic customer '+n,balance:n,deleted:n===74});await A.save();await A.actions.startStockHistory();await A.actions.checkout(cart(i));
 const bad=fn=>{const db=JSON.parse(JSON.stringify(A.DB()));fn(db);assert.throws(()=>A.validateData(db),/stock|Stock/);};
 bad(d=>d.stockBook.entries[0].changes[0].before.qty++);bad(d=>d.stockBook.entries[0].revision++);bad(d=>d.stockBook.entries[0].sources=['bills:invented']);bad(d=>d.items[0].stock++);bad(d=>d.stockBook.entries.push({...JSON.parse(JSON.stringify(d.stockBook.entries[0]))}));
 const rows=A.statementRows('customers');assert.equal(rows.length,76);assert.equal(rows.at(-1)[2],'Yes');assert.match(A.toCSV(rows),/'=Synthetic formula/);assert.equal(A.statementRows('stock').length,3);
});
test('VERIFY-12: timezone and DST boundaries classify actual instants without changing records',async()=>{
 const {A,ctx}=await create();let now=Date.parse('2026-03-08T04:59:59Z');ctx.Date=class extends Date{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}};const i=item(A);await A.save();await A.actions.openCashShift({openingFloat:100,note:'New York shift',timeZone:'America/New_York'});await A.actions.checkout(cart(i));now=Date.parse('2026-03-08T05:00:00Z');await A.actions.checkout(cart(i));now=Date.parse('2026-03-09T03:59:59Z');await A.actions.checkout(cart(i));now=Date.parse('2026-03-09T04:00:00Z');await A.actions.checkout(cart(i));
 const r=A.reconcileBook({from:'2026-03-08',to:'2026-03-08'});assert.equal(r.sales.sales,200);assert.equal(r.cashNet,200);assert.equal(r.cashEntries.length,2);assert.equal(r.zone,'America/New_York');assert.throws(()=>A.reportPeriod({from:'2026-03-09',to:'2026-03-08'}),/precede/);
 const before=JSON.stringify(A.DB());A.statementRows('sales',{from:'2026-03-08'});assert.equal(JSON.stringify(A.DB()),before);
 A.DB().staff.push({id:'cashier',name:'Cashier',role:'cashier',active:true});A.DB().session.staffId='cashier';await A.save();assert.throws(()=>A.statementRows('customers'),/Owner/);await assert.rejects(()=>A.actions.startStockHistory(),/Owner/);
});
