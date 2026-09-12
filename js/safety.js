/* Persistence validation and the single writable counter per browser origin. */
(function (w) {
  'use strict';
  const App = w.App;
  let locked = false, epoch = 0;
  App.isLocked = () => locked;
  App.context = () => ({ epoch, account: App.accountId, staff: App.DB().session.staffId, store: App.S() });
  App.contextValid = (c) => !locked && c.epoch === epoch && c.account === App.accountId &&
    c.staff === App.DB().session.staffId && c.store === App.S();
  App.assertContext = (c) => { if (!App.contextValid(c)) throw new Error('The counter changed or locked. Open this action again.'); App.requireAccess(); };
  App.invalidateContext = () => { epoch++; App.emit('secureclear'); };
  App.setLocked = (value) => { locked = value; if (value) App.invalidateContext(); };
  App.requireAccess = () => {
    if (App.isSaving && App.isSaving()) throw new Error('A save is already in progress. Wait for it to finish.');
    if (locked || (App.auth && App.auth.gateOn() && !App.auth.currentAccount())) throw new Error('Unlock or sign in to continue.');
    const staff = App.me();
    if (!staff || staff.active === false) throw new Error('This staff member is not active.');
    if(App.canStore&&!App.canStore(App.S(),staff))throw new Error('This staff member is not assigned to the active store.');
  };
  App.limits = { fileBytes: 16 * 1024 * 1024, text: 4096, records: 50000 };
  App.checkFile = (file) => { if (!file || file.size > App.limits.fileBytes) throw new Error('File is too large (maximum 16 MB).'); };
  // Bound the object before cloning or recursion in the schema validator.
  App.checkDataBounds = (input) => {
    const pending = [[input, 0]], seen = new Set(); let nodes = 0, chars = 0;
    while (pending.length) {
      const [value, depth] = pending.pop();
      if (++nodes > 500000 || depth > 16) throw new Error('Shop data is too large or too deeply nested.');
      if (typeof value === 'string') {
        chars += value.length;
        if (value.length > App.limits.text || chars > 4000000) throw new Error('Shop data contains too much text.');
      } else if (value && typeof value === 'object') {
        if (seen.has(value)) throw new Error('Shop data contains repeated or circular objects.');
        seen.add(value);
        if (Array.isArray(value) && value.length > App.limits.records) throw new Error('Too many records in one collection.');
        for (const [key, child] of Object.entries(value)) {
          if (key.length > 100 || ['__proto__', 'constructor', 'prototype'].includes(key)) throw new Error('Unsafe data key.');
          pending.push([child, depth + 1]);
        }
      }
    }
  };
  let writable = false, release;
  App.assertWriter = () => {
    if (!writable) throw new Error('This counter is not writable. Close the other Dukaan OS tab and reload.');
  };
  App.acquireWriter = () => new Promise((resolve, reject) => {
    if (writable) return resolve(true);
    if (!navigator.locks) return reject(new Error('This browser cannot safely coordinate shop storage. Use a current browser on HTTPS or localhost.'));
    navigator.locks.request('dukaanos-counter-writer', { ifAvailable: true }, async (lock) => {
      if (!lock) return resolve(false);
      writable = true;
      resolve(true);
      await new Promise((r) => { release = r; });
      writable = false;
    }).catch(reject);
  });
  w.addEventListener('pagehide', () => { App.invalidateContext(); writable = false; if (release) release(); });
  w.addEventListener('pageshow', (e) => { if (e.persisted) location.reload(); });

  App.requirePermission = (permission) => {
    App.assertWriter();
    App.requireAccess();
    if (!App.can(permission)) throw new Error('Owner access required for this action.');
  };
  App.reportError = (e) => App.toast && App.toast('err', App.uiText?App.uiText('Not saved'):'Not saved',App.uiText?App.uiText(e.message || String(e)):(e.message || String(e)));
  App.number = (value, name, min = 0, max = 1e9) => {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
      throw new Error(name + ' must be a number between ' + min + ' and ' + max + '.');
    }
    return value;
  };

  // Validate before replacing storage. Never silently turn unreadable data into an empty shop.
  App.validateData = (input) => {
    App.checkDataBounds(input);
    const d = JSON.parse(JSON.stringify(input, (k, v) => {
      if (typeof v === 'number' && !Number.isFinite(v)) throw new Error('Invalid shop data: non-finite number');
      return v;
    }));
    const obj = (x) => x && typeof x === 'object' && !Array.isArray(x);
    const fail = (s) => { throw new Error('Invalid shop data: ' + s); };
    if (!obj(d) || d.v !== 2 || !obj(d.settings) || !obj(d.session) || !obj(d.counter)) fail('unsupported version or missing settings/session/counter');
    const id = (x) => typeof x === 'string' && /^[A-Za-z0-9_-]{1,100}$/.test(x) && !['__proto__', 'constructor', 'prototype'].includes(x);
    const date = (x) => !x || (typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x) && new Date(x).toISOString().slice(0, 10) === x);
    const collections = ['stores', 'staff', 'items', 'customers', 'suppliers', 'bills', 'payments', 'purchases', 'supplierPayments', 'activity', 'shifts'];
    const rootKeys = new Set(['v', 'createdAt', 'settings', 'session', 'counter', 'drafts', 'quantityVersion', 'customerLedgerVersion', 'returns', 'refunds', 'supplierLedgerVersion','supplierReturns','supplierRefunds','stockAdjustments','storeAccessVersion','storeProfilesVersion','stockTransfers','transferReceipts','stockBook','cashVersion','cashBaseline','cashMovements','cashManual','cashSessions','cashCloseCorrections', ...collections]);
    for (const key of Object.keys(d)) if (!rootKeys.has(key)) fail('unknown field: ' + key);
    for (const key of collections) {
      if (!Array.isArray(d[key])) fail(key + ' must be an array');
      const ids = new Set();
      for (const x of d[key]) {
        if (!obj(x) || !id(x.id) || ids.has(x.id)) fail(key + ' has an invalid or duplicate ID');
        ids.add(x.id);
      }
    }
    const exists = (key, x) => d[key].some((r) => r.id === x);
    if(d.drafts!==undefined){
      if(!Array.isArray(d.drafts))fail('drafts must be an array');
      const draftIds=new Set(),scopes=new Set();
      for(const draft of d.drafts){
        if(!obj(draft)||!id(draft.id)||draftIds.has(draft.id)||draft.version!==1||!Number.isSafeInteger(draft.revision)||draft.revision<1)fail('invalid draft identity');
        draftIds.add(draft.id);
        for(const k of ['accountId','storeId','staffId','deviceId'])if(!id(draft[k]))fail('invalid draft scope');
        const scope=JSON.stringify([draft.accountId,draft.storeId,draft.staffId,draft.deviceId]);if(scopes.has(scope))fail('duplicate draft scope');scopes.add(scope);
        const cart=draft.cart;if(!obj(cart)||cart.storeId!==draft.storeId||!Array.isArray(cart.lines)||!cart.lines.length||!['cash','upi','card','credit'].includes(cart.mode))fail('invalid draft cart');
        for(const k of ['discount','redeem'])App.number(cart[k],k);
        for(const l of cart.lines){if(!obj(l)||!id(l.itemId))fail('invalid draft item');App.number(l.price,'draft price');App.number(l.qty,'draft quantity',0.0001);App.domain.quantityUnits(l.qty);}
      }
    }
    if (!d.stores.length || !exists('stores', d.settings.activeStore)) fail('active store is missing');
    if (!d.staff.some((s) => s.role === 'owner' && s.active !== false) || !d.staff.some((s) => s.id === d.session.staffId && s.active !== false)) fail('owner or active staff is missing');
    for (const s of d.staff) if (!['owner', 'cashier'].includes(s.role)) fail('unknown staff role');
    if(d.storeAccessVersion!==undefined&&d.storeAccessVersion!==1)fail('unknown store access version');
    if(d.storeProfilesVersion!==undefined&&d.storeProfilesVersion!==1)fail('unknown store profiles version');
    for(const s of d.staff)if(s.storeIds!==undefined||d.storeAccessVersion===1){if(!Array.isArray(s.storeIds)||new Set(s.storeIds).size!==s.storeIds.length||s.storeIds.some(id=>!exists('stores',id)))fail('invalid staff store assignments');}
    if(d.storeAccessVersion===1){const current=d.staff.find(s=>s.id===d.session.staffId);if(current.role!=='owner'&&!current.storeIds.includes(d.settings.activeStore))fail('active staff is not assigned to store');}
    for(const store of d.stores){
      if(store.dailyTarget!==undefined)App.number(store.dailyTarget,'store daily target');
      if(store.receiptProfile!==undefined){const p=store.receiptProfile;if(d.storeProfilesVersion!==1||!obj(p)||Object.keys(p).some(k=>!['shopName','shopPhone','address','gstin','upiId','receiptTheme'].includes(k))||Object.values(p).some(v=>typeof v!=='string')||!p.shopName?.trim()||(p.receiptTheme&&!['saffron','tulsi','indigo','ink'].includes(p.receiptTheme)))fail('invalid store receipt profile');}
    }
    for (const key of collections.filter((k) => !['stores', 'staff'].includes(k))) {
      for (const x of d[key]) {
        // Legacy single-store records have one unambiguous owner. Never guess in multi-store data.
        if (!x.storeId && d.stores.length === 1) x.storeId = d.stores[0].id;
        if (!exists('stores', x.storeId)) fail(key + ' references a missing store');
      }
    }
    const numeric = (x, keys, signed = []) => {
      for (const k of keys) if (x[k] != null) App.number(x[k], k, signed.includes(k) ? -1e9 : 0);
    };
    for (const key of ['bill', 'po']) if (!Number.isSafeInteger(d.counter[key]) || d.counter[key] < 1) fail('invalid counter');
    numeric(d.settings, ['lowStock', 'dailyTarget', 'defaultGst', 'loyaltyRate', 'loyaltyValue', 'expiryWarnDays']);
    if (d.settings.defaultGst > 100 || d.settings.loyaltyRate <= 0 || d.settings.loyaltyValue <= 0) fail('invalid tax or loyalty settings');
    for (const k of ['shopName', 'shopPhone', 'upiId', 'address', 'gstin', 'currency', 'logo', 'pin']) {
      if (d.settings[k] != null && typeof d.settings[k] !== 'string') fail(k + ' must be text');
    }
    for (const [k, values] of Object.entries({ lang: ['en', 'hi'], theme: ['light', 'dark'], receiptTheme: ['saffron', 'tulsi', 'indigo', 'ink'] })) {
      if (d.settings[k] != null && !values.includes(d.settings[k])) fail('invalid ' + k);
    }
    for (const k of ['gstEnabled', 'pinOn']) if (d.settings[k] != null && typeof d.settings[k] !== 'boolean') fail(k + ' must be true or false');
    for (const it of d.items) {
      if (typeof it.name !== 'string' || !it.name.trim()) fail('item name is missing');
      for (const k of ['price', 'cost', 'stock']) App.number(it[k], k);
      numeric(it, ['gst', 'threshold']);
      if (it.gst > 100 || !Array.isArray(it.batches)) fail('invalid GST or batches');
      const ids = new Set();
      for (const b of it.batches) {
        if (!obj(b) || !id(b.id) || ids.has(b.id)) fail('invalid batch ID');
        ids.add(b.id);
        App.number(b.qty, 'batch quantity'); App.number(b.cost, 'batch cost');
        if(b.quarantined!==undefined&&typeof b.quarantined!=='boolean')fail('invalid quarantine status');
        if (!date(b.expiry)) fail('invalid expiry');
      }
    }
    for (const key of ['customers', 'suppliers']) for (const x of d[key]) {
      if (typeof x.name !== 'string' || !x.name.trim()) fail('missing name');
      numeric(x, ['balance', 'spend', 'visits', 'points'], ['balance', 'points']);
    }
    const ledgerIds=new Set(),linkedMovements=new Set();
    if(d.customerLedgerVersion!==undefined&&d.customerLedgerVersion!==1)fail('unsupported customer ledger version');
    for(const c of d.customers)if(c.ledger!==undefined){
      if(d.customerLedgerVersion!==1)fail('customer ledger version marker missing');
      if(!Array.isArray(c.ledger)||!c.ledger.length||c.ledger[0].kind!=='opening')fail('customer ledger needs an opening checkpoint');
      let balance=0;
      for(const [index,e] of c.ledger.entries()){
        if(!obj(e)||!id(e.id)||ledgerIds.has(e.id)||e.storeId!==c.storeId||!['opening','sale','void','collection','advance','correction','return','refund'].includes(e.kind)||(index>0&&e.kind==='opening'))fail('invalid customer ledger entry');
        ledgerIds.add(e.id);App.number(e.delta,'ledger delta',-1e9);App.number(e.at,'ledger date',0,8640000000000000);
        const link=['sale','void'].includes(e.kind)?e.billId:['collection','advance'].includes(e.kind)?e.paymentId:e.kind==='return'?e.returnId:e.kind==='refund'?e.refundId:null;
        if(link){const key=e.kind+'/'+link;if(linkedMovements.has(key))fail('duplicate linked customer movement');linkedMovements.add(key);}
        if(Math.abs(e.delta*100-Math.round(e.delta*100))>0.00001)fail('ledger amount has sub-paise precision');
        balance+=Math.round(e.delta*100);
        if(e.billId&&!d.bills.some(b=>b.id===e.billId&&b.customerId===c.id&&b.storeId===c.storeId))fail('ledger bill belongs to another customer/store');
        if(e.paymentId&&!d.payments.some(p=>p.id===e.paymentId&&p.customerId===c.id&&p.storeId===c.storeId))fail('ledger payment belongs to another customer/store');
        if(['sale','void'].includes(e.kind)){
          const bill=d.bills.find(b=>b.id===e.billId);
          if(!bill||!bill.credit||(e.kind==='void'&&!bill.void)||Math.abs(e.delta-(e.kind==='sale'?bill.total:-bill.total))>0.00001)fail('ledger entry differs from linked bill');
        }
        if(['collection','advance'].includes(e.kind)){
          const payment=d.payments.find(p=>p.id===e.paymentId);
          if(!payment||payment.kind!==e.kind||payment.mode!==e.mode||Math.abs(e.delta+payment.amount)>0.00001)fail('ledger entry differs from linked payment');
        }
        if(e.kind==='correction'&&(!e.delta||typeof e.note!=='string'||e.note.trim().length<3))fail('invalid customer correction');
        if(e.kind==='return'){
          const r=(d.returns || []).find(r=>r.id===e.returnId&&r.customerId===c.id&&r.storeId===c.storeId&&r.ledgerApplied);
          if(!r||Math.abs(e.delta+r.amount)>0.00001)fail('ledger return link or amount differs');
        }
        if(e.kind==='refund'){
          const f=(d.refunds || []).find(f=>f.id===e.refundId&&f.storeId===c.storeId),r=f&&(d.returns || []).find(r=>r.id===f.returnId&&r.customerId===c.id&&r.ledgerApplied);
          if(!r||Math.abs(e.delta-f.amount)>0.00001)fail('ledger refund link or amount differs');
        }
      }
      if(Math.abs(balance/100-c.balance)>0.00001)fail('customer balance differs from ledger projection');
    }
    const ref = (x, field, key, optional = false) => {
      if (optional && !x[field]) return;
      const target = d[key].find((r) => r.id === x[field]);
      if (!target || (target.storeId && x.storeId && target.storeId !== x.storeId)) fail(field + ' references a missing or different-store record');
    };
    for (const key of ['bills', 'purchases']) for (const b of d[key]) {
      if (!Array.isArray(b.lines) || !b.lines.length) fail('empty transaction lines');
      App.number(b.total, 'total'); App.number(b.at, 'transaction date', 0, 8640000000000000);
      if (!Number.isSafeInteger(b.no) || b.no < 1 || b.no >= d.counter[key === 'bills' ? 'bill' : 'po']) fail('invalid transaction number/counter');
      if (b.mode != null && !['cash', 'upi', 'card', 'credit'].includes(b.mode)) fail('invalid payment mode');
      numeric(b, ['sub', 'discount', 'tax', 'paid', 'loyalty', 'redeemed']);
      App.number(b.paid, 'amount paid');
      if (b.paid > b.total) fail('paid amount exceeds transaction total');
      if (key === 'bills') {
        for (const k of ['sub', 'discount', 'tax']) App.number(b[k], k);
        if (typeof b.credit !== 'boolean' || typeof b.void !== 'boolean') fail('invalid bill status');
        if (b.credit && !b.customerId) fail('credit bill needs a customer');
        if (b.discount > b.sub || Math.abs(b.sub - b.discount + b.tax - b.total) > 0.011) fail('bill totals do not agree');
      }
      ref(b, key === 'bills' ? 'customerId' : 'supplierId', key === 'bills' ? 'customers' : 'suppliers', key === 'bills');
      for (const l of b.lines) {
        ref({ ...l, storeId: b.storeId }, 'itemId', 'items');
        App.number(l.qty, 'quantity', 0.0001); App.number(l.cost, 'cost');
        if (key === 'bills') {
          App.number(l.price, 'price'); App.number(l.gross, 'gross');
          if (typeof l.name !== 'string' || Math.abs(App.round2(l.price * l.qty) - l.gross) > 0.011) fail('invalid bill line');
        }
        numeric(l, ['price', 'gross', 'gst', 'taxable', 'tax']);
        if (l.gst > 100) fail('invalid line GST');
        if (!date(l.expiry)) fail('invalid purchase expiry');
        if (l.allocations != null) {
          if (!Array.isArray(l.allocations) || !l.allocations.length) fail('invalid stock allocations');
          let qty = 0;
          for (const a of l.allocations) {
            if (!obj(a) || !id(a.id) || !date(a.expiry)) fail('invalid stock allocation');
            App.number(a.qty, 'allocation quantity', 0.0001); App.number(a.cost, 'allocation cost');
            qty += a.qty;
          }
          if (Math.abs(qty - l.qty) > 0.00001) fail('stock allocations do not equal sale quantity');
        }
      }
      const subtotal = App.round2(b.lines.reduce((n, l) => n + (key === 'bills' ? l.gross : l.qty * l.cost), 0));
      if (Math.abs(subtotal - (key === 'bills' ? b.sub : b.total)) > 0.011) fail('line totals do not agree');
      if(key==='purchases'&&b.calculationVersion==='purchase-allocation-v1'){
        const values=App.purchaseLineValues(b.lines),lineIds=new Set();
        b.lines.forEach((l,i)=>{if(!id(l.lineId)||!id(l.batchId)||lineIds.has(l.lineId)||l.value!==values[i])fail('invalid purchase line identity/value');lineIds.add(l.lineId);});
      }
    }
    for (const key of ['payments', 'supplierPayments']) for (const p of d[key]) {
      App.number(p.amount, 'payment', 0.01); App.number(p.at, 'payment date', 0, 8640000000000000);
      if (!['cash', 'upi', 'card'].includes(p.mode)) fail('invalid payment mode');
      ref(p, key === 'payments' ? 'customerId' : 'supplierId', key === 'payments' ? 'customers' : 'suppliers');
      if(key==='payments'&&p.billId&&!d.bills.some(b=>b.id===p.billId&&b.customerId===p.customerId&&b.storeId===p.storeId&&b.credit))fail('invalid collection bill link');
      if(key==='supplierPayments'&&p.purchaseId){const po=d.purchases.find(b=>b.id===p.purchaseId&&b.supplierId===p.supplierId&&b.storeId===p.storeId);if(!po||po.paid+d.supplierPayments.filter(x=>x.purchaseId===po.id).reduce((n,x)=>n+x.amount,0)>po.total+0.00001)fail('invalid supplier payment link or total');}
    }
    if(d.supplierLedgerVersion!==undefined&&d.supplierLedgerVersion!==1)fail('invalid supplier ledger version');
    const supplierEntryIds=new Set(),supplierLinks=new Set();
    for(const s of d.suppliers)if(s.ledger!==undefined){
      if(d.supplierLedgerVersion!==1||!Array.isArray(s.ledger)||!s.ledger.length||s.ledger[0].kind!=='opening')fail('supplier ledger opening/version missing');let total=0;
      for(const [index,e] of s.ledger.entries()){
        if(!obj(e)||!id(e.id)||supplierEntryIds.has(e.id)||e.storeId!==s.storeId||!['opening','purchase','initial_payment','payment','return','refund','correction'].includes(e.kind)||(index&&e.kind==='opening'))fail('invalid supplier movement');supplierEntryIds.add(e.id);
        App.number(e.delta,'supplier delta',-1e9);App.number(e.at,'supplier movement date',0,8640000000000000);if(Math.abs(e.delta*100-Math.round(e.delta*100))>0.00001)fail('supplier movement has sub-paise amount');total+=Math.round(e.delta*100);
        const link=e.purchaseId || e.paymentId || e.returnId || e.refundId;if(link){const key=e.kind+'/'+link;if(supplierLinks.has(key))fail('duplicate supplier source movement');supplierLinks.add(key);}
        if(['purchase','initial_payment'].includes(e.kind)){const po=d.purchases.find(p=>p.id===e.purchaseId&&p.supplierId===s.id&&p.storeId===s.storeId);if(!po||e.delta!==(e.kind==='purchase'?po.total:-po.paid)||(e.kind==='initial_payment'&&e.mode!==po.mode))fail('supplier purchase movement differs');}
        if(e.kind==='payment'){const p=d.supplierPayments.find(p=>p.id===e.paymentId&&p.supplierId===s.id&&p.storeId===s.storeId);if(!p||e.delta!==-p.amount||e.mode!==p.mode)fail('supplier payment movement differs');}
        if(e.kind==='return'){const r=(d.supplierReturns || []).find(r=>r.id===e.returnId&&r.supplierId===s.id&&r.storeId===s.storeId);if(!r||e.delta!==-r.amount)fail('supplier return movement differs');}
        if(e.kind==='refund'){const r=(d.supplierRefunds || []).find(r=>r.id===e.refundId&&r.supplierId===s.id&&r.storeId===s.storeId);if(!r||e.delta!==r.amount||e.mode!==r.mode)fail('supplier refund movement differs');}
        if(e.kind==='correction'&&(!e.delta||typeof e.note!=='string'||e.note.trim().length<3))fail('supplier correction needs a reason');
      }
      if(Math.abs(total/100-s.balance)>0.00001)fail('supplier balance differs from ledger');
    }
    const checkedReturns=[];
    for(const po of d.purchases)if(po.calculationVersion==='purchase-allocation-v1'){
      const ledger=d.suppliers.find(s=>s.id===po.supplierId)?.ledger || [];
      if(!ledger.some(e=>e.kind==='purchase'&&e.purchaseId===po.id))fail('supplier purchase movement missing');
      if(po.paid&&!ledger.some(e=>e.kind==='initial_payment'&&e.purchaseId===po.id))fail('supplier initial payment movement missing');
      if((po.cancelled||po.cancellationId)&&!(d.supplierReturns || []).some(r=>r.id===po.cancellationId&&r.purchaseId===po.id&&r.cancel&&po.cancelled===true))fail('purchase cancellation record missing');
    }
    for(const p of d.supplierPayments)if(p.command?.kind==='supplier_payment'&&!d.suppliers.find(s=>s.id===p.supplierId)?.ledger?.some(e=>e.kind==='payment'&&e.paymentId===p.id))fail('supplier payment movement missing');
    for(const key of ['returns','refunds','supplierReturns','supplierRefunds'])if(d[key]!==undefined){
      if(!Array.isArray(d[key]))fail(key+' must be an array');const ids=new Set();
      for(const r of d[key]){if(!obj(r)||!id(r.id)||ids.has(r.id)||!exists('stores',r.storeId))fail('invalid '+key+' identity');ids.add(r.id);App.number(r.at,'return/refund date',0,8640000000000000);App.number(r.amount,'return/refund amount');}
    }
    for(const r of d.returns || []){
      const bill=d.bills.find(b=>b.id===r.billId&&b.storeId===r.storeId);
      if(!bill||r.customerId!==bill.customerId||r.originalCredit!==bill.credit||!['restock','quarantine'].includes(r.disposition)||!['refund','customer'].includes(r.destination)||typeof r.reason!=='string'||r.reason.trim().length<3)fail('invalid return link or policy');
      if(r.ledgerApplied!==(!!bill.customerId&&(bill.credit||r.destination==='customer')))fail('invalid return ledger treatment');
      if(!obj(r.request)||r.request.billId!==r.billId||r.request.destination!==r.destination||r.request.disposition!==r.disposition||r.request.reason!==r.reason)fail('return request differs');
      const expected=App.returnMath.quote(bill,checkedReturns.filter(x=>x.billId===r.billId),r.request.lines);
      for(const k of ['amount','tax','redeemedPoints','loyaltyReversed'])if(r[k]!==expected[k])fail('return allocation differs: '+k);
      if(JSON.stringify(r.lines)!==JSON.stringify(expected.lines))fail('return line allocation differs');
      App.number(r.refundable,'refundable amount',0,r.amount);
      if(r.ledgerApplied&&!d.customers.find(c=>c.id===r.customerId)?.ledger?.some(e=>e.kind==='return'&&e.returnId===r.id))fail('return customer movement missing');
      const ledger=d.customers.find(c=>c.id===r.customerId)?.ledger || [],position=ledger.findIndex(e=>e.kind==='return'&&e.returnId===r.id);
      const balanceBefore=r.ledgerApplied?ledger.slice(0,position).reduce((n,e)=>n+Math.round(e.delta*100),0)/100:0;
      const expectedRefundable=App.round2(r.amount-(r.ledgerApplied?Math.min(r.amount,Math.max(0,balanceBefore)):0));
      if(Math.abs(r.refundable-expectedRefundable)>0.00001)fail('return refundable amount differs from debt cancellation');
      checkedReturns.push(r);
    }
    for(const f of d.refunds || []){
      const r=(d.returns || []).find(r=>r.id===f.returnId&&r.storeId===f.storeId);
      if(!r||!['cash','upi'].includes(f.mode)||typeof f.reference!=='string'||f.reference.trim().length<3||f.amount<=0)fail('invalid refund');
      const total=d.refunds.filter(x=>x.returnId===r.id).reduce((n,x)=>n+x.amount,0);if(total>r.refundable+0.00001)fail('refunds exceed liability');
      if(r.ledgerApplied&&!d.customers.find(c=>c.id===r.customerId)?.ledger?.some(e=>e.kind==='refund'&&e.refundId===f.id))fail('refund customer movement missing');
    }
    const priorSupplierReturns=[];
    for(const r of d.supplierReturns || []){
      const po=d.purchases.find(p=>p.id===r.purchaseId&&p.supplierId===r.supplierId&&p.storeId===r.storeId),s=d.suppliers.find(s=>s.id===r.supplierId);
      if(!po||po.calculationVersion!=='purchase-allocation-v1'||!Array.isArray(r.lines)||!r.lines.length||typeof r.reason!=='string'||r.reason.trim().length<3||typeof r.cancel!=='boolean')fail('invalid supplier return');
      let amount=0;const lineIds=new Set();
      for(const l of r.lines){
        const original=po.lines.find(x=>x.lineId===l.lineId),previous=priorSupplierReturns.filter(x=>x.purchaseId===po.id).flatMap(x=>x.lines).filter(x=>x.lineId===l.lineId).reduce((n,x)=>n+App.domain.quantityUnits(x.qty),0);
        if(!original||lineIds.has(l.lineId)||l.itemId!==original.itemId||l.cost!==original.cost||!Array.isArray(l.allocations))fail('supplier return line differs');lineIds.add(l.lineId);App.number(l.qty,'supplier return quantity',0.0001);const qty=App.domain.quantityUnits(l.qty);
        if(previous+qty>App.domain.quantityUnits(original.qty)||l.amount!==App.supplierReturnValue(original,previous,qty))fail('supplier return exceeds source value/quantity');amount+=l.amount;
        let allocated=0;const lots=new Set();for(const a of l.allocations){if(!id(a.id)||lots.has(a.id)||a.purchaseId!==po.id||a.purchaseLineId!==l.lineId||a.cost!==l.cost)fail('supplier return allocation differs');lots.add(a.id);App.number(a.qty,'supplier allocation',0.0001);allocated+=App.domain.quantityUnits(a.qty);}if(allocated!==qty)fail('supplier allocation quantity differs');
      }
      if(r.amount!==App.round2(amount))fail('supplier return total differs');
      if(r.cancel&&(!po.cancelled||po.cancellationId!==r.id||priorSupplierReturns.some(x=>x.purchaseId===po.id)||r.lines.length!==po.lines.length||po.lines.some(l=>!r.lines.some(x=>x.lineId===l.lineId&&x.qty===l.qty))))fail('invalid purchase cancellation');
      const position=s?.ledger?.findIndex(e=>e.kind==='return'&&e.returnId===r.id) ?? -1;if(position<0)fail('supplier return movement missing');const before=s.ledger.slice(0,position).reduce((n,e)=>n+Math.round(e.delta*100),0)/100;
      if(r.refundable!==App.round2(r.amount-Math.min(r.amount,Math.max(0,before))))fail('supplier refundable credit differs');priorSupplierReturns.push(r);
    }
    for(const f of d.supplierRefunds || []){
      const r=(d.supplierReturns || []).find(r=>r.id===f.returnId&&r.supplierId===f.supplierId&&r.storeId===f.storeId);
      if(!r||!['cash','upi'].includes(f.mode)||typeof f.reference!=='string'||f.reference.trim().length<3||f.amount<=0)fail('invalid supplier refund');
      if(d.supplierRefunds.filter(x=>x.returnId===r.id).reduce((n,x)=>n+x.amount,0)>r.refundable+0.00001)fail('supplier refunds exceed credit');
      if(!d.suppliers.find(s=>s.id===r.supplierId)?.ledger?.some(e=>e.kind==='refund'&&e.refundId===f.id))fail('supplier refund movement missing');
    }
    if(d.stockAdjustments!==undefined){
      if(!Array.isArray(d.stockAdjustments))fail('stock adjustments must be an array');const ids=new Set(),reversed=new Set(),prior=[];
      for(const r of d.stockAdjustments){
        if(!obj(r)||!id(r.id)||ids.has(r.id)||!id(r.staffId)||!d.items.some(it=>it.id===r.itemId&&it.storeId===r.storeId)||!['count','found','expired','damaged','reversal'].includes(r.reasonCode)||typeof r.note!=='string'||r.note.trim().length<3)fail('invalid stock adjustment');ids.add(r.id);
        App.number(r.at,'adjustment date',0,8640000000000000);App.number(r.delta,'adjustment delta',-1e9);App.domain.quantityUnits(Math.abs(r.delta));if(!r.delta)fail('empty adjustment');
        for(const k of ['beforeBatch','afterBatch']){App.number(r[k],k);App.domain.quantityUnits(r[k]);}
        if(App.domain.quantity(r.beforeBatch+r.delta)!==r.afterBatch||!obj(r.batch)||!id(r.batch.id)||!date(r.batch.expiry))fail('adjustment batch/count differs');App.number(r.batch.cost,'adjustment cost');
        if(r.batch.quarantined!==undefined&&typeof r.batch.quarantined!=='boolean')fail('adjustment quarantine invalid');
        if(r.value!==App.round2(r.delta*r.batch.cost))fail('adjustment cost value differs');
        for(const v of [r.before,r.after]){if(!obj(v))fail('adjustment summary missing');for(const k of ['physical','sellable','quarantine','expired']){App.number(v[k],k);App.domain.quantityUnits(v[k]);}if(App.domain.quantity(v.sellable+v.quarantine+v.expired)!==v.physical)fail('adjustment stock summary differs');}
        if(App.domain.quantity(r.before.physical+r.delta)!==r.after.physical||App.domain.quantity(r.before.quarantine+(r.batch.quarantined?r.delta:0))!==r.after.quarantine)fail('adjustment movement differs');
        const expiredDate=!!r.batch.expiry&&r.batch.expiry<App.dayKey(r.at),expired=!r.batch.quarantined&&expiredDate;if(App.domain.quantity(r.before.expired+(expired?r.delta:0))!==r.after.expired||(r.reasonCode==='expired'&&!expiredDate))fail('adjustment expiry movement differs');
        if((['expired','damaged'].includes(r.reasonCode)&&r.delta>0)||(r.reasonCode==='found'&&r.delta<0))fail('adjustment reason/sign differs');
        if(r.reasonCode==='reversal'){const original=prior.find(x=>x.id===r.reverses&&x.storeId===r.storeId&&x.itemId===r.itemId);if(!original||reversed.has(r.reverses)||r.delta!==-original.delta||['id','cost','expiry','quarantined','purchaseId','purchaseLineId'].some(k=>(r.batch[k] ?? null)!==(original.batch[k] ?? null)))fail('invalid adjustment reversal');reversed.add(r.reverses);}else if(r.reverses)fail('unexpected adjustment reversal link');
        prior.push(r);
      }
    }
    if(d.stockTransfers!==undefined||d.transferReceipts!==undefined){
      if(!Array.isArray(d.stockTransfers)||!(d.transferReceipts===undefined||Array.isArray(d.transferReceipts)))fail('invalid transfer collections');const transferIds=new Set(),receiptIds=new Set(),lotIds=new Set();
      for(const t of d.stockTransfers){
        if(!obj(t)||!id(t.id)||transferIds.has(t.id)||t.storeId!==t.fromStoreId||t.fromStoreId===t.toStoreId||!exists('stores',t.fromStoreId)||!exists('stores',t.toStoreId)||!Array.isArray(t.lines)||!t.lines.length||typeof t.note!=='string'||t.note.trim().length<3)fail('invalid transfer');transferIds.add(t.id);App.number(t.at,'transfer date',0,8640000000000000);const lineIds=new Set(),sourceItems=new Set();
        for(const l of t.lines){if(sourceItems.has(l.itemId))fail('repeated transfer source item');sourceItems.add(l.itemId);if(!id(l.lineId)||lineIds.has(l.lineId)||!d.items.some(i=>i.id===l.itemId&&i.storeId===t.fromStoreId)||!d.items.some(i=>i.id===l.targetItemId&&i.storeId===t.toStoreId)||typeof l.unit!=='string'||!l.unit||!Array.isArray(l.allocations))fail('invalid transfer line');lineIds.add(l.lineId);App.number(l.qty,'transfer quantity',0.0001);const qty=App.domain.quantityUnits(l.qty),ids=new Set();let sum=0;for(const a of l.allocations){if(!id(a.id)||ids.has(a.id)||!date(a.expiry)||a.quarantined)fail('invalid transfer allocation');ids.add(a.id);if(a.expiry&&a.expiry<App.dayKey(t.at))fail('expired transfer source');App.number(a.cost,'transfer cost');App.number(a.qty,'transfer allocation quantity',0.0001);sum+=App.domain.quantityUnits(a.qty);}if(sum!==qty)fail('transfer quantities differ');}
      }
      const accepted=new Map();
      for(const r of d.transferReceipts || []){
        const t=d.stockTransfers.find(t=>t.id===r.transferId);if(!obj(r)||!id(r.id)||receiptIds.has(r.id)||!t||typeof r.recall!=='boolean'||r.storeId!==(r.recall?t.fromStoreId:t.toStoreId)||!Array.isArray(r.lines)||!r.lines.length||typeof r.note!=='string'||r.note.trim().length<3)fail('invalid transfer receipt');receiptIds.add(r.id);App.number(r.at,'transfer receipt date',0,8640000000000000);const lineIds=new Set();
        for(const l of r.lines){
          const original=t.lines.find(x=>x.lineId===l.lineId),key=t.id+'/'+l.lineId,before=accepted.get(key)||0;if(!original||lineIds.has(l.lineId)||l.itemId!==(r.recall?original.itemId:original.targetItemId)||!Array.isArray(l.allocations))fail('invalid received line');lineIds.add(l.lineId);App.number(l.qty,'received quantity',0.0001);const qty=App.domain.quantityUnits(l.qty);if(before+qty>App.domain.quantityUnits(original.qty))fail('transfer receipt exceeds dispatched stock');
          let skip=before,need=qty;const expected=[];for(const source of original.allocations){const units=App.domain.quantityUnits(source.qty);if(skip>=units){skip-=units;continue;}const use=Math.min(need,units-skip);skip=0;if(use){expected.push({...source,qty:use/App.domain.QUANTITY_SCALE});need-=use;}if(!need)break;}
          if(need||l.allocations.length!==expected.length)fail('transfer receipt allocations differ');l.allocations.forEach((a,n)=>{const e=expected[n];if(!id(a.id)||lotIds.has(a.id)||a.sourceBatchId!==e.id||a.transferId!==t.id||a.transferLineId!==original.lineId||['qty','cost','expiry','quarantined','purchaseId','purchaseLineId'].some(k=>(a[k] ?? null)!==(e[k] ?? null)))fail('received stock provenance differs');lotIds.add(a.id);});accepted.set(key,before+qty);
        }
      }
    }
    if(App.validateCashData)App.validateCashData(d);
    if(App.validateStockHistory)App.validateStockHistory(d);
    // Reject objects where display code expects a primitive, including prototype-bearing input.
    const walk = (x) => {
      for (const [k, v] of Object.entries(x)) {
        if (['__proto__', 'constructor', 'prototype'].includes(k)) fail('unsafe object key');
        if (['name', 'nameHi', 'emoji', 'alias', 'category', 'barcode', 'phone', 'note', 'pin', 'customerName', 'supplierName'].includes(k) && typeof v !== 'string') fail(k + ' must be text');
        if (v && typeof v === 'object') walk(v);
      }
    };
    walk(d);
    if(App.units)App.units.validateBook(d);
    return d;
  };
})(window);
