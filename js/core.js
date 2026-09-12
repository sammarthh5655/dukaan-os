/* ══════════════════════════════════════════════════════════
   Dukaan OS — core: state, persistence, offline queue, helpers
   ══════════════════════════════════════════════════════════ */
(function (w) {
  'use strict';
  const App = w.App = w.App || {};

  /* Storage is per-account: App.accountId is set once js/auth.js verifies a
     login/signup, and every key below is namespaced to it so two shopkeepers
     on the same device never see each other's data. There is no key until
     someone is authenticated — see js/auth.js and the boot gate in app.js. */
  App.accountId = null;
  const dataKey = () => 'dukaanos.v2.' + (App.accountId || 'guest');
  const queueKey = () => 'dukaanos.syncq.' + (App.accountId || 'guest');

  /* ───────── helpers ───────── */
  const uid = (p) => p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const round2 = (n) => {const value=Math.round((+n + Number.EPSILON) * 100) / 100;return Object.is(value,-0)?0:value;};

  const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
  const inr2 = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const money = (n, dec) => '₹' + ((dec == null ? round2(n) % 1 !== 0 : dec) ? inr2 : inr).format(Math.abs(round2(n) || 0) < 0.005 ? 0 : round2(n));
  const short = (n) => {
    n = +n || 0;
    if (Math.abs(n) >= 1e7) return '₹' + (n / 1e7).toFixed(2).replace(/\.00$/, '') + 'Cr';
    if (Math.abs(n) >= 1e5) return '₹' + (n / 1e5).toFixed(2).replace(/\.00$/, '') + 'L';
    if (Math.abs(n) >= 1e3) return '₹' + (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'k';
    return money(n);
  };

  const DAY = 864e5;
  const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
  const dayKey = (d) => { const x = new Date(d); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
  const daysBetween = (a, b) => Math.floor((startOfDay(b) - startOfDay(a)) / DAY);
  const isToday = (t) => dayKey(t) === dayKey(Date.now());

  function timeAgo(t) {
    const L = App.t ? App.t.bind(App) : (k) => k;
    const s = (Date.now() - t) / 1000;
    if (s < 60) return L('time.now');
    if (s < 3600) return Math.floor(s / 60) + L('time.m');
    if (s < 86400) return Math.floor(s / 3600) + L('time.h');
    const d = Math.floor(s / 86400);
    if (d < 30) return d + L('time.d');
    return Math.floor(d / 30) + L('time.mo');
  }
  const fmtDT = (t) => new Date(t).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
  const fmtD = (t) => new Date(t).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* seeded PRNG so the demo data is identical on every device */
  function rng(seed) { let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }

  /* ───────── default shape ───────── */
  function blank() {
    return {
      v: 2, createdAt: Date.now(),
      settings: {
        lang: 'en', theme: 'light', shopName: 'My Shop', shopPhone: '',
        upiId: '', address: '', gstin: '', currency: '₹',
        lowStock: 5, dailyTarget: 5000, gstEnabled: false, defaultGst: 5,
        receiptTheme: 'saffron', logo: '', pin: '', pinOn: false,
        activeStore: 'st_main', loyaltyRate: 100, loyaltyValue: 1, expiryWarnDays: 30,
        seenSummaryOn: '', celebratedOn: ''
      },
      stores: [{ id: 'st_main', name: 'Main Shop', address: '' }],
      staff: [{ id: 'sf_owner', name: 'Owner', role: 'owner', pin: '', active: true }],
      session: { staffId: 'sf_owner' },
      items: [], customers: [], suppliers: [],
      bills: [], payments: [], purchases: [], supplierPayments: [],
      activity: [], shifts: [], counter: { bill: 1, po: 1 }
    };
  }

  /* ───────── seed catalogue ───────── */
  const SEED_ITEMS = [
    ['Lays Magic Masala', 'लेज़ मैजिक मसाला', 20, 16, 48, 'Snacks', '8901491101837', '🥔', 1],
    ['Kurkure Masala Munch', 'कुरकुरे मसाला मंच', 20, 16, 36, 'Snacks', '8901491100311', '🌽', 1],
    ['Bingo Mad Angles', 'बिंगो मैड एंगल्स', 20, 16, 14, 'Snacks', '8901719119095', '🔺', 0],
    ['Parle-G Biscuit', 'पारले-जी बिस्किट', 10, 8, 72, 'Biscuits', '8901719101007', '🍪', 1],
    ['Britannia Good Day', 'गुड डे बिस्किट', 30, 24, 22, 'Biscuits', '8901063142008', '🍪', 0],
    ['Oreo Chocolate', 'ओरियो चॉकलेट', 30, 24, 4, 'Biscuits', '8901058853582', '🖤', 0],
    ['Dairy Milk 50g', 'डेयरी मिल्क', 50, 41, 26, 'Chocolate', '8901058000108', '🍫', 1],
    ['5 Star', 'फाइव स्टार', 10, 8, 40, 'Chocolate', '8901058000283', '⭐', 1],
    ['Perk', 'पर्क', 10, 8, 0, 'Chocolate', '8901058000306', '🍬', 0],
    ['Maggi 2-Min Noodles', 'मैगी नूडल्स', 14, 11, 64, 'Instant', '8901058000018', '🍜', 1],
    ['Yippee Noodles', 'यिप्पी नूडल्स', 15, 12, 18, 'Instant', '8901725123456', '🍥', 0],
    ['Amul Taaza Milk 500ml', 'अमूल ताज़ा दूध', 27, 25, 12, 'Dairy', '8901262010016', '🥛', 1],
    ['Amul Butter 100g', 'अमूल बटर', 58, 52, 8, 'Dairy', '8901262260015', '🧈', 0],
    ['Amul Dahi 400g', 'अमूल दही', 40, 35, 6, 'Dairy', '8901262090018', '🥣', 0],
    ['Coca-Cola 750ml', 'कोका-कोला', 40, 32, 20, 'Beverages', '8901764012345', '🥤', 1],
    ['Thums Up 750ml', 'थम्स अप', 40, 32, 15, 'Beverages', '8901764023456', '🥤', 0],
    ['Frooti 160ml', 'फ्रूटी', 10, 8, 30, 'Beverages', '8901058111222', '🥭', 1],
    ['Bisleri Water 1L', 'बिसलेरी पानी', 20, 14, 44, 'Beverages', '8901207000019', '💧', 1],
    ['Red Label Tea 250g', 'रेड लेबल चाय', 145, 128, 9, 'Grocery', '8901030612345', '🍵', 0],
    ['Tata Salt 1kg', 'टाटा नमक', 28, 24, 25, 'Grocery', '8901030710014', '🧂', 0],
    ['Fortune Oil 1L', 'फॉर्च्यून तेल', 155, 142, 11, 'Grocery', '8906004340015', '🛢️', 0],
    ['Aashirvaad Atta 5kg', 'आशीर्वाद आटा', 245, 228, 7, 'Grocery', '8901725100112', '🌾', 0],
    ['Sugar 1kg (loose)', 'चीनी 1 किलो', 45, 41, 30, 'Grocery', '', '🍚', 0],
    ['Toor Dal 1kg', 'तूर दाल', 165, 148, 10, 'Grocery', '', '🫘', 0],
    ['Colgate 100g', 'कोलगेट', 60, 51, 14, 'Personal', '8901314010017', '🪥', 0],
    ['Lifebuoy Soap', 'लाइफबॉय साबुन', 35, 29, 21, 'Personal', '8901030621239', '🧼', 0],
    ['Surf Excel 1kg', 'सर्फ एक्सेल', 130, 118, 5, 'Home', '8901030575419', '🧺', 0],
    ['Vim Bar', 'विम बार', 20, 16, 3, 'Home', '8901030601234', '🍽️', 0],
    ['Good Knight Refill', 'गुड नाइट', 78, 68, 6, 'Home', '8901234500019', '🦟', 0],
    ['Cigarette (single)', 'सिगरेट', 20, 17, 50, 'Misc', '', '🚬', 0]
  ];

  const SEED_CUSTOMERS = [
    ['Ramesh Kumar', '9812345670', 0, 34],
    ['Sunita Devi', '9812345671', 0, 12],
    ['Imran Sheikh', '9812345672', 0, 3],
    ['Pooja Sharma', '9812345673', 0, 8],
    ['Vikram Singh', '9812345674', 0, 21],
    ['Anjali Verma', '', 0, 2],
    ['Gupta Ji', '9812345676', 0, 45]
  ];

  const SEED_SUPPLIERS = [
    ['Bhagwati Distributors', '9900112233', 'Snacks, Biscuits', 4200, 6],
    ['Amul Dairy Agent', '9900112244', 'Dairy', 0, 0],
    ['Shree Ram Wholesale', '9900112255', 'Grocery, Home', 9800, -2]
  ];

  /* ───────── state ───────── */
  let DB = blank();
  App.DB = () => DB;

  const committed = new Map();
  async function load() {
    const raw = await App.storage.read(dataKey());
    if (raw !== null) {
      const parsed = App.validateData(JSON.parse(raw));
      DB = Object.assign(blank(), parsed);
      DB.settings = Object.assign(blank().settings, parsed.settings);
      committed.set(dataKey(), raw);
      return true;
    }
    committed.set(dataKey(), null);
    return false;
  }

  // Restore objects in place so open editor references cannot retain failed edits.
  function restore(target, source) {
    Object.keys(target).forEach((k) => { if (!(k in source)) delete target[k]; });
    Object.keys(source).forEach((k) => {
      const v = source[k];
      if (Array.isArray(v)) {
        const old = Array.isArray(target[k]) ? target[k] : [];
        target[k] = v.map((x, i) => {
          const prior = x && typeof x === 'object' ? (x.id ? old.find((y) => y && y.id === x.id) : old[i]) : null;
          if (prior && typeof prior === 'object') { restore(prior, x); return prior; }
          return x;
        });
      } else if (v && typeof v === 'object') {
        if (!target[k] || typeof target[k] !== 'object') target[k] = {};
        restore(target[k], v);
      } else target[k] = v;
    });
  }
  let pendingWrite = false;
  App.isSaving = () => pendingWrite || !!(App.migrations && App.migrations.busy());
  async function persist(requireAccess = false, options = {}) {
    if (pendingWrite) throw new Error('A save is already in progress. Wait for it to finish.');
    const key = dataKey(), previous = committed.has(key) ? committed.get(key) : null;
    let context = App.context();
    const draft = DB;
    const guard = () => {
      App.assertWriter();
      if (dataKey() !== key || App.context().epoch !== context.epoch) throw new Error('The counter changed before the save completed.');
      if (requireAccess && (!App.contextValid(context) || !App.me() || App.me().active === false || (App.auth.gateOn() && !App.auth.currentAccount()))) throw new Error('The counter changed or locked before the save completed.');
    };
    try {
      guard();
      if(App.units)App.units.guard(previous,DB,options.restoring);
      if(App.captureCashMovements)App.captureCashMovements();
      if(App.captureStockHistory)App.captureStockHistory(previous?JSON.parse(previous):null,options);
      const raw = JSON.stringify(App.validateData(DB));
      // Expose only the committed book while the repository is awaiting I/O.
      DB = previous ? JSON.parse(previous) : blank();
      context = App.context();
      pendingWrite = true; App.emit('saving', true);
      await App.storage.commit({key, expected:previous, value:raw, guard});
      committed.set(key, raw);
      restore(draft, JSON.parse(raw));
      DB = draft;
    } catch (e) {
      if (previous) restore(draft, JSON.parse(previous));
      else restore(draft, blank());
      DB = draft;
      throw e;
    } finally {
      pendingWrite = false; App.emit('saving', false);
    }
  }
  async function save(opts) {
    App.requireAccess();
    await persist(true,opts); // Success UI is permitted only after durable completion.
    if (opts && opts.sync !== false) queueSync(opts.op);
    if (!opts || opts.render !== false) App.emit('change');
  }
  App.save = save;
  App.persistNow = persist;
  App.restoreBackup = async (data) => {
    App.requirePermission('settings');
    App.auth.requireFresh();
    const valid = App.backups.businessData(data);
    if (data.storageVersion === 3) valid.settings.restoredCheckpoint = {...data.provenance};
    // A business backup never grants access or redirects payments.
    valid.staff = JSON.parse(JSON.stringify(DB.staff));
    if(valid.storeAccessVersion===1||DB.storeAccessVersion===1){
      valid.storeAccessVersion=1;
      valid.staff.forEach(s=>{s.storeIds=(s.storeIds || (s.role==='owner'?DB.stores.map(s=>s.id):[DB.settings.activeStore])).filter(id=>valid.stores.some(st=>st.id===id));});
    }
    for(const store of valid.stores)if(store.receiptProfile)store.receiptProfile.upiId=DB.stores.find(s=>s.id===store.id)?.receiptProfile?.upiId ?? DB.settings.upiId;
    valid.session = { staffId: DB.session.staffId };
    for (const key of ['pin', 'pinOn', 'upiId']) valid.settings[key] = DB.settings[key];
    // Keep the prior snapshot for recovery, before replacing the live key.
    const context = App.context();
    const previous = await App.storage.read(dataKey());
    if (previous) await App.storage.write(dataKey() + '.before-restore', previous);
    App.assertContext(context); App.auth.requireFresh();
    restore(DB, valid);
    (await save({ sync: false, restoring: true }));
    App.invalidateContext();
    if (App.posClear) App.posClear();
  };

  /* ───────── tiny event bus ───────── */
  const subs = {};
  App.on = (ev, fn) => { (subs[ev] = subs[ev] || []).push(fn); };
  App.emit = (ev, d) => { (subs[ev] || []).forEach((f) => { try { f(d); } catch (e) { console.error(e); } }); };

  /* This release stores data on this device only. No upload is simulated. */
  let queue = [];
  async function loadQueue() {
    try { queue = JSON.parse(await App.storage.read(queueKey()) || '[]'); } catch (e) { queue = []; }
  }
  function queueSync() { App.emit('net'); }
  App.sync = { pending: () => queue.length, draining: () => false, drain: () => {}, push: null };
  w.addEventListener('online', () => App.emit('net'));
  w.addEventListener('offline', () => App.emit('net'));

  /* ───────── scoped selectors ───────── */
  const S = () => DB.settings.activeStore;
  const mine = (arr) => arr.filter((x) => x.storeId === S());
  App.S = S;
  App.items = () => mine(DB.items).filter((i) => !i.deleted);
  App.customers = () => mine(DB.customers).filter((c) => !c.deleted);
  App.suppliers = () => mine(DB.suppliers).filter((s) => !s.deleted);
  App.bills = () => mine(DB.bills);
  App.liveBills = () => mine(DB.bills).filter((b) => !b.void);
  App.payments = () => mine(DB.payments);
  App.purchases = () => mine(DB.purchases);
  App.item = (id) => App.items().find((i) => i.id === id);
  App.customer = (id) => App.customers().find((c) => c.id === id);
  App.supplier = (id) => App.suppliers().find((s) => s.id === id);
  App.staff = (id) => DB.staff.find((s) => s.id === id);
  App.me = () => App.staff(DB.session.staffId);
  App.isOwner = () => (App.me() || {}).role === 'owner';
  App.can = (what) => {
    try { App.requireAccess(); } catch (e) { return false; }
    const r = (App.me() || {}).role;
    if (r === 'owner') return true;
    if (r !== 'cashier') return false;
    return ['bill', 'view_inventory', 'restock', 'view_customers', 'take_payment'].indexOf(what) > -1;
  };

  /* ───────── stock helpers (FIFO across batches) ───────── */
  function itemStock(it) {
    if (it.batches && it.batches.length) return App.domain.quantity(it.batches.reduce((s, b) => s + (+b.qty || 0), 0));
    return +it.stock || 0;
  }
  App.sellableStock = (it) => it.batches && it.batches.length ? App.domain.quantity(it.batches.filter((b) => !b.quarantined&&(!b.expiry || b.expiry >= dayKey(Date.now()))).reduce((n, b) => n + b.qty, 0)) : itemStock(it);
  function takeStock(it, qty) {
    if(App.units)App.units.assertQuantity(it,qty);
    App.number(qty, 'Quantity', 0.0001); App.domain.quantityUnits(qty);
    if (qty > App.sellableStock(it)) throw new Error('Insufficient stock for ' + it.name);
    const allocations = [];
    if (it.batches && it.batches.length) {
      let need = qty;
      it.batches.sort((a, b) => (a.expiry || '9999').localeCompare(b.expiry || '9999') || (a.at || 0) - (b.at || 0));
      for (const b of it.batches) {
        if (b.quarantined||(b.expiry && b.expiry < dayKey(Date.now()))) continue;
        if (need <= 0) break;
        const used = Math.min(b.qty, need);
        allocations.push({ ...b, qty: used });
        b.qty = App.domain.quantity(b.qty - used); need = App.domain.quantity(need - used);
      }
      it.batches = it.batches.filter((b) => b.qty > 0);
      it.stock = App.domain.quantity(it.batches.reduce((sum, b) => sum + b.qty, 0));
    } else {
      allocations.push({ id: uid('b'), qty, expiry: '', cost: it.cost, at: Date.now() });
      it.stock = App.domain.quantity(it.stock - qty);
    }
    return allocations;
  }
  function giveStock(it, qty, expiry, cost, original) {
    App.number(qty, 'Quantity', 0.0001); App.domain.quantityUnits(qty);
    cost = cost == null ? it.cost : App.number(cost, 'Cost');
    if (expiry || (it.batches && it.batches.length) || original) {
      if (!it.batches || !it.batches.length) {
        it.batches = [];
        if (it.stock > 0) it.batches.push({ id: uid('b'), qty: it.stock, expiry: '', cost: it.cost, at: Date.now() });
      }
      const ex = it.batches.find((b) => original ? b.id === original.id : !b.quarantined&&b.expiry === (expiry || '') && b.cost === cost);
      if (ex) ex.qty = App.domain.quantity(ex.qty + qty);
      else it.batches.push({ id: uid('b'), at: Date.now(), ...original, qty: App.domain.quantity(qty), expiry: expiry || '', cost });
      it.stock = App.domain.quantity(it.batches.reduce((sum, b) => sum + b.qty, 0));
    } else it.stock = App.domain.quantity(it.stock + qty);
  }
  App.itemStock = itemStock; App.takeStock = takeStock; App.giveStock = giveStock;
  App.stockState = (it) => {
    const s = itemStock(it), th = it.threshold != null ? it.threshold : DB.settings.lowStock;
    return s <= 0 ? 'out' : s <= th ? 'low' : 'ok';
  };
  App.expiringBatches = (days) => {
    const lim = Date.now() + (days || DB.settings.expiryWarnDays) * DAY;
    const out = [];
    App.items().forEach((it) => (it.batches || []).forEach((b) => {
      if (b.expiry && b.qty > 0) {
        const t = new Date(b.expiry + 'T23:59:59').getTime();
        if (t <= lim) out.push({ item: it, batch: b, at: t, days: daysBetween(Date.now(), t) });
      }
    }));
    return out.sort((a, b) => a.at - b.at);
  };

  /* ───────── activity log ───────── */
  function log(type, text, meta) {
    DB.activity.unshift({ id: uid('a'), type, text, meta: meta || null, staffId: DB.session.staffId, storeId: S(), at: Date.now() });
    if (DB.activity.length > 800) DB.activity.length = 800;
  }
  App.log = log;
  App.activity = () => mine(DB.activity);

  /* ───────── money-movement actions ───────── */
  App.cartTotals = (cart) => {
    const st = DB.settings, cust = App.customer(cart.customerId);
    return App.domain.sale({
      lines: cart.lines.map(l => {
        const it=App.item(l.itemId);
        return {...l, gst:st.gstEnabled ? (it && it.gst != null ? it.gst : st.defaultGst) : 0};
      }),
      discount:cart.discount || 0, redeem:cart.redeem || 0,
      points:cust ? cust.points || 0 : 0, loyaltyValue:st.loyaltyValue
    });
  };
  function command(kind, corrects = null, id='cmd_' + w.crypto.randomUUID().replace(/-/g,'')) {
    return App.domain.command({id,
      accountId:App.accountId, actorId:DB.session.staffId, storeId:S(), kind, at:Date.now(), corrects});
  }
  // Drafts share the same atomic book commit as the sale that consumes them.
  const draftCart = cart => ({storeId:cart.storeId || S(),lines:JSON.parse(JSON.stringify(cart.lines || [])),discount:cart.discount || 0,mode:cart.mode || 'cash',customerId:cart.customerId || '',note:cart.note || '',redeem:cart.redeem || 0});
  const draftScope = () => {
    let device=localStorage.getItem('dukaanos.draft-device');
    if(!device){device=uid('device');localStorage.setItem('dukaanos.draft-device',device);}
    return {accountId:App.accountId,storeId:S(),staffId:DB.session.staffId,deviceId:device};
  };
  const sameScope = (a,b) => a&&b&&['accountId','storeId','staffId','deviceId'].every(k=>a[k]===b[k]);
  App.selectionVersion = it => JSON.stringify([it.price,it.unit || 'unit',DB.settings.gstEnabled,it.gst ?? DB.settings.defaultGst,...(it.quantitySpec?[it.quantitySpec]:[])]);
  App.returnableLines = bill => bill.lines.map((line,index)=>({lineId:line.lineId || String(index),qty:bill.void?0:line.qty}));
  App.drafts = {
    scope:draftScope,
    reassign(raw,from,to){const data=App.validateData(JSON.parse(raw));if(!data.drafts?.length)return raw;for(const draft of data.drafts)if(draft.accountId===from)draft.accountId=to;return JSON.stringify(App.validateData(data));},
    current(){App.requirePermission('bill');const scope=draftScope();return (DB.drafts || []).find(d=>sameScope(d,scope));},
    async save(cart){
      App.requirePermission('bill');const scope=draftScope(),payload=draftCart(cart);
      if(payload.storeId!==scope.storeId)throw new Error('Draft belongs to another store.');
      App.checkDataBounds(payload);
      let prior=(DB.drafts || []).find(d=>sameScope(d,scope));
      if(prior&&JSON.stringify(prior.cart)===JSON.stringify(payload))return JSON.parse(JSON.stringify(prior));
      if(!prior&&!payload.lines.length)return null;
      const record=payload.lines.length?{...scope,id:prior?prior.id:uid('draft'),version:1,revision:(prior?.revision || 0)+1,at:Date.now(),cart:payload}:null;
      DB.drafts=(DB.drafts || []).filter(d=>!sameScope(d,scope));if(record)DB.drafts.push(record);
      await save({sync:false,render:false});return record&&JSON.parse(JSON.stringify(record));
    }
  };
  function customerOpening(c){
    if(c.ledger)return;
    DB.customerLedgerVersion=1;
    c.ledger=[{id:uid('opening'),kind:'opening',delta:round2(c.balance || 0),at:Date.now(),storeId:c.storeId,staffId:DB.session.staffId,note:'Legacy balance checkpoint; earlier history is not reconstructed',source:'legacy-checkpoint'}];
  }
  function customerEntry(c,entry){
    customerOpening(c);c.ledger.push(entry);
    c.balance=c.ledger.reduce((total,e)=>total+Math.round(e.delta*100),0)/100;
    if(c.balance<=0)c.dueSince=null;else if(!c.dueSince)c.dueSince=entry.at;
  }
  App.postCustomerMovement=(c,entry)=>{App.requirePermission('void_bill');customerEntry(c,entry);};
  function supplierEntry(s,entry){
    if(!s.ledger){DB.supplierLedgerVersion=1;s.ledger=[{id:uid('supplier_opening'),kind:'opening',delta:round2(s.balance || 0),at:Date.now(),storeId:s.storeId,staffId:DB.session.staffId,note:'Legacy supplier balance checkpoint'}];}
    s.ledger.push(entry);s.balance=s.ledger.reduce((n,e)=>n+Math.round(e.delta*100),0)/100;
    if(s.balance<=0)s.dueSince=null;else if(!s.dueSince)s.dueSince=entry.at;
  }
  App.postSupplierMovement=(s,entry)=>{App.requirePermission('purchase');supplierEntry(s,entry);};
  App.supplierStatement=id=>{const s=App.supplier(id);if(!s)throw new Error('Supplier not found.');let balance=0;const entries=(s.ledger || [{id:'legacy_supplier_checkpoint',kind:'opening',delta:s.balance || 0,at:s.at || Date.now(),note:'Unconverted supplier balance checkpoint'}]).map(e=>{balance=round2(balance+e.delta);return {...e,balance};});return {supplierId:id,balance,entries};};
  App.purchasePaid=po=>round2(po.paid+DB.supplierPayments.filter(p=>p.purchaseId===po.id&&p.storeId===po.storeId).reduce((n,p)=>n+p.amount,0));
  App.purchaseLineValues=lines=>{
    const total=round2(lines.reduce((n,l)=>n+l.qty*l.cost,0));App.number(total,'Purchase total');
    const cents=lines.map(l=>Math.round(round2(l.qty*l.cost)*100));let residue=Math.round(total*100)-cents.reduce((n,v)=>n+v,0);
    if(residue>0)cents[cents.length-1]+=residue;
    else for(let i=cents.length-1;i>=0&&residue<0;i--){const take=Math.min(cents[i],-residue);cents[i]-=take;residue+=take;}
    return cents.map(n=>n/100);
  };
  App.customerStatement = id => {
    const c=App.customer(id);if(!c)throw new Error('Customer not found.');
    let balance=0;
    const entries=(c.ledger || [{id:'legacy_checkpoint',kind:'opening',delta:c.balance || 0,at:c.at || Date.now(),note:'Unconverted legacy balance checkpoint',source:'legacy-checkpoint'}]).map(e=>{balance=round2(balance+e.delta);return {...e,balance};});
    return {customerId:id,balance,entries};
  };
  function moneyRequest(kind,customerId,amount,mode,note,options={}){
    const id=options.operationId || uid('cmd');
    const operation=App.domain.command({id,accountId:App.accountId,actorId:DB.session.staffId,storeId:S(),kind,at:options.at ?? Date.now()});
    const request={kind,customerId,amount,mode:mode || '',note:note || '',billId:options.billId || '',at:options.at ?? null};
    const previous=DB.customers.flatMap(c=>c.ledger || []).find(e=>e.id===id);
    if(previous&&(previous.storeId!==S()||JSON.stringify(previous.request)!==JSON.stringify(request)))throw new Error('Operation ID was already used for different customer entry contents.');
    return {operation,request,previous};
  }
  App.actions = {
    /* Commit a cart into a bill. Deducts stock, moves credit, awards loyalty. */
    async checkout(cart) {
      App.requirePermission('bill');
      if (cart.storeId && cart.storeId !== S()) throw new Error('The cart belongs to a different store. Clear it and try again.');
      let draft;
      if(cart.draftId){
        const scope=draftScope(),prior=DB.bills.find(b=>b.draftId===cart.draftId);
        if(prior){
          if(!sameScope(prior.draftScope,scope)||JSON.stringify(prior.draftSubmission)!==JSON.stringify(draftCart(cart)))throw new Error('Finalized draft differs from this request.');
          return App.domain.snapshot(prior);
        }
        draft=(DB.drafts || []).find(d=>d.id===cart.draftId&&sameScope(d,scope));
        if(!draft||JSON.stringify(draft.cart)!==JSON.stringify(draftCart(cart)))throw new Error('Draft changed. Save and review it before checkout.');
      }
      if (!cart.lines || !cart.lines.length) throw new Error('The cart is empty.');
      if (cart.storeId && cart.storeId !== S()) throw new Error('The cart belongs to a different store. Clear it and try again.');
      if (!['cash', 'upi', 'card', 'credit'].includes(cart.mode || 'cash')) throw new Error('Invalid payment mode.');
      App.number(cart.discount || 0, 'Discount'); App.number(cart.redeem || 0, 'Redemption');
      const quantities = new Map();
      cart.lines.forEach((l) => {
        const it = App.item(l.itemId);
        if (!it) throw new Error('An item was removed or belongs to another store. Update the cart.');
        App.units.assertQuantity(it,l.qty);
        App.number(l.qty, 'Quantity', 0.0001); App.domain.quantityUnits(l.qty); App.number(l.price, 'Price');
        if (l.price !== it.price) throw new Error(it.name + ' has a new price. Remove it and add it again.');
        if(l.selectionVersion&&l.selectionVersion!==App.selectionVersion(it))throw new Error(it.name+' has changed price, tax or units. Remove it and add it again.');
        quantities.set(it.id, App.domain.quantity((quantities.get(it.id) || 0) + l.qty));
        if (quantities.get(it.id) > App.sellableStock(it)) throw new Error('Insufficient stock for ' + it.name + '. Update the cart.');
      });
      const st = DB.settings, cust = cart.customerId ? App.customer(cart.customerId) : null;
      const credit = cart.mode === 'credit';
      if ((cart.customerId || credit || cart.redeem) && !cust) throw new Error('Select a valid customer.');
      const T = App.cartTotals(cart);
      if (round2(cart.redeem || 0) !== T.redeem) throw new Error('Available loyalty points changed. Review the redemption.');
      const { sub, tax, total } = T, disc = round2(T.disc + T.redeem);
      const lines = cart.lines.map((l, index) => {
        const it = App.item(l.itemId);
        return { lineId:uid('line'),itemId: it.id, name: it.name, emoji: it.emoji || '', unit:it.unit || 'unit', ...(it.quantitySpec?{quantitySpec:JSON.parse(JSON.stringify(it.quantitySpec))}:{}), qty: l.qty, price: l.price, cost: it.cost,
          gross: round2(l.price * l.qty), ...T.taxes[index] };
      });

      const operation = command('sale');
      const bill = {
        calculationVersion: App.domain.CALCULATION_VERSION, command: {...operation},
        id: uid('bl'), no: DB.counter.bill++, storeId: S(),
        customerId: cust ? cust.id : '', customerName: cust ? cust.name : (cart.customerName || 'Walk-in'),
        lines, sub, discount: disc, tax, total,
        paid: credit ? 0 : total, mode: cart.mode || 'cash', credit,
        note: cart.note || '', staffId: DB.session.staffId, at: operation.at, void: false,
        loyalty: 0, redeemed: T.redeem, redeemedPoints: round2(T.redeem / st.loyaltyValue)
      };
      const receiptSettings=App.storeSettings?App.storeSettings():st;
      bill.receiptSettings=Object.fromEntries(['shopName','shopPhone','address','gstin','currency','receiptTheme','upiId'].map(k=>[k,receiptSettings[k]]));
      bill.loyaltyPolicy={rate:st.loyaltyRate,value:st.loyaltyValue};
      bill.customerPhone=cust?.phone || '';
      if(draft){bill.draftId=draft.id;bill.draftScope=draftScope();bill.draftSubmission=draftCart(cart);DB.drafts=DB.drafts.filter(d=>d.id!==draft.id);}

      lines.forEach((l) => {
        l.allocations = takeStock(App.item(l.itemId), l.qty);
        l.cost = l.allocations.reduce((n, b) => n + b.cost * b.qty, 0) / l.qty;
      });

      if (cust) {
        if (credit) customerEntry(cust,{id:operation.id,kind:'sale',delta:total,at:operation.at,storeId:S(),staffId:DB.session.staffId,billId:bill.id,note:'Credit sale'});
        cust.spend = round2((cust.spend || 0) + total);
        cust.visits = (cust.visits || 0) + 1;
        cust.lastAt = Date.now();
        if (!cust.firstAt) cust.firstAt = Date.now();
        if (credit && !cust.dueSince) cust.dueSince = Date.now();
        const pts = Math.floor(total / (st.loyaltyRate || 100));
        cust.points = round2((cust.points || 0) - bill.redeemedPoints + pts);
        bill.loyalty = pts;
      }

      DB.bills.unshift(bill);
      log('bill', `Bill #${bill.no} · ${money(total)} · ${bill.customerName}`, { billId: bill.id });
      (await save({ op: 'bill' }));
      return bill;
    },

    async voidBill(id, reason) {
      App.requirePermission('void_bill');
      const b = App.bills().find((x) => x.id === id);
      if (!b || b.void) return null;
      if((DB.returns || []).some(r=>r.billId===id))throw new Error('This sale already has returns. Return the remaining items instead of voiding it.');
      const correction = command('void_sale', b.command ? b.command.id : b.id);
      b.voidCommand = {...correction};
      b.void = true; b.voidAt = correction.at; b.voidReason = reason || '';
      b.lines.forEach((l) => {
        const it = DB.items.find((x) => x.id === l.itemId && (!x.storeId || x.storeId === S()));
        if (!it) return;
        if (l.allocations) l.allocations.forEach((batch) => giveStock(it, batch.qty, batch.expiry, batch.cost, batch));
        else { giveStock(it, l.qty, '', l.cost); b.legacyStockRestore = true; }
      });
      const c = b.customerId && DB.customers.find((x) => x.id === b.customerId && (!x.storeId || x.storeId === S()));
      if (c) {
        if (b.credit) { customerEntry(c,{id:correction.id,kind:'void',delta:-b.total,at:correction.at,storeId:S(),staffId:DB.session.staffId,billId:b.id,note:reason || 'Sale void'});if (c.balance !== 0) c.deleted = false; }
        c.spend = round2((c.spend || 0) - b.total);
        c.visits = Math.max(0, (c.visits || 1) - 1);
        c.points = round2((c.points || 0) - (b.loyalty || 0) + (b.redeemedPoints != null ? b.redeemedPoints : (b.redeemed || 0) / DB.settings.loyaltyValue));
        if (c.balance <= 0) c.dueSince = null; // Negative balance is credit owed to this customer.
      }
      log('void', `Cancelled bill #${b.no} · ${money(b.total)}`, { billId: b.id });
      (await save({ op: 'void' }));
      return b;
    },

    async takePayment(customerId, amount, mode, note, options={}) {
      App.requirePermission('take_payment');
      const c = App.customer(customerId); if (!c) throw new Error('Customer not found.');
      if (!['cash', 'upi', 'card'].includes(mode || 'cash')) throw new Error('Invalid payment mode.');
      const amt = round2(App.number(amount, 'Payment', 0.01));
      const {operation,request,previous}=moneyRequest('collection',customerId,amt,mode || 'cash',note,options);
      if(previous)return DB.payments.find(p=>p.id===previous.paymentId);
      if (amt > Math.max(0, c.balance || 0)) throw new Error('Payment exceeds the outstanding balance.');
      if(options.billId){
        const bill=App.bills().find(b=>b.id===options.billId&&b.customerId===customerId&&b.credit&&!b.void);
        if(!bill)throw new Error('Collection link is not a live credit bill for this customer/store.');
        const linked=DB.payments.filter(p=>p.billId===bill.id).reduce((s,p)=>s+p.amount,0);
        if(amt>round2(bill.total-linked))throw new Error('Collection exceeds the linked bill remainder.');
      }
      const p = { id: uid('pm'), storeId: S(), customerId, amount: amt, mode: mode || 'cash', note: note || '', staffId: DB.session.staffId, at: Date.now() };
      p.billId=options.billId || '';p.command={...operation};p.kind='collection';
      DB.payments.unshift(p);
      customerEntry(c,{id:operation.id,kind:'collection',delta:-amt,at:p.at,storeId:S(),staffId:DB.session.staffId,paymentId:p.id,billId:p.billId,mode:p.mode,note:p.note,request});
      if (c.balance <= 0) c.dueSince = null;
      log('payment', `${c.name} paid ${money(amt)}`, { customerId });
      (await save({ op: 'payment' }));
      return p;
    },
    async openingBalance(customerId,amount,at,note,options={}){
      App.requirePermission('settings');const c=App.customer(customerId);if(!c)throw new Error('Customer not found.');
      const value=round2(App.number(amount,'Opening balance',-1e9));
      if(!Number.isSafeInteger(at)||at<0||at>Date.now())throw new Error('Choose a valid opening date, no later than today.');
      const {operation,request,previous}=moneyRequest('opening',customerId,value,'',note,{...options,at});if(previous)return previous;
      if(c.ledger||(c.balance || 0)!==0||App.bills().some(b=>b.customerId===customerId)||App.payments().some(p=>p.customerId===customerId))throw new Error('This customer already has history. Add a correction instead.');
      const entry={id:operation.id,kind:'opening',delta:value,at,storeId:S(),staffId:DB.session.staffId,note:note || 'Opening balance',source:'explicit-opening',request};
      DB.customerLedgerVersion=1;c.ledger=[entry];c.balance=value;if(value>0)c.dueSince=at;await save({op:'customer_opening'});return entry;
    },
    async customerCredit(customerId,amount,mode,note,options={}){
      App.requirePermission('take_payment');const c=App.customer(customerId);if(!c)throw new Error('Customer not found.');
      const amt=round2(App.number(amount,'Advance',0.01));if(!['cash','upi','card'].includes(mode))throw new Error('Invalid payment mode.');
      const {operation,request,previous}=moneyRequest('advance',customerId,amt,mode,note,options);if(previous)return previous;
      const p={id:uid('pm'),kind:'advance',command:{...operation},storeId:S(),customerId,amount:amt,mode,note:note || '',staffId:DB.session.staffId,at:operation.at};DB.payments.unshift(p);
      const entry={id:operation.id,kind:'advance',delta:-amt,at:p.at,storeId:S(),staffId:DB.session.staffId,paymentId:p.id,mode,note:p.note,request};customerEntry(c,entry);await save({op:'customer_advance'});return entry;
    },
    async correctCustomerBalance(customerId,amount,note,options={}){
      App.requirePermission('settings');const c=App.customer(customerId);if(!c)throw new Error('Customer not found.');
      const delta=round2(App.number(amount,'Correction',-1e9));if(!delta||typeof note!=='string'||note.trim().length<3)throw new Error('Provide a nonzero correction and a reason.');
      const {operation,request,previous}=moneyRequest('correction',customerId,delta,'',note,options);if(previous)return previous;
      const entry={id:operation.id,kind:'correction',delta,at:operation.at,storeId:S(),staffId:DB.session.staffId,note,request};customerEntry(c,entry);await save({op:'customer_correction'});return entry;
    },

    async recordPurchase(supplierId, lines, paidNow, note, mode = 'cash', options={}) {
      App.requirePermission('purchase');
      const request={supplierId,lines:JSON.parse(JSON.stringify(lines)),paidNow:paidNow ?? 0,note:note || '',mode};App.checkDataBounds(request);
      const prior=options.operationId&&DB.purchases.find(p=>p.command?.id===options.operationId);
      if(prior){if(prior.storeId!==S()||JSON.stringify(prior.request)!==JSON.stringify(request))throw new Error('Purchase operation ID was reused with different contents.');return prior;}
      if (!['cash', 'upi', 'card'].includes(mode)) throw new Error('Invalid payment mode.');
      if (!lines.length) throw new Error('Add purchase items first.');
      lines.forEach((l) => {
        if (!App.item(l.itemId)) throw new Error('Purchase item not found in this store.');
        App.number(l.qty, 'Quantity', 0.0001); App.domain.quantityUnits(l.qty); App.number(l.cost, 'Purchase cost');
      });
      App.number(paidNow ?? 0, 'Paid now');
      const sup = App.supplier(supplierId);
      if (!sup) throw new Error('Supplier not found.');
      const total = round2(lines.reduce((s, l) => s + l.qty * l.cost, 0));
      const lineValues=App.purchaseLineValues(lines);
      if ((paidNow || 0) > total) throw new Error('Paid now exceeds the purchase total.');
      const paid = round2(clamp(paidNow || 0, 0, total));
      const operation=command('purchase',null,options.operationId);
      const po = {
        command:{...operation},request,calculationVersion:'purchase-allocation-v1',
        id: uid('po'), no: DB.counter.po++, storeId: S(), supplierId,
        supplierName: sup.name, lines: JSON.parse(JSON.stringify(lines)), total, paid, mode, note: note || '',
        staffId: DB.session.staffId, at: Date.now()
      };
      po.lines.forEach((l,index) => {
        l.lineId=uid('purchase_line');l.batchId=uid('purchase_batch');l.value=lineValues[index];
        const it = App.item(l.itemId);
        if (it) { l.name=App.itemName(it);giveStock(it, l.qty, l.expiry || '', l.cost,{id:l.batchId,purchaseId:po.id,purchaseLineId:l.lineId});it.cost = l.cost; it.lastBuyAt = Date.now(); }
      });
      DB.purchases.unshift(po);
      if (sup) {
        supplierEntry(sup,{id:operation.id,kind:'purchase',delta:total,at:po.at,storeId:S(),staffId:DB.session.staffId,purchaseId:po.id,note:'Purchase received'});
        if(paid)supplierEntry(sup,{id:uid('initial_payment'),kind:'initial_payment',delta:-paid,at:po.at,storeId:S(),staffId:DB.session.staffId,purchaseId:po.id,mode,note:'Paid on receipt'});
        sup.lastAt = Date.now();
        if (sup.balance > 0 && !sup.dueSince) sup.dueSince = Date.now();
      }
      log('purchase', `Stock in from ${po.supplierName} · ${money(total)}`, { poId: po.id });
      (await save({ op: 'purchase' }));
      return po;
    },

    async paySupplier(supplierId, amount, mode, options={}) {
      App.requirePermission('pay_supplier');
      const s = App.supplier(supplierId); if (!s) throw new Error('Supplier not found.');
      if (!['cash', 'upi', 'card'].includes(mode || 'cash')) throw new Error('Invalid payment mode.');
      const amt = round2(App.number(amount, 'Payment', 0.01));
      const request={supplierId,amount:amt,mode:mode || 'cash',purchaseId:options.purchaseId || ''},prior=options.operationId&&DB.supplierPayments.find(p=>p.command?.id===options.operationId);
      if(prior){if(prior.storeId!==S()||JSON.stringify(prior.request)!==JSON.stringify(request))throw new Error('Supplier payment ID was reused with different contents.');return true;}
      if (amt > Math.max(0, s.balance || 0)) throw new Error('Payment exceeds the outstanding balance.');
      if(options.purchaseId){const po=App.purchases().find(p=>p.id===options.purchaseId&&p.supplierId===supplierId&&!p.cancelled);if(!po||amt>round2(po.total-App.purchasePaid(po)))throw new Error('Supplier payment link is invalid or exceeds the purchase remainder.');}
      const operation=command('supplier_payment',null,options.operationId),payment={id:uid('sp'),command:{...operation},request,purchaseId:options.purchaseId || '',storeId:S(),supplierId,amount:amt,mode:mode || 'cash',staffId:DB.session.staffId,at:operation.at};DB.supplierPayments.unshift(payment);
      supplierEntry(s,{id:operation.id,kind:'payment',delta:-amt,at:operation.at,storeId:S(),staffId:DB.session.staffId,paymentId:payment.id,mode:payment.mode,note:'Supplier payment'});
      if (s.balance <= 0) s.dueSince = null;
      log('spay', `Paid ${s.name} ${money(amt)}`, { supplierId });
      (await save({ op: 'spay' }));
      return true;
    },

    async restock(itemId, qty, expiry, cost) {
      App.requirePermission('restock');
      const it = App.item(itemId); if (!it) throw new Error('Item not found.');
      App.number(qty, 'Quantity', 0.0001);
      if (cost != null) App.number(cost, 'Cost');
      if (!App.isOwner() && cost != null && cost !== it.cost) throw new Error('Only an owner can change item cost.');
      giveStock(it, +qty, expiry || '', cost);
      if (cost != null) it.cost = cost;
      log('restock', `${it.name} +${qty}`, { itemId });
      (await save({ op: 'restock' }));
    }
  };

  /* ───────── analytics ───────── */
  App.gstBreakdown = (bills, returns=[]) => {
    const rows = Object.create(null);
    bills.forEach((b) => {
      const bases = b.lines.map((l) => l.taxable != null ? l.taxable : round2(l.gross * (b.sub ? (b.sub - b.discount) / b.sub : 0)));
      const weights = bases.map((base, i) => base * (b.lines[i].gst || 0) / 100);
      const sum = weights.reduce((n, x) => n + x, 0);
      let allocated = 0;
      b.lines.forEach((l, i) => {
        const rate = b.tax ? l.gst || 0 : 0;
        const row = rows[rate] = rows[rate] || { taxable: 0, tax: 0 };
        let tax = l.tax != null ? l.tax : (sum ? round2(b.tax * weights[i] / sum) : 0);
        if (l.tax == null && i === b.lines.length - 1) tax = round2((b.tax || 0) - allocated);
        allocated = round2(allocated + tax);
        row.taxable = round2(row.taxable + bases[i]); row.tax = round2(row.tax + tax);
      });
    });
    returns.forEach(r=>r.lines.forEach(l=>{const row=rows[l.gst || 0]=rows[l.gst || 0] || {taxable:0,tax:0};row.taxable=round2(row.taxable-l.taxable);row.tax=round2(row.tax-l.tax);}));
    return rows;
  };
  App.stats = {
    range(fromTs, toTs) {
      const bs = App.liveBills().filter((b) => b.at >= fromTs && b.at < toTs);
      const returns=mine(DB.returns || []).filter(r=>r.at>=fromTs&&r.at<toTs),returned=round2(returns.reduce((n,r)=>n+r.amount,0)),returnedTax=round2(returns.reduce((n,r)=>n+r.tax,0));
      const sales = round2(bs.reduce((s, b) => s + b.total, 0)-returned);
      const cost = round2(bs.reduce((s, b) => s + b.lines.reduce((x, l) => x + (l.cost || 0) * l.qty, 0), 0)-returns.reduce((n,r)=>n+r.lines.reduce((v,l)=>v+l.cost*l.qty,0),0));
      const credit = round2(bs.filter((b) => b.credit).reduce((s, b) => s + b.total, 0)-returns.filter(r=>r.originalCredit).reduce((n,r)=>n+r.amount,0));
      const items = bs.reduce((s, b) => s + b.lines.reduce((x, l) => x + l.qty, 0), 0)-returns.reduce((n,r)=>n+r.lines.reduce((v,l)=>v+l.qty,0),0);
      return { bills: bs, returns,returned,count: bs.length, sales, cost, profit: round2(sales - bs.reduce((n, b) => n + (b.tax || 0), 0)+returnedTax - cost), credit, items, avg: bs.length ? round2(sales / bs.length) : 0 };
    },
    today() { const s = startOfDay(Date.now()).getTime(); return this.range(s, s + DAY); },
    days(n) { const s = startOfDay(Date.now() - (n - 1) * DAY).getTime(); return this.range(s, Date.now() + 1); },
    month() { const d = new Date(); return this.range(new Date(d.getFullYear(), d.getMonth(), 1).getTime(), Date.now() + 1); },
    series(n) {
      const out = [];
      for (let i = n - 1; i >= 0; i--) {
        const s = startOfDay(Date.now() - i * DAY).getTime();
        const r = this.range(s, s + DAY);
        out.push({ t: s, label: new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), dow: new Date(s).toLocaleDateString('en-IN', { weekday: 'short' }), value: r.sales, count: r.count, profit: r.profit });
      }
      return out;
    },
    topItems(n, days, fromTs, toTs) {
      const from = fromTs != null ? fromTs : days ? startOfDay(Date.now() - (days - 1) * DAY).getTime() : 0;
      const to = toTs != null ? toTs : Date.now() + 1;
      const m = Object.create(null);
      App.liveBills().filter((b) => b.at >= from && b.at < to).forEach((b) => b.lines.forEach((l) => {
        const k = l.itemId || l.name;
        m[k] = m[k] || { id: l.itemId, name: l.name, emoji: l.emoji, qty: 0, amt: 0 };
        m[k].qty += l.qty; m[k].amt = round2(m[k].amt + l.gross);
      }));
      mine(DB.returns || []).filter(r=>r.at>=from&&r.at<to).forEach(r=>r.lines.forEach(l=>{const k=l.itemId;m[k]=m[k] || {id:l.itemId,name:l.name,qty:0,amt:0};m[k].qty=App.domain.quantity(m[k].qty-l.qty);m[k].amt=round2(m[k].amt-l.gross);}));
      return Object.values(m).sort((a, b) => b.qty - a.qty).slice(0, n || 5);
    },
    dues() {
      return App.customers().filter((c) => (c.balance || 0) > 0.5)
        .map((c) => ({ c, days: c.dueSince ? daysBetween(c.dueSince, Date.now()) : 0 }))
        .sort((a, b) => b.c.balance - a.c.balance);
    },
    totalDue() { return round2(App.customers().reduce((s, c) => s + Math.max(0, c.balance || 0), 0)); },
    totalOwed() { return round2(App.suppliers().reduce((s, x) => s + (x.balance || 0), 0)); },
    stockValue() { return round2(App.items().reduce((s, i) => s + (i.batches && i.batches.length ? i.batches.reduce((n, b) => n + b.qty * b.cost, 0) : itemStock(i) * (i.cost || 0)), 0)); },
    /* velocity = units sold per day over the window */
    velocity(itemId, days) {
      days = days || 21;
      const from = startOfDay(Date.now() - (days - 1) * DAY).getTime();
      let q = 0;
      App.liveBills().filter((b) => b.at >= from).forEach((b) => b.lines.forEach((l) => { if (l.itemId === itemId) q += l.qty; }));
      mine(DB.returns || []).filter(r=>r.at>=from).forEach(r=>r.lines.forEach(l=>{if(l.itemId===itemId)q-=l.qty;}));
      return q / days;
    },
    cashExpected(dayTs) {
      if(DB.cashVersion===1)return App.cashDaySummary(dayTs);
      const s = startOfDay(dayTs || Date.now()).getTime(), e = s + DAY;
      const billCash = App.liveBills().filter((b) => b.at >= s && b.at < e && b.mode === 'cash').reduce((x, b) => x + b.total, 0);
      const payCash = App.payments().filter((p) => p.at >= s && p.at < e && p.mode === 'cash').reduce((x, p) => x + p.amount, 0);
      const purchaseCash = App.purchases().filter((p) => p.at >= s && p.at < e && (p.mode || 'cash') === 'cash').reduce((x, p) => x + p.paid, 0);
      const refundCash=mine(DB.refunds || []).filter(r=>r.at>=s&&r.at<e&&r.mode==='cash').reduce((n,r)=>n+r.amount,0);
      const supplierRefundCash=mine(DB.supplierRefunds || []).filter(r=>r.at>=s&&r.at<e&&r.mode==='cash').reduce((n,r)=>n+r.amount,0);
      const out = purchaseCash + mine(DB.supplierPayments).filter((p) => p.at >= s && p.at < e && p.mode === 'cash').reduce((x, p) => x + p.amount, 0)+refundCash;
      return { in: round2(billCash + payCash+supplierRefundCash), out: round2(out), net: round2(billCash + payCash+supplierRefundCash - out), billCash: round2(billCash), payCash: round2(payCash),refundCash:round2(refundCash),supplierRefundCash:round2(supplierRefundCash) };
    },
    /* 0-100 friendly composite of stock health, dues and sales trend */
    health() {
      const items = App.items();
      const okStock = items.length ? items.filter((i) => App.stockState(i) === 'ok').length / items.length : 1;
      const week = this.days(7).sales, prev = this.range(startOfDay(Date.now() - 13 * DAY).getTime(), startOfDay(Date.now() - 6 * DAY).getTime()).sales;
      const trend = prev > 0 ? clamp(week / prev, 0, 2) / 2 : (week > 0 ? 0.75 : 0.4);
      const due = this.totalDue(), monthSale = this.month().sales || 1;
      const dueScore = clamp(1 - due / Math.max(monthSale, 1), 0, 1);
      const exp = App.expiringBatches(15).length;
      const expScore = clamp(1 - exp / 10, 0, 1);
      const score = Math.round((okStock * 32 + trend * 30 + dueScore * 26 + expScore * 12));
      return { score: clamp(score, 3, 100), stock: Math.round(okStock * 100), trend: Math.round(trend * 200), dues: Math.round(dueScore * 100), expiry: exp };
    }
  };

  /* ───────── seeding ───────── */
  async function seed() {
    App.requirePermission('settings');
    App.requirePermission('settings');
    if (!App.isBlankAccount()) throw new Error('Sample data is only available in an empty shop.');
    const R = rng(20260724);
    const now = Date.now();
    DB.items = SEED_ITEMS.map((s, i) => ({
      id: 'it_' + i, storeId: 'st_main', name: s[0], nameHi: s[1], price: s[2], cost: s[3],
      stock: s[4], category: s[5], barcode: s[6], emoji: s[7], fav: !!s[8],
      threshold: null, gst: [12, 18].indexOf(s[2]) > -1 ? 12 : 5, batches: [], at: now - 60 * DAY
    }));
    // a couple of batches with expiry so the FIFO / expiry features have data
    const withExp = (idx, qty, dOffset) => {
      const it = DB.items[idx];
      it.batches = [{ id: uid('b'), qty: Math.round(it.stock * 0.6), expiry: dayKey(now + dOffset * DAY), cost: it.cost, at: now - 20 * DAY },
      { id: uid('b'), qty: it.stock - Math.round(it.stock * 0.6), expiry: dayKey(now + (dOffset + 90) * DAY), cost: it.cost, at: now - 4 * DAY }];
      if (qty) it.stock = itemStock(it);
    };
    withExp(11, 1, 4);   // Amul milk – expires in 4 days
    withExp(13, 1, 9);   // Dahi
    withExp(6, 1, 26);   // Dairy milk
    withExp(3, 1, 120);

    DB.customers = SEED_CUSTOMERS.map((c, i) => ({
      id: 'cu_' + i, storeId: 'st_main', name: c[0], phone: c[1], balance: 0, spend: 0, visits: 0,
      points: 0, dueSince: null, birthday: i === 0 ? dayKey(now + 2 * DAY).slice(5) : (i === 3 ? dayKey(now).slice(5) : ''),
      note: '', at: now - c[3] * DAY, firstAt: now - c[3] * DAY
    }));
    DB.suppliers = SEED_SUPPLIERS.map((s, i) => ({
      id: 'sp_' + i, storeId: 'st_main', name: s[0], phone: s[1], supplies: s[2],
      balance: s[3], dueSince: s[3] ? now - Math.abs(s[4]) * DAY : null,
      dueDate: s[3] ? dayKey(now + s[4] * DAY) : '', at: now - 90 * DAY
    }));

    // ~5 weeks of plausible trading history
    const modes = ['cash', 'cash', 'cash', 'upi', 'upi', 'card', 'credit'];
    for (let d = 34; d >= 0; d--) {
      const ts0 = startOfDay(now - d * DAY).getTime();
      const dow = new Date(ts0).getDay();
      const busy = (dow === 0 || dow === 6) ? 1.35 : 1;
      const n = Math.round((6 + R() * 9) * busy);
      for (let k = 0; k < n; k++) {
        const hour = 8 + Math.floor(R() * 13);
        const at = ts0 + hour * 36e5 + Math.floor(R() * 36e5);
        if (at > now) continue;
        const nLines = 1 + Math.floor(R() * 4);
        const lines = [];
        for (let j = 0; j < nLines; j++) {
          const it = DB.items[Math.floor(R() * DB.items.length)];
          if (lines.some((l) => l.itemId === it.id)) continue;
          const qty = 1 + Math.floor(R() * (it.price > 100 ? 1.4 : 3));
          lines.push({ itemId: it.id, name: it.name, emoji: it.emoji, qty, price: it.price, cost: it.cost, gst: it.gst, gross: round2(it.price * qty) });
        }
        if (!lines.length) continue;
        const sub = round2(lines.reduce((s, l) => s + l.gross, 0));
        const mode = modes[Math.floor(R() * modes.length)];
        const named = R() < 0.42;
        const cust = named ? DB.customers[Math.floor(R() * DB.customers.length)] : null;
        const credit = mode === 'credit' && !!cust;
        const total = sub;
        const b = {
          id: 'bl_' + d + '_' + k, no: DB.counter.bill++, storeId: 'st_main',
          customerId: cust ? cust.id : '', customerName: cust ? cust.name : 'Walk-in',
          lines, sub, discount: 0, tax: 0, total, paid: credit ? 0 : total,
          mode: credit ? 'credit' : mode, credit, note: '', staffId: 'sf_owner', at, void: false,
          loyalty: cust ? Math.floor(total / 100) : 0, redeemed: 0
        };
        DB.bills.push(b);
        if (cust) {
          cust.spend = round2(cust.spend + total); cust.visits++; cust.lastAt = at;
          cust.points = round2(cust.points + b.loyalty);
          if (credit) { cust.balance = round2(cust.balance + total); if (!cust.dueSince) cust.dueSince = at; }
        }
      }
    }
    DB.bills.sort((a, b) => b.at - a.at);

    // some part-payments so balances look lived-in
    DB.customers.forEach((c, i) => {
      if (c.balance > 300 && i % 2 === 0) {
        const amt = round2(c.balance * 0.4);
        DB.payments.push({ id: uid('pm'), storeId: 'st_main', customerId: c.id, amount: amt, mode: 'cash', staffId: 'sf_owner', at: now - (2 + i) * DAY });
        c.balance = round2(c.balance - amt);
      }
    });

    DB.activity.push({ id: uid('a'), type: 'sys', text: 'Shop set up on Dukaan OS', staffId: 'sf_owner', storeId: 'st_main', at: now - 35 * DAY });
    DB.settings.demo = true;
    (await persist());
  }
  /* Sample data is opt-in only (Settings → Load sample data on a brand-new
     shop). Nothing seeds itself automatically — a fresh account boots with
     a genuinely empty ledger. */
  App.seed = seed;
  App.isBlankAccount = () => !DB.items.length && !DB.customers.length && !DB.bills.length && !DB.suppliers.length;

  App.resetAll = async function () {
    App.requirePermission('settings');
    App.auth.requireFresh();
    (await App.wipeAccountData(App.accountId));
    committed.set(dataKey(), null);
    App.setLocked(true);
    location.reload();
  };

  /* Called once by js/auth.js right after a brand-new account is created,
     so the very first thing ever written for that account is an empty
     shop — no demo items, no demo bills, no demo customers. */
  App.initAccountData = async function (accountId, shopName) {
    if (pendingWrite) throw new Error('Wait for the current save before changing accounts.');
    App.accountId = accountId;
    await loadQueue();
    committed.set(dataKey(), await App.storage.read(dataKey()));
    DB = blank();
    if (shopName) DB.settings.shopName = shopName;
    (await persist());
    return DB;
  };

  /* Permanently erases one account's shop data — used when an account is
     deleted. Takes an explicit id because the account being removed is not
     always the one currently signed in. */
  App.wipeAccountData = async function (accountId) {
    App.assertWriter();
    if (!/^[A-Za-z0-9_-]{1,100}$/.test(accountId)) throw new Error('Invalid account ID.');
    if (pendingWrite) throw new Error('Wait for the current save before deleting an account.');
    if (App.migrations) await App.migrations.destroyAccount(accountId);
    for (const key of ['dukaanos.v2.' + accountId + '.before-restore', 'dukaanos.syncq.' + accountId, 'dukaanos.v2.' + accountId]) await App.storage.remove(key);
  };

  App.boot = async function (accountId) {
    App.assertWriter();
    if (pendingWrite) throw new Error('Wait for the current save before opening another account.');
    App.accountId = accountId || App.accountId;
    await loadQueue();
    const had = (await load());
    if (!had) { DB = blank(); (await persist()); }
    if (!DB.stores.some((s) => s.id === DB.settings.activeStore)) DB.settings.activeStore = DB.stores[0].id;
    return DB;
  };

  /* export helpers */
  App.util = { uid, clamp, round2, money, money2: (n) => money(n, true), short, inr, DAY, startOfDay, dayKey, daysBetween, isToday, timeAgo, fmtDT, fmtD, esc, rng };
  Object.assign(App, { uid, money, short, esc, round2, clamp, DAY, dayKey, daysBetween, startOfDay, timeAgo, fmtDT, fmtD, isToday });
})(window);
