/* Purchase corrections preserve receipt/payment history and consumed stock. */
(function(w){
 'use strict';const A=w.App,D=A.domain;
 const ratio=(value,num,den)=>Number((BigInt(value)*BigInt(num)*2n+BigInt(den))/(2n*BigInt(den)));
 A.supplierReturnValue=(line,prior,qty)=>(ratio(D.paise(line.value),prior+qty,D.quantityUnits(line.qty))-ratio(D.paise(line.value),prior,D.quantityUnits(line.qty)))/100;
 A.supplierReturns=()=> (A.DB().supplierReturns || []).filter(r=>r.storeId===A.S());
 A.supplierRefunds=()=> (A.DB().supplierRefunds || []).filter(r=>r.storeId===A.S());
 A.purchaseReturnable=po=>po.lines.map(l=>{
  const item=A.item(l.itemId),returned=A.supplierReturns().filter(r=>r.purchaseId===po.id).flatMap(r=>r.lines).filter(x=>x.lineId===l.lineId).reduce((n,x)=>n+x.qty,0);
  const physical=(item?.batches || []).filter(b=>b.purchaseId===po.id&&b.purchaseLineId===l.lineId).reduce((n,b)=>n+b.qty,0);
  return {lineId:l.lineId,qty:po.cancelled?0:Math.max(0,D.quantity(Math.min(l.qty-returned,physical)))};
 });
 A.supplierRefundDue=ret=>{const s=A.supplier(ret.supplierId);return Math.max(0,Math.min(A.round2(ret.refundable-A.supplierRefunds().filter(f=>f.returnId===ret.id).reduce((n,f)=>n+f.amount,0)),Math.max(0,-(s?.balance || 0))));};
 A.actions.returnPurchase=async function({purchaseId,lines,reason,cancel=false,operationId=A.uid('supplier_return')}={}){
  A.requirePermission('purchase');if(typeof reason!=='string'||reason.trim().length<3||typeof cancel!=='boolean')throw new Error('Provide a supplier return reason.');
  const po=A.purchases().find(p=>p.id===purchaseId);if(!po)throw new Error('Purchase not found in this store.');
  const request={purchaseId,lines:JSON.parse(JSON.stringify(lines)),reason:reason.trim(),cancel},prior=(A.DB().supplierReturns || []).find(r=>r.id===operationId);A.checkDataBounds(request);
  if(prior){if(prior.storeId!==A.S()||JSON.stringify(prior.request)!==JSON.stringify(request))throw new Error('Supplier return ID was reused with different contents.');return D.snapshot(prior);}
  if(po.cancelled)throw new Error('Purchase already cancelled.');
  if(po.calculationVersion!=='purchase-allocation-v1'||po.lines.some(l=>!l.lineId||l.value===undefined))throw new Error('Legacy purchase has no verified batch attribution. Use a documented supplier correction and reconcile physical stock separately.');
  if(!Array.isArray(lines)||!lines.length)throw new Error('Select supplier return quantities.');
  const supplier=A.supplier(po.supplierId);if(!supplier)throw new Error('Supplier is unavailable.');
  const previous=A.supplierReturns().filter(r=>r.purchaseId===purchaseId),seen=new Set(),quoted=[];
  for(const input of lines){
   if(seen.has(input.lineId))throw new Error('Duplicate supplier return line.');seen.add(input.lineId);
   const original=po.lines.find(l=>l.lineId===input.lineId),item=original&&A.item(original.itemId);if(!original||!item)throw new Error('Supplier return item is unavailable.');
   const qty=D.quantityUnits(input.qty),sold=D.quantityUnits(original.qty),before=previous.flatMap(r=>r.lines).filter(l=>l.lineId===input.lineId).reduce((n,l)=>n+D.quantityUnits(l.qty),0);if(qty<=0||before+qty>sold)throw new Error('Supplier return exceeds the purchased quantity.');
   let need=qty;const allocations=[];
   const lots=(item.batches || []).filter(b=>b.purchaseId===po.id&&b.purchaseLineId===original.lineId).slice().sort((a,b)=>Number(!!b.quarantined)-Number(!!a.quarantined)||(a.at || 0)-(b.at || 0));
   for(const lot of lots){const use=Math.min(need,D.quantityUnits(lot.qty));if(use){allocations.push({...lot,qty:use/D.QUANTITY_SCALE});need-=use;}if(!need)break;}
   if(need)throw new Error('Purchased stock was sold or moved. Return only attributable goods still held; do not rewrite consumed batches.');
   const amount=A.supplierReturnValue(original,before,qty);
   quoted.push({lineId:original.lineId,itemId:original.itemId,qty:input.qty,cost:original.cost,amount,allocations});
  }
  if(cancel&&(previous.length||quoted.length!==po.lines.length||po.lines.some(l=>!quoted.some(q=>q.lineId===l.lineId&&q.qty===l.qty))))throw new Error('Cancellation requires all original goods, with no previous supplier return.');
  const operation=D.command({id:operationId,accountId:A.accountId,actorId:A.DB().session.staffId,storeId:A.S(),kind:cancel?'cancel_purchase':'supplier_return',at:Date.now(),corrects:po.command?.id || po.id}),amount=A.round2(quoted.reduce((n,l)=>n+l.amount,0));
  const record={id:operationId,command:{...operation},storeId:A.S(),supplierId:po.supplierId,purchaseId,at:operation.at,reason:reason.trim(),cancel,lines:quoted,amount,refundable:A.round2(amount-Math.min(amount,Math.max(0,supplier.balance || 0))),request};
  for(const l of quoted){const item=A.item(l.itemId);for(const allocation of l.allocations){const lot=item.batches.find(b=>b.id===allocation.id);lot.qty=D.quantity(lot.qty-allocation.qty);}item.batches=item.batches.filter(b=>b.qty>0);item.stock=D.quantity(item.batches.reduce((n,b)=>n+b.qty,0));}
  (A.DB().supplierReturns ||= []).push(record);if(cancel){po.cancelled=true;po.cancellationId=record.id;}
  A.postSupplierMovement(supplier,{id:A.uid('supplier_return_entry'),kind:'return',delta:-amount,at:record.at,storeId:A.S(),staffId:A.DB().session.staffId,returnId:record.id,note:record.reason});
  A.log('supplier_return','Supplier return for purchase #'+po.no,{returnId:record.id});await A.save({op:'supplier_return'});return D.snapshot(record);
 };
 A.actions.settleSupplierCredit=async function(returnId,amount,mode,reference,operationId=A.uid('supplier_refund')){
  A.requirePermission('purchase');const ret=A.supplierReturns().find(r=>r.id===returnId);if(!ret)throw new Error('Supplier return not found.');
  const amt=A.round2(A.number(amount,'Supplier refund',0.01));if(!['cash','upi'].includes(mode)||typeof reference!=='string'||reference.trim().length<3)throw new Error('Record the supplier payment method and receipt/reference.');
  const request={returnId,amount:amt,mode,reference:reference.trim()},prior=(A.DB().supplierRefunds || []).find(r=>r.id===operationId);if(prior){if(prior.storeId!==A.S()||JSON.stringify(prior.request)!==JSON.stringify(request))throw new Error('Supplier refund ID reused with different contents.');return D.snapshot(prior);}
  if(amt>A.supplierRefundDue(ret))throw new Error('Supplier refund exceeds remaining return credit.');
  const operation=D.command({id:operationId,accountId:A.accountId,actorId:A.DB().session.staffId,storeId:A.S(),kind:'supplier_refund',at:Date.now(),corrects:returnId});
  const record={id:operationId,command:{...operation},storeId:A.S(),supplierId:ret.supplierId,returnId,amount:amt,mode,reference:reference.trim(),at:operation.at,request};(A.DB().supplierRefunds ||= []).push(record);
  A.postSupplierMovement(A.supplier(ret.supplierId),{id:A.uid('supplier_refund_entry'),kind:'refund',delta:amt,at:record.at,storeId:A.S(),staffId:A.DB().session.staffId,refundId:record.id,mode,note:record.reference});await A.save({op:'supplier_refund'});return D.snapshot(record);
 };
 A.actions.correctSupplierBalance=async function(supplierId,amount,note,operationId=A.uid('supplier_correction')){
  A.requirePermission('settings');const supplier=A.supplier(supplierId);if(!supplier)throw new Error('Supplier not found.');const delta=A.round2(A.number(amount,'Supplier correction',-1e9));if(!delta||typeof note!=='string'||note.trim().length<3)throw new Error('Provide a nonzero correction and reason.');
  const request={supplierId,delta,note:note.trim()},prior=A.DB().suppliers.flatMap(s=>s.ledger || []).find(e=>e.id===operationId);if(prior){if(prior.storeId!==A.S()||JSON.stringify(prior.request)!==JSON.stringify(request))throw new Error('Supplier correction ID reused.');return D.snapshot(prior);}
  const operation=D.command({id:operationId,accountId:A.accountId,actorId:A.DB().session.staffId,storeId:A.S(),kind:'supplier_correction',at:Date.now()});const entry={id:operationId,kind:'correction',command:{...operation},delta,at:operation.at,storeId:A.S(),staffId:A.DB().session.staffId,note:note.trim(),request};A.postSupplierMovement(supplier,entry);await A.save({op:'supplier_correction'});return D.snapshot(entry);
 };
 const esc=v=>A.esc(String(v ?? '')),money=v=>A.money(v,true);
 const field=(id,label,type='text',value='')=>'<div class="field"><label for="'+id+'">'+label+'</label><input class="inp" id="'+id+'" type="'+type+'" value="'+esc(value)+'" step="any"></div>';
 const method=id=>'<div class="field"><label for="'+id+window.App.moneyLiteral('">Payment method</label><select class="inp" id="')+id+window.App.moneyLiteral('"><option value="cash">Cash</option><option value="upi">UPI</option></select></div>');
 A.supplierPaymentDialog=function(id){
  A.requirePermission('pay_supplier');const s=A.supplier(id),operationId=A.uid('supplier_payment'),purchases=A.purchases().filter(p=>p.supplierId===id&&!p.cancelled&&A.purchasePaid(p)<p.total);
  const body=A.el('<div>'+field('supplierPayAmount',window.App.moneyLiteral('Amount paid'),'number',Math.max(0,s.balance))+method('supplierPayMode')+window.App.moneyLiteral('<div class="field"><label for="supplierPayPurchase">Link to purchase (optional)</label><select class="inp" id="supplierPayPurchase"><option value="">Supplier balance</option>')+purchases.map(p=>'<option value="'+esc(p.id)+'">#'+p.no+' · '+esc(money(p.total-A.purchasePaid(p)))+'</option>').join('')+window.App.moneyLiteral('</select></div><p>Record a payment already made to the supplier.</p></div>'));
  A.modal({title:window.App.moneyLiteral('Pay ')+esc(s.name),body,buttons:[{label:window.App.moneyLiteral('Cancel'),cls:'ghost'},{label:window.App.moneyLiteral('Save supplier payment'),cls:'pri',fn:async()=>{await A.actions.paySupplier(id,Number(A.$('#supplierPayAmount',body).value),A.$('#supplierPayMode',body).value,{operationId,purchaseId:A.$('#supplierPayPurchase',body).value});A.render();}}]});
 };
 A.supplierCorrectionDialog=function(id){
  A.requirePermission('settings');const operationId=A.uid('supplier_correction'),body=A.el('<div>'+field('supplierCorrectionAmount',window.App.moneyLiteral('Signed amount: positive owed, negative credit'),'number')+field('supplierCorrectionReason',window.App.moneyLiteral('Reason'))+window.App.moneyLiteral('<p>This records a balance correction without moving stock or cash. Reconcile physical stock separately.</p></div>'));
  A.modal({title:window.App.moneyLiteral('Correct supplier balance'),body,buttons:[{label:window.App.moneyLiteral('Cancel'),cls:'ghost'},{label:window.App.moneyLiteral('Save correction'),cls:'pri',fn:async()=>{await A.actions.correctSupplierBalance(id,Number(A.$('#supplierCorrectionAmount',body).value),A.$('#supplierCorrectionReason',body).value,operationId);A.render();}}]});
 };
 A.supplierRefundDialog=function(id){
  A.requirePermission('purchase');const ret=A.supplierReturns().find(r=>r.id===id),operationId=A.uid('supplier_refund'),body=A.el('<div>'+field('supplierRefundAmount',window.App.moneyLiteral('Amount received'),'number',A.supplierRefundDue(ret))+method('supplierRefundMode')+field('supplierRefundReference',window.App.moneyLiteral('Receipt / reference'))+window.App.moneyLiteral('<p>Record money already received from the supplier. This does not initiate a bank transfer.</p></div>'));
  A.modal({title:window.App.moneyLiteral('Supplier refund received'),body,buttons:[{label:window.App.moneyLiteral('Cancel'),cls:'ghost'},{label:window.App.moneyLiteral('Save supplier refund'),cls:'pri',fn:async()=>{await A.actions.settleSupplierCredit(id,Number(A.$('#supplierRefundAmount',body).value),A.$('#supplierRefundMode',body).value,A.$('#supplierRefundReference',body).value,operationId);A.render();}}]});
 };
 A.purchaseReturnDialog=function(id){
  A.requirePermission('purchase');const po=A.purchases().find(p=>p.id===id);if(!po)return;
  if(po.calculationVersion!=='purchase-allocation-v1')return A.modal({title:window.App.moneyLiteral('Historical purchase exception'),body:A.el(window.App.moneyLiteral('<p>This purchase has no verified batch attribution. Preserve it and use a documented supplier balance correction; reconcile physical stock separately.</p>')),buttons:[{label:window.App.moneyLiteral('Close'),cls:'ghost'},{label:window.App.moneyLiteral('Correct supplier balance'),fn:()=>A.supplierCorrectionDialog(po.supplierId)}]});
  const available=A.purchaseReturnable(po),operationId=A.uid('supplier_return'),body=A.el(window.App.moneyLiteral('<div><p>Only stock still attributed to this purchase can be returned. Original payments remain recorded.</p>')+po.lines.map((l,n)=>field('supplierReturnQty'+n,esc(l.name || A.item(l.itemId)?.name)+window.App.moneyLiteral(' · available ')+available[n].qty,'number',0)).join('')+field('supplierReturnReason',window.App.moneyLiteral('Reason'))+window.App.moneyLiteral('<div class="field"><label><input id="supplierCancelPurchase" type="checkbox"> Cancel duplicate purchase (all original goods must be held)</label></div></div>'));
  A.modal({title:window.App.moneyLiteral('Return purchase #')+po.no,body,buttons:[{label:window.App.moneyLiteral('Close'),cls:'ghost'},{label:window.App.moneyLiteral('Record supplier return'),cls:'pri',fn:async()=>{const lines=po.lines.map((l,n)=>({lineId:l.lineId,qty:Number(A.$('#supplierReturnQty'+n,body).value)})).filter(l=>l.qty!==0);await A.actions.returnPurchase({purchaseId:id,lines,reason:A.$('#supplierReturnReason',body).value,cancel:A.$('#supplierCancelPurchase',body).checked,operationId});A.render();}}]});
 };
 A.supplierDetail=function(id){
  A.requirePermission('settings');const s=A.supplier(id),statement=A.supplierStatement(id),purchases=A.purchases().filter(p=>p.supplierId===id),returns=A.supplierReturns().filter(r=>r.supplierId===id);
  const body=A.el('<div><p><b>'+esc(s.name)+'</b> · '+(s.balance<0?window.App.moneyLiteral('Supplier credit '):window.App.moneyLiteral('Amount owed '))+esc(money(Math.abs(s.balance)))+window.App.moneyLiteral('</p><h3>Balance history</h3><p>Latest 40 entries; CSV includes every entry. Positive means owed to supplier.</p><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Date</th><th>Movement</th><th>Change</th><th>Balance</th></tr></thead><tbody>')+statement.entries.slice(-40).map(e=>'<tr><td>'+esc(A.fmtDT(e.at))+'</td><td>'+esc(A.moneyCode(e.kind))+' · '+esc(e.note)+'</td><td>'+esc(money(e.delta))+'</td><td>'+esc(money(e.balance))+'</td></tr>').join('')+window.App.moneyLiteral('</tbody></table></div><h3>Purchases</h3>')+purchases.map(p=>'<p>#'+p.no+' · '+esc(money(p.total))+window.App.moneyLiteral(' · linked paid ')+esc(money(A.purchasePaid(p)))+(p.cancelled?window.App.moneyLiteral(' · Cancelled'):' <button class="btn xs" data-purchase-return="'+esc(p.id)+window.App.moneyLiteral('">Return / correct</button>'))+'</p>').join('')+window.App.moneyLiteral('<h3>Supplier returns</h3>')+returns.map(r=>'<p>'+esc(A.fmtDT(r.at))+' · '+esc(money(r.amount))+' · '+esc(r.reason)+window.App.moneyLiteral(' · refund available ')+esc(money(A.supplierRefundDue(r)))+' <button class="btn xs" data-supplier-note="'+esc(r.id)+window.App.moneyLiteral('">Download credit note</button>')+(A.supplierRefundDue(r)>0?' <button class="btn xs" data-supplier-refund="'+esc(r.id)+window.App.moneyLiteral('">Record refund received</button>'):'')+'</p>').join('')+'</div>');
  const modal=A.modal({title:window.App.moneyLiteral('Supplier account'),body,wide:true,buttons:[{label:window.App.moneyLiteral('Balance CSV'),keepOpen:true,fn:()=>A.download(A.toCSV([[window.App.moneyLiteral('Date'),'Kind',window.App.moneyLiteral('Change'),window.App.moneyLiteral('Balance'),window.App.moneyLiteral('Note')],...statement.entries.map(e=>[new Date(e.at).toISOString(),e.kind,e.delta,e.balance,e.note])]),'supplier-balance.csv','text/csv')},{label:window.App.moneyLiteral('Correct balance'),fn:()=>A.supplierCorrectionDialog(id)},s.balance>0?{label:window.App.moneyLiteral('Record payment'),fn:()=>A.supplierPaymentDialog(id)}:null,{label:window.App.moneyLiteral('Close'),cls:'ghost'}]});
  body.addEventListener('click',e=>{const p=e.target.closest('[data-purchase-return]'),f=e.target.closest('[data-supplier-refund]'),n=e.target.closest('[data-supplier-note]');if(p){modal.close();A.purchaseReturnDialog(p.dataset.purchaseReturn);}if(f){modal.close();A.supplierRefundDialog(f.dataset.supplierRefund);}if(n){const r=returns.find(r=>r.id===n.dataset.supplierNote);A.download('Supplier return / credit note\n'+s.name+'\nPurchase: '+r.purchaseId+'\nAmount: '+money(r.amount)+'\nReason: '+r.reason+'\nRecorded: '+new Date(r.at).toISOString()+'\n'+r.lines.map(l=>l.qty+' x '+(A.item(l.itemId)?.name || l.itemId)+' = '+money(l.amount)).join('\n'),'supplier-return-'+r.id+'.txt','text/plain');}});
 };
})(window);
