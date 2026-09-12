/* Explicit local till sessions and immutable cash movement attribution. */
(function(w){
 'use strict';const A=w.App,D=A.domain;
 A.businessDate=function(at,timeZone='Asia/Kolkata'){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(at));
  return ['year','month','day'].map(type=>parts.find(p=>p.type===type).value).join('-');
 };
 A.cashSources=function(db){
  const out=[],add=(kind,r,delta,at=r.at,actor=r.staffId,note='')=>{if(delta)out.push({key:kind+':'+r.id,kind,sourceId:r.id,storeId:r.storeId,staffId:actor || '',delta:A.round2(delta),sourceAt:at,note});};
  for(const b of db.bills)if(b.mode==='cash'&&!b.credit){add('sale',b,b.total,b.at,b.staffId,'Cash bill #'+b.no);if(b.void)add('void',b,-b.total,b.voidAt || b.at,b.voidCommand?.actorId || b.staffId,'Void cash bill #'+b.no);}
  for(const p of db.payments)if(p.mode==='cash')add('collection',p,p.amount,p.at,p.staffId,p.kind==='advance'?'Customer advance':'Customer collection');
  for(const p of db.purchases)if((p.mode || 'cash')==='cash')add('purchase',p,-p.paid,p.at,p.staffId,'Purchase #'+p.no);
  for(const p of db.supplierPayments)if(p.mode==='cash')add('supplier_payment',p,-p.amount);
  for(const r of db.refunds || [])if(r.mode==='cash')add('customer_refund',r,-r.amount,r.at,r.command?.actorId,'Customer refund');
  for(const r of db.supplierRefunds || [])if(r.mode==='cash')add('supplier_refund',r,r.amount,r.at,r.command?.actorId,'Supplier refund received');
  for(const r of db.cashManual || [])add(r.kind,r,r.delta,r.at,r.staffId,r.note);
  return out;
 };
 A.cashSessions=()=> (A.DB().cashSessions || []).filter(s=>s.storeId===A.S());
 A.openCashSession=()=>A.cashSessions().find(s=>!s.close);
 A.cashShiftSummary=function(session){
  const movements=(A.DB().cashMovements || []).filter(m=>m.shiftId===session.id),net=movements.reduce((n,m)=>n+D.paise(Math.abs(m.delta))*Math.sign(m.delta),0)/100;
  return {movements,net,expected:A.round2(session.openingFloat+net)};
 };
 A.captureCashMovements=function(){
  const db=A.DB();if(db.cashVersion!==1)return;
  const seen=new Set([...(db.cashBaseline || []).map(r=>r.key),...(db.cashMovements || []).map(r=>r.key)]),pending=[];
  for(const source of A.cashSources(db))if(!seen.has(source.key)){
   const shift=(db.cashSessions || []).find(s=>s.storeId===source.storeId&&!s.close);if(!shift)throw new Error('Open a cash shift in this store before recording a cash movement.');
   const at=Date.now();if(at<shift.openedAt)throw new Error('Device clock is before shift opening. Correct the clock before saving.');
   pending.push({...source,id:A.uid('cash'),shiftId:shift.id,at,businessDate:A.businessDate(at,shift.timeZone)});seen.add(source.key);
  }
  if(pending.length)(db.cashMovements ||= []).push(...pending);
 };
 A.cashDaySummary=function(dayTs=Date.now()){
  const db=A.DB(),store=db.stores.find(s=>s.id===A.S()),zone=store.timeZone || 'Asia/Kolkata',day=A.businessDate(dayTs,zone);
  const entries=[...(db.cashBaseline || []).filter(m=>m.storeId===A.S()&&A.businessDate(m.sourceAt,zone)===day),...(db.cashMovements || []).filter(m=>m.storeId===A.S()&&m.businessDate===day)];
  const sum=kinds=>A.round2(entries.filter(m=>kinds.includes(m.kind)).reduce((n,m)=>n+m.delta,0));
  const incoming=A.round2(entries.filter(m=>m.delta>0).reduce((n,m)=>n+m.delta,0)),outgoing=A.round2(-entries.filter(m=>m.delta<0).reduce((n,m)=>n+m.delta,0));
  return {in:incoming,out:outgoing,net:A.round2(incoming-outgoing),billCash:sum(['sale','void']),payCash:sum(['collection']),refundCash:A.round2(-sum(['customer_refund'])),supplierRefundCash:sum(['supplier_refund']),supplierOut:A.round2(-sum(['purchase','supplier_payment'])),manualNet:sum(['expense','withdrawal','cash_correction']),businessDate:day};
 };
 A.actions.openCashShift=async function({openingFloat=0,timeZone,note='',operationId=A.uid('cash_shift')}={}){
  A.requirePermission('settings');A.number(openingFloat,'Opening float');openingFloat=A.round2(openingFloat);const store=A.DB().stores.find(s=>s.id===A.S());timeZone=timeZone || store.timeZone || 'Asia/Kolkata';A.businessDate(Date.now(),timeZone);
  if(typeof note!=='string'||note.trim().length<3)throw new Error('Describe the opening float.');const request={storeId:A.S(),openingFloat,timeZone,note:note.trim()},prior=(A.DB().cashSessions || []).find(s=>s.id===operationId);
  if(prior){if(JSON.stringify(prior.request)!==JSON.stringify(request))throw new Error('Shift ID reused with different contents.');return D.snapshot(prior);}
  if(A.openCashSession())throw new Error('Close the current cash shift before opening another.');
  if(A.cashSessions().length&&store.timeZone!==timeZone)throw new Error('Keep the recorded store timezone; timezone changes need a separate migration.');
  const command=D.command({id:operationId,accountId:A.accountId,actorId:A.DB().session.staffId,storeId:A.S(),kind:'cash_shift_open',at:Date.now()});
  if(A.DB().cashVersion!==1){A.DB().cashVersion=1;A.DB().cashBaseline=A.cashSources(A.DB());A.DB().cashMovements=[];A.DB().cashManual=[];A.DB().cashSessions=[];A.DB().cashCloseCorrections=[];}
  store.timeZone=timeZone;const session={id:operationId,command:{...command},storeId:A.S(),staffId:A.DB().session.staffId,openedAt:command.at,openingDate:A.businessDate(command.at,timeZone),openingFloat,timeZone,note:note.trim(),request};A.DB().cashSessions.push(session);await A.save({op:'cash_shift_open'});return D.snapshot(session);
 };
 A.actions.cashEntry=async function({kind='expense',amount,reason='other',note,corrects='',operationId=A.uid('cash_manual')}={}){
  A.requirePermission('settings');if(!['expense','withdrawal','cash_correction'].includes(kind)||typeof note!=='string'||note.trim().length<3||!['supplies','transport','utilities','owner','other','reversal'].includes(reason))throw new Error('Select a cash reason and provide a note.');
  A.number(amount,'Cash amount',0.01);amount=A.round2(amount);if(!amount)throw new Error('Cash amount must be at least one paise.');
  const request={storeId:A.S(),kind,amount,reason,note:note.trim(),corrects},prior=(A.DB().cashManual || []).find(r=>r.id===operationId);if(prior){if(JSON.stringify(prior.request)!==JSON.stringify(request))throw new Error('Cash entry ID reused with different contents.');return D.snapshot(prior);}
  if(!A.openCashSession())throw new Error('Open a cash shift first.');
  let delta=-amount;if(kind==='cash_correction'){
   const original=(A.DB().cashManual || []).find(r=>r.id===corrects&&r.storeId===A.S());if(!original||A.DB().cashManual.some(r=>r.corrects===corrects)||amount!==Math.abs(original.delta)||reason!=='reversal')throw new Error('Select one unreversed cash entry and its exact amount.');delta=-original.delta;
  }else if(corrects)throw new Error('Only a linked cash correction can reverse an entry.');
  const command=D.command({id:operationId,accountId:A.accountId,actorId:A.DB().session.staffId,storeId:A.S(),kind,at:Date.now(),corrects:corrects || null});const entry={id:operationId,command:{...command},storeId:A.S(),staffId:A.DB().session.staffId,at:command.at,kind,delta,reason,note:note.trim(),corrects,request};(A.DB().cashManual ||= []).push(entry);await A.save({op:'cash_manual'});return D.snapshot(entry);
 };
 A.actions.closeCashShift=async function({shiftId,counted,note,operationId=A.uid('cash_close')}={}){
  A.requirePermission('settings');const shift=A.cashSessions().find(s=>s.id===shiftId);if(!shift)throw new Error('Cash shift not found.');A.number(counted,'Counted cash');counted=A.round2(counted);if(typeof note!=='string'||note.trim().length<3)throw new Error('Record a closing note.');const request={shiftId,counted,note:note.trim()};
  if(shift.close){if(shift.close.id===operationId&&JSON.stringify(shift.close.request)===JSON.stringify(request))return D.snapshot(shift);throw new Error('This cash shift is already closed. Record a linked correction in a later shift.');}
  const summary=A.cashShiftSummary(shift),command=D.command({id:operationId,accountId:A.accountId,actorId:A.DB().session.staffId,storeId:A.S(),kind:'cash_shift_close',at:Date.now(),corrects:shift.id});if(command.at<shift.openedAt)throw new Error('Clock is before shift opening.');
  shift.close={id:operationId,command:{...command},at:command.at,businessDate:A.businessDate(command.at,shift.timeZone),counted,expected:summary.expected,variance:A.round2(counted-summary.expected),movementIds:summary.movements.map(m=>m.id),note:note.trim(),request};await A.save({op:'cash_shift_close'});return D.snapshot(shift);
 };
 A.reportedCashClose=shift=>(A.DB().cashCloseCorrections || []).filter(c=>c.shiftId===shift.id).at(-1) || shift.close;
 A.actions.correctCashClose=async function({shiftId,counted,note,operationId=A.uid('cash_count_correction')}={}){
  A.requirePermission('settings');const shift=A.cashSessions().find(s=>s.id===shiftId);if(!shift?.close)throw new Error('Select a closed shift.');A.number(counted,'Corrected count');counted=A.round2(counted);if(typeof note!=='string'||note.trim().length<3)throw new Error('Explain the closing-count correction.');
  const request={shiftId,counted,note:note.trim()},prior=(A.DB().cashCloseCorrections || []).find(c=>c.id===operationId);if(prior){if(JSON.stringify(prior.request)!==JSON.stringify(request))throw new Error('Count correction ID reused.');return D.snapshot(prior);}
  const previous=A.reportedCashClose(shift),command=D.command({id:operationId,accountId:A.accountId,actorId:A.DB().session.staffId,storeId:A.S(),kind:'cash_close_correction',at:Date.now(),corrects:previous.id});
  const record={id:operationId,command:{...command},shiftId,storeId:A.S(),at:command.at,staffId:A.DB().session.staffId,corrects:previous.id,counted,expected:shift.close.expected,variance:A.round2(counted-shift.close.expected),note:note.trim(),request};(A.DB().cashCloseCorrections ||= []).push(record);await A.save({op:'cash_close_correction'});return D.snapshot(record);
 };
 A.validateCashData=function(db){
  const fail=text=>{throw new Error('Invalid cash book: '+text);},id=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,100}$/.test(x),money=(n,label,signed=false)=>{A.number(n,label,signed?-1e9:0);if(Math.abs(n*100-Math.round(n*100))>0.00001)fail(label+' has sub-paise precision');};
  const names=['cashBaseline','cashMovements','cashManual','cashSessions','cashCloseCorrections'];if(db.cashVersion===undefined){if(names.some(k=>db[k]!==undefined))fail('version missing');return;}if(db.cashVersion!==1||names.some(k=>!Array.isArray(db[k])))fail('version/collections missing');
  const command=(r,kind,storeId,at,actor,corrects=null)=>{const c=r.command;if(!c||c.id!==r.id||c.kind!==kind||c.storeId!==storeId||c.at!==at||!id(c.accountId)||!id(c.actorId)||(actor!==undefined&&c.actorId!==actor)||(c.corrects || null)!==corrects)fail('cash command metadata differs');};
  const manualIds=new Set(),reversed=new Set(),earlier=[];
  for(const r of db.cashManual){
   if(r)command(r,r.kind,r.storeId,r.at,r.staffId,r.corrects || null);
   if(!r||!id(r.id)||manualIds.has(r.id)||!id(r.staffId)||!db.stores.some(s=>s.id===r.storeId)||!['expense','withdrawal','cash_correction'].includes(r.kind)||!['supplies','transport','utilities','owner','other','reversal'].includes(r.reason)||typeof r.note!=='string'||r.note.trim().length<3)fail('invalid manual entry');manualIds.add(r.id);money(r.delta,'manual amount',true);A.number(r.at,'manual date',0,8640000000000000);if(!r.delta)fail('zero manual entry');
   if(r.kind==='cash_correction'){const original=earlier.find(x=>x.id===r.corrects&&x.storeId===r.storeId);if(!original||reversed.has(r.corrects)||r.delta!==-original.delta||r.reason!=='reversal')fail('invalid linked cash correction');reversed.add(r.corrects);}else if(r.delta>=0||r.corrects)fail('invalid cash outflow');earlier.push(r);
  }
  const shifts=new Map(),last=new Map(),closeIds=new Set();
  for(const s of db.cashSessions){
   if(s)command(s,'cash_shift_open',s.storeId,s.openedAt,s.staffId);
   if(!s||!id(s.id)||shifts.has(s.id)||!id(s.staffId)||!db.stores.some(x=>x.id===s.storeId)||typeof s.note!=='string'||s.note.trim().length<3||typeof s.timeZone!=='string')fail('invalid shift');money(s.openingFloat,'opening float');A.number(s.openedAt,'opening date',0,8640000000000000);
   if(s.openingDate!==A.businessDate(s.openedAt,s.timeZone)||db.stores.find(x=>x.id===s.storeId).timeZone!==s.timeZone)fail('shift timezone/date mismatch');
   const previous=last.get(s.storeId);if(previous&&(!previous.close||s.openedAt<previous.close.at))fail('overlapping shifts');last.set(s.storeId,s);shifts.set(s.id,s);
   if(s.close){const c=s.close;command(c,'cash_shift_close',s.storeId,c.at,undefined,s.id);if(!id(c.id)||closeIds.has(c.id)||typeof c.note!=='string'||c.note.trim().length<3||!Array.isArray(c.movementIds))fail('invalid shift close');closeIds.add(c.id);A.number(c.at,'closing date',s.openedAt,8640000000000000);money(c.counted,'counted cash');money(c.expected,'expected cash',true);money(c.variance,'variance',true);if(c.businessDate!==A.businessDate(c.at,s.timeZone))fail('closing business date differs');}
  }
  const sources=new Map(A.cashSources(db).map(s=>[s.key,s])),seen=new Set(),movementIds=new Set();
  for(const [name,rows] of [['baseline',db.cashBaseline],['movement',db.cashMovements]])for(const r of rows){
   const source=r&&sources.get(r.key);if(!source||seen.has(r.key)||['kind','sourceId','storeId','delta','sourceAt','staffId'].some(k=>r[k]!==source[k]))fail('cash source missing, repeated or changed');seen.add(r.key);money(r.delta,'cash movement',true);A.number(r.sourceAt,'source date',0,8640000000000000);
   if(name==='movement'){
    const shift=shifts.get(r.shiftId);if(!id(r.id)||movementIds.has(r.id)||!shift||shift.storeId!==r.storeId)fail('cash movement shift mismatch');movementIds.add(r.id);A.number(r.at,'posting date',shift.openedAt,shift.close?.at ?? 8640000000000000);if(r.businessDate!==A.businessDate(r.at,shift.timeZone))fail('cash posting business date differs');
   }else if(['expense','withdrawal','cash_correction'].includes(r.kind))fail('manual entry cannot be hidden in baseline');
  }
  if(seen.size!==sources.size)fail('cash source has no attributed movement');
  for(const s of shifts.values())if(s.close){const rows=db.cashMovements.filter(m=>m.shiftId===s.id),expected=A.round2(s.openingFloat+rows.reduce((n,m)=>n+m.delta,0));if(s.close.expected!==expected||s.close.variance!==A.round2(s.close.counted-expected)||JSON.stringify(s.close.movementIds)!==JSON.stringify(rows.map(m=>m.id)))fail('closed shift totals or membership changed');}
  const corrections=new Map(),correctionIds=new Set();for(const c of db.cashCloseCorrections){if(!c)fail('missing close correction');command(c,'cash_close_correction',c.storeId,c.at,c.staffId,c.corrects);const s=shifts.get(c.shiftId),previous=corrections.get(c.shiftId)||s?.close;if(!s?.close||!id(c.id)||correctionIds.has(c.id)||c.storeId!==s.storeId||c.corrects!==previous.id||typeof c.note!=='string'||c.note.trim().length<3)fail('invalid close correction');correctionIds.add(c.id);money(c.counted,'corrected count');A.number(c.at,'correction date',previous.at,8640000000000000);if(c.expected!==s.close.expected||c.variance!==A.round2(c.counted-c.expected))fail('close correction totals differ');corrections.set(c.shiftId,c);}
 };
 const esc=A.esc,money=n=>A.money(n,true),field=(id,label,value='',type='text')=>'<div class="field"><label for="'+id+'">'+label+'</label><input class="inp" id="'+id+'" type="'+type+'" step="0.01" value="'+esc(String(value))+'"></div>';
 A.cashTime=(at,zone)=>new Intl.DateTimeFormat('en-IN',{timeZone:zone,dateStyle:'medium',timeStyle:'short'}).format(new Date(at));
 A.cashOpenDialog=function(){
  A.requirePermission('settings');const store=A.DB().stores.find(s=>s.id===A.S()),last=A.cashSessions().at(-1),operationId=A.uid('cash_shift'),body=A.el(window.App.moneyLiteral('<div><p>Count the cash physically in the till. After the first opening, cash transactions require an open shift in every store. Earlier transactions stay in history and are not added to this opening float.</p>')+field('cashOpening',window.App.moneyLiteral('Opening cash'),last?.close?A.reportedCashClose(last).counted:0,'number')+field('cashTimezone',window.App.moneyLiteral('Store timezone'),store.timeZone || 'Asia/Kolkata')+field('cashOpeningNote',window.App.moneyLiteral('Opening count note'))+'</div>');
  if(last)body.querySelector('#cashTimezone').readOnly=true;
  A.modal({title:window.App.moneyLiteral('Open cash shift'),body,buttons:[{label:window.App.moneyLiteral('Cancel'),cls:'ghost'},{label:window.App.moneyLiteral('Open shift'),cls:'pri',fn:async()=>{await A.actions.openCashShift({openingFloat:Number(A.$('#cashOpening',body).value),timeZone:A.$('#cashTimezone',body).value,note:A.$('#cashOpeningNote',body).value,operationId});A.render();}}]});
 };
 A.cashEntryDialog=function(kind='expense',corrects=''){
  A.requirePermission('settings');const original=corrects&&(A.DB().cashManual || []).find(r=>r.id===corrects),operationId=A.uid('cash_manual'),body=A.el('<div><p>'+(original?window.App.moneyLiteral('Record the opposite cash movement now. The original entry and any closed shift stay unchanged.'):window.App.moneyLiteral('Record cash already taken out of the till.'))+'</p>'+field('cashAmount',window.App.moneyLiteral('Cash amount'),original?Math.abs(original.delta):'','number')+(original?'':window.App.moneyLiteral('<div class="field"><label for="cashReason">Reason</label><select class="inp" id="cashReason">')+['supplies','transport','utilities','owner','other'].map(r=>'<option '+(r===(kind==='withdrawal'?'owner':'other')?'selected':'')+' value="'+r+'">'+A.moneyCode(r)+'</option>').join('')+'</select></div>')+field('cashEntryNote',window.App.moneyLiteral('Reason / receipt note'))+'</div>');
  if(original)body.querySelector('#cashAmount').readOnly=true;
  A.modal({title:original?window.App.moneyLiteral('Reverse cash entry'):kind==='withdrawal'?window.App.moneyLiteral('Owner withdrawal'):window.App.moneyLiteral('Cash expense'),body,buttons:[{label:window.App.moneyLiteral('Cancel'),cls:'ghost'},{label:window.App.moneyLiteral('Record cash movement'),cls:'pri',fn:async()=>{await A.actions.cashEntry({kind:original?'cash_correction':kind,amount:Number(A.$('#cashAmount',body).value),reason:original?'reversal':A.$('#cashReason',body).value,note:A.$('#cashEntryNote',body).value,corrects,operationId});A.render();}}]});
 };
 A.cashCloseDialog=function(shiftId,correction=false){
  A.requirePermission('settings');const shift=A.cashSessions().find(s=>s.id===shiftId),summary=A.cashShiftSummary(shift),operationId=A.uid(correction?'cash_count_correction':'cash_close'),body=A.el(window.App.moneyLiteral('<div><p>Expected cash: <b>')+esc(money(summary.expected))+'</b> · '+esc(shift.timeZone)+'</p><p>'+(correction?window.App.moneyLiteral('This appends a correction to the recorded count. It does not move cash or change the original signed-off count.'):window.App.moneyLiteral('Closing fixes this shift’s movement list and expected amount. Later refunds and corrections belong to a later open shift.'))+'</p>'+field('cashCounted',window.App.moneyLiteral('Physically counted cash'),correction?A.reportedCashClose(shift).counted:'','number')+field('cashClosingNote',correction?window.App.moneyLiteral('Correction reason'):window.App.moneyLiteral('Closing note'))+'</div>');
  A.modal({title:correction?window.App.moneyLiteral('Correct recorded closing count'):window.App.moneyLiteral('Close cash shift'),body,buttons:[{label:window.App.moneyLiteral('Cancel'),cls:'ghost'},{label:correction?window.App.moneyLiteral('Save count correction'):window.App.moneyLiteral('Close shift'),cls:'pri',fn:async()=>{const value=A.$('#cashCounted',body).value.trim();if(!value)throw new Error(window.App.moneyLiteral('Enter the physically counted cash, including 0 if empty.'));const request={shiftId,counted:Number(value),note:A.$('#cashClosingNote',body).value,operationId};if(correction)await A.actions.correctCashClose(request);else await A.actions.closeCashShift(request);A.render();}}]});
 };
 A.cashShiftDetail=function(id){
  A.requirePermission('settings');const shift=A.cashSessions().find(s=>s.id===id),summary=A.cashShiftSummary(shift),reported=shift.close&&A.reportedCashClose(shift),manual=A.DB().cashManual || [],body=A.el(window.App.moneyLiteral('<div><p>Opened ')+esc(A.cashTime(shift.openedAt,shift.timeZone))+' · '+esc(shift.timeZone)+window.App.moneyLiteral(' · float ')+esc(money(shift.openingFloat))+window.App.moneyLiteral('</p><p><b>Expected ')+esc(money(summary.expected))+'</b>'+(shift.close?window.App.moneyLiteral(' · closed ')+esc(A.cashTime(shift.close.at,shift.timeZone))+window.App.moneyLiteral(' · original count ')+esc(money(shift.close.counted))+window.App.moneyLiteral(' · reported count ')+esc(money(reported.counted))+window.App.moneyLiteral(' · variance ')+esc(money(reported.variance)):' · Open')+window.App.moneyLiteral('</p><p>Latest 50 movements; CSV includes every movement.</p><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Posted</th><th>Movement</th><th>Cash change</th><th></th></tr></thead><tbody>')+summary.movements.slice(-50).map(m=>{const entry=manual.find(r=>r.id===m.sourceId&&r.kind===m.kind);return '<tr><td>'+esc(A.cashTime(m.at,shift.timeZone))+'</td><td>'+esc(m.note || m.kind)+'</td><td>'+esc(money(m.delta))+'</td><td>'+(entry&&!manual.some(r=>r.corrects===entry.id)?'<button class="btn xs" data-reverse-cash="'+esc(entry.id)+window.App.moneyLiteral('">Reverse cash entry</button>'):'')+'</td></tr>';}).join('')+'</tbody></table></div>'+((A.DB().cashCloseCorrections || []).filter(c=>c.shiftId===id).map(c=>window.App.moneyLiteral('<p>Count correction ')+esc(A.cashTime(c.at,shift.timeZone))+': '+esc(money(c.counted))+' · '+esc(c.note)+'</p>').join(''))+'</div>');
  const modal=A.modal({title:window.App.moneyLiteral('Cash shift details'),body,wide:true,buttons:[{label:window.App.moneyLiteral('Movements CSV'),keepOpen:true,fn:()=>A.download(A.toCSV([['Posting UTC',window.App.moneyLiteral('Business date'),window.App.moneyLiteral('Timezone'),window.App.moneyLiteral('Source'),window.App.moneyLiteral('Cash change'),window.App.moneyLiteral('Actor'),window.App.moneyLiteral('Note')],...summary.movements.map(m=>[new Date(m.at).toISOString(),m.businessDate,shift.timeZone,m.key,m.delta,m.staffId,m.note])]),'cash-shift-'+id+'.csv','text/csv')},shift.close?{label:window.App.moneyLiteral('Correct recorded count'),fn:()=>A.cashCloseDialog(id,true)}:{label:window.App.moneyLiteral('Close shift'),fn:()=>A.cashCloseDialog(id)},{label:window.App.moneyLiteral('Close'),cls:'ghost'}]});
  body.addEventListener('click',e=>{const b=e.target.closest('[data-reverse-cash]');if(!b)return;if(!A.openCashSession()){A.toast('warn',window.App.moneyLiteral('Open a later cash shift before reversing a movement'));return;}modal.close();A.cashEntryDialog('cash_correction',b.dataset.reverseCash);});
 };
 A.cashDashboard=function(){
  A.requirePermission('settings');const shifts=A.cashSessions(),open=A.openCashSession(),body=A.el('<div>'+(open?window.App.moneyLiteral('<p><b>Open shift · expected cash ')+esc(money(A.cashShiftSummary(open).expected))+'</b></p>':window.App.moneyLiteral('<p>No cash shift is open in this store.</p>'))+window.App.moneyLiteral('<p>Closed shifts retain their original cash movements. Late entries post to the currently open shift; closing-count corrections are separate records.</p>')+shifts.slice().reverse().map(s=>{const r=s.close&&A.reportedCashClose(s);return '<div class="list-row"><span style="flex:1">'+esc(A.cashTime(s.openedAt,s.timeZone))+' · '+(s.close?window.App.moneyLiteral('Closed'):window.App.moneyLiteral('Open'))+window.App.moneyLiteral('<br><small>Float ')+esc(money(s.openingFloat))+window.App.moneyLiteral(' · expected ')+esc(money(A.cashShiftSummary(s).expected))+(r?window.App.moneyLiteral(' · count ')+esc(money(r.counted))+window.App.moneyLiteral(' · variance ')+esc(money(r.variance)):'')+'</small></span><button class="btn sm" data-cash-shift="'+esc(s.id)+window.App.moneyLiteral('">Details</button></div>');}).join('')+'</div>');
  const modal=A.modal({title:window.App.moneyLiteral('Cash shifts'),body,wide:true,buttons:[open?{label:window.App.moneyLiteral('Cash expense'),fn:()=>A.cashEntryDialog('expense')}:null,open?{label:window.App.moneyLiteral('Owner withdrawal'),fn:()=>A.cashEntryDialog('withdrawal')}:null,open?{label:window.App.moneyLiteral('Close shift'),cls:'pri',fn:()=>A.cashCloseDialog(open.id)}:{label:window.App.moneyLiteral('Open cash shift'),cls:'pri',fn:()=>A.cashOpenDialog()},{label:window.App.moneyLiteral('Closing summary CSV'),keepOpen:true,fn:()=>A.download(A.toCSV([[window.App.moneyLiteral('Shift'),window.App.moneyLiteral('Timezone'),'Opened UTC','Closed UTC',window.App.moneyLiteral('Opening float'),window.App.moneyLiteral('Expected'),window.App.moneyLiteral('Original count'),window.App.moneyLiteral('Reported count'),window.App.moneyLiteral('Reported variance')],...shifts.map(s=>{const r=s.close&&A.reportedCashClose(s);return [s.id,s.timeZone,new Date(s.openedAt).toISOString(),s.close?new Date(s.close.at).toISOString():'',s.openingFloat,A.cashShiftSummary(s).expected,s.close?.counted ?? '',r?.counted ?? '',r?.variance ?? ''];})]),'cash-shift-closings.csv','text/csv')},{label:window.App.moneyLiteral('Close'),cls:'ghost'}]});body.addEventListener('click',e=>{const b=e.target.closest('[data-cash-shift]');if(b){modal.close();A.cashShiftDetail(b.dataset.cashShift);}});
 };
})(window);
