let products = JSON.parse(localStorage.getItem("lk_products")) || [];
let cart = [];
let sales = JSON.parse(localStorage.getItem("lk_sales")) || [];

let editingProduct = null;


/* ================= SETTINGS ================= */

const defaultSettings = {
  shopName: "LIQUOR KAUNG",
  shopType: "OFFLINE POS",
  shopAddress: "Singapore",
  posNumber: "217",
  cashierNumber: "R03090",
  cashierName: "CASHIER",
  currency: "SGD",

  reprintedBy: "R03090",
  passportNumber: "****4600",
  nationality: "MM",
  flightCode: "Z6",
  flightNumber: "2",
  lotteMembership: "118296328",

  gst: "0",
  memberTier: "Platinum",
  footerMessage: "Thank you for shopping with us",
  barcodeText: "LOT2172617211466"
};


let settings =
  JSON.parse(localStorage.getItem("lk_settings"))
  || defaultSettings;


/* ================= MONEY ================= */

function money(value){

  let currency =
    document.getElementById("currency")
      ? document.getElementById("currency").value
      : settings.currency;

  return `${currency} ${Number(value).toFixed(2)}`;
}


/* ================= LOGIN ================= */

function login(){

  const user =
    document.getElementById("loginUser").value;

  const pass =
    document.getElementById("loginPass").value;

  if(user === "Tikegall" && pass === "337272"){

    document
      .getElementById("loginPage")
      .classList
      .add("hidden");

    document
      .getElementById("appPage")
      .classList
      .remove("hidden");

    initApp();

  }else{

    alert("Username or Password incorrect!");

  }

}


function logout(){

  document
    .getElementById("appPage")
    .classList
    .add("hidden");

  document
    .getElementById("loginPage")
    .classList
    .remove("hidden");

}


/* ================= INIT ================= */

function initApp(){

  loadSettingsToForm();

  if(products.length === 0){

    restoreDemoProducts();

  }

  renderProducts();
  renderCart();
  renderProductManagement();
  renderReport();

}


/* ================= PAGE NAV ================= */

function showPage(page,button){

  document
    .querySelectorAll(".page")
    .forEach(p => p.classList.add("hidden"));

  document
    .getElementById(page)
    .classList
    .remove("hidden");


  document
    .querySelectorAll(".nav")
    .forEach(btn => btn.classList.remove("active"));

  if(button){

    button.classList.add("active");

  }


  if(page === "sale"){

    renderProducts();
    renderCart();

  }


  if(page === "products"){

    renderProductManagement();

  }


  if(page === "report"){

    renderReport();

  }


  if(page === "settings"){

    loadSettingsToForm();

  }

}


/* ================= PRODUCTS ================= */

function restoreDemoProducts(){

  products = [

    {
      id: Date.now() + 1,
      code: "B10135",
      name: "Aberfeldy All Ven",
      price: 204.80,
      stock: 10,
      description: "750ml Alcohol Collection"
    },

    {
      id: Date.now() + 2,
      code: "B20012",
      name: "Alice Low Chive IP",
      price: 250.00,
      stock: 1,
      description: "Suntory Hibiki"
    },

    {
      id: Date.now() + 3,
      code: "W30001",
      name: "Red Wine Premium",
      price: 85.00,
      stock: 20,
      description: "Premium Red Wine"
    },

    {
      id: Date.now() + 4,
      code: "W40001",
      name: "Whisky Gold",
      price: 120.00,
      stock: 15,
      description: "Premium Whisky"
    }

  ];


  saveProducts();

  renderProducts();
  renderProductManagement();

  alert("Demo Products Restored!");

}


function saveProducts(){

  localStorage.setItem(
    "lk_products",
    JSON.stringify(products)
  );

}


function renderProducts(){

  const container =
    document.getElementById("saleProducts");

  if(!container) return;


  const search =
    document
      .getElementById("searchProduct")
      .value
      .toLowerCase();


  let filtered =
    products.filter(product =>
      product.name.toLowerCase().includes(search) ||
      product.code.toLowerCase().includes(search)
    );


  if(filtered.length === 0){

    container.innerHTML =
      "<p>No products found.</p>";

    return;

  }


  container.innerHTML =
    filtered.map(product => `

      <div class="saleProduct">

        <h4>${escapeHtml(product.name)}</h4>

        <small>
          Code: ${escapeHtml(product.code)}
        </small>

        <small>
          Stock: ${product.stock}
        </small>

        <b>${money(product.price)}</b>

        <button onclick="addToCart(${product.id})">
          Add to Cart
        </button>

      </div>

    `).join("");

}


