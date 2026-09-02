const STORE='liquorKaungPOS';
let products=JSON.parse(localStorage.getItem(STORE+'_products')||'[]');
let sales=JSON.parse(localStorage.getItem(STORE+'_sales')||'[]');
let cart=[];
let currentReceipt='';

function money(n){return Number(n||0).toLocaleString('en-US')}
function save(){localStorage.setItem(STORE+'_products',JSON.stringify(products));localStorage.setItem(STORE+'_sales',JSON.stringify(sales))}
function login(){
 const u=document.getElementById('username').value, p=document.getElementById('password').value;
 if(u==='Tikegall' && p==='337272'){sessionStorage.setItem(STORE+'_login','1');openApp()} else alert('Username or Password မှားနေပါတယ်');
}
function openApp(){document.getElementById('loginPage').classList.add('hidden');document.getElementById('app').classList.remove('hidden');renderAll()}
function logout(){sessionStorage.removeItem(STORE+'_login');location.reload()}
function showPage(id,btn){document.querySelectorAll('.page').forEach(x=>x.classList.add('hidden'));document.getElementById(id).classList.remove('hidden');document.querySelectorAll('.nav').forEach(x=>x.classList.remove('active'));btn.classList.add('active');renderAll()}
function seedProducts(){
 if(products.length && !confirm('Demo products ကို ပြန်ထည့်မလား?'))return;
 products=[
 {id:1,code:'P001',barcode:'5000267112318',name:'JOHNNIE WALKER BLACK LABEL 750ml',price:45000,stock:20},
 {id:2,code:'P002',barcode:'5000299625100',name:'CHIVAS REGAL 12YO 700ml',price:32000,stock:15},
 {id:3,code:'P003',barcode:'509998373007214',name:"JACK DANIEL'S 700ml",price:38000,stock:12},
 {id:4,code:'P004',barcode:'8886469200015',name:'HEINEKEN BEER 330ml',price:3000,stock:80},
 {id:5,code:'P005',barcode:'8851932420045',name:'TIGER BEER CAN 330ml',price:2500,stock:100}];save();renderAll();
}
function saveProduct(){
 const code=pcode.value.trim(),barcode=pbarcode.value.trim()||code,name=pname.value.trim(),price=+pprice.value,stock=+pstock.value;
 if(!code||!name||!price){alert('Product Code, Name, Price ထည့်ပါ');return}
 products.push({id:Date.now(),code,barcode,name,price,stock:stock||0});save();
 [pcode,pbarcode,pname,pprice,pstock].forEach(x=>x.value='');renderProducts();
}
function renderProducts(){const box=document.getElementById('productList');if(!box)return;box.innerHTML=products.map(p=>`<div class="productItem"><div><b>${p.name}</b><br><small>${p.code} | ${p.barcode} | Stock: ${p.stock}</small></div><div>${money(p.price)} Ks</div></div>`).join('')||'<p>No products yet.</p>'}
function addByCode(){
 const code=document.getElementById('scan').value.trim(); if(!code)return;
 const p=products.find(x=>x.code===code||x.barcode===code);if(!p){alert('Product မတွေ့ပါ');return}
 if(p.stock<=0){alert('Out of stock');return}
 const x=cart.find(x=>x.product.id===p.id);if(x){if(x.qty<p.stock)x.qty++}else cart.push({product:p,qty:1});
 scan.value='';renderCart();
}
function renderCart(){const box=document.getElementById('cart');const total=cart.reduce((a,x)=>a+x.qty*x.product.price,0);
 box.innerHTML=cart.map((x,i)=>`<div class="cartItem"><div class="cartName"><b>${x.product.name}</b><br><small>${x.product.barcode}</small></div><button class="qtyBtn" onclick="qty(${i},-1)">−</button><b>${x.qty}</b><button class="qtyBtn" onclick="qty(${i},1)">+</button><span>${money(x.qty*x.product.price)}</span><button class="remove" onclick="removeCart(${i})">×</button></div>`).join('')||'<p>Cart is empty.</p>';
 document.getElementById('total').textContent=money(total);
}
function qty(i,d){cart[i].qty=Math.max(1,Math.min(cart[i].product.stock,cart[i].qty+d));renderCart()}
function removeCart(i){cart.splice(i,1);renderCart()}
function receiptNo(){const d=new Date();return 'LK'+String(d.getFullYear()).slice(2)+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0')+'-'+String(Date.now()).slice(-5)}
function pad(s,n){return String(s).padEnd(n,' ').slice(0,n)}
function makeReceipt(no,items,payment,duplicate){
 const d=new Date(), date=d.toLocaleDateString('en-GB'), time=d.toTimeString().slice(0,8), total=items.reduce((a,x)=>a+x.qty*x.product.price,0);
 let r=`              LIQUOR KAUNG\n                LIQUOR STORE\n             Yangon, Myanmar\n\nPOS : 001                    Date : ${date}\nCashier : ADMIN              Time : ${time}\nCashier Name : ADMIN\nReceipt No. : ${no}\n`;
 if(duplicate)r+=`\n            *****DUPLICATE*****\n\nReprinted by : R03090\nReprinted Date Time : 21/06/2026 13:25:39\n\n\nPassport No. : *****4600\nNationality :\nFlight Code : Z6\nFlight Number : 2\nLotte Membership ID : 118296328\n`;
 r+=`\nITEM NAME                 QTY     PRICE      TOTAL\n------------------------------------------------\n`;
 items.forEach(x=>{r+=`${x.product.code} : ${x.product.name}\nBarcode : ${x.product.barcode}\n                         ${String(x.qty).padStart(2)}  ${String(money(x.product.price)).padStart(8)}  ${String(money(x.qty*x.product.price)).padStart(9)}\n`});
 r+=`------------------------------------------------\nSub Total                                ${money(total)}\nGST @ 0.00%                                      0\nTotal amount (Ks)                        ${money(total)}\n\nTotal No. Items : ${items.reduce((a,x)=>a+x.qty,0)}\n\n                   Tender Summary\n================================================\n${payment.toUpperCase()}                                 ${money(total)}\n\n      Thank you for shopping at LIQUOR KAUNG\n              Please come again!\n\n             ====================\n            BARCODE: ${no}\n`;
 return r;
}
function checkout(){
 if(!cart.length){alert('Cart is empty');return}
 const no=receiptNo(),payment=document.getElementById('payment').value,duplicate=document.getElementById('duplicate').checked,total=cart.reduce((a,x)=>a+x.qty*x.product.price,0);
 cart.forEach(x=>{const p=products.find(p=>p.id===x.product.id);p.stock-=x.qty});
 sales.push({no,total,payment,date:new Date().toISOString(),items:cart.map(x=>({product:{...x.product},qty:x.qty}))});save();
 currentReceipt=makeReceipt(no,cart,payment,duplicate);document.getElementById('receipt').textContent=currentReceipt;document.getElementById('receiptModal').classList.remove('hidden');cart=[];renderAll();
}
function closeReceipt(){document.getElementById('receiptModal').classList.add('hidden')}
function printReceipt(){window.print()}
function renderReport(){const box=document.getElementById('reportBox'),list=document.getElementById('salesList');const today=new Date().toDateString();const ss=sales.filter(x=>new Date(x.date).toDateString()===today);const total=ss.reduce((a,x)=>a+x.total,0);box.innerHTML=`<h3>Today</h3><p>Transactions: <b>${ss.length}</b></p><p>Total Sales: <b>${money(total)} Ks</b></p>`;list.innerHTML=sales.slice().reverse().slice(0,20).map(x=>`<div class="saleItem"><div><b>${x.no}</b><br><small>${new Date(x.date).toLocaleString()}</small></div><div>${x.payment}<br><b>${money(x.total)} Ks</b></div></div>`).join('')||'<p>No sales yet.</p>'}
function renderAll(){renderProducts();renderCart();renderReport()}
function exportData(){const data=JSON.stringify({products,sales},null,2);const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type:'application/json'}));a.download='liquor-kaung-backup.json';a.click()}
function importData(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);products=x.products||[];sales=x.sales||[];save();renderAll();alert('Restore complete')}catch{alert('Invalid backup file')}};r.readAsText(f)}
if(sessionStorage.getItem(STORE+'_login'))openApp();else if(!products.length)seedProducts();
