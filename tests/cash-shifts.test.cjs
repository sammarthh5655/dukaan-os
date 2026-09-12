const {test}=require('node:test'),assert=require('node:assert/strict');
const {create,item,customer,supplier,cart}=require('./harness.cjs');
function clock(ctx,initial){let now=Date.parse(initial);ctx.Date=class extends Date{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}};return value=>{now=Date.parse(value);};}
test('BUILD-11: cross-midnight shift matches independent cash sum and later refund leaves closing intact',async()=>{
 const {A,ctx}=await create(),tick=clock(ctx,'2026-09-11T18:20:00Z'),i=item(A,{stock:20}),c=customer(A,{balance:200}),s=supplier(A);await A.save();
 const shift=await A.actions.openCashShift({openingFloat:500,timeZone:'Asia/Kolkata',note:'Counted opening float',operationId:'shift_one'});assert.equal(shift.openingDate,'2026-09-11');
 const cashBill=await A.actions.checkout(cart(i)),upiBill=await A.actions.checkout(cart(i,{mode:'upi'}));await A.actions.takePayment(c.id,50,'cash');await A.actions.recordPurchase(s.id,[{itemId:i.id,qty:2,cost:100}],80,'','cash');await A.actions.paySupplier(s.id,20,'cash');
 const ret=await A.actions.returnSale({billId:cashBill.id,lines:[{lineId:cashBill.lines[0].lineId,qty:1}],reason:'Cash item returned'});await A.actions.settleReturn(ret.id,100,'cash','Cash refund handed over');
 const expense=await A.actions.cashEntry({kind:'expense',amount:30,reason:'transport',note:'Local delivery expense',operationId:'expense_once'});await A.actions.cashEntry({kind:'withdrawal',amount:40,reason:'owner',note:'Owner took cash'});
 assert.equal(A.cashShiftSummary(shift).expected,500+100+50-80-20-100-30-40);assert.equal(A.DB().cashMovements.length,7);
 tick('2026-09-11T18:40:00Z');const closed=await A.actions.closeCashShift({shiftId:shift.id,counted:375,note:'Counted after midnight',operationId:'close_one'});assert.equal(closed.close.businessDate,'2026-09-12');assert.equal(closed.close.expected,380);assert.equal(closed.close.variance,-5);const snapshot=JSON.stringify(A.cashSessions()[0]);
 await A.actions.cashEntry({kind:'expense',amount:30,reason:'transport',note:'Local delivery expense',operationId:'expense_once'});
 const ret2=await A.actions.returnSale({billId:upiBill.id,lines:[{lineId:upiBill.lines[0].lineId,qty:1}],reason:'UPI item returned'});const before=JSON.stringify(A.DB());await assert.rejects(()=>A.actions.settleReturn(ret2.id,100,'cash','Later cash refund'),/Open a cash shift/);assert.equal(JSON.stringify(A.DB()),before);
 const later=await A.actions.openCashShift({openingFloat:375,note:'Next physical cash count',operationId:'shift_two'});await A.actions.settleReturn(ret2.id,100,'cash','Later cash refund');await A.actions.cashEntry({kind:'cash_correction',amount:30,reason:'reversal',corrects:expense.id,note:'Expense returned to till'});
 assert.equal(A.cashShiftSummary(later).expected,305);assert.equal(JSON.stringify(A.cashSessions()[0]),snapshot);assert.equal(A.DB().cashMovements.at(-2).shiftId,later.id);assert.equal(A.stats.cashExpected().net,-70);
 const fresh=await create();await fresh.A.restoreBackup(await A.backups.decrypt(await A.backups.encrypt(A.backups.capture(),'Synthetic-cash-backup'),'Synthetic-cash-backup'));assert.equal(fresh.A.cashSessions()[0].close.expected,380);assert.equal(fresh.A.cashShiftSummary(fresh.A.openCashSession()).expected,305);
});
test('BUILD-11: closing-count correction appends history without altering cash or original close',async()=>{
 const {A}=await create();const shift=await A.actions.openCashShift({openingFloat:100,note:'Opening count'});await A.actions.closeCashShift({shiftId:shift.id,counted:90,note:'Original closing count'});const original=JSON.stringify(A.cashSessions()[0]),cash=A.stats.cashExpected().net;
 await A.actions.correctCashClose({shiftId:shift.id,counted:100,note:'Found counting transcription error',operationId:'count_correction'});await A.actions.correctCashClose({shiftId:shift.id,counted:100,note:'Found counting transcription error',operationId:'count_correction'});
 assert.equal(JSON.stringify(A.cashSessions()[0]),original);assert.equal(A.reportedCashClose(A.cashSessions()[0]).variance,0);assert.equal(A.DB().cashCloseCorrections.length,1);assert.equal(A.stats.cashExpected().net,cash);
});
test('BUILD-11: failed posting and closing restore all financial facts and shift membership',async()=>{
 const {A}=await create(),i=item(A);await A.save();const shift=await A.actions.openCashShift({openingFloat:100,note:'Opening cash'}),before=JSON.stringify(A.DB()),commit=A.storage.commit;
 A.storage.commit=async()=>{throw new Error('Cash disk failure');};await assert.rejects(()=>A.actions.checkout(cart(i)),/disk/);assert.equal(JSON.stringify(A.DB()),before);A.storage.commit=commit;
 await A.actions.checkout(cart(i));const prior=JSON.stringify(A.DB());A.storage.commit=async()=>{throw new Error('Close disk failure');};await assert.rejects(()=>A.actions.closeCashShift({shiftId:shift.id,counted:200,note:'Count complete',operationId:'close_retry'}),/disk/);assert.equal(JSON.stringify(A.DB()),prior);A.storage.commit=commit;
 await A.actions.closeCashShift({shiftId:shift.id,counted:200,note:'Count complete',operationId:'close_retry'});await A.actions.closeCashShift({shiftId:shift.id,counted:200,note:'Count complete',operationId:'close_retry'});assert.equal(A.cashSessions()[0].close.expected,200);
});
test('BUILD-11: activation excludes prior money from new shift; later void posts to current shift',async()=>{
 const {A}=await create(),i=item(A),s=supplier(A);await A.save();const old=await A.actions.checkout(cart(i));await A.actions.recordPurchase(s.id,[{itemId:i.id,qty:2,cost:60}],120,'','cash');
 const first=await A.actions.openCashShift({openingFloat:80,note:'Counted legacy till'});assert.equal(A.cashShiftSummary(first).expected,80);assert.equal(A.DB().cashBaseline.length,2);
 await A.actions.voidBill(old.id,'Later cancellation and cash handback');assert.equal(A.cashShiftSummary(first).expected,-20);assert.equal(A.DB().cashMovements[0].kind,'void');
 await assert.rejects(()=>A.actions.openCashShift({openingFloat:1,note:'Second opening'}),/Close the current/);
});