function addToCart(id){

  const product =
    products.find(p => p.id === id);

  if(!product) return;


  let item =
    cart.find(item => item.id === id);


  if(item){

    if(item.qty < product.stock){

      item.qty++;

    }else{

      alert("Not enough stock!");

      return;

    }

  }else{

    if(product.stock <= 0){

      alert("Out of stock!");

      return;

    }


    cart.push({

      id: product.id,
      code: product.code,
      name: product.name,
      price: Number(product.price),
      qty: 1

    });

  }


  renderCart();

}


function renderCart(){

  const container =
    document.getElementById("cartList");

  if(!container) return;


  if(cart.length === 0){

    container.innerHTML =
      "<p>Your cart is empty.</p>";

  }else{

    container.innerHTML =
      cart.map(item => `

        <div class="cartItem">

          <div>

            <div class="cartName">
              ${escapeHtml(item.name)}
            </div>

            <div class="cartPrice">
              ${item.qty} × ${money(item.price)}
              = ${money(item.price * item.qty)}
            </div>

          </div>


          <div class="cartControls">

            <button
              class="qtyBtn"
              onclick="changeQty(${item.id},-1)"
            >
              −
            </button>


            <b>${item.qty}</b>


            <button
              class="qtyBtn"
              onclick="changeQty(${item.id},1)"
            >
              +
            </button>


            <button
              class="removeBtn"
              onclick="removeCartItem(${item.id})"
            >
              ×
            </button>

          </div>

        </div>

      `).join("");

  }


  const subtotal =
    cart.reduce(
      (sum,item) =>
        sum + item.price * item.qty,
      0
    );


  const discount =
    Number(
      document.getElementById("discount")?.value
      || 0
    );


  const total =
    Math.max(
      0,
      subtotal - discount
    );


  document.getElementById("subtotal")
    .textContent =
    money(subtotal);


  document.getElementById("discountView")
    .textContent =
    money(discount);


  document.getElementById("grandTotal")
    .textContent =
    money(total);

}


function changeQty(id,change){

  const item =
    cart.find(item => item.id === id);

  const product =
    products.find(product => product.id === id);

  if(!item || !product) return;


  const newQty =
    item.qty + change;


  if(newQty <= 0){

    removeCartItem(id);

    return;

  }


  if(newQty > product.stock){

    alert("Not enough stock!");

    return;

  }


  item.qty = newQty;

  renderCart();

}


function removeCartItem(id){

  cart =
    cart.filter(item => item.id !== id);

  renderCart();

}


function clearCart(){

  if(cart.length === 0) return;

  if(confirm("Clear all items?")){

    cart = [];

    document.getElementById("discount").value = 0;

    renderCart();

  }

}


/* ================= PRODUCT MANAGEMENT ================= */

function addProduct(){

  editingProduct = null;

  document
    .getElementById("productForm")
    .classList
    .remove("hidden");


  document.getElementById("editCode").value = "";
  document.getElementById("editName").value = "";
  document.getElementById("editPrice").value = "";
  document.getElementById("editStock").value = "";
  document.getElementById("editDescription").value = "";

}


function cancelProduct(){

  editingProduct = null;

  document
    .getElementById("productForm")
    .classList
    .add("hidden");

}


function saveProduct(){

  const code =
    document.getElementById("editCode").value.trim();

  const name =
    document.getElementById("editName").value.trim();

  const price =
    Number(
      document.getElementById("editPrice").value
    );

  const stock =
    Number(
      document.getElementById("editStock").value
    );

  const description =
    document
      .getElementById("editDescription")
      .value
      .trim();


  if(!code || !name || isNaN(price)){

    alert("Please fill Product Code, Name and Price.");

    return;

  }


  if(editingProduct){

    const product =
      products.find(
        p => p.id === editingProduct
      );

    if(product){

      product.code = code;
      product.name = name;
      product.price = price;
      product.stock = stock;
      product.description = description;

    }

  }else{

    products.push({

      id: Date.now(),

      code,
      name,
      price,
      stock,
      description

    });

  }


  saveProducts();

  cancelProduct();

  renderProducts();
  renderProductManagement();
  renderReport();

}


