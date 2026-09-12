/* ══════════════════════════════════════════════════════════
   Dukaan OS — bilingual UI (English / हिन्दी)
   ══════════════════════════════════════════════════════════ */
(function (w) {
  'use strict';
  const App = w.App;

  const EN = {
    'nav.dashboard': 'Dashboard', 'nav.billing': 'Billing', 'nav.bill': 'Bill', 'nav.inventory': 'Inventory',
    'nav.customers': 'Customers', 'nav.suppliers': 'Suppliers', 'nav.reports': 'Reports', 'nav.settings': 'Settings',

    'time.now': 'just now', 'time.m': 'm ago', 'time.h': 'h ago', 'time.d': 'd ago', 'time.mo': 'mo ago',
    'com.save': 'Save', 'com.cancel': 'Cancel', 'com.delete': 'Delete', 'com.edit': 'Edit', 'com.add': 'Add',
    'com.close': 'Close', 'com.confirm': 'Confirm', 'com.search': 'Search…', 'com.all': 'All', 'com.none': 'None',
    'com.today': 'Today', 'com.week': 'This week', 'com.month': 'This month', 'com.total': 'Total', 'com.name': 'Name',
    'com.phone': 'Phone', 'com.price': 'Price', 'com.cost': 'Cost price', 'com.stock': 'Stock', 'com.qty': 'Qty',
    'com.category': 'Category', 'com.amount': 'Amount', 'com.date': 'Date', 'com.optional': 'optional',
    'com.yes': 'Yes', 'com.no': 'No', 'com.done': 'Done', 'com.share': 'Share', 'com.print': 'Print', 'com.export': 'Export',
    'com.back': 'Back', 'com.more': 'More', 'com.undo': 'Undo', 'com.paid': 'Paid', 'com.pending': 'Pending', 'com.new': 'New',

    'dash.hi': 'Namaste', 'dash.sub': "Here's how {shop} is doing",
    'dash.todaySales': "Today's sales", 'dash.weekSales': 'Last 7 days', 'dash.monthSales': 'This month',
    'dash.pendingDue': 'Customers owe you', 'dash.owed': 'You owe suppliers', 'dash.profit': 'Est. profit',
    'dash.bills': '{n} bills', 'dash.target': 'Daily target', 'dash.targetHit': 'Target smashed!',
    'dash.toGo': '{amt} to go', 'dash.health': 'Shop health', 'dash.trend': 'Sales trend',
    'dash.topItems': 'Best sellers', 'dash.needAttention': 'Needs your attention', 'dash.recent': 'Recent bills',
    'dash.yesterday': 'Yesterday at a glance', 'dash.noAlerts': 'All clear — nothing needs you right now',
    'dash.quick': 'Quick actions', 'dash.stockValue': 'Stock value',

    'pos.title': 'Billing counter', 'pos.sub': 'Tap items to add · speak · or scan',
    'pos.searchItems': 'Search item, or say it out loud…', 'pos.cart': 'Cart', 'pos.empty': 'Cart is empty',
    'pos.emptySub': 'Tap an item, use voice, or scan a barcode', 'pos.subtotal': 'Subtotal',
    'pos.discount': 'Discount', 'pos.tax': 'GST', 'pos.grand': 'Total', 'pos.customer': 'Customer',
    'pos.walkin': 'Walk-in', 'pos.charge': 'Charge', 'pos.cash': 'Cash', 'pos.upi': 'UPI', 'pos.card': 'Card',
    'pos.credit': 'Udhaar', 'pos.favorites': 'Favourites', 'pos.scan': 'Scan', 'pos.voice': 'Speak',
    'pos.clear': 'Clear cart', 'pos.outOfStock': 'Out of stock', 'pos.onlyLeft': 'Only {n} left',
    'pos.done': 'Bill saved!', 'pos.doneSub': '{amt} · {mode}', 'pos.creditAdded': 'Added to {name}\'s udhaar',
    'pos.pickCustomer': 'Choose customer', 'pos.needCustomer': 'Pick a customer for udhaar',
    'pos.redeem': 'Redeem points', 'pos.lastBill': 'Last bill', 'pos.noItems': 'No items match',
    'pos.addQuick': 'Add a quick item', 'pos.quickHint': 'Not in your list? Add it on the fly.',
    'pos.share': 'Send on WhatsApp', 'pos.newBill': 'New bill', 'pos.holdOn': 'Bill kept — start a new one',

    'voice.listen': 'Listening…', 'voice.say': 'Try: "do packet lays aur ek maggi"',
    'voice.noMatch': "Couldn't find that item", 'voice.added': 'Added {n} item(s)',
    'voice.unsupported': 'Voice needs Chrome on Android or desktop',
    'voice.denied': 'Microphone blocked — allow it in browser settings',
    'voice.confirm': 'Add these?', 'voice.heard': 'You said',

    'inv.title': 'Inventory', 'inv.sub': '{n} items · {v} stock value', 'inv.addItem': 'Add item',
    'inv.out': 'Out of stock', 'inv.low': 'Running low', 'inv.expiring': 'Expiring soon',
    'inv.restock': 'Restock', 'inv.threshold': 'Low-stock alert below', 'inv.barcode': 'Barcode',
    'inv.import': 'Import CSV', 'inv.expiry': 'Expiry date', 'inv.batches': 'Batches',
    'inv.fifoHint': 'Sell the {date} batch first ({n} left)', 'inv.allGood': 'Every item is well stocked',
    'inv.emoji': 'Icon', 'inv.fav': 'Pin to billing screen', 'inv.gstRate': 'GST %',
    'inv.saved': 'Item saved', 'inv.deleted': 'Item removed', 'inv.restocked': '{name} +{n}',
    'inv.csvHelp': 'Columns: name, price, cost, stock, category, barcode',

    'cus.title': 'Customers & Udhaar', 'cus.sub': '{n} customers · {amt} pending',
    'cus.add': 'Add customer', 'cus.due': 'Pending dues', 'cus.noDue': 'Nobody owes you anything',
    'cus.swipeHint': 'Swipe a card right to log payment, left to remind',
    'cus.logPayment': 'Log payment', 'cus.remind': 'Remind on WhatsApp', 'cus.history': 'Purchase history',
    'cus.balance': 'Pending', 'cus.points': 'Points', 'cus.since': 'Due for {n} days',
    'cus.paidFull': '{name} is all settled', 'cus.received': 'Received {amt} from {name}',
    'cus.birthday': 'Birthday', 'cus.bdayToday': "It's {name}'s birthday today",
    'cus.overdue7': '7+ days', 'cus.overdue15': '15+ days', 'cus.overdue30': '30+ days',
    'cus.visits': '{n} visits', 'cus.spent': 'Spent {amt}', 'cus.settleAll': 'Settle full amount',

    'sup.title': 'Suppliers & Purchases', 'sup.sub': 'You owe {amt} across {n} suppliers',
    'sup.add': 'Add supplier', 'sup.newPO': 'Record purchase', 'sup.owed': 'You owe',
    'sup.paySupplier': 'Pay supplier', 'sup.supplies': 'Supplies', 'sup.dueDate': 'Payment due',
    'sup.history': 'Purchase history', 'sup.stockIn': 'Stock added to inventory',
    'sup.overdue': 'Payment overdue', 'sup.noSup': 'No suppliers yet',

    'rep.title': 'Reports & Insights', 'rep.sub': 'What your numbers are telling you',
    'rep.sales': 'Sales', 'rep.profit': 'Profit', 'rep.gst': 'GST summary', 'rep.cash': 'Cash reconciliation',
    'rep.expected': 'Expected in drawer', 'rep.counted': 'Counted cash', 'rep.diff': 'Difference',
    'rep.short': 'Short by {amt}', 'rep.over': 'Extra {amt}', 'rep.match': 'Perfectly matched',
    'rep.byMode': 'Payment modes', 'rep.ask': 'Ask about your shop',
    'rep.askPh': 'e.g. How much did Ramesh spend this month?',
    'rep.eod': "Today's summary", 'rep.staffLog': 'Activity log', 'rep.exportCsv': 'Export CSV',
    'rep.taxable': 'Taxable value', 'rep.collected': 'GST collected', 'rep.noGst': 'GST is switched off',

    'ai.title': 'Smart suggestions', 'ai.restock': 'Reorder {name} — sells out every {n} days',
    'ai.slow': '{name} has barely moved in 3 weeks — consider a combo offer',
    'ai.anomaly': 'Bill #{no} of {amt} is unusually large', 'ai.dueChase': 'Follow up with {name} — {amt} pending for {d} days',
    'ai.expiry': '{name} expires in {d} days — push it today', 'ai.nothing': 'Nothing unusual. Good day!',
    'ai.thinking': 'Looking at your data…', 'ai.noAnswer': "I couldn't work that out. Try asking about a customer, an item, or today's sales.",

    'set.title': 'Settings', 'set.shop': 'Shop details', 'set.shopName': 'Shop name', 'set.upi': 'UPI ID',
    'set.gstin': 'GSTIN', 'set.address': 'Address', 'set.lowStock': 'Default low-stock alert',
    'set.dailyTarget': 'Daily sales target', 'set.gstOn': 'Charge GST on bills',
    'set.lang': 'Language', 'set.theme': 'Dark mode', 'set.pin': 'PIN lock', 'set.pinHint': 'Ask for a PIN before opening the app',
    'set.setPin': 'Set 4-digit PIN', 'set.staff': 'Staff', 'set.addStaff': 'Add staff', 'set.role': 'Role',
    'set.owner': 'Owner', 'set.cashier': 'Cashier', 'set.stores': 'Stores', 'set.addStore': 'Add store',
    'set.backup': 'Backup & data', 'set.exportAll': 'Export all my data', 'set.importData': 'Restore from backup',
    'set.reset': 'Erase everything', 'set.resetWarn': 'This deletes every bill, item and customer. Cannot be undone.',
    'set.receipt': 'Receipt theme', 'set.loyalty': 'Loyalty', 'set.loyaltyRate': '₹ spent per 1 point',
    'set.logo': 'Shop logo', 'set.saved': 'Saved', 'set.switchStaff': 'Switch user',

    'sync.online': 'Online', 'sync.offline': 'Offline mode', 'sync.pending': '{n} to sync',
    'sync.syncing': 'Syncing…', 'sync.done': 'Everything synced', 'sync.doneSub': '{n} changes uploaded',
    'sync.offlineHint': 'Work is saved on this device only. Cloud sync is not available; export backups regularly.',

    'lock.enter': 'Enter your PIN', 'lock.wrong': 'Wrong PIN, try again', 'lock.welcome': 'Welcome back'
  };

  const HI = {
    'nav.dashboard': 'डैशबोर्ड', 'nav.billing': 'बिलिंग', 'nav.bill': 'बिल', 'nav.inventory': 'सामान',
    'nav.customers': 'ग्राहक', 'nav.suppliers': 'सप्लायर', 'nav.reports': 'रिपोर्ट', 'nav.settings': 'सेटिंग',

    'time.now': 'अभी', 'time.m': ' मिनट पहले', 'time.h': ' घंटे पहले', 'time.d': ' दिन पहले', 'time.mo': ' महीने पहले',
    'com.save': 'सेव करें', 'com.cancel': 'रद्द करें', 'com.delete': 'हटाएँ', 'com.edit': 'बदलें', 'com.add': 'जोड़ें',
    'com.close': 'बंद करें', 'com.confirm': 'पक्का करें', 'com.search': 'खोजें…', 'com.all': 'सभी', 'com.none': 'कोई नहीं',
    'com.today': 'आज', 'com.week': 'इस हफ्ते', 'com.month': 'इस महीने', 'com.total': 'कुल', 'com.name': 'नाम',
    'com.phone': 'फ़ोन', 'com.price': 'दाम', 'com.cost': 'खरीद दाम', 'com.stock': 'स्टॉक', 'com.qty': 'मात्रा',
    'com.category': 'श्रेणी', 'com.amount': 'रकम', 'com.date': 'तारीख', 'com.optional': 'ज़रूरी नहीं',
    'com.yes': 'हाँ', 'com.no': 'नहीं', 'com.done': 'हो गया', 'com.share': 'भेजें', 'com.print': 'प्रिंट', 'com.export': 'निर्यात',
    'com.back': 'वापस', 'com.more': 'और', 'com.undo': 'वापस लें', 'com.paid': 'चुकाया', 'com.pending': 'बाकी', 'com.new': 'नया',

    'dash.hi': 'नमस्ते', 'dash.sub': '{shop} का आज का हाल',
    'dash.todaySales': 'आज की बिक्री', 'dash.weekSales': 'पिछले 7 दिन', 'dash.monthSales': 'इस महीने',
    'dash.pendingDue': 'ग्राहकों से लेना है', 'dash.owed': 'सप्लायर को देना है', 'dash.profit': 'अनुमानित मुनाफ़ा',
    'dash.bills': '{n} बिल', 'dash.target': 'आज का लक्ष्य', 'dash.targetHit': 'लक्ष्य पूरा!',
    'dash.toGo': '{amt} और बाकी', 'dash.health': 'दुकान स्कोर', 'dash.trend': 'बिक्री का ग्राफ',
    'dash.topItems': 'सबसे ज़्यादा बिकने वाला', 'dash.needAttention': 'आपका ध्यान चाहिए', 'dash.recent': 'हाल के बिल',
    'dash.yesterday': 'कल का हिसाब', 'dash.noAlerts': 'सब ठीक है — अभी कुछ ज़रूरी नहीं',
    'dash.quick': 'तुरंत काम', 'dash.stockValue': 'स्टॉक की कीमत',

    'pos.title': 'बिलिंग काउंटर', 'pos.sub': 'सामान पर टैप करें · बोलें · या स्कैन करें',
    'pos.searchItems': 'सामान खोजें, या बोलकर बताएँ…', 'pos.cart': 'थैला', 'pos.empty': 'थैला खाली है',
    'pos.emptySub': 'सामान पर टैप करें, बोलें, या बारकोड स्कैन करें', 'pos.subtotal': 'जोड़',
    'pos.discount': 'छूट', 'pos.tax': 'जीएसटी', 'pos.grand': 'कुल', 'pos.customer': 'ग्राहक',
    'pos.walkin': 'ग्राहक', 'pos.charge': 'बिल बनाएँ', 'pos.cash': 'नकद', 'pos.upi': 'यूपीआई', 'pos.card': 'कार्ड',
    'pos.credit': 'उधार', 'pos.favorites': 'पसंदीदा', 'pos.scan': 'स्कैन', 'pos.voice': 'बोलें',
    'pos.clear': 'थैला खाली करें', 'pos.outOfStock': 'स्टॉक खत्म', 'pos.onlyLeft': 'सिर्फ {n} बचे',
    'pos.done': 'बिल बन गया!', 'pos.doneSub': '{amt} · {mode}', 'pos.creditAdded': '{name} के उधार में जुड़ा',
    'pos.pickCustomer': 'ग्राहक चुनें', 'pos.needCustomer': 'उधार के लिए ग्राहक चुनें',
    'pos.redeem': 'पॉइंट लगाएँ', 'pos.lastBill': 'पिछला बिल', 'pos.noItems': 'कुछ नहीं मिला',
    'pos.addQuick': 'नया सामान जोड़ें', 'pos.quickHint': 'लिस्ट में नहीं है? यहीं जोड़ लें।',
    'pos.share': 'व्हाट्सएप पर भेजें', 'pos.newBill': 'नया बिल', 'pos.holdOn': 'बिल रखा गया — नया शुरू करें',

    'voice.listen': 'सुन रहा हूँ…', 'voice.say': 'बोलिए: "दो पैकेट लेज़ और एक मैगी"',
    'voice.noMatch': 'यह सामान नहीं मिला', 'voice.added': '{n} सामान जुड़ा',
    'voice.unsupported': 'बोलने के लिए Chrome ब्राउज़र चाहिए',
    'voice.denied': 'माइक बंद है — ब्राउज़र सेटिंग में चालू करें',
    'voice.confirm': 'ये जोड़ दें?', 'voice.heard': 'आपने कहा',

    'inv.title': 'सामान / स्टॉक', 'inv.sub': '{n} सामान · {v} की कीमत', 'inv.addItem': 'सामान जोड़ें',
    'inv.out': 'स्टॉक खत्म', 'inv.low': 'कम बचा है', 'inv.expiring': 'जल्दी खराब होने वाला',
    'inv.restock': 'स्टॉक भरें', 'inv.threshold': 'इतना कम होने पर चेतावनी', 'inv.barcode': 'बारकोड',
    'inv.import': 'CSV से लाएँ', 'inv.expiry': 'एक्सपायरी तारीख', 'inv.batches': 'बैच',
    'inv.fifoHint': 'पहले {date} वाला बैच बेचें ({n} बचे)', 'inv.allGood': 'सारा सामान भरपूर है',
    'inv.emoji': 'चिह्न', 'inv.fav': 'बिलिंग स्क्रीन पर सबसे ऊपर', 'inv.gstRate': 'जीएसटी %',
    'inv.saved': 'सामान सेव हुआ', 'inv.deleted': 'सामान हटाया', 'inv.restocked': '{name} +{n}',
    'inv.csvHelp': 'कॉलम: name, price, cost, stock, category, barcode',

    'cus.title': 'ग्राहक और उधार', 'cus.sub': '{n} ग्राहक · {amt} बाकी',
    'cus.add': 'ग्राहक जोड़ें', 'cus.due': 'बाकी उधार', 'cus.noDue': 'किसी का उधार बाकी नहीं',
    'cus.swipeHint': 'पैसा मिला तो कार्ड को दाएँ खिसकाएँ, याद दिलाने के लिए बाएँ',
    'cus.logPayment': 'पैसा मिला', 'cus.remind': 'व्हाट्सएप पर याद दिलाएँ', 'cus.history': 'खरीद का हिसाब',
    'cus.balance': 'बाकी', 'cus.points': 'पॉइंट', 'cus.since': '{n} दिन से बाकी',
    'cus.paidFull': '{name} का पूरा हिसाब साफ', 'cus.received': '{name} से {amt} मिले',
    'cus.birthday': 'जन्मदिन', 'cus.bdayToday': 'आज {name} का जन्मदिन है',
    'cus.overdue7': '7+ दिन', 'cus.overdue15': '15+ दिन', 'cus.overdue30': '30+ दिन',
    'cus.visits': '{n} बार आए', 'cus.spent': '{amt} खर्च', 'cus.settleAll': 'पूरा हिसाब चुकता',

    'sup.title': 'सप्लायर और खरीद', 'sup.sub': '{n} सप्लायर को {amt} देना है',
    'sup.add': 'सप्लायर जोड़ें', 'sup.newPO': 'खरीद दर्ज करें', 'sup.owed': 'देना है',
    'sup.paySupplier': 'सप्लायर को दें', 'sup.supplies': 'क्या देते हैं', 'sup.dueDate': 'भुगतान की तारीख',
    'sup.history': 'खरीद का इतिहास', 'sup.stockIn': 'स्टॉक में जुड़ गया',
    'sup.overdue': 'भुगतान बाकी है', 'sup.noSup': 'अभी कोई सप्लायर नहीं',

    'rep.title': 'रिपोर्ट और सलाह', 'rep.sub': 'आपके नंबर क्या कह रहे हैं',
    'rep.sales': 'बिक्री', 'rep.profit': 'मुनाफ़ा', 'rep.gst': 'जीएसटी हिसाब', 'rep.cash': 'नकद मिलान',
    'rep.expected': 'गल्ले में होना चाहिए', 'rep.counted': 'गिना हुआ नकद', 'rep.diff': 'अंतर',
    'rep.short': '{amt} कम है', 'rep.over': '{amt} ज़्यादा है', 'rep.match': 'बिल्कुल सही',
    'rep.byMode': 'भुगतान के तरीके', 'rep.ask': 'दुकान के बारे में पूछें',
    'rep.askPh': 'जैसे: रमेश ने इस महीने कितना खर्च किया?',
    'rep.eod': 'आज का हिसाब', 'rep.staffLog': 'गतिविधि', 'rep.exportCsv': 'CSV निकालें',
    'rep.taxable': 'कर योग्य रकम', 'rep.collected': 'जीएसटी वसूला', 'rep.noGst': 'जीएसटी बंद है',

    'ai.title': 'समझदार सलाह', 'ai.restock': '{name} मंगवाइए — हर {n} दिन में खत्म हो जाता है',
    'ai.slow': '{name} 3 हफ्ते से नहीं बिका — कोई ऑफर लगाएँ',
    'ai.anomaly': 'बिल #{no} ({amt}) बाकी बिलों से बहुत बड़ा है', 'ai.dueChase': '{name} से बात करें — {d} दिन से {amt} बाकी',
    'ai.expiry': '{name} {d} दिन में खराब हो जाएगा — आज बेचें', 'ai.nothing': 'सब सामान्य है। शुभ दिन!',
    'ai.thinking': 'आपका हिसाब देख रहा हूँ…', 'ai.noAnswer': 'समझ नहीं आया। ग्राहक, सामान या आज की बिक्री के बारे में पूछें।',

    'set.title': 'सेटिंग', 'set.shop': 'दुकान की जानकारी', 'set.shopName': 'दुकान का नाम', 'set.upi': 'यूपीआई आईडी',
    'set.gstin': 'जीएसटीआईएन', 'set.address': 'पता', 'set.lowStock': 'कम स्टॉक की चेतावनी',
    'set.dailyTarget': 'रोज़ का लक्ष्य', 'set.gstOn': 'बिल पर जीएसटी लगाएँ',
    'set.lang': 'भाषा', 'set.theme': 'डार्क मोड', 'set.pin': 'पिन लॉक', 'set.pinHint': 'ऐप खोलने से पहले पिन पूछें',
    'set.setPin': '4 अंकों का पिन', 'set.staff': 'स्टाफ', 'set.addStaff': 'स्टाफ जोड़ें', 'set.role': 'भूमिका',
    'set.owner': 'मालिक', 'set.cashier': 'कैशियर', 'set.stores': 'दुकानें', 'set.addStore': 'दुकान जोड़ें',
    'set.backup': 'बैकअप और डेटा', 'set.exportAll': 'सारा डेटा निकालें', 'set.importData': 'बैकअप से वापस लाएँ',
    'set.reset': 'सब मिटाएँ', 'set.resetWarn': 'सारे बिल, सामान और ग्राहक मिट जाएँगे। वापस नहीं आएगा।',
    'set.receipt': 'रसीद का रंग', 'set.loyalty': 'लॉयल्टी', 'set.loyaltyRate': '1 पॉइंट के लिए ₹',
    'set.logo': 'दुकान का लोगो', 'set.saved': 'सेव हुआ', 'set.switchStaff': 'उपयोगकर्ता बदलें',

    'sync.online': 'ऑनलाइन', 'sync.offline': 'ऑफलाइन', 'sync.pending': '{n} भेजना बाकी',
    'sync.syncing': 'भेजा जा रहा है…', 'sync.done': 'सब सिंक हो गया', 'sync.doneSub': '{n} बदलाव अपलोड हुए',
    'sync.offlineHint': 'काम इसी फ़ोन में सेव है। क्लाउड सिंक उपलब्ध नहीं है; नियमित बैकअप लें।',

    'lock.enter': 'अपना पिन डालें', 'lock.wrong': 'गलत पिन, फिर कोशिश करें', 'lock.welcome': 'वापसी पर स्वागत है'
  };

  const DICT = { en: EN, hi: HI };

  App.lang = () => (App.DB().settings.lang === 'hi' ? 'hi' : 'en');
  App.t = function (key, vars) {
    const d = DICT[App.lang()] || EN;
    let s = d[key] != null ? d[key] : (EN[key] != null ? EN[key] : key);
    if (vars) Object.keys(vars).forEach((k) => { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  };
  App.setLang = async function (l) {
    App.DB().settings.lang = l === 'hi' ? 'hi' : 'en';
    (await App.save({ sync: false }));
    // This optional logged-out preference must not turn a durable settings save into a reported failure.
    try{localStorage.setItem('dukaanos.uiLanguage',App.DB().settings.lang);}catch{}
    document.documentElement.lang = App.DB().settings.lang;
  };
  /* item display name follows the UI language when a Hindi name exists */
  App.itemName = (it) => (App.lang() === 'hi' && it && it.nameHi ? it.nameHi : (it ? it.name : ''));
  App.applyI18n = function (root) {
    (root || document).querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = App.t(el.getAttribute('data-i18n')); });
  };
})(window);
