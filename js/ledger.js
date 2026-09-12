/* ══════════════════════════════════════════════════════════
   Dukaan OS — Customers (udhaar) + Suppliers (two-sided ledger)
   Signature interaction: swipe a customer card right to settle,
   left to send a WhatsApp reminder.
   ══════════════════════════════════════════════════════════ */
(function (w) {
  'use strict';
  const App = w.App, esc = App.esc, money = App.money, t = (k, v) => App.t(k, v);
  let cf = { q: '', overdue: 0, sort: 'amount' };

  /* ═════════ swipe gesture ═════════ */
  function wireSwipe(root) {
    App.$$('.swipe', root).forEach((card) => {
      const fg = card.querySelector('.swipe-fg');
      const id = card.dataset.cid;
      const context=App.context();
      let x0 = 0, dx = 0, drag = false, pid = null;
      const TH = Math.min(120, card.offsetWidth * 0.32);

      const down = (e) => {
        if (e.target.closest('button')) return;
        drag = true; pid = e.pointerId; x0 = e.clientX; dx = 0;
        fg.classList.add('dragging'); fg.classList.remove('snap');
        try { fg.setPointerCapture(pid); } catch (err) { }
      };
      const move = (e) => {
        if (!drag) return;
        dx = e.clientX - x0;
        if (Math.abs(dx) < 4) return;
        const damp = Math.sign(dx) * Math.min(Math.abs(dx), card.offsetWidth * 0.6);
        fg.style.transform = 'translateX(' + damp + 'px)';
        const bg = card.querySelector('.swipe-bg');
        bg.style.opacity = Math.min(1, Math.abs(dx) / TH);
        if (Math.abs(dx) > TH && !fg.dataset.armed) { fg.dataset.armed = '1'; App.buzz(18); }
        if (Math.abs(dx) <= TH) delete fg.dataset.armed;
      };
      const up = async () => {
        if (!drag) return;
        drag = false;
        fg.classList.remove('dragging'); fg.classList.add('snap');
        const fired = Math.abs(dx) > TH;
        const dir = dx > 0 ? 1 : -1;
        fg.style.transform = '';
        delete fg.dataset.armed;
        try { fg.releasePointerCapture(pid); } catch (err) { }
        if (fired && App.contextValid(context)) {
          if (dir > 0) settle(id); else (await remind(id));
        }
        dx = 0;
      };
      fg.addEventListener('pointerdown', down);
      fg.addEventListener('pointermove', move);
      fg.addEventListener('pointerup', up);
      const cancel=()=>{drag=false;dx=0;fg.style.transform='';fg.classList.remove('dragging');delete fg.dataset.armed;};
      fg.addEventListener('pointercancel', cancel);
      fg.addEventListener('lostpointercapture', cancel);
    });
  }

  /* ═════════ customer actions ═════════ */
  function settle(id) {
    const c = App.customer(id); if (!c) return;
    const operationId=App.uid('collection');
    const bills=App.bills().filter(b=>b.customerId===id&&b.credit&&!b.void);
    App.numpadModal('' + t('cus.logPayment'), c.balance ? String(App.round2(c.balance)) : '', async (amt,body) => {
      (await App.actions.takePayment(id, amt, App.$('#collectionMode',body).value,'',{operationId,billId:App.$('#collectionBill',body).value}));
      const done = (c.balance || 0) <= 0.5;
      App.toast('ok', t('cus.received', { name: c.name, amt: money(amt, true) }), done ? t('cus.paidFull', { name: c.name }) : money(c.balance) + ' ' + t('com.pending').toLowerCase());
      App.render();
    }, { extra:window.App.moneyLiteral('<div class="field"><label for="collectionMode">Payment method</label><select class="inp" id="collectionMode"><option value="cash">Cash</option><option value="upi">UPI</option><option value="card">Card</option></select></div><div class="field"><label for="collectionBill">Apply to bill (optional)</label><select class="inp" id="collectionBill"><option value="">Customer balance</option>')+bills.map(b=>'<option value="'+b.id+'">Bill #'+b.no+'</option>').join('')+'</select></div>',sub: c.name + ' · ' + t('cus.balance') + ' ' + money(c.balance, true), ok: t('cus.logPayment'), quick: [100, 200, 500, App.round2(c.balance)].filter((x, i, a) => x > 0 && a.indexOf(x) === i) });
  }
  App.settleCustomer = settle;
  App.customerEntryDialog = function(id,kind){
    const c=App.customer(id);if(!c)return;
    const operationId=App.uid('customer_entry');
    const body=App.el('<div><p>'+esc(c.name)+' · '+esc(money(c.balance,true))+'</p><div class="field"><label for="entryAmount">'+(kind==='advance'?window.App.moneyLiteral('Amount received'):window.App.moneyLiteral('Signed amount: positive debt, negative credit'))+'</label><input class="inp" id="entryAmount" type="number" step="0.01" autofocus></div>'+
      (kind==='advance'?window.App.moneyLiteral('<div class="field"><label for="entryMode">Payment method</label><select class="inp" id="entryMode"><option value="cash">Cash</option><option value="upi">UPI</option><option value="card">Card</option></select></div>'):'')+
      (kind==='opening'?window.App.moneyLiteral('<div class="field"><label for="entryDate">Opening date</label><input class="inp" id="entryDate" type="date" value="')+App.dayKey(Date.now())+'"></div>':'')+
      window.App.moneyLiteral('<div class="field"><label for="entryNote">Reason / note</label><input class="inp" id="entryNote"></div><p class="muted">')+(kind==='advance'?window.App.moneyLiteral('This records money received and may create customer credit.'):window.App.moneyLiteral('This changes the balance without recording cash received or paid.'))+'</p></div>');
    App.modal({title:{advance:window.App.moneyLiteral('Record advance'),opening:window.App.moneyLiteral('Opening balance'),correction:window.App.moneyLiteral('Correct customer balance')}[kind],body,buttons:[{label:t('com.cancel'),cls:'ghost'},{label:t('com.save'),cls:'pri',fn:async()=>{
      const amount=Number(App.$('#entryAmount',body).value),note=App.$('#entryNote',body).value;
      if(kind==='advance')await App.actions.customerCredit(id,amount,App.$('#entryMode',body).value,note,{operationId});
      else if(kind==='opening')await App.actions.openingBalance(id,amount,new Date(App.$('#entryDate',body).value+'T00:00:00').getTime(),note,{operationId});
      else await App.actions.correctCustomerBalance(id,amount,note,{operationId});
      App.toast('ok',window.App.moneyLiteral('Customer entry saved'));App.render();
    }}]});
  };

  async function remind(id) {
    const c = App.customer(id); if (!c) return;
    const st = App.DB().settings;
    const days = c.dueSince ? App.daysBetween(c.dueSince, Date.now()) : 0;
    const hi = App.lang() === 'hi';
    const msg = hi
      ? 'नमस्ते ' + c.name + ' जी \n\n' + st.shopName + ' में आपका *' + money(c.balance, true) + '* बाकी है' + (days ? ' (' + days + ' दिन से)' : '') + '।\nसुविधा हो तो चुका दीजिए।' + (st.upiId ? '\n\nUPI: ' + st.upiId : '') + '\n\nधन्यवाद!'
      : 'Namaste ' + c.name + ' \n\nA friendly reminder — *' + money(c.balance, true) + '* is pending at ' + st.shopName + (days ? ' (' + days + ' days)' : '') + '.\nPlease settle whenever convenient.' + (st.upiId ? '\n\nUPI: ' + st.upiId : '') + '\n\nThank you!';
    App.whatsapp(c.phone, msg);
    App.log('remind', 'Reminder sent to ' + c.name);
    (await App.save({ render: false, sync: false }));
    App.toast('ok', t('cus.remind'), c.name);
  }
  App.remindCustomer = remind;

  App.editCustomer = function (id, done) {
    const c = id ? App.customer(id) : null;
    const d = Object.assign({ name: '', phone: '', birthday: '', note: '' }, c || {});
    const body = App.el('<div>' +
      '<div class="field"><label>' + t('com.name') + ' *</label><input class="inp" id="c_n" value="' + esc(d.name) + '" placeholder="Ramesh Kumar" autofocus></div>' +
      '<div class="row"><div class="field"><label>' + t('com.phone') + '</label><input class="inp num" id="c_p" type="tel" inputmode="tel" value="' + esc(d.phone) + '" placeholder="98123 45670"></div>' +
      '<div class="field"><label> ' + t('cus.birthday') + ' <span class="muted">MM-DD</span></label><input class="inp" id="c_b" value="' + esc(d.birthday) + '" placeholder="08-14"></div></div>' +
      window.App.moneyLiteral('<div class="field"><label>Note</label><input class="inp" id="c_note" value="') + esc(d.note || '') + '" placeholder="Lives above the chemist"></div>' +
      (c ? '<div class="alert info"><span class="ai"></span><span>' + t('cus.balance') + ': <b>' + money(c.balance, true) + '</b> ·  ' + Math.floor(c.points || 0) + ' ' + t('cus.points') + '</span></div>' : '') +
      '</div>');
    App.modal({
      title: c ? '' + esc(c.name) : '' + t('cus.add'), body,
      buttons: [
        c ? {
          label: 'Remove', cls: 'danger', keepOpen: true, fn: (api) => {
            if (Math.abs(c.balance) > 0.005) { App.toast('err', 'Settle ' + money(c.balance) + ' first'); return; }
            App.confirm(t('com.delete') + '?', c.name + ' will be removed. Past bills are kept.', { danger: true }).then(async (ok) => {
              if (!ok) return; c.deleted = true; (await App.save({ op: 'customer' })); App.toast('ok', 'Removed ' + c.name); api.close(); App.render();
            });
          }
        } : null,
        { label: t('com.cancel'), cls: 'ghost' },
        {
          label: t('com.save'), cls: 'pri', fn: async () => {
            const n = App.$('#c_n', body).value.trim();
            if (!n) { App.toast('err', 'Name is required'); return false; }
            const rec = c || { id: App.uid('cu'), storeId: App.S(), balance: 0, spend: 0, visits: 0, points: 0, dueSince: null, at: Date.now(), firstAt: Date.now() };
            rec.name = n;
            rec.phone = App.$('#c_p', body).value.trim();
            rec.birthday = App.$('#c_b', body).value.trim();
            rec.note = App.$('#c_note', body).value.trim();
            if (!c) App.DB().customers.push(rec);
            App.log('customer', (c ? 'Updated ' : 'Added ') + rec.name);
            (await App.save({ op: 'customer' }));
            App.toast('ok', t('com.done'), rec.name);
            done && done(rec);
          }
        }]
    });
  };

  App.customerDetail = function (id) {
    const c = App.customer(id);
    const statement=App.customerStatement(id);
    const bills = App.bills().filter((b) => b.customerId === id);
    const pays = App.payments().filter((p) => p.customerId === id);
    const feed = bills.map((b) => ({ t: b.at, kind: 'bill', b })).concat(pays.map((p) => ({ t: p.at, kind: 'pay', p })))
      .sort((a, b) => b.t - a.t);
    const days = c.dueSince ? App.daysBetween(c.dueSince, Date.now()) : 0;

    const body = App.el('<div>' +
      '<div class="grid g-3" style="margin-bottom:16px">' +
      '<div class="stat ' + (c.balance > 0 ? 'bad' : 'good') + '"><div class="k">' + (c.balance < 0 ? window.App.moneyLiteral('Credit owed to customer') : t('cus.balance')) + '</div><div class="v" style="color:' + (c.balance > 0 ? 'var(--bad)' : 'var(--ok)') + '">' + money(Math.abs(c.balance), true) + '</div>' +
      (c.balance < 0 ? window.App.moneyLiteral('<div class="d up">Available against future udhaar bills</div>') : days ? '<div class="d down">' + t('cus.since', { n: days }) + '</div>' : '<div class="d up">✓ clear</div>') + '</div>' +
      '<div class="stat"><div class="k">' + t('cus.spent', { amt: '' }).trim() + '</div><div class="v">' + App.short(c.spend || 0) + '</div><div class="d muted">' + t('cus.visits', { n: c.visits || 0 }) + '</div></div>' +
      '<div class="stat"><div class="k">★ ' + t('cus.points') + '</div><div class="v">' + Math.floor(c.points || 0) + '</div><div class="d muted">= ' + money(Math.floor(c.points || 0) * (App.DB().settings.loyaltyValue || 1)) + '</div></div>' +
      '</div>' +
      '<div class="btn-row" style="margin-bottom:14px">' +
      (c.balance > 0 ? '<button class="btn ok" id="dPay"> ' + t('cus.logPayment') + '</button>' : '') +
      (c.phone && c.balance > 0 ? '<button class="btn" id="dRemind"> ' + t('cus.remind') + '</button>' : '') +
      '<button class="btn ghost" id="dEdit"> ' + t('com.edit') + '</button>' +
      '<button class="btn ghost" id="dCsv"> ' + t('com.export') + window.App.moneyLiteral('</button><button class="btn ghost" id="dStatementCsv">Balance CSV</button></div>') +
      window.App.moneyLiteral('<div class="btn-row"><button class="btn" id="dAdvance">Record advance</button>')+(App.isOwner()?window.App.moneyLiteral('<button class="btn" id="dOpening">Opening balance</button><button class="btn" id="dCorrection">Correct balance</button>'):'')+'</div>'+
      window.App.moneyLiteral('<div class="sec-title">Balance entries (latest 40; CSV includes all)</div><div class="table-wrap"><table><thead><tr><th>Date / entry</th><th>Change</th><th>Balance</th></tr></thead><tbody>')+statement.entries.slice(-40).map(e=>'<tr><td>'+esc(App.fmtDT(e.at)+' · '+App.moneyCode(e.kind))+'<br><small>'+esc(e.note || '')+'</small></td><td>'+esc(money(e.delta,true))+'</td><td>'+esc(money(e.balance,true))+'</td></tr>').join('')+'</tbody></table></div>'+
      '<div class="sec-title">' + t('cus.history') + '</div>' +
      (feed.length ? feed.slice(0, 40).map((f) => f.kind === 'bill' ?
        '<div class="list-row"><span class="rank" style="background:' + (f.b.void ? 'var(--line)' : f.b.credit ? 'var(--bad-bg)' : 'var(--ok-bg)') + ';color:' + (f.b.credit ? 'var(--bad)' : 'var(--ok)') + '">' + (f.b.credit ? '' : '') + '</span>' +
        '<span style="flex:1;min-width:0"><b' + (f.b.void ? ' style="text-decoration:line-through;opacity:.5"' : '') + '>#' + f.b.no + ' · ' + esc(f.b.lines.map((l) => l.name).join(', ').slice(0, 44)) + '</b>' +
        '<br><small class="muted">' + App.fmtDT(f.b.at) + ' · ' + esc(String(f.b.mode).toUpperCase()) + '</small></span>' +
        '<b class="num">' + money(f.b.total) + '</b>' +
        '<button class="btn xs ghost" data-rebill="' + f.b.id + '">' + App.icon('eye',16) + '</button></div>'
        :
        '<div class="list-row"><span class="rank" style="background:var(--ok-bg);color:var(--ok)"></span>' +
        window.App.moneyLiteral('<span style="flex:1"><b>Payment received</b><br><small class="muted">') + App.fmtDT(f.p.at) + ' · ' + esc(String(f.p.mode).toUpperCase()) + '</small></span>' +
        '<b class="num" style="color:var(--ok)">− ' + money(f.p.amount) + '</b></div>').join('')
        : App.emptyState('', 'No purchases yet', '')) +
      '</div>');

    const m = App.modal({ title: '' + esc(c.name) + (c.phone ? ' · ' + esc(c.phone) : ''), body, wide: true, foot: false });
    body.addEventListener('click', async (e) => {
      for(const [button,kind] of [['#dAdvance','advance'],['#dOpening','opening'],['#dCorrection','correction']])if(e.target.closest(button)){m.close();return App.customerEntryDialog(id,kind);}
      if (e.target.closest('#dPay')) { m.close(); return settle(id); }
      if (e.target.closest('#dRemind')) return (await remind(id));
      if (e.target.closest('#dEdit')) { m.close(); return App.editCustomer(id, () => App.render()); }
      const rb = e.target.closest('[data-rebill]');
      if (rb) { const b = App.DB().bills.find((x) => x.id === rb.dataset.rebill); if (b) App.showReceipt(b); return; }
      if (e.target.closest('#dStatementCsv')) {
        const rows = [[window.App.moneyLiteral('Date'),'Entry','Reference',window.App.moneyLiteral('Change'),window.App.moneyLiteral('Balance'),'Mode',window.App.moneyLiteral('Note')]];
        statement.entries.forEach(e=>rows.push([App.fmtDT(e.at),e.kind,e.billId || e.paymentId || e.id,e.delta,e.balance,e.mode || '',e.note || '']));
        App.download(App.toCSV(rows), 'balance-' + c.name.replace(/\s+/g, '-') + '.csv', 'text/csv');
      }
      if(e.target.closest('#dCsv')){
        const rows=[[window.App.moneyLiteral('Date'),'Type','Ref',window.App.moneyLiteral('Items'),window.App.moneyLiteral('Amount'),'Mode']];
        feed.forEach(f=>f.kind==='bill'?rows.push([App.fmtDT(f.b.at),f.b.void?window.App.moneyLiteral('Cancelled'):f.b.credit?'Udhaar':'Sale','#'+f.b.no,f.b.lines.map(l=>l.name+'×'+l.qty).join('; '),f.b.total,f.b.mode]):rows.push([App.fmtDT(f.p.at),f.p.kind==='advance'?window.App.moneyLiteral('Advance'):window.App.moneyLiteral('Payment'),'','',-f.p.amount,f.p.mode]));
        App.download(App.toCSV(rows),'ledger-'+c.name.replace(/\s+/g,'-')+'.csv','text/csv');
      }
    });
  };

  /* ═════════ customers view ═════════ */
  App.views.customers = function (main) {
    const all = App.customers();
    const dues = App.stats.dues();
    const totalDue = App.stats.totalDue();
    const bdays = all.filter((c) => c.birthday && c.birthday === App.dayKey(Date.now()).slice(5));

    let due = dues;
    if (cf.overdue) due = due.filter((d) => d.days >= cf.overdue);
    if (cf.q) due = due.filter((d) => d.c.name.toLowerCase().indexOf(cf.q.toLowerCase()) > -1);
    due = due.slice().sort((a, b) => cf.sort === 'days' ? b.days - a.days : b.c.balance - a.c.balance);

    let rest = all.filter((c) => (c.balance || 0) <= 0.5);
    if (cf.q) rest = rest.filter((c) => (c.name + ' ' + (c.phone || '')).toLowerCase().indexOf(cf.q.toLowerCase()) > -1);
    rest.sort((a, b) => (b.lastAt || 0) - (a.lastAt || 0));

    main.innerHTML =
      '<div class="page-head"><div><h1> ' + t('cus.title') + '</h1>' +
      '<div class="sub">' + t('cus.sub', { n: all.length, amt: money(totalDue) }) + '</div></div>' +
      '<div class="spacer"></div>' +
      '<button class="btn pri" id="addCust"> ' + t('cus.add') + '</button></div>' +

      (bdays.length ? '<div class="alert ok" style="margin-bottom:14px"><span class="ai"></span><span>' +
        bdays.map((c) => esc(t('cus.bdayToday', { name: c.name }))).join(' · ') +
        ' <button class="btn xs" data-bday="' + bdays[0].id + '" style="margin-left:8px"> Wish them</button></span></div>' : '') +

      '<div class="grid g-3" style="margin-bottom:18px">' +
      '<div class="stat ' + (totalDue > 0 ? 'bad' : 'good') + '"><span class="em"></span><div class="k">' + t('dash.pendingDue') + '</div>' +
      '<div class="v" style="color:' + (totalDue > 0 ? 'var(--bad)' : 'var(--ok)') + '">' + money(totalDue) + '</div>' +
      '<div class="d muted">' + dues.length + ' customers</div></div>' +
      '<div class="stat"><span class="em"></span><div class="k">' + t('cus.overdue15') + '</div>' +
      '<div class="v">' + money(dues.filter((d) => d.days >= 15).reduce((s, d) => s + d.c.balance, 0)) + '</div>' +
      '<div class="d muted">' + dues.filter((d) => d.days >= 15).length + ' customers</div></div>' +
      '<div class="stat"><span class="em"></span><div class="k">' + t('cus.points') + '</div>' +
      '<div class="v">' + Math.floor(all.reduce((s, c) => s + (c.points || 0), 0)) + '</div>' +
      '<div class="d muted">across all customers</div></div></div>' +

      '<div class="pos-tools"><div class="search-wrap"><span class="mag"></span>' +
      '<input class="inp" id="cusQ" placeholder="' + t('com.search') + '" value="' + esc(cf.q) + '"></div></div>' +

      '<div class="chip-row" style="margin-bottom:12px">' +
      [[0, t('com.all')], [7, t('cus.overdue7')], [15, t('cus.overdue15')], [30, t('cus.overdue30')]]
        .map((o) => '<button class="chip tap ' + (cf.overdue === o[0] ? 'sel' : '') + '" data-od="' + o[0] + '">' + o[1] + '</button>').join('') +
      '<span style="width:1px;background:var(--line);margin:0 4px"></span>' +
      '<button class="chip tap ' + (cf.sort === 'amount' ? 'sel' : '') + '" data-sort="amount">₹ ' + t('com.amount') + '</button>' +
      '<button class="chip tap ' + (cf.sort === 'days' ? 'sel' : '') + '" data-sort="days"> Days</button></div>' +

      '<div class="sec-title"> ' + t('cus.due') + '</div>' +
      (due.length
        ? '<div class="hint-swipe"> ' + t('cus.swipeHint') + ' <i>→</i></div>' +
        due.map((d, i) => swipeCard(d.c, d.days, i)).join('')
        : '<div class="card">' + App.emptyState('', t('cus.noDue'), '') + '</div>') +

      '<div class="sec-title"> ' + t('nav.customers') + ' (' + rest.length + ')</div>' +
      '<div class="card pad-0"><div class="tbl-wrap"><table class="tbl"><thead><tr>' +
      '<th>' + t('com.name') + '</th><th>' + t('com.phone') + '</th><th class="r">Spent</th><th class="r">★</th><th class="r">Last seen</th><th></th></tr></thead><tbody>' +
      (rest.length ? rest.map((c, i) => '<tr>' +
        '<td><div style="display:flex;align-items:center;gap:10px">' + App.avatarFor(c.name, i) + '<div><b>' + esc(c.name) + '</b>' + (c.balance < 0 ? window.App.moneyLiteral('<br><small>Credit owed: ') + money(-c.balance, true) + '</small>' : '') + '</div></div></td>' +
        '<td class="num muted">' + esc(c.phone || '—') + '</td>' +
        '<td class="r num">' + money(c.spend || 0) + '</td>' +
        '<td class="r num">' + Math.floor(c.points || 0) + '</td>' +
        '<td class="r muted" style="font-size:12.5px">' + (c.lastAt ? App.timeAgo(c.lastAt) : '—') + '</td>' +
        '<td class="r"><button class="btn xs" data-open="' + c.id + '">' + t('com.more') + '</button></td></tr>').join('')
        : '<tr><td colspan="6">' + App.emptyState('', 'No customers yet', 'Add regulars so you can track their udhaar') + '</td></tr>') +
      '</tbody></table></div></div>';

    wireSwipe(main);
    const Q = App.$('#cusQ');
    Q.addEventListener('input', () => { cf.q = Q.value; App.render(); setTimeout(() => { const n = App.$('#cusQ'); if (n) { n.focus(); n.setSelectionRange(n.value.length, n.value.length); } }, 0); });

    main.addEventListener('click', async (e) => {
      const od = e.target.closest('[data-od]'), so = e.target.closest('[data-sort]');
      const op = e.target.closest('[data-open]'), pay = e.target.closest('[data-pay]'), rem = e.target.closest('[data-rem]');
      const bd = e.target.closest('[data-bday]');
      if (od) { cf.overdue = +od.dataset.od; return App.render(); }
      if (so) { cf.sort = so.dataset.sort; return App.render(); }
      if (pay) return settle(pay.dataset.pay);
      if (rem) return (await remind(rem.dataset.rem));
      if (op) return App.customerDetail(op.dataset.open);
      if (e.target.closest('#addCust')) return App.editCustomer(null, () => App.render());
      if (bd) {
        const c = App.customer(bd.dataset.bday);
        App.whatsapp(c.phone, (App.lang() === 'hi' ? 'जन्मदिन मुबारक हो ' + c.name + ' जी! \n\n' + App.DB().settings.shopName + ' की तरफ से शुभकामनाएँ।'
          : 'Happy birthday ' + c.name + '! \n\nWarm wishes from all of us at ' + App.DB().settings.shopName + '.'));
        return;
      }
    });
  };

  function swipeCard(c, days, i) {
    const tag = days >= 30 ? 'bad' : days >= 15 ? 'warn' : days >= 7 ? 'warn' : '';
    return '<div class="swipe" data-cid="' + c.id + '">' +
      '<div class="swipe-bg"><span class="l"> ' + esc(t('cus.logPayment')) + '</span><span class="r">' + esc(t('cus.remind')) + ' </span></div>' +
      '<div class="swipe-fg">' + App.avatarFor(c.name, i) +
      '<span class="who-n"><b>' + esc(c.name) + '</b><span>' +
      (c.phone ? '<span> ' + esc(c.phone) + '</span>' : '') +
      (days ? '<span class="chip ' + tag + '" style="padding:1px 7px;font-size:11px">' + t('cus.since', { n: days }) + '</span>' : '') +
      (c.points ? '<span>★ ' + Math.floor(c.points) + '</span>' : '') +
      '</span></span>' +
      '<span class="due"><b style="color:var(--bad)">' + money(c.balance) + '</b><small>' + t('cus.balance') + '</small></span>' +
      '<button class="btn xs ok" data-pay="' + c.id + '">' + App.icon('cash',16) + '</button>' +
      (c.phone ? '<button class="btn xs" data-rem="' + c.id + '">' + App.icon('message',16) + '</button>' : '') +
      '<button class="btn xs ghost" data-open="' + c.id + '">' + App.icon('chevronRight',16) + '</button>' +
      '</div></div>';
  }

  /* ═════════ suppliers ═════════ */
  App.editSupplier = function (id, done) {
    App.requirePermission('settings');
    const s = id ? App.supplier(id) : null;
    const d = Object.assign({ name: '', phone: '', supplies: '', dueDate: '' }, s || {});
    const body = App.el('<div>' +
      '<div class="field"><label>' + t('com.name') + ' *</label><input class="inp" id="s_n" value="' + esc(d.name) + '" placeholder="Bhagwati Distributors" autofocus></div>' +
      '<div class="row"><div class="field"><label>' + t('com.phone') + '</label><input class="inp num" id="s_p" type="tel" value="' + esc(d.phone) + '"></div>' +
      '<div class="field"><label>' + t('sup.dueDate') + '</label><input class="inp" id="s_d" type="date" value="' + esc(d.dueDate || '') + '"></div></div>' +
      '<div class="field"><label>' + t('sup.supplies') + '</label><input class="inp" id="s_s" value="' + esc(d.supplies) + '" placeholder="Snacks, Biscuits"></div></div>');
    App.modal({
      title: s ? '' + esc(s.name) : '' + t('sup.add'), body,
      buttons: [{ label: t('com.cancel'), cls: 'ghost' }, {
        label: t('com.save'), cls: 'pri', fn: async () => {
          const n = App.$('#s_n', body).value.trim();
          if (!n) { App.toast('err', 'Name is required'); return false; }
          const rec = s || { id: App.uid('sp'), storeId: App.S(), balance: 0, dueSince: null, at: Date.now() };
          rec.name = n; rec.phone = App.$('#s_p', body).value.trim();
          rec.supplies = App.$('#s_s', body).value.trim(); rec.dueDate = App.$('#s_d', body).value;
          if (!s) App.DB().suppliers.push(rec);
          (await App.save({ op: 'supplier' }));
          App.toast('ok', t('com.done'), rec.name);
          done && done(rec);
        }
      }]
    });
  };

  App.purchaseModal = function (supplierId) {
    App.requirePermission('purchase');
    const sups = App.suppliers();
    if (!sups.length) { App.toast('warn', t('sup.noSup'), t('sup.add')); return App.editSupplier(null, () => App.render()); }
    const lines = [], operationId=App.uid('purchase');
    const body = App.el('<div>' +
      '<div class="field"><label>' + t('nav.suppliers') + '</label><select class="inp" id="p_s">' +
      sups.map((s) => '<option value="' + s.id + '" ' + (s.id === supplierId ? 'selected' : '') + '>' + esc(s.name) + '</option>').join('') + '</select></div>' +
      '<div class="sec-title" style="margin-top:12px">Items received</div>' +
      '<div class="row" style="align-items:flex-end">' +
      window.App.moneyLiteral('<div class="field" style="flex:2"><label>Item</label><select class="inp" id="p_i">') +
      App.items().map((i) => '<option value="' + i.id + '">' + esc(App.itemName(i)) + '</option>').join('') + '</select></div>' +
      '<div class="field" style="flex:.7"><label>' + t('com.qty') + '</label><input class="inp num" id="p_q" type="number" inputmode="numeric" value="10"></div>' +
      '<div class="field" style="flex:.9"><label>' + t('com.cost') + ' ₹</label><input class="inp num" id="p_c" type="number" inputmode="decimal"></div>' +
      '<div class="field" style="flex:0 0 auto"><button class="btn pri" id="p_add">' + App.icon('plus',16) + '</button></div></div>' +
      '<div class="field"><label>' + t('inv.expiry') + ' <span class="muted">(' + t('com.optional') + ')</span></label><input class="inp" id="p_e" type="date"></div>' +
      '<div id="p_list" style="margin:10px 0"></div>' +
      '<div class="kv" style="font-size:17px"><b>' + t('com.total') + '</b><b id="p_tot" class="num">₹0</b></div>' +
      window.App.moneyLiteral('<div class="field" style="margin-top:12px"><label>Paid now ₹</label><input class="inp num" id="p_paid" type="number" inputmode="decimal" value="0"></div><div class="field"><label>Payment mode</label><select class="inp" id="p_mode"><option value="cash">Cash</option><option value="upi">UPI</option><option value="card">Card</option></select></div></div>'));

    const syncCost = () => {
      const it = App.item(App.$('#p_i', body).value);
      if (it) App.$('#p_c', body).value = it.cost || '';
    };
    const paint = () => {
      App.$('#p_list', body).innerHTML = lines.length ? lines.map((l, i) => {
        const it = App.item(l.itemId);
        return '<div class="list-row">' + App.mark(it || '?') +
          '<span style="flex:1"><b>' + esc(it ? App.itemName(it) : '?') + '</b><br><small class="muted">' + l.qty + ' × ' + money(l.cost) + (l.expiry ? ' · exp ' + l.expiry : '') + '</small></span>' +
          '<b class="num">' + money(l.qty * l.cost) + '</b>' +
          '<button class="btn xs danger" data-del="' + i + '">' + App.icon('x',16) + '</button></div>';
      }).join('') : '<p class="muted" style="font-size:13px;text-align:center;padding:10px">Add the items you bought</p>';
      const tot = lines.reduce((s, l) => s + l.qty * l.cost, 0);
      App.$('#p_tot', body).textContent = money(tot, true);
      App.$('#p_paid', body).max = tot;
    };
    paint(); setTimeout(syncCost, 0);

    App.modal({
      title: '' + t('sup.newPO'), body, wide: true,
      buttons: [{ label: t('com.cancel'), cls: 'ghost' }, {
        label: t('com.save'), cls: 'pri', fn: async () => {
          if (!lines.length) { App.toast('err', 'Add at least one item'); return false; }
          const sid = App.$('#p_s', body).value;
          const po = (await App.actions.recordPurchase(sid, lines, Number(App.$('#p_paid', body).value), '', App.$('#p_mode', body).value,{operationId}));
          App.toast('ok', t('sup.stockIn'), lines.length + ' items · ' + money(po.total, true));
        }
      }]
    });

    App.$('#p_i', body).addEventListener('change', syncCost);
    body.addEventListener('click', (e) => {
      if (e.target.closest('#p_add')) {
        const itemId = App.$('#p_i', body).value;
        const qty = parseFloat(App.$('#p_q', body).value) || 0;
        const cost = Number(App.$('#p_c', body).value);
        if (!itemId || qty <= 0) { App.toast('err', 'Enter a quantity'); return; }
        App.number(cost, 'Purchase cost');
        lines.push({ itemId, qty, cost, expiry: App.$('#p_e', body).value });
        paint();
        return;
      }
      const d = e.target.closest('[data-del]');
      if (d) { lines.splice(+d.dataset.del, 1); paint(); }
    });
  };

  App.views.suppliers = function (main) {
    App.requirePermission('settings');
    const sups = App.suppliers().sort((a, b) => (b.balance || 0) - (a.balance || 0));
    const owed = App.stats.totalOwed();
    const pos = App.purchases().slice(0, 25);
    const today = App.dayKey(Date.now());

    main.innerHTML =
      '<div class="page-head"><div><h1> ' + t('sup.title') + '</h1>' +
      '<div class="sub">' + t('sup.sub', { amt: money(owed), n: sups.filter((s) => s.balance > 0).length }) + '</div></div>' +
      '<div class="spacer"></div>' +
      '<div class="btn-row"><button class="btn" id="addSup"> ' + t('sup.add') + '</button>' +
      '<button class="btn pri" id="newPO"> ' + t('sup.newPO') + '</button></div></div>' +

      '<div class="grid g-3" style="margin-bottom:18px">' +
      '<div class="stat ' + (owed > 0 ? 'bad' : 'good') + '"><span class="em"></span><div class="k">' + t('sup.owed') + '</div>' +
      '<div class="v" style="color:' + (owed > 0 ? 'var(--bad)' : 'var(--ok)') + '">' + money(owed) + '</div></div>' +
      '<div class="stat good"><span class="em"></span><div class="k">' + t('dash.pendingDue') + '</div>' +
      '<div class="v" style="color:var(--ok)">' + money(App.stats.totalDue()) + '</div></div>' +
      '<div class="stat accent"><span class="em"></span><div class="k">Net position</div>' +
      '<div class="v">' + money(App.stats.totalDue() - owed) + '</div>' +
      '<div class="d">' + (App.stats.totalDue() - owed >= 0 ? 'in your favour' : 'you owe more') + '</div></div></div>' +

      '<div class="sec-title"> ' + t('nav.suppliers') + '</div>' +
      (sups.length ? sups.map((s, i) => {
        const late = s.dueDate && s.dueDate < today && s.balance > 0;
        return '<div class="swipe"><div class="swipe-fg" style="cursor:default">' + App.avatarFor(s.name, i + 1) +
          '<span class="who-n"><b>' + esc(s.name) + '</b><span>' +
          (s.supplies ? '<span>' + esc(s.supplies) + '</span>' : '') +
          (s.phone ? '<span> ' + esc(s.phone) + '</span>' : '') +
          (late ? '<span class="chip bad" style="padding:1px 7px;font-size:11px">' + t('sup.overdue') + '</span>'
            : s.dueDate && s.balance > 0 ? '<span class="chip warn" style="padding:1px 7px;font-size:11px">due ' + App.fmtD(new Date(s.dueDate + 'T00:00')) + '</span>' : '') +
          '</span></span>' +
          '<span class="due"><b style="color:' + (s.balance > 0 ? 'var(--bad)' : 'var(--ok)') + '">' + money(s.balance || 0) + '</b><small>' + t('sup.owed') + '</small></span>' +
          (s.balance > 0 ? '<button class="btn xs ok" data-spay="' + s.id + '">' + App.icon('cash',16) + '</button>' : '') +
          '<button class="btn xs" data-spo="' + s.id + '">' + App.icon('box',16) + '</button>' +
          '<button class="btn xs" data-saccount="' + s.id + '">Account</button>' +
          '<button class="btn xs ghost" data-sed="' + s.id + '">' + App.icon('edit',16) + '</button>' +
          '</div></div>';
      }).join('') : '<div class="card">' + App.emptyState('', t('sup.noSup'), 'Add the distributors you buy stock from') + '</div>') +

      '<div class="sec-title"> ' + t('sup.history') + '</div>' +
      '<div class="card pad-0"><div class="tbl-wrap"><table class="tbl"><thead><tr>' +
      '<th>#</th><th>' + t('com.date') + '</th><th>' + t('nav.suppliers') + window.App.moneyLiteral('</th><th>Items</th><th class="r">') + t('com.total') + '</th><th class="r">Linked paid</th></tr></thead><tbody>' +
      (pos.length ? pos.map((p) => '<tr><td class="num">' + p.no + '</td><td class="muted" style="font-size:12.5px">' + App.fmtDT(p.at) + '</td>' +
        '<td><b>' + esc(p.supplierName) + '</b></td>' +
        '<td class="muted" style="font-size:12.5px">' + esc(p.lines.map((l) => { const it = App.item(l.itemId); return (l.name || (it ? it.name : '?')) + '×' + l.qty; }).join(', ').slice(0, 52)) + (p.cancelled ? window.App.moneyLiteral(' · Cancelled') : '') + '</td>' +
        '<td class="r num"><b>' + money(p.total) + '</b></td>' +
        '<td class="r num" style="color:' + (App.purchasePaid(p) >= p.total ? 'var(--ok)' : 'var(--warn)') + '">' + money(App.purchasePaid(p)) + '</td></tr>').join('')
        : '<tr><td colspan="6">' + App.emptyState('', 'No purchases recorded', 'Log what you buy so stock updates itself') + '</td></tr>') +
      '</tbody></table></div></div>';

    main.addEventListener('click', (e) => {
      const account=e.target.closest('[data-saccount]');if(account)return App.supplierDetail(account.dataset.saccount);
      const sp = e.target.closest('[data-spay]'), po = e.target.closest('[data-spo]'), ed = e.target.closest('[data-sed]');
      if (e.target.closest('#addSup')) return App.editSupplier(null, () => App.render());
      if (e.target.closest('#newPO')) return App.purchaseModal();
      if (po) return App.purchaseModal(po.dataset.spo);
      if (ed) return App.editSupplier(ed.dataset.sed, () => App.render());
      if (sp) {
        return App.supplierPaymentDialog(sp.dataset.spay);
      }
    });
  };
})(window);