function editProduct(id){

  const product =
    products.find(p => p.id === id);

  if(!product) return;


  editingProduct = id;


  document
    .getElementById("productForm")
    .classList
    .remove("hidden");


  document.getElementById("editCode").value =
    product.code;

  document.getElementById("editName").value =
    product.name;

  document.getElementById("editPrice").value =
    product.price;

  document.getElementById("editStock").value =
    product.stock;

  document.getElementById("editDescription").value =
    product.description || "";

}


function deleteProduct(id){

  if(!confirm("Delete this product?")) return;


  products =
    products.filter(p => p.id !== id);

  cart =
    cart.filter(p => p.id !== id);


  saveProducts();

  renderProducts();
  renderCart();
  renderProductManagement();
  renderReport();

}


function renderProductManagement(){

  const container =
    document.getElementById("productList");

  if(!container) return;


  if(products.length === 0){

    container.innerHTML =
      "<p>No products.</p>";

    return;

  }


  container.innerHTML =
    products.map(product => `

      <div class="productItem">

        <div class="productInfo">

          <b>
            ${escapeHtml(product.name)}
          </b>

          <span>
            ${escapeHtml(product.code)}
            •
            ${money(product.price)}
            •
            Stock: ${product.stock}
          </span>

        </div>


        <div class="productActions">

          <button
            class="editBtn"
            onclick="editProduct(${product.id})"
          >
            Edit
          </button>

          <button
            class="deleteBtn"
            onclick="deleteProduct(${product.id})"
          >
            Delete
          </button>

        </div>

      </div>

    `).join("");

}


/* ================= CHECKOUT ================= */

function checkout(){

  if(cart.length === 0){

    alert("Cart is empty!");

    return;

  }


  const subtotal =
    cart.reduce(
      (sum,item) =>
        sum + item.price * item.qty,
      0
    );


  const discount =
    Number(
      document.getElementById("discount").value
      || 0
    );


  const gstPercent =
    Number(settings.gst || 0);


  const afterDiscount =
    Math.max(0,subtotal - discount);


  const gstAmount =
    afterDiscount * gstPercent / 100;


  const total =
    afterDiscount + gstAmount;


  /* reduce stock */

  cart.forEach(item => {

    const product =
      products.find(
        product =>
          product.id === item.id
      );

    if(product){

      product.stock =
        Math.max(
          0,
          product.stock - item.qty
        );

    }

  });


  saveProducts();


  const sale = {

    id: Date.now(),

    date:
      new Date().toLocaleString(),

    items:
      JSON.parse(JSON.stringify(cart)),

    subtotal,
    discount,
    gstAmount,
    total,

    payment:
      document
        .getElementById("paymentMethod")
        .value

  };


  sales.unshift(sale);


  localStorage.setItem(
    "lk_sales",
    JSON.stringify(sales)
  );


  generateReceipt(sale);


  document
    .getElementById("receiptModal")
    .classList
    .remove("hidden");


  cart = [];

  document.getElementById("discount").value = 0;


  renderCart();
  renderProducts();
  renderProductManagement();
  renderReport();

}


/* ================= RECEIPT ================= */

