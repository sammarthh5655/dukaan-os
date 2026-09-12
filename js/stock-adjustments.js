/* Reasoned physical stock movements; no automatic cash or expense entries. */
(function(w){
  'use strict';
  const A=w.App,D=A.domain;
  A.stockAdjustments=()=> (A.DB().stockAdjustments || []).filter(r=>r.storeId===A.S());
  A.stockFingerprint=it=>JSON.stringify([it.stock,it.batches]);
  A.stockLots=it=>it.batches.length?it.batches:[{id:'undated',qty:it.stock,cost:it.cost,expiry:'',at:it.at || 0}];
  A.stockSummary=it=>({physical:A.itemStock(it),sellable:A.sellableStock(it),quarantine:D.quantity((it.batches || []).filter(b=>b.quarantined).reduce((n,b)=>n+b.qty,0)),expired:D.quantity((it.batches || []).filter(b=>!b.quarantined&&b.expiry&&b.expiry<A.dayKey(Date.now())).reduce((n,b)=>n+b.qty,0))});
  // CSV already stages all rows before persistence. Return a movement for that same atomic save.
  A.stageImportedStockCount=function(it,count){
    A.requirePermission('edit_inventory');if(it.batches.length)throw new Error('Count individual batches in Count / dispose.');
    const before=A.stockSummary(it),delta=D.quantity(count-it.stock),batch={id:A.uid('counted_batch'),qty:it.stock,cost:it.cost,expiry:'',at:Date.now()};
    const operation=D.command({id:A.uid('adjustment'),accountId:A.accountId,actorId:A.DB().session.staffId,storeId:A.S(),kind:'stock_adjustment',at:Date.now()});
    const record={id:operation.id,command:{...operation},storeId:A.S(),itemId:it.id,itemName:A.itemName(it),at:operation.at,staffId:A.DB().session.staffId,reasonCode:'count',note:'Owner CSV stock count',reverses:'',batch,beforeBatch:it.stock,afterBatch:count,delta,value:A.round2(delta*it.cost),before,request:{source:'csv',count}};
    it.stock=count;it.batches=count?[{...batch,qty:count}]:[];record.after=A.stockSummary(it);return record;
  };

  A.actions.adjustStock=async function({itemId,batchId='',count,delta,reasonCode='count',note='',cost,expiry='',quarantined=false,reverses='',expectedStock,operationId=A.uid('adjustment')}={}){
    A.requirePermission('edit_inventory');
    const it=A.item(itemId);if(!it)throw new Error('Item not found in this store.');
    if(!['count','found','expired','damaged','reversal'].includes(reasonCode)||typeof note!=='string'||note.trim().length<3)throw new Error('Select a reason and describe the stock adjustment.');
    const request=JSON.parse(JSON.stringify({itemId,batchId,count,delta,reasonCode,note:note.trim(),cost,expiry,quarantined,reverses}));A.checkDataBounds(request);
    const prior=(A.DB().stockAdjustments || []).find(r=>r.id===operationId);
    if(prior){if(prior.storeId!==A.S()||JSON.stringify(prior.request)!==JSON.stringify(request))throw new Error('Stock operation ID was reused with different contents.');return D.snapshot(prior);}
    if(expectedStock!==undefined&&expectedStock!==A.stockFingerprint(it))throw new Error('Stock changed while this count was open. Reopen and recount.');
    const original=reverses&&A.stockAdjustments().find(r=>r.id===reverses&&r.itemId===itemId);
    if(reasonCode==='reversal'){
      if(!original||A.stockAdjustments().some(r=>r.reverses===reverses))throw new Error('Adjustment is missing or already reversed.');
      batchId=original.batch.id;delta=-original.delta;count=undefined;
    }else if(reverses)throw new Error('A reversal needs the reversal reason.');
    let lot=A.stockLots(it).find(b=>b.id===batchId);
    if(batchId&&!lot&&reasonCode!=='reversal')throw new Error('Batch is no longer held. Reopen the count.');
    if((count===undefined)===(delta===undefined))throw new Error('Provide either a counted quantity or a signed change.');
    const beforeBatch=lot?.qty || 0;
    if(count!==undefined){A.number(count,'Counted stock');D.quantityUnits(count);delta=D.quantity(count-beforeBatch);}
    A.number(delta,'Stock change',-1e9);D.quantityUnits(Math.abs(delta));if(!delta)throw new Error('Count is unchanged; no movement needed.');
    const afterBatch=D.quantity(beforeBatch+delta);if(afterBatch<0)throw new Error('Adjustment exceeds stock still held in this batch.');
    if(['expired','damaged'].includes(reasonCode)&&delta>0)throw new Error('Disposal must remove stock.');
    if(reasonCode==='found'&&delta<0)throw new Error('Found stock must add units.');
    if(reasonCode==='expired'&&(!lot?.expiry||lot.expiry>=A.dayKey(Date.now())))throw new Error('Select a batch with an expiry date before today.');
    if(original&&lot&&['cost','expiry','quarantined','purchaseId','purchaseLineId'].some(k=>(lot[k] ?? null)!==(original.batch[k] ?? null)))throw new Error('Batch identity changed; reconcile with a new count.');
    if(!lot){
      if(original)lot={...original.batch,qty:0};
      else{
        A.number(cost ?? it.cost,'Stock cost');if(typeof quarantined!=='boolean'||(expiry&&(!/^\d{4}-\d{2}-\d{2}$/.test(expiry)||new Date(expiry).toISOString().slice(0,10)!==expiry)))throw new Error('Invalid new-batch details.');
        lot={id:A.uid('adjusted_batch'),qty:0,cost:cost ?? it.cost,expiry,quarantined,at:Date.now()};
      }
    }
    const before=A.stockSummary(it),batch={...lot};if(batch.id==='undated')batch.id=A.uid('counted_batch');
    const operation=D.command({id:operationId,accountId:A.accountId,actorId:A.DB().session.staffId,storeId:A.S(),kind:'stock_adjustment',at:Date.now(),corrects:reverses || null});
    // Materialize the prior undated quantity only after all input checks pass.
    if(!it.batches.length&&it.stock>0){it.batches=[{...A.stockLots(it)[0],id:batchId==='undated'?batch.id:A.uid('opening_batch')}];}
    let target=it.batches.find(b=>b.id===batch.id);if(!target){target={...batch,qty:0};it.batches.push(target);}target.qty=afterBatch;
    it.batches=it.batches.filter(b=>b.qty>0);it.stock=D.quantity(it.batches.reduce((n,b)=>n+b.qty,0));
    const record={id:operationId,command:{...operation},storeId:A.S(),itemId,itemName:A.itemName(it),at:operation.at,staffId:A.DB().session.staffId,reasonCode,note:note.trim(),reverses,batch,beforeBatch,afterBatch,delta,value:A.round2(delta*batch.cost),before,after:A.stockSummary(it),request};
    (A.DB().stockAdjustments ||= []).push(record);A.log('stock_adjustment',record.itemName+' '+delta+' · '+reasonCode,{adjustmentId:record.id});await A.save({op:'stock_adjustment'});return D.snapshot(record);
  };
  A.actions.reverseStockAdjustment=(id,note,operationId)=>{
    const original=A.stockAdjustments().find(r=>r.id===id);if(!original)throw new Error('Adjustment not found.');
    return A.actions.adjustStock({itemId:original.itemId,reasonCode:'reversal',reverses:id,note,operationId});
  };
  A.stockAdjustmentDialog=function(id){
    A.requirePermission('edit_inventory');const it=A.item(id),expectedStock=A.stockFingerprint(it),operationId=A.uid('adjustment'),lots=A.stockLots(it),esc=A.esc;
    const body=A.el('<div><p>'+esc(A.itemName(it))+window.App.moneyLiteral(' · physical ')+A.itemStock(it)+window.App.moneyLiteral(' · sellable ')+A.sellableStock(it)+window.App.moneyLiteral(' · quarantine ')+A.stockSummary(it).quarantine+window.App.moneyLiteral('</p><div class="field"><label for="adjustBatch">Batch to count</label><select class="inp" id="adjustBatch">')+lots.map(b=>'<option value="'+esc(b.id)+'">'+esc(b.expiry || window.App.moneyLiteral('Undated'))+' · '+b.qty+' units · '+(b.quarantined?window.App.moneyLiteral('Quarantine'):window.App.moneyLiteral('Sellable'))+'</option>').join('')+window.App.moneyLiteral('<option value="">New found-stock batch</option></select></div><div class="field"><label for="adjustCount">Counted quantity remaining in this batch</label><input class="inp" id="adjustCount" type="number" min="0" step="0.0001" value="')+lots[0].qty+window.App.moneyLiteral('"></div><div class="field"><label for="adjustReason">Reason</label><select class="inp" id="adjustReason"><option value="count">Physical count</option><option value="expired">Expired disposal</option><option value="damaged">Damaged disposal</option><option value="found">Found stock</option></select></div><div class="field"><label for="adjustNote">Count / disposal note</label><input class="inp" id="adjustNote"></div><div id="adjustNew" hidden><div class="field"><label for="adjustCost">Unit cost for new found stock</label><input class="inp" id="adjustCost" type="number" min="0" step="any" value="')+it.cost+window.App.moneyLiteral('"></div><div class="field"><label for="adjustExpiry">Expiry (optional)</label><input class="inp" id="adjustExpiry" type="date"></div><label><input id="adjustQuarantine" type="checkbox"> Keep new goods in quarantine</label></div><p>Existing batch cost and status are preserved. This records a stock movement without changing cash, customer debt or supplier debt.</p></div>'));
    body.querySelector('#adjustBatch').addEventListener('change',()=>{const selected=body.querySelector('#adjustBatch').value;body.querySelector('#adjustNew').hidden=!!selected;body.querySelector('#adjustCount').value=lots.find(b=>b.id===selected)?.qty || 0;});
    A.modal({title:window.App.moneyLiteral('Count / dispose stock'),body,buttons:[{label:window.App.moneyLiteral('Cancel'),cls:'ghost'},{label:window.App.moneyLiteral('Record stock adjustment'),cls:'pri',fn:async()=>{await A.actions.adjustStock({itemId:id,batchId:A.$('#adjustBatch',body).value,count:Number(A.$('#adjustCount',body).value),reasonCode:A.$('#adjustReason',body).value,note:A.$('#adjustNote',body).value,cost:Number(A.$('#adjustCost',body).value),expiry:A.$('#adjustExpiry',body).value,quarantined:A.$('#adjustQuarantine',body).checked,expectedStock,operationId});A.render();}}]});
  };
  A.stockAdjustmentHistory=function(){
    A.requirePermission('edit_inventory');const rows=A.stockAdjustments(),esc=A.esc;
    const body=A.el(window.App.moneyLiteral('<div><p>Latest 50 adjustments. CSV includes all adjustments. Cost values are informational; cash and sales profit are unchanged.</p>')+rows.slice(-50).reverse().map(r=>'<p><b>'+esc(r.itemName)+'</b> · '+esc(A.fmtDT(r.at))+' · '+esc(A.moneyCode(r.reasonCode))+' · '+r.delta+' units · '+esc(A.money(r.value,true))+'<br>'+esc(r.note)+window.App.moneyLiteral(' · physical ')+r.before.physical+' → '+r.after.physical+' · '+esc(r.staffId)+(rows.some(x=>x.reverses===r.id)?' · Reversed':' <button class="btn xs" data-reverse-adjustment="'+esc(r.id)+window.App.moneyLiteral('">Reverse adjustment</button>'))+'</p>').join('')+'</div>');
    const modal=A.modal({title:window.App.moneyLiteral('Stock adjustment history'),body,wide:true,buttons:[{label:window.App.moneyLiteral('Export adjustments CSV'),keepOpen:true,fn:()=>A.download(A.toCSV([[window.App.moneyLiteral('Date'),window.App.moneyLiteral('Item'),window.App.moneyLiteral('Batch'),window.App.moneyLiteral('Reason'),'Units',window.App.moneyLiteral('Cost value'),window.App.moneyLiteral('Physical before'),window.App.moneyLiteral('Physical after'),window.App.moneyLiteral('Actor'),window.App.moneyLiteral('Note'),window.App.moneyLiteral('Reverses')],...rows.map(r=>[new Date(r.at).toISOString(),r.itemName,r.batch.id,r.reasonCode,r.delta,r.value,r.before.physical,r.after.physical,r.staffId,r.note,r.reverses])]),'stock-adjustments.csv','text/csv')},{label:window.App.moneyLiteral('Close'),cls:'ghost'}]});
    body.addEventListener('click',async e=>{const button=e.target.closest('[data-reverse-adjustment]');if(!button)return;const operationId=A.uid('adjustment'),note=await A.prompt(window.App.moneyLiteral('Reverse adjustment'),window.App.moneyLiteral('Describe why this movement is being reversed'));if(note===null)return;try{await A.actions.reverseStockAdjustment(button.dataset.reverseAdjustment,note,operationId);modal.close();A.stockAdjustmentHistory();}catch(error){A.reportError(error);}});
  };
})(window);
