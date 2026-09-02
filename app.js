const STORE='liquorKaungPOS';

let products=JSON.parse(
  localStorage.getItem(STORE+'_products')||'[]'
);

let sales=JSON.parse(
  localStorage.getItem(STORE+'_sales')||'[]'
);

let settings=JSON.parse(
  localStorage.getItem(STORE+'_settings')||'null'
)||{
  shopName:'LIQUOR KAUNG',
  shopType:'LIQUOR STORE',
  shopAddress:'Yangon, Myanmar',
  posNo:'001',
  cashierNo:'R03090',
  cashierName:'ADMIN',
  currency:'SGD',

  reprintedBy:'R03090',
  passportNo:'*****4600',
  nationality:'',
  flightCode:'Z6',
  flightNumber:'2',
  lotteId:'118296328'
};

let cart=[];
let currentReceipt='';


function money(n){
  return Number(n||0).toLocaleString(
    'en-US',
    {
      minimumFractionDigits:2,
      maximumFractionDigits:2
    }
  );
}


function currencySymbol(){
  if(settings.currency==='SGD') return 'SGD';
  if(settings.currency==='USD') return 'USD';
  if(settings.currency==='MMK') return 'MMK';
  return settings.currency;
}


function save(){

  localStorage.setItem(
    STORE+'_products',
    JSON.stringify(products)
  );

  localStorage.setItem(
    STORE+'_sales',
    JSON.stringify(sales)
  );

  localStorage.setItem(
    STORE+'_settings',
    JSON.stringify(settings)
  );
}


function login(){

  const u=document.getElementById('username').value;
  const p=document.getElementById('password').value;

  if(u==='Tikegall' && p==='337272'){

    sessionStorage.setItem(
      STORE+'_login',
      '1'
    );

    openApp();

  }else{

    alert('Username or Password မှားနေပါတယ်');

  }

}


function openApp(){

  document
    .getElementById('loginPage')
    .classList.add('hidden');

  document
    .getElementById('app')
    .classList.remove('hidden');

  renderAll();

}


function logout(){

  sessionStorage.removeItem(
    STORE+'_login'
  );

  location.reload();

}


function showPage(id,btn){

  document
    .querySelectorAll('.page')
    .forEach(x=>x.classList.add('hidden'));

  document
    .getElementById(id)
    .classList.remove('hidden');


  document
    .querySelectorAll('.nav')
    .forEach(x=>x.classList.remove('active'));

  btn.classList.add('active');

  renderAll();

}


/* =========================
   SETTINGS
========================= */

function saveSettings(){

  settings.shopName=
    document.getElementById('shopName').value.trim()
    ||'LIQUOR KAUNG';

  settings.shopType=
    document.getElementById('shopType').value.trim()
    ||'LIQUOR STORE';

  settings.shopAddress=
    document.getElementById('shopAddress').value.trim();

  settings.posNo=
    document.getElementById('posNo').value.trim()
    ||'001';

  settings.cashierNo=
    document.getElementById('cashierNo').value.trim();

  settings.cashierName=
    document.getElementById('cashierName').value.trim()
    ||'ADMIN';

  settings.currency=
    document.getElementById('currency').value;

  settings.reprintedBy=
    document.getElementById('reprintedBy').value.trim();

  settings.passportNo=
    document.getElementById('passportNo').value.trim();

  settings.nationality=
    document.getElementById('nationality').value.trim();

  settings.flightCode=
    document.getElementById('flightCode').value.trim();

  settings.flightNumber=
    document.getElementById('flightNumber').value.trim();

  settings.lotteId=
    document.getElementById('lotteId').value.trim();


  save();

  renderAll();

  alert('Settings saved successfully');

}