function generateReceipt(sale){

  const receipt =
    document.getElementById("receipt");


  const now =
    new Date();


  const date =
    now.toLocaleDateString();


  const time =
    now.toLocaleTimeString();


  const receiptNo =
    "E" +
    String(sale.id)
      .slice(-10);


  let itemHtml = "";


  sale.items.forEach(item => {

    itemHtml += `

      <div class="receiptItem">

        <div>
          ${escapeHtml(item.code)}
          :
          ${escapeHtml(item.name)}
        </div>

        <div class="receiptRow">
          <span>
            ${item.qty}
          </span>

          <span>
            ${Number(item.price).toFixed(2)}
          </span>

          <span>
            ${(item.price * item.qty).toFixed(2)}
          </span>
        </div>

      </div>

    `;

  });


  receipt.innerHTML = `

    <div class="receiptCenter">

      <b>
        ${escapeHtml(settings.shopName)}
      </b>

      <br>

      ${escapeHtml(settings.shopType)}

      <br>

      ${escapeHtml(settings.shopAddress)}

      <br><br>

      GST Reg No.

    </div>


    <div class="receiptLine"></div>


    <div class="receiptRow">

      <span>
        POS : ${escapeHtml(settings.posNumber)}
      </span>

      <span>
        Date : ${date}
      </span>

    </div>


    <div class="receiptRow">

      <span>
        Cashier : ${escapeHtml(settings.cashierNumber)}
      </span>

      <span>
        Time : ${time}
      </span>

    </div>


    <div>
      Cashier Name :
      ${escapeHtml(settings.cashierName)}
    </div>


    <div>
      Receipt No. :
      ${receiptNo}
    </div>


    <div>
      Received No. :
      ${sale.id}
    </div>


    <div class="receiptTitle">

      *****DUPLICATE*****

    </div>


    <div>

      Reprinted by :
      ${escapeHtml(settings.reprintedBy)}

    </div>


    <div>

      Reprinted Date Time :
      ${date} ${time}

    </div>


    <br>


    <div>

      Passport No. :
      ${escapeHtml(settings.passportNumber)}

    </div>


    <div>

      Nationality :
      ${escapeHtml(settings.nationality)}

    </div>


    <div>

      Flight Code :
      ${escapeHtml(settings.flightCode)}

    </div>


    <div>

      Flight Number :
      ${escapeHtml(settings.flightNumber)}

    </div>


    <div>

      Lotte Membership ID :
      ${escapeHtml(settings.lotteMembership)}

    </div>


    <br>


    <div class="receiptRow">

      <b>ITEM NAME</b>

      <b>QTY</b>

      <b>PRICE</b>

      <b>TOTAL</b>

    </div>


    <div class="receiptLine"></div>


    ${itemHtml}


    <div class="receiptLine"></div>


    <div class="receiptRow">

      <b>Sub Total</b>

      <b>
        ${sale.subtotal.toFixed(2)}
      </b>

    </div>


    <div class="receiptRow">

      <b>Discount</b>

      <b>
        ${sale.discount.toFixed(2)}
      </b>

    </div>


    <div class="receiptRow">

      <b>GST @ ${settings.gst || 0}%</b>

      <b>
        ${sale.gstAmount.toFixed(2)}
      </b>

    </div>


    <div class="receiptRow">

      <b>Total amount</b>

      <b>
        ${sale.total.toFixed(2)}
      </b>

    </div>


    <br>


    <div>

      Total No. Items :
      ${sale.items.reduce(
        (sum,item) =>
          sum + item.qty,
        0
      )}

    </div>


    <br><br>


    <div class="receiptCenter">

      Tender Summary

    </div>


    <div class="receiptLine"></div>


    <div class="receiptRow">

      <b>
        ${escapeHtml(sale.payment)}
      </b>

      <b>
        ${sale.total.toFixed(2)}
      </b>

    </div>


    <br>


    <div>

      Terminal Id :
      ${escapeHtml(settings.posNumber)}

    </div>


    <div>

      Merchant Id :
      000001050647610

    </div>


    <div>

      Card Type :
      ${escapeHtml(sale.payment)}

    </div>


    <div>

      Approval Code :
      007244

    </div>


    <div>

      Member Tier :
      ${escapeHtml(settings.memberTier)}

    </div>


    <br>


    <div>

      ${escapeHtml(settings.footerMessage)}

    </div>


    <br>


    <div class="receiptCenter">

      Thank you for shopping with us

      <br><br>

      For enquiry, please email

      <br>

      hello@liquorkaung.com

    </div>


    <div class="receiptLine"></div>


    <div class="barcode">

      |||||||||||||||||||||||

    </div>


    <div class="receiptCenter">

      ${escapeHtml(settings.barcodeText)}

    </div>

  `;

}


function closeReceipt(){

  document
    .getElementById("receiptModal")
    .classList
    .add("hidden");

}


