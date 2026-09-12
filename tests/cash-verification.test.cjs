const {test}=require('node:test'),assert=require('node:assert/strict');
const {create,item,supplier,cart}=require('./harness.cjs');
test('VERIFY-11: draft retry posts cash once while stock transfers and counts move no cash',async()=>{
 const {A}=await create(),i=item(A);A.DB().stores.push({id:'branch',name:'Branch'});await A.save();await A.actions.openCashShift({openingFloat:500,note:'Main counted opening'});
 await A.posAdd(i.id,1);const d=A.drafts.current(),request={...JSON.parse(JSON.stringify(d.cart)),draftId:d.id};const bill=await A.actions.checkout(request);await A.actions.checkout(request);assert.equal(A.DB().cashMovements.length,1);assert.equal(A.cashShiftSummary(A.openCashSession()).expected,600);const receipt=A.billText(bill);
 const transfer=await A.actions.sendTransfer({toStoreId:'branch',lines:[{itemId:i.id,qty:2}],note:'Stock to branch'});const source=A.item(i.id);await A.actions.adjustStock({itemId:source.id,batchId:source.batches?.[0]?.id || 'undated',count:6,note:'Physical shelf count'});assert.equal(A.cashShiftSummary(A.openCashSession()).expected,600);
 await A.actions.switchStore('branch');await A.actions.receiveTransfer({transferId:transfer.id,lines:[{lineId:transfer.lines[0].lineId,qty:2}],note:'Two units received'});await A.actions.openCashShift({openingFloat:20,note:'Branch physical float'});await A.actions.checkout(cart(A.item(transfer.lines[0].targetItemId)));assert.equal(A.cashShiftSummary(A.openCashSession()).expected,120);
 await A.actions.switchStore('st_main');assert.equal(A.cashShiftSummary(A.openCashSession()).expected,600);assert.equal(A.billText(bill),receipt);assert.equal(A.DB().cashMovements.length,2);
});
test('VERIFY-11: imported cash attribution must preserve actor and valid command metadata',async()=>{
 const {A}=await create(),i=item(A);await A.save();const s=await A.actions.openCashShift({openingFloat:100,note:'Counted opening cash'});await A.actions.checkout(cart(i));await A.actions.cashEntry({amount:5,note:'Cash transport cost'});await A.actions.closeCashShift({shiftId:s.id,counted:195,note:'Counted closing cash'});await A.actions.correctCashClose({shiftId:s.id,counted:195,note:'Confirmed physical count'});
 const mutate=fn=>{const d=JSON.parse(JSON.stringify(A.DB()));fn(d);assert.throws(()=>A.validateData(d),/cash|command/i);};
 mutate(d=>d.cashMovements[0].staffId='forged_actor');
 mutate(d=>delete d.cashManual[0].command);
 mutate(d=>d.cashSessions[0].command.storeId='other_store');
 mutate(d=>d.cashSessions[0].close.command.kind='sale');
 mutate(d=>d.cashCloseCorrections[0].staffId='forged_actor');
 mutate(d=>d.cashSessions[0].close.expected++);
 mutate(d=>d.cashSessions[0].close.movementIds.pop());
 mutate(d=>d.cashMovements.push({...d.cashMovements[0]}));
 mutate(d=>d.cashManual[0].delta=5);
});
test('VERIFY-11: per-store open shifts, cashier denial and failed manual saves preserve balances',async()=>{
 const {A}=await create(),i=item(A);A.DB().stores.push({id:'other_store',name:'Other store'});A.DB().staff.push({id:'cashier',name:'Cashier',role:'cashier',active:true,storeIds:[A.S()]});await A.save();
 await A.actions.openCashShift({openingFloat:100,note:'Main opening'});await A.actions.switchStore('other_store');const other=item(A,{id:'other_item',storeId:A.S()});await A.save();const before=JSON.stringify(A.DB());await assert.rejects(()=>A.actions.checkout(cart(other)),/Open a cash shift/);assert.equal(JSON.stringify(A.DB()),before);
 await A.actions.checkout(cart(other,{mode:'upi'}));await A.actions.openCashShift({openingFloat:20,note:'Other opening'});await A.actions.checkout(cart(other));assert.equal(A.cashShiftSummary(A.openCashSession()).expected,120);await A.actions.switchStore('st_main');assert.equal(A.cashShiftSummary(A.openCashSession()).expected,100);
 const previous=JSON.stringify(A.DB()),commit=A.storage.commit;A.storage.commit=async()=>{throw new Error('Manual disk failure');};await assert.rejects(()=>A.actions.cashEntry({amount:5,note:'Transport expense'}),/disk/);assert.equal(JSON.stringify(A.DB()),previous);A.storage.commit=commit;
 A.DB().session.staffId='cashier';await A.save();await assert.rejects(()=>A.actions.cashEntry({amount:5,note:'Cashier expense'}),/Owner/);await assert.rejects(()=>A.actions.closeCashShift({shiftId:A.openCashSession().id,counted:100,note:'Cashier close'}),/Owner/);
});
test('VERIFY-11: supplier cash refund is a receipt and over-refund preserves shift totals',async()=>{
 const {A}=await create(),i=item(A,{stock:0}),vendor=supplier(A);await A.save();const shift=await A.actions.openCashShift({openingFloat:500,note:'Supplier test opening'});
 const purchase=await A.actions.recordPurchase(vendor.id,[{itemId:i.id,qty:2,cost:60}],120,'','cash');
 const returned=await A.actions.returnPurchase({purchaseId:purchase.id,lines:[{lineId:purchase.lines[0].lineId,qty:2}],reason:'Supplier accepts return'});
 await A.actions.settleSupplierCredit(returned.id,120,'cash','Cash physically received');assert.equal(A.cashShiftSummary(shift).expected,500);assert.equal(A.cashDaySummary().supplierRefundCash,120);
 const prior=JSON.stringify(A.DB());await assert.rejects(()=>A.actions.settleSupplierCredit(returned.id,1,'cash','Duplicate refund'),/refund|credit|amount/i);assert.equal(JSON.stringify(A.DB()),prior);
});
