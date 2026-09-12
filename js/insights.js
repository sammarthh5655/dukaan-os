/* ══════════════════════════════════════════════════════════
   Dukaan OS — Dashboard, Reports, and the on-device insight
   engine (restock velocity, anomalies, natural-language Q&A,
   end-of-day summary). All rule-based, so it works offline.
   ══════════════════════════════════════════════════════════ */
(function (w) {
  'use strict';
  const App = w.App, esc = App.esc, money = App.money, t = (k, v) => App.t(k, v);
  let repRange = 14;

  /* ═════════ insight engine ═════════ */
  const AI = App.ai = {
    /* days of cover left = stock / units-sold-per-day */
    restock() {
      const out = [];
      App.items().forEach((it) => {
        const v = App.stats.velocity(it.id, 21);
        if (v <= 0.05) return;
        const stock = App.itemStock(it);
        const daysLeft = stock / v;
        const cycle = Math.max(1, Math.round((it.threshold != null ? it.threshold : App.DB().settings.lowStock) / v) || 1);
        if (daysLeft <= 4) out.push({
          kind: 'restock', item: it, daysLeft: Math.round(daysLeft * 10) / 10, velocity: v,
          suggest: Math.max(10, Math.ceil(v * 14 / 5) * 5),
          text: t('ai.restock', { name: App.itemName(it), n: Math.max(1, Math.round(stock > 0 ? daysLeft : cycle)) }),
          weight: 100 - daysLeft * 10
        });
      });
      return out.sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 6);
    },

    slowMovers() {
      const out = [];
      App.items().forEach((it) => {
        if (App.itemStock(it) < 3) return;
        const v = App.stats.velocity(it.id, 21);
        if (v === 0 && it.at < Date.now() - 21 * App.DAY)
          out.push({ kind: 'slow', item: it, text: t('ai.slow', { name: App.itemName(it) }), weight: 30 });
      });
      return out.slice(0, 3);
    },

    anomalies() {
      const bills = App.liveBills().filter((b) => b.at > Date.now() - 30 * App.DAY);
      if (bills.length < 12) return [];
      const vals = bills.map((b) => b.total);
      const mean = vals.reduce((s, x) => s + x, 0) / vals.length;
      const sd = Math.sqrt(vals.reduce((s, x) => s + (x - mean) ** 2, 0) / vals.length) || 1;
      return bills.filter((b) => b.at > Date.now() - 2 * App.DAY && (b.total - mean) / sd > 2.5)
        .map((b) => ({ kind: 'anomaly', bill: b, text: t('ai.anomaly', { no: b.no, amt: money(b.total) }), weight: 60 }))
        .slice(0, 2);
    },

    dueChase() {
      return App.stats.dues().filter((d) => d.days >= 7).slice(0, 4).map((d) => ({
        kind: 'due', customer: d.c, days: d.days,
        text: t('ai.dueChase', { name: d.c.name, amt: money(d.c.balance), d: d.days }),
        weight: 50 + Math.min(40, d.days)
      }));
    },

    expiry() {
      return App.expiringBatches(14).slice(0, 4).map((e) => ({
        kind: 'expiry', item: e.item, days: e.days,
        text: e.days < 0 ? App.itemName(e.item) + ' has expired stock. Set it aside; it cannot be sold.' : t('ai.expiry', { name: App.itemName(e.item), d: e.days }),
        weight: 70 - e.days * 2
      }));
    },

    all() {
      return [].concat(this.restock(), this.dueChase(), this.expiry(), this.anomalies(), this.slowMovers())
        .sort((a, b) => b.weight - a.weight);
    },

    /* end-of-day / morning summary in plain Hindi or English */
    summary(dayTs) {
      const s = App.startOfDay(dayTs || Date.now()).getTime();
      const r = App.stats.range(s, s + App.DAY);
      const hi = App.lang() === 'hi';
      const top = App.stats.topItems(3, null, s, s + App.DAY);
      const dues = App.stats.dues();
      const cash = App.stats.cashExpected(s);
      const isToday = App.isToday(s);
      const label = isToday ? (hi ? 'आज' : 'Today') : (hi ? 'कल' : 'Yesterday');

      const L = [];
      if (r.count === 0) {
        L.push(hi ? label + ' कोई बिक्री दर्ज नहीं हुई।' : 'No sales recorded ' + label.toLowerCase() + '.');
      } else {
        L.push(hi
          ? label + ' ' + r.count + ' बिल में कुल *' + money(r.sales, true) + '* की बिक्री हुई (औसत ' + money(r.avg) + ' प्रति बिल)।'
          : label + ' you did *' + money(r.sales, true) + '* across ' + r.count + ' bills (avg ' + money(r.avg) + ' per bill).');
        if (top.length) L.push(hi
          ? 'सबसे ज़्यादा बिका: ' + top.map((x) => x.name + ' (' + x.qty + ')').join(', ') + '।'
          : 'Best sellers: ' + top.map((x) => x.name + ' ×' + x.qty).join(', ') + '.');
        L.push(hi
          ? 'नकद ' + money(cash.in) + ' आया' + (r.credit > 0 ? ', और ' + money(r.credit) + ' उधार गया' : '') + '।'
          : money(cash.in) + ' came in as cash' + (r.credit > 0 ? ', and ' + money(r.credit) + ' went on udhaar' : '') + '.');
      }
      if (dues.length) L.push(hi
        ? dues.length + ' ग्राहकों से कुल ' + money(App.stats.totalDue()) + ' लेना बाकी है' + (dues[0].days >= 7 ? ' — सबसे पुराना ' + dues[0].c.name + ' (' + dues[0].days + ' दिन)' : '') + '।'
        : dues.length + ' customers still owe you ' + money(App.stats.totalDue()) + (dues[0].days >= 7 ? ' — oldest is ' + dues[0].c.name + ' (' + dues[0].days + ' days)' : '') + '.');
      const rs = this.restock();
      if (rs.length) L.push(hi
        ? 'मंगवाना है: ' + rs.slice(0, 3).map((x) => App.itemName(x.item)).join(', ') + '।'
        : 'Reorder soon: ' + rs.slice(0, 3).map((x) => App.itemName(x.item)).join(', ') + '.');
      const ex = App.expiringBatches(7);
      if (ex.length) L.push(hi
        ? ex.length + ' सामान एक हफ्ते में खराब हो जाएगा — आज बेचिए।'
        : ex.length + ' batches expire within a week — push them today.');
      return L;
    },

    /* ───────── natural-language question answering ─────────
       Deliberately a small deterministic matcher rather than an
       LLM call: it must answer instantly and with no internet. */
    ask(qRaw) {
      const q = String(qRaw || '').toLowerCase().trim();
      if (!q) return null;
      const hi = /[ऀ-ॿ]/.test(qRaw) || App.lang() === 'hi';

      /* Keyword test. \b is defined against [A-Za-z0-9_], so it never fires
         between two Devanagari characters — those have to match as plain
         substrings instead. */
      const has = (words) => words.some((x) =>
        /[ऀ-ॿ]/.test(x) ? q.indexOf(x) > -1 : new RegExp('\\b' + x + '\\b').test(q));

      /* period */
      let from = 0, to = Date.now() + 1, label = hi ? 'अब तक' : 'all time';
      const D = App.startOfDay(Date.now()).getTime();
      if (has(['today', 'aaj', 'आज'])) { from = D; to = D + App.DAY; label = hi ? 'आज' : 'today'; }
      else if (has(['yesterday', 'kal', 'कल'])) { from = D - App.DAY; to = D; label = hi ? 'कल' : 'yesterday'; }
      else if (has(['week', 'hafta', 'hafte', 'सप्ताह', 'हफ्ते', 'हफ्ता', '7 din', '7 days'])) { from = D - 6 * App.DAY; label = hi ? 'इस हफ्ते' : 'this week'; }
      else if (has(['month', 'mahina', 'mahine', 'महीने', 'महीना', '30 din', '30 days'])) {
        const d = new Date(); from = new Date(d.getFullYear(), d.getMonth(), 1).getTime(); label = hi ? 'इस महीने' : 'this month';
      }
      const R = App.stats.range(from, to);

      /* who / what is the question about? */
      /* Match names in either script: "Ramesh" and "रमेश" must both land
         on the same customer, so compare transliterated skeletons too. */
      const qSk = App.skel(q);
      const cust = App.customers().find((c) => {
        const n = c.name.toLowerCase();
        if (q.indexOf(n) > -1) return true;
        return n.split(/\s+/).some((p) => {
          if (p.length <= 3) return false;
          if (q.indexOf(p) > -1) return true;
          const ps = App.skel(p);
          return ps.length > 3 && qSk.indexOf(ps) > -1;
        });
      });
      /* strip question filler before trying to read a product name out of it */
      const FILLER = ['stock', 'of', 'left', 'have', 'है', 'स्टॉक', 'how', 'much', 'many', 'did', 'does', 'do', 'i', 'me', 'my', 'is', 'was', 'sold', 'sell', 'sale',
        'this', 'last', 'month', 'week', 'today', 'yesterday', 'total', 'what', 'whats',
        'kitna', 'kitne', 'kitni', 'ka', 'ki', 'ke', 'bika', 'bike', 'aaj', 'kal', 'hai', 'hua', 'hui',
        'कितना', 'कितने', 'कितनी', 'का', 'की', 'के', 'बिका', 'बिके', 'आज', 'कल', 'है', 'हुआ', 'हुई',
        'इस', 'महीने', 'हफ्ते', 'सबसे', 'ज़्यादा', 'ज्यादा', 'क्या', 'रहा', 'रहे', 'हो'];
      const residual = q.split(/[\s?!.,]+/).filter((word) => !FILLER.includes(word)).join(' ');
      const itemHit = App.matchItem(residual.replace(/\s+/g, ' ').trim(), App.items());
      const item = itemHit && itemHit.score >= 34 ? itemHit.item : null;

      const wantsDue = has(['owe', 'owes', 'due', 'pending', 'udhaar', 'udhar', 'baki', 'bakaya', 'उधार', 'बाकी', 'बकाया', 'लेना']);
      const wantsSpend = has(['spend', 'spent', 'kharch', 'खर्च', 'liya', 'purchase', 'bought']);
      const wantsProfit = has(['profit', 'munafa', 'मुनाफ़ा', 'मुनाफा', 'फायदा', 'faida', 'margin']);
      const wantsBest = has(['best', 'top', 'most', 'sabse', 'सबसे', 'zyada', 'ज़्यादा', 'ज्यादा', 'popular']);
      const wantsStock = has(['stock', 'khatam', 'खत्म', 'स्टॉक', 'low', 'kam', 'कम', 'reorder', 'mangwana', 'मंगवाना']);
      const wantsSales = has(['sale', 'sales', 'bikri', 'बिक्री', 'revenue', 'kamai', 'कमाई', 'total', 'business', 'dhanda', 'धंधा']);
      const wantsCount = has(['how many', 'kitne', 'कितने', 'kitni', 'कितनी', 'bills', 'bill', 'customers', 'grahak', 'ग्राहक']);

      /* ── customer questions ── */
      if (cust) {
        if (wantsDue) {
          const days = cust.dueSince ? App.daysBetween(cust.dueSince, Date.now()) : 0;
          return {
            headline: money(cust.balance, true),
            text: cust.balance > 0.5
              ? (hi ? cust.name + ' पर ' + money(cust.balance, true) + ' बाकी है' + (days ? ', ' + days + ' दिन से' : '') + '।'
                : cust.name + ' owes you ' + money(cust.balance, true) + (days ? ', pending for ' + days + ' days' : '') + '.')
              : (hi ? cust.name + ' का पूरा हिसाब साफ है' : cust.name + ' has no pending balance'),
            action: cust.balance > 0.5 ? { label: '' + t('cus.remind'), fn: () => App.remindCustomer(cust.id) } : null
          };
        }
        const bs = R.bills.filter((b) => b.customerId === cust.id);
        const spent = App.round2(bs.reduce((s, b) => s + b.total, 0));
        return {
          headline: money(spent, true),
          text: hi ? cust.name + ' ने ' + label + ' ' + bs.length + ' बार में ' + money(spent, true) + ' खर्च किया।' + (cust.balance > 0.5 ? ' (' + money(cust.balance) + ' अभी बाकी)' : '')
            : cust.name + ' spent ' + money(spent, true) + ' ' + label + ' across ' + bs.length + ' bills.' + (cust.balance > 0.5 ? ' ' + money(cust.balance) + ' still pending.' : ''),
          action: { label: '' + cust.name, fn: () => App.customerDetail(cust.id) }
        };
      }

      /* ── item questions ── */
      if (item && wantsStock) return { headline: App.sellableStock(item) + (hi ? ' नग' : ' units'), text: App.itemName(item) + ': ' + App.sellableStock(item) + ' available to sell (' + App.itemStock(item) + ' physically in stock).' };
      if (item && !wantsSales && !wantsBest && !wantsStock && !wantsDue && !wantsProfit) {
        let qty = 0, amt = 0;
        R.bills.forEach((b) => b.lines.forEach((l) => { if (l.itemId === item.id) { qty += l.qty; amt += l.gross; } }));
        const v = App.stats.velocity(item.id, 21);
        const stock = App.itemStock(item);
        return {
          headline: qty + (hi ? ' नग' : ' units'),
          text: hi ? App.itemName(item) + ' ' + label + ' ' + qty + ' नग बिका (' + money(amt) + ')। अभी ' + stock + ' बचे हैं'
            + (v > 0.05 ? ', लगभग ' + Math.max(1, Math.round(stock / v)) + ' दिन चलेगा।' : '।')
            : App.itemName(item) + ' sold ' + qty + ' units ' + label + ' (' + money(amt) + '). ' + stock + ' left in stock'
            + (v > 0.05 ? ' — about ' + Math.max(1, Math.round(stock / v)) + ' days of cover.' : '.'),
          action: { label: '' + t('inv.restock'), fn: () => App.restockModal(item.id) }
        };
      }

      /* ── aggregate questions ── */
      if (wantsBest) {
        const top = App.stats.topItems(5, null, from, to);
        if (!top.length) return { headline: '—', text: hi ? 'इस अवधि में कुछ नहीं बिका।' : 'Nothing sold in that period.' };
        return {
          headline: top[0].name,
          text: (hi ? label + ' सबसे ज़्यादा बिका: ' : 'Best sellers ' + label + ': ') +
            top.map((x, i) => (i + 1) + '. ' + x.name + ' ×' + x.qty).join('  ·  ')
        };
      }
      if (wantsStock) {
        const low = App.items().filter((i) => App.stockState(i) !== 'ok');
        return {
          headline: low.length + (hi ? ' सामान' : ' items'),
          text: low.length ? (hi ? 'कम या खत्म: ' : 'Low or out of stock: ') + low.slice(0, 8).map((i) => App.itemName(i) + ' (' + App.itemStock(i) + ')').join(', ')
            : (hi ? 'सारा सामान भरपूर है' : 'Everything is well stocked'),
          action: { label: '' + t('nav.inventory'), fn: () => App.go('inventory') }
        };
      }
      if (wantsDue) {
        const dues = App.stats.dues();
        return {
          headline: money(App.stats.totalDue(), true),
          text: dues.length ? (hi ? dues.length + ' ग्राहकों से ' + money(App.stats.totalDue(), true) + ' लेना है। सबसे ज़्यादा: '
            : dues.length + ' customers owe you ' + money(App.stats.totalDue(), true) + '. Biggest: ')
            + dues.slice(0, 4).map((d) => d.c.name + ' ' + money(d.c.balance)).join(', ')
            : (hi ? 'किसी का उधार बाकी नहीं' : 'Nobody owes you anything'),
          action: { label: '' + t('nav.customers'), fn: () => App.go('customers') }
        };
      }
      if (wantsProfit) {
        return {
          headline: money(R.profit, true),
          text: hi ? label + ' अनुमानित मुनाफ़ा ' + money(R.profit, true) + ' (बिक्री ' + money(R.sales) + ' − लागत ' + money(R.cost) + ')।'
            : 'Estimated profit ' + label + ' is ' + money(R.profit, true) + ' (sales ' + money(R.sales) + ' − cost ' + money(R.cost) + ').'
        };
      }
      if (wantsSpend && !cust) {
        return { headline: money(R.sales, true), text: hi ? label + ' कुल ' + money(R.sales, true) + ' की बिक्री हुई।' : 'Total sales ' + label + ': ' + money(R.sales, true) + '.' };
      }
      if (wantsCount) {
        return {
          headline: String(R.count), text: hi ? label + ' ' + R.count + ' बिल बने, ' + R.items + ' नग बिके, कुल ' + money(R.sales, true) + '।'
            : R.count + ' bills ' + label + ', ' + R.items + ' units sold, ' + money(R.sales, true) + ' total.'
        };
      }
      if (wantsSales || from) {
        return {
          headline: money(R.sales, true),
          text: hi ? label + ' की बिक्री ' + money(R.sales, true) + ' (' + R.count + ' बिल, औसत ' + money(R.avg) + ')। मुनाफ़ा लगभग ' + money(R.profit) + '।'
            : 'Sales ' + label + ': ' + money(R.sales, true) + ' across ' + R.count + ' bills (avg ' + money(R.avg) + '). Est. profit ' + money(R.profit) + '.'
        };
      }
      return null;
    }
  };

  /* ═════════ daily target celebration ═════════ */
  App.checkTarget = async function () {
    const st = App.DB().settings;
    if (!App.storeTarget()) return;
    const today = App.stats.today().sales;
    const key = App.dayKey(Date.now());
    if (today >= App.storeTarget() && st.celebratedOn !== key+'/'+App.S()) {
      st.celebratedOn = key+'/'+App.S();
      (await App.save({ sync: false, render: false }));
      setTimeout(() => {
        App.confetti({ count: 170, y: innerHeight * 0.3 });
        App.toast('ok', '' + t('dash.targetHit'), money(today, true) + ' / ' + money(App.storeTarget()));
      }, 700);
    }
  };

  /* ═════════ morning summary ═════════ */
  App.morningBrief = async function (force) {
    if (!App.can('reports')) return;
    const st = App.DB().settings;
    const key = App.dayKey(Date.now());
    if (!force && st.seenSummaryOn === key) return;
    const y = Date.now() - App.DAY;
    const lines = AI.summary(force ? Date.now() : y);
    st.seenSummaryOn = key;
    (await App.save({ sync: false, render: false }));

    const body = App.el('<div>' +
      '<div class="ai-card"><div class="ai-h"> ' + (force ? t('rep.eod') : t('dash.yesterday')) + '</div>' +
      lines.map((l) => '<p style="font-size:14.5px;line-height:1.65;margin-bottom:9px">' + esc(l).replace(/\*(.+?)\*/g, '<b>$1</b>') + '</p>').join('') +
      '</div></div>');
    App.modal({
      title: '' + (App.lang() === 'hi' ? 'नमस्ते!' : 'Good morning!'), body,
      buttons: [
        { label: 'Read aloud', cls: 'ghost', keepOpen: true, fn: () => App.voice.speak(lines.join(' ').replace(/\*/g, '')) },
        { label: t('com.done'), cls: 'pri' }
      ]
    });
  };

  /* ═════════ dashboard ═════════ */
  App.views.dashboard = function (main) {
    App.requirePermission('reports');
    const st = App.DB().settings;
    const today = App.stats.today(), week = App.stats.days(7), month = App.stats.month();
    const yest = App.stats.range(App.startOfDay(Date.now() - App.DAY).getTime(), App.startOfDay(Date.now()).getTime() - 1);
    const due = App.stats.totalDue(), owed = App.stats.totalOwed();
    const health = App.stats.health();
    const series = App.stats.series(14);
    const top = App.stats.topItems(5, 30);
    const insights = AI.all().slice(0, 5);
    const outLow = App.items().filter((i) => App.stockState(i) !== 'ok');
    const exp = App.expiringBatches(14);
    const pct = App.storeTarget() ? Math.min(100, (today.sales / App.storeTarget()) * 100) : 0;
    const dPct = yest.sales > 0 ? Math.round(((today.sales - yest.sales) / yest.sales) * 100) : null;
    const hour = new Date().getHours();
    const greet = App.lang() === 'hi' ? 'नमस्ते' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    main.innerHTML =
      '<div class="page-head"><div><div class="eyebrow">' + greet + ', ' + esc((App.me() || {}).name || 'Owner') + '</div><h1>' + esc(st.shopName) + '</h1>' +
      '<div class="sub">' + t('dash.sub', { shop: esc(st.shopName) }) + ' · ' + new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }) + '</div></div>' +
      '<div class="spacer"></div>' +
      '<div class="btn-row"><button class="btn sm" id="briefBtn"> ' + t('rep.eod') + '</button>' +
      '<button class="btn pri" id="goBill"> ' + t('pos.charge') + '</button></div></div>' +

      '<div class="grid g-4" style="margin-bottom:16px">' +
      '<div class="stat accent"><span class="em"></span><div class="k">' + t('dash.todaySales') + '</div>' +
      '<div class="v">' + money(today.sales) + '</div>' +
      '<div class="d">' + t('dash.bills', { n: today.count }) +
      (dPct != null ? ' · ' + (dPct >= 0 ? '▲ ' : '▼ ') + Math.abs(dPct) + '% vs ' + (App.lang() === 'hi' ? 'कल' : 'yest') : '') + '</div></div>' +

      '<div class="stat"><span class="em"></span><div class="k">' + t('dash.weekSales') + '</div>' +
      '<div class="v">' + money(week.sales) + '</div><div class="d muted">' + t('dash.bills', { n: week.count }) + '</div></div>' +

      '<div class="stat"><span class="em"></span><div class="k">' + t('dash.monthSales') + '</div>' +
      '<div class="v">' + money(month.sales) + '</div><div class="d up">' + t('dash.profit') + ' ' + money(month.profit) + '</div></div>' +

      '<div class="stat ' + (due > 0 ? 'bad' : 'good') + '"><span class="em"></span><div class="k">' + t('dash.pendingDue') + '</div>' +
      '<div class="v" style="color:' + (due > 0 ? 'var(--bad)' : 'var(--ok)') + '">' + money(due) + '</div>' +
      '<div class="d muted">' + t('dash.owed') + ' ' + money(owed) + '</div></div></div>' +

      '<div class="grid" style="grid-template-columns:1fr 320px;gap:14px;margin-bottom:16px" id="dashRow">' +
      '<div class="card">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">' +
      '<h3 style="font-size:15px"> ' + t('dash.target') + '</h3><div class="spacer"></div>' +
      '<b class="num">' + money(today.sales) + ' / ' + money(App.storeTarget()) + '</b></div>' +
      '<div class="pbar" style="height:12px"><i class="' + (pct >= 100 ? 'g' : '') + '" style="width:' + pct + '%"></i></div>' +
      '<p style="font-size:12.5px;margin-top:8px;font-weight:650;color:' + (pct >= 100 ? 'var(--ok)' : 'var(--ink-3)') + '">' +
      (pct >= 100 ? t('dash.targetHit') : t('dash.toGo', { amt: money(App.storeTarget() - today.sales) })) + '</p>' +
      '<div class="sec-title"> ' + t('dash.trend') + '</div>' +
      App.chart.line(series.map((s) => ({ label: s.label, short: s.dow[0], value: s.value })), { height: 200 }) +
      '</div>' +

      '<div class="card"><h3 style="font-size:15px;margin-bottom:12px"> ' + t('dash.health') + '</h3>' +
      '<div class="ring-wrap">' + App.chart.ring(health.score) +
      '<div style="flex:1;font-size:12.5px">' +
      '<div class="kv" style="padding:5px 0"><span>' + t('com.stock') + '</span><b>' + health.stock + '%</b></div>' +
      '<div class="kv" style="padding:5px 0"><span>' + t('dash.trend') + '</span><b>' + health.trend + '%</b></div>' +
      '<div class="kv" style="padding:5px 0"><span>' + t('cus.due') + '</span><b>' + health.dues + '%</b></div>' +
      '</div></div>' +
      '<div class="sec-title"> ' + t('dash.topItems') + '</div>' +
      (top.length ? top.map((x, i) => '<div class="list-row" style="padding:8px 0">' +
        '<span class="rank ' + (i < 3 ? 'g' + (i + 1) : '') + '">' + (i + 1) + '</span>' +
        '<span style="flex:1;min-width:0"><b style="font-size:13.5px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(x.name) + '</b></span>' +
        '<b class="num" style="font-size:13px">' + x.qty + '</b></div>').join('')
        : '<p class="muted" style="font-size:13px">No sales yet</p>') +
      '</div></div>' +

      '<div class="sec-title"> ' + t('dash.needAttention') + '</div>' +
      (insights.length || outLow.length ?
        '<div class="grid g-2" style="margin-bottom:8px">' +
        '<div class="ai-card"><div class="ai-h"> ' + t('ai.title') + '</div>' +
        (insights.length ? insights.map((x) => '<div class="list-row" style="padding:9px 0;border-color:color-mix(in srgb,var(--ink-2) 14%,transparent)">' +
          '<span class="ins-ic">' + App.icon({ restock: 'box', due: 'wallet', expiry: 'calendar', anomaly: 'alert', slow: 'clock' }[x.kind] || 'sparkle', 16) + '</span>' +
          '<span style="flex:1;font-size:13.5px;font-weight:600;line-height:1.45">' + esc(x.text) + '</span>' +
          (x.kind === 'restock' ? '<button class="btn xs pri" data-ai-restock="' + x.item.id + '">+' + x.suggest + '</button>' : '') +
          (x.kind === 'due' ? '<button class="btn xs ok" data-ai-pay="' + x.customer.id + '">' + App.icon('cash',16) + '</button>' : '') +
          (x.kind === 'anomaly' ? '<button class="btn xs ghost" data-ai-bill="' + x.bill.id + '">' + App.icon('eye',16) + '</button>' : '') +
          '</div>').join('')
          : '<p style="font-size:13.5px">' + t('ai.nothing') + '</p>') + '</div>' +

        '<div class="card"><div class="sec-title" style="margin-top:0"> ' + t('inv.low') + ' / ' + t('inv.out') + '</div>' +
        (outLow.length ? outLow.slice(0, 6).map((i) => '<div class="list-row" style="padding:8px 0">' +
          App.mark(i) +
          '<span style="flex:1;min-width:0"><b style="font-size:13.5px">' + esc(App.itemName(i)) + '</b></span>' +
          '<span class="chip ' + (App.stockState(i) === 'out' ? 'bad' : 'warn') + '">' + App.itemStock(i) + '</span>' +
          '<button class="btn xs" data-ai-restock="' + i.id + '">' + App.icon('plus',16) + '</button></div>').join('')
          : '<p class="muted" style="font-size:13px">' + t('inv.allGood') + '</p>') +
        (exp.length ? '<div class="alert warn" style="margin-top:10px"><span class="ai"></span><span>' + exp.length + ' ' + t('inv.expiring').toLowerCase() + '</span></div>' : '') +
        '</div></div>'
        : '<div class="alert ok"><span class="ai"></span><span>' + t('dash.noAlerts') + '</span></div>') +

      '<div class="sec-title"> ' + t('dash.recent') + '</div>' +
      '<div class="card pad-0"><div class="tbl-wrap"><table class="tbl"><thead><tr>' +
      '<th>#</th><th>' + t('pos.customer') + window.App.moneyLiteral('</th><th>Items</th><th>Mode</th><th class="r">') + t('com.total') + '</th><th class="r">When</th><th></th></tr></thead><tbody>' +
      (App.bills().slice(0, 10).map((b) => '<tr' + (b.void ? ' style="opacity:.45"' : '') + '>' +
        '<td class="num">' + b.no + '</td>' +
        '<td><b>' + esc(b.customerName) + '</b></td>' +
        '<td class="muted" style="font-size:12.5px">' + esc(b.lines.map((l) => l.name + '×' + l.qty).join(', ').slice(0, 44)) + '</td>' +
        '<td><span class="chip ' + (b.credit ? 'bad' : b.mode === 'cash' ? 'ok' : '') + '">' + (b.credit ? '' + t('pos.credit') : String(b.mode).toUpperCase()) + '</span></td>' +
        '<td class="r num"><b' + (b.void ? ' style="text-decoration:line-through"' : '') + '>' + money(b.total) + '</b></td>' +
        '<td class="r muted" style="font-size:12.5px;white-space:nowrap">' + App.timeAgo(b.at) + '</td>' +
        '<td class="r" style="white-space:nowrap"><button class="btn xs ghost" data-view-bill="' + b.id + '">' + App.icon('eye',16) + '</button>' +
        (!b.void && App.isOwner() ? '<button class="btn xs ghost" data-void="' + b.id + '">' + App.icon('x',16) + '</button>' : '') + '</td></tr>').join('') ||
        '<tr><td colspan="7">' + App.emptyState('', 'No bills yet', 'Your first sale will show up here') + '</td></tr>') +
      '</tbody></table></div></div>';

    if (w.innerWidth <= 1000) App.$('#dashRow').style.gridTemplateColumns = '1fr';

    main.addEventListener('click', async (e) => {
      const r = e.target.closest('[data-ai-restock]'), p = e.target.closest('[data-ai-pay]');
      const vb = e.target.closest('[data-view-bill]'), ab = e.target.closest('[data-ai-bill]'), vo = e.target.closest('[data-void]');
      if (e.target.closest('#goBill')) return App.go('billing');
      if (e.target.closest('#briefBtn')) return (await App.morningBrief(true));
      if (r) return App.restockModal(r.dataset.aiRestock);
      if (p) return App.settleCustomer(p.dataset.aiPay);
      if (vb || ab) {
        const id = vb ? vb.dataset.viewBill : ab.dataset.aiBill;
        const b = App.DB().bills.find((x) => x.id === id);
        if (b) App.showReceipt(b);
        return;
      }
      if (vo) {
        const b = App.DB().bills.find((x) => x.id === vo.dataset.void);
        App.confirm('Cancel bill #' + b.no + '?', 'Stock goes back and any udhaar is reversed.', { danger: true, ok: 'Cancel bill' })
          .then(async (ok) => { if (ok) { (await App.actions.voidBill(b.id, 'manual')); App.toast('ok', 'Bill #' + b.no + ' cancelled'); } });
      }
    });
  };

  /* ═════════ reports ═════════ */
  App.views.reports = function (main) {
    App.requirePermission('reports');
    const st = App.DB().settings;
    const series = App.stats.series(repRange);
    const R = App.stats.days(repRange);
    const modes = {};
    R.bills.forEach((b) => { const k = b.credit ? 'credit' : b.mode; modes[k] = App.round2((modes[k] || 0) + b.total); });
    const MC = { cash: 'var(--ok)', upi: 'var(--ink-2)', card: 'var(--warn)', credit: 'var(--bad)' };
    const cash = App.stats.cashExpected();
    const gstRows = App.gstBreakdown(R.bills,R.returns);
    const acts = App.activity().slice(0, 25);

    main.innerHTML =
      '<div class="page-head"><div><h1> ' + t('rep.title') + '</h1><div class="sub">' + t('rep.sub') + '</div></div>' +
      '<div class="spacer"></div>' +
      '<div class="btn-row">' +
      [7, 14, 30, 90].map((n) => '<button class="chip tap ' + (repRange === n ? 'sel' : '') + '" data-rr="' + n + '">' + n + 'd</button>').join('') +
      '<button class="btn sm" id="repCsv"> ' + t('rep.exportCsv') + window.App.moneyLiteral('</button><button class="btn sm" id="cashShifts">Cash shifts</button><button class="btn sm" id="statements">Statements</button></div></div><p class="muted">This overview uses browser-local dates and excludes voided bills. Use Statements for store business dates and dated corrections.</p>') +

      '<div class="ai-card" style="margin-bottom:18px">' +
      '<div class="ai-h"> ' + t('rep.ask') + '</div>' +
      '<div class="row" style="gap:8px"><input class="inp" id="askQ" placeholder="' + t('rep.askPh') + '">' +
      '<button class="btn pri" id="askGo" style="flex:0 0 auto">' + App.icon('arrowRight',16) + '</button>' +
      '<button class="btn" id="askMic" style="flex:0 0 auto">' + App.icon('mic',16) + '</button></div>' +
      '<div id="askOut" style="margin-top:12px"></div>' +
      '<div class="chip-row" style="margin-top:10px">' +
      ['How much did I sell today?', "Who owes me money?", 'Best selling items this month', "What's running low?"]
        .map((s) => '<button class="chip tap" data-ask="' + esc(s) + '">' + esc(s) + '</button>').join('') + '</div></div>' +

      '<div class="grid g-4" style="margin-bottom:16px">' +
      window.App.moneyLiteral('<div class="stat accent"><span class="em"></span><div class="k">Net ') + t('rep.sales') + ' · ' + repRange + 'd</div><div class="v">' + money(R.sales) + '</div><div class="d">' + R.count + ' bills · returns '+money(R.returned,true)+'</div></div>' +
      '<div class="stat"><span class="em"></span><div class="k">' + t('rep.profit') + '</div><div class="v">' + money(R.profit) + '</div>' +
      '<div class="d up">' + (R.sales ? Math.round(R.profit / R.sales * 100) : 0) + '% margin</div></div>' +
      '<div class="stat"><span class="em"></span><div class="k">Avg bill</div><div class="v">' + money(R.avg) + '</div><div class="d muted">' + R.items + ' units</div></div>' +
      '<div class="stat"><span class="em"></span><div class="k">' + t('dash.stockValue') + '</div><div class="v">' + money(App.stats.stockValue()) + '</div>' +
      '<div class="d muted">' + App.items().length + ' items</div></div></div>' +

      '<div class="card" style="margin-bottom:16px"><div class="sec-title" style="margin-top:0"> ' + t('rep.sales') + '</div>' +
      App.chart.bars(series.map((s) => ({ label: s.label, short: repRange > 30 ? '' : s.label.split(' ')[0], value: s.value })), { height: 240 }) + '</div>' +

      '<div class="grid g-2" style="margin-bottom:16px">' +
      '<div class="card"><div class="sec-title" style="margin-top:0"> Original bills by mode (before returns)</div>' +
      '<div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap">' +
      App.chart.donut(Object.keys(modes).map((k) => ({ label: k, value: modes[k], color: MC[k] || '#999' })), { caption: repRange + ' days' }) +
      '<div style="flex:1;min-width:150px">' +
      (Object.keys(modes).length ? Object.keys(modes).sort((a, b) => modes[b] - modes[a]).map((k) =>
        '<div class="kv"><span><i style="display:inline-block;width:11px;height:11px;border-radius:4px;background:' + (MC[k] || '#999') + ';margin-right:7px"></i>' + k.toUpperCase() + '</span>' +
        '<b class="num">' + money(modes[k]) + '</b></div>').join('') : '<p class="muted" style="font-size:13px">No bills yet</p>') +
      '</div></div></div>' +

      '<div class="card"><div class="sec-title" style="margin-top:0"> ' + (cash.businessDate?'Cash movements · '+cash.businessDate:t('rep.cash')) + '</div>' +
      window.App.moneyLiteral('<div class="kv"><span>Bills paid in cash</span><b class="num">') + money(cash.billCash, true) + '</b></div>' +
      window.App.moneyLiteral('<div class="kv"><span>Customer cash received (collections and advances)</span><b class="num">') + money(cash.payCash, true) + '</b></div>' +
      window.App.moneyLiteral('<div class="kv"><span>Cash paid to suppliers</span><b class="num" style="color:var(--bad)">− ') + money(cash.supplierOut ?? cash.out-cash.refundCash, true) + '</b></div>' +
      window.App.moneyLiteral('<div class="kv"><span>Cash refunds paid</span><b class="num">− ')+money(cash.refundCash,true)+'</b></div>' +
      window.App.moneyLiteral('<div class="kv"><span>Supplier cash refunds received</span><b class="num">')+money(cash.supplierRefundCash,true)+'</b></div>' +
      (cash.manualNet!==undefined?window.App.moneyLiteral('<div class="kv"><span>Expenses, withdrawals and linked corrections</span><b class="num">')+money(cash.manualNet,true)+'</b></div>':'')+
      '<div class="kv" style="font-size:16px"><b>' + (cash.businessDate?window.App.moneyLiteral('Net cash movements (excluding opening float)'):t('rep.expected')) + '</b><b class="num">' + money(cash.net, true) + '</b></div>' +
      (cash.businessDate?window.App.moneyLiteral('<p>Use Cash shifts to review opening float, counted cash and closing variance.</p>'):'<div class="row" style="margin-top:12px"><input class="inp num" id="countedCash" type="number" inputmode="decimal" placeholder="' + t('rep.counted') + '">' +
      '<button class="btn pri" id="reconcile" style="flex:0 0 auto">' + t('com.confirm') + '</button></div>' +
      '<div id="reconOut" style="margin-top:10px"></div>')+'</div></div>' +

      (st.gstEnabled ?
        '<div class="card" style="margin-bottom:16px"><div class="sec-title" style="margin-top:0"> ' + t('rep.gst') + ' · ' + repRange + 'd</div>' +
        '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Rate</th><th class="r">' + t('rep.taxable') + '</th><th class="r">CGST</th><th class="r">SGST</th><th class="r">' + t('rep.collected') + '</th></tr></thead><tbody>' +
        (Object.keys(gstRows).length ? Object.keys(gstRows).sort((a, b) => a - b).map((rate) =>
          '<tr><td><b>' + rate + '%</b></td><td class="r num">' + money(gstRows[rate].taxable, true) + '</td>' +
          '<td class="r num">' + money(gstRows[rate].tax / 2, true) + '</td><td class="r num">' + money(gstRows[rate].tax / 2, true) + '</td>' +
          '<td class="r num"><b>' + money(gstRows[rate].tax, true) + '</b></td></tr>').join('')
          : '<tr><td colspan="5" class="muted" style="text-align:center">No taxed bills in this period</td></tr>') +
        '</tbody></table></div></div>'
        : '<div class="alert info" style="margin-bottom:16px"><span class="ai"></span><span>' + t('rep.noGst') + ' — ' +
        '<button class="btn xs" id="goSettings">' + t('nav.settings') + '</button></span></div>') +

      '<div class="card"><div class="sec-title" style="margin-top:0"> ' + t('rep.staffLog') + '</div>' +
      (acts.length ? acts.map((a) => '<div class="list-row" style="padding:9px 0">' +
        '<span class="rank">' + ({ bill: '', payment: '', void: '✕', restock: '', purchase: '', spay: '', item: '', customer: '', remind: '', import: '', sys: '' }[a.type] || '•') + '</span>' +
        '<span style="flex:1;font-size:13.5px">' + esc(a.text) + '</span>' +
        '<span class="chip">' + esc((App.staff(a.staffId) || {}).name || '—') + '</span>' +
        '<span class="muted" style="font-size:12px;white-space:nowrap">' + App.timeAgo(a.at) + '</span></div>').join('')
        : '<p class="muted" style="font-size:13px">Nothing logged yet</p>') + '</div>';

    /* ask box */
    const runAsk = (q) => {
      const out = App.$('#askOut');
      out.innerHTML = '<div class="sk sk-line" style="width:70%"></div><div class="sk sk-line" style="width:45%"></div>';
      setTimeout(() => {
        const a = AI.ask(q);
        if (!a) { out.innerHTML = '<div class="alert warn"><span class="ai"></span><span>' + t('ai.noAnswer') + '</span></div>'; return; }
        out.innerHTML = '<div style="background:var(--surface);border-radius:14px;padding:14px 16px;border:1px solid var(--line)">' +
          '<div style="font-size:26px;font-weight:850;letter-spacing:-.03em;color:var(--ink)">' + esc(a.headline) + '</div>' +
          '<p style="font-size:14px;line-height:1.6;margin-top:6px">' + esc(a.text) + '</p>' +
          (a.action ? '<button class="btn sm" id="askAct" style="margin-top:10px">' + esc(a.action.label) + '</button>' : '') + '</div>';
        if (a.action) App.$('#askAct').onclick = a.action.fn;
      }, 260);
    };

    main.addEventListener('click', async (e) => {
      const rr = e.target.closest('[data-rr]'), qa = e.target.closest('[data-ask]');
      if(e.target.closest('#cashShifts'))return App.cashDashboard();if(e.target.closest('#statements'))return App.reconciliationDashboard();
      if (rr) { repRange = +rr.dataset.rr; return App.render(); }
      if (qa) { App.$('#askQ').value = qa.dataset.ask; return runAsk(qa.dataset.ask); }
      if (e.target.closest('#askGo')) return runAsk(App.$('#askQ').value);
      if (e.target.closest('#goSettings')) return App.go('settings');
      if (e.target.closest('#askMic')) {
        if (!App.voice.supported()) return App.toast('err', t('voice.unsupported'));
        const orb = App.$('#voiceOrb'), txt = App.$('#orbText');
        orb.hidden = false; txt.innerHTML = '<span class="dim">' + t('rep.askPh') + '</span>';
        App.$('#orbStop').onclick = () => { orb.hidden = true; App.voice.stop(); };
        App.voice.start({
          onPartial: (s) => { txt.textContent = s; },
          onError: () => { orb.hidden = true; App.toast('err', t('voice.denied')); },
          onFinal: (s) => { orb.hidden = true; if (s) { App.$('#askQ').value = s; runAsk(s); } }
        });
        return;
      }
      if (e.target.closest('#reconcile')) {
        const counted = parseFloat(App.$('#countedCash').value);
        const o = App.$('#reconOut');
        if (isNaN(counted)) { o.innerHTML = '<div class="alert warn"><span class="ai"></span><span>Enter the counted amount</span></div>'; return; }
        const d = App.round2(counted - cash.net);
        const resultHTML = Math.abs(d) < 1
          ? '<div class="alert ok"><span class="ai"></span><span>' + t('rep.match') + '</span></div>'
          : '<div class="alert ' + (d < 0 ? 'bad' : 'warn') + '"><span class="ai">' + (d < 0 ? '' : '') + '</span><span>' +
          (d < 0 ? t('rep.short', { amt: money(-d, true) }) : t('rep.over', { amt: money(d, true) })) + '</span></div>';
        App.log('cash', 'Cash counted ' + money(counted, true) + ' vs expected ' + money(cash.net, true));
        (await App.save({ render: false }));
        o.innerHTML = resultHTML;
        return;
      }
      if (e.target.closest('#repCsv')) {
        const rows = [['Bill', window.App.moneyLiteral('Date'), window.App.moneyLiteral('Customer'), window.App.moneyLiteral('Items'), 'Subtotal', 'Discount', 'GST', 'Total', 'Mode', window.App.moneyLiteral('Credit'), 'Staff']];
        R.bills.forEach((b) => rows.push([b.no, App.fmtDT(b.at), b.customerName,
        b.lines.map((l) => l.name + '×' + l.qty).join('; '), b.sub, b.discount, b.tax, b.total, b.mode,
        b.credit ? 'Yes' : 'No', (App.staff(b.staffId) || {}).name || '']));
        App.download(App.toCSV(rows), 'dukaan-sales-' + repRange + 'd.csv', 'text/csv');
        App.toast('ok', 'Sales exported', R.bills.length + ' bills');
      }
    });
    App.$('#askQ').addEventListener('keydown', (e) => { if (e.key === 'Enter') runAsk(e.target.value); });
  };
})(window);