function renderSettings(){

  const ids=[
    'shopName',
    'shopType',
    'shopAddress',
    'posNo',
    'cashierNo',
    'cashierName',
    'currency',
    'reprintedBy',
    'passportNo',
    'nationality',
    'flightCode',
    'flightNumber',
    'lotteId'
  ];


  if(!document.getElementById('shopName')){
    return;
  }


  document.getElementById('shopName').value=
    settings.shopName||'';

  document.getElementById('shopType').value=
    settings.shopType||'';

  document.getElementById('shopAddress').value=
    settings.shopAddress||'';

  document.getElementById('posNo').value=
    settings.posNo||'';

  document.getElementById('cashierNo').value=
    settings.cashierNo||'';

  document.getElementById('cashierName').value=
    settings.cashierName||'';

  document.getElementById('currency').value=
    settings.currency||'SGD';

  document.getElementById('reprintedBy').value=
    settings.reprintedBy||'';

  document.getElementById('passportNo').value=
    settings.passportNo||'';

  document.getElementById('nationality').value=
    settings.nationality||'';

  document.getElementById('flightCode').value=
    settings.flightCode||'';

  document.getElementById('flightNumber').value=
    settings.flightNumber||'';

  document.getElementById('lotteId').value=
    settings.lotteId||'';

}


/* =========================
   PRODUCTS
========================= */

function seedProducts(){

  if(
    products.length &&
    !confirm(
      'Demo products ကို ပြန်ထည့်မလား?'
    )
  ) return;


  products=[

    {
      id:1,
      code:'P001',
      barcode:'5000267112318',
      name:'JOHNNIE WALKER BLACK LABEL 750ml',
      price:45,
      stock:20
    },

    {
      id:2,
      code:'P002',
      barcode:'5000299625100',
      name:'CHIVAS REGAL 12YO 700ml',
      price:32,
      stock:15
    },

    {
      id:3,
      code:'P003',
      barcode:'509998373007214',
      name:"JACK DANIEL'S 700ml",
      price:38,
      stock:12
    },

    {
      id:4,
      code:'P004',
      barcode:'8886469200015',
      name:'HEINEKEN BEER 330ml',
      price:3,
      stock:80
    },

    {
      id:5,
      code:'P005',
      barcode:'8851932420045',
      name:'TIGER BEER CAN 330ml',
      price:2.5,
      stock:100
    }

  ];

  save();
  renderAll();

}


function saveProduct(){

  const code=
    document.getElementById('pcode').value.trim();

  const barcode=
    document.getElementById('pbarcode').value.trim()
    ||code;

  const name=
    document.getElementById('pname').value.trim();

  const price=
    parseFloat(
      document.getElementById('pprice').value
    );

  const stock=
    parseInt(
      document.getElementById('pstock').value
    )||0;


  if(!code || !name || isNaN(price)){

    alert(
      'Product Code, Name, Price ထည့်ပါ'
    );

    return;

  }


  products.push({

    id:Date.now(),
    code,
    barcode,
    name,
    price,
    stock

  });


  save();


  document.getElementById('pcode').value='';
  document.getElementById('pbarcode').value='';
  document.getElementById('pname').value='';
  document.getElementById('pprice').value='';
  document.getElementById('pstock').value='';


  renderProducts();

  alert('Product added successfully');

}


function renderProducts(){

  const box=
    document.getElementById('productList');

  if(!box)return;


  box.innerHTML=
    products.map(p=>`

      <div class="productItem">

        <div>

          <b>${p.name}</b>

          <br>

          <small>
            ${p.code}
            |
            ${p.barcode}
            |
            Stock: ${p.stock}
          </small>

        </div>

        <div>

          ${currencySymbol()}
          ${money(p.price)}

        </div>

      </div>

    `).join('')
    ||'<p>No products yet.</p>';

}


/* =========================
   CART
========================= */

function addByCode(){

  const input=
    document.getElementById('scan');

  const code=input.value.trim();

  if(!code)return;


  const p=products.find(
    x=>
      x.code===code ||
      x.barcode===code ||
      x.name.toLowerCase()===
      code.toLowerCase()
  );


  if(!p){

    alert('Product မတွေ့ပါ');

    return;

  }


  if(p.stock<=0){

    alert('Out of stock');

    return;

  }


  const x=cart.find(
    x=>x.product.id===p.id
  );


  if(x){

    if(x.qty<p.stock){
      x.qty++;
    }

  }else{

    cart.push({
      product:p,
      qty:1
    });

  }


  input.value='';

  renderCart();

}


