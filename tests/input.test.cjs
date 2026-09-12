const {test}=require('node:test');const assert=require('node:assert/strict');
const {create,item,customer,cart}=require('./harness.cjs');

function csvImport(h,text){
  let modal;h.A.el=()=>h.node('import-body');h.A.modal=opts=>{modal=opts;return {close(){}};};
  h.ctx.FileReader=class{readAsText(file){this.result=file;this.onload();}};
  h.A.views.inventory(h.node('main'));
  h.node('main').click({target:{closest:s=>s==='#impCsv'?{}:null}});
  h.node('#csvf').onchange({target:{files:[text]}});
  return modal.buttons[1].fn();
}

test('B16: birthday, briefing and CSV icon HTML are rendered as text',async()=>{
  const h=await create(),{A,node}=h;
  const marker='<img src=x onerror="document.title=\'BAD\'">';
  customer(A,{name:marker,birthday:A.dayKey(Date.now()).slice(5),balance:10,dueSince:Date.now()-10*A.DAY});
  A.views.customers(node('main'));assert.ok(!node('main').innerHTML.includes(marker));assert.match(node('main').innerHTML,/&lt;img/);
  let html;A.el=s=>{html=s;return node('summary');};A.modal=()=>{};(await A.morningBrief(true));
  assert.ok(!html.includes(marker));assert.match(html,/&lt;img/);
  await csvImport(h,'name,price,emoji\nImported,100,"'+marker.replace(/"/g,'""')+'"');
  // Inventory shows a monogram mark instead of the item's emoji field, so the marker must simply never reach the DOM unescaped.
  A.views.inventory(node('main'));assert.ok(!node('main').innerHTML.includes(marker));assert.ok(!/<img/.test(node('main').innerHTML));
  A.views.billing(node('main'));assert.ok(!node('#itemGrid').innerHTML.includes(marker));
  h.ctx.matchMedia=()=>({matches:false});
  node('div').firstElementChild=node('fly');node('fly').animate=()=>({});
  A.flyTo(node('source'),'#cartCount',marker);
  assert.ok(!node('div').innerHTML.includes(marker));assert.match(node('div').innerHTML,/&lt;img/);
});

test('B18–B19: decimal quantity, unknown tokens, ambiguous variants and Hindi examples',async()=>{
  const {A}=await create();const sugar=item(A,{name:'Sugar 1kg (loose)',unit:'kg'}),lays=item(A,{name:'Lays Magic Masala'}),maggi=item(A,{name:'Maggi 2-Min Noodles'});
  assert.equal(A.parseSpeech('1.5 kilo sugar',[sugar]).lines[0].qty,1.5);
  assert.equal(A.parseSpeech('one magic unicorn',[lays]).lines.length,0);
  assert.equal(A.parseSpeech('one magic unicorn',[lays]).unknown.length,1);
  assert.equal(A.parseSpeech('one milk',[item(A,{name:'Milk Whole'}),item(A,{name:'Milk Skim'})]).lines.length,0);
  for(const speech of ['do packet lays aur ek maggi','दो पैकेट lays और एक maggi']) {
    assert.equal(A.parseSpeech(speech,[lays,maggi]).lines.map(l=>l.qty).join(','),'2,1');
  }
});

test('B20: item questions preserve whole words and yesterday excludes today',async()=>{
  const {A}=await create();const maggi=item(A,{name:'Maggi 2-Min Noodles'}),oreo=item(A,{name:'Oreo Chocolate'});
  const yesterday=(await A.actions.checkout(cart(maggi)));yesterday.at=Date.now()-A.DAY;
  (await A.actions.checkout(cart(oreo,{lines:[{itemId:oreo.id,qty:2,price:100}]})));
  const answer=A.ai.ask('Best selling items yesterday');assert.match(answer.text,/Maggi/);assert.doesNotMatch(answer.text,/Oreo/);
  const summary=A.ai.summary(Date.now()-A.DAY).join(' ');assert.match(summary,/Maggi/);assert.doesNotMatch(summary,/Oreo/);
  const itemAnswer=A.ai.ask('How many maggi sold today?');assert.match(JSON.stringify(itemAnswer),/Maggi/);
});

test('B29: blank CSV numeric fields preserve values; invalid rows abort all changes; Hindi and GST update',async()=>{
  const h=await create(),{A}=h;const i=item(A,{name:'Original',nameHi:'पुराना'});(await A.save());
  const before=JSON.stringify(A.DB());
  await assert.rejects(()=>csvImport(h,'name,nameHi,price,cost,stock,gst\nOriginal,नया,,bad,,18'),/cost/);
  assert.equal(JSON.stringify(A.DB()),before);
  await csvImport(h,'name,nameHi,price,cost,stock,gst\nOriginal,नया,,,,18');
  const updated=A.item(i.id);assert.equal(updated.price,100);assert.equal(updated.cost,60);assert.equal(updated.stock,10);
  assert.equal(updated.nameHi,'नया');assert.equal(updated.gst,18);
  await csvImport(h,'name,price,cost,stock,gst\nOriginal,0,0,0,0');
  assert.equal(A.item(i.id).price,0);assert.equal(A.item(i.id).cost,0);assert.equal(A.item(i.id).stock,0);assert.equal(A.item(i.id).gst,0);
});

test('Existing sample data remains valid through save and reload',async()=>{
  const {A}=await create();(await A.seed());const count=A.DB().bills.length;
  (await A.boot('audit'));assert.ok(count>100);assert.equal(A.DB().bills.length,count);
});

test('Reported CSV/receipt limitations: formula text, complete history, void marker and paise',async()=>{
  const h=await create(),{A,node}=h;
  assert.equal(A.toCSV([['=1+1',' +SUM(A1)',-12.5]]),"'=1+1,' +SUM(A1),-12.5");
  assert.equal(A.money(1.25),'₹1.25');
  const i=item(A,{stock:60}),c=customer(A);
  for(let k=0;k<45;k++) (await A.actions.checkout(cart(i,{customerId:c.id})));
  const first=A.DB().bills[0];(await A.actions.voidBill(first.id));
  assert.match(A.billText(first),/CANCELLED/);assert.doesNotMatch(A.billText(first),/Paid by|payment pending/);
  let body,download;
  A.el=()=>body=node('detail');A.modal=()=>({close(){}});A.download=text=>download=text;
  A.customerDetail(c.id);
  body.click({target:{closest:s=>s==='#dCsv'?{}:null}});
  const rows=A.parseCSV(download);assert.equal(rows.length,46);assert.ok(rows.some(r=>r[1]==='Cancelled'));
});

test('Reported expired-stock limitation: quarantine quantities without losing physical stock',async()=>{
  const {A}=await create();const i=item(A,{stock:3,batches:[
    {id:'old',qty:2,cost:20,expiry:'2020-01-01'}, {id:'fresh',qty:1,cost:30,expiry:'2099-01-01'}]});
  (await A.save());assert.equal(A.itemStock(i),3);assert.equal(A.sellableStock(i),1);
  (await assert.rejects(async ()=>(await A.actions.checkout(cart(i,{lines:[{itemId:i.id,price:100,qty:2}]}))),/Insufficient/));
  const b=(await A.actions.checkout(cart(i)));assert.equal(A.itemStock(i),2);assert.equal(A.sellableStock(i),0);
  assert.equal(b.lines[0].cost,30);assert.match(A.ai.expiry()[0].text,/cannot be sold/);
  (await A.actions.voidBill(b.id));assert.equal(A.sellableStock(i),1);assert.equal(A.itemStock(i),3);
});
