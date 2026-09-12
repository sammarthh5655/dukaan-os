const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {create,item,cart,ROOT}=require('./harness.cjs');
test('core locales cover every literal uiText call, markup label and placeholder token',async()=>{
 const {A}=await create();A.DB().settings.lang='hi';const keys=new Set(A.coreLocaleInventory());
 for(const file of ['index.html',...fs.readdirSync(path.join(ROOT,'js')).filter(f=>f.endsWith('.js')).map(f=>'js/'+f)]){
  const source=fs.readFileSync(path.join(ROOT,file),'utf8');for(const m of source.matchAll(/(?:App|A)\.uiText\('([^']+)'/g))assert.ok(keys.has(m[1]),file+': '+m[1]);for(const m of source.matchAll(/data-core-text="([^"]+)"/g))assert.ok(keys.has(m[1]),file+': '+m[1]);
 }
 for(const key of keys){const translated=A.uiText(key);assert.match(translated,/[\u0900-\u097f]/,key);assert.deepEqual((translated.match(/\{\w+\}/g)||[]).sort(),(key.match(/\{\w+\}/g)||[]).sort());}
 assert.match(A.uiText('Tea has a new price. Remove it and add it again.'),/Tea.*दाम/);
});
test('Hindi labels never rewrite persistent IDs, monetary values or frozen receipts',async()=>{
 const {A,ctx}=await create();ctx.document.documentElement={};const i=item(A,{nameHi:'चाय'});await A.save();const bill=await A.actions.checkout(cart(i)),before=JSON.stringify(bill),receipt=A.billText(bill),stock=i.stock;
 await A.setLang('hi');assert.equal(A.itemName(i),'चाय');assert.equal(JSON.stringify(A.DB().bills[0]),before);assert.equal(A.billText(bill),receipt);assert.equal(A.item(i.id).stock,stock);
 await A.setLang('en');assert.equal(A.itemName(i),'Audit item');assert.equal(JSON.stringify(A.DB().bills[0]),before);
});
