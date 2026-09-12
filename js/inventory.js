/* ══════════════════════════════════════════════════════════
   Dukaan OS — Inventory, batches, expiry, CSV import
   ══════════════════════════════════════════════════════════ */
(function (w) {
  'use strict';
  const App = w.App, esc = App.esc, money = App.money, t = (k, v) => App.t(k, v);
  let f = { q: '', cat: '', view: 'all' };

  const EMOJI = ['🛍️', '🥔', '🍪', '🍫', '🍜', '🥛', '🥤', '💧', '🍵', '🧂', '🛢️', '🌾', '🍚', '🫘', '🪥', '🧼', '🧺', '🍽️', '🦟', '🚬', '🥚', '🍞', '🧴', '🕯️', '📦', '🍬', '🥜', '🧃', '🍦', '🌶️'];

  /* ───────── item editor ───────── */
  App.editItem = function (id, done, preset) {
    App.requirePermission('edit_inventory');
    const it = id ? App.item(id) : null;
    const d = Object.assign({
      name: '', nameHi: '', alias: '', price: '', cost: '', stock: 0, category: '', barcode: '',
      emoji: '🛍️', fav: false, threshold: '', gst: App.DB().settings.defaultGst
    }, it || {}, preset || {});

    const cats = Array.from(new Set(App.items().map((i) => i.category).filter(Boolean))).sort();
    const body = App.el('<div>' +
      '<div class="field"><label>' + t('inv.emoji') + '</label><div class="chip-row" id="emoPick">' +
      EMOJI.map((e) => '<button class="chip tap ' + (d.emoji === e ? 'sel' : '') + '" data-e="' + e + '" style="font-size:16px">' + e + '</button>').join('') + '</div></div>' +
      '<div class="row"><div class="field"><label>'+App.uiText('Selling unit')+'</label><select class="inp" id="i_unit" '+(it?'disabled':'')+'><option value="">'+App.uiText('Legacy unit (unchanged)')+'</option>'+App.units.names().map(u=>'<option value="'+u+'" '+(d.quantitySpec?.unit===u?'selected':'')+'>'+u+'</option>').join('')+'</select></div><div class="field"><label>'+App.uiText('Contents per pack')+'</label><input class="inp" id="i_packSize" type="number" step="any" '+(it?'disabled':'')+' value="'+esc(d.quantitySpec?.packSize || '')+'"></div><div class="field"><label>'+App.uiText('Pack contents unit')+'</label><select class="inp" id="i_packUnit" '+(it?'disabled':'')+'>'+App.units.names().filter(u=>u!=='pack').map(u=>'<option value="'+u+'" '+(d.quantitySpec?.packUnit===u?'selected':'')+'>'+u+'</option>').join('')+'</select></div></div>'+
      '<div class="field"><label>' + t('com.name') + ' *</label><input class="inp" id="i_name" value="' + esc(d.name) + '" placeholder="Lays Magic Masala" autofocus></div>' +
      '<div class="row"><div class="field"><label>हिंदी नाम <span class="muted">(' + t('com.optional') + ')</span></label><input class="inp" id="i_hi" value="' + esc(d.nameHi) + '" placeholder="लेज़ मैजिक मसाला"></div>' +
      '<div class="field"><label> <span data-core-text="Voice aliases">Voice aliases</span></label><input class="inp" id="i_alias" value="' + esc(d.alias) + '" placeholder="lej, chips, aloo"></div></div>' +
      '<div class="row"><div class="field"><label>' + t('com.price') + ' * ₹</label><input class="inp num" id="i_price" type="number" inputmode="decimal" step="0.5" value="' + esc(d.price) + '"></div>' +
      '<div class="field"><label>' + t('com.cost') + ' ₹</label><input class="inp num" id="i_cost" type="number" inputmode="decimal" step="0.5" value="' + esc(d.cost) + '"></div></div>' +
      '<div class="row"><div class="field"><label>' + t('com.stock') + '</label><input class="inp num" id="i_stock" type="number" inputmode="decimal" value="' + esc(d.stock) + '" ' + (it ? 'disabled title="Use Count / dispose to record stock changes"' : '') + '></div>' +
      '<div class="field"><label>' + t('inv.threshold') + '</label><input class="inp num" id="i_th" type="number" inputmode="numeric" value="' + esc(d.threshold == null ? '' : d.threshold) + '" placeholder="' + App.DB().settings.lowStock + '"></div></div>' +
      '<div class="row"><div class="field"><label>' + t('com.category') + '</label><input class="inp" id="i_cat" list="catlist" value="' + esc(d.category) + '" placeholder="Snacks">' +
      '<datalist id="catlist">' + cats.map((c) => '<option value="' + esc(c) + '">').join('') + '</datalist></div>' +
      '<div class="field"><label>' + t('inv.gstRate') + '</label><select class="inp" id="i_gst">' +
      [0, 5, 12, 18, 28].map((g) => '<option value="' + g + '" ' + (+d.gst === g ? 'selected' : '') + '>' + g + '%</option>').join('') + '</select></div></div>' +
      '<div class="field"><label>' + t('inv.barcode') + '</label><div class="row">' +
      '<input class="inp" id="i_bc" value="' + esc(d.barcode) + '" placeholder="8901491101837">' +
      '<button class="btn" id="i_scan" aria-label="' + esc(App.uiText('Scan barcode')) + '" style="flex:0 0 auto">' + App.icon('scan',16) + '</button></div></div>' +
      '<label class="switch"><input type="checkbox" id="i_fav" ' + (d.fav ? 'checked' : '') + '><span class="sw"></span>' +
      '<span><span class="lbl"> ' + t('inv.fav') + '</span></span></label>' +
      (it && it.batches && it.batches.length ? '<div class="sec-title">' + t('inv.batches') + '</div>' +
        it.batches.slice().sort((a, b) => (a.expiry || '9999') < (b.expiry || '9999') ? -1 : 1).map((b) =>
          '<div class="kv"><span>' + (b.expiry ? ' ' + App.fmtD(new Date(b.expiry + 'T00:00')) : App.uiText('No expiry')) + '</span><b>' + b.qty + '</b></div>').join('') : '') +
      '</div>');

    App.modal({
      title: it ? '' + esc(it.name) : '' + t('inv.addItem'), body,
      buttons: [
        it ? { label: App.uiText('Delete item'), cls: 'danger', keepOpen: true, fn: (api) => { removeItem(it.id).then((ok) => { if (ok) api.close(); }); } } : null,
        { label: t('com.cancel'), cls: 'ghost' },
        {
          label: t('com.save'), cls: 'pri', fn: async () => {
            App.requirePermission('edit_inventory');
            const name = App.$('#i_name', body).value.trim();
            const price = parseFloat(App.$('#i_price', body).value);
            if (!name) { App.toast('err', App.uiText('Name is required')); return false; }
            if (!(price >= 0)) { App.toast('err', App.uiText('Price is required')); return false; }
            const stock = it ? null : parseFloat(App.$('#i_stock', body).value) || 0;
            if (stock !== null) App.domain.quantityUnits(stock);
            const rec = it || { id: App.uid('it'), storeId: App.S(), batches: [], at: Date.now() };
            if(!it&&App.$('#i_unit',body).value){const unit=App.$('#i_unit',body).value;rec.unit=unit;rec.quantitySpec={version:1,unit,...(unit==='pack'?{packSize:Number(App.$('#i_packSize',body).value),packUnit:App.$('#i_packUnit',body).value}:{})};App.DB().quantityVersion=1;}
            rec.name = name;
            rec.nameHi = App.$('#i_hi', body).value.trim();
            rec.alias = App.$('#i_alias', body).value.trim();
            rec.price = App.round2(price);
            rec.cost = App.round2(parseFloat(App.$('#i_cost', body).value) || 0);
            if (stock !== null) rec.stock = stock;
            const th = App.$('#i_th', body).value.trim();
            rec.threshold = th === '' ? null : +th;
            rec.category = App.$('#i_cat', body).value.trim();
            rec.gst = +App.$('#i_gst', body).value;
            rec.barcode = App.$('#i_bc', body).value.trim();
            rec.emoji = d.emoji;
            rec.fav = App.$('#i_fav', body).checked;
            if (!it) App.DB().items.push(rec);
            App.log(it ? 'item' : 'item', (it ? 'Updated ' : 'Added ') + rec.name);
            (await App.save({ op: 'item' }));
            App.toast('ok', t('inv.saved'), rec.name);
            done && done(rec);
          }
        }
      ]
    });

    body.addEventListener('click', (e) => {
      const em = e.target.closest('[data-e]');
      if (em) { d.emoji = em.dataset.e; App.$$('[data-e]', body).forEach((x) => x.classList.toggle('sel', x.dataset.e === d.emoji)); }
      if (e.target.closest('#i_scan')) {
        App.prompt(t('inv.barcode'), App.uiText('Type or paste the barcode'), { value: App.$('#i_bc', body).value })
          .then((v) => { if (v != null) App.$('#i_bc', body).value = v.trim(); });
      }
    });
  };

  function removeItem(id) {
    App.requirePermission('edit_inventory');
    const it = App.item(id);
    return App.confirm(t('com.delete') + '?', it.name + ' will be hidden from billing. Past bills keep their record.', { danger: true, ok: t('com.delete') })
      .then(async (ok) => {
        if (!ok) return false;
        it.deleted = true;
        App.log('item', 'Removed ' + it.name);
        (await App.save({ op: 'item' }));
        App.toast('ok', t('inv.deleted'), it.name);
        return true;
      });
  }

  /* ───────── restock ───────── */
  App.restockModal = function (id) {
    App.requirePermission('restock');
    const context = App.context();
    const it = App.item(id);
    const body = App.el('<div style="text-align:center">' +
      '<div style="display:flex;justify-content:center">' + App.mark(it, 'lg') + '</div>' +
      '<h3 style="margin:6px 0 2px">' + esc(App.itemName(it)) + '</h3>' +
      '<p class="muted" style="font-size:13px">' + t('com.stock') + ': <b class="num">' + App.itemStock(it) + '</b></p>' +
      '<div class="chip-row" style="justify-content:center;margin:16px 0 6px">' +
      [5, 10, 20, 50, 100].map((n) => '<button class="chip tap pri" data-q="' + n + '" style="padding:9px 15px;font-size:14px">+' + n + '</button>').join('') + '</div>' +
      '<div class="row" style="margin-top:14px;text-align:left">' +
      '<div class="field"><label>' + t('com.qty') + '</label><input class="inp num" id="r_q" type="number" inputmode="numeric" value="10"></div>' +
      (App.isOwner() ? '<div class="field"><label>' + t('com.cost') + ' ₹</label><input class="inp num" id="r_c" type="number" inputmode="decimal" value="' + (it.cost || '') + '"></div>' : '') + '</div>' +
      '<div class="field" style="text-align:left"><label>' + t('inv.expiry') + ' <span class="muted">(' + t('com.optional') + ')</span></label>' +
      '<input class="inp" id="r_e" type="date"></div></div>');

    const m = App.modal({
      title: '' + t('inv.restock'), body,
      buttons: [{ label: t('com.cancel'), cls: 'ghost' }, {
        label: t('com.save'), cls: 'ok', fn: async () => {
          const q = parseFloat(App.$('#r_q', body).value) || 0;
          if (q <= 0) return false;
          (await App.actions.restock(it.id, q, App.$('#r_e', body).value, !App.isOwner() || App.$('#r_c', body).value.trim() === '' ? it.cost : Number(App.$('#r_c', body).value)));
          App.toast('ok', t('inv.restocked', { name: App.itemName(it), n: q }));
        }
      }]
    });
    body.addEventListener('click', async (e) => {
      const q = e.target.closest('[data-q]');
      if (q) {
        App.assertContext(context);
        (await App.actions.restock(it.id, +q.dataset.q, App.$('#r_e', body).value, !App.isOwner() || App.$('#r_c', body).value.trim() === '' ? it.cost : Number(App.$('#r_c', body).value)));
        App.toast('ok', t('inv.restocked', { name: App.itemName(it), n: q.dataset.q }));
        m.close();
      }
    });
  };

  // Validate every row before touching inventory; omitted numeric cells preserve existing data.
  App.importItemRows = async (rows) => {
    App.checkDataBounds(rows);
    App.requirePermission('edit_inventory');
    const staged = JSON.parse(JSON.stringify(App.DB().items)),counts=[];
    let added = 0, updated = 0;
    rows.forEach((r, index) => {
      if (!r.name || !r.name.trim()) throw new Error('CSV row ' + (index + 2) + ': name is required.');
      for (const k of ['price', 'cost', 'stock', 'gst']) if (r[k] != null) App.number(r[k], 'CSV row ' + (index + 2) + ' ' + k, 0, k === 'gst' ? 100 : 1e9);
      if (r.stock != null) App.domain.quantityUnits(r.stock);
      const matches = staged.filter((i) => !i.deleted && (!i.storeId || i.storeId === App.S()) &&
        ((r.barcode && i.barcode === r.barcode) || i.name.toLowerCase() === r.name.toLowerCase()));
      if (matches.length > 1) throw new Error('CSV row ' + (index + 2) + ': barcode and name identify different items.');
      const ex = matches[0];
      if (ex) {
        if (r.stock != null && r.stock !== App.itemStock(ex)) {
          if(ex.batches.length)throw new Error('Use Restock or Count / dispose to change batch stock for ' + ex.name + '.');
          counts.push(App.stageImportedStockCount(ex,r.stock));
        }
        for (const k of ['price', 'cost', 'stock', 'gst']) if (r[k] != null) ex[k] = k === 'stock' ? r[k] : App.round2(r[k]);
        for (const k of ['nameHi', 'category', 'barcode', 'emoji', 'alias']) if (r[k]) ex[k] = r[k];
        updated++;
      } else {
        if (r.price == null) throw new Error('CSV row ' + (index + 2) + ': a new item needs a price.');
        staged.push({ id: App.uid('it'), storeId: App.S(), name: r.name, nameHi: r.nameHi || '', alias: r.alias || '',
          price: r.price, cost: r.cost ?? 0, stock: r.stock ?? 0, category: r.category || '', barcode: r.barcode || '',
          emoji: r.emoji || '🛍️', fav: false, threshold: null, gst: r.gst ?? App.DB().settings.defaultGst, batches: [], at: Date.now() });
        added++;
      }
    });
    App.DB().items = staged;
    if(counts.length)(App.DB().stockAdjustments ||= []).push(...counts);
    App.log('import', added + ' items imported, ' + updated + ' updated');
    (await App.save({ op: 'import' }));
    return { added, updated };
  };

  /* ───────── CSV import ───────── */
  function importCSV() {
    App.requirePermission('edit_inventory');
    const body = App.el('<div>' +
      '<div class="alert info"><span class="ai"></span><span>' + t('inv.csvHelp') + '<br><small>First row must be the header. Existing barcodes/names get updated.</small></span></div>' +
      '<div class="field" style="margin-top:14px"><label>CSV file</label><input class="inp" type="file" id="csvf" accept=".csv,text/csv"></div>' +
      '<button class="btn sm ghost" id="dlTemplate">⬇ Download template</button>' +
      '<div id="prev" style="margin-top:14px"></div></div>');
    let rows = null;

    const m = App.modal({
      title: '' + t('inv.import'), body,
      buttons: [{ label: t('com.cancel'), cls: 'ghost' }, {
        label: t('com.add'), cls: 'pri', fn: async () => {
          if (!rows || !rows.length) { App.toast('err', 'Pick a CSV first'); return false; }
          const { added, updated } = (await App.importItemRows(rows));
          App.toast('ok', 'Import done', added + ' added · ' + updated + ' updated');
        }
      }]
    });

    App.$('#dlTemplate', body).onclick = () => App.download(
      App.toCSV([['name', 'nameHi', 'price', 'cost', 'stock', 'category', 'barcode', 'gst'],
      ['Parle-G Biscuit', 'पारले-जी', 10, 8, 50, 'Biscuits', '8901719101007', 5]]),
      'dukaan-items-template.csv', 'text/csv');

    App.$('#csvf', body).onchange = (e) => {
      const file = e.target.files[0]; if (!file) return;
      try { App.checkFile(file); } catch (e) { App.reportError(e); return; }
      const context = App.context();
      const fr = new FileReader();
      fr.onload = () => {
        rows = null;
        if (!App.contextValid(context)) return;
        const grid = App.parseCSV(String(fr.result));
        if (grid.length < 2) { App.$('#prev', body).innerHTML = '<div class="alert bad"><span class="ai"></span><span>Need a header row plus at least one item.</span></div>'; return; }
        const head = grid[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, ''));
        const col = (names) => { for (const n of names) { const i = head.indexOf(n); if (i > -1) return i; } return -1; };
        const ci = { name: col(['name', 'item', 'itemname', 'product']), hi: col(['namehi', 'hindi', 'hindiname']), price: col(['price', 'mrp', 'sellprice', 'rate']), cost: col(['cost', 'costprice', 'buyprice', 'purchase']), stock: col(['stock', 'qty', 'quantity']), cat: col(['category', 'cat', 'type']), bc: col(['barcode', 'ean', 'code']), gst: col(['gst', 'tax', 'gstrate']), emoji: col(['emoji', 'icon']) };
        if (ci.name < 0) { App.$('#prev', body).innerHTML = '<div class="alert bad"><span class="ai"></span><span>No <b>name</b> column found.</span></div>'; return; }
        rows = grid.slice(1).map((r) => ({
          name: (r[ci.name] || '').trim(), nameHi: ci.hi > -1 ? (r[ci.hi] || '').trim() : '',
          price: ci.price > -1 && (r[ci.price] || '').trim() !== '' ? Number(r[ci.price]) : null,
          cost: ci.cost > -1 && (r[ci.cost] || '').trim() !== '' ? Number(r[ci.cost]) : null,
          stock: ci.stock > -1 && (r[ci.stock] || '').trim() !== '' ? Number(r[ci.stock]) : null,
          category: ci.cat > -1 ? (r[ci.cat] || '').trim() : '',
          barcode: ci.bc > -1 ? (r[ci.bc] || '').trim() : '',
          gst: ci.gst > -1 && (r[ci.gst] || '').trim() !== '' ? Number(r[ci.gst]) : null,
          emoji: ci.emoji > -1 ? (r[ci.emoji] || '').trim() : ''
        })).filter((r) => r.name);
        App.$('#prev', body).innerHTML = '<div class="alert ok"><span class="ai"></span><span><b>' + rows.length + '</b> items ready to import.</span></div>' +
          '<div class="tbl-wrap" style="max-height:200px;overflow:auto;margin-top:10px"><table class="tbl"><thead><tr><th>Name</th><th class="r">Price</th><th class="r">Stock</th></tr></thead><tbody>' +
          rows.slice(0, 30).map((r) => '<tr><td>' + esc(r.name) + '</td><td class="r num">' + (r.price || 0) + '</td><td class="r num">' + (r.stock || 0) + '</td></tr>').join('') +
          '</tbody></table></div>';
      };
      fr.readAsText(file);
    };
  }

  /* ───────── render ───────── */
  App.views.inventory = function (main) {
    const all = App.items();
    const cats = Array.from(new Set(all.map((i) => i.category).filter(Boolean))).sort();
    const out = all.filter((i) => App.stockState(i) === 'out');
    const low = all.filter((i) => App.stockState(i) === 'low');
    const exp = App.expiringBatches();

    let list = all;
    if (f.view === 'out') list = out;
    else if (f.view === 'low') list = low;
    else if (f.view === 'fav') list = all.filter((i) => i.fav);
    if (f.cat) list = list.filter((i) => i.category === f.cat);
    if (f.q) {
      const q = f.q.toLowerCase();
      list = list.filter((i) => (i.name + ' ' + (i.nameHi || '') + ' ' + (i.barcode || '') + ' ' + (i.category || '')).toLowerCase().indexOf(q) > -1);
    }
    list = list.sort((a, b) => {
      const sa = App.stockState(a), sb = App.stockState(b);
      const w2 = { out: 0, low: 1, ok: 2 };
      return w2[sa] - w2[sb] || a.name.localeCompare(b.name);
    });

    main.innerHTML =
      '<div class="page-head"><div><h1> ' + t('inv.title') + '</h1>' +
      '<div class="sub">' + (App.isOwner() ? t('inv.sub', { n: all.length, v: money(App.stats.stockValue()) }) : all.length + ' items') + '</div></div>' +
      '<div class="spacer"></div>' +
      '<div class="btn-row"><button class="btn sm" id="impCsv"> ' + t('inv.import') + '</button>' +
      '<button class="btn sm" id="expCsv"> CSV</button>' +
      (App.isOwner()?'<button class="btn sm" id="adjustHistory">Stock adjustments</button>':'')+
      (App.isOwner()?'<button class="btn sm" id="transferHistory">Stock transfers</button>':'')+
      '<button class="btn pri" id="addItem"> ' + t('inv.addItem') + '</button></div></div>' +

      ((out.length || low.length || exp.length) ?
        '<div class="grid g-3" style="margin-bottom:18px">' +
        (out.length ? '<div class="stat bad"><span class="em"></span><div class="k">' + t('inv.out') + '</div><div class="v" style="color:var(--bad)">' + out.length + '</div>' +
          '<div class="d muted">' + esc(out.slice(0, 3).map((i) => App.itemName(i)).join(', ')) + (out.length > 3 ? ' +' + (out.length - 3) : '') + '</div></div>' : '') +
        (low.length ? '<div class="stat" style="border-color:color-mix(in srgb,var(--warn) 34%,var(--line))"><span class="em"></span><div class="k">' + t('inv.low') + '</div><div class="v" style="color:var(--warn)">' + low.length + '</div>' +
          '<div class="d muted">' + esc(low.slice(0, 3).map((i) => App.itemName(i)).join(', ')) + (low.length > 3 ? ' +' + (low.length - 3) : '') + '</div></div>' : '') +
        (exp.length ? '<div class="stat" style="border-color:color-mix(in srgb,var(--ink-2) 34%,var(--line))"><span class="em"></span><div class="k">' + t('inv.expiring') + '</div><div class="v" style="color:var(--ink-2)">' + exp.length + '</div>' +
          '<div class="d muted">' + esc(App.itemName(exp[0].item)) + ' · ' + (exp[0].days <= 0 ? 'expired' : exp[0].days + 'd') + '</div></div>' : '') +
        '</div>' : '<div class="alert ok" style="margin-bottom:16px"><span class="ai"></span><span>' + t('inv.allGood') + '</span></div>') +

      '<div class="pos-tools">' +
      '<div class="search-wrap"><span class="mag"></span><input class="inp" id="invQ" placeholder="' + t('com.search') + '" value="' + esc(f.q) + '"></div></div>' +
      '<div class="chip-row" style="margin-bottom:14px">' +
      [['all', t('com.all') + ' (' + all.length + ')'], ['fav', '' + t('pos.favorites')], ['low', '' + t('inv.low') + ' (' + low.length + ')'], ['out', '' + t('inv.out') + ' (' + out.length + ')']]
        .map((v) => '<button class="chip tap ' + (f.view === v[0] ? 'sel' : '') + '" data-v="' + v[0] + '">' + v[1] + '</button>').join('') +
      (cats.length ? '<span style="width:1px;background:var(--line);margin:0 4px"></span>' +
        cats.map((c) => '<button class="chip tap ' + (f.cat === c ? 'sel' : '') + '" data-ic="' + esc(c) + '">' + esc(c) + '</button>').join('') : '') +
      '</div>' +

      (exp.length ? '<div class="card" style="margin-bottom:16px;border-color:color-mix(in srgb,var(--ink-2) 30%,var(--line))">' +
        '<div class="sec-title" style="margin-top:0"> ' + t('inv.expiring') + '</div>' +
        exp.slice(0, 6).map((e2) => '<div class="list-row">' + App.mark(e2.item) +
          '<span style="flex:1"><b>' + esc(App.itemName(e2.item)) + '</b><br><small class="muted">' + t('inv.fifoHint', { date: App.fmtD(e2.at), n: e2.batch.qty }) + '</small></span>' +
          '<span class="chip ' + (e2.days <= 3 ? 'bad' : e2.days <= 14 ? 'warn' : '') + '">' + (e2.days < 0 ? 'expired' : e2.days + ' d') + '</span></div>').join('') +
        '</div>' : '') +

      '<div class="card pad-0"><div class="tbl-wrap"><table class="tbl"><thead><tr>' +
      '<th>' + t('com.name') + '</th><th>' + t('com.category') + '</th><th class="r">' + t('com.price') + '</th>' +
      (App.isOwner() ? '<th class="r">' + t('com.cost') + '</th>' : '') + '<th class="r">' + t('com.stock') + '</th><th></th></tr></thead><tbody>' +
      (list.length ? list.map((i) => {
        const s = App.itemStock(i), state = App.stockState(i);
        const th = i.threshold != null ? i.threshold : App.DB().settings.lowStock;
        const pct = Math.max(3, Math.min(100, (s / Math.max(th * 3, 1)) * 100));
        return '<tr data-row="' + i.id + '">' +
          '<td><div style="display:flex;align-items:center;gap:10px">' + App.mark(i) +
          '<span><b>' + esc(App.itemName(i)) + '</b>' + (i.fav ? '' : '') +
          (i.barcode ? '<br><small class="muted num" style="font-size:11px">' + esc(i.barcode) + '</small>' : '') + '</span></div></td>' +
          '<td><span class="chip">' + esc(i.category || '—') + '</span></td>' +
          '<td class="r num"><b>' + money(i.price) + '</b></td>' +
          (App.isOwner() ? '<td class="r num muted">' + (i.cost ? money(i.cost) : '—') + '</td>' : '') +
          '<td class="r" style="min-width:110px"><b class="num" style="color:' + (state === 'out' ? 'var(--bad)' : state === 'low' ? 'var(--warn)' : 'inherit') + '">' + s + '</b>' +
          '<div class="pbar" style="margin-top:5px"><i class="' + (state === 'out' ? 'r' : state === 'low' ? '' : 'g') + '" style="width:' + pct + '%"></i></div></td>' +
          '<td class="r" style="white-space:nowrap"><button class="btn xs" data-restock="' + i.id + '">+ ' + t('inv.restock') + '</button> ' +
          (App.isOwner()?'<button class="btn xs" data-adjust="'+i.id+'">Count / dispose</button> ':'')+
          '<button class="btn xs ghost" data-edit="' + i.id + '">' + App.icon('edit',16) + '</button></td></tr>';
      }).join('') : '<tr><td colspan="6">' + App.emptyState('', 'No items here', 'Add your first item or import a CSV') + '</td></tr>') +
      '</tbody></table></div></div>';

    if (!App.can('edit_inventory')) App.$$('#addItem, #impCsv, #expCsv, [data-edit]', main).forEach((el) => { el.hidden = true; });
    const Q = App.$('#invQ');
    Q.addEventListener('input', () => { f.q = Q.value; App.render(); setTimeout(() => { const n = App.$('#invQ'); if (n) { n.focus(); n.setSelectionRange(n.value.length, n.value.length); } }, 0); });

    main.addEventListener('click', (e) => {
      const adjust=e.target.closest('[data-adjust]');if(adjust)return App.stockAdjustmentDialog(adjust.dataset.adjust);
      if(e.target.closest('#adjustHistory'))return App.stockAdjustmentHistory();
      if(e.target.closest('#transferHistory'))return App.transferHistory();
      const v = e.target.closest('[data-v]'), c = e.target.closest('[data-ic]');
      const r = e.target.closest('[data-restock]'), ed = e.target.closest('[data-edit]');
      if (v) { f.view = v.dataset.v; return App.render(); }
      if (c) { f.cat = f.cat === c.dataset.ic ? '' : c.dataset.ic; return App.render(); }
      if (r) return App.restockModal(r.dataset.restock);
      if (ed) return App.editItem(ed.dataset.edit);
      if (e.target.closest('#addItem')) return App.editItem(null);
      if (e.target.closest('#impCsv')) return importCSV();
      if (e.target.closest('#expCsv')) {
        App.requirePermission('edit_inventory');
        const rows = [['name', 'nameHi', 'price', 'cost', 'stock', 'category', 'barcode', 'gst']];
        all.forEach((i) => rows.push([i.name, i.nameHi || '', i.price, i.cost, App.itemStock(i), i.category || '', i.barcode || '', i.gst]));
        App.download(App.toCSV(rows), 'dukaan-inventory-' + App.dayKey(Date.now()) + '.csv', 'text/csv');
        App.toast('ok', 'Inventory exported');
      }
    });
  };
})(window);
