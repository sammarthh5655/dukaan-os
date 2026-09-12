/* ══════════════════════════════════════════════════════════
   Dukaan OS — accounts: sign up / log in / log out
   Local convenience login, not server-enforced authorization or encryption.
   Passwords use salted PBKDF2-SHA256; shop records and staff PINs remain
   in local browser storage. A person controlling that storage can bypass
   the gate. Account namespaces prevent accidental mixing of shop records.
   ══════════════════════════════════════════════════════════ */
(function (w) {
  'use strict';
  const App = w.App;

  const ACCOUNTS_KEY = 'dukaanos.accounts';
  const SESSION_KEY = 'dukaanos.session';
  const GATE_KEY = 'dukaanos.authgate';
  const LOCAL_ID = 'local';
  const ITER = 600000, LEGACY_ITER = 150000, SESSION_MS = 8 * 60 * 60 * 1000;
  let verified = null, freshUntil = 0, freshContext = null;
  const attemptKey = (kind) => 'dukaanos.attempts.' + kind;
  function attemptState(kind) {
    try { const s = JSON.parse(localStorage.getItem(attemptKey(kind)) || '{}'); return { count: Number(s.count) || 0, until: Number(s.until) || 0 }; }
    catch (e) { throw new Error(App.uiText('Authentication state is unreadable.')); }
  }
  function checkAttempt(kind) {
    if (attemptState(kind).until > Date.now()) throw new Error(App.uiText('Too many attempts. Wait before trying again.'));
  }
  function failedAttempt(kind) {
    const s = attemptState(kind); s.count++;
    s.until = Date.now() + (s.count < 3 ? 0 : Math.min(60000, 1000 * 2 ** Math.min(s.count - 3, 6)));
    localStorage.setItem(attemptKey(kind), JSON.stringify(s));
  }
  function passedAttempt(kind) { localStorage.removeItem(attemptKey(kind)); }
  function grantFresh() { freshUntil = Date.now() + 60000; freshContext = App.context(); }
  function signedIn(acc) {
    const session = { accountId: acc.id, at: Date.now() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    verified = { ...session, hash: acc.hash };
    App.setLocked(false); grantFresh();
  }
  function newPassword(password) {
    if (typeof password !== 'string' || password.length < 12 || password.length > 256) throw new Error(App.uiText('Use a password of 12 to 256 characters.'));
  }
  async function checkPassword(acc, password) {
    checkAttempt('password');
    // Older releases permitted long passwords; retain those while bounding verification input.
    if (typeof password !== 'string' || password.length > 4096) throw new Error(App.uiText('Password is too long.'));
    const check = await derive(password, acc ? acc.salt : '00'.repeat(16), acc ? (acc.iterations || LEGACY_ITER) : ITER);
    if (!acc || check.hash !== acc.hash) { failedAttempt('password'); throw new Error(App.uiText('Incorrect username or password')); }
    passedAttempt('password');
  }

  function loadAccounts() {
    try {
      const raw = localStorage.getItem(ACCOUNTS_KEY) || '[]';
      if (raw.length > 1000000) throw new Error('Too many accounts');
      const list = JSON.parse(raw);
      if (!Array.isArray(list) || list.length > 1000 || list.some(a => !a || !/^[A-Za-z0-9_-]{1,100}$/.test(a.id) ||
        typeof a.username !== 'string' || !/^[0-9a-f]{32}$/.test(a.salt) || !/^[0-9a-f]{64}$/.test(a.hash) ||
        (a.iterations != null && ![LEGACY_ITER, ITER].includes(a.iterations)))) throw new Error('Invalid account');
      return list;
    }
    catch (e) { throw new Error(App.uiText('Account data is unreadable. Preserve storage and restore a backup.')); }
  }
  function saveAccounts(list) {
    App.assertWriter();
    try { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list)); }
    catch (e) { console.error('Could not save accounts', e); throw new Error(App.uiText('Storage is full or unavailable')); }
  }

  function bytesToHex(bytes) { return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join(''); }
  function hexToBytes(hex) {
    const a = new Uint8Array(hex.length / 2);
    for (let i = 0; i < a.length; i++) a[i] = parseInt(hex.substr(i * 2, 2), 16);
    return a;
  }

  async function derive(password, saltHex, iterations = ITER) {
    if (!w.crypto || !w.crypto.subtle) throw new Error(App.uiText('This browser cannot run secure login — please update it'));
    const enc = new TextEncoder();
    const salt = saltHex ? hexToBytes(saltHex) : w.crypto.getRandomValues(new Uint8Array(16));
    const keyMaterial = await w.crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await w.crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, keyMaterial, 256);
    return { hash: bytesToHex(new Uint8Array(bits)), salt: bytesToHex(salt) };
  }

  function normUser(u) { return String(u || '').trim(); }
  function findAccount(accounts, username) {
    const n = normUser(username).toLowerCase();
    return accounts.find((a) => a.username.toLowerCase() === n);
  }

  const Auth = {
    accounts: loadAccounts,
    checkPin(pin, expected) {
      checkAttempt('pin');
      if (!expected || String(pin) !== expected) { failedAttempt('pin'); throw new Error(App.uiText('Incorrect PIN')); }
      passedAttempt('pin');
    },
    requireFresh() {
      App.requirePermission('settings');
      const me = App.me(), protectedShop = this.gateOn() || !!me.pin || !!App.DB().settings.pin;
      if (protectedShop && (!freshContext || !App.contextValid(freshContext) || Date.now() >= freshUntil)) throw new Error('Verify the owner password or PIN again.');
    },
    async verifyOwner() {
      App.requirePermission('settings');
      const context = App.context(), acc = this.currentAccount(), me = App.me();
      const expected = me.pin || App.DB().settings.pin;
      if (this.gateOn()) {
        if (!acc) throw new Error(App.uiText('Sign in first.'));
        const password = await App.prompt('Verify owner', 'Enter your account password', { type: 'password' });
        if (password == null) return false;
        await checkPassword(acc, password);
      } else if (expected) {
        const pin = await App.prompt('Verify owner', 'Enter your owner PIN', { type: 'password' });
        if (pin == null) return false;
        this.checkPin(pin, expected);
      }
      App.assertContext(context); App.requirePermission('settings'); grantFresh(); return true;
    },

    /* Whether the app demands a login before opening. Off by default —
       the counter opens straight to the shop — but a shopkeeper who wants
       the till protected can switch it on from Settings. */
    gateOn() {
      return localStorage.getItem(GATE_KEY) === 'on';
    },

    /* Turning the gate on/off moves the shop's data between the anonymous
       "local" namespace and the account's own, so the shopkeeper keeps
       working with the same bills and stock either way instead of
       suddenly staring at an empty till. */
    async enableGate(accountId) {
      App.assertWriter();
      if (!this.currentAccount() || this.currentAccount().id !== accountId) throw new Error(App.uiText('Sign in first.'));
      const context = App.context();
      const local = await App.storage.read('dukaanos.v2.local');
      App.assertContext(context);
      if (local) {
        App.validateData(JSON.parse(local));
        const transferred=App.drafts.reassign(local,'local',accountId);
        localStorage.setItem('dukaanos.localOwner', accountId);
        await App.storage.write('dukaanos.v2.' + accountId, transferred);
        if (await App.storage.read('dukaanos.v2.' + accountId) !== transferred) throw new Error('Migration could not be verified.');
        for (const suffix of ['.before-restore']) {
          const raw = await App.storage.read('dukaanos.v2.local' + suffix);
          if (raw) await App.storage.write('dukaanos.v2.' + accountId + suffix, raw);
        }
        const queue = await App.storage.read('dukaanos.syncq.local');
        if (queue) await App.storage.write('dukaanos.syncq.' + accountId, queue);
      }
      App.assertContext(context);
      if (App.migrations && App.migrations.info('local')) await App.migrations.run({allowPrototype:true,accountId});
      (await App.boot(accountId));
      localStorage.setItem(GATE_KEY, 'on');
      if (local) { (await App.wipeAccountData('local')); localStorage.removeItem('dukaanos.localOwner'); }
      grantFresh();
    },
    async disableGate() {
      this.requireFresh();
      const s = this.session();
      const context = App.context();
      const mine = s && await App.storage.read('dukaanos.v2.' + s.accountId);
      if (!mine) throw new Error('Account data is unavailable.');
      localStorage.setItem('dukaanos.localOwner', s.accountId);
      await App.storage.write('dukaanos.v2.local', App.drafts.reassign(mine,s.accountId,'local'));
      App.assertContext(context); this.requireFresh();
      if (App.migrations && App.migrations.info(s.accountId)) await App.migrations.run({allowPrototype:true,accountId:LOCAL_ID});
      localStorage.setItem(GATE_KEY, 'off');
      localStorage.removeItem(SESSION_KEY);
      verified = null;
      (await App.boot(LOCAL_ID));
      App.invalidateContext();
    },

    session() {
      try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
      catch (e) { return null; }
    },

    /* the account for the current session, or null if there isn't a valid one */
    currentAccount() {
      const s = this.session();
      if (!verified || !s || s.accountId !== verified.accountId || s.at !== verified.at ||
        Date.now() - verified.at >= SESSION_MS || verified.at > Date.now()) return null;
      return loadAccounts().find(a => a.id === verified.accountId && a.hash === verified.hash) || null;
    },

    async signUp({ username, password, confirm, shopName }) {
      username = normUser(username);
      shopName = String(shopName || '').trim();
      if (username.length > 64 || username.length < 3) throw new Error(App.uiText('Username must be at least 3 characters'));
      if (!/^[a-zA-Z0-9_.]+$/.test(username)) throw new Error(App.uiText('Username can only use letters, numbers, "." and "_"'));
      if (!shopName || shopName.length > 256) throw new Error(App.uiText('Enter your shop name'));
      password = String(password || '');
      newPassword(password);
      if (password !== confirm) throw new Error(App.uiText('Passwords do not match'));

      const accounts = loadAccounts();
      if (accounts.length >= 1000) throw new Error(App.uiText('This browser has reached its account limit.'));
      if (findAccount(accounts, username)) throw new Error(App.uiText('That username is already taken'));

      const context = App.context();
      const { hash, salt } = await derive(password);
      if (!App.contextValid(context)) throw new Error(App.uiText('The counter changed. Try again.'));
      const acc = {
        id: App.uid('ac'), username, shopName, hash, salt, iterations: ITER,
        createdAt: Date.now(), lastLoginAt: Date.now()
      };
      accounts.push(acc);
      saveAccounts(accounts);
      (await App.initAccountData(acc.id, shopName));
      signedIn(acc);
      return acc;
    },

    async logIn({ username, password }) {
      const context = App.context();
      const accounts = loadAccounts();
      const acc = findAccount(accounts, username);
      await checkPassword(acc, String(password || ''));
      if (!acc.iterations || acc.iterations < ITER) { Object.assign(acc, await derive(String(password))); acc.iterations = ITER; }
      if (!App.contextValid(context)) throw new Error(App.uiText('The counter changed. Try again.'));
      acc.lastLoginAt = Date.now();
      saveAccounts(accounts);
      signedIn(acc);
      return acc;
    },

    async logOut() {
      // Accepted commands already await persistence. Lock immediately; never
      // flush a pending/abandoned draft under credentials being invalidated.
      localStorage.removeItem(SESSION_KEY);
      verified = null; freshUntil = 0; App.setLocked(true);
      App.accountId = null;
    },

    async changePassword(accountId, oldPassword, newPassword) {
      App.requirePermission('settings');
      const context = App.context();
      const accounts = loadAccounts();
      const acc = accounts.find((a) => a.id === accountId);
      if (!acc) throw new Error(App.uiText('Account not found'));
      await checkPassword(acc, String(oldPassword || ''));
      const nextPassword = String(newPassword || '');
      if (nextPassword.length < 12 || nextPassword.length > 256) throw new Error(App.uiText('Use a password of 12 to 256 characters.'));
      const fresh = await derive(newPassword);
      App.assertContext(context);
      acc.hash = fresh.hash; acc.salt = fresh.salt; acc.iterations = ITER;
      saveAccounts(accounts);
      this.logOut();
      location.reload();
    },

    /* Removes the login AND every bill/item/customer/supplier that account
       ever had. Requires the password again — this is irreversible. */
    async deleteAccount(accountId, password) {
      App.requirePermission('settings');
      const context = App.context();
      const accounts = loadAccounts();
      const acc = accounts.find((a) => a.id === accountId);
      if (!acc) throw new Error(App.uiText('Account not found'));
      await checkPassword(acc, String(password || ''));
      App.assertContext(context);
      (await App.wipeAccountData(accountId));
      if (localStorage.getItem('dukaanos.localOwner') === accountId) { (await App.wipeAccountData('local')); localStorage.removeItem('dukaanos.localOwner'); }
      saveAccounts(accounts.filter((a) => a.id !== accountId));
      verified = null; freshUntil = 0; App.setLocked(true);
      const s = this.session();
      if (s && s.accountId === accountId) localStorage.removeItem(SESSION_KEY);
    }
  };

  App.auth = Auth;
})(window);
