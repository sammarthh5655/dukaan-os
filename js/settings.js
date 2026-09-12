/* ══════════════════════════════════════════════════════════
   Dukaan OS — Settings, staff, stores, PIN, backup & restore
   ══════════════════════════════════════════════════════════ */
(function (w) {
  'use strict';
  const App = w.App, esc = App.esc, money = App.money, t = (k, v) => App.t(k, v);

  const RECEIPT_THEMES = [['saffron', 'Saffron'], ['tulsi', 'Tulsi'], ['indigo', 'Indigo'], ['ink', 'Ink']];

  /* ───────── backup ───────── */
  async function exportAll() {
    const context = App.context();
    if (!await App.auth.verifyOwner()) return;
    const password = await App.prompt(window.App.moneyLiteral('Encrypt backup'), window.App.moneyLiteral('Choose a backup password (12–256 characters)'), {
      type: 'password', hint: window.App.moneyLiteral('Keep this password separately. A forgotten backup password cannot be recovered.') });
    if (password == null) return;
    const confirm = await App.prompt(window.App.moneyLiteral('Confirm backup password'), window.App.moneyLiteral('Enter the backup password again'), { type: 'password' });
    if (confirm == null) return;
    if (password !== confirm) throw new Error(window.App.moneyLiteral('Backup passwords do not match.'));
    App.assertContext(context); App.auth.requireFresh();
    const encrypted = await App.backups.encrypt(App.backups.capture(), password);
    App.assertContext(context); App.auth.requireFresh();
    App.download(JSON.stringify(encrypted), 'dukaan-backup-' + App.dayKey(Date.now()) + '.json', 'application/json');
    App.DB().settings.lastBackup = Date.now();
    App.log('sys', 'Encrypted backup exported');
    (await App.save({ sync: false, render: false }));
    App.toast('ok', window.App.moneyLiteral('Encrypted backup saved'), window.App.moneyLiteral('Keep the file and its password safe. Staff PINs are not included.'));
  }

  async function exportLedgerCSV() {
    const context = App.context();
    if (!await App.auth.verifyOwner()) return;
    App.assertContext(context); App.auth.requireFresh();
    if (!await App.confirm(window.App.moneyLiteral('Export readable customer data?'), window.App.moneyLiteral('This CSV contains names, phone numbers and balances. Anyone with the file can read it.'))) return;
    App.assertContext(context); App.auth.requireFresh();
    const rows = [['Type', 'Name', 'Phone', window.App.moneyLiteral('Pending'), 'Points', 'Visits', 'Total spent', 'Due since (days)']];
    App.customers().forEach(c => rows.push([window.App.moneyLiteral('Customer'), c.name, c.phone || '', c.balance || 0, Math.floor(c.points || 0), c.visits || 0, c.spend || 0, c.dueSince ? App.daysBetween(c.dueSince, Date.now()) : 0]));
    App.suppliers().forEach(s => rows.push([window.App.moneyLiteral('Supplier'), s.name, s.phone || '', -(s.balance || 0), '', '', '', s.dueSince ? App.daysBetween(s.dueSince, Date.now()) : 0]));
    App.download(App.toCSV(rows), 'dukaan-ledger-' + App.dayKey(Date.now()) + '.csv', 'text/csv');
    App.log('sys', 'Ledger CSV exported'); (await App.save({ sync: false }));
  }

  async function importBackup(file) {
    App.requirePermission('settings'); App.checkFile(file);
    const context = App.context();
    const raw = await file.text();
    App.assertContext(context);
    let p;
    try { p = JSON.parse(raw); } catch (e) { throw new Error(window.App.moneyLiteral('Not a valid backup file.')); }
    let data;
    if (p && p.format === 'encrypted') {
      const password = await App.prompt(window.App.moneyLiteral('Open encrypted backup'), window.App.moneyLiteral('Enter the backup password'), { type: 'password' });
      if (password == null) return;
      data = await App.backups.decrypt(p, password);
    } else {
      if (p && p.data && (p.app !== 'DukaanOS' || p.v !== 2)) throw new Error(window.App.moneyLiteral('Unsupported backup format.'));
      data = App.backups.validatePayload(p && p.data ? p.data : p);
    }
    App.assertContext(context);
    const book = App.backups.businessData(data);
    if (!await App.confirm(window.App.moneyLiteral('Restore business records?'), window.App.moneyLiteral('Replace this shop’s records with ') + book.items.length + window.App.moneyLiteral(' items, ') + book.bills.length + window.App.moneyLiteral(' bills and ') + book.customers.length +
      window.App.moneyLiteral(' customers? Your current staff, PINs and UPI payment address will be kept. Check the backup date and totals: an old backup rolls the books back.'), { danger: true, ok: window.App.moneyLiteral('Restore') })) return;
    if (!await App.auth.verifyOwner()) return;
    App.assertContext(context); (await App.restoreBackup(data));
    App.log('sys', 'Business records restored; current access and payment settings retained'); (await App.save({ sync: false }));
    App.toast('ok', window.App.moneyLiteral('Restored'), window.App.moneyLiteral('Reloading…'));
    setTimeout(() => location.reload(), 700);
  }

  /* ───────── PIN ───────── */
  App.setPin = async function () {
    App.requirePermission('settings');
    const context = App.context();
    if (!await App.auth.verifyOwner()) return;
    App.prompt(t('set.setPin'), t('set.setPin'), { type: 'tel', placeholder: '••••' }).then(async (p) => {
      if (p == null) return;
      p = String(p).replace(/\D/g, '');
      if (p.length !== 4) { App.toast('err', 'PIN must be exactly 4 digits'); return; }
      App.assertContext(context); App.auth.requireFresh();
      App.DB().settings.pin = p;
      App.DB().settings.pinOn = true;
      (await App.save({ sync: false }));
      App.toast('ok', 'PIN set', 'You will be asked for it next time');
    });
  };

  /* ───────── staff ───────── */
  async function editStaff(id) {
    App.requirePermission('settings');
    if(!id&&App.DB().storeAccessVersion!==1){App.toast('info','Review store assignments before adding staff');return App.storeAssignmentsDialog();}
    const context = App.context();
    if (!await App.auth.verifyOwner()) return;
    App.assertContext(context);
    const db = App.DB();
    const s = id ? db.staff.find((x) => x.id === id) : null;
    const body = App.el('<div>' +
      '<div class="field"><label>' + t('com.name') + '</label><input class="inp" id="st_n" value="' + esc(s ? s.name : '') + '" placeholder="Ravi" autofocus></div>' +
      '<div class="field"><label>' + t('set.role') + '</label><select class="inp" id="st_r">' +
      '<option value="cashier">' + t('set.cashier') + ' — can bill & take payments</option>' +
      '<option value="owner">' + t('set.owner') + ' — full access</option></select></div>' +
      '<div class="field"><label>PIN (4 digits, ' + t('com.optional') + ')</label><input class="inp num" id="st_p" type="password" maxlength="4" value="' + esc(s ? s.pin : '') + '"></div>' +
      '<div class="alert info"><span class="ai"></span><span>Cashiers can bill, restock and take payments. They cannot see full analytics, delete bills, or change settings.</span></div></div>');
    if (s) App.$('#st_r', body).value = s.role;
    App.modal({
      title: s ? '' + esc(s.name) : '' + t('set.addStaff'), body,
      buttons: [
        s && s.id !== 'sf_owner' ? {
          label: '', cls: 'danger', keepOpen: true, fn: (api) => {
            App.confirm(t('com.delete') + '?', s.name + ' will lose access.', { danger: true }).then(async (ok) => {
              if (!ok) return;
              App.assertContext(context); App.auth.requireFresh();
              db.staff = db.staff.filter((x) => x.id !== s.id);
              if (db.session.staffId === s.id) db.session.staffId = db.staff[0].id;
              (await App.save({ sync: false })); api.close();
            });
          }
        } : null,
        { label: t('com.cancel'), cls: 'ghost' },
        {
          label: t('com.save'), cls: 'pri', fn: async () => {
            const n = App.$('#st_n', body).value.trim();
            if (!n) { App.toast('err', App.uiText('Name is required')); return false; }
            App.requirePermission('settings');
            App.assertContext(context); App.auth.requireFresh();
            const role = App.$('#st_r', body).value, pin = App.$('#st_p', body).value.trim();
            if (pin && !/^\d{4}$/.test(pin)) throw new Error('PIN must be exactly four digits.');
            if (role === 'owner' && db.staff.some((x) => x.role === 'cashier') && !pin) throw new Error('Set an owner PIN before using cashier accounts.');
            if (s && s.role === 'owner' && role !== 'owner' && !db.staff.some((x) => x.id !== s.id && x.role === 'owner')) throw new Error('Keep at least one owner.');
            const rec = s || { id: App.uid('sf'), active: true,storeIds:[] };
            rec.name = n; rec.role = App.$('#st_r', body).value;
            rec.pin = App.$('#st_p', body).value.replace(/\D/g, '').slice(0, 4);
            if (!s) db.staff.push(rec);
            (await App.save({ sync: false }));
            App.toast('ok', t('set.saved'), rec.name);
          }
        }]
    });
  }

  App.switchStaff = function () {
    App.requireAccess();
    const context = App.context();
    const db = App.DB();
    const body = App.el('<div>' + db.staff.filter(s => s.active !== false&&App.canStore(App.S(),s)).map((s, i) =>
      '<button class="list-row" data-sw="' + s.id + '" style="width:100%;text-align:left">' + App.avatarFor(s.name, i) +
      '<span style="flex:1"><b>' + esc(s.name) + '</b><br><small class="muted">' + t('set.' + s.role) + (s.pin ? ' ·' : '') + '</small></span>' +
      (db.session.staffId === s.id ? '<span class="chip ok">✓</span>' : '') + '</button>').join('') + '</div>');
    const m = App.modal({ title: '' + t('set.switchStaff'), body, foot: false });
    body.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-sw]'); if (!b) return;
      const s = db.staff.find((x) => x.id === b.dataset.sw);
      if (!s || s.active === false) return;
      if (s.role === 'cashier' && db.staff.some((x) => x.role === 'owner' && !/^\d{4}$/.test(x.pin || ''))) {
        App.toast('warn', 'Set an owner PIN first', 'Every owner needs a four-digit staff PIN before switching to a cashier.'); return;
      }
      if (!App.isOwner() && s.role === 'owner' && !s.pin) { App.toast('err', 'Owner PIN is required'); return; }
      const go = async () => {
        App.assertContext(context);
        if (s.active === false) throw new Error('Staff member is inactive.');
        if(!App.canStore(App.S(),s))throw new Error('Staff member is not assigned to this store.');
        App.invalidateContext();
        db.session.staffId = s.id;
        App.log('sys', 'Shift start: ' + s.name);
        (await App.save({ sync: false }));
        App.toast('ok', t('lock.welcome'), s.name);
        m.close(); App.go('billing');
      };
      if (s.pin) {
        App.prompt('PIN for ' + s.name, 'Enter 4-digit PIN', { type: 'tel' }).then(async (p) => {
          if (p == null) return;
          try { App.auth.checkPin(String(p), s.pin); (await go()); } catch (e) { App.reportError(e); }
        });
      } else (await go());
    });
  };

  /* ───────── stores ───────── */
  App.storePicker = function () {
    App.requireAccess();
    const db = App.DB();
    const body = App.el('<div>' + db.stores.filter(s=>App.canStore(s.id)).map((s) => {
      const bills = db.bills.filter((b) => b.storeId === s.id && !b.void);
      const today = bills.filter((b) => App.isToday(b.at)).reduce((x, b) => x + b.total, 0);
      return '<button class="list-row" data-st="' + s.id + '" style="width:100%;text-align:left">' +
        '<span class="rank" style="background:var(--surface-3)"></span>' +
        '<span style="flex:1"><b>' + esc(s.name) + '</b>'+(App.isOwner()?'<br><small class="muted">' + bills.length + ' bills · ' + money(today) + ' today</small>':'')+'</span>' +
        (db.settings.activeStore === s.id ? '<span class="chip ok">✓</span>' : '') + '</button>';
    }).join('') +
      (App.isOwner()?'<button class="btn block sm" id="addStore" style="margin-top:12px"> ' + t('set.addStore') + '</button>':'') +
      (App.isOwner()&&db.stores.length > 1 ? '<div class="alert info" style="margin-top:12px"><span class="ai"></span><span>Combined across all stores: <b>' +
        money(db.bills.filter((b) => !b.void && App.isToday(b.at)).reduce((x, b) => x + b.total, 0)) + '</b> today</span></div>' : '') + '</div>');
    const m = App.modal({ title: '' + t('set.stores'), body, foot: false });
    body.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-st]');
      if (b) { await App.actions.switchStore(b.dataset.st);m.close();App.render();App.toast('ok','Switched store');return; }
      if (e.target.closest('#addStore')) {
        App.requirePermission('settings');
        App.prompt(t('set.addStore'), t('com.name'), { placeholder: 'Branch 2' }).then(async (n) => {
          if (!n || !n.trim()) return;
          const st = { id: App.uid('st'), name: n.trim(), address: '' };
          App.requirePermission('settings');
          db.stores.push(st); db.settings.activeStore = st.id;
          (await App.save({ sync: false })); App.posClear(); m.close(); App.render();
          App.toast('ok', 'Store added', n + ' — start by adding items');
        });
      }
    });
  };

  /* ───────── view ───────── */
  App.views.settings = function (main) {
    App.requirePermission('settings');
    const db = App.DB(), st = db.settings;
    const owner = App.isOwner();
    const account = App.auth.currentAccount();
    const gateOn = App.auth.gateOn();
    const isBlank = App.isBlankAccount();

    main.innerHTML =
      '<div class="page-head"><div><h1> ' + t('set.title') + '</h1>' +
      '<div class="sub">' + esc(st.shopName) + ' · ' + esc((App.me() || {}).name) + '</div></div></div>' +

      '<div class="grid g-2">' +

      /* shop */
      '<div class="card"><div class="sec-title" style="margin-top:0"> ' + t('set.shop') + '</div>' +
      '<div class="field"><label>' + t('set.shopName') + '</label><input class="inp" data-s="shopName" value="' + esc(st.shopName) + '"></div>' +
      '<div class="row"><div class="field"><label>' + t('com.phone') + '</label><input class="inp num" data-s="shopPhone" value="' + esc(st.shopPhone) + '"></div>' +
      '<div class="field"><label>' + t('set.upi') + '</label><input class="inp" data-s="upiId" value="' + esc(st.upiId) + '" placeholder="shop@upi"></div></div>' +
      '<div class="field"><label>' + t('set.address') + '</label><input class="inp" data-s="address" value="' + esc(st.address) + '"></div>' +
      '<div class="field"><label>' + t('set.gstin') + '</label><input class="inp num" data-s="gstin" value="' + esc(st.gstin) + '" placeholder="22AAAAA0000A1Z5"></div>' +
      (st.upiId ? '<div style="text-align:center;padding:10px;background:var(--surface-2);border-radius:14px">' +
        w.QR.svg(w.QR.upiUri(st.upiId, st.shopName, 0, ''), { size: 150, border: 2 }) +
        '<p class="muted" style="font-size:12px;margin-top:6px">Your shop UPI QR — print and stick it at the counter</p>' +
        '<button class="btn xs" id="dlQr" style="margin-top:6px">⬇ Download QR</button></div>'
        : '<div class="alert info"><span class="ai"></span><span>Add your UPI ID to print a payment QR on every bill.</span></div>') +
      '</div>' +

      /* preferences */
      '<div class="card"><div class="sec-title" style="margin-top:0"> Preferences</div>' +
      '<div class="field"><label>' + t('set.lang') + '</label><div class="chip-row">' +
      '<button class="chip tap ' + (App.lang() === 'en' ? 'sel' : '') + '" data-lang="en"> English</button>' +
      '<button class="chip tap ' + (App.lang() === 'hi' ? 'sel' : '') + '" data-lang="hi"> हिन्दी</button></div></div>' +
      '<label class="switch"><input type="checkbox" data-t="theme" ' + (st.theme === 'dark' ? 'checked' : '') + '><span class="sw"></span>' +
      '<span><span class="lbl"> ' + t('set.theme') + '</span></span></label>' +
      '<label class="switch"><input type="checkbox" data-t="gstEnabled" ' + (st.gstEnabled ? 'checked' : '') + '><span class="sw"></span>' +
      '<span><span class="lbl"> ' + t('set.gstOn') + '</span><br><span class="hint">Adds GST to every bill and unlocks the tax report</span></span></label>' +
      '<div class="row"><div class="field"><label>' + t('set.lowStock') + '</label><input class="inp num" data-s="lowStock" type="number" value="' + st.lowStock + '"></div>' +
      '<div class="field"><label>' + t('set.dailyTarget') + ' ₹</label><input class="inp num" data-s="dailyTarget" type="number" value="' + st.dailyTarget + '"></div></div>' +
      '<div class="row"><div class="field"><label>Default GST %</label><select class="inp" data-s="defaultGst">' +
      [0, 5, 12, 18, 28].map((g) => '<option value="' + g + '" ' + (+st.defaultGst === g ? 'selected' : '') + '>' + g + '%</option>').join('') + '</select></div>' +
      '<div class="field"><label>' + t('set.loyaltyRate') + '</label><input class="inp num" data-s="loyaltyRate" type="number" value="' + st.loyaltyRate + '"></div></div>' +
      '<div class="field"><label>' + t('set.receipt') + '</label><div class="chip-row">' +
      RECEIPT_THEMES.map((r) => '<button class="chip tap ' + (st.receiptTheme === r[0] ? 'sel' : '') + '" data-rt="' + r[0] + '">' + r[1] + '</button>').join('') + '</div></div>' +
      '</div>' +

      /* staff + stores */
      '<div class="card"><div class="sec-title" style="margin-top:0"> ' + t('set.staff') + '</div>' +
      db.staff.filter(s => s.active !== false).map((s, i) => '<div class="list-row">' + App.avatarFor(s.name, i) +
        '<span style="flex:1"><b>' + esc(s.name) + '</b><br><small class="muted">' + t('set.' + s.role) + (s.pin ? ' · PIN set' : '') + '</small></span>' +
        (db.session.staffId === s.id ? '<span class="chip ok">Active</span>' : '') +
        (owner ? '<button class="btn xs ghost" data-staff="' + s.id + '">' + App.icon('edit',16) + '</button>' : '') + '</div>').join('') +
      (owner ? '<button class="btn sm block" id="addStaff" style="margin-top:12px"> ' + t('set.addStaff') + '</button>' : '') +
      '<button class="btn sm block ghost" id="swStaff" style="margin-top:8px"> ' + t('set.switchStaff') + '</button>' +

      '<div class="sec-title"> ' + t('set.stores') + ' (' + db.stores.length + ')</div>' +
      '<div class="btn-row"><button class="btn sm" id="storeAssignments">Review store assignments</button><button class="btn sm" id="storeProfile">Store receipt and target</button></div>'+
      db.stores.map((s) => '<div class="list-row"><span class="rank"></span><span style="flex:1"><b>' + esc(s.name) + '</b></span>' +
        (st.activeStore === s.id ? '<span class="chip ok">Active</span>' : '') + '</div>').join('') +
      '<button class="btn sm block" id="mgStores" style="margin-top:12px"> Manage stores</button>' +

      '<div class="sec-title"> ' + t('set.pin') + '</div>' +
      '<label class="switch"><input type="checkbox" data-t="pinOn" ' + (st.pinOn ? 'checked' : '') + '><span class="sw"></span>' +
      '<span><span class="lbl">' + t('set.pin') + '</span><br><span class="hint">' + t('set.pinHint') + '</span></span></label>' +
      '<button class="btn sm block" id="setPin"> ' + (st.pin ? 'Change PIN' : t('set.setPin')) + '</button>' +
      '</div>' +

      /* account & security */
      '<div class="card"><div class="sec-title" style="margin-top:0"> Account &amp; security</div>' +
      (gateOn && account ?
        '<div class="kv"><span>Signed in as</span><b>@' + esc(account.username) + '</b></div>' +
        '<div class="kv"><span>Account created</span><b>' + App.fmtD(account.createdAt) + '</b></div>' +
        '<div class="btn-row" style="margin-top:12px">' +
        '<button class="btn" id="changePass"> Change password</button>' +
        '<button class="btn" id="doLogout"> Log out</button></div>' +
        '<button class="btn sm block ghost" id="gateOff" style="margin-top:12px"> Turn off login</button>' +
        '<p class="muted" style="font-size:11.5px;margin-top:6px">The shop will open without asking for a password. Your bills and stock stay exactly as they are.</p>' +
        (owner ? '<button class="btn danger block" id="delAccount" style="margin-top:16px"> Delete my account</button>' +
          '<p class="muted" style="font-size:11.5px;margin-top:6px">Permanently removes your login and every bill, item and customer. Cannot be undone.</p>' : '')
        :
        '<div class="alert info"><span class="ai"></span><span>The app opens straight to your counter — no login needed.</span></div>' +
        '<button class="btn pri block" id="gateOn" style="margin-top:12px"> <span data-core-text="Turn on login">Turn on login</span></button>' +
        '<p class="muted" style="font-size:11.5px;margin-top:6px"><span data-core-text="A local login discourages casual access. Records remain unencrypted on this device; someone controlling browser storage can bypass it."></span><br><span data-core-text="This account works only in this browser. Online sign-in and password recovery are not available yet."></span></p>'
      ) +
      '</div>' +

      /* backup */
      '<div class="card"><div class="sec-title" style="margin-top:0"> ' + t('set.backup') + '</div>' +
      '<div class="alert ' + (st.lastBackup && Date.now() - st.lastBackup < 7 * App.DAY ? 'ok' : 'warn') + '"><span class="ai">' +
      (st.lastBackup ? '' : '') + '</span><span>' +
      (st.lastBackup ? window.App.moneyLiteral('Last backup ') + App.timeAgo(st.lastBackup) : window.App.moneyLiteral('You have never taken a backup. Export an encrypted copy and keep its password safe.')) + '</span></div>' +
      '<div class="btn-row" style="margin-top:12px">' +
      '<button class="btn pri" id="expAll"> ' + t('set.exportAll') + '</button>' +
      window.App.moneyLiteral('<button class="btn" id="expLed"> Ledger CSV</button></div>') +
      '<div class="field" style="margin-top:14px"><label>' + t('set.importData') + '</label>' +
      '<input class="inp" type="file" id="impFile" accept=".json,application/json"></div>' +
      '<div class="alert info"><span class="ai"></span><span>' + t('sync.offlineHint') + '</span></div>' +
      window.App.moneyLiteral('<div class="kv"><span>Bills stored</span><b class="num">') + db.bills.length + '</b></div>' +
      window.App.moneyLiteral('<div class="kv"><span>Items</span><b class="num">') + db.items.filter((i) => !i.deleted).length + '</b></div>' +
      window.App.moneyLiteral('<div class="kv"><span>Customers</span><b class="num">') + db.customers.filter((c) => !c.deleted).length + '</b></div>' +
      window.App.moneyLiteral('<div class="kv"><span>Cloud sync unavailable; legacy queued changes</span><b class="num">') + App.sync.pending() + '</b></div>' +
      (isBlank ? '<button class="btn sm block" id="loadSample" style="margin-top:14px"> Load sample data</button>' +
        '<p class="muted" style="font-size:11.5px;margin-top:6px">Optional demo shop to explore with. Only offered while your shop is still empty — nothing is ever added on its own.</p>' : '') +
      (owner ? '<button class="btn danger block" id="resetAll" style="margin-top:16px"> ' + t('set.reset') + '</button>' : '') +
      '</div></div>' +

      '<p class="muted" style="text-align:center;font-size:12px;margin-top:26px">Dukaan OS · built for the counter, not the boardroom · v2.0</p>';

    /* text/number/select fields write straight back to settings */
    App.$$('[data-s]', main).forEach((inp) => {
      inp.addEventListener('change', async () => {
        App.requirePermission('settings');
        const context = App.context();
        const k = inp.dataset.s;
        let v = inp.value;
        if (inp.type === 'number' || k === 'lowStock' || k === 'dailyTarget' || k === 'loyaltyRate' || k === 'defaultGst') v = parseFloat(v) || 0;
        if (k === 'upiId' && !await App.auth.verifyOwner()) { inp.value = st[k]; return; }
        App.assertContext(context); App.requirePermission('settings');
        st[k] = v;
        (await App.save({ sync: false, render: false }));
        App.toast('ok', t('set.saved'));
        if (k === 'upiId' || k === 'shopName') App.render();
      });
    });
    App.$$('[data-t]', main).forEach((inp) => {
      inp.addEventListener('change', async () => {
        App.requirePermission('settings');
        const context = App.context();
        const k = inp.dataset.t;
        if (k === 'pinOn' && !inp.checked && !await App.auth.verifyOwner()) { inp.checked = st.pinOn; return; }
        App.assertContext(context); App.requirePermission('settings');
        if (k === 'pinOn' && inp.checked && !st.pin) { inp.checked = false; return App.setPin().catch(App.reportError); }
        if (k === 'theme') { st.theme = inp.checked ? 'dark' : 'light'; }
        else st[k] = inp.checked;
        (await App.save({ sync: false, render: false }));
        if (k === 'theme') App.applyTheme();
      });
    });

    main.addEventListener('click', async (e) => {
      App.requirePermission('settings');
      const l = e.target.closest('[data-lang]'), rt = e.target.closest('[data-rt]'), sf = e.target.closest('[data-staff]');
      if (l) { (await App.setLang(l.dataset.lang)); App.render(); App.applyI18n(); return; }
      if (rt) { st.receiptTheme = rt.dataset.rt; (await App.save({ sync: false })); return; }
      if (sf) return editStaff(sf.dataset.staff).catch(App.reportError);
      if (e.target.closest('#addStaff')) return editStaff(null).catch(App.reportError);
      if (e.target.closest('#swStaff')) return App.switchStaff();
      if (e.target.closest('#mgStores')) return App.storePicker();
      if(e.target.closest('#storeAssignments'))return App.storeAssignmentsDialog().catch(App.reportError);
      if(e.target.closest('#storeProfile'))return App.storeProfileDialog().catch(App.reportError);
      if (e.target.closest('#setPin')) return App.setPin().catch(App.reportError);
      if (e.target.closest('#expAll')) return await exportAll().catch(App.reportError);
      if (e.target.closest('#expLed')) return await exportLedgerCSV().catch(App.reportError);
      if (e.target.closest('#dlQr')) {
        const cv = document.createElement('canvas'); cv.width = 600; cv.height = 700;
        const c = cv.getContext('2d');
        c.fillStyle = '#fff'; c.fillRect(0, 0, 600, 700);
        c.fillStyle = '#F97316'; c.fillRect(0, 0, 600, 12);
        c.fillStyle = '#111'; c.textAlign = 'center'; c.font = '800 34px "Segoe UI",sans-serif';
        c.fillText(String(st.shopName).slice(0, 24), 300, 74);
        c.font = '500 19px "Segoe UI",sans-serif'; c.fillStyle = '#666';
        c.fillText('Scan & pay with any UPI app', 300, 108);
        w.QR.toCanvas(c, w.QR.upiUri(st.upiId, st.shopName, 0, ''), 100, 140, 400, '#111', '#fff');
        c.fillStyle = '#111'; c.font = '700 24px "Segoe UI",sans-serif';
        c.fillText(st.upiId, 300, 596);
        c.fillStyle = '#999'; c.font = '500 15px "Segoe UI",sans-serif';
        c.fillText('धन्यवाद  ·  Dukaan OS', 300, 640);
        App.downloadCanvas(cv, 'upi-qr.png');
        return;
      }
      if (e.target.closest('#resetAll')) {
        App.confirm(t('set.reset'), t('set.resetWarn'), { danger: true, ok: t('set.reset') }).then((ok) => {
          if (!ok) return;
          App.prompt('Type ERASE to confirm', 'This cannot be undone').then(async (v) => {
            if (String(v || '').trim().toUpperCase() === 'ERASE') { if (await App.auth.verifyOwner()) (await App.resetAll()); }
            else App.toast('warn', 'Cancelled — nothing was deleted');
          });
        });
      }
      if (e.target.closest('#doLogout')) return App.logout && App.logout();
      if (e.target.closest('#gateOn')) {
        const body = App.el('<div>' +
          '<p class="muted" style="font-size:13px;line-height:1.6;margin-bottom:14px"><span data-core-text="Your existing bills and items will be kept."></span><br><b>' + esc(st.shopName) + '</b></p>' +
          '<div class="field"><label data-core-text="Username">Username</label><input class="inp" autocomplete="username" id="g_user" placeholder="raj123" autocapitalize="off" spellcheck="false" autofocus></div>' +
          '<div class="field"><label data-core-text="Password">Password</label><input class="inp" id="g_pass" autocomplete="new-password" type="password" placeholder="12 to 256 characters"></div>' +
          '<div class="field"><label data-core-text="Confirm password">Confirm password</label><input class="inp" id="g_pass2" autocomplete="new-password" type="password"></div>' +
          '<div class="alert warn"><span class="ai"></span><span><span data-core-text="This account works only in this browser. Online sign-in and password recovery are not available yet."></span></span></div>' +
          '<p class="auth-err" id="g_err"></p></div>');
        App.modal({
          title: ' '+App.uiText('Turn on login'), body,
          buttons: [{ label: t('com.cancel'), cls: 'ghost' }, {
            label: App.uiText('Create login'), cls: 'pri', keepOpen: true, fn: async (api) => {
              const errEl = App.$('#g_err', body);
              errEl.textContent = '';
              try {
                const acc = await App.auth.signUp({
                  username: App.$('#g_user', body).value, password: App.$('#g_pass', body).value,
                  confirm: App.$('#g_pass2', body).value, shopName: st.shopName
                });
                (await App.auth.enableGate(acc.id));
                api.close();
                App.toast('ok', App.uiText('Login turned on'), 'You will sign in as @' + acc.username + ' from now on.');
                setTimeout(() => location.reload(), 800);
              } catch (err) { errEl.textContent = err.message || App.uiText('Something went wrong'); errEl.focus(); }
            }
          }]
        });
        return;
      }
      if (e.target.closest('#gateOff')) {
        App.confirm('Turn off login?', 'The shop will open without asking for a password. Your bills, stock and udhaar all stay exactly as they are.', { ok: 'Turn off login' })
          .then(async (ok) => {
            if (!ok || !await App.auth.verifyOwner()) return;
            (await App.persistNow());
            (await App.auth.disableGate());
            App.toast('ok', 'Login turned off');
            setTimeout(() => location.reload(), 600);
          });
        return;
      }
      if (e.target.closest('#loadSample')) {
        App.confirm('Load sample data?', 'Adds 5 weeks of realistic demo sales, items and customers so you can explore the app. Only available while your shop is empty.', { ok: 'Load sample data' })
          .then(async (ok) => { if (ok) { (await App.seed()); App.toast('ok', 'Sample data loaded', 'Explore freely — Erase everything to start clean later.'); App.render(); } });
      }
      if (e.target.closest('#changePass')) {
        const acc = App.auth.currentAccount();
        if (!acc) return;
        const body = App.el('<div>' +
          '<div class="field"><label>Current password</label><input class="inp" id="cp_old" type="password" autofocus></div>' +
          '<div class="field"><label>New password</label><input class="inp" id="cp_new" type="password"></div>' +
          '<div class="field"><label>Confirm new password</label><input class="inp" id="cp_new2" type="password"></div>' +
          '<p class="auth-err" id="cp_err"></p></div>');
        App.modal({
          title: 'Change password', body,
          buttons: [{ label: t('com.cancel'), cls: 'ghost' }, {
            label: t('com.save'), cls: 'pri', keepOpen: true, fn: async (api) => {
              const errEl = App.$('#cp_err', body);
              errEl.textContent = '';
              const n1 = App.$('#cp_new', body).value, n2 = App.$('#cp_new2', body).value;
              if (n1 !== n2) { errEl.textContent = 'New passwords do not match'; return; }
              try {
                await App.auth.changePassword(acc.id, App.$('#cp_old', body).value, n1);
                App.toast('ok', 'Password changed');
                api.close();
              } catch (err) { errEl.textContent = err.message || App.uiText('Something went wrong'); }
            }
          }]
        });
      }
      if (e.target.closest('#delAccount')) {
        const acc = App.auth.currentAccount();
        if (!acc) return;
        const body = App.el('<div>' +
          '<div class="alert bad"><span class="ai"></span><span>This deletes your login and every bill, item, customer and supplier for <b>' + esc(acc.shopName) + '</b>. There is no undo.</span></div>' +
          '<div class="field" style="margin-top:12px"><label>Enter your password to confirm</label><input class="inp" id="da_pw" type="password" autofocus></div>' +
          '<p class="auth-err" id="da_err"></p></div>');
        App.modal({
          title: 'Delete my account', body,
          buttons: [{ label: t('com.cancel'), cls: 'ghost' }, {
            label: 'Delete permanently', cls: 'danger', keepOpen: true, fn: async (api) => {
              const errEl = App.$('#da_err', body);
              errEl.textContent = '';
              try {
                await App.auth.deleteAccount(acc.id, App.$('#da_pw', body).value);
                api.close();
                App.toast('ok', 'Account deleted');
                setTimeout(() => location.reload(), 500);
              } catch (err) { errEl.textContent = err.message || App.uiText('Something went wrong'); }
            }
          }]
        });
      }
    });
    App.$('#impFile', main).addEventListener('change', async (e) => { if (e.target.files[0]) await importBackup(e.target.files[0]).catch(App.reportError); });
  };
})(window);
