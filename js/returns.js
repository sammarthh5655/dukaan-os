/* Sale-linked compensations; recording a return never calls a payment provider. */
(function(w){
 'use strict';const A=w.App,D=A.domain;
 const ratio=(amount,num,den)=>Number((BigInt(amount)*BigInt(num)*2n+BigInt(den))/(2n*BigInt(den)));
 const lineId=(l,i)=>l.lineId || String(i);
 A.returnable=bill=>!bill.void&&bill.calculationVersion===D.CALCULATION_VERSION&&bill.lines.every(l=>l.allocations&&l.taxable!==undefined&&l.tax!==undefined);
 function quote(bill,previous,requested){
  if(bill.void)throw new Error('A void sale cannot be returned.');
  if(bill.calculationVersion!==D.CALCULATION_VERSION||bill.lines.some(l=>!l.allocations||l.taxable===undefined||l.tax===undefined))throw new Error('Legacy sale lacks verified tax/batch allocations. Preserve it for owner reconciliation.');
  A.number(bill.redeemedPoints || 0,'Original redeemed points');
  if(Math.abs(A.round2(bill.lines.reduce((n,l)=>n+l.taxable+l.tax,0))-bill.total)>0.00001||Math.abs(A.round2(bill.lines.reduce((n,l)=>n+l.tax,0))-bill.tax)>0.00001)throw new Error('Original line tax allocations do not reconcile. Preserve the sale for owner review.');
  if(!Array.isArray(requested)||!requested.length)throw new Error('Select quantities to return.');
  const seen=new Set(),lines=[];
  for(const input of requested){
   if(seen.has(input.lineId))throw new Error('Duplicate return line.');seen.add(input.lineId);
   const index=bill.lines.findIndex((l,i)=>lineId(l,i)===input.lineId),l=bill.lines[index];if(!l)throw new Error('Return line is not in this sale.');
   const qty=D.quantityUnits(input.qty),sold=D.quantityUnits(l.qty);if(qty<=0)throw new Error('Return quantity must be positive.');
   const prior=previous.flatMap(r=>r.lines).filter(x=>x.lineId===input.lineId).reduce((n,x)=>n+D.quantityUnits(x.qty),0),next=prior+qty;
   if(next>sold)throw new Error('Return exceeds the remaining sold quantity.');
   const part=value=>(ratio(D.paise(value),next,sold)-ratio(D.paise(value),prior,sold))/100;
   let offset=0;const allocations=[];
   for(const lot of l.allocations){const size=D.quantityUnits(lot.qty),use=Math.max(0,Math.min(offset+size,next)-Math.max(offset,prior));if(use)allocations.push({...lot,qty:use/D.QUANTITY_SCALE});offset+=size;}
   if(allocations.reduce((n,b)=>n+D.quantityUnits(b.qty),0)!==qty)throw new Error('Original batch allocation is incomplete.');
   const taxable=part(l.taxable),tax=part(l.tax),gross=part(l.gross);
   lines.push({lineId:input.lineId,itemId:l.itemId,name:l.name,unit:l.unit || 'unit',gst:bill.tax?(l.gst || 0):0,qty:input.qty,taxable,tax,gross,total:A.round2(taxable+tax),cost:allocations.reduce((n,b)=>n+b.cost*b.qty,0)/input.qty,allocations});
  }
  const oldGross=D.paise(previous.reduce((n,r)=>n+r.lines.reduce((v,l)=>v+l.gross,0),0)),newGross=oldGross+D.paise(lines.reduce((n,l)=>n+l.gross,0)),gross=D.paise(bill.sub);
  const points=value=>gross?(ratio(Math.round((value || 0)*100),newGross,gross)-ratio(Math.round((value || 0)*100),oldGross,gross))/100:0;
  return {lines,amount:A.round2(lines.reduce((n,l)=>n+l.total,0)),tax:A.round2(lines.reduce((n,l)=>n+l.tax,0)),redeemedPoints:points(bill.redeemedPoints),loyaltyReversed:points(bill.loyalty)};
 }
 A.returnMath={quote};
 A.returns=()=> (A.DB().returns || []).filter(r=>r.storeId===A.S());
 A.refunds=()=> (A.DB().refunds || []).filter(r=>r.storeId===A.S());
 A.returnableLines=bill=>bill.lines.map((l,i)=>({lineId:lineId(l,i),qty:bill.void?0:D.quantity(l.qty-A.returns().filter(r=>r.billId===bill.id).flatMap(r=>r.lines).filter(x=>x.lineId===lineId(l,i)).reduce((n,x)=>n+x.qty,0))}));
 A.returnRefundDue=ret=>{
  const remaining=A.round2(ret.refundable-A.refunds().filter(r=>r.returnId===ret.id).reduce((n,r)=>n+r.amount,0));
  const customer=ret.customerId&&A.customer(ret.customerId);
  return Math.max(0,ret.ledgerApplied?Math.min(remaining,Math.max(0,-(customer?.balance || 0))):remaining);
 };
 A.actions.returnSale=async function({billId,lines,disposition='restock',destination='refund',reason,operationId=A.uid('return')}={}){
  A.requirePermission('void_bill');
  if(!['restock','quarantine'].includes(disposition)||!['refund','customer'].includes(destination))throw new Error('Choose a valid return disposition and destination.');
  if(typeof reason!=='string'||reason.trim().length<3)throw new Error('Provide a return reason.');
  const bill=A.bills().find(b=>b.id===billId);if(!bill)throw new Error('Sale not found in this store.');
  const request={billId,lines:JSON.parse(JSON.stringify(lines)),disposition,destination,reason:reason.trim()};
  A.checkDataBounds(request);
  const prior=(A.DB().returns || []).find(r=>r.id===operationId);
  if(prior){if(prior.storeId!==A.S()||JSON.stringify(prior.request)!==JSON.stringify(request))throw new Error('Return operation ID was reused with different contents.');return D.snapshot(prior);}
  const operation=D.command({id:operationId,accountId:A.accountId,actorId:A.DB().session.staffId,storeId:A.S(),kind:'return_sale',at:Date.now(),corrects:bill.command?.id || bill.id});
  const amounts=quote(bill,A.returns().filter(r=>r.billId===billId),lines),customer=bill.customerId&&A.customer(bill.customerId);
  if((bill.customerId&&!customer)||(destination==='customer'&&!customer))throw new Error('A current customer is required for this credit return.');
  for(const l of amounts.lines)if(!A.item(l.itemId))throw new Error('Returned item is unavailable in this store. Restore the item before returning it.');
  const ledgerApplied=!!customer&&(bill.credit||destination==='customer'),debtApplied=ledgerApplied?Math.min(amounts.amount,Math.max(0,customer.balance || 0)):0;
  const ret={id:operationId,command:{...operation},storeId:A.S(),billId,billNo:bill.no,customerId:bill.customerId || '',originalCredit:bill.credit,at:operation.at,reason:reason.trim(),disposition,destination,ledgerApplied,refundable:A.round2(amounts.amount-debtApplied),...amounts,request};
  ret.receiptSettings=JSON.parse(JSON.stringify(bill.receiptSettings || {shopName:A.DB().settings.shopName,currency:A.DB().settings.currency}));
  for(const l of ret.lines)for(const lot of l.allocations){const restored=disposition==='quarantine'?{...lot,id:A.uid('quarantine'),sourceBatchId:lot.id,quarantined:true}:lot;A.giveStock(A.item(l.itemId),lot.qty,lot.expiry,lot.cost,restored);}
  (A.DB().returns ||= []).push(ret);
  if(customer){
   if(ledgerApplied)A.postCustomerMovement(customer,{id:A.uid('return_entry'),kind:'return',delta:-ret.amount,at:ret.at,storeId:A.S(),staffId:A.DB().session.staffId,returnId:ret.id,note:ret.reason});
   customer.points=A.round2((customer.points || 0)+ret.redeemedPoints-ret.loyaltyReversed);customer.spend=A.round2((customer.spend || 0)-ret.amount);
  }
  A.log('return','Return for bill #'+bill.no,{returnId:ret.id});await A.save({op:'return'});return D.snapshot(ret);
 };
 A.actions.settleReturn=async function(returnId,amount,mode,reference,operationId=A.uid('refund')){
  A.requirePermission('void_bill');const ret=A.returns().find(r=>r.id===returnId);if(!ret)throw new Error('Return not found in this store.');
  const amt=A.round2(A.number(amount,'Refund',0.01));if(!['cash','upi'].includes(mode))throw new Error('Refund method must be cash or UPI.');
  if(typeof reference!=='string'||reference.trim().length<3)throw new Error('Record a cash receipt or UPI reference.');
  const request={returnId,amount:amt,mode,reference:reference.trim()},prior=(A.DB().refunds || []).find(r=>r.id===operationId);
  if(prior){if(prior.storeId!==A.S()||JSON.stringify(prior.request)!==JSON.stringify(request))throw new Error('Refund operation ID was reused with different contents.');return D.snapshot(prior);}
  if(amt>A.returnRefundDue(ret))throw new Error('Refund exceeds the remaining liability or available customer credit.');
  const operation=D.command({id:operationId,accountId:A.accountId,actorId:A.DB().session.staffId,storeId:A.S(),kind:'settle_refund',at:Date.now(),corrects:returnId});
  const record={id:operationId,command:{...operation},storeId:A.S(),returnId,amount:amt,mode,reference:reference.trim(),at:operation.at,request};(A.DB().refunds ||= []).push(record);
  if(ret.ledgerApplied)A.postCustomerMovement(A.customer(ret.customerId),{id:A.uid('refund_entry'),kind:'refund',delta:amt,at:record.at,storeId:A.S(),staffId:A.DB().session.staffId,refundId:record.id,note:record.reference});
  A.log('refund','Refund for bill #'+ret.billNo,{refundId:record.id});await A.save({op:'refund'});return D.snapshot(record);
 };
 A.returnDocument=ret=>{const money=n=>(ret.receiptSettings?.currency || '₹')+Number(n).toFixed(2);return [ret.receiptSettings?.shopName || 'Shop','Return '+ret.id+' for bill #'+ret.billNo,A.fmtDT(ret.at),ret.reason,...ret.lines.map(l=>l.name+' '+l.qty+' '+l.unit+' = '+money(l.total)),'Tax reversed: '+money(ret.tax),'Return value: '+money(ret.amount),'Disposition: '+ret.disposition,'Refund recorded: '+money(A.refunds().filter(f=>f.returnId===ret.id).reduce((n,f)=>n+f.amount,0)),'Available refund: '+money(A.returnRefundDue(ret))].join('\n');};
 A.showReturn=function(ret){
  A.requirePermission('void_bill');
  const money=n=>(ret.receiptSettings?.currency || '₹')+Number(n).toFixed(2),paid=A.refunds().filter(f=>f.returnId===ret.id).reduce((n,f)=>n+f.amount,0);
  const body=window.App.moneyLiteral('<div><div class="stat"><div class="k">Return value</div><div class="v">')+A.esc(money(ret.amount))+'</div><div class="d">'+A.esc(A.fmtDT(ret.at))+'</div></div>'+ret.lines.map(l=>'<div class="kv"><span>'+A.esc(l.name+' × '+l.qty+' '+l.unit)+'</span><b>'+A.esc(money(l.total))+'</b></div>').join('')+window.App.moneyLiteral('<div class="kv"><span>Tax reversed</span><b>')+A.esc(money(ret.tax))+window.App.moneyLiteral('</b></div><div class="kv"><span>Refund recorded</span><b>')+A.esc(money(paid))+window.App.moneyLiteral('</b></div><div class="kv"><span>Available refund</span><b>')+A.esc(money(A.returnRefundDue(ret)))+'</b></div><p class="alert info">'+(ret.disposition==='quarantine'?window.App.moneyLiteral('Quarantined goods cannot be sold.'):window.App.moneyLiteral('Goods restocked; expiry rules still apply.'))+'</p><p>'+A.esc(ret.reason)+'</p></div>';
  A.modal({title:window.App.moneyLiteral('Return for bill #')+ret.billNo,body,buttons:[{label:A.uiText('58 mm receipt preview'),cls:'ghost',keepOpen:true,fn:()=>A.thermal.preview(ret.id,'return')},{label:window.App.moneyLiteral('Download return note'),cls:'ghost',keepOpen:true,fn:()=>A.download(A.returnDocument(ret),'return-'+ret.id+'.txt','text/plain')},A.returnRefundDue(ret)>0?{label:window.App.moneyLiteral('Record refund paid'),cls:'pri',fn:()=>A.refundDialog(ret.id)}:null,{label:window.App.moneyLiteral('Close'),cls:'ghost'}]});
 };
 A.refundDialog=function(returnId){
  A.requirePermission('void_bill');const ret=A.returns().find(r=>r.id===returnId),operationId=A.uid('refund');if(!ret)return;
  const body=A.el(window.App.moneyLiteral('<div><p>Record a payment already made. This does not send money.</p><div class="field"><label for="refundAmount">Amount paid</label><input class="inp" id="refundAmount" type="number" step="0.01" value="')+A.returnRefundDue(ret)+window.App.moneyLiteral('"></div><div class="field"><label for="refundMode">Method</label><select class="inp" id="refundMode"><option value="cash">Cash</option><option value="upi">UPI</option></select></div><div class="field"><label for="refundReference">Cash receipt or UPI reference</label><input class="inp" id="refundReference"></div></div>'));
  A.modal({title:window.App.moneyLiteral('Record refund paid'),body,buttons:[{label:window.App.moneyLiteral('Cancel'),cls:'ghost'},{label:window.App.moneyLiteral('Save refund'),cls:'pri',fn:async()=>{await A.actions.settleReturn(returnId,Number(A.$('#refundAmount',body).value),A.$('#refundMode',body).value,A.$('#refundReference',body).value,operationId);A.toast('ok',window.App.moneyLiteral('Refund recorded'));}}]});
 };
 A.returnDialog=function(billId){
  A.requirePermission('void_bill');const bill=A.bills().find(b=>b.id===billId);if(!bill)return;
  const available=A.returnableLines(bill),operationId=A.uid('return'),existing=A.returns().filter(r=>r.billId===billId);
  const body=A.el(window.App.moneyLiteral('<div><p>Use original sale prices and taxes. Choose only the goods received back.</p>')+available.map((x,i)=>'<div class="field"><label for="returnQty'+i+'">'+A.esc(bill.lines[i].name)+window.App.moneyLiteral(' · remaining ')+x.qty+'</label><input class="inp" id="returnQty'+i+'" data-return-line="'+A.esc(x.lineId)+'" type="number" min="0" max="'+x.qty+'" step="0.0001" value="0"></div>').join('')+
   window.App.moneyLiteral('<div class="field"><label for="returnDisposition">Stock received</label><select class="inp" id="returnDisposition"><option value="restock">Restock (expiry rules still apply)</option><option value="quarantine">Quarantine damaged goods</option></select></div><div class="field"><label for="returnDestination">Value</label><select class="inp" id="returnDestination"><option value="refund">Refund due</option>')+(bill.customerId?window.App.moneyLiteral('<option value="customer">Customer credit</option>'):'')+window.App.moneyLiteral('</select></div><p class="muted">Credit sales reduce customer debt first. Refund payments are recorded separately.</p><div class="field"><label for="returnReason">Reason</label><input class="inp" id="returnReason"></div>')+
   (existing.length?window.App.moneyLiteral('<h4>Previous returns</h4>')+existing.map(r=>'<button class="btn" data-return-id="'+r.id+'">'+A.esc(A.fmtDT(r.at)+' · '+A.money(r.amount,true))+'</button>').join(''):'')+'</div>');
  const modal=A.modal({title:window.App.moneyLiteral('Return from bill #')+bill.no,body,buttons:[{label:window.App.moneyLiteral('Cancel'),cls:'ghost'},{label:window.App.moneyLiteral('Record return'),cls:'pri',fn:async()=>{
   const lines=A.$$('[data-return-line]',body).map(node=>({lineId:node.dataset.returnLine,qty:Number(node.value)})).filter(l=>l.qty!==0);
   const ret=await A.actions.returnSale({billId,lines,disposition:A.$('#returnDisposition',body).value,destination:A.$('#returnDestination',body).value,reason:A.$('#returnReason',body).value,operationId});A.showReturn(ret);
  }}]});
  body.addEventListener('click',event=>{const button=event.target.closest('[data-return-id]');if(button){modal.close();A.showReturn(existing.find(r=>r.id===button.dataset.returnId));}});
 };
})(window);