function renderCart(){

  const box=
    document.getElementById('cart');

  if(!box)return;


  const total=
    cart.reduce(
      (a,x)=>
        a+x.qty*x.product.price,
      0
    );


  box.innerHTML=

    cart.map((x,i)=>`

      <div class="cartItem">

        <div class="cartName">

          <b>
            ${x.product.name}
          </b>

          <br>

          <small>
            ${x.product.barcode}
          </small>

        </div>


        <button
          class="qtyBtn"
          onclick="qty(${i},-1)"
        >
          −
        </button>


        <b>${x.qty}</b>


        <button
          class="qtyBtn"
          onclick="qty(${i},1)"
        >
          +
        </button>


        <span>

          ${currencySymbol()}
          ${money(
            x.qty*x.product.price
          )}

        </span>


        <button
          class="remove"
          onclick="removeCart(${i})"
        >
          ×
        </button>

      </div>

    `).join('')

    ||'<p>Cart is empty.</p>';


  document
    .getElementById('total')
    .textContent=
      money(total);


  const currencyLabel=
    document.getElementById(
      'currencyLabel'
    );

  if(currencyLabel){

    currencyLabel.textContent=
      currencySymbol();

  }

}


function qty(i,d){

  cart[i].qty=

    Math.max(
      1,

      Math.min(
        cart[i].product.stock,
        cart[i].qty+d
      )

    );


  renderCart();

}


function removeCart(i){

  cart.splice(i,1);

  renderCart();

}


/* =========================
   RECEIPT
========================= */

function receiptNo(){

  const d=new Date();

  return

    'LK'+
    String(
      d.getFullYear()
    ).slice(2)+

    String(
      d.getMonth()+1
    ).padStart(2,'0')+

    String(
      d.getDate()
    ).padStart(2,'0')+

    '-'+
    String(
      Date.now()
    ).slice(-6);

}


function makeReceipt(
  no,
  items,
  payment,
  duplicate
){

  const d=new Date();

  const date=
    d.toLocaleDateString('en-GB');

  const time=
    d.toTimeString().slice(0,8);


  const total=

    items.reduce(
      (a,x)=>
        a+x.qty*x.product.price,
      0
    );


  let r='';


  r+=
`${settings.shopName}
${settings.shopType}
${settings.shopAddress}

POS : ${settings.posNo}                    Date : ${date}
Cashier : ${settings.cashierNo}             Time : ${time}
Cashier Name : ${settings.cashierName}
Receipt No. : ${no}
`;


  if(duplicate){

    r+=`

*****DUPLICATE*****

Reprinted by : ${settings.reprintedBy}
Reprinted Date Time : ${date} ${time}


Passport No. : ${settings.passportNo}
Nationality : ${settings.nationality}
Flight Code : ${settings.flightCode}
Flight Number : ${settings.flightNumber}
Lotte Membership ID : ${settings.lotteId}

`;

  }


  r+=`
ITEM NAME                 QTY     PRICE      TOTAL
------------------------------------------------
`;


  items.forEach(x=>{

    const itemTotal=
      x.qty*x.product.price;


    r+=
`${x.product.code} : ${x.product.name}
${x.product.barcode}
                         ${String(x.qty).padStart(2)}
                         ${String(money(x.product.price)).padStart(8)}
                         ${String(money(itemTotal)).padStart(9)}
`;

  });


  r+=
`------------------------------------------------
Sub Total                          ${money(total)} ${currencySymbol()}
GST @ 0.00%                                 0.00
Total amount (${currencySymbol()})          ${money(total)}

Total No. Items : ${items.reduce((a,x)=>a+x.qty,0)}

                   Tender Summary
================================================
${payment.toUpperCase()}                     ${money(total)} ${currencySymbol()}

      Thank you for shopping at ${settings.shopName}
              Please come again!

================================================
Receipt No: ${no}
`;


  return r;

}


