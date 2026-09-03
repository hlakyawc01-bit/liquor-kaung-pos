from pathlib import Path

html = r'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Aung Travel Retail POS</title>
<style>
*{box-sizing:border-box} body{margin:0;font-family:Arial,sans-serif;background:#f2f4f7;color:#172033}
.header{background:#243861;color:#fff;text-align:center;padding:15px 10px}.header h1{font-size:19px;margin:0}.header p{font-size:11px;margin:6px 0 0}
.tabs{display:flex;background:#fff;overflow:auto}.tabs button{flex:1;min-width:90px;border:0;background:#fff;padding:13px 8px;font-weight:bold}.tabs button.active{color:#243861;border-bottom:3px solid #243861}
.page{display:none;padding:12px;padding-bottom:105px}.page.active{display:block}
input,textarea,select{width:100%;padding:11px;margin:4px 0 11px;border:1px solid #d5dae3;border-radius:9px;font-size:15px;background:#fff}
.panel,.card,.item{background:#fff;border-radius:13px;padding:13px;margin-bottom:10px;box-shadow:0 2px 9px #00000012}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.card{min-height:170px;position:relative}.name{font-weight:bold;margin:7px 0;line-height:1.35}.price{color:#168345;font-size:18px;font-weight:bold}.muted{color:#718096;font-size:13px}.plus{position:absolute;right:10px;bottom:10px;border:0;border-radius:50%;width:38px;height:38px;background:#243861;color:#fff;font-size:22px}
.row{display:flex;justify-content:space-between;align-items:center;gap:10px}.btn{border:0;border-radius:9px;padding:11px 13px;background:#243861;color:#fff;font-weight:bold}.green{background:#198b45}.red{background:#b43d3d}.cats{display:flex;gap:7px;overflow:auto;margin:9px 0}.cats button{border:0;padding:8px 12px;border-radius:18px;white-space:nowrap}.cats .on{background:#243861;color:#fff}
.cartbar{position:fixed;bottom:0;left:0;right:0;background:#fff;padding:10px 14px;border-top:1px solid #ddd;z-index:20}.total{color:#168345;font-size:20px;font-weight:bold}.checkout{width:100%;border:0;background:#198b45;color:#fff;border-radius:9px;padding:13px;font-size:16px;font-weight:bold;margin-top:7px}
.modal{display:none;position:fixed;inset:0;background:#0008;z-index:100;align-items:flex-end;justify-content:center}.modal.show{display:flex}.box{background:#fff;width:100%;max-width:650px;max-height:92vh;overflow:auto;border-radius:20px 20px 0 0;padding:16px}
.cartitem{padding:10px 0;border-bottom:1px solid #eee}.qty button{width:31px;height:31px;border:0;border-radius:6px;background:#e9edf4;font-size:18px}.receiptWrap{background:#eee;padding:12px}.receipt{width:80mm;margin:auto;background:#fff;padding:5mm 4mm;font-family:"Courier New",monospace;font-size:11px;line-height:1.42;color:#000}.center{text-align:center}.right{text-align:right}.rline{border-top:1px dashed #222;margin:6px 0}.receipt table{width:100%;border-collapse:collapse}.receipt td{vertical-align:top;padding:2px 0;word-break:break-word}.totalbig{font-size:13px;font-weight:bold}.barcode{font-size:22px;letter-spacing:1px;overflow:hidden;white-space:nowrap}
@media print{
 body>*{display:none!important} #receiptModal{display:block!important;position:static!important;background:#fff!important}
 #receiptModal .box{display:block!important;width:100%!important;max-width:none!important;overflow:visible!important;padding:0!important;border-radius:0!important}
 #printArea{display:block!important;padding:0!important;background:#fff!important} .receipt{display:block!important;width:80mm!important;margin:0!important;padding:5mm 4mm!important}
 @page{size:80mm auto;margin:0}
}
</style>
</head>
<body>
<div class="header"><h1 id="headStore">AUNG TRAVEL RETAIL SINGAPORE PTE. LTD.</h1><p id="headBranch">AUNG DEPARTMENT STORE • SINGAPORE</p></div>
<div class="tabs">
<button class="active" onclick="showPage('pos',this)">POS</button>
<button onclick="showPage('products',this)">PRODUCTS</button>
<button onclick="showPage('sales',this)">SALES</button>
<button onclick="showPage('settings',this)">SETTINGS</button>
</div>

<div id="pos" class="page active">
<input id="search" placeholder="🔍 Search product..." oninput="renderPOS()">
<div id="cats" class="cats"></div><div id="grid" class="grid"></div>
</div>

<div id="products" class="page">
<div class="row"><h2>Products</h2><button class="btn" onclick="openProduct()">+ ADD</button></div>
<div id="plist"></div>
</div>

<div id="sales" class="page"><div class="panel"><h2>Sales History</h2><div id="salesList"></div></div></div>

<div id="settings" class="page">
<div class="panel"><h3>STORE INFORMATION</h3>
<label>Company Name</label><input id="store">
<label>Branch Name</label><input id="branch">
<label>Address</label><textarea id="address" rows="3"></textarea>
<label>GST Reg No.</label><input id="gst">
</div>
<div class="panel"><h3>RECEIPT TOP INFORMATION</h3>
<label>POS Number</label><input id="set_pos"><label>Cashier ID</label><input id="set_cashier"><label>Cashier Name</label><input id="set_cashier_name">
<label>Receipt Number</label><input id="set_receipt_no"><label>Received Number</label><input id="set_received_no">
<label>Duplicate Text</label><input id="set_duplicate"><label>Reprinted By</label><input id="set_reprinted_by">
</div>
<div class="panel"><h3>CUSTOMER / FLIGHT INFORMATION</h3>
<label>Passport Number</label><input id="set_passport"><label>Nationality</label><input id="set_nationality">
<label>Flight Code</label><input id="set_flight_code"><label>Flight Number</label><input id="set_flight_number"><label>Membership ID</label><input id="set_member_id">
</div>
<div class="panel"><h3>TENDER / CARD INFORMATION</h3>
<label>Terminal ID</label><input id="set_terminal"><label>Merchant ID</label><input id="set_merchant">
<label>Card Type</label><input id="set_card_type"><label>Approval Code</label><input id="set_approval"><label>Last 4 Digits</label><input id="set_last4">
</div>
<div class="panel"><h3>MEMBER INFORMATION</h3>
<label>Member Tier</label><input id="set_tier"><label>Tier Validity</label><input id="set_validity">
<label>Accumulated Net Spend</label><input id="set_net_spend"><label>Issued Points</label><input id="set_points">
</div>
<div class="panel"><h3>RECEIPT BOTTOM TEXT</h3>
<label>Rewards Message</label><textarea id="set_rewards" rows="7"></textarea>
<label>Thank You Message</label><input id="set_thanks"><label>Enquiry / Email Text</label><input id="set_email"><label>Barcode Text</label><input id="set_barcode">
<button class="btn green" style="width:100%" onclick="saveSettings()">💾 SAVE ALL CHANGES</button>
</div>
</div>

<div class="cartbar"><div class="row"><b>🛒 CART (<span id="count">0</span>)</b><span class="total" id="total">S$ 0.00</span></div><button class="checkout" onclick="openCart()">VIEW CART / CHECKOUT</button></div>

<div id="cartModal" class="modal"><div class="box"><h2>CART</h2><div id="cartItems"></div>
<div class="row"><b>TOTAL</b><b id="cartTotal">S$ 0.00</b></div>
<label>Payment</label><select id="payment"><option>CREDIT/DEBIT CARDS</option><option>CASH</option><option>PAYNOW</option></select>
<label>Card Type</label><select id="cardType"><option>VISA</option><option>MASTERCARD</option><option>AMEX</option></select>
<button class="btn green" style="width:100%" onclick="checkout()">✓ COMPLETE SALE</button>
<button class="btn red" style="width:100%;margin-top:8px" onclick="clearCart()">CLEAR CART</button>
<button class="btn" style="width:100%;margin-top:8px" onclick="closeModal('cartModal')">CLOSE</button></div></div>

<div id="productModal" class="modal"><div class="box"><h2>PRODUCT</h2><input type="hidden" id="eid">
<label>Item Code</label><input id="pcode"><label>Product Name</label><input id="pname">
<label>Category</label><input id="pcat" placeholder="Whisky">
<label>Price S$</label><input id="pprice" type="number" step="0.01"><label>Stock</label><input id="pstock" type="number">
<button class="btn green" style="width:100%" onclick="saveProduct()">SAVE PRODUCT</button>
<button class="btn red" style="width:100%;margin-top:8px" onclick="deleteProduct()">DELETE PRODUCT</button>
<button class="btn" style="width:100%;margin-top:8px" onclick="closeModal('productModal')">CLOSE</button></div></div>

<div id="receiptModal" class="modal"><div class="box" style="padding:0"><div id="printArea" class="receiptWrap"><div id="receipt" class="receipt"></div></div>
<div style="padding:12px"><button class="btn green" style="width:100%" onclick="window.print()">🖨 PRINT 3-INCH RECEIPT</button><button class="btn" style="width:100%;margin-top:8px" onclick="closeModal('receiptModal')">DONE</button></div></div></div>

<script>
const DEFAULT_PRODUCTS=[
{id:1,code:'B10135',name:'ABERFRESH ALL VEN 43% 700ml Macallan Colour Collection 15Y',cat:'Whisky',price:204.80,stock:50},
{id:2,code:'B20012',name:'Alice Low ChiveIp 43% 700ml SUNTORY HIBIKI 12YOCTR EXCLUSI',cat:'Whisky',price:250.00,stock:30}
];
const defaults={
store:'AUNG TRAVEL RETAIL SINGAPORE PTE. LTD.',branch:'AUNG DEPARTMENT STORE',address:'Orchard Airport Terminal 2 #02-167, Airpo Central, Singapore 819643',gst:'201047172R',
set_pos:'217',set_cashier:'R03090',set_cashier_name:'RIM?LYN',set_receipt_no:'D617217206217211466',set_received_no:'E6994-1621721-51009',set_duplicate:'*****DUPLICATE*****',set_reprinted_by:'R03090',
set_passport:'*****4600',set_nationality:'MM',set_flight_code:'Z6',set_flight_number:'2',set_member_id:'118296928',
set_terminal:'51636992',set_merchant:'000001050647610',set_card_type:'VISA',set_approval:'007244',set_last4:'1465',
set_tier:'Platinum',set_validity:'19 May 27',set_net_spend:'$8994',set_points:'13740',
set_rewards:'Changi Rewards points earned will be valid for 12 months from the date of issuance, through the last day of the final month. Redeem rewards with your points on Rewards catalogue or offset your next purchase on iShopChangi.com. For more details, please refer to Changi App.',
set_thanks:'Thank you for shopping at Aung',set_email:'For enquiry, please email : hellosg@lotte.net',set_barcode:'LOT T21726172114466'
};
const settingKey=id=>'aung_full_'+id;
let products=JSON.parse(localStorage.getItem('aung_full_products')||'null')||DEFAULT_PRODUCTS;
let cart=JSON.parse(localStorage.getItem('aung_full_cart')||'[]');
let sales=JSON.parse(localStorage.getItem('aung_full_sales')||'[]');
let currentCat='All';

function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function money(n){return 'S$ '+Number(n||0).toFixed(2)}
function persist(){localStorage.setItem('aung_full_products',JSON.stringify(products));localStorage.setItem('aung_full_cart',JSON.stringify(cart));localStorage.setItem('aung_full_sales',JSON.stringify(sales))}
function showPage(id,btn){document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));document.getElementById(id).classList.add('active');document.querySelectorAll('.tabs button').forEach(x=>x.classList.remove('active'));btn.classList.add('active');renderAll()}
function renderPOS(){
 const catsArr=['All',...new Set(products.map(p=>p.cat||'Other'))];cats.innerHTML=catsArr.map(c=>`<button class="${c===currentCat?'on':''}" onclick="currentCat=${JSON.stringify(c)};renderPOS()">${esc(c)}</button>`).join('');
 const q=search.value.toLowerCase();const list=products.filter(p=>(currentCat==='All'||p.cat===currentCat)&&(`${p.code} ${p.name}`).toLowerCase().includes(q));
 grid.innerHTML=list.length?list.map(p=>`<div class="card"><small>${esc(p.code)} • ${esc(p.cat)}</small><div class="name">${esc(p.name)}</div><div class="price">${money(p.price)}</div><small>Stock: ${p.stock}</small><button class="plus" onclick="addToCart(${p.id})">+</button></div>`).join(''):'<p>No products found</p>';
}
function addToCart(id){const p=products.find(x=>x.id===id);if(!p||p.stock<=0){alert('Out of stock');return}let c=cart.find(x=>x.id===id);if(c){if(c.qty>=p.stock){alert('Maximum stock reached');return}c.qty++}else cart.push({id:p.id,code:p.code,name:p.name,price:Number(p.price),qty:1});persist();renderCartBar()}
function renderCartBar(){count.textContent=cart.reduce((a,x)=>a+x.qty,0);total.textContent=money(cart.reduce((a,x)=>a+x.price*x.qty,0))}
function openCart(){renderCart();cartModal.classList.add('show')}
function renderCart(){cartItems.innerHTML=cart.length?cart.map(c=>`<div class="cartitem row"><div><b>${esc(c.code)}</b><div class="muted">${esc(c.name)}</div><b>${money(c.price)}</b></div><div class="qty"><button onclick="changeQty(${c.id},-1)">−</button> <b>${c.qty}</b> <button onclick="changeQty(${c.id},1)">+</button></div></div>`).join(''):'<p class="muted">Cart empty</p>';cartTotal.textContent=money(cart.reduce((a,x)=>a+x.price*x.qty,0))}
function changeQty(id,d){let c=cart.find(x=>x.id===id),p=products.find(x=>x.id===id);if(!c||!p)return;if(d>0&&c.qty>=p.stock)return;c.qty+=d;if(c.qty<=0)cart=cart.filter(x=>x.id!==id);persist();renderCart();renderCartBar()}
function clearCart(){cart=[];persist();renderCart();renderCartBar()}
function closeModal(id){document.getElementById(id).classList.remove('show')}
function openProduct(id){eid.value='';pcode.value='';pname.value='';pcat.value='Whisky';pprice.value='';pstock.value='';if(id){const p=products.find(x=>x.id===id);if(!p)return;eid.value=p.id;pcode.value=p.code;pname.value=p.name;pcat.value=p.cat;pprice.value=p.price;pstock.value=p.stock}productModal.classList.add('show')}
function saveProduct(){const code=pcode.value.trim(),name=pname.value.trim(),cat=pcat.value.trim()||'Other',price=Number(pprice.value),stock=Math.max(0,Number(pstock.value));if(!code||!name||!Number.isFinite(price)||price<0||!Number.isFinite(stock)){alert('Please fill product information correctly');return}if(eid.value){Object.assign(products.find(x=>x.id===Number(eid.value)),{code,name,cat,price,stock})}else products.push({id:Date.now(),code,name,cat,price,stock});persist();closeModal('productModal');renderAll()}
function deleteProduct(){if(!eid.value){closeModal('productModal');return}if(!confirm('Delete this product?'))return;const id=Number(eid.value);products=products.filter(p=>p.id!==id);cart=cart.filter(c=>c.id!==id);persist();closeModal('productModal');renderAll()}
function renderProducts(){plist.innerHTML=products.length?products.map(p=>`<div class="item"><div class="row"><div><b>${esc(p.code)} : ${esc(p.name)}</b><div class="muted">${esc(p.cat)} • ${money(p.price)} • Stock ${p.stock}</div></div><button class="btn" onclick="openProduct(${p.id})">EDIT</button></div></div>`).join(''):'<p class="muted">No products. Add a product.</p>'}
function checkout(){
 if(!cart.length){alert('Cart empty');return}
 for(const c of cart){const p=products.find(x=>x.id===c.id);if(!p||p.stock<c.qty){alert('Stock problem: '+c.name);return}}
 const sale={id:Date.now(),date:new Date().toISOString(),items:cart.map(x=>({...x})),total:cart.reduce((a,x)=>a+x.price*x.qty,0),payment:payment.value,card:cardType.value};
 sale.items.forEach(c=>products.find(p=>p.id===c.id).stock-=c.qty);
 sales.unshift(sale);cart=[];persist();closeModal('cartModal');renderAll();makeReceipt(sale);receiptModal.classList.add('show');
}
function cfg(id){return localStorage.getItem(settingKey(id))||defaults[id]||''}
function makeReceipt(s){
 const d=new Date(s.date),ds=d.toLocaleDateString('en-GB'),ts=d.toLocaleTimeString('en-GB',{hour12:false});
 const rows=s.items.map(x=>`<tr><td style="width:52%">${esc(x.code)} : ${esc(x.name)}</td><td class="right" style="width:12%">${x.qty}</td><td class="right" style="width:18%">${Number(x.price).toFixed(2)}</td><td class="right" style="width:18%">${(x.qty*x.price).toFixed(2)}</td></tr>`).join('');
 const n=s.items.reduce((a,x)=>a+x.qty,0);
 receipt.innerHTML=`<div class="center"><b>${esc(cfg('store'))}</b></div><div class="center"><b>${esc(cfg('branch'))}</b></div><div class="center">${esc(cfg('address'))}</div><div class="center">GST Reg No.: ${esc(cfg('gst'))}</div><div class="rline"></div>
 <table><tr><td>POS : ${esc(cfg('set_pos'))}</td><td class="right">Date : ${ds}</td></tr><tr><td>Cashier : ${esc(cfg('set_cashier'))}</td><td class="right">Time : ${ts}</td></tr></table>
 <div>Cashier Name : ${esc(cfg('set_cashier_name'))}</div><div>Receipt No. : ${esc(cfg('set_receipt_no'))}</div><div>Received No. : ${esc(cfg('set_received_no'))}</div>
 <div class="center" style="font-size:16px;margin:12px 0"><b>${esc(cfg('set_duplicate'))}</b></div><div>Reprinted by : ${esc(cfg('set_reprinted_by'))}</div><div>Reprinted Date Time: ${ds} ${ts}</div><div class="rline"></div>
 <div>Passport No. : ${esc(cfg('set_passport'))}</div><div>Nationality : ${esc(cfg('set_nationality'))}</div><div>Flight Code : ${esc(cfg('set_flight_code'))}</div><div>Flight Number : ${esc(cfg('set_flight_number'))}</div><div>Lotte Membership ID : ${esc(cfg('set_member_id'))}</div><div class="rline"></div>
 <table><tr><td style="width:52%"><b>ITEM NAME</b></td><td class="right" style="width:12%"><b>QTY</b></td><td class="right" style="width:18%"><b>PRICE</b></td><td class="right" style="width:18%"><b>TOTAL</b></td></tr>${rows}</table><div class="rline"></div>
 <div class="row"><span>Sub Total</span><span>${s.total.toFixed(2)}</span></div><div class="row"><span>GST @ 0.00%</span><span>0.00</span></div><div class="row totalbig"><span>Total amount (S$)</span><span>${s.total.toFixed(2)}</span></div><div>Total No. Items : ${n}</div>
 <div style="height:12px"></div><div class="center"><b>Tender Summary</b></div><div class="rline"></div><div class="row"><span>${esc(s.payment)}</span><span>${s.total.toFixed(2)}</span></div>
 <div>Terminal Id : ${esc(cfg('set_terminal'))}</div><div>Merchant Id : ${esc(cfg('set_merchant'))}</div><div>Card Type : ${esc(s.card||cfg('set_card_type'))}</div><div>Approval Code : ${esc(cfg('set_approval'))}</div><div>Last 4 digits : ${esc(cfg('set_last4'))}</div>
 <div style="height:10px"></div><div>Member Tier: ${esc(cfg('set_tier'))}</div><div>Tier Validity: ${esc(cfg('set_validity'))}</div><div>Accumulated Net Spend: ${esc(cfg('set_net_spend'))}</div><div>Issued Points: ${esc(cfg('set_points'))}</div>
 <div style="height:10px"></div><div>${esc(cfg('set_rewards'))}</div><div style="height:10px"></div><div class="center">${esc(cfg('set_thanks'))}</div><div class="center">${esc(cfg('set_email'))}</div><div class="rline"></div><div class="center barcode">|||| ||| ||||| || ||| ||||| |||</div><div class="center">${esc(cfg('set_barcode'))}</div>`;
}
function renderSales(){salesList.innerHTML=sales.length?sales.map(s=>`<div class="item"><b>${money(s.total)}</b><div class="muted">${new Date(s.date).toLocaleString()} • ${esc(s.payment)}</div><button class="btn" style="margin-top:8px" onclick="reprintSale(${s.id})">REPRINT</button></div>`).join(''):'<p class="muted">No sales yet</p>'}
function reprintSale(id){const s=sales.find(x=>x.id===id);if(s){makeReceipt(s);receiptModal.classList.add('show')}}
function saveSettings(){Object.keys(defaults).forEach(id=>{const el=document.getElementById(id);if(el)localStorage.setItem(settingKey(id),el.value)});headStore.textContent=cfg('store');headBranch.textContent=cfg('branch')+' • SINGAPORE';alert('All changes saved!')}
function loadSettings(){Object.keys(defaults).forEach(id=>{const el=document.getElementById(id);if(el)el.value=cfg(id)});headStore.textContent=cfg('store');headBranch.textContent=cfg('branch')+' • SINGAPORE'}
function renderAll(){renderPOS();renderProducts();renderSales();renderCartBar()}
loadSettings();renderAll();
</script>
</body></html>'''

out=Path('/mnt/data/AUNG_POS_SALES_AND_FULL_EDIT_FIXED.html')
out.write_text(html,encoding='utf-8')
print(out.name, out.stat().st_size)
