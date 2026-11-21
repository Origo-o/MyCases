// Run with: node tests/billing.test.js
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const html = fs.readFileSync('index.html', 'utf8');
const script = html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
new vm.Script(script); // the full application script must parse
const billing = script.slice(script.indexOf('        function billEntries(cino)'), script.indexOf('        // ── POS CATALOG MANAGER MODAL CRUD'));
const els = {};
const c = { cino: 'CASE1', petparty_name: 'Client', resparty_name: 'Other', type_name: 'Case', reg_no: '1', reg_year: '2026' };
const ctx = { console, billingLedger: {}, CASES: [c], g: id => els[id] ||= { value:'', innerHTML:'', classList:{remove(){},add(){}} },
    today: () => '2026-01-01', fmtDS: x => x || '—', esc: x => String(x || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'),
    showToast: x => ctx.message = x, saveAllData: () => ctx.saved = JSON.stringify(ctx.billingLedger), closeModal(){}, renderBilling(){}, confirm: () => true,
    currentBillingCase:'CASE1', currentPOSCart:[], posPaymentType:'due', posPaymentMode:'Cash', DB:{receipts:[]}, billingSubTab:'ledger', nakalRecords:[] };
vm.createContext(ctx); vm.runInContext(billing,ctx); ctx.renderBilling = () => {};
const bill = {id:1, type:'Asked', billNo:'B1', date:'2026-01-01', amount:900, items:[{name:'Draft',amount:600,serviceDate:'2025-12-01'},{name:'Hearing',amount:400}], payments:[]};
ctx.billingLedger.CASE1 = [bill];
const balances = () => JSON.parse(JSON.stringify(ctx.billServiceBalances(bill))).map(x => [x.amount,x.paid,x.due]);
assert.deepStrictEqual(balances(), [[540,0,540],[360,0,360]]);
ctx.openAddBillPaymentModal('CASE1',1,1);
assert.equal(els.bpmService.value,'1'); assert.equal(els.bpmAmount.value,''); assert.equal(els.bpmAmount.max,360);
els.bpmAmount.value='100'; els.bpmDate.value='2026-02-01'; els.bpmMode.value='UPI'; ctx.submitBillPayment();
assert.equal(bill.payments[0].serviceIndex,1); assert.equal(bill.payments[0].date,'2026-02-01');
assert.deepStrictEqual(balances(), [[540,0,540],[360,100,260]]);
ctx.openAddBillPaymentModal('CASE1',1,1); els.bpmAmount.value='261'; ctx.submitBillPayment();
assert.equal(bill.payments.length,1); assert.match(ctx.message,/cannot exceed/);
ctx.openAddBillPaymentModal('CASE1',1); els.bpmAmount.value='600'; ctx.submitBillPayment();
assert.deepStrictEqual(balances(), [[540,540,0],[360,160,200]]);
ctx.openAddBillPaymentModal('CASE1',1,1); els.bpmAmount.value='200'; ctx.submitBillPayment();
assert.equal(bill.remaining,0); assert.equal(bill.status,'Paid'); assert.equal(bill.payments.length,3);
assert.deepStrictEqual(balances(), [[540,540,0],[360,360,0]]);
assert.deepStrictEqual(JSON.parse(ctx.saved).CASE1[0].payments.map(p=>p.amount),[100,600,200]);
// Legacy payments are allocated in item order and unlinked credits never settle bills.
const legacy = {id:2,type:'Asked',amount:100,items:[{name:'a',amount:50},{name:'b',amount:50}],payments:[{amount:60}]};
ctx.billingLedger.CASE1.push(legacy,{id:3,type:'Paid',amount:30});
assert.deepStrictEqual(JSON.parse(JSON.stringify(ctx.billServiceBalances(legacy))).map(x=>x.paid),[50,10]);
assert.equal(ctx.billTotals('CASE1').pending,40); assert.equal(ctx.billTotals('CASE1').unallocated,30);
const receipt = ctx.billingLedger.CASE1[2]; ctx.normalizeBillEntry(receipt); ctx.normalizeBillEntry(receipt); assert.equal(receipt.paidAmount,30);
ctx.settleAllClientBills('CASE1'); assert.equal(legacy.remaining,0); assert.equal(receipt.payments.length,0);
// Rounding preserves the exact bill total.
const fractional = {type:'Asked',amount:0.02,items:[{amount:1},{amount:1},{amount:1}],payments:[]};
assert.equal(ctx.billServiceBalances(fractional).reduce((a,x)=>a+Math.round(x.amount*100),0),2);
assert.match(ctx.renderLedgerScreenHTML(c,ctx.billTotals('CASE1'),ctx.billEntries('CASE1')), /2025-12-01/);
console.log('Billing tests passed');
// Checkout saves multiple dated services and an initial installment.
ctx.billingLedger.CASE1 = [];
ctx.currentPOSCart = [{name:'Draft',qty:1,rate:600,amount:600,serviceDate:'2026-01-03'}, {name:'Hearing',qty:1,rate:400,amount:400,serviceDate:'2026-01-04'}];
ctx.posPaymentType = 'partial';
els.posDiscountInp = {value:'100'}; els.posPartialAmountInp = {value:'250'};
els.posBillDateInp = {value:'2026-01-05'}; els.posBillNoInp = {value:'B2'}; els.posBillTimeInp = {value:'10:00'}; els.posBillRefNote = {value:''};
ctx.checkoutPOSBill('save');
const created = ctx.billingLedger.CASE1[0];
assert.equal(created.amount,900); assert.equal(created.payments[0].amount,250); assert.equal(created.remaining,650);
assert.equal(created.items[1].serviceDate,'2026-01-04'); assert.equal(ctx.posPaymentType,'due');
assert.deepStrictEqual(JSON.parse(JSON.stringify(ctx.billServiceBalances(created))).map(x=>[x.paid,x.due]),[[250,290],[0,360]]);
console.log('Checkout tests passed');
