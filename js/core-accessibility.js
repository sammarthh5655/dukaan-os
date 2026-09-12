/* Core counter language and accessible control labels; native-language review remains separate. */
(function(w){
 'use strict';const A=w.App,HI={
 "The cart is empty.":"थैला खाली है।",
 "The cart belongs to a different store. Clear it and try again.":"थैला दूसरी दुकान का है। इसे खाली करके फिर कोशिश करें।",
 "Finalized draft differs from this request.":"सेव किए गए बिल और इस अनुरोध में अंतर है।",
 "Draft changed. Save and review it before checkout.":"थैला बदल गया है। बिल बनाने से पहले सेव करके जाँचें।",
 "Invalid payment mode.":"भुगतान का तरीका सही नहीं है।",
 "An item was removed or belongs to another store. Update the cart.":"एक सामान हट चुका है या दूसरी दुकान का है। थैला ठीक करें।",
 "Select a valid customer.":"सही ग्राहक चुनें।",
 "Available loyalty points changed. Review the redemption.":"उपलब्ध लॉयल्टी पॉइंट बदल गए हैं। इस्तेमाल किए जाने वाले पॉइंट जाँचें।",
 "{name} has a new price. Remove it and add it again.":"{name} का दाम बदल गया है। इसे हटाकर फिर जोड़ें।",
 "{name} has changed price, tax or units. Remove it and add it again.":"{name} का दाम, कर या इकाई बदल गई है। इसे हटाकर फिर जोड़ें।",
 "Insufficient stock for {name}. Update the cart.":"{name} का स्टॉक कम है। थैला ठीक करें।",
"Your existing bills and items will be kept.":"आपके पुराने बिल और सामान सुरक्षित रहेंगे।",
"Account & security":"खाता और सुरक्षा",
"Authentication state is unreadable.":"लॉगिन की स्थिति पढ़ी नहीं जा सकी।",
"Password is too long.":"पासवर्ड बहुत लंबा है।",
"Account data is unreadable. Preserve storage and restore a backup.":"खाते का डेटा पढ़ा नहीं जा सका। स्टोरेज सुरक्षित रखें और बैकअप से वापस लाएँ।",
"Storage is full or unavailable":"स्टोरेज भर गया है या उपलब्ध नहीं है",
"This browser has reached its account limit.":"इस ब्राउज़र में खातों की सीमा पूरी हो गई है।",
"Sign in first.":"पहले लॉग इन करें।",
"Account not found":"खाता नहीं मिला",
"Scan barcode":"बारकोड स्कैन करें",
"Delete item":"सामान हटाएँ",
"A local login discourages casual access. Records remain unencrypted on this device; someone controlling browser storage can bypass it.":"स्थानीय लॉगिन सामान्य पहुँच रोकने में मदद करता है। इस डिवाइस के रिकॉर्ड एन्क्रिप्ट नहीं हैं; ब्राउज़र स्टोरेज नियंत्रित करने वाला व्यक्ति लॉगिन को पार कर सकता है।",
  "Log in": "लॉग इन करें",
  "Sign up": "खाता बनाएँ",
  "Create account": "खाता बनाएँ",
  "Create an account": "नया खाता बनाएँ",
  "Create login": "लॉगिन बनाएँ",
  "Create your shop’s account": "अपनी दुकान का खाता बनाएँ",
  "Sign in to open your counter": "काउंटर खोलने के लिए लॉग इन करें",
  "Already have an account?": "पहले से खाता है?",
  "New here?": "पहली बार आए हैं?",
  "Creating…": "खाता बन रहा है…",
  "Signing in…": "लॉग इन हो रहा है…",
  "Shop name": "दुकान का नाम",
  "Username": "यूज़रनेम",
  "Password": "पासवर्ड",
  "Confirm password": "पासवर्ड फिर डालें",
  "Account created": "खाता बन गया",
  "Welcome back": "फिर से स्वागत है",
  "Something went wrong": "कुछ गड़बड़ हुई",
  "Not saved": "सेव नहीं हुआ",
  "This account works only in this browser. Online sign-in and password recovery are not available yet.": "यह खाता केवल इसी ब्राउज़र में चलता है। ऑनलाइन लॉगिन और पासवर्ड रिकवरी अभी उपलब्ध नहीं हैं।",
  "Use a password of 12 to 256 characters.": "12 से 256 अक्षरों का पासवर्ड रखें।",
  "Passwords do not match": "दोनों पासवर्ड एक जैसे नहीं हैं",
  "Incorrect username or password": "यूज़रनेम या पासवर्ड गलत है",
  "That username is already taken": "यह यूज़रनेम पहले से इस्तेमाल हो रहा है",
  "Enter your shop name": "दुकान का नाम लिखें",
  "Username must be at least 3 characters": "यूज़रनेम में कम से कम 3 अक्षर होने चाहिए",
  "Username can only use letters, numbers, \".\" and \"_\"": "यूज़रनेम में केवल अंग्रेज़ी अक्षर, अंक, \".\" और \"_\" रखें",
  "Too many attempts. Wait before trying again.": "बहुत बार कोशिश की गई। दोबारा कोशिश करने से पहले रुकें।",
  "Incorrect PIN": "पिन गलत है",
  "The counter changed. Try again.": "काउंटर बदल गया है। फिर कोशिश करें।",
  "Saved on this device · online": "इस डिवाइस में सेव है · ऑनलाइन",
  "Saved on this device · offline": "इस डिवाइस में सेव है · ऑफलाइन",
  "Cloud sync is not available. Export backups from Settings.": "क्लाउड सिंक उपलब्ध नहीं है। सेटिंग से बैकअप लें।",
  "Saving on this device…": "इस डिवाइस में सेव हो रहा है…",
  "Log out": "लॉग आउट करें",
  "Log out?": "लॉग आउट करें?",
  "Your data stays saved on this device — log back in any time with your username and password.": "आपका डेटा इसी डिवाइस में सेव रहेगा। यूज़रनेम और पासवर्ड से फिर लॉग इन कर सकते हैं।",
  "Turn on login": "लॉगिन चालू करें",
  "Login turned on": "लॉगिन चालू हो गया",
  "Reload": "फिर खोलें",
  "Theme": "रंग बदलें",
  "Menu": "मेन्यू",
  "Language": "भाषा",
  "Lock": "लॉक करें",
  "Decrease quantity of {name}": "{name} की मात्रा घटाएँ",
  "Increase quantity of {name}": "{name} की मात्रा बढ़ाएँ",
  "Cart total {amount}": "थैले का कुल {amount}",
  "{n} of 4 PIN digits entered": "पिन के 4 में से {n} अंक भरे गए",
  "Delete last digit": "आखिरी अंक मिटाएँ",
  "Cart could not be saved": "थैला सेव नहीं हो सका",
  "Sale saved": "बिल सेव हो गया",
  "The daily target preference could not be saved.": "रोज़ के लक्ष्य की सेटिंग सेव नहीं हो सकी।",
  "Name is required": "नाम लिखना ज़रूरी है",
  "Price is required": "दाम लिखना ज़रूरी है",
  "Voice aliases": "बोलकर खोजने के अन्य नाम",
  "Type or paste the barcode": "बारकोड लिखें या पेस्ट करें",
  "No expiry": "एक्सपायरी नहीं दी गई",
  "Camera scanner needs Chrome on Android": "कैमरे से स्कैन करने के लिए Android पर Chrome चाहिए",
  "Type the barcode instead": "बारकोड लिखकर डालें",
  "Camera blocked": "कैमरे की अनुमति नहीं है",
  "Allow camera access, or type the code": "कैमरे की अनुमति दें या कोड लिखें",
  "Point at the barcode": "कैमरा बारकोड की ओर रखें",
  "Type it instead": "इसके बजाय लिखें",
  "Return / refunds": "वापसी / रिफंड",
  "A save is already in progress. Wait for it to finish.": "सेव हो रहा है। पूरा होने तक रुकें।",
  "Unlock or sign in to continue.": "आगे बढ़ने के लिए अनलॉक करें या लॉग इन करें।",
  "Owner access required for this action.": "इस काम के लिए मालिक की अनुमति चाहिए।",
  "The counter changed or locked. Open this action again.": "काउंटर बदल गया या लॉक हो गया। यह काम फिर खोलें।",
  "Open a cash shift in this store before recording a cash movement.": "नकद लेनदेन लिखने से पहले इस दुकान की नकद शिफ्ट खोलें।",
  "Choose a customer for credit.": "उधार के लिए ग्राहक चुनें।",
  "This browser cannot run secure login — please update it": "इस ब्राउज़र में सुरक्षित लॉगिन नहीं चल सकता। इसे अपडेट करें।"
};
 A.coreLocaleInventory=()=>Object.keys(HI);
 A.registerUIWords=words=>{for(const [key,value] of Object.entries(words)){if(typeof value!=='string'||!key)throw Error('Invalid UI translation');HI[key]=value;}};
 A.captureFocus=()=>{const n=document.activeElement;if(!n||n===document.body)return null;return {node:n,id:n.id,attr:['data-inc','data-dec','data-mode','data-view','data-add'].find(k=>n.hasAttribute(k)),value:['data-inc','data-dec','data-mode','data-view','data-add'].map(k=>n.getAttribute(k)).find(v=>v!==null)};};
 A.restoreFocus=f=>{if(!f||A.isLocked())return;const n=f.node.isConnected?f.node:f.id?document.getElementById(f.id):f.attr?[...document.querySelectorAll('['+f.attr+']')].find(n=>n.getAttribute(f.attr)===f.value):null;if(n&&!n.disabled&&!n.closest('[hidden],[inert]'))n.focus();};
 A.uiText=function(text,vars){let result=A.lang()==='hi'?(HI[text] || text):text;
  if(A.lang()==='hi'&&!HI[text])for(const [pattern,key] of [[/^(.+) has a new price\. Remove it and add it again\.$/,'{name} has a new price. Remove it and add it again.'],[/^(.+) has changed price, tax or units\. Remove it and add it again\.$/,'{name} has changed price, tax or units. Remove it and add it again.'],[/^Insufficient stock for (.+)\. Update the cart\.$/,'Insufficient stock for {name}. Update the cart.']]){const match=String(text).match(pattern);if(match){result=HI[key];vars={...vars,name:match[1]};break;}}
  for(const [key,value] of Object.entries(vars || {}))result=result.split('{'+key+'}').join(String(value));return result;};
 A.enhanceAccessibility=function(root=document){
  for(const node of root.querySelectorAll('[data-core-text]'))node.textContent=A.uiText(node.getAttribute('data-core-text'));
  for(const input of root.querySelectorAll('input,select,textarea')){
   const label=input.closest('.field')?.querySelector('label');if(label){if(!input.id)input.id=A.uid('field');label.htmlFor=input.id;}
   if(!label&&!input.labels?.length&&!input.hasAttribute('aria-label')&&input.placeholder)input.setAttribute('aria-label',input.placeholder);
  }
  for(const b of root.querySelectorAll('button[title]'))if(!b.hasAttribute('aria-label'))b.setAttribute('aria-label',b.title);
  for(const b of root.querySelectorAll('[data-inc],[data-dec]')){const name=b.closest('.cart-line')?.querySelector('.cl-n b')?.textContent || '';b.setAttribute('aria-label',A.uiText(b.hasAttribute('data-inc')?'Increase quantity of {name}':'Decrease quantity of {name}',{name}));}
  for(const b of root.querySelectorAll('.pay-mode[data-mode]'))b.setAttribute('aria-pressed',String(b.classList.contains('on')));
  for(const error of root.querySelectorAll('.auth-err,.pin-err')){error.setAttribute('role','alert');error.setAttribute('tabindex','-1');}
 };
 const oldLang=A.lang;A.lang=()=>{if(!A.accountId){try{const selected=localStorage.getItem('dukaanos.uiLanguage');if(selected==='en'||selected==='hi')return selected;}catch{}}return oldLang();};
})(window);
