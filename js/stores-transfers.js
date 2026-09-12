/* Local store assignments and balanced stock-in-transit commands. */
(function(w){
 'use strict';const A=w.App,D=A.domain;
 A.canStore=(storeId,staff=A.me())=>!!staff&&staff.active!==false&&A.DB().stores.some(s=>s.id===storeId)&&(staff.role==='owner'||(staff.storeIds || (A.DB().storeAccessVersion===1?[]:[A.S()])).includes(storeId));
 A.storeSettings=()=>({...A.DB().settings,...(A.DB().stores.find(s=>s.id===A.S())?.receiptProfile || {})});
 A.storeTarget=()=>A.DB().stores.find(s=>s.id===A.S())?.dailyTarget ?? A.DB().settings.dailyTarget;
 A.assignmentPreview=()=>A.DB().staff.map(s=>({staffId:s.id,name:s.name,role:s.role,storeIds:s.role==='owner'?A.DB().stores.map(s=>s.id):[...(s.storeIds || (A.DB().storeAccessVersion===1?[]:[A.S()]))]}));
 A.actions.setStoreAssignments=async function(assignments){
  A.requirePermission('settings');A.auth.requireFresh();A.checkDataBounds(assignments);const ids=new Set();
  if(!Array.isArray(assignments)||assignments.length!==A.DB().staff.length)throw new Error('Review every staff member before saving assignments.');
  for(const row of assignments){const staff=A.staff(row.staffId);if(!staff||ids.has(row.staffId)||!Array.isArray(row.storeIds)||new Set(row.storeIds).size!==row.storeIds.length||row.storeIds.some(id=>!A.DB().stores.some(s=>s.id===id)))throw new Error('Invalid staff/store assignment.');ids.add(row.staffId);}
  for(const row of assignments)A.staff(row.staffId).storeIds=[...row.storeIds];A.DB().storeAccessVersion=1;
  A.log('store_access','Owner reviewed staff store assignments');await A.save({op:'store_access'});A.invalidateContext();
 };
 A.actions.switchStore=async function(storeId){
  A.requireAccess();if(!A.canStore(storeId))throw new Error('This staff member is not assigned to that store.');
  A.DB().settings.activeStore=storeId;await A.save({sync:false});A.invalidateContext();if(A.posClear)A.posClear();
 };
 A.actions.setStoreProfile=async function(storeId,profile,dailyTarget){
  A.requirePermission('settings');const store=A.DB().stores.find(s=>s.id===storeId);if(!store)throw new Error('Store not found.');
  const allowed=['shopName','shopPhone','address','gstin','upiId','receiptTheme'];A.checkDataBounds(profile);
  if(!profile||Object.keys(profile).some(k=>!allowed.includes(k))||Object.values(profile).some(v=>typeof v!=='string'))throw new Error('Invalid store receipt profile.');
  if(!profile.shopName?.trim())throw new Error('A receipt shop name is required.');if(profile.receiptTheme&&!['saffron','tulsi','indigo','ink'].includes(profile.receiptTheme))throw new Error('Invalid receipt theme.');
  if(profile.upiId!==(store.receiptProfile?.upiId ?? A.DB().settings.upiId))A.auth.requireFresh();A.number(dailyTarget,'Daily target');
  A.DB().storeProfilesVersion=1;store.receiptProfile={...profile};store.dailyTarget=A.round2(dailyTarget);await A.save({op:'store_profile'});
 };
 A.transfers=()=> (A.DB().stockTransfers || []).filter(t=>t.fromStoreId===A.S()||t.toStoreId===A.S());
 A.transferRemaining=(t,line)=>D.quantity(line.qty-(A.DB().transferReceipts || []).filter(r=>r.transferId===t.id).flatMap(r=>r.lines).filter(l=>l.lineId===line.lineId).reduce((n,l)=>n+l.qty,0));
 A.inTransit=()=>A.transfers().map(t=>({...t,remaining:t.lines.map(l=>({...l,remaining:A.transferRemaining(t,l)}))}));
  A.actions.sendTransfer=async function({toStoreId,lines,note,operationId=A.uid('transfer')}={}){
  A.requirePermission('edit_inventory');if(toStoreId===A.S()||!A.canStore(toStoreId))throw new Error('Select another accessible destination store.');
  if(!Array.isArray(lines)||!lines.length||typeof note!=='string'||note.trim().length<3)throw new Error('Select goods and describe the transfer.');
  for(const l of lines){const it=A.item(l.itemId);if(it)A.units.assertQuantity(it,l.qty);}
  const request={fromStoreId:A.S(),toStoreId,lines:JSON.parse(JSON.stringify(lines)),note:note.trim()};A.checkDataBounds(request);
  const previous=(A.DB().stockTransfers || []).find(t=>t.id===operationId);if(previous){if(JSON.stringify(previous.request)!==JSON.stringify(request))throw new Error('Transfer ID reused with different contents.');return D.snapshot(previous);}
  const staged=JSON.parse(JSON.stringify(A.DB().items)),seen=new Set(),quoted=[];
  for(const input of lines){
   const item=staged.find(i=>i.id===input.itemId&&i.storeId===A.S()&&!i.deleted);if(!item||seen.has(item.id))throw new Error('Transfer source item is missing or repeated.');seen.add(item.id);A.number(input.qty,'Transfer quantity',0.0001);D.quantityUnits(input.qty);
   let target=input.targetItemId&&staged.find(i=>i.id===input.targetItemId&&i.storeId===toStoreId&&!i.deleted);
   if(input.targetItemId&&!target)throw new Error('Destination item is not in that store.');
   if(target&&((target.unit || 'unit')!==(item.unit || 'unit')||!A.units.compatible(target,item)))throw new Error('Destination item must use the same unit.');
   if(!target){target={...JSON.parse(JSON.stringify(item)),id:A.uid('it'),storeId:toStoreId,stock:0,batches:[],at:Date.now()};delete target.lastBuyAt;staged.push(target);}
   const allocations=A.takeStock(item,input.qty);quoted.push({lineId:A.uid('transfer_line'),itemId:item.id,targetItemId:target.id,name:A.itemName(item),unit:item.unit || 'unit',qty:input.qty,allocations});
  }
  const operation=D.command({id:operationId,accountId:A.accountId,actorId:A.DB().session.staffId,storeId:A.S(),kind:'transfer_out',at:Date.now()});
  const record={id:operationId,command:{...operation},storeId:A.S(),fromStoreId:A.S(),toStoreId,at:operation.at,staffId:A.DB().session.staffId,note:note.trim(),lines:quoted,request};
  A.DB().items=staged;(A.DB().stockTransfers ||= []).push(record);A.log('transfer','Stock dispatched',{transferId:record.id});await A.save({op:'transfer_out'});return D.snapshot(record);
 };
 A.actions.receiveTransfer=async function({transferId,lines,note,recall=false,operationId=A.uid('transfer_receipt')}={}){
  A.requirePermission('edit_inventory');const t=A.transfers().find(t=>t.id===transferId);
  if(!t||typeof recall!=='boolean'||A.S()!==(recall?t.fromStoreId:t.toStoreId))throw new Error('Receive in the destination store, or recall in the source store.');
  if(!Array.isArray(lines)||!lines.length||typeof note!=='string'||note.trim().length<3)throw new Error('Enter received quantities and a receipt note.');
  const request={transferId,lines:JSON.parse(JSON.stringify(lines)),note:note.trim(),recall};A.checkDataBounds(request);const previous=(A.DB().transferReceipts || []).find(r=>r.id===operationId);
  if(previous){if(previous.storeId!==A.S()||JSON.stringify(previous.request)!==JSON.stringify(request))throw new Error('Transfer receipt ID reused with different contents.');return D.snapshot(previous);}
  const staged=JSON.parse(JSON.stringify(A.DB().items)),seen=new Set(),quoted=[];
  for(const input of lines){
   const line=t.lines.find(l=>l.lineId===input.lineId);if(!line||seen.has(line.lineId))throw new Error('Transfer line missing or repeated.');seen.add(line.lineId);
   A.number(input.qty,'Received quantity',0.0001);const qty=D.quantityUnits(input.qty),remaining=D.quantityUnits(A.transferRemaining(t,line));if(qty>remaining)throw new Error('Receipt exceeds remaining stock in transit.');
   const target=staged.find(i=>i.id===(recall?line.itemId:line.targetItemId)&&i.storeId===A.S()&&!i.deleted);if(!target||(target.unit || 'unit')!==line.unit)throw new Error('Destination item changed or was removed. Restore its unit before receiving.');
   let skip=D.quantityUnits(line.qty)-remaining,need=qty;const allocations=[];
   for(const source of line.allocations){const units=D.quantityUnits(source.qty);if(skip>=units){skip-=units;continue;}const used=Math.min(need,units-skip);skip=0;if(used){const lot={...source,id:A.uid('transferred_batch'),sourceBatchId:source.id,transferId:t.id,transferLineId:line.lineId,qty:used/D.QUANTITY_SCALE};A.giveStock(target,lot.qty,lot.expiry,lot.cost,lot);allocations.push(lot);need-=used;}if(!need)break;}
   if(need)throw new Error('Transfer allocations do not reconcile.');quoted.push({lineId:line.lineId,itemId:target.id,qty:input.qty,allocations});
  }
  const operation=D.command({id:operationId,accountId:A.accountId,actorId:A.DB().session.staffId,storeId:A.S(),kind:recall?'transfer_recall':'transfer_in',at:Date.now(),corrects:t.id});
  const record={id:operationId,command:{...operation},storeId:A.S(),transferId,at:operation.at,staffId:A.DB().session.staffId,recall,note:note.trim(),lines:quoted,request};
  A.DB().items=staged;(A.DB().transferReceipts ||= []).push(record);A.log('transfer',recall?'Transfer remainder returned to source':'Transfer received',{transferId:t.id,receiptId:record.id});await A.save({op:'transfer_receipt'});return D.snapshot(record);
 };
 const esc=A.esc;
 A.storeAssignmentsDialog=async function(){
  A.requirePermission('settings');const context=A.context();if(!await A.auth.verifyOwner())return;A.assertContext(context);
  const preview=A.assignmentPreview(),stores=A.DB().stores,body=A.el('<div><p>Review each cashier’s stores. Unchecked stores are denied after saving. Owners retain access to every store. New cashiers start unassigned.</p>'+preview.map(row=>'<fieldset><legend>'+esc(row.name)+' · '+esc(row.role)+'</legend>'+stores.map(store=>'<label style="display:block;padding:6px"><input type="checkbox" data-assignment="'+esc(row.staffId)+'" value="'+esc(store.id)+'" '+(row.storeIds.includes(store.id)?'checked ':'')+(row.role==='owner'?'disabled':'')+'> '+esc(store.name)+'</label>').join('')+'</fieldset>').join('')+'</div>');
  A.modal({title:'Review store assignments',body,buttons:[{label:'Cancel',cls:'ghost'},{label:'Save assignments',cls:'pri',fn:async()=>{const rows=preview.map(row=>({staffId:row.staffId,storeIds:Array.from(body.querySelectorAll('[data-assignment="'+row.staffId+'"]:checked'),input=>input.value)}));await A.actions.setStoreAssignments(rows);A.render();}}]});
 };
 A.storeProfileDialog=async function(){
  A.requirePermission('settings');const context=A.context();if(!await A.auth.verifyOwner())return;A.assertContext(context);const storeId=A.S(),profile=A.storeSettings(),fields=[['shopName','Receipt shop name'],['shopPhone','Shop phone'],['address','Address'],['gstin','GSTIN'],['upiId','UPI address']],body=A.el('<div><p>These details apply to the current store. Saved sales keep their original receipt identity.</p>'+fields.map(([key,label])=>'<div class="field"><label for="store_'+key+'">'+label+'</label><input class="inp" id="store_'+key+'" value="'+esc(profile[key] || '')+'"></div>').join('')+'<div class="field"><label for="store_receiptTheme">Receipt theme</label><select class="inp" id="store_receiptTheme">'+['saffron','tulsi','indigo','ink'].map(value=>'<option '+(value===profile.receiptTheme?'selected':'')+'>'+value+'</option>').join('')+'</select></div><div class="field"><label for="store_dailyTarget">Daily target</label><input class="inp" id="store_dailyTarget" type="number" min="0" step="0.01" value="'+A.storeTarget()+'"></div></div>');
  A.modal({title:'Store receipt and target',body,buttons:[{label:'Cancel',cls:'ghost'},{label:'Save store profile',cls:'pri',fn:async()=>{const values=Object.fromEntries([...fields.map(f=>f[0]),'receiptTheme'].map(key=>[key,A.$('#store_'+key,body).value]));await A.actions.setStoreProfile(storeId,values,Number(A.$('#store_dailyTarget',body).value));A.render();}}]});
 };
 A.transferDialog=function(){
  A.requirePermission('edit_inventory');const stores=A.DB().stores.filter(s=>s.id!==A.S()&&A.canStore(s.id)),items=A.items();if(!stores.length||!items.length){A.toast('warn','Transfer needs another store and a source item');return;}
  const operationId=A.uid('transfer'),body=A.el('<div><div class="field"><label for="transferStore">Destination store</label><select class="inp" id="transferStore">'+stores.map(s=>'<option value="'+esc(s.id)+'">'+esc(s.name)+'</option>').join('')+'</select></div><div class="field"><label for="transferSource">Source item</label><select class="inp" id="transferSource">'+items.map(i=>'<option value="'+esc(i.id)+'">'+esc(A.itemName(i))+' · '+A.sellableStock(i)+' sellable</option>').join('')+'</select></div><div class="field"><label for="transferTarget">Destination catalog item</label><select class="inp" id="transferTarget"></select></div><div class="field"><label for="transferQty">Quantity dispatched</label><input class="inp" id="transferQty" type="number" min="0.0001" step="0.0001" value="1"></div><div class="field"><label for="transferNote">Dispatch note</label><input class="inp" id="transferNote"></div><p>Dispatched units stay in transit until recorded as received. Only sellable source stock can be dispatched. Stock can expire while in transit.</p></div>');
  const populate=()=>{body.querySelector('#transferTarget').innerHTML='<option value="">Create matching catalog item</option>'+A.DB().items.filter(i=>i.storeId===body.querySelector('#transferStore').value&&!i.deleted).map(i=>'<option value="'+esc(i.id)+'">'+esc(A.itemName(i))+' · '+esc(i.unit || 'unit')+'</option>').join('');};populate();body.querySelector('#transferStore').addEventListener('change',populate);
  A.modal({title:'Dispatch stock transfer',body,buttons:[{label:'Cancel',cls:'ghost'},{label:'Dispatch transfer',cls:'pri',fn:async()=>{await A.actions.sendTransfer({toStoreId:A.$('#transferStore',body).value,lines:[{itemId:A.$('#transferSource',body).value,targetItemId:A.$('#transferTarget',body).value,qty:Number(A.$('#transferQty',body).value)}],note:A.$('#transferNote',body).value,operationId});A.render();}}]});
 };
 A.transferReceiptDialog=function(id,recall=false){
  A.requirePermission('edit_inventory');const t=A.transfers().find(t=>t.id===id),operationId=A.uid('transfer_receipt'),body=A.el('<div><p>'+esc(t.note)+' · '+(recall?'Record goods physically returned to the source.':'Record goods physically received at this store.')+'</p>'+t.lines.map((l,n)=>'<div class="field"><label for="receiveQty'+n+'">'+esc(l.name)+' · '+A.transferRemaining(t,l)+' remaining in transit</label><input class="inp" id="receiveQty'+n+'" type="number" min="0" step="0.0001" value="'+A.transferRemaining(t,l)+'"></div>').join('')+'<div class="field"><label for="receiveNote">Receipt / return note</label><input class="inp" id="receiveNote"></div></div>');
  A.modal({title:recall?'Recall unreceived stock':'Receive stock transfer',body,buttons:[{label:'Cancel',cls:'ghost'},{label:'Record transfer receipt',cls:'pri',fn:async()=>{const lines=t.lines.map((l,n)=>({lineId:l.lineId,qty:Number(A.$('#receiveQty'+n,body).value)})).filter(l=>l.qty!==0);await A.actions.receiveTransfer({transferId:id,lines,note:A.$('#receiveNote',body).value,recall,operationId});A.render();}}]});
 };
 A.transferHistory=function(){
  A.requirePermission('edit_inventory');const transfers=A.transfers(),storeName=id=>A.DB().stores.find(s=>s.id===id)?.name || id,body=A.el('<div><p>Track dispatched stock until it is received or physically returned. Enter only the goods received in each partial receipt.</p>'+transfers.slice().reverse().map(t=>'<div class="card"><b>'+esc(storeName(t.fromStoreId))+' → '+esc(storeName(t.toStoreId))+'</b><p>'+esc(t.note)+'</p>'+t.lines.map(l=>'<p>'+esc(l.name)+' · sent '+l.qty+' · in transit '+A.transferRemaining(t,l)+'</p>').join('')+((A.DB().transferReceipts || []).filter(r=>r.transferId===t.id).map(r=>'<small>'+esc(A.fmtDT(r.at))+' · '+(r.recall?'Recalled':'Received')+' · '+esc(r.lines.map(l=>l.qty+' '+(t.lines.find(x=>x.lineId===l.lineId)?.unit || 'unit')+' '+(t.lines.find(x=>x.lineId===l.lineId)?.name || '')).join(', '))+' · '+esc(r.note)+'</small><br>').join(''))+(t.lines.some(l=>A.transferRemaining(t,l)>0)?'<button class="btn sm" data-receive-transfer="'+esc(t.id)+'">'+(A.S()===t.toStoreId?'Receive stock':'Recall remainder')+'</button>':'<span class="chip ok">Complete</span>')+'</div>').join('')+'</div>');
  const modal=A.modal({title:'Stock transfers',body,wide:true,buttons:[{label:'Dispatch stock',fn:()=>A.transferDialog()},{label:'Close',cls:'ghost'}]});body.addEventListener('click',e=>{const b=e.target.closest('[data-receive-transfer]');if(!b)return;const t=transfers.find(t=>t.id===b.dataset.receiveTransfer);modal.close();A.transferReceiptDialog(t.id,A.S()===t.fromStoreId);});
 };
})(window);
