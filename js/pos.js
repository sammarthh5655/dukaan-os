/* ══════════════════════════════════════════════════════════
   Dukaan OS — Billing counter (POS)
   ══════════════════════════════════════════════════════════ */
(function (w) {
  'use strict';
  const App = w.App, esc = App.esc, money = App.money, t = (k, v) => App.t(k, v);
  App.views = App.views || {};

  const cart = { storeId: '', lines: [], discount: 0, mode: 'cash', customerId: '', note: '', redeem: 0 };
  App.cart = cart;
  let filter = { q: '', cat: '' }, lastBill = null;
  let loadedScope='',draftSave=Promise.resolve(),draftError=null;
  const scopeKey=()=>JSON.stringify(App.drafts.scope());
  function loadDraft(){
    const scope=scopeKey();if(loadedScope===scope)return;
    loadedScope=scope;const saved=App.drafts.current();
    Object.assign(cart,{storeId:'',lines:[],discount:0,mode:'cash',customerId:'',note:'',redeem:0,draftId:''},saved?JSON.parse(JSON.stringify(saved.cart)):{});
    cart.draftId=saved?.id || '';lastBill=null;
  }
  App.on('secureclear',()=>{loadedScope='';Object.assign(cart,{storeId:'',lines:[],discount:0,mode:'cash',customerId:'',note:'',redeem:0,draftId:''});lastBill=null;});
  App.posFlush=()=>draftSave;

  const cartQty = () => cart.lines.reduce((s, l) => s + l.qty, 0);
  const subTotal = () => App.round2(cart.lines.reduce((s, l) => s + l.price * l.qty, 0));

  function totals() {
    const T = App.cartTotals(cart);
    cart.redeem = T.redeem;
    return T;
  }
  App.posTotals = totals;

  /* ───────── cart ops ───────── */
  function add(itemId, qty, fromEl) {
    App.requirePermission('bill');
    loadDraft();
    if (cart.storeId && cart.storeId !== App.S()) clearCart();
    cart.storeId = App.S();
    const it = App.item(itemId);
    if (!it) return;
    qty = qty || 1;
    App.number(qty, 'Quantity', 0.0001); App.units.assertQuantity(it,qty);
    const have = App.sellableStock(it);
    const inCart = (cart.lines.find((l) => l.itemId === itemId) || {}).qty || 0;
    if (have <= 0) { App.toast('err', App.itemName(it), t('pos.outOfStock')); return; }
    if (inCart + qty > have) {
      qty = Math.max(0, have - inCart);
      if (qty <= 0) { App.toast('warn', App.itemName(it), t('pos.onlyLeft', { n: have })); return; }
      App.toast('warn', App.itemName(it), t('pos.onlyLeft', { n: have }));
    }
    const ex = cart.lines.find((l) => l.itemId === itemId);
    if (ex) ex.qty = App.domain.quantity(ex.qty + qty);
    else cart.lines.push({ itemId, name: App.itemName(it), emoji: it.emoji || '🛍️', qty, price: it.price,unitLabel:it.quantitySpec?App.units.label(it):'',selectionVersion:App.selectionVersion(it) });
    if (fromEl) App.flyTo(fromEl, '#cartCount', it.emoji || '🛒');
    App.buzz();
    paintCart(); App.bump('#cartCount');return draftSave;
  }
  App.posAdd = add;

  function setQty(itemId, q) {
    App.requirePermission('bill');
    App.domain.quantityUnits(q);
    const l = cart.lines.find((x) => x.itemId === itemId); if (!l) return;
    const it = App.item(itemId);
    if(it&&q>0)App.units.assertQuantity(it,q);
    const max = it ? App.sellableStock(it) : 999;
    if (q > max) { q = max; App.toast('warn', App.itemName(it), t('pos.onlyLeft', { n: max })); }
    if (q <= 0) {
      cart.lines = cart.lines.filter((x) => x.itemId !== itemId);
    } else l.qty = App.domain.quantity(q);
    paintCart();
  }
  function clearCart() { lastBill = null; cart.draftId='';cart.storeId = ''; cart.lines = []; cart.discount = 0; cart.redeem = 0; cart.customerId = ''; cart.mode = 'cash'; cart.note = ''; paintCart();return draftSave; }
  App.posClear = () => {loadedScope='';loadDraft();paintCart(false);};

  /* ───────── item grid ───────── */
  function itemCard(it) {
    const s = App.sellableStock(it), state = s <= 0 ? 'out' : App.stockState(it);
    const th = it.threshold != null ? it.threshold : App.DB().settings.lowStock;
    const pct = Math.max(4, Math.min(100, (s / Math.max(th * 3, 1)) * 100));
    return '<button class="item-card ' + (state === 'out' ? 'out' : state === 'low' ? 'low' : '') + '" data-add="' + it.id + '">' +
      (it.fav ? '<span class="fav"></span>' : '') +
      App.mark(it, 'lg') +
      '<span class="nm">' + esc(App.itemName(it)) + '</span>' +
      '<span class="pr">' + money(it.price) + '</span>' +
      '<span class="st">' + (state === 'out' ? t('pos.outOfStock') : s + ' ' + t('com.stock').toLowerCase()) + '</span>' +
      '<span class="bar"><i class="' + (state === 'out' ? 'b' : state === 'low' ? 'w' : '') + '" style="width:' + pct + '%"></i></span>' +
      '</button>';
  }

  function visibleItems() {
    const q = filter.q.trim().toLowerCase(), qs = App.skel(q);
    let list = App.items();
    if (filter.cat) list = list.filter((i) => i.category === filter.cat);
    if (q) {
      list = list.filter((i) => {
        const hay = (i.name + ' ' + (i.nameHi || '') + ' ' + (i.alias || '') + ' ' + (i.category || '') + ' ' + (i.barcode || '')).toLowerCase();
        return hay.indexOf(q) > -1 || (qs.length > 2 && App.skel(hay).indexOf(qs) > -1);
      });
    }
    return list.sort((a, b) => (b.fav ? 1 : 0) - (a.fav ? 1 : 0) || a.name.localeCompare(b.name));
  }

  function paintItems() {
    const box = App.$('#itemGrid'); if (!box) return;
    const list = visibleItems();
    box.innerHTML = list.length ? list.map(itemCard).join('')
      : App.emptyState('', t('pos.noItems'), t('pos.quickHint'),
        App.can('edit_inventory') ? '<button class="btn pri sm" id="quickAdd">' + t('pos.addQuick') + '</button>' : '');
    App.enhanceAccessibility(box);
  }

  /* ───────── cart panel ───────── */
  function paintCart(persist=true) {
    const box = App.$('#cartLines'); if (!box) return;
    const focused=document.activeElement,focusControl=focused?.closest?.('#cartLines button,#cartFoot button');
    const focusMatch=focusControl?{id:focusControl.id,inc:focusControl.dataset.inc,dec:focusControl.dataset.dec,mode:focusControl.dataset.mode}:null;
    const T = totals();
    const cust = cart.customerId ? App.customer(cart.customerId) : null;

    box.innerHTML = cart.lines.length ? cart.lines.map((l) =>
      '<div class="cart-line" data-line="' + l.itemId + '">' +
      App.mark(l.name) +
      '<span class="cl-n"><b>' + esc(l.name) + '</b><span>' + money(l.price) + ' × ' + l.qty +' '+esc(l.unitLabel||'')+ '</span></span>' +
      '<span class="qty"><button data-dec="' + l.itemId + '">−</button><b>' + l.qty + '</b><button data-inc="' + l.itemId + '">+</button></span>' +
      '<span class="cl-amt">' + money(l.price * l.qty) + '</span></div>').join('')
      : '<div class="empty" style="padding:26px 16px"><div class="e"></div><h4>' + t('pos.empty') + '</h4><p>' + t('pos.emptySub') + '</p></div>';

    App.$('#cartCount').textContent = cartQty();
    const f = App.$('#cartFoot');
    const pts = cust ? Math.floor(cust.points || 0) : 0;
    const ptVal = pts * (App.DB().settings.loyaltyValue || 1);

    f.innerHTML =
      '<button class="btn sm block" id="pickCust" style="margin-bottom:10px;justify-content:flex-start">' +
      '<span></span><span>' + esc(cust ? cust.name : t('pos.walkin')) + '</span>' +
      (cust && cust.balance > 0 ? '<span class="chip bad xs" style="margin-left:auto;padding:2px 8px">' + money(cust.balance) + ' ' + t('com.pending').toLowerCase() + '</span>' : '<span style="margin-left:auto;opacity:.5">▾</span>') +
      '</button>' +
      '<div class="tot-row"><span>' + t('pos.subtotal') + '</span><span class="num">' + money(T.sub, true) + '</span></div>' +
      '<div class="tot-row"><button id="discBtn" style="font-size:13.5px;font-weight:650;color:var(--ink);text-decoration:underline dotted">' + t('pos.discount') + '</button>' +
      '<span class="num">' + (T.disc ? '− ' + money(T.disc, true) : '—') + '</span></div>' +
      (App.DB().settings.gstEnabled ? '<div class="tot-row"><span>' + t('pos.tax') + '</span><span class="num">' + money(T.tax, true) + '</span></div>' : '') +
      (cust && pts > 0 ? '<div class="tot-row"><button id="redeemBtn" style="font-size:13px;font-weight:650;color:var(--ok)">★ ' + t('pos.redeem') + ' (' + pts + ' = ' + money(ptVal) + ')</button><span class="num">' + (cart.redeem ? '− ' + money(cart.redeem) : '—') + '</span></div>' : '') +
      '<div class="tot-row grand"><span>' + t('pos.grand') + '</span><span class="num">' + money(T.total, true) + '</span></div>' +
      '<div class="pay-modes">' +
      [['cash', '', t('pos.cash')], ['upi', '', t('pos.upi')], ['card', '', t('pos.card')], ['credit', '', t('pos.credit')]]
        .map((m) => '<button class="pay-mode ' + (cart.mode === m[0] ? 'on' : '') + (m[0] === 'credit' ? ' credit' : '') + '" data-mode="' + m[0] + '"><span>' + m[1] + '</span>' + esc(m[2]) + '</button>').join('') +
      '</div>' +
      '<div class="btn-row" style="flex-wrap:nowrap">' +
      '<button class="btn sm" id="clearCart" ' + (cart.lines.length ? '' : 'disabled') + ' title="' + t('pos.clear') + '">' + App.icon('trash',16) + '</button>' +
      '<button class="btn ' + (cart.mode === 'credit' ? 'danger' : 'ok') + ' big" id="charge" style="flex:1" ' + (cart.lines.length ? '' : 'disabled') + '>' +
      (cart.mode === 'credit' ? '' + t('pos.credit') : '✓ ' + t('pos.charge')) + ' · ' + money(T.total) + '</button></div>';

    const mob = App.$('#cartPanel');
    App.enhanceAccessibility(box);App.enhanceAccessibility(f);
    if(focusMatch){const target=[...box.querySelectorAll('button'),...f.querySelectorAll('button')].find(b=>(focusMatch.id&&b.id===focusMatch.id)||(focusMatch.inc&&b.dataset.inc===focusMatch.inc)||(focusMatch.dec&&b.dataset.dec===focusMatch.dec)||(focusMatch.mode&&b.dataset.mode===focusMatch.mode));(target||App.$('#pickCust')).focus();}
    const grand=f.querySelector('.grand');if(grand){grand.setAttribute('role','status');grand.setAttribute('aria-label',App.uiText('Cart total {amount}',{amount:money(T.total,true)}));}
    if (mob && cart.lines.length && w.innerWidth <= 860) mob.classList.add('open');
    if(persist){
      const context=App.context();
      draftSave=App.drafts.save(cart).then(saved=>{if(App.contextValid(context)){cart.draftId=saved?.id || '';draftError=null;}}).catch(error=>{
        draftError=error;
        App.toast('err',App.uiText('Cart could not be saved'),error.message);
        if(App.contextValid(context)){loadedScope='';loadDraft();paintCart(false);}
      });
    }
  }

  /* ───────── customer picker ───────── */
  function pickCustomer() {
    const body = App.el('<div>' +
      '<div class="search-wrap" style="margin-bottom:12px"><span class="mag"></span>' +
      '<input class="inp" id="cq" placeholder="' + t('com.search') + '"></div>' +
      '<div id="clist" style="max-height:46vh;overflow:auto"></div>' +
      '<button class="btn block sm" id="newCust" style="margin-top:12px"> ' + t('cus.add') + '</button></div>');

    let m;
    const paint = () => {
      const q = App.$('#cq', body).value.toLowerCase();
      const list = App.customers().filter((c) => !q || c.name.toLowerCase().indexOf(q) > -1 || (c.phone || '').indexOf(q) > -1)
        .sort((a, b) => (b.lastAt || 0) - (a.lastAt || 0));
      App.$('#clist', body).innerHTML =
        '<button class="list-row" data-c="" style="width:100%;text-align:left">' + App.avatarFor('W') +
        '<span style="flex:1"><b>' + t('pos.walkin') + '</b></span></button>' +
        list.map((c, i) => '<button class="list-row" data-c="' + c.id + '" style="width:100%;text-align:left">' +
          App.avatarFor(c.name, i) +
          '<span style="flex:1;min-width:0"><b style="display:block">' + esc(c.name) + '</b>' +
          '<small class="muted">' + esc(c.phone || '') + (c.points ? ' · ★' + Math.floor(c.points) : '') + '</small></span>' +
          (c.balance > 0 ? '<span class="chip bad">' + money(c.balance) + '</span>' : '') + '</button>').join('');
    };
    m = App.modal({ title: t('pos.pickCustomer'), body, foot: false });
    paint();
    App.$('#cq', body).addEventListener('input', paint);
    body.addEventListener('click', (e) => {
      const b = e.target.closest('[data-c]');
      if (b) { cart.redeem = 0; cart.customerId = b.dataset.c; paintCart(); m.close(); return; }
      if (e.target.closest('#newCust')) {
        m.close();
        App.editCustomer(null, (c) => { cart.redeem = 0; cart.customerId = c.id; paintCart(); });
      }
    });
  }

  /* ───────── checkout ───────── */
  async function checkout() {
    if (!cart.lines.length || App.isSaving()) return;
    await draftSave;if(draftError)throw draftError;
    const T = totals();
    if (cart.mode === 'credit' && !cart.customerId) {
      App.toast('warn', t('pos.needCustomer'));
      pickCustomer();
      return;
    }
    const bill = (await App.actions.checkout({
      draftId:cart.draftId,storeId: cart.storeId, lines: cart.lines, discount: cart.discount,
      mode: cart.mode, customerId: cart.customerId, note: cart.note, redeem: cart.redeem
    }));
    App.buzz(30);

    const r = App.$('#charge') ? App.$('#charge').getBoundingClientRect() : null;

    clearCart();
    lastBill = bill;
    const mob = App.$('#cartPanel'); if (mob) mob.classList.remove('open');
    paintItems();

    App.toast(bill.credit ? 'warn' : 'ok', t('pos.done'),
      t('pos.doneSub', { amt: money(bill.total, true), mode: bill.credit ? t('pos.credit') : t('pos.' + bill.mode) }),
      { label: t('com.undo'), fn: async () => { (await App.actions.voidBill(bill.id, 'undo')); App.toast('ok', t('com.undo'), 'Bill #' + bill.no + ' cancelled'); App.render(); } });

    await App.checkTarget().catch(() => App.toast('warn', App.uiText('Sale saved'), App.uiText('The daily target preference could not be saved.')));
    showReceipt(bill);
  }

  /* ───────── receipt modal ───────── */
  function showReceipt(bill) {
    bill = App.domain.snapshot(bill);
    const cust = bill.customerPhone!==undefined?{phone:bill.customerPhone}:(bill.customerId ? App.customer(bill.customerId) : null);
    const wrap = App.el('<div><div class="receipt-prev" id="rcp"></div></div>');
    const cv = App.receiptCanvas(bill);
    cv.setAttribute('aria-hidden','true');const receiptText=document.createElement('pre');receiptText.className='sr-only';receiptText.textContent=App.billText(bill);wrap.appendChild(receiptText);
    wrap.querySelector('#rcp').appendChild(cv);

    App.modal({
      title: t('pos.done') + '  #' + bill.no,
      body: wrap,
      buttons: [
        App.can('void_bill')&&!bill.void&&App.returnable(bill)?{label:App.uiText('Return / refunds'),cls:'ghost',fn:()=>App.returnDialog(bill.id)}:null,
        {label:App.uiText('58 mm receipt preview'),cls:'ghost',keepOpen:true,fn:()=>App.thermal.preview(bill.id)},
        { label: ' PNG', cls: 'ghost', keepOpen: true, fn: () => App.downloadCanvas(cv, 'bill-' + bill.no + '.png') },
        { label: ' ' + t('com.print'), cls: 'ghost', keepOpen: true, fn: () => printBill(bill) },
        {
          label: '' + t('pos.share'), cls: 'ok', keepOpen: true,
          fn: () => shareBill(bill, cust)
        },
        { label: '✓ ' + t('pos.newBill'), cls: 'pri' }
      ]
    });
  }
  App.showReceipt = showReceipt;

  async function shareBill(bill, cust) {
    const text = App.billText(bill);
    // Prefer the native share sheet with the receipt image when available.
    try {
      if (navigator.canShare) {
        const cv = App.receiptCanvas(bill);
        const blob = await new Promise((r) => cv.toBlob(r, 'image/png'));
        const file = new File([blob], 'bill-' + bill.no + '.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], text, title: 'Bill #' + bill.no });
          return;
        }
      }
    } catch (e) { /* fall through to wa.me */ }
    App.whatsapp(cust ? cust.phone : '', text);
  }
  App.shareBill = shareBill;

  function printBill(bill) {
    const st = bill.receiptSettings || {shopName:'Shop'};
    let h = '<div style="text-align:center;font-family:sans-serif">' +
      '<h2 style="margin:0">' + esc(st.shopName) + '</h2>' +
      (st.address ? '<div style="font-size:11px">' + esc(st.address) + '</div>' : '') +
      (st.shopPhone ? '<div style="font-size:11px">☎ ' + esc(st.shopPhone) + '</div>' : '') +
      (st.gstin ? '<div style="font-size:11px">GSTIN: ' + esc(st.gstin) + '</div>' : '') +
      '<hr></div>' +
      '<div style="font-size:11px;display:flex;justify-content:space-between"><span>Bill #' + bill.no + '</span><span>' + App.fmtDT(bill.at) + '</span></div>' +
      '<div style="font-size:12px;font-weight:700;margin:4px 0">' + esc(bill.customerName) + ' · ' + esc(String(bill.mode).toUpperCase()) + '</div><hr>' +
      '<table style="width:100%;font-size:11px;border-collapse:collapse">' +
      '<tr><th align="left">Item</th><th>Qty</th><th align="right">Rate</th><th align="right">Amt</th></tr>' +
      bill.lines.map((l) => '<tr><td>' + esc(l.name) + (l.quantitySpec?'<br>'+esc(App.units.label(l)):'') + '</td><td align="center">' + l.qty + '</td><td align="right">' + l.price + '</td><td align="right">' + l.gross.toFixed(2) + '</td></tr>').join('') +
      '</table><hr>' +
      '<div style="font-size:11px;display:flex;justify-content:space-between"><span>Subtotal</span><span>' + bill.sub.toFixed(2) + '</span></div>' +
      (bill.discount ? '<div style="font-size:11px;display:flex;justify-content:space-between"><span>Discount</span><span>-' + bill.discount.toFixed(2) + '</span></div>' : '') +
      (bill.tax ? '<div style="font-size:11px;display:flex;justify-content:space-between"><span>GST</span><span>' + bill.tax.toFixed(2) + '</span></div>' : '') +
      '<div style="font-size:15px;font-weight:800;display:flex;justify-content:space-between;margin-top:6px"><span>TOTAL</span><span>₹' + bill.total.toFixed(2) + '</span></div>' +
      (bill.credit && !bill.void ? '<div style="text-align:center;font-size:11px;font-weight:700;margin-top:6px">** UDHAAR — PENDING **</div>' : '') +
      '<div style="text-align:center;font-size:10px;margin-top:10px">Thank you! धन्यवाद </div>';
    if (bill.void) h = '<h1 style="text-align:center">CANCELLED / VOID</h1>' + h;
    App.printNode(h);
  }
  App.printBill = printBill;

  /* ───────── voice flow ───────── */
  function startVoice() {
    if (!App.voice.supported()) { App.toast('err', t('voice.unsupported')); return; }
    const orb = App.$('#voiceOrb'), txt = App.$('#orbText');
    orb.hidden = false;
    txt.innerHTML = '<span class="dim">' + esc(t('voice.say')) + '</span>';
    const stop = () => { orb.hidden = true; App.voice.stop(); };
    App.$('#orbStop').onclick = stop;

    App.voice.start({
      onPartial: (s) => { txt.textContent = s || t('voice.listen'); },
      onError: (code) => {
        orb.hidden = true;
        App.toast('err', code === 'denied' ? t('voice.denied') : code === 'unsupported' ? t('voice.unsupported') : t('voice.noMatch'));
      },
      onFinal: (final, alts) => {
        orb.hidden = true;
        if (!final) return;
        const res = App.voice.bestOf([final].concat(alts || []), App.items());
        const use = res.ambiguous?res:res.lines.length ? res : App.parseSpeech(final, App.items());
        confirmVoice(final, use);
      }
    });
  }
  App.startVoice = startVoice;

  function confirmVoice(said, res) {
    if (!res.lines.length) {
      App.toast('err', t('voice.noMatch'), said);
      filter.q = said; const s = App.$('#posSearch'); if (s) { s.value = said; paintItems(); }
      return;
    }
    const body = App.el('<div>' +
      '<p class="muted" style="font-size:12.5px;margin-bottom:4px">' + t('voice.heard') + '</p>' +
      '<p style="font-size:15px;font-weight:650;margin-bottom:14px">“' + esc(said) + '”</p>' +
      '<div id="vlist"></div>' +
      (res.unknown.length ? '<div class="alert warn" style="margin-top:12px"><span class="ai"></span><span>' +
        t('voice.noMatch') + ': ' + esc(res.unknown.join(', ')) + '</span></div>' : '') + '</div>');
    const paint = () => {
      App.$('#vlist', body).innerHTML = res.lines.map((l, i) =>
        '<div class="list-row">' + App.mark(l.item) +
        '<span style="flex:1"><b>' + esc(App.itemName(l.item)) + '</b><br><small class="muted">' + money(l.item.price) + ' × ' + l.qty +' '+esc(App.units.label(l.item))+'<br>'+esc(l.said)+'</small></span>' +
        '<span class="qty"><button data-vd="' + i + '">−</button><b>' + l.qty + '</b><button data-vi="' + i + '">+</button></span>' +
        '<b class="num" style="width:62px;text-align:right">' + money(l.item.price * l.qty) + '</b></div>').join('');
    };
    paint();
    body.addEventListener('click', (e) => {
      const d = e.target.closest('[data-vd]'), i2 = e.target.closest('[data-vi]');
      if (d) { const i = +d.dataset.vd; res.lines[i].qty = Math.max(0, res.lines[i].qty - 1); if (!res.lines[i].qty) res.lines.splice(i, 1); paint(); }
      if (i2) { const i = +i2.dataset.vi; res.lines[i].qty++; paint(); }
    });
    App.modal({
      title: '' + t('voice.confirm'), body,
      buttons: [{ label: t('com.cancel'), cls: 'ghost' },
      {
        label: t('com.add'), cls: 'pri',
        fn: async () => {loadDraft();for(const l of res.lines){const it=App.item(l.item.id);if(!it||l.selectionVersion!==App.selectionVersion(it)||App.domain.quantity(l.qty+(cart.lines.find(x=>x.itemId===it.id)?.qty||0))>App.sellableStock(it))throw Error('Voice selection changed. Review the item, unit and stock again.');App.units.assertQuantity(it,l.qty);}for(const l of res.lines){await add(l.item.id,l.qty);if(draftError)throw draftError;}App.toast('ok', t('voice.added', { n: res.lines.length })); }
      }]
    });
  }

  /* ───────── barcode scanning ───────── */
  async function scan() {
    App.requirePermission('bill');
    const context = App.context();
    const manual = () => App.prompt(t('inv.barcode'), t('inv.barcode'), { placeholder: '890...' })
      .then((code) => { if (code && App.contextValid(context)) onCode(code.trim()); });

    if (!('BarcodeDetector' in w)) {
      App.toast('warn', App.uiText('Camera scanner needs Chrome on Android'), App.uiText('Type the barcode instead'));
      return manual();
    }
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    } catch (e) {
      if (!App.contextValid(context)) return;
      App.toast('err', App.uiText('Camera blocked'), App.uiText('Allow camera access, or type the code'));
      return manual();
    }
    if (!App.contextValid(context)) { stream.getTracks().forEach(tr => tr.stop()); return; }
    const body = App.el('<div><div class="scanbox"><video playsinline muted autoplay></video>' +
      '<div class="scanframe"></div><div class="scanline"></div></div>' +
      '<p class="muted" style="font-size:12.5px;text-align:center;margin-top:10px">Point at the barcode</p></div>');
    const video = body.querySelector('video');
    video.srcObject = stream;
    let stop = false;
    const m = App.modal({
      title: ' ' + t('pos.scan'), body,
      buttons: [{ label: App.uiText('Type it instead'), cls: 'ghost', fn: () => { stop = true; manual(); } }],
      onClose: () => { stop = true; stream.getTracks().forEach((tr) => tr.stop()); }
    });
    let det;
    try { det = new w.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'itf'] }); }
    catch (e) { m.close(); return manual(); }
    const loop = async () => {
      if (stop) return;
      try {
        const codes = await det.detect(video);
        if (!App.contextValid(context) || stop) return;
        if (codes && codes.length) {
          App.buzz(40);
          m.close();
          onCode(codes[0].rawValue);
          return;
        }
      } catch (e) { }
      requestAnimationFrame(loop);
    };
    video.addEventListener('loadedmetadata', () => requestAnimationFrame(loop));
  }
  App.scanBarcode = scan;

  function onCode(code) {
    const it = App.items().find((i) => (i.barcode || '') === code);
    if (it) { add(it.id, 1); App.toast('ok', App.itemName(it), money(it.price)); return; }
    App.confirm(t('inv.barcode') + ' ' + code, 'No item has this barcode. Add it now?').then((ok) => {
      if (ok) App.editItem(null, (n) => add(n.id, 1), { barcode: code });
    });
  }
  App.onBarcode = onCode;

  /* ───────── render ───────── */
  App.views.billing = function (main) {
    loadDraft();
    const cats = Array.from(new Set(App.items().map((i) => i.category).filter(Boolean))).sort();
    const favs = App.items().filter((i) => i.fav && App.sellableStock(i) > 0);

    main.innerHTML =
      '<div class="page-head"><div><h1> ' + t('pos.title') + '</h1><div class="sub">' + t('pos.sub') + '</div></div>' +
      '<div class="spacer"></div>' +
      (lastBill ? '<button class="btn sm" id="showLast"> ' + t('pos.lastBill') + ' #' + lastBill.no + '</button>' : '') +
      '</div>' +
      '<div class="pos">' +
      '<div>' +
      '<div class="pos-tools">' +
      '<div class="search-wrap"><span class="mag"></span><input class="inp" id="posSearch" placeholder="' + t('pos.searchItems') + '" value="' + esc(filter.q) + '"></div>' +
      '<button class="btn pri" id="btnVoice" title="' + t('pos.voice') + '">' + App.icon('mic',16) + '<span class="only-wide">' + t('pos.voice') + '</span></button>' +
      '<button class="btn" id="btnScan" title="' + t('pos.scan') + '">' + App.icon('scan',16) + '</button>' +
      '</div>' +
      (favs.length ? '<div class="chip-row" style="margin-bottom:12px">' +
        '<span class="chip" style="background:transparent;border:0"> ' + t('pos.favorites') + '</span>' +
        favs.slice(0, 10).map((i) => '<button class="chip tap pri" data-add="' + i.id + '">' + esc(App.itemName(i)) + ' · ' + money(i.price) + '</button>').join('') + '</div>' : '') +
      '<div class="chip-row" style="margin-bottom:13px">' +
      '<button class="chip tap ' + (filter.cat ? '' : 'sel') + '" data-cat="">' + t('com.all') + '</button>' +
      cats.map((c) => '<button class="chip tap ' + (filter.cat === c ? 'sel' : '') + '" data-cat="' + esc(c) + '">' + esc(c) + '</button>').join('') +
      '</div>' +
      '<div class="item-grid" id="itemGrid"></div>' +
      '</div>' +

      '<div class="cart" id="cartPanel">' +
      '<div class="cart-head" id="cartHead" role="button" tabindex="0" aria-controls="cartLines cartFoot"><span style="font-size:18px"></span><h3>' + t('pos.cart') + '</h3>' +
      '<span class="cart-count" id="cartCount">0</span></div>' +
      '<div class="cart-lines" id="cartLines"></div>' +
      '<div class="cart-foot" id="cartFoot"></div>' +
      '</div></div>';

    paintItems(); paintCart(false);

    const S = App.$('#posSearch');
    S.addEventListener('input', () => { filter.q = S.value; paintItems(); });
    S.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const list = visibleItems().filter((i) => App.sellableStock(i) > 0);
        if (list.length) { add(list[0].id, 1, App.$('[data-add="' + list[0].id + '"]')); S.value = ''; filter.q = ''; paintItems(); }
      }
    });

    main.addEventListener('click', (e) => {
      const a = e.target.closest('[data-add]');
      if (a) { add(a.dataset.add, 1, a); return; }
      const c = e.target.closest('[data-cat]');
      if (c) { filter.cat = c.dataset.cat; App.$$('[data-cat]', main).forEach((x) => x.classList.toggle('sel', x.dataset.cat === filter.cat)); paintItems(); return; }
      if (e.target.closest('#btnVoice')) return startVoice();
      if (e.target.closest('#btnScan')) return scan();
      if (e.target.closest('#quickAdd')) return App.editItem(null, (n) => { paintItems(); add(n.id, 1); }, { name: filter.q });
      if (e.target.closest('#showLast') && lastBill) return showReceipt(lastBill);
    });

    App.$('#cartFoot').addEventListener('click', async (e) => {
      const dec = e.target.closest('[data-dec]'), inc = e.target.closest('[data-inc]');
      if (e.target.closest('#pickCust')) return pickCustomer();
      if (e.target.closest('#clearCart')) return clearCart();
      if (e.target.closest('#charge')) return await checkout().catch(App.reportError);
      if (e.target.closest('#discBtn')) {
        return App.numpadModal(t('pos.discount'), cart.discount || '', (n) => { cart.discount = n; paintCart(); },
          { allowZero: true, sub: t('pos.subtotal') + ': ' + money(subTotal(), true), quick: [5, 10, 20, 50] });
      }
      if (e.target.closest('#redeemBtn')) {
        const cust = App.customer(cart.customerId);
        const maxV = Math.floor(cust.points || 0) * (App.DB().settings.loyaltyValue || 1);
        const use = Math.max(0, Math.min(maxV, subTotal() - cart.discount));
        cart.redeem = cart.redeem ? 0 : use;
        App.toast('ok', cart.redeem ? '★ ' + money(cart.redeem) + ' off' : 'Points removed');
        paintCart(); return;
      }
      const md = e.target.closest('[data-mode]');
      if (md) { cart.mode = md.dataset.mode; if (cart.mode === 'credit' && !cart.customerId) pickCustomer(); paintCart(); return; }
      if (dec) return setQty(dec.dataset.dec, (cart.lines.find((l) => l.itemId === dec.dataset.dec) || {}).qty - 1);
      if (inc) return setQty(inc.dataset.inc, (cart.lines.find((l) => l.itemId === inc.dataset.inc) || {}).qty + 1);
    });

    App.$('#cartLines').addEventListener('click', (e) => {
      const dec = e.target.closest('[data-dec]'), inc = e.target.closest('[data-inc]');
      if (dec) setQty(dec.dataset.dec, (cart.lines.find((l) => l.itemId === dec.dataset.dec) || {}).qty - 1);
      if (inc) setQty(inc.dataset.inc, (cart.lines.find((l) => l.itemId === inc.dataset.inc) || {}).qty + 1);
    });

    App.$('#cartHead').addEventListener('keydown', e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();App.$('#cartHead').click();}});
    App.$('#cartHead').addEventListener('click', () => {
      if (w.innerWidth <= 860) App.$('#cartPanel').classList.toggle('open');
    });
  };
})(window);