function printReceipt(){

  window.print();

}


/* ================= REPORT ================= */

function renderReport(){

  const totalSales =
    sales.reduce(
      (sum,sale) =>
        sum + Number(sale.total),
      0
    );


  document
    .getElementById("todaySales")
    .textContent =
    money(totalSales);


  document
    .getElementById("receiptCount")
    .textContent =
    sales.length;


  document
    .getElementById("productCount")
    .textContent =
    products.length;


  const container =
    document.getElementById("salesHistory");


  if(!container) return;


  if(sales.length === 0){

    container.innerHTML =
      "<p>No sales yet.</p>";

    return;

  }


  container.innerHTML =
    sales.map(sale => `

      <div class="saleItem">

        <div>

          <b>
            Receipt #
            ${sale.id}
          </b>

          <small>
            ${escapeHtml(sale.date)}
          </small>

        </div>


        <div>

          <b>
            ${money(sale.total)}
          </b>

          <br>

          <button
            onclick="viewOldReceipt(${sale.id})"
          >
            View
          </button>

        </div>

      </div>

    `).join("");

}


function viewOldReceipt(id){

  const sale =
    sales.find(
      sale => sale.id === id
    );

  if(!sale) return;


  generateReceipt(sale);


  document
    .getElementById("receiptModal")
    .classList
    .remove("hidden");

}


function clearSales(){

  if(!confirm("Delete all sales history?")) return;


  sales = [];


  localStorage.setItem(
    "lk_sales",
    JSON.stringify(sales)
  );


  renderReport();

}


/* ================= SETTINGS ================= */

function loadSettingsToForm(){

  const ids = [

    "shopName",
    "shopType",
    "shopAddress",
    "posNumber",
    "cashierNumber",
    "cashierName",
    "currency",

    "reprintedBy",
    "passportNumber",
    "nationality",
    "flightCode",
    "flightNumber",
    "lotteMembership",

    "gst",
    "memberTier",
    "footerMessage",
    "barcodeText"

  ];


  ids.forEach(id => {

    const element =
      document.getElementById(id);

    if(element && settings[id] !== undefined){

      element.value =
        settings[id];

    }

  });

}


function saveSettings(){

  const ids = [

    "shopName",
    "shopType",
    "shopAddress",
    "posNumber",
    "cashierNumber",
    "cashierName",
    "currency",

    "reprintedBy",
    "passportNumber",
    "nationality",
    "flightCode",
    "flightNumber",
    "lotteMembership",

    "gst",
    "memberTier",
    "footerMessage",
    "barcodeText"

  ];


  ids.forEach(id => {

    settings[id] =
      document
        .getElementById(id)
        .value;

  });


  localStorage.setItem(
    "lk_settings",
    JSON.stringify(settings)
  );


  alert("Settings Saved!");

  renderCart();

}


/* ================= BACKUP ================= */

function backupData(){

  const data = {

    products,
    sales,
    settings

  };


  const blob =
    new Blob(
      [JSON.stringify(data,null,2)],
      {
        type:"application/json"
      }
    );


  const url =
    URL.createObjectURL(blob);


  const link =
    document.createElement("a");


  link.href = url;

  link.download =
    "liquor-kaung-backup.json";


  link.click();


  URL.revokeObjectURL(url);

}


function restoreBackup(event){

  const file =
    event.target.files[0];

  if(!file) return;


  const reader =
    new FileReader();


  reader.onload = function(e){

    try{

      const data =
        JSON.parse(e.target.result);


      if(data.products){

        products =
          data.products;

      }


      if(data.sales){

        sales =
          data.sales;

      }


      if(data.settings){

        settings =
          data.settings;

      }


      saveProducts();


      localStorage.setItem(
        "lk_sales",
        JSON.stringify(sales)
      );


      localStorage.setItem(
        "lk_settings",
        JSON.stringify(settings)
      );


      initApp();


      alert("Backup Restored!");

    }catch(error){

      alert("Invalid backup file!");

    }

  };


  reader.readAsText(file);

}


/* ================= SECURITY ================= */

function escapeHtml(text){

  if(text === undefined || text === null){

    return "";

  }


  return String(text)

    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

}
