/* Explainable reports and an opt-in stock checkpoint with durable movement history. */
(function(w){
 'use strict';const A=w.App,D=A.domain,clone=x=>JSON.parse(JSON.stringify(x)),q=x=>D.quantity(x),cents=x=>Math.round(x*100),cash=x=>A.round2(x),empty=()=>({qty:0,unit:'unit',deleted:true});
 const state=i=>i?{qty:q(A.itemStock(i)),unit:i.unit || 'unit',deleted:!!i.deleted}:empty();
 const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 A.actions.startStockHistory=async function(note='Owner started stock history from current records'){
  A.requirePermission('settings');if(A.DB().stockBook)return;
  if(typeof note!=='string'||note.trim().length<3)throw new Error('Explain the stock checkpoint.');
  A.DB().stockBook={version:1,id:A.uid('stock_book'),at:Date.now(),staffId:A.DB().session.staffId,note:note.trim(),opening:A.DB().items.map(i=>({itemId:i.id,storeId:i.storeId,name:i.name,...state(i)})),entries:[]};
  await A.save({op:'stock_checkpoint'});
 };
 A.captureStockHistory=function(previous,options={}){
  const db=A.DB(),book=db.stockBook;if(!book||options.restoring||!previous?.stockBook||previous.stockBook.id!==book.id)return;
  const before=new Map(previous.items.map(i=>[i.id,i])),after=new Map(db.items.map(i=>[i.id,i])),changes=[];
  for(const id of new Set([...before.keys(),...after.keys()])){
   const old=before.get(id),current=after.get(id),a=state(old),b=state(current);if(same(a,b))continue;
   if(old&&current&&old.storeId!==current.storeId)throw new Error('Use a stock transfer instead of moving an item between stores.');
   changes.push({itemId:id,storeId:(current || old).storeId,name:(current || old).name,before:a,after:b});
  }
  if(!changes.length)return;
  const sources=[];for(const key of ['bills','purchases','returns','supplierReturns','stockAdjustments','stockTransfers','transferReceipts']){
   const old=new Map((previous[key] || []).map(r=>[r.id,r]));for(const r of db[key] || [])if(!old.has(r.id)||(!old.get(r.id).void&&r.void))sources.push(key+':'+r.id);
  }
  book.entries.push({id:A.uid('stock_event'),revision:book.entries.length+1,at:Date.now(),storeId:A.S(),staffId:db.session.staffId,action:options.op || 'catalogue_update',sources,changes});
 };
 A.rebuildStockHistory=function(db){
  const book=db.stockBook;if(!book)return null;const result=new Map();
  for(const row of book.opening)result.set(row.itemId,{itemId:row.itemId,storeId:row.storeId,name:row.name,qty:row.qty,unit:row.unit,deleted:row.deleted});
  for(const event of book.entries)for(const change of event.changes){const row=result.get(change.itemId),before=row?{qty:row.qty,unit:row.unit,deleted:row.deleted}:empty();if(!same(before,change.before)||(row&&row.storeId!==change.storeId))throw new Error('Stock history continuity differs for '+change.itemId);result.set(change.itemId,{itemId:change.itemId,storeId:change.storeId,name:change.name,...change.after});}
  return result;
 };
 A.validateStockHistory=function(db){
  const b=db.stockBook;if(b===undefined)return;const fail=s=>{throw new Error('Invalid stock history: '+s);},id=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,100}$/.test(x),text=x=>typeof x==='string'&&x.length>0;
  if(!b||b.version!==1||!id(b.id)||!id(b.staffId)||!text(b.note)||!Array.isArray(b.opening)||!Array.isArray(b.entries))fail('checkpoint fields');A.number(b.at,'Stock checkpoint date',0,8640000000000000);
  const check=(r)=>{if(!r||!text(r.unit)||typeof r.deleted!=='boolean')fail('stock state');A.number(r.qty,'Stock history quantity');D.quantityUnits(r.qty);};
  const ids=new Set();for(const row of b.opening){if(!id(row.itemId)||ids.has(row.itemId)||!db.stores.some(s=>s.id===row.storeId)||!text(row.name))fail('opening item');ids.add(row.itemId);check(row);}
  const eventIds=new Set();let revision=0,lastAt=b.at;
  for(const event of b.entries){if(!event||!id(event.id)||eventIds.has(event.id)||event.revision!==++revision||!id(event.staffId)||!db.stores.some(s=>s.id===event.storeId)||!text(event.action)||!Array.isArray(event.sources)||!Array.isArray(event.changes)||!event.changes.length)fail('movement fields');eventIds.add(event.id);A.number(event.at,'Stock movement date',lastAt,8640000000000000);lastAt=event.at;
   for(const source of event.sources){if(typeof source!=='string')fail('source link');const [key,ref,...extra]=source.split(':');if(extra.length||!['bills','purchases','returns','supplierReturns','stockAdjustments','stockTransfers','transferReceipts'].includes(key)||!(db[key] || []).some(r=>r.id===ref))fail('source link');}
   const changed=new Set();for(const change of event.changes){if(!change||!id(change.itemId)||changed.has(change.itemId)||!db.stores.some(s=>s.id===change.storeId)||!text(change.name))fail('movement item');changed.add(change.itemId);check(change.before);check(change.after);if(same(change.before,change.after))fail('empty movement');}
  }
  const result=A.rebuildStockHistory(db),items=new Map(db.items.map(i=>[i.id,i]));
  for(const id of new Set([...result.keys(),...items.keys()])){const row=result.get(id),item=items.get(id);if(!row||(item&&row.storeId!==item.storeId)||!same({qty:row.qty,unit:row.unit,deleted:row.deleted},state(item)))fail('projection differs for '+id);}
 };
 const dateValue=value=>{if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value+'T00:00:00Z'))||new Date(value+'T00:00:00Z').toISOString().slice(0,10)!==value)throw new Error('Select valid report dates.');return value;};
 A.reportPeriod=function({from,to}={}){const store=A.DB().stores.find(s=>s.id===A.S()),zone=store.timeZone || 'Asia/Kolkata',today=A.businessDate(Date.now(),zone);from=dateValue(from || today);to=dateValue(to || from);if(from>to)throw new Error('Report end must not precede its start.');return {from,to,zone,includes:at=>{const day=A.businessDate(at,zone);return day>=from&&day<=to;}};};
 A.salesStatement=function(options={}){
  A.requirePermission('reports');const period=A.reportPeriod(options),events=[],exceptions=[];
  for(const b of A.bills()){
   const known=b.calculationVersion===D.CALCULATION_VERSION&&b.lines.every(l=>Number.isFinite(l.taxable)&&Number.isFinite(l.tax));
   const cost=cash(b.lines.reduce((n,l)=>n+l.qty*(l.cost || 0),0)),tax=b.tax || 0;
   const add=(kind,at,sign)=>{if(!period.includes(at))return;const row={kind,id:b.id,billId:b.id,at,no:b.no,mode:b.mode,total:cash(sign*b.total),tax:cash(sign*tax),cost:cash(sign*cost),profit:cash(sign*(b.total-tax-cost)),lines:known?b.lines.map(l=>({gst:b.tax?(l.gst || 0):0,taxable:cash(sign*l.taxable),tax:cash(sign*l.tax)})):[],note:known?'Recorded invoice amounts':'Legacy invoice: rate breakdown unavailable'};events.push(row);if(!known)exceptions.push('Bill '+b.no+': legacy tax/cost detail is not independently reconstructable.');};
   if(b.void&&!b.voidAt){exceptions.push('Bill '+b.no+': void timestamp missing; excluded rather than guessing its business date.');continue;}add('sale',b.at,1);if(b.void)add('void',b.voidAt,-1);
  }
  const returnedCost=new Map();for(const r of A.returns()){const before=returnedCost.get(r.billId) || 0,after=before+r.lines.reduce((n,l)=>n+l.cost*l.qty,0),cost=cash(cash(after)-cash(before));returnedCost.set(r.billId,after);if(period.includes(r.at))events.push({kind:'return',id:r.id,billId:r.billId,at:r.at,no:A.bills().find(b=>b.id===r.billId)?.no || '',mode:'return',total:cash(-r.amount),tax:cash(-r.tax),cost:cash(-cost),profit:cash(-r.amount+r.tax+cost),lines:r.lines.map(l=>({gst:l.gst,taxable:cash(-l.taxable),tax:cash(-l.tax)})),note:r.reason});}
  events.sort((a,b)=>a.at-b.at||a.id.localeCompare(b.id));const sum=key=>events.reduce((n,r)=>n+cents(r[key]),0)/100;
  const rates=new Map();for(const e of events)for(const l of e.lines){const r=rates.get(l.gst) || {gst:l.gst,taxable:0,tax:0};r.taxable+=cents(l.taxable);r.tax+=cents(l.tax);rates.set(l.gst,r);}
  return {from:period.from,to:period.to,zone:period.zone,events,sales:sum('total'),tax:sum('tax'),cost:sum('cost'),profit:sum('profit'),rates:[...rates.values()].map(r=>({gst:r.gst,taxable:r.taxable/100,tax:r.tax/100})),exceptions};
 };
 A.reconcileBook=function(options={}){
  A.requirePermission('reports');const db=A.DB(),period=A.reportPeriod(options),sales=A.salesStatement(options),differences=[],caveats=[...sales.exceptions];
  for(const event of sales.events)if(event.lines.length){const expected=event.lines.reduce((n,l)=>n+cents(l.taxable)+cents(l.tax),0)/100,tax=event.lines.reduce((n,l)=>n+cents(l.tax),0)/100;if(expected!==event.total)differences.push({domain:'invoice',id:event.id,expected,actual:event.total,delta:cash(event.total-expected)});if(tax!==event.tax)differences.push({domain:'invoice_tax',id:event.id,expected:tax,actual:event.tax,delta:cash(event.tax-tax)});}
  const customers=[],suppliers=[];
  for(const [key,out] of [['customers',customers],['suppliers',suppliers]])for(const c of db[key].filter(c=>c.storeId===A.S())){
   const entries=c.ledger || [{id:'legacy_checkpoint',kind:'opening',at:null,delta:c.balance || 0,note:'Current balance checkpoint; earlier movements unavailable'}];let balance=0;out.push({id:c.id,name:c.name,deleted:!!c.deleted,entries:entries.map(e=>{balance+=cents(e.delta);return {...e,balance:balance/100};}),expected:balance/100,actual:c.balance || 0});
   if(balance!==cents(c.balance || 0))differences.push({domain:key,id:c.id,expected:balance/100,actual:c.balance || 0,delta:cash((c.balance || 0)-balance/100)});if(!c.ledger)caveats.push(c.name+': current balance only; historical statement unavailable.');
  }
  const stock=[],rebuilt=A.rebuildStockHistory(db);if(!rebuilt)caveats.push('Stock history has not started. Current stock is a checkpoint, not a reconstructed history.');
  const current=new Map(db.items.map(i=>[i.id,i]));for(const id of new Set([...(rebuilt?.keys() || []),...current.keys()])){const row=rebuilt?.get(id),item=current.get(id);if((item?.storeId || row?.storeId)!==A.S())continue;const expected=row?.qty ?? null,actual=item?A.itemStock(item):0;stock.push({id,name:item?.name || row.name,unit:item?.unit || row?.unit || 'unit',deleted:!!item?.deleted,expected,actual,delta:expected===null?null:q(actual-expected)});if(expected!==null&&q(actual-expected)!==0)differences.push({domain:'stock',id,expected,actual,delta:q(actual-expected)});}
  if(rebuilt)for(const [id,row] of rebuilt)if(row.storeId===A.S()){const actual=state(current.get(id));if(row.unit!==actual.unit)differences.push({domain:'stock_unit',id,expected:row.unit,actual:actual.unit,delta:'Unit changed'});if(row.deleted!==actual.deleted)differences.push({domain:'stock_status',id,expected:row.deleted?'Archived':'Active',actual:actual.deleted?'Archived':'Active',delta:'Status changed'});}
  if(db.cashVersion===1){const recorded=new Map([...db.cashBaseline,...db.cashMovements].map(e=>[e.key,e]));for(const source of A.cashSources(db).filter(e=>e.storeId===A.S())){const entry=recorded.get(source.key);if(!entry||entry.delta!==source.delta)differences.push({domain:'cash_source',id:source.key,expected:source.delta,actual:entry?.delta ?? 'Missing',delta:entry?cash(entry.delta-source.delta):'Missing'});}}
  let cashEntries;if(db.cashVersion===1){cashEntries=[...db.cashBaseline.map(e=>({...e,at:e.sourceAt,businessDate:A.businessDate(e.sourceAt,period.zone),baseline:true})),...db.cashMovements];}else{cashEntries=A.cashSources(db).map(e=>({...e,at:e.sourceAt,businessDate:A.businessDate(e.sourceAt,period.zone),baseline:true}));caveats.push('Formal cash shifts are not active; cash totals exclude an opening float.');}
  cashEntries=cashEntries.filter(e=>e.storeId===A.S()&&e.businessDate>=period.from&&e.businessDate<=period.to).sort((a,b)=>a.at-b.at||a.key.localeCompare(b.key));let cashNet=0;cashEntries=cashEntries.map(e=>{cashNet+=cents(e.delta);return {...e,runningNet:cashNet/100};});
  const shifts=A.cashSessions().map(s=>{const expected=(cents(s.openingFloat)+(db.cashMovements || []).filter(m=>m.shiftId===s.id).reduce((n,m)=>n+cents(m.delta),0))/100;if(s.close&&expected!==s.close.expected)differences.push({domain:'cash',id:s.id,expected,actual:s.close.expected,delta:cash(s.close.expected-expected)});return {id:s.id,opening:s.openingFloat,expected,originalCount:s.close?.counted ?? null,reportedCount:s.close?A.reportedCashClose(s).counted:null,variance:s.close?A.reportedCashClose(s).variance:null};});
  const detailedTax= sales.rates.reduce((n,r)=>n+cents(r.tax),0)/100;if(detailedTax!==sales.tax){const gap=cash(sales.tax-detailedTax);if(sales.exceptions.length)caveats.push('Tax not allocated to verified rates: '+A.money(gap,true));else differences.push({domain:'tax',id:'rate-total',expected:sales.tax,actual:detailedTax,delta:cash(detailedTax-sales.tax)});}
  return {from:period.from,to:period.to,zone:period.zone,sales,customers,suppliers,stock,cashEntries,cashNet:cashNet/100,shifts,differences,caveats:[...new Set(caveats)]};
 };
 A.statementRows=function(kind,options={}){
  const r=A.reconcileBook(options),iso=at=>at===null?'Unknown':new Date(at).toISOString();
  if(kind==='sales')return [['Kind','Record','Bill','Date UTC','Business date','Timezone','Sales incl tax','Tax','Cost','Gross profit','Note'],...r.sales.events.map(e=>[e.kind,e.id,e.no,iso(e.at),A.businessDate(e.at,r.zone),r.zone,e.total,e.tax,e.cost,e.profit,e.note])];
  if(kind==='tax')return [['GST rate','Net taxable','Net tax','From','Through','Timezone'],...r.sales.rates.map(e=>[e.gst,e.taxable,e.tax,r.from,r.to,r.zone])];
  if(kind==='customers'||kind==='suppliers')return [['Account','Name','Archived','Date UTC','Entry','Kind','Change','Running balance','Note'],...r[kind].flatMap(c=>c.entries.map(e=>[c.id,c.name,c.deleted?'Yes':'No',iso(e.at),e.id,e.kind,e.delta,e.balance,e.note || '']))];
  if(kind==='cash')return [['Date UTC','Business date','Timezone','Source','Shift','Change','Running period net','Historical baseline','Note'],...r.cashEntries.map(e=>[iso(e.at),e.businessDate,r.zone,e.key,e.shiftId || '',e.delta,e.runningNet,e.baseline?'Yes':'No',e.note])];
  if(kind==='stock'){
   const b=A.DB().stockBook,rows=[['Date UTC','Item','Name','Unit before','Unit after','Kind','Before','Change','After','Actor','Source']];if(!b)return [...rows,...r.stock.map(i=>['Unknown',i.id,i.name,i.unit,i.unit,'Current checkpoint only',i.actual,0,i.actual,'',''])];
   for(const i of b.opening.filter(i=>i.storeId===A.S()))rows.push([iso(b.at),i.itemId,i.name,i.unit,i.unit,'Opening checkpoint',i.qty,0,i.qty,b.staffId,b.note]);
   for(const e of b.entries)for(const c of e.changes.filter(c=>c.storeId===A.S()))rows.push([iso(e.at),c.itemId,c.name,c.before.unit,c.after.unit,e.action,c.before.qty,q(c.after.qty-c.before.qty),c.after.qty,e.staffId,e.sources.join('; ') || 'Recorded catalogue/restock change']);return rows;
  }
  if(kind==='reconciliation')return [['Domain','Record','Expected','Actual','Difference','Note'],...r.customers.map(c=>['customer',c.id,c.expected,c.actual,cash(c.actual-c.expected),c.name]),...r.suppliers.map(c=>['supplier',c.id,c.expected,c.actual,cash(c.actual-c.expected),c.name]),...r.stock.map(i=>['stock',i.id,i.expected ?? 'Unknown',i.actual,i.delta ?? 'Unknown',i.name+' ('+i.unit+')']),...r.shifts.map(s=>['cash close',s.id,s.expected,s.reportedCount ?? 'Open',s.variance ?? '',s.originalCount===null?'':('Original count '+s.originalCount)]),...r.differences.map(d=>[d.domain,d.id,d.expected,d.actual,d.delta,'Recorded disagreement requires review']),...r.caveats.map(s=>['Caveat','','','','',s])];
  throw new Error('Unknown statement type.');
 };
 A.reconciliationDashboard=function(options={}){
  A.requirePermission('reports');const r=A.reconcileBook(options),esc=A.esc,m=A.money,body=A.el(window.App.moneyLiteral('<div><div class="row"><div class="field"><label for="statementFrom">From business date</label><input class="inp" id="statementFrom" type="date" value="')+r.from+window.App.moneyLiteral('"></div><div class="field"><label for="statementTo">Through business date</label><input class="inp" id="statementTo" type="date" value="')+r.to+window.App.moneyLiteral('"></div><button class="btn" id="statementApply">Apply dates</button></div><p>')+esc(r.zone)+window.App.moneyLiteral(' · Dates filter sales, tax and cash. Account and stock exports include their complete available history.</p><p><b>Net sales ')+esc(m(r.sales.sales,true))+window.App.moneyLiteral(' · tax ')+esc(m(r.sales.tax,true))+window.App.moneyLiteral(' · cost ')+esc(m(r.sales.cost,true))+window.App.moneyLiteral(' · gross profit ')+esc(m(r.sales.profit,true))+window.App.moneyLiteral('</b></p><p>Gross profit excludes operating expenses and owner withdrawals. Cash movements: ')+esc(m(r.cashNet,true))+window.App.moneyLiteral(' (opening float excluded).</p><p id="reconciliationStatus">')+(r.differences.length?window.App.moneyLiteral('Differences requiring review: ')+r.differences.length:window.App.moneyLiteral('Recorded balances and stock agree.'))+'</p>'+r.differences.map(d=>'<p class="alert bad">'+esc(d.domain+' '+d.id+': expected '+d.expected+', recorded '+d.actual+', difference '+d.delta)+'</p>').join('')+r.caveats.map(c=>'<p class="muted">'+esc(A.moneyCaveat(c))+'</p>').join('')+window.App.moneyLiteral('<p>All amounts use original recorded sale/return facts. Dated voids appear on their correction date. Legacy caveats are not a clean bill of health.</p><div class="btn-row">')+['customers','suppliers','stock','cash','sales','tax','reconciliation'].map(k=>'<button class="btn sm" data-statement="'+k+'">'+(A.lang()==='hi'?A.moneyCode(k):k[0].toUpperCase()+k.slice(1))+' CSV</button>').join('')+window.App.moneyLiteral('</div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Account / item</th><th>Rebuilt</th><th>Recorded</th></tr></thead><tbody>')+[...r.customers,...r.suppliers,...r.stock].slice(0,50).map(c=>'<tr><td>'+esc(c.name+(c.unit?' ('+c.unit+')':''))+'</td><td>'+esc(c.expected ?? window.App.moneyLiteral('Unknown'))+'</td><td>'+esc(c.actual)+'</td></tr>').join('')+window.App.moneyLiteral('</tbody></table></div><p>Preview: first 50 accounts/items. CSV exports include all rows.</p></div>'));
  const counts=A.el(window.App.moneyLiteral('<div><p><b>Recent cash counts</b> · Complete closings are in Cash shifts and Reconciliation CSV.</p>')+r.shifts.slice(-3).map(s=>'<p'+(s.variance?' class="alert warn"':'')+'>'+esc(s.reportedCount===null?window.App.moneyLiteral('Open till: expected ')+m(s.expected,true):window.App.moneyLiteral('Closing count ')+m(s.reportedCount,true)+window.App.moneyLiteral(' · expected ')+m(s.expected,true)+window.App.moneyLiteral(' · variance ')+m(s.variance,true))+'</p>').join('')+'</div>');body.appendChild(counts);
  const modal=A.modal({title:window.App.moneyLiteral('Statements & reconciliation'),body,wide:true,buttons:[!A.DB().stockBook?{label:window.App.moneyLiteral('Start stock history'),cls:'pri',fn:async()=>{await A.actions.startStockHistory();A.render();}}:null,{label:window.App.moneyLiteral('Close'),cls:'ghost'}]});
  body.addEventListener('click',e=>{try{const b=e.target.closest('[data-statement]');if(b){A.requirePermission('reports');A.download(A.toCSV(A.statementRows(b.dataset.statement,options)),'dukaan-'+b.dataset.statement+'.csv','text/csv');}if(e.target.closest('#statementApply')){const next={from:body.querySelector('#statementFrom').value,to:body.querySelector('#statementTo').value};if(!next.from||!next.to)throw new Error(window.App.moneyLiteral('Choose both report dates.'));A.reportPeriod(next);modal.close();A.reconciliationDashboard(next);}}catch(error){A.reportError(error);}});
 };
})(window);