/* =========================
   CHECKOUT
========================= */

function checkout(){

  if(!cart.length){

    alert('Cart is empty');

    return;

  }


  const no=
    receiptNo();


  const payment=
    document.getElementById(
      'payment'
    ).value;


  const duplicate=
    document.getElementById(
      'duplicate'
    ).checked;


  const total=

    cart.reduce(
      (a,x)=>
        a+x.qty*x.product.price,
      0
    );


  cart.forEach(x=>{

    const p=
      products.find(
        p=>p.id===x.product.id
      );

    if(p){
      p.stock-=x.qty;
    }

  });


  sales.push({

    no,
    total,
    payment,

    date:
      new Date().toISOString(),

    items:

      cart.map(x=>({

        product:{
          ...x.product
        },

        qty:x.qty

      }))

  });


  save();


  currentReceipt=

    makeReceipt(
      no,
      cart,
      payment,
      duplicate
    );


  document
    .getElementById('receipt')
    .textContent=
      currentReceipt;


  document
    .getElementById('receiptModal')
    .classList.remove('hidden');


  cart=[];

  renderAll();

}


function closeReceipt(){

  document
    .getElementById('receiptModal')
    .classList.add('hidden');

}


function printReceipt(){

  window.print();

}


/* =========================
   REPORT
========================= */

function renderReport(){

  const box=
    document.getElementById(
      'reportBox'
    );

  const list=
    document.getElementById(
      'salesList'
    );


  if(!box || !list)return;


  const today=
    new Date().toDateString();


  const ss=

    sales.filter(
      x=>
        new Date(
          x.date
        ).toDateString()
        ===today
    );


  const total=

    ss.reduce(
      (a,x)=>a+x.total,
      0
    );


  box.innerHTML=

    `<h3>Today</h3>

    <p>
    Transactions:
    <b>${ss.length}</b>
    </p>

    <p>
    Total Sales:
    <b>
    ${currencySymbol()}
    ${money(total)}
    </b>
    </p>`;


  list.innerHTML=

    sales
    .slice()
    .reverse()
    .slice(0,20)

    .map(x=>`

      <div class="saleItem">

        <div>

          <b>
            ${x.no}
          </b>

          <br>

          <small>
            ${new Date(
              x.date
            ).toLocaleString()}
          </small>

        </div>


        <div>

          ${x.payment}

          <br>

          <b>
            ${currencySymbol()}
            ${money(x.total)}
          </b>

        </div>

      </div>

    `).join('')

    ||'<p>No sales yet.</p>';

}


/* =========================
   BACKUP
========================= */

function exportData(){

  const data=

    JSON.stringify({

      products,
      sales,
      settings

    },null,2);


  const a=
    document.createElement('a');


  a.href=

    URL.createObjectURL(

      new Blob(
        [data],
        {
          type:'application/json'
        }
      )

    );


  a.download=
    'liquor-kaung-backup.json';


  a.click();

}


function importData(e){

  const f=e.target.files[0];

  if(!f)return;


  const r=
    new FileReader();


  r.onload=()=>{

    try{

      const x=
        JSON.parse(r.result);


      products=
        x.products||[];


      sales=
        x.sales||[];


      if(x.settings){

        settings={
          ...settings,
          ...x.settings
        };

      }


      save();

      renderAll();

      alert(
        'Restore complete'
      );

    }catch{

      alert(
        'Invalid backup file'
      );

    }

  };


  r.readAsText(f);

}


/* =========================
   RENDER
========================= */

function renderAll(){

  renderProducts();

  renderCart();

  renderReport();

  renderSettings();

}


/* =========================
   START
========================= */

if(
  sessionStorage.getItem(
    STORE+'_login'
  )
){

  openApp();

}else{

  if(!products.length){
    seedProducts();
  }

}
